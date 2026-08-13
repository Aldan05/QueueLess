import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0">
            <span className="text-2xl font-bold tracking-tight">Queue<span className="text-gray-400">Less</span></span>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Skip the Line. Save Your Time. The ultimate virtual queue management platform for modern businesses.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</Link></li>
              <li><Link to="/businesses" className="text-gray-400 hover:text-white text-sm transition-colors">For Businesses</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} QueueLess Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
