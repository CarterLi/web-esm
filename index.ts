import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as uriJs from 'uri-js';
import * as http from 'http';

const handleTypes = {
  js(content: string, request: http.ServerRequest, response: http.ServerResponse) {
    const newContent = content.replace(/^(import\s.*\sfrom\s+(["']))([^./].*?\2;?)$/g, '$1./node_modules/$3');
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    return newContent;
  },
  css(content: string, request: http.ServerRequest, response: http.ServerResponse) {
    if (request.headers.accept.startsWith('text/css')) {
      response.writeHead(200, { 'Content-Type': 'text/css' });
      return content;
    }
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    return 'document.head.insertAdjacentHTML("beforeEnd", `<style>' + content + '</style>`)';
  },
  html(content: string, request: http.ServerRequest, response: http.ServerResponse) {
    if (request.headers.accept.startsWith('text/html')) {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      return content + '\n<script type="module" src="./index.js"></script>';
    }
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    return 'export default `' + content + '`';
  },
  json(content: string, request: http.ServerRequest, response: http.ServerResponse) {
    if (request.headers.accept.startsWith('application/json')) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      return content;
    }
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    return 'export default ' + content;
  },
};

function main(targetDir: string) {
  http.createServer(async (request, response) => {
    try {
      const urlData = uriJs.parse(request.url);
      if (urlData.path === '/') urlData.path = '/index.html';
      const [, fileExtension] = /\.([^.]+)$/.exec(urlData.path);

      const content = await promisify(fs.readFile)(path.join(targetDir, urlData.path), { encoding: 'utf8' });
      response.end(handleTypes[fileExtension](content, request, response));
    } catch (e) {
      response.writeHead(404);
      response.end();
    }
  }).listen(3000);
}

if (process.argv.length < 2) {
  console.error('Usage: node . <TARGET_DIR>');
} else {
  main(path.resolve(__dirname, process.argv[process.argv.length - 1]));
}
