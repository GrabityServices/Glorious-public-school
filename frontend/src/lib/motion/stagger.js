export const varStaggerContainer = (staggerVal = 0.1, delayVal = 0.05) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerVal,
      delayChildren: delayVal,
    },
  },
});

export const varStaggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 20,
    },
  },
};
