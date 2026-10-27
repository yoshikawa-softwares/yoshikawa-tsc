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
const themeButton=document.querySelector('.theme-toggle');
themeButton.addEventListener('click',()=>{const light=document.body.classList.toggle('light');const label=light?'Ativar tema escuro':'Ativar tema claro';themeButton.setAttribute('aria-label',label);themeButton.title=label;themeButton.textContent=light?'◔':'☼';});
const mascot=document.querySelector('.mascot');mascot?.addEventListener('click',()=>{mascot.dataset.color=String(((Number(mascot.dataset.color)||0)+1)%3);});
const howStage=document.querySelector('.how-stage');
if(howStage&&'IntersectionObserver' in window){const steps=[...document.querySelectorAll('.how-step')];const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;howStage.dataset.active=entry.target.dataset.step;for(const step of steps)step.classList.toggle('is-active',step===entry.target);}},{rootMargin:'-15% 0px -30% 0px',threshold:.15});for(const step of steps)observer.observe(step);howStage.dataset.active='0';}
const examples={
menu:{command:'!menu',title:'Por onde vamos começar?',html:'<div class="reply-row"><span>Administração</span><code>!menuadm</code></div><div class="reply-row"><span>Figurinhas</span><code>!menustickers</code></div><div class="reply-row"><span>Downloads</span><code>!menudownloads</code></div>',note:'Escolha uma categoria para ver os comandos. Alguns recursos dependem de permissões ou benefícios ativos.'},
admin:{command:'!status',title:'Configurações do grupo',html:'<div class="reply-row"><span>Moderação</span><code>Configurável</code></div><div class="reply-row"><span>Permissões</span><code>Por função</code></div><div class="reply-row"><span>Diagnóstico</span><code>!status</code></div>',note:'Os administradores podem consultar o status e escolher as configurações adequadas ao grupo.'},
media:{command:'!menustickers',title:'Figurinhas para a conversa',html:'<div class="reply-stickers" aria-label="Exemplos de figurinhas"><span>✳</span><span>&gt;_</span><span>♡</span></div><div class="reply-row"><span>Categoria</span><code>Figurinhas</code></div>',note:'Abra o menu de figurinhas para encontrar as ferramentas de criação e edição disponíveis.'},
level:{command:'!level',title:'Seu próximo nível',html:'<div class="reply-rank"><span>◇</span><div><strong>Ouro · 12.500 pontos</strong><small>7.500 para Diamante</small></div></div><div class="reply-progress"><i></i></div>',note:'Pontuação ilustrativa. O simulador abaixo permite explorar os marcos e benefícios.'}
};
function resolveExample(command){const normalized=command.trim().toLowerCase();if(['!menu','menu'].includes(normalized))return'menu';if(['!status','!menuadm'].includes(normalized))return'admin';if(['!menustickers','!sticker','!s'].includes(normalized))return'media';if(['!level','!rank'].includes(normalized))return'level';return null;}
const messageArea=document.querySelector('.demo-messages');
if(messageArea){let timer,animation,activeKey='menu';const buttons=[...document.querySelectorAll('[data-demo]')];
function showExample(key,typedCommand){clearTimeout(timer);animation?.cancel();activeKey=key||'menu';for(const button of buttons)button.setAttribute('aria-pressed',String(key===button.dataset.demo));
const demo=key?examples[key]:{command:typedCommand,title:'Vamos testar um comando de exemplo?',html:'<div class="reply-row"><span>Menu</span><code>!menu</code></div><div class="reply-row"><span>Grupo</span><code>!status</code></div><div class="reply-row"><span>Figurinhas</span><code>!menustickers</code></div><div class="reply-row"><span>Nível</span><code>!level</code></div>',note:'Esta prévia entende apenas os comandos acima. No WhatsApp, consulte o menu completo do bot.'};
messageArea.replaceChildren();const user=document.createElement('div');user.className='chat-message';user.innerHTML='<span class="person-avatar">K</span><div><span class="message-author">Você <small>agora</small></span><p class="typed-command"></p></div>';user.querySelector('.typed-command').textContent=typedCommand||demo.command;messageArea.append(user);
const bot=document.createElement('div');bot.className='chat-message';bot.innerHTML='<img class="message-avatar" src="assets/yoshi.svg" width="31" height="34" alt=""><div class="demo-reply"><span class="message-author">Yoshikawa TSC <span class="bot-tag">BOT</span></span><div class="typing" aria-label="Preparando exemplo"><i></i><i></i><i></i></div></div>';messageArea.append(bot);
function finish(){const reply=bot.querySelector('.demo-reply');const box=document.createElement('div');box.className='reply-box';const heading=document.createElement('h4');heading.textContent=demo.title;box.append(heading);const content=document.createElement('div');content.innerHTML=demo.html;box.append(content);const note=document.createElement('p');note.textContent=demo.note;box.append(note);reply.querySelector('.typing')?.remove();reply.append(box);if(!reducedMotion.matches&&!document.documentElement.classList.contains('motion-paused'))animation=box.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.22,1,.36,1)'});}
if(reducedMotion.matches||document.documentElement.classList.contains('motion-paused'))finish();else timer=setTimeout(finish,450);document.querySelector('#demo-command').value='';}
for(const button of buttons)button.addEventListener('click',()=>showExample(button.dataset.demo));document.querySelector('.command-form').addEventListener('submit',event=>{event.preventDefault();const value=document.querySelector('#demo-command').value.trim();if(value)showExample(resolveExample(value),value);});document.querySelector('.replay-button').addEventListener('click',()=>showExample(activeKey));showExample('menu');}
