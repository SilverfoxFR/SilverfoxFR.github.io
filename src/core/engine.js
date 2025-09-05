import { Registry } from './registry.js';
import { Renderer2D } from './renderer2D.js';
import { Input } from './input.js';
import { AudioSys } from './audio.js';
import { Assets } from './assets.js';
import { SystemMonitor } from './systemMonitor.js';


export class Engine{
	constructor(canvas){ this.canvas=canvas; this.registry=new Registry(); this.input=new Input(); this.audio=new AudioSys(); this.assets=new Assets(); this.monitor=new SystemMonitor(); this.renderer=new Renderer2D(canvas,320,180,2); this.currentScene=null; this.acc=0; this.last=performance.now(); this.quality='high';
		this.registry.register('playSfx',(buf,opts)=>this.audio.play(buf,opts));
		this.registry.register('setQuality',q=>this.setQuality(q));
	}
	setScene(scene){ this.currentScene?.leave?.(this.ctx()); this.currentScene=scene; this.currentScene?.enter?.(this.ctx()); }
	ctx(){ return { engine:this, registry:this.registry, input:this.input, audio:this.audio, assets:this.assets, renderer:this.renderer, monitor:this.monitor }; }
	setQuality(q){ this.quality=q; this.renderer.setQuality?.(q); }
	start(){ requestAnimationFrame(this.loop.bind(this)); }
	loop(now){ const dt=Math.min(0.25,(now-this.last)/1000); this.last=now; this.acc+=dt; this.input.beginFrame(); this.monitor.tick(dt); if(this.monitor.shouldReduceQuality()) this.setQuality('medium'); if(this.monitor.shouldSafeCrash()){ this.onSafeCrash?.(); return; } while(this.acc>=1/60){ this.currentScene?.update?.(1/60,this.ctx()); this.acc-=1/60; } this.currentScene?.render?.(this.renderer,this.ctx()); requestAnimationFrame(this.loop.bind(this)); }
};

console.log("Hi ! engine.js is being called, and the class 'engine' is ready to use !");
