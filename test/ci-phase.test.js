import test from 'node:test';
import assert from 'node:assert/strict';
import {runCommand,timed,CommandFailure} from '../scripts/ci-phase.mjs';

test('phase timing reports success and every subprocess failure before stopping subsequent work',async()=>{
 for(const result of [{status:0,signal:null},{status:7,signal:null},{status:null,signal:'SIGTERM'},{status:null,error:new Error('spawn failed')}]){
  const logs=[];let tick=0;let next=false;
  const work=async()=>{
   await timed('validation',()=>runCommand('fixture',[],()=>result),{now:()=>tick++*1250,log:s=>logs.push(s)});
   next=true;
  };
  if(result.status===0){await work();assert.equal(next,true);}
  else{
   await assert.rejects(work,error=>error instanceof CommandFailure&&error.exitCode===(result.status??1));
   assert.equal(next,false);
  }
  assert.deepEqual(logs,['[ci timing] validation: 1.25s']);
 }
});

test('async validation rejection still emits phase timing and propagates the original error',async()=>{
 const failure=new Error('synthetic syntax failure');const logs=[];
 await assert.rejects(timed('syntax',async()=>{throw failure;},{now:()=>0,log:s=>logs.push(s)}),error=>error===failure);
 assert.deepEqual(logs,['[ci timing] syntax: 0.00s']);
});
