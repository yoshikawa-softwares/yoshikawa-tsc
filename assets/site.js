const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');

function setMenu(open) {
  if (!menu || !nav) return;
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('is-open', open);
}
menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setMenu(false); });


let toastTimer;
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const toast = document.querySelector('.toast');
    const command = button.dataset.copy;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(command);
      toast.textContent = `${command} copiado.`;
    } catch { toast.textContent = `Copie o comando: ${command}`; }
    clearTimeout(toastTimer); toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
  });
}

if ('IntersectionObserver' in window) {
  root.classList.add('js');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
    }
  }, {threshold: 0.06});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const artworkObserver = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
  });
  document.querySelectorAll('.crystal-art').forEach(el => artworkObserver.observe(el));
}

const motionButton = document.querySelector('.motion-toggle');
function syncMotion() {
  const paused = root.classList.contains('motion-paused');
  motionButton.disabled = reducedMotion.matches;
  motionButton.setAttribute('aria-pressed', String(paused || reducedMotion.matches));
  motionButton.textContent = reducedMotion.matches ? 'Movimento reduzido pelo sistema' : paused ? 'Retomar animações' : 'Pausar animações';
}
motionButton?.addEventListener('click', () => { root.classList.toggle('motion-paused'); syncMotion(); updateScene(); });
reducedMotion.addEventListener('change', () => { syncMotion(); updateScene(); });
if (motionButton) syncMotion();

const hero = document.querySelector('.hero');
const track = document.querySelector('.conversation-track');
let sceneQueued = false;
function updateScene() {
  if (sceneQueued) return;
  sceneQueued = true;
  requestAnimationFrame(() => {
    sceneQueued = false;
    if (reducedMotion.matches || root.classList.contains('motion-paused') || document.hidden) return;
    if (hero) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const p = Math.max(0, Math.min(1, -rect.top / rect.height));
        hero.style.setProperty('--hero-shift', `${p * 32}px`);
        hero.style.setProperty('--hero-scale', String(1 + p * .035));
      }
    }
    if (track) {
      const rect = track.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight && innerWidth > 760) {
        const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
        track.style.setProperty('--scene-p', p.toFixed(3));
      }
    }
  });
}
if (hero || track) {
  addEventListener('scroll', updateScene, {passive: true});
  addEventListener('resize', updateScene, {passive: true});
  document.addEventListener('visibilitychange', updateScene);
  updateScene();
}

