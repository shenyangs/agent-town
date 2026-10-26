import net from 'node:net';
import path from 'node:path';
import {root,nodeSupported,missingDependencies,browserEnvironment} from './env.mjs';
let failures=0;
const report=(ok,message)=>{console.log(`${ok?'通过':'待处理'}：${message}`);if(!ok)failures++;};
console.log('AgentTown 环境诊断（不读取凭据，不要求 API Key）');
report(nodeSupported(),`Node.js ${process.versions.node}；要求 22.12+（22.x）、24.x 或 26+，推荐 24 LTS`);
const missing=missingDependencies();
report(!missing.length,missing.length?`缺少依赖：${missing.join('、')}。请运行 npm run setup 或 npm ci --cache .npm-cache。`:'项目依赖齐全');
if(!missing.length){
 browserEnvironment();
 try{const {chromium}=await import('playwright');const browser=await chromium.launch({headless:true,timeout:15000});try{const context=await browser.newContext({recordVideo:{dir:path.join(root,'artifacts','doctor-video')}});const page=await context.newPage();await page.setContent('<html lang="zh-CN"><body>AgentTown 环境诊断</body></html>');await context.close();}finally{await browser.close();}report(true,'Chromium 可启动，录屏组件可用');}
 catch{report(false,'浏览器或录屏组件缺失或无法启动。运行 npm run setup；也可设置 PLAYWRIGHT_BROWSERS_PATH 复用兼容缓存。');}
}else{console.log('跳过：依赖未安装，暂不检查浏览器。');}
for(const port of [4201,5201]){await new Promise(resolve=>{const server=net.createServer();server.once('error',()=>{report(false,`端口 ${port} 被占用或不可绑定。停止自己已启动的服务（Ctrl+C），不要终止未知进程。`);resolve();});server.listen(port,'127.0.0.1',()=>server.close(()=>{report(true,`端口 ${port} 可用（127.0.0.1）`);resolve();}));});}
console.log(failures?'请处理上述问题后重试。':'环境检查完成。运行 npm run dev，访问 http://127.0.0.1:4201。');
process.exitCode=failures?1:0;
