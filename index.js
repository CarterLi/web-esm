"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
const uriJs = require("uri-js");
const http = require("http");
const dependency_1 = require("./dependency");
let targetDir;
const handleTypes = {
    js(content, request, response) {
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        return content;
    },
    css(content, request, response) {
        if (request.headers.accept.startsWith('text/css')) {
            response.writeHead(200, { 'Content-Type': 'text/css' });
            return content;
        }
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        return 'document.head.insertAdjacentHTML("beforeEnd", `<style>' + content + '</style>`)';
    },
    async html(content, request, response) {
        if (request.headers.accept.startsWith('text/html')) {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            const imports = await dependency_1.getImportMap(targetDir);
            return `${content}
<script type="importmap">${JSON.stringify({ imports })}</script>
<script type="module" src="./index.js"></script>`;
        }
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        return 'export default `' + content + '`';
    },
    json(content, request, response) {
        if (request.headers.accept.startsWith('application/json')) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            return content;
        }
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        return 'export default ' + content;
    },
};
function main() {
    http.createServer(async (request, response) => {
        try {
            const urlData = uriJs.parse(request.url);
            let requestFile;
            if (urlData.path === '/' && request.headers.accept.startsWith('text/html')) {
                requestFile = path.join(targetDir, '/index.html');
            }
            else {
                requestFile = path.join(targetDir, urlData.path);
                if (request.headers.accept.startsWith('*/*')) {
                    requestFile = require.resolve(requestFile, {
                        paths: [targetDir],
                    });
                }
            }
            const [, fileExtension] = /\.([^.]+)$/.exec(requestFile);
            const content = await fs_1.promises.readFile(requestFile, { encoding: 'utf8' });
            response.end(await handleTypes[fileExtension](content, request, response));
        }
        catch (e) {
            response.writeHead(404);
            response.end();
        }
    }).listen(3000);
}
if (process.argv.length < 2) {
    console.error('Usage: node . <TARGET_DIR>');
}
else {
    targetDir = path.resolve(__dirname, process.argv[process.argv.length - 1]);
    main();
}
//# sourceMappingURL=index.js.map