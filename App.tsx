import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import CaseStudies from './components/CaseStudies';
import TechStack from './components/TechStack';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import AIHub from './components/AIHub'; // New AI Hub component

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Close mobile menu on scroll or resize
  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased text-gray-800">
      {/* Header & Navigation */}
      <header className="fixed w-full z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex-shrink-0">
            <a href="#hero" className="text-white text-2xl font-bold tracking-tight">
              Xennials<span className="text-teal-500">.</span>AI
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <a href="#hero" className="text-gray-300 hover:text-white transition font-medium">Home</a>
            <a href="#about" className="text-gray-300 hover:text-white transition font-medium">About</a>
            <a href="#services" className="text-gray-300 hover:text-white transition font-medium">Services</a>
            <a href="#case-studies" className="text-gray-300 hover:text-white transition font-medium">Case Studies</a>
            <a href="#ai-hub" className="text-teal-400 hover:text-teal-200 transition font-bold">AI Tools</a> {/* Link to AI Hub */}
            <a href="#contact" className="text-gray-300 hover:text-white transition font-medium">Contact</a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 py-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#hero" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Home</a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">About</a>
              <a href="#services" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Services</a>
              <a href="#case-studies" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Case Studies</a>
              <a href="#ai-hub" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-bold text-teal-400 hover:bg-gray-700 hover:text-teal-200">AI Tools</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Contact</a>
            </div>
          </div>
        )}
      </header>

      <main>
        <Hero />
        <About />
        <Services />
        <CaseStudies />
        <TechStack />
        <Testimonials />
        <AIHub /> {/* Render the AI Hub here */}
        <ContactForm />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Logo & Tagline */}
          <div>
            <a href="#hero" className="text-white text-3xl font-bold tracking-tight">
              Xennials<span className="text-teal-500">.</span>AI
            </a>
            <p className="mt-2 text-sm">Automate. Adapt. Accelerate.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-white transition">About Us</a></li>
              <li><a href="#services" className="hover:text-white transition">Services</a></li>
              <li><a href="#case-studies" className="hover:text-white transition">Case Studies</a></li>
              <li><a href="#ai-hub" className="hover:text-white transition">AI Tools</a></li>
            </ul>
          </div>

          {/* Contact Info & Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-3">Contact Us</h4>
            <p className="text-sm mb-4">
              Email: <a href="mailto:info@xennials.ai" className="text-teal-400 hover:underline">info@xennials.ai</a>
            </p>
            <button className="bg-teal-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-teal-700 transition">
              Join Our Newsletter
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Xennials.AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;