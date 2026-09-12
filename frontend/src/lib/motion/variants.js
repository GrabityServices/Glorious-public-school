import { easeCalm, springCalm } from "./easing";
import { transitionCalm, transitionFade, transitionModal } from "./transitions";

// Simple fade
export const varFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitionFade,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

// Fade up (scroll reveal standard)
export const varFadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionCalm,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.3 },
  },
};

// Fade down
export const varFadeDown = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionCalm,
  },
};

// Fade left (slide from right)
export const varFadeLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitionCalm,
  },
};

// Fade right (slide from left)
export const varFadeRight = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitionCalm,
  },
};

// Zoom / Scale in
export const varScaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitionCalm,
  },
};

// Modal Backdrop overlay fade
export const varModalOverlay = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, delay: 0.1 },
  },
};

// Modal Content zoom
export const varModalContainer = {
  hidden: { opacity: 0, scale: 0.92, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitionModal,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.25, ease: easeCalm },
  },
};
