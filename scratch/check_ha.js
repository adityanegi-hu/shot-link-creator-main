import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('function ha({children:');
console.log('ha component:', bundle.slice(idx, idx + 800));

