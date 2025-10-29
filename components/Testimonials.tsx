import React from 'react';
import { USER1_PHOTO, USER2_PHOTO } from '../constants';

const testimonials = [
  { name: "Jane Doe, CEO", photo: USER1_PHOTO, quote: "Xennials took our operations to the next level in under 4 weeks! The efficiency gains were immediate and significant." },
  { name: "John Q. Public, CTO", photo: USER2_PHOTO, quote: "Incredible automation — our team saves hours daily, allowing us to focus on strategic initiatives rather than repetitive tasks." }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-teal-800">What Our Clients Say</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-slate-100 p-6 rounded-lg shadow-lg flex-1 flex flex-col items-center hover:shadow-xl transition duration-300">
              <img src={t.photo} alt={t.name} className="rounded-full h-20 w-20 object-cover mb-4 ring-2 ring-teal-500 p-1" />
              <p className="italic text-lg text-gray-700 mb-4 text-center leading-relaxed">"{t.quote}"</p>
              <p className="text-teal-700 font-bold text-xl">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;