const fs = require("fs");
const path = require("path");

function filling_func(e, t, a, n, c, i, r, o) {
  return (((c * n) ^ (e * r) ^ (t * i)) >>> 0) & (a - 1);
}

function buildMatrixRefMatrix() {
  const ref_matrix = Array.from({ length: 128 }, () => new Array(512));
  for (let a = 0; a < 512; a++) {
    for (let b = 0; b < 128; b++) {
      const targetRow = filling_func(b, 94, 128, 281, a, 503, 577);
      ref_matrix[b][a] = ref_matrix[targetRow];
    }
  }
  return ref_matrix;
}

function makeRowMap(ref_matrix) {
  const map = new Map();
  ref_matrix.forEach((row, i) => {
    if (row) map.set(row, `row-${i}`);
  });
  return map;
}

// 🔁 Replace o[x][y] with a-{row#}
function replaceRefPatterns(code, o, rowMap) {
  return code.replace(/o\[(\d+)\]\[(\d+)\]/g, (match, xRaw, yRaw) => {
    const x = parseInt(xRaw, 10);
    const y = parseInt(yRaw, 10);
    const outer = o[x];
    if (!outer) return `"row-undefined"`;

    const inner = outer[y];
    const label = rowMap.get(inner);
    return `"${label || "row-undefined"}"`;
  });
}

// 🧩 Main function
module.exports = function replaceRefArray(code) {
  const ref_matrix = buildMatrixRefMatrix();
  const chosen_row = ref_matrix[94];
  const rowMap = makeRowMap(ref_matrix);
  return replaceRefPatterns(code, chosen_row, rowMap);
};
