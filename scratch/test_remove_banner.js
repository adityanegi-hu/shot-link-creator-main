import fs from 'fs';
import vm from 'vm';

const bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const targetBanner = `(0,V.jsxs)(\`div\`,{className:\`bg-amber-500 text-slate-950 px-4 py-2 text-xs font-medium flex flex-wrap items-center justify-between gap-3 shadow-sm z-50\`,children:[(0,V.jsxs)(\`div\`,{className:\`flex items-center gap-2 mx-auto sm:mx-0\`,children:[(0,V.jsx)($i,{className:\`w-4 h-4 shrink-0\`}),(0,V.jsxs)(\`span\`,{children:[(0,V.jsx)(\`strong\`,{children:\`Admin Preview — Backend Not Connected:\`}),\` Frontend demonstration only. No server-side role verification or authorization is active. Production administrative mutations will be authorized by the Fastify backend.\`]})]}),(0,V.jsxs)(L,{to:\`/auth/login\`,className:\`hidden sm:inline-flex items-center gap-1 text-[11px] underline font-semibold hover:opacity-80 shrink-0\`,children:[(0,V.jsx)(\`span\`,{children:\`View Shared Login\`}),(0,V.jsx)(ii,{className:\`w-3 h-3\`})]})]}),`;

console.log('Includes target banner?', bundle.includes(targetBanner));

// Test Option 1: remove banner completely (null)
const testCode = bundle.replace(targetBanner, () => 'null,');
try {
  new vm.Script(testCode);
  console.log('Valid JS with null!');
} catch (e) {
  console.error('Failed with null:', e.message);
}

// Test Option 2: Connected banner
const replConnected = `(0,V.jsxs)(\`div\`,{className:\`bg-emerald-600 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between z-50\`,children:[(0,V.jsxs)(\`div\`,{className:\`flex items-center gap-2\`,children:[(0,V.jsx)(\`span\`,{className:\`w-2 h-2 rounded-full bg-emerald-300 animate-pulse\`}),(0,V.jsx)(\`strong\`,{children:\`Production Admin Console\`}),(0,V.jsx)(\`span\`,{children:\`— Fastify Backend & PostgreSQL Connected\`})]}),(0,V.jsx)(\`span\`,{className:\`text-[10px] text-emerald-200 font-mono\`,children:\`v2.0.0\`})]}),`;

const testCode2 = bundle.replace(targetBanner, () => replConnected);
try {
  new vm.Script(testCode2);
  console.log('Valid JS with Connected banner!');
} catch (e) {
  console.error('Failed with Connected banner:', e.message);
}

