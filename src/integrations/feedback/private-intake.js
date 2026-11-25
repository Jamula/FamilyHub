// Default-off, unmounted text-only AI intake. The host must authenticate the
// principal and resolve the current connected member and exact-action consent.
// Reuse the existing private feedback service; never grant publication authority.
import {feedbackAPI} from '../../feedback.js';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const keys=['id','title','details','confirmation'];
const invalid=()=>({ok:false,error:'Invalid private feedback request'});
const denied=()=>({ok:false,error:'Private feedback not authorized'});
const unavailable=()=>({ok:false,error:'Private feedback unavailable; preserve the draft and submission ID'});
export function createPrivateAiFeedback({enabled=false,resolvePrincipal,verifyConsent,save=feedbackAPI}={}){
 if(typeof enabled!=='boolean')throw Error('Invalid AI feedback configuration');
 if(!enabled)return Object.freeze({async submit(){return unavailable();}});
 if(typeof resolvePrincipal!=='function'||typeof verifyConsent!=='function'||typeof save!=='function')throw Error('Invalid AI feedback configuration');
 return Object.freeze({async submit(verifiedContext,args,env){
  if(!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).length!==keys.length||!keys.every(k=>Object.hasOwn(args,k))||
   typeof args.id!=='string'||!uuid.test(args.id)||typeof args.title!=='string'||!args.title.trim()||args.title.length>120||
   typeof args.details!=='string'||!args.details.trim()||args.details.length>3000||
   typeof args.confirmation!=='string'||!args.confirmation||args.confirmation.length>2048)return invalid();
  try{
   const user=await resolvePrincipal(verifiedContext);
   if(!user||typeof user.id!=='string'||!user.id||typeof user.email!=='string'||!user.email||!['owner','parent','child'].includes(user.role))return denied();
   const payload=Object.freeze({id:args.id,title:args.title.trim(),details:args.details.trim(),confirmPrivateFeedback:true,includeContext:false,includeName:false});
   if(await verifyConsent(verifiedContext,user,payload,args.confirmation)!==true)return denied();
   // Internal invocation only: fixed route, no user-supplied URL, no publication,
   // no raw context, image or reporter fields. Existing service validates identity,
   // feature flag, encryption, quota and idempotency and derives the reporter.
   const origin='https://private-feedback.invalid';
   const request=new Request(origin+'/api/feedback/submit',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(payload)});
   const response=await save(request,env,user,()=>{throw Error('External publication is not allowed');});
   if(!response.ok)return response.status===403?denied():unavailable();
   const body=await response.json();
   if(body?.id!==payload.id||!['pending','published','rejected','uncertain','publishing'].includes(body.state))return unavailable();
   return {ok:true,receipt:{id:body.id,state:body.state}};
  }catch{return unavailable();}
 }});
}
