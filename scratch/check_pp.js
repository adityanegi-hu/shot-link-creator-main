import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('function pp(');
if (idx !== -1) {
  console.log('function pp:', bundle.slice(idx, idx + 1500));
} else {
  let i2 = bundle.indexOf('pp=');
  console.log('pp=:', bundle.slice(i2, i2 + 1500));
}

