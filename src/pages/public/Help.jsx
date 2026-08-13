import { motion } from 'framer-motion';
import { FiSearch, FiBook, FiMessageCircle, FiVideo, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Help = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6"
          >
            How can we <span className="text-primary">help you?</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto relative"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 w-6 h-6" />
            </div>
            <input 
              type="text" 
              placeholder="Search for articles, guides, or answers..." 
              className="w-full bg-white border-2 border-gray-100 text-gray-900 rounded-2xl pl-14 pr-6 py-4 text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </motion.div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Link to="/help" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <FiBook className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Getting Started</h3>
            <p className="text-gray-500 mb-4">Everything you need to set up your business account and first queue.</p>
            <span className="text-primary font-bold flex items-center">Read Articles <FiArrowRight className="ml-2" /></span>
          </Link>
          
          <Link to="/help" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
              <FiVideo className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Video Tutorials</h3>
            <p className="text-gray-500 mb-4">Step-by-step visual guides on using the Business Dashboard.</p>
            <span className="text-green-600 font-bold flex items-center">Watch Videos <FiArrowRight className="ml-2" /></span>
          </Link>

          <Link to="/contact" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
              <FiMessageCircle className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Contact Support</h3>
            <p className="text-gray-500 mb-4">Can't find what you're looking for? Reach out to our human team.</p>
            <span className="text-purple-600 font-bold flex items-center">Open Ticket <FiArrowRight className="ml-2" /></span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Help;
