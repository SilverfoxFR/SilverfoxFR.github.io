// scripts/entry.js
// Adventure-mini: simple Adventure-like demo.
// Single-file pack: defines scene, player, bats, items and registers an entry scene.

import {Engine} `./src/core/engine.js`

export function register(engine){
  // create sprites procedurally and register via engine.assets.image(...)
  async function makeSprite(name, drawFn, w=16, h=16){
    const cvs = document.createElement('canvas');
    cvs.width = w; cvs.height = h;
    const ctx = cvs.getContext('2d');
    drawFn(ctx, w, h);
    const data = cvs.toDataURL();
    await engine.assets.image(name, data); // store in engine assets with key=name
    return data;
  }

  // basic sprite painter functions
  function drawPlayer(ctx,w,h){
    ctx.fillStyle='#222'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#ffcc00';
    ctx.fillRect(2,2,w-4,h-4);
  }
  function drawBat(ctx,w,h){
    ctx.fillStyle='#222'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#999';
    ctx.fillRect(2,4,w-4,4);
    ctx.fillRect(4,2, w-8,2);
  }
  function drawKey(ctx,w,h){
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#e6b800';
    ctx.fillRect(4,2,8,4);
    ctx.fillRect(8,6,4,2);
  }
  function drawSword(ctx,w,h){
    ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#ccc'; ctx.fillRect(7,2,2,8);
    ctx.fillStyle='#996'; ctx.fillRect(5,10,6,2);
  }
  function drawChalice(ctx,w,h){
    ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#88d'; ctx.fillRect(3,3,10,6);
    ctx.fillStyle='#666'; ctx.fillRect(5,10,6,2);
  }
  function drawDragon(ctx,w,h){
    ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#c22'; ctx.fillRect(1,1,w-2,h-2);
    ctx.fillStyle='#400'; ctx.fillRect(2,6,w-4,3);
  }

  // tile/map constants
  const TILE = 16;
  // small sample map: 40x20 tiles = 640x320 world (fits in our virtual 320x180 scaled camera)
  const MAP_W = 40, MAP_H = 20;

  // generate a simple map (0=walkable,1=wall)
  function generateMap(){
    const map = new Array(MAP_H).fill(0).map(()=>new Array(MAP_W).fill(0));
    // border walls
    for(let x=0;x<MAP_W;x++){ map[0][x]=1; map[MAP_H-1][x]=1; }
    for(let y=0;y<MAP_H;y++){ map[y][0]=1; map[y][MAP_W-1]=1; }
    // some rooms & corridors
    for(let x=2;x<12;x++) map[4][x]=1;
    for(let x=8;x<20;x++) map[10][x]=1;
    for(let y=2;y<8;y++) map[y][14]=1;
    for(let y=12;y<18;y++) map[y][22]=1;
    // random pillars
    for(let i=0;i<60;i++){
      const rx=2+Math.floor(Math.random()*(MAP_W-4));
      const ry=2+Math.floor(Math.random()*(MAP_H-4));
      if(Math.random()<0.06) map[ry][rx]=1;
    }
    return map;
  }

  // Utility collision check
  function tileAt(px,py,map){
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if(tx<0||ty<0||tx>=MAP_W||ty>=MAP_H) return 1;
    return map[ty][tx];
  }

  // The main Adventure scene
  class AdventureScene {
    constructor(){
      this.map = generateMap();
      // entities
      this.player = { x: 3*TILE + 4, y: 3*TILE + 4, w:10, h:10, speed: 60, hasKey:false, hasSword:false };
      // place items
      this.items = [
        {id:'key', x: (MAP_W-4)*TILE + 4, y: 2*TILE + 4, taken:false},
        {id:'sword', x: 5*TILE + 4, y: (MAP_H-6)*TILE + 4, taken:false},
        {id:'chalice', x: (MAP_W/2|0)*TILE + 4, y: (MAP_H/2|0)*TILE + 4, taken:false}
      ];
      // dragon is guarding chalice area
      this.dragon = { x: (MAP_W/2|0)*TILE + 4 + 48, y: (MAP_H/2|0)*TILE + 4, w:12, h:12, alive:true };
      // bats (roaming enemies) — they move even offscreen: simple wandering AI
      this.bats = [];
      for(let i=0;i<6;i++){
        this.bats.push({ x: (3+Math.random()*(MAP_W-6))*TILE, y: (3+Math.random()*(MAP_H-6))*TILE, dir: Math.random()*Math.PI*2, speed: 30 + Math.random()*30 });
      }
      this.camera = { x:0, y:0, vw:320, vh:180 };
      this.time = 0;
      this.msg = '';
      this.spawnedSprites = false;
    }

    async ensureSprites(){
      if(this.spawnedSprites) return;
      await makeSprite('player', drawPlayer, 12,12);
      await makeSprite('bat', drawBat, 12,12);
      await makeSprite('key', drawKey, 12,12);
      await makeSprite('sword', drawSword, 12,12);
      await makeSprite('chalice', drawChalice, 12,12);
      await makeSprite('dragon', drawDragon, 16,16);
      this.spawnedSprites = true;
    }

    enter(ctx){
      this.ctx = ctx;
      this.renderer = ctx.renderer;
      this.bctx = this.renderer.bctx;
      this.vw = this.renderer.vw;
      this.vh = this.renderer.vh;
      this.ensureSprites();
    }

    leave(ctx){
      // nothing special; engine will hide scene
    }

    // basic AABB collision
    aabbOverlap(a,b){ return !( a.x+a.w < b.x || a.x > b.x+b.w || a.y+a.h < b.y || a.y > b.y+b.h ); }

    update(dt, ctx){
      const input = ctx.input;
      this.time += dt;
      const p = this.player;
      // basic 4-dir movement like pokemon style
      let vx=0, vy=0;
      if(input.down('ArrowLeft')) vx = -1;
      if(input.down('ArrowRight')) vx = 1;
      if(input.down('ArrowUp')) vy = -1;
      if(input.down('ArrowDown')) vy = 1;
      // normalize diagonal
      if(vx!==0 && vy!==0){ vx *= 0.7071; vy *= 0.7071; }
      const speed = p.speed;
      const nx = p.x + vx * speed * dt;
      const ny = p.y + vy * speed * dt;
      // collision with map tiles (simple point checks at center and corners)
      const corners = [
        {x: nx + 1, y: ny + 1},
        {x: nx + p.w -1, y: ny + 1},
        {x: nx + 1, y: ny + p.h -1},
        {x: nx + p.w -1, y: ny + p.h -1}
      ];
      let blocked=false;
      for(const c of corners) if(tileAt(c.x, c.y, this.map)) blocked=true;
      if(!blocked){ p.x = nx; p.y = ny; } // allow movement if not blocked

      // items pickup
      for(const it of this.items){
        if(it.taken) continue;
        const itemBox = { x: it.x, y: it.y, w:10, h:10 };
        if(this.aabbOverlap({x:p.x,y:p.y,w:p.w,h:p.h}, itemBox)){
          it.taken = true;
          if(it.id==='key') p.hasKey = true;
          if(it.id==='sword') p.hasSword = true;
          if(it.id==='chalice') { this.msg = 'You found the chalice! Win-ish.'; }
        }
      }

      // dragon simple behavior: if player close and has sword -> dragon dies
      if(this.dragon.alive){
        const dr = { x:this.dragon.x, y:this.dragon.y, w:this.dragon.w, h:this.dragon.h };
        if(this.aabbOverlap({x:p.x,y:p.y,w:p.w,h:p.h}, dr)){
          if(p.hasSword){ this.dragon.alive = false; this.msg = 'Dragon slain!'; }
          else { this.msg = 'You burned by dragon! Respawn.'; p.x = 3*TILE+4; p.y = 3*TILE+4; }
        }
      }

      // bats AI: wander, bounce off walls, and if near player chase a bit
      for(const b of this.bats){
        // wandering: slight random steer
        b.dir += (Math.random()-0.5)*0.6*dt;
        const chaseDx = (p.x - b.x), chaseDy = (p.y - b.y);
        const chaseDist2 = chaseDx*chaseDx + chaseDy*chaseDy;
        let bspeed = b.speed;
        if(chaseDist2 < (TILE*10)*(TILE*10)) {
          // chase
          const ang = Math.atan2(chaseDy, chaseDx);
          b.dir = ang;
          bspeed = b.speed * 1.25;
        }
        // proposed new pos
        const bxNew = b.x + Math.cos(b.dir) * bspeed * dt;
        const byNew = b.y + Math.sin(b.dir) * bspeed * dt;
        // tile collision check (center point)
        if(!tileAt(bxNew + 6, byNew + 6, this.map)) {
          b.x = bxNew; b.y = byNew;
        } else {
          b.dir += Math.PI * 0.5; // bounce-ish
        }
        // if bat hits player - knockback / reset
        if(this.aabbOverlap({x:b.x,y:b.y,w:10,h:10}, {x:p.x,y:p.y,w:p.w,h:p.h})){
          this.msg = 'Bat! Ouch.';
          p.x = Math.max(3*TILE+4, p.x - 20);
          p.y = Math.max(3*TILE+4, p.y - 20);
        }
      }

      // camera center on player, clamp to world
      const worldW = MAP_W * TILE, worldH = MAP_H * TILE;
      let cx = p.x + p.w/2 - this.vw/2;
      let cy = p.y + p.h/2 - this.vh/2;
      cx = Math.max(0, Math.min(cx, worldW - this.vw));
      cy = Math.max(0, Math.min(cy, worldH - this.vh));
      this.camera.x = cx; this.camera.y = cy;
    }

    render(r, ctx){
      const b = r.bctx;
      // clear
      r.clear('#003'); // dark bg
      // draw tiles
      for(let ty=0; ty<MAP_H; ty++){
        for(let tx=0; tx<MAP_W; tx++){
          const v = this.map[ty][tx];
          const sx = tx*TILE - this.camera.x;
          const sy = ty*TILE - this.camera.y;
          if(sx + TILE < 0 || sy + TILE < 0 || sx > r.vw || sy > r.vh) continue;
          if(v===1){
            b.fillStyle = '#444';
            b.fillRect(sx, sy, TILE, TILE);
            b.fillStyle = '#333';
            b.fillRect(sx+2, sy+2, TILE-4, TILE-4);
          } else {
            b.fillStyle = '#0b5';
            b.fillRect(sx, sy, TILE, TILE);
          }
        }
      }

      // items
      for(const it of this.items){
        if(it.taken) continue;
        const sx = it.x - this.camera.x;
        const sy = it.y - this.camera.y;
        let key = it.id;
        // draw sprite from engine.assets image if available, else fallback rect
        const img = engine.assets.images.get(key);
        if(img){
          b.drawImage(img, sx, sy);
        } else {
          b.fillStyle = '#ff0';
          b.fillRect(sx, sy, 10, 10);
        }
      }

      // dragon
      if(this.dragon.alive){
        const sx = this.dragon.x - this.camera.x;
        const sy = this.dragon.y - this.camera.y;
        const img = engine.assets.images.get('dragon');
        if(img) b.drawImage(img, sx, sy);
        else { b.fillStyle='#c22'; b.fillRect(sx,sy,this.dragon.w,this.dragon.h); }
      }

      // bats
      for(const bat of this.bats){
        const sx = bat.x - this.camera.x;
        const sy = bat.y - this.camera.y;
        const img = engine.assets.images.get('bat');
        if(img) b.drawImage(img, sx, sy);
        else { b.fillStyle='#999'; b.fillRect(sx, sy, 10, 8); }
      }

      // player
      const psx = this.player.x - this.camera.x;
      const psy = this.player.y - this.camera.y;
      const pimg = engine.assets.images.get('player');
      if(pimg) b.drawImage(pimg, psx, psy);
      else { b.fillStyle='#ff0'; b.fillRect(psx, psy, this.player.w, this.player.h); }

      // HUD / messages
      b.fillStyle='#fff'; b.font='10px monospace';
      b.fillText('Key: ' + (this.player.hasKey ? 'YES' : 'NO') + '  Sword: ' + (this.player.hasSword ? 'YES' : 'NO'), 6, r.vh - 8);
      if(this.msg){
        b.fillStyle='#fff'; b.fillText(this.msg, r.vw/2, 12);
        // slowly clear message
        if(this.time % 3 < 0.02) this.msg = '';
      }

      r.drawToScreen();
    }
  } // end AdventureScene

  // register factory
  engine.registry.register('createEntryScene', ()=>{
    return new AdventureScene();
  }, { override: true });
};

register(Engine)
