'use strict';
let ac,master,filter,fxSend,delay,muted=false;
const S={filter:0.8,tempo:0.5,volume:0.7,fx:0.2};
function audio(){if(ac)return ac;ac=new (window.AudioContext||window.webkitAudioContext)();
 master=ac.createGain();filter=ac.createBiquadFilter();filter.type='lowpass';
 delay=ac.createDelay(1);const fb=ac.createGain();fb.gain.value=.35;fxSend=ac.createGain();
 delay.connect(fb);fb.connect(delay);fxSend.connect(delay);delay.connect(filter);
 filter.connect(master);master.connect(ac.destination);apply();return ac}
function apply(){if(!ac)return;filter.frequency.value=200+S.filter**2*15000;master.gain.value=muted?0:S.volume;
 fxSend.gain.value=S.fx;delay.delayTime.value=60/bpm()*.75}
const bpm=()=>Math.round(60+S.tempo*120);
function env(g,t,a,d,v=1){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.001,t+a+d)}
function out(n){n.connect(filter);n.connect(fxSend)}
function noise(t,d,hp,v){const b=ac.createBuffer(1,ac.sampleRate*d,ac.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=Math.random()*2-1;
 const s=ac.createBufferSource();s.buffer=b;const f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=hp;const g=ac.createGain();env(g,t,.001,d,v);s.connect(f);f.connect(g);out(g);s.start(t)}
function tone(t,f,d,type='sawtooth',v=.3,f2){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);env(g,t,.005,d,v);o.connect(g);out(g);o.start(t);o.stop(t+d+.05)}
const SOUNDS=[['Kick',t=>tone(t,150,.4,'sine',1,40)],['Snare',t=>{noise(t,.2,1500,.6);tone(t,200,.1,'triangle',.4)}],['Hat',t=>noise(t,.05,7000,.4)],['Clap',t=>{for(let i=0;i<3;i++)noise(t+i*.012,.1,1000,.5)}],
 ['Bass',t=>tone(t,55,.35,'sawtooth',.5)],['Lead',t=>tone(t,440,.25,'square',.2)],['Chord',t=>[261.6,329.6,392].forEach(f=>tone(t,f,.6,'sawtooth',.12))],['Zap',t=>tone(t,1200,.2,'sine',.4,80)]];
const padEls=[];
function hit(i,t){audio();if(ac.state==='suspended')ac.resume();SOUNDS[i][1](t||ac.currentTime);const e=padEls[i];e.classList.add('hit');setTimeout(()=>e.classList.remove('hit'),110);
 if(rec&&playing)grid[i][step]=1,draw()}
const $=id=>document.getElementById(id),pads=$('pads');
SOUNDS.forEach(([n],i)=>{const b=document.createElement('button');b.className='pad';b.textContent=n;b.addEventListener('pointerdown',e=>{e.preventDefault();hit(i)});pads.appendChild(b);padEls.push(b)});
const knobUpd={};
// knobs
Object.keys(S).forEach(k=>{const w=document.createElement('div');w.innerHTML=`<div class="knob"><i></i></div><div>${k.toUpperCase()} <span></span></div>`;$('knobs').appendChild(w);
 const kn=w.querySelector('.knob'),lab=w.querySelector('span');const upd=()=>{kn.firstChild.style.transform=`rotate(${-135+S[k]*270}deg)`;lab.textContent=k==='tempo'?bpm():Math.round(S[k]*100);apply()};upd();
 let y0,v0;kn.addEventListener('pointerdown',e=>{kn.setPointerCapture(e.pointerId);y0=e.clientY;v0=S[k]});
 kn.addEventListener('pointermove',e=>{if(y0==null)return;S[k]=Math.min(1,Math.max(0,v0+(y0-e.clientY)/150));upd()});
 kn.addEventListener('pointerup',()=>y0=null);w.upd=upd;knobUpd[k]=upd});
