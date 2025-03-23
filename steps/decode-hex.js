module.exports = function decodeHex(code) {
  return code.replace(/\\x([0-9A-Fa-f]{2})+/g, (match) => {
    try {
      // Attempt decoding
      const decoded = match
        .split("\\x")
        .filter(Boolean)
        .map((hex) => String.fromCharCode(parseInt(hex, 16)))
        .join("");

      // Skip replacement if it contains risky HTML or symbols
      if (/[<>"'=]/.test(decoded)) {
        return match; // Leave as-is
      }

      return decoded;
    } catch (e) {
      return match; // On error, leave untouched
    }
  });
};
