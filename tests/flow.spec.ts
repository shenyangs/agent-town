import {test,expect} from '@playwright/test';
test('POST -> SSE -> desk state without invented events',async({page,request})=>{
 await page.goto('/');await expect(page.getByText('Event stream connected')).toBeVisible();
 await page.getByRole('button',{name:'Live local',exact:true}).click();
 const before=await (await request.get('/api/events/history')).json();
 const event={ts:new Date().toISOString(),agentId:'flow-check',type:'testing',message:'Playwright flow is running: observed by the test process',source:'live'};
 expect((await request.post('/api/events',{data:event})).status()).toBe(201);
 const desk=page.getByTestId('desk-flow-check');await expect(desk.locator('.state')).toHaveText('Testing');
 expect((await request.post('/api/events',{data:{...event,type:'idle',message:'Testing state assertion completed; process is idle'}})).status()).toBe(201);
 await expect(desk.locator('.state')).toHaveText('Idle');
 await page.waitForTimeout(300);
 const after=await (await request.get('/api/events/history')).json();
 expect(after.length).toBe(before.length+2);expect(after.slice(-2).map((e:{type:string})=>e.type)).toEqual(['testing','idle']);
 expect((await request.post('/api/events',{data:{type:'testing'}})).status()).toBe(400);
 await page.screenshot({path:'artifacts/flow.png'});
});
test('historical imported input stays labelled run replay',async({page,request})=>{
 await page.goto('/');await page.getByRole('button',{name:'Run replay',exact:true}).click();
 await request.post('/api/events',{data:{ts:new Date().toISOString(),agentId:'import-check',type:'idle',message:'Synthetic transport test; not a real Codex trace',source:'imported'}});
 await expect(page.getByTestId('desk-import-check').locator('.state')).toHaveText('Idle');
 await expect(page.getByText('RUN REPLAY',{exact:true})).toBeVisible();
});
