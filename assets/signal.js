(() => {
  const canvas = document.querySelector('#signal-canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', {alpha: false, antialias: false, powerPreference: 'low-power'});
  if (!gl) {
    const context = canvas.getContext('2d', {alpha: false});
    if (!context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const hero = document.querySelector('.signal-hero');
    let frame=0, last=0, clock=0, visible=true;
    function draw() {
      const w=canvas.width,h=canvas.height;
      const progress=Number(hero.style.getPropertyValue('--hero-progress'))||0;
      context.fillStyle='#080b0c';context.fillRect(0,0,w,h);
      context.save();context.translate(w*.58,h*.44);context.rotate(-.55+progress*.6);
      const radius=Math.min(w*(w<600?.44:.33),h*.43)*(1+progress*.65);
      const gradient=context.createLinearGradient(-radius,-radius,radius,radius);
      gradient.addColorStop(0,'#253d49');gradient.addColorStop(.24,'#b0c7d1');gradient.addColorStop(.38,'#e3f3fa');gradient.addColorStop(.48,'#527d91');gradient.addColorStop(.65,'#10242f');gradient.addColorStop(.8,'#5c8d9e');gradient.addColorStop(1,'#15252d');
      context.strokeStyle=gradient;
      for(let ring=0;ring<6;ring++) {
        const r=radius*(1-ring*.085);
        context.lineWidth=radius*(.058-ring*.007);
        context.beginPath();
        for(let n=0;n<=120;n++) {
          const angle=n/120*Math.PI*2;
          const wave=1+.065*Math.sin(angle*3+clock*.23+ring*.2)+.026*Math.cos(angle*5-clock*.17);
          const x=Math.cos(angle)*r*wave,y=Math.sin(angle)*r*.64*wave;
          if(n===0)context.moveTo(x,y);else context.lineTo(x,y);
        }
        context.closePath();context.stroke();
      }
      context.restore();
    }
    function paused(){return !visible || document.hidden || reduced.matches || document.documentElement.classList.contains('motion-paused');}
    function tick(stamp){frame=0;if(paused())return;if(stamp-last>=33){clock+=Math.min((stamp-last)/1000,.06);last=stamp;draw();}frame=requestAnimationFrame(tick);}
    function sync(){cancelAnimationFrame(frame);last=performance.now();draw();if(!paused())frame=requestAnimationFrame(tick);}
    new ResizeObserver(()=>{const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio,1.25,1400/Math.max(r.width,1));canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));sync();}).observe(canvas);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);
    new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    canvas.dataset.renderer='canvas';canvas.classList.add('is-ready');return;
  }
  const vertex = 'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
  const fragment = `precision mediump float;
  uniform vec2 resolution; uniform float time; uniform float progress;
  uniform vec2 pointer;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){
    vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
    uv-=vec2(.12,.07)+pointer*.025;
    uv/=1.+progress*.8;
    float t=time*.17;
    float rotation=-.55+progress*.8;
    uv=mat2(cos(rotation),-sin(rotation),sin(rotation),cos(rotation))*uv;
    uv.y*=1.45;
    float angle=atan(uv.y,uv.x);
    float radius=length(uv);
    float bend=.055*sin(angle*3.+t)+.027*cos(angle*5.-t*.7);
    float distance=radius-.34-bend;
    float envelope=exp(-pow(distance/.13,2.));
    float folds=distance*74.+sin(angle*3.+t)*2.2+sin(angle*7.-t)*.4;
    float ridge=.5+.5*sin(folds);
    float light=pow(ridge,9.)*.8+pow(ridge,2.)*.16;
    float directional=.45+.55*pow(.5+.5*cos(angle-1.8),2.);
    vec3 silver=mix(vec3(.14,.22,.25),vec3(.85,.94,.97),light);
    vec3 rim=vec3(.20,.70,.89)*pow(ridge,24.)*.6;
    vec3 color=vec3(.026,.036,.041)+(silver*light*directional+rim)*envelope;
    float edge=exp(-abs(distance+.118)*130.)*.08;
    color+=vec3(.16,.55,.7)*edge;
    color*=1.-smoothstep(.4,1.2,length(uv))*.7;
    color+=(hash(gl_FragCoord.xy)-.5)*.024;
    gl_FragColor=vec4(color,1.);
  }`;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {canvas.dataset.shaderError=gl.getShaderInfoLog(shader);gl.deleteShader(shader); return null;}
    return shader;
  }
  const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment);
  if (!vs || !fs) return;
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  gl.deleteShader(vs);gl.deleteShader(fs);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms=Object.fromEntries(['resolution','time','progress','pointer'].map(n=>[n,gl.getUniformLocation(program,n)]));
  let frame=0,last=0,clock=0,visible=true,lost=false;
  const pointer=[0,0];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const hero=document.querySelector('.signal-hero');
  function draw(){
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);gl.uniform1f(uniforms.time,clock);
    gl.uniform1f(uniforms.progress,Number(hero.style.getPropertyValue('--hero-progress'))||0);
    gl.uniform2f(uniforms.pointer,...pointer);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function paused(){return lost || !visible || document.hidden || reduced.matches || document.documentElement.classList.contains('motion-paused');}
  function tick(stamp){
    frame=0;if(paused())return;
    if(stamp-last>=33){clock+=Math.min((stamp-last)/1000,.06);last=stamp;draw();}
    frame=requestAnimationFrame(tick);
  }
  function sync(){cancelAnimationFrame(frame);frame=0;last=performance.now();if(!lost)draw();if(!paused())frame=requestAnimationFrame(tick);}
  function resize(){const rect=canvas.getBoundingClientRect();const ratio=Math.min(devicePixelRatio,1.25,1400/Math.max(rect.width,1));canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));sync();}
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  hero.addEventListener('pointermove',event=>{const r=hero.getBoundingClientRect();pointer[0]=(event.clientX-r.left)/r.width-.5;pointer[1]=event.clientY/innerHeight-.5;},{passive:true});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);canvas.classList.remove('is-ready');});
  canvas.dataset.renderer='webgl';canvas.classList.add('is-ready');resize();
})();
