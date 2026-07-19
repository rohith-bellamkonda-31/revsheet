const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('src/pages/TopicsPage.js', 'utf-8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining'] });
  console.log('PARSE_OK');
} catch (err) {
  console.error('message:', err.message);
  if (err.loc) {
    const lines = code.split(/\r?\n/);
    const L = Math.max(0, err.loc.line - 4);
    const R = Math.min(lines.length, err.loc.line + 2);
    console.error('loc', err.loc);
    for (let i = L; i < R; i++) {
      const ln = i + 1;
      console.error((ln === err.loc.line ? '>' : ' ') + (' ' + ln).slice(-4) + ': ' + lines[i]);
    }
  }
  process.exit(1);
}
