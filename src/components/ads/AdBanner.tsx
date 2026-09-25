"use client";

import { useEffect } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
}

export default function AdBanner({ 
  dataAdSlot, 
  dataAdFormat = "auto", 
  dataFullWidthResponsive = true 
}: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error", error);
    }
  }, []);

  return (
    <div className="w-full overflow-hidden flex justify-center my-4 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-md">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-YOUR_ADSENSE_CLIENT_ID_HERE" // REPLACE THIS WITH YOUR REAL ID
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
