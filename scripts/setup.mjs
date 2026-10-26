import {spawnSync} from 'node:child_process';
import {root,nodeSupported,browserEnvironment} from './env.mjs';
if(!nodeSupported()){console.error('环境不满足：请使用 Node.js 22.12+（22.x）、24.x 或 26+，推荐 24 LTS。');process.exit(1);}
const npm=process.env.npm_execpath;
if(!npm){console.error('请使用 npm run setup 启动安装。');process.exit(1);}
function run(args){const r=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit',env:process.env});if(r.error||r.status!==0){console.error('安装失败：请检查网络与目录权限，再运行 npm run setup；不会更改机器设置。');process.exit(r.status||1);}}
console.log('安装项目锁定依赖（npm ci），缓存仅保存在 .npm-cache/。');
run([npm,'ci','--cache','.npm-cache']);
browserEnvironment();
console.log('安装 Chromium 与录屏组件到项目浏览器目录；已安装版本会复用。');
run(['node_modules/playwright/cli.js','install','chromium']);
console.log('安装完成！运行 npm run doctor 检查，npm run dev 启动；访问 http://127.0.0.1:4201。');
