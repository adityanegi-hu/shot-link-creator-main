import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');
const idx = bundle.indexOf('Backend Not Connected');
console.log('3000 chars before:', bundle.slice(idx - 2500, idx - 1500));

