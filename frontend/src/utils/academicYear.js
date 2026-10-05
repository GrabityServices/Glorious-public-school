/**
 * Dynamic Academic Session Year Utility.
 *
 * Automatically computes the academic session string directly from the system clock.
 * Every year, this automatically updates without any manual admin input.
 *
 * Examples:
 * In year 2026 -> "2026 - 2027"
 * In year 2027 -> "2027 - 2028"
 * In year 2028 -> "2028 - 2029"
 */
export const getAcademicSession = (date = new Date()) => {
  const currentYear = date.getFullYear();
  const nextYear = currentYear + 1;
  return `${currentYear} - ${nextYear}`;
};

export const getAcademicSessionFormatted = (date = new Date()) => {
  return `Session ${getAcademicSession(date)}`;
};

export const getAdmissionNoticeText = (date = new Date()) => {
  const session = getAcademicSession(date);
  return `ADMISSION OPEN FOR NURSERY TO CLASS 10TH (ACADEMIC SESSION ${session}) — APPLY TODAY!`;
};
