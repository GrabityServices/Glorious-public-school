import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap, Award, Phone } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./Navbar.module.css";
import { easeCalm } from "@/lib/motion/easing";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Academics", href: "/academics" },
    { name: "Admissions", href: "/admissions" },
    { name: "Facilities", href: "/facilities" },
    { name: "Events", href: "/events" },
    { name: "Gallery", href: "/gallery" },
    { name: "Staff", href: "/staff" },
    { name: "Notice", href: "/news" },
    { name: "Contact", href: "/contact" },
  ];

  const mobileDrawerVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.35,
        ease: easeCalm,
        staggerChildren: 0.05,
        delayChildren: 0.08,
      },
    },
    exit: {
      y: -30,
      opacity: 0,
      transition: {
        duration: 0.25,
        ease: easeCalm,
      },
    },
  };

  const mobileLinkVariants = {
    hidden: { x: -16, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: easeCalm },
    },
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* School Logo & Title */}
        <Link to="/" className={styles.brand}>
          <div className={styles.logoBadge}>
            <GraduationCap size={26} className={styles.logoIcon} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.schoolName}>Glorious Public School</span>
            <span className={styles.schoolSubtext}>NURSERY TO CLASS 10TH • JHAJHA, BIHAR</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                {link.name}
                {isActive && (
                  <m.div
                    layoutId="activeNavPill"
                    className={styles.activePill}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Header CTA */}
        <div className={styles.ctaGroup}>
          <Link to="/admissions" className="btn btn-gold btn-sm">
            <span>Apply Now</span>
            <Award size={15} />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={styles.mobileMenuBtn}
            aria-label="Toggle school navigation menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            variants={mobileDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={styles.mobileDrawer}
          >
            <div className={styles.mobileLinksList}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <m.div key={link.name} variants={mobileLinkVariants}>
                    <Link
                      to={link.href}
                      className={`${styles.mobileLink} ${isActive ? styles.mobileActive : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{link.name}</span>
                      {isActive && <div className={styles.mobileDot} />}
                    </Link>
                  </m.div>
                );
              })}

              <m.div variants={mobileLinkVariants} className={styles.mobileCtaWrapper}>
                <Link
                  to="/admissions"
                  className="btn btn-gold"
                  style={{ width: "100%" }}
                  onClick={() => setIsOpen(false)}
                >
                  <Award size={16} />
                  <span>Apply for Admission (Nursery - 10th)</span>
                </Link>
                <a
                  href={`tel:${SCHOOL_INFO.phone}`}
                  className="btn btn-secondary"
                  style={{ width: "100%", marginTop: "8px" }}
                >
                  <Phone size={16} />
                  <span>Call Us: {SCHOOL_INFO.phone}</span>
                </a>
              </m.div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
