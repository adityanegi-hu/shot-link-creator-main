import fs from 'fs';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

// Find kr() definition (auth context / store)
let idx = bundle.indexOf('function kr(');
if (idx !== -1) {
  console.log('function kr:', bundle.slice(idx, idx + 1000));
} else {
  let i2 = bundle.indexOf('kr=');
  console.log('kr=:', bundle.slice(i2, i2 + 1000));
}

