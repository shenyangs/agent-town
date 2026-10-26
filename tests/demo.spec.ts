import {test,expect} from '@playwright/test';
test('record fixture replay and genuine test-process observation',async({page,request})=>{
 await page.goto('/');await expect(page.getByText('Event stream connected')).toBeVisible();
 await page.waitForTimeout(1000);await page.getByRole('button',{name:'Replay trace',exact:true}).click();
 await expect(page.getByTestId('desk-atlas').locator('.state')).toHaveText('Testing');
 await expect(page.getByTestId('desk-echo').locator('.state')).toHaveText('Idle');
 await page.screenshot({path:'artifacts/replay.png'});
 await page.waitForTimeout(800);await page.getByRole('button',{name:'Live local',exact:true}).click();
 await request.post('/api/events',{data:{ts:new Date().toISOString(),agentId:'atlas',type:'testing',message:'Playwright demo is executing its live SSE assertion',source:'live',file:'tests/demo.spec.ts'}});
 await expect(page.getByTestId('desk-atlas').locator('.state')).toHaveText('Testing');
 await expect(page.getByTestId('desk-atlas')).toContainText('Playwright demo is executing');
 await page.screenshot({path:'artifacts/live.png'});await page.waitForTimeout(1200);
 await request.post('/api/events',{data:{ts:new Date().toISOString(),agentId:'atlas',type:'idle',message:'The live SSE assertion completed successfully',source:'live',file:'tests/demo.spec.ts'}});
 await expect(page.getByTestId('desk-atlas').locator('.state')).toHaveText('Idle');await page.waitForTimeout(1000);
});
