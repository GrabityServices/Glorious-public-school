import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";

import Home from "@/pages/home/Home";
import About from "@/pages/about/About";
import Academics from "@/pages/academics/Academics";
import Admissions from "@/pages/admissions/Admissions";
import Facilities from "@/pages/facilities/Facilities";
import Events from "@/pages/events/Events";
import EventDetail from "@/pages/events/EventDetail";
import News from "@/pages/news/News";
import Gallery from "@/pages/gallery/Gallery";
import Staff from "@/pages/staff/Staff";
import Holiday from "@/pages/holiday/Holiday";
import Calendar from "@/pages/calendar/Calendar";
import Faq from "@/pages/faq/Faq";
import Contact from "@/pages/contact/Contact";
import Login from "@/pages/login/Login";
import Privacy from "@/pages/privacy/Privacy";
import Terms from "@/pages/terms/Terms";
import NotFound from "@/pages/not-found/NotFound";

// Admin Panel Components
import AdminProtectedRoute from "@/routes/AdminProtectedRoute";
import AdminLayout from "@/pages/admin/layout/AdminLayout";
import AdminLogin from "@/pages/admin/login/AdminLogin";
import AdminDashboard from "@/pages/admin/dashboard/AdminDashboard";
import AdminNotices from "@/pages/admin/notices/AdminNotices";
import AdminEvents from "@/pages/admin/events/AdminEvents";
import AdminStaff from "@/pages/admin/staff/AdminStaff";
import AdminGallery from "@/pages/admin/gallery/AdminGallery";
import AdminAdmissions from "@/pages/admin/admissions/AdminAdmissions";
import AdminSettings from "@/pages/admin/settings/AdminSettings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public School Website Pages */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="academics" element={<Academics />} />
        <Route path="admissions" element={<Admissions />} />
        <Route path="admission" element={<Navigate to="/admissions" replace />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="news" element={<News />} />
        <Route path="notice" element={<Navigate to="/news" replace />} />
        <Route path="notices" element={<Navigate to="/news" replace />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="galleries" element={<Navigate to="/gallery" replace />} />
        <Route path="staff" element={<Staff />} />
        <Route path="teachers" element={<Navigate to="/staff" replace />} />
        <Route path="holiday" element={<Holiday />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="calendars" element={<Navigate to="/calendar" replace />} />
        <Route path="academic-calendar" element={<Navigate to="/calendar" replace />} />
        <Route path="faq" element={<Faq />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
      </Route>

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Panel */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="admissions" element={<AdminAdmissions />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
