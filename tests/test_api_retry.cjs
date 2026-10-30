const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/js/api.js','utf8');
function context(responses){let calls=0;const c={URL,DOMException,setTimeout,clearTimeout,window:{},SUPRIMENTOS_CONFIG:{apiUrl:'https://test.invalid',apiPrefix:'/api/suprimentos-html',sessionKey:'session'},sessionStorage:{getItem:()=> 'test-session'},fetch:async()=>{calls++;const x=responses.shift();if(x instanceof Error)throw x;const status=typeof x==='number'?x:x.status;return {ok:status===200,status,json:async()=>typeof x==='object'&&x.body?x.body:({ok:true})};}};vm.createContext(c);vm.runInContext(source,c);return {api:c.window.SuprimentosApi,calls:()=>calls};}
(async()=>{
 let c=context([502,200]);assert.equal((await c.api.get('painel')).ok,true);assert.equal(c.calls(),2);
 c=context([503,503]);await assert.rejects(c.api.get('painel'),e=>e.status===503);assert.equal(c.calls(),2);
 c=context([401,200]);await assert.rejects(c.api.get('painel'),e=>e.status===401);assert.equal(c.calls(),1);
 c=context([502,200]);await assert.rejects(c.api.post('robos/ciclo/executar',{}),e=>e.status===502);assert.equal(c.calls(),1);
 c=context([new TypeError('Network'),200]);assert.equal((await c.api.get('painel')).ok,true);assert.equal(c.calls(),2);
 c=context([502,200]);const a=new AbortController(),p=c.api.get('painel',{},a.signal);a.abort();await assert.rejects(p,e=>e.name==='AbortError');assert.equal(c.calls(),1);
 c=context([{status:403,body:{detail:{codigo:'PRAZO_ADMIN_TEMPORARIO'}}}]);await assert.rejects(c.api.get('filtros',{relatorio:'prazo'}),e=>e.status===403&&e.code==='PRAZO_ADMIN_TEMPORARIO');assert.equal(c.calls(),1);
 console.log('OK: GET retry bounded, authorization and POST not repeated, abort respected');
})().catch(e=>{console.error(e);process.exitCode=1;});
