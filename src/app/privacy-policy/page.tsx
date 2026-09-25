import React from "react";
import GlobeCanvas from "@/components/3d/Globe";

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-[#050510] text-gray-300 py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <GlobeCanvas />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Privacy Policy
        </h1>
        
        <div className="space-y-6 leading-relaxed">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
            <p>Welcome to GlobalConnect. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p>We collect personal information that you voluntarily provide to us when you register on the Website, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website, or otherwise when you contact us.</p>
            <p className="mt-2">The personal information that we collect depends on the context of your interactions with us and the Website, the choices you make and the products and features you use.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. Google AdSense and Cookies</h2>
            <p>We use Google AdSense Advertising on our website. Google, as a third-party vendor, uses cookies to serve ads on our site.</p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
              <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">Ads Settings</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. How We Use Your Information</h2>
            <p>We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">5. Contact Us</h2>
            <p>If you have questions or comments about this notice, you may email us at privacy@globalconnect.example.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
