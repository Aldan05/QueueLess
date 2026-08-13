import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex font-sans">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        <AdminNavbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
