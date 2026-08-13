import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiShield, FiBriefcase, FiUser } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('Customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { authenticateUser } = useDatabase();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleDemoClick = (role) => {
    if (role === 'Customer') { setEmail('customer@queueless.com'); setPassword('password123'); }
    if (role === 'Business') { setEmail('business@queueless.com'); setPassword('password123'); }
    if (role === 'Super Admin') { setEmail('admin@queueless.com'); setPassword('password123'); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await authenticateUser(email, password);
      
      if (user.role !== activeTab && activeTab !== 'Super Admin') {
        console.warn(`User role ${user.role} doesn't match selected tab ${activeTab}`);
      }
      
      login(user);
      
      if (user.role === 'Customer') navigate('/customer/dashboard');
      else if (user.role === 'Business') navigate('/business/dashboard');
      else if (user.role === 'Super Admin') navigate('/admin/dashboard');
      
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  const tabs = [
    { id: 'Customer', icon: FiUser, label: 'Customer' },
    { id: 'Business', icon: FiBriefcase, label: 'Business' },
    { id: 'Super Admin', icon: FiShield, label: 'Admin' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-xl border border-gray-100 flex overflow-hidden">
        
        <div className="hidden lg:flex w-1/2 bg-gray-900 text-white p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 group mb-16 inline-flex">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                Q
              </div>
              <span className="text-2xl font-extrabold tracking-tight">QueueLess</span>
            </Link>

            <h1 className="text-4xl font-extrabold mb-6 leading-tight">
              Welcome back to <br />
              <span className="text-primary">smarter waiting.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Login to manage your queues, track wait times, and improve your daily efficiency.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
              <span className="w-8 h-px bg-gray-700"></span>
              Join 5,000+ businesses worldwide
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-8 sm:p-16">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Sign in to your account</h2>
            <p className="text-gray-500">Select your portal to continue</p>
          </div>

          <div className="flex p-1 bg-gray-100/80 rounded-2xl mb-8 border border-gray-200/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <tab.icon className={activeTab === tab.id ? 'text-primary' : ''} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {successMessage && (
              <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold text-center">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  placeholder={`Enter your ${activeTab.toLowerCase()} email`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm font-bold text-primary hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-gray-900 hover:bg-primary text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              Sign In <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-4 flex justify-center gap-2">
              <button 
                type="button" 
                onClick={() => handleDemoClick(activeTab)}
                className="text-xs font-bold text-blue-500 hover:text-blue-700 underline"
              >
                Fill Demo Credentials for {activeTab}
              </button>
            </div>
          </form>

          {activeTab !== 'Super Admin' && (
            <p className="mt-8 text-center text-sm font-medium text-gray-500">
              Don't have an account?{' '}
              <Link to={activeTab === 'Business' ? '/register/business' : '/register'} className="font-bold text-primary hover:text-blue-700 transition-colors">
                Sign up
              </Link>
            </p>
          )}

          {activeTab === 'Business' && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm font-medium text-gray-500">
                Are you a staff member?{' '}
                <Link to="/staff/login" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  Go to Staff Portal
                </Link>
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;
