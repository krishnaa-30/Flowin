const gameKey='flowin-rpg-v1';
let game=JSON.parse(localStorage.getItem(gameKey)||'null')||{xp:0,energy:100,lastEnergyDay:''};
function saveGame(){localStorage.setItem(gameKey,JSON.stringify(game))}
function gameLevel(){return Math.floor(game.xp/100)+1}
function applyMissedEnergy(){
  const day=dateKey(today);
  if(game.lastEnergyDay===day)return;
  const yesterday=new Date(today);yesterday.setDate(yesterday.getDate()-1);
  const missed=habits.filter(h=>scheduled(h,yesterday)&&!done(h,dateKey(yesterday))).length;
  if(game.lastEnergyDay)game.energy=Math.max(0,game.energy-missed*8);
  game.lastEnergyDay=day;saveGame();
}
function renderGame(){
  applyMissedEnergy();
  const level=gameLevel(),progress=game.xp%100,environment=level>=7?'Sky Sanctuary':level>=4?'Sunset Meadow':'Seedling Garden';
  $('#levelPill').textContent=`Level ${level}`;
  $('#energyText').textContent=`${game.energy} / 100`;
  $('#xpText').textContent=`${progress} / 100 XP`;
  $('#energyBar').style.width=game.energy+'%';$('#xpBar').style.width=progress+'%';
  $('#worldName').textContent=environment;
  const scene=$('#worldScene');
  if(level>=7)scene.style.background='linear-gradient(#6e68c8 0 59%,#7c68b4 60%)';
  else if(level>=4)scene.style.background='linear-gradient(#ffb366 0 59%,#83c56c 60%)';
  else scene.style.background='linear-gradient(#8fd8ff 0 59%,#74cc73 60%)';
  const badges=[['🌱','First step',game.xp>=10],['🔥','On a roll',game.xp>=50],['🏕️','Meadow unlocked',level>=4],['☁️','Sky sanctuary',level>=7]];
  $('#badgeRow').innerHTML=badges.map(b=>`<span class="badge ${b[2]?'unlocked':''}"><b>${b[0]}</b>${b[1]}</span>`).join('');
  $('#rpgMessage').textContent=game.energy<35?'Your energy is low—one small win can restore your flow.':level>=7?'Your sanctuary is thriving. Keep the magic moving.':`Complete a habit to gain 10 XP and grow your ${environment.toLowerCase()}.`;
}
const baseToggle=toggle;
toggle=function(id){
  const habit=habits.find(h=>h.id===id),wasDone=done(habit);
  baseToggle(id);
  if(!wasDone){game.xp+=10;game.energy=Math.min(100,game.energy+4);saveGame()}
  else{game.xp=Math.max(0,game.xp-10);saveGame()}
  renderGame();
};
renderGame();
