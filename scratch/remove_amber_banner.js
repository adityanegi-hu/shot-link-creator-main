import fs from 'fs';
import vm from 'vm';

let bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

const targetBanner = `(0,V.jsxs)(\`div\`,{className:\`bg-amber-500 text-slate-950 px-4 py-2 text-xs font-medium flex flex-wrap items-center justify-between gap-3 shadow-sm z-50\`,children:[(0,V.jsxs)(\`div\`,{className:\`flex items-center gap-2 mx-auto sm:mx-0\`,children:[(0,V.jsx)($i,{className:\`w-4 h-4 shrink-0\`}),(0,V.jsxs)(\`span\`,{children:[(0,V.jsx)(\`strong\`,{children:\`Admin Preview — Backend Not Connected:\`}),\` Frontend demonstration only. No server-side role verification or authorization is active. Production administrative mutations will be authorized by the Fastify backend.\`]})]}),(0,V.jsxs)(L,{to:\`/auth/login\`,className:\`hidden sm:inline-flex items-center gap-1 text-[11px] underline font-semibold hover:opacity-80 shrink-0\`,children:[(0,V.jsx)(\`span\`,{children:\`View Shared Login\`}),(0,V.jsx)(ii,{className:\`w-3 h-3\`})]})]}),`;

bundle = bundle.replace(targetBanner, () => 'null,');

try {
  new vm.Script(bundle);
  fs.writeFileSync('public/assets/index-BvY82QPQ.js', bundle, 'utf8');
  console.log('Successfully removed amber warning banner from admin layout!');
} catch (e) {
  console.error('Syntax error:', e.message);
  process.exit(1);
}

