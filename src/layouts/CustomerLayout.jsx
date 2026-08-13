import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from '../components/customer/CustomerSidebar';
import CustomerNavbar from '../components/customer/CustomerNavbar';

const CustomerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex">
      <CustomerSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        <CustomerNavbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
