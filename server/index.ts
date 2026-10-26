import express from 'express';
import {readFileSync} from 'node:fs';
import {EventStore,validate} from './events';
const app = express(); app.use(express.json({limit:'512kb'}));
const store = new EventStore();
const clients = new Set<express.Response>();
const publish=(event:unknown)=>{const saved=store.add(event); for(const client of clients)client.write(`data: ${JSON.stringify(saved)}\n\n`);return saved;};
app.get('/api/health', (_req,res) => res.json({ok:true,project:'agent-town'}));
app.get('/api/events/history',(_req,res)=>res.json(store.events));
app.get('/api/events/stream',(req,res)=>{
  res.set({'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});res.flushHeaders();
  res.write(`event: history\ndata: ${JSON.stringify(store.events)}\n\n`);clients.add(res);
  const heartbeat=setInterval(()=>res.write(': heartbeat\n\n'),15000);
  req.on('close',()=>{clearInterval(heartbeat);clients.delete(res);});
});
app.post('/api/events',(req,res)=>{try{res.status(201).json(publish(req.body));}catch(e){res.status(400).json({error:(e as Error).message});}});
let replaying=false;
app.post('/api/replay',(_req,res)=>{
  if(replaying){res.status(409).json({error:'Replay already running'});return;}
  const rows=readFileSync(new URL('../fixtures/agent-trace.jsonl',import.meta.url),'utf8').trim().split('\n').map(line=>validate({...JSON.parse(line),source:'replay'}));
  replaying=true;rows.forEach((row,index)=>setTimeout(()=>{publish(row);if(index===rows.length-1)replaying=false;},index*450));
  res.json({count:rows.length,source:'replay'});
});
app.use((err:Error,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(400).json({error:err.message}));
app.listen(5201,'127.0.0.1',()=>console.log('[agent-town] api ready on 5201'));
