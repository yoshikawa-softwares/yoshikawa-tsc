const root = document.documentElement;
const app = document.querySelector('[data-app]');
const views = [...document.querySelectorAll('[data-view]')];
const navLinks = [...document.querySelectorAll('[data-section]')];
const names = {inicio: 'Início', recursos: 'Recursos', beneficios: 'Níveis', ecossistema: 'Projetos', ajuda: 'Ajuda'};
const scrollPositions = new Map();
let activeSection = null;

function showSection() {
  if (!app) return;
  let hash;
  try { hash = decodeURIComponent(location.hash.slice(1)); } catch { hash = ''; }
  const target = hash ? document.getElementById(hash) : null;
  const selected = target?.closest('[data-view]')?.dataset.view || 'inicio';
  if (activeSection && activeSection !== selected) scrollPositions.set(activeSection, window.scrollY);
  activeSection = selected;
  views.forEach(view => { view.hidden = view.dataset.view !== selected; });
  navLinks.forEach(link => {
    if (link.dataset.section === selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${names[selected]} — Yoshikawa TSC`;
  const announcer = document.querySelector('.view-announcer');
  if (announcer) announcer.textContent = names[selected];
  requestAnimationFrame(() => {
    if (target && target.id !== selected) target.scrollIntoView({block: 'start'});
    else window.scrollTo({top: scrollPositions.get(selected) || 0, behavior: 'instant'});
  });
}
if (app) {
  showSection();
  window.addEventListener('hashchange', showSection);
}
root.classList.add('js-ready');

let toastTimer;
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const toast = document.querySelector('.toast');
    if (!toast) return;
    const command = button.dataset.copy;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(command);
      toast.textContent = `${command} copiado.`;
    } catch {
      toast.textContent = `Copie o comando: ${command}`;
    }
    clearTimeout(toastTimer);
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
  });
}

const score = document.querySelector('#score');
if (score) {
  const ranks = [
    {name: 'Bronze', points: 0, key: 'bronze'},
    {name: 'Prata', points: 2000, key: 'silver'},
    {name: 'Ouro', points: 4000, key: 'gold'},
    {name: 'Diamante', points: 20000, key: 'diamond'},
    {name: 'Estelar', points: 100000, key: 'stellar'}
  ];
  const formatter = new Intl.NumberFormat('pt-BR');
  const buttons = [...document.querySelectorAll('[data-score]')];
  function renderScore() {
    const value = Math.min(100000, Math.max(0, Number(score.value) || 0));
    let index = ranks.length - 1;
    while (index > 0 && value < ranks[index].points) index--;
    const current = ranks[index], next = ranks[index + 1];
    const progress = next ? (value - current.points) / (next.points - current.points) : 1;
    document.querySelector('.simulator').dataset.rank = current.key;
    document.querySelector('.level-current').textContent = current.name;
    document.querySelector('.level-points').textContent = formatter.format(value);
    document.querySelector('.level-next').textContent = next ? `${formatter.format(next.points - value)} para ${next.name}` : 'Nível máximo: Estelar';
    document.querySelector('#score-output').textContent = `${formatter.format(value)} pontos`;
    document.querySelector('.progress-fill').style.width = `${progress * 100}%`;
    score.setAttribute('aria-valuetext', `${formatter.format(value)} pontos, ${current.name}`);
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.score) === current.points)));
  }
  score.addEventListener('input', renderScore);
  buttons.forEach(button => button.addEventListener('click', () => { score.value = button.dataset.score; renderScore(); }));
  renderScore();
}
