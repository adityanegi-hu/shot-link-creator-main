import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('path:`/auth/login`');
console.log(bundle.slice(idx, idx + 200));

