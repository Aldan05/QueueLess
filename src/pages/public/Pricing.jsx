import { motion } from 'framer-motion';
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: "Free Plan",
      price: "₹0",
      description: "Perfect for small businesses getting started with digital queues.",
      features: [
        "1 Branch",
        "100 Customers / month",
        "Basic Queue Management",
        "Standard Email Support",
      ],
      unavailable: [
        "Staff Management",
        "Analytics Dashboard",
        "SMS Notifications",
        "Online Appointments",
      ],
      buttonText: "Start for Free",
      popular: false,
      link: "/register/business"
    },
    {
      name: "Professional",
      price: "₹999",
      period: "/month",
      description: "Everything a growing business needs to manage high traffic.",
      features: [
        "Unlimited Customers",
        "Staff Management",
        "Full Analytics & Reports",
        "Real-time Notifications",
        "Online Appointments",
      ],
      unavailable: [
        "API Access",
        "Custom Branding",
      ],
      buttonText: "Start 14-Day Trial",
      popular: true,
      link: "/register/business"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Advanced controls and integrations for large organizations.",
      features: [
        "Unlimited Branches",
        "API Access & Webhooks",
        "Priority 24/7 Support",
        "Advanced Analytics",
        "Custom Branding (White-label)",
      ],
      unavailable: [],
      buttonText: "Contact Sales",
      popular: false,
      link: "/contact"
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
            Simple, transparent <span className="text-primary">pricing.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            No hidden fees. Choose the plan that best fits your business volume.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`bg-white rounded-[2rem] p-8 border ${plan.popular ? 'border-primary ring-4 ring-primary/10 relative shadow-2xl scale-105 z-10' : 'border-gray-100 shadow-sm'} flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-gray-500 font-medium">{plan.period}</span>}
              </div>

              <Link 
                to={plan.link}
                className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all mb-8 ${
                  plan.popular 
                  ? 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/30' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                }`}
              >
                {plan.buttonText}
              </Link>

              <div className="space-y-4 flex-1">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start">
                    <FiCheck className="text-green-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{feat}</span>
                  </div>
                ))}
                {plan.unavailable.map((feat, i) => (
                  <div key={i} className="flex items-start opacity-50">
                    <FiX className="text-gray-400 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500 line-through font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Pricing;
