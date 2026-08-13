import React, { useRef, useState } from 'react';
import { FiUploadCloud, FiCheckCircle, FiFileText, FiClock, FiShield, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

const BusinessDocuments = () => {
  const { businesses, fetchBusinesses } = useDatabase();
  const { currentUser } = useAuth();
  const [uploadingDoc, setUploadingDoc] = useState(null);
  
  const fileInputRef = useRef(null);
  const [currentUploadType, setCurrentUploadType] = useState(null);

  const business = businesses.find(b => b._id === currentUser?.businessId);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  if (!business) return null;

  const documentsList = [
    { id: 'docLogo', title: 'Business Logo', description: 'High-res image of your brand logo.', type: 'Image (PNG, JPG)' },
    { id: 'docPhoto', title: 'Premises Photo', description: 'Clear photo of your storefront or clinic.', type: 'Image (PNG, JPG)' },
    { id: 'docGovId', title: 'Owner Gov ID', description: 'Aadhar Card, PAN Card, or Passport.', type: 'PDF or Image' },
    { id: 'docRegCert', title: 'Registration Certificate', description: 'Official business registration document.', type: 'PDF' },
    { id: 'docGst', title: 'GST / Tax Certificate', description: 'Tax registration if applicable.', type: 'PDF' }
  ];

  const handleUploadClick = (docId) => {
    setCurrentUploadType(docId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUploadType) return;

    setUploadingDoc(currentUploadType);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async (event) => {
        try {
          const base64Content = event.target.result;
          
          const response = await fetch(`${API_URL}/businesses/${business._id}/documents`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              docType: currentUploadType,
              name: file.name,
              type: file.type,
              size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
              content: base64Content
            })
          });

          if (response.ok) {
            toast.success('Document uploaded successfully!');
            fetchBusinesses(); // Refresh business data to show uploaded state
          } else {
            toast.error('Failed to upload document');
          }
        } catch (error) {
          toast.error('Server error during upload');
        } finally {
          setUploadingDoc(null);
          setCurrentUploadType(null);
          e.target.value = ''; // Reset input
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to process file');
      setUploadingDoc(null);
      setCurrentUploadType(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Verification Documents</h1>
          <p className="text-gray-500 font-medium mt-1">Upload required documents to get your business verified.</p>
        </div>
        
        <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 font-bold ${
          business.isVerified 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : business.verificationStatus === 'Pending Review'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          {business.isVerified ? (
            <><FiCheckCircle className="w-5 h-5" /> Fully Verified</>
          ) : business.verificationStatus === 'Pending Review' ? (
            <><FiClock className="w-5 h-5" /> Under Review</>
          ) : (
            <><FiAlertCircle className="w-5 h-5" /> Action Required</>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/png, image/jpeg, application/pdf"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <FiShield className="w-12 h-12 mb-6 text-blue-200" />
            <h3 className="text-2xl font-extrabold mb-3">Why verify?</h3>
            <p className="text-blue-100 font-medium leading-relaxed mb-6">
              Verified businesses receive a trust badge, rank higher in customer searches, and gain access to advanced queue analytics.
            </p>
            <ul className="space-y-3 text-sm font-bold text-blue-50">
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Trust Badge</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Priority Search Listing</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Advanced Analytics</li>
            </ul>
          </div>
        </div>

        {/* Right Col: Documents */}
        <div className="lg:col-span-2 space-y-4">
          {documentsList.map((doc) => {
            const isPending = !!business.pendingDocs?.[doc.id];
            const docData = business.pendingDocs?.[doc.id] || business[doc.id];
            const isUploaded = !!docData && (docData.status === 'Uploaded' || !!docData.name || typeof docData === 'string');
            const isUploading = uploadingDoc === doc.id;
            
            const displayFileName = docData ? (docData.fileName || docData.name || 'Uploaded Document') : '';
            const docContent = typeof docData === 'string' ? docData : (docData?.content || docData?.url);

            return (
              <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 shadow-sm ${
                    isUploaded ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {docContent && (doc.id === 'docLogo' || doc.id === 'docPhoto' || (typeof docContent === 'string' && docContent.startsWith('data:image'))) ? (
                      <img src={docContent} alt={doc.title} className="w-full h-full object-cover" />
                    ) : isUploaded ? (
                      <FiCheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <FiFileText className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{doc.title}</h4>
                    <p className="text-gray-500 font-medium text-sm mt-1">{doc.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{doc.type}</span>
                      {isUploaded && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs font-bold text-gray-500 truncate max-w-[200px]">{displayFileName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isUploaded ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-right">
                      {isPending ? (
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg whitespace-nowrap">Pending Admin Approval</span>
                      ) : (
                        <span className="text-sm font-bold text-green-600">Active</span>
                      )}
                      <button 
                        onClick={() => handleUploadClick(doc.id)}
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUploadClick(doc.id)}
                      disabled={isUploading}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                        isUploading 
                          ? 'bg-gray-100 text-gray-400 cursor-wait'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {isUploading ? (
                        <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> Uploading...</>
                      ) : (
                        <><FiUploadCloud /> Upload</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default BusinessDocuments;
