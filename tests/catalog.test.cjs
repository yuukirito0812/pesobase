const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').resolve(__dirname,fs.existsSync(require('node:path').resolve(__dirname,'../dist/index.html'))?'../dist/index.html':'../index.html'),'utf8'),lines=html.split('\n');
const elements={catalogSearch:{value:''},catalogType:{value:'All'},catalogDesign:{value:'digital'},catalogCards:{},catalogCount:{}};
const ctx=vm.createContext({document:{getElementById:id=>elements[id]},esc:s=>String(s).replaceAll('<','&lt;')});
const definitions=lines.filter(l=>/^(const BANK_PRESETS=|const BANK_LOGOS=|const CARD_DESIGNS=|Object.assign\(BANK_PRESETS|function (safeLogo|bankFor|accountLogo|renderCardCatalog)\()/.test(l));
vm.runInContext(definitions.join('\n'),ctx);const run=s=>vm.runInContext(s,ctx);
assert.equal(run('Object.keys(BANK_LOGOS).length'),16);
for(const data of Object.values(run('BANK_LOGOS'))){const b=Buffer.from(data.split(',')[1],'base64');assert.equal(b.subarray(1,4).toString(),'PNG');}
assert.equal(run('CARD_DESIGNS.length'),12);
run('renderCardCatalog()');assert.match(elements.catalogCount.textContent,/17 providers/);
elements.catalogType.value='E-Wallet';run('renderCardCatalog()');assert.match(elements.catalogCount.textContent,/4 providers/);assert.match(elements.catalogCards.innerHTML,/GCash/);assert.doesNotMatch(elements.catalogCards.innerHTML,/Use BPI/);
elements.catalogSearch.value='maya';run('renderCardCatalog()');assert.match(elements.catalogCount.textContent,/1 providers/);
elements.catalogSearch.value='unknown';run('renderCardCatalog()');assert.match(elements.catalogCards.innerHTML,/No matching provider/);
assert.match(run("accountLogo({brand:'bpi',name:'BPI'})"),/data:image\/png/);
assert.match(run("accountLogo({brand:'bpi',logo:'data:image/png;base64,YWJj'})"),/base64,YWJj/);
assert.match(run("accountLogo({name:'LANDBANK'})"),/<span>LB/);
console.log('PASS: embedded PNGs, catalog totals, provider search/type filters, logo fallback and custom override.');
