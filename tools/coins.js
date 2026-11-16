/* Stratos Coins: one shared wallet for every game. Source of Stratos.coins; tools/build.py adds it inside assets/stratos.js.
   Design: STRATOS_COINS_ARCHITECTURE.md. Only this code reads or writes the stratos.wallet / stratos.ledger storage keys.
   Runs inside stratos.js's wrapper, so w, d, S (Stratos), game and live are in scope. */
var WK="stratos.wallet.v1",LK="stratos.ledger.v1",MAXE=500,MAXAMT=10000,
 DEF=/*COINS_CONFIG*/{},cfg=DEF,subs=[],mem={},persistent=true,mockDay="",W=null,L=null,cur=d.currentScript,
 cfgUrl=cur&&cur.src?cur.src.replace(/stratos\.js.*$/,"coins-config.json"):"/assets/coins-config.json";
try{w.localStorage.setItem("stratos.t","1");w.localStorage.removeItem("stratos.t")}catch(e){persistent=false}

/* ---- small helpers ---- */
function str(v,n){return v==null?"":String(v).slice(0,n||40)}
function p2(n){return n<10?"0"+n:""+n}
function dstr(t){return t.getFullYear()+"-"+p2(t.getMonth()+1)+"-"+p2(t.getDate())}
function day(){return mockDay||dstr(new Date())}
function yday(s){var a=s.split("-");return dstr(new Date(+a[0],+a[1]-1,+a[2]-1))}
function clone(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return null}}
function trk(n,p){try{S.track(n,p)}catch(e){}}
function isAmt(n){return typeof n=="number"&&n===Math.floor(n)&&n>0&&n<=MAXAMT}
function rid(){var a="";try{var u=new Uint8Array(9);(w.crypto||w.msCrypto).getRandomValues(u);for(var i=0;i<9;i++)a+=(u[i]%36).toString(36)}catch(e){a=Math.random().toString(36).slice(2,11)}return"d_"+a}
function sgn(x){return x.type=="spend"?-x.amount:x.type=="adjust"?x.amount*(x.dir<0?-1:1):x.amount}

/* ---- storage: every call guarded; falls back to memory when the browser blocks it ---- */
function lose(){if(!persistent)return;persistent=false;K.persistent=false;try{if(W)mem[WK]=JSON.stringify(W);if(L)mem[LK]=JSON.stringify(L)}catch(e){}}
function sget(k){if(persistent){try{return w.localStorage.getItem(k)}catch(e){lose()}}return mem[k]===undefined?null:mem[k]}
function sset(k,v){if(persistent){try{w.localStorage.setItem(k,v);return}catch(e){lose()}}mem[k]=v}
function jget(k){try{var s=sget(k);return s?JSON.parse(s):null}catch(e){return null}}

/* ---- wallet and ledger shapes (v1) ---- */
function newW(){return{v:1,deviceId:rid(),balance:0,lifetimeEarned:0,lifetimeSpent:0,unlocks:{},streak:{count:0,lastDay:""},counters:{},onceKeys:{},checksum:"",createdAt:Date.now()}}
function newL(id){return{v:1,deviceId:id||"",seq:0,entries:[],summary:{balance:0,earned:0,spent:0,byGame:{},byReason:{}}}}
function migrate(x){/* v1 is the first format; add upgrade steps here when v changes (if(x.v<2){...;x.v=2}) */return x}
function normW(x){if(!x||typeof x!="object")return null;x=migrate(x);var b=newW();for(var k in b)if(x[k]==null||typeof x[k]!=typeof b[k])x[k]=b[k];x.balance=Math.max(0,Math.floor(x.balance)||0);return x}
function normL(x){if(!x||typeof x!="object")return null;x=migrate(x);var b=newL(x.deviceId);for(var k in b)if(x[k]==null||typeof x[k]!=typeof b[k])x[k]=b[k];if(!x.entries.length)return x;var n=parseInt(String(x.entries[x.entries.length-1].id).slice(2),10)||0;if(n>x.seq)x.seq=n;return x}
function refresh(){var a=normW(jget(WK)),b=normL(jget(LK));if(a)W=a;if(b)L=b}   /* another tab may have written: re-read before every change */
function cs(){var s=W.balance+"|"+W.deviceId+"|"+(L.entries.length?L.entries[L.entries.length-1].id:"")+"|stratos",h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return(h>>>0).toString(36)}
function save(){W.v=1;L.deviceId=W.deviceId;W.checksum=cs();sset(LK,JSON.stringify(L));sset(WK,JSON.stringify(W))}

