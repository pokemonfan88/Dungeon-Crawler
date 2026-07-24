function showModal(title,msg,actions){const overlay=el("modalOverlay");const box=el("modalBox");box.innerHTML=`<h4>${title}</h4><p>${msg}</p><div class="modal-actions">${actions.map(a=>`<button class="${a.cls||''}" onclick="${a.action}">${a.label}</button>`).join("")}</div>`;overlay.classList.add("show")}
function hideModal(){el("modalOverlay").classList.remove("show")}

document.querySelectorAll(".nav-tab").forEach(btn=>{btn.addEventListener("click",()=>{const tab=btn.dataset.tab;if(btn.classList.contains("locked-tab"))return;renderCampTab(tab)})});
document.querySelectorAll(".smith-tab").forEach(btn=>{btn.addEventListener("click",()=>{renderSmith(btn.dataset.smith)})});
el("descendBtn").addEventListener("click",()=>{if(S.expedition.active||!S.unlockedLayers.includes(S.selectedLayer))return;startExpedition(S.selectedLayer)});
el("retreatBtn").addEventListener("click",()=>{if(!S.expedition.active)return;endExpedition("manual",0,0);render();save()});
el("returnCampBtn").addEventListener("click",returnToCamp);
el("questRefreshBtn").addEventListener("click",()=>{S.questRefreshAt=0;renderCampTab("quest")});
el("modalOverlay").addEventListener("click",function(e){if(e.target===this)hideModal()});

/* ========== 种族选择 ========== */
function renderRaceCard(){
  const r=RACES[raceIdx];
  const card=document.getElementById("raceCard");
  const isLocked=!S.unlockedRaces.includes(r.id);
  card.className="race-card"+(isLocked?" locked":"");
  card.style.borderColor=isLocked?"var(--line)":r.color;
  card.innerHTML=`
    <div class="r-icon">${r.icon}</div>
    <div class="r-name">${r.name}</div>
    <div class="r-title">${r.title}</div>
    <div class="r-statline">${r.statsDetail}</div>
    <div class="r-passive"><span style="color:${r.color};">被动</span>｜${r.passive}</div>
    <div class="r-skill"><span style="color:${r.color};">族技</span>｜${r.skill}</div>
    <div class="r-quote">"${r.quote}"</div>
    ${isLocked?`<div class="r-lock">🔒 ${r.unlockCond}</div>`:""}`;
  // 圆点指示器
  document.getElementById("raceDots").innerHTML=RACES.map((_,i)=>`<div class="race-dot${i===raceIdx?' active':''}"></div>`).join("");
  // 进入按钮
  const enterBtn=document.getElementById("raceEnterBtn");
  if(isLocked){enterBtn.disabled=true;enterBtn.textContent="🔒 尚未解锁";}
  else{enterBtn.disabled=false;enterBtn.textContent="🕯️ 以此身踏��深渊";}
  // 箭头
  document.getElementById("racePrev").disabled=raceIdx===0;
  document.getElementById("raceNext").disabled=raceIdx===RACES.length-1;
}
function raceSlide(dir){
  const newIdx=raceIdx+dir;
  if(newIdx<0||newIdx>=RACES.length)return;
  raceIdx=newIdx;
  renderRaceCard();
}
function confirmRace(){
  const r=RACES[raceIdx];
  if(!r.unlocked)return;
  showModal("确认选择","你选择了 <strong style='color:"+r.color+";'>"+r.icon+" "+r.name+"</strong> 作为你的守望者。<br>此选择<strong style='color:var(--blood-bright);'>不可更改</strong>，确认继续吗？",[
    {label:"再想想",cls:"",action:"hideModal()"},
    {label:"确认",cls:"primary",action:"selectRace('"+r.id+"')"}
  ]);
}
function selectRace(raceId){
  const r=RACES.find(x=>x.id===raceId);
  if(!r)return;
  // 重置英雄基础属性
  const h=S.hero;
  h.baseAtk=8;h.baseDef=2;h.maxHp=50;h.hp=50;h.maxSanity=100;h.sanity=100;
  h.torchDrainMult=1;h.baseDodge=0;h.eventRewardMul=1;h.smithCostMul=1;
  // 应用种族属性
  r.apply(h);
  h.race=r.id;
  hideModal();
  // 进入营地
  document.getElementById("app").classList.remove("in-race-select");
  S._inRaceSelect=false;
  switchToCamp();renderCamp();save();
}
function startRaceSelect(){
  S._inRaceSelect=true;
  document.getElementById("app").classList.add("in-race-select");
  raceIdx=0;renderRaceCard();
}

simulateOffline();
const tavernTab=document.querySelector(".nav-tab[data-tab='tavern']");
if(S.unlockedLayers.includes(3)&&tavernTab){tavernTab.classList.remove("locked-tab");tavernTab.innerHTML="🍺 酒 馆";tavernTab.addEventListener("click",()=>{renderCampTab("tavern")})}
// 新玩家：进入种族选择；老玩家：进入营地
const hasSave=localStorage.getItem(SAVE_KEY);
if(!hasSave){startRaceSelect();}
else{switchToCamp();renderCamp();}
save();
setInterval(()=>{if(document.body.classList.contains("in-expedition"))stepTick(false);render();save()},1000);
window.addEventListener("beforeunload",save);
