import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import InputField from '../../components/auth/business-registration/InputField';

const CustomerProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!', { icon: '🎉' });
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100/80 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 text-white font-bold text-3xl">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              My Profile
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              Manage your personal information and account details
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100/80">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              id="name"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              icon={FiUser}
            />
            
            <InputField
              label="Email Address"
              id="email"
              type="email"
              required
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              icon={FiMail}
            />
            
            <InputField
              label="Phone Number"
              id="phone"
              type="tel"
              placeholder="e.g. +1 234 567 8900"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              icon={FiPhone}
            />
            
            <InputField
              label="City"
              id="city"
              type="text"
              placeholder="e.g. New York"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              icon={FiHome}
            />
          </div>

          <InputField
            label="Street Address"
            id="address"
            type="textarea"
            placeholder="e.g. 123 Main St, Apt 4B"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            icon={FiMapPin}
          />

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`
                flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all
                ${isSaving 
                  ? 'bg-primary/70 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
                }
              `}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;
