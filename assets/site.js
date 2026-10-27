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
const scenes = {
  admin: {command: '!status', title: 'Configurações do grupo', html: '<div class="status-row"><span>Antispam</span><b>Ativado</b></div><div class="status-row"><span>Permissões</span><b>Administração</b></div><div class="status-row"><span>Moderação</span><b>Configurável</b></div>', note: 'Consulte os ajustes e o diagnóstico do seu grupo.'},
  media: {command: '!menustickers', title: 'Mídia que vira figurinha', html: '<div class="demo-stickers" aria-label="Ilustrações de figurinhas"><span>&gt;_</span><span>✳</span><span>♡</span></div>', note: 'Encontre os comandos de criação e edição no menu de figurinhas.'},
  play: {command: '!level', title: 'Seu próximo nível', html: '<div class="demo-level"><b>◇</b><div><strong>Ouro · 12.500 pontos</strong><small>7.500 pontos para Diamante</small></div></div><div class="demo-progress"><i></i></div>', note: 'Uma prévia do progresso. Experimente o simulador de níveis abaixo.'},
  menu: {command: '!menu', title: 'Por onde vamos começar?', html: '<div class="status-row"><span>Administração</span><b>!menuadm</b></div><div class="status-row"><span>Figurinhas</span><b>!menustickers</b></div><div class="status-row"><span>Downloads</span><b>!menudownloads</b></div>', note: 'O menu organiza as categorias. Os recursos dependem das suas permissões.'}
};
let replyAnimation;
for (const button of document.querySelectorAll('[data-scene]')) {
  button.addEventListener('click', () => {
    const scene = scenes[button.dataset.scene];
    for (const item of document.querySelectorAll('[data-scene]')) item.setAttribute('aria-pressed', String(item === button));
    document.querySelector('.chat-command').textContent = scene.command;
    document.querySelector('.input-command').textContent = scene.command;
    document.querySelector('.chat-input button').dataset.copy = scene.command;
    document.querySelector('.reply-title').textContent = scene.title;
    document.querySelector('.reply-content').innerHTML = scene.html;
    document.querySelector('.reply-note').textContent = scene.note;
    replyAnimation?.cancel();
    if (!reducedMotion.matches && !document.documentElement.classList.contains('motion-paused')) {
      replyAnimation = document.querySelector('.chat-reply').animate([{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 450, easing: 'cubic-bezier(.2,.75,.25,1)'});
    }
  });
}
const motionButton = document.querySelector('.motion-toggle');
if (motionButton) {
  function reflectMotionPreference() {
    motionButton.disabled = reducedMotion.matches;
    const paused = document.documentElement.classList.contains('motion-paused');
    motionButton.setAttribute('aria-pressed', String(reducedMotion.matches || paused));
    motionButton.setAttribute('aria-label', reducedMotion.matches ? 'Movimento reduzido pelo sistema' : paused ? 'Retomar animações' : 'Pausar animações');
    motionButton.querySelector('span').textContent = reducedMotion.matches ? 'Reduzido' : paused ? 'Retomar animações' : 'Pausar animações';
  }
  reflectMotionPreference();
  reducedMotion.addEventListener('change', reflectMotionPreference);
  motionButton.addEventListener('click', () => {
    const paused = document.documentElement.classList.toggle('motion-paused');
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Retomar animações' : 'Pausar animações');
    motionButton.querySelector('span').textContent = paused ? 'Retomar animações' : 'Pausar animações';
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

let scrollFrame;
function updateScrollProgress() {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => {
    const distance = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--scroll', distance > 0 ? String(scrollY / distance) : '0');
  });
}
addEventListener('scroll', updateScrollProgress, {passive: true});
addEventListener('resize', updateScrollProgress);
updateScrollProgress();
