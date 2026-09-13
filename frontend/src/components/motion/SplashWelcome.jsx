import { useState, useEffect } from "react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./SplashWelcome.module.css";
import { easeCalm } from "@/lib/motion/easing";

export default function SplashWelcome({ onEnter }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1. Initiate exit transition (fade out) after 1600ms
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1600);

    // 2. Call parent onEnter after 2000ms (when exit animation completes)
    const enterTimer = setTimeout(() => {
      if (onEnter) onEnter();
    }, 2000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(enterTimer);
    };
  }, [onEnter]);

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          key="splash-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -15, // Soft, minor lift on exit
            transition: { duration: 0.4, ease: easeCalm },
          }}
          className={styles.overlay}
        >
          <div className={styles.content}>
            {/* School Crest Logo */}
            <m.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{
                scale: [0.96, 1.04, 0.96],
                opacity: 1,
              }}
              transition={{
                scale: {
                  repeat: Infinity,
                  duration: 2.6,
                  ease: "easeInOut",
                },
                opacity: { duration: 0.5, ease: easeCalm },
              }}
              className={styles.logoWrapper}
            >
              <img
                src="/images/glorious-public-school-logo.png"
                alt="Glorious Public School Crest"
                className={styles.splashLogo}
              />
            </m.div>

            {/* School Title & Motto */}
            <m.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: easeCalm }}
              className={styles.splashTitle}
            >
              Glorious Public School
            </m.h2>

            <m.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease: easeCalm }}
              className={styles.splashSub}
            >
              Knowledge • Leadership • Integrity • Jhajha
            </m.p>
          </div>

          {/* Ambient Organic Blur Decor */}
          <div className={styles.backgroundDecor}>
            <m.div
              animate={{
                scale: [1, 1.05, 1],
                x: [0, 10, 0],
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              className={styles.blob1}
            />
            <m.div
              animate={{
                scale: [1, 1.08, 1],
                x: [0, -10, 0],
              }}
              transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
              className={styles.blob2}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
