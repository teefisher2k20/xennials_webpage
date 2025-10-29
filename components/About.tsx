import React from 'react';
import { ABOUT_ILLUSTRATION_URL } from '../constants';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <img
            src={ABOUT_ILLUSTRATION_URL}
            alt="AI Collaboration"
            className="w-full h-auto rounded-xl shadow-lg object-cover"
            width={400}
            height={300}
          />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Who are Xennials?</h2>
          <p className="mb-6 text-gray-700 text-lg leading-relaxed">
            Xennials combines automation strategy with practical AI engineering to empower small agencies,
            enterprises, and educators. We're dedicated to transforming operations into intelligent, efficient,
            and scalable systems.
          </p>
          <a href="#services" className="text-teal-600 underline font-semibold hover:text-teal-800 transition">
            See How It Works →
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;