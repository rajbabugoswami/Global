"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              GlobalConnect
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 transition-colors">How It Works</Link>
            <Link href="#faq" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 transition-colors">FAQ</Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300">Login</Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg">
                Get Started
              </Link>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200">Features</Link>
            <Link href="#how-it-works" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200">How It Works</Link>
            <Link href="#faq" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200">FAQ</Link>
            <Link href="/login" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200">Login</Link>
            <Link href="/register" className="block px-3 py-2 text-base font-medium text-blue-600">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
