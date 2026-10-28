import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf('setCurrentUser(e,t');
console.log('setCurrentUser implementation:', bundle.slice(idx, idx + 400));

