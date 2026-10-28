import fs from 'fs';
import vm from 'vm';

let bundle = fs.readFileSync('public/assets/index-BvY82QPQ.js', 'utf8');

// Target 1 in function pp:
const targetSubmit = 'async function _(a){a.preventDefault(),d({});let s=sp.safeParse(i),c=!!(o&&o.length>=1),l={};if(s.success||(l.email=s.error.issues[0].message),c||(l.password=`Password is required`),Object.keys(l).length>0)d(l);else if(!m)d({general:`Authentication backend is offline. Real account authentication and role-based access control (RBAC) require connecting the Fastify + PostgreSQL backend service (via VITE_API_BASE_URL). You can explore Linko via the Local Workspace or Admin Preview.`});else{p(!0);try{let r=await t(i.trim().toLowerCase(),o);n(`Welcome back, ${r.name}`),r.role===`admin`?e(`/admin`):e(`/app`)}catch(e){let t=e instanceof Error?e.message:`Invalid credentials or authentication failure.`;d({general:t}),r(`Login Failed`,t)}finally{p(!1)}}}';
const replSubmit = 'async function _(a){a.preventDefault(),d({});let s=sp.safeParse(i),c=!!(o&&o.length>=1),l={};if(s.success||(l.email=s.error.issues[0].message),c||(l.password="Password is required"),Object.keys(l).length>0){d(l);return}p(!0);try{let s=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:i.trim().toLowerCase(),password:o})});let c=await s.json();if(!s.ok||!c.ok)throw new Error(c.error||"Invalid admin credentials.");sr.setCurrentUser(c.user,c.token);try{await t(i.trim().toLowerCase(),o)}catch(err){}n("Welcome back, "+c.user.name),e("/admin")}catch(t){let e=t instanceof Error?t.message:"Invalid credentials or authentication failure.";d({general:e}),r("Login Failed",e)}finally{p(!1)}}';

bundle = bundle.replace(targetSubmit, () => replSubmit);

// Target 2 in function ga: add admin guard
const targetGa = 'function ga({children:e}){let{effectiveTheme:t,toggleTheme:n}=Ar(),r=lt(),[i,a]=(0,v.useState)(!1),o=ma.isBackendConnected,s=';
const replGa = 'function ga({children:e}){let{effectiveTheme:t,toggleTheme:n}=Ar(),r=lt(),nav=ft(),[i,a]=(0,v.useState)(!1),u=sr.getCurrentUser();(0,v.useEffect)(()=>{if(!u||u.role!=="admin")nav("/auth/login",{replace:!0})},[u]);if(!u||u.role!=="admin")return null;let o=ma.isBackendConnected,s=';

bundle = bundle.replace(targetGa, () => replGa);

// Target 3 in function ga header: add Logout button
const targetHeader = '(0,V.jsx)(L,{to:`/app`,className:`text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors`,children:`Go to User Workspace →`})';
const replHeader = '(0,V.jsx)(L,{to:`/app`,className:`text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors`,children:`Go to User Workspace →`}),(0,V.jsx)(`button`,{onClick:()=>{sr.setCurrentUser(null);nav(`/auth/login`,{replace:!0})},className:`text-xs px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer`,children:`Logout`})';

bundle = bundle.replace(targetHeader, () => replHeader);

try {
  new vm.Script(bundle);
  console.log('ALL PATCHES VALID! Saving to public/assets/index-BvY82QPQ.js...');
  fs.writeFileSync('public/assets/index-BvY82QPQ.js', bundle, 'utf8');
  console.log('Successfully saved patched bundle!');
} catch (e) {
  console.error('Syntax error:', e.message);
  process.exit(1);
}

