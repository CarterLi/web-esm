import { ResolverFactory, CachedInputFileSystem, NodeJsInputFileSystem } from 'enhanced-resolve';
import * as path from 'path';

export function resolveUser(id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (id.startsWith('/')) {
      id = '.' + id;
    }
    resolveUser.Resolver.resolve({}, resolveUser.rootDir, id, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

resolveUser.init = function init(rootDir: string) {
  resolveUser.rootDir = rootDir;
  resolveUser.config = require(path.join(rootDir, 'webpack.config.js'));
  resolveUser.Resolver = ResolverFactory.createResolver({
    fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000),
    ...resolveUser.config.resolve,
  });
}

resolveUser.Resolver = null as import ('enhanced-resolve/lib/Resolver');
resolveUser.rootDir = null as string;
resolveUser.config = null;
