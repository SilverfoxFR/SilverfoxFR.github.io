export class Registry {
	constructor(){ this.map=new Map(); this.blocked=new Set(); }
	register(name, fn, {override=false}={}){ if(this.blocked.has(name)) return; if(!this.map.has(name)||override) this.map.set(name, fn); }
	exclude(names=[]){ names.forEach(n=>this.blocked.add(n)); }
	has(name){ return this.map.has(name) && !this.blocked.has(name); }
	call(name, ...args){ const fn=this.map.get(name); if(!fn||this.blocked.has(name)) throw new Error(`Function ${name} not available`); return fn(...args); }
	list(){ return [...this.map.keys()].filter(k=>!this.blocked.has(k)); }
}