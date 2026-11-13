/* Run with Node.js and sharp installed. All logo surfaces share this vector path. */
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),assets=fs.existsSync(path.join(root,'dist'))?path.join(root,'dist'):root;
const source=fs.readFileSync(path.join(assets,'icons/pesobase.svg'),'utf8');
async function main(){
 for(const size of [180,192,512,1024]) await sharp(Buffer.from(source),{density:72*size/64}).resize(size,size).png().toFile(path.join(assets,'icons/pesobase-p-'+size+'.png'));
 const maskable=source.replace('rx="14"','rx="0"');
 await sharp(Buffer.from(maskable),{density:576}).resize(512,512).png().toFile(path.join(assets,'icons/pesobase-p-maskable.png'));
 const logo=source.match(/<path\b[^>]*\/>/)[0].replace('fill="#dbe9bd"','fill="var(--logo-ink,#dbe9bd)"');
 const inline='<svg class="pb-symbol" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="currentColor"/>'+logo+'</svg>';
 const index=path.join(assets,'index.html'),html=fs.readFileSync(index,'utf8');
 if((html.match(/<svg class="pb-symbol"/g)||[]).length!==2)throw Error('Expected both website brand marks');
 fs.writeFileSync(index,html.replace(/<svg class="pb-symbol"[^>]*>[\s\S]*?<\/svg>/g,inline));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
