import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('function ga({children:');
console.log('ga rest:', bundle.slice(idx + 2400, idx + 4000));

