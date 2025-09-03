export class Renderer2D{
	constructor(canvas,vw=320,vh=180,scale=2){ this.canvas=canvas; this.vw=vw; this.vh=vh; this.scale=scale;
		this.ctx=canvas.getContext('2d'); this.buffer=document.createElement('canvas'); this.buffer.width=vw; this.buffer.height=vh; this.bctx=this.buffer.getContext('2d');
		this.resize(); addEventListener('resize',()=>this.resize()); }
	resize(){ const dpr=Math.max(1,Math.floor(devicePixelRatio||1)); this.canvas.width=this.vw*this.scale*dpr; this.canvas.height=this.vh*this.scale*dpr; this.canvas.style.width=this.vw*this.scale+'px'; this.canvas.style.height=this.vh*this.scale+'px'; this.ctx.imageSmoothingEnabled=false; this.bctx.imageSmoothingEnabled=false; this.ctx.setTransform(dpr,0,0,dpr,0,0);}
	clear(c='#000'){ this.bctx.fillStyle=c; this.bctx.fillRect(0,0,this.vw,this.vh); }
	drawToScreen(){ this.ctx.drawImage(this.buffer,0,0,this.canvas.width,this.canvas.height); }
	setQuality(q){ if(q==='medium') this.scale=1.5; if(q==='low') this.scale=1; this.resize(); }
}