// sequencer
const grid=SOUNDS.map(()=>Array(16).fill(0));let step=0,playing=false,rec=false,timer,next=0;
const seq=$('seq');function draw(){seq.innerHTML='';grid.forEach((r,i)=>{seq.insertAdjacentHTML('beforeend',`<span>${SOUNDS[i][0]}</span>`);r.forEach((v,j)=>{const b=document.createElement('b');if(v)b.className='on';if(playing&&j===step)b.classList.add('cur');b.onclick=()=>{r[j]^=1;draw()};seq.appendChild(b)})})}
grid[0][0]=grid[0][8]=grid[1][4]=grid[1][12]=1;for(let j=0;j<16;j+=2)grid[2][j]=1;draw();
function tick(){while(next<ac.currentTime+.1){grid.forEach((r,i)=>r[step]&&SOUNDS[i][1](next));next+=60/bpm()/4;step=(step+1)%16}draw()}
const status=m=>{$('status').textContent=m;$('log').textContent=m};
function play(){audio();ac.resume();if(playing)return;playing=true;next=ac.currentTime;timer=setInterval(tick,25);status('Playing '+bpm()+' BPM')}
function stop(){playing=false;rec=false;clearInterval(timer);$('bRec').classList.remove('on');draw();status('Stopped')}
function record(){rec=!rec;$('bRec').classList.toggle('on',rec);if(rec)play();status(rec?'Recording into loop — tap pads':'Record off')}
function remix(){grid.forEach(r=>r.forEach((v,j)=>r[j]=Math.random()<(v?.7:.12)?1:0));draw();status('Remixed')}
$('bPlay').onclick=play;$('bStop').onclick=stop;$('bRec').onclick=record;$('bClear').onclick=()=>{grid.forEach(r=>r.fill(0));draw()};
function vol(d){S.volume=Math.min(1,Math.max(0,S.volume+d));knobUpd.volume();status('Volume '+Math.round(S.volume*100))}
function speak(t){try{speechSynthesis.speak(new SpeechSynthesisUtterance(t))}catch(e){}}
function command(c){c=c.toLowerCase();let done='';
 if(/unmute/.test(c)){muted=false;apply();done='Unmuted'}else if(/mute/.test(c)){muted=true;apply();done='Muted'}
 else if(/stop/.test(c)){stop();done='Stopped'}else if(/record/.test(c)){record();done='Recording'}else if(/remix/.test(c)){remix();done='Remixed'}
 else if(/play|start/.test(c)){play();done='Playing'}else if(/volume|louder|quieter/.test(c)){vol(/down|quiet|lower/.test(c)?-.15:.15);done='Volume '+Math.round(S.volume*100)}
 else done='Did not catch: '+c;status(done);speak(done)}
document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>command(b.dataset.c));
// speech
const SR=window.SpeechRecognition||window.webkitSpeechRecognition,ptt=$('ptt');
if(SR){const r=new SR();r.lang='en-US';r.interimResults=false;r.onresult=e=>command(e.results[0][0].transcript);r.onerror=e=>status('Speech: '+e.error);r.onend=()=>ptt.classList.remove('live');
 ptt.addEventListener('pointerdown',()=>{audio();try{r.start();ptt.classList.add('live');status('Listening…')}catch(e){}});ptt.addEventListener('pointerup',()=>{try{r.stop()}catch(e){}})}
else{ptt.textContent='Voice not supported — use buttons';ptt.disabled=true}
// tabs
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button,section').forEach(x=>x.classList.remove('on','show'));b.classList.add('on');$(b.dataset.t).classList.add('show')});
// MIDI
if(navigator.requestMIDIAccess)navigator.requestMIDIAccess().then(m=>{const bind=()=>{let n=0;m.inputs.forEach(i=>{n++;i.onmidimessage=e=>{const[s,d,v]=e.data;if((s&0xf0)===0x90&&v>0)hit(((d-36)%8+8)%8)}});$('midi').textContent='MIDI: '+n+' in'};bind();m.onstatechange=bind}).catch(()=>$('midi').textContent='MIDI: off');
else $('midi').textContent='MIDI: n/a';
// library (stub)
const DEMO=[{t:'Demo Groove (placeholder)',a:'Example Artist',l:'CC0'},{t:'Sunset Loop (placeholder)',a:'Example Creator',l:'CC-BY 4.0'},{t:'Never shown',a:'X',l:'CC-BY-NC'}];
const ok=l=>/^(CC0|CC-BY( \d|$))/.test(l)&&!/NC|ND/.test(l);
function lib(q){if(/🥁/.test(q))hit(0);if(/🎹/.test(q))hit(6);if(/🔥/.test(q))remix();
 $('results').innerHTML=DEMO.filter(x=>ok(x.l)&&x.t.toLowerCase().includes(q.replace(/[^\w ]/g,'').toLowerCase().trim())).map(x=>`<p class="note"><b>${x.t}</b><br>by ${x.a} · License: ${x.l}${x.l!=='CC0'?' · Attribution required':''}</p>`).join('')}
$('q').oninput=e=>lib(e.target.value);lib('');
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
