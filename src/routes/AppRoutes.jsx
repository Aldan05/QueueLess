import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import PublicLayout from '../layouts/PublicLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import BusinessLayout from '../layouts/BusinessLayout';
import AdminLayout from '../layouts/AdminLayout';
import PlaceholderPage from '../components/common/PlaceholderPage';
import Login from '../pages/auth/Login';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerNotifications from '../pages/customer/CustomerNotifications';
import CustomerProfile from '../pages/customer/CustomerProfile';
import CustomerSettings from '../pages/customer/CustomerSettings';
import CustomerFind from '../pages/customer/CustomerFind';
import CustomerQueue from '../pages/customer/CustomerQueue';
import CustomerAppointments from '../pages/customer/CustomerAppointments';
import CustomerHistory from '../pages/customer/CustomerHistory';
import CustomerBusinessDetails from '../pages/customer/CustomerBusinessDetails';
import CustomerSupport from '../pages/customer/CustomerSupport';
import BusinessDashboard from '../pages/business/BusinessDashboard';
import BusinessQueue from '../pages/business/BusinessQueue';
import BusinessAnnouncements from '../pages/business/BusinessAnnouncements';
import BusinessDocuments from '../pages/business/BusinessDocuments';
import BusinessProfile from '../pages/business/BusinessProfile';
import BusinessStaff from '../pages/business/BusinessStaff';
import BusinessAddStaff from '../pages/business/BusinessAddStaff';
import BusinessSupport from '../pages/business/BusinessSupport';
import BusinessAnalytics from '../pages/business/BusinessAnalytics';
import BusinessCustomers from '../pages/business/BusinessCustomers';
import BusinessAppointments from '../pages/business/BusinessAppointments';
import BusinessReviews from '../pages/business/BusinessReviews';
import BusinessSettings from '../pages/business/BusinessSettings';

import BusinessNotifications from '../pages/business/BusinessNotifications';

// Staff Pages
import StaffLogin from '../pages/staff/StaffLogin';
import StaffLayout from '../layouts/StaffLayout';
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffQueue from '../pages/staff/StaffQueue';
import StaffProfile from '../pages/staff/StaffProfile';
import StaffSettings from '../pages/staff/StaffSettings';
import StaffCustomers from '../pages/staff/StaffCustomers';
import StaffSchedule from '../pages/staff/StaffSchedule';
import StaffNotifications from '../pages/staff/StaffNotifications';
import StaffVerifyQR from '../pages/staff/StaffVerifyQR';
import StaffAppointments from '../pages/staff/StaffAppointments';

import Features from '../pages/public/Features';
import Pricing from '../pages/public/Pricing';
import Business from '../pages/public/Business';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Careers from '../pages/public/Careers';
import Privacy from '../pages/public/Privacy';
import Terms from '../pages/public/Terms';
import Help from '../pages/public/Help';
import FAQ from '../pages/public/FAQ';
import Blog from '../pages/public/Blog';

// Admin imports
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminVerification from '../pages/admin/AdminVerification';
import AdminBusinesses from '../pages/admin/AdminBusinesses';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminAnnouncements from '../pages/admin/AdminAnnouncements';
import AdminLogs from '../pages/admin/AdminLogs';
import AdminDocuments from '../pages/admin/AdminDocuments';
import AdminComplaints from '../pages/admin/AdminComplaints';
import AdminProfile from '../pages/admin/AdminProfile';
import AdminSettings from '../pages/admin/AdminSettings';

import { 
  FiSearch, FiList, FiCalendar, FiClock, 
  FiHeart, FiBell, FiUser, FiSettings,
  FiUsers, FiUserCheck, FiBriefcase, FiPieChart, 
  FiStar, FiRadio, FiFolder, FiHelpCircle,
  FiShield, FiAlertCircle, FiActivity
} from 'react-icons/fi';
import EmptyStatePage from '../components/common/EmptyStatePage';

import Register from '../pages/auth/Register';
import BusinessRegistration from '../pages/auth/BusinessRegistration';
import ForgotPassword from '../pages/auth/ForgotPassword';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PlaceholderPage title="Home Page" />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/business" element={<Business />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/help" element={<Help />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/api-docs" element={<PlaceholderPage title="Developer API" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/business" element={<BusinessRegistration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<PlaceholderPage title="Unauthorized Access" />} />
      </Route>

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/find" element={<CustomerFind />} />
          <Route path="/customer/business/:id" element={<CustomerBusinessDetails />} />
          <Route path="/customer/queue" element={<CustomerQueue />} />
          <Route path="/customer/appointments" element={<CustomerAppointments />} />
          <Route path="/customer/history" element={<CustomerHistory />} />
          <Route path="/customer/notifications" element={<CustomerNotifications />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/settings" element={<CustomerSettings />} />
          <Route path="/customer/support" element={<CustomerSupport />} />
        </Route>
      </Route>

      {/* Business Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Business']} />}>
        <Route element={<BusinessLayout />}>
          <Route path="/business/dashboard" element={<BusinessDashboard />} />
          <Route path="/business/queue" element={<BusinessQueue />} />
          <Route path="/business/customers" element={<BusinessCustomers />} />
          <Route path="/business/appointments" element={<BusinessAppointments />} />
          <Route path="/business/staff" element={<BusinessStaff />} />
          <Route path="/business/staff/add" element={<BusinessAddStaff />} />
          <Route path="/business/profile" element={<BusinessProfile />} />
          <Route path="/business/reports" element={<BusinessAnalytics />} />
          <Route path="/business/reviews" element={<BusinessReviews />} />
          <Route path="/business/announcements" element={<BusinessAnnouncements />} />
          <Route path="/business/verification" element={<BusinessDocuments />} />
          <Route path="/business/settings" element={<BusinessSettings />} />
          <Route path="/business/support" element={<BusinessSupport />} />
          <Route path="/business/notifications" element={<BusinessNotifications />} />
          <Route path="/business/counters" element={<Navigate to="/business/dashboard" replace />} />
        </Route>
      </Route>

      {/* Staff Routes */}
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/staff" element={<StaffLayout />}>
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="queue" element={<StaffQueue />} />
        <Route path="profile" element={<StaffProfile />} />
        <Route path="settings" element={<StaffSettings />} />
        <Route path="customers" element={<StaffCustomers />} />
        <Route path="schedule" element={<StaffSchedule />} />
        <Route path="notifications" element={<StaffNotifications />} />
        <Route path="verify-qr" element={<StaffVerifyQR />} />
        <Route path="appointments" element={<StaffAppointments />} />
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Super Admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/verification" element={<AdminVerification />} />
          <Route path="/admin/businesses" element={<AdminBusinesses />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<PlaceholderPage title="404 Not Found" />} />
    </Routes>
  );
};

export default AppRoutes;
