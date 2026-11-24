import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,SignJWT} from 'jose';
import {createMcpResourceBoundary} from '../../src/integrations/mcp-resource.js';
import {createMcpTaskGateway} from '../../src/integrations/mcp-task-gateway.js';

// This is an isolated synthetic contract fixture: no Worker route, real OAuth
// issuer, Cloudflare binding, account, provider, private task or outbound request.
const resource='https://synthetic.example/mcp',issuer='https://issuer.synthetic.example/';
const protocol='2026-07-28',meta={
 'io.modelcontextprotocol/protocolVersion':protocol,
 'io.modelcontextprotocol/clientCapabilities':{}
};
async function fixture(){
 const {privateKey,publicKey}=await generateKeyPair('ES256');
 const members=new Map([
  ['fictional-owner',{id:'fictional-owner',role:'owner'}],
  ['fictional-parent',{id:'fictional-parent',role:'parent'}],
  ['fictional-child-a',{id:'fictional-child-a',role:'child'}],
  ['fictional-child-b',{id:'fictional-child-b',role:'child'}]
 ]);
 const clients=new Map([
  ['fictional-owner',new Set(['owner-test'])],
  ['fictional-parent',new Set(['parent-test'])],
  ['fictional-child-a',new Set(['client-one'])],
  ['fictional-child-b',new Set(['client-two'])]
 ]);
 const tasks=new Map([
  ['synthetic-family',{id:'synthetic-family',room:'family',title:'Choose a fictional park',version:1,proposal:null}],
  ['synthetic-parents',{id:'synthetic-parents',room:'parents',title:'Parents-only fictional task',version:1,proposal:null}]
 ]);
 const receipts=new Map();
 const permitted=(member,task)=>Boolean(task&&(task.room==='family'||member.role==='owner'||member.role==='parent'));
 let sideEffects=0;
 const backend={
  async read(member,{taskId}){
   const task=tasks.get(taskId);
   if(!permitted(member,task))return {ok:false,error:'Task unavailable'};
   return {ok:true,task:{...task,proposal:task.proposal&&{...task.proposal}},synthetic:true};
  },
  async propose(member,args){
   const task=tasks.get(args.taskId);
   if(!permitted(member,task))return {ok:false,error:'Task unavailable'};
   const key=member.id+':'+args.requestId;
   const canonical=JSON.stringify([args.taskId,args.expectedVersion,args.option]);
   const existing=receipts.get(key);
   if(existing)return existing.canonical===canonical?
    {ok:true,receipt:{...existing.receipt},synthetic:true}:
    {ok:false,error:'Idempotency conflict'};
   if(task.version!==args.expectedVersion)return {ok:false,error:'Version conflict',version:task.version};
   task.version++;
   task.proposal={option:args.option,by:member.id,clientId:member.clientId,version:task.version};
   const receipt={requestId:args.requestId,taskId:task.id,version:task.version,by:member.id,option:args.option};
   receipts.set(key,{canonical,receipt});
   return {ok:true,receipt:{...receipt},synthetic:true};
  }
 };
 const boundary=createMcpResourceBoundary({
  resource,issuer,verificationKey:publicKey,
  resolveMember:async sub=>members.get(sub)||null,
  resolveClient:async(memberId,clientId)=>clients.get(memberId)?.has(clientId)===true
 });
 const gateway=createMcpTaskGateway({resource,boundary,backend});
 const token=(sub,clientId,scope='tasks:read tasks:write')=>
  new SignJWT({scope,client_id:clientId,role:'owner',room:'parents'})
   .setProtectedHeader({alg:'ES256',typ:'at+jwt'}).setIssuer(issuer)
   .setAudience(resource).setSubject(sub).setIssuedAt().setExpirationTime('5m')
   .sign(privateKey);
 async function invoke(bearer,name,args){
  const rpc={jsonrpc:'2.0',id:1,method:'tools/call',params:{_meta:meta,name,arguments:args}};
  const response=await gateway.handle(new Request(resource,{
   method:'POST',headers:{
    authorization:'Bearer '+bearer,'content-type':'application/json',
    'mcp-protocol-version':protocol,'mcp-method':'tools/call','mcp-name':name
   },body:JSON.stringify(rpc)
  }));
  // Authorization can correctly return an empty 401/403. Do not parse a missing body.
  const body=response.headers.get('content-type')?.includes('application/json')?await response.json():null;
  return {status:response.status,body};
 }
 return {token,invoke,clients,members,tasks,receipts,get sideEffects(){return sideEffects}};
}
const get=taskId=>({taskId});
const propose=(requestId,expectedVersion,option='park-a',taskId='synthetic-family')=>({taskId,requestId,expectedVersion,option});

