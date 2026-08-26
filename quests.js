// Phase 1 RPG upgrade: quests, rewards, a healthy weekly boss, and a level curve.
const questStyle=document.createElement('style');
questStyle.textContent=`
.quest-kicker{font-size:9px;letter-spacing:1px;font-weight:800;color:#7567e8;margin-bottom:3px}.quest-rewards{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}.quest-reward{font-size:10px;font-weight:700;color:#6d5b25;background:#fff3c9;padding:3px 6px;border-radius:5px}.quest-difficulty{font-size:10px;font-weight:700;padding:4px 7px;border-radius:7px;background:#f0edff;color:#6654c9}.quest-difficulty.hard,.quest-difficulty.epic{background:#ffe7ed;color:#bb506f}.boss-card{margin-top:25px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;padding:20px 23px;border-radius:18px;background:linear-gradient(120deg,#342540,#602f55);color:#fff;box-shadow:0 14px 35px #4b203b30}.boss-icon{font-size:42px;filter:drop-shadow(0 5px 5px #160c163e)}.boss-card h2{font-size:20px}.boss-card p{color:#e7c8dc;font-size:12px}.boss-hp{height:10px;background:#7b536f;border-radius:9px;overflow:hidden;margin-top:9px}.boss-hp i{height:100%;display:block;background:linear-gradient(90deg,#ff9e62,#ff4e77);transition:width .4s ease}.boss-count{font-size:13px;font-weight:800;color:#ffcf9b;white-space:nowrap}.level-toast{position:fixed;z-index:40;right:22px;bottom:22px;background:#29253f;color:#fff;border:1px solid #a792ff;border-radius:14px;padding:14px 18px;box-shadow:0 14px 40px #261c4280;animation:slideIn .35s ease}.level-toast strong{display:block;color:#cfc5ff;font-size:17px}@keyframes slideIn{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}.currency-line{display:flex;gap:12px;margin-top:11px}.currency{background:#fff6d8;color:#845d20;padding:5px 8px;border-radius:8px;font-size:11px;font-weight:800}@media(max-width:760px){.boss-card{grid-template-columns:auto 1fr;padding:17px}.boss-count{grid-column:2}.quest-difficulty{display:none}}`;
document.head.appendChild(questStyle);

