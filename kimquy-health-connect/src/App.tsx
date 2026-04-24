import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import ServicesPage from './pages/ServicesPage';
import { BlogListPage, BlogDetailPage } from './pages/BlogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaymentCheckoutPage from './pages/payment/PaymentCheckoutPage';
import PaymentResultPage from './pages/payment/PaymentResultPage';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookingPage from './pages/patient/BookingPage';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientProfile from './pages/patient/PatientProfile';
import PatientReviews from './pages/patient/PatientReviews';
import PatientNotifications from './pages/patient/PatientNotifications';
import PatientAppointmentDetail from './pages/patient/PatientAppointmentDetail';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientMedicalRecordDetail from './pages/patient/PatientMedicalRecordDetail';
import PatientTreatment from './pages/patient/PatientTreatment';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorStats from './pages/doctor/DoctorStats';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminSpecialties from './pages/admin/AdminSpecialties';
import AdminServices from './pages/admin/AdminServices';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminContent from './pages/admin/AdminContent';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminBanners from './pages/admin/AdminBanners';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

import NotFound from './pages/NotFound';

const App = () => (
  <BrowserRouter>
    <Toaster position="top-right" richColors closeButton />
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/blog" element={<BlogListPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/payment/checkout" element={<PaymentCheckoutPage />} />
      <Route path="/payment/success" element={<PaymentResultPage mode="success" />} />
      <Route path="/payment/cancel" element={<PaymentResultPage mode="cancel" />} />

      {/* Patient */}
      <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/booking" element={<BookingPage />} />
      <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientAppointments /></ProtectedRoute>} />
      <Route path="/patient/appointments/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientAppointmentDetail /></ProtectedRoute>} />
      <Route path="/patient/medical-records" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientMedicalRecords /></ProtectedRoute>} />
      <Route path="/patient/medical-records/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientMedicalRecordDetail /></ProtectedRoute>} />
      <Route path="/patient/treatment" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientTreatment /></ProtectedRoute>} />
      <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientProfile /></ProtectedRoute>} />
      <Route path="/patient/reviews" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientReviews /></ProtectedRoute>} />
      <Route path="/patient/notifications" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientNotifications /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorSchedule /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorAppointments /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorPatients /></ProtectedRoute>} />
      <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorProfile /></ProtectedRoute>} />
      <Route path="/doctor/stats" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorStats /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDoctors /></ProtectedRoute>} />
      <Route path="/admin/specialties" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSpecialties /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminServices /></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAppointments /></ProtectedRoute>} />
      <Route path="/admin/content" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminContent /></ProtectedRoute>} />
      <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReviews /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminNotifications /></ProtectedRoute>} />
      <Route path="/admin/banners" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminBanners /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAuditLogs /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
