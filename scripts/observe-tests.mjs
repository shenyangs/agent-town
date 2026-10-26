import {spawn} from 'node:child_process';
const send=async(type,message)=>{const r=await fetch('http://127.0.0.1:5201/api/events',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(5000),body:JSON.stringify({ts:new Date().toISOString(),agentId:'atlas',type,message,source:'live',file:'tests/events.test.ts'})});if(!r.ok)throw new Error(`事件被拒绝：HTTP ${r.status}`);};
try{
 if(!process.env.npm_execpath)throw new Error('请使用 npm run observe 启动观察脚本。');
 await send('testing','本地观察脚本正在启动 npm run test');
 const code=await new Promise((resolve,reject)=>{const p=spawn(process.execPath,[process.env.npm_execpath,'run','test'],{stdio:'inherit',shell:false});p.on('error',reject);p.on('exit',resolve);setTimeout(()=>p.kill('SIGTERM'),60000).unref();});
 await send(code===0?'idle':'error',`实际观察到 npm run test 退出码：${code}`);
 process.exitCode=code===0?0:1;
}catch(e){console.error(`观察失败：${e.message}。请先运行 npm run dev，确认 API 端口 5201 可用。`);process.exitCode=1;}
