import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');
const idx = bundle.indexOf('className:`bg-amber-500 text-slate-950');
console.log('50 chars before bg-amber-500:', bundle.slice(idx - 100, idx + 50));

