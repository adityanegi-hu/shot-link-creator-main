import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

// Find admin layout wrapper
const idx = bundle.indexOf('path:`/admin`,element:(0,V.jsx)(');
console.log('/admin route element:', bundle.slice(idx, idx + 200));

