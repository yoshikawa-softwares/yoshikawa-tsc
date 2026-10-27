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


const heroSection = document.querySelector('.signal-hero');
const showcase = document.querySelector('.showcase-section');
const chapters = [...document.querySelectorAll('[data-chapter]')];
const panels = [...document.querySelectorAll('[data-panel]')];
let currentChapter = 0;
let panelAnimation;
function setChapter(index) {
  if (currentChapter === index) return;
  currentChapter = index;
  for (const button of chapters) button.setAttribute('aria-pressed', String(Number(button.dataset.chapter) === index));
  for (const panel of panels) panel.hidden = Number(panel.dataset.panel) !== index;
  const stage = document.querySelector('.chapter-stage');
  stage.dataset.chapterActive = String(index);
  document.querySelector('.chapter-number').textContent = String(index + 1).padStart(2, '0');
  document.querySelector('.chapter-counter').textContent = `${String(index + 1).padStart(2, '0')} — 03`;
  panelAnimation?.cancel();
  if (!document.documentElement.classList.contains('showcase-static')) {
    panelAnimation = panels[index].animate([{opacity: .1, translate: '0 25px'}, {opacity: 1, translate: '0 0'}], {duration: 700, easing: 'cubic-bezier(.22,1,.36,1)'});
  }
}
function syncStaticMotion() {
  const isStatic = reducedMotion.matches || document.documentElement.classList.contains('motion-paused');
  document.documentElement.classList.toggle('showcase-static', isStatic);
  if (isStatic) {
    panelAnimation?.cancel();
    heroSection?.style.setProperty('--hero-progress', '0');
  }
  updateScrollProgress();
}
for (const button of chapters) button.addEventListener('click', () => {
  const index = Number(button.dataset.chapter);
  setChapter(index);
  if (!document.documentElement.classList.contains('showcase-static')) {
    const travel = showcase.offsetHeight - innerHeight;
    scrollTo({top: showcase.getBoundingClientRect().top + scrollY + travel * (index + .15) / 3, behavior: 'smooth'});
  }
});
let scrollFrame;
function updateScrollProgress() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--scroll', distance > 0 ? String(scrollY / distance) : '0');
    if (!document.documentElement.classList.contains('showcase-static')) {
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - innerHeight)));
        heroSection.style.setProperty('--hero-progress', String(progress));
      }
      if (showcase) {
        const rect = showcase.getBoundingClientRect();
        const progress = Math.min(.999, Math.max(0, -rect.top / Math.max(1, rect.height - innerHeight)));
        setChapter(Math.floor(progress * 3));
      }
    }
  });
}
if ('IntersectionObserver' in window) {
  const textObserver = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('is-lit', entry.isIntersecting);
  }, {threshold: .6});
  for (const word of document.querySelectorAll('.kinetic-text>span')) textObserver.observe(word);
}
addEventListener('scroll', updateScrollProgress, {passive: true});
addEventListener('resize', updateScrollProgress);
reducedMotion.addEventListener('change', syncStaticMotion);
document.querySelector('.motion-toggle')?.addEventListener('click', syncStaticMotion);
syncStaticMotion();
