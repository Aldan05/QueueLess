import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiXCircle, FiMapPin, FiUser, FiClock, FiFileText, FiImage, FiDownload, FiAlertTriangle } from 'react-icons/fi';

const BusinessDetailsModal = ({ isOpen, onClose, business, onApprove, onReject }) => {
  if (!business) return null;

  const hasPendingUpdates = business.pendingDocs && typeof business.pendingDocs === 'object' && Object.keys(business.pendingDocs).length > 0;
  const isUpdateReview = business.verificationStatus === 'Pending Update Review' || hasPendingUpdates;

  const docList = [
    { key: 'docLogo', label: 'Business Logo', isImage: true },
    { key: 'docPhoto', label: 'Shop / Front Photo', isImage: true },
    { key: 'docGovId', label: 'Owner Gov ID', isImage: true },
    { key: 'docRegCert', label: 'Registration Cert', isImage: false },
    { key: 'docGst', label: 'GST / Tax Certificate', isImage: false }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-2xl border border-gray-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-gray-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-2xl overflow-hidden shadow-sm shrink-0">
                  {(() => {
                    const displayLogo = business.pendingDocs?.docLogo || business.docLogo;
                    const logoSrc = typeof displayLogo === 'string' ? displayLogo : (displayLogo?.content || displayLogo?.url);
                    return logoSrc ? (
                      <img src={logoSrc} alt={business.name} className="w-full h-full object-cover" />
                    ) : (
                      business.name?.charAt(0) || '🏢'
                    );
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{business.name}</h2>
                    {isUpdateReview && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-200 dark:border-amber-800 animate-pulse">
                        ⚡ Update Request
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
                      {business.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">• ID: {business._id}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Alert banner if pending update review */}
            {isUpdateReview && (
              <div className="px-8 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs font-bold">
                <FiAlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  This business has submitted new document/logo updates for Admin review. Approving will update their live profile. Rejecting will keep their existing details intact.
                </span>
              </div>
            )}

            {/* Content */}
            <div className="p-8 overflow-y-auto flex-1 bg-white dark:bg-slate-900 space-y-8">
              
              {/* Verification & Pending Documents Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <FiImage className="text-primary w-5 h-5" />
                    <h3 className="font-extrabold text-lg">Documents & Real-time Images</h3>
                  </div>
                  {hasPendingUpdates && (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                      Highlighted items are newly submitted updates
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docList.map((docItem) => {
                    const pendingDoc = business.pendingDocs?.[docItem.key];
                    const liveDoc = business[docItem.key];
                    const isPending = !!pendingDoc;
                    const docData = pendingDoc || liveDoc;
                    const fileContent = typeof docData === 'string' ? docData : (docData?.content || docData?.url);
                    const fileName = (docData && (docData.fileName || docData.name)) || `${docItem.label} File`;

                    return (
                      <div 
                        key={docItem.key} 
                        className={`p-4 rounded-2xl border transition-all ${
                          isPending 
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-300 dark:ring-amber-800' 
                            : 'bg-gray-50/80 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-gray-900 dark:text-white">{docItem.label}</span>
                              {isPending ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-orange-500 text-white shadow-sm">
                                  ⚡ New Update
                                </span>
                              ) : liveDoc ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                  Live
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-slate-700">
                                  Missing
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[220px]">
                              {docData ? fileName : 'No document uploaded'}
                            </p>
                          </div>

                          {fileContent && (
                            <a
                              href={fileContent}
                              download={fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                              title="Download / View in New Tab"
                            >
                              <FiDownload className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        {/* Real-time Image or Document Preview Box */}
                        {fileContent ? (
                          docItem.isImage || (typeof fileContent === 'string' && fileContent.startsWith('data:image')) ? (
                            <div className="w-full h-44 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 overflow-hidden flex items-center justify-center p-2 relative group">
                              <img 
                                src={fileContent} 
                                alt={docItem.label} 
                                className="max-w-full max-h-full object-contain rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                                <a 
                                  href={fileContent} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-lg hover:bg-gray-100"
                                >
                                  Open Full Image
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-32 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center p-4 text-center">
                              <FiFileText className="w-8 h-8 text-blue-500 mb-2" />
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[240px]">{fileName}</span>
                              <a 
                                href={fileContent} 
                                download={fileName} 
                                className="mt-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Download Document
                              </a>
                            </div>
                          )
                        ) : (
                          <div className="w-full h-24 rounded-xl bg-gray-100/50 dark:bg-slate-800/30 border border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center text-xs text-gray-400 font-medium">
                            No file available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Other Business Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                
                {/* Location Details */}
                <div className="bg-gray-50/80 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                    <FiMapPin className="text-primary w-4 h-4" />
                    <h4 className="font-extrabold text-sm">Location</h4>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-gray-500">Address: <strong className="text-gray-900 dark:text-white font-semibold">{business.address || 'N/A'}</strong></p>
                    <p className="text-gray-500">City / State: <strong className="text-gray-900 dark:text-white font-semibold">{business.city || 'N/A'}, {business.state || 'N/A'}</strong></p>
                    <p className="text-gray-500">PIN Code: <strong className="text-gray-900 dark:text-white font-semibold">{business.pinCode || 'N/A'}</strong></p>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="bg-gray-50/80 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                    <FiUser className="text-indigo-500 w-4 h-4" />
                    <h4 className="font-extrabold text-sm">Owner Details</h4>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-gray-500">Name: <strong className="text-gray-900 dark:text-white font-semibold">{business.ownerName || 'N/A'}</strong></p>
                    <p className="text-gray-500">Email: <strong className="text-gray-900 dark:text-white font-semibold">{business.ownerEmail || business.email || 'N/A'}</strong></p>
                    <p className="text-gray-500">Phone: <strong className="text-gray-900 dark:text-white font-semibold">{business.ownerMobile || business.phone || 'N/A'}</strong></p>
                  </div>
                </div>

                {/* Queue Setup */}
                <div className="bg-gray-50/80 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                    <FiClock className="text-orange-500 w-4 h-4" />
                    <h4 className="font-extrabold text-sm">Operating Hours</h4>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-gray-500">Hours: <strong className="text-gray-900 dark:text-white font-semibold">{business.openingTime || 'N/A'} - {business.closingTime || 'N/A'}</strong></p>
                    <p className="text-gray-500">Working Days: <strong className="text-gray-900 dark:text-white font-semibold">{business.workingDays || 'N/A'}</strong></p>
                    <p className="text-gray-500">Avg Service Time: <strong className="text-gray-900 dark:text-white font-semibold">{business.avgServiceTime ? `${business.avgServiceTime}m` : 'N/A'}</strong></p>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer / Actions */}
            <div className="px-8 py-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">Current Status:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-extrabold ${
                  isUpdateReview 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' 
                    : business.verificationStatus === 'Approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
                }`}>
                  {isUpdateReview ? 'Pending Update Review' : business.verificationStatus}
                </span>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => { onReject(business._id); onClose(); }}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 transition-colors flex items-center justify-center gap-2"
                >
                  <FiXCircle className="w-4 h-4" /> {isUpdateReview ? 'Reject Update' : 'Reject Business'}
                </button>
                <button
                  onClick={() => { onApprove(business._id); onClose(); }}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <FiCheckCircle className="w-4 h-4" /> {isUpdateReview ? 'Approve Update & Make Live' : 'Approve Application'}
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BusinessDetailsModal;
