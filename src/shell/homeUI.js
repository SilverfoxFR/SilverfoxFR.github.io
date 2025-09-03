import { Engine } from '../core/engine.js';
import { TitleScene } from '../scenes/TitleScene.js';

export async function initShell(){
const el={ packFile:document.getElementById('packFile'), packList:document.getElementById('packList'), library:document.getElementById('library'), status:document.getElementById('status'), gameWrap:document.getElementById('gameWrap'), canvas:document.getElementById('game'), perfText:document.getElementById('perfText'), batteryText:document.getElementById('batteryText'), quickLaunch:document.getElementById('launchLast') };


document.getElementById('openLibrary').onclick=()=>{ el.library.style.display = el.library.style.display==='none'?'block':'none'; refreshLib(); };

el.quickLaunch.onclick=()=>{ const last=localStorage.getItem('mpwa-last-pack'); if(last) launchPack(last); };

async function launchPack(id){ const canvas=el.canvas; el.gameWrap.style.display='block'; const engine=new Engine(canvas);
engine.onSafeCrash=()=>{ el.status.textContent='SAFE MODE: paused due to performance issues.'; el.gameWrap.style.display='none'; };
setInterval(()=>{ el.perfText.textContent=`FPS≈${engine.monitor.fps.toFixed(0)}`; const b=engine.monitor.batteryInfo(); el.batteryText.textContent=b?` | Battery ${Math.round(b.level*100)}% ${b.charging?'(⚡)':''}`:''; },1000);

const fc=pack.fileContent||{};
const scriptPaths=[...(fc.scripts||[]), ...Object.values(fc.functions||{}), ...Object.values(fc.scenes||{})].flat().filter(Boolean);
for(const pth of scriptPaths){ const url=pack.vfs[pth]; if(!url){ console.warn('Missing script', pth); continue; } const mod=await import(/* @vite-ignore */ url); if(typeof mod.register==='function') mod.register(engine); }

if(engine.registry.has('createEntryScene')){ const scene=await engine.registry.call('createEntryScene',engine); engine.setScene(scene); } else { engine.setScene(new TitleScene()); }

addEventListener('pointerdown',()=>engine.audio.context.resume(),{once:true}); engine.start(); localStorage.setItem('mpwa-last-pack', id);
}

await refreshLib();
}