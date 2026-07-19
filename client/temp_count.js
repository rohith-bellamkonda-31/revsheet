const fs = require('fs');
const code = fs.readFileSync('src/pages/TopicsPage.js', 'utf8').split(/\r?\n/);
const start=412, end=449;
let paren=0, brace=0; 
for(let i=start-1;i<end;i++){
  const line=code[i];
  for(const ch of line){
    if(ch==='(') paren++;
    else if(ch===')') paren--;
    else if(ch==='{') brace++;
    else if(ch==='}') brace--;
  }
  console.log(`${i+1}: paren=${paren}, brace=${brace} | ${line}`);
}
console.log('final',paren,brace);
