import { motion } from 'framer-motion';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Blog = () => {
  const posts = [
    {
      title: "5 Ways to Reduce Wait Times in Your Clinic",
      category: "Healthcare",
      date: "July 12, 2026",
      excerpt: "Long waiting rooms lead to unhappy patients. Learn how digital queuing can transform your clinic's patient experience.",
      imageColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Why Walk-ins are the Future of Retail",
      category: "Retail",
      date: "July 08, 2026",
      excerpt: "Discover how managing walk-ins efficiently can increase your store's conversion rate by up to 30%.",
      imageColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      title: "Announcing QueueLess Analytics 2.0",
      category: "Product Update",
      date: "July 01, 2026",
      excerpt: "We've completely overhauled our business analytics dashboard. Here is everything you need to know about the new metrics.",
      imageColor: "bg-purple-100",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
          >
            The QueueLess <span className="text-primary">Blog.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            Insights, updates, and strategies for managing wait times.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group"
            >
              <div className={`h-48 ${post.imageColor} flex items-center justify-center p-8`}>
                 <span className="text-5xl font-black opacity-20">QL</span>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 mb-4 text-sm font-bold">
                  <span className={`${post.textColor} uppercase tracking-wider`}>{post.category}</span>
                  <span className="text-gray-400 flex items-center"><FiCalendar className="mr-1" /> {post.date}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-gray-500 mb-6 flex-grow">{post.excerpt}</p>
                <Link to="/blog" className="text-gray-900 font-bold flex items-center group-hover:text-primary transition-colors">
                  Read Article <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Blog;
