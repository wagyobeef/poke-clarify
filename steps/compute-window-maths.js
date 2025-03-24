function computeWindowMaths(code) {
  const mathFloorRegex = /g\["Math"\]\["floor"\]\s*\(\s*(-?\d+(\.\d+)?)\s*\)/g;
  const mathCeilRegex = /g\["Math"\]\["ceil"\]\s*\(\s*(-?\d+(\.\d+)?)\s*\)/g;
  const parseIntRegex = /g\["parseInt"\]\s*\(\s*(-?\d+(\.\d+)?)\s*\)/g;
  const numberRegex = /g\["Number"\]\s*\(\s*(-?\d+(\.\d+)?)\s*\)/g;

  return code
    .replace(mathFloorRegex, (_, num) => Math.floor(parseFloat(num)))
    .replace(mathCeilRegex, (_, num) => Math.ceil(parseFloat(num)))
    .replace(parseIntRegex, (_, num) => parseInt(num, 10))
    .replace(numberRegex, (_, num) => Number(num));
}

module.exports = computeWindowMaths;
