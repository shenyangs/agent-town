import express from 'express';
const app = express(); app.use(express.json({limit:'512kb'}));
app.get('/api/health', (_req,res) => res.json({ ok: true, project: 'agent-town' }));
app.listen(5201, '127.0.0.1', () => console.log('[agent-town] api ready on 5201'));
