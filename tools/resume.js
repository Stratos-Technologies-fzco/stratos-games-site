/* Stratos Resume: "continue where you left off" for every game. Source of Stratos.resume; tools/build.py adds it to assets/stratos.js
   right after the coins module, so d, w, S (Stratos), game, inPlay, live, sheetFn, trk() and str() are in scope.
   Design: research/RESUME_DESIGN.md. Only this code reads or writes the stratos.resume.* storage keys; games call it through the page
   (Stratos.resume.save / load / offer / clear), so storage can move to a server later without changing any game. */
var RS_PFX="stratos.resume.",RS_IDX="stratos.resume.index.v1",RS_MAX=100*1024,RS_TTL=30,RS_MEM={},RS_PERSIST=true,RS_PEND=null,RS_TIMER=0,RS_LAST=0,RS_NOW=null;
function rsNow(){return RS_NOW!==null?RS_NOW:Date.now()}
try{w.localStorage.setItem("stratos.rt","1");w.localStorage.removeItem("stratos.rt")}catch(e){RS_PERSIST=false}

/* ---- storage: every call guarded; falls back to memory when the browser blocks it ---- */
function rsGet(k){if(RS_PERSIST){try{return w.localStorage.getItem(k)}catch(e){RS_PERSIST=false;KR.persistent=false}}return RS_MEM[k]===undefined?null:RS_MEM[k]}
function rsSet(k,v){if(RS_PERSIST){try{w.localStorage.setItem(k,v);return true}catch(e){return false}}RS_MEM[k]=v;return true}
function rsDel(k){try{if(RS_PERSIST)w.localStorage.removeItem(k)}catch(e){}delete RS_MEM[k]}
function rsKey(g){return RS_PFX+g+".v1"}
function rsIdx(){try{var x=JSON.parse(rsGet(RS_IDX)||"{}");return x&&typeof x=="object"?x:{}}catch(e){return{}}}
function rsIdxSet(g,ts){var x=rsIdx();if(ts)x[g]=ts;else delete x[g];rsSet(RS_IDX,JSON.stringify(x))}
function rsOk(g){return!!(g&&/^[A-Za-z0-9_\-]{1,80}$/.test(g))}

/* ---- the record: {v, ts, ver, label, state}. ver is the game's own save-format number; a game bumps it when its state changes shape ---- */
function rsRead(g,o){
 try{
  var raw=rsGet(rsKey(g));if(!raw)return null;
  var r=JSON.parse(raw);
  if(!r||r.v!==1||typeof r.ts!="number"||r.state===undefined){rsDel(rsKey(g));rsIdxSet(g,0);return null}
  var ttl=(o&&+o.ttlDays>0?+o.ttlDays:RS_TTL)*864e5;
  if(rsNow()-r.ts>ttl){rsDel(rsKey(g));rsIdxSet(g,0);return null}   /* too old: forget it */
  if(o&&o.ver!=null&&r.ver!==o.ver){rsDel(rsKey(g));rsIdxSet(g,0);return null}   /* saved in an older format: the game starts fresh */
  return r;
 }catch(e){return null}}
function rsWrite(g,state,o){
 var rec={v:1,ts:rsNow(),ver:o&&o.ver!=null?o.ver:1,label:str(o&&o.label,60),state:state},s;
 try{s=JSON.stringify(rec)}catch(e){return false}
 if(typeof s!="string"||s.length>RS_MAX)return false;
 var ok=rsSet(rsKey(g),s);
 if(!ok){   /* storage full: drop the oldest other snapshots, then try once more */
  var x=rsIdx(),ks=[],k;for(k in x)if(k!=g)ks.push(k);ks.sort(function(a,b){return x[a]-x[b]});
  for(var i=0;i<ks.length&&!ok;i++){rsDel(rsKey(ks[i]));rsIdxSet(ks[i],0);ok=rsSet(rsKey(g),s)}
 }
 if(ok)rsIdxSet(g,rec.ts);
 return ok}
function rsFlush(){
 if(RS_TIMER){clearTimeout(RS_TIMER);RS_TIMER=0}
 if(!RS_PEND)return;var p=RS_PEND;RS_PEND=null;RS_LAST=rsNow();rsWrite(p.g,p.state,p.o)}

