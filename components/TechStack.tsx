import React from 'react';
import { LOGO_DOCKER, LOGO_FASTAPI, LOGO_N8N, LOGO_ODOO, LOGO_OPENAI, LOGO_SUPABASE } from '../constants';

const stack = [
  { name: "n8n", src: LOGO_N8N },
  { name: "Odoo", src: LOGO_ODOO },
  { name: "FastAPI", src: LOGO_FASTAPI },
  { name: "Supabase", src: LOGO_SUPABASE },
  { name: "Docker", src: LOGO_DOCKER },
  { name: "OpenAI", src: LOGO_OPENAI },
];

const TechStack: React.FC = () => {
  return (
    <section id="stack" className="py-14 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-teal-800">Built With the Best</h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          We blend reliable open-source and proprietary AI ecosystems to deliver production-ready automation solutions.
        </p>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {stack.map(t =>
            <img key={t.name} src={t.src} alt={t.name} className="h-12 md:h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" />
          )}
        </div>
      </div>
    </section>
  );
};

export default TechStack;