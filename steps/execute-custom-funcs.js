// manual-calc-replacements.js
const customFuncs = [
  {
    functionName: "c",
    fn: function (e, t) {
      return (
        -2 * (t & e) +
        1 * ~(t & ~t) +
        3 * ~(t & ~e) -
        4 * ~(t | e) -
        3 * ~(t | ~e)
      );
    },
  },
  // Add more manually defined functions here...
];

function executeCustomFuncs(code) {
  let updatedCode = code;

  for (const { functionName, fn } of customFuncs) {
    const callRegex = new RegExp(
      `(?<![\\w$])${functionName}\\((\\s*[-+]?\\d+(\\s*,\\s*[-+]?\\d+)*\\s*)\\)`,
      "g"
    );

    updatedCode = updatedCode.replace(callRegex, (match, argsStr) => {
      const args = argsStr.split(",").map((arg) => parseInt(arg.trim(), 10));
      try {
        const result = fn(...args);
        if (typeof result === "number") {
          // console.log(`🔁 Replacing ${match} → ${result}`);
          return result.toString();
        }
      } catch (err) {
        console.warn(
          `⚠️ Error evaluating ${functionName}(${argsStr}):`,
          err.message
        );
      }
      return match;
    });
  }

  return updatedCode;
}

module.exports = executeCustomFuncs;
