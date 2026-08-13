import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
              Queue<span className="text-gray-900">Less</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/about" className="text-gray-600 hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Contact</Link>
            <Link to="/login" className="text-gray-900 font-medium hover:text-primary transition-colors">Log in</Link>
            <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
