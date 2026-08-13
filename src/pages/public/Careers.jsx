import { motion } from 'framer-motion';
import { FiMapPin, FiBriefcase, FiArrowRight } from 'react-icons/fi';

const Careers = () => {
  const jobs = [
    { title: "React.js Developer", experience: "2-4 Years", location: "Remote", department: "Engineering" },
    { title: "Node.js Developer", experience: "3-5 Years", location: "San Francisco, CA", department: "Engineering" },
    { title: "UI/UX Designer", experience: "1-3 Years", location: "Remote", department: "Design" },
    { title: "QA Engineer", experience: "2+ Years", location: "New York, NY", department: "Engineering" },
    { title: "Marketing Executive", experience: "4+ Years", location: "London, UK", department: "Marketing" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6"
          >
            <span className="text-4xl">🚀</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
          >
            Join the <span className="text-primary">QueueLess</span> Team
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            Help us build the future of waiting. We are always looking for passionate people to join our global team.
          </motion.p>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-bold text-gray-900">Open Positions</h2>
            <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full text-sm">{jobs.length} Jobs</span>
          </div>

          {jobs.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <div className="inline-block px-3 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold rounded-md mb-3 uppercase tracking-wider">
                  {job.department}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                  <span className="flex items-center"><FiBriefcase className="mr-1.5" /> {job.experience}</span>
                  <span className="flex items-center"><FiMapPin className="mr-1.5" /> {job.location}</span>
                </div>
              </div>
              
              <button className="bg-gray-900 hover:bg-primary text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:scale-105">
                Apply Now <FiArrowRight />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Not seeing your role? */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Don't see your role?</h3>
          <p className="text-gray-500 mb-4">We're always looking for talented folks. Send your resume anyway.</p>
          <a href="mailto:careers@queueless.com" className="font-bold text-primary hover:text-blue-700 transition-colors">
            careers@queueless.com
          </a>
        </div>

      </div>
    </div>
  );
};

export default Careers;
