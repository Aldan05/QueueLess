import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiMapPin } from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import BusinessServiceCard from '../../components/customer/BusinessServiceCard';
import toast from 'react-hot-toast';

const CustomerFind = () => {
  const { businesses, joinQueue } = useDatabase();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // We'll consider businesses with verificationStatus === 'Approved' or isVerified === true
  const verifiedBusinesses = businesses.filter(b => b.isVerified || b.verificationStatus === 'Approved');

  // Extract unique categories for filter
  const categories = ['All', ...new Set(verifiedBusinesses.map(b => b.category || 'General'))];

  const filteredBusinesses = verifiedBusinesses.filter(biz => {
    const matchesSearch = (biz.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationTerm === '' || 
      (biz.city || '').toLowerCase().includes(locationTerm.toLowerCase()) || 
      (biz.address || '').toLowerCase().includes(locationTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || biz.category === categoryFilter;
    return matchesSearch && matchesLocation && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-50 dark:bg-slate-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <FiSearch className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Find Businesses
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Discover and join queues for services around you.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100/80 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
          <div className="relative w-full sm:max-w-xs">
            <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Filter by location..." 
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <FiFilter className="text-gray-400 w-5 h-5" />
          <div className="overflow-x-auto flex gap-2 pb-2 sm:pb-0 hide-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                  categoryFilter === category 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiMapPin className="text-blue-500" />
            Nearby Results <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2">({filteredBusinesses.length} found)</span>
          </h2>
        </div>

        {filteredBusinesses.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No businesses nearby</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Try adjusting your filters or search area. There might not be any businesses matching "{searchTerm}" in this category.
            </p>
            <button 
              onClick={() => { setSearchTerm(''); setLocationTerm(''); setCategoryFilter('All'); }}
              className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-xl font-bold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBusinesses.map((biz, index) => (
              <BusinessServiceCard 
                key={biz._id} 
                business={biz} 
                onJoin={(id) => navigate(`/customer/business/${id}?join=true`)}
                delay={index * 0.05} 
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerFind;
