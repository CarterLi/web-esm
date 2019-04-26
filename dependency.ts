import * as lockfile from '@yarnpkg/lockfile';
import { promises as fs } from 'fs';
import * as path from 'path';

export async function getImportMap(targetPath = __dirname) {
  const content = await fs.readFile(path.resolve(targetPath, 'yarn.lock'), 'utf-8');
  const json = lockfile.parse(content);

  return Object.assign({}, ...Object.keys(json.object)
    .map(x => x.slice(0, x.lastIndexOf('@')))
    .map(x => {
      try {
        const result = '/' + path.relative(targetPath, require.resolve(x, { paths: [targetPath] }));
        return { [x]: result, [x + '/']: path.dirname(result) + '/' };
      } catch {
        return { [x]: undefined } ;
      }
    }));
}
