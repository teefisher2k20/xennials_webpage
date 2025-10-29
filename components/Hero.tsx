import React from 'react';
import { HERO_VISUAL_URL } from '../constants';

const Hero: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative bg-gradient-to-r from-blue-950 via-gray-900 to-teal-800 py-32 text-white text-center min-h-[60vh] flex flex-col justify-center overflow-hidden"
      style={{ backgroundImage: `url(${HERO_VISUAL_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div> {/* Overlay for text readability */}
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
          Automate. Adapt. Accelerate with Xennials.
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8">
          We build AI-driven workflows that turn your business operations into intelligent systems.
        </p>
        <a href="#contact" className="bg-teal-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-teal-400 transition transform hover:scale-105 inline-block">
          Book a Free Consultation
        </a>
      </div>
    </section>
  );
};

export default Hero;