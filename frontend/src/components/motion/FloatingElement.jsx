import { m, useReducedMotion } from "framer-motion";

export default function FloatingElement({
  children,
  className,
  yOffset = -12,
  duration = 6,
  delay = 0,
  style,
}) {
  const shouldReduceMotion = useReducedMotion();

  // Disable floating loop entirely if user requests reduced motion
  const animateProp = shouldReduceMotion
    ? {}
    : {
        y: [0, yOffset, 0],
      };

  const transitionProp = shouldReduceMotion
    ? {}
    : {
        repeat: Infinity,
        duration: duration,
        ease: "easeInOut",
        delay: delay,
      };

  return (
    <m.div
      animate={animateProp}
      transition={transitionProp}
      className={className}
      style={style}
    >
      {children}
    </m.div>
  );
}
