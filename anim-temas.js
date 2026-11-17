/* Transmisión del Calor: una animación por tema */
(function(){var M=window.MANIM;if(!M)return;var U=M.util,C=M.C,nf=U.nf,lerp=U.lerp,ease=U.ease,seg=U.seg,clamp=U.clamp,RG=U.RG,W=640;
var SIG=5.67e-8;

/* T1 los tres mecanismos */
function q1(i,Ts){var Ta=300;return i===0?1.2*(Ts-Ta)/0.05/1000:i===1?25*(Ts-Ta)/1000:0.8*SIG*(Math.pow(Ts,4)-Math.pow(Ta,4))/1000;}
M.reg('tc-t1',M.barras({title:'Conducción, convección y radiación',H:560,dur:18,p:[320,900],n:3,xs:function(i){return i+0.5;},ax:{xr:[0,3],yr:[0,30],xt:[],yt:[10,20,30],yd:0,xl:'',yl:'q″ (kW/m²)'},h:300,
 val:function(i,Ts){return Math.min(q1(i,Ts),30);},col:function(i){return ['f','g','hl'][i];},lab:function(i){return ['conducción','convección','radiación'][i];},
 read:function(Ts){return ['T_{s} = '+nf(Ts-273,0)+' °C   (entorno a 27 °C)','q″: cond '+nf(q1(0,Ts),1)+'   conv '+nf(q1(1,Ts),1)+'   rad '+nf(q1(2,Ts),1)+' kW/m²'];},
 caps:[[6,'Conducción (<i>k·ΔT/L</i>) y convección (<i>h·ΔT</i>) crecen linealmente con la diferencia de temperaturas.'],[12,'La radiación va con la cuarta potencia de la temperatura absoluta: <i>ε·σ·(T<sub>s</sub>⁴ − T<sub>alr</sub>⁴)</i>.'],[99,'A temperatura ambiente la radiación suele ser pequeña frente a la convección forzada, pero a varios cientos de grados acaba dominando.']]}));

/* T2 pared plana con generación interna */
M.reg('tc-t2',M.curva({title:'Ecuación de la conducción: pared con generación',H:560,dur:18,p:[0,8],ax:{xr:[-1.15,1.15],yr:[0,10],xt:[-1,0,1],yt:[2,4,6,8],xf:function(v){return ['−L','0','L'][v+1];},yd:0,xl:'x',yl:'T − T_{s}'},h:300,ghost:false,
 curvas:[{f:function(x,g){return Math.abs(x)>1?NaN:g*(1-x*x);},c:'m'}],
 extra:function(D,A,g){D.rect(A.X(-1),A.Y(10),A.X(1)-A.X(-1),A.Y(0)-A.Y(10),null,RG(C.hl,.08+0.05*g/8));var s=0.6*g/8+0.15;D.arrow(A.X(1),A.Y(1),A.X(1)+40*s+10,A.Y(1),C.f,2.4);D.arrow(A.X(-1),A.Y(1),A.X(-1)-40*s-10,A.Y(1),C.f,2.4);},
 read:function(g){return ['q̇·L²/(2k) = '+nf(g,1)+'     T_{máx} − T_{s} = '+nf(g,1),'perfil parabólico:  T(x) = T_{s} + q̇L²/(2k)·(1 − x²/L²)'];},
 caps:[[6,'Con generación interna uniforme q̇ (efecto Joule, reacción química) la ecuación es <i>k·d²T/dx² + q̇ = 0</i>.'],[12,'La solución es una parábola: el máximo está en el centro y la pendiente es nula allí por simetría (adiabático).'],[99,'Todo el calor generado sale por las caras: el flujo en la superficie es <i>q̇·L</i>, cada vez mayor al aumentar la generación.']]}));

/* T3 aleta */
function ch(x){return (Math.exp(x)+Math.exp(-x))/2;}
M.reg('tc-t3',M.curva({title:'Aletas: perfil de temperatura y eficiencia',H:560,dur:18,p:[0.3,4],ax:{xr:[0,1.05],yr:[0,1.1],xt:[0.5,1],yt:[0.5,1],xf:function(v){return v===1?'L':'L/2';},yd:1,xl:'x',yl:'θ/θ_{b}'},h:300,
 curvas:[{f:function(x,mL){return x>1?NaN:ch(mL*(1-x))/ch(mL);},c:'m'}],
 extra:function(D,A,mL){for(var i=0;i<40;i++){var x=i/40,v=ch(mL*(1-x))/ch(mL);D.rect(A.X(x),A.Y(1.08),A.X(1/40)-A.X(0)+0.5,14,null,RG(C.bad,.15+0.75*v));}},
 read:function(mL){var tn=(Math.exp(2*mL)-1)/(Math.exp(2*mL)+1);return ['m·L = '+nf(mL,2)+'    m = √(hP/(kA_{c}))','eficiencia η = tanh(mL)/(mL) = '+nf(tn/mL*100,0)+' %'];},
 caps:[[6,'Una aleta aumenta el área de intercambio. Su temperatura baja desde la base hacia la punta porque va cediendo calor al fluido.'],[12,'El parámetro m·L lo resume todo: con mL pequeño (aleta corta y muy conductora) casi toda la aleta está a la temperatura de la base.'],[99,'Con mL grande la punta queda casi a la temperatura del fluido y no aporta nada: la eficiencia cae. Por encima de mL ≈ 2 alargar la aleta apenas sirve.']]}));

/* T4 diferencias finitas: iteración de Gauss-Seidel */
var N4=11,G4=0.012;function gs(it){var T=[];for(var i=0;i<N4;i++)T.push(i===0?1:(i===N4-1?0.2:0.2));for(var k=0;k<it;k++)for(var j=1;j<N4-1;j++)T[j]=(T[j-1]+T[j+1]+G4)/2;return T;}
M.reg('tc-t4',M.base({title:'Métodos numéricos: diferencias finitas',H:560,dur:18,caps:[[6,'La barra se divide en nodos. En cada nodo interior la ecuación del calor se convierte en <i>T<sub>i</sub> = (T<sub>i−1</sub> + T<sub>i+1</sub> + q̇Δx²/k)/2</i>.'],[12,'Gauss-Seidel recorre los nodos y actualiza cada uno con los valores más recientes de sus vecinos. Los puntos se acercan poco a poco a la solución.'],[99,'Cuando un barrido ya no cambia los valores (por debajo de una tolerancia) se ha llegado a la solución estacionaria discreta.']]},
 function(D,t){var it=Math.floor(Math.pow(seg(t,1,16),2)*140),T=gs(it),A=U.axes(D,{xr:[0,1.05],yr:[0,1.5],xt:[0.5,1],yt:[0.5,1],xd:1,yd:1,xl:'x/L',yl:'T*'},{x:80,y:96,w:480,h:300,grid:true});
  U.plotf(D,A,function(x){return 1-0.8*x+G4/2*(N4-1)*(N4-1)*x*(1-x);},C.f,1.6,0.6);
  var p=T.map(function(v,i){return [A.X(i/(N4-1)),A.Y(v)];});D.path(p,C.m,1.4,null,0.6);p.forEach(function(q,i){D.dot(q[0],q[1],i===0||i===N4-1?7:5.5,i===0||i===N4-1?C.hl:C.m);});
  var e=0,ex=function(x){return 1-0.8*x+G4/2*(N4-1)*(N4-1)*x*(1-x);};T.forEach(function(v,i){e=Math.max(e,Math.abs(v-ex(i/(N4-1))));});
  U.readout(D,['iteración '+it+'     error máximo = '+nf(e,3),'línea azul: solución exacta'],468);}));

/* T5 transitorio en pared plana, Bi = 1 */
var z5=0.8603,C5=1.1191;
M.reg('tc-t5',M.curva({title:'Régimen transitorio: pared que se enfría',H:560,dur:18,p:[0.2,2.5],u:function(t,d){return ease(seg(t,1,d-1));},ax:{xr:[-1.1,1.1],yr:[0,1.1],xt:[-1,0,1],yt:[0.5,1],xf:function(v){return ['−L','0','L'][v+1];},yd:1,xl:'x',yl:'θ/θ_{i}'},h:300,
 curvas:[{f:function(x,Fo){return Math.abs(x)>1?NaN:C5*Math.exp(-z5*z5*Fo)*Math.cos(z5*x);},c:'m'}],
 extra:function(D,A){D.line(A.X(-1.1),A.Y(1),A.X(1.1),A.Y(1),C.mut,1,[4,4]);D.text('estado inicial',A.X(1.08),A.Y(1)-8,{s:14,c:C.mut,a:'right'});},
 read:function(Fo){var c=C5*Math.exp(-z5*z5*Fo);return ['Fo = αt/L² = '+nf(Fo,2)+'    Bi = hL/k = 1','centro: θ/θ_{i} = '+nf(c,3)+'    superficie: '+nf(c*Math.cos(z5),3)];},
 caps:[[6,'Una pared a temperatura inicial uniforme se pone en contacto con un fluido frío. El tiempo adimensional es el número de Fourier <i>Fo = αt/L²</i>.'],[12,'Para Fo > 0,2 basta el primer término de la serie: <i>θ/θ<sub>i</sub> = C₁·e<sup>−ζ₁²Fo</sup>·cos(ζ₁x/L)</i>, con ζ₁ y C₁ que dependen de Bi.'],[99,'Con Bi = 1 hay un salto apreciable entre centro y superficie. Si Bi < 0,1 el perfil es casi plano y vale el modelo de capacidad concentrada.']]}));

/* T6 capas límite de velocidad y térmica */
M.reg('tc-t6',M.base({title:'Capa límite de velocidad y capa límite térmica',H:560,dur:18,caps:[[6,'Sobre una placa, el fluido se frena en una capa fina de espesor δ que crece con la distancia: <i>δ ≈ 5x/√Re<sub>x</sub></i>.'],[12,'La capa límite térmica δ<sub>t</sub>, donde cambia la temperatura, se relaciona con la de velocidad mediante el número de Prandtl: <i>δ/δ<sub>t</sub> ≈ Pr<sup>1/3</sup></i>.'],[99,'Gases (Pr ≈ 0,7): espesores parecidos. Aceites (Pr grande): capa térmica mucho más fina. Metales líquidos (Pr ≪ 1): mucho más gruesa.']]},
 function(D,t){var Pr=Math.pow(10,lerp(-0.7,1.3,U.pp(t,18))),x0=80,y0=380,Lx=500,S=150,r=Math.pow(Pr,-1/3);D.rect(x0,y0,Lx,10,null,RG(C.hl,.7));
  var dl=function(x){return S*0.45*Math.sqrt(x/Lx);};var pv=[],pt=[];for(var x=0;x<=Lx;x+=5){pv.push([x0+x,y0-dl(x)]);pt.push([x0+x,y0-Math.min(dl(x)*r,S*1.3)]);}
  D.path(pv,C.f,2.4);D.path(pt,C.bad,2.4,null,0.9);D.text('δ',x0+Lx+6,y0-dl(Lx),{it:true,s:20,c:C.f});D.text('δ_{t}',x0+Lx+6,y0-Math.min(dl(Lx)*r,S*1.3)+16,{it:true,s:20,c:C.bad});
  [150,300,450].forEach(function(x){var d=dl(x),p=[];for(var j=0;j<=20;j++){var y=d*1.5*j/20,u=y>=d?1:(1.5*y/d-0.5*Math.pow(y/d,3));p.push([x0+x+u*55,y0-y]);}D.line(x0+x,y0,x0+x,y0-d*1.5,C.ax,1);D.path(p,C.f,2);for(var k=1;k<5;k++){var yy=d*1.5*k/5,uu=yy>=d?1:(1.5*yy/d-0.5*Math.pow(yy/d,3));D.arrow(x0+x,y0-yy,x0+x+uu*55,y0-yy,C.f,1.2);}});
  for(var k2=0;k2<4;k2++)D.arrow(20,y0-40-k2*40,70,y0-40-k2*40,C.mut,1.6);D.text('u_{∞}, T_{∞}',20,y0-200,{it:true,s:16,c:C.mut});
  U.readout(D,['Pr = '+nf(Pr,Pr<1?2:1)+'     δ/δ_{t} ≈ Pr^{1/3} = '+nf(1/r,2)],460);}));

/* T7 coeficiente local sobre placa plana */
function h7(x){var Re=6.25e5*x,P=0.892;return (Re<5e5?0.332*Math.sqrt(Re):0.0296*Math.pow(Re,0.8))*P*0.026/x;}
M.reg('tc-t7',M.traza({title:'Flujo externo: coeficiente de convección local',H:560,dur:16,x0:0.03,x1:2,ax:{xr:[0,2.1],yr:[0,50],xt:[0.5,1,1.5,2],yt:[10,20,30,40],xd:1,yd:0,xl:'x (m)',yl:'h_{x} (W/m²K)'},h:300,f:h7,
 extra:function(D,A){D.line(A.X(0.8),A.Y(0),A.X(0.8),A.Y(50),C.mut,1,[4,4]);D.text('Re_{x} = 5·10⁵',A.X(0.8)+6,A.Y(46),{s:14,c:C.mut});},
 read:function(x){var Re=6.25e5*x;return ['x = '+nf(x,2)+' m    Re_{x} = '+nf(Re/1e5,1)+'·10⁵   '+(Re<5e5?'laminar':'turbulento'),'h_{x} = '+nf(h7(x),1)+' W/m²K    (aire a 10 m/s)'];},
 caps:[[5,'En régimen laminar <i>Nu<sub>x</sub> = 0,332·Re<sub>x</sub><sup>1/2</sup>·Pr<sup>1/3</sup></i>: h baja como 1/√x porque la capa límite engorda.'],[10,'Al llegar a Re<sub>x</sub> ≈ 5·10⁵ la capa se vuelve turbulenta: la mezcla transversal dispara el coeficiente.'],[99,'En turbulento <i>Nu<sub>x</sub> = 0,0296·Re<sub>x</sub><sup>0,8</sup>·Pr<sup>1/3</sup></i>: h vuelve a bajar, pero mucho más despacio.']]}));

/* T8 flujo interno con pared a temperatura constante */
M.reg('tc-t8',M.traza({title:'Flujo interno: temperatura media del fluido',H:560,dur:16,x0:0,x1:10,ax:{xr:[0,10.5],yr:[0,110],xt:[2,4,6,8,10],yt:[20,50,80,100],xd:0,yd:0,xl:'x (m)',yl:'T (°C)'},h:280,f:function(x){return 100-80*Math.exp(-0.25*x);},
 extra:function(D,A,x){D.line(A.X(0),A.Y(100),A.X(10.5),A.Y(100),C.bad,2,[6,4]);D.text('T_{s} = 100 °C',A.X(10.3),A.Y(100)-8,{s:15,c:C.bad,a:'right'});
  var y=A.Y(0)+27;for(var i=0;i<50;i++){var xx=i/5,T=100-80*Math.exp(-0.25*xx);if(xx>x)break;D.rect(A.X(xx),y,A.X(0.2)-A.X(0)+0.5,12,null,RG(C.bad,.1+0.8*(T-20)/80));}D.rect(A.X(0),y,A.X(10)-A.X(0),12,C.mut,null,1);},
 read:function(x){var T=100-80*Math.exp(-0.25*x);return ['x = '+nf(x,1)+' m     T_{m} = '+nf(T,1)+' °C','T_{s} − T_{m} = 80·exp(−P·h·x/(ṁc_{p}))'];},
 caps:[[5,'En una tubería con la pared a temperatura constante, el fluido se calienta a lo largo del recorrido.'],[10,'La diferencia con la pared decae exponencialmente: <i>(T<sub>s</sub> − T<sub>m</sub>)/(T<sub>s</sub> − T<sub>m,e</sub>) = e<sup>−Phx/(ṁc<sub>p</sub>)</sup></i>.'],[99,'Por eso la diferencia útil es la media logarítmica ΔT<sub>ml</sub>, no la aritmética: el intercambio es mucho mayor al principio que al final.']]}));

/* T9 convección natural junto a una placa caliente */
M.reg('tc-t9',M.campo({title:'Convección natural junto a una placa caliente',H:560,dur:18,np:22,step:0.01,ax:{xr:[0,5],yr:[0,6],xt:[],yt:[],xl:'',yl:''},h:330,nx:12,ny:10,fm:1.6,
 field:function(x,y){return [-0.5*Math.exp(-x/1.5),4*x*Math.exp(-1.2*x)*(0.5+y/8)];},
 extra:function(D,A){D.rect(A.X(0)-12,A.Y(6),12,A.Y(0)-A.Y(6),null,RG(C.bad,.75));D.text('T_{s} > T_{∞}',A.X(0)+10,A.Y(5.7),{s:15,c:C.bad});},
 read:function(){return ['Ra = g·β·ΔT·L³/(ν·α)','Ra < 10⁹: laminar     Ra > 10⁹: turbulenta'];},
 caps:[[6,'El aire junto a la placa caliente se dilata, pesa menos y sube: no hace falta ventilador. Esa es la convección natural.'],[12,'Mientras sube arrastra aire frío desde el lado, que entra horizontalmente hacia la placa.'],[99,'La intensidad la mide el número de Rayleigh <i>Ra = Gr·Pr</i>. Correlaciones como la de Churchill-Chu dan Nu en función de Ra.']]}));

/* T10 radiación de cuerpo negro */
function Eb(l,T){return 3.742e8/(Math.pow(l,5)*(Math.exp(1.439e4/(l*T))-1))/1000;}
M.reg('tc-t10',M.curva({title:'Radiación de cuerpo negro: ley de Planck',H:560,dur:18,p:[800,1500],ax:{xr:[0,8],yr:[0,105],xt:[1,2,3,4,5,6,7,8],yt:[25,50,75,100],xd:0,yd:0,xl:'λ (µm)',yl:'E_{bλ} (kW/m²µm)'},h:300,
 curvas:[{f:function(l,T){return l<=0.2?NaN:Eb(l,T);},c:'bad'}],
 extra:function(D,A,T){var lm=2898/T;D.line(A.X(lm),A.Y(0),A.X(lm),A.Y(Eb(lm,T)),C.hl,1.6,[4,3]);D.dot(A.X(lm),A.Y(Eb(lm,T)),6,C.hl);D.rect(A.X(0.38),A.Y(105),A.X(0.78)-A.X(0.38),A.Y(0)-A.Y(105),null,RG(C.ok,.15));D.text('visible',A.X(0.58),A.Y(98),{s:13,a:'center',c:C.ok});},
 read:function(T){return ['T = '+nf(T,0)+' K    λ_{máx} = 2898/T = '+nf(2898/T,2)+' µm','E_{b} = σT⁴ = '+nf(SIG*Math.pow(T,4)/1000,0)+' kW/m²'];},
 caps:[[6,'Un cuerpo negro emite en todas las longitudes de onda con una distribución dada por la ley de Planck.'],[12,'Al calentarlo el pico se desplaza hacia longitudes de onda cortas (ley de Wien, <i>λ<sub>máx</sub>T = 2898 µm·K</i>) y empieza a verse rojo.'],[99,'El área bajo la curva es la emisión total, <i>σT⁴</i>: se multiplica por más de 12 al pasar de 800 a 1500 K.']]}));

/* T11 intercambiador: paralelo frente a contracorriente */
function hx(counter,Tco){var n=200,Ch=1,Cc=2,UA=2,Th=150,Tc=counter?Tco:20,out=[[Th,Tc]];for(var i=0;i<n;i++){var q=UA/n*(Th-Tc);Th-=q/Ch;Tc+=counter?-q/Cc:q/Cc;out.push([Th,Tc]);}return out;}
function hxc(){var lo=20,hi=150;for(var k=0;k<50;k++){var m=(lo+hi)/2,o=hx(true,m);if(o[o.length-1][1]>20)hi=m;else lo=m;}return hx(true,(lo+hi)/2);}
var P11=hx(false),Q11=hxc();
M.reg('tc-t11',M.base({title:'Intercambiadores: flujo paralelo y contracorriente',H:560,dur:18,caps:[[6,'En flujo paralelo los dos fluidos entran por el mismo extremo: la diferencia de temperaturas es enorme al principio y se agota enseguida.'],[12,'En contracorriente entran por extremos opuestos: la diferencia es más uniforme a lo largo del equipo.'],[99,'Con el mismo área y los mismos caudales, la contracorriente transfiere más calor y el frío puede salir más caliente de lo que sale el caliente.']]},
 function(D,t){var c=t>=9,o=c?Q11:P11,u=ease(seg(t%9,0.5,6)),A=U.axes(D,{xr:[0,1.05],yr:[0,160],xt:[0.5,1],yt:[20,50,100,150],xd:1,yd:0,xl:'x/L',yl:'T (°C)'},{x:80,y:96,w:480,h:300,grid:true});
  var n=Math.round(u*200),ph=[],pc=[];for(var i=0;i<=n;i++){ph.push([A.X(i/200),A.Y(o[i][0])]);}for(var j=0;j<=n;j++){var k=c?200-j:j;pc.push([A.X(k/200),A.Y(o[k][1])]);}
  D.path(ph,C.bad,3);D.path(pc,C.f,3);if(n>0){D.head(ph[ph.length-1][0],ph[ph.length-1][1],0,C.bad,10);D.head(pc[pc.length-1][0],pc[pc.length-1][1],c?Math.PI:0,C.f,10);}
  D.text(c?'contracorriente':'flujo paralelo',W/2,118,{s:20,a:'center',c:C.m,bold:true});
  var Q=150-o[200][0];U.readout(D,['caliente: 150 → '+nf(o[200][0],1)+' °C    frío: 20 → '+nf(c?o[0][1]:o[200][1],1)+' °C','calor transferido = '+nf(Q,1)+' (unidades de C_{h})'],468);}));
})();
