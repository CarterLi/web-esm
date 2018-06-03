"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const uriJs = require("uri-js");
const http = require("http");
const handleTypes = {
    js(content, request, response) {
        const newContent = content.replace(/^(import\s.*\sfrom\s+(["']))([^./].*?\2;?)$/g, '$1./node_modules/$3');
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        return newContent;
    },
    css(content, request, response) {
        if (request.headers.accept.startsWith('text/css')) {
            response.writeHead(200, { 'Content-Type': 'text/css' });
            return content;
        }
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        return 'document.head.insertAdjacentHTML("beforeEnd", `<style>' + content + '</style>`)';
    },
    html(content, request, response) {
        if (request.headers.accept.startsWith('text/html')) {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            return content + '\n<script type="module" src="./index.js"></script>';
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
function main(targetDir) {
    http.createServer(async (request, response) => {
        try {
            const urlData = uriJs.parse(request.url);
            if (urlData.path === '/')
                urlData.path = '/index.html';
            const [, fileExtension] = /\.([^.]+)$/.exec(urlData.path);
            const content = await util_1.promisify(fs.readFile)(path.join(targetDir, urlData.path), { encoding: 'utf8' });
            response.end(handleTypes[fileExtension](content, request, response));
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
    main(path.resolve(__dirname, process.argv[process.argv.length - 1]));
}
//# sourceMappingURL=index.js.map