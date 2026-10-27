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
  document.querySelectorAll('.crystal-art, .reward-card').forEach(el => artworkObserver.observe(el));
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

const score = document.querySelector('#score');
if (score) {
  const ranks = [
    {name:'Bronze', points:0, key:'bronze', art:'assets/crystal-star.webp'},
    {name:'Prata', points:2000, key:'silver', art:'assets/crystal-star.webp'},
    {name:'Ouro', points:4000, key:'gold', art:'assets/crystal-star.webp'},
    {name:'Diamante', points:20000, key:'diamond', art:'assets/crystal-diamond.webp'},
    {name:'Estelar', points:100000, key:'stellar', art:'assets/crystal-stellar.webp'}
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
    document.querySelector('.rank-emblem-inner').src = current.art;
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
