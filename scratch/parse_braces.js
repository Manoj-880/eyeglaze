const fs = require('fs');

const fileContent = fs.readFileSync('frontend/src/pages/admin/AddProductWizard.tsx', 'utf8');
const lines = fileContent.split('\n');

const targetLine = 2157;
// Reconstruct content starting from line 2080 (0-indexed line 2079)
const startIdx = fileContent.indexOf(lines[targetLine - 1]);
const content = fileContent.slice(startIdx);

let braceCount = 0;
let parenCount = 0;
let inString = false;
let stringChar = null;
let escape = false;

for (let idx = 0; idx < content.length; idx++) {
  const char = content[idx];
  if (escape) {
    escape = false;
    continue;
  }
  if (char === '\\') {
    escape = true;
    continue;
  }
  if (inString) {
    if (char === stringChar) {
      inString = false;
    }
    continue;
  }
  if (char === '"' || char === "'" || char === '`') {
    inString = true;
    stringChar = char;
    continue;
  }

  if (char === '{') {
    braceCount++;
  } else if (char === '}') {
    braceCount--;
    if (braceCount === 0) {
      const newLinesCount = content.slice(0, idx).split('\n').length - 1;
      const matchedLineIdx = targetLine - 1 + newLinesCount;
      console.log(`Brace closed at relative char index ${idx}, line ${matchedLineIdx + 1}`);
      console.log("Surrounding lines:");
      for (let i = Math.max(0, matchedLineIdx - 5); i <= Math.min(lines.length - 1, matchedLineIdx + 5); i++) {
        console.log(`${i + 1}: ${lines[i]}`);
      }
      break;
    }
  }
}
