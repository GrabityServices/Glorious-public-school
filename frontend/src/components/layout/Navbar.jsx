import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap, Award, Phone } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./Navbar.module.css";
import { easeCalm } from "@/lib/motion/easing";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function Navbar({ isScrolled }) {
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
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeScrolled = isScrolled !== undefined ? isScrolled : scrolled;

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Academics", href: "/academics" },
    { name: "Facilities", href: "/facilities" },
    { name: "Events", href: "/events" },
    { name: "Calendar", href: "/calendar" },
    { name: "Gallery", href: "/gallery" },
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
    <div className={`${styles.header} ${activeScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* School Logo & Title */}
        <Link to="/" className={styles.brand}>
          <img
            src="/images/glorious-public-school-logo.png"
            alt="Glorious Public School Logo"
            className={styles.logoImg}
          />
          <div className={styles.brandInfo}>
            <span className={styles.brandTitle}>Glorious Public School</span>
            <span className={styles.brandSub}>KOLTEX • JHAJHA (BIHAR)</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <span className={styles.navLabel}>{link.name}</span>
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

        {/* Header CTA */}
        <div className={styles.ctaGroup}>
          <Link
            to="/admissions"
            className={`btn btn-gold btn-sm ${styles.navApplyBtn} ${
              pathname === "/admissions" ? styles.applyBtnActive : ""
            }`}
          >
            <span>Apply Now</span>
            <Award size={16} strokeWidth={2.2} className={styles.navApplyIcon} />
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
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <m.div key={link.name} variants={mobileLinkVariants}>
                    <Link
                      to={link.href}
                      className={`${styles.mobileLink} ${isActive ? styles.mobileActive : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className={styles.mobileLinkLabel}>{link.name}</span>
                      {isActive ? (
                        <span className={styles.activePip} />
                      ) : (
                        <span className={styles.inactiveArrow}>›</span>
                      )}
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
                  <Award size={18} strokeWidth={2.2} />
                  <span>Apply for Online Admission</span>
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
    </div>
  );
}
