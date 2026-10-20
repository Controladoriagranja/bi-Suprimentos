"use strict";
class SuprimentosApiError extends Error{
 constructor(message,status=0){super(message);this.name='SuprimentosApiError';this.status=status;}
}
window.SuprimentosApi={
 async post(resource,body){return this.get(resource,{},undefined,{method:'POST',body:JSON.stringify(body)});},
 async get(resource,params={},signal,options={}){
  let token='';try{token=sessionStorage.getItem(SUPRIMENTOS_CONFIG.sessionKey)||'';}catch(_){}
  if(!token)throw new SuprimentosApiError('Abra este relatório pela CENTRAL para utilizar sua sessão.',401);
  const base=new URL(SUPRIMENTOS_CONFIG.apiUrl),url=new URL(SUPRIMENTOS_CONFIG.apiPrefix+'/'+resource,base);
  if(url.origin!==base.origin||!url.pathname.startsWith(SUPRIMENTOS_CONFIG.apiPrefix+'/'))throw new SuprimentosApiError('Consulta não configurada.');
  for(const [key,value] of Object.entries(params)){
   for(const item of Array.isArray(value)?value:[value])if(item!==''&&item!=null)url.searchParams.append(key,item);
  }
  let response;
  const canRetry=!options.method||options.method==='GET';
  for(let attempt=0;attempt<2;attempt++){
   try{response=await fetch(url,{...options,headers:{'Content-Type':'application/json',Accept:'application/json',Authorization:'Bearer '+token},signal,cache:'no-store',credentials:'omit'});if(!canRetry||attempt||![502,503,504].includes(response.status))break;}
   catch(e){if(e.name==='AbortError')throw e;if(!canRetry||attempt)throw new SuprimentosApiError('Não foi possível conectar ao serviço. Tente atualizar novamente.');}
   await new Promise((resolve,reject)=>{if(signal?.aborted){reject(new DOMException('Consulta cancelada','AbortError'));return;}const abort=()=>{clearTimeout(timer);reject(new DOMException('Consulta cancelada','AbortError'));};const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},600);signal?.addEventListener('abort',abort,{once:true});});
  }
  if(!response.ok)throw new SuprimentosApiError(({401:'Sua sessão expirou. Entre novamente pela CENTRAL.',403:'Sua sessão não tem acesso a esta consulta.',404:'Esta consulta ainda não está disponível no serviço publicado.',422:'Confira as datas e os filtros selecionados.',500:'Não foi possível concluir a consulta.',502:'O serviço de dados está indisponível.',503:'O serviço de dados está temporariamente indisponível.'})[response.status]||'Não foi possível concluir a consulta.',response.status);
  let data;try{data=await response.json();}catch(_){throw new SuprimentosApiError('O serviço retornou uma resposta inválida.');}
  if(data?.ok!==true)throw new SuprimentosApiError('Resposta incompatível com o Suprimentos.');return data;
 }
};
