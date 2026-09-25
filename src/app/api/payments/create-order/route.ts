import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, amount } = await req.json();

    if (!planId || !amount) {
      return NextResponse.json({ error: "Missing planId or amount" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Using Razorpay Simulator because keys are missing in development.");
        const simulatedOrderId = `order_sim_${Date.now()}`;
        
        await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: amount,
            currency: "INR",
            provider: "RAZORPAY",
            providerTxId: simulatedOrderId,
            status: "PENDING",
          }
        });

        return NextResponse.json({ 
          success: true, 
          orderId: simulatedOrderId,
          amount: amount * 100,
          currency: "INR",
          keyId: "rzp_test_simulator",
          isSimulator: true
        });
      }
      return NextResponse.json({ error: "Payment gateway is not configured." }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const receiptId = `receipt_${Date.now()}`;
    const options = {
      amount: Math.round(amount * 100), // convert to paise safely
      currency: "INR",
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);

    // Save pending transaction to DB
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: amount,
        currency: "INR",
        provider: "RAZORPAY",
        providerTxId: order.id,
        status: "PENDING",
      }
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id
    });

  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