/* ---- ledger ---- */
function add(type,amount,g,reason,ref,dir){
 L.seq++;var bal=W.balance+(type=="spend"?-amount:type=="adjust"?amount*(dir<0?-1:1):amount);
 var e={id:"e_"+(L.seq<1e6?("00000"+L.seq).slice(-6):L.seq),ts:Date.now(),type:type,amount:amount,game:g||"site",reason:reason,ref:ref||"",balanceAfter:bal,src:"device"};
 if(type=="adjust")e.dir=dir<0?-1:1;
 W.balance=bal;if(type=="earn")W.lifetimeEarned+=amount;if(type=="spend")W.lifetimeSpent+=amount;
 L.entries.push(e);
 while(L.entries.length>MAXE){var o=L.entries.shift(),s=L.summary;s.balance+=sgn(o);if(o.type=="earn")s.earned+=o.amount;if(o.type=="spend")s.spent+=o.amount;
  var q=o.type=="spend"?"s":"e";if(o.type!="adjust"){var bg=s.byGame[o.game]||(s.byGame[o.game]={e:0,s:0});bg[q]+=o.amount;var br=s.byReason[o.reason]||(s.byReason[o.reason]={e:0,s:0});br[q]+=o.amount}}
 return e}
function replay(l){var s=l.summary,r={balance:s.balance,earned:s.earned,spent:s.spent};for(var i=0;i<l.entries.length;i++){var x=l.entries[i];r.balance+=sgn(x);if(x.type=="earn")r.earned+=x.amount;if(x.type=="spend")r.spent+=x.amount}return r}
function chainOk(l){var b=l.summary.balance;for(var i=0;i<l.entries.length;i++){b+=sgn(l.entries[i]);if(l.entries[i].balanceAfter!==b)return false}return true}
function seen(rule,g,ref){for(var i=L.entries.length-1;i>=0;i--){var x=L.entries[i];if(x.reason==rule&&x.game==g&&x.ref===ref)return true}return false}

/* ---- load, repair and reconcile (runs once per page) ---- */
function init(){
 try{
  var a=normW(jget(WK)),b=normL(jget(LK)),hadL=!!(b&&(b.entries.length||b.seq||b.summary.balance));
  W=a||newW();if(!a&&b&&b.deviceId)W.deviceId=b.deviceId;L=b||newL(W.deviceId);
  if(!hadL){
   if(a&&W.balance>0){var b0=W.balance;W.balance=0;add("adjust",b0,"site","reconcile","ledger_lost",1);trk("coin_reconcile",{delta:b0})}   /* ledger lost: keep the wallet, record it */
  }else{
   var tamper=!chainOk(L)||(a&&W.checksum&&W.checksum!==cs());
   var r=replay(L);
   if(!a){rebuild()}
   if(W.balance!==r.balance){trk("coin_reconcile",{delta:r.balance-W.balance});W.balance=r.balance}
   W.lifetimeEarned=r.earned;W.lifetimeSpent=r.spent;
   if(tamper)trk("coin_tamper_suspected");
  }
  save();
 }catch(e){W=newW();L=newL(W.deviceId)}
}
function rebuild(){   /* wallet lost but ledger kept: restore unlocks and one-time keys we can still see in the ledger */
 for(var i=0;i<L.entries.length;i++){var x=L.entries[i];
  if(x.type=="spend"){var it=look(x.reason);if(it&&it.item.type=="unlock")W.unlocks[x.reason]=x.ts}
  if(x.type=="earn"){if(x.reason=="level_complete"&&x.ref)W.onceKeys[x.game+":"+x.ref]=1;if(x.reason=="game_first_play")W.onceKeys[x.game+":game_first_play"]=1}}}

