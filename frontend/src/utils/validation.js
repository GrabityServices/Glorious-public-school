/**
 * Form input sanitization and validation utilities for Glorious Public School.
 */

// Strip non-digits and intelligently handle +91 or leading 0 when pasted
export const sanitizePhoneInput = (val) => {
  if (!val) return "";
  let digits = String(val).replace(/\D/g, "");
  // If user pasted with country code e.g. +91 9534105012 (12 digits)
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    // If user pasted with leading 0 e.g. 09534105012
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
};

// Validate 10-digit Indian Mobile Number
export const validateIndianPhone = (phone, required = true) => {
  if (!phone || !String(phone).trim()) {
    if (!required) return { isValid: true, error: "" };
    return { isValid: false, error: "Mobile number is required." };
  }

  const cleaned = sanitizePhoneInput(phone);

  if (cleaned.length === 0) {
    return { isValid: false, error: "Please enter a valid mobile number." };
  }

  // Check if first digit is 6, 7, 8, or 9
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      error: "Mobile number must start with 6, 7, 8, or 9.",
    };
  }

  if (cleaned.length < 10) {
    return {
      isValid: false,
      error: `Please enter full 10 digits (${cleaned.length}/10 entered).`,
    };
  }

  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: false, error: "Please enter a valid 10-digit mobile number." };
  }

  return { isValid: true, error: "" };
};

// Validate Email Address
export const validateEmail = (email, required = false) => {
  if (!email || !String(email).trim()) {
    if (!required) return { isValid: true, error: "" };
    return { isValid: false, error: "Email address is required." };
  }

  const trimmed = String(email).trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address (e.g. name@example.com)." };
  }

  return { isValid: true, error: "" };
};

// Validate Name (Student / Parent)
export const validateName = (name, fieldLabel = "Name", min = 2, max = 60) => {
  if (!name || !String(name).trim()) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }

  const trimmed = String(name).trim();
  if (trimmed.length < min) {
    return { isValid: false, error: `${fieldLabel} must be at least ${min} characters.` };
  }
  if (trimmed.length > max) {
    return { isValid: false, error: `${fieldLabel} must be under ${max} characters.` };
  }

  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { isValid: false, error: `${fieldLabel} should only contain letters and spaces.` };
  }

  return { isValid: true, error: "" };
};

// Validate Message / Address / Textarea
export const validateText = (text, fieldLabel = "This field", min = 5, required = true) => {
  if (!text || !String(text).trim()) {
    if (!required) return { isValid: true, error: "" };
    return { isValid: false, error: `${fieldLabel} is required.` };
  }

  const trimmed = String(text).trim();
  if (trimmed.length < min) {
    return { isValid: false, error: `${fieldLabel} must be at least ${min} characters.` };
  }

  return { isValid: true, error: "" };
};
