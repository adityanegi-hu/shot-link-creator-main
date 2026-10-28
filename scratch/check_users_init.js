import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('this.users=');
console.log('this.users= at', idx, ':', bundle.slice(idx - 100, idx + 400));

