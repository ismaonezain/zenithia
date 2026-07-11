const fs = require('fs');
const code = fs.readFileSync('public/js/main.js', 'utf-8');
const lines = code.split('\n');

let braces = 0;
let inSingleStr = false, inDoubleStr = false, inTemplate = false;
let prevChar = '';
let lastPositive = { line: 0, depth: 0 };

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const lineNum = code.substring(0, i+1).split('\n').length;
  
  if (inSingleStr) { if (c === "'" && prevChar !== "\\") inSingleStr = false; prevChar = c; continue; }
  if (inDoubleStr) { if (c === '"' && prevChar !== "\\") inDoubleStr = false; prevChar = c; continue; }
  if (c === "'") { inSingleStr = true; prevChar = c; continue; }
  if (c === '"') { inDoubleStr = true; prevChar = c; continue; }
  if (c === '`') { inTemplate = !inTemplate; prevChar = c; continue; }
  if (inTemplate) { prevChar = c; continue; }
  
  if (c === '/' && code[i+1] === '/') { while (i < code.length && code[i] !== '\n') i++; prevChar = c; continue; }
  if (c === '/' && code[i+1] === '*') { i += 2; while (i < code.length - 1 && !(code[i] === '*' && code[i+1] === '/')) i++; i++; prevChar = '/'; continue; }
  
  if (c === '{') { braces++; lastPositive = { line: lineNum, depth: braces }; }
  if (c === '}') {
    braces--;
    if (braces < 0) {
      console.log('EXTRA } found at line', lineNum, '(balance went to', braces, ')');
      console.log('Last open { was at line', lastPositive.line, 'depth', lastPositive.depth);
      console.log('Context:', lines.slice(Math.max(0,lineNum-4), lineNum+2).map((l,j) => (lineNum-3+j) + ': ' + l).join('\n'));
      break;
    }
  }
  prevChar = c;
}

if (braces >= 0) {
  console.log('Final brace balance:', braces, '(no extra } found from opening)');
}
