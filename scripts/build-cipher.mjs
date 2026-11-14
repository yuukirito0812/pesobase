import {build} from 'esbuild';
import {copyFileSync,existsSync} from 'node:fs';
const root=existsSync('dist/index.html')?'dist':'.';
await build({stdin:{contents:"export { gcm } from '@noble/ciphers/aes.js';",resolveDir:process.cwd(),sourcefile:'cipher-entry.js'},bundle:true,format:'iife',globalName:'PesoCipher',platform:'browser',minify:true,outfile:root+'/vendor/cipher.js',legalComments:'eof'});
copyFileSync('node_modules/@noble/ciphers/LICENSE',root+'/vendor/cipher-LICENSE.txt');
