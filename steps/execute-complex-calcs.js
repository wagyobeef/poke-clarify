const vm = require("vm");

// 🧠 Define the complex functions we want to replace with necessary global vars
const complexFuncs = [
  { function: "atob_i", extra_vars: ["special_u"] },
  // Add more like { function: "myFunc", extra_vars: ["globalArr"] }
];

// 🔐 Utility to escape variable names in regex
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 🔍 Extracts a global array from the code
function extractGlobalArray(code, varName) {
  const arrayRegex = new RegExp(
    `${escapeRegex(varName)}\\s*=\\s*\\[([\s\S]*?)\\]`,
    "m"
  );
  const match = code.match(arrayRegex);
  if (!match) {
    console.warn(`❌ Global array '${varName}' not found.`);
    return null;
  }

  try {
    const literal = `[${match[1]}]`;
    const evaluated = vm.runInNewContext(literal);
    console.log(
      `✅ Resolved array '${varName}' with ${evaluated.length} elements`
    );
    return evaluated;
  } catch (e) {
    console.warn(`⚠️ Failed to evaluate array '${varName}':`, e.message);
    return null;
  }
}

// Step 2: Locate the full function body by counting braces
function extractFunction(code, name) {
  const startIndex = code.indexOf(`function ${name}`);
  if (startIndex === -1) {
    console.warn(`❌ Function '${name}' not found.`);
    return null;
  }

  let braceCount = 0;
  let i = code.indexOf("{", startIndex);
  if (i === -1) return null;
  const funcStart = i;
  i++;

  while (i < code.length) {
    if (code[i] === "{") braceCount++;
    else if (code[i] === "}") {
      if (braceCount === 0) {
        const fullFn = code.slice(startIndex, i + 1);
        const headerMatch = fullFn.match(/function\s+\w+\s*\(([^)]*)\)/);
        const paramList = headerMatch
          ? headerMatch[1].split(",").map((s) => s.trim())
          : [];
        const body = fullFn.slice(
          fullFn.indexOf("{") + 1,
          fullFn.lastIndexOf("}")
        );

        try {
          const fn = new Function(...paramList, body);
          console.log(`✅ Parsed function '${name}'`);
          return fn;
        } catch (e) {
          console.warn(`⚠️ Error evaluating '${name}': ${e.message}`);
          return null;
        }
      } else {
        braceCount--;
      }
    }
    i++;
  }

  console.warn(`❌ Failed to find closing '}' for '${name}'`);
  return null;
}

// 🔁 Replace callsites in the HTML
function replaceCallsites(code, fnName, fnRef, contextVars) {
  const callRegex = new RegExp(
    `(?<![\w$])${escapeRegex(fnName)}\\((\\d+)\\)`,
    "g"
  );

  return code.replace(callRegex, (match, index) => {
    try {
      const context = vm.createContext(contextVars);
      const result = fnRef.call(context, parseInt(index));
      return JSON.stringify(result);
    } catch (e) {
      console.warn(`⚠️ Failed to execute ${fnName}(${index}):`, e.message);
      return match;
    }
  });
}

// 🧩 Main function
module.exports = function executeComplexCalcs(code) {
  for (const entry of complexFuncs) {
    const { function: fnName, extra_vars } = entry;

    const fn = extractFunction(code, fnName);
    if (!fn) continue;

    const contextVars = {};
    let allResolved = true;

    for (const varName of extra_vars) {
      const val = extractGlobalArray(code, varName);
      if (!val) {
        allResolved = false;
        break;
      }
      contextVars[varName] = val;
    }

    if (!allResolved) {
      console.warn(`❌ Skipping ${fnName} due to unresolved globals.`);
      continue;
    }

    code = replaceCallsites(code, fnName, fn, contextVars);
  }

  return code;
};