const examples = {
  menu: {command:'!menu', kicker:'RESPOSTA DO BOT', title:'Menu principal', rows:[], note:'Recriação ilustrativa da versão 8.6.17. Usuário e VIP são exemplos; o menu pode mudar.'},
  admin: {command:'!status', kicker:'ADMINISTRAÇÃO', title:'Configurações do grupo', rows:[['Moderação','Configurável'],['Permissões','Por função'],['Diagnóstico','!status']], note:'Administradores podem consultar o status e escolher as configurações adequadas ao grupo.'},
  media: {command:'!menustickers', kicker:'MÍDIA E FIGURINHAS', title:'Figurinhas para a conversa', rows:[['Categoria','Figurinhas'],['Ferramentas','Criação e edição']], note:'Abra o menu de figurinhas para encontrar as ferramentas disponíveis.'},
  level: {command:'!level', kicker:'NÍVEIS', title:'Seu próximo nível', rows:[['Rank atual','Ouro'],['Pontuação','12.500 pontos'],['Próximo marco','7.500 para Diamante']], note:'Pontuação ilustrativa. O simulador abaixo permite explorar os marcos e benefícios.'}
};
const fallback = {kicker:'DEMONSTRAÇÃO',title:'Experimente um destes comandos',rows:[['Menu','!menu'],['Grupo','!status'],['Figurinhas','!menustickers'],['Nível','!level']],note:'Esta prévia entende apenas os comandos acima. No WhatsApp, consulte o menu completo do bot.'};
const demoStage = document.querySelector('.demo-stage');
if (demoStage) {
  const tabs = [...document.querySelectorAll('[data-demo]')];
  const card = demoStage.querySelector('.response-card');
  const input = document.querySelector('#demo-command');
  let currentKey = 'menu';
  let timer;
  function showExample(key, command) {
    const example = examples[key] || fallback;
    currentKey = key || 'menu';
    clearTimeout(timer);
    tabs.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demo === key)));
    demoStage.querySelector('.demo-command').textContent = command || example.command;
    card.classList.add('changing');
    const render = () => {
      card.querySelector('.response-kicker').textContent = example.kicker;
      card.querySelector('.response-title').textContent = example.title;
      const rows = card.querySelector('.response-body'); rows.replaceChildren();
      if (key === 'menu') rows.append(document.querySelector('#menu-preview-template').content.cloneNode(true));
      for (const [label, value] of example.rows) {
        const row = document.createElement('div');
        const name = document.createElement('span'); name.textContent = label;
        const code = document.createElement('code'); code.textContent = value;
        row.append(name, code); rows.append(row);
      }
      card.querySelector('.response-note').textContent = example.note;
      card.classList.remove('changing');
    };
    if (reducedMotion.matches || root.classList.contains('motion-paused')) render();
    else timer = setTimeout(render, 130);
  }
  for (const button of tabs) button.addEventListener('click', () => showExample(button.dataset.demo));
  document.querySelectorAll('[data-pick]').forEach(link => link.addEventListener('click', () => showExample(link.dataset.pick)));
  document.querySelector('.demo-reset').addEventListener('click', () => showExample(currentKey));
  document.querySelector('.command-form').addEventListener('submit', event => {
    event.preventDefault();
    const command = input.value.trim();
    if (!command) return;
    const normalized = command.toLowerCase();
    const key = ['!menu','menu'].includes(normalized) ? 'menu' : ['!status','!menuadm'].includes(normalized) ? 'admin' : ['!menustickers','!sticker','!s'].includes(normalized) ? 'media' : ['!level','!rank'].includes(normalized) ? 'level' : null;
    showExample(key, command); input.value = '';
  });
}

const score = document.querySelector('#score');
if (score) {
  const ranks = [
    {name:'Bronze', points:0, key:'bronze', glyph:'✦'},
    {name:'Prata', points:2000, key:'silver', glyph:'✦'},
    {name:'Ouro', points:4000, key:'gold', glyph:'✦'},
    {name:'Diamante', points:20000, key:'diamond', glyph:'◆'},
    {name:'Estelar', points:100000, key:'stellar', glyph:'✦'}
  ];
  const formatter = new Intl.NumberFormat('pt-BR');
  const buttons = [...document.querySelectorAll('[data-score]')];
  function renderScore() {
    const value = Math.min(100000, Math.max(0, Number(score.value) || 0));
    let i = ranks.length - 1;
    while (i > 0 && value < ranks[i].points) i--;
    const current = ranks[i], next = ranks[i+1];
    const progress = next ? (value-current.points)/(next.points-current.points) : 1;
    document.querySelector('.level-simulator').dataset.rank = current.key;
    document.querySelector('.level-current').textContent = current.name;
    document.querySelector('.rank-emblem-inner').textContent = current.glyph;
    document.querySelector('.level-points').textContent = formatter.format(value);
    document.querySelector('.level-next').textContent = next ? `${formatter.format(next.points-value)} para ${next.name}` : 'Nível máximo: Estelar';
    document.querySelector('#score-output').textContent = `${formatter.format(value)} pontos`;
    document.querySelector('.ring-progress').style.strokeDashoffset = String(100-progress*100);
    score.setAttribute('aria-valuetext', `${formatter.format(value)} pontos, ${current.name}`);
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.score) === current.points)));
  }
  score.addEventListener('input', renderScore);
  buttons.forEach(button => button.addEventListener('click', () => { score.value=button.dataset.score; renderScore(); }));
  renderScore();
}
