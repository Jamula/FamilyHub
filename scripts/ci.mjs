import {runCommand as run, timed, CommandFailure} from './ci-phase.mjs';
import {readdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {validateRuntime} from './runtime.mjs';
import {validateProductVersion} from './check-version.mjs';
try{
const pkg=JSON.parse(await readFile('package.json','utf8'));
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
validateProductVersion({versionFile:await readFile('VERSION','utf8'),manifestVersion:pkg.version,lockVersion:lock.version,lockRootVersion:lock.packages?.['']?.version});
validateRuntime({version:process.versions.node,pin:(await readFile('.nvmrc','utf8')).trim(),engines:pkg.engines.node,lockedEngines:lock.packages[''].engines.node,workflow:await readFile('.github/workflows/validate.yml','utf8')});

const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
assert.equal(config.name,'jamula-family-coordinator');
assert.equal(config.workers_dev,true,'Keep the existing protected app URL enabled');
assert.equal(config.preview_urls,false,'Do not expose production-bound preview URLs');
assert.equal(config.assets.run_worker_first,true,'Authenticate before all static assets');
assert.equal(config.keep_vars,true,'Preserve dashboard runtime variables');
assert.equal(config.d1_databases[0].database_id,'d5437b6e-54ca-44b1-860d-e27c9064fb2b','Do not provision or replace production data');
assert.match(config.vars.ACCESS_TEAM_DOMAIN,/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/);
assert.ok(config.vars.ACCESS_AUD.length>30);

await timed('syntax',async()=>{
for(const folder of ['src','public','scripts','test'])for(const file of await readdir(folder))if(/\.(m?js)$/.test(file))run(process.execPath,['--check',folder+'/'+file]);
});
const coverage=process.env.GITHUB_ACTIONS==='true'||process.argv.includes('--coverage');
await timed(coverage?'tests and coverage':'tests',()=>run('npm',[...(coverage?['run','test:coverage']:['test'])]));
await timed('asset generation and dry-run build',()=>run('npm',['run','build']));
console.log('Validation passed. No live deployment, Google call or database mutation was performed.');
}catch(error){
 if(!(error instanceof CommandFailure))throw error;
 console.error(error.message);
 process.exitCode=error.exitCode;
}
