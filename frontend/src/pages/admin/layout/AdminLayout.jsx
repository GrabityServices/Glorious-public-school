import { useState } from "react";
import { Outlet, NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Database,
  Image as ImageIcon,
} from "lucide-react";
import styles from "./AdminLayout.module.css";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import useBackendStatus from "@/hooks/useBackendStatus";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { adminUser, logout } = useAuth();
  const { notices, events, staff, inquiries, gallery } = useData();
  const backendStatus = useBackendStatus();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/admin/login", { replace: true });
  };

  const navItems = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      color: "blue",
      end: true,
    },
    {
      to: "/admin/notices",
      label: "Notices & News",
      icon: <Bell size={18} />,
      color: "red",
      badge: notices.length,
    },
    {
      to: "/admin/events",
      label: "School Events",
      icon: <Calendar size={18} />,
      color: "amber",
      badge: events.length,
    },
    {
      to: "/admin/staff",
      label: "Faculty & Staff",
      icon: <Users size={18} />,
      color: "emerald",
      badge: staff.length,
    },
    {
      to: "/admin/gallery",
      label: "Photo Gallery",
      icon: <ImageIcon size={18} />,
      color: "purple",
      badge: gallery?.length || 0,
    },
    {
      to: "/admin/admissions",
      label: "Inquiries & Leads",
      icon: <FileText size={18} />,
      color: "rose",
      badge: inquiries.filter((i) => i.status === "Pending").length,
    },
    {
      to: "/admin/settings",
      label: "School Settings",
      icon: <Settings size={18} />,
      color: "teal",
    },
  ];

  // Derive page heading based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") return "Admin Dashboard";
    if (path.startsWith("/admin/notices")) return "Notices & Circulars Manager";
    if (path.startsWith("/admin/events")) return "School Events & Competitions";
    if (path.startsWith("/admin/staff")) return "Faculty & Staff Directory";
    if (path.startsWith("/admin/gallery")) return "Photo Gallery & Media Manager";
    if (path.startsWith("/admin/admissions")) return "Admissions & Inquiries";
    if (path.startsWith("/admin/settings")) return "School Information & Stats";
    return "Admin Portal";
  };

  return (
    <div className={styles.adminWrapper}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarBrand}>
          <img
            src="/images/glorious-public-school-logo.png"
            alt="Glorious Public School Logo"
            className={styles.brandLogoImg}
          />
          <div className={styles.brandInfo}>
            <h2>Glorious Public</h2>
            <span>Admin Portal</span>
          </div>
          <button
            type="button"
            className={styles.closeSidebarBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>Management</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""} ${styles[`navLink_${item.color}`] || ""}`
              }
            >
              <span className={`${styles.navIconBox} ${styles[`iconBox_${item.color}`] || ""}`}>
                {item.icon}
              </span>
              <span className={styles.navLabelText}>{item.label}</span>
              {typeof item.badge !== "undefined" && item.badge > 0 && (
                <span
                  className={`${styles.navBadge} ${
                    location.pathname === item.to ? styles.navBadgeActive : styles[`badge_${item.color}`] || ""
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className={styles.userCard}>
          {adminUser?.avatar ? (
            <img
              src={adminUser.avatar}
              alt={adminUser.name}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarFallback}>
              {adminUser?.name ? adminUser.name.charAt(0) : "A"}
            </div>
          )}
          <div className={styles.userDetails}>
            <p className={styles.userName}>{adminUser?.name || "Administrator"}</p>
            <span className={styles.userRole}>
              <span className={styles.onlineDot} /> {adminUser?.role || "Super Admin"}
            </span>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogoutClick}
            title="Logout from Admin"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContainer}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.mobileMenuBtn}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div className={styles.pageHeading}>
              <h1>{getPageTitle()}</h1>
            </div>
          </div>

          <div className={styles.topbarRight}>
            {backendStatus.connected ? (
              <button
                type="button"
                className={`${styles.modeBadge} ${styles.modeBadgeConnected}`}
                title={`MongoDB Atlas Connected: ${backendStatus.host || ""} (${backendStatus.database || "glorious_school"}) - Click to refresh`}
                onClick={backendStatus.refresh}
              >
                <span className={styles.pulseDotGreen} />
                <span>🍃 MongoDB Connected</span>
              </button>
            ) : backendStatus.serverOnline ? (
              <button
                type="button"
                className={`${styles.modeBadge} ${styles.modeBadgeWarning}`}
                title={`MongoDB Disconnected: ${backendStatus.message} - Click to retry`}
                onClick={backendStatus.refresh}
              >
                <span className={styles.pulseDotAmber} />
                <span>⚠️ MongoDB Disconnected</span>
              </button>
            ) : (
              <button
                type="button"
                className={`${styles.modeBadge} ${styles.modeBadgeOffline}`}
                title="Backend server offline. Running on Local Browser Store. Run 'npm start' to connect MongoDB."
                onClick={backendStatus.refresh}
              >
                <Database size={13} />
                <span>Local Store Active</span>
              </button>
            )}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.liveSiteBtn}
              title="Open public website in a new tab"
            >
              <span>View Live Site</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className={styles.contentWrapper}>
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className={styles.logoutModalBackdrop}
          onClick={() => setShowLogoutConfirm(false)}
          data-lenis-prevent="true"
        >
          <div
            className={styles.logoutModalCard}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <div className={styles.logoutIconWrap}>
              <LogOut size={26} />
            </div>
            <h3 className={styles.logoutModalTitle}>Confirm Sign Out</h3>
            <p className={styles.logoutModalDesc}>
              Are you sure you want to log out of the Glorious Public School Admin Portal? You will need your administrator credentials to sign in again.
            </p>
            <div className={styles.logoutModalActions}>
              <button
                type="button"
                className={styles.logoutCancelBtn}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Stay Signed In
              </button>
              <button
                type="button"
                className={styles.logoutConfirmBtn}
                onClick={handleConfirmLogout}
              >
                <LogOut size={16} />
                <span>Yes, Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
