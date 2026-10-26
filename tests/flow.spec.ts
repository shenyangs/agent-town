import {test,expect} from '@playwright/test';
test('POST -> SSE -> desk state without invented events',async({page,request})=>{
 await page.goto('/');await expect(page.getByText('事件流已连接')).toBeVisible();
 await page.getByRole('button',{name:'本地实时',exact:true}).click();
 const before=await (await request.get('/api/events/history')).json();
 const event={ts:new Date().toISOString(),agentId:'flow-check',type:'testing',message:'Playwright 流程正在运行：由测试进程实际观察',source:'live'};
 expect((await request.post('/api/events',{data:event})).status()).toBe(201);
 const desk=page.getByTestId('desk-flow-check');await expect(desk.locator('.state')).toHaveText('测试中');
 expect((await request.post('/api/events',{data:{...event,type:'idle',message:'测试状态断言已完成，进程空闲'}})).status()).toBe(201);
 await expect(desk.locator('.state')).toHaveText('空闲');
 await page.waitForTimeout(300);
 const after=await (await request.get('/api/events/history')).json();
 expect(after.length).toBe(before.length+2);expect(after.slice(-2).map((e:{type:string})=>e.type)).toEqual(['testing','idle']);
 expect((await request.post('/api/events',{data:{type:'testing'}})).status()).toBe(400);
 await page.screenshot({path:'artifacts/flow.png'});
});
test('historical imported input stays labelled run replay',async({page,request})=>{
 await page.goto('/');await page.getByRole('button',{name:'历史回放',exact:true}).click();
 await expect(page.getByText('尚无历史事件。请发送 source 为 imported 的记录；未内置原生日志适配器。')).toBeVisible();
 await request.post('/api/events',{data:{ts:new Date().toISOString(),agentId:'import-check',type:'idle',message:'合成传输测试，并非真实 Codex 轨迹',source:'imported'}});
 await expect(page.getByTestId('desk-import-check').locator('.state')).toHaveText('空闲');
 await expect(page.getByText('历史回放 · 非实时',{exact:true})).toBeVisible();
});
test('中文引导、键盘焦点、小屏及失败恢复',async({page,request})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByText('事件流已连接')).toBeVisible();
 await expect(page.getByRole('navigation',{name:'首次使用三步引导'})).toBeVisible();
 expect(await page.locator('html').getAttribute('lang')).toBe('zh-CN');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const button=page.getByRole('button',{name:'播放示例',exact:true});await button.focus();await expect(button).toBeFocused();
 await page.route('**/api/replay',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'服务暂不可用，请重试。'})}));
 await page.keyboard.press('Enter');await expect(page.getByRole('status')).toHaveText('服务暂不可用，请重试。');await expect(button).toBeEnabled();
 await page.unroute('**/api/replay');await button.click();await expect(button).toBeDisabled();await expect(button).toHaveAttribute('aria-busy','true');
 await expect(page.getByRole('status')).toContainText('示例回放已结束');await expect(button).toBeEnabled();
 const invalid=await request.post('/api/events',{data:{type:'testing'}});expect(invalid.status()).toBe(400);expect((await invalid.json()).error).toBe('ts 必须是有效时间戳');
 await page.screenshot({path:'artifacts/mobile-zh.png',fullPage:true});
});
