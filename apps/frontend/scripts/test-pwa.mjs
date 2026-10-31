import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8');
function worker(){
 const handlers={};const requests=[];
 const cached={static:true};const cache={addAll:async urls=>requests.push(...urls),match:async()=>cached};
 const self={location:{href:'https://example.test/ssdc/sw.js'},clients:{claim:async()=>{}},skipWaiting:()=>{},addEventListener:(name,fn)=>handlers[name]=fn};
 const context={self,URL,Response,caches:{open:async()=>cache,keys:async()=>[],delete:async()=>true},fetch:async()=>{throw Error('offline')}};
 vm.runInNewContext(source,context);
 return {handlers,requests,cached};
}
test('Manifest supplies standalone identity, scoped start URL and PNG icons',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../dist/manifest.webmanifest',import.meta.url),'utf8'));
 assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');
 for(const size of ['192x192','512x512']){const icon=manifest.icons.find(i=>i.sizes===size);assert.ok(icon);const bytes=await readFile(new URL('../dist/'+icon.src,import.meta.url));assert.equal(bytes.subarray(1,4).toString(),'PNG');}
});
test('Install pre-caches only build assets, with no dynamic API paths',async()=>{
 const w=worker();let promise;w.handlers.install({waitUntil:value=>promise=value});await promise;
 assert.ok(w.requests.some(url=>url.endsWith('/index.html')));assert.ok(w.requests.some(url=>url.includes('/icons/ssdc-192.png')));
 assert.ok(w.requests.every(url=>!url.includes('/api/')));
});
test('Sensitive, authenticated, cross-origin, query-bearing and write requests bypass the worker',()=>{
 const w=worker();for(const request of [
  {url:'https://example.test/api/v1/documents',method:'GET'},
  {url:'https://example.test/ssdc/api/v1/documents',method:'GET'},
  {url:'https://example.test/ssdc/assets/embleme-rdc.jpeg',method:'GET',authorization:true},
  {url:'https://example.test/ssdc/?code=secret&state=nonce',method:'GET',mode:'navigate'},
  {url:'https://id.example.test/token',method:'GET'},
  {url:'https://example.test/ssdc/index.html',method:'POST'},
 ]){let intercepted=false;w.handlers.fetch({request:{...request,mode:request.mode??'cors',headers:new Headers(request.authorization?{authorization:'Bearer synthetic'}:{})},respondWith:()=>intercepted=true});assert.equal(intercepted,false,request.url);}
});
test('Offline navigation can use the static shell; private unknown paths cannot',async()=>{
 const w=worker();let result;w.handlers.fetch({request:{url:'https://example.test/ssdc/',method:'GET',mode:'navigate',headers:new Headers()},respondWith:p=>result=p});assert.equal(await result,w.cached);
 let intercepted=false;w.handlers.fetch({request:{url:'https://example.test/ssdc/documents/secret',method:'GET',mode:'navigate',headers:new Headers()},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
});
