function validateSyntax(email) {
  if (!email || typeof email !== "string") {
    return {
      valid: false,
      reason: "empty_or_invalid_type"
    };
  }

  // Trim whitespace
  email = email.trim();

  // Basic RFC 5322 compliant regex
  const regex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!regex.test(email)) {
    return {
      valid: false,
      reason: "invalid_format"
    };
  }

  // Extra defensive checks
  if (email.includes("..")) {
    return {
      valid: false,
      reason: "double_dot_detected"
    };
  }

  const parts = email.split("@");

  if (parts.length !== 2) {
    return {
      valid: false,
      reason: "multiple_at_symbols"
    };
  }

  const domain = parts[1];

  if (!domain.includes(".")) {
    return {
      valid: false,
      reason: "missing_tld"
    };
  }

  return {
    valid: true,
    reason: null
  };
}

module.exports = validateSyntax;
