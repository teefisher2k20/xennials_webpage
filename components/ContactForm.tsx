import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setIsError(false);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      console.log('Form submitted:', formData);
      // In a real app, you'd send this to a backend API
      setSubmitMessage('Thank you for your message! We will get back to you shortly.');
      setIsError(false);
      setFormData({ name: '', email: '', message: '' }); // Clear form
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitMessage('Oops! Something went wrong. Please try again later.');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-teal-900 to-blue-950">
      <div className="max-w-xl mx-auto px-4 text-white text-center">
        <h2 className="text-4xl font-bold mb-6 leading-tight">Start Automating with Xennials Today.</h2>
        <p className="text-lg mb-8 opacity-90">
          Tell us what slows you down — we’ll find the workflow that eliminates it.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="p-3 rounded-lg outline-none text-gray-900 bg-white bg-opacity-90 focus:ring-2 focus:ring-teal-400 transition"
            required
            disabled={isSubmitting}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 rounded-lg outline-none text-gray-900 bg-white bg-opacity-90 focus:ring-2 focus:ring-teal-400 transition"
            required
            disabled={isSubmitting}
          />
          <textarea
            name="message"
            rows={5}
            placeholder="Tell us about your needs or challenges…"
            value={formData.message}
            onChange={handleChange}
            className="p-3 rounded-lg outline-none text-gray-900 bg-white bg-opacity-90 focus:ring-2 focus:ring-teal-400 transition resize-y"
            required
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="bg-teal-500 py-3 rounded-lg font-bold text-xl hover:bg-teal-300 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending Message...' : 'Let’s Talk AI'}
          </button>
        </form>
        {submitMessage && (
          <p className={`mt-4 text-lg ${isError ? 'text-red-300' : 'text-green-300'}`}>
            {submitMessage}
          </p>
        )}
      </div>
    </section>
  );
};

export default ContactForm;