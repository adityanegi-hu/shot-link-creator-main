import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const secondPP = bundle.indexOf('function pp(){let e=ft(),{login:t}');
console.log('pp context:', bundle.slice(secondPP, secondPP + 600));

