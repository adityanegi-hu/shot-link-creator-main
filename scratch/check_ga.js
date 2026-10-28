import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');
const idx = bundle.indexOf('function ga(');
console.log('function ga:', bundle.slice(idx, idx + 800));

