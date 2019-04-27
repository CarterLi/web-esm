"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lockfile = require("@yarnpkg/lockfile");
const fs_1 = require("fs");
const resolveUser_1 = require("./resolveUser");
const path = require("path");
async function getImportMap() {
    const content = await fs_1.promises.readFile(await resolveUser_1.resolveUser('./yarn.lock'), 'utf-8');
    const json = lockfile.parse(content);
    const paths = await Promise.all(Object.keys(json.object)
        .map(x => x.slice(0, x.lastIndexOf('@')))
        .concat(Object.keys(resolveUser_1.resolveUser.config.resolve.alias))
        .map(async (x) => {
        try {
            const result = '/' + path.relative(resolveUser_1.resolveUser.rootDir, await resolveUser_1.resolveUser(x));
            return { [x]: result, [x + '/']: path.dirname(result) + '/' };
        }
        catch (_a) {
            return { [x]: undefined };
        }
    }));
    return Object.assign({}, ...paths);
}
exports.getImportMap = getImportMap;
//# sourceMappingURL=dependency.js.map