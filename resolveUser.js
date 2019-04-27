"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enhanced_resolve_1 = require("enhanced-resolve");
const path = require("path");
function resolveUser(id) {
    return new Promise((resolve, reject) => {
        if (id.startsWith('/')) {
            id = '.' + id;
        }
        resolveUser.Resolver.resolve({}, resolveUser.rootDir, id, (err, res) => {
            if (err)
                return reject(err);
            resolve(res);
        });
    });
}
exports.resolveUser = resolveUser;
resolveUser.init = function init(rootDir) {
    resolveUser.rootDir = rootDir;
    resolveUser.config = require(path.join(rootDir, 'webpack.config.js'));
    resolveUser.Resolver = enhanced_resolve_1.ResolverFactory.createResolver({
        fileSystem: new enhanced_resolve_1.CachedInputFileSystem(new enhanced_resolve_1.NodeJsInputFileSystem(), 4000),
        ...resolveUser.config.resolve,
    });
};
resolveUser.Resolver = null;
resolveUser.rootDir = null;
resolveUser.config = null;
//# sourceMappingURL=resolveUser.js.map