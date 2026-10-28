import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const first = bundle.indexOf('function pp');
const second = bundle.indexOf('function pp', first + 1);
console.log('Second function pp:', bundle.slice(second, second + 1200));

