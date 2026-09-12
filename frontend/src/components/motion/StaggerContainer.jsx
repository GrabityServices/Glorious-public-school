import { m } from "framer-motion";
import { varStaggerContainer } from "@/lib/motion/stagger";

export default function StaggerContainer({
  children,
  className,
  staggerVal = 0.1,
  delayVal = 0.05,
  style,
}) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={varStaggerContainer(staggerVal, delayVal)}
      className={className}
      style={style}
    >
      {children}
    </m.div>
  );
}
