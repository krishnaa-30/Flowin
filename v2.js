
/* Flowin V2 — progression, missions, skill tree, room, trophies and polish */
(() => {
  const V2_KEY = 'flowin-v2-v1';
  const defaults = {
    shields: 1, skillPoints: 0, skills: {},
    missions: {}, trophies: {}, chestClaimed: {},
    lifeTree: 0, roomItems: [], season: 'Evergreen',
    petAbilities: {}, lastLevel: 1
  };
  let v2 = JSON.parse(localStorage.getItem(V2_KEY) || 'null') || {...defaults};
  const saveV2 = () => localStorage.setItem(V2_KEY, JSON.stringify(v2));
  const q = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const dayKey = d => {
    d = new Date(d);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const todayKey2 = dayKey(new Date());

  function state() {
    const s = typeof levelState === 'function' ? levelState() : {level:1,current:0,required:100};
    return s;
  }

  function ensureMissions() {
    const key = todayKey2;
    if (!v2.missions[key]) {
      v2.missions[key] = {
        completed: {},
        tasks: [
          {id:'three', title:'Complete 3 habits', xp:30, coins:15, target:3},
          {id:'sprint', title:'Finish a Flow Sprint', xp:20, coins:10, target:1},
          {id:'streak', title:'Complete a scheduled habit', xp:15, coins:8, target:1}
        ]
      };
      saveV2();
    }
    return v2.missions[key];
  }

  function completedTodayCount() {
    return habits.filter(h => scheduled(h) && done(h)).length;
  }

  function skillBonus(type) {
    const lv = v2.skills[type] || 0;
    return lv * (type === 'discipline' ? 0.05 : type === 'focus' ? 0.08 : type === 'wealth' ? 0.06 : 0.05);
  }

  function xpMultiplier() {
    const best = Math.max(0, ...habits.map(h => streak(h)));
    const streakMult = best >= 30 ? 2 : best >= 14 ? 1.5 : best >= 7 ? 1.25 : best >= 3 ? 1.1 : 1;
    return streakMult * (1 + skillBonus('discipline'));
  }

  function trophy(id, title, icon) {
    if (!v2.trophies[id]) v2.trophies[id] = {title, icon, unlocked:true, date:todayKey2};
    saveV2();
  }

  function checkTrophies() {
    const total = habits.reduce((n,h)=>n+h.checks.length,0);
    const best = Math.max(0,...habits.map(h=>streak(h)));
    const lvl = state().level;
    if (total >= 1) trophy('first','First Ritual','🌱');
    if (best >= 7) trophy('week','7-Day Flame','🔥');
    if (best >= 30) trophy('month','30-Day Legend','👑');
    if (total >= 100) trophy('century','Century Club','💯');
    if (lvl >= 8) trophy('sky','Sky Sanctuary','☁️');
    if (v2.lifeTree >= 100) trophy('tree','Life Tree','🌳');
  }

  function addSection(id, title, subtitle, html, cls='v2-section') {
    if (q('#'+id)) return;
    const el = document.createElement('section');
    el.id=id; el.className=cls;
    el.innerHTML=`<div class="section-heading"><div><h2>${title}</h2><p>${subtitle}</p></div></div>${html}`;
    q('#today')?.appendChild(el);
  }

  function injectStyles() {
    if(q('#v2Styles')) return;
    const st=document.createElement('style'); st.id='v2Styles';
    st.textContent=`
      .v2-section{margin-top:38px}
      .v2-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
      .v2-card{background:var(--card,#fff);border:1px solid var(--line,#e8e4f0);border-radius:18px;padding:20px;box-shadow:0 12px 30px #463a6410}
      .v2-card h3{font-family:Fraunces,serif;margin:0 0 5px}
      .v2-muted{color:var(--muted);font-size:12px}
      .v2-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      .v2-btn{border:0;border-radius:10px;padding:9px 12px;background:#6e5ce7;color:#fff;font-weight:700;cursor:pointer}
      .v2-btn.alt{background:#eeeaf7;color:#5e5770}
      .mission{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:13px 0;border-bottom:1px solid var(--line)}
      .mission:last-child{border-bottom:0}.mission.done{opacity:.65}
      .mission strong{display:block;font-size:13px}.reward-pills{display:flex;gap:5px;margin-top:5px}.reward-pills span{font-size:10px;font-weight:800;background:#fff3ca;color:#7a5722;padding:4px 6px;border-radius:6px}
      .skill-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      .skill{padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--paper);text-align:center}.skill .ico{font-size:25px}.skill h4{margin:7px 0 3px}.skill button{margin-top:9px}
      .skill-level{font-size:10px;color:var(--muted);font-weight:800}
      .tree{min-height:190px;display:grid;place-items:center;background:linear-gradient(#d9f3ff,#eff8dd);border-radius:16px;overflow:hidden;position:relative}
      .tree .trunk{font-size:95px;filter:drop-shadow(0 10px 4px #385b2730)}.tree .spark{position:absolute;font-size:24px;animation:floatSpark 2.2s ease-in-out infinite}
      .room{height:220px;border-radius:16px;background:linear-gradient(180deg,#d9d0ff 0 55%,#c99b72 56%);position:relative;overflow:hidden}
      .room .floor{position:absolute;inset:56% 0 0;background:repeating-linear-gradient(90deg,#b98763 0 45px,#c99771 45px 90px)}
      .room-item{position:absolute;font-size:38px;z-index:2}.room-label{position:absolute;top:12px;left:12px;background:#ffffffcc;padding:6px 9px;border-radius:8px;font-size:11px;font-weight:800}
      .trophy-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}.trophy{padding:13px 7px;border-radius:12px;text-align:center;background:#f2eef8;color:#9b95a5}.trophy.unlocked{background:#fff3c9;color:#76591f}.trophy b{display:block;font-size:25px}.trophy small{font-size:9px;font-weight:800}
      .coach{background:linear-gradient(120deg,#e9e2ff,#d8f6ea);border:0}
      .boss-v2{position:relative;overflow:hidden}.boss-v2 .boss-stage{font-size:50px}.boss-v2 .phase{font-size:10px;font-weight:900;letter-spacing:1px;color:#b35a73}
      .level-flash{position:fixed;inset:0;z-index:100;display:grid;place-items:center;pointer-events:none;background:#241d3b55;animation:v2Fade 2.2s ease forwards}.level-flash div{background:#29253f;color:#fff;border:1px solid #bcaeff;border-radius:20px;padding:30px 38px;text-align:center;box-shadow:0 25px 80px #1b142d66;animation:v2Pop .5s ease}.level-flash strong{display:block;font:700 30px Fraunces,serif;color:#d7ceff}.float-reward{position:fixed;z-index:101;pointer-events:none;font-weight:900;color:#6e5ce7;animation:floatReward 1.2s ease forwards}
      @keyframes v2Pop{from{transform:scale(.75);opacity:0}to{transform:scale(1);opacity:1}}@keyframes v2Fade{0%,75%{opacity:1}100%{opacity:0}}@keyframes floatReward{from{transform:translateY(0);opacity:1}to{transform:translateY(-55px);opacity:0}}@keyframes floatSpark{50%{transform:translateY(-8px) rotate(8deg)}}
      body.dark .tree{background:linear-gradient(#34335a,#394c32)}body.dark .room{background:linear-gradient(#393458 0 55%,#694c3c 56%)}body.dark .skill{background:#292533}
      @media(max-width:760px){.v2-grid{grid-template-columns:1fr}.skill-grid{grid-template-columns:repeat(2,1fr)}.trophy-grid{grid-template-columns:repeat(3,1fr)}}
    `; document.head.appendChild(st);
  }

  function renderMissions() {
    const box=q('#v2Missions'); if(!box) return;
    const m=ensureMissions();
    const count=completedTodayCount();
    const sprintDone=!!m.completed.sprint;
    if(count>=3) m.completed.three=true;
    if(count>=1) m.completed.streak=true;
    const doneAll=m.tasks.every(t=>m.completed[t.id]);
    if(doneAll && !v2.chestClaimed[todayKey2]) box.insertAdjacentHTML('afterend',`<div class="v2-card" id="v2Chest"><h3>🎁 Daily Reward Chest</h3><p class="v2-muted">All missions complete. Claim your earned reward.</p><div class="v2-actions"><button class="v2-btn" id="claimChest">Open Chest</button></div></div>`);
    box.innerHTML=m.tasks.map(t=>`<div class="mission ${m.completed[t.id]?'done':''}"><div><strong>${m.completed[t.id]?'✓ ':''}${t.title}</strong><div class="reward-pills"><span>+${t.xp} XP</span><span>+${t.coins} 🪙</span></div></div><span>${m.completed[t.id]?'DONE':'TODAY'}</span></div>`).join('');
    saveV2();
    q('#claimChest')?.addEventListener('click',()=>{
      if(v2.chestClaimed[todayKey2])return;
      v2.chestClaimed[todayKey2]=true;
      game.xp+=75; game.coins=(game.coins||0)+40; saveGame(); saveV2();
      q('#v2Chest')?.remove(); popReward('🎁 +75 XP · +40 🪙'); renderAllV2();
    });
  }

  function renderSkills() {
    const box=q('#v2Skills'); if(!box)return;
    const skills=[
      ['focus','🧠','Focus','Flow Sprint rewards +8% / level'],
      ['discipline','⚔️','Discipline','Quest XP +5% / level'],
      ['wealth','🪙','Wealth','Coin rewards +6% / level'],
      ['wellness','❤️','Wellness','Energy resilience +5% / level']
    ];
    box.innerHTML=`<div class="v2-card"><p><b>Available skill points: ${v2.skillPoints}</b></p><div class="skill-grid">${skills.map(s=>{let lv=v2.skills[s[0]]||0;return `<div class="skill"><div class="ico">${s[1]}</div><h4>${s[2]}</h4><div class="skill-level">LEVEL ${lv}</div><p class="v2-muted">${s[3]}</p><button class="v2-btn ${v2.skillPoints?'':'alt'}" data-skill="${s[0]}" ${v2.skillPoints?'':'disabled'}>Upgrade</button></div>`}).join('')}</div></div>`;
    box.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>{if(!v2.skillPoints)return;v2.skillPoints--;v2.skills[b.dataset.skill]=(v2.skills[b.dataset.skill]||0)+1;saveV2();renderSkills();});
  }

  function renderTree() {
    const box=q('#v2Tree'); if(!box)return;
    const size=Math.min(12,Math.max(1,Math.floor(v2.lifeTree/10)+1));
    box.innerHTML=`<div class="v2-card"><div class="tree"><span class="room-label">LIFE TREE · ${v2.lifeTree} GROWTH</span><span class="trunk">🌳</span><span class="spark" style="left:25%;top:35%">✨</span><span class="spark" style="right:25%;top:25%;animation-delay:.5s">🌸</span><span class="spark" style="left:42%;top:20%;animation-delay:1s">🍃</span></div><div class="v2-actions"><span class="v2-muted">Every completed habit grows your tree.</span><span class="v2-muted">Growth stage: ${size}/12</span></div></div>`;
  }

  function renderRoom() {
    const box=q('#v2Room'); if(!box)return;
    const items=['🪴','📚','🛋️','🖥️','🏆','🎮'];
    const unlocked=items.slice(0,Math.min(items.length,2+Math.floor(state().level/2)));
    box.innerHTML=`<div class="v2-card"><div class="room"><span class="room-label">🏠 YOUR ROOM · LEVEL ${state().level}</span><div class="floor"></div>${unlocked.map((x,i)=>`<span class="room-item" style="left:${12+i*15}%;bottom:${18+(i%2)*18}px">${x}</span>`).join('')}<span class="room-item" style="right:12%;bottom:18px">🐾</span></div><p class="v2-muted" style="margin-top:10px">Decor unlocks as your level grows.</p></div>`;
  }

  function renderTrophies() {
    const box=q('#v2Trophies'); if(!box)return;
    const all=[['first','First Ritual','🌱'],['week','7-Day Flame','🔥'],['month','30-Day Legend','👑'],['century','Century Club','💯'],['sky','Sky Sanctuary','☁️'],['tree','Life Tree','🌳']];
    box.innerHTML=`<div class="v2-card"><div class="trophy-grid">${all.map(x=>`<div class="trophy ${v2.trophies[x[0]]?'unlocked':''}"><b>${x[2]}</b><small>${x[1]}</small></div>`).join('')}</div></div>`;
  }

  function renderCoach() {
    const box=q('#v2Coach'); if(!box)return;
    const active=habits.filter(h=>scheduled(h)), completed=active.filter(h=>done(h)).length;
    const best=[...habits].sort((a,b)=>streak(b)-streak(a))[0];
    let msg=completed===0?'Start with your smallest scheduled habit. Momentum begins with one check.':completed===active.length&&active.length?'Perfect day. Consider using your extra energy for a Flow Sprint.':best&&streak(best)>=7?`Your ${best.name} streak is strong at ${streak(best)} days. Protect that rhythm.`:'You are building momentum. Keep the next action small and concrete.';
    box.innerHTML=`<div class="v2-card coach"><h3>🤖 Flowin Coach</h3><p>${esc(msg)}</p><div class="v2-actions"><button class="v2-btn alt" id="coachRefresh">Refresh insight</button></div></div>`;
    q('#coachRefresh').onclick=renderCoach;
  }

  function renderAllV2() {
    ensureMissions(); checkTrophies();
    renderMissions();renderSkills();renderTree();renderRoom();renderTrophies();renderCoach();
    const lvl=state().level;
    if(lvl>v2.lastLevel){v2.skillPoints+=(lvl-v2.lastLevel);v2.lastLevel=lvl;saveV2();showLevelUp(lvl);}
  }

  function build() {
    injectStyles();
    addSection('v2MissionsSection','🎯 Daily Missions','Optional challenges that make every day feel like a quest.','<div class="v2-card" id="v2Missions"></div>');
    addSection('v2SkillsSection','🌟 Skill Tree','Spend skill points to shape how your Flowin journey works.','<div id="v2Skills"></div>');
    addSection('v2TreeSection','🌳 Life Tree','Your consistency becomes something you can see grow.','<div id="v2Tree"></div>');
    addSection('v2RoomSection','🏠 Your Room','A small personal space that expands with your level.','<div id="v2Room"></div>');
    addSection('v2TrophySection','🏆 Trophy Room','Milestones worth keeping.','<div id="v2Trophies"></div>');
    addSection('v2CoachSection','🤖 Flowin Coach','A lightweight local insight engine based on your current progress.','<div id="v2Coach"></div>');
    renderAllV2();
  }

  function popReward(text) {
    const e=document.createElement('div');e.className='float-reward';e.textContent=text;e.style.left='50%';e.style.top='45%';document.body.appendChild(e);setTimeout(()=>e.remove(),1300);
  }

  function showLevelUp(level) {
    const e=document.createElement('div');e.className='level-flash';e.innerHTML=`<div><strong>LEVEL ${level}! ✦</strong><p>Your world grew. +1 Skill Point.</p></div>`;document.body.appendChild(e);setTimeout(()=>e.remove(),2200);
  }

  // Add a V2 nav item without replacing the existing navigation.
  function addNav() {
    const nav=document.querySelector('.sidebar nav');
    if(!nav || q('#v2Nav'))return;
    const b=document.createElement('button');b.className='nav-link';b.id='v2Nav';b.innerHTML='<span>✦</span> Progress Lab';
    nav.appendChild(b);
    b.onclick=()=>{document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.view').forEach(x=>x.classList.remove('active-view'));let view=q('#progressLab');view.classList.add('active-view');q('#pageTitle').textContent='Build your world.';};
    const view=document.createElement('section');view.id='progressLab';view.className='view';
    view.innerHTML=`<div class="section-heading"><div><h2>Progress Lab</h2><p>Your RPG systems, rewards, trophies and personal world.</p></div></div><div class="v2-grid"><div id="labSkills"></div><div id="labTrophies"></div></div>`;
    q('main').appendChild(view);
  }

  // Safe wrapper around the existing toggle: add V2 progression without replacing base behavior.
  const originalToggle = window.toggle;
  if(typeof originalToggle==='function' && !window.__flowinV2Toggle){
    window.__flowinV2Toggle=true;
    window.toggle=function(id){
      const h=habits.find(x=>x.id===id), was= h ? done(h) : false;
      originalToggle(id);
      if(h && !was){
        const mult=xpMultiplier();
        const bonus=Math.max(0,Math.round((mult-1)*10));
        if(bonus){game.xp+=bonus;game.coins=(game.coins||0)+Math.max(0,Math.round(bonus/2));}
        v2.lifeTree+=1;
        const m=ensureMissions();
        if(completedTodayCount()>=3)m.completed.three=true;
        if(completedTodayCount()>=1)m.completed.streak=true;
        saveGame();saveV2();
        popReward(`+${bonus} bonus XP · 🌳 +1 growth`);
        renderAllV2();
      } else if(h && was){
        v2.lifeTree=Math.max(0,v2.lifeTree-1);saveV2();renderAllV2();
      }
    };
  }

  // Add mission reward for Flow Sprint completion.
  const originalFlowSprint = window.finishSprint;
  if(typeof originalFlowSprint==='function' && !window.__flowinV2Sprint){
    window.__flowinV2Sprint=true;
    window.finishSprint=function(){
      originalFlowSprint();
      const m=ensureMissions();m.completed.sprint=true;saveV2();renderMissions();
    };
  }

  // Award a skill point at each newly reached level.
  window.setTimeout(()=>{
    build();addNav();
    // Progress Lab content is linked to the same systems.
    const labS=q('#labSkills'),labT=q('#labTrophies');
    if(labS){labS.innerHTML='<div id="labSkillsInner"></div>';const x=q('#labSkillsInner');x.appendChild(q('#v2Skills').cloneNode(true));}
    if(labT){labT.innerHTML='<div id="labTrophiesInner"></div>';const x=q('#labTrophiesInner');x.appendChild(q('#v2Trophies').cloneNode(true));}
  },80);

  // Re-render V2 after the base app's render cycle.
  const baseRender=window.render;
  if(typeof baseRender==='function' && !window.__flowinV2Render){
    window.__flowinV2Render=true;
    window.render=function(){baseRender();renderAllV2();};
  }

  // Persist a first-time starting skill point so the tree is immediately interactive.
  if(v2.skillPoints===undefined){v2.skillPoints=1;saveV2();}
})();
