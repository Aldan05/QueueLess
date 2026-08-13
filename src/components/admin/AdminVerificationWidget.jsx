import { useState } from 'react';
import { FiCheckCircle, FiXCircle, FiMoreVertical, FiEye, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../context/DatabaseContext';
import BusinessDetailsModal from './BusinessDetailsModal';

const AdminVerificationWidget = () => {
  const navigate = useNavigate();
  const { businesses, adminApproveBusiness, adminRejectBusiness } = useDatabase();
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pendingVerifications = businesses.filter(b => 
    b.verificationStatus === 'Pending Review' || 
    b.verificationStatus === 'Pending Update Review' || 
    b.verificationStatus === 'Documents Missing' ||
    (b.pendingDocs && typeof b.pendingDocs === 'object' && Object.keys(b.pendingDocs).length > 0)
  );

  const selectedBusiness = businesses.find(b => b._id === selectedBusinessId) || null;

  const openModal = (business) => {
    setSelectedBusinessId(business._id || business.id);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100/80 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/30 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Verification & Update Requests</h2>
            {pendingVerifications.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                {pendingVerifications.length} Pending
              </span>
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/documents')}
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            View All Documents <FiArrowRight />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4 hidden sm:table-cell">Category</th>
                <th className="px-6 py-4">Request Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
              {pendingVerifications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl">
                      <FiCheckCircle />
                    </div>
                    No pending verification or logo update requests. All businesses are up to date!
                  </td>
                </tr>
              ) : pendingVerifications.map((item) => {
                const hasPendingDocs = item.pendingDocs && typeof item.pendingDocs === 'object' && Object.keys(item.pendingDocs).length > 0;
                const isUpdate = item.verificationStatus === 'Pending Update Review' || hasPendingDocs;
                
                // Get display logo (pending logo if available, or current live logo)
                const pendingLogo = item.pendingDocs?.docLogo;
                const liveLogo = item.docLogo;
                const displayLogoObj = pendingLogo || liveLogo;
                const logoSrc = typeof displayLogoObj === 'string' ? displayLogoObj : (displayLogoObj?.content || displayLogoObj?.url);

                return (
                  <tr key={item._id || item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-gray-100 dark:border-slate-700 shadow-sm relative">
                          {logoSrc ? (
                            <img src={logoSrc} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            item.name?.charAt(0).toUpperCase() || '🏢'
                          )}
                          {isUpdate && (
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white dark:ring-slate-900"></div>
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-gray-900 dark:text-white block">{item.name}</span>
                          <span className="text-xs text-gray-400 font-medium">ID: {(item._id || item.id)?.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isUpdate ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Logo / Doc Update
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          New Business
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        isUpdate
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : item.verificationStatus === 'Pending Review' 
                            ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' 
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          isUpdate ? 'bg-amber-500 animate-ping' : item.verificationStatus === 'Pending Review' ? 'bg-orange-500' : 'bg-red-500'
                        }`}></span>
                        {isUpdate ? 'Pending Update Review' : item.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => openModal(item)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors flex items-center gap-1 border border-blue-100 dark:border-blue-900/40" 
                          title="View Details"
                        >
                          <FiEye className="w-3.5 h-3.5" /> Review
                        </button>
                        <button 
                          onClick={() => adminApproveBusiness(item._id || item.id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-sm flex items-center gap-1" 
                          title="Approve"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button 
                          onClick={() => adminRejectBusiness(item._id || item.id)}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-colors flex items-center gap-1 border border-red-200 dark:border-red-800" 
                          title="Reject"
                        >
                          <FiXCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <BusinessDetailsModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedBusinessId(null); }}
        business={selectedBusiness}
        onApprove={adminApproveBusiness}
        onReject={adminRejectBusiness}
      />
    </>
  );
};

export default AdminVerificationWidget;
