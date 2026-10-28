import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

let idx = 0;
while ((idx = bundle.indexOf('login:async', idx)) !== -1) {
  console.log('login:async at', idx, ':', bundle.slice(idx, idx + 400));
  idx += 11;
}

idx = 0;
while ((idx = bundle.indexOf('async login(', idx)) !== -1) {
  console.log('async login at', idx, ':', bundle.slice(idx, idx + 400));
  idx += 11;
}

