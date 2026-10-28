import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('function pp(){let e=ft(),{login:t}=kr()');
console.log('function pp body:', bundle.slice(idx, idx + 1500));

