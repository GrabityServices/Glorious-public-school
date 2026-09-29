import { Inbox, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./EmptyState.module.css";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing to display right now",
  description = "There are no records matching your selection. Please check back later or modify your filter.",
  actionText,
  onAction,
  actionLink,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={`${styles.emptyStateWrapper} ${
        compact ? styles.compact : ""
      } ${className}`}
    >
      <div className={styles.iconCircle}>
        <Icon size={compact ? 24 : 32} strokeWidth={1.8} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}

      {actionText && (
        <div className={styles.actionArea}>
          {actionLink ? (
            <Link to={actionLink} className={styles.resetBtn}>
              <span>{actionText}</span>
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className={styles.resetBtn}
            >
              <RotateCcw size={14} />
              <span>{actionText}</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
