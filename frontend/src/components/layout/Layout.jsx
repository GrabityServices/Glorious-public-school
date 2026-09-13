import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopHeader from "./TopHeader";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "@/components/motion/PageTransition";
import styles from "./Layout.module.css";

export default function Layout() {
  const location = useLocation();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeight();

    let observer;
    if (typeof window !== "undefined" && window.ResizeObserver && headerRef.current) {
      observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(headerRef.current);
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateHeight);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div className={styles.layoutWrapper}>
      {/* Fixed Header Section (TopHeader + Navbar) */}
      <header
        ref={headerRef}
        className={`${styles.fixedHeader} ${scrolled ? styles.scrolled : ""}`}
      >
        <TopHeader />
        <Navbar isScrolled={scrolled} />
      </header>

      {/* Spacer to preserve normal document flow and prevent overlap */}
      <div
        className={styles.headerSpacer}
        style={{ height: headerHeight ? `${headerHeight}px` : "104px" }}
        aria-hidden="true"
      />

      <main className={styles.mainContent}>
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}

