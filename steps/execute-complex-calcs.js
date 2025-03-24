const vm = require("vm");

// 🧠 Define the complex functions we want to replace with necessary global vars
const complexFuncs = [
  { function: "atob_i", extra_vars: ["special_u"] },
  { function: "complex_r", extra_vars: ["special_M"] },
  // Add more like { function: "myFunc", extra_vars: ["globalArr"] }
];

function extractGlobalArray(code, varName, context) {
  const startIndex = code.indexOf(`${varName} = [`);
  if (startIndex === -1) {
    console.warn(`❌ Global array '${varName}' not found.`);
    return null;
  }

  let i = code.indexOf("[", startIndex);
  if (i === -1) return null;

  let bracketCount = 1;
  let endIndex = i + 1;

  while (endIndex < code.length && bracketCount > 0) {
    if (code[endIndex] === "[") bracketCount++;
    else if (code[endIndex] === "]") bracketCount--;
    endIndex++;
  }

  if (bracketCount !== 0) {
    console.warn(`❌ Bracket mismatch for array '${varName}'`);
    return null;
  }

  const arrayContent = code.slice(i + 1, endIndex - 1);

  try {
    const evaluated = vm.runInContext(`[${arrayContent}]`, context);
    context[varName] = evaluated;
    // console.log(
    //   `✅ Resolved array '${varName}' with ${evaluated.length} elements`
    // );
    return evaluated;
  } catch (e) {
    console.warn(`⚠️ Failed to evaluate array '${varName}':`, e.message);
    return null;
  }
}

// Step 2: Locate the full function body by counting braces
function extractFunctionInContext(code, name, context) {
  const startIndex = code.indexOf(`function ${name}`);
  if (startIndex === -1) {
    console.warn(`❌ Function '${name}' not found.`);
    return null;
  }

  let braceCount = 0;
  let i = code.indexOf("{", startIndex);
  if (i === -1) return null;

  i++;

  while (i < code.length) {
    if (code[i] === "{") braceCount++;
    else if (code[i] === "}") {
      if (braceCount === 0) {
        const fullFn = code.slice(startIndex, i + 1);

        try {
          // Inject into VM context so function has access to vars
          vm.runInContext(fullFn, context);
          //   console.log(`✅ Parsed and injected function '${name}'`);

          // Get reference to the function now inside the context
          return context[name];
        } catch (e) {
          console.warn(`⚠️ Failed to evaluate function '${name}':`, e.message);
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

function replaceCallsites(code, fnName, fnRef, context) {
  const callRegex = new RegExp(
    `(?<![\\w$])${fnName}\\((\\s*[-+]?\\d+(\\s*,\\s*[-+]?\\d+)*\\s*)\\)`,
    "g"
  );

  const matches = [...code.matchAll(callRegex)];
  console.log(`🔍 Found ${matches.length} callsites for '${fnName}'`);

  let count = 0;

  const updatedCode = code.replace(callRegex, (match, indexStr) => {
    const index = parseInt(indexStr, 10);

    try {
      const result = fnRef.call(context, index);

      if (typeof result === "string" || typeof result === "number") {
        const replaced = JSON.stringify(result);
        // console.log(`🔁 Replaced ${match} → ${replaced}`);
        count++;
        return replaced;
      }
    } catch (e) {
      console.warn(`⚠️ Failed to execute ${fnName}(${index}):`, e.message);
    }

    return match; // fallback
  });

  console.log(`✅ Total callsites replaced for '${fnName}': ${count}`);
  return updatedCode;
}

// 🧩 Main function
module.exports = function executeComplexCalcs(code) {
  for (const entry of complexFuncs) {
    const { function: fnName, extra_vars } = entry;
    const context = vm.createContext({
      atob: (str) => Buffer.from(str, "base64").toString("binary"),
    });

    let allResolved = true;
    for (const varName of extra_vars) {
      const val = extractGlobalArray(code, varName, context);
      if (!val) {
        allResolved = false;
        break;
      }
    }

    if (!allResolved) {
      console.warn(`❌ Skipping '${fnName}' due to unresolved globals.`);
      continue;
    }

    const fn = extractFunctionInContext(code, fnName, context);
    if (!fn) {
      console.warn(`❌ Skipping '${fnName}' due to function eval failure.`);
      continue;
    }

    code = replaceCallsites(code, fnName, fn, context);
  }

  return code;
};
