(function(){
'use strict';
gsap.registerPlugin(ScrollTrigger);

const IS_MOBILE = window.innerWidth < 768;
const REDUCED   = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ── NAV ── */
function toggleMenu(){
  const m = document.getElementById('navMobile');
  m.classList.toggle('open');
  document.body.style.overflow = m.classList.contains('open') ? 'hidden' : '';
}
window.toggleMenu = toggleMenu;
window.addEventListener('scroll', ()=>{
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
}, {passive:true});

/* ── CANVAS PARTICLE SYSTEM ── */
const canvas = document.getElementById('pc');
const ctx    = canvas.getContext('2d');
let cw, ch;
function resizeCanvas(){
  cw = canvas.width  = window.innerWidth;
  ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, {passive:true});

/* Burst particle class */
class BurstParticle {
  constructor(x,y,vx,vy,r,gold,life){
    this.x=x; this.y=y; this.vx=vx; this.vy=vy;
    this.r=r; this.gold=gold; this.life=life; this.maxLife=life;
  }
  update(){ this.x+=this.vx; this.y+=this.vy; this.vy+=0.018; this.r*=0.987; this.life--; }
  draw(c){
    const a = this.life/this.maxLife;
    const col = this.gold ? `201,166,107` : `255,255,255`;
    const g = c.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*2.4);
    g.addColorStop(0,`rgba(${col},${a})`);
    g.addColorStop(1,`rgba(${col},0)`);
    c.fillStyle=g; c.beginPath(); c.arc(this.x,this.y,this.r*2.4,0,Math.PI*2); c.fill();
  }
}

let burstParticles = [];
let burstDone      = false;
let orbitAngle     = 0;
let scrollProg     = 0;

/* ambient dots */
const AMBIENT_COUNT = IS_MOBILE ? 14 : 22;
const ambDots = Array.from({length:AMBIENT_COUNT}, ()=>({
  x: Math.random()*window.innerWidth,
  y: Math.random()*window.innerHeight,
  vx:(Math.random()-.5)*.28,
  vy:-Math.random()*.35-.08,
  r: Math.random()*2.8+1,
  a: Math.random()*.35+.1,
  gold: Math.random()>.45,
  flk: Math.random()*Math.PI*2
}));

function updateAmbient(){
  ambDots.forEach(d=>{
    d.x+=d.vx; d.y+=d.vy; d.flk+=.045;
    if(d.y<-10){d.y=ch+10;d.x=Math.random()*cw}
    if(d.x<-10)d.x=cw+10; if(d.x>cw+10)d.x=-10;
  });
}
function drawAmbient(alpha){
  ambDots.forEach(d=>{
    const a=d.a*alpha*(0.7+Math.sin(d.flk)*.3);
    if(a<.01)return;
    const col=d.gold?'201,166,107':'240,248,255';
    const g=ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,d.r*2.6);
    g.addColorStop(0,`rgba(${col},${a})`);
    g.addColorStop(1,`rgba(${col},0)`);
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(d.x,d.y,d.r*2.6,0,Math.PI*2); ctx.fill();
  });
}

function doBurst(){
  const bx=cw/2, by=ch/2;
  const count=IS_MOBILE?50:82;
  for(let i=0;i<count;i++){
    const a=(Math.PI*2*i/count)+Math.random()*.5;
    const sp=Math.random()*7+1.8;
    burstParticles.push(new BurstParticle(
      bx+(Math.random()-.5)*22, by+(Math.random()-.5)*22,
      Math.cos(a)*sp, Math.sin(a)*sp,
      Math.random()*5.5+2.5, Math.random()>.38,
      Math.floor(Math.random()*65+38)
    ));
  }
}

