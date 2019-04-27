import { promises as fs } from 'fs';
import * as path from 'path';
import * as uriJs from 'uri-js';
import * as http from 'http';
import { resolveUser } from './resolveUser';
import { getImportMap } from './dependency';

// TODO: Handle these types using rules specified in user's webpack.config
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
    // TODO: use css-loader
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    return 'document.head.insertAdjacentHTML("beforeEnd", `<style>' + content + '</style>`)';
  },
  async html(content: string, request: http.IncomingMessage, response: http.ServerResponse) {
    if (request.headers.accept.startsWith('text/html')) {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      // TODO: Use HtmlWebpackPlugin
      const imports = await getImportMap();
      return content.replace('<!-- INJECT SCRIPTS HERE -->', `
<script type="importmap">${JSON.stringify({ imports }, null, 2)}</script>
<script type="module" src="${resolveUser.config.entry}"></script>`);
    }
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    return 'export default `' + content + '`';
  },
  json(content: string, request: http.IncomingMessage, response: http.ServerResponse) {
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
      const requestFile = await resolveUser(urlData.path);
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
  console.error('Usage: node . </path/to/project>');
} else {
  resolveUser.init(path.resolve(__dirname, process.argv[process.argv.length - 1]));
  main();
}