/* ---- config helpers ---- */
function look(id){   /* catalogue lookup: exact id first, then the longest "prefix*" pattern */
 var c=cfg.catalogue||{},k,best="";if(c[id])return{key:id,item:c[id],id:id};
 for(k in c)if(k.slice(-1)=="*"&&id.indexOf(k.slice(0,-1))==0&&k.length>best.length)best=k;
 return best?{key:best,item:c[best],id:id,rest:id.slice(best.length-1)}:null}
function freeLevel(f){return!!(f&&f.rest&&f.item.freeUpTo&&/^\d+$/.test(f.rest)&&+f.rest<=f.item.freeUpTo)}
function amountOf(r,x,lv){
 var a=r.amount;
 if(a=="dynamic"){a=Math.floor(+x.amount);if(!(a>=(r.min||1)&&a<=(r.max||MAXAMT)))return 0}
 else if(Array.isArray(a)){var t=0;for(var i=0;i<a.length;i++)if(lv<=a[i].maxLevel){t=a[i].coins;break}a=t}
 if(r.multiplier&&+x.multiplier>=1&&+x.multiplier<=5)a=Math.floor(a*x.multiplier);
 return isAmt(a)?a:0}
function cnt(dy){
 var c=W.counters[dy]||(W.counters[dy]={total:0,byGame:{},byRule:{},gr:{}});
 var ks=[],k;for(k in W.counters)ks.push(k);ks.sort();while(ks.length>7)delete W.counters[ks.shift()];return c}
function bump(c,g,rule,n){c.total+=n;c.byGame[g]=(c.byGame[g]||0)+n;c.byRule[rule]=(c.byRule[rule]||0)+1;c.gr[g+"|"+rule]=(c.gr[g+"|"+rule]||0)+1}
function curStreak(){var s=W.streak,dy=day();return s.lastDay==dy||s.lastDay==yday(dy)?s.count:0}
function notify(info){for(var i=0;i<subs.length;i++)try{subs[i](info)}catch(e){}}

/* ---- the game API ---- */
function bal(){return W?W.balance:0}
function blockE(g,id,why){trk("coin_earn_blocked",{game:g,rule:id,reason:why});return{ok:false,reason:why,balance:bal()}}
function earn(id,x){
 try{
  x=x||{};id=str(id);var g=str(x.game);
  if(!g)return blockE(g,id,"no_game");
  var r=cfg.rules&&cfg.rules[id];
  if(!r)return blockE(g,id,"unknown_rule");
  if(r.enabled===false)return blockE(g,id,"disabled");
  refresh();
  var dy=day(),c=cnt(dy),lv=x.level!=null?Math.floor(+x.level):0,ref=str(x.ref);
  if((r.once=="game+level"||Array.isArray(r.amount))&&!(lv>=1))return blockE(g,id,"bad_context");
  if(!ref&&lv>=1)ref="level:"+lv;
  if(!ref&&r.once=="day")ref=dy;
  if(ref&&seen(id,g,ref))return blockE(g,id,"already_earned");
  var ok="";
  if(r.once=="game+level")ok=g+":level:"+lv;else if(r.once=="game")ok=g+":"+id;
  if(ok&&W.onceKeys[ok])return blockE(g,id,"already_earned");
  if(r.once=="day"&&(c.byRule[id]||0)>=1)return blockE(g,id,"already_earned");
  if(r.perDay&&(c.byRule[id]||0)>=r.perDay)return blockE(g,id,"capped");
  if(r.perGamePerDay&&(c.gr[g+"|"+id]||0)>=r.perGamePerDay)return blockE(g,id,"capped");
  var amt=amountOf(r,x,lv);
  if(!amt)return blockE(g,id,"bad_amount");
  var cp=cfg.caps||{},left=Math.min(cp.daily_total?cp.daily_total-c.total:MAXAMT,cp.daily_per_game?cp.daily_per_game-(c.byGame[g]||0):MAXAMT);
  if(left<=0)return blockE(g,id,"capped");
  amt=Math.min(amt,left);
  var first=c.total===0,st=W.streak;
  if(st.lastDay!==dy){st.count=st.lastDay===yday(dy)?st.count+1:1;st.lastDay=dy}
  add("earn",amt,g,id,ref);bump(c,g,id,amt);if(ok)W.onceKeys[ok]=1;
  var bonus=0,b=cfg.rules.streak_bonus;
  if(first&&b&&b.enabled!==false&&id!="streak_bonus"&&st.count>=(b.minStreak||2)){
   bonus=Math.min((b.perDay||5)*st.count,b.max||25,cp.daily_total?cp.daily_total-c.total:MAXAMT,cp.daily_per_game?cp.daily_per_game-(c.byGame[g]||0):MAXAMT);
   if(bonus>0){add("earn",bonus,g,"streak_bonus",dy);bump(c,g,"streak_bonus",bonus)}else bonus=0}
  save();
  trk("coin_earn",{game:g,rule:id,amount:amt,balance:W.balance-bonus,streak:st.count});
  if(bonus)trk("coin_earn",{game:g,rule:"streak_bonus",amount:bonus,balance:W.balance,streak:st.count});
  notify({balance:W.balance,delta:amt+bonus,type:"earn",reason:id,game:g});
  return{ok:true,amount:amt+bonus,bonus:bonus,balance:W.balance,rule:id}
 }catch(e){return{ok:false,reason:"error",balance:bal()}}}
