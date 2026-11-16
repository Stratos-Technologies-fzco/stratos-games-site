/* coins-page.js: the /coins page. Reads only through Stratos.coins (balance, stats, rules, catalogue, has, unlocks,
   dailyChallenge, history, spend, onChange); never touches storage. Game names come from window.STRATOS_GAMES (set by tools/build.py). */
(function(w,d){
var G=w.STRATOS_GAMES||{},BASE="../",C=null,seenView=0,spendMsg="";
function $(i){return d.getElementById(i)}
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function clear(n){while(n&&n.firstChild)n.removeChild(n.firstChild);return n}
function nf(n){try{return Number(n).toLocaleString()}catch(e){return String(n)}}   /* browser locale: 1,00,000 in India, Arabic digits where the browser uses them */
function gname(id){return G[id]?G[id].t:(id=="site"?"Stratos":String(id||""))}
function plural(n,w1){return n+" "+w1+(n==1?"":"s")}

function itemLabel(id){
 var m;if(id=="hint")return"Hint";
 if((m=/^(.*):level:(\d+)$/.exec(id)))return gname(m[1])+", level "+m[2];
 if((m=/^(.*):premium$/.exec(id)))return gname(m[1])+" (whole game)";
 return id}
function reasonLabel(e){
 var r=C.rules()[e.reason];
 if(e.type=="spend")return itemLabel(e.reason);
 if(e.type=="adjust")return"Balance check";
 return r&&r.label?r.label:e.reason}

function earnText(r){
 var a=r.amount,t="";
 if(Array.isArray(a)){var lo=a[0].coins,hi=a[a.length-1].coins;t=(lo==hi?lo:lo+" to "+hi)+" coins per new level"}
 else if(a=="dynamic")t="Up to "+(r.max||0)+" coins";
 else if(typeof a=="number")t=plural(a,"coin");
 else if(r.perDay&&r.max)t="Up to "+r.max+" coins a day ("+r.perDay+" for each day in a row)";
 var lim=[];
 if(r.once=="game+level")lim.push("once for each level");
 if(r.once=="day")lim.push("once a day");
 if(r.once=="game")lim.push("once for each game");
 if(r.perDay&&typeof a=="number")lim.push("up to "+r.perDay+" a day");
 if(r.perGamePerDay)lim.push("up to "+r.perGamePerDay+" a day in each game");
 return t+(lim.length?" ("+lim.join(", ")+")":"")}

function section(id){return clear($(id))}

function renderBalance(){
 var s=C.stats();
 $("c-bal").textContent=nf(s.balance);
 $("c-earned").textContent=nf(s.lifetimeEarned);
 $("c-spent").textContent=nf(s.lifetimeSpent);
 $("c-streak").textContent=s.streak?plural(s.streak,"day"):"None yet";
 $("c-empty").hidden=!(s.balance===0&&s.lifetimeEarned===0);
 $("c-nostore").hidden=C.persistent!==false}

function renderToday(){
 var s=C.stats(),box=section("c-today-body"),cap=s.dailyCap||0,pct=cap?Math.min(100,Math.round(s.todayEarned/cap*100)):0;
 box.appendChild(el("p","coins-line",cap?nf(s.todayEarned)+" of "+nf(cap)+" coins earned today":nf(s.todayEarned)+" coins earned today"));
 if(cap){
  var bar=el("div","coins-bar");bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax",cap);bar.setAttribute("aria-valuenow",Math.min(cap,s.todayEarned));bar.setAttribute("aria-label","Coins earned today");
  var fill=el("div","coins-fill");fill.style.width=pct+"%";bar.appendChild(fill);box.appendChild(bar);
  if(s.todayEarned>=cap)box.appendChild(el("p","coins-note","You reached today's limit. Come back tomorrow for more."))}
 var dc=C.dailyChallenge();
 if(dc){
  var card=el("div","coins-card"),h=el("b",null,"Today's challenge: "+dc.title);card.appendChild(h);
  card.appendChild(el("p","coins-line",dc.done?"Done today. You earned "+dc.coins+" coins.":"Finish it for "+dc.coins+" coins."));
  if(G[dc.game]&&!dc.done){var a=el("a","coins-btn","Play "+gname(dc.game));a.href=BASE+"play/"+dc.game+"/";card.appendChild(a)}
  box.appendChild(card)}}

function renderEarn(){
 var ul=section("c-earn-list"),r=C.rules(),k,n=0;
 for(k in r){if(r[k].enabled===false)continue;n++;
  var li=el("li");li.appendChild(el("b",null,(r[k].label||k)+": "));li.appendChild(d.createTextNode(earnText(r[k])));ul.appendChild(li)}
 if(!n)ul.appendChild(el("li",null,"Nothing to earn right now."))}

function renderSpend(){
 var box=section("c-spend-body"),cat=C.catalogue(),k,groups={},general=[];
 for(k in cat){var i=k.indexOf(":");if(i<0)general.push(k);else{var g=k.slice(0,i);(groups[g]=groups[g]||[]).push(k)}}
 var msg=el("p","coins-msg");msg.id="c-spend-msg";msg.setAttribute("role","status");msg.setAttribute("aria-live","polite");msg.textContent=spendMsg;
 if(general.length){
  var ul=el("ul","coins-list");
  general.forEach(function(id){var it=cat[id],li=el("li");li.appendChild(el("b",null,(it.label||id)+": "));li.appendChild(d.createTextNode(it.price+" coins"+(it.type=="consumable"?" each. Use it inside a game when you need a hand.":".")));ul.appendChild(li)});
  box.appendChild(ul)}
 Object.keys(groups).forEach(function(g){
  var card=el("div","coins-card"),h=el("b",null,gname(g));card.appendChild(h);
  groups[g].forEach(function(id){
   var it=cat[id],row=el("div","coins-row");
   if(id.slice(-1)=="*"){
    var from=(it.freeUpTo||0)+1;
    row.appendChild(el("span",null,(it.label||"Level unlock")+": "+it.price+" coins each"+(it.freeUpTo?", from level "+from+" (levels 1 to "+it.freeUpTo+" are free)":"")+". Unlock them inside the game."))}
   else if(/:premium$/.test(id)){
    row.appendChild(el("span",null,"Unlock the whole game: "+it.price+" coins"));
    if(C.has(id))row.appendChild(el("span","coins-tag","Unlocked"));
    else premiumButton(row,id,it,g)}
   else row.appendChild(el("span",null,(it.label||id)+": "+it.price+" coins"));
   card.appendChild(row)});
  box.appendChild(card)});
 if(!general.length&&!Object.keys(groups).length)box.appendChild(el("p","coins-line","Nothing to spend coins on yet."));
 box.appendChild(msg)}

function premiumButton(row,id,it,g){   /* two taps on purpose: no accidental spends */
 var can=C.can(id),wrap=el("span","coins-act");
 function say(t){spendMsg=t;var m=$("c-spend-msg");if(m)m.textContent=t}
 function idle(){clear(wrap);
  var b=el("button","coins-btn","Unlock for "+it.price);b.type="button";
  if(!can.affordable){b.disabled=true;wrap.appendChild(b);wrap.appendChild(el("span","coins-note","You need "+(it.price-C.balance())+" more coins."));return}
  b.onclick=function(){clear(wrap);
   wrap.appendChild(el("span","coins-note","Spend "+it.price+" of your "+nf(C.balance())+" coins?"));
   var y=el("button","coins-btn","Yes, unlock");y.type="button";var n=el("button","coins-btn alt","Cancel");n.type="button";
   n.onclick=idle;y.onclick=function(){var r=C.spend(id,{game:g,ref:"coins-page"});say(r.ok?"Unlocked "+gname(g)+".":(r.reason=="insufficient"?"Not enough coins yet.":"Could not unlock this one."))};
   wrap.appendChild(y);wrap.appendChild(n);y.focus()};
  wrap.appendChild(b)}
 idle();row.appendChild(wrap)}

function renderUnlocked(){
 var ul=section("c-unlocked-list"),u=C.unlocks();
 if(!u.length){ul.appendChild(el("li",null,"Nothing unlocked yet."));return}
 u.forEach(function(x){var li=el("li",null,itemLabel(x.id));var dt="";try{dt=new Date(x.ts).toLocaleDateString()}catch(e){}if(dt)li.appendChild(el("small",null," (since "+dt+")"));ul.appendChild(li)})}

function renderHistory(){
 var box=section("c-history-body"),h=C.history(50);
 if(!h.length){box.appendChild(el("p","coins-line","No coin activity yet."));return}
 var t=el("table","coins-table"),th=el("thead"),tr=el("tr");
 ["When","Game","What","Coins"].forEach(function(x){tr.appendChild(el("th",null,x))});th.appendChild(tr);t.appendChild(th);
 var tb=el("tbody");
 h.forEach(function(e){
  var r=el("tr"),dt="";try{dt=new Date(e.ts).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(x){}
  var neg=e.type=="spend"||(e.type=="adjust"&&e.dir<0),sign=neg?"−":"+";
  r.appendChild(el("td",null,dt));r.appendChild(el("td",null,gname(e.game)));r.appendChild(el("td",null,reasonLabel(e)));
  r.appendChild(el("td",neg?"coins-neg":"coins-pos",sign+nf(e.amount)+(neg?" (spent)":" (earned)")));
  tb.appendChild(r)});
 t.appendChild(tb);var wrap=el("div","coins-scroll");wrap.appendChild(t);box.appendChild(wrap)}

function render(){
 try{renderBalance();renderToday();renderEarn();renderSpend();renderUnlocked();renderHistory()}catch(e){}}

var tries=0;
function start(){
 if(!(w.Stratos&&w.Stratos.coins)){if(++tries<100)setTimeout(start,50);else{var m=$("c-empty");if(m){m.hidden=false;m.textContent="Coins could not load. Please refresh the page."}}return}
 C=w.Stratos.coins;render();
 var after=function(){render();if(!seenView){seenView=1;try{w.Stratos.track("coins_page_view",{balance:C.balance()})}catch(e){}}};
 try{C.ready().then(after)}catch(e){after()}
 C.onChange(render)}
start();
})(window,document);
