import './index.css';
import { fileName, template } from './test.js';

import cloneDeep from 'lodash-es/cloneDeep';
import packageJson from '@/package.json';

void async function main() {
  console.log(cloneDeep, (await import('lodash-es')).clone);
  console.log('Hello world');
  console.log((await import('./test.json')).default);
  document.body.insertAdjacentHTML('beforeEnd', template);
  console.log(packageJson);
}();
