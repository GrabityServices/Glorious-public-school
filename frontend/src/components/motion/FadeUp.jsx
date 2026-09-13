import { m, useReducedMotion } from "framer-motion";
import { varFadeUp } from "@/lib/motion/variants";

export default function FadeUp({ children, className, delay = 0, style, fullHeight = false }) {
  const shouldReduceMotion = useReducedMotion();

  // If reduced motion is requested, bypass the y translate and only fade in
  const variants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4, delay } },
      }
    : {
        ...varFadeUp,
        visible: {
          ...varFadeUp.visible,
          transition: { ...varFadeUp.visible.transition, delay },
        },
      };

  const combinedStyle = fullHeight
    ? { height: "100%", display: "flex", flexDirection: "column", ...style }
    : style;

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={variants}
      className={className}
      style={combinedStyle}
    >
      {children}
    </m.div>
  );
}
