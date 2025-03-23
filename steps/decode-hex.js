module.exports = function decodeHex(code) {
  return code.replace(/\\x([0-9A-Fa-f]{2})+/g, (match) => {
    try {
      // Decode hex to a readable string
      let decoded = match
        .split("\\x")
        .filter(Boolean)
        .map((hex) => String.fromCharCode(parseInt(hex, 16)))
        .join("");

      if (/[^a-zA-Z0-9_]/.test(decoded)) {
        return match;
      }
      return decoded;
    } catch (e) {
      return match;
    }
  });
};
