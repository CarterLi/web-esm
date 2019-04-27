import * as lockfile from '@yarnpkg/lockfile';
import { promises as fs } from 'fs';
import { resolveUser } from './resolveUser';
import * as path from 'path';

export async function getImportMap() {
  const content = await fs.readFile(await resolveUser('./yarn.lock'), 'utf-8');
  const json = lockfile.parse(content);
  const paths = await Promise.all(Object.keys(json.object)
    .map(x => x.slice(0, x.lastIndexOf('@')))
    .concat(Object.keys(resolveUser.config.resolve.alias))
    .map(async x => {
      try {
        const result = '/' + path.relative(resolveUser.rootDir, await resolveUser(x));
        return { [x]: result, [x + '/']: path.dirname(result) + '/' };
      } catch {
        return { [x]: undefined } ;
      }
    }));

  return Object.assign({}, ...paths);
}
