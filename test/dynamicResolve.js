const imports = (() => {
  const text = sessionStorage.getItem('importmap');
  if (text) {
    const content = JSON.parse(text);
    const script = document.createElement('script');
    script.type = 'importmap';
    script.innerHTML = JSON.stringify({ imports: content });
    document.currentScript.insertAdjacentElement("afterend", script);
    return content;
  } else {
    return {};
  }
})();
addEventListener('error', (e) => {
  let matches;
  if (matches = /^TypeError: Failed to resolve module specifier "(.+?)"\. Relative references must start with either "/.exec(e.error.stack)) {
    imports[matches[1]] = `/node_modules/${matches[1]}/dist/esnext/index.js`;
    sessionStorage.setItem('importmap', JSON.stringify(imports));
    location.reload();
    e.preventDefault();
    return true;
  }
});
