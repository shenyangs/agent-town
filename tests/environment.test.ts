import {expect,test} from 'vitest';
import {readFileSync} from 'node:fs';
// Execute the same lightweight checks used before any browser/dependency import.
test('environment contract documents compatible Node and installed lock',async()=>{
 const helpers=await import('../scripts/env.mjs');
 expect(helpers.nodeSupported('22.11.0')).toBe(false);expect(helpers.nodeSupported('22.12.0')).toBe(true);expect(helpers.nodeSupported('24.0.0')).toBe(true);
 expect(helpers.nodeSupported('23.0.0')).toBe(false);expect(helpers.nodeSupported('25.0.0')).toBe(false);expect(helpers.nodeSupported('26.0.0')).toBe(true);
 expect(helpers.missingDependencies(new URL('../fixtures/no-installed-dependencies/',import.meta.url).pathname)).toContain('express');
 const pkg=JSON.parse(readFileSync('package.json','utf8'));const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
 expect(pkg.engines.node).toBe(JSON.parse(readFileSync('node_modules/vitest/package.json','utf8')).engines.node);expect(lock.packages[''].engines).toEqual(pkg.engines);
 expect(lock.packages[''].dependencies).toEqual(pkg.dependencies);expect(lock.packages[''].devDependencies).toEqual(pkg.devDependencies);
});
