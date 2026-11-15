/* Figuras interactivas de Transmisión del Calor. Vanilla JS + canvas. */
(function(){
const C = {};
function paleta(el){const cs=getComputedStyle(el);const v=n=>cs.getPropertyValue(n).trim();
  C.bg=v('--surface')||'#fff';C.grid=v('--line')||'#d5dcd9';C.text=v('--fg')||'#16211d';C.muted=v('--muted')||'#56635e';
  C.a=v('--tc')||v('--accent')||'#b4232f';C.b=v('--warn')||'#b8730c';C.c=v('--c6')||'#2c8a52';C.d=v('--c5')||'#c43d63';C.e=v('--c4')||'#b8730c';C.f=v('--c2')||'#3a63c4';}
const F=n=>Number.isInteger(n)?String(n):(Math.abs(n)<1e-9?'0':n.toFixed(2).replace('.',','));

function build(el, spec){
  el.classList.add('sim-box');paleta(el);
  const ctrls=document.createElement('div'); ctrls.className='ctrl sim-ctrls';
  const cv=document.createElement('canvas'); cv.width=spec.w||640; cv.height=spec.h||360; cv.className='sim-cv';
  const out=document.createElement('div'); out.className='readout sim-out';
  el.append(ctrls,cv,out);
  const st={};
  (spec.sliders||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=`${s.l}: ${F(s.v)} ${s.u||''}`;
    const inp=document.createElement('input');inp.type='range';inp.min=s.min;inp.max=s.max;inp.step=s.step||0.01;inp.value=s.v;
    inp.oninput=()=>{st[s.k]=parseFloat(inp.value);sp.textContent=`${s.l}: ${F(st[s.k])} ${s.u||''}`;draw();};lab.append(sp,inp);ctrls.append(lab);});
  (spec.selects||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=s.l;
    const sel=document.createElement('select');s.opts.forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];if(o[0]===s.v)op.selected=true;sel.append(op);});
    sel.onchange=()=>{st[s.k]=sel.value;draw();};lab.append(sp,sel);ctrls.append(lab);});
  const g=cv.getContext('2d');
  const api={st,cv,g,out,W:cv.width,H:cv.height,
    clear(){paleta(el);g.fillStyle=C.bg;g.fillRect(0,0,cv.width,cv.height);},
    txt(s,x,y,col,sz,al){g.fillStyle=col||C.text;g.font=(sz||13)+'px system-ui';g.textAlign=al||'left';g.fillText(s,x,y);},
    arrow(x1,y1,x2,y2,col,wd){g.strokeStyle=g.fillStyle=col;g.lineWidth=wd||2.5;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1),L=10;g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-L*Math.cos(a-0.4),y2-L*Math.sin(a-0.4));g.lineTo(x2-L*Math.cos(a+0.4),y2-L*Math.sin(a+0.4));g.closePath();g.fill();},
    line(x1,y1,x2,y2,col,wd,dash){g.strokeStyle=col;g.lineWidth=wd||1.5;g.setLineDash(dash||[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);},
    circ(x,y,r,col,fill){g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=col;g.fill();}else{g.strokeStyle=col;g.lineWidth=2;g.stroke();}},
    html(h){out.innerHTML=h;},
    // sistema de ejes cartesiano
    axes(cx,cy,u,xmin,xmax,ymin,ymax){for(let i=Math.ceil(xmin);i<=xmax;i++)api.line(cx+i*u,cy-ymax*u,cx+i*u,cy-ymin*u,C.grid,1);for(let j=Math.ceil(ymin);j<=ymax;j++)api.line(cx+xmin*u,cy-j*u,cx+xmax*u,cy-j*u,C.grid,1);api.line(cx+xmin*u,cy,cx+xmax*u,cy,C.muted,1.5);api.line(cx,cy-ymax*u,cx,cy-ymin*u,C.muted,1.5);}
  };
  function draw(){spec.draw(api);}
  draw(); return api;
}
const SIMS={};

/* ---- Transmisión del Calor: figuras interactivas ---- */
const NQ=x=>{const r=Math.round(x*1000)/1000;return (Math.abs(r-Math.round(r))<1e-9?String(Math.round(r)):r.toFixed(3).replace(/0+$/,'')).replace('.',',');};
const N0=x=>(Math.abs(x)<0.5?0:x).toFixed(0);
const N1=x=>(Math.abs(x)<5e-2?0:x).toFixed(1).replace('.',',');
const N2=x=>(Math.abs(x)<5e-3?0:x).toFixed(2).replace('.',',');
const N3=x=>(Math.abs(x)<5e-4?0:x).toFixed(3).replace('.',',');
const NE=x=>{if(x===0)return '0';const e=Math.floor(Math.log10(Math.abs(x)));const m=x/Math.pow(10,e);return N2(m)+'·10'+sup(e);};
const sup=n=>String(n).split('').map(c=>({'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'}[c]||c)).join('');
const ticks=(max,n)=>{const raw=max/n,p=Math.pow(10,Math.floor(Math.log10(raw))),c=[1,2,2.5,5,10].find(k=>k*p>=raw)*p;const o=[];for(let v=c;v<=max*1.0001;v+=c)o.push(v);return o;};
const Rbox=(a,x,y,w,h,col,fill)=>{if(fill){a.g.fillStyle=col;a.g.globalAlpha=0.14;a.g.fillRect(x,y,w,h);a.g.globalAlpha=1;}
  a.g.strokeStyle=col;a.g.lineWidth=2;a.g.strokeRect(x,y,w,h);};
const curve=(a,pts,col,wd,dash)=>{a.g.strokeStyle=col;a.g.lineWidth=wd||2;a.g.setLineDash(dash||[]);a.g.beginPath();
  pts.forEach((p,i)=>i?a.g.lineTo(p[0],p[1]):a.g.moveTo(p[0],p[1]));a.g.stroke();a.g.setLineDash([]);};
const SIG=5.67e-8;

/* T1 · Los tres mecanismos en paralelo */
SIMS.mecanismos=el=>build(el,{w:680,h:235,
 sliders:[{k:'Ts',v:120,min:30,max:600,step:5,l:'Temperatura de la superficie',u:'°C'},
  {k:'Tinf',v:20,min:-10,max:60,step:1,l:'Temperatura del aire y del entorno',u:'°C'},
  {k:'h',v:10,min:2,max:200,step:1,l:'Coeficiente de convección',u:'W/m²K'},
  {k:'eps',v:0.8,min:0.05,max:1,step:0.05,l:'Emisividad',u:''}],
 draw(a){a.clear();const s=a.st;
  const T1=s.Ts+273.15,T2=s.Tinf+273.15,dT=s.Ts-s.Tinf;
  const qc=s.h*dT;
  const qr=s.eps*SIG*(Math.pow(T1,4)-Math.pow(T2,4));
  const hr=s.eps*SIG*(T1+T2)*(T1*T1+T2*T2);
  const tot=qc+qr;
  // barras
  const ox=56,base=176,BW=96;
  const max=Math.max(qc,qr,1);
  const esc=130/max;
  const datos=[['Convección',qc,C.f,'h·ΔT'],['Radiación',qr,C.b,'εσ(T⁴−T⁴)']];
  datos.forEach((d,i)=>{const x=ox+i*(BW+46),hh=Math.max(d[1]*esc,1);
    a.g.fillStyle=d[2];a.g.globalAlpha=.30;a.g.fillRect(x,base-hh,BW,hh);a.g.globalAlpha=1;
    a.g.strokeStyle=d[2];a.g.lineWidth=2;a.g.strokeRect(x,base-hh,BW,hh);
    a.txt(d[0],x+BW/2,base+18,d[2],12,'center');
    a.txt(N0(d[1])+' W/m²',x+BW/2,base-hh-8,d[2],12,'center');
    a.txt(N0(100*d[1]/tot)+' %',x+BW/2,base+34,C.muted,11,'center');});
  a.line(ox-10,base,ox+2*BW+56,base,C.muted,1.5);
  a.txt('Flujo de calor desde 1 m² de superficie',ox-10,30,C.text,13);
  // panel
  const bx=330,by=40;
  a.txt('ΔT = '+N0(dT)+' °C',bx,by,C.text,13);
  a.txt('h convección = '+NQ(s.h)+' W/m²K',bx,by+26,C.f,12);
  a.txt('h radiación equivalente = '+N1(hr)+' W/m²K',bx,by+48,C.b,12);
  a.txt('h total = '+N1(s.h+hr)+' W/m²K',bx,by+70,C.a,13);
  a.txt('q total = '+N0(tot)+' W/m²',bx,by+98,C.a,15);
  const dom=qr>qc?'la radiación':'la convección';
  a.txt('domina '+dom,bx,by+120,qr>qc?C.b:C.f,12);
  a.html(`Con la superficie a <b>${NQ(s.Ts)} °C</b> y el entorno a ${NQ(s.Tinf)} °C:<br>
  convección <b>${N0(qc)} W/m²</b> (${N0(100*qc/tot)} %) · radiación <b>${N0(qr)} W/m²</b> (${N0(100*qr/tot)} %) · <b>total ${N0(tot)} W/m²</b>.<br>
  El coeficiente de radiación equivalente vale <b>${N1(hr)} W/m²K</b>, así que puede sumarse al de convección: h total = ${N1(s.h+hr)} W/m²K.
  <span class="hint">Sube la temperatura y observa cómo la radiación se dispara: crece con T⁴ mientras que la convección sólo crece linealmente. Con convección natural en aire (h ≈ 5-10) la radiación casi siempre gana; con un ventilador (h &gt; 50) pasa a ser secundaria.</span>`);}});

