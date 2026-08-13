import { Outlet, Link, useLocation } from 'react-router-dom';
import Footer from '../components/public/Footer';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const PublicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-primary/30 selection:text-primary">
      
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group z-50">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                Q
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">QueueLess</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">Features</Link>
              <Link to="/pricing" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">Pricing</Link>
              <Link to="/business" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">For Business</Link>
              <Link to="/about" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">About Us</Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-bold bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-2 group">
                Get Started
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-600 hover:text-gray-900 p-2 z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-4 px-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <Link to="/features" className="p-3 font-bold text-gray-700 hover:bg-gray-50 rounded-xl">Features</Link>
            <Link to="/pricing" className="p-3 font-bold text-gray-700 hover:bg-gray-50 rounded-xl">Pricing</Link>
            <Link to="/business" className="p-3 font-bold text-gray-700 hover:bg-gray-50 rounded-xl">For Business</Link>
            <Link to="/about" className="p-3 font-bold text-gray-700 hover:bg-gray-50 rounded-xl">About Us</Link>
            <Link to="/contact" className="p-3 font-bold text-gray-700 hover:bg-gray-50 rounded-xl">Contact</Link>
            <div className="h-px bg-gray-100 my-2"></div>
            <Link to="/login" className="p-3 font-bold text-center text-gray-700 border border-gray-200 rounded-xl">Sign In</Link>
            <Link to="/register" className="p-3 font-bold text-center bg-gray-900 text-white rounded-xl">Get Started</Link>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pt-24 pb-12">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
