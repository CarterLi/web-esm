/** Simplest commonjs require implementation
 * @param {string} moduleId path of the required module
 **/
function require(moduleId) {
  if (installedModules[moduleId]) {
    return resolvedModules[moduleId].exports;
  }

  const req = new XMLHttpRequest();
  req.open("GET", moduleId, false);
  req.send();
  const module = require.installedModules[moduleId] = {
    id: moduleId,
    loaded: false,
    exports: {},
  };
  new Function('module', 'exports', 'use strict;\n' + req.responseText)
    .call(module.exports, module, module.exports);
  module.loaded = true;
  return module.exports;
}
require.installedModules = {};

window.require = require;