function has(id){try{id=str(id,80);if(W&&W.unlocks[id])return true;return freeLevel(look(id))}catch(e){return false}}
function price(id){try{var f=look(str(id,80));return f&&isAmt(f.item.price)?f.item.price:null}catch(e){return null}}
function can(id){
 try{id=str(id,80);var f=look(id),p=price(id),o=has(id);
  return{affordable:p!==null&&!o&&bal()>=p,owned:o,price:p}}catch(e){return{affordable:false,owned:false,price:null}}}
function spend(id,x){
 try{
  x=x||{};id=str(id,80);var g=str(x.game),f=look(id),p=price(id);
  function no(why){trk("coin_spend_blocked",{game:g,item:id,price:p||0,balance:bal(),reason:why});return{ok:false,reason:why,balance:bal(),price:p}}
  if(!g)return no("no_game");
  if(!f||p===null)return no("unknown_item");
  refresh();
  if(f.item.type!="consumable"&&has(id))return no("already_owned");
  if(W.balance<p)return no("insufficient");
  add("spend",p,g,id,str(x.ref));
  if(f.item.type!="consumable")W.unlocks[id]=Date.now();
  save();
  trk("coin_spend",{game:g,item:id,price:p,balance:W.balance});
  notify({balance:W.balance,delta:-p,type:"spend",reason:id,game:g});
  return{ok:true,balance:W.balance,price:p}
 }catch(e){return{ok:false,reason:"error",balance:bal()}}}
function onChange(cb){if(typeof cb!="function")return function(){};subs.push(cb);return function(){var i=subs.indexOf(cb);if(i>=0)subs.splice(i,1)}}
function history(n){try{var o=[],i=L.entries.length-1;n=n>0?n:50;for(;i>=0&&o.length<n;i--)o.push(clone(L.entries[i]));return o}catch(e){return[]}}
function unlocks(){try{var o=[],k;for(k in W.unlocks)o.push({id:k,ts:W.unlocks[k]});return o.sort(function(a,b){return b.ts-a.ts})}catch(e){return[]}}
function dailyChallenge(){
 try{var l=cfg.dailyChallenges||[];if(!l.length)return null;var dy=day(),a=dy.split("-"),n=Math.round((Date.UTC(+a[0],+a[1]-1,+a[2])-Date.UTC(+a[0],0,0))/864e5),p=l[n%l.length],r=cfg.rules.daily_challenge||{};
  return{game:p.game,title:p.title,ref:dy,coins:r.amount||0,done:!!(W.counters[dy]&&W.counters[dy].byRule.daily_challenge)}}catch(e){return null}}
