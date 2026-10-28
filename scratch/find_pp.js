import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

// Find all "function pp" or "var pp=" or "let pp=" or "const pp="
const matches = bundle.match(/(?:function|var|let|const)\s+pp\b/g);
console.log('Matches:', matches);

// Find where pp is defined near components
let idx = 0;
while ((idx = bundle.indexOf('pp=', idx)) !== -1) {
  console.log('pp= at', idx, ':', bundle.slice(idx, idx + 100));
  idx += 3;
}