test('two independently signed synthetic client identities share one versioned family proposal',async()=>{
 const f=await fixture();
 const first=await f.token('fictional-child-a','client-one');
 const second=await f.token('fictional-child-b','client-two','tasks:read');
 const before=await f.invoke(first,'task_read',get('synthetic-family'));
 assert.equal(before.status,200);
 assert.equal(before.body.result.structuredContent.task.version,1);
 const saved=await f.invoke(first,'task_propose',propose('synthetic-plan-1',1));
 assert.equal(saved.status,200);
 assert.equal(saved.body.result.isError,false);
 assert.deepEqual(saved.body.result.structuredContent.receipt,{
  requestId:'synthetic-plan-1',taskId:'synthetic-family',version:2,by:'fictional-child-a',option:'park-a'
 });
 const readback=await f.invoke(second,'task_read',get('synthetic-family'));
 assert.equal(readback.status,200);
 assert.deepEqual(readback.body.result.structuredContent.task.proposal,{
  option:'park-a',by:'fictional-child-a',clientId:'client-one',version:2
 });
 assert.equal(readback.body.result.structuredContent.task.version,2);
 assert.equal(f.sideEffects,0);
});
test('same-member replay is one write; altered replay and stale competing write do not mutate',async()=>{
 const f=await fixture(),token=await f.token('fictional-child-a','client-one');
 const once=await f.invoke(token,'task_propose',propose('synthetic-idempotent',1));
 const again=await f.invoke(token,'task_propose',propose('synthetic-idempotent',1));
 assert.deepEqual(again.body.result.structuredContent.receipt,once.body.result.structuredContent.receipt);
 const tampered=await f.invoke(token,'task_propose',propose('synthetic-idempotent',1,'park-b'));
 assert.equal(tampered.body.result.isError,true);
 assert.match(tampered.body.result.structuredContent.error,/Idempotency/);
 const stale=await f.invoke(token,'task_propose',propose('synthetic-other',1,'park-b'));
 assert.equal(stale.body.result.isError,true);
 assert.match(stale.body.result.structuredContent.error,/Version conflict/);
 assert.equal(f.tasks.get('synthetic-family').version,2);
 assert.equal(f.receipts.size,1);
});
test('parents-only task remains invisible to child even with owner role/room forged inside signed token',async()=>{
 const f=await fixture(),child=await f.token('fictional-child-a','client-one');
 for(const name of ['task_read','task_propose']){
  const result=await f.invoke(child,name,name==='task_read'?get('synthetic-parents'):propose('synthetic-private',1,'park-a','synthetic-parents'));
  assert.equal(result.status,200);
  assert.equal(result.body.result.isError,true);
  assert.equal(result.body.result.structuredContent.error,'Task unavailable');
 }
 const adult=await f.token('fictional-parent','parent-test','tasks:read');
 const allowed=await f.invoke(adult,'task_read',get('synthetic-parents'));
 assert.equal(allowed.body.result.structuredContent.task.room,'parents');
 assert.equal(f.tasks.get('synthetic-parents').version,1);
 assert.equal(f.receipts.size,0);
});
test('revoked member/client and wrong scope stop requests before backend or replay receipts',async()=>{
 const f=await fixture();
 const child=await f.token('fictional-child-a','client-one');
 const readOnly=await f.token('fictional-child-b','client-two','tasks:read');
 const restricted=await f.invoke(readOnly,'task_propose',propose('synthetic-b',1));
 assert.equal(restricted.status,403);
 assert.equal(f.receipts.size,0);
 f.clients.get('fictional-child-a').delete('client-one');
 const removedClient=await f.invoke(child,'task_read',get('synthetic-family'));
 assert.equal(removedClient.status,401);
 f.clients.get('fictional-child-a').add('client-one');
 f.members.delete('fictional-child-a');
 const removedMember=await f.invoke(child,'task_propose',propose('synthetic-a',1));
 assert.equal(removedMember.status,401);
 assert.equal(f.tasks.get('synthetic-family').version,1);
});
test('invalid tool arguments and unapproved external actions do not reach a writable backend',async()=>{
 const f=await fixture(),token=await f.token('fictional-child-a','client-one');
 for(const [name,args] of [
  ['send_email',{to:'someone'}],['task_propose',{...propose('synthetic-a',1),role:'owner'}],
  ['task_propose',{...propose('synthetic-a',1),option:'book-now'}],
  ['task_propose',{...propose('synthetic-a',1),expectedVersion:'1'}]
 ]){
  const result=await f.invoke(token,name,args);
  assert.equal(result.status,400);
 }
 assert.equal(f.tasks.get('synthetic-family').version,1);
 assert.equal(f.receipts.size,0);
 assert.equal(f.sideEffects,0);
});
