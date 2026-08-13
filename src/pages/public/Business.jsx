import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowRight, FiShield, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Business = () => {
  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
                For Businesses
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Turn waiting time into <span className="text-primary">revenue.</span>
              </h1>
              <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                Stop losing customers to long lines. QueueLess helps you manage walk-ins, schedule appointments, and analyze peak hours—all from one beautiful dashboard.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register/business" className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:-translate-y-1 flex items-center">
                  Register Your Business <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-300 rounded-[3rem] transform rotate-3 scale-105 opacity-20 blur-xl"></div>
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-100 relative">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">CG</div>
                  <div>
                    <h3 className="font-bold text-gray-900">City General Hospital</h3>
                    <p className="text-sm text-green-600 font-bold">Queue Active</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-500">Current Token</span>
                    <span className="text-3xl font-black text-primary">A-124</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-500">Waiting</span>
                    <span className="text-2xl font-black text-gray-900">12</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900">How QueueLess helps your business</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiUsers className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Happy Customers</h3>
            <p className="text-gray-500">Customers can wait from a nearby coffee shop instead of a crowded waiting room.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow text-center">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiTrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Increased Efficiency</h3>
            <p className="text-gray-500">Optimize staff schedules based on analytics and predicted peak hours.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiShield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Verified Trust</h3>
            <p className="text-gray-500">Gain a 'Verified' badge on the platform to stand out and build customer trust.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-16">The Business Verification Process</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Register", desc: "Create your business account and provide basic details." },
              { step: "02", title: "Upload Docs", desc: "Submit your business registration documents securely." },
              { step: "03", title: "Review", desc: "Our admin team reviews your application within 24 hours." },
              { step: "04", title: "Go Live", desc: "Get verified and start managing your queues immediately." }
            ].map((item, i) => (
              <div key={i} className="relative">
                <span className="text-6xl font-black text-gray-800 absolute -top-6 -left-4 -z-10">{item.step}</span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-6 right-0 w-full h-px bg-gray-800 -z-20 transform translate-x-1/2"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Business;
