import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Trash2, AlertTriangle, LogOut, AlertCircle, HelpCircle } from "lucide-react";
import styles from "@/components/common/ConfirmModal.module.css";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    itemName: "",
    confirmText: "Yes, Delete",
    cancelText: "Cancel",
    variant: "danger", // "danger" | "warning" | "info"
    iconType: null, // "trash" | "logout" | "warning" | "info"
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || "Confirm Action",
        message: options.message || "Are you sure you want to proceed?",
        itemName: options.itemName || "",
        confirmText: options.confirmText || (options.variant === "warning" ? "Proceed" : "Yes, Delete"),
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "danger",
        iconType: options.iconType || (options.variant === "warning" ? "warning" : "trash"),
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    modalState.resolve?.(true);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    modalState.resolve?.(false);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modalState.isOpen) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalState.isOpen]);

  const renderIcon = (size = 18) => {
    if (modalState.iconType === "logout") return <LogOut size={size} />;
    if (modalState.variant === "warning" || modalState.iconType === "warning") return <AlertTriangle size={size} />;
    if (modalState.variant === "info" || modalState.iconType === "info") return <HelpCircle size={size} />;
    return <Trash2 size={size} />;
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {modalState.isOpen && (
        <div
          className={styles.backdrop}
          onClick={handleCancel}
          data-lenis-prevent="true"
        >
          <div
            className={styles.card}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <div
              className={`${styles.accentBar} ${
                modalState.variant === "warning"
                  ? styles.accentWarning
                  : modalState.variant === "info"
                  ? styles.accentInfo
                  : styles.accentDanger
              }`}
            />

            <div
              className={`${styles.iconWrapper} ${
                modalState.variant === "warning"
                  ? styles.iconWarning
                  : modalState.variant === "info"
                  ? styles.iconInfo
                  : styles.iconDanger
              }`}
            >
              {renderIcon(20)}
            </div>

            <h3 className={styles.title}>{modalState.title}</h3>
            <p className={styles.message}>{modalState.message}</p>

            {modalState.itemName && (
              <div
                className={`${styles.itemHighlight} ${
                  modalState.variant === "warning" ? styles.itemHighlightWarning : ""
                }`}
              >
                <span className={styles.itemHighlightLabel}>Target Item</span>
                <span className={styles.itemName}>"{modalState.itemName}"</span>
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancel}
              >
                {modalState.cancelText}
              </button>
              <button
                type="button"
                className={`${styles.confirmBtn} ${
                  modalState.variant === "warning"
                    ? styles.confirmWarning
                    : modalState.variant === "info"
                    ? styles.confirmInfo
                    : styles.confirmDanger
                }`}
                onClick={handleConfirm}
                autoFocus
              >
                {renderIcon(14)}
                <span>{modalState.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}
