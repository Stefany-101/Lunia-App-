const sounds={click:'click',open:'open',close:'close',confirm:'confirm',favorite:'favorite',notice:'notice',complete:'complete'};
let active=null,last=0;
export function playUiSound(kind='click'){
 const now=performance.now();if(now-last<85)return;last=now;
 if(active){active.pause();active.currentTime=0}const a=new Audio('assets/ui/'+(sounds[kind]||sounds.click)+'.mp3');a.volume=kind==='favorite'?.12:kind==='complete'?.16:.22;active=a;a.play().catch(()=>{});
}
export function stopUiSound(){if(active){active.pause();active.currentTime=0;active=null}}
export function soundFor(target){const text=(target.getAttribute('aria-label')||target.textContent||'').toLowerCase();if(/favorit|cariñ/.test(text))return'favorite';if(/cerrar|atrás|volver|cancelar|ahora no/.test(text))return'close';if(/guardar|continuar|listo|confirm|terminar|comenzar/.test(text))return'confirm';if(/abrir|conoce|galería|guía/.test(text))return'open';return'click'}

let heartbeatContext;export function playHeartbeat(){try{if(JSON.parse(localStorage.getItem('lunia-button-sounds')||'true')===false)return;heartbeatContext ||= new (window.AudioContext||window.webkitAudioContext)();const c=heartbeatContext;c.resume();for(const delay of [0,.18]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(105,c.currentTime+delay);o.frequency.exponentialRampToValueAtTime(48,c.currentTime+delay+.14);g.gain.setValueAtTime(0,c.currentTime+delay);g.gain.linearRampToValueAtTime(.12,c.currentTime+delay+.025);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+delay+.17);o.connect(g);g.connect(c.destination);o.start(c.currentTime+delay);o.stop(c.currentTime+delay+.18)}}catch{}}