import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code = fs.readFileSync(new URL('../js/meta-pixel.js', import.meta.url), 'utf8');
function setup({origin='https://foundationrenovationcoaching.com', consent=null, gpc=false}={}) {
  const tags=[], elements=[], footer=[], listeners={}; let saved=consent;
  const node=()=>({ children:[], style:{}, hidden:false, setAttribute(){}, appendChild(n){this.children.push(n);}, addEventListener(n,cb){this[n]=cb;}, focus(){}, querySelector(){return this.children.find(n=>n.type==='button');} });
  const document={readyState:'complete', cookie:'',createElement:node,head:{appendChild:n=>tags.push(n)},body:{appendChild:n=>elements.push(n)},querySelector:()=>({appendChild:n=>footer.push(n)}),addEventListener:(n,cb)=>listeners[n]=cb};
  const window={location:{origin,reload(){}},addEventListener(){}};
  const ctx=vm.createContext({window,document,navigator:{globalPrivacyControl:gpc},localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v}});
  vm.runInContext(code,ctx); vm.runInContext(code,ctx);
  return {window,tags,elements,footer,listeners,document};
}
for (const consent of [null,'rejected']) {
 const s=setup({consent}); assert.equal(s.tags.length,0); assert.equal(s.window.fbq,undefined);
 assert.equal(s.elements.length,1); assert.equal(s.footer.length,1);
 assert.equal(s.footer[0].style.cssText.includes('position:fixed'),false);
 const panel=s.elements[0]; s.footer[0].click(); assert.equal(panel.hidden,false); panel.children[2].click();
 assert.equal(s.tags.length,1); assert.equal(s.tags[0].src,'https://connect.facebook.net/en_US/fbevents.js');
 assert.equal(s.window.fbq.queue.filter(a=>a[0]==='init').length,1);
 assert.equal(s.window.fbq.queue.filter(a=>a[1]==='PageView').length,1);
 s.listeners.click({target:{closest:()=>({href:'https://calendar.app.google/AaKjGPcvFGHM815i9'})}});
 assert.equal(s.window.fbq.queue.at(-1)[1],'DiscoveryCallClick');
 assert.equal(s.window.fbq.queue.some(a=>a[1]==='Lead'||a[1]==='Schedule'),false);
 panel.children[1].click(); const count=s.window.fbq.queue.length;
 s.listeners.click({target:{closest:()=>({href:'https://calendar.app.google/AaKjGPcvFGHM815i9'})}});
 assert.equal(s.window.fbq.queue.length,count);
 panel.children[2].click(); assert.equal(s.tags.length,1); assert.equal(s.window.fbq.queue.at(-1)[1],'grant');
}
assert.equal(setup({consent:'accepted'}).tags.length,1);
assert.equal(setup({consent:'accepted',gpc:true}).tags.length,0);
for(const origin of ['http://localhost:4173','https://preview.pages.dev','https://www.foundationrenovationcoaching.com']) assert.equal(setup({origin,consent:'accepted'}).elements.length,0);
console.log('Meta consent, rejection, withdrawal, reacceptance, GPC, production-only loading, and click-only event checks passed; no network requests sent.');
