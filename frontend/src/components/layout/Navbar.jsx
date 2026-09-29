import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Award, Phone, ChevronDown, Bell, ArrowRight, Users } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./Navbar.module.css";
import { easeCalm } from "@/lib/motion/easing";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function Navbar({ isScrolled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isEventsPopupOpen, setIsEventsPopupOpen] = useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false);
  const [isAboutPopupOpen, setIsAboutPopupOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const eventsCloseTimeoutRef = useRef(null);
  const aboutCloseTimeoutRef = useRef(null);
  const { pathname } = useLocation();

  const handleEventsMouseEnter = () => {
    if (eventsCloseTimeoutRef.current) {
      clearTimeout(eventsCloseTimeoutRef.current);
      eventsCloseTimeoutRef.current = null;
    }
    setIsEventsPopupOpen(true);
  };

  const handleEventsMouseLeave = () => {
    eventsCloseTimeoutRef.current = setTimeout(() => {
      setIsEventsPopupOpen(false);
    }, 180);
  };

  const handleAboutMouseEnter = () => {
    if (aboutCloseTimeoutRef.current) {
      clearTimeout(aboutCloseTimeoutRef.current);
      aboutCloseTimeoutRef.current = null;
    }
    setIsAboutPopupOpen(true);
  };

  const handleAboutMouseLeave = () => {
    aboutCloseTimeoutRef.current = setTimeout(() => {
      setIsAboutPopupOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (eventsCloseTimeoutRef.current) clearTimeout(eventsCloseTimeoutRef.current);
      if (aboutCloseTimeoutRef.current) clearTimeout(aboutCloseTimeoutRef.current);
    };
  }, []);

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

  // Close mobile drawer & popups on route change
  useEffect(() => {
    setIsOpen(false);
    setIsEventsPopupOpen(false);
    setMobileEventsOpen(false);
    setIsAboutPopupOpen(false);
    setMobileAboutOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Academics", href: "/academics" },
    { name: "Facilities", href: "/facilities" },
    { name: "Calendar", href: "/calendar" },
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Events", href: "/events" },
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
            src="/images/glorious-public-school.png"
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

            if (link.name === "About") {
              const isAboutActive =
                isActive || pathname === "/staff" || pathname.startsWith("/staff/");
              return (
                <div
                  key={link.name}
                  className={styles.dropdownWrapper}
                  onMouseEnter={handleAboutMouseEnter}
                  onMouseLeave={handleAboutMouseLeave}
                >
                  <Link
                    to={link.href}
                    className={`${styles.navItem} ${styles.dropdownTrigger} ${
                      isAboutActive || isAboutPopupOpen ? styles.active : ""
                    }`}
                    onClick={() => setIsAboutPopupOpen(false)}
                  >
                    <span className={styles.navLabel}>{link.name}</span>
                    <m.span
                      className={`${styles.chevronBadge} ${
                        isAboutPopupOpen ? styles.chevronBadgeOpen : ""
                      }`}
                      animate={{ rotate: isAboutPopupOpen ? 180 : 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ChevronDown
                        size={11}
                        strokeWidth={2.6}
                        className={styles.navChevron}
                      />
                    </m.span>
                    {isAboutActive && (
                      <m.div
                        layoutId="activeNavPill"
                        className={styles.activePill}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Clean Dropdown with Staff link */}
                  <AnimatePresence>
                    {isAboutPopupOpen && (
                      <m.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: "top center" }}
                        className={styles.simpleDropdown}
                      >
                        <Link
                          to="/staff"
                          className={styles.simpleDropdownLink}
                          onClick={() => setIsAboutPopupOpen(false)}
                        >
                          <div className={styles.dropdownLinkContent}>
                            <span className={styles.dropdownIconCircle}>
                              <Users size={14} />
                            </span>
                            <span className={styles.dropdownLinkText}>Staff</span>
                          </div>
                          <ArrowRight size={13} className={styles.dropdownLinkArrow} />
                        </Link>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            if (link.name === "Events") {
              const isEventsActive =
                isActive || pathname === "/news" || pathname.startsWith("/news/");
              return (
                <div
                  key={link.name}
                  className={styles.dropdownWrapper}
                  onMouseEnter={handleEventsMouseEnter}
                  onMouseLeave={handleEventsMouseLeave}
                >
                  <Link
                    to={link.href}
                    className={`${styles.navItem} ${styles.dropdownTrigger} ${
                      isEventsActive || isEventsPopupOpen ? styles.active : ""
                    }`}
                    onClick={() => setIsEventsPopupOpen(false)}
                  >
                    <span className={styles.navLabel}>{link.name}</span>
                    <m.span
                      className={`${styles.chevronBadge} ${
                        isEventsPopupOpen ? styles.chevronBadgeOpen : ""
                      }`}
                      animate={{ rotate: isEventsPopupOpen ? 180 : 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ChevronDown
                        size={11}
                        strokeWidth={2.6}
                        className={styles.navChevron}
                      />
                    </m.span>
                    {isEventsActive && (
                      <m.div
                        layoutId="activeNavPill"
                        className={styles.activePill}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Clean, Premium Dropdown with News link */}
                  <AnimatePresence>
                    {isEventsPopupOpen && (
                      <m.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: "top center" }}
                        className={styles.simpleDropdown}
                      >
                        <Link
                          to="/news"
                          className={styles.simpleDropdownLink}
                          onClick={() => setIsEventsPopupOpen(false)}
                        >
                          <div className={styles.dropdownLinkContent}>
                            <span className={styles.dropdownIconCircle}>
                              <Bell size={14} />
                            </span>
                            <span className={styles.dropdownLinkText}>News</span>
                          </div>
                          <ArrowRight size={13} className={styles.dropdownLinkArrow} />
                        </Link>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

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

                if (link.name === "About") {
                  const isAboutActive =
                    isActive || pathname === "/staff" || pathname.startsWith("/staff/");
                  return (
                    <m.div key={link.name} variants={mobileLinkVariants}>
                      <div className={styles.mobileEventsAccordion}>
                        <div className={styles.mobileEventsHeaderRow}>
                          <Link
                            to={link.href}
                            className={`${styles.mobileLink} ${isAboutActive ? styles.mobileActive : ""}`}
                            onClick={() => setIsOpen(false)}
                            style={{ flex: 1 }}
                          >
                            <span className={styles.mobileLinkLabel}>{link.name}</span>
                            {isAboutActive && <span className={styles.activePip} />}
                          </Link>
                          <button
                            type="button"
                            className={styles.mobileSubToggleBtn}
                            onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                            aria-label="Toggle about sub-menu"
                          >
                            <ChevronDown
                              size={18}
                              className={`${styles.mobileSubChevron} ${
                                mobileAboutOpen ? styles.mobileSubChevronRotated : ""
                              }`}
                            />
                          </button>
                        </div>

                        {mobileAboutOpen && (
                          <div className={styles.mobileSubList}>
                            <Link
                              to="/staff"
                              className={`${styles.mobileSubLink} ${
                                pathname === "/staff" || pathname.startsWith("/staff/")
                                  ? styles.mobileSubLinkHighlight
                                  : ""
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <span>Staff</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </m.div>
                  );
                }

                if (link.name === "Events") {
                  const isEventsActive =
                    isActive || pathname === "/news" || pathname.startsWith("/news/");
                  return (
                    <m.div key={link.name} variants={mobileLinkVariants}>
                      <div className={styles.mobileEventsAccordion}>
                        <div className={styles.mobileEventsHeaderRow}>
                          <Link
                            to={link.href}
                            className={`${styles.mobileLink} ${isEventsActive ? styles.mobileActive : ""}`}
                            onClick={() => setIsOpen(false)}
                            style={{ flex: 1 }}
                          >
                            <span className={styles.mobileLinkLabel}>{link.name}</span>
                            {isEventsActive && <span className={styles.activePip} />}
                          </Link>
                          <button
                            type="button"
                            className={styles.mobileSubToggleBtn}
                            onClick={() => setMobileEventsOpen(!mobileEventsOpen)}
                            aria-label="Toggle events sub-menu"
                          >
                            <ChevronDown
                              size={18}
                              className={`${styles.mobileSubChevron} ${
                                mobileEventsOpen ? styles.mobileSubChevronRotated : ""
                              }`}
                            />
                          </button>
                        </div>

                        {mobileEventsOpen && (
                          <div className={styles.mobileSubList}>
                            <Link
                              to="/news"
                              className={`${styles.mobileSubLink} ${
                                pathname === "/news" || pathname.startsWith("/news/")
                                  ? styles.mobileSubLinkHighlight
                                  : ""
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <span>News</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </m.div>
                  );
                }

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
