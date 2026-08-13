import { Link } from 'react-router-dom';
import { 
  FiFacebook, FiInstagram, FiLinkedin, FiTwitter, 
  FiYoutube, FiMail, FiGlobe, FiArrowRight 
} from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Socials (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                Q
              </div>
              <span className="text-2xl font-extrabold tracking-tight">QueueLess</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Skip the Line. Save Your Time. The modern platform for intelligent queue management and business operations.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-gray-400">
                <FiGlobe />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-gray-400">
                <FiFacebook />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-gray-400">
                <FiInstagram />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-gray-400">
                <FiLinkedin />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-gray-400">
                <FiTwitter />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors text-gray-400">
                <FiYoutube />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-gray-400">
                <FiMail />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-gray-100 tracking-tight">Product</h3>
            <ul className="space-y-4">
              <li><Link to="/features" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Pricing</Link></li>
              <li><Link to="/business" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">For Business</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Enterprise</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-gray-100 tracking-tight">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Contact</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Careers</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Team</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-gray-100 tracking-tight">Resources</h3>
            <ul className="space-y-4">
              <li><Link to="/help" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Help Center</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">FAQs</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Blog</Link></li>
              <li>
                <Link to="/api-docs" className="text-gray-400 hover:text-white hover:translate-x-1 inline-flex items-center transition-all text-sm font-medium group">
                  Developer API
                  <span className="ml-2 text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">SOON</span>
                </Link>
              </li>
              <li><Link to="/help" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> System Status</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-gray-100 tracking-tight">Legal</h3>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Cookies Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="py-10 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-xl text-white mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm">Get the latest product updates, announcements, and new features delivered to your inbox.</p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 w-full sm:w-72 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-500"
            />
            <button className="bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 group whitespace-nowrap">
              Subscribe
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} QueueLess Inc. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
