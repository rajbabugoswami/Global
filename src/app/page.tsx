import Link from "next/link";
import { MessageCircle, Video, Globe2, ShieldCheck, Users, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white dark:from-blue-900/20 dark:via-gray-950 dark:to-gray-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
            <Globe2 className="w-4 h-4" />
            <span>Available Worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
            Connect with the World. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Chat, Call, and Share.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-10">
            One platform. Every country. Free communication. Experience high-quality video calls, seamless messaging, and global connection like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/25">
              Get Started for Free
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full font-semibold text-lg transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to stay connected</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              GlobalConnect brings all your communication needs into one powerful, secure, and easy-to-use platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageCircle className="w-8 h-8 text-blue-500" />}
              title="Real-Time Messaging"
              description="Instantly send text, voice messages, images, and files to anyone, anywhere in the world."
            />
            <FeatureCard 
              icon={<Video className="w-8 h-8 text-indigo-500" />}
              title="HD Video Calls"
              description="Crystal clear one-on-one video calls and group meetings with virtually no lag."
            />
            <FeatureCard 
              icon={<Globe2 className="w-8 h-8 text-green-500" />}
              title="Global Directory"
              description="Find and connect with people globally. Search by country, language, or username."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-purple-500" />}
              title="Secure & Private"
              description="Your data is protected with industry-standard encryption and robust privacy controls."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-orange-500" />}
              title="Group Chats"
              description="Create communities, coordinate with teams, or stay in touch with family through group chats."
            />
            <FeatureCard 
              icon={<Smartphone className="w-8 h-8 text-pink-500" />}
              title="Cross-Platform"
              description="Seamlessly switch between your phone, tablet, and computer without losing your chat history."
            />
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-sm mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