function drawOrbit(p4progress){
  orbitAngle+=.004;
  const ox=cw/2, oy=ch/2;
  const count=IS_MOBILE?8:13;
  for(let i=0;i<count;i++){
    const a=orbitAngle+(Math.PI*2*i/count);
    const rx=128+Math.sin(a*1.8)*22;
    const ry=78+Math.cos(a*1.3)*14;
    const px=ox+Math.cos(a)*rx;
    const py=oy+Math.sin(a)*ry;
    const alpha=(0.28+Math.sin(a*2.8+orbitAngle*3)*.18)*p4progress;
    if(alpha<.02)continue;
    const isGold=i%3===0;
    const col=isGold?'201,166,107':'230,248,255';
    const r=Math.random()*1.8+1;
    const g=ctx.createRadialGradient(px,py,0,px,py,r*3.2);
    g.addColorStop(0,`rgba(${col},${alpha})`);
    g.addColorStop(1,`rgba(${col},0)`);
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,r*3.2,0,Math.PI*2); ctx.fill();
  }
}

/* canvas render loop */
function renderCanvas(){
  ctx.clearRect(0,0,cw,ch);
  if(REDUCED){requestAnimationFrame(renderCanvas);return;}

  updateAmbient();
  const p=scrollProg;

  /* Phase 1 ambient */
  if(p<.22) drawAmbient(1-Math.max(0,(p-.14)/.08));

  /* Phase 2 central glow */
  if(p>=.18&&p<.5){
    const t=Math.min(1,(p-.18)/.32);
    const gcx=cw/2,gcy=ch/2,gr=ctx.createRadialGradient(gcx,gcy,0,gcx,gcy,70*t+18);
    gr.addColorStop(0,`rgba(201,166,107,${.32*t})`);
    gr.addColorStop(.5,`rgba(201,166,107,${.1*t})`);
    gr.addColorStop(1,'rgba(201,166,107,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(gcx,gcy,70*t+18,0,Math.PI*2); ctx.fill();
  }

  /* Phase 3 burst trigger */
  if(p>=.41&&p<.46&&!burstDone){doBurst();burstDone=true;}
  if(p<.36)burstDone=false;
  burstParticles=burstParticles.filter(bp=>{bp.update();if(bp.life>0){bp.draw(ctx);return true;}return false;});

  /* Phase 4 orbit */
  if(p>=.61&&p<.96){
    drawOrbit(Math.min(1,(p-.61)/.34));
  }

  requestAnimationFrame(renderCanvas);
}
requestAnimationFrame(renderCanvas);

/* ── SPOTLIGHT (Phase 1) ── */
const SPOTS=[
  {name:'Lavanda',       benefit:'Relaxamento & Aromaterapia',    id:'i0'},
  {name:'Camomila',      benefit:'Suavização & Anti-inflamatório', id:'i1'},
  {name:'Glicerina Pura',benefit:'Hidratação Profunda 24h',        id:'i5'},
];
let lastSpotIdx=-1;
const spotName    = document.getElementById('ing-spot-name');
const spotBenefit = document.getElementById('ing-spot-benefit');
function updateSpotlight(p){
  if(p>=.20)return;
  const idx=Math.min(2,Math.floor((p/.20)*3));
  if(idx===lastSpotIdx)return;
  lastSpotIdx=idx;
  const s=SPOTS[idx];
  spotName.textContent=s.name;
  spotBenefit.textContent=s.benefit;
  document.querySelectorAll('.ing').forEach(el=>el.classList.remove('show-lbl'));
  document.getElementById(s.id)?.classList.add('show-lbl');
}

/* ── GSAP SCROLL ANIMATION ── */
if(REDUCED){
  /* simplified no-motion version */
  gsap.set(['#ing-layer .ing','#soap-wrap','.bp-item','#cta-layer'],{opacity:0});
  gsap.to('#ing-layer .ing',{opacity:1,stagger:.12,delay:.4,duration:.8});
  gsap.set('#soap-wrap',{xPercent:-50,yPercent:-50});
  gsap.to('#soap-wrap',{opacity:1,scale:1,filter:'blur(0px)',delay:1,duration:.8});
  gsap.to('.bp-item',{opacity:1,x:0,stagger:.1,delay:1.2,duration:.6});
  gsap.set('#cta-layer',{xPercent:-50});
  gsap.to('#cta-layer',{opacity:1,y:0,delay:1.5,duration:.6});
} else {
  /* full scrub experience — wait for layout paint */
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const ings = [...document.querySelectorAll('#ing-layer .ing')]
      .filter(el=>window.getComputedStyle(el).display!=='none');

    const vcx=window.innerWidth/2;
    const vcy=window.innerHeight/2;

    /* pre-calculate convergence vectors */
    ings.forEach(el=>{
      const r=el.getBoundingClientRect();
      el._toX = vcx-(r.left+r.width/2);
      el._toY = vcy-(r.top+r.height/2);
    });

    /* set GSAP-controlled centering using xPercent/yPercent */
    gsap.set('#ph1',       {xPercent:-50,yPercent:-50});
    gsap.set('#glow-core', {xPercent:-50,yPercent:-50,scale:0,opacity:0});
    gsap.set('#soap-wrap', {xPercent:-50,yPercent:-50,opacity:0,scale:.72,filter:'blur(20px)'});
    gsap.set('#cta-layer', {xPercent:-50,opacity:0,y:18});
    gsap.set('.bp-item',   {opacity:0,x:24});
    gsap.set('#ing-spotlight',{opacity:0});

    const tl=gsap.timeline({
      scrollTrigger:{
        trigger:'#stage',
        start:'top top',
        end:'+=500%',
        pin:true,
        scrub:1.3,
        anticipatePin:1,
        onUpdate(self){
          scrollProg=self.progress;
          updateSpotlight(self.progress);
        }
      }
    });

    /* dummy end anchor → total duration = 100 */
    tl.to({},{duration:100},0);

    /* ── Phase 1 (0-20): ingredients drift in ── */
    tl.to(ings,{opacity:1,scale:1,duration:10,stagger:1.8,ease:'power2.out'},0);
    tl.to('#ing-spotlight',{opacity:1,duration:5},6);

    /* ── Phase 2 (18-42): convergence ── */
    tl.to('#ph1',          {opacity:0,y:-38,duration:8,ease:'power2.in'},17);
    tl.to('#ing-spotlight',{opacity:0,duration:6},17);
    tl.to('#scroll-hint',  {opacity:0,duration:5},14);

    ings.forEach((el,i)=>{
      tl.to(el,{
        x:el._toX, y:el._toY,
        scale:.52,
        rotation:(i%2===0?1:-1)*195,
        duration:20,
        ease:'power2.inOut'
      },22+i*.9);
    });

    tl.to('#glow-core',{scale:4.8,opacity:1,duration:14},26);

    /* ── Phase 3 (40-60): dissolve + soap ── */
    tl.to(ings,{opacity:0,scale:.18,duration:8,stagger:.5,ease:'power2.in'},40);
    tl.to('#glow-core',{scale:9,opacity:.55,duration:6},40);
    tl.to('.mist-e',{opacity:.72,scale:1.85,duration:9,stagger:1.6},42);
    tl.to('#soap-wrap',{opacity:1,scale:1,filter:'blur(0px)',duration:13,ease:'power2.out'},46);
    tl.to('#glow-core',{opacity:0,duration:8},52);
    tl.to('.mist-e',   {opacity:0,duration:8,stagger:1},54);

    /* ── Phase 4 (62-92): benefits stagger in ── */
    tl.to('#bp0',{opacity:1,x:0,duration:7},63);
    tl.to('#bp1',{opacity:1,x:0,duration:7},69);
    tl.to('#bp2',{opacity:1,x:0,duration:7},75);
    tl.to('#bp3',{opacity:1,x:0,duration:7},81);

    /* ── Phase 5 (92-100): CTA ── */
    tl.to('#soap-wrap',      {y:-55,scale:.76,duration:5},91);
    tl.to('#benefits-panel', {opacity:0,duration:4},91);
    tl.to('#cta-layer',      {opacity:1,y:0,duration:6},93);
  }));
}

/* ── BELOW FOLD: IntersectionObserver ── */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v');io.unobserve(e.target);}});
},{threshold:.14});
document.querySelectorAll('.fu').forEach(el=>io.observe(el));

/* ── RESIZE ── */
window.addEventListener('resize',()=>{
  resizeCanvas();
  if(!REDUCED) ScrollTrigger.refresh();
},{passive:true});

})();
