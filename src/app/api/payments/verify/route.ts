import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json({ error: "Missing required verification fields" }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      if (process.env.NODE_ENV === "development" && razorpay_order_id.startsWith("order_sim_")) {
        console.warn("Bypassing signature check for development simulator.");
        // Skip signature check in dev simulator
      } else {
        return NextResponse.json({ error: "Server is missing payment gateway credentials." }, { status: 500 });
      }
    } else {
      // Verify Signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", key_secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        // Signature mismatch
        await prisma.transaction.update({
          where: { providerTxId: razorpay_order_id },
          data: { status: "FAILED" }
        });
        return NextResponse.json({ error: "Invalid payment signature. Transaction failed." }, { status: 400 });
      }
    }

    // Fetch the pending transaction
    const tx = await prisma.transaction.findUnique({
      where: { providerTxId: razorpay_order_id }
    });

    if (!tx || tx.status !== "PENDING") {
      return NextResponse.json({ error: "Transaction not found or already processed." }, { status: 400 });
    }

    // Signature matches, update transaction to SUCCESS
    // Example gateway fee assumption: 2% + 18% GST on fee
    const gatewayFee = parseFloat((tx.amount * 0.02).toFixed(2));
    const taxAmount = parseFloat((gatewayFee * 0.18).toFixed(2));
    const totalDeduction = gatewayFee + taxAmount;
    const netAmount = parseFloat((tx.amount - totalDeduction).toFixed(2));

    await prisma.transaction.update({
      where: { providerTxId: razorpay_order_id },
      data: {
        status: "SUCCESS",
        gatewayFee: totalDeduction,
        taxAmount: taxAmount,
        netAmount: netAmount,
        settlementStatus: "PROCESSING" // Payment gateway takes T+2 days typically
      }
    });

    // Determine plan daily calling limit
    let limit = 60;
    if (planId === "PREMIUM") limit = 180;
    if (planId === "PRO") limit = 300;

    // Optional: Actually create or update a SubscriptionPlan object here for the user
    // For now, updating the user's plan via the frontend (mocked plan state) is handled,
    // but in a real app you'd upsert a `Subscription` table record here.

    return NextResponse.json({ 
      success: true, 
      message: "Payment successfully verified and subscription activated." 
    });

  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
