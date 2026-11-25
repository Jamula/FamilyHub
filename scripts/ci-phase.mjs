import {spawnSync} from 'node:child_process';

export class CommandFailure extends Error {
 constructor(command,result){
  super(`Validation command ${command} failed (${result.signal??result.status??'unknown status'})`,{cause:result.error});
  this.exitCode=Number.isInteger(result.status)&&result.status>0?result.status:1;
 }
}

export function runCommand(command,args,run=spawnSync){
 const result=run(command,args,{stdio:'inherit',shell:false});
 if(result.error||result.status!==0||result.signal)throw new CommandFailure(command,result);
}

export async function timed(name,fn,{now=()=>performance.now(),log=console.log}={}){
 const start=now();
 try{return await fn();}
 finally{log(`[ci timing] ${name}: ${((now()-start)/1000).toFixed(2)}s`);}
}