function stats(){
 try{var c=W.counters[day()]||{total:0},cp=cfg.caps||{};return{balance:W.balance,lifetimeEarned:W.lifetimeEarned,lifetimeSpent:W.lifetimeSpent,streak:curStreak(),todayEarned:c.total,dailyCap:cp.daily_total||0}}
 catch(e){return{balance:0,lifetimeEarned:0,lifetimeSpent:0,streak:0,todayEarned:0,dailyCap:0}}}

/* ---- config: built-in copy now, the JSON file replaces it once fetched ---- */
var rdy=null;
function fetchCfg(done){
 try{if(!w.fetch){done();return}
  w.fetch(cfgUrl,{cache:"no-cache"}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.rules&&j.catalogue&&j.caps)cfg=j}).catch(function(){}).then(done)}catch(e){done()}}
function ready(){return rdy||{then:function(f){try{f&&f()}catch(e){}return this}}}

var K=S.coins={persistent:persistent,balance:bal,earn:earn,spend:spend,can:can,has:has,price:price,onChange:onChange,
 rules:function(){return clone(cfg.rules)},catalogue:function(){return clone(cfg.catalogue)},history:history,ready:ready,
 stats:stats,unlocks:unlocks,dailyChallenge:dailyChallenge};
init();
rdy=w.Promise?new Promise(function(res){fetchCfg(res)}):null;
w.addEventListener("storage",function(e){   /* another tab changed the wallet */
 if(e.key&&e.key!=WK&&e.key!=LK)return;refresh();notify({balance:bal(),delta:0,type:"sync"})});
if(!live){   /* test helpers for coins-test.html; not on stratos.games */
 K._test={dump:function(){return{wallet:clone(W),ledger:clone(L),persistent:persistent}},
  reset:function(){try{w.localStorage.removeItem(WK);w.localStorage.removeItem(LK)}catch(e){}mem={};W=newW();L=newL(W.deviceId);save();notify({balance:0,delta:0,type:"sync"})},
  reinit:function(){init();notify({balance:bal(),delta:0,type:"sync"})},
  setDay:function(s){mockDay=str(s)}}}

/* ---- site chip: the balance in the page header (markup from tools/build.py coin_chip), live, with a count-up and a +N toast ---- */
var shown=null,raf=0,anim=!(w.matchMedia&&w.matchMedia("(prefers-reduced-motion: reduce)").matches);
function fmt(n){return n<1000?String(n):n<999950?(Math.round(n/100)/10)+"K":(Math.round(n/1e5)/10)+"M"}   /* 1234 -> 1.2K; the coins page shows the full number */
function chipEls(){try{return d.querySelectorAll(".coin-chip")||[]}catch(e){return[]}}
function paintN(v,say){var c=chipEls();for(var i=0;i<c.length;i++){var n=c[i].querySelector(".coin-n"),r=c[i].querySelector(".coin-sr");if(n)n.textContent=fmt(v);if(say&&r)r.textContent=v+" coins"}}
function setBal(v,from){
 if(raf&&w.cancelAnimationFrame)w.cancelAnimationFrame(raf);raf=0;
 if(!anim||from==null||v<=from||!w.requestAnimationFrame){paintN(v,1);shown=v;return}
 var t0=0;function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/500);paintN(Math.round(from+(v-from)*k),k>=1);if(k<1)raf=w.requestAnimationFrame(step);else{raf=0;shown=v}}
 raf=w.requestAnimationFrame(step)}
function toast(n){var c=chipEls();for(var i=0;i<c.length;i++){var e=d.createElement("span");e.className="coin-toast";e.setAttribute("aria-hidden","true");e.textContent="+"+n;c[i].appendChild(e);(function(x){setTimeout(function(){if(x.parentNode)x.parentNode.removeChild(x)},1700)})(e)}}
onChange(function(i){try{if(i.type=="earn"&&i.delta>0){setBal(bal(),shown==null?bal()-i.delta:shown);toast(i.delta)}else setBal(bal(),null)}catch(e){}});
function wire(){shown=bal();paintN(shown,1)}
if(d.readyState=="loading")d.addEventListener("DOMContentLoaded",wire);else wire();
