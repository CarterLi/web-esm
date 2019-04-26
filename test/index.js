import './index.css';
import { fileName, template } from './test.js';

import { cloneDeep } from 'lodash-es';

void async function main() {
  console.log(cloneDeep);
  console.log('Hello world');
  console.log((await import('./test.json')).default);
  document.body.insertAdjacentHTML('beforeEnd', template);
}();
