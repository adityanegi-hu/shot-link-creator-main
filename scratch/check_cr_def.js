import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('vr={getUserCount:()=>cr.getUserCount()');
console.log('2000 chars before:', bundle.slice(idx - 1500, idx));

