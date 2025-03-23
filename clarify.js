const fs = require("fs");
const path = require("path");
const decodeHex = require("./steps/decode-hex");

const inputFile = process.argv[2];

if (!inputFile) {
  console.error("Error: No input file provided.");
  console.log("Usage: node clarify.js <filename>");
  process.exit(1);
}

const filePath = path.resolve(__dirname, "captchas", inputFile);

steps = [{ name: "decode-hex", action: decodeHex }];

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

  const resFilePath = path.join(__dirname, "results", inputFile);
  fs.writeFileSync(resFilePath, data, "utf8");
  console.log(`Wrote result to ${resFilePath}`);
});