const rewardByDifficulty={Easy:{xp:10,coins:5},Medium:{xp:25,coins:12},Hard:{xp:50,coins:25},Epic:{xp:85,coins:40}};
function weeklyKey(){const d=new Date(today);d.setDate(d.getDate()-((d.getDay()+6)%7));return dateKey(d)}
function bossForWeek(){
  const key=weeklyKey(),saved=game.boss;
  if(!saved||saved.week!==key){const max=240+habits.length*45;game.boss={week:key,name:['Procrastination Demon','Chaos Beast','Distraction Monster','Laziness Titan'][new Date(key).getDate()%4],max,hp:max,rewarded:false};saveGame()}
  return game.boss;
}
function levelState(){let remaining=game.xp,level=1,required=100;while(remaining>=required){remaining-=required;level++;required=Math.round(required*1.35)}return{level,current:remaining,required}}
gameLevel=()=>levelState().level;
renderGame=function(){
  applyMissedEnergy();
  const state=levelState(),level=state.level,environment=level>=8?'Sky Sanctuary':level>=4?'Sunset Meadow':'Seedling Garden';
  $('#levelPill').textContent=`Level ${level}`;$('#energyText').textContent=`${game.energy} / 100`;$('#xpText').textContent=`${state.current} / ${state.required} XP`;
  $('#energyBar').style.width=game.energy+'%';$('#xpBar').style.width=(state.current/state.required*100)+'%';$('#worldName').textContent=environment;
  $('#worldScene').style.background=level>=8?'linear-gradient(#6e68c8 0 59%,#7c68b4 60%)':level>=4?'linear-gradient(#ffb366 0 59%,#83c56c 60%)':'linear-gradient(#8fd8ff 0 59%,#74cc73 60%)';
  const badges=[['🌱','First step',game.xp>=10],['🔥','On a roll',game.xp>=100],['🏕️','Meadow unlocked',level>=4],['☁️','Sky sanctuary',level>=8]];
  $('#badgeRow').innerHTML=badges.map(b=>`<span class="badge ${b[2]?'unlocked':''}"><b>${b[0]}</b>${b[1]}</span>`).join('');
  let stats=$('#rpgMessage');stats.innerHTML=`${game.energy<35?'Your energy is low—one small win can restore your flow.':`Complete quests to grow your ${environment.toLowerCase()}.`}<span class="currency-line"><span class="currency">🪙 ${game.coins||0} coins</span><span class="currency">💎 ${game.gems||0} gems</span></span>`;
  renderBoss();
}
function renderBoss(){
  const boss=bossForWeek();let card=$('#bossCard');
  if(!card){card=document.createElement('article');card.id='bossCard';card.className='boss-card';$('#today .activity-section').insertAdjacentElement('beforebegin',card)}
  const defeated=boss.hp<=0;card.innerHTML=`<span class="boss-icon">${defeated?'🏆':'👹'}</span><div><span class="tiny-label" style="color:#e8b5d8">WEEKLY BOSS</span><h2>${defeated?'Boss defeated — '+boss.name:boss.name}</h2><p>${defeated?'You won this week. Your progress stays yours.':'Each completed quest deals damage. No pressure—your next move always matters.'}</p><div class="boss-hp"><i style="width:${Math.max(0,boss.hp/boss.max*100)}%"></i></div></div><strong class="boss-count">${defeated?'CLEARED':boss.hp+' HP'}</strong>`;
}
function decorateQuests(){
  document.querySelectorAll('.habit-card').forEach((card,index)=>{
    const h=habits[index];if(!h)return;const difficulty=h.difficulty||'Easy',reward=rewardByDifficulty[difficulty];
    const detail=card.querySelector('.habit-meta');if(detail&&!card.querySelector('.quest-kicker'))detail.insertAdjacentHTML('beforebegin','<div class="quest-kicker">DAILY QUEST</div>');
    const streak=card.querySelector('.streak');if(streak){streak.className='quest-difficulty '+difficulty.toLowerCase();streak.textContent=difficulty}
    if(detail&&!detail.parentElement.querySelector('.quest-rewards'))detail.insertAdjacentHTML('afterend',`<div class="quest-rewards"><span class="quest-reward">+ ${reward.xp} XP</span><span class="quest-reward">+ ${reward.coins} coins</span></div>`);
  });
}
const originalRender=render;
render=function(){originalRender();decorateQuests();renderGame()};

const difficultyLabel=document.createElement('label');
difficultyLabel.innerHTML='Quest difficulty<select id="habitDifficulty"><option>Easy</option><option selected>Medium</option><option>Hard</option><option>Epic</option></select>';
$('#habitRepeat').closest('label').insertAdjacentElement('afterend',difficultyLabel);

const oldToggle=toggle;
toggle=function(id){
  const habit=habits.find(h=>h.id===id),wasDone=done(habit),before=levelState().level,reward=rewardByDifficulty[habit.difficulty||'Easy'];
  oldToggle(id);
  if(!wasDone){game.xp+=reward.xp-10;game.coins=(game.coins||0)+reward.coins;const boss=bossForWeek();boss.hp=Math.max(0,boss.hp-reward.xp);if(boss.hp===0&&!boss.rewarded){boss.rewarded=true;game.xp+=100;game.coins+=80;game.gems=(game.gems||0)+1}saveGame()}
  else{game.xp=Math.max(0,game.xp-(reward.xp-10));game.coins=Math.max(0,(game.coins||0)-reward.coins);saveGame()}
  render();
  const after=levelState().level;if(!wasDone&&after>before){const toast=document.createElement('div');toast.className='level-toast';toast.innerHTML=`<strong>LEVEL UP! ✦ Level ${after}</strong>+25 coins for your new level`;game.coins+=25;saveGame();document.body.appendChild(toast);setTimeout(()=>toast.remove(),4000)}
};

let submittedDifficulty='Medium';
$('#habitForm').addEventListener('submit',()=>{submittedDifficulty=$('#habitDifficulty').value},true);
$('#habitForm').addEventListener('submit',()=>{setTimeout(()=>{const last=habits[habits.length-1];if(last&&!last.difficulty){last.difficulty=submittedDifficulty;save();render()}},0)});
render();
