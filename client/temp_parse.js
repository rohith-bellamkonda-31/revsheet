const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('src/pages/TopicsPage.js', 'utf-8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining'] });
  console.log('PARSE_OK');
} catch (err) {
  console.error(err.message);
  console.error('loc', err.loc);
  console.error(err.codeFrame);
  process.exit(1);
}
