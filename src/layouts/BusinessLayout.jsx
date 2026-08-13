import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BusinessSidebar from '../components/business/BusinessSidebar';
import BusinessNavbar from '../components/business/BusinessNavbar';

const BusinessLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex font-sans">
      <BusinessSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        <BusinessNavbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;
