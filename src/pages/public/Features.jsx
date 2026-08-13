import { motion } from 'framer-motion';
import { 
  FiClock, FiTrendingUp, FiShield, FiSmartphone, 
  FiUsers, FiBell, FiCheckCircle, FiArrowRight 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Features = () => {
  const featuresList = [
    {
      title: "Smart Queue Management",
      description: "Algorithm-based token generation ensuring optimal wait times and fair serving orders.",
      icon: FiClock,
      color: "blue"
    },
    {
      title: "Live Queue Tracking",
      description: "Customers can view their exact position and estimated wait time in real-time.",
      icon: FiSmartphone,
      color: "green"
    },
    {
      title: "Online Appointments",
      description: "Allow customers to book specific time slots days in advance alongside walk-ins.",
      icon: FiCheckCircle,
      color: "purple"
    },
    {
      title: "Business Dashboard",
      description: "A command center for staff to manage active queues, call tokens, and monitor traffic.",
      icon: FiTrendingUp,
      color: "orange"
    },
    {
      title: "Real-time Notifications",
      description: "Automated SMS and push alerts when a customer's turn is approaching.",
      icon: FiBell,
      color: "pink"
    },
    {
      title: "Enterprise Security",
      description: "Bank-grade encryption, strict data privacy, and verified business onboarding.",
      icon: FiShield,
      color: "indigo"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* Hero Banner */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">eliminate lines.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-10">
            QueueLess is a complete ecosystem connecting customers and businesses. No more crowded waiting rooms, no more frustration.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register/business" className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:-translate-y-1">
              Start Free Trial
            </Link>
            <Link to="/contact" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-3 px-8 rounded-xl transition-all">
              Book a Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Why QueueLess / Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900">Why QueueLess?</h2>
          <p className="mt-4 text-gray-500 text-lg">Built with modern businesses and impatient customers in mind.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${feat.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feat.icon className={`w-7 h-7 text-${feat.color}-600`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Analytics & Reports Spotlight */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
              <FiTrendingUp className="mr-2" /> Actionable Insights
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Analytics that drive your business forward.</h2>
            <p className="text-lg text-gray-500">
              Stop guessing and start optimizing. QueueLess provides detailed reports on peak hours, average wait times, staff performance, and customer satisfaction rates.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center font-bold text-gray-700">
                <FiCheckCircle className="text-green-500 mr-3 w-5 h-5" /> Export reports to CSV/PDF
              </li>
              <li className="flex items-center font-bold text-gray-700">
                <FiCheckCircle className="text-green-500 mr-3 w-5 h-5" /> Live performance dashboard
              </li>
              <li className="flex items-center font-bold text-gray-700">
                <FiCheckCircle className="text-green-500 mr-3 w-5 h-5" /> Predict peak traffic hours
              </li>
            </ul>
          </div>
          <div className="flex-1 bg-gray-50 rounded-[2rem] p-8 border border-gray-100 w-full">
            {/* Mock Dashboard UI for visual flair */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="h-4 w-1/3 bg-gray-200 rounded mb-6"></div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 h-20 bg-blue-50 rounded-xl"></div>
                <div className="flex-1 h-20 bg-green-50 rounded-xl"></div>
                <div className="flex-1 h-20 bg-purple-50 rounded-xl"></div>
              </div>
              <div className="h-40 bg-gray-50 rounded-xl border border-gray-100 w-full flex items-end p-4 gap-2">
                <div className="w-full bg-blue-200 rounded-t-md h-1/3"></div>
                <div className="w-full bg-blue-300 rounded-t-md h-2/3"></div>
                <div className="w-full bg-blue-400 rounded-t-md h-full"></div>
                <div className="w-full bg-blue-300 rounded-t-md h-1/2"></div>
                <div className="w-full bg-blue-200 rounded-t-md h-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Ready to transform your waiting room?</h2>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Join thousands of businesses already using QueueLess to improve customer satisfaction and streamline operations.
        </p>
        <Link to="/register/business" className="inline-flex items-center justify-center bg-primary hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:-translate-y-1">
          Get Started Now <FiArrowRight className="ml-2" />
        </Link>
      </section>

    </div>
  );
};

export default Features;
