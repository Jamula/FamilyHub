import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrivateAiFeedback} from '../../../src/integrations/feedback/private-intake.js';
const id='12345678-1234-4123-8123-123456789abc';
const args={id,title:'Synthetic report',details:'A fictional button did not respond',confirmation:'exact-consent'};
const actor={id:'fictional-child',email:'child@example.invalid',role:'child'};
function fixture(){
 let active=true,consent=true,calls=[];const receipts=new Map();
 const gateway=createPrivateAiFeedback({enabled:true,resolvePrincipal:async c=>active&&c==='verified-client'?actor:null,
 verifyConsent:async(c,u,p,confirmation)=>consent&&c==='verified-client'&&u===actor&&confirmation===args.confirmation&&p.id===id&&p.title===args.title&&p.details===args.details,
 save:async(request,_env,user,send)=>{const body=await request.json();calls.push({path:new URL(request.url).pathname,body,user});assert.throws(()=>send());if(!receipts.has(body.id))receipts.set(body.id,{id:body.id,state:'pending'});return Response.json(receipts.get(body.id));}});
 return {gateway,calls,receipts,revoke:()=>{active=false;},withdraw:()=>{consent=false;}};
}
test('private text intake uses verified reporter, fixed submit route and stable retry ID',async()=>{
 const f=fixture(),a=await f.gateway.submit('verified-client',args,{}),b=await f.gateway.submit('verified-client',args,{});
 assert.deepEqual(a,{ok:true,receipt:{id,state:'pending'}});assert.deepEqual(b,a);assert.equal(f.receipts.size,1);
 assert.deepEqual(f.calls[0],{path:'/api/feedback/submit',body:{id,title:args.title,details:args.details,confirmPrivateFeedback:true,includeContext:false,includeName:false},user:actor});
 f.revoke();assert.equal((await f.gateway.submit('verified-client',args,{})).ok,false);assert.equal(f.calls.length,2);
});
test('default-off, missing consent, spoofed identity, altered payload and unsupported screenshots fail before storage',async()=>{
 const f=fixture(),off=createPrivateAiFeedback({resolvePrincipal(){throw Error('must not call');}});
 assert.equal((await off.submit('verified-client',args,{})).ok,false);
 for(const a of [{...args,role:'owner'},{...args,screenshot:{}},{...args,details:'changed'},{...args,confirmation:''},{...args,id:'bad'}])assert.equal((await f.gateway.submit('verified-client',a,{})).ok,false);
 assert.equal((await f.gateway.submit('forged-client',args,{})).ok,false);
 f.withdraw();assert.equal((await f.gateway.submit('verified-client',args,{})).ok,false);assert.equal(f.calls.length,0);
});
test('storage exceptions, invalid acknowledgements and quota denial preserve retry guidance and expose no diagnostics',async()=>{
 for(const save of [async()=>{throw Error('private synthetic secret');},async()=>Response.json({id:'wrong',state:'pending'}),async()=>Response.json({error:'private detail'},{status:429})]){
  const gateway=createPrivateAiFeedback({enabled:true,resolvePrincipal:async()=>actor,verifyConsent:async()=>true,save});
  const result=await gateway.submit('verified-client',args,{});
  assert.deepEqual(result,{ok:false,error:'Private feedback unavailable; preserve the draft and submission ID'});
 }
});

test('submission ID conflicts request fresh consent without leaking ownership or retrying blindly',async()=>{
 let calls=0;const gateway=createPrivateAiFeedback({enabled:true,resolvePrincipal:async()=>actor,verifyConsent:async()=>true,save:async()=>{calls++;return Response.json({error:'private reporter details'},{status:409});}});
 const result=await gateway.submit('verified-client',args,{});
 assert.deepEqual(result,{ok:false,error:'Submission ID conflict; review the existing submission if authorized, or obtain fresh consent for a new submission ID'});
 assert.equal(calls,1);
});

test('persisted report survives lost or malformed acknowledgement and a freshly consented same-ID retry',async()=>{
 for(const failure of ['lost','malformed']){
  const reports=new Map();let consent='first-consent',checks=0,writes=0,attempts=0;
  const gateway=createPrivateAiFeedback({enabled:true,resolvePrincipal:async()=>actor,
   verifyConsent:async(_context,user,payload,confirmation)=>{
    checks++;
    return user===actor&&confirmation===consent&&payload.id===id&&payload.title===args.title&&payload.details===args.details;
   },
   save:async(request,_env,user)=>{
    assert.equal(user,actor);const payload=await request.json();attempts++;
    if(!reports.has(payload.id)){writes++;reports.set(payload.id,{id:payload.id,state:'pending'});}
    if(attempts===1){
     if(failure==='lost')throw Error('synthetic lost acknowledgement');
     return Response.json({id:payload.id,state:'invalid'});
    }
    return Response.json(reports.get(payload.id));
   }});
  const first=await gateway.submit('verified-client',{...args,confirmation:'first-consent'},{});
  assert.deepEqual(first,{ok:false,error:'Private feedback unavailable; preserve the draft and submission ID'});
  assert.equal(reports.size,1);assert.equal(writes,1);
  consent='fresh-consent';
  assert.equal((await gateway.submit('verified-client',{...args,confirmation:'first-consent'},{})).ok,false);
  assert.equal(attempts,1);
  const retry=await gateway.submit('verified-client',{...args,confirmation:'fresh-consent'},{});
  assert.deepEqual(retry,{ok:true,receipt:reports.get(id)});
  assert.equal(checks,3);assert.equal(attempts,2);assert.equal(writes,1);assert.equal(reports.size,1);
 }
});
