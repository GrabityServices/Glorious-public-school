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
import Faq from "@/pages/faq/Faq";
import Contact from "@/pages/contact/Contact";
import Login from "@/pages/login/Login";
import Privacy from "@/pages/privacy/Privacy";
import Terms from "@/pages/terms/Terms";
import NotFound from "@/pages/not-found/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Core School Pages */}
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
        <Route path="faq" element={<Faq />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
