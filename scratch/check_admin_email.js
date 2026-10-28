import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

let idx = 0;
while ((idx = bundle.indexOf('admin@', idx)) !== -1) {
  console.log('admin@ at', idx, ':', bundle.slice(idx - 100, idx + 200));
  idx += 6;
}

