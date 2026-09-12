import { Outlet, useLocation } from "react-router-dom";
import TopHeader from "./TopHeader";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "@/components/motion/PageTransition";

export default function Layout() {
  const location = useLocation();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopHeader />
      <Navbar />
      <main style={{ flex: 1 }}>
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
