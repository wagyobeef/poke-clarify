module.exports = function replaceCharCodes(code) {
  // Match s(84), s(110), etc. when s is defined as String.fromCharCode
  const charCallRegex = /\bs\((\d+)\)/g;

  // Replace s(n) with the actual character from char code
  const replacedCode = code.replace(charCallRegex, (_, num) => {
    try {
      const char = String.fromCharCode(parseInt(num));
      return `"${char}"`;
    } catch {
      return `s(${num})`;
    }
  });

  return replacedCode;
};
