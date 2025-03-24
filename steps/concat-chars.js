module.exports = function concatChars(code) {
  let prevCode;
  let pass = 1;

  const concatRegex = /(["'`])([^"'`\\]*?)\1\s*\+\s*(["'`])([^"'`\\]*?)\3/g;

  do {
    prevCode = code;
    code = code.replace(concatRegex, (match, q1, str1, q2, str2) => {
      // Only concatenate if both are same quote type and don't contain escaped characters
      if (q1 === q2) {
        const combined = str1 + str2;
        return `${q1}${combined}${q2}`;
      }
      return match; // leave untouched if mismatched quotes
    });

    pass++;
  } while (code !== prevCode && pass < 10); // prevent infinite loops

  return code;
};
