const fs = require('fs');
const code = fs.readFileSync('src/pages/TopicsPage.js', 'utf8').split(/\r?\n/);
const start=360, end=506; // 1-based lines roughly covering the mapping
const stack=[];
const tagRegex = /<\/?([A-Za-z0-9_\-\.]+)([^>]*)>/g;
for (let i=start-1;i<end;i++){
  const line = code[i];
  let m;
  while((m=tagRegex.exec(line))!==null){
    const full = m[0];
    const tag = m[1];
    const isClosing = full.startsWith('</');
    const isSelfClosing = /\/>\s*$/.test(full) || /br\s*\/?>$/i.test(full) || /input\s*\/?>$/i.test(full);
    if(!isClosing && !isSelfClosing){
      stack.push({tag, line:i+1});
    } else if(isClosing){
      const last = stack[stack.length-1];
      if(!last){
        console.log('Unmatched closing', tag, 'at', i+1);
      } else if(last.tag===tag){
        stack.pop();
      } else {
        console.log('MISMATCH closing', tag, 'at', i+1, 'expected', last.tag, 'opened at', last.line);
        stack.pop();
      }
    }
  }
}
if(stack.length) console.log('Remaining open tags:', stack);
else console.log('All tags balanced in range');
