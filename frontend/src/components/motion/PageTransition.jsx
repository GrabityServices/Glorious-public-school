import { m, useReducedMotion } from "framer-motion";
import { easeCalm } from "@/lib/motion/easing";

export default function PageTransition({ children }) {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
      }
    : {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeCalm } },
        exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: easeCalm } },
      };

  return (
    <m.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </m.div>
  );
}