/* T2 · Ecuación general: qué términos sobreviven */
SIMS.ecuacion=el=>build(el,{w:680,h:250,
 selects:[{k:'caso',v:'plana',l:'Caso',opts:[['plana','Pared plana, permanente, sin generación'],['gen','Pared plana con generación interna'],['cil','Cilindro hueco, permanente'],['esf','Esfera hueca, permanente'],['trans','Pared plana en régimen transitorio'],['kvar','Pared plana con k(T) variable']]}],
 draw(a){a.clear();const s=a.st;
  const casos={
   plana:['Pared plana · permanente · sin generación','d²T/dx² = 0','T(x) = C₁x + C₂  →  perfil LINEAL','q = k(T₁−T₂)/L','Se anulan: ∂T/∂t (permanente), ∂/∂y y ∂/∂z (1D), q̇g (sin generación).'],
   gen:['Pared plana · permanente · con generación','d²T/dx² + q̇g/k = 0','T(x) = −q̇g x²/(2k) + C₁x + C₂  →  PARÁBOLA','q(x) = q̇g·x (crece con el espesor)','Se anula ∂T/∂t. El término q̇g convierte la recta en parábola: el máximo está donde dT/dx = 0.'],
   cil:['Cilindro hueco · permanente · radial','(1/r) d/dr (r dT/dr) = 0','T(r) = C₁ ln r + C₂  →  perfil LOGARÍTMICO','q = 2πkL(Ti−Te)/ln(re/ri)','El área crece con r, así que el gradiente disminuye: por eso sale un logaritmo y no una recta.'],
   esf:['Esfera hueca · permanente · radial','(1/r²) d/dr (r² dT/dr) = 0','T(r) = −C₁/r + C₂  →  perfil 1/r','q = 4πk(Ti−Te)/(1/ri − 1/re)','El área crece con r², y el perfil cae aún más deprisa que en el cilindro.'],
   trans:['Pared plana · transitorio · sin generación','∂²T/∂x² = (1/α) ∂T/∂t','Solución en serie; para Fo > 0,2 basta el primer término','α = k/(ρcp)','Aparece la difusividad térmica. Hace falta además una condición inicial T(x,0).'],
   kvar:['Pared plana · permanente · k(T) variable','d/dx ( k(T) dT/dx ) = 0','q·L = −∫k(T)dT  →  hay que INTEGRAR k(T)','Con k lineal: q = km(T₁−T₂)/L, km = k(Tm)','k NO puede salir de la derivada. Es la cuestión teórica más repetida del examen.']};
  const c=casos[s.caso];
  a.txt(c[0],36,34,C.a,15);
  Rbox(a,30,50,620,56,C.a,true);
  a.txt('Ecuación simplificada:',44,70,C.muted,11);
  a.txt(c[1],44,94,C.text,16);
  Rbox(a,30,116,620,48,C.c,false);
  a.txt('Solución:',44,136,C.muted,11);
  a.txt(c[2],44,156,C.c,14);
  a.txt(c[3],44,192,C.f,14);
  // ecuacion general de referencia
  a.txt('Punto de partida:  ∂/∂x(k ∂T/∂x) + ∂/∂y(k ∂T/∂y) + ∂/∂z(k ∂T/∂z) + q̇g = ρc ∂T/∂t',30,222,C.muted,11.5);
  a.html(`<b>${c[0]}.</b> La ecuación queda <b>${c[1]}</b> y su solución es ${c[2]}, de donde ${c[3]}.<br>
  ${c[4]}
  <span class="hint">El examen pide «justificar las hipótesis y simplificaciones»: ese apartado puntúa aparte. Escribe siempre la ecuación general completa y ve tachando términos uno a uno, diciendo por qué.</span>`);}});

/* T3 · Pared multicapa con analogía eléctrica */
SIMS.pared=el=>build(el,{w:680,h:290,
 sliders:[{k:'L1',v:12,min:1,max:40,step:1,l:'Espesor del ladrillo',u:'cm'},
  {k:'L2',v:5,min:0.5,max:20,step:0.5,l:'Espesor del aislante',u:'cm'},
  {k:'Ti',v:800,min:50,max:1200,step:10,l:'Temperatura interior',u:'°C'},
  {k:'hi',v:30,min:5,max:200,step:5,l:'h interior',u:'W/m²K'},
  {k:'he',v:12,min:2,max:100,step:1,l:'h exterior',u:'W/m²K'}],
 draw(a){a.clear();const s=a.st;
  const Te=25, k1=1.2, k2=0.05, k3=45, L3=0.005;
  const R=[['conv. int',1/s.hi,C.f],['ladrillo',s.L1/100/k1,C.e],['aislante',s.L2/100/k2,C.a],['acero',L3/k3,C.muted],['conv. ext',1/s.he,C.f]];
  const Rt=R.reduce((x,r)=>x+r[1],0);
  const q=(s.Ti-Te)/Rt;
  // perfil de temperaturas
  const ox=42,oy=172,W=350,H=112;
  const esp=[0.5,s.L1/100,s.L2/100,L3,0.5];
  const tot=esp.reduce((x,y)=>x+y,0);
  let x=ox, Tn=s.Ti;
  const Tmax=s.Ti,Tmin=Te;
  const Y=T=>oy-(T-Tmin)/(Tmax-Tmin+1e-9)*H;
  a.line(ox,oy,ox+W,oy,C.muted,1.5);a.line(ox,oy-H-6,ox,oy+6,C.muted,1.5);
  a.txt('T',ox-16,oy-H-4,C.muted,11);
  const pts=[[ox,Y(Tn)]];
  R.forEach((r,i)=>{const w=esp[i]/tot*W; const dT=q*r[1]; Tn-=dT;
    if(i>0&&i<4){a.g.fillStyle=r[2];a.g.globalAlpha=.12;a.g.fillRect(x,oy-H-6,w,H+6);a.g.globalAlpha=1;
      a.line(x,oy-H-6,x,oy,C.grid,1);}
    pts.push([x+w,Y(Tn)]);x+=w;});
  curve(a,pts,C.a,2.5);
  a.txt(NQ(s.Ti)+' °C',ox+10,Y(s.Ti)+14,C.b,11);
  a.txt(N0(Tn)+' °C',ox+W,Y(Tn)-8,C.f,11,'right');
  a.txt('interior',ox+6,oy+16,C.muted,10);
  a.txt('exterior',ox+W-6,oy+16,C.muted,10,'right');
  // reparto de resistencias
  const by=216,BW=350;
  a.txt('Reparto de la resistencia térmica total',ox,by-8,C.text,12);
  let xx=ox;
  R.forEach(r=>{const w=r[1]/Rt*BW;
    a.g.fillStyle=r[2];a.g.globalAlpha=.3;a.g.fillRect(xx,by,w,24);a.g.globalAlpha=1;
    a.g.strokeStyle=r[2];a.g.lineWidth=1;a.g.strokeRect(xx,by,w,24);
    if(w>58)a.txt(N0(100*r[1]/Rt)+' %',xx+w/2,by+16,r[2],11,'center');
    xx+=w;});
  // panel
  const bx=430,bya=46;
  a.txt('Resistencias (°C/W por m²)',bx,bya,C.text,12);
  R.forEach((r,i)=>a.txt(r[0]+': '+(r[1]<0.001?NE(r[1]):N3(r[1])),bx,bya+22+i*20,r[2],11.5));
  a.txt('total: '+N3(Rt),bx,bya+128,C.text,12);
  a.txt('q = ΔT/R = '+N0(q)+' W/m²',bx,bya+156,C.a,15);
  const Tch=Te+q/s.he;
  a.txt('T chapa exterior = '+N0(Tch)+' °C',bx,bya+180,C.b,12);
  a.html(`Pared de ${NQ(s.L1)} cm de ladrillo + ${NQ(s.L2)} cm de aislante + 0,5 cm de acero, con ${NQ(s.Ti)} °C dentro y 25 °C fuera:<br>
  resistencia total <b>${N3(Rt)} °C/W</b> por m² ⇒ <b>q = ${N0(q)} W/m²</b>, y la chapa exterior queda a <b>${N0(Tch)} °C</b>.<br>
  El aislante aporta el <b>${N0(100*R[2][1]/Rt)} %</b> de la resistencia con sólo ${NQ(s.L2)} cm de espesor.
  <span class="hint">Mueve los espesores: duplicar el aislante casi dobla la resistencia total, mientras que duplicar el ladrillo apenas cambia nada. En una pared en serie sólo importa la resistencia dominante.</span>`);}});

