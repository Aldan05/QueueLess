import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const FAQ = () => {
  const faqs = [
    {
      question: "What is QueueLess?",
      answer: "QueueLess is a cloud-based queue management system that allows customers to join a virtual line from their phone, reducing physical wait times and overcrowding in waiting rooms."
    },
    {
      question: "How do I join a queue as a customer?",
      answer: "Simply create a free customer account, search for the business you want to visit, and click 'Join Queue'. You will be given a token number and an estimated wait time."
    },
    {
      question: "How much does it cost for a business?",
      answer: "We offer a Free Plan for single-branch businesses with up to 100 customers per month. For growing businesses, our Professional plan starts at ₹999/month with unlimited customers and advanced analytics."
    },
    {
      question: "Do my customers need to download an app?",
      answer: "No! QueueLess operates entirely through the web browser. Customers can join your queue via a direct link, scanning a QR code at your storefront, or searching on the platform."
    },
    {
      question: "How long does business verification take?",
      answer: "Once you register and upload your verification documents, our Admin team typically reviews and approves your account within 24 hours."
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
          >
            Frequently Asked <span className="text-primary">Questions.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500"
          >
            Everything you need to know about the product and billing.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full text-left px-6 py-5 font-bold text-lg text-gray-900 flex justify-between items-center focus:outline-none"
              >
                {faq.question}
                <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === index ? 'rotate-180 text-primary' : ''}`} />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FAQ;
