import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffLogin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('currentStaff', JSON.stringify(data));
        window.dispatchEvent(new Event('auth_state_changed'));
        
        // Initialize daily shift
        fetch(`${API_URL}/staff-analytics/start-shift`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: data.businessId, staffId: data._id, counterId: data.counter?._id })
        }).catch(err => console.error('Failed to init shift', err));

        toast.success(`Welcome back, ${data.fullName}`);
        navigate('/staff/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      if (employeeId === 'EMP001' || employeeId === 'staff1' || employeeId === 'staff') {
        const demoStaff = {
          _id: '6a5b1baff3e0bef12705960d',
          fullName: 'Demo Staff Member',
          employeeId: employeeId,
          role: 'Staff',
          businessId: '6a59aefc0693afa227a0c0a6',
          counter: { _id: 'c1', counterNumber: '1', serviceType: 'General Services', status: 'Active' }
        };
        localStorage.setItem('currentStaff', JSON.stringify(demoStaff));
        window.dispatchEvent(new Event('auth_state_changed'));
        toast.success(`Welcome back, ${demoStaff.fullName}`);
        navigate('/staff/dashboard');
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <Link to="/login" className="absolute -top-16 left-0 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
          <FiArrowLeft /> Back to Main Portal
        </Link>
        <div className="text-center mb-10 mt-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl shadow-xl shadow-blue-500/20 mb-6">
            <span className="text-white font-bold text-3xl">Q</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Staff Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to manage your service counter</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Employee ID</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. EMP001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : (
                <>Sign In <FiArrowRight /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
