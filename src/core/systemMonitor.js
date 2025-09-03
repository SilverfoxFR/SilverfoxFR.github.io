export class SystemMonitor{
	constructor(){ this.time=0; this.frames=0; this.fps=60; this.lowFpsStreak=0; this.safeCrash=false; this.battery=null; this.initBattery(); }
	async initBattery(){ if(navigator.getBattery){ try{ this.battery=await navigator.getBattery(); }catch{} } }
	tick(dt){ this.time+=dt; this.frames++; if(this.time>=1){ this.fps=this.frames/this.time; this.time=0; this.frames=0; } if(this.fps<45) this.lowFpsStreak++; else this.lowFpsStreak=Math.max(0,this.lowFpsStreak-1); if(this.lowFpsStreak>300) this.safeCrash=true; }
	shouldReduceQuality(){ return this.fps<50; }
	shouldSafeCrash(){ return this.safeCrash; }
	batteryInfo(){ if(!this.battery) return null; return { level:this.battery.level, charging:this.battery.charging }; }
}