const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('is-open', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header') && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
});
let toastTimer;
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const toast = document.querySelector('.toast');
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      toast.textContent = `${button.dataset.copy} copiado. Cole na conversa com o bot.`;
    } catch {
      toast.textContent = `Copie manualmente o comando: ${button.dataset.copy}`;
    }
    clearTimeout(toastTimer);
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
  });
}
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.05 });
  for (const element of document.querySelectorAll('.reveal')) observer.observe(element);
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const lab = document.querySelector('.command-lab');
const demos = {
  admin: { command: '!status', title: 'Configurações e diagnóstico do grupo', description: 'Consulta as informações e o estado das configurações do grupo.' },
  media: { command: '!menustickers', title: 'Ferramentas para criar figurinhas', description: 'Mostra os comandos de figurinhas disponíveis no bot.' },
  play: { command: '!level', title: 'Pontuação e próximo nível', description: 'Exibe o rank atual e o progresso para o próximo nível.' }
};
for (const button of document.querySelectorAll('[data-demo]')) {
  button.addEventListener('click', () => {
    const demo = demos[button.dataset.demo];
    lab.dataset.mode = button.dataset.demo;
    for (const item of lab.querySelectorAll('[data-demo]')) item.setAttribute('aria-pressed', String(item === button));
    lab.querySelector('.svg-command').textContent = demo.command;
    lab.querySelector('.output-kicker').textContent = demo.command;
    lab.querySelector('.output-title').textContent = demo.title;
    lab.querySelector('.output-description').textContent = demo.description;
    if (!reducedMotion.matches) lab.querySelector('.demo-output').animate([
      { opacity: 0.3, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 350, easing: 'ease-out' });
  });
}
const motionButton = document.querySelector('.motion-toggle');
if (motionButton) {
  function reflectMotionPreference() {
    motionButton.disabled = reducedMotion.matches;
    const paused = document.documentElement.classList.contains('motion-paused');
    motionButton.setAttribute('aria-pressed', String(reducedMotion.matches || paused));
    motionButton.setAttribute('aria-label', reducedMotion.matches ? 'Movimento reduzido pelo sistema' : paused ? 'Retomar animações' : 'Pausar animações');
    motionButton.querySelector('span').textContent = reducedMotion.matches ? 'Reduzido' : paused ? 'Retomar' : 'Pausar';
  }
  reflectMotionPreference();
  reducedMotion.addEventListener('change', reflectMotionPreference);
  motionButton.addEventListener('click', () => {
    const paused = document.documentElement.classList.toggle('motion-paused');
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Retomar animações' : 'Pausar animações');
    motionButton.querySelector('span').textContent = paused ? 'Retomar' : 'Pausar';
  });
}
if ('IntersectionObserver' in window) {
  const motionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
  });
  for (const element of document.querySelectorAll('.animated-area')) motionObserver.observe(element);
}
document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('document-inactive', document.hidden));

const scoreInput = document.querySelector('#score');
if (scoreInput) {
  const ranks = [
    { name: 'Bronze', score: 0 }, { name: 'Prata', score: 2000 },
    { name: 'Ouro', score: 4000 }, { name: 'Diamante', score: 20000 },
    { name: 'Estelar', score: 100000 }
  ];
  const format = new Intl.NumberFormat('pt-BR');
  const rankButtons = [...document.querySelectorAll('[data-score]')];
  function renderLevel() {
    const score = Math.min(100000, Math.max(0, Number(scoreInput.value) || 0));
    let index = ranks.length - 1;
    while (index > 0 && score < ranks[index].score) index--;
    const current = ranks[index];
    const next = ranks[index + 1];
    const progress = next ? (score - current.score) / (next.score - current.score) : 1;
    document.querySelector('.level-current').textContent = current.name;
    document.querySelector('.level-points').textContent = format.format(score);
    document.querySelector('.level-next').textContent = next ? `${format.format(next.score - score)} para ${next.name}` : 'Nível máximo: Estelar';
    document.querySelector('#score-output').textContent = `${format.format(score)} pontos`;
    document.querySelector('.dial-progress').style.strokeDashoffset = String(100 - progress * 100);
    scoreInput.setAttribute('aria-valuetext', `${format.format(score)} pontos, ${current.name}`);
    for (const button of rankButtons) button.setAttribute('aria-pressed', String(Number(button.dataset.score) === current.score));
  }
  scoreInput.addEventListener('input', renderLevel);
  for (const button of rankButtons) button.addEventListener('click', () => {
    scoreInput.value = button.dataset.score;
    renderLevel();
  });
  renderLevel();
}
