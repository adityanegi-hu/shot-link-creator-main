import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('Open administrative navigation');
console.log('Admin header context:', bundle.slice(idx - 100, idx + 800));

