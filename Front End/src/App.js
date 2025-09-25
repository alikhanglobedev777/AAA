import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { SocketProvider } from './context/SocketContext';
import { PrivateRoute } from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Loading from './components/Loading';
import './App.css';

const SignupSuccess = () => {
  const msg = typeof window !== 'undefined' ? (sessionStorage.getItem('sp_signup_success') || 'Registration successful! Please check your email to verify your account before you can login.') : '';
  return (
    <div style={{ maxWidth: 680, margin: '40px auto', padding: '20px', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
      <h2 style={{ marginTop: 0, marginBottom: 8, color: '#065f46' }}>Thank you for registering!</h2>
      <p style={{ color: '#374151' }}>{msg}</p>
      <p style={{ color: '#6b7280' }}>You can login after verifying your email. If you didn’t receive the email, please check your spam folder.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <a href="/business/login" className="btn btn-primary" style={{ padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', textDecoration: 'none' }}>Go to Login</a>
        <a href="/home" className="btn" style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', textDecoration: 'none' }}>Back to Home</a>
      </div>
    </div>
  );
};

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const BusinessDirectory = lazy(() => import('./pages/BusinessDirectory'));
const ServiceProviders = lazy(() => import('./pages/ServiceProviders'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ClientLogin = lazy(() => import('./pages/Login'));
const ServiceProviderLogin = lazy(() => import('./pages/ServiceProviderLogin'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const WriteReview = lazy(() => import('./pages/WriteReview'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ServiceProviderSignup = lazy(() => import('./pages/ServiceProviderSignup'));
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));
const BusinessProfileEdit = lazy(() => import('./pages/BusinessProfileEdit'));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const ComplaintPage = lazy(() => import('./pages/ComplaintPage'));
const Inbox = lazy(() => import('./components/Inbox'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminPasswordSetup = lazy(() => import('./pages/AdminPasswordSetup'));
const ServiceCategories = lazy(() => import('./pages/ServiceCategories'));


// Guest route component to redirect authenticated users
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    // Always redirect to home page for all authenticated users
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const location = useLocation();
  
  // Check if current route should hide header/footer
  const shouldHideHeaderFooter = () => {
    const path = location.pathname;
    return path.startsWith('/admin') || 
           path.startsWith('/business/dashboard') || 
           path.startsWith('/business-dashboard') ||
           path.startsWith('/business/inbox') ||
           path.startsWith('/edit-business') ||
           path.startsWith('/customer-dashboard');
    // Note: /businesses (business directory) and /business/:businessId (public business profile) 
    // keep header/footer as they are public pages
  };

  const hideHeaderFooter = shouldHideHeaderFooter();
  
  return (
    <div className={`app ${hideHeaderFooter ? 'no-header-footer' : ''}`}>
      {!hideHeaderFooter && <Header />}
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup/success" element={<SignupSuccess />} />
          <Route path="/services" element={<Services />} />
          <Route path="/service-categories" element={<ServiceCategories />} />
          <Route path="/businesses" element={<BusinessDirectory />} />
          <Route path="/service-providers/:serviceId" element={<ServiceProviders />} />
          <Route path="/provider/:serviceId/:providerId" element={<BusinessProfile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          {/* Admin Routes - Must come FIRST to avoid conflicts */}
          <Route path="/admin/setup-password" element={<AdminPasswordSetup />} />
          <Route path="/admin/dashboard" element={
            <AdminPrivateRoute>
              <AdminDashboard />
            </AdminPrivateRoute>
          } />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLogin />} />
          
          <Route path="/reviews" element={<ReviewPage />} />
          <Route path="/complaint" element={<ComplaintPage />} />
          
          {/* Business Profile Routes - Put these last to avoid conflicts */}
          <Route path="/business/:category/:businessSlug" element={<BusinessProfile />} />
          {/* Temporarily disabled catch-all route to fix admin routing */}
          {/* <Route path="/:category/:businessSlug" element={<BusinessProfile />} /> */}
          
          {/* Auth Routes */}
          <Route path="/login" element={
            <GuestRoute>
              <ClientLogin />
            </GuestRoute>
          } />
          <Route path="/service-provider/login" element={
            <GuestRoute>
              <ServiceProviderLogin />
            </GuestRoute>
          } />
          <Route path="/business/login" element={
            <GuestRoute>
              <ServiceProviderLogin />
            </GuestRoute>
          } />
          <Route path="/signup" element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          } />
          <Route path="/service-provider-signup" element={
            <GuestRoute>
              <ServiceProviderSignup />
            </GuestRoute>
          } />
          <Route path="/business-signup" element={
            <GuestRoute>
              <ServiceProviderSignup />
            </GuestRoute>
          } />

          {/* Protected Client Routes */}
          <Route path="/profile" element={
            <PrivateRoute requiredUserType="customer">
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/customer-dashboard" element={
            <PrivateRoute requiredUserType="customer">
              <CustomerDashboard />
            </PrivateRoute>
          } />
          <Route path="/write-review/:providerId" element={
            <PrivateRoute requiredUserType="customer">
              <WriteReview />
            </PrivateRoute>
          } />

          {/* Protected Business Routes */}
          <Route path="/business/dashboard" element={
            <PrivateRoute requiredUserType="business">
              <BusinessDashboard />
            </PrivateRoute>
          } />
          <Route path="/business-dashboard" element={
            <PrivateRoute requiredUserType="business">
              <BusinessDashboard />
            </PrivateRoute>
          } />
          <Route path="/business/profile" element={
            <PrivateRoute requiredUserType="business">
              <BusinessProfile />
            </PrivateRoute>
          } />
          <Route path="/business/inbox" element={
            <PrivateRoute requiredUserType="business">
              <Inbox />
            </PrivateRoute>
          } />
          <Route path="/edit-business/:businessId" element={
            <PrivateRoute requiredUserType="business">
              <BusinessProfileEdit />
            </PrivateRoute>
          } />

          {/* Password Reset Routes */}
          <Route path="/forgot-password" element={
            <GuestRoute>
              <ForgotPassword userType="customer" />
            </GuestRoute>
          } />
          <Route path="/business/forgot-password" element={
            <GuestRoute>
              <ForgotPassword userType="business" />
            </GuestRoute>
          } />
          <Route path="/reset-password" element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          } />
          <Route path="/verify-email" element={
            <GuestRoute>
              <EmailVerification />
            </GuestRoute>
          } />





          {/* 404 Route */}
          <Route path="*" element={<Home/>} />
          </Routes>
        </Suspense>
      </main>
      {!hideHeaderFooter && <Footer />}
      <ToastContainer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AdminProvider>
        <SocketProvider>
          <Router>
            <AppContent />
          </Router>
        </SocketProvider>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;
