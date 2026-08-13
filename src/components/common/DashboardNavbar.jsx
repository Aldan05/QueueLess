import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';

const DashboardNavbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center flex-1">
        <button type="button" className="md:hidden text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-2 -ml-2 mr-2">
          <span className="sr-only">Open sidebar</span>
          <FiMenu className="h-6 w-6" />
        </button>
        
        <div className="max-w-md w-full hidden sm:block">
          <label htmlFor="search" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="Search..."
              type="search"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary rounded-full transition-colors">
          <span className="sr-only">View notifications</span>
          <FiBell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};

export default DashboardNavbar;
