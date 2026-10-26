export const types = ['planning','writing','testing','idle','error'] as const;
export type AgentEvent = {ts:string; agentId:string; type:typeof types[number]; message:string; source:'live'|'replay'|'imported'; file?:string; id:number};
export function validate(input: unknown): Omit<AgentEvent,'id'> {
  if (!input || typeof input !== 'object') throw new Error('Expected an event object');
  const e = input as Record<string,unknown>;
  if (typeof e.ts !== 'string' || !Number.isFinite(Date.parse(e.ts))) throw new Error('ts must be an ISO timestamp');
  if (typeof e.agentId !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(e.agentId)) throw new Error('Invalid agentId');
  if (!types.includes(e.type as AgentEvent['type'])) throw new Error('Invalid event type');
  if (typeof e.message !== 'string' || !e.message.trim()) throw new Error('message is required');
  if (e.source !== undefined && !['live','replay','imported'].includes(String(e.source))) throw new Error('Invalid source');
  if (e.file !== undefined && typeof e.file !== 'string') throw new Error('Invalid file');
  return {ts:e.ts,agentId:e.agentId,type:e.type as AgentEvent['type'],message:e.message.slice(0,500),source:(e.source || 'live') as AgentEvent['source'],...(e.file ? {file:String(e.file).slice(0,200)} : {})};
}
export class EventStore {
  events:AgentEvent[]=[]; sequence=0;
  add(input:unknown) { const event={...validate(input),id:++this.sequence}; this.events.push(event); if(this.events.length>500)this.events.shift(); return event; }
}
