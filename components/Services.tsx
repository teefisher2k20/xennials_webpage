import React from 'react';

const services = [
  { icon: "🤖", title: "Workflow Automation", desc: "Integrate and streamline business processes end-to-end with AI." },
  { icon: "🧠", title: "Custom AI Models", desc: "Tailored machine learning solutions for your unique business challenges." },
  { icon: "📈", title: "CRM Intelligence", desc: "Supercharge sales and marketing with predictive AI insights and automation." },
  { icon: "🔌", title: "AI Integrations", desc: "Seamlessly connect any service or platform with AI-powered automations." },
];

const Services: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-teal-800">Our Core Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s) => (
            <div key={s.title} className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
              <div className="text-5xl mb-4 p-3 bg-teal-100 rounded-full inline-block">
                {s.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;