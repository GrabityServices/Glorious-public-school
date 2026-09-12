import { AnimatePresence, m } from "framer-motion";
import { varModalOverlay, varModalContainer } from "@/lib/motion/variants";

export default function ModalTransition({
  isOpen,
  onClose,
  children,
  maxWidth = "480px",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="modal-backdrop"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={varModalOverlay}
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(27, 58, 36, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <m.div
            key="modal-content-container"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={varModalContainer}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "90%",
              maxWidth: maxWidth,
              zIndex: 2001,
            }}
          >
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
