import {describe,it,expect} from 'vitest';
import {EventStore,validate} from '../server/events';
const event={ts:'2026-10-26T10:00:00Z',agentId:'atlas',type:'testing',message:'Observed test start'};
describe('validated bounded event store',()=>{
 it('rejects malformed events',()=>{for(const bad of [null,{}, {...event,type:'invented'}, {...event,ts:'no date'}, {...event,agentId:'../secret'}, {...event,message:2}, {...event,source:'fake'}, {...event,file:42}])expect(()=>validate(bad)).toThrow();});
 it('caps at 500 and retains chronological insertion order',()=>{const s=new EventStore();for(let i=0;i<520;i++)s.add({...event,message:String(i)});expect(s.events).toHaveLength(500);expect(s.events[0].message).toBe('20');expect(s.events.at(-1)?.id).toBe(520);});
 it('truncates content and preserves provenance',()=>{expect(validate({...event,message:'a'.repeat(700),source:'imported'})).toMatchObject({message:'a'.repeat(500),source:'imported'});});
});
