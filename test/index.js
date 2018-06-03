import './index.css';
import { fileName, template } from './test.js';

void async function main() {
  console.log('Hello world');
  console.log((await import('./test.json')).default);
  document.body.insertAdjacentHTML('beforeEnd', template);
}();
