const { readFileSync } = require('fs');
const { PathLike } = require('fs');
const code = readFileSync('src/pages/TopicsPage.js', 'utf-8');
const lines = code.split(/\r?\n/);
let paren = 0;
let brace = 0;
let angle = 0;
lines.forEach((line, idx) => {
  for (const ch of line) {
    if (ch === '(') paren++;
    if (ch === ')') paren--;
    if (ch === '{') brace++;
    if (ch === '}') brace--;
    if (ch === '<') angle++;
    if (ch === '>') angle--;
  }
  if (paren < 0 || brace < 0 || angle < 0) {
    console.log('negative at', idx+1, 'paren', paren, 'brace', brace, 'angle', angle, line);
    process.exit(0);
  }
});
console.log('final', {paren, brace, angle});
