/* Only a versioned static app shell is cached. Auth, AI, finance APIs and other origins bypass this worker. */
const CACHE='pesobase-shell-20261108-v2';
const FILES=['index.html','assistant-core.js','assistant-voice.js','assistant.js','assistant.css','workspace-core.js','offline.js','workspace.js','workspace.css','mobile-ui.js','mobile-ui.css','manifest.webmanifest','icons/pesobase-192.png','icons/pesobase-512.png','icons/pesobase-maskable.png','icons/pesobase-180.png'];
const scope=new URL(self.registration.scope),assetURL=name=>new URL(name,scope).href,allowed=new Set(FILES.map(assetURL));
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES.map(name=>new Request(assetURL(name),{cache:'reload'})));})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('pesobase-shell-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==scope.origin)return;
 const clean=new URL(url);clean.search='';clean.hash='';
 const navigation=req.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===new URL('index.html',scope).pathname);
 if(!navigation&&!allowed.has(clean.href))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),key=navigation?assetURL('index.html'):clean.href,cached=await cache.match(key);if(cached)return cached;const response=await fetch(req);if(response.ok&&response.type!=='opaque'&&!response.redirected)await cache.put(key,response.clone());return response;})());
});
