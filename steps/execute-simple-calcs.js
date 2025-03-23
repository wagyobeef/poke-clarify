const vm = require("vm");
const functionNames = require("./utils/calc-funcs");

function findFunctionDefinitions(code) {
  const functions = {};

  for (const name of functionNames) {
    console.log(`🔍 Looking for function '${name}'`);

    // Basic function definition regex: function name(e, t) { ... }
    const fnRegex = new RegExp(
      `function\\s+${name}\\s*\\(([^)]*)\\)\\s*\\{([\\s\\S]*?)\\}`,
      "m"
    );

    const match = code.match(fnRegex);
    if (match) {
      const [fullFn, params, body] = match;
      try {
        const fn = new Function(
          ...params.split(",").map((p) => p.trim()),
          body
        );
        functions[name] = { fn, raw: fullFn };
        console.log(`✅ Parsed function: ${name}`);
        console.log(
          `----- Function ${name} -----\n${fullFn}\n----------------------------`
        );
      } catch (err) {
        console.warn(
          `⚠️ Skipping function '${name}' due to eval error:`,
          err.message
        );
      }
    } else {
      console.warn(`❌ No match for function '${name}'`);
    }
  }

  return { code, functions };
}

function replaceFunctionCalls(code, functions) {
  let updatedCode = code;

  for (const name of Object.keys(functions)) {
    // Only match exact function name followed by (...digits...)
    const callRegex = new RegExp(
      `(?<![\\w$])${name}\\((\\s*[-+]?\\d+(\\s*,\\s*[-+]?\\d+)*\\s*)\\)`,
      "g"
    );

    updatedCode = updatedCode.replace(callRegex, (match, argsStr) => {
      const args = argsStr.split(",").map((arg) => parseInt(arg.trim(), 10));
      try {
        const result = functions[name].fn(...args);
        if (typeof result === "number") {
          // console.log(`🔁 Replacing: ${match} → ${result}`);
          return result.toString();
        }
      } catch (e) {
        console.warn(`⚠️ Error evaluating ${name}(${argsStr}):`, e.message);
      }
      return match; // fallback to original if error
    });
  }

  return updatedCode;
}

module.exports = function executeCalcFuncs(code) {
  const { code: withFunctions, functions } = findFunctionDefinitions(code);
  const replaced = replaceFunctionCalls(withFunctions, functions);
  return replaced;
};
