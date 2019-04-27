"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
const uriJs = require("uri-js");
const http = require("http");
const resolveUser_1 = require("./resolveUser");
const dependency_1 = require("./dependency");
// TODO: Handle these types using rules specified in user's webpack.config
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
        // TODO: use css-loader
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        return 'document.head.insertAdjacentHTML("beforeEnd", `<style>' + content + '</style>`)';
    },
    async html(content, request, response) {
        if (request.headers.accept.startsWith('text/html')) {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            // TODO: Use HtmlWebpackPlugin
            const imports = await dependency_1.getImportMap();
            return content.replace('<!-- INJECT SCRIPTS HERE -->', `
<script type="importmap">${JSON.stringify({ imports }, null, 2)}</script>
<script type="module" src="${resolveUser_1.resolveUser.config.entry}"></script>`);
        }
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        return 'export default `' + content + '`';
    },
    json(content, request, response) {
        if (request.headers.accept.startsWith('application/json')) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            return content;
        }
        // TODO: use json-loader
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        return 'export default ' + content;
    },
};
function main() {
    http.createServer(async (request, response) => {
        try {
            const urlData = uriJs.parse(request.url);
            if (urlData.path === '/' && request.headers.accept.startsWith('text/html')) {
                urlData.path = '@/index.html';
            }
            const requestFile = await resolveUser_1.resolveUser(urlData.path);
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
    console.error('Usage: node . </path/to/project>');
}
else {
    resolveUser_1.resolveUser.init(path.resolve(__dirname, process.argv[process.argv.length - 1]));
    main();
}
//# sourceMappingURL=index.js.map