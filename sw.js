const C='frozen-costs-v1.0.3';
const F=['./','./index.html','./core.js','./app.js','./html2canvas.min.js','./jspdf.umd.min.js','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('frozen-costs-')&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET'||new URL(q.url).origin!==location.origin)return;
 if(q.mode==='navigate'){e.respondWith(caches.match('./index.html').then(r=>r||fetch(q)).catch(()=>caches.match('./index.html')));return}
 e.respondWith(caches.match(q,{ignoreSearch:true}).then(r=>r||fetch(q).then(x=>{if(x.ok){const cp=x.clone();caches.open(C).then(c=>c.put(q,cp))}return x})))});
