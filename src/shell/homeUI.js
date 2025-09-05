import { Engine } from '../core/engine.js';
import { TitleScene } from '../scenes/TitleScene.js';

export async function initShell(){
const el={ packFile:document.getElementById('packFile'), packList:document.getElementById('packList'), library:document.getElementById('library'), status:document.getElementById('status'), gameWrap:document.getElementById('gameWrap'), canvas:document.getElementById('game'), perfText:document.getElementById('perfText'), batteryText:document.getElementById('batteryText'), quickLaunch:document.getElementById('launchLast') };


document.getElementById('openLibrary').onclick=()=>{ el.library.style.display = el.library.style.display==='none'?'block':'none'; refreshLib(); };

el.quickLaunch.onclick=()=>{ const last=localStorage.getItem('mpwa-last-pack'); if(last) launchPack(last); };

await refreshLib();
}
