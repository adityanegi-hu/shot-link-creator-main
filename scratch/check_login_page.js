import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const idx = bundle.indexOf("path:`/auth/login`");
console.log('/auth/login route:', bundle.slice(idx - 100, idx + 200));

// Let's see what component renders /auth/login
const match = bundle.match(/path:`\/auth\/login`,element:\(0,V\.jsx\)\(([^,]+),/);
console.log('Login component:', match ? match[1] : 'not found');

