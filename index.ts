import { promises as fs } from 'fs';
import * as path from 'path';
import * as uriJs from 'uri-js';
import * as http from 'http';
import { getImportMap } from './dependency';

let targetDir: string;

const handleTypes = {
  js(content: string, request: http.ClientRequest, response: http.ServerResponse) {
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    return content;
  },
  css(content: string, request: http.IncomingMessage, response: http.ServerResponse) {
    if (request.headers.accept.startsWith('text/css')) {
      response.writeHead(200, { 'Content-Type': 'text/css' });
      return content;
    }
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    return 'document.head.insertAdjacentHTML("beforeEnd", `<style>' + content + '</style>`)';
  },
  async html(content: string, request: http.IncomingMessage, response: http.ServerResponse) {
    if (request.headers.accept.startsWith('text/html')) {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      const imports = await getImportMap(targetDir);
      return `${content}
<script type="importmap">${JSON.stringify({ imports })}</script>
<script type="module" src="./index.js"></script>`;
    }
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    return 'export default `' + content + '`';
  },
  json(content: string, request: http.IncomingMessage, response: http.ServerResponse) {
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
      let requestFile: string;
      if (urlData.path === '/' && request.headers.accept.startsWith('text/html')) {
        requestFile = path.join(targetDir, '/index.html')
      } else {
        requestFile = path.join(targetDir, urlData.path);
        if (request.headers.accept.startsWith('*/*')) {
          requestFile = require.resolve(requestFile, {
            paths: [targetDir],
          });
        }
      }
      const [, fileExtension] = /\.([^.]+)$/.exec(requestFile);

      const content = await fs.readFile(requestFile, { encoding: 'utf8' });
      response.end(await handleTypes[fileExtension](content, request, response));
    } catch (e) {
      response.writeHead(404);
      response.end();
    }
  }).listen(3000);
}

if (process.argv.length < 2) {
  console.error('Usage: node . <TARGET_DIR>');
} else {
  targetDir = path.resolve(__dirname, process.argv[process.argv.length - 1]);
  main();
}