/* T3 extra · Aleta: perfil, eficiencia y efectividad */
SIMS.aleta=el=>build(el,{w:680,h:272,
 sliders:[{k:'L',v:50,min:5,max:200,step:5,l:'Longitud de la aleta',u:'mm'},
  {k:'t',v:3,min:0.5,max:12,step:0.5,l:'Espesor',u:'mm'},
  {k:'k',v:237,min:15,max:400,step:5,l:'Conductividad',u:'W/mK'},
  {k:'h',v:25,min:5,max:500,step:5,l:'Coeficiente de convección',u:'W/m²K'},
  {k:'Tb',v:100,min:40,max:300,step:5,l:'Temperatura de la base',u:'°C'}],
 draw(a){a.clear();const s=a.st;
  const Tinf=20,W=1.0;
  const L=s.L/1000,t=s.t/1000;
  const p=2*(W+t), Ac=W*t;
  const m=Math.sqrt(s.h*p/(s.k*Ac));
  const Lc=L+t/2, mL=m*Lc;
  const eta=Math.tanh(mL)/mL;
  const th=s.Tb-Tinf;
  const Qf=Math.sqrt(s.h*p*s.k*Ac)*th*Math.tanh(mL);
  const Qsin=s.h*Ac*th;
  const ef=Qf/Qsin;
  // perfil de temperatura
  const ox=50,oy=150,PW=340,PH=100;
  a.line(ox,oy,ox+PW+8,oy,C.muted,1.5);a.line(ox,oy-PH-8,ox,oy+6,C.muted,1.5);
  a.txt('T − T∞',ox+4,oy-PH-12,C.muted,11);
  a.txt('x',ox+PW+10,oy+4,C.muted,11);
  const pts=[];
  for(let i=0;i<=120;i++){const x=L*i/120;
    const q=th*Math.cosh(m*(Lc-x))/Math.cosh(mL);
    pts.push([ox+x/L*PW,oy-q/th*PH]);}
  curve(a,pts,C.a,2.5);
  a.line(ox,oy-PH,ox+PW,oy-PH,C.grid,1,[4,3]);
  a.txt('base '+NQ(s.Tb)+' °C',ox+4,oy-PH-2+14,C.b,11);
  const Tp=Tinf+th*Math.cosh(0)/Math.cosh(mL);
  a.txt('punta '+N1(Tp)+' °C',ox+PW,oy-th*(1/Math.cosh(mL))/th*PH-8,C.f,11,'right');
  a.txt('T∞ = 20 °C',ox+PW,oy-6,C.muted,10,'right');
  // dibujo de la aleta
  const ay=200;
  a.g.fillStyle=C.muted;a.g.globalAlpha=.25;a.g.fillRect(ox-18,ay-18,16,52);a.g.globalAlpha=1;
  a.g.fillStyle=C.a;a.g.globalAlpha=.3;a.g.fillRect(ox-2,ay,PW*1.0,Math.max(s.t*2.2,3));a.g.globalAlpha=1;
  a.txt('pared',ox-26,ay+46,C.muted,10);
  a.txt('aleta de '+NQ(s.L)+' × '+NQ(s.t)+' mm (por metro de anchura)',ox+10,ay+46,C.muted,11);
  // panel
  const bx=430,by=44;
  a.txt('m = √(hp/kA) = '+N1(m)+' 1/m',bx,by,C.muted,12);
  a.txt('mLc = '+N2(mL),bx,by+24,C.f,13);
  a.txt('η = tanh(mLc)/mLc = '+N3(eta),bx,by+52,C.c,14);
  a.txt('Q aleta = '+N1(Qf)+' W/m',bx,by+80,C.a,14);
  a.txt('Q sin aleta = '+N2(Qsin)+' W/m',bx,by+102,C.muted,12);
  a.txt('efectividad ε = '+N1(ef),bx,by+128,ef>2?C.c:C.b,14);
  a.txt(ef>2?'✓ la aleta compensa':'✗ no compensa (ε < 2)',bx,by+150,ef>2?C.c:C.b,12);
  a.html(`Aleta de aluminio de ${NQ(s.L)} mm con h = ${NQ(s.h)} W/m²K: <b>mLc = ${N2(mL)}</b>, <b>η = ${N3(eta)}</b> y <b>ε = ${N1(ef)}</b>.<br>
  Disipa <b>${N1(Qf)} W</b> por metro de anchura frente a los ${N2(Qsin)} W de la superficie desnuda. La punta queda a <b>${N1(Tp)} °C</b>.<br>
  ${mL>3?'Con mLc > 3 la punta ya está prácticamente a la temperatura del aire: alargar más la aleta no aporta nada y sólo añade peso.':(mL<0.5?'Con mLc pequeño la aleta está casi isoterma: eficiencia muy alta, y todavía hay margen para alargarla y ganar área.':'Con mLc entre 1 y 2 se aprovecha bien el material: es el rango de diseño habitual.')}
  <span class="hint">Sube h hasta valores de agua (500 W/m²K) y observa cómo se hunde la efectividad: las aletas sirven cuando el fluido es malo evacuando calor, es decir, con gases.</span>`);}});

/* T4 · Malla de diferencias finitas */
SIMS.nodal=el=>build(el,{w:680,h:300,
 sliders:[{k:'n',v:5,min:3,max:11,step:1,l:'Nodos por lado',u:''},
  {k:'Tsup',v:200,min:50,max:500,step:10,l:'Temperatura del borde superior',u:'°C'},
  {k:'Tlat',v:50,min:0,max:300,step:10,l:'Temperatura de los otros bordes',u:'°C'}],
 draw(a){a.clear();const s=a.st;
  const n=Math.round(s.n);
  // resolver Laplace por Gauss-Seidel
  const T=[];for(let i=0;i<n;i++){T.push([]);for(let j=0;j<n;j++)T[i].push(s.Tlat);}
  for(let j=0;j<n;j++)T[0][j]=s.Tsup;
  for(let it=0;it<3000;it++){let d=0;
    for(let i=1;i<n-1;i++)for(let j=1;j<n-1;j++){
      const v=(T[i-1][j]+T[i+1][j]+T[i][j-1]+T[i][j+1])/4;
      d=Math.max(d,Math.abs(v-T[i][j]));T[i][j]=v;}
    if(d<1e-6)break;}
  // dibujo de la malla
  const ox=40,oy=36,S=Math.min(210/(n-1),46);
  const Tmin=Math.min(s.Tsup,s.Tlat),Tmax=Math.max(s.Tsup,s.Tlat);
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){
    const x=ox+j*S,y=oy+i*S;
    const f=(T[i][j]-Tmin)/(Tmax-Tmin+1e-9);
    a.g.fillStyle=C.a;a.g.globalAlpha=.12+.6*f;a.circ(x,y,Math.min(S*0.34,13),C.a,true);a.g.globalAlpha=1;
    if(n<=7)a.txt(N0(T[i][j]),x,y+4,f>0.55?C.bg:C.text,Math.min(S*0.26,11),'center');}
  for(let i=0;i<n;i++){a.line(ox,oy+i*S,ox+(n-1)*S,oy+i*S,C.grid,1);a.line(ox+i*S,oy,ox+i*S,oy+(n-1)*S,C.grid,1);}
  a.txt('T = '+NQ(s.Tsup)+' °C',ox+(n-1)*S/2,oy-14,C.b,11,'center');
  a.txt('T = '+NQ(s.Tlat)+' °C',ox+(n-1)*S/2,oy+(n-1)*S+22,C.f,11,'center');
  // panel
  const bx=300,by=50;
  a.txt('Ecuación del nodo interior (malla cuadrada):',bx,by,C.text,12);
  Rbox(a,bx,by+10,350,34,C.a,true);
  a.txt('T_izq + T_der + T_sup + T_inf − 4·T_nodo = 0',bx+12,by+32,C.a,13);
  a.txt('Nodo de superficie con convección:',bx,by+70,C.text,12);
  Rbox(a,bx,by+80,350,48,C.f,false);
  a.txt('2T_int + T_sup + T_inf + (2hΔx/k)T∞',bx+12,by+100,C.f,12);
  a.txt('        − (4 + 2hΔx/k)·T_nodo = 0',bx+12,by+118,C.f,12);
  a.txt('Estabilidad del método explícito:',bx,by+152,C.text,12);
  a.txt('τ = αΔt/Δx² ≤ 1/2 (1D)   ·   ≤ 1/4 (2D)',bx,by+174,C.b,12.5);
  const centro=T[Math.floor(n/2)][Math.floor(n/2)];
  a.txt('T del nodo central = '+N1(centro)+' °C',bx,by+206,C.c,13);
  a.html(`Malla de <b>${n}×${n}</b> nodos resuelta por Gauss-Seidel con el borde superior a ${NQ(s.Tsup)} °C y los otros tres a ${NQ(s.Tlat)} °C.<br>
  La temperatura del <b>nodo central</b> vale <b>${N1(centro)} °C</b>; la solución analítica de este problema clásico da ${N1(s.Tlat+(s.Tsup-s.Tlat)*0.25)} °C (exactamente la media de los cuatro bordes).<br>
  Aumenta el número de nodos y comprueba que el resultado <b>deja de cambiar</b>: eso es la independencia de malla que hay que verificar siempre.
  <span class="hint">Cada nodo interior cumple que su temperatura es la media de sus cuatro vecinos. Los nodos de contorno tienen su propia ecuación, con medio volumen de control y el término de convección: ahí es donde se pierden los puntos del examen.</span>`);}});

