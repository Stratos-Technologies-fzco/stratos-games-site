/* stratos.js: shared Stratos analytics and rewards for every page and game. Written by tools/build.py, do not edit. */
(function(w,d){
if(w.Stratos)return;
try{if(w.parent!==w&&w.parent.Stratos){w.Stratos=w.parent.Stratos;return}}catch(e){}
var C={"apiKey": "AIzaSyAtSE-_XuCMwgmFUIpp__Ue3Sui2kq3sjI", "authDomain": "stratos-analytics-497908.firebaseapp.com", "projectId": "stratos-analytics-497908", "storageBucket": "stratos-analytics-497908.firebasestorage.app", "messagingSenderId": "960886305896", "appId": "1:960886305896:web:c34f68575c9328cfb277dd", "measurementId": "G-VD9H9GF5XJ"},m=location.pathname.match(/\/(?:play|games)\/([^\/]+)\//),game=m?m[1]:"";
function gtag(){(w.dataLayer=w.dataLayer||[]).push(arguments)}
if(d.querySelector('meta[name="stratos-kids"]'))C={};   /* Kids section: no analytics, no ads */
var S=w.Stratos={config:C,game:game,
 track:function(n,x){if(!C.measurementId)return;try{var p={};for(var k in x||{})p[k]=x[k];if(game&&!p.game)p.game=game;gtag("event",String(n).slice(0,40),p)}catch(e){}},
 offerReward:function(done){S.track("reward_offered");S.track("reward_taken");if(typeof done=="function")done()}};
if(C.measurementId){
 gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"granted"});
 gtag("consent","default",{analytics_storage:"denied",region:["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH"]});
 gtag("js",new Date());gtag("config",C.measurementId,game?{game:game}:{});
 var s=d.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+C.measurementId;d.head.appendChild(s);
}
if(game&&/\/play\//.test(location.pathname)){
 S.track("game_open");
 var from=d.visibilityState=="hidden"?0:Date.now();
 function flush(){if(from){var t=Math.round((Date.now()-from)/1000);from=0;if(t>0)S.track("play_time",{seconds:t})}}
 d.addEventListener("visibilitychange",function(){if(d.visibilityState=="hidden")flush();else from=Date.now()});
 w.addEventListener("pagehide",flush);
}
})(window,document);
