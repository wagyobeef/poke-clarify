const fs = require("fs");
const path = require("path");
const decodeHex = require("./steps/decode-hex");
const executeSimpleFuncs = require("./steps/execute-simple-funcs");
const executeCustomFuncs = require("./steps/execute-custom-funcs");
const replaceCharCodes = require("./steps/replace-char-codes");
const concatChars = require("./steps/concat-chars");
const executeComplexCalcs = require("./steps/execute-complex-calcs");

const inputFile = process.argv[2];

if (!inputFile) {
  console.error("Error: No input file provided.");
  console.log("Usage: node clarify.js <filename>");
  process.exit(1);
}

const filePath = path.resolve(__dirname, "captchas", inputFile);

steps = [
  { name: "decode-hex", action: decodeHex },
  { name: "execute-simple-calcs", action: executeSimpleFuncs },
  { name: "execute-custom-calcs", action: executeCustomFuncs },
  { name: "replace-char-codes", action: replaceCharCodes },
  { name: "concat-chars", action: concatChars },
  { name: "execute-complex-calcs", action: executeComplexCalcs },
];

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Failed to read file:", err.message);
    process.exit(1);
  }

  for (const step of steps) {
    const stepName = step.name || "step";
    const tempFilePath = path.join(__dirname, "temp", `${stepName}.html`);

    temp_data = step.action(data);

    try {
      fs.writeFileSync(tempFilePath, temp_data, "utf8");
      console.log(`Wrote result of ${stepName} to ${tempFilePath}`);
    } catch (e) {
      console.error(`Failed to write ${stepName} output:`, e.message);
    }

    data = temp_data;
  }

  const resFilePath = path.join(__dirname, "results", `res-${inputFile}`);
  fs.writeFileSync(resFilePath, data, "utf8");
  console.log(`Wrote result to res-${resFilePath}`);
});
