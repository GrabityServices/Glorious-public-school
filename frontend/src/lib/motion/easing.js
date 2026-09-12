// Premium and calming easing curves
export const easeCalm = [0.25, 1, 0.5, 1]; // Custom Out-Quint curve for soft deceleration
export const easeInOutCalm = [0.4, 0, 0.2, 1]; // Smooth acceleration and deceleration
export const easeResponsive = [0.16, 1, 0.3, 1]; // Ultra-fast start with long decay

// Consistent global spring physics configurations
export const springCalm = {
  type: "spring",
  stiffness: 110,
  damping: 20,
  mass: 1,
};

export const springTactile = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const springBounce = {
  type: "spring",
  stiffness: 400,
  damping: 15,
};
