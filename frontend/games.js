(() => {
  const colors = ['#f08762', '#70b48a', '#f0c35e', '#7fa7df', '#ce87bb'];
  const shell = (help, body) => `<div class="playarea browser-demo"><div class="demo-head"><span class="demo-help">${help}</span><span class="demo-score" aria-live="polite"></span></div>${body}</div>`;
  const button = (text, cls = 'demo-button') => `<button class="${cls}" type="button">${text}</button>`;
  const display = (root, text) => { root.querySelector('.demo-score').textContent = text; };
  const canvasMarkup = (label, width, height) => `<canvas aria-label="${label}" width="${width}" height="${height}"></canvas>`;

  function spaceShooter(root) {
    root.innerHTML = shell('Move with ← → or A / D. Fire with Space or tap the button.', `${canvasMarkup('Space shooter game', 760, 360)}<div class="demo-controls">${button('← Left')}${button('Fire · Space', 'primary fire')}${button('Right →')}</div><p class="demo-status" aria-live="polite"></p>`);
    const canvas = root.querySelector('canvas'), ctx = canvas.getContext('2d'), status = root.querySelector('.demo-status');
    const keys = new Set();
    let ship, shots, enemies, score, frame, raf, running = true, lastShot = 0, leftHeld = false, rightHeld = false;
    function reset() {
      ship = 380; shots = []; score = 0; frame = 0;
      enemies = Array.from({length: 7}, (_, i) => ({x: 55 + i * 105, y: 45 + (i % 2) * 30, alive: true}));
      status.textContent = 'Clear the whole row before they reach your ship.';
      display(root, 'Score 0');
    }
    function fire() { if (running && frame - lastShot > 9) { shots.push({x: ship, y: 300}); lastShot = frame; } }
    function keydown(e) {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      keys.add(e.key.toLowerCase());
      if (e.code === 'Space') fire();
    }
    function keyup(e) { keys.delete(e.key.toLowerCase()); }
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    const controls = root.querySelectorAll('.demo-controls button');
    const leftDown = () => { leftHeld = true; };
    const rightDown = () => { rightHeld = true; };
    const stopHeld = () => { leftHeld = rightHeld = false; };
    controls[0].addEventListener('pointerdown', leftDown);
    controls[2].addEventListener('pointerdown', rightDown);
    controls[0].addEventListener('pointerup', stopHeld);
    controls[2].addEventListener('pointerup', stopHeld);
    controls[0].addEventListener('pointerleave', stopHeld);
    controls[2].addEventListener('pointerleave', stopHeld);
    controls[1].addEventListener('click', fire);
    function draw() {
      if (!running) return;
      frame++;
      ctx.fillStyle = '#101b31'; ctx.fillRect(0, 0, 760, 360);
      for (let i = 0; i < 45; i++) { ctx.fillStyle = i % 3 ? '#52627d' : '#e5d995'; ctx.fillRect((i * 173) % 760, (i * 97 + frame * (1 + i % 2)) % 350, 2, 2); }
      if (keys.has('arrowleft') || keys.has('a') || leftHeld) ship = Math.max(20, ship - 5);
      if (keys.has('arrowright') || keys.has('d') || rightHeld) ship = Math.min(740, ship + 5);
      ctx.fillStyle = '#f3cb67'; ctx.beginPath(); ctx.moveTo(ship, 280); ctx.lineTo(ship - 18, 318); ctx.lineTo(ship + 18, 318); ctx.fill();
      if (frame % 70 === 0) fire();
      shots.forEach(s => { s.y -= 7; ctx.fillStyle = '#8ce5df'; ctx.fillRect(s.x - 2, s.y, 4, 12); });
      shots = shots.filter(s => s.y > 0);
      if (frame % 28 === 0) enemies.forEach(e => { if (e.alive) e.y += 5; });
      enemies.forEach(e => {
        if (!e.alive) return;
        ctx.fillStyle = '#ed8e75'; ctx.fillRect(e.x - 14, e.y - 9, 28, 18);
        shots.forEach(s => { if (Math.abs(s.x - e.x) < 18 && Math.abs(s.y - e.y) < 17) { e.alive = false; s.y = -20; score++; display(root, `Score ${score}`); } });
      });
      if (enemies.some(e => e.alive && e.y > 255)) { running = false; status.textContent = `Game over — you cleared ${score} ships.`; }
      if (!enemies.some(e => e.alive)) { running = false; status.textContent = `You win! All 7 ships cleared. Score ${score}.`; }
      raf = requestAnimationFrame(draw);
    }
    controls[1].focus({preventScroll:true});
    reset(); draw();
    return () => { running = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', keydown); document.removeEventListener('keyup', keyup); };
  }

  function snakeGame(root) {
    root.innerHTML = shell('Eat the fruit. Use arrow keys or the buttons. Don’t hit the edge or yourself.', `${canvasMarkup('Snake game board', 360, 300)}<div class="demo-controls">${button('Start playing','primary start')}${button('↑', 'demo-button direction')}${button('←', 'demo-button direction')}${button('↓', 'demo-button direction')}${button('→', 'demo-button direction')}${button('New game', 'demo-button reset')}</div><p class="demo-status" aria-live="polite"></p>`);
    const canvas = root.querySelector('canvas'), ctx = canvas.getContext('2d'), status = root.querySelector('.demo-status');
    let snake, dir, next, food, score, timer, ended = false, started = false;
    function placeFood() { do { food = {x: Math.floor(Math.random()*18), y: Math.floor(Math.random()*15)}; } while (snake.some(s => s.x === food.x && s.y === food.y)); }
    function start() { if(started||ended)return;started=true;status.textContent='Go!';timer=setInterval(step,165);root.querySelector('.start').textContent='Playing';root.querySelector('.start').disabled=true; }
    function reset() { snake = [{x:8,y:7},{x:7,y:7},{x:6,y:7}]; dir = next = {x:1,y:0}; score = 0; ended = false; started = false; status.textContent = 'Press Start or a direction to begin.'; placeFood(); display(root, 'Score 0'); clearInterval(timer);root.querySelector('.start').textContent='Start playing';root.querySelector('.start').disabled=false;draw(); }
    function setDirection(x,y) { if (!started) start();if (x !== -dir.x || y !== -dir.y) next = {x,y}; }
    function key(e) { const map={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}; if(map[e.key]) {e.preventDefault();setDirection(...map[e.key]);} }
    document.addEventListener('keydown',key);
    root.querySelectorAll('.direction').forEach((b,i)=>b.addEventListener('click',()=>setDirection(...[[0,-1],[-1,0],[0,1],[1,0]][i])));
    root.querySelector('.start').addEventListener('click',start);root.querySelector('.reset').addEventListener('click',reset);
    function step() {
      if (ended||!started) return;
      dir = next; const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y}, eating=head.x===food.x&&head.y===food.y;
      if(head.x<0||head.x>=18||head.y<0||head.y>=15||snake.slice(0,eating?snake.length:snake.length-1).some(s=>s.x===head.x&&s.y===head.y)){ended=true;clearInterval(timer);status.textContent=`Game over — score ${score}. Press New game to try again.`;return;}
      snake.unshift(head); if(eating){score++;display(root,`Score ${score}`);placeFood();}else snake.pop(); draw();
    }
    function draw(){ctx.fillStyle='#14251d';ctx.fillRect(0,0,360,300);ctx.fillStyle='#f08166';ctx.beginPath();ctx.arc(food.x*20+10,food.y*20+10,8,0,Math.PI*2);ctx.fill();snake.forEach((s,i)=>{ctx.fillStyle=i?'#6cb581':'#b4e17c';ctx.beginPath();ctx.roundRect(s.x*20+1,s.y*20+1,18,18,5);ctx.fill();});}
    reset(); return ()=>{clearInterval(timer);document.removeEventListener('keydown',key);};
  }

  function pongGame(root) {
    root.innerHTML = shell('Keep the ball in play. Move with ↑ / ↓ or move your pointer over the field.', `${canvasMarkup('Pong against the computer', 620, 340)}<div class="demo-controls">${button('↑ Up', 'demo-button move')}${button('↓ Down', 'demo-button move')}</div><p class="demo-status" aria-live="polite">First to 5 points wins.</p>`);
    const c=root.querySelector('canvas'),ctx=c.getContext('2d'),status=root.querySelector('.demo-status'); let py=145,cy=145,bx=310,by=170,vx=4,vy=2,ps=0,cs=0,raf,over=false,keys=new Set();
    function resetBall(direction=1){bx=310;by=170;vx=4*direction;vy=(Math.random()-.5)*4;}
    function keydown(e){if(['ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();keys.add(e.key);}function keyup(e){keys.delete(e.key);}
    document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);
    c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();py=Math.max(12,Math.min(258,(e.clientY-r.top)*340/r.height-41));});
    root.querySelectorAll('.move').forEach((b,i)=>b.addEventListener('click',()=>py=Math.max(12,Math.min(258,py+(i?-30:30)))));
    function draw(){ctx.fillStyle='#111a2a';ctx.fillRect(0,0,620,340);ctx.setLineDash([8,10]);ctx.strokeStyle='#526079';ctx.beginPath();ctx.moveTo(310,0);ctx.lineTo(310,340);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#8ad9cd';ctx.fillRect(20,py,12,82);ctx.fillStyle='#e98c78';ctx.fillRect(588,cy,12,82);ctx.beginPath();ctx.arc(bx,by,9,0,Math.PI*2);ctx.fillStyle='#f5d078';ctx.fill();
      if(!over){if(keys.has('ArrowUp'))py=Math.max(0,py-5);if(keys.has('ArrowDown'))py=Math.min(258,py+5);cy+=((by-41)-cy)*.055;bx+=vx;by+=vy;if(by<9||by>331)vy*=-1;if(bx<36&&bx>20&&by>py-5&&by<py+87){vx=Math.abs(vx)*1.04;vy+=(by-(py+41))*.07;}if(bx>576&&bx<600&&by>cy-5&&by<cy+87){vx=-Math.abs(vx)*1.04;vy+=(by-(cy+41))*.07;}if(bx<0){cs++;resetBall(1);}if(bx>620){ps++;resetBall(-1);}display(root,`You ${ps} · ${cs} CPU`);if(ps>=5||cs>=5){over=true;status.textContent=ps>cs?'You win! Press Escape to close and play again.':'CPU wins this round. Press Escape to try again.';}}
      raf=requestAnimationFrame(draw);}
    draw();return()=>{cancelAnimationFrame(raf);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);};
  }

  function flappyGame(root) {
    root.innerHTML=shell('Tap the game or press Space to flap. Fly through the gaps.',`${canvasMarkup('Flappy Bird game',500,340)}<div class="demo-controls">${button('Play · Space','primary flap')}</div><p class="demo-status" aria-live="polite">Press Play to start flying.</p>`);
    const c=root.querySelector('canvas'),ctx=c.getContext('2d'),status=root.querySelector('.demo-status');let birdY=165,vel=0,pipes=[],score=0,raf,ended=false,started=false,t=0;
    function flap(){if(ended){birdY=165;vel=0;pipes=[];score=0;t=0;ended=false;started=true;status.textContent='Flap to keep flying.';display(root,'Score 0');}else if(!started){started=true;status.textContent='Flap to keep flying.';}vel=-5.2;}
    function key(e){if(e.code==='Space'){e.preventDefault();flap();}}document.addEventListener('keydown',key);c.addEventListener('pointerdown',flap);root.querySelector('.flap').addEventListener('click',flap);
    function draw(){ctx.fillStyle='#a8d9e5';ctx.fillRect(0,0,500,340);ctx.fillStyle='#d6efdc';for(let i=0;i<12;i++)ctx.fillRect((i*61-(t*.5)%61),285,28,55);if(started&&!ended){t++;vel+=.22;birdY+=vel;if(t%88===1)pipes.push({x:510,gap:105+Math.random()*120,scored:false});pipes.forEach(p=>{p.x-=2.6;ctx.fillStyle='#4d9365';ctx.fillRect(p.x,0,52,p.gap-58);ctx.fillRect(p.x,p.gap+58,52,340);if(!p.scored&&p.x+52<62){p.scored=true;score++;display(root,`Score ${score}`);}if(p.x<77&&p.x+52>47&&(birdY<p.gap-48||birdY>p.gap+48))end();});pipes=pipes.filter(p=>p.x>-60);if(birdY<0||birdY>280)end();}else if(!started){ctx.fillStyle='#344a39';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText('Press Play or tap to flap',250,46);}
      ctx.fillStyle='#f3ca5c';ctx.beginPath();ctx.arc(62,birdY,15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(68,birdY-5,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#26352a';ctx.beginPath();ctx.arc(70,birdY-5,2,0,Math.PI*2);ctx.fill();raf=requestAnimationFrame(draw);}
    function end(){ended=true;status.textContent=`Game over — you flew through ${score} gap${score===1?'':'s'}. Tap or press Space to restart.`;}
    draw();return()=>{cancelAnimationFrame(raf);document.removeEventListener('keydown',key);};
  }

  function whackGame(root) {
    root.innerHTML=shell('You have 30 seconds. Tap the mole before it moves!',`<div class="demo-grid mole-grid">${Array.from({length:9},(_,i)=>`<button class="demo-button" type="button" aria-label="Hole ${i+1}">🕳️</button>`).join('')}</div><div class="demo-controls">${button('Start / reset','primary start')}</div><p class="demo-status" aria-live="polite">Ready? Press start.</p>`);
    const holes=[...root.querySelectorAll('.mole-grid button')],status=root.querySelector('.demo-status');let score=0,time=30,index=-1,tick=null,move=null,active=false;
    function paint(){holes.forEach((h,i)=>{h.textContent=i===index?'🐹':'🕳️';h.classList.toggle('mole',i===index);h.disabled=!active;});display(root,`${time}s · ${score} hits`);}
    function start(){clearInterval(tick);clearInterval(move);score=0;time=30;active=true;index=Math.floor(Math.random()*9);status.textContent='Catch that mole!';paint();move=setInterval(()=>{index=Math.floor(Math.random()*9);paint();},720);tick=setInterval(()=>{time--;paint();if(time<=0){active=false;index=-1;clearInterval(tick);clearInterval(move);status.textContent=`Time! You whacked ${score} mole${score===1?'':'s'}.`;paint();}},1000);}
    holes.forEach((h,i)=>h.addEventListener('click',()=>{if(active&&index===i){score++;index=-1;paint();}}));root.querySelector('.start').addEventListener('click',start);paint();return()=>{clearInterval(tick);clearInterval(move);};
  }

  function ticTacToe(root) {
    root.innerHTML=shell('Two players, one screen. X goes first.',`<div class="demo-grid ttt-grid">${Array.from({length:9},()=>button('','demo-button square')).join('')}</div><div class="demo-controls">${button('New round','demo-button reset')}</div><p class="demo-status" aria-live="polite">X’s turn</p>`);
    const cells=[...root.querySelectorAll('.square')],status=root.querySelector('.demo-status');let board=Array(9).fill(''),turn='X',done=false;const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    function render(){cells.forEach((b,i)=>{b.textContent=board[i];b.setAttribute('aria-label',`Square ${i+1}: ${board[i]||'empty'}`);b.disabled=done||!!board[i];});}
    function move(i){if(done||board[i])return;board[i]=turn;const won=wins.some(line=>line.every(n=>board[n]===turn));if(won){done=true;status.textContent=`${turn} wins! Start a new round?`;}else if(board.every(Boolean)){done=true;status.textContent='A draw! Start a new round?';}else{turn=turn==='X'?'O':'X';status.textContent=`${turn}’s turn`;}render();}
    cells.forEach((b,i)=>b.addEventListener('click',()=>move(i)));root.querySelector('.reset').addEventListener('click',()=>{board=Array(9).fill('');turn='X';done=false;status.textContent='X’s turn';render();});render();
  }

  function chessGame(root) {
    root.innerHTML=shell('Local two-player chess. Select a piece, then a square. Pawns promote to queens; castling and en passant are not included.',`<div class="demo-grid chess-grid" role="group" aria-label="Chess board"></div><div class="demo-controls">${button('New game','demo-button reset')}</div><p class="demo-status" aria-live="polite">White to move.</p>`);
    const grid=root.querySelector('.chess-grid'),status=root.querySelector('.demo-status'),glyph={wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'},files='abcdefgh';let board,turn,selected,done;
    function fresh(){board=[...'rnbqkbnr'].map(p=>'b'+p.toUpperCase());board.push(...[...'pppppppp'].map(p=>'b'+p.toUpperCase()));for(let i=0;i<4;i++)board.push(...Array(8).fill(''));board.push(...[...'PPPPPPPP'].map(p=>'w'+p));board.push(...[...'RNBQKBNR'].map(p=>'w'+p));turn='w';selected=-1;done=false;status.textContent='White to move.';render();}
    function pathClear(a,b){const ar=a>>3,ac=a%8,br=b>>3,bc=b%8,dr=Math.sign(br-ar),dc=Math.sign(bc-ac);let r=ar+dr,c=ac+dc;while(r!==br||c!==bc){if(board[r*8+c])return false;r+=dr;c+=dc;}return true;}
    function pseudo(a,b,attack=false){const p=board[a],t=board[b];if(!p||a===b||(!attack&&t&&(t[0]===p[0]||t[1]==='K')))return false;const ar=a>>3,ac=a%8,br=b>>3,bc=b%8,dr=br-ar,dc=bc-ac,ad=Math.abs(dr),acx=Math.abs(dc),kind=p[1].toLowerCase();if(kind==='p'){const d=p[0]==='w'?-1:1;if(attack)return dr===d&&acx===1;if(dc===0&&!t&&dr===d)return true;if(dc===0&&!t&&dr===2*d&&ar===(p[0]==='w'?6:1)&&!board[(ar+d)*8+ac])return true;return acx===1&&dr===d&&!!t;}if(kind==='n')return (ad===2&&acx===1)||(ad===1&&acx===2);if(kind==='k')return Math.max(ad,acx)===1;if(kind==='r'&&!(dr===0||dc===0))return false;if(kind==='b'&&ad!==acx)return false;if(kind==='q'&&!(dr===0||dc===0||ad===acx))return false;return pathClear(a,b);}
    function check(color,b=board){const king=b.indexOf(color+'K');if(king<0)return true;return b.some((p,i)=>p&&p[0]!==color&&pseudoOn(b,i,king,true));}
    function pseudoOn(b,a,to,attack){const original=board;board=b;const ok=pseudo(a,to,attack);board=original;return ok;}
    function legal(a,b){if(!pseudo(a,b))return false;const copy=board.slice();copy[b]=copy[a];copy[a]='';return !check(turn,copy);}
    function hasMove(color){const old=turn;turn=color;let found=false;for(let a=0;a<64&&!found;a++){if(board[a]?.[0]===color){for(let b=0;b<64;b++)if(legal(a,b)){found=true;break;}}}turn=old;return found;}
    function render(){grid.innerHTML='';for(let i=0;i<64;i++){const r=i>>3,c=i%8,b=document.createElement('button');b.type='button';b.className=`demo-button ${((r+c)%2?'dark':'light')}${selected===i?' selected':''}${board[i]?board[i][0]==='w'?' white-piece':' black-piece':''}`;b.textContent=board[i]?glyph[board[i]]:'';b.setAttribute('aria-label',`${files[c]}${8-r}${board[i]?` ${board[i][0]==='w'?'white':'black'} ${board[i][1]}`:' empty'}`);b.disabled=done;b.addEventListener('click',()=>pick(i));grid.append(b);}}
    function pick(i){if(done)return;if(selected<0){if(board[i]?.[0]===turn)selected=i;}else if(board[i]?.[0]===turn){selected=i;}else if(legal(selected,i)){const captured=board[i];board[i]=board[selected];board[selected]='';if(board[i]==='wP'&&(i<8))board[i]='wQ';if(board[i]==='bP'&&(i>=56))board[i]='bQ';selected=-1;turn=turn==='w'?'b':'w';const checked=check(turn);if(!hasMove(turn)){done=true;status.textContent=checked?`${turn==='w'?'Black':'White'} wins by checkmate!`:'Draw by stalemate.';}else status.textContent=`${turn==='w'?'White':'Black'} to move${checked?' — check!':''}${captured?' · piece captured':''}`;}else selected=-1;render();}
    root.querySelector('.reset').addEventListener('click',fresh);fresh();
  }

  function calculator(root) {
    root.innerHTML=shell('A little calculator. Click the keys or type on your keyboard.',`<div class="calc-display" aria-live="polite">0</div><div class="demo-grid calc-grid">${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='].map(x=>button(x)).join('')}</div><p class="demo-status" aria-live="polite"></p>`);
    const out=root.querySelector('.calc-display'),status=root.querySelector('.demo-status');let current='0',stored=null,operator=null,replace=true;
    function render(){out.textContent=current;}
    function press(k){if(/^\d$/.test(k)){current=replace?k:current==='0'?k:current+k;replace=false;}else if(k==='.'){if(replace){current='0.';replace=false;}else if(!current.includes('.'))current+='.';}else if(k==='C'){current='0';stored=null;operator=null;replace=true;status.textContent='';}else if(k==='⌫'){current=current.length>1?current.slice(0,-1):'0';}else if(k==='±'){current=String(-Number(current));}else if(k==='%'){current=String(Number(current)/100);}else if(k==='='){calculate();operator=null;replace=true;}else{if(operator&&!replace)calculate();stored=Number(current);operator=k;replace=true;}render();}
    function calculate(){if(operator===null||stored===null)return;const b=Number(current);if(operator==='÷'&&b===0){status.textContent='Cannot divide by zero.';current='0';}else{const result=operator==='+'?stored+b:operator==='−'?stored-b:operator==='×'?stored*b:stored/b;current=String(Number(result.toPrecision(10)));status.textContent='';}stored=null;replace=true;}
    root.querySelectorAll('.calc-grid button').forEach(b=>b.addEventListener('click',()=>press(b.textContent)));function key(e){const map={'/':'÷','*':'×','-':'−','Enter':'=','Backspace':'⌫','Escape':'C'};const k=map[e.key]||e.key;if(/^\d$/.test(k)||['.','+','−','×','÷','=','C','⌫'].includes(k)){e.preventDefault();press(k);}}document.addEventListener('keydown',key);render();return()=>document.removeEventListener('keydown',key);
  }

  function timeTool(root) {
    root.innerHTML=shell('Stopwatch and countdown timer, right here in your browser.',`<div class="demo-controls">${button('Stopwatch','demo-button tab selected')}${button('Countdown','demo-button tab')}</div><div class="tool-display" aria-live="polite">00:00.0</div><div class="demo-controls">${button('Start','primary start')}${button('Reset','demo-button reset')}</div><div class="demo-controls timer-input" hidden><label>Minutes <input type="number" min="0" max="99" value="1"></label><label>Seconds <input type="number" min="0" max="59" value="0"></label></div><p class="demo-status" aria-live="polite">Ready.</p>`);
    const tabs=root.querySelectorAll('.tab'),out=root.querySelector('.tool-display'),status=root.querySelector('.demo-status'),inputs=root.querySelector('.timer-input');let mode='stopwatch',start=0,elapsed=0,remaining=0,interval=null,running=false;
    const fmt=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}.${mode==='stopwatch'?Math.floor((n%1)*10):''}`;
    function tick(){if(mode==='stopwatch'){out.textContent=fmt(elapsed+(performance.now()-start)/1000);}else{remaining=Math.max(0,remaining-.1);out.textContent=fmt(remaining);if(remaining<=0){stop();status.textContent='Time is up!';}}}
    function stop(){if(interval)clearInterval(interval);interval=null;if(running&&mode==='stopwatch')elapsed+=(performance.now()-start)/1000;running=false;root.querySelector('.start').textContent='Start';}
    tabs.forEach((b,i)=>b.addEventListener('click',()=>{stop();mode=i?'countdown':'stopwatch';tabs.forEach((t,j)=>t.classList.toggle('selected',j===i));inputs.hidden=mode!=='countdown';elapsed=0;remaining=0;out.textContent=mode==='stopwatch'?'00:00.0':'01:00';status.textContent='Ready.';}));
    root.querySelector('.start').addEventListener('click',()=>{if(running){stop();return;}if(mode==='countdown'&&!remaining){const fields=inputs.querySelectorAll('input');remaining=Math.max(0,Number(fields[0].value)*60+Number(fields[1].value));if(!remaining){status.textContent='Set a time greater than zero first.';return;}}running=true;status.textContent='';if(mode==='stopwatch')start=performance.now();root.querySelector('.start').textContent='Pause';interval=setInterval(tick,100);});
    root.querySelector('.reset').addEventListener('click',()=>{stop();elapsed=remaining=0;out.textContent=mode==='stopwatch'?'00:00.0':'01:00';status.textContent='Reset.';});
    return stop;
  }

  function diceGame(root) {
    root.innerHTML=shell('Race to 50 points. Roll again to build your turn, or hold to bank it. A 1 wipes your turn points.',`<div class="move-result" aria-live="polite">🎲</div><div class="demo-controls">${button('Roll dice','primary roll')}${button('Hold points','demo-button hold')}</div><div class="demo-controls"><span class="demo-help">Player 1 <b class="p1">0</b></span><span class="demo-help">Player 2 <b class="p2">0</b></span></div><div class="demo-controls">${button('New game','demo-button reset')}</div><p class="demo-status" aria-live="polite">Player 1’s turn.</p>`);
    let scores=[0,0],turn=0,round=0,done=false;const die=root.querySelector('.move-result'),status=root.querySelector('.demo-status');
    function render(){root.querySelector('.p1').textContent=scores[0];root.querySelector('.p2').textContent=scores[1];status.textContent=done?status.textContent:`Player ${turn+1}’s turn · turn points ${round}`;root.querySelector('.hold').disabled=round===0||done;root.querySelector('.roll').disabled=done;}
    root.querySelector('.roll').addEventListener('click',()=>{if(done)return;const n=1+Math.floor(Math.random()*6);die.textContent=['','⚀','⚁','⚂','⚃','⚄','⚅'][n];if(n===1){round=0;turn=1-turn;status.textContent=`A 1! Player ${turn===0?2:1} loses the turn.`;}else round+=n;render();});
    root.querySelector('.hold').addEventListener('click',()=>{scores[turn]+=round;round=0;if(scores[turn]>=50){done=true;status.textContent=`Player ${turn+1} wins!`; }else turn=1-turn;render();});
    root.querySelector('.reset').addEventListener('click',()=>{scores=[0,0];turn=round=0;done=false;die.textContent='🎲';status.textContent='Player 1’s turn.';render();});render();
  }

  function hangman(root) {
    const words=['capybara','strawberry','planet','puzzle','guitar','telescope','dolphin','rainbow','library','volcano','notebook','butterfly'];
    root.innerHTML=shell('Guess the hidden word. Six misses and it’s game over.',`<div class="game-word" aria-live="polite"></div><div class="hangman-letters">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(x=>button(x)).join('')}</div><div class="demo-controls">${button('New word','demo-button reset')}</div><p class="demo-status" aria-live="polite">Pick a letter.</p>`);
    const word=root.querySelector('.game-word'),status=root.querySelector('.demo-status'),letters=[...root.querySelectorAll('.hangman-letters button')];let answer,used=new Set(),misses,done;
    function start(){answer=words[Math.floor(Math.random()*words.length)];used=new Set();misses=0;done=false;status.textContent='Pick a letter.';render();}
    function guess(ch){if(done||used.has(ch))return;used.add(ch);if(!answer.includes(ch))misses++;if([...answer].every(c=>used.has(c))){done=true;status.textContent='You got it! Nice guessing.';}else if(misses>=6){done=true;status.textContent=`Out of guesses — the word was ${answer}.`;}else status.textContent=answer.includes(ch)?'Good guess!':'Not this time.';render();}
    function render(){word.textContent=[...answer].map(c=>used.has(c)||done&&misses>=6?c:'_').join(' ');display(root,`${6-misses} guesses left`);letters.forEach(b=>{b.disabled=done||used.has(b.textContent.toLowerCase());});}
    letters.forEach(b=>b.addEventListener('click',()=>guess(b.textContent.toLowerCase())));function key(e){if(/^[a-z]$/i.test(e.key))guess(e.key.toLowerCase());}document.addEventListener('keydown',key);root.querySelector('.reset').addEventListener('click',start);start();return()=>document.removeEventListener('keydown',key);
  }

  function moneyCurrency(root) {
    const rateUsd={USD:1,EUR:1.08,GBP:1.27,CAD:.74,AUD:.66,PKR:.00358,INR:.012,JPY:.0067};
    const select=Object.keys(rateUsd).map(c=>`<option value="${c}">${c}</option>`).join('');
    root.innerHTML=shell('Convert using approximate sample rates. For fun only — not for financial decisions.',`<div class="demo-controls"><label>Amount <input class="amount" type="number" min="0" step="any" value="1"></label><select class="from" aria-label="From currency">${select}</select>${button('⇄ Swap')}</div><div class="demo-controls"><label>Convert to <select class="to" aria-label="To currency">${select}</select></label>${button('Convert','primary convert')}</div><h3 class="demo-status result" aria-live="polite">1 USD ≈ 0.93 EUR</h3><p class="demo-help rate-note" style="text-align:center"></p>`);
    const amount=root.querySelector('.amount'),from=root.querySelector('.from'),to=root.querySelector('.to'),result=root.querySelector('.result'),status=root.querySelector('.rate-note');
    to.value='EUR';function convert(){const value=Number(amount.value);if(!Number.isFinite(value)||value<0){result.textContent='Enter an amount of zero or more.';return;}const rate=rateUsd[from.value]/rateUsd[to.value];result.textContent=`${value.toLocaleString()} ${from.value} ≈ ${(value*rate).toLocaleString(undefined,{maximumFractionDigits:4})} ${to.value}`;status.textContent=`Approximate sample rate: 1 ${from.value} ≈ ${rate.toPrecision(4)} ${to.value}.`;}
    root.querySelector('.convert').addEventListener('click',convert);root.querySelector('.demo-controls button:not(.convert)').addEventListener('click',()=>{[from.value,to.value]=[to.value,from.value];convert();});amount.addEventListener('input',convert);from.addEventListener('change',convert);to.addEventListener('change',convert);convert();
  }

  function numberGuess(root) {
    root.innerHTML=shell('A secret number from 1 to 1,000. Keep your guesses sharp.',`<div class="demo-controls"><input class="guess" type="number" min="1" max="1000" placeholder="Your guess" aria-label="Your guess"><button class="primary check">Guess</button>${button('New number','demo-button reset')}</div><p class="demo-status result" aria-live="polite">Make your first guess.</p><p class="demo-help tries" style="text-align:center">Guesses: 0</p>`);
    const input=root.querySelector('.guess'),result=root.querySelector('.result'),triesLabel=root.querySelector('.tries');let target,tries,done;
    function reset(){target=1+Math.floor(Math.random()*1000);tries=0;done=false;input.value='';input.disabled=false;root.querySelector('.check').disabled=false;result.textContent='Make your first guess.';triesLabel.textContent='Guesses: 0';input.focus();}
    function guess(){const n=Number(input.value);if(!Number.isInteger(n)||n<1||n>1000){result.textContent='Enter a whole number from 1 to 1,000.';return;}if(done)return;tries++;triesLabel.textContent=`Guesses: ${tries}`;if(n===target){result.textContent=`You found it in ${tries} guess${tries===1?'':'es'}!`;done=true;input.disabled=true;root.querySelector('.check').disabled=true;}else result.textContent=n<target?'Too low — go higher.':'Too high — go lower.';}
    root.querySelector('.check').addEventListener('click',guess);input.addEventListener('keydown',e=>{if(e.key==='Enter')guess();});root.querySelector('.reset').addEventListener('click',reset);reset();
  }

  function quizGame(root) {
    const questions=[['What is the capital of France?',['Berlin','Madrid','Paris','Rome'],2],['Which planet is called the Red Planet?',['Earth','Mars','Jupiter','Saturn'],1],['What is the largest ocean?',['Atlantic','Indian','Arctic','Pacific'],3],['How many sides has a hexagon?',['Five','Six','Seven','Eight'],1],['Which animal is the largest mammal?',['African elephant','Blue whale','Giraffe','Hippo'],1]];
    root.innerHTML=shell('Five quick questions. See how many you can get right.',`<h3 class="question" style="text-align:center"></h3><div class="quiz-options"></div><div class="demo-controls">${button('Start over','demo-button reset')}</div><p class="demo-status" aria-live="polite"></p>`);
    const q=root.querySelector('.question'),options=root.querySelector('.quiz-options'),status=root.querySelector('.demo-status');let index=0,score=0,locked=false,advance;
    function render(){locked=false;if(index>=questions.length){q.textContent=`Final score: ${score} / ${questions.length}`;options.innerHTML='';status.textContent=score===questions.length?'Perfect score!':score>=3?'Nice work! Try again for a perfect round.':'Good warm-up — give it another go.';return;}q.textContent=`${index+1}. ${questions[index][0]}`;options.innerHTML=questions[index][1].map((a,i)=>`<button class="demo-button option" type="button" data-i="${i}">${a}</button>`).join('');display(root,`Question ${index+1} of ${questions.length}`);options.querySelectorAll('.option').forEach(b=>b.addEventListener('click',()=>{if(locked)return;locked=true;if(+b.dataset.i===questions[index][2]){score++;status.textContent='Correct!';b.classList.add('selected');}else{status.textContent=`Not quite — the answer is ${questions[index][1][questions[index][2]]}.`;}options.querySelectorAll('button').forEach(x=>x.disabled=true);index++;advance=setTimeout(render,850);}));}
    root.querySelector('.reset').addEventListener('click',()=>{clearTimeout(advance);index=0;score=0;status.textContent='';render();});render();return()=>clearTimeout(advance);
  }

  function rockPaperScissors(root) {
    const choices=[['rock','🪨'],['paper','📄'],['scissors','✂️']];
    root.innerHTML=shell('Choose your move. First to five wins.',`<div class="demo-controls choices">${choices.map(([name,emoji])=>button(`${emoji} ${name}`,'demo-button choice')).join('')}</div><div class="move-result" aria-live="polite">Ready?</div><div class="demo-controls">${button('Reset score','demo-button reset')}</div><p class="demo-status" aria-live="polite">You 0 · Computer 0</p>`);
    let you=0,bot=0;const result=root.querySelector('.move-result'),status=root.querySelector('.demo-status');
    function move(name){const theirs=choices[Math.floor(Math.random()*3)][0];result.textContent=`${choices.find(x=>x[0]===name)[1]}  vs  ${choices.find(x=>x[0]===theirs)[1]}`;if(name!==theirs){if((name==='rock'&&theirs==='scissors')||(name==='paper'&&theirs==='rock')||(name==='scissors'&&theirs==='paper'))you++;else bot++;}status.textContent=name===theirs?'Tie!':you>bot?'You win this round!':bot>you?'Computer wins this round!':'All even!';display(root,`You ${you} · Computer ${bot}`);if(you===5||bot===5){status.textContent=you===5?'You won the match!':'Computer won the match!';you=bot=0;}}
    root.querySelectorAll('.choice').forEach((b,i)=>b.addEventListener('click',()=>move(choices[i][0])));root.querySelector('.reset').addEventListener('click',()=>{you=bot=0;result.textContent='Ready?';status.textContent='You 0 · Computer 0';display(root,'');});
  }

  const games={
    'space-shooter':spaceShooter,'snake':snakeGame,'pong':pongGame,'flappy-bird':flappyGame,'whack-a-mole':whackGame,'chess':chessGame,'tic-tac-toe':ticTacToe,'calculator':calculator,'time-tool':timeTool,'dice-game':diceGame,'hangman':hangman,'money-currency':moneyCurrency,'number-guessing-game':numberGuess,'quiz-game':quizGame,'rock-paper-scissors':rockPaperScissors
  };
  window.setupPythonGame=(id,root)=>{const setup=games[id];if(!setup)throw new Error(`No browser edition is available for ${id}.`);return setup(root)||null;};
})();
