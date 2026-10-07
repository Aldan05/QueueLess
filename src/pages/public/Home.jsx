import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiArrowRight, FiCheckCircle, FiClock, 
  FiShield, FiSmartphone, FiUsers, FiTrendingUp, 
  FiBell, FiStar, FiActivity, FiLayers, FiBriefcase
} from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';

const Home = () => {
  const navigate = useNavigate();
  const { businesses } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/find?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/customer/find');
    }
  };

  const roleData = {
    customer: {
      title: 'Customer Experience',
      badge: '👤 For Customers',
      tagline: 'Skip the line, join remotely, and arrive right when it’s your turn.',
      features: [
        'Instant live token generation with real-time position tracking',
        'Secure document submission for verification-based queues',
        'Advanced appointment booking with smart slot suggestions',
        'Real-time notifications via WebSocket when your turn approaches',
        'Multifaceted rating & review system after service completion'
      ],
      ctaText: 'Explore as Customer',
      ctaLink: '/customer/find',
      bgGrad: 'from-blue-600 to-indigo-700'
    },
    business: {
      title: 'Business Command Center',
      badge: '🏢 For Businesses',
      tagline: 'Streamline customer flow, manage multi-counters, and eliminate congestion.',
      features: [
        'Comprehensive live dashboard showing waiting count, serving token, and staff',
        'Multi-counter management with open, break, and serving status tracking',
        'Staff creation with granular permissions and counter assignment',
        'Customer document verification review: Approve, Reject, or Request Info',
        'Deep operational analytics: avg wait times, throughput, and ratings'
      ],
      ctaText: 'Register Business',
      ctaLink: '/register/business',
      bgGrad: 'from-indigo-600 to-purple-700'
    },
    staff: {
      title: 'Staff Service Counter',
      badge: '👨‍💼 For Staff Members',
      tagline: 'Dedicated counter terminal engineered for maximum customer throughput.',
      features: [
        'One-click Call Next Customer, Recall, Skip, and Complete controls',
        'Active counter status toggle (Open, Serving, On Break, Closed)',
        'Live customer verification inspection & document viewer',
        'Integrated QR ticket code scanner for instant verification',
        'Personal performance analytics and daily service tracking'
      ],
      ctaText: 'Staff Portal Login',
      ctaLink: '/staff/login',
      bgGrad: 'from-emerald-600 to-teal-700'
    },
    admin: {
      title: 'Super Administrator',
      badge: '👑 For Platform Admin',
      tagline: 'Total governance, security monitoring, and ecosystem analytics.',
      features: [
        'Self-service business verification & document review workflow',
        'Comprehensive user and business monitoring across all statuses',
        'System-wide announcement broadcasting',
        'Platform customer support ticketing and complaint resolution',
        'System audit logs and operational health monitoring'
      ],
      ctaText: 'Admin Dashboard',
      ctaLink: '/login',
      bgGrad: 'from-amber-600 to-orange-700'
    }
  };

  const workflowSteps = [
    {
      num: '01',
      title: 'Discover Business',
      desc: 'Browse hospitals, banks, salons, or service centers near you with live wait times.'
    },
    {
      num: '02',
      title: 'Join Queue or Book',
      desc: 'Get an instant live token or schedule an appointment slot. Upload verification IDs if required.'
    },
    {
      num: '03',
      title: 'Live Position Tracking',
      desc: 'Track live serving tokens, customers ahead, and receive WebSocket alerts when your turn arrives.'
    },
    {
      num: '04',
      title: 'Get Served & Rate',
      desc: 'Arrive at the assigned counter, complete service seamlessly, and leave multi-category feedback.'
    }
  ];

  return (
    <div className="bg-white min-h-screen text-gray-900 selection:bg-primary/20 selection:text-primary">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-32 bg-gradient-to-b from-blue-50/60 via-white to-gray-50/30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <motion.div 
              className="lg:col-span-7 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm font-bold border border-blue-200 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                Real-Time Queue & Appointment Management Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.12]">
                Skip the waiting. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800">
                  Join the queue.
                </span> <br />
                Get served smarter.
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl font-normal leading-relaxed">
                Connects <strong>Customers</strong>, <strong>Businesses</strong>, <strong>Staff</strong>, and <strong>Administrators</strong> into one intelligent, live synchronized ecosystem. No physical crowds, no uncertain waits.
              </p>

              {/* Instant Search Bar */}
              <form onSubmit={handleSearch} className="pt-2 max-w-xl">
                <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-200/80 p-2 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                  <div className="pl-3 text-gray-400">
                    <FiSearch className="w-5 h-5 text-blue-600" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search hospital, bank, salon, or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm shrink-0"
                  >
                    <span>Search</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/customer/find"
                  className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm group"
                >
                  <span>Find & Join Queue</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register/business"
                  className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all text-sm"
                >
                  Register Your Business
                </Link>
              </div>

              {/* Live Trust Badges */}
              <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-green-600 w-4 h-4" /> WebSocket Real-Time Sync
                </span>
                <span className="flex items-center gap-1.5">
                  <FiShield className="text-blue-600 w-4 h-4" /> Verification Protected
                </span>
                <span className="flex items-center gap-1.5">
                  <FiClock className="text-purple-600 w-4 h-4" /> Smart Wait Time
                </span>
              </div>
            </motion.div>

            {/* Right Column: Live Interactive Queue Card Simulation */}
            <motion.div 
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-900/10 border border-gray-100 relative overflow-hidden">
                {/* Header of Preview Card */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
                      QL
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base">Metro Health Care</h3>
                      <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> Live Queue Active
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-100">
                    Counter 1 Active
                  </span>
                </div>

                {/* Token Display Grid */}
                <div className="grid grid-cols-2 gap-4 my-5">
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Now Serving</p>
                    <p className="text-3xl sm:text-4xl font-black text-blue-950 font-mono tracking-tight">A-002</p>
                    <p className="text-[11px] font-semibold text-gray-500 mt-1">Counter 1 • Dr. Connor</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Token</p>
                    <p className="text-3xl sm:text-4xl font-black text-indigo-600 font-mono tracking-tight">A-003</p>
                    <p className="text-[11px] font-bold text-indigo-700 mt-1">🎉 You are next in line!</p>
                  </div>
                </div>

                {/* Real-time Queue Status Indicators */}
                <div className="space-y-2.5 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium flex items-center gap-1.5"><FiUsers className="text-blue-600" /> Customers Ahead</span>
                    <span className="font-bold text-gray-900">0 customers</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium flex items-center gap-1.5"><FiClock className="text-blue-600" /> Est. Waiting Time</span>
                    <span className="font-bold text-green-700">~ 2 mins</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium flex items-center gap-1.5"><FiShield className="text-blue-600" /> Verification Status</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1"><FiCheckCircle /> Approved</span>
                  </div>
                </div>

                {/* Action button inside card */}
                <div className="mt-5">
                  <Link
                    to="/customer/queue"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all"
                  >
                    <FiActivity />
                    <span>View Live Queue Dashboard</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. DEMO ACCOUNTS QUICK-START CALLOUT */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-700">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider border border-blue-500/30">
                Ready-To-Use Demo Accounts
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Test all 4 roles instantly with MongoDB
              </h2>
              <p className="text-slate-400 text-sm max-w-xl">
                The database is connected to local MongoDB (<code>localhost:27017/queueless</code>) with pre-seeded demonstration accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              {/* Admin Card */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 text-xs space-y-1">
                <p className="font-extrabold text-amber-400 flex items-center gap-1">👑 Super Admin</p>
                <p className="text-slate-300 font-mono text-[11px]">admin@queueless.com</p>
                <p className="text-slate-400 font-mono text-[11px]">password123</p>
                <Link to="/login" className="block text-center pt-2 font-bold text-blue-400 hover:text-blue-300">
                  Login Admin →
                </Link>
              </div>

              {/* Business Card */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 text-xs space-y-1">
                <p className="font-extrabold text-indigo-400 flex items-center gap-1">🏢 Business Admin</p>
                <p className="text-slate-300 font-mono text-[11px]">business@queueless.com</p>
                <p className="text-slate-400 font-mono text-[11px]">password123</p>
                <Link to="/login" className="block text-center pt-2 font-bold text-blue-400 hover:text-blue-300">
                  Login Business →
                </Link>
              </div>

              {/* Customer Card */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 text-xs space-y-1">
                <p className="font-extrabold text-emerald-400 flex items-center gap-1">👤 Customer</p>
                <p className="text-slate-300 font-mono text-[11px]">customer@queueless.com</p>
                <p className="text-slate-400 font-mono text-[11px]">password123</p>
                <Link to="/login" className="block text-center pt-2 font-bold text-blue-400 hover:text-blue-300">
                  Login Customer →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 4-ROLES SYSTEM ARCHITECTURE */}
      <section className="py-20 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              One Unified System. Four Dedicated Portals.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600">
              QueueLess coordinates every participant in the service delivery lifecycle through specialized, role-tailored dashboards.
            </p>
            
            {/* Role Switcher Tabs */}
            <div className="inline-flex p-1.5 mt-8 bg-gray-200/80 rounded-2xl gap-1">
              {['customer', 'business', 'staff', 'admin'].map((roleKey) => (
                <button
                  key={roleKey}
                  onClick={() => setSelectedRole(roleKey)}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm capitalize transition-all ${
                    selectedRole === roleKey
                      ? 'bg-white text-gray-900 shadow-md shadow-gray-400/20'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {roleKey}
                </button>
              ))}
            </div>
          </div>

          {/* Active Role Content Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                  {roleData[selectedRole].badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {roleData[selectedRole].title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {roleData[selectedRole].tagline}
                </p>

                <ul className="space-y-3 pt-2">
                  {roleData[selectedRole].features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 font-medium">
                      <FiCheckCircle className="text-blue-600 w-5 h-5 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Link
                    to={roleData[selectedRole].ctaLink}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm"
                  >
                    <span>{roleData[selectedRole].ctaText}</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>

              {/* Feature highlight mockup box */}
              <div className={`rounded-2xl p-8 text-white bg-gradient-to-br ${roleData[selectedRole].bgGrad} shadow-lg flex flex-col justify-between min-h-[320px]`}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold">
                    <FiLayers />
                  </div>
                  <h4 className="text-xl font-black">Intelligent Real-Time Architecture</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Powered by WebSocket bi-directional event broadcast, MongoDB ACID transactions, and sub-second queue index calculation.
                  </p>
                </div>

                <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white/90">
                  <span>QueueLess Core Engine</span>
                  <span className="flex items-center gap-1"><FiActivity /> 100% Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW STEPS (HOW IT WORKS) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">End-to-End Journey</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
              How QueueLess Works
            </h2>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              Four frictionless steps that turn physical chaos into smooth digital efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => (
              <div 
                key={idx}
                className="bg-gray-50/70 hover:bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group"
              >
                <div className="text-3xl font-black text-blue-600/30 group-hover:text-blue-600 transition-colors mb-3">
                  {step.num}
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LIVE PLATFORM METRICS */}
      <section className="py-14 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-5xl font-black mb-1">0 min</p>
              <p className="text-blue-100 text-xs sm:text-sm font-semibold">Physical Standing Time</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black mb-1">100%</p>
              <p className="text-blue-100 text-xs sm:text-sm font-semibold">Real-Time Sync</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black mb-1">4.9★</p>
              <p className="text-blue-100 text-xs sm:text-sm font-semibold">Customer Satisfaction</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black mb-1">24/7</p>
              <p className="text-blue-100 text-xs sm:text-sm font-semibold">Online Booking Ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Ready to eliminate waiting lines forever?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            Join thousands of satisfied customers and high-efficiency businesses using QueueLess today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/customer/find"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm"
            >
              Get Started as Customer
            </Link>
            <Link
              to="/register/business"
              className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold px-8 py-4 rounded-xl shadow-sm transition-all text-sm"
            >
              Register Your Business
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
