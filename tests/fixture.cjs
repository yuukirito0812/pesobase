const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(fs.existsSync(path.join(root,'dist/index.html'))?path.join(root,'dist/index.html'):path.join(root,'index.html'),'utf8');
const assetRoot=fs.existsSync(path.join(root,'dist'))?path.join(root,'dist'):root;
html=html.replace(/<script src="((?:assistant(?:-core|-voice)?|workspace(?:-core)?|offline|mobile-ui|pro(?:-core|-readers)?|vault|history-store|push-client|vendor\/cipher)\.js)[^"]*"><\/script>/g,(_,file)=>'<script>'+fs.readFileSync(path.join(assetRoot,file),'utf8')+'</script>');
async function fixture(t,storage={},options={}){
 const errors=[],downloads=[]; const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://pesobase.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;Object.defineProperty(w.crypto,'subtle',{value:require('node:crypto').webcrypto.subtle});w.scrollTo=()=>{};w.structuredClone=structuredClone;w.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:qa'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});w.fetch=async()=>{throw Error('Unexpected network access')};w.confirm=()=>{throw Error('Native confirmation should not be required')};for(const [k,v]of Object.entries(storage))w.localStorage.setItem(k,v);options.beforeParse?.(w)}});
 const w=dom.window;await new Promise(r=>setTimeout(r,20));if(options.enterLocal!==false)w.enterLocal();
 const evalJS=code=>w.eval(code),state=()=>evalJS('state'),find=s=>w.document.querySelector(s);
 function fill(formSelector,values){const form=find(formSelector);assert.ok(form,'Missing form '+formSelector);for(const [key,value]of Object.entries(values)){const field=form.elements.namedItem(key);assert.ok(field,'Missing field '+key);field.value=String(value);field.dispatchEvent(new w.Event('input',{bubbles:true}));field.dispatchEvent(new w.Event('change',{bubbles:true}))}return form}
 function submit(selector,values={}){const form=fill(selector,values);assert.ok(form.checkValidity(),'Native validation failed in '+selector);form.requestSubmit()}
 function click(selector){const button=find(selector);assert.ok(button,'Missing button '+selector);button.click()}
 function add(type='Expense',data={}){w.openTransaction(type==='Income'?'income':type==='Transfer'?'transfer':'expense');submit('#txForm',{typeLabel:type,amount:'100.00',description:'QA '+type,...data});return state().transactions.at(-1)}
 t.after(()=>{assert.deepEqual(errors,[],'No runtime errors');dom.window.close()});
 return {w,dom,errors,downloads,evalJS,state,find,fill,submit,click,add};
}
function confirm(a){a.click('#confirmAction')}

module.exports={fixture};
