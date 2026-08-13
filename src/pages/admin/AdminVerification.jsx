import { FiShield } from 'react-icons/fi';
import AdminVerificationWidget from '../../components/admin/AdminVerificationWidget';

const AdminVerification = () => {
  return (
    <div className="space-y-8 pb-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100/80 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-gray-50 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FiShield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Business Verification
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              Review and approve newly registered businesses
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100/80 p-8">
        <AdminVerificationWidget />
      </div>
    </div>
  );
};

export default AdminVerification;
