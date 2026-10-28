import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('bootstrapAdmin');
console.log('bootstrapAdmin at', idx, ':', bundle.slice(idx - 50, idx + 400));

