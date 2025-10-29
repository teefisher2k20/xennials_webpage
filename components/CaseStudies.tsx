import React from 'react';
import { CASE_ACME_LOGO, CASE_BANK_LOGO, CASE_MED_LOGO } from '../constants';

const studies = [
  {
    logo: CASE_ACME_LOGO,
    blurb: "Saved 120+ work hours every week with n8n & GPT-powered automations.",
    client: "Acme Corp"
  },
  {
    logo: CASE_MED_LOGO,
    blurb: "Automated patient onboarding, reduced human errors by 80%.",
    client: "MedNet Clinic"
  },
  {
    logo: CASE_BANK_LOGO,
    blurb: "Deployed AI chatbots, boosted lead response rates by 3x.",
    client: "Zeta Financial"
  },
];

const CaseStudies: React.FC = () => {
  return (
    <section id="case-studies" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-teal-800">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studies.map((s) => (
            <div key={s.client} className="bg-slate-100 rounded-xl p-6 flex flex-col items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
              <img src={s.logo} alt={s.client} className="w-20 h-20 object-contain mb-4 filter grayscale hover:grayscale-0 transition-all duration-300" />
              <p className="italic text-lg text-gray-700 mb-4 text-center">"{s.blurb}"</p>
              <p className="text-teal-700 font-bold text-xl">{s.client}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;