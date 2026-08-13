import { motion } from 'framer-motion';
import { FiUsers, FiTarget, FiHeart, FiTrendingUp } from 'react-icons/fi';

const About = () => {
  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6"
        >
          We're on a mission to <br className="hidden md:block" />
          <span className="text-primary">eliminate the waiting room.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed"
        >
          QueueLess was founded on a simple principle: time is our most valuable asset. We build technology that gives people their time back while helping businesses run more efficiently.
        </motion.p>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-black text-gray-900 mb-2">2.5M+</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Hours Saved</p>
            </div>
            <div>
              <p className="text-4xl font-black text-primary mb-2">5,000+</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Businesses</p>
            </div>
            <div>
              <p className="text-4xl font-black text-gray-900 mb-2">12</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Countries</p>
            </div>
            <div>
              <p className="text-4xl font-black text-primary mb-2">99.9%</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900">Our Core Values</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="flex gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiTarget className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Customer First</h3>
              <p className="text-gray-500 leading-relaxed">Everything we design starts with the user experience. If it doesn't make waiting easier for the end customer, we don't build it.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Continuous Innovation</h3>
              <p className="text-gray-500 leading-relaxed">We constantly iterate on our matching algorithms and predictive AI to make estimated wait times highly accurate.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiUsers className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Business Empowerment</h3>
              <p className="text-gray-500 leading-relaxed">We provide businesses with enterprise-grade tools disguised as incredibly simple dashboards.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiHeart className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Empathy</h3>
              <p className="text-gray-500 leading-relaxed">Waiting is stressful. We build our products with empathy for the stressed parent at the clinic or the hungry family at the restaurant.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
