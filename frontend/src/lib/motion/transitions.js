import { easeCalm, easeInOutCalm, springCalm, springTactile } from "./easing";

export const transitionCalm = {
  ...springCalm,
};

export const transitionTactile = {
  ...springTactile,
};

export const transitionFade = {
  duration: 0.5,
  ease: easeCalm,
};

export const transitionRoute = {
  duration: 0.6,
  ease: easeCalm,
};

export const transitionModal = {
  ...springCalm,
};

export const transitionAccordion = {
  duration: 0.35,
  ease: easeInOutCalm,
};
