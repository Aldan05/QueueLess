import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import InputField from '../../components/auth/business-registration/InputField';

const AdminProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
    }
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const updateData = { ...formData };
      
      if (passwords.newPassword) {
        if (!passwords.oldPassword) {
          throw new Error('Please enter your current password to set a new one.');
        }
        updateData.oldPassword = passwords.oldPassword;
        updateData.newPassword = passwords.newPassword;
      }
      
      await updateProfile(updateData);
      setPasswords({ oldPassword: '', newPassword: '' });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn max-w-4xl mx-auto text-gray-900 dark:text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-gray-100 dark:bg-slate-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
            <FiShield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Admin Profile
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Manage your super admin credentials and security
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <FiUser className="text-blue-500" /> Basic Details
          </h2>
          
          <div className="space-y-4">
            <InputField
              label="Full Name"
              id="name"
              type="text"
              placeholder="Admin Name"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              icon={FiUser}
            />

            <InputField
              label="Email Address"
              id="email"
              type="email"
              placeholder="admin@queueless.com"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              icon={FiMail}
            />
          </div>
        </div>

        {/* Security / Password */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <FiLock className="text-green-500" /> Change Password
          </h2>
          
          <div className="space-y-4">
            <InputField
              label="Current Password"
              id="oldPassword"
              type="password"
              placeholder="Enter current password"
              value={passwords.oldPassword}
              onChange={(e) => setPasswords(p => ({ ...p, oldPassword: e.target.value }))}
              icon={FiLock}
            />

            <InputField
              label="New Password"
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
              icon={FiLock}
            />
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
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
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfile;
