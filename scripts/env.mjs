import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export const root=fileURLToPath(new URL('../',import.meta.url));
export function nodeSupported(version=process.versions.node){const [major,minor]=version.split('.').map(Number);return major===22?minor>=12:major>=24;}
export function missingDependencies(base=root){
 const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
 return Object.keys({...pkg.dependencies,...pkg.devDependencies}).filter(name=>!existsSync(path.join(base,'node_modules',name,'package.json')));
}
export function browserEnvironment(){process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.join(root,'.browsers');}
