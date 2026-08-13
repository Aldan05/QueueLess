import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { FiArrowRight, FiLock, FiMail, FiUser, FiBriefcase } from 'react-icons/fi';

const Register = () => {
  const [role, setRole] = useState('Customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { registerCustomer } = useDatabase();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await registerCustomer(name, email, password);
      navigate('/login', { state: { message: 'Registration successful! Please log in with your new credentials.' } });
    } catch (err) {
      setError(err.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Create an account
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Join QueueLess to save time and manage queues effortlessly
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
              
              {/* Role Selection Tabs */}
              <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setRole('Customer')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center ${
                    role === 'Customer'
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiUser className="mr-2" /> Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Business')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center ${
                    role === 'Business'
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiBriefcase className="mr-2" /> Business
                </button>
              </div>

              {role === 'Customer' ? (
                <>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiUser className="h-5 w-5" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200 ease-in-out"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
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
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200 ease-in-out"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiLock className="h-5 w-5" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200 ease-in-out"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {role === 'Customer' ? (
              <>
                <div className="text-sm text-gray-500 font-medium leading-relaxed">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-primary hover:text-blue-700 transition-colors">Terms of Service</a> and{' '}
                  <a href="#" className="text-primary hover:text-blue-700 transition-colors">Privacy Policy</a>.
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      <>
                        Sign up as Customer
                        <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <FiBriefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Business Registration</h3>
                <p className="text-sm text-gray-500 mb-6 font-medium">
                  We require some detailed information and verification documents to onboard your business.
                </p>
                <Link
                  to="/register/business"
                  className="group w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-gray-800 transition-all duration-200 shadow-lg"
                >
                  Start Business Onboarding
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-blue-700 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
