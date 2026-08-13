import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMail, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          
          {!isSent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
                  <FiMail className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                  Forgot password?
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleReset}>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FiMail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200 ease-in-out"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? 'Sending instructions...' : 'Reset password'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-inner">
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-500 font-medium mb-8">
                We sent a password reset link to <br/><span className="font-semibold text-gray-900">{email}</span>
              </p>
              
              <button
                onClick={() => setIsSent(false)}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Didn't receive the email? Click to resend
              </button>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              <FiArrowLeft className="mr-2" /> Back to log in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
