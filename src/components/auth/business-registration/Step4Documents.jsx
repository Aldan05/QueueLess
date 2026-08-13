import { useRef } from 'react';
import { FiUploadCloud, FiFile, FiCheckCircle } from 'react-icons/fi';

const DocumentUploader = ({ label, required, value, onChange }) => {
  const isUploaded = !!value;
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          name: file.name,
          type: file.type,
          size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          content: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.png,.jpg,.jpeg,.svg"
      />
      <div 
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 group cursor-pointer ${
          isUploaded 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 bg-gray-50/50 hover:bg-gray-100 hover:border-primary/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploaded ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center mb-3 overflow-hidden">
              {value.type?.startsWith('image/') ? (
                <img src={value.content} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <FiCheckCircle className="w-6 h-6" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{value.name}</p>
            <p className="text-xs text-green-600 mt-1 font-medium">Uploaded Successfully</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors mb-3">
              <FiUploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              <span className="text-primary font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
          </>
        )}
      </div>
    </div>
  );
};

const Step4Documents = ({ data, onChange }) => {
  return (
    <div className="space-y-2 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-1">Business Documents</h3>
      <p className="text-sm text-gray-500 mb-6 font-medium">Please upload clear copies of the following documents.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DocumentUploader
          label="🏢 Business Logo"
          required
          value={data.docLogo}
          onChange={(val) => onChange('docLogo', val)}
        />
        <DocumentUploader
          label="📷 Shop / Office Front Photo"
          required
          value={data.docPhoto}
          onChange={(val) => onChange('docPhoto', val)}
        />
        <DocumentUploader
          label="🪪 Owner Government ID"
          required
          value={data.docGovId}
          onChange={(val) => onChange('docGovId', val)}
        />
        <DocumentUploader
          label="📄 Business Registration Cert."
          required
          value={data.docRegCert}
          onChange={(val) => onChange('docRegCert', val)}
        />
      </div>

      <div className="mt-2">
        <DocumentUploader
          label="📑 GST Certificate (Optional)"
          value={data.docGst}
          onChange={(val) => onChange('docGst', val)}
        />
      </div>
    </div>
  );
};

export default Step4Documents;
