/* Device restore points use IndexedDB; locked devices encrypt each snapshot with the vault data key. */
(()=>{
'use strict';const NAME='pesobase-restore-points-v1',FALLBACK='pesobase-restore-points-fallback';let database;
const encode=(value,id,encrypt=true)=>window.PesoVault?.pack(JSON.stringify(value),'restore:'+id,encrypt)||JSON.stringify(value),decode=(value,id)=>JSON.parse(window.PesoVault?.unpack(value,'restore:'+id)||value);
async function db(){if(database)return database;if(!window.indexedDB)return null;database=await new Promise((resolve,reject)=>{const r=indexedDB.open(NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore('points',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not open restore-point storage.'));});return database;}
async function all(){const d=await db();if(!d)return JSON.parse(PesoStorage.getItem(FALLBACK)||'[]');return new Promise((resolve,reject)=>{const r=d.transaction('points').objectStore('points').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function mutate(put=[],remove=[]){const d=await db();if(!d){let rows=await all();rows=rows.filter(r=>!remove.includes(r.id)&&!put.some(x=>x.id===r.id));PesoStorage.setItem(FALLBACK,JSON.stringify([...rows,...put]));return;}return new Promise((resolve,reject)=>{const tx=d.transaction('points','readwrite'),store=tx.objectStore('points');for(const row of put)store.put(row);for(const id of remove)store.delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(Error('Restore point could not be saved. Device storage may be full.'));tx.onabort=()=>reject(Error('Restore-point update was interrupted.'));});}
async function list(scope){return (await all()).filter(r=>r.scope===scope).sort((a,b)=>b.at-a.at).map(({blob,...meta})=>meta);}
async function create(scope,state,title){const id=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),row={id,scope,at:Date.now(),title:String(title).slice(0,100),count:state.transactions.length,blob:encode(state,id)},old=await list(scope);await mutate([row],old.slice(9).map(x=>x.id));return id;}
async function get(scope,id){const row=(await all()).find(x=>x.scope===scope&&x.id===id);if(!row)throw Error('This restore point is no longer available.');return decode(row.blob,id);}
async function remove(scope,id){const row=(await all()).find(x=>x.id===id&&x.scope===scope);if(row)await mutate([],[id]);}
async function rewrap(encrypt=true){const rows=await all();await mutate(rows.map(r=>({...r,blob:encode(decode(r.blob,r.id),r.id,encrypt)})));}
window.PesoHistory={list,create,get,remove,rewrap};
})();
