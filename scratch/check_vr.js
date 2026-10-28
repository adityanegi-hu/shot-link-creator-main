import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('vr=');
console.log('vr= at', idx, ':', bundle.slice(idx, idx + 600));

