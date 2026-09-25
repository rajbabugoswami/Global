import React from "react";
import GlobeCanvas from "@/components/3d/Globe";

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-[#050510] text-gray-300 py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <GlobeCanvas />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Terms of Service
        </h1>
        
        <div className="space-y-6 leading-relaxed">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Agreement to Terms</h2>
            <p>By viewing or using this Website, which can be accessed at GlobalConnect, you are agreeing to be bound by these Website’s Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. User Conduct</h2>
            <p>You agree not to use the Website for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Website in any way that could damage the Website, the Services, or the general business of GlobalConnect.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. Communication Features</h2>
            <p>GlobalConnect provides real-time video, audio, and text communication. Users are solely responsible for their interactions with other users. We reserve the right to monitor disputes between you and other users, but have no obligation to do so.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. Disclaimer</h2>
            <p>All the materials on GlobalConnect's Website are provided "as is". GlobalConnect makes no warranties, may it be expressed or implied, therefore negates all other warranties.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
