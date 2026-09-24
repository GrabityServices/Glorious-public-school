import { Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  Users,
  Award,
  GraduationCap,
  FileText,
  PlusCircle,
  Settings,
  ArrowRight,
  Database,
  CheckCircle2,
  Clock,
  MapPin,
  RotateCw,
  AlertTriangle,
} from "lucide-react";
import styles from "./AdminDashboard.module.css";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useBackendStatus from "@/hooks/useBackendStatus";

export default function AdminDashboard() {
  useDocumentTitle("Dashboard Overview | Glorious Admin");
  const { adminUser } = useAuth();
  const { notices, events, staff, schoolInfo, inquiries } = useData();
  const backendStatus = useBackendStatus();

  // Metrics definition
  const metrics = [
    {
      label: "Active Notices",
      value: notices.length,
      icon: <Bell size={20} />,
      to: "/admin/notices",
      styleClass: styles.metricIndigo,
    },
    {
      label: "School Events",
      value: events.length,
      icon: <Calendar size={20} />,
      to: "/admin/events",
      styleClass: styles.metricEmerald,
    },
    {
      label: "Faculty & Staff",
      value: staff.length,
      icon: <Users size={20} />,
      to: "/admin/staff",
      styleClass: styles.metricAmber,
    },
    {
      label: "Board Pass Rate",
      value: schoolInfo.stats?.[3]?.value || "100%",
      icon: <Award size={20} />,
      to: "/admin/settings",
      styleClass: styles.metricRose,
    },
    {
      label: "Enrolled Students",
      value: schoolInfo.stats?.[1]?.value || "800+",
      icon: <GraduationCap size={20} />,
      to: "/admin/settings",
      styleClass: styles.metricSky,
    },
    {
      label: "Pending Leads",
      value: inquiries.filter((i) => i.status === "Pending").length,
      icon: <FileText size={20} />,
      to: "/admin/admissions",
      styleClass: styles.metricViolet,
    },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      {/* Welcome Card */}
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeText}>
          <h2>Welcome back, {adminUser?.name || "Administrator"}</h2>
          <p>
            You have full administrative authority over the Glorious Public School website content and admission leads.
          </p>
        </div>
        <div className={styles.systemPill}>
          <span className={styles.pulseDot} />
          <span>System Online • Local Sync Active</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            to={metric.to}
            className={`${styles.metricCard} ${metric.styleClass}`}
          >
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon}>{metric.icon}</div>
              <ArrowRight size={16} color="#64748b" />
            </div>
            <div>
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={styles.metricLabel}>{metric.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Quick Management Actions</h3>
        </div>
        <div className={styles.quickActionsGrid}>
          <Link to="/admin/notices?action=new" className={styles.actionBtn}>
            <PlusCircle size={20} className={styles.actionIcon} />
            <span>Publish New Notice</span>
          </Link>
          <Link to="/admin/events?action=new" className={styles.actionBtn}>
            <Calendar size={20} className={styles.actionIcon} />
            <span>Add School Event</span>
          </Link>
          <Link to="/admin/staff?action=new" className={styles.actionBtn}>
            <Users size={20} className={styles.actionIcon} />
            <span>Add Teacher Profile</span>
          </Link>
          <Link to="/admin/settings" className={styles.actionBtn}>
            <Settings size={20} className={styles.actionIcon} />
            <span>Update School Stats</span>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recent Circulars & Upcoming Events */}
      <div className={styles.columnsGrid}>
        {/* Recent Circulars */}
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <h3 className={styles.widgetTitle}>
              <Bell size={18} color="#dc2626" />
              <span>Latest Circulars</span>
            </h3>
            <Link to="/admin/notices" className={styles.widgetLink}>
              <span>Manage All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.widgetList}>
            {notices.slice(0, 3).map((notice) => (
              <div key={notice.id} className={styles.widgetItem}>
                <div className={styles.itemInfo}>
                  <h4>{notice.title}</h4>
                  <div className={styles.itemMeta}>
                    <span className={styles.categoryTag}>{notice.category}</span>
                    <span>{notice.date}</span>
                    <span>by {notice.author}</span>
                  </div>
                </div>
                {notice.isImportant && (
                  <span className={styles.itemBadge}>Important</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <h3 className={styles.widgetTitle}>
              <Calendar size={18} color="#dc2626" />
              <span>Featured School Events</span>
            </h3>
            <Link to="/admin/events" className={styles.widgetLink}>
              <span>Manage All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.widgetList}>
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className={styles.widgetItem}>
                <div className={styles.itemInfo}>
                  <h4>{event.title}</h4>
                  <div className={styles.itemMeta}>
                    <span className={styles.categoryTag}>{event.category}</span>
                    <span>
                      <Clock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                      {event.date}
                    </span>
                    <span>
                      <MapPin size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                      {event.venue ? event.venue.split(",")[0] : "Campus"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Database Readiness & Live Cluster Status Card */}
      <div
        className={`${styles.dbCard} ${
          backendStatus.connected
            ? styles.dbCardConnected
            : backendStatus.serverOnline
            ? styles.dbCardWarning
            : ""
        }`}
      >
        <div className={styles.dbInfo}>
          <h3>
            <Database size={18} />
            <span>
              {backendStatus.connected
                ? "Database Status: MongoDB Atlas Cluster Connected"
                : backendStatus.serverOnline
                ? "Database Status: MongoDB Disconnected / Pending"
                : "Storage Architecture: Local Storage Store Active"}
            </span>
          </h3>
          <p>
            {backendStatus.connected
              ? `Connected to MongoDB Atlas cluster (${backendStatus.host}). Database '${backendStatus.database || "glorious_school"}' is live and synced. Browser cache serves as instant offline fallback.`
              : backendStatus.serverOnline
              ? `${backendStatus.message}. Please check your credentials in backend/.env.`
              : "All administrative changes are cached in browser storage. Start the backend server with 'npm start' to enable live MongoDB Atlas synchronization."}
          </p>
        </div>
        <div
          className={`${styles.dbStatusPill} ${
            backendStatus.connected
              ? styles.dbStatusPillConnected
              : backendStatus.serverOnline
              ? styles.dbStatusPillWarning
              : ""
          }`}
        >
          {backendStatus.connected ? (
            <>
              <CheckCircle2 size={16} />
              <span>MongoDB Connected</span>
            </>
          ) : backendStatus.serverOnline ? (
            <>
              <AlertTriangle size={16} />
              <span>Check .env Config</span>
            </>
          ) : (
            <>
              <Database size={16} />
              <span>Local Store Active</span>
            </>
          )}
          <button
            type="button"
            className={`${styles.refreshBtn} ${backendStatus.loading ? styles.refreshBtnSpinning : ""}`}
            onClick={backendStatus.refresh}
            title="Check connection now"
            aria-label="Refresh database connection status"
          >
            <RotateCw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