/* T5 · Transitorio: Biot y sistemas concentrados */
SIMS.biot=el=>build(el,{w:680,h:258,
 sliders:[{k:'D',v:50,min:5,max:300,step:5,l:'Diámetro de la esfera',u:'mm'},
  {k:'k',v:14.9,min:0.2,max:400,step:0.1,l:'Conductividad del sólido',u:'W/mK'},
  {k:'h',v:120,min:5,max:2000,step:5,l:'Coeficiente de convección',u:'W/m²K'},
  {k:'Ti',v:500,min:50,max:900,step:10,l:'Temperatura inicial',u:'°C'},
  {k:'t',v:480,min:10,max:3600,step:10,l:'Instante que se marca',u:'s'}],
 draw(a){a.clear();const s=a.st;
  const Tinf=25,rho=7900,cp=477;
  const r0=s.D/2000, Lc=r0/3;
  const Bi=s.h*Lc/s.k;
  const al=s.k/(rho*cp);
  const b=s.h/(rho*cp*Lc);
  const tau=1/b;
  const ok=Bi<=0.1;
  // curva de enfriamiento
  const ox=48,oy=170,W=340,H=128;
  const tmax=Math.max(5*tau,s.t*1.2);
  const X=t=>ox+t/tmax*W, Y=T=>oy-(T-Tinf)/(s.Ti-Tinf)*H;
  a.line(ox,oy,ox+W+8,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  const pts=[];for(let i=0;i<=200;i++){const t=tmax*i/200;pts.push([X(t),Y(Tinf+(s.Ti-Tinf)*Math.exp(-b*t))]);}
  curve(a,pts,ok?C.a:C.muted,2.5,ok?[]:[5,4]);
  a.line(ox,Y(Tinf),ox+W,Y(Tinf),C.f,1.2,[4,3]);
  a.txt('T∞ = 25 °C',ox+W,Y(Tinf)+14,C.f,10,'right');
  a.txt(NQ(s.Ti)+' °C',ox+10,Y(s.Ti)+16,C.b,11);
  a.txt('t (s)',ox+W+10,oy+30,C.muted,10,'right');
  // marca de tiempo
  const Tt=Tinf+(s.Ti-Tinf)*Math.exp(-b*s.t);
  a.line(X(s.t),oy-H,X(s.t),oy,C.b,1.2,[3,3]);
  a.circ(X(s.t),Y(Tt),5,C.b,true);
  a.txt(N1(Tt)+' °C',X(s.t)+8,Y(Tt)-8,C.b,11);
  // constante de tiempo
  a.line(X(tau),oy-H,X(tau),oy,C.c,1,[2,3]);
  a.txt('τ',X(tau),oy+16,C.c,11,'center');
  // panel
  const bx=420,by=34;
  a.txt('Lc = V/As = r₀/3 = '+N2(Lc*1000)+' mm',bx,by,C.muted,12);
  a.txt('Bi = h·Lc/k = '+N3(Bi),bx,by+24,ok?C.c:C.b,15);
  a.txt(ok?'✓ Bi ≤ 0,1: sistemas concentrados':'✗ Bi > 0,1: hace falta Heisler',bx,by+46,ok?C.c:C.b,12);
  a.txt('α = k/(ρcp) = '+NE(al)+' m²/s',bx,by+76,C.muted,11.5);
  a.txt('b = h/(ρcp·Lc) = '+NE(b)+' 1/s',bx,by+98,C.f,11.5);
  a.txt('τ = 1/b = '+N0(tau)+' s',bx,by+120,C.c,13);
  a.txt('Fo = αt/Lc² = '+N1(al*s.t/(Lc*Lc)),bx,by+146,C.muted,12);
  a.txt('T('+N0(s.t)+' s) = '+N1(Tt)+' °C',bx,by+174,C.a,14);
  a.html(`Esfera de ${NQ(s.D)} mm con h = ${NQ(s.h)} W/m²K: <b>Bi = ${N3(Bi)}</b>, ${ok?'<b>por debajo de 0,1</b>, así que el modelo de sistemas concentrados es válido':'<b>por encima de 0,1</b>: la temperatura NO es uniforme dentro y la curva dibujada sólo es orientativa'}.<br>
  Constante de tiempo <b>τ = ${N0(tau)} s</b>; a los ${N0(s.t)} s la temperatura es de <b>${N1(Tt)} °C</b>.<br>
  En un tiempo τ se recorre el 63 % del camino hacia T∞, y en 5τ el proceso está prácticamente terminado.
  <span class="hint">Sube h o baja k y observa cómo Biot cruza el 0,1: ahí es donde hay que cambiar de método. Fíjate también en que Lc = V/As = r₀/3 sirve para el criterio, pero en los gráficos de Heisler se usa r₀.</span>`);}});

/* T6 · Capa límite */
SIMS.capalimite=el=>build(el,{w:680,h:235,
 sliders:[{k:'U',v:5,min:0.5,max:40,step:0.5,l:'Velocidad del fluido',u:'m/s'},
  {k:'L',v:1,min:0.1,max:4,step:0.1,l:'Longitud de la placa',u:'m'}],
 selects:[{k:'fl',v:'aire',l:'Fluido',opts:[['aire','Aire (Pr = 0,72)'],['agua','Agua (Pr = 4,3)'],['aceite','Aceite (Pr = 2870)'],['metal','Sodio líquido (Pr = 0,005)']]}],
 draw(a){a.clear();const s=a.st;
  const fl={aire:[1.75e-5,0.0274,0.72],agua:[0.658e-6,0.631,4.34],aceite:[2.4e-4,0.1444,2870],metal:[7.0e-7,80.0,0.005]}[s.fl];
  const nu=fl[0],k=fl[1],Pr=fl[2];
  const ReL=s.U*s.L/nu;
  const xcr=5e5*nu/s.U;
  const ox=48,oy=186,W=360;
  a.line(ox,oy,ox+W+10,oy,C.text,2.5);
  a.txt('placa',ox+W/2,oy+18,C.muted,11,'center');
  const esc=1;
  const dmax=5*s.L/Math.sqrt(Math.max(5e5*Math.min(1,s.L/Math.max(xcr,1e-9)),Math.sqrt(ReL)));
  // dibujar delta y delta_t escalados al canvas
  const pts=[],ptt=[];
  let dref=0;
  for(let i=1;i<=120;i++){const x=s.L*i/120;const Rex=s.U*x/nu;
    const d=Rex<5e5?5*x/Math.sqrt(Rex):0.382*x/Math.pow(Rex,0.2);
    dref=Math.max(dref,d);}
  const ky=110/Math.max(dref,1e-9);
  for(let i=0;i<=120;i++){const x=s.L*i/120;const Rex=Math.max(s.U*x/nu,1);
    const d=Rex<5e5?5*x/Math.sqrt(Rex):0.382*x/Math.pow(Rex,0.2);
    const dt=d/Math.pow(Pr,1/3);
    pts.push([ox+x/s.L*W,oy-Math.min(d*ky,150)]);
    ptt.push([ox+x/s.L*W,oy-Math.min(dt*ky,150)]);}
  curve(a,pts,C.f,2.5);
  curve(a,ptt,C.b,2.5,[5,4]);
  a.line(ox,40,ox+24,40,C.f,2.5);a.txt('δ  hidrodinámica',ox+30,44,C.f,11);
  a.line(ox+150,40,ox+174,40,C.b,2.5,[5,4]);a.txt('δt térmica',ox+180,44,C.b,11);
  if(xcr<s.L){const xx=ox+xcr/s.L*W;a.line(xx,oy-150,xx,oy,C.a,1.5,[4,3]);
    a.txt('transición',xx,oy-156,C.a,11,'center');}
  a.txt('Espesores de capa límite a escala relativa',ox,20,C.text,12);
  // panel
  const bx=440,by=36;
  const NuL=ReL<5e5?0.664*Math.pow(Pr,1/3)*Math.sqrt(ReL):(0.037*Math.pow(ReL,0.8)-871)*Math.pow(Pr,1/3);
  const h=NuL*k/s.L;
  a.txt('ν = '+NE(nu)+' m²/s',bx,by,C.muted,11.5);
  a.txt('Pr = '+NQ(Pr),bx,by+22,C.b,12);
  a.txt('Re_L = '+NE(ReL),bx,by+48,ReL<5e5?C.c:C.a,13);
  a.txt(ReL<5e5?'laminar en toda la placa':'cruza la transición',bx,by+68,ReL<5e5?C.c:C.a,11.5);
  a.txt('x crítica = '+(xcr<10?N2(xcr)+' m':'> 10 m'),bx,by+92,C.muted,11.5);
  a.txt('δ/δt ≈ Pr^(1/3) = '+N2(Math.pow(Pr,1/3)),bx,by+120,C.f,12);
  a.txt('Nu_L = '+N0(NuL),bx,by+146,C.c,12);
  a.txt('h = '+(h<1000?N1(h):N0(h))+' W/m²K',bx,by+170,C.a,14);
  a.html(`${{aire:'Aire',agua:'Agua',aceite:'Aceite',metal:'Sodio líquido'}[s.fl]} a ${NQ(s.U)} m/s sobre una placa de ${NQ(s.L)} m: <b>Re_L = ${NE(ReL)}</b> (${ReL<5e5?'laminar':'turbulento al final'}), <b>Nu = ${N0(NuL)}</b> y <b>h = ${h<1000?N1(h):N0(h)} W/m²K</b>.<br>
  La relación entre espesores es δ/δt ≈ Pr^(1/3) = <b>${N2(Math.pow(Pr,1/3))}</b>: ${Pr>10?'en este fluido la capa hidrodinámica es mucho más gruesa que la térmica':(Pr<0.1?'aquí la capa térmica es mucho más gruesa que la hidrodinámica, lo típico de los metales líquidos':'ambas capas son de espesor parecido, como ocurre en los gases')}.
  <span class="hint">Cambia de fluido y observa las dos curvas. En gases (Pr ≈ 0,7) casi coinciden; en aceite la térmica es catorce veces más fina; en metales líquidos ocurre justo lo contrario, y por eso necesitan correlaciones propias.</span>`);}});

/* T7 · Placa plana: Nusselt local y medio */
SIMS.placa=el=>build(el,{w:680,h:245,
 sliders:[{k:'U',v:5,min:0.5,max:40,step:0.5,l:'Velocidad',u:'m/s'},
  {k:'L',v:1.5,min:0.2,max:6,step:0.1,l:'Longitud de la placa',u:'m'},
  {k:'Ts',v:80,min:30,max:300,step:5,l:'Temperatura de la placa',u:'°C'},
  {k:'Tinf',v:20,min:-10,max:60,step:1,l:'Temperatura del aire',u:'°C'}],
 draw(a){a.clear();const s=a.st;
  const Tf=(s.Ts+s.Tinf)/2;
  // propiedades del aire interpoladas
  const nu=(1.516+ (Tf-20)*0.0101)*1e-5;
  const k=0.02514+(Tf-20)*7.0e-5;
  const Pr=0.7309-(Tf-20)*1.4e-4;
  const ReL=s.U*s.L/nu, xcr=5e5*nu/s.U;
  const ox=52,oy=172,W=330,H=132;
  // h local
  const hx=x=>{const Re=Math.max(s.U*x/nu,1);
    return Re<5e5? 0.332*Math.pow(Pr,1/3)*Math.sqrt(Re)*k/x : 0.0296*Math.pow(Pr,1/3)*Math.pow(Re,0.8)*k/x;};
  let hmax=0;for(let i=1;i<=200;i++)hmax=Math.max(hmax,hx(s.L*i/200));
  const X=x=>ox+x/s.L*W, Y=h=>oy-h/(hmax*1.1)*H;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  ticks(hmax*1.1,4).forEach(v=>{a.line(ox,Y(v),ox+W,Y(v),C.grid,1);a.txt(N0(v),ox-6,Y(v)+4,C.muted,10,'right');});
  a.txt('h local (W/m²K)',ox+2,oy-H-12,C.muted,11);
  a.txt('x (m)',ox+W/2,oy+36,C.muted,10,'center');
  const pts=[];for(let i=1;i<=240;i++){const x=s.L*i/240;pts.push([X(x),Y(hx(x))]);}
  curve(a,pts,C.a,2.5);
  const NuL=ReL<5e5?0.664*Math.pow(Pr,1/3)*Math.sqrt(ReL):(0.037*Math.pow(ReL,0.8)-871)*Math.pow(Pr,1/3);
  const hm=NuL*k/s.L;
  a.line(ox,Y(hm),ox+W,Y(hm),C.c,1.5,[5,4]);
  a.txt('h medio = '+N2(hm),ox+W,Y(hm)-8,C.c,11,'right');
  if(xcr<s.L){a.line(X(xcr),oy-H,X(xcr),oy,C.b,1.5,[4,3]);
    a.txt('transición',X(xcr),oy-H-12,C.b,11,'center');}
  for(let i=0;i<=4;i++)a.txt(N2(s.L*i/4),X(s.L*i/4),oy+18,C.muted,10,'center');
  // panel
  const bx=426,by=32;
  a.txt('Tf = '+N1(Tf)+' °C',bx,by,C.muted,12);
  a.txt('ν = '+NE(nu)+' m²/s',bx,by+22,C.muted,11.5);
  a.txt('Pr = '+N3(Pr),bx,by+44,C.muted,11.5);
  a.txt('Re_L = '+NE(ReL),bx,by+70,ReL<5e5?C.c:C.b,13);
  a.txt(ReL<5e5?'laminar: Nu = 0,664 Pr⅓ Re½':'mixta: Nu = (0,037Re⁰·⁸−871)Pr⅓',bx,by+92,ReL<5e5?C.c:C.b,11);
  a.txt('Nu_L = '+N0(NuL),bx,by+120,C.f,13);
  a.txt('h medio = '+N2(hm)+' W/m²K',bx,by+146,C.a,14);
  const Q=hm*s.L*1*(s.Ts-s.Tinf);
  a.txt('q = '+N0(Q)+' W por m de ancho',bx,by+172,C.b,12);
  a.html(`Aire a ${NQ(s.U)} m/s sobre una placa de ${NQ(s.L)} m a ${NQ(s.Ts)} °C: propiedades a Tf = ${N1(Tf)} °C, <b>Re_L = ${NE(ReL)}</b> ⇒ ${ReL<5e5?'régimen <b>laminar</b> en toda la placa':'la capa límite <b>cruza la transición</b> en x = '+N2(xcr)+' m'}.<br>
  <b>Nu_L = ${N0(NuL)}</b>, <b>h medio = ${N2(hm)} W/m²K</b> y se evacúan <b>${N0(Q)} W</b> por metro de anchura.<br>
  Observa que el <b>h local cae</b> al avanzar (la capa límite se engrosa)${xcr<s.L?'y da un salto en la transición, porque la turbulencia mezcla el fluido y mejora el transporte':'; en laminar, el h medio es exactamente el doble del local al final de la placa'}.
  <span class="hint">Sube la velocidad hasta que Re_L supere 5·10⁵ y verás aparecer la línea de transición. Ése es el momento de cambiar de correlación: usar la laminar más allá es el error más repetido en este tema.</span>`);}});

/* T8 · Flujo interno */
SIMS.tubo=el=>build(el,{w:680,h:268,
 sliders:[{k:'m',v:0.05,min:0.005,max:2,step:0.005,l:'Caudal másico',u:'kg/s'},
  {k:'D',v:10,min:3,max:60,step:1,l:'Diámetro interior',u:'mm'},
  {k:'L',v:2,min:0.2,max:20,step:0.1,l:'Longitud del tubo',u:'m'},
  {k:'Te',v:35,min:5,max:90,step:1,l:'Temperatura de entrada',u:'°C'},
  {k:'Ts',v:100,min:40,max:200,step:5,l:'Temperatura de pared',u:'°C'}],
 selects:[{k:'fl',v:'agua',l:'Fluido',opts:[['agua','Agua'],['aceite','Aceite de motor'],['aire','Aire']]}],
 draw(a){a.clear();const s=a.st;
  const fl={agua:[4180,6.5e-4,0.63,4.3,1000],aceite:[1964,0.210,0.1444,2870,876],aire:[1007,1.95e-5,0.0276,0.72,1.1]}[s.fl];
  const cp=fl[0],mu=fl[1],k=fl[2],Pr=fl[3];
  const D=s.D/1000;
  const Re=4*s.m/(Math.PI*D*mu);
  const lam=Re<2300;
  const Lt=lam?0.05*Re*Pr*D:10*D;
  const des=s.L>Lt;
  let Nu,corr;
  if(lam){ if(des){Nu=3.66;corr='laminar desarrollado (Ts cte): Nu = 3,66';}
    else{const Gz=(D/s.L)*Re*Pr; Nu=1.86*Math.pow(Gz,1/3); corr='Sieder-Tate (entrada): Nu = 1,86 ((D/L)RePr)⅓';}}
  else{Nu=0.023*Math.pow(Re,0.8)*Math.pow(Pr,0.4);corr=Re<1e4?'Dittus-Boelter (ZONA DE TRANSICIÓN: Re < 10⁴)':'Dittus-Boelter: Nu = 0,023 Re⁰·⁸ Pr⁰·⁴';}
  const h=Nu*k/D;
  const As=Math.PI*D*s.L;
  const Tsal=s.Ts-(s.Ts-s.Te)*Math.exp(-h*As/(s.m*cp));
  const Q=s.m*cp*(Tsal-s.Te);
  // perfil de temperatura a lo largo del tubo
  const ox=48,oy=170,W=330,H=104;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  const Tmin=s.Te,Tmax=s.Ts;
  const Y=T=>oy-(T-Tmin)/(Tmax-Tmin+1e-9)*H, X=x=>ox+x/s.L*W;
  a.line(ox,Y(s.Ts),ox+W,Y(s.Ts),C.b,1.5,[5,4]);
  a.txt('T pared = '+NQ(s.Ts)+' °C',ox+W,Y(s.Ts)-8,C.b,11,'right');
  const pts=[];for(let i=0;i<=160;i++){const x=s.L*i/160;
    pts.push([X(x),Y(s.Ts-(s.Ts-s.Te)*Math.exp(-h*Math.PI*D*x/(s.m*cp)))]);}
  curve(a,pts,C.a,2.5);
  a.txt(NQ(s.Te)+' °C',ox+10,Y(s.Te)-10,C.f,11);
  a.txt(N1(Tsal)+' °C',ox+W,Y(Tsal)+16,C.a,11,'right');
  a.txt('T media de mezcla a lo largo del tubo',ox,30,C.text,12);
  a.txt('x (m)',ox+W+10,oy+16,C.muted,10,'right');
  // tubo dibujado
  a.g.fillStyle=C.f;a.g.globalAlpha=.15;a.g.fillRect(ox,oy+26,W,22);a.g.globalAlpha=1;
  a.g.strokeStyle=C.muted;a.g.lineWidth=1.5;a.g.strokeRect(ox,oy+26,W,22);
  a.arrow(ox+10,oy+37,ox+W-10,oy+37,C.f,1.6);
  a.txt('L = '+NQ(s.L)+' m · D = '+NQ(s.D)+' mm',ox+W/2,oy+66,C.muted,11,'center');
  // panel
  const bx=426,by=44;
  a.txt('Re = 4ṁ/(πDμ) = '+(Re<1e4?N0(Re):NE(Re)),bx,by,lam?C.c:C.b,14);
  a.txt(lam?'laminar (Re < 2300)':(Re<1e4?'transición (2300 < Re < 10⁴)':'turbulento'),bx,by+20,lam?C.c:C.b,11.5);
  a.txt('Pr = '+NQ(Pr),bx,by+44,C.muted,11.5);
  a.txt('L entrada térmica = '+(Lt<100?N2(Lt)+' m':'> 100 m'),bx,by+66,C.muted,11.5);
  a.txt(des?'✓ flujo desarrollado':'✗ región de entrada',bx,by+86,des?C.c:C.b,11.5);
  a.txt(corr,bx,by+112,C.f,10.5);
  a.txt('Nu = '+N2(Nu)+' → h = '+N0(h)+' W/m²K',bx,by+136,C.a,13);
  a.txt('T salida = '+N1(Tsal)+' °C',bx,by+162,C.a,14);
  a.txt('Q = '+(Q<1000?N0(Q)+' W':N1(Q/1000)+' kW'),bx,by+186,C.c,13);
  a.html(`${{agua:'Agua',aceite:'Aceite de motor',aire:'Aire'}[s.fl]} a ${NQ(s.m)} kg/s por un tubo de ${NQ(s.D)} mm y ${NQ(s.L)} m con la pared a ${NQ(s.Ts)} °C:<br>
  <b>Re = ${Re<1e4?N0(Re):NE(Re)}</b> (${lam?'laminar':'turbulento'}), ${des?'flujo <b>desarrollado</b>':'<b>región de entrada</b> (L entrada = '+(Lt<100?N2(Lt)+' m':'más de 100 m')+')'} ⇒ ${corr}.<br>
  <b>h = ${N0(h)} W/m²K</b>, el fluido sale a <b>${N1(Tsal)} °C</b> y se transfieren <b>${Q<1000?N0(Q)+' W':N1(Q/1000)+' kW'}</b>.
  <span class="hint">Prueba con aceite: el Prandtl de 2870 dispara la longitud de entrada térmica a decenas de metros, así que el flujo nunca se desarrolla y hay que usar la correlación de entrada. Es exactamente el problema del examen de junio de 2019.</span>`);}});

/* T9 · Convección natural */
SIMS.natural=el=>build(el,{w:680,h:285,
 sliders:[{k:'Ts',v:70,min:25,max:300,step:5,l:'Temperatura de la superficie',u:'°C'},
  {k:'Tinf',v:20,min:-10,max:50,step:1,l:'Temperatura del aire',u:'°C'},
  {k:'L',v:0.5,min:0.05,max:3,step:0.05,l:'Longitud característica',u:'m'},
  {k:'eps',v:0.9,min:0.05,max:1,step:0.05,l:'Emisividad',u:''}],
 selects:[{k:'geo',v:'vert',l:'Geometría',opts:[['vert','Placa vertical'],['harr','Placa horizontal, caliente hacia arriba'],['habj','Placa horizontal, caliente hacia abajo'],['cil','Cilindro horizontal']]}],
 draw(a){a.clear();const s=a.st;
  const Tf=(s.Ts+s.Tinf)/2, Tk=Tf+273.15;
  const nu=(1.516+(Tf-20)*0.0101)*1e-5;
  const k=0.02514+(Tf-20)*7.0e-5;
  const Pr=0.7309-(Tf-20)*1.4e-4;
  const beta=1/Tk, dT=s.Ts-s.Tinf;
  const Ra=9.81*beta*dT*Math.pow(s.L,3)/(nu*nu)*Pr;
  let Nu,corr;
  if(s.geo==='vert'){Nu=Math.pow(0.825+0.387*Math.pow(Ra,1/6)/Math.pow(1+Math.pow(0.492/Pr,9/16),8/27),2);corr='Churchill-Chu (placa vertical)';}
  else if(s.geo==='cil'){Nu=Math.pow(0.6+0.387*Math.pow(Ra,1/6)/Math.pow(1+Math.pow(0.559/Pr,9/16),8/27),2);corr='Churchill-Chu (cilindro horizontal)';}
  else if(s.geo==='harr'){Nu=Ra<1e7?0.54*Math.pow(Ra,0.25):0.15*Math.pow(Ra,1/3);corr=Ra<1e7?'Nu = 0,54 Ra¼ (caliente arriba)':'Nu = 0,15 Ra⅓ (caliente arriba)';}
  else{Nu=0.27*Math.pow(Ra,0.25);corr='Nu = 0,27 Ra¼ (caliente abajo)';}
  const h=Nu*k/s.L;
  const T1=s.Ts+273.15,T2=s.Tinf+273.15;
  const hr=s.eps*SIG*(T1+T2)*(T1*T1+T2*T2);
  const qc=h*dT, qr=hr*dT, tot=qc+qr;
  // barras comparativas
  const ox=52,base=196,BW=86;
  const max=Math.max(qc,qr,1), esc=118/max;
  [['Convección\\nnatural',qc,C.f],['Radiación',qr,C.b]].forEach((d,i)=>{
    const x=ox+i*(BW+40),hh=Math.max(d[1]*esc,1);
    a.g.fillStyle=d[2];a.g.globalAlpha=.3;a.g.fillRect(x,base-hh,BW,hh);a.g.globalAlpha=1;
    a.g.strokeStyle=d[2];a.g.lineWidth=2;a.g.strokeRect(x,base-hh,BW,hh);
    a.txt(d[0].split('\\n')[0],x+BW/2,base+18,d[2],11,'center');
    if(d[0].indexOf('\\n')>0)a.txt(d[0].split('\\n')[1],x+BW/2,base+32,d[2],11,'center');
    a.txt(N0(d[1])+' W/m²',x+BW/2,base-hh-8,d[2],11.5,'center');});
  a.line(ox-10,base,ox+2*BW+50,base,C.muted,1.5);
  a.txt('Flujo de calor por m²',ox-10,32,C.text,12);
  a.txt('h = '+N2(h)+' W/m²K',ox,base+58,C.f,12);
  a.txt('h radiación = '+N2(hr)+' W/m²K',ox,base+78,C.b,12);
  // panel
  const bx=324,by=48;
  a.txt(corr,bx,by,C.text,12);
  a.txt('Tf = '+N1(Tf)+' °C · β = 1/T = '+NE(beta)+' 1/K',bx,by+26,C.muted,11.5);
  a.txt('Ra = gβΔT L³ Pr/ν² = '+NE(Ra),bx,by+50,C.a,13);
  a.txt(Ra<1e9?'laminar (Ra < 10⁹)':'turbulento (Ra > 10⁹)',bx,by+70,Ra<1e9?C.c:C.b,11.5);
  a.txt('Nu = '+N1(Nu),bx,by+96,C.f,13);
  a.txt('h convección = '+N2(h)+' W/m²K',bx,by+122,C.f,13);
  a.txt('h radiación = '+N2(hr)+' W/m²K',bx,by+146,C.b,13);
  a.txt('h total = '+N2(h+hr)+' W/m²K',bx,by+174,C.a,15);
  a.txt('q total = '+N0(tot)+' W/m²',bx,by+198,C.c,13);
  a.html(`${corr} con ΔT = ${N0(dT)} °C y L = ${NQ(s.L)} m: <b>Ra = ${NE(Ra)}</b> (${Ra<1e9?'laminar':'turbulento'}), <b>Nu = ${N1(Nu)}</b> y <b>h = ${N2(h)} W/m²K</b>.<br>
  La radiación aporta un coeficiente equivalente de <b>${N2(hr)} W/m²K</b>, es decir, el <b>${N0(100*qr/tot)} %</b> del calor total evacuado (${N0(tot)} W/m²).<br>
  ${qr>qc?'Aquí la radiación <b>evacúa más que la convección</b>: despreciarla sería un error de más del 50 %.':'En este caso domina la convección, pero la radiación sigue aportando una fracción apreciable.'}
  <span class="hint">Compara las geometrías: una placa caliente mirando hacia abajo disipa la mitad que mirando hacia arriba, porque el aire caliente queda atrapado contra ella. La orientación es un dato del problema, no un detalle.</span>`);}});

/* T10 · Radiación: Planck, Wien y pantallas */
SIMS.radiacion=el=>build(el,{w:680,h:300,
 sliders:[{k:'T1',v:800,min:100,max:2000,step:20,l:'Temperatura de la superficie 1',u:'°C'},
  {k:'T2',v:500,min:20,max:1500,step:10,l:'Temperatura de la superficie 2',u:'°C'},
  {k:'e1',v:0.8,min:0.05,max:1,step:0.05,l:'Emisividad 1',u:''},
  {k:'e2',v:0.4,min:0.05,max:1,step:0.05,l:'Emisividad 2',u:''},
  {k:'np',v:0,min:0,max:5,step:1,l:'Número de pantallas (ε = 0,05)',u:''}],
 draw(a){a.clear();const s=a.st;
  const T1=s.T1+273.15,T2=s.T2+273.15,ep=0.05;
  const Rbase=1/s.e1+1/s.e2-1;
  const n=Math.round(s.np);
  const Rtot=n===0?Rbase:(1/s.e1+1/ep-1)+(n-1)*(2/ep-1)+(1/ep+1/s.e2-1);
  const q0=SIG*(Math.pow(T1,4)-Math.pow(T2,4))/Rbase;
  const q=SIG*(Math.pow(T1,4)-Math.pow(T2,4))/Rtot;
  const lmax=2897.8/T1;
  // curva de Planck
  const ox=48,oy=188,W=300,H=140;
  const C1=3.742e8,C2=1.439e4;
  const E=(l,T)=>C1/(Math.pow(l,5)*(Math.exp(C2/(l*T))-1));
  let emax=0;const lm=Math.min(Math.max(lmax*6,4),40);
  for(let i=1;i<=300;i++)emax=Math.max(emax,E(lm*i/300,T1));
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  [[T1,C.a],[T2,C.f]].forEach(([T,col])=>{const pts=[];
    for(let i=1;i<=300;i++){const l=lm*i/300;pts.push([ox+l/lm*W,oy-Math.min(E(l,T)/emax,1.05)*H]);}
    curve(a,pts,col,2.2);});
  const xm=ox+lmax/lm*W;
  a.line(xm,oy-H,xm,oy,C.b,1.2,[4,3]);
  a.txt('λmax = '+N2(lmax)+' µm',xm+6,oy-H+12,C.b,11);
  a.txt('Ley de Planck · emisión espectral',ox,30,C.text,12);
  a.txt('λ (µm)',ox+W/2,oy+36,C.muted,10,'center');
  for(let i=0;i<=4;i++)a.txt(N1(lm*i/4),ox+W*i/4,oy+18,C.muted,10,'center');
  a.txt(NQ(s.T1)+' °C',ox+W-4,oy-H+4,C.a,11,'right');
  a.txt(NQ(s.T2)+' °C',ox+W-4,oy-H+22,C.f,11,'right');
  // pantallas dibujadas
  const py=238;
  a.g.fillStyle=C.a;a.g.globalAlpha=.3;a.g.fillRect(ox,py,14,42);a.g.globalAlpha=1;
  a.g.fillStyle=C.f;a.g.globalAlpha=.3;a.g.fillRect(ox+W-14,py,14,42);a.g.globalAlpha=1;
  for(let i=1;i<=n;i++){const x=ox+14+ (W-28)*i/(n+1);
    a.g.fillStyle=C.b;a.g.globalAlpha=.5;a.g.fillRect(x-3,py+4,6,34);a.g.globalAlpha=1;}
  a.txt('1',ox+7,py+56,C.a,11,'center');
  a.txt('2',ox+W-7,py+56,C.f,11,'center');
  if(n>0)a.txt(n+(n===1?' pantalla':' pantallas'),ox+W/2,py+56,C.b,11,'center');
  // panel
  const bx=392,by=48;
  a.txt('σ(T₁⁴ − T₂⁴) = '+NE(SIG*(Math.pow(T1,4)-Math.pow(T2,4)))+' W/m²',bx,by,C.muted,11.5);
  a.txt('Resistencia sin pantallas: '+N2(Rbase),bx,by+26,C.muted,12);
  a.txt('Resistencia actual: '+N2(Rtot),bx,by+48,C.b,12);
  a.txt('q sin pantallas = '+N0(q0)+' W/m²',bx,by+78,C.muted,13);
  a.txt('q = '+N0(q)+' W/m²',bx,by+104,C.a,16);
  if(n>0)a.txt('reducción del '+N1(100*(1-q/q0))+' %',bx,by+128,C.c,13);
  a.txt('λmax (Wien) = '+N2(lmax)+' µm',bx,by+158,C.b,12);
  a.txt(lmax<0.78?'(visible)':(lmax<3?'(infrarrojo cercano)':'(infrarrojo medio-lejano)'),bx,by+178,C.muted,11);
  a.html(`Dos placas paralelas grandes a ${NQ(s.T1)} °C (ε = ${NQ(s.e1)}) y ${NQ(s.T2)} °C (ε = ${NQ(s.e2)}): el flujo neto es <b>${N0(q)} W/m²</b>${n>0?', frente a los '+N0(q0)+' W/m² sin pantallas: una <b>reducción del '+N1(100*(1-q/q0))+' %</b>':''}.<br>
  La resistencia total de radiación vale <b>${N2(Rtot)}</b> y el máximo de emisión de la placa caliente está en <b>λ = ${N2(lmax)} µm</b> (ley de Wien).<br>
  ${n>0?'Cada pantalla añade dos resistencias de 1/0,05 = 20, que es de donde sale la enorme reducción: no es por «reflejar», es por añadir resistencias en serie.':'Añade una pantalla y observa el salto: basta una lámina delgada de baja emisividad para reducir el intercambio en más del 90 %.'}
  <span class="hint">Las temperaturas van siempre en kelvin. Fíjate en que la curva de Planck se desplaza hacia la izquierda al calentar: ésa es la ley de Wien, y por eso un hierro al rojo acaba emitiendo en el visible.</span>`);}});

/* T11 · Intercambiador: LMTD y NTU */
SIMS.intercambiador=el=>build(el,{w:680,h:300,
 sliders:[{k:'mh',v:0.8,min:0.1,max:5,step:0.1,l:'Caudal caliente',u:'kg/s'},
  {k:'mc',v:1.2,min:0.1,max:5,step:0.1,l:'Caudal frío',u:'kg/s'},
  {k:'The',v:90,min:40,max:300,step:5,l:'Entrada del caliente',u:'°C'},
  {k:'Tce',v:20,min:0,max:80,step:1,l:'Entrada del frío',u:'°C'},
  {k:'UA',v:3600,min:200,max:30000,step:100,l:'UA del equipo',u:'W/K'}],
 selects:[{k:'tipo',v:'cc',l:'Disposición',opts:[['cc','Contracorriente'],['par','Flujo paralelo'],['cond','Condensador (c = 0)']]}],
 draw(a){a.clear();const s=a.st;
  const cp=4180;
  const Ch=s.tipo==='cond'?1e12:s.mh*cp, Cc=s.mc*cp;
  const Cmin=Math.min(Ch,Cc),Cmax=Math.max(Ch,Cc),c=Cmin/Cmax;
  const NTU=s.UA/Cmin;
  let eps;
  if(s.tipo==='par')eps=(1-Math.exp(-NTU*(1+c)))/(1+c);
  else if(Math.abs(1-c)<1e-6)eps=NTU/(1+NTU);
  else eps=(1-Math.exp(-NTU*(1-c)))/(1-c*Math.exp(-NTU*(1-c)));
  const Qmax=Cmin*(s.The-s.Tce), Q=eps*Qmax;
  const Ths=s.The-Q/Ch, Tcs=s.Tce+Q/Cc;
  // perfiles a lo largo del equipo
  const ox=48,oy=172,W=300,H=116;
  const Tmin=Math.min(s.Tce,Tcs,Ths)-2,Tmax=Math.max(s.The,Ths,Tcs)+2;
  const Y=T=>oy-(T-Tmin)/(Tmax-Tmin)*H;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  const ph=[],pc=[];
  for(let i=0;i<=100;i++){const f=i/100;
    const Th=s.The-(s.The-Ths)*f;
    const Tc=s.tipo==='par'? s.Tce+(Tcs-s.Tce)*f : Tcs-(Tcs-s.Tce)*f;
    ph.push([ox+f*W,Y(Th)]);pc.push([ox+f*W,Y(Tc)]);}
  curve(a,ph,C.b,2.5);curve(a,pc,C.f,2.5);
  a.txt('caliente',ox+W,Y(Ths)-10,C.b,11,'right');
  a.txt('frío',ox+W,Y(s.tipo==='par'?Tcs:s.Tce)+16,C.f,11,'right');
  a.txt(NQ(s.The)+' °C',ox+4,Y(s.The)-8,C.b,11);
  a.txt(N1(Ths)+' °C',ox+W,Y(Ths)+16,C.b,11,'right');
  a.txt(N1(Tcs)+' °C',ox+4,Y(Tcs)-8,C.f,11);
  a.txt('Perfiles de temperatura a lo largo del equipo',ox,24,C.text,12);
  // LMTD
  const dT1=s.tipo==='par'?(s.The-s.Tce):(s.The-Tcs);
  const dT2=s.tipo==='par'?(Ths-Tcs):(Ths-s.Tce);
  const lm=Math.abs(dT1-dT2)<1e-6?dT1:(dT1-dT2)/Math.log(dT1/dT2);
  // panel
  const bx=382,by=46;
  a.txt('C caliente = '+N1(Ch/1000)+' kW/K'+(s.tipo==='cond'?' (∞)':''),bx,by,C.b,12);
  a.txt('C frío = '+N1(Cc/1000)+' kW/K',bx,by+22,C.f,12);
  a.txt('c = Cmin/Cmax = '+N3(c),bx,by+46,C.muted,12);
  a.txt('NTU = UA/Cmin = '+N2(NTU),bx,by+70,C.a,14);
  a.txt('ε = '+N3(eps)+'  ('+N0(eps*100)+' %)',bx,by+96,C.c,15);
  a.txt('Q = ε·Cmin·ΔTmax = '+N1(Q/1000)+' kW',bx,by+124,C.a,14);
  a.txt('T salida caliente = '+N1(Ths)+' °C',bx,by+150,C.b,12.5);
  a.txt('T salida frío = '+N1(Tcs)+' °C',bx,by+172,C.f,12.5);
  a.txt('ΔT_lm = '+N2(lm)+' °C  →  Q = UA·ΔT_lm = '+N1(s.UA*lm/1000)+' kW',bx,by+202,C.muted,11.5);
  a.html(`${{cc:'Contracorriente',par:'Flujo paralelo',cond:'Condensador'}[s.tipo]} con UA = ${NQ(s.UA)} W/K: <b>NTU = ${N2(NTU)}</b>, <b>c = ${N3(c)}</b> ⇒ <b>ε = ${N3(eps)}</b>.<br>
  Se transfieren <b>${N1(Q/1000)} kW</b> de los ${N1(Qmax/1000)} kW máximos; el caliente sale a <b>${N1(Ths)} °C</b> y el frío a <b>${N1(Tcs)} °C</b>.<br>
  Comprobación por el otro método: ΔT_lm = ${N2(lm)} °C y UA·ΔT_lm = <b>${N1(s.UA*lm/1000)} kW</b>, que coincide con el resultado de NTU.
  <span class="hint">Cambia a flujo paralelo con el mismo UA y verás que la eficiencia baja: en paralelo los dos fluidos tienden a la misma temperatura y el salto se agota. Sube el UA y observa que a partir de NTU ≈ 3 la mejora es cada vez menor: duplicar el área deja de compensar.</span>`);}});

/* Extra · Radio crítico de aislamiento */
SIMS.radiocritico=el=>build(el,{w:680,h:258,
 sliders:[{k:'ri',v:5,min:1,max:40,step:0.5,l:'Radio del conductor',u:'mm'},
  {k:'k',v:0.15,min:0.02,max:1,step:0.01,l:'Conductividad del aislante',u:'W/mK'},
  {k:'h',v:12,min:2,max:100,step:1,l:'Coeficiente exterior',u:'W/m²K'},
  {k:'e',v:10,min:0,max:60,step:0.5,l:'Espesor de aislante',u:'mm'}],
 draw(a){a.clear();const s=a.st;
  const ri=s.ri/1000, rcr=s.k/s.h, dT=60;
  const Q=r=>r<=ri?0:dT/(Math.log(r/ri)/(2*Math.PI*s.k)+1/(2*Math.PI*r*s.h));
  const rmax=Math.max(rcr*3,ri+0.08);
  const ox=52,oy=190,W=330,H=146;
  let qmax=0;for(let i=1;i<=240;i++)qmax=Math.max(qmax,Q(ri+(rmax-ri)*i/240));
  const X=r=>ox+(r-ri)/(rmax-ri)*W, Y=q=>oy-q/(qmax*1.08)*H;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  ticks(qmax*1.08,4).forEach(v=>{a.line(ox,Y(v),ox+W,Y(v),C.grid,1);a.txt(N0(v),ox-6,Y(v)+4,C.muted,10,'right');});
  const pts=[];for(let i=1;i<=240;i++){const r=ri+(rmax-ri)*i/240;pts.push([X(r),Y(Q(r))]);}
  curve(a,pts,C.a,2.5);
  a.txt('Calor perdido (W/m)',ox+2,oy-H-12,C.muted,11);
  a.txt('radio exterior (mm)',ox+W/2,oy+36,C.muted,10,'center');
  for(let i=0;i<=4;i++)a.txt(N0((ri+(rmax-ri)*i/4)*1000),ox+W*i/4,oy+18,C.muted,10,'center');
  if(rcr>ri&&rcr<rmax){a.line(X(rcr),oy-H,X(rcr),oy,C.b,1.5,[4,3]);
    a.circ(X(rcr),Y(Q(rcr)),5,C.b,true);
    a.txt('r crítico = '+N1(rcr*1000)+' mm',X(rcr)+8,Y(Q(rcr))+18,C.b,11);}
  const r=ri+s.e/1000;
  a.circ(X(r),Y(Q(r)),6,C.c,true);
  a.txt('actual',X(r)+8,Y(Q(r))+18,C.c,11);
  // panel
  const bx=426,by=36;
  a.txt('r crítico = k/h = '+N1(rcr*1000)+' mm',bx,by,C.b,14);
  a.txt('r conductor = '+NQ(s.ri)+' mm',bx,by+26,C.muted,12);
  a.txt('r exterior actual = '+N1(r*1000)+' mm',bx,by+48,C.c,12);
  a.txt('Q sin aislante = '+N1(2*Math.PI*ri*s.h*dT)+' W/m',bx,by+78,C.muted,12);
  a.txt('Q actual = '+N1(Q(r))+' W/m',bx,by+100,C.a,14);
  const peor=Q(r)>2*Math.PI*ri*s.h*dT;
  a.txt(peor?'✗ el aislante AUMENTA la pérdida':'✓ el aislante reduce la pérdida',bx,by+126,peor?C.b:C.c,12);
  a.txt(ri<rcr?'r conductor < r crítico: zona peligrosa':'r conductor > r crítico: siempre aísla',bx,by+152,ri<rcr?C.b:C.c,11.5);
  a.html(`Con k = ${NQ(s.k)} W/mK y h = ${NQ(s.h)} W/m²K, el <b>radio crítico vale ${N1(rcr*1000)} mm</b>. El conductor mide ${NQ(s.ri)} mm de radio y con ${NQ(s.e)} mm de aislante el radio exterior es de ${N1(r*1000)} mm.<br>
  Pérdida actual: <b>${N1(Q(r))} W/m</b>, frente a ${N1(2*Math.PI*ri*s.h*dT)} W/m del conductor desnudo. ${peor?'<b>El aislante está empeorando las cosas.</b>':'El aislante ya reduce la pérdida.'}<br>
  ${ri<rcr?'Como el radio del conductor es <b>menor</b> que el crítico, las primeras capas de aislante aumentan la pérdida: el área exterior crece más deprisa de lo que crece la resistencia.':'Como el radio del conductor <b>supera</b> el crítico, cualquier espesor de aislante reduce la pérdida desde el primer milímetro.'}
  <span class="hint">Esto no es una curiosidad académica: es la razón por la que el aislante de un cable eléctrico fino ayuda a disiparlo mejor, y por la que en tuberías pequeñas hay que comprobar el radio crítico antes de decidir el espesor.</span>`);}});

/* ---- Pared plana compuesta en serie, paso a paso: R = L/(kA), q = ΔT/ΣR ---- */
SIMS.paredPaso=el=>build(el,{w:660,h:380,
 sliders:[{k:'paso',v:0,min:0,max:6,step:1,l:'paso de la resolución (0 = problema)',u:''}],
 draw(a){a.clear();const p=a.st.paso;const g=a.g;
  const xA=60,xB=240,xC=330,yT=90,yB=250;      // 900 px por metro: 0,20 m → 180 px; 0,10 m → 90 px
  g.save();g.globalAlpha=0.22;
  g.fillStyle=C.f;g.fillRect(xA,yT,xB-xA,yB-yT);
  g.fillStyle=C.c;g.fillRect(xB,yT,xC-xB,yB-yT);
  g.restore();
  g.lineWidth=2;g.strokeStyle=C.f;g.strokeRect(xA,yT,xB-xA,yB-yT);
  g.strokeStyle=C.c;g.strokeRect(xB,yT,xC-xB,yB-yT);
  a.txt('ladrillo',(xA+xB)/2,(yT+yB)/2-6,C.f,12,'center');
  a.txt('k = 0,8',(xA+xB)/2,(yT+yB)/2+10,C.f,12,'center');
  a.txt('aislante',(xB+xC)/2,(yT+yB)/2-6,C.c,11,'center');
  a.txt('k = 0,05',(xB+xC)/2,(yT+yB)/2+10,C.c,11,'center');
  // temperaturas de las superficies
  a.txt('T₁ = 20 °C',xA,yT-14,C.text,12,'left');
  a.txt('T₂ = −7 °C',xC,yT-14,C.text,12,'right');
  if(p>=5){a.txt('T_int = 17 °C',xB,yB+18,C.a,12,'center');}
  // flujo de calor
  if(p>=4){
    a.arrow(xA+10,yB+44,xC-10,yB+44,C.d,2.6);
    a.txt('q = 12 W',(xA+xC)/2,yB+62,C.d,13,'center');
  }
  // desarrollo a la derecha
  a.txt('Datos: A = 1 m², T₁ = 20 °C, T₂ = −7 °C',360,50,C.muted,12,'left');
  if(p>=1)a.txt('R = L/(k·A), y en serie las resistencias se suman',360,90,C.text,12,'left');
  if(p>=2)a.txt('R₁ = 0,20/(0,8·1) = 0,25 K/W',360,120,C.text,13,'left');
  if(p>=3){
    a.txt('R₂ = 0,10/(0,05·1) = 2,00 K/W',360,146,C.text,13,'left');
    a.txt('R_tot = 2,25 K/W',360,168,C.text,13,'left');
  }
  if(p>=4)a.txt('q = ΔT/R_tot = 27/2,25 = 12 W',360,200,C.d,14,'left');
  if(p>=5)a.txt('ΔT₁ = q·R₁ = 3 K  →  T_int = 17 °C',360,236,C.c,13,'left');
  if(p>=6){
    a.txt('ΔT₂ = q·R₂ = 24 K  →  17 − 24 = −7 °C ✓',360,270,C.c,12,'left');
    a.txt('El aislante absorbe casi toda la caída',360,300,C.muted,12,'left');
  }
  const T=[
   'Pared plana compuesta de dos capas en serie, con área A = 1 m². Capa 1: ladrillo de 0,20 m con k = 0,8 W/m·K. Capa 2: aislante de 0,10 m con k = 0,05 W/m·K. Superficies a T₁ = 20 °C y T₂ = −7 °C. Se pide el flujo de calor y la temperatura de la interfaz.',
   'La conducción permanente en una pared plana se modela como un circuito eléctrico: cada capa es una resistencia térmica R = L/(kA). Como el calor pasa por una capa y después por la otra, las resistencias están en serie y se suman.',
   'R₁ = L₁/(k₁A) = 0,20/(0,8 · 1) = 0,25 K/W. La capa de ladrillo opone poca resistencia porque conduce bien.',
   'R₂ = L₂/(k₂A) = 0,10/(0,05 · 1) = 2,00 K/W. El aislante es una capa más delgada, pero conduce tan mal que su resistencia es 8 veces mayor. Con R_tot = 0,25 + 2,00 = 2,25 K/W, ya se tiene el circuito completo.',
   'Flujo de calor: q = ΔT/R_tot = (20 − (−7))/2,25 = 27/2,25 = 12 W. Es el mismo en las dos capas, porque en régimen permanente no se acumula energía en la pared.',
   'Temperatura de la interfaz: en la capa 1 la caída es ΔT₁ = q·R₁ = 12 · 0,25 = 3 K. Entonces T_int = 20 − 3 = 17 °C.',
   'Comprobación: en la capa 2 la caída es ΔT₂ = 12 · 2 = 24 K, y 17 − 24 = −7 °C, que coincide con T₂. Casi toda la diferencia de temperatura cae en el aislante.'
  ];
  a.html(`<div>${T[p]}</div>`);
 }});






/* ---- paso a paso declarativo ---- */
SIMS.__paso=(el,D)=>build(el,{w:D.w||660,h:D.h||340,
 sliders:[{k:'paso',v:0,min:0,max:D.steps.length,step:1,l:'paso de la resolución (0 = enunciado)',u:''}],
 draw(a){a.clear();const g=a.g,p=a.st.paso;
  const it=(x,col)=>{const k=x[0];
   if(k==='t')a.txt(x[1],x[2],x[3],col,x[4]||13,x[5]||'left');
   else if(k==='l')a.line(x[1],x[2],x[3],x[4],col,x[5]||1.5,x[6]);
   else if(k==='a')a.arrow(x[1],x[2],x[3],x[4],col,x[5]);
   else if(k==='c')a.circ(x[1],x[2],x[3],col,!!x[4]);
   else if(k==='r'){g.strokeStyle=col;g.lineWidth=1.8;if(x[5]){g.fillStyle=col;g.globalAlpha=.18;g.fillRect(x[1],x[2],x[3],x[4]);g.globalAlpha=1;}g.strokeRect(x[1],x[2],x[3],x[4]);}
   else if(k==='p'){g.strokeStyle=col;g.lineWidth=x[2]||2;g.beginPath();x[1].forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();}};
  (D.base||[]).forEach(x=>it(x,C.muted));
  D.steps.forEach((s,i)=>{if(i+1>p)return;const cur=(i+1===p);(s.add||[]).forEach(x=>it(x,cur?C.d:C.text));if(cur)(s.now||[]).forEach(x=>it(x,C.d));});
  a.html('<div>'+(p===0?D.q:D.steps[p-1].text)+'</div>');}});
/* ---- fin paso a paso declarativo ---- */

/* ---- paso2 lmtdPaso ---- */
SIMS.lmtdPaso=el=>SIMS.__paso(el,{"w":660,"h":275,"q":"Calcula el área de un intercambiador a contracorriente que transfiere 20 kW con los extremos a 100/60 °C (caliente) y 20/50 °C (frío). Sube el paso.","base":[["l",380,240,610,240,1.5],["l",380,240,380,90,1.5],["t","longitud →",610,256,11,"right"],["t","100",374,107.63636363636363,11,"right"],["t","20",374,216.72727272727272,11,"right"]],"steps":[{"text":"Intercambiador en <b>contracorriente</b>: el fluido caliente entra a <b>100 °C</b> y sale a <b>60 °C</b>; el frío entra a <b>20 °C</b> y sale a <b>50 °C</b>. Se transfieren <b>20 kW</b> con U = 500 W/m²K. ¿Qué área hace falta?","add":[]},{"text":"En contracorriente se comparan los extremos que están frente a frente: en un extremo ΔT₁ = T<sub>h,ent</sub> − T<sub>c,sal</sub> = 100 − 50 = <b>50 K</b>.","add":[["t","ΔT₁ = 100 − 50 = 50 K",40,70,15,"left"],["l",380,103.63636363636363,610,158.1818181818182,2.5]]},{"text":"En el otro extremo ΔT₂ = T<sub>h,sal</sub> − T<sub>c,ent</sub> = 60 − 20 = <b>40 K</b>.","add":[["t","ΔT₂ = 60 − 20 = 40 K",40,104,15,"left"],["l",380,171.8181818181818,610,212.72727272727272,2.5]]},{"text":"La diferencia de temperatura no es constante: se usa la <b>media logarítmica</b> <b>ΔT<sub>ml</sub> = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂)</b>.","add":[["t","ΔT_ml = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂)",40,140,14,"left"]]},{"text":"<b>ΔT<sub>ml</sub> = (50 − 40)/ln(50/40) = 10/0,2231 = 44,81 K</b>. Queda entre ΔT₂ y ΔT₁ y muy cerca de su media aritmética (45 K) porque son parecidas.","add":[["t","ΔT_ml = 10/ln(1,25) = 44,81 K",40,174,15,"left"]]},{"text":"Ecuación de diseño: <b>Q = U·A·ΔT<sub>ml</sub></b> ⇒ <b>A = Q/(U·ΔT<sub>ml</sub>) = 20000/(500·44,81) = 0,89 m²</b>.","add":[["t","A = Q/(U ΔT_ml) = 0,89 m²",40,208,16,"left"]]},{"text":"En <b>paralelo</b> sería ΔT₁ = 80 y ΔT₂ = 10 (60 − 50): ΔT<sub>ml</sub> = 70/ln 8 = 33,7 K y haría falta un área de 1,19 m²: casi el doble. Por eso la contracorriente es más eficaz.","add":[["t","paralelo: A = 1,19 m²",40,242,14,"left"]]}]});
/* ---- fin paso2 lmtdPaso ---- */
document.querySelectorAll("[data-sim]").forEach(function(el){var k=el.getAttribute("data-sim");if(SIMS[k]){try{SIMS[k](el);}catch(e){console.error("sim "+k,e);}}else console.warn("sim no encontrada: "+k);});
})();
