import { motion } from 'framer-motion';
import { FiMapPin, FiMail, FiPhone, FiClock, FiSend } from 'react-icons/fi';

const Contact = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
          >
            Get in <span className="text-primary">touch.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            Have a question about pricing, enterprise plans, or just want to say hi? We'd love to hear from you.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          
          {/* Contact Form */}
          <div className="p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@company.com" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  placeholder="How can we help?" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea 
                  rows="4" 
                  placeholder="Tell us more about your needs..." 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                ></textarea>
              </div>
              <button type="button" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group">
                Send Message <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Contact Details & Map */}
          <div className="bg-gray-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 mb-12">
              <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-200">Address</h4>
                    <p className="text-gray-400 mt-1">123 Tech Boulevard, Suite 400<br/>San Francisco, CA 94107</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMail className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-200">Email</h4>
                    <p className="text-gray-400 mt-1">hello@queueless.com<br/>support@queueless.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiPhone className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-200">Phone</h4>
                    <p className="text-gray-400 mt-1">+1 (800) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiClock className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-200">Working Hours</h4>
                    <p className="text-gray-400 mt-1">Monday - Friday: 9 AM - 6 PM PST<br/>Weekend: Priority Support Only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Map */}
            <div className="w-full h-48 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse mb-2">
                  <FiMapPin className="text-white" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Our HQ</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
