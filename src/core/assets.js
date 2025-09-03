export class Assets{
	constructor(){ this.images=new Map(); this.json=new Map(); }
	async image(key,url){ if(this.images.has(key)) return this.images.get(key); const img=new Image(); img.src=url; await img.decode(); this.images.set(key,img); return img; }
	async jsonFromText(key,text){ const data=JSON.parse(text); this.json.set(key,data); return data; }
}