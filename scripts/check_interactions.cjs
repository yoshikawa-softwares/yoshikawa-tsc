// State transitions for navigation, copying and the level simulator.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/site.js'), 'utf8');
function element(data = {}) {
  const attributes = {}, handlers = {}, classes = new Set();
  return {dataset: data, attributes, handlers, classList: {
    add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x)
  }, style: {}, textContent: '', value: '', hidden: false,
  addEventListener: (name, fn) => {handlers[name] = fn},
  setAttribute: (key, value) => {attributes[key] = value},
  removeAttribute: key => {delete attributes[key]},
  scrollIntoView() {this.scrolled = true}};
}
function build(clipboard = {writeText: async () => {}}) {
  const views = ['inicio','recursos','beneficios','ecossistema','ajuda'].map(name => element({view:name}));
  for (const view of views) {view.id = view.dataset.view; view.closest = () => view}
  const sub = element(); sub.id = 'comandos'; sub.closest = () => views[1];
  const links = views.map(view => element({section:view.id}));
  const buttons = [0,2000,4000,20000,100000].map(value => element({score:String(value)}));
  const copy = element({copy:'!menu'});
  const root = element();
  const lookup = Object.fromEntries(['.simulator','.level-current','.level-points','.level-next','#score-output','.progress-fill','.toast','.view-announcer'].map(x => [x,element()]));
  lookup['#score'] = element(); lookup['#score'].value = '12500'; lookup['[data-app]'] = element();
  const events = {}, location = {hash: ''};
  const document = {documentElement:root,querySelector:selector => lookup[selector] || null,
    querySelectorAll:selector => ({'[data-view]':views,'[data-section]':links,'[data-score]':buttons,'[data-copy]':[copy]})[selector] || [],
    getElementById:id => views.find(view=>view.id===id) || (id==='comandos' ? sub : null)};
  const window = {addEventListener:(name,fn)=>{events[name]=fn},scrollTo(){}};
  vm.runInNewContext(source,{document,window,location,navigator:{clipboard},requestAnimationFrame:fn=>fn(),Intl,Number,String,Math,setTimeout:()=>1,clearTimeout(){}});
  return {views,links,buttons,copy,lookup,events,location,sub,root};
}
(async () => {
  const p = build();
  assert.equal(p.root.classList.contains('js-ready'),true);
  assert.deepEqual(p.views.map(view=>view.hidden),[false,true,true,true,true]);
  assert.equal(p.links[0].attributes['aria-current'],'page');
  p.location.hash='#comandos'; p.events.hashchange();
  assert.equal(p.views[1].hidden,false); assert.equal(p.views[0].hidden,true);
  assert.equal(p.links[1].attributes['aria-current'],'page'); assert.equal(p.sub.scrolled,true);
  p.location.hash='#beneficios'; p.events.hashchange();
  assert.equal(p.views[2].hidden,false);
  assert.equal(p.lookup['.level-current'].textContent,'Ouro');
  p.buttons[3].handlers.click();
  assert.equal(p.lookup['.level-current'].textContent,'Diamante');
  assert.equal(p.lookup['.level-next'].textContent,'80.000 para Estelar');
  p.buttons[4].handlers.click();
  assert.equal(p.lookup['.level-next'].textContent,'Nível máximo: Estelar');
  assert.equal(p.lookup['.progress-fill'].style.width,'100%');
  await p.copy.handlers.click(); assert.equal(p.lookup['.toast'].textContent,'!menu copiado.');
  const denied=build({writeText:async()=>{throw new Error('denied')}});
  await denied.copy.handlers.click(); assert.equal(denied.lookup['.toast'].textContent,'Copie o comando: !menu');
  console.log('OK: navegação, links internos, simulador e cópia de comandos.');
})().catch(error=>{console.error(error);process.exitCode=1});
