import {spawn} from 'node:child_process';
const send=async(type,message)=>{const r=await fetch('http://127.0.0.1:5201/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ts:new Date().toISOString(),agentId:'atlas',type,message,source:'live',file:'tests/events.test.ts'})});if(!r.ok)throw new Error(`Event rejected: ${r.status}`);};
await send('testing','Starting npm run test from the local observation script');
const code=await new Promise((resolve,reject)=>{const p=spawn('npm',['run','test'],{stdio:'inherit',shell:false});p.on('error',reject);p.on('exit',resolve);setTimeout(()=>p.kill('SIGTERM'),60000).unref();});
await send(code===0?'idle':'error',`Observed npm run test exit code ${code}`);
process.exitCode=code===0?0:1;
