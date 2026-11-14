/* Only a versioned static app shell is cached. Auth, AI, finance APIs and other origins bypass this worker. */
const CACHE='pesobase-shell-20261114-v7';
const FILES=['index.html','assistant-core.js','assistant-voice.js','assistant.js','assistant.css','workspace-core.js','offline.js','workspace.js','workspace.css','mobile-ui.js','mobile-ui.css','pro-core.js','pro.js','pro.css','pro-readers.js','vault.js','vendor/cipher.js','history-store.js','push-client.js','manifest.webmanifest','icons/pesobase.svg','icons/pesobase-ribbon-32.png','icons/pesobase-ribbon-192.png','icons/pesobase-ribbon-512.png','icons/pesobase-ribbon-1024.png','icons/pesobase-ribbon-maskable.png','icons/pesobase-ribbon-180.png'];
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

self.addEventListener('push',event=>event.waitUntil((async()=>{
 let data={};try{data=event.data?.json()||{};}catch{}
 const id=/^[a-zA-Z0-9_-]{1,160}$/.test(data.id||'')?data.id:'reminder';
 await self.registration.showNotification('PESOBASE · Payment reminder',{body:id==='test'?'Your device can receive reminders.':'A bill or card payment is ready to review. Open PESOBASE for details.',icon:assetURL('icons/pesobase-ribbon-192.png'),badge:assetURL('icons/pesobase-ribbon-192.png'),tag:'pesobase-'+id,data:{id},actions:id==='test'?[]:[{action:'review',title:'Review'},{action:'snooze',title:'Snooze'}]});
})()));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{
 const url=new URL(scope.href);url.searchParams.set('view','studio');url.searchParams.set('tab','reminders');const id=event.notification.data?.id;
 if(event.action==='snooze'&&/^[a-zA-Z0-9_-]{1,160}$/.test(id||''))url.searchParams.set('snooze',id);
 const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true}),client=windows.find(c=>new URL(c.url).origin===scope.origin&&new URL(c.url).pathname.startsWith(scope.pathname));
 if(client){await client.navigate(url.href);await client.focus();}else await self.clients.openWindow(url.href);
})());});
