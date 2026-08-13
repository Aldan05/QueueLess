import { useState, useEffect } from 'react';
import { FiMonitor, FiPlus, FiTrash2, FiEdit2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BusinessCounters = () => {
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCounterName, setNewCounterName] = useState('');
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const businessId = currentUser.businessId?._id || currentUser.businessId;

  useEffect(() => {
    fetchCounters();
  }, [businessId]);

  const fetchCounters = async () => {
    try {
      const response = await fetch(`${API_URL}/counters/business/${businessId}`);
      if (response.ok) {
        const data = await response.json();
        setCounters(data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load counters');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCounter = async (e) => {
    e.preventDefault();
    if (!newCounterName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/counters/business/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCounterName })
      });
      
      if (response.ok) {
        const newCounter = await response.json();
        setCounters([...counters, newCounter]);
        setNewCounterName('');
        setIsAdding(false);
        toast.success('Counter created successfully');
      } else {
        toast.error('Failed to create counter');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this counter?')) return;
    
    try {
      const response = await fetch(`${API_URL}/counters/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCounters(counters.filter(c => c._id !== id));
        toast.success('Counter deleted');
      }
    } catch (error) {
      toast.error('Failed to delete counter');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiMonitor className="text-primary" /> Service Counters
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage physical service desks where staff handle customers.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm shadow-primary/20"
        >
          {isAdding ? <FiXCircle /> : <FiPlus />} {isAdding ? 'Cancel' : 'Add Counter'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCounter} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Counter Name</label>
            <input
              type="text"
              placeholder="e.g. Desk 1, Pharmacy Window, Consultation Room A"
              value={newCounterName}
              onChange={(e) => setNewCounterName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all dark:text-white"
              required
            />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors h-[50px]">
            Save
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading counters...</div>
      ) : counters.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
          <FiMonitor className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">No counters created yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create counters to assign your staff to specific service locations.</p>
          <button onClick={() => setIsAdding(true)} className="text-primary font-semibold hover:underline">
            + Create First Counter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counters.map(counter => (
            <div key={counter._id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{counter.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  counter.status === 'Open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  counter.status === 'Break' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                }`}>
                  {counter.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Assigned Staff: </span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {counter.currentStaffId ? counter.currentStaffId.fullName : <span className="text-red-400 italic">Unassigned</span>}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-2">
                <button onClick={() => handleDelete(counter._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessCounters;
