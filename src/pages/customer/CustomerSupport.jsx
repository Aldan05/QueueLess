import { useState } from 'react';
import { FiHelpCircle, FiMail, FiPhone, FiMessageSquare, FiSend, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';

const CustomerSupport = () => {
  const { createComplaint } = useDatabase();
  const { currentUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "How do I join a queue?",
      answer: "You can find a business using the 'Find Businesses' page. Click on the business and look for the 'Join Queue' button to get your token."
    },
    {
      question: "What happens if I miss my turn?",
      answer: "If you are not present when your token is called, the business may mark you as 'Skipped'. You might have to request a new token if that happens."
    },
    {
      question: "How can I cancel my appointment?",
      answer: "Navigate to the 'Appointments' tab in your sidebar, find the upcoming appointment, and click the cancel button. The business will be notified."
    },
    {
      question: "Are wait times accurate?",
      answer: "Wait times are estimates calculated automatically based on how long it takes for a business to serve previous customers. Actual wait times may vary slightly."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please fill out all fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createComplaint({
        reporterId: currentUser._id,
        reporterModel: 'User',
        reporterType: 'Customer',
        reporterName: currentUser.name,
        subject,
        description: message,
        priority: 'Medium'
      });
      toast.success('Support ticket submitted successfully!');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error(error.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary/10 dark:bg-slate-700/50 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <FiHelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Help & Support
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              We're here to help you get the most out of QueueLess.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Form Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiMessageSquare className="text-primary" /> Send us a message or complaint
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or complaint in detail..."
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm font-medium transition-all outline-none resize-none text-gray-900 dark:text-gray-100"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all disabled:opacity-70 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" /> Submit
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQs */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border ${openFaq === index ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'} rounded-2xl overflow-hidden transition-colors`}
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === index ? 'bg-primary/20 dark:bg-primary/40 text-primary' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                      {openFaq === index ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="px-5 pb-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-blue-700 p-8 rounded-[2rem] text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="text-xl font-bold mb-2 relative z-10">Direct Contact</h3>
            <p className="text-blue-100 text-sm mb-8 relative z-10">Prefer to speak with someone directly? Reach out via email or phone.</p>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <FiMail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Email Support</p>
                  <p className="font-medium">support@queueless.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <FiPhone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Phone Support</p>
                  <p className="font-medium">+1 (800) 123-4567</p>
                  <p className="text-xs text-blue-200 mt-0.5">Mon-Fri, 9am - 5pm EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerSupport;