/* ---- the API a game uses ---- */
function rsSave(state,o){
 try{
  if(!inPlay||!rsOk(game)||state===undefined)return false;
  var probe;try{probe=JSON.stringify(state)}catch(e){return false}
  if(typeof probe!="string"||probe.length>RS_MAX)return false;
  RS_PEND={g:game,state:JSON.parse(probe),o:o||{}};
  var wait=500-(rsNow()-RS_LAST);   /* a game may save every frame: writes are coalesced to at most one per half second, the last state always wins */
  if(wait<=0)rsFlush();else if(!RS_TIMER)RS_TIMER=setTimeout(rsFlush,wait);
  return true
 }catch(e){return false}}
function rsLoad(o){try{rsFlush();var r=inPlay&&rsOk(game)?rsRead(game,o):null;return r?{state:r.state,ts:r.ts,ver:r.ver,label:r.label,ageMs:rsNow()-r.ts}:null}catch(e){return null}}
function rsHas(o){return!!rsLoad(o)}
function rsClear(g){try{g=g||game;if(!rsOk(g))return;if(g==game&&RS_PEND)RS_PEND=null;rsDel(rsKey(g));rsIdxSet(g,0)}catch(e){}}
function rsAgo(ms){var m=Math.round(ms/6e4);if(m<1)return"a moment ago";if(m<60)return m+(m==1?" minute":" minutes")+" ago";var h=Math.round(m/60);if(h<24)return h+(h==1?" hour":" hours")+" ago";var dd=Math.round(h/24);return dd+(dd==1?" day":" days")+" ago"}
/* offer(onResume, onNew[, {ver, ttlDays, title, text, label}]): with a snapshot it asks "Continue where you left off?" (Continue / Start new),
   then calls onResume(state) or onNew() (and forgets the snapshot). With no snapshot, off-site or on any error it calls onNew() at once. */
function rsOffer(onResume,onNew,o){
 var done=false;function nw(){if(done)return;done=true;try{if(typeof onNew=="function")onNew()}catch(e){}}
 try{
  o=o||{};var r=rsLoad(o);
  if(!r){nw();return}
  trk("resume_offered",{game:game});
  sheetFn({ok:true,noMore:true,escYes:true,noLabel:"Start new",title:o.title||"Continue where you left off?",
   text:o.text||((r.label?r.label+". ":"")+"You last played this game "+rsAgo(r.ageMs)+"."),yes:"Continue",
   yes_:function(){if(done)return;done=true;trk("resume_taken",{game:game});try{if(typeof onResume=="function")onResume(r.state,r)}catch(e){rsClear();try{if(typeof onNew=="function")onNew()}catch(x){}}},
   no:function(){trk("resume_new",{game:game});rsClear();nw()}})
 }catch(e){nw()}}
function rsList(){
 try{var x=rsIdx(),o=[],k,now=rsNow();for(k in x)if(now-x[k]<=RS_TTL*864e5)o.push({game:k,ts:x[k]});return o.sort(function(a,b){return b.ts-a.ts})}catch(e){return[]}}

var KR=S.resume={save:rsSave,load:rsLoad,has:rsHas,clear:rsClear,offer:rsOffer,list:rsList,persistent:RS_PERSIST};
w.addEventListener("pagehide",rsFlush);   /* a phone browser may close the tab without warning: write the last state when the page is hidden or closed */
d.addEventListener("visibilitychange",function(){if(d.visibilityState=="hidden")rsFlush()});
try{var rx=rsIdx(),rk,rn=rsNow();for(rk in rx)if(rn-rx[rk]>RS_TTL*864e5){rsDel(rsKey(rk));delete rx[rk]}rsSet(RS_IDX,JSON.stringify(rx))}catch(e){}   /* tidy up old snapshots once per page */
if(!live)KR._test={setNow:function(t){RS_NOW=t===null?null:+t},flush:rsFlush,keys:function(){var o=[],i,k;try{for(i=0;i<w.localStorage.length;i++){k=w.localStorage.key(i);if(k&&k.indexOf("stratos.resume.")==0)o.push(k)}}catch(e){for(k in RS_MEM)o.push(k)}return o}};
