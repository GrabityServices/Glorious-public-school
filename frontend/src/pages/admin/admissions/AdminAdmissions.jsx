import { useState } from "react";
import { Search, Trash2, CheckCircle, Phone, Mail, Clock, User, Filter } from "lucide-react";
import styles from "./AdminAdmissions.module.css";
import { useData } from "@/context/DataContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function AdminAdmissions() {
  useDocumentTitle("Admissions & Inquiries | Glorious Admin");
  const { inquiries, updateInquiryStatus, deleteInquiry } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus =
      selectedStatus === "All" || inq.status === selectedStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      inq.studentName.toLowerCase().includes(query) ||
      (inq.parentName && inq.parentName.toLowerCase().includes(query)) ||
      (inq.phone && inq.phone.includes(query)) ||
      (inq.gradeApplying && inq.gradeApplying.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (id, newStatus) => {
    updateInquiryStatus(id, newStatus);
    showToast(`Inquiry status updated to "${newStatus}".`);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete inquiry for ${name}?`)) {
      deleteInquiry(id);
      showToast("Inquiry deleted.");
    }
  };

  // Metrics
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter((i) => i.status === "Pending").length;
  const reviewedCount = inquiries.filter((i) => i.status === "Reviewed").length;
  const admittedCount = inquiries.filter((i) => i.status === "Admitted").length;

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Alert */}
      {toast && (
        <div className={styles.toastAlert}>
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Mini Stats Row */}
      <div className={styles.statsRow}>
        <div className={`${styles.statMiniCard} ${styles.statCard_blue}`}>
          <div>
            <div className={styles.statVal}>{totalCount}</div>
            <div className={styles.statLabel}>Total Inquiries</div>
          </div>
        </div>
        <div className={`${styles.statMiniCard} ${styles.statCard_amber}`}>
          <div>
            <div className={styles.statVal}>{pendingCount}</div>
            <div className={styles.statLabel}>Pending Review</div>
          </div>
        </div>
        <div className={`${styles.statMiniCard} ${styles.statCard_indigo}`}>
          <div>
            <div className={styles.statVal}>{reviewedCount}</div>
            <div className={styles.statLabel}>Contacted / Reviewed</div>
          </div>
        </div>
        <div className={`${styles.statMiniCard} ${styles.statCard_emerald}`}>
          <div>
            <div className={styles.statVal}>{admittedCount}</div>
            <div className={styles.statLabel}>Admitted Students</div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className={styles.actionHeader}>
        <div className={styles.controlsRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by student, parent, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.categorySelect}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Admitted">Admitted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Applicant / Student</th>
                <th>Parent & Contact</th>
                <th>Grade</th>
                <th>Message / Query</th>
                <th>Date</th>
                <th>Status Action</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inq) => {
                  let statusClass = styles.statusPending;
                  if (inq.status === "Reviewed") statusClass = styles.statusReviewed;
                  if (inq.status === "Admitted") statusClass = styles.statusAdmitted;
                  if (inq.status === "Rejected") statusClass = styles.statusRejected;

                  return (
                    <tr key={inq.id}>
                      <td className={styles.studentCol}>
                        <h4>{inq.studentName}</h4>
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                          Parent: {inq.parentName}
                        </div>
                      </td>
                      <td className={styles.contactCol}>
                        <div>
                          <Phone size={12} style={{ display: "inline", marginRight: 4, color: "#dc2626" }} />
                          <a href={`tel:${inq.phone}`}>{inq.phone}</a>
                        </div>
                        {inq.email && (
                          <div>
                            <Mail size={12} style={{ display: "inline", marginRight: 4, color: "#64748b" }} />
                            <a href={`mailto:${inq.email}`}>{inq.email}</a>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={styles.gradeBadge}>{inq.gradeApplying || "General"}</span>
                      </td>
                      <td className={styles.messageCol}>{inq.message || "No specific message provided."}</td>
                      <td style={{ color: "#cbd5e1", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        {inq.date}
                      </td>
                      <td>
                        <select
                          value={inq.status}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          className={`${styles.statusSelect} ${statusClass}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Admitted">Admitted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDelete(inq.id, inq.studentName)}
                          className={`${styles.actionIconBtn} ${styles.deleteBtn}`}
                          title="Delete inquiry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No admission inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
