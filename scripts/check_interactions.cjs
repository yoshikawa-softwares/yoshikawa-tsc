// Tests the shared script's state changes without a browser or third-party packages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const script = fs.readFileSync(require('node:path').join(__dirname, '../assets/site.js'), 'utf8');

function element() {
  const attributes = {}, handlers = {}, classes = new Set();
  return {
    attributes, handlers, dataset: {}, textContent: '', value: '', style: {setProperty() {}},
    classList: {
      add: name => classes.add(name), contains: name => classes.has(name),
      toggle(name, force) { const active = force ?? !classes.has(name); active ? classes.add(name) : classes.delete(name); return active; }
    },
    addEventListener: (name, fn) => { handlers[name] = fn; },
    setAttribute: (name, value) => { attributes[name] = value; },
    getAttribute: name => attributes[name], focus() { this.focused = true; }
  };
}
function page(saved = {}, clipboard = {writeText: async () => {}}) {
  const root = element();
  const selectors = Object.fromEntries(['.menu-toggle', '#nav', '.motion-toggle', '.toast', '#score', '.level-simulator', '.level-current', '.rank-emblem-inner', '.level-points', '.level-next', '#score-output', '.ring-progress'].map(name => [name, element()]));
  selectors['#score'].value = '12500';
  const ranks = [0, 2000, 4000, 20000, 100000].map(value => {const item = element(); item.dataset.score = String(value); return item;});
  const copy = element(); copy.dataset.copy = '!menu';
  const events = {}, media = {matches: false, addEventListener(name, fn) {this[name] = fn;}};
  const document = {documentElement: root, hidden: false, querySelector: name => selectors[name] || null, querySelectorAll: name => name === '[data-score]' ? ranks : name === '[data-copy]' ? [copy] : [], addEventListener(name, fn) {events[name] = fn;}};
  const context = {document, window: {matchMedia: () => media}, navigator: {clipboard}, localStorage: {getItem: key => saved[key] ?? null, setItem: (key, value) => {saved[key] = value;}}, Intl, Number, String, Math, addEventListener() {}, requestAnimationFrame: fn => fn(), setTimeout: () => 1, clearTimeout() {}};
  vm.runInNewContext(script, context);
  return {root, selectors, ranks, copy, events, media};
}

(async () => {
  const saved = {}, first = page(saved);
  const {selectors, ranks, events} = first;
  selectors['.menu-toggle'].handlers.click();
  assert.equal(selectors['.menu-toggle'].attributes['aria-expanded'], 'true');
  events.keydown({key: 'Escape'});
  assert.equal(selectors['.menu-toggle'].attributes['aria-expanded'], 'false');
  assert.equal(selectors['.menu-toggle'].focused, true);
  selectors['.motion-toggle'].handlers.click();
  assert.equal(saved['yoshikawa-motion-paused'], 'true');
  assert.equal(page(saved).root.classList.contains('motion-paused'), true);
  assert.equal(selectors['.level-current'].textContent, 'Ouro');
  ranks[3].handlers.click();
  assert.equal(selectors['.level-current'].textContent, 'Diamante');
  assert.equal(selectors['.level-next'].textContent, '80.000 para Estelar');
  ranks[4].handlers.click();
  assert.equal(selectors['.level-next'].textContent, 'Nível máximo: Estelar');
  await first.copy.handlers.click();
  assert.equal(selectors['.toast'].textContent, '!menu copiado.');
  // A denied clipboard still tells the visitor what to copy.
  const denied = page({}, {writeText: async () => {throw new Error('denied');}});
  await denied.copy.handlers.click();
  assert.equal(denied.selectors['.toast'].textContent, 'Copie o comando: !menu');
  console.log('OK: menu, movimento, simulador e cópia de comandos.');
})().catch(error => {console.error(error); process.exitCode = 1;});
