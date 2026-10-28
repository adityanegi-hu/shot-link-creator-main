import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

let pos = 0;
while ((pos = bundle.indexOf('kr=', pos)) !== -1) {
  console.log('kr= at', pos, ':', bundle.slice(pos - 30, pos + 100));
  pos += 3;
}

