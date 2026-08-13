import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const LoginForm = ({ role, onSubmit, isLoading, isSuccess }) => {
  const getDefaultEmail = (role) => {
    if (role === 'Super Admin') return 'admin@gmail.com';
    if (role === 'Business') return 'bussnes@gmail.com';
    return 'user@gmail.com';
  };

  const getDefaultPassword = (role) => {
    if (role === 'Super Admin') return '12345678';
    return '123456';
  };

  const [email, setEmail] = useState(getDefaultEmail(role));
  const [password, setPassword] = useState(getDefaultPassword(role));
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setEmail(getDefaultEmail(role));
    setPassword(getDefaultPassword(role));
    setErrors({});
  }, [role]);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(email, password);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email or Username
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <FiMail className="h-5 w-5" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            className={`block w-full pl-11 pr-4 py-3 bg-gray-50/50 focus:bg-white sm:text-sm rounded-xl transition-all duration-200 ease-in-out border ${
              errors.email 
                ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500' 
                : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
            }`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-sm text-red-500 font-medium">
            {errors.email}
          </motion.p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <FiLock className="h-5 w-5" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            className={`block w-full pl-11 pr-12 py-3 bg-gray-50/50 focus:bg-white sm:text-sm rounded-xl transition-all duration-200 ease-in-out border ${
              errors.password 
                ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500' 
                : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-sm text-red-500 font-medium">
            {errors.password}
          </motion.p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer transition-colors"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer select-none">
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <Link to="/forgot-password" className="font-semibold text-primary hover:text-blue-700 transition-colors">
            Forgot password?
          </Link>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center"
              >
                <FiCheck className="mr-2 h-5 w-5" />
                Success
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                Login as {role}
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
