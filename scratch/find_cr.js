import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const matches = bundle.match(/[a-zA-Z_$0-9]+\s*=\s*\{[^\}]*getUserCount[^\}]*\}/g);
console.log('Matches:', matches);

let idx = 0;
while ((idx = bundle.indexOf('getUserCount', idx)) !== -1) {
  console.log('getUserCount at', idx, ':', bundle.slice(idx - 50, idx + 80));
  idx += 12;
}

