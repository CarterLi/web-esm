"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lockfile = require("@yarnpkg/lockfile");
const fs_1 = require("fs");
const path = require("path");
async function getImportMap(targetPath = __dirname) {
    const content = await fs_1.promises.readFile(path.resolve(targetPath, 'yarn.lock'), 'utf-8');
    const json = lockfile.parse(content);
    return Object.assign({}, ...Object.keys(json.object)
        .map(x => x.slice(0, x.lastIndexOf('@')))
        .map(x => {
        try {
            return { [x]: '/' + path.relative(targetPath, require.resolve(x, { paths: [targetPath] })) };
        }
        catch (_a) {
            return { [x]: undefined };
        }
    }));
}
exports.getImportMap = getImportMap;
//# sourceMappingURL=dependency.js.map