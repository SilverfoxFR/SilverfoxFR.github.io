export class AudioSys{
	constructor(){ this.ctx=null; }
	get context(){ if(!this.ctx) this.ctx=new (window.AudioContext||window.webkitAudioContext)(); return this.ctx; }
	async loadFromUrl(url){ const res=await fetch(url); const buf=await res.arrayBuffer(); return await this.context.decodeAudioData(buf); }
	async loadFromArrayBuffer(arrayBuffer){ return await this.context.decodeAudioData(arrayBuffer.slice(0)); }
	play(buffer,{volume=1,loop=false,detune=0}={}){ const src=this.context.createBufferSource(); src.buffer=buffer; const g=this.context.createGain(); g.gain.value=volume; src.detune.value=detune; src.loop=loop; src.connect(g).connect(this.context.destination); src.start(); return { stop:()=>src.stop() }; }
}