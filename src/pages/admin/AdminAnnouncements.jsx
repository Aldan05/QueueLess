import { useState } from 'react';
import { FiRadio, FiSend, FiAlertCircle, FiClock, FiUsers, FiTrash2 } from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';
import InputField from '../../components/auth/business-registration/InputField';

const AdminAnnouncements = () => {
  const { announcements, createAnnouncement, deleteAnnouncement } = useDatabase();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'All',
    priority: 'Normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await createAnnouncement(formData);
      setSuccess('Announcement broadcasted successfully!');
      setFormData({
        title: '',
        message: '',
        targetAudience: 'All',
        priority: 'Normal'
      });
    } catch (err) {
      setError(err.message || 'Failed to send announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
      } catch (err) {
        alert(err.message || 'Failed to delete announcement');
      }
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100/80 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FiRadio className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Platform Announcements
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              Broadcast updates to businesses and customers instantly
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Compose Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100/80 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiSend className="text-purple-600" /> Compose Broadcast
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-semibold">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Announcement Title"
                id="title"
                required
                placeholder="e.g., Platform Maintenance Update"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Message Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type your detailed message here..."
                  className="block w-full px-4 py-3 border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white sm:text-sm rounded-xl transition-all duration-200 resize-none"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                />
              </div>

              <InputField
                label="Target Audience"
                id="targetAudience"
                type="select"
                required
                options={['All', 'Businesses', 'Customers']}
                value={formData.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
              />

              <InputField
                label="Priority Level"
                id="priority"
                type="select"
                required
                options={['Normal', 'High']}
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70"
              >
                {isSubmitting ? 'Sending...' : 'Broadcast Now'} <FiSend />
              </button>
            </form>
          </div>
        </div>

        {/* Broadcast History */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100/80">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiClock className="text-purple-600" /> Broadcast History
            </h2>

            <div className="space-y-4">
              {announcements.filter(a => a.targetAudience !== 'Admin').length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium">
                  No announcements have been broadcasted yet.
                </div>
              ) : (
                announcements.filter(a => a.targetAudience !== 'Admin').map((announcement) => (
                  <div 
                    key={announcement._id} 
                    className={`p-6 rounded-2xl border relative group ${
                      announcement.priority === 'High' 
                        ? 'border-red-100 bg-red-50/30' 
                        : 'border-gray-100 bg-gray-50/50'
                    }`}
                  >
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Announcement"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 pr-10">
                      <h3 className="text-lg font-bold text-gray-900">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {announcement.priority === 'High' && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                            HIGH PRIORITY
                          </span>
                        )}
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-md">
                          <FiUsers /> {announcement.targetAudience}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                      {announcement.message}
                    </p>
                    <div className="mt-4 text-xs font-semibold text-gray-400">
                      Sent on {new Date(announcement.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminAnnouncements;
