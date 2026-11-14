(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=e(n);fetch(n.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Fc="169",bp=0,_h=1,Ap=2,td=1,Rp=2,an=3,Cn=0,ei=1,Ye=2,Xe=0,Is=1,jn=2,vh=3,Mh=4,ed=5,Ni=100,Cp=101,Pp=102,Lp=103,Dp=104,gr=200,Ip=201,Up=202,Np=203,Ll=204,Dl=205,Il=206,Fp=207,Ul=208,Op=209,zp=210,Bp=211,kp=212,Hp=213,Gp=214,Nl=0,Fl=1,Ol=2,zs=3,zl=4,Bl=5,kl=6,Hl=7,Oc=0,Vp=1,Wp=2,Rn=0,id=1,nd=2,sd=3,zc=4,Xp=5,rd=6,od=7,ad=300,Bs=301,ks=302,Gl=303,Vl=304,la=306,hn=1e3,Yn=1001,Wl=1002,ti=1003,qp=1004,Vr=1005,Fi=1006,xa=1007,bn=1008,Ki=1009,ld=1010,cd=1011,Rr=1012,Bc=1013,Jn=1014,qi=1015,Bi=1016,kc=1017,Hc=1018,Qn=1020,hd=35902,ud=1021,fd=1022,Ti=1023,dd=1024,pd=1025,Us=1026,ts=1027,Gc=1028,Vc=1029,md=1030,Wc=1031,Xc=1033,Go=33776,Vo=33777,Wo=33778,Xo=33779,Xl=35840,ql=35841,Yl=35842,$l=35843,Kl=36196,Zl=37492,jl=37496,Jl=37808,Ql=37809,tc=37810,ec=37811,ic=37812,nc=37813,sc=37814,rc=37815,oc=37816,ac=37817,lc=37818,cc=37819,hc=37820,uc=37821,qo=36492,fc=36494,dc=36495,gd=36283,pc=36284,mc=36285,gc=36286,Yp=3200,$p=3201,ca=0,Kp=1,Tn="",ui="srgb",Ln="srgb-linear",qc="display-p3",ha="display-p3-linear",Jo="linear",ue="srgb",Qo="rec709",ta="p3",ls=7680,xh=519,Zp=512,jp=513,Jp=514,_d=515,Qp=516,tm=517,em=518,im=519,Sh=35044,Yc=35048,yh="300 es",cn=2e3,ea=2001;class Vs{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const i=this._listeners;return i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const n=this._listeners[t];if(n!==void 0){const r=n.indexOf(e);r!==-1&&n.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const i=this._listeners[t.type];if(i!==void 0){t.target=this;const n=i.slice(0);for(let r=0,o=n.length;r<o;r++)n[r].call(this,t);t.target=null}}}const Ke=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Eh=1234567;const Sr=Math.PI/180,Cr=180/Math.PI;function Ws(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ke[s&255]+Ke[s>>8&255]+Ke[s>>16&255]+Ke[s>>24&255]+"-"+Ke[t&255]+Ke[t>>8&255]+"-"+Ke[t>>16&15|64]+Ke[t>>24&255]+"-"+Ke[e&63|128]+Ke[e>>8&255]+"-"+Ke[e>>16&255]+Ke[e>>24&255]+Ke[i&255]+Ke[i>>8&255]+Ke[i>>16&255]+Ke[i>>24&255]).toLowerCase()}function qe(s,t,e){return Math.max(t,Math.min(e,s))}function $c(s,t){return(s%t+t)%t}function nm(s,t,e,i,n){return i+(s-t)*(n-i)/(e-t)}function sm(s,t,e){return s!==t?(e-s)/(t-s):0}function yr(s,t,e){return(1-e)*s+e*t}function rm(s,t,e,i){return yr(s,t,1-Math.exp(-e*i))}function om(s,t=1){return t-Math.abs($c(s,t*2)-t)}function am(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function lm(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function cm(s,t){return s+Math.floor(Math.random()*(t-s+1))}function hm(s,t){return s+Math.random()*(t-s)}function um(s){return s*(.5-Math.random())}function fm(s){s!==void 0&&(Eh=s);let t=Eh+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function dm(s){return s*Sr}function pm(s){return s*Cr}function mm(s){return(s&s-1)===0&&s!==0}function gm(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function _m(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function vm(s,t,e,i,n){const r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+i)/2),h=o((t+i)/2),f=r((t-i)/2),u=o((t-i)/2),p=r((i-t)/2),_=o((i-t)/2);switch(n){case"XYX":s.set(a*h,l*f,l*u,a*c);break;case"YZY":s.set(l*u,a*h,l*f,a*c);break;case"ZXZ":s.set(l*f,l*u,a*h,a*c);break;case"XZX":s.set(a*h,l*_,l*p,a*c);break;case"YXY":s.set(l*p,a*h,l*_,a*c);break;case"ZYZ":s.set(l*_,l*p,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function Ps(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function si(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Mm={DEG2RAD:Sr,RAD2DEG:Cr,generateUUID:Ws,clamp:qe,euclideanModulo:$c,mapLinear:nm,inverseLerp:sm,lerp:yr,damp:rm,pingpong:om,smoothstep:am,smootherstep:lm,randInt:cm,randFloat:hm,randFloatSpread:um,seededRandom:fm,degToRad:dm,radToDeg:pm,isPowerOfTwo:mm,ceilPowerOfTwo:gm,floorPowerOfTwo:_m,setQuaternionFromProperEuler:vm,normalize:si,denormalize:Ps};class lt{constructor(t=0,e=0){lt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(qe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const i=Math.cos(e),n=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*n+t.x,this.y=r*n+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Bt{constructor(t,e,i,n,r,o,a,l,c){Bt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c)}set(t,e,i,n,r,o,a,l,c){const h=this.elements;return h[0]=t,h[1]=n,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],f=i[7],u=i[2],p=i[5],_=i[8],g=n[0],m=n[3],d=n[6],M=n[1],x=n[4],y=n[7],C=n[2],T=n[5],b=n[8];return r[0]=o*g+a*M+l*C,r[3]=o*m+a*x+l*T,r[6]=o*d+a*y+l*b,r[1]=c*g+h*M+f*C,r[4]=c*m+h*x+f*T,r[7]=c*d+h*y+f*b,r[2]=u*g+p*M+_*C,r[5]=u*m+p*x+_*T,r[8]=u*d+p*y+_*b,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-i*r*h+i*a*l+n*r*c-n*o*l}invert(){const t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],f=h*o-a*c,u=a*l-h*r,p=c*r-o*l,_=e*f+i*u+n*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/_;return t[0]=f*g,t[1]=(n*c-h*i)*g,t[2]=(a*i-n*o)*g,t[3]=u*g,t[4]=(h*e-n*l)*g,t[5]=(n*r-a*e)*g,t[6]=p*g,t[7]=(i*l-c*e)*g,t[8]=(o*e-i*r)*g,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+t,-n*c,n*l,-n*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Sa.makeScale(t,e)),this}rotate(t){return this.premultiply(Sa.makeRotation(-t)),this}translate(t,e){return this.premultiply(Sa.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Sa=new Bt;function vd(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function ia(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function xm(){const s=ia("canvas");return s.style.display="block",s}const wh={};function Yo(s){s in wh||(wh[s]=!0,console.warn(s))}function Sm(s,t,e){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}function ym(s){const t=s.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Em(s){const t=s.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const Th=new Bt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),bh=new Bt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ks={[Ln]:{transfer:Jo,primaries:Qo,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s,fromReference:s=>s},[ui]:{transfer:ue,primaries:Qo,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s.convertSRGBToLinear(),fromReference:s=>s.convertLinearToSRGB()},[ha]:{transfer:Jo,primaries:ta,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.applyMatrix3(bh),fromReference:s=>s.applyMatrix3(Th)},[qc]:{transfer:ue,primaries:ta,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.convertSRGBToLinear().applyMatrix3(bh),fromReference:s=>s.applyMatrix3(Th).convertLinearToSRGB()}},wm=new Set([Ln,ha]),ie={enabled:!0,_workingColorSpace:Ln,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(s){if(!wm.has(s))throw new Error(`Unsupported working color space, "${s}".`);this._workingColorSpace=s},convert:function(s,t,e){if(this.enabled===!1||t===e||!t||!e)return s;const i=Ks[t].toReference,n=Ks[e].fromReference;return n(i(s))},fromWorkingColorSpace:function(s,t){return this.convert(s,this._workingColorSpace,t)},toWorkingColorSpace:function(s,t){return this.convert(s,t,this._workingColorSpace)},getPrimaries:function(s){return Ks[s].primaries},getTransfer:function(s){return s===Tn?Jo:Ks[s].transfer},getLuminanceCoefficients:function(s,t=this._workingColorSpace){return s.fromArray(Ks[t].luminanceCoefficients)}};function Ns(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ya(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let cs;class Tm{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{cs===void 0&&(cs=ia("canvas")),cs.width=t.width,cs.height=t.height;const i=cs.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),e=cs}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=ia("canvas");e.width=t.width,e.height=t.height;const i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);const n=i.getImageData(0,0,t.width,t.height),r=n.data;for(let o=0;o<r.length;o++)r[o]=Ns(r[o]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){const e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Ns(e[i]/255)*255):e[i]=Ns(e[i]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let bm=0;class Md{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:bm++}),this.uuid=Ws(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?r.push(Ea(n[o].image)):r.push(Ea(n[o]))}else r=Ea(n);i.url=r}return e||(t.images[this.uuid]=i),i}}function Ea(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Tm.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Am=0;class ii extends Vs{constructor(t=ii.DEFAULT_IMAGE,e=ii.DEFAULT_MAPPING,i=Yn,n=Yn,r=Fi,o=bn,a=Ti,l=Ki,c=ii.DEFAULT_ANISOTROPY,h=Tn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Am++}),this.uuid=Ws(),this.name="",this.source=new Md(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new lt(0,0),this.repeat=new lt(1,1),this.center=new lt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Bt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==ad)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case hn:t.x=t.x-Math.floor(t.x);break;case Yn:t.x=t.x<0?0:1;break;case Wl:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case hn:t.y=t.y-Math.floor(t.y);break;case Yn:t.y=t.y<0?0:1;break;case Wl:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}ii.DEFAULT_IMAGE=null;ii.DEFAULT_MAPPING=ad;ii.DEFAULT_ANISOTROPY=1;class we{constructor(t=0,e=0,i=0,n=1){we.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,i=this.y,n=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*n+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*n+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*n+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*n+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,r;const l=t.elements,c=l[0],h=l[4],f=l[8],u=l[1],p=l[5],_=l[9],g=l[2],m=l[6],d=l[10];if(Math.abs(h-u)<.01&&Math.abs(f-g)<.01&&Math.abs(_-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+g)<.1&&Math.abs(_+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const x=(c+1)/2,y=(p+1)/2,C=(d+1)/2,T=(h+u)/4,b=(f+g)/4,L=(_+m)/4;return x>y&&x>C?x<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(x),n=T/i,r=b/i):y>C?y<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(y),i=T/n,r=L/n):C<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(C),i=b/r,n=L/r),this.set(i,n,r,e),this}let M=Math.sqrt((m-_)*(m-_)+(f-g)*(f-g)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(m-_)/M,this.y=(f-g)/M,this.z=(u-h)/M,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Rm extends Vs{constructor(t=1,e=1,i={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new we(0,0,t,e),this.scissorTest=!1,this.viewport=new we(0,0,t,e);const n={width:t,height:e,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Fi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const r=new ii(n,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let i=0,n=t.textures.length;i<n;i++)this.textures[i]=t.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Md(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class vi extends Rm{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}}class xd extends ii{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=ti,this.minFilter=ti,this.wrapR=Yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Cm extends ii{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=ti,this.minFilter=ti,this.wrapR=Yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ai{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,r,o,a){let l=i[n+0],c=i[n+1],h=i[n+2],f=i[n+3];const u=r[o+0],p=r[o+1],_=r[o+2],g=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f;return}if(a===1){t[e+0]=u,t[e+1]=p,t[e+2]=_,t[e+3]=g;return}if(f!==g||l!==u||c!==p||h!==_){let m=1-a;const d=l*u+c*p+h*_+f*g,M=d>=0?1:-1,x=1-d*d;if(x>Number.EPSILON){const C=Math.sqrt(x),T=Math.atan2(C,d*M);m=Math.sin(m*T)/C,a=Math.sin(a*T)/C}const y=a*M;if(l=l*m+u*y,c=c*m+p*y,h=h*m+_*y,f=f*m+g*y,m===1-a){const C=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=C,c*=C,h*=C,f*=C}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f}static multiplyQuaternionsFlat(t,e,i,n,r,o){const a=i[n],l=i[n+1],c=i[n+2],h=i[n+3],f=r[o],u=r[o+1],p=r[o+2],_=r[o+3];return t[e]=a*_+h*f+l*p-c*u,t[e+1]=l*_+h*u+c*f-a*p,t[e+2]=c*_+h*p+a*u-l*f,t[e+3]=h*_-a*f-l*u-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const i=t._x,n=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(n/2),f=a(r/2),u=l(i/2),p=l(n/2),_=l(r/2);switch(o){case"XYZ":this._x=u*h*f+c*p*_,this._y=c*p*f-u*h*_,this._z=c*h*_+u*p*f,this._w=c*h*f-u*p*_;break;case"YXZ":this._x=u*h*f+c*p*_,this._y=c*p*f-u*h*_,this._z=c*h*_-u*p*f,this._w=c*h*f+u*p*_;break;case"ZXY":this._x=u*h*f-c*p*_,this._y=c*p*f+u*h*_,this._z=c*h*_+u*p*f,this._w=c*h*f-u*p*_;break;case"ZYX":this._x=u*h*f-c*p*_,this._y=c*p*f+u*h*_,this._z=c*h*_-u*p*f,this._w=c*h*f+u*p*_;break;case"YZX":this._x=u*h*f+c*p*_,this._y=c*p*f+u*h*_,this._z=c*h*_-u*p*f,this._w=c*h*f-u*p*_;break;case"XZY":this._x=u*h*f-c*p*_,this._y=c*p*f-u*h*_,this._z=c*h*_+u*p*f,this._w=c*h*f+u*p*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,i=e[0],n=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],f=e[10],u=i+a+f;if(u>0){const p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-n)*p}else if(i>a&&i>f){const p=2*Math.sqrt(1+i-a-f);this._w=(h-l)/p,this._x=.25*p,this._y=(n+o)/p,this._z=(r+c)/p}else if(a>f){const p=2*Math.sqrt(1+a-i-f);this._w=(r-c)/p,this._x=(n+o)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+f-i-a);this._w=(o-n)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<Number.EPSILON?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(qe(this.dot(t),-1,1)))}rotateTowards(t,e){const i=this.angleTo(t);if(i===0)return this;const n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const i=t._x,n=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+o*a+n*c-r*l,this._y=n*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-n*a,this._w=o*h-i*a-n*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const i=this._x,n=this._y,r=this._z,o=this._w;let a=o*t._w+i*t._x+n*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=i,this._y=n,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const p=1-e;return this._w=p*o+e*this._w,this._x=p*i+e*this._x,this._y=p*n+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),f=Math.sin((1-e)*h)/c,u=Math.sin(e*h)/c;return this._w=o*f+this._w*u,this._x=i*f+this._x*u,this._y=n*f+this._y*u,this._z=r*f+this._z*u,this._onChangeCallback(),this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class A{constructor(t=0,e=0,i=0){A.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Ah.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Ah.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*n,this.y=r[1]*e+r[4]*i+r[7]*n,this.z=r[2]*e+r[5]*i+r[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,i=this.y,n=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*n+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*n+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*n+r[14])*o,this}applyQuaternion(t){const e=this.x,i=this.y,n=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*n-a*i),h=2*(a*e-r*n),f=2*(r*i-o*e);return this.x=e+l*c+o*f-a*h,this.y=i+l*h+a*c-r*f,this.z=n+l*f+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*n,this.y=r[1]*e+r[5]*i+r[9]*n,this.z=r[2]*e+r[6]*i+r[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const i=t.x,n=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=n*l-r*a,this.y=r*o-i*l,this.z=i*a-n*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return wa.copy(this).projectOnVector(t),this.sub(wa)}reflect(t){return this.sub(wa.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(qe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){const n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const wa=new A,Ah=new Ai;class Dn{constructor(t=new A(1/0,1/0,1/0),e=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Ci.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Ci.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const i=Ci.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const i=t.geometry;if(i!==void 0){const r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Ci):Ci.fromBufferAttribute(r,o),Ci.applyMatrix4(t.matrixWorld),this.expandByPoint(Ci);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Wr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Wr.copy(i.boundingBox)),Wr.applyMatrix4(t.matrixWorld),this.union(Wr)}const n=t.children;for(let r=0,o=n.length;r<o;r++)this.expandByObject(n[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Ci),Ci.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Zs),Xr.subVectors(this.max,Zs),hs.subVectors(t.a,Zs),us.subVectors(t.b,Zs),fs.subVectors(t.c,Zs),dn.subVectors(us,hs),pn.subVectors(fs,us),Un.subVectors(hs,fs);let e=[0,-dn.z,dn.y,0,-pn.z,pn.y,0,-Un.z,Un.y,dn.z,0,-dn.x,pn.z,0,-pn.x,Un.z,0,-Un.x,-dn.y,dn.x,0,-pn.y,pn.x,0,-Un.y,Un.x,0];return!Ta(e,hs,us,fs,Xr)||(e=[1,0,0,0,1,0,0,0,1],!Ta(e,hs,us,fs,Xr))?!1:(qr.crossVectors(dn,pn),e=[qr.x,qr.y,qr.z],Ta(e,hs,us,fs,Xr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Ci).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Ci).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(ji[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),ji[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),ji[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),ji[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),ji[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),ji[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),ji[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),ji[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(ji),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const ji=[new A,new A,new A,new A,new A,new A,new A,new A],Ci=new A,Wr=new Dn,hs=new A,us=new A,fs=new A,dn=new A,pn=new A,Un=new A,Zs=new A,Xr=new A,qr=new A,Nn=new A;function Ta(s,t,e,i,n){for(let r=0,o=s.length-3;r<=o;r+=3){Nn.fromArray(s,r);const a=n.x*Math.abs(Nn.x)+n.y*Math.abs(Nn.y)+n.z*Math.abs(Nn.z),l=t.dot(Nn),c=e.dot(Nn),h=i.dot(Nn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const Pm=new Dn,js=new A,ba=new A;class Xs{constructor(t=new A,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const i=this.center;e!==void 0?i.copy(e):Pm.setFromPoints(t).getCenter(i);let n=0;for(let r=0,o=t.length;r<o;r++)n=Math.max(n,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;js.subVectors(t,this.center);const e=js.lengthSq();if(e>this.radius*this.radius){const i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(js,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ba.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(js.copy(t.center).add(ba)),this.expandByPoint(js.copy(t.center).sub(ba))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ji=new A,Aa=new A,Yr=new A,mn=new A,Ra=new A,$r=new A,Ca=new A;class Sd{constructor(t=new A,e=new A(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Ji)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Ji.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Ji.copy(this.origin).addScaledVector(this.direction,e),Ji.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){Aa.copy(t).add(e).multiplyScalar(.5),Yr.copy(e).sub(t).normalize(),mn.copy(this.origin).sub(Aa);const r=t.distanceTo(e)*.5,o=-this.direction.dot(Yr),a=mn.dot(this.direction),l=-mn.dot(Yr),c=mn.lengthSq(),h=Math.abs(1-o*o);let f,u,p,_;if(h>0)if(f=o*l-a,u=o*a-l,_=r*h,f>=0)if(u>=-_)if(u<=_){const g=1/h;f*=g,u*=g,p=f*(f+o*u+2*a)+u*(o*f+u+2*l)+c}else u=r,f=Math.max(0,-(o*u+a)),p=-f*f+u*(u+2*l)+c;else u=-r,f=Math.max(0,-(o*u+a)),p=-f*f+u*(u+2*l)+c;else u<=-_?(f=Math.max(0,-(-o*r+a)),u=f>0?-r:Math.min(Math.max(-r,-l),r),p=-f*f+u*(u+2*l)+c):u<=_?(f=0,u=Math.min(Math.max(-r,-l),r),p=u*(u+2*l)+c):(f=Math.max(0,-(o*r+a)),u=f>0?r:Math.min(Math.max(-r,-l),r),p=-f*f+u*(u+2*l)+c);else u=o>0?-r:r,f=Math.max(0,-(o*u+a)),p=-f*f+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,f),n&&n.copy(Aa).addScaledVector(Yr,u),p}intersectSphere(t,e){Ji.subVectors(t.center,this.origin);const i=Ji.dot(this.direction),n=Ji.dot(Ji)-i*i,r=t.radius*t.radius;if(n>r)return null;const o=Math.sqrt(r-n),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){const i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,n=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,n=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),i>o||r>n||((r>i||isNaN(i))&&(i=r),(o<n||isNaN(n))&&(n=o),f>=0?(a=(t.min.z-u.z)*f,l=(t.max.z-u.z)*f):(a=(t.max.z-u.z)*f,l=(t.min.z-u.z)*f),i>l||a>n)||((a>i||i!==i)&&(i=a),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,Ji)!==null}intersectTriangle(t,e,i,n,r){Ra.subVectors(e,t),$r.subVectors(i,t),Ca.crossVectors(Ra,$r);let o=this.direction.dot(Ca),a;if(o>0){if(n)return null;a=1}else if(o<0)a=-1,o=-o;else return null;mn.subVectors(this.origin,t);const l=a*this.direction.dot($r.crossVectors(mn,$r));if(l<0)return null;const c=a*this.direction.dot(Ra.cross(mn));if(c<0||l+c>o)return null;const h=-a*mn.dot(Ca);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ht{constructor(t,e,i,n,r,o,a,l,c,h,f,u,p,_,g,m){Ht.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c,h,f,u,p,_,g,m)}set(t,e,i,n,r,o,a,l,c,h,f,u,p,_,g,m){const d=this.elements;return d[0]=t,d[4]=e,d[8]=i,d[12]=n,d[1]=r,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=f,d[14]=u,d[3]=p,d[7]=_,d[11]=g,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ht().fromArray(this.elements)}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){const e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,i=t.elements,n=1/ds.setFromMatrixColumn(t,0).length(),r=1/ds.setFromMatrixColumn(t,1).length(),o=1/ds.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,i=t.x,n=t.y,r=t.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){const u=o*h,p=o*f,_=a*h,g=a*f;e[0]=l*h,e[4]=-l*f,e[8]=c,e[1]=p+_*c,e[5]=u-g*c,e[9]=-a*l,e[2]=g-u*c,e[6]=_+p*c,e[10]=o*l}else if(t.order==="YXZ"){const u=l*h,p=l*f,_=c*h,g=c*f;e[0]=u+g*a,e[4]=_*a-p,e[8]=o*c,e[1]=o*f,e[5]=o*h,e[9]=-a,e[2]=p*a-_,e[6]=g+u*a,e[10]=o*l}else if(t.order==="ZXY"){const u=l*h,p=l*f,_=c*h,g=c*f;e[0]=u-g*a,e[4]=-o*f,e[8]=_+p*a,e[1]=p+_*a,e[5]=o*h,e[9]=g-u*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const u=o*h,p=o*f,_=a*h,g=a*f;e[0]=l*h,e[4]=_*c-p,e[8]=u*c+g,e[1]=l*f,e[5]=g*c+u,e[9]=p*c-_,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const u=o*l,p=o*c,_=a*l,g=a*c;e[0]=l*h,e[4]=g-u*f,e[8]=_*f+p,e[1]=f,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=p*f+_,e[10]=u-g*f}else if(t.order==="XZY"){const u=o*l,p=o*c,_=a*l,g=a*c;e[0]=l*h,e[4]=-f,e[8]=c*h,e[1]=u*f+g,e[5]=o*h,e[9]=p*f-_,e[2]=_*f-p,e[6]=a*h,e[10]=g*f+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Lm,t,Dm)}lookAt(t,e,i){const n=this.elements;return mi.subVectors(t,e),mi.lengthSq()===0&&(mi.z=1),mi.normalize(),gn.crossVectors(i,mi),gn.lengthSq()===0&&(Math.abs(i.z)===1?mi.x+=1e-4:mi.z+=1e-4,mi.normalize(),gn.crossVectors(i,mi)),gn.normalize(),Kr.crossVectors(mi,gn),n[0]=gn.x,n[4]=Kr.x,n[8]=mi.x,n[1]=gn.y,n[5]=Kr.y,n[9]=mi.y,n[2]=gn.z,n[6]=Kr.z,n[10]=mi.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],f=i[5],u=i[9],p=i[13],_=i[2],g=i[6],m=i[10],d=i[14],M=i[3],x=i[7],y=i[11],C=i[15],T=n[0],b=n[4],L=n[8],O=n[12],v=n[1],S=n[5],P=n[9],U=n[13],G=n[2],X=n[6],B=n[10],$=n[14],V=n[3],Q=n[7],nt=n[11],mt=n[15];return r[0]=o*T+a*v+l*G+c*V,r[4]=o*b+a*S+l*X+c*Q,r[8]=o*L+a*P+l*B+c*nt,r[12]=o*O+a*U+l*$+c*mt,r[1]=h*T+f*v+u*G+p*V,r[5]=h*b+f*S+u*X+p*Q,r[9]=h*L+f*P+u*B+p*nt,r[13]=h*O+f*U+u*$+p*mt,r[2]=_*T+g*v+m*G+d*V,r[6]=_*b+g*S+m*X+d*Q,r[10]=_*L+g*P+m*B+d*nt,r[14]=_*O+g*U+m*$+d*mt,r[3]=M*T+x*v+y*G+C*V,r[7]=M*b+x*S+y*X+C*Q,r[11]=M*L+x*P+y*B+C*nt,r[15]=M*O+x*U+y*$+C*mt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[4],n=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],f=t[6],u=t[10],p=t[14],_=t[3],g=t[7],m=t[11],d=t[15];return _*(+r*l*f-n*c*f-r*a*u+i*c*u+n*a*p-i*l*p)+g*(+e*l*p-e*c*u+r*o*u-n*o*p+n*c*h-r*l*h)+m*(+e*c*f-e*a*p-r*o*f+i*o*p+r*a*h-i*c*h)+d*(-n*a*h-e*l*f+e*a*u+n*o*f-i*o*u+i*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){const n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){const t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],f=t[9],u=t[10],p=t[11],_=t[12],g=t[13],m=t[14],d=t[15],M=f*m*c-g*u*c+g*l*p-a*m*p-f*l*d+a*u*d,x=_*u*c-h*m*c-_*l*p+o*m*p+h*l*d-o*u*d,y=h*g*c-_*f*c+_*a*p-o*g*p-h*a*d+o*f*d,C=_*f*l-h*g*l-_*a*u+o*g*u+h*a*m-o*f*m,T=e*M+i*x+n*y+r*C;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const b=1/T;return t[0]=M*b,t[1]=(g*u*r-f*m*r-g*n*p+i*m*p+f*n*d-i*u*d)*b,t[2]=(a*m*r-g*l*r+g*n*c-i*m*c-a*n*d+i*l*d)*b,t[3]=(f*l*r-a*u*r-f*n*c+i*u*c+a*n*p-i*l*p)*b,t[4]=x*b,t[5]=(h*m*r-_*u*r+_*n*p-e*m*p-h*n*d+e*u*d)*b,t[6]=(_*l*r-o*m*r-_*n*c+e*m*c+o*n*d-e*l*d)*b,t[7]=(o*u*r-h*l*r+h*n*c-e*u*c-o*n*p+e*l*p)*b,t[8]=y*b,t[9]=(_*f*r-h*g*r-_*i*p+e*g*p+h*i*d-e*f*d)*b,t[10]=(o*g*r-_*a*r+_*i*c-e*g*c-o*i*d+e*a*d)*b,t[11]=(h*a*r-o*f*r-h*i*c+e*f*c+o*i*p-e*a*p)*b,t[12]=C*b,t[13]=(h*g*n-_*f*n+_*i*u-e*g*u-h*i*m+e*f*m)*b,t[14]=(_*a*n-o*g*n-_*i*l+e*g*l+o*i*m-e*a*m)*b,t[15]=(o*f*n-h*a*n+h*i*l-e*f*l-o*i*u+e*a*u)*b,this}scale(t){const e=this.elements,i=t.x,n=t.y,r=t.z;return e[0]*=i,e[4]*=n,e[8]*=r,e[1]*=i,e[5]*=n,e[9]*=r,e[2]*=i,e[6]*=n,e[10]*=r,e[3]*=i,e[7]*=n,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const i=Math.cos(e),n=Math.sin(e),r=1-i,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-n*l,c*l+n*a,0,c*a+n*l,h*a+i,h*l-n*o,0,c*l-n*a,h*l+n*o,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,r,o){return this.set(1,i,r,0,t,1,o,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){const n=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,f=a+a,u=r*c,p=r*h,_=r*f,g=o*h,m=o*f,d=a*f,M=l*c,x=l*h,y=l*f,C=i.x,T=i.y,b=i.z;return n[0]=(1-(g+d))*C,n[1]=(p+y)*C,n[2]=(_-x)*C,n[3]=0,n[4]=(p-y)*T,n[5]=(1-(u+d))*T,n[6]=(m+M)*T,n[7]=0,n[8]=(_+x)*b,n[9]=(m-M)*b,n[10]=(1-(u+g))*b,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){const n=this.elements;let r=ds.set(n[0],n[1],n[2]).length();const o=ds.set(n[4],n[5],n[6]).length(),a=ds.set(n[8],n[9],n[10]).length();this.determinant()<0&&(r=-r),t.x=n[12],t.y=n[13],t.z=n[14],Pi.copy(this);const c=1/r,h=1/o,f=1/a;return Pi.elements[0]*=c,Pi.elements[1]*=c,Pi.elements[2]*=c,Pi.elements[4]*=h,Pi.elements[5]*=h,Pi.elements[6]*=h,Pi.elements[8]*=f,Pi.elements[9]*=f,Pi.elements[10]*=f,e.setFromRotationMatrix(Pi),i.x=r,i.y=o,i.z=a,this}makePerspective(t,e,i,n,r,o,a=cn){const l=this.elements,c=2*r/(e-t),h=2*r/(i-n),f=(e+t)/(e-t),u=(i+n)/(i-n);let p,_;if(a===cn)p=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===ea)p=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,i,n,r,o,a=cn){const l=this.elements,c=1/(e-t),h=1/(i-n),f=1/(o-r),u=(e+t)*c,p=(i+n)*h;let _,g;if(a===cn)_=(o+r)*f,g=-2*f;else if(a===ea)_=r*f,g=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=g,l[14]=-_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}}const ds=new A,Pi=new Ht,Lm=new A(0,0,0),Dm=new A(1,1,1),gn=new A,Kr=new A,mi=new A,Rh=new Ht,Ch=new Ai;class bi{constructor(t=0,e=0,i=0,n=bi.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){const n=t.elements,r=n[0],o=n[4],a=n[8],l=n[1],c=n[5],h=n[9],f=n[2],u=n[6],p=n[10];switch(e){case"XYZ":this._y=Math.asin(qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-qe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-qe(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(qe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Rh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Rh,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Ch.setFromEuler(this),this.setFromQuaternion(Ch,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}bi.DEFAULT_ORDER="XYZ";class yd{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Im=0;const Ph=new A,ps=new Ai,Qi=new Ht,Zr=new A,Js=new A,Um=new A,Nm=new Ai,Lh=new A(1,0,0),Dh=new A(0,1,0),Ih=new A(0,0,1),Uh={type:"added"},Fm={type:"removed"},ms={type:"childadded",child:null},Pa={type:"childremoved",child:null};class Ae extends Vs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Im++}),this.uuid=Ws(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ae.DEFAULT_UP.clone();const t=new A,e=new bi,i=new Ai,n=new A(1,1,1);function r(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Ht},normalMatrix:{value:new Bt}}),this.matrix=new Ht,this.matrixWorld=new Ht,this.matrixAutoUpdate=Ae.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ae.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new yd,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ps.setFromAxisAngle(t,e),this.quaternion.multiply(ps),this}rotateOnWorldAxis(t,e){return ps.setFromAxisAngle(t,e),this.quaternion.premultiply(ps),this}rotateX(t){return this.rotateOnAxis(Lh,t)}rotateY(t){return this.rotateOnAxis(Dh,t)}rotateZ(t){return this.rotateOnAxis(Ih,t)}translateOnAxis(t,e){return Ph.copy(t).applyQuaternion(this.quaternion),this.position.add(Ph.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Lh,t)}translateY(t){return this.translateOnAxis(Dh,t)}translateZ(t){return this.translateOnAxis(Ih,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Qi.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Zr.copy(t):Zr.set(t,e,i);const n=this.parent;this.updateWorldMatrix(!0,!1),Js.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Qi.lookAt(Js,Zr,this.up):Qi.lookAt(Zr,Js,this.up),this.quaternion.setFromRotationMatrix(Qi),n&&(Qi.extractRotation(n.matrixWorld),ps.setFromRotationMatrix(Qi),this.quaternion.premultiply(ps.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Uh),ms.child=t,this.dispatchEvent(ms),ms.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Fm),Pa.child=t,this.dispatchEvent(Pa),Pa.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Qi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Qi.multiply(t.parent.matrixWorld)),t.applyMatrix4(Qi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Uh),ms.child=t,this.dispatchEvent(ms),ms.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){const o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);const n=this.children;for(let r=0,o=n.length;r<o;r++)n[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Js,t,Um),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Js,Nm,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e){const i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const n=this.children;for(let r=0,o=n.length;r<o;r++)n[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const n={};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.visibility=this._visibility,n.active=this._active,n.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.geometryCount=this._geometryCount,n.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere={center:n.boundingSphere.center.toArray(),radius:n.boundingSphere.radius}),this.boundingBox!==null&&(n.boundingBox={min:n.boundingBox.min.toArray(),max:n.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));n.material=a}else n.material=r(t.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];n.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),f=o(t.shapes),u=o(t.skeletons),p=o(t.animations),_=o(t.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),f.length>0&&(i.shapes=f),u.length>0&&(i.skeletons=u),p.length>0&&(i.animations=p),_.length>0&&(i.nodes=_)}return i.object=n,i;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){const n=t.children[i];this.add(n.clone())}return this}}Ae.DEFAULT_UP=new A(0,1,0);Ae.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ae.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Li=new A,tn=new A,La=new A,en=new A,gs=new A,_s=new A,Nh=new A,Da=new A,Ia=new A,Ua=new A,Na=new we,Fa=new we,Oa=new we;class Oi{constructor(t=new A,e=new A,i=new A){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),Li.subVectors(t,e),n.cross(Li);const r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(t,e,i,n,r){Li.subVectors(n,e),tn.subVectors(i,e),La.subVectors(t,e);const o=Li.dot(Li),a=Li.dot(tn),l=Li.dot(La),c=tn.dot(tn),h=tn.dot(La),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;const u=1/f,p=(c*l-a*h)*u,_=(o*h-a*l)*u;return r.set(1-p-_,_,p)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,en)===null?!1:en.x>=0&&en.y>=0&&en.x+en.y<=1}static getInterpolation(t,e,i,n,r,o,a,l){return this.getBarycoord(t,e,i,n,en)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,en.x),l.addScaledVector(o,en.y),l.addScaledVector(a,en.z),l)}static getInterpolatedAttribute(t,e,i,n,r,o){return Na.setScalar(0),Fa.setScalar(0),Oa.setScalar(0),Na.fromBufferAttribute(t,e),Fa.fromBufferAttribute(t,i),Oa.fromBufferAttribute(t,n),o.setScalar(0),o.addScaledVector(Na,r.x),o.addScaledVector(Fa,r.y),o.addScaledVector(Oa,r.z),o}static isFrontFacing(t,e,i,n){return Li.subVectors(i,e),tn.subVectors(t,e),Li.cross(tn).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Li.subVectors(this.c,this.b),tn.subVectors(this.a,this.b),Li.cross(tn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Oi.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Oi.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,r){return Oi.getInterpolation(t,this.a,this.b,this.c,e,i,n,r)}containsPoint(t){return Oi.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Oi.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const i=this.a,n=this.b,r=this.c;let o,a;gs.subVectors(n,i),_s.subVectors(r,i),Da.subVectors(t,i);const l=gs.dot(Da),c=_s.dot(Da);if(l<=0&&c<=0)return e.copy(i);Ia.subVectors(t,n);const h=gs.dot(Ia),f=_s.dot(Ia);if(h>=0&&f<=h)return e.copy(n);const u=l*f-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(i).addScaledVector(gs,o);Ua.subVectors(t,r);const p=gs.dot(Ua),_=_s.dot(Ua);if(_>=0&&p<=_)return e.copy(r);const g=p*c-l*_;if(g<=0&&c>=0&&_<=0)return a=c/(c-_),e.copy(i).addScaledVector(_s,a);const m=h*_-p*f;if(m<=0&&f-h>=0&&p-_>=0)return Nh.subVectors(r,n),a=(f-h)/(f-h+(p-_)),e.copy(n).addScaledVector(Nh,a);const d=1/(m+g+u);return o=g*d,a=u*d,e.copy(i).addScaledVector(gs,o).addScaledVector(_s,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Ed={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_n={h:0,s:0,l:0},jr={h:0,s:0,l:0};function za(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}class St{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){const n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ui){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ie.toWorkingColorSpace(this,e),this}setRGB(t,e,i,n=ie.workingColorSpace){return this.r=t,this.g=e,this.b=i,ie.toWorkingColorSpace(this,n),this}setHSL(t,e,i,n=ie.workingColorSpace){if(t=$c(t,1),e=qe(e,0,1),i=qe(i,0,1),e===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+e):i+e-i*e,o=2*i-r;this.r=za(o,r,t+1/3),this.g=za(o,r,t),this.b=za(o,r,t-1/3)}return ie.toWorkingColorSpace(this,n),this}setStyle(t,e=ui){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=n[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ui){const i=Ed[t.toLowerCase()];return i!==void 0?this.setHex(i,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ns(t.r),this.g=Ns(t.g),this.b=Ns(t.b),this}copyLinearToSRGB(t){return this.r=ya(t.r),this.g=ya(t.g),this.b=ya(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ui){return ie.fromWorkingColorSpace(Ze.copy(this),t),Math.round(qe(Ze.r*255,0,255))*65536+Math.round(qe(Ze.g*255,0,255))*256+Math.round(qe(Ze.b*255,0,255))}getHexString(t=ui){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ie.workingColorSpace){ie.fromWorkingColorSpace(Ze.copy(this),e);const i=Ze.r,n=Ze.g,r=Ze.b,o=Math.max(i,n,r),a=Math.min(i,n,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const f=o-a;switch(c=h<=.5?f/(o+a):f/(2-o-a),o){case i:l=(n-r)/f+(n<r?6:0);break;case n:l=(r-i)/f+2;break;case r:l=(i-n)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ie.workingColorSpace){return ie.fromWorkingColorSpace(Ze.copy(this),e),t.r=Ze.r,t.g=Ze.g,t.b=Ze.b,t}getStyle(t=ui){ie.fromWorkingColorSpace(Ze.copy(this),t);const e=Ze.r,i=Ze.g,n=Ze.b;return t!==ui?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(_n),this.setHSL(_n.h+t,_n.s+e,_n.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(_n),t.getHSL(jr);const i=yr(_n.h,jr.h,e),n=yr(_n.s,jr.s,e),r=yr(_n.l,jr.l,e);return this.setHSL(i,n,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,i=this.g,n=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*n,this.g=r[1]*e+r[4]*i+r[7]*n,this.b=r[2]*e+r[5]*i+r[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ze=new St;St.NAMES=Ed;let Om=0;class un extends Vs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Om++}),this.uuid=Ws(),this.name="",this.type="Material",this.blending=Is,this.side=Cn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ll,this.blendDst=Dl,this.blendEquation=Ni,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new St(0,0,0),this.blendAlpha=0,this.depthFunc=zs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=xh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ls,this.stencilZFail=ls,this.stencilZPass=ls,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const i=t[e];if(i===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const n=this[e];if(n===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Is&&(i.blending=this.blending),this.side!==Cn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ll&&(i.blendSrc=this.blendSrc),this.blendDst!==Dl&&(i.blendDst=this.blendDst),this.blendEquation!==Ni&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==zs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==xh&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ls&&(i.stencilFail=this.stencilFail),this.stencilZFail!==ls&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==ls&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=n(t.textures),o=n(t.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let i=null;if(e!==null){const n=e.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class $e extends un{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new St(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bi,this.combine=Oc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Pe=new A,Jr=new lt;class xe{constructor(t,e,i=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Sh,this.updateRanges=[],this.gpuType=qi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Jr.fromBufferAttribute(this,e),Jr.applyMatrix3(t),this.setXY(e,Jr.x,Jr.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Pe.fromBufferAttribute(this,e),Pe.applyMatrix3(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Pe.fromBufferAttribute(this,e),Pe.applyMatrix4(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Pe.fromBufferAttribute(this,e),Pe.applyNormalMatrix(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Pe.fromBufferAttribute(this,e),Pe.transformDirection(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Ps(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=si(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Ps(e,this.array)),e}setX(t,e){return this.normalized&&(e=si(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Ps(e,this.array)),e}setY(t,e){return this.normalized&&(e=si(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Ps(e,this.array)),e}setZ(t,e){return this.normalized&&(e=si(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Ps(e,this.array)),e}setW(t,e){return this.normalized&&(e=si(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=si(e,this.array),i=si(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=si(e,this.array),i=si(i,this.array),n=si(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t*=this.itemSize,this.normalized&&(e=si(e,this.array),i=si(i,this.array),n=si(n,this.array),r=si(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Sh&&(t.usage=this.usage),t}}class wd extends xe{constructor(t,e,i){super(new Uint16Array(t),e,i)}}class Td extends xe{constructor(t,e,i){super(new Uint32Array(t),e,i)}}class fe extends xe{constructor(t,e,i){super(new Float32Array(t),e,i)}}let zm=0;const xi=new Ht,Ba=new Ae,vs=new A,gi=new Dn,Qs=new Dn,ze=new A;class Ue extends Vs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:zm++}),this.uuid=Ws(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(vd(t)?Td:wd)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Bt().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}const n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return xi.makeRotationFromQuaternion(t),this.applyMatrix4(xi),this}rotateX(t){return xi.makeRotationX(t),this.applyMatrix4(xi),this}rotateY(t){return xi.makeRotationY(t),this.applyMatrix4(xi),this}rotateZ(t){return xi.makeRotationZ(t),this.applyMatrix4(xi),this}translate(t,e,i){return xi.makeTranslation(t,e,i),this.applyMatrix4(xi),this}scale(t,e,i){return xi.makeScale(t,e,i),this.applyMatrix4(xi),this}lookAt(t){return Ba.lookAt(t),Ba.updateMatrix(),this.applyMatrix4(Ba.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vs).negate(),this.translate(vs.x,vs.y,vs.z),this}setFromPoints(t){const e=[];for(let i=0,n=t.length;i<n;i++){const r=t[i];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new fe(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Dn);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){const r=e[i];gi.setFromBufferAttribute(r),this.morphTargetsRelative?(ze.addVectors(this.boundingBox.min,gi.min),this.boundingBox.expandByPoint(ze),ze.addVectors(this.boundingBox.max,gi.max),this.boundingBox.expandByPoint(ze)):(this.boundingBox.expandByPoint(gi.min),this.boundingBox.expandByPoint(gi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Xs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new A,1/0);return}if(t){const i=this.boundingSphere.center;if(gi.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];Qs.setFromBufferAttribute(a),this.morphTargetsRelative?(ze.addVectors(gi.min,Qs.min),gi.expandByPoint(ze),ze.addVectors(gi.max,Qs.max),gi.expandByPoint(ze)):(gi.expandByPoint(Qs.min),gi.expandByPoint(Qs.max))}gi.getCenter(i);let n=0;for(let r=0,o=t.count;r<o;r++)ze.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(ze));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)ze.fromBufferAttribute(a,c),l&&(vs.fromBufferAttribute(t,c),ze.add(vs)),n=Math.max(n,i.distanceToSquared(ze))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.position,n=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new xe(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let L=0;L<i.count;L++)a[L]=new A,l[L]=new A;const c=new A,h=new A,f=new A,u=new lt,p=new lt,_=new lt,g=new A,m=new A;function d(L,O,v){c.fromBufferAttribute(i,L),h.fromBufferAttribute(i,O),f.fromBufferAttribute(i,v),u.fromBufferAttribute(r,L),p.fromBufferAttribute(r,O),_.fromBufferAttribute(r,v),h.sub(c),f.sub(c),p.sub(u),_.sub(u);const S=1/(p.x*_.y-_.x*p.y);isFinite(S)&&(g.copy(h).multiplyScalar(_.y).addScaledVector(f,-p.y).multiplyScalar(S),m.copy(f).multiplyScalar(p.x).addScaledVector(h,-_.x).multiplyScalar(S),a[L].add(g),a[O].add(g),a[v].add(g),l[L].add(m),l[O].add(m),l[v].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let L=0,O=M.length;L<O;++L){const v=M[L],S=v.start,P=v.count;for(let U=S,G=S+P;U<G;U+=3)d(t.getX(U+0),t.getX(U+1),t.getX(U+2))}const x=new A,y=new A,C=new A,T=new A;function b(L){C.fromBufferAttribute(n,L),T.copy(C);const O=a[L];x.copy(O),x.sub(C.multiplyScalar(C.dot(O))).normalize(),y.crossVectors(T,O);const S=y.dot(l[L])<0?-1:1;o.setXYZW(L,x.x,x.y,x.z,S)}for(let L=0,O=M.length;L<O;++L){const v=M[L],S=v.start,P=v.count;for(let U=S,G=S+P;U<G;U+=3)b(t.getX(U+0)),b(t.getX(U+1)),b(t.getX(U+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new xe(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let u=0,p=i.count;u<p;u++)i.setXYZ(u,0,0,0);const n=new A,r=new A,o=new A,a=new A,l=new A,c=new A,h=new A,f=new A;if(t)for(let u=0,p=t.count;u<p;u+=3){const _=t.getX(u+0),g=t.getX(u+1),m=t.getX(u+2);n.fromBufferAttribute(e,_),r.fromBufferAttribute(e,g),o.fromBufferAttribute(e,m),h.subVectors(o,r),f.subVectors(n,r),h.cross(f),a.fromBufferAttribute(i,_),l.fromBufferAttribute(i,g),c.fromBufferAttribute(i,m),a.add(h),l.add(h),c.add(h),i.setXYZ(_,a.x,a.y,a.z),i.setXYZ(g,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,p=e.count;u<p;u+=3)n.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),f.subVectors(n,r),h.cross(f),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)ze.fromBufferAttribute(t,e),ze.normalize(),t.setXYZ(e,ze.x,ze.y,ze.z)}toNonIndexed(){function t(a,l){const c=a.array,h=a.itemSize,f=a.normalized,u=new c.constructor(l.length*h);let p=0,_=0;for(let g=0,m=l.length;g<m;g++){a.isInterleavedBufferAttribute?p=l[g]*a.data.stride+a.offset:p=l[g]*h;for(let d=0;d<h;d++)u[_++]=c[p++]}return new xe(u,h,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Ue,i=this.index.array,n=this.attributes;for(const a in n){const l=n[a],c=t(l,i);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,f=c.length;h<f;h++){const u=c[h],p=t(u,i);l.push(p)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const i=this.attributes;for(const l in i){const c=i[l];t.data.attributes[l]=c.toJSON(t.data)}const n={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let f=0,u=c.length;f<u;f++){const p=c[f];h.push(p.toJSON(t.data))}h.length>0&&(n[l]=h,r=!0)}r&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const i=t.index;i!==null&&this.setIndex(i.clone(e));const n=t.attributes;for(const c in n){const h=n[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],f=r[c];for(let u=0,p=f.length;u<p;u++)h.push(f[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,h=o.length;c<h;c++){const f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Fh=new Ht,Fn=new Sd,Qr=new Xs,Oh=new A,to=new A,eo=new A,io=new A,ka=new A,no=new A,zh=new A,so=new A;class Tt extends Ae{constructor(t=new Ue,e=new $e){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){const a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(n,t);const a=this.morphTargetInfluences;if(r&&a){no.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],f=r[l];h!==0&&(ka.fromBufferAttribute(f,t),o?no.addScaledVector(ka,h):no.addScaledVector(ka.sub(e),h))}e.add(no)}return e}raycast(t,e){const i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Qr.copy(i.boundingSphere),Qr.applyMatrix4(r),Fn.copy(t.ray).recast(t.near),!(Qr.containsPoint(Fn.origin)===!1&&(Fn.intersectSphere(Qr,Oh)===null||Fn.origin.distanceToSquared(Oh)>(t.far-t.near)**2))&&(Fh.copy(r).invert(),Fn.copy(t.ray).applyMatrix4(Fh),!(i.boundingBox!==null&&Fn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,Fn)))}_computeIntersections(t,e,i){let n;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,u=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,g=u.length;_<g;_++){const m=u[_],d=o[m.materialIndex],M=Math.max(m.start,p.start),x=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let y=M,C=x;y<C;y+=3){const T=a.getX(y),b=a.getX(y+1),L=a.getX(y+2);n=ro(this,d,t,i,c,h,f,T,b,L),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{const _=Math.max(0,p.start),g=Math.min(a.count,p.start+p.count);for(let m=_,d=g;m<d;m+=3){const M=a.getX(m),x=a.getX(m+1),y=a.getX(m+2);n=ro(this,o,t,i,c,h,f,M,x,y),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,g=u.length;_<g;_++){const m=u[_],d=o[m.materialIndex],M=Math.max(m.start,p.start),x=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let y=M,C=x;y<C;y+=3){const T=y,b=y+1,L=y+2;n=ro(this,d,t,i,c,h,f,T,b,L),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{const _=Math.max(0,p.start),g=Math.min(l.count,p.start+p.count);for(let m=_,d=g;m<d;m+=3){const M=m,x=m+1,y=m+2;n=ro(this,o,t,i,c,h,f,M,x,y),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}}}function Bm(s,t,e,i,n,r,o,a){let l;if(t.side===ei?l=i.intersectTriangle(o,r,n,!0,a):l=i.intersectTriangle(n,r,o,t.side===Cn,a),l===null)return null;so.copy(a),so.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(so);return c<e.near||c>e.far?null:{distance:c,point:so.clone(),object:s}}function ro(s,t,e,i,n,r,o,a,l,c){s.getVertexPosition(a,to),s.getVertexPosition(l,eo),s.getVertexPosition(c,io);const h=Bm(s,t,e,i,to,eo,io,zh);if(h){const f=new A;Oi.getBarycoord(zh,to,eo,io,f),n&&(h.uv=Oi.getInterpolatedAttribute(n,a,l,c,f,new lt)),r&&(h.uv1=Oi.getInterpolatedAttribute(r,a,l,c,f,new lt)),o&&(h.normal=Oi.getInterpolatedAttribute(o,a,l,c,f,new A),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:l,c,normal:new A,materialIndex:0};Oi.getNormal(to,eo,io,u.normal),h.face=u,h.barycoord=f}return h}class Qe extends Ue{constructor(t=1,e=1,i=1,n=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:r,depthSegments:o};const a=this;n=Math.floor(n),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],f=[];let u=0,p=0;_("z","y","x",-1,-1,i,e,t,o,r,0),_("z","y","x",1,-1,i,e,-t,o,r,1),_("x","z","y",1,1,t,i,e,n,o,2),_("x","z","y",1,-1,t,i,-e,n,o,3),_("x","y","z",1,-1,t,e,i,n,r,4),_("x","y","z",-1,-1,t,e,-i,n,r,5),this.setIndex(l),this.setAttribute("position",new fe(c,3)),this.setAttribute("normal",new fe(h,3)),this.setAttribute("uv",new fe(f,2));function _(g,m,d,M,x,y,C,T,b,L,O){const v=y/b,S=C/L,P=y/2,U=C/2,G=T/2,X=b+1,B=L+1;let $=0,V=0;const Q=new A;for(let nt=0;nt<B;nt++){const mt=nt*S-U;for(let Gt=0;Gt<X;Gt++){const Zt=Gt*v-P;Q[g]=Zt*M,Q[m]=mt*x,Q[d]=G,c.push(Q.x,Q.y,Q.z),Q[g]=0,Q[m]=0,Q[d]=T>0?1:-1,h.push(Q.x,Q.y,Q.z),f.push(Gt/b),f.push(1-nt/L),$+=1}}for(let nt=0;nt<L;nt++)for(let mt=0;mt<b;mt++){const Gt=u+mt+X*nt,Zt=u+mt+X*(nt+1),Y=u+(mt+1)+X*(nt+1),tt=u+(mt+1)+X*nt;l.push(Gt,Zt,tt),l.push(Zt,Y,tt),V+=6}a.addGroup(p,V,O),p+=V,u+=$}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Qe(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Hs(s){const t={};for(const e in s){t[e]={};for(const i in s[e]){const n=s[e][i];n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)?n.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone():Array.isArray(n)?t[e][i]=n.slice():t[e][i]=n}}return t}function ri(s){const t={};for(let e=0;e<s.length;e++){const i=Hs(s[e]);for(const n in i)t[n]=i[n]}return t}function km(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function bd(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ie.workingColorSpace}const wi={clone:Hs,merge:ri};var Hm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Gm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ge extends un{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Hm,this.fragmentShader=Gm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Hs(t.uniforms),this.uniformsGroups=km(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const n in this.uniforms){const o=this.uniforms[n].value;o&&o.isTexture?e.uniforms[n]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[n]={type:"m4",value:o.toArray()}:e.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const i={};for(const n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}}class Ad extends Ae{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ht,this.projectionMatrix=new Ht,this.projectionMatrixInverse=new Ht,this.coordinateSystem=cn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const vn=new A,Bh=new lt,kh=new lt;class yi extends Ad{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Cr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Sr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Cr*2*Math.atan(Math.tan(Sr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){vn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(vn.x,vn.y).multiplyScalar(-t/vn.z),vn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(vn.x,vn.y).multiplyScalar(-t/vn.z)}getViewSize(t,e){return this.getViewBounds(t,Bh,kh),e.subVectors(kh,Bh)}setViewOffset(t,e,i,n,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Sr*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,r=-.5*n;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*n/l,e-=o.offsetY*i/c,n*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,e,e-i,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ms=-90,xs=1;class Vm extends Ae{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const n=new yi(Ms,xs,t,e);n.layers=this.layers,this.add(n);const r=new yi(Ms,xs,t,e);r.layers=this.layers,this.add(r);const o=new yi(Ms,xs,t,e);o.layers=this.layers,this.add(o);const a=new yi(Ms,xs,t,e);a.layers=this.layers,this.add(a);const l=new yi(Ms,xs,t,e);l.layers=this.layers,this.add(l);const c=new yi(Ms,xs,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[i,n,r,o,a,l]=e;for(const c of e)this.remove(c);if(t===cn)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ea)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,f=t.getRenderTarget(),u=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;const g=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,t.setRenderTarget(i,0,n),t.render(e,r),t.setRenderTarget(i,1,n),t.render(e,o),t.setRenderTarget(i,2,n),t.render(e,a),t.setRenderTarget(i,3,n),t.render(e,l),t.setRenderTarget(i,4,n),t.render(e,c),i.texture.generateMipmaps=g,t.setRenderTarget(i,5,n),t.render(e,h),t.setRenderTarget(f,u,p),t.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class Rd extends ii{constructor(t,e,i,n,r,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Bs,super(t,e,i,n,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Wm extends vi{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new Rd(n,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Fi}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},n=new Qe(5,5,5),r=new ge({name:"CubemapFromEquirect",uniforms:Hs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:ei,blending:Xe});r.uniforms.tEquirect.value=e;const o=new Tt(n,r),a=e.minFilter;return e.minFilter===bn&&(e.minFilter=Fi),new Vm(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,i,n){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,n);t.setRenderTarget(r)}}const Ha=new A,Xm=new A,qm=new Bt;class Gn{constructor(t=new A(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){const n=Ha.subVectors(i,e).cross(Xm.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const i=t.delta(Ha),n=this.normal.dot(i);if(n===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/n;return r<0||r>1?null:e.copy(t.start).addScaledVector(i,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const i=e||qm.getNormalMatrix(t),n=this.coplanarPoint(Ha).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const On=new Xs,oo=new A;class Kc{constructor(t=new Gn,e=new Gn,i=new Gn,n=new Gn,r=new Gn,o=new Gn){this.planes=[t,e,i,n,r,o]}set(t,e,i,n,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(n),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=cn){const i=this.planes,n=t.elements,r=n[0],o=n[1],a=n[2],l=n[3],c=n[4],h=n[5],f=n[6],u=n[7],p=n[8],_=n[9],g=n[10],m=n[11],d=n[12],M=n[13],x=n[14],y=n[15];if(i[0].setComponents(l-r,u-c,m-p,y-d).normalize(),i[1].setComponents(l+r,u+c,m+p,y+d).normalize(),i[2].setComponents(l+o,u+h,m+_,y+M).normalize(),i[3].setComponents(l-o,u-h,m-_,y-M).normalize(),i[4].setComponents(l-a,u-f,m-g,y-x).normalize(),e===cn)i[5].setComponents(l+a,u+f,m+g,y+x).normalize();else if(e===ea)i[5].setComponents(a,f,g,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),On.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),On.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(On)}intersectsSprite(t){return On.center.set(0,0,0),On.radius=.7071067811865476,On.applyMatrix4(t.matrixWorld),this.intersectsSphere(On)}intersectsSphere(t){const e=this.planes,i=t.center,n=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){const e=this.planes;for(let i=0;i<6;i++){const n=e[i];if(oo.x=n.normal.x>0?t.max.x:t.min.x,oo.y=n.normal.y>0?t.max.y:t.min.y,oo.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(oo)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Cd(){let s=null,t=!1,e=null,i=null;function n(r,o){e(r,o),i=s.requestAnimationFrame(n)}return{start:function(){t!==!0&&e!==null&&(i=s.requestAnimationFrame(n),t=!0)},stop:function(){s.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Ym(s){const t=new WeakMap;function e(a,l){const c=a.array,h=a.usage,f=c.byteLength,u=s.createBuffer();s.bindBuffer(l,u),s.bufferData(l,c,h),a.onUploadCallback();let p;if(c instanceof Float32Array)p=s.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=s.HALF_FLOAT:p=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=s.SHORT;else if(c instanceof Uint32Array)p=s.UNSIGNED_INT;else if(c instanceof Int32Array)p=s.INT;else if(c instanceof Int8Array)p=s.BYTE;else if(c instanceof Uint8Array)p=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function i(a,l,c){const h=l.array,f=l.updateRanges;if(s.bindBuffer(c,a),f.length===0)s.bufferSubData(c,0,h);else{f.sort((p,_)=>p.start-_.start);let u=0;for(let p=1;p<f.length;p++){const _=f[u],g=f[p];g.start<=_.start+_.count+1?_.count=Math.max(_.count,g.start+g.count-_.start):(++u,f[u]=g)}f.length=u+1;for(let p=0,_=f.length;p<_;p++){const g=f[p];s.bufferSubData(c,g.start*h.BYTES_PER_ELEMENT,h,g.start,g.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(s.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:n,remove:r,update:o}}class qs extends Ue{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};const r=t/2,o=e/2,a=Math.floor(i),l=Math.floor(n),c=a+1,h=l+1,f=t/a,u=e/l,p=[],_=[],g=[],m=[];for(let d=0;d<h;d++){const M=d*u-o;for(let x=0;x<c;x++){const y=x*f-r;_.push(y,-M,0),g.push(0,0,1),m.push(x/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let M=0;M<a;M++){const x=M+c*d,y=M+c*(d+1),C=M+1+c*(d+1),T=M+1+c*d;p.push(x,y,T),p.push(y,C,T)}this.setIndex(p),this.setAttribute("position",new fe(_,3)),this.setAttribute("normal",new fe(g,3)),this.setAttribute("uv",new fe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qs(t.width,t.height,t.widthSegments,t.heightSegments)}}var $m=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Km=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Zm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,jm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Jm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Qm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,t0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,e0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,i0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,n0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,s0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,r0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,o0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,a0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,l0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,c0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,h0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,u0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,f0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,d0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,p0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,m0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,g0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,_0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,v0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,M0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,x0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,S0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,y0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,E0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,w0="gl_FragColor = linearToOutputTexel( gl_FragColor );",T0=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,b0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,A0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,R0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,C0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,P0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,L0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,D0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,I0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,U0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,N0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,F0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,O0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,z0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,B0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,k0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,H0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,G0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,V0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,W0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,X0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,q0=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Y0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,$0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,K0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Z0=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,j0=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,J0=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Q0=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,tg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,eg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ig=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,ng=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,sg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,rg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,og=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ag=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,lg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,cg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,hg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ug=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,fg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,dg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,mg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,gg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,_g=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,vg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Mg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,xg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Sg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,yg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Eg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,wg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Tg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,bg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ag=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Rg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Cg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Pg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Lg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Dg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Ig=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ug=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ng=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Fg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Og=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,zg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Bg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,kg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Hg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Gg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Vg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Wg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Xg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,qg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Yg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,$g=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Zg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Jg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,t_=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,e_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,i_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,n_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,s_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,r_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,o_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,a_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,l_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,c_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,h_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,u_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,f_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,d_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,p_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,m_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,g_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,__=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,v_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,M_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,x_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,S_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,y_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,E_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,w_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,T_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,b_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Rt={alphahash_fragment:$m,alphahash_pars_fragment:Km,alphamap_fragment:Zm,alphamap_pars_fragment:jm,alphatest_fragment:Jm,alphatest_pars_fragment:Qm,aomap_fragment:t0,aomap_pars_fragment:e0,batching_pars_vertex:i0,batching_vertex:n0,begin_vertex:s0,beginnormal_vertex:r0,bsdfs:o0,iridescence_fragment:a0,bumpmap_pars_fragment:l0,clipping_planes_fragment:c0,clipping_planes_pars_fragment:h0,clipping_planes_pars_vertex:u0,clipping_planes_vertex:f0,color_fragment:d0,color_pars_fragment:p0,color_pars_vertex:m0,color_vertex:g0,common:_0,cube_uv_reflection_fragment:v0,defaultnormal_vertex:M0,displacementmap_pars_vertex:x0,displacementmap_vertex:S0,emissivemap_fragment:y0,emissivemap_pars_fragment:E0,colorspace_fragment:w0,colorspace_pars_fragment:T0,envmap_fragment:b0,envmap_common_pars_fragment:A0,envmap_pars_fragment:R0,envmap_pars_vertex:C0,envmap_physical_pars_fragment:k0,envmap_vertex:P0,fog_vertex:L0,fog_pars_vertex:D0,fog_fragment:I0,fog_pars_fragment:U0,gradientmap_pars_fragment:N0,lightmap_pars_fragment:F0,lights_lambert_fragment:O0,lights_lambert_pars_fragment:z0,lights_pars_begin:B0,lights_toon_fragment:H0,lights_toon_pars_fragment:G0,lights_phong_fragment:V0,lights_phong_pars_fragment:W0,lights_physical_fragment:X0,lights_physical_pars_fragment:q0,lights_fragment_begin:Y0,lights_fragment_maps:$0,lights_fragment_end:K0,logdepthbuf_fragment:Z0,logdepthbuf_pars_fragment:j0,logdepthbuf_pars_vertex:J0,logdepthbuf_vertex:Q0,map_fragment:tg,map_pars_fragment:eg,map_particle_fragment:ig,map_particle_pars_fragment:ng,metalnessmap_fragment:sg,metalnessmap_pars_fragment:rg,morphinstance_vertex:og,morphcolor_vertex:ag,morphnormal_vertex:lg,morphtarget_pars_vertex:cg,morphtarget_vertex:hg,normal_fragment_begin:ug,normal_fragment_maps:fg,normal_pars_fragment:dg,normal_pars_vertex:pg,normal_vertex:mg,normalmap_pars_fragment:gg,clearcoat_normal_fragment_begin:_g,clearcoat_normal_fragment_maps:vg,clearcoat_pars_fragment:Mg,iridescence_pars_fragment:xg,opaque_fragment:Sg,packing:yg,premultiplied_alpha_fragment:Eg,project_vertex:wg,dithering_fragment:Tg,dithering_pars_fragment:bg,roughnessmap_fragment:Ag,roughnessmap_pars_fragment:Rg,shadowmap_pars_fragment:Cg,shadowmap_pars_vertex:Pg,shadowmap_vertex:Lg,shadowmask_pars_fragment:Dg,skinbase_vertex:Ig,skinning_pars_vertex:Ug,skinning_vertex:Ng,skinnormal_vertex:Fg,specularmap_fragment:Og,specularmap_pars_fragment:zg,tonemapping_fragment:Bg,tonemapping_pars_fragment:kg,transmission_fragment:Hg,transmission_pars_fragment:Gg,uv_pars_fragment:Vg,uv_pars_vertex:Wg,uv_vertex:Xg,worldpos_vertex:qg,background_vert:Yg,background_frag:$g,backgroundCube_vert:Kg,backgroundCube_frag:Zg,cube_vert:jg,cube_frag:Jg,depth_vert:Qg,depth_frag:t_,distanceRGBA_vert:e_,distanceRGBA_frag:i_,equirect_vert:n_,equirect_frag:s_,linedashed_vert:r_,linedashed_frag:o_,meshbasic_vert:a_,meshbasic_frag:l_,meshlambert_vert:c_,meshlambert_frag:h_,meshmatcap_vert:u_,meshmatcap_frag:f_,meshnormal_vert:d_,meshnormal_frag:p_,meshphong_vert:m_,meshphong_frag:g_,meshphysical_vert:__,meshphysical_frag:v_,meshtoon_vert:M_,meshtoon_frag:x_,points_vert:S_,points_frag:y_,shadow_vert:E_,shadow_frag:w_,sprite_vert:T_,sprite_frag:b_},st={common:{diffuse:{value:new St(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Bt}},envmap:{envMap:{value:null},envMapRotation:{value:new Bt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Bt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Bt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Bt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Bt},normalScale:{value:new lt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Bt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Bt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Bt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Bt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new St(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new St(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0},uvTransform:{value:new Bt}},sprite:{diffuse:{value:new St(16777215)},opacity:{value:1},center:{value:new lt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}}},Vi={basic:{uniforms:ri([st.common,st.specularmap,st.envmap,st.aomap,st.lightmap,st.fog]),vertexShader:Rt.meshbasic_vert,fragmentShader:Rt.meshbasic_frag},lambert:{uniforms:ri([st.common,st.specularmap,st.envmap,st.aomap,st.lightmap,st.emissivemap,st.bumpmap,st.normalmap,st.displacementmap,st.fog,st.lights,{emissive:{value:new St(0)}}]),vertexShader:Rt.meshlambert_vert,fragmentShader:Rt.meshlambert_frag},phong:{uniforms:ri([st.common,st.specularmap,st.envmap,st.aomap,st.lightmap,st.emissivemap,st.bumpmap,st.normalmap,st.displacementmap,st.fog,st.lights,{emissive:{value:new St(0)},specular:{value:new St(1118481)},shininess:{value:30}}]),vertexShader:Rt.meshphong_vert,fragmentShader:Rt.meshphong_frag},standard:{uniforms:ri([st.common,st.envmap,st.aomap,st.lightmap,st.emissivemap,st.bumpmap,st.normalmap,st.displacementmap,st.roughnessmap,st.metalnessmap,st.fog,st.lights,{emissive:{value:new St(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Rt.meshphysical_vert,fragmentShader:Rt.meshphysical_frag},toon:{uniforms:ri([st.common,st.aomap,st.lightmap,st.emissivemap,st.bumpmap,st.normalmap,st.displacementmap,st.gradientmap,st.fog,st.lights,{emissive:{value:new St(0)}}]),vertexShader:Rt.meshtoon_vert,fragmentShader:Rt.meshtoon_frag},matcap:{uniforms:ri([st.common,st.bumpmap,st.normalmap,st.displacementmap,st.fog,{matcap:{value:null}}]),vertexShader:Rt.meshmatcap_vert,fragmentShader:Rt.meshmatcap_frag},points:{uniforms:ri([st.points,st.fog]),vertexShader:Rt.points_vert,fragmentShader:Rt.points_frag},dashed:{uniforms:ri([st.common,st.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Rt.linedashed_vert,fragmentShader:Rt.linedashed_frag},depth:{uniforms:ri([st.common,st.displacementmap]),vertexShader:Rt.depth_vert,fragmentShader:Rt.depth_frag},normal:{uniforms:ri([st.common,st.bumpmap,st.normalmap,st.displacementmap,{opacity:{value:1}}]),vertexShader:Rt.meshnormal_vert,fragmentShader:Rt.meshnormal_frag},sprite:{uniforms:ri([st.sprite,st.fog]),vertexShader:Rt.sprite_vert,fragmentShader:Rt.sprite_frag},background:{uniforms:{uvTransform:{value:new Bt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Rt.background_vert,fragmentShader:Rt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Bt}},vertexShader:Rt.backgroundCube_vert,fragmentShader:Rt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Rt.cube_vert,fragmentShader:Rt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Rt.equirect_vert,fragmentShader:Rt.equirect_frag},distanceRGBA:{uniforms:ri([st.common,st.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Rt.distanceRGBA_vert,fragmentShader:Rt.distanceRGBA_frag},shadow:{uniforms:ri([st.lights,st.fog,{color:{value:new St(0)},opacity:{value:1}}]),vertexShader:Rt.shadow_vert,fragmentShader:Rt.shadow_frag}};Vi.physical={uniforms:ri([Vi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Bt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Bt},clearcoatNormalScale:{value:new lt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Bt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Bt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Bt},sheen:{value:0},sheenColor:{value:new St(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Bt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Bt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Bt},transmissionSamplerSize:{value:new lt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Bt},attenuationDistance:{value:0},attenuationColor:{value:new St(0)},specularColor:{value:new St(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Bt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Bt},anisotropyVector:{value:new lt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Bt}}]),vertexShader:Rt.meshphysical_vert,fragmentShader:Rt.meshphysical_frag};const ao={r:0,b:0,g:0},zn=new bi,A_=new Ht;function R_(s,t,e,i,n,r,o){const a=new St(0);let l=r===!0?0:1,c,h,f=null,u=0,p=null;function _(M){let x=M.isScene===!0?M.background:null;return x&&x.isTexture&&(x=(M.backgroundBlurriness>0?e:t).get(x)),x}function g(M){let x=!1;const y=_(M);y===null?d(a,l):y&&y.isColor&&(d(y,1),x=!0);const C=s.xr.getEnvironmentBlendMode();C==="additive"?i.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(s.autoClear||x)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(M,x){const y=_(x);y&&(y.isCubeTexture||y.mapping===la)?(h===void 0&&(h=new Tt(new Qe(1,1,1),new ge({name:"BackgroundCubeMaterial",uniforms:Hs(Vi.backgroundCube.uniforms),vertexShader:Vi.backgroundCube.vertexShader,fragmentShader:Vi.backgroundCube.fragmentShader,side:ei,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,T,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(h)),zn.copy(x.backgroundRotation),zn.x*=-1,zn.y*=-1,zn.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(zn.y*=-1,zn.z*=-1),h.material.uniforms.envMap.value=y,h.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(A_.makeRotationFromEuler(zn)),h.material.toneMapped=ie.getTransfer(y.colorSpace)!==ue,(f!==y||u!==y.version||p!==s.toneMapping)&&(h.material.needsUpdate=!0,f=y,u=y.version,p=s.toneMapping),h.layers.enableAll(),M.unshift(h,h.geometry,h.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new Tt(new qs(2,2),new ge({name:"BackgroundMaterial",uniforms:Hs(Vi.background.uniforms),vertexShader:Vi.background.vertexShader,fragmentShader:Vi.background.fragmentShader,side:Cn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=ie.getTransfer(y.colorSpace)!==ue,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(f!==y||u!==y.version||p!==s.toneMapping)&&(c.material.needsUpdate=!0,f=y,u=y.version,p=s.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function d(M,x){M.getRGB(ao,bd(s)),i.buffers.color.setClear(ao.r,ao.g,ao.b,x,o)}return{getClearColor:function(){return a},setClearColor:function(M,x=1){a.set(M),l=x,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,d(a,l)},render:g,addToRenderList:m}}function C_(s,t){const e=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=u(null);let r=n,o=!1;function a(v,S,P,U,G){let X=!1;const B=f(U,P,S);r!==B&&(r=B,c(r.object)),X=p(v,U,P,G),X&&_(v,U,P,G),G!==null&&t.update(G,s.ELEMENT_ARRAY_BUFFER),(X||o)&&(o=!1,y(v,S,P,U),G!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(G).buffer))}function l(){return s.createVertexArray()}function c(v){return s.bindVertexArray(v)}function h(v){return s.deleteVertexArray(v)}function f(v,S,P){const U=P.wireframe===!0;let G=i[v.id];G===void 0&&(G={},i[v.id]=G);let X=G[S.id];X===void 0&&(X={},G[S.id]=X);let B=X[U];return B===void 0&&(B=u(l()),X[U]=B),B}function u(v){const S=[],P=[],U=[];for(let G=0;G<e;G++)S[G]=0,P[G]=0,U[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:S,enabledAttributes:P,attributeDivisors:U,object:v,attributes:{},index:null}}function p(v,S,P,U){const G=r.attributes,X=S.attributes;let B=0;const $=P.getAttributes();for(const V in $)if($[V].location>=0){const nt=G[V];let mt=X[V];if(mt===void 0&&(V==="instanceMatrix"&&v.instanceMatrix&&(mt=v.instanceMatrix),V==="instanceColor"&&v.instanceColor&&(mt=v.instanceColor)),nt===void 0||nt.attribute!==mt||mt&&nt.data!==mt.data)return!0;B++}return r.attributesNum!==B||r.index!==U}function _(v,S,P,U){const G={},X=S.attributes;let B=0;const $=P.getAttributes();for(const V in $)if($[V].location>=0){let nt=X[V];nt===void 0&&(V==="instanceMatrix"&&v.instanceMatrix&&(nt=v.instanceMatrix),V==="instanceColor"&&v.instanceColor&&(nt=v.instanceColor));const mt={};mt.attribute=nt,nt&&nt.data&&(mt.data=nt.data),G[V]=mt,B++}r.attributes=G,r.attributesNum=B,r.index=U}function g(){const v=r.newAttributes;for(let S=0,P=v.length;S<P;S++)v[S]=0}function m(v){d(v,0)}function d(v,S){const P=r.newAttributes,U=r.enabledAttributes,G=r.attributeDivisors;P[v]=1,U[v]===0&&(s.enableVertexAttribArray(v),U[v]=1),G[v]!==S&&(s.vertexAttribDivisor(v,S),G[v]=S)}function M(){const v=r.newAttributes,S=r.enabledAttributes;for(let P=0,U=S.length;P<U;P++)S[P]!==v[P]&&(s.disableVertexAttribArray(P),S[P]=0)}function x(v,S,P,U,G,X,B){B===!0?s.vertexAttribIPointer(v,S,P,G,X):s.vertexAttribPointer(v,S,P,U,G,X)}function y(v,S,P,U){g();const G=U.attributes,X=P.getAttributes(),B=S.defaultAttributeValues;for(const $ in X){const V=X[$];if(V.location>=0){let Q=G[$];if(Q===void 0&&($==="instanceMatrix"&&v.instanceMatrix&&(Q=v.instanceMatrix),$==="instanceColor"&&v.instanceColor&&(Q=v.instanceColor)),Q!==void 0){const nt=Q.normalized,mt=Q.itemSize,Gt=t.get(Q);if(Gt===void 0)continue;const Zt=Gt.buffer,Y=Gt.type,tt=Gt.bytesPerElement,gt=Y===s.INT||Y===s.UNSIGNED_INT||Q.gpuType===Bc;if(Q.isInterleavedBufferAttribute){const ot=Q.data,At=ot.stride,Et=Q.offset;if(ot.isInstancedInterleavedBuffer){for(let Ot=0;Ot<V.locationSize;Ot++)d(V.location+Ot,ot.meshPerAttribute);v.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let Ot=0;Ot<V.locationSize;Ot++)m(V.location+Ot);s.bindBuffer(s.ARRAY_BUFFER,Zt);for(let Ot=0;Ot<V.locationSize;Ot++)x(V.location+Ot,mt/V.locationSize,Y,nt,At*tt,(Et+mt/V.locationSize*Ot)*tt,gt)}else{if(Q.isInstancedBufferAttribute){for(let ot=0;ot<V.locationSize;ot++)d(V.location+ot,Q.meshPerAttribute);v.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let ot=0;ot<V.locationSize;ot++)m(V.location+ot);s.bindBuffer(s.ARRAY_BUFFER,Zt);for(let ot=0;ot<V.locationSize;ot++)x(V.location+ot,mt/V.locationSize,Y,nt,mt*tt,mt/V.locationSize*ot*tt,gt)}}else if(B!==void 0){const nt=B[$];if(nt!==void 0)switch(nt.length){case 2:s.vertexAttrib2fv(V.location,nt);break;case 3:s.vertexAttrib3fv(V.location,nt);break;case 4:s.vertexAttrib4fv(V.location,nt);break;default:s.vertexAttrib1fv(V.location,nt)}}}}M()}function C(){L();for(const v in i){const S=i[v];for(const P in S){const U=S[P];for(const G in U)h(U[G].object),delete U[G];delete S[P]}delete i[v]}}function T(v){if(i[v.id]===void 0)return;const S=i[v.id];for(const P in S){const U=S[P];for(const G in U)h(U[G].object),delete U[G];delete S[P]}delete i[v.id]}function b(v){for(const S in i){const P=i[S];if(P[v.id]===void 0)continue;const U=P[v.id];for(const G in U)h(U[G].object),delete U[G];delete P[v.id]}}function L(){O(),o=!0,r!==n&&(r=n,c(r.object))}function O(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:L,resetDefaultState:O,dispose:C,releaseStatesOfGeometry:T,releaseStatesOfProgram:b,initAttributes:g,enableAttribute:m,disableUnusedAttributes:M}}function P_(s,t,e){let i;function n(c){i=c}function r(c,h){s.drawArrays(i,c,h),e.update(h,i,1)}function o(c,h,f){f!==0&&(s.drawArraysInstanced(i,c,h,f),e.update(h,i,f))}function a(c,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,f);let p=0;for(let _=0;_<f;_++)p+=h[_];e.update(p,i,1)}function l(c,h,f,u){if(f===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let _=0;_<c.length;_++)o(c[_],h[_],u[_]);else{p.multiDrawArraysInstancedWEBGL(i,c,0,h,0,u,0,f);let _=0;for(let g=0;g<f;g++)_+=h[g];for(let g=0;g<u.length;g++)e.update(_,i,u[g])}}this.setMode=n,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function L_(s,t,e,i){let n;function r(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){const b=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(b){return!(b!==Ti&&i.convert(b)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(b){const L=b===Bi&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(b!==Ki&&i.convert(b)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&b!==qi&&!L)}function l(b){if(b==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const f=e.logarithmicDepthBuffer===!0,u=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(u===!0){const b=t.get("EXT_clip_control");b.clipControlEXT(b.LOWER_LEFT_EXT,b.ZERO_TO_ONE_EXT)}const p=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),d=s.getParameter(s.MAX_VERTEX_ATTRIBS),M=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),x=s.getParameter(s.MAX_VARYING_VECTORS),y=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),C=_>0,T=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:f,reverseDepthBuffer:u,maxTextures:p,maxVertexTextures:_,maxTextureSize:g,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:M,maxVaryings:x,maxFragmentUniforms:y,vertexTextures:C,maxSamples:T}}function D_(s){const t=this;let e=null,i=0,n=!1,r=!1;const o=new Gn,a=new Bt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){const p=f.length!==0||u||i!==0||n;return n=u,i=f.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,u){e=h(f,u,0)},this.setState=function(f,u,p){const _=f.clippingPlanes,g=f.clipIntersection,m=f.clipShadows,d=s.get(f);if(!n||_===null||_.length===0||r&&!m)r?h(null):c();else{const M=r?0:i,x=M*4;let y=d.clippingState||null;l.value=y,y=h(_,u,x,p);for(let C=0;C!==x;++C)y[C]=e[C];d.clippingState=y,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(f,u,p,_){const g=f!==null?f.length:0;let m=null;if(g!==0){if(m=l.value,_!==!0||m===null){const d=p+g*4,M=u.matrixWorldInverse;a.getNormalMatrix(M),(m===null||m.length<d)&&(m=new Float32Array(d));for(let x=0,y=p;x!==g;++x,y+=4)o.copy(f[x]).applyMatrix4(M,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=g,t.numIntersection=0,m}}function I_(s){let t=new WeakMap;function e(o,a){return a===Gl?o.mapping=Bs:a===Vl&&(o.mapping=ks),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===Gl||a===Vl)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Wm(l.height);return c.fromEquirectangularTexture(s,o),t.set(o,c),o.addEventListener("dispose",n),e(c.texture,o.mapping)}else return null}}return o}function n(o){const a=o.target;a.removeEventListener("dispose",n);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:i,dispose:r}}class Zc extends Ad{constructor(t=-1,e=1,i=1,n=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2;let r=i-t,o=i+t,a=n+e,l=n-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Ls=4,Hh=[.125,.215,.35,.446,.526,.582],qn=20,Ga=new Zc,Gh=new St;let Va=null,Wa=0,Xa=0,qa=!1;const Vn=(1+Math.sqrt(5))/2,Ss=1/Vn,Vh=[new A(-Vn,Ss,0),new A(Vn,Ss,0),new A(-Ss,0,Vn),new A(Ss,0,Vn),new A(0,Vn,-Ss),new A(0,Vn,Ss),new A(-1,1,-1),new A(1,1,-1),new A(-1,1,1),new A(1,1,1)];class _c{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,i=.1,n=100){Va=this._renderer.getRenderTarget(),Wa=this._renderer.getActiveCubeFace(),Xa=this._renderer.getActiveMipmapLevel(),qa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,i,n,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=qh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Va,Wa,Xa),this._renderer.xr.enabled=qa,t.scissorTest=!1,lo(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Bs||t.mapping===ks?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Va=this._renderer.getRenderTarget(),Wa=this._renderer.getActiveCubeFace(),Xa=this._renderer.getActiveMipmapLevel(),qa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:Fi,minFilter:Fi,generateMipmaps:!1,type:Bi,format:Ti,colorSpace:Ln,depthBuffer:!1},n=Wh(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Wh(t,e,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=U_(r)),this._blurMaterial=N_(r,t,e)}return n}_compileMaterial(t){const e=new Tt(this._lodPlanes[0],t);this._renderer.compile(e,Ga)}_sceneToCubeUV(t,e,i,n){const a=new yi(90,1,e,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,u=h.toneMapping;h.getClearColor(Gh),h.toneMapping=Rn,h.autoClear=!1;const p=new $e({name:"PMREM.Background",side:ei,depthWrite:!1,depthTest:!1}),_=new Tt(new Qe,p);let g=!1;const m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,g=!0):(p.color.copy(Gh),g=!0);for(let d=0;d<6;d++){const M=d%3;M===0?(a.up.set(0,l[d],0),a.lookAt(c[d],0,0)):M===1?(a.up.set(0,0,l[d]),a.lookAt(0,c[d],0)):(a.up.set(0,l[d],0),a.lookAt(0,0,c[d]));const x=this._cubeSize;lo(n,M*x,d>2?x:0,x,x),h.setRenderTarget(n),g&&h.render(_,a),h.render(t,a)}_.geometry.dispose(),_.material.dispose(),h.toneMapping=u,h.autoClear=f,t.background=m}_textureToCubeUV(t,e){const i=this._renderer,n=t.mapping===Bs||t.mapping===ks;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=qh()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xh());const r=n?this._cubemapMaterial:this._equirectMaterial,o=new Tt(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;lo(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(o,Ga)}_applyPMREM(t){const e=this._renderer,i=e.autoClear;e.autoClear=!1;const n=this._lodPlanes.length;for(let r=1;r<n;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Vh[(n-r-1)%Vh.length];this._blur(t,r-1,r,o,a)}e.autoClear=i}_blur(t,e,i,n,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,i,n,"latitudinal",r),this._halfBlur(o,t,i,i,n,"longitudinal",r)}_halfBlur(t,e,i,n,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,f=new Tt(this._lodPlanes[n],c),u=c.uniforms,p=this._sizeLods[i]-1,_=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*qn-1),g=r/_,m=isFinite(r)?1+Math.floor(h*g):qn;m>qn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${qn}`);const d=[];let M=0;for(let b=0;b<qn;++b){const L=b/g,O=Math.exp(-L*L/2);d.push(O),b===0?M+=O:b<m&&(M+=2*O)}for(let b=0;b<d.length;b++)d[b]=d[b]/M;u.envMap.value=t.texture,u.samples.value=m,u.weights.value=d,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);const{_lodMax:x}=this;u.dTheta.value=_,u.mipInt.value=x-i;const y=this._sizeLods[n],C=3*y*(n>x-Ls?n-x+Ls:0),T=4*(this._cubeSize-y);lo(e,C,T,3*y,2*y),l.setRenderTarget(e),l.render(f,Ga)}}function U_(s){const t=[],e=[],i=[];let n=s;const r=s-Ls+1+Hh.length;for(let o=0;o<r;o++){const a=Math.pow(2,n);e.push(a);let l=1/a;o>s-Ls?l=Hh[o-s+Ls-1]:o===0&&(l=0),i.push(l);const c=1/(a-2),h=-c,f=1+c,u=[h,h,f,h,f,f,h,h,f,f,h,f],p=6,_=6,g=3,m=2,d=1,M=new Float32Array(g*_*p),x=new Float32Array(m*_*p),y=new Float32Array(d*_*p);for(let T=0;T<p;T++){const b=T%3*2/3-1,L=T>2?0:-1,O=[b,L,0,b+2/3,L,0,b+2/3,L+1,0,b,L,0,b+2/3,L+1,0,b,L+1,0];M.set(O,g*_*T),x.set(u,m*_*T);const v=[T,T,T,T,T,T];y.set(v,d*_*T)}const C=new Ue;C.setAttribute("position",new xe(M,g)),C.setAttribute("uv",new xe(x,m)),C.setAttribute("faceIndex",new xe(y,d)),t.push(C),n>Ls&&n--}return{lodPlanes:t,sizeLods:e,sigmas:i}}function Wh(s,t,e){const i=new vi(s,t,e);return i.texture.mapping=la,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function lo(s,t,e,i,n){s.viewport.set(t,e,i,n),s.scissor.set(t,e,i,n)}function N_(s,t,e){const i=new Float32Array(qn),n=new A(0,1,0);return new ge({name:"SphericalGaussianBlur",defines:{n:qn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:n}},vertexShader:jc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Xe,depthTest:!1,depthWrite:!1})}function Xh(){return new ge({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:jc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Xe,depthTest:!1,depthWrite:!1})}function qh(){return new ge({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:jc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Xe,depthTest:!1,depthWrite:!1})}function jc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function F_(s){let t=new WeakMap,e=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===Gl||l===Vl,h=l===Bs||l===ks;if(c||h){let f=t.get(a);const u=f!==void 0?f.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==u)return e===null&&(e=new _c(s)),f=c?e.fromEquirectangular(a,f):e.fromCubemap(a,f),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),f.texture;if(f!==void 0)return f.texture;{const p=a.image;return c&&p&&p.height>0||h&&p&&n(p)?(e===null&&(e=new _c(s)),f=c?e.fromEquirectangular(a):e.fromCubemap(a),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),a.addEventListener("dispose",r),f.texture):null}}}return a}function n(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:i,dispose:o}}function O_(s){const t={};function e(i){if(t[i]!==void 0)return t[i];let n;switch(i){case"WEBGL_depth_texture":n=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":n=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":n=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":n=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:n=s.getExtension(i)}return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){const n=e(i);return n===null&&Yo("THREE.WebGLRenderer: "+i+" extension not supported."),n}}}function z_(s,t,e,i){const n={},r=new WeakMap;function o(f){const u=f.target;u.index!==null&&t.remove(u.index);for(const _ in u.attributes)t.remove(u.attributes[_]);for(const _ in u.morphAttributes){const g=u.morphAttributes[_];for(let m=0,d=g.length;m<d;m++)t.remove(g[m])}u.removeEventListener("dispose",o),delete n[u.id];const p=r.get(u);p&&(t.remove(p),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(f,u){return n[u.id]===!0||(u.addEventListener("dispose",o),n[u.id]=!0,e.memory.geometries++),u}function l(f){const u=f.attributes;for(const _ in u)t.update(u[_],s.ARRAY_BUFFER);const p=f.morphAttributes;for(const _ in p){const g=p[_];for(let m=0,d=g.length;m<d;m++)t.update(g[m],s.ARRAY_BUFFER)}}function c(f){const u=[],p=f.index,_=f.attributes.position;let g=0;if(p!==null){const M=p.array;g=p.version;for(let x=0,y=M.length;x<y;x+=3){const C=M[x+0],T=M[x+1],b=M[x+2];u.push(C,T,T,b,b,C)}}else if(_!==void 0){const M=_.array;g=_.version;for(let x=0,y=M.length/3-1;x<y;x+=3){const C=x+0,T=x+1,b=x+2;u.push(C,T,T,b,b,C)}}else return;const m=new(vd(u)?Td:wd)(u,1);m.version=g;const d=r.get(f);d&&t.remove(d),r.set(f,m)}function h(f){const u=r.get(f);if(u){const p=f.index;p!==null&&u.version<p.version&&c(f)}else c(f);return r.get(f)}return{get:a,update:l,getWireframeAttribute:h}}function B_(s,t,e){let i;function n(u){i=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,p){s.drawElements(i,p,r,u*o),e.update(p,i,1)}function c(u,p,_){_!==0&&(s.drawElementsInstanced(i,p,r,u*o,_),e.update(p,i,_))}function h(u,p,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,r,u,0,_);let m=0;for(let d=0;d<_;d++)m+=p[d];e.update(m,i,1)}function f(u,p,_,g){if(_===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<u.length;d++)c(u[d]/o,p[d],g[d]);else{m.multiDrawElementsInstancedWEBGL(i,p,0,r,u,0,g,0,_);let d=0;for(let M=0;M<_;M++)d+=p[M];for(let M=0;M<g.length;M++)e.update(d,i,g[M])}}this.setMode=n,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function k_(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function H_(s,t,e){const i=new WeakMap,n=new we;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=h!==void 0?h.length:0;let u=i.get(a);if(u===void 0||u.count!==f){let v=function(){L.dispose(),i.delete(a),a.removeEventListener("dispose",v)};var p=v;u!==void 0&&u.texture.dispose();const _=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,d=a.morphAttributes.position||[],M=a.morphAttributes.normal||[],x=a.morphAttributes.color||[];let y=0;_===!0&&(y=1),g===!0&&(y=2),m===!0&&(y=3);let C=a.attributes.position.count*y,T=1;C>t.maxTextureSize&&(T=Math.ceil(C/t.maxTextureSize),C=t.maxTextureSize);const b=new Float32Array(C*T*4*f),L=new xd(b,C,T,f);L.type=qi,L.needsUpdate=!0;const O=y*4;for(let S=0;S<f;S++){const P=d[S],U=M[S],G=x[S],X=C*T*4*S;for(let B=0;B<P.count;B++){const $=B*O;_===!0&&(n.fromBufferAttribute(P,B),b[X+$+0]=n.x,b[X+$+1]=n.y,b[X+$+2]=n.z,b[X+$+3]=0),g===!0&&(n.fromBufferAttribute(U,B),b[X+$+4]=n.x,b[X+$+5]=n.y,b[X+$+6]=n.z,b[X+$+7]=0),m===!0&&(n.fromBufferAttribute(G,B),b[X+$+8]=n.x,b[X+$+9]=n.y,b[X+$+10]=n.z,b[X+$+11]=G.itemSize===4?n.w:1)}}u={count:f,texture:L,size:new lt(C,T)},i.set(a,u),a.addEventListener("dispose",v)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let _=0;for(let m=0;m<c.length;m++)_+=c[m];const g=a.morphTargetsRelative?1:1-_;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",u.size)}return{update:r}}function G_(s,t,e,i){let n=new WeakMap;function r(l){const c=i.render.frame,h=l.geometry,f=t.get(l,h);if(n.get(f)!==c&&(t.update(f),n.set(f,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),n.get(l)!==c&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),n.set(l,c))),l.isSkinnedMesh){const u=l.skeleton;n.get(u)!==c&&(u.update(),n.set(u,c))}return f}function o(){n=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}class Jc extends ii{constructor(t,e,i,n,r,o,a,l,c,h=Us){if(h!==Us&&h!==ts)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===Us&&(i=Jn),i===void 0&&h===ts&&(i=Qn),super(null,n,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:ti,this.minFilter=l!==void 0?l:ti,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Pd=new ii,Yh=new Jc(1,1),Ld=new xd,Dd=new Cm,Id=new Rd,$h=[],Kh=[],Zh=new Float32Array(16),jh=new Float32Array(9),Jh=new Float32Array(4);function Ys(s,t,e){const i=s[0];if(i<=0||i>0)return s;const n=t*e;let r=$h[n];if(r===void 0&&(r=new Float32Array(n),$h[n]=r),t!==0){i.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function Fe(s,t){if(s.length!==t.length)return!1;for(let e=0,i=s.length;e<i;e++)if(s[e]!==t[e])return!1;return!0}function Oe(s,t){for(let e=0,i=t.length;e<i;e++)s[e]=t[e]}function ua(s,t){let e=Kh[t];e===void 0&&(e=new Int32Array(t),Kh[t]=e);for(let i=0;i!==t;++i)e[i]=s.allocateTextureUnit();return e}function V_(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function W_(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Fe(e,t))return;s.uniform2fv(this.addr,t),Oe(e,t)}}function X_(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Fe(e,t))return;s.uniform3fv(this.addr,t),Oe(e,t)}}function q_(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Fe(e,t))return;s.uniform4fv(this.addr,t),Oe(e,t)}}function Y_(s,t){const e=this.cache,i=t.elements;if(i===void 0){if(Fe(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Oe(e,t)}else{if(Fe(e,i))return;Jh.set(i),s.uniformMatrix2fv(this.addr,!1,Jh),Oe(e,i)}}function $_(s,t){const e=this.cache,i=t.elements;if(i===void 0){if(Fe(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Oe(e,t)}else{if(Fe(e,i))return;jh.set(i),s.uniformMatrix3fv(this.addr,!1,jh),Oe(e,i)}}function K_(s,t){const e=this.cache,i=t.elements;if(i===void 0){if(Fe(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Oe(e,t)}else{if(Fe(e,i))return;Zh.set(i),s.uniformMatrix4fv(this.addr,!1,Zh),Oe(e,i)}}function Z_(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function j_(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Fe(e,t))return;s.uniform2iv(this.addr,t),Oe(e,t)}}function J_(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Fe(e,t))return;s.uniform3iv(this.addr,t),Oe(e,t)}}function Q_(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Fe(e,t))return;s.uniform4iv(this.addr,t),Oe(e,t)}}function tv(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function ev(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Fe(e,t))return;s.uniform2uiv(this.addr,t),Oe(e,t)}}function iv(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Fe(e,t))return;s.uniform3uiv(this.addr,t),Oe(e,t)}}function nv(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Fe(e,t))return;s.uniform4uiv(this.addr,t),Oe(e,t)}}function sv(s,t,e){const i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(Yh.compareFunction=_d,r=Yh):r=Pd,e.setTexture2D(t||r,n)}function rv(s,t,e){const i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||Dd,n)}function ov(s,t,e){const i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||Id,n)}function av(s,t,e){const i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||Ld,n)}function lv(s){switch(s){case 5126:return V_;case 35664:return W_;case 35665:return X_;case 35666:return q_;case 35674:return Y_;case 35675:return $_;case 35676:return K_;case 5124:case 35670:return Z_;case 35667:case 35671:return j_;case 35668:case 35672:return J_;case 35669:case 35673:return Q_;case 5125:return tv;case 36294:return ev;case 36295:return iv;case 36296:return nv;case 35678:case 36198:case 36298:case 36306:case 35682:return sv;case 35679:case 36299:case 36307:return rv;case 35680:case 36300:case 36308:case 36293:return ov;case 36289:case 36303:case 36311:case 36292:return av}}function cv(s,t){s.uniform1fv(this.addr,t)}function hv(s,t){const e=Ys(t,this.size,2);s.uniform2fv(this.addr,e)}function uv(s,t){const e=Ys(t,this.size,3);s.uniform3fv(this.addr,e)}function fv(s,t){const e=Ys(t,this.size,4);s.uniform4fv(this.addr,e)}function dv(s,t){const e=Ys(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function pv(s,t){const e=Ys(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function mv(s,t){const e=Ys(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function gv(s,t){s.uniform1iv(this.addr,t)}function _v(s,t){s.uniform2iv(this.addr,t)}function vv(s,t){s.uniform3iv(this.addr,t)}function Mv(s,t){s.uniform4iv(this.addr,t)}function xv(s,t){s.uniform1uiv(this.addr,t)}function Sv(s,t){s.uniform2uiv(this.addr,t)}function yv(s,t){s.uniform3uiv(this.addr,t)}function Ev(s,t){s.uniform4uiv(this.addr,t)}function wv(s,t,e){const i=this.cache,n=t.length,r=ua(e,n);Fe(i,r)||(s.uniform1iv(this.addr,r),Oe(i,r));for(let o=0;o!==n;++o)e.setTexture2D(t[o]||Pd,r[o])}function Tv(s,t,e){const i=this.cache,n=t.length,r=ua(e,n);Fe(i,r)||(s.uniform1iv(this.addr,r),Oe(i,r));for(let o=0;o!==n;++o)e.setTexture3D(t[o]||Dd,r[o])}function bv(s,t,e){const i=this.cache,n=t.length,r=ua(e,n);Fe(i,r)||(s.uniform1iv(this.addr,r),Oe(i,r));for(let o=0;o!==n;++o)e.setTextureCube(t[o]||Id,r[o])}function Av(s,t,e){const i=this.cache,n=t.length,r=ua(e,n);Fe(i,r)||(s.uniform1iv(this.addr,r),Oe(i,r));for(let o=0;o!==n;++o)e.setTexture2DArray(t[o]||Ld,r[o])}function Rv(s){switch(s){case 5126:return cv;case 35664:return hv;case 35665:return uv;case 35666:return fv;case 35674:return dv;case 35675:return pv;case 35676:return mv;case 5124:case 35670:return gv;case 35667:case 35671:return _v;case 35668:case 35672:return vv;case 35669:case 35673:return Mv;case 5125:return xv;case 36294:return Sv;case 36295:return yv;case 36296:return Ev;case 35678:case 36198:case 36298:case 36306:case 35682:return wv;case 35679:case 36299:case 36307:return Tv;case 35680:case 36300:case 36308:case 36293:return bv;case 36289:case 36303:case 36311:case 36292:return Av}}class Cv{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=lv(e.type)}}class Pv{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Rv(e.type)}}class Lv{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){const n=this.seq;for(let r=0,o=n.length;r!==o;++r){const a=n[r];a.setValue(t,e[a.id],i)}}}const Ya=/(\w+)(\])?(\[|\.)?/g;function Qh(s,t){s.seq.push(t),s.map[t.id]=t}function Dv(s,t,e){const i=s.name,n=i.length;for(Ya.lastIndex=0;;){const r=Ya.exec(i),o=Ya.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===n){Qh(e,c===void 0?new Cv(a,s,t):new Pv(a,s,t));break}else{let f=e.map[a];f===void 0&&(f=new Lv(a),Qh(e,f)),e=f}}}class $o{constructor(t,e){this.seq=[],this.map={};const i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let n=0;n<i;++n){const r=t.getActiveUniform(e,n),o=t.getUniformLocation(e,r.name);Dv(r,o,this)}}setValue(t,e,i,n){const r=this.map[e];r!==void 0&&r.setValue(t,i,n)}setOptional(t,e,i){const n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,n)}}static seqWithValue(t,e){const i=[];for(let n=0,r=t.length;n!==r;++n){const o=t[n];o.id in e&&i.push(o)}return i}}function tu(s,t,e){const i=s.createShader(t);return s.shaderSource(i,e),s.compileShader(i),i}const Iv=37297;let Uv=0;function Nv(s,t){const e=s.split(`
`),i=[],n=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=n;o<r;o++){const a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}function Fv(s){const t=ie.getPrimaries(ie.workingColorSpace),e=ie.getPrimaries(s);let i;switch(t===e?i="":t===ta&&e===Qo?i="LinearDisplayP3ToLinearSRGB":t===Qo&&e===ta&&(i="LinearSRGBToLinearDisplayP3"),s){case Ln:case ha:return[i,"LinearTransferOETF"];case ui:case qc:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",s),[i,"LinearTransferOETF"]}}function eu(s,t,e){const i=s.getShaderParameter(t,s.COMPILE_STATUS),n=s.getShaderInfoLog(t).trim();if(i&&n==="")return"";const r=/ERROR: 0:(\d+)/.exec(n);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+n+`

`+Nv(s.getShaderSource(t),o)}else return n}function Ov(s,t){const e=Fv(t);return`vec4 ${s}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function zv(s,t){let e;switch(t){case id:e="Linear";break;case nd:e="Reinhard";break;case sd:e="Cineon";break;case zc:e="ACESFilmic";break;case rd:e="AgX";break;case od:e="Neutral";break;case Xp:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const co=new A;function Bv(){ie.getLuminanceCoefficients(co);const s=co.x.toFixed(4),t=co.y.toFixed(4),e=co.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function kv(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(_r).join(`
`)}function Hv(s){const t=[];for(const e in s){const i=s[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function Gv(s,t){const e={},i=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){const r=s.getActiveAttrib(t,n),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function _r(s){return s!==""}function iu(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function nu(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Vv=/^[ \t]*#include +<([\w\d./]+)>/gm;function vc(s){return s.replace(Vv,Xv)}const Wv=new Map;function Xv(s,t){let e=Rt[t];if(e===void 0){const i=Wv.get(t);if(i!==void 0)e=Rt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return vc(e)}const qv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function su(s){return s.replace(qv,Yv)}function Yv(s,t,e,i){let n="";for(let r=parseInt(t);r<parseInt(e);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function ru(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function $v(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===td?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===Rp?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===an&&(t="SHADOWMAP_TYPE_VSM"),t}function Kv(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Bs:case ks:t="ENVMAP_TYPE_CUBE";break;case la:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Zv(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case ks:t="ENVMAP_MODE_REFRACTION";break}return t}function jv(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Oc:t="ENVMAP_BLENDING_MULTIPLY";break;case Vp:t="ENVMAP_BLENDING_MIX";break;case Wp:t="ENVMAP_BLENDING_ADD";break}return t}function Jv(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:i,maxMip:e}}function Qv(s,t,e,i){const n=s.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=$v(e),c=Kv(e),h=Zv(e),f=jv(e),u=Jv(e),p=kv(e),_=Hv(r),g=n.createProgram();let m,d,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(_r).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(_r).join(`
`),d.length>0&&(d+=`
`)):(m=[ru(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(_r).join(`
`),d=[ru(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Rn?"#define TONE_MAPPING":"",e.toneMapping!==Rn?Rt.tonemapping_pars_fragment:"",e.toneMapping!==Rn?zv("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Rt.colorspace_pars_fragment,Ov("linearToOutputTexel",e.outputColorSpace),Bv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(_r).join(`
`)),o=vc(o),o=iu(o,e),o=nu(o,e),a=vc(a),a=iu(a,e),a=nu(a,e),o=su(o),a=su(a),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",e.glslVersion===yh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===yh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const x=M+m+o,y=M+d+a,C=tu(n,n.VERTEX_SHADER,x),T=tu(n,n.FRAGMENT_SHADER,y);n.attachShader(g,C),n.attachShader(g,T),e.index0AttributeName!==void 0?n.bindAttribLocation(g,0,e.index0AttributeName):e.morphTargets===!0&&n.bindAttribLocation(g,0,"position"),n.linkProgram(g);function b(S){if(s.debug.checkShaderErrors){const P=n.getProgramInfoLog(g).trim(),U=n.getShaderInfoLog(C).trim(),G=n.getShaderInfoLog(T).trim();let X=!0,B=!0;if(n.getProgramParameter(g,n.LINK_STATUS)===!1)if(X=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,g,C,T);else{const $=eu(n,C,"vertex"),V=eu(n,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(g,n.VALIDATE_STATUS)+`

Material Name: `+S.name+`
Material Type: `+S.type+`

Program Info Log: `+P+`
`+$+`
`+V)}else P!==""?console.warn("THREE.WebGLProgram: Program Info Log:",P):(U===""||G==="")&&(B=!1);B&&(S.diagnostics={runnable:X,programLog:P,vertexShader:{log:U,prefix:m},fragmentShader:{log:G,prefix:d}})}n.deleteShader(C),n.deleteShader(T),L=new $o(n,g),O=Gv(n,g)}let L;this.getUniforms=function(){return L===void 0&&b(this),L};let O;this.getAttributes=function(){return O===void 0&&b(this),O};let v=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=n.getProgramParameter(g,Iv)),v},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(g),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Uv++,this.cacheKey=t,this.usedTimes=1,this.program=g,this.vertexShader=C,this.fragmentShader=T,this}let tM=0;class eM{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,i=t.fragmentShader,n=this._getShaderStage(e),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(t);return o.has(n)===!1&&(o.add(n),n.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){const e=this.shaderCache;let i=e.get(t);return i===void 0&&(i=new iM(t),e.set(t,i)),i}}class iM{constructor(t){this.id=tM++,this.code=t,this.usedTimes=0}}function nM(s,t,e,i,n,r,o){const a=new yd,l=new eM,c=new Set,h=[],f=n.logarithmicDepthBuffer,u=n.reverseDepthBuffer,p=n.vertexTextures;let _=n.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(v){return c.add(v),v===0?"uv":`uv${v}`}function d(v,S,P,U,G){const X=U.fog,B=G.geometry,$=v.isMeshStandardMaterial?U.environment:null,V=(v.isMeshStandardMaterial?e:t).get(v.envMap||$),Q=V&&V.mapping===la?V.image.height:null,nt=g[v.type];v.precision!==null&&(_=n.getMaxPrecision(v.precision),_!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",_,"instead."));const mt=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Gt=mt!==void 0?mt.length:0;let Zt=0;B.morphAttributes.position!==void 0&&(Zt=1),B.morphAttributes.normal!==void 0&&(Zt=2),B.morphAttributes.color!==void 0&&(Zt=3);let Y,tt,gt,ot;if(nt){const ci=Vi[nt];Y=ci.vertexShader,tt=ci.fragmentShader}else Y=v.vertexShader,tt=v.fragmentShader,l.update(v),gt=l.getVertexShaderID(v),ot=l.getFragmentShaderID(v);const At=s.getRenderTarget(),Et=G.isInstancedMesh===!0,Ot=G.isBatchedMesh===!0,Qt=!!v.map,qt=!!v.matcap,D=!!V,Ge=!!v.aoMap,Wt=!!v.lightMap,Yt=!!v.bumpMap,Ct=!!v.normalMap,oe=!!v.displacementMap,Pt=!!v.emissiveMap,R=!!v.metalnessMap,E=!!v.roughnessMap,z=v.anisotropy>0,Z=v.clearcoat>0,J=v.dispersion>0,K=v.iridescence>0,Mt=v.sheen>0,rt=v.transmission>0,ct=z&&!!v.anisotropyMap,Xt=Z&&!!v.clearcoatMap,et=Z&&!!v.clearcoatNormalMap,ht=Z&&!!v.clearcoatRoughnessMap,Lt=K&&!!v.iridescenceMap,Dt=K&&!!v.iridescenceThicknessMap,_t=Mt&&!!v.sheenColorMap,$t=Mt&&!!v.sheenRoughnessMap,Ft=!!v.specularMap,Jt=!!v.specularColorMap,I=!!v.specularIntensityMap,at=rt&&!!v.transmissionMap,W=rt&&!!v.thicknessMap,j=!!v.gradientMap,ut=!!v.alphaMap,dt=v.alphaTest>0,jt=!!v.alphaHash,Ce=!!v.extensions;let li=Rn;v.toneMapped&&(At===null||At.isXRRenderTarget===!0)&&(li=s.toneMapping);const te={shaderID:nt,shaderType:v.type,shaderName:v.name,vertexShader:Y,fragmentShader:tt,defines:v.defines,customVertexShaderID:gt,customFragmentShaderID:ot,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:_,batching:Ot,batchingColor:Ot&&G._colorsTexture!==null,instancing:Et,instancingColor:Et&&G.instanceColor!==null,instancingMorph:Et&&G.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:At===null?s.outputColorSpace:At.isXRRenderTarget===!0?At.texture.colorSpace:Ln,alphaToCoverage:!!v.alphaToCoverage,map:Qt,matcap:qt,envMap:D,envMapMode:D&&V.mapping,envMapCubeUVHeight:Q,aoMap:Ge,lightMap:Wt,bumpMap:Yt,normalMap:Ct,displacementMap:p&&oe,emissiveMap:Pt,normalMapObjectSpace:Ct&&v.normalMapType===Kp,normalMapTangentSpace:Ct&&v.normalMapType===ca,metalnessMap:R,roughnessMap:E,anisotropy:z,anisotropyMap:ct,clearcoat:Z,clearcoatMap:Xt,clearcoatNormalMap:et,clearcoatRoughnessMap:ht,dispersion:J,iridescence:K,iridescenceMap:Lt,iridescenceThicknessMap:Dt,sheen:Mt,sheenColorMap:_t,sheenRoughnessMap:$t,specularMap:Ft,specularColorMap:Jt,specularIntensityMap:I,transmission:rt,transmissionMap:at,thicknessMap:W,gradientMap:j,opaque:v.transparent===!1&&v.blending===Is&&v.alphaToCoverage===!1,alphaMap:ut,alphaTest:dt,alphaHash:jt,combine:v.combine,mapUv:Qt&&m(v.map.channel),aoMapUv:Ge&&m(v.aoMap.channel),lightMapUv:Wt&&m(v.lightMap.channel),bumpMapUv:Yt&&m(v.bumpMap.channel),normalMapUv:Ct&&m(v.normalMap.channel),displacementMapUv:oe&&m(v.displacementMap.channel),emissiveMapUv:Pt&&m(v.emissiveMap.channel),metalnessMapUv:R&&m(v.metalnessMap.channel),roughnessMapUv:E&&m(v.roughnessMap.channel),anisotropyMapUv:ct&&m(v.anisotropyMap.channel),clearcoatMapUv:Xt&&m(v.clearcoatMap.channel),clearcoatNormalMapUv:et&&m(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ht&&m(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Lt&&m(v.iridescenceMap.channel),iridescenceThicknessMapUv:Dt&&m(v.iridescenceThicknessMap.channel),sheenColorMapUv:_t&&m(v.sheenColorMap.channel),sheenRoughnessMapUv:$t&&m(v.sheenRoughnessMap.channel),specularMapUv:Ft&&m(v.specularMap.channel),specularColorMapUv:Jt&&m(v.specularColorMap.channel),specularIntensityMapUv:I&&m(v.specularIntensityMap.channel),transmissionMapUv:at&&m(v.transmissionMap.channel),thicknessMapUv:W&&m(v.thicknessMap.channel),alphaMapUv:ut&&m(v.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(Ct||z),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!B.attributes.uv&&(Qt||ut),fog:!!X,useFog:v.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reverseDepthBuffer:u,skinning:G.isSkinnedMesh===!0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:Gt,morphTextureStride:Zt,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:li,decodeVideoTexture:Qt&&v.map.isVideoTexture===!0&&ie.getTransfer(v.map.colorSpace)===ue,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Ye,flipSided:v.side===ei,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Ce&&v.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ce&&v.extensions.multiDraw===!0||Ot)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return te.vertexUv1s=c.has(1),te.vertexUv2s=c.has(2),te.vertexUv3s=c.has(3),c.clear(),te}function M(v){const S=[];if(v.shaderID?S.push(v.shaderID):(S.push(v.customVertexShaderID),S.push(v.customFragmentShaderID)),v.defines!==void 0)for(const P in v.defines)S.push(P),S.push(v.defines[P]);return v.isRawShaderMaterial===!1&&(x(S,v),y(S,v),S.push(s.outputColorSpace)),S.push(v.customProgramCacheKey),S.join()}function x(v,S){v.push(S.precision),v.push(S.outputColorSpace),v.push(S.envMapMode),v.push(S.envMapCubeUVHeight),v.push(S.mapUv),v.push(S.alphaMapUv),v.push(S.lightMapUv),v.push(S.aoMapUv),v.push(S.bumpMapUv),v.push(S.normalMapUv),v.push(S.displacementMapUv),v.push(S.emissiveMapUv),v.push(S.metalnessMapUv),v.push(S.roughnessMapUv),v.push(S.anisotropyMapUv),v.push(S.clearcoatMapUv),v.push(S.clearcoatNormalMapUv),v.push(S.clearcoatRoughnessMapUv),v.push(S.iridescenceMapUv),v.push(S.iridescenceThicknessMapUv),v.push(S.sheenColorMapUv),v.push(S.sheenRoughnessMapUv),v.push(S.specularMapUv),v.push(S.specularColorMapUv),v.push(S.specularIntensityMapUv),v.push(S.transmissionMapUv),v.push(S.thicknessMapUv),v.push(S.combine),v.push(S.fogExp2),v.push(S.sizeAttenuation),v.push(S.morphTargetsCount),v.push(S.morphAttributeCount),v.push(S.numDirLights),v.push(S.numPointLights),v.push(S.numSpotLights),v.push(S.numSpotLightMaps),v.push(S.numHemiLights),v.push(S.numRectAreaLights),v.push(S.numDirLightShadows),v.push(S.numPointLightShadows),v.push(S.numSpotLightShadows),v.push(S.numSpotLightShadowsWithMaps),v.push(S.numLightProbes),v.push(S.shadowMapType),v.push(S.toneMapping),v.push(S.numClippingPlanes),v.push(S.numClipIntersection),v.push(S.depthPacking)}function y(v,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),v.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reverseDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.alphaToCoverage&&a.enable(20),v.push(a.mask)}function C(v){const S=g[v.type];let P;if(S){const U=Vi[S];P=wi.clone(U.uniforms)}else P=v.uniforms;return P}function T(v,S){let P;for(let U=0,G=h.length;U<G;U++){const X=h[U];if(X.cacheKey===S){P=X,++P.usedTimes;break}}return P===void 0&&(P=new Qv(s,S,v,r),h.push(P)),P}function b(v){if(--v.usedTimes===0){const S=h.indexOf(v);h[S]=h[h.length-1],h.pop(),v.destroy()}}function L(v){l.remove(v)}function O(){l.dispose()}return{getParameters:d,getProgramCacheKey:M,getUniforms:C,acquireProgram:T,releaseProgram:b,releaseShaderCache:L,programs:h,dispose:O}}function sM(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function i(o){s.delete(o)}function n(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:r}}function rM(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function ou(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function au(){const s=[];let t=0;const e=[],i=[],n=[];function r(){t=0,e.length=0,i.length=0,n.length=0}function o(f,u,p,_,g,m){let d=s[t];return d===void 0?(d={id:f.id,object:f,geometry:u,material:p,groupOrder:_,renderOrder:f.renderOrder,z:g,group:m},s[t]=d):(d.id=f.id,d.object=f,d.geometry=u,d.material=p,d.groupOrder=_,d.renderOrder=f.renderOrder,d.z=g,d.group=m),t++,d}function a(f,u,p,_,g,m){const d=o(f,u,p,_,g,m);p.transmission>0?i.push(d):p.transparent===!0?n.push(d):e.push(d)}function l(f,u,p,_,g,m){const d=o(f,u,p,_,g,m);p.transmission>0?i.unshift(d):p.transparent===!0?n.unshift(d):e.unshift(d)}function c(f,u){e.length>1&&e.sort(f||rM),i.length>1&&i.sort(u||ou),n.length>1&&n.sort(u||ou)}function h(){for(let f=t,u=s.length;f<u;f++){const p=s[f];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:i,transparent:n,init:r,push:a,unshift:l,finish:h,sort:c}}function oM(){let s=new WeakMap;function t(i,n){const r=s.get(i);let o;return r===void 0?(o=new au,s.set(i,[o])):n>=r.length?(o=new au,r.push(o)):o=r[n],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function aM(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new A,color:new St};break;case"SpotLight":e={position:new A,direction:new A,color:new St,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new A,color:new St,distance:0,decay:0};break;case"HemisphereLight":e={direction:new A,skyColor:new St,groundColor:new St};break;case"RectAreaLight":e={color:new St,position:new A,halfWidth:new A,halfHeight:new A};break}return s[t.id]=e,e}}}function lM(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let cM=0;function hM(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function uM(s){const t=new aM,e=lM(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new A);const n=new A,r=new Ht,o=new Ht;function a(c){let h=0,f=0,u=0;for(let O=0;O<9;O++)i.probe[O].set(0,0,0);let p=0,_=0,g=0,m=0,d=0,M=0,x=0,y=0,C=0,T=0,b=0;c.sort(hM);for(let O=0,v=c.length;O<v;O++){const S=c[O],P=S.color,U=S.intensity,G=S.distance,X=S.shadow&&S.shadow.map?S.shadow.map.texture:null;if(S.isAmbientLight)h+=P.r*U,f+=P.g*U,u+=P.b*U;else if(S.isLightProbe){for(let B=0;B<9;B++)i.probe[B].addScaledVector(S.sh.coefficients[B],U);b++}else if(S.isDirectionalLight){const B=t.get(S);if(B.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){const $=S.shadow,V=e.get(S);V.shadowIntensity=$.intensity,V.shadowBias=$.bias,V.shadowNormalBias=$.normalBias,V.shadowRadius=$.radius,V.shadowMapSize=$.mapSize,i.directionalShadow[p]=V,i.directionalShadowMap[p]=X,i.directionalShadowMatrix[p]=S.shadow.matrix,M++}i.directional[p]=B,p++}else if(S.isSpotLight){const B=t.get(S);B.position.setFromMatrixPosition(S.matrixWorld),B.color.copy(P).multiplyScalar(U),B.distance=G,B.coneCos=Math.cos(S.angle),B.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),B.decay=S.decay,i.spot[g]=B;const $=S.shadow;if(S.map&&(i.spotLightMap[C]=S.map,C++,$.updateMatrices(S),S.castShadow&&T++),i.spotLightMatrix[g]=$.matrix,S.castShadow){const V=e.get(S);V.shadowIntensity=$.intensity,V.shadowBias=$.bias,V.shadowNormalBias=$.normalBias,V.shadowRadius=$.radius,V.shadowMapSize=$.mapSize,i.spotShadow[g]=V,i.spotShadowMap[g]=X,y++}g++}else if(S.isRectAreaLight){const B=t.get(S);B.color.copy(P).multiplyScalar(U),B.halfWidth.set(S.width*.5,0,0),B.halfHeight.set(0,S.height*.5,0),i.rectArea[m]=B,m++}else if(S.isPointLight){const B=t.get(S);if(B.color.copy(S.color).multiplyScalar(S.intensity),B.distance=S.distance,B.decay=S.decay,S.castShadow){const $=S.shadow,V=e.get(S);V.shadowIntensity=$.intensity,V.shadowBias=$.bias,V.shadowNormalBias=$.normalBias,V.shadowRadius=$.radius,V.shadowMapSize=$.mapSize,V.shadowCameraNear=$.camera.near,V.shadowCameraFar=$.camera.far,i.pointShadow[_]=V,i.pointShadowMap[_]=X,i.pointShadowMatrix[_]=S.shadow.matrix,x++}i.point[_]=B,_++}else if(S.isHemisphereLight){const B=t.get(S);B.skyColor.copy(S.color).multiplyScalar(U),B.groundColor.copy(S.groundColor).multiplyScalar(U),i.hemi[d]=B,d++}}m>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=st.LTC_FLOAT_1,i.rectAreaLTC2=st.LTC_FLOAT_2):(i.rectAreaLTC1=st.LTC_HALF_1,i.rectAreaLTC2=st.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=f,i.ambient[2]=u;const L=i.hash;(L.directionalLength!==p||L.pointLength!==_||L.spotLength!==g||L.rectAreaLength!==m||L.hemiLength!==d||L.numDirectionalShadows!==M||L.numPointShadows!==x||L.numSpotShadows!==y||L.numSpotMaps!==C||L.numLightProbes!==b)&&(i.directional.length=p,i.spot.length=g,i.rectArea.length=m,i.point.length=_,i.hemi.length=d,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.pointShadow.length=x,i.pointShadowMap.length=x,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=M,i.pointShadowMatrix.length=x,i.spotLightMatrix.length=y+C-T,i.spotLightMap.length=C,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=b,L.directionalLength=p,L.pointLength=_,L.spotLength=g,L.rectAreaLength=m,L.hemiLength=d,L.numDirectionalShadows=M,L.numPointShadows=x,L.numSpotShadows=y,L.numSpotMaps=C,L.numLightProbes=b,i.version=cM++)}function l(c,h){let f=0,u=0,p=0,_=0,g=0;const m=h.matrixWorldInverse;for(let d=0,M=c.length;d<M;d++){const x=c[d];if(x.isDirectionalLight){const y=i.directional[f];y.direction.setFromMatrixPosition(x.matrixWorld),n.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(n),y.direction.transformDirection(m),f++}else if(x.isSpotLight){const y=i.spot[p];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(x.matrixWorld),n.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(n),y.direction.transformDirection(m),p++}else if(x.isRectAreaLight){const y=i.rectArea[_];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(m),o.identity(),r.copy(x.matrixWorld),r.premultiply(m),o.extractRotation(r),y.halfWidth.set(x.width*.5,0,0),y.halfHeight.set(0,x.height*.5,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),_++}else if(x.isPointLight){const y=i.point[u];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(m),u++}else if(x.isHemisphereLight){const y=i.hemi[g];y.direction.setFromMatrixPosition(x.matrixWorld),y.direction.transformDirection(m),g++}}}return{setup:a,setupView:l,state:i}}function lu(s){const t=new uM(s),e=[],i=[];function n(h){c.camera=h,e.length=0,i.length=0}function r(h){e.push(h)}function o(h){i.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:n,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function fM(s){let t=new WeakMap;function e(n,r=0){const o=t.get(n);let a;return o===void 0?(a=new lu(s),t.set(n,[a])):r>=o.length?(a=new lu(s),o.push(a)):a=o[r],a}function i(){t=new WeakMap}return{get:e,dispose:i}}class dM extends un{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Yp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class pM extends un{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const mM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,gM=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function _M(s,t,e){let i=new Kc;const n=new lt,r=new lt,o=new we,a=new dM({depthPacking:$p}),l=new pM,c={},h=e.maxTextureSize,f={[Cn]:ei,[ei]:Cn,[Ye]:Ye},u=new ge({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new lt},radius:{value:4}},vertexShader:mM,fragmentShader:gM}),p=u.clone();p.defines.HORIZONTAL_PASS=1;const _=new Ue;_.setAttribute("position",new xe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new Tt(_,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=td;let d=this.type;this.render=function(T,b,L){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;const O=s.getRenderTarget(),v=s.getActiveCubeFace(),S=s.getActiveMipmapLevel(),P=s.state;P.setBlending(Xe),P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);const U=d!==an&&this.type===an,G=d===an&&this.type!==an;for(let X=0,B=T.length;X<B;X++){const $=T[X],V=$.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;n.copy(V.mapSize);const Q=V.getFrameExtents();if(n.multiply(Q),r.copy(V.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/Q.x),n.x=r.x*Q.x,V.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/Q.y),n.y=r.y*Q.y,V.mapSize.y=r.y)),V.map===null||U===!0||G===!0){const mt=this.type!==an?{minFilter:ti,magFilter:ti}:{};V.map!==null&&V.map.dispose(),V.map=new vi(n.x,n.y,mt),V.map.texture.name=$.name+".shadowMap",V.camera.updateProjectionMatrix()}s.setRenderTarget(V.map),s.clear();const nt=V.getViewportCount();for(let mt=0;mt<nt;mt++){const Gt=V.getViewport(mt);o.set(r.x*Gt.x,r.y*Gt.y,r.x*Gt.z,r.y*Gt.w),P.viewport(o),V.updateMatrices($,mt),i=V.getFrustum(),y(b,L,V.camera,$,this.type)}V.isPointLightShadow!==!0&&this.type===an&&M(V,L),V.needsUpdate=!1}d=this.type,m.needsUpdate=!1,s.setRenderTarget(O,v,S)};function M(T,b){const L=t.update(g);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new vi(n.x,n.y)),u.uniforms.shadow_pass.value=T.map.texture,u.uniforms.resolution.value=T.mapSize,u.uniforms.radius.value=T.radius,s.setRenderTarget(T.mapPass),s.clear(),s.renderBufferDirect(b,null,L,u,g,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,s.setRenderTarget(T.map),s.clear(),s.renderBufferDirect(b,null,L,p,g,null)}function x(T,b,L,O){let v=null;const S=L.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(S!==void 0)v=S;else if(v=L.isPointLight===!0?l:a,s.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0){const P=v.uuid,U=b.uuid;let G=c[P];G===void 0&&(G={},c[P]=G);let X=G[U];X===void 0&&(X=v.clone(),G[U]=X,b.addEventListener("dispose",C)),v=X}if(v.visible=b.visible,v.wireframe=b.wireframe,O===an?v.side=b.shadowSide!==null?b.shadowSide:b.side:v.side=b.shadowSide!==null?b.shadowSide:f[b.side],v.alphaMap=b.alphaMap,v.alphaTest=b.alphaTest,v.map=b.map,v.clipShadows=b.clipShadows,v.clippingPlanes=b.clippingPlanes,v.clipIntersection=b.clipIntersection,v.displacementMap=b.displacementMap,v.displacementScale=b.displacementScale,v.displacementBias=b.displacementBias,v.wireframeLinewidth=b.wireframeLinewidth,v.linewidth=b.linewidth,L.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const P=s.properties.get(v);P.light=L}return v}function y(T,b,L,O,v){if(T.visible===!1)return;if(T.layers.test(b.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&v===an)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,T.matrixWorld);const U=t.update(T),G=T.material;if(Array.isArray(G)){const X=U.groups;for(let B=0,$=X.length;B<$;B++){const V=X[B],Q=G[V.materialIndex];if(Q&&Q.visible){const nt=x(T,Q,O,v);T.onBeforeShadow(s,T,b,L,U,nt,V),s.renderBufferDirect(L,null,U,nt,T,V),T.onAfterShadow(s,T,b,L,U,nt,V)}}}else if(G.visible){const X=x(T,G,O,v);T.onBeforeShadow(s,T,b,L,U,X,null),s.renderBufferDirect(L,null,U,X,T,null),T.onAfterShadow(s,T,b,L,U,X,null)}}const P=T.children;for(let U=0,G=P.length;U<G;U++)y(P[U],b,L,O,v)}function C(T){T.target.removeEventListener("dispose",C);for(const L in c){const O=c[L],v=T.target.uuid;v in O&&(O[v].dispose(),delete O[v])}}}const vM={[Nl]:Fl,[Ol]:kl,[zl]:Hl,[zs]:Bl,[Fl]:Nl,[kl]:Ol,[Hl]:zl,[Bl]:zs};function MM(s){function t(){let I=!1;const at=new we;let W=null;const j=new we(0,0,0,0);return{setMask:function(ut){W!==ut&&!I&&(s.colorMask(ut,ut,ut,ut),W=ut)},setLocked:function(ut){I=ut},setClear:function(ut,dt,jt,Ce,li){li===!0&&(ut*=Ce,dt*=Ce,jt*=Ce),at.set(ut,dt,jt,Ce),j.equals(at)===!1&&(s.clearColor(ut,dt,jt,Ce),j.copy(at))},reset:function(){I=!1,W=null,j.set(-1,0,0,0)}}}function e(){let I=!1,at=!1,W=null,j=null,ut=null;return{setReversed:function(dt){at=dt},setTest:function(dt){dt?gt(s.DEPTH_TEST):ot(s.DEPTH_TEST)},setMask:function(dt){W!==dt&&!I&&(s.depthMask(dt),W=dt)},setFunc:function(dt){if(at&&(dt=vM[dt]),j!==dt){switch(dt){case Nl:s.depthFunc(s.NEVER);break;case Fl:s.depthFunc(s.ALWAYS);break;case Ol:s.depthFunc(s.LESS);break;case zs:s.depthFunc(s.LEQUAL);break;case zl:s.depthFunc(s.EQUAL);break;case Bl:s.depthFunc(s.GEQUAL);break;case kl:s.depthFunc(s.GREATER);break;case Hl:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}j=dt}},setLocked:function(dt){I=dt},setClear:function(dt){ut!==dt&&(s.clearDepth(dt),ut=dt)},reset:function(){I=!1,W=null,j=null,ut=null}}}function i(){let I=!1,at=null,W=null,j=null,ut=null,dt=null,jt=null,Ce=null,li=null;return{setTest:function(te){I||(te?gt(s.STENCIL_TEST):ot(s.STENCIL_TEST))},setMask:function(te){at!==te&&!I&&(s.stencilMask(te),at=te)},setFunc:function(te,ci,Zi){(W!==te||j!==ci||ut!==Zi)&&(s.stencilFunc(te,ci,Zi),W=te,j=ci,ut=Zi)},setOp:function(te,ci,Zi){(dt!==te||jt!==ci||Ce!==Zi)&&(s.stencilOp(te,ci,Zi),dt=te,jt=ci,Ce=Zi)},setLocked:function(te){I=te},setClear:function(te){li!==te&&(s.clearStencil(te),li=te)},reset:function(){I=!1,at=null,W=null,j=null,ut=null,dt=null,jt=null,Ce=null,li=null}}}const n=new t,r=new e,o=new i,a=new WeakMap,l=new WeakMap;let c={},h={},f=new WeakMap,u=[],p=null,_=!1,g=null,m=null,d=null,M=null,x=null,y=null,C=null,T=new St(0,0,0),b=0,L=!1,O=null,v=null,S=null,P=null,U=null;const G=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,B=0;const $=s.getParameter(s.VERSION);$.indexOf("WebGL")!==-1?(B=parseFloat(/^WebGL (\d)/.exec($)[1]),X=B>=1):$.indexOf("OpenGL ES")!==-1&&(B=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),X=B>=2);let V=null,Q={};const nt=s.getParameter(s.SCISSOR_BOX),mt=s.getParameter(s.VIEWPORT),Gt=new we().fromArray(nt),Zt=new we().fromArray(mt);function Y(I,at,W,j){const ut=new Uint8Array(4),dt=s.createTexture();s.bindTexture(I,dt),s.texParameteri(I,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(I,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let jt=0;jt<W;jt++)I===s.TEXTURE_3D||I===s.TEXTURE_2D_ARRAY?s.texImage3D(at,0,s.RGBA,1,1,j,0,s.RGBA,s.UNSIGNED_BYTE,ut):s.texImage2D(at+jt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ut);return dt}const tt={};tt[s.TEXTURE_2D]=Y(s.TEXTURE_2D,s.TEXTURE_2D,1),tt[s.TEXTURE_CUBE_MAP]=Y(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),tt[s.TEXTURE_2D_ARRAY]=Y(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),tt[s.TEXTURE_3D]=Y(s.TEXTURE_3D,s.TEXTURE_3D,1,1),n.setClear(0,0,0,1),r.setClear(1),o.setClear(0),gt(s.DEPTH_TEST),r.setFunc(zs),Wt(!1),Yt(_h),gt(s.CULL_FACE),D(Xe);function gt(I){c[I]!==!0&&(s.enable(I),c[I]=!0)}function ot(I){c[I]!==!1&&(s.disable(I),c[I]=!1)}function At(I,at){return h[I]!==at?(s.bindFramebuffer(I,at),h[I]=at,I===s.DRAW_FRAMEBUFFER&&(h[s.FRAMEBUFFER]=at),I===s.FRAMEBUFFER&&(h[s.DRAW_FRAMEBUFFER]=at),!0):!1}function Et(I,at){let W=u,j=!1;if(I){W=f.get(at),W===void 0&&(W=[],f.set(at,W));const ut=I.textures;if(W.length!==ut.length||W[0]!==s.COLOR_ATTACHMENT0){for(let dt=0,jt=ut.length;dt<jt;dt++)W[dt]=s.COLOR_ATTACHMENT0+dt;W.length=ut.length,j=!0}}else W[0]!==s.BACK&&(W[0]=s.BACK,j=!0);j&&s.drawBuffers(W)}function Ot(I){return p!==I?(s.useProgram(I),p=I,!0):!1}const Qt={[Ni]:s.FUNC_ADD,[Cp]:s.FUNC_SUBTRACT,[Pp]:s.FUNC_REVERSE_SUBTRACT};Qt[Lp]=s.MIN,Qt[Dp]=s.MAX;const qt={[gr]:s.ZERO,[Ip]:s.ONE,[Up]:s.SRC_COLOR,[Ll]:s.SRC_ALPHA,[zp]:s.SRC_ALPHA_SATURATE,[Ul]:s.DST_COLOR,[Il]:s.DST_ALPHA,[Np]:s.ONE_MINUS_SRC_COLOR,[Dl]:s.ONE_MINUS_SRC_ALPHA,[Op]:s.ONE_MINUS_DST_COLOR,[Fp]:s.ONE_MINUS_DST_ALPHA,[Bp]:s.CONSTANT_COLOR,[kp]:s.ONE_MINUS_CONSTANT_COLOR,[Hp]:s.CONSTANT_ALPHA,[Gp]:s.ONE_MINUS_CONSTANT_ALPHA};function D(I,at,W,j,ut,dt,jt,Ce,li,te){if(I===Xe){_===!0&&(ot(s.BLEND),_=!1);return}if(_===!1&&(gt(s.BLEND),_=!0),I!==ed){if(I!==g||te!==L){if((m!==Ni||x!==Ni)&&(s.blendEquation(s.FUNC_ADD),m=Ni,x=Ni),te)switch(I){case Is:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case jn:s.blendFunc(s.ONE,s.ONE);break;case vh:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Mh:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Is:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case jn:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case vh:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Mh:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}d=null,M=null,y=null,C=null,T.set(0,0,0),b=0,g=I,L=te}return}ut=ut||at,dt=dt||W,jt=jt||j,(at!==m||ut!==x)&&(s.blendEquationSeparate(Qt[at],Qt[ut]),m=at,x=ut),(W!==d||j!==M||dt!==y||jt!==C)&&(s.blendFuncSeparate(qt[W],qt[j],qt[dt],qt[jt]),d=W,M=j,y=dt,C=jt),(Ce.equals(T)===!1||li!==b)&&(s.blendColor(Ce.r,Ce.g,Ce.b,li),T.copy(Ce),b=li),g=I,L=!1}function Ge(I,at){I.side===Ye?ot(s.CULL_FACE):gt(s.CULL_FACE);let W=I.side===ei;at&&(W=!W),Wt(W),I.blending===Is&&I.transparent===!1?D(Xe):D(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),r.setFunc(I.depthFunc),r.setTest(I.depthTest),r.setMask(I.depthWrite),n.setMask(I.colorWrite);const j=I.stencilWrite;o.setTest(j),j&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),oe(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?gt(s.SAMPLE_ALPHA_TO_COVERAGE):ot(s.SAMPLE_ALPHA_TO_COVERAGE)}function Wt(I){O!==I&&(I?s.frontFace(s.CW):s.frontFace(s.CCW),O=I)}function Yt(I){I!==bp?(gt(s.CULL_FACE),I!==v&&(I===_h?s.cullFace(s.BACK):I===Ap?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):ot(s.CULL_FACE),v=I}function Ct(I){I!==S&&(X&&s.lineWidth(I),S=I)}function oe(I,at,W){I?(gt(s.POLYGON_OFFSET_FILL),(P!==at||U!==W)&&(s.polygonOffset(at,W),P=at,U=W)):ot(s.POLYGON_OFFSET_FILL)}function Pt(I){I?gt(s.SCISSOR_TEST):ot(s.SCISSOR_TEST)}function R(I){I===void 0&&(I=s.TEXTURE0+G-1),V!==I&&(s.activeTexture(I),V=I)}function E(I,at,W){W===void 0&&(V===null?W=s.TEXTURE0+G-1:W=V);let j=Q[W];j===void 0&&(j={type:void 0,texture:void 0},Q[W]=j),(j.type!==I||j.texture!==at)&&(V!==W&&(s.activeTexture(W),V=W),s.bindTexture(I,at||tt[I]),j.type=I,j.texture=at)}function z(){const I=Q[V];I!==void 0&&I.type!==void 0&&(s.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Z(){try{s.compressedTexImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function J(){try{s.compressedTexImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function K(){try{s.texSubImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Mt(){try{s.texSubImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function rt(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ct(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Xt(){try{s.texStorage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function et(){try{s.texStorage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ht(){try{s.texImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Lt(){try{s.texImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Dt(I){Gt.equals(I)===!1&&(s.scissor(I.x,I.y,I.z,I.w),Gt.copy(I))}function _t(I){Zt.equals(I)===!1&&(s.viewport(I.x,I.y,I.z,I.w),Zt.copy(I))}function $t(I,at){let W=l.get(at);W===void 0&&(W=new WeakMap,l.set(at,W));let j=W.get(I);j===void 0&&(j=s.getUniformBlockIndex(at,I.name),W.set(I,j))}function Ft(I,at){const j=l.get(at).get(I);a.get(at)!==j&&(s.uniformBlockBinding(at,j,I.__bindingPointIndex),a.set(at,j))}function Jt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),c={},V=null,Q={},h={},f=new WeakMap,u=[],p=null,_=!1,g=null,m=null,d=null,M=null,x=null,y=null,C=null,T=new St(0,0,0),b=0,L=!1,O=null,v=null,S=null,P=null,U=null,Gt.set(0,0,s.canvas.width,s.canvas.height),Zt.set(0,0,s.canvas.width,s.canvas.height),n.reset(),r.reset(),o.reset()}return{buffers:{color:n,depth:r,stencil:o},enable:gt,disable:ot,bindFramebuffer:At,drawBuffers:Et,useProgram:Ot,setBlending:D,setMaterial:Ge,setFlipSided:Wt,setCullFace:Yt,setLineWidth:Ct,setPolygonOffset:oe,setScissorTest:Pt,activeTexture:R,bindTexture:E,unbindTexture:z,compressedTexImage2D:Z,compressedTexImage3D:J,texImage2D:ht,texImage3D:Lt,updateUBOMapping:$t,uniformBlockBinding:Ft,texStorage2D:Xt,texStorage3D:et,texSubImage2D:K,texSubImage3D:Mt,compressedTexSubImage2D:rt,compressedTexSubImage3D:ct,scissor:Dt,viewport:_t,reset:Jt}}function cu(s,t,e,i){const n=xM(i);switch(e){case ud:return s*t;case dd:return s*t;case pd:return s*t*2;case Gc:return s*t/n.components*n.byteLength;case Vc:return s*t/n.components*n.byteLength;case md:return s*t*2/n.components*n.byteLength;case Wc:return s*t*2/n.components*n.byteLength;case fd:return s*t*3/n.components*n.byteLength;case Ti:return s*t*4/n.components*n.byteLength;case Xc:return s*t*4/n.components*n.byteLength;case Go:case Vo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Wo:case Xo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case ql:case $l:return Math.max(s,16)*Math.max(t,8)/4;case Xl:case Yl:return Math.max(s,8)*Math.max(t,8)/2;case Kl:case Zl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case jl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Jl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ql:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case tc:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case ec:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case ic:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case nc:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case sc:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case rc:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case oc:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case ac:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case lc:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case cc:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case hc:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case uc:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case qo:case fc:case dc:return Math.ceil(s/4)*Math.ceil(t/4)*16;case gd:case pc:return Math.ceil(s/4)*Math.ceil(t/4)*8;case mc:case gc:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function xM(s){switch(s){case Ki:case ld:return{byteLength:1,components:1};case Rr:case cd:case Bi:return{byteLength:2,components:1};case kc:case Hc:return{byteLength:2,components:4};case Jn:case Bc:case qi:return{byteLength:4,components:1};case hd:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function SM(s,t,e,i,n,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new lt,h=new WeakMap;let f;const u=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(R,E){return p?new OffscreenCanvas(R,E):ia("canvas")}function g(R,E,z){let Z=1;const J=Pt(R);if((J.width>z||J.height>z)&&(Z=z/Math.max(J.width,J.height)),Z<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const K=Math.floor(Z*J.width),Mt=Math.floor(Z*J.height);f===void 0&&(f=_(K,Mt));const rt=E?_(K,Mt):f;return rt.width=K,rt.height=Mt,rt.getContext("2d").drawImage(R,0,0,K,Mt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+K+"x"+Mt+")."),rt}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),R;return R}function m(R){return R.generateMipmaps&&R.minFilter!==ti&&R.minFilter!==Fi}function d(R){s.generateMipmap(R)}function M(R,E,z,Z,J=!1){if(R!==null){if(s[R]!==void 0)return s[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let K=E;if(E===s.RED&&(z===s.FLOAT&&(K=s.R32F),z===s.HALF_FLOAT&&(K=s.R16F),z===s.UNSIGNED_BYTE&&(K=s.R8)),E===s.RED_INTEGER&&(z===s.UNSIGNED_BYTE&&(K=s.R8UI),z===s.UNSIGNED_SHORT&&(K=s.R16UI),z===s.UNSIGNED_INT&&(K=s.R32UI),z===s.BYTE&&(K=s.R8I),z===s.SHORT&&(K=s.R16I),z===s.INT&&(K=s.R32I)),E===s.RG&&(z===s.FLOAT&&(K=s.RG32F),z===s.HALF_FLOAT&&(K=s.RG16F),z===s.UNSIGNED_BYTE&&(K=s.RG8)),E===s.RG_INTEGER&&(z===s.UNSIGNED_BYTE&&(K=s.RG8UI),z===s.UNSIGNED_SHORT&&(K=s.RG16UI),z===s.UNSIGNED_INT&&(K=s.RG32UI),z===s.BYTE&&(K=s.RG8I),z===s.SHORT&&(K=s.RG16I),z===s.INT&&(K=s.RG32I)),E===s.RGB_INTEGER&&(z===s.UNSIGNED_BYTE&&(K=s.RGB8UI),z===s.UNSIGNED_SHORT&&(K=s.RGB16UI),z===s.UNSIGNED_INT&&(K=s.RGB32UI),z===s.BYTE&&(K=s.RGB8I),z===s.SHORT&&(K=s.RGB16I),z===s.INT&&(K=s.RGB32I)),E===s.RGBA_INTEGER&&(z===s.UNSIGNED_BYTE&&(K=s.RGBA8UI),z===s.UNSIGNED_SHORT&&(K=s.RGBA16UI),z===s.UNSIGNED_INT&&(K=s.RGBA32UI),z===s.BYTE&&(K=s.RGBA8I),z===s.SHORT&&(K=s.RGBA16I),z===s.INT&&(K=s.RGBA32I)),E===s.RGB&&z===s.UNSIGNED_INT_5_9_9_9_REV&&(K=s.RGB9_E5),E===s.RGBA){const Mt=J?Jo:ie.getTransfer(Z);z===s.FLOAT&&(K=s.RGBA32F),z===s.HALF_FLOAT&&(K=s.RGBA16F),z===s.UNSIGNED_BYTE&&(K=Mt===ue?s.SRGB8_ALPHA8:s.RGBA8),z===s.UNSIGNED_SHORT_4_4_4_4&&(K=s.RGBA4),z===s.UNSIGNED_SHORT_5_5_5_1&&(K=s.RGB5_A1)}return(K===s.R16F||K===s.R32F||K===s.RG16F||K===s.RG32F||K===s.RGBA16F||K===s.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function x(R,E){let z;return R?E===null||E===Jn||E===Qn?z=s.DEPTH24_STENCIL8:E===qi?z=s.DEPTH32F_STENCIL8:E===Rr&&(z=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===Jn||E===Qn?z=s.DEPTH_COMPONENT24:E===qi?z=s.DEPTH_COMPONENT32F:E===Rr&&(z=s.DEPTH_COMPONENT16),z}function y(R,E){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==ti&&R.minFilter!==Fi?Math.log2(Math.max(E.width,E.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?E.mipmaps.length:1}function C(R){const E=R.target;E.removeEventListener("dispose",C),b(E),E.isVideoTexture&&h.delete(E)}function T(R){const E=R.target;E.removeEventListener("dispose",T),O(E)}function b(R){const E=i.get(R);if(E.__webglInit===void 0)return;const z=R.source,Z=u.get(z);if(Z){const J=Z[E.__cacheKey];J.usedTimes--,J.usedTimes===0&&L(R),Object.keys(Z).length===0&&u.delete(z)}i.remove(R)}function L(R){const E=i.get(R);s.deleteTexture(E.__webglTexture);const z=R.source,Z=u.get(z);delete Z[E.__cacheKey],o.memory.textures--}function O(R){const E=i.get(R);if(R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(E.__webglFramebuffer[Z]))for(let J=0;J<E.__webglFramebuffer[Z].length;J++)s.deleteFramebuffer(E.__webglFramebuffer[Z][J]);else s.deleteFramebuffer(E.__webglFramebuffer[Z]);E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer[Z])}else{if(Array.isArray(E.__webglFramebuffer))for(let Z=0;Z<E.__webglFramebuffer.length;Z++)s.deleteFramebuffer(E.__webglFramebuffer[Z]);else s.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&s.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let Z=0;Z<E.__webglColorRenderbuffer.length;Z++)E.__webglColorRenderbuffer[Z]&&s.deleteRenderbuffer(E.__webglColorRenderbuffer[Z]);E.__webglDepthRenderbuffer&&s.deleteRenderbuffer(E.__webglDepthRenderbuffer)}const z=R.textures;for(let Z=0,J=z.length;Z<J;Z++){const K=i.get(z[Z]);K.__webglTexture&&(s.deleteTexture(K.__webglTexture),o.memory.textures--),i.remove(z[Z])}i.remove(R)}let v=0;function S(){v=0}function P(){const R=v;return R>=n.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+n.maxTextures),v+=1,R}function U(R){const E=[];return E.push(R.wrapS),E.push(R.wrapT),E.push(R.wrapR||0),E.push(R.magFilter),E.push(R.minFilter),E.push(R.anisotropy),E.push(R.internalFormat),E.push(R.format),E.push(R.type),E.push(R.generateMipmaps),E.push(R.premultiplyAlpha),E.push(R.flipY),E.push(R.unpackAlignment),E.push(R.colorSpace),E.join()}function G(R,E){const z=i.get(R);if(R.isVideoTexture&&Ct(R),R.isRenderTargetTexture===!1&&R.version>0&&z.__version!==R.version){const Z=R.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Zt(z,R,E);return}}e.bindTexture(s.TEXTURE_2D,z.__webglTexture,s.TEXTURE0+E)}function X(R,E){const z=i.get(R);if(R.version>0&&z.__version!==R.version){Zt(z,R,E);return}e.bindTexture(s.TEXTURE_2D_ARRAY,z.__webglTexture,s.TEXTURE0+E)}function B(R,E){const z=i.get(R);if(R.version>0&&z.__version!==R.version){Zt(z,R,E);return}e.bindTexture(s.TEXTURE_3D,z.__webglTexture,s.TEXTURE0+E)}function $(R,E){const z=i.get(R);if(R.version>0&&z.__version!==R.version){Y(z,R,E);return}e.bindTexture(s.TEXTURE_CUBE_MAP,z.__webglTexture,s.TEXTURE0+E)}const V={[hn]:s.REPEAT,[Yn]:s.CLAMP_TO_EDGE,[Wl]:s.MIRRORED_REPEAT},Q={[ti]:s.NEAREST,[qp]:s.NEAREST_MIPMAP_NEAREST,[Vr]:s.NEAREST_MIPMAP_LINEAR,[Fi]:s.LINEAR,[xa]:s.LINEAR_MIPMAP_NEAREST,[bn]:s.LINEAR_MIPMAP_LINEAR},nt={[Zp]:s.NEVER,[im]:s.ALWAYS,[jp]:s.LESS,[_d]:s.LEQUAL,[Jp]:s.EQUAL,[em]:s.GEQUAL,[Qp]:s.GREATER,[tm]:s.NOTEQUAL};function mt(R,E){if(E.type===qi&&t.has("OES_texture_float_linear")===!1&&(E.magFilter===Fi||E.magFilter===xa||E.magFilter===Vr||E.magFilter===bn||E.minFilter===Fi||E.minFilter===xa||E.minFilter===Vr||E.minFilter===bn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,V[E.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,V[E.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,V[E.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,Q[E.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,Q[E.minFilter]),E.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,nt[E.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===ti||E.minFilter!==Vr&&E.minFilter!==bn||E.type===qi&&t.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||i.get(E).__currentAnisotropy){const z=t.get("EXT_texture_filter_anisotropic");s.texParameterf(R,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,n.getMaxAnisotropy())),i.get(E).__currentAnisotropy=E.anisotropy}}}function Gt(R,E){let z=!1;R.__webglInit===void 0&&(R.__webglInit=!0,E.addEventListener("dispose",C));const Z=E.source;let J=u.get(Z);J===void 0&&(J={},u.set(Z,J));const K=U(E);if(K!==R.__cacheKey){J[K]===void 0&&(J[K]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,z=!0),J[K].usedTimes++;const Mt=J[R.__cacheKey];Mt!==void 0&&(J[R.__cacheKey].usedTimes--,Mt.usedTimes===0&&L(E)),R.__cacheKey=K,R.__webglTexture=J[K].texture}return z}function Zt(R,E,z){let Z=s.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(Z=s.TEXTURE_2D_ARRAY),E.isData3DTexture&&(Z=s.TEXTURE_3D);const J=Gt(R,E),K=E.source;e.bindTexture(Z,R.__webglTexture,s.TEXTURE0+z);const Mt=i.get(K);if(K.version!==Mt.__version||J===!0){e.activeTexture(s.TEXTURE0+z);const rt=ie.getPrimaries(ie.workingColorSpace),ct=E.colorSpace===Tn?null:ie.getPrimaries(E.colorSpace),Xt=E.colorSpace===Tn||rt===ct?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Xt);let et=g(E.image,!1,n.maxTextureSize);et=oe(E,et);const ht=r.convert(E.format,E.colorSpace),Lt=r.convert(E.type);let Dt=M(E.internalFormat,ht,Lt,E.colorSpace,E.isVideoTexture);mt(Z,E);let _t;const $t=E.mipmaps,Ft=E.isVideoTexture!==!0,Jt=Mt.__version===void 0||J===!0,I=K.dataReady,at=y(E,et);if(E.isDepthTexture)Dt=x(E.format===ts,E.type),Jt&&(Ft?e.texStorage2D(s.TEXTURE_2D,1,Dt,et.width,et.height):e.texImage2D(s.TEXTURE_2D,0,Dt,et.width,et.height,0,ht,Lt,null));else if(E.isDataTexture)if($t.length>0){Ft&&Jt&&e.texStorage2D(s.TEXTURE_2D,at,Dt,$t[0].width,$t[0].height);for(let W=0,j=$t.length;W<j;W++)_t=$t[W],Ft?I&&e.texSubImage2D(s.TEXTURE_2D,W,0,0,_t.width,_t.height,ht,Lt,_t.data):e.texImage2D(s.TEXTURE_2D,W,Dt,_t.width,_t.height,0,ht,Lt,_t.data);E.generateMipmaps=!1}else Ft?(Jt&&e.texStorage2D(s.TEXTURE_2D,at,Dt,et.width,et.height),I&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,et.width,et.height,ht,Lt,et.data)):e.texImage2D(s.TEXTURE_2D,0,Dt,et.width,et.height,0,ht,Lt,et.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){Ft&&Jt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,at,Dt,$t[0].width,$t[0].height,et.depth);for(let W=0,j=$t.length;W<j;W++)if(_t=$t[W],E.format!==Ti)if(ht!==null)if(Ft){if(I)if(E.layerUpdates.size>0){const ut=cu(_t.width,_t.height,E.format,E.type);for(const dt of E.layerUpdates){const jt=_t.data.subarray(dt*ut/_t.data.BYTES_PER_ELEMENT,(dt+1)*ut/_t.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,W,0,0,dt,_t.width,_t.height,1,ht,jt,0,0)}E.clearLayerUpdates()}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,W,0,0,0,_t.width,_t.height,et.depth,ht,_t.data,0,0)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,W,Dt,_t.width,_t.height,et.depth,0,_t.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ft?I&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,W,0,0,0,_t.width,_t.height,et.depth,ht,Lt,_t.data):e.texImage3D(s.TEXTURE_2D_ARRAY,W,Dt,_t.width,_t.height,et.depth,0,ht,Lt,_t.data)}else{Ft&&Jt&&e.texStorage2D(s.TEXTURE_2D,at,Dt,$t[0].width,$t[0].height);for(let W=0,j=$t.length;W<j;W++)_t=$t[W],E.format!==Ti?ht!==null?Ft?I&&e.compressedTexSubImage2D(s.TEXTURE_2D,W,0,0,_t.width,_t.height,ht,_t.data):e.compressedTexImage2D(s.TEXTURE_2D,W,Dt,_t.width,_t.height,0,_t.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ft?I&&e.texSubImage2D(s.TEXTURE_2D,W,0,0,_t.width,_t.height,ht,Lt,_t.data):e.texImage2D(s.TEXTURE_2D,W,Dt,_t.width,_t.height,0,ht,Lt,_t.data)}else if(E.isDataArrayTexture)if(Ft){if(Jt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,at,Dt,et.width,et.height,et.depth),I)if(E.layerUpdates.size>0){const W=cu(et.width,et.height,E.format,E.type);for(const j of E.layerUpdates){const ut=et.data.subarray(j*W/et.data.BYTES_PER_ELEMENT,(j+1)*W/et.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,j,et.width,et.height,1,ht,Lt,ut)}E.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,et.width,et.height,et.depth,ht,Lt,et.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Dt,et.width,et.height,et.depth,0,ht,Lt,et.data);else if(E.isData3DTexture)Ft?(Jt&&e.texStorage3D(s.TEXTURE_3D,at,Dt,et.width,et.height,et.depth),I&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,et.width,et.height,et.depth,ht,Lt,et.data)):e.texImage3D(s.TEXTURE_3D,0,Dt,et.width,et.height,et.depth,0,ht,Lt,et.data);else if(E.isFramebufferTexture){if(Jt)if(Ft)e.texStorage2D(s.TEXTURE_2D,at,Dt,et.width,et.height);else{let W=et.width,j=et.height;for(let ut=0;ut<at;ut++)e.texImage2D(s.TEXTURE_2D,ut,Dt,W,j,0,ht,Lt,null),W>>=1,j>>=1}}else if($t.length>0){if(Ft&&Jt){const W=Pt($t[0]);e.texStorage2D(s.TEXTURE_2D,at,Dt,W.width,W.height)}for(let W=0,j=$t.length;W<j;W++)_t=$t[W],Ft?I&&e.texSubImage2D(s.TEXTURE_2D,W,0,0,ht,Lt,_t):e.texImage2D(s.TEXTURE_2D,W,Dt,ht,Lt,_t);E.generateMipmaps=!1}else if(Ft){if(Jt){const W=Pt(et);e.texStorage2D(s.TEXTURE_2D,at,Dt,W.width,W.height)}I&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,ht,Lt,et)}else e.texImage2D(s.TEXTURE_2D,0,Dt,ht,Lt,et);m(E)&&d(Z),Mt.__version=K.version,E.onUpdate&&E.onUpdate(E)}R.__version=E.version}function Y(R,E,z){if(E.image.length!==6)return;const Z=Gt(R,E),J=E.source;e.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+z);const K=i.get(J);if(J.version!==K.__version||Z===!0){e.activeTexture(s.TEXTURE0+z);const Mt=ie.getPrimaries(ie.workingColorSpace),rt=E.colorSpace===Tn?null:ie.getPrimaries(E.colorSpace),ct=E.colorSpace===Tn||Mt===rt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ct);const Xt=E.isCompressedTexture||E.image[0].isCompressedTexture,et=E.image[0]&&E.image[0].isDataTexture,ht=[];for(let j=0;j<6;j++)!Xt&&!et?ht[j]=g(E.image[j],!0,n.maxCubemapSize):ht[j]=et?E.image[j].image:E.image[j],ht[j]=oe(E,ht[j]);const Lt=ht[0],Dt=r.convert(E.format,E.colorSpace),_t=r.convert(E.type),$t=M(E.internalFormat,Dt,_t,E.colorSpace),Ft=E.isVideoTexture!==!0,Jt=K.__version===void 0||Z===!0,I=J.dataReady;let at=y(E,Lt);mt(s.TEXTURE_CUBE_MAP,E);let W;if(Xt){Ft&&Jt&&e.texStorage2D(s.TEXTURE_CUBE_MAP,at,$t,Lt.width,Lt.height);for(let j=0;j<6;j++){W=ht[j].mipmaps;for(let ut=0;ut<W.length;ut++){const dt=W[ut];E.format!==Ti?Dt!==null?Ft?I&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ut,0,0,dt.width,dt.height,Dt,dt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ut,$t,dt.width,dt.height,0,dt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ft?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ut,0,0,dt.width,dt.height,Dt,_t,dt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ut,$t,dt.width,dt.height,0,Dt,_t,dt.data)}}}else{if(W=E.mipmaps,Ft&&Jt){W.length>0&&at++;const j=Pt(ht[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,at,$t,j.width,j.height)}for(let j=0;j<6;j++)if(et){Ft?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,ht[j].width,ht[j].height,Dt,_t,ht[j].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,$t,ht[j].width,ht[j].height,0,Dt,_t,ht[j].data);for(let ut=0;ut<W.length;ut++){const jt=W[ut].image[j].image;Ft?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ut+1,0,0,jt.width,jt.height,Dt,_t,jt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ut+1,$t,jt.width,jt.height,0,Dt,_t,jt.data)}}else{Ft?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,Dt,_t,ht[j]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,$t,Dt,_t,ht[j]);for(let ut=0;ut<W.length;ut++){const dt=W[ut];Ft?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ut+1,0,0,Dt,_t,dt.image[j]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ut+1,$t,Dt,_t,dt.image[j])}}}m(E)&&d(s.TEXTURE_CUBE_MAP),K.__version=J.version,E.onUpdate&&E.onUpdate(E)}R.__version=E.version}function tt(R,E,z,Z,J,K){const Mt=r.convert(z.format,z.colorSpace),rt=r.convert(z.type),ct=M(z.internalFormat,Mt,rt,z.colorSpace);if(!i.get(E).__hasExternalTextures){const et=Math.max(1,E.width>>K),ht=Math.max(1,E.height>>K);J===s.TEXTURE_3D||J===s.TEXTURE_2D_ARRAY?e.texImage3D(J,K,ct,et,ht,E.depth,0,Mt,rt,null):e.texImage2D(J,K,ct,et,ht,0,Mt,rt,null)}e.bindFramebuffer(s.FRAMEBUFFER,R),Yt(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Z,J,i.get(z).__webglTexture,0,Wt(E)):(J===s.TEXTURE_2D||J>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Z,J,i.get(z).__webglTexture,K),e.bindFramebuffer(s.FRAMEBUFFER,null)}function gt(R,E,z){if(s.bindRenderbuffer(s.RENDERBUFFER,R),E.depthBuffer){const Z=E.depthTexture,J=Z&&Z.isDepthTexture?Z.type:null,K=x(E.stencilBuffer,J),Mt=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,rt=Wt(E);Yt(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,rt,K,E.width,E.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,rt,K,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,K,E.width,E.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Mt,s.RENDERBUFFER,R)}else{const Z=E.textures;for(let J=0;J<Z.length;J++){const K=Z[J],Mt=r.convert(K.format,K.colorSpace),rt=r.convert(K.type),ct=M(K.internalFormat,Mt,rt,K.colorSpace),Xt=Wt(E);z&&Yt(E)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Xt,ct,E.width,E.height):Yt(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Xt,ct,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,ct,E.width,E.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ot(R,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(s.FRAMEBUFFER,R),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(E.depthTexture).__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),G(E.depthTexture,0);const Z=i.get(E.depthTexture).__webglTexture,J=Wt(E);if(E.depthTexture.format===Us)Yt(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Z,0,J):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Z,0);else if(E.depthTexture.format===ts)Yt(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Z,0,J):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function At(R){const E=i.get(R),z=R.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==R.depthTexture){const Z=R.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),Z){const J=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,Z.removeEventListener("dispose",J)};Z.addEventListener("dispose",J),E.__depthDisposeCallback=J}E.__boundDepthTexture=Z}if(R.depthTexture&&!E.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");ot(E.__webglFramebuffer,R)}else if(z){E.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(e.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer[Z]),E.__webglDepthbuffer[Z]===void 0)E.__webglDepthbuffer[Z]=s.createRenderbuffer(),gt(E.__webglDepthbuffer[Z],R,!1);else{const J=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,K=E.__webglDepthbuffer[Z];s.bindRenderbuffer(s.RENDERBUFFER,K),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,K)}}else if(e.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=s.createRenderbuffer(),gt(E.__webglDepthbuffer,R,!1);else{const Z=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,J=E.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,J),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,J)}e.bindFramebuffer(s.FRAMEBUFFER,null)}function Et(R,E,z){const Z=i.get(R);E!==void 0&&tt(Z.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),z!==void 0&&At(R)}function Ot(R){const E=R.texture,z=i.get(R),Z=i.get(E);R.addEventListener("dispose",T);const J=R.textures,K=R.isWebGLCubeRenderTarget===!0,Mt=J.length>1;if(Mt||(Z.__webglTexture===void 0&&(Z.__webglTexture=s.createTexture()),Z.__version=E.version,o.memory.textures++),K){z.__webglFramebuffer=[];for(let rt=0;rt<6;rt++)if(E.mipmaps&&E.mipmaps.length>0){z.__webglFramebuffer[rt]=[];for(let ct=0;ct<E.mipmaps.length;ct++)z.__webglFramebuffer[rt][ct]=s.createFramebuffer()}else z.__webglFramebuffer[rt]=s.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){z.__webglFramebuffer=[];for(let rt=0;rt<E.mipmaps.length;rt++)z.__webglFramebuffer[rt]=s.createFramebuffer()}else z.__webglFramebuffer=s.createFramebuffer();if(Mt)for(let rt=0,ct=J.length;rt<ct;rt++){const Xt=i.get(J[rt]);Xt.__webglTexture===void 0&&(Xt.__webglTexture=s.createTexture(),o.memory.textures++)}if(R.samples>0&&Yt(R)===!1){z.__webglMultisampledFramebuffer=s.createFramebuffer(),z.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let rt=0;rt<J.length;rt++){const ct=J[rt];z.__webglColorRenderbuffer[rt]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,z.__webglColorRenderbuffer[rt]);const Xt=r.convert(ct.format,ct.colorSpace),et=r.convert(ct.type),ht=M(ct.internalFormat,Xt,et,ct.colorSpace,R.isXRRenderTarget===!0),Lt=Wt(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,Lt,ht,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.RENDERBUFFER,z.__webglColorRenderbuffer[rt])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(z.__webglDepthRenderbuffer=s.createRenderbuffer(),gt(z.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(K){e.bindTexture(s.TEXTURE_CUBE_MAP,Z.__webglTexture),mt(s.TEXTURE_CUBE_MAP,E);for(let rt=0;rt<6;rt++)if(E.mipmaps&&E.mipmaps.length>0)for(let ct=0;ct<E.mipmaps.length;ct++)tt(z.__webglFramebuffer[rt][ct],R,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+rt,ct);else tt(z.__webglFramebuffer[rt],R,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0);m(E)&&d(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Mt){for(let rt=0,ct=J.length;rt<ct;rt++){const Xt=J[rt],et=i.get(Xt);e.bindTexture(s.TEXTURE_2D,et.__webglTexture),mt(s.TEXTURE_2D,Xt),tt(z.__webglFramebuffer,R,Xt,s.COLOR_ATTACHMENT0+rt,s.TEXTURE_2D,0),m(Xt)&&d(s.TEXTURE_2D)}e.unbindTexture()}else{let rt=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(rt=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(rt,Z.__webglTexture),mt(rt,E),E.mipmaps&&E.mipmaps.length>0)for(let ct=0;ct<E.mipmaps.length;ct++)tt(z.__webglFramebuffer[ct],R,E,s.COLOR_ATTACHMENT0,rt,ct);else tt(z.__webglFramebuffer,R,E,s.COLOR_ATTACHMENT0,rt,0);m(E)&&d(rt),e.unbindTexture()}R.depthBuffer&&At(R)}function Qt(R){const E=R.textures;for(let z=0,Z=E.length;z<Z;z++){const J=E[z];if(m(J)){const K=R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:s.TEXTURE_2D,Mt=i.get(J).__webglTexture;e.bindTexture(K,Mt),d(K),e.unbindTexture()}}}const qt=[],D=[];function Ge(R){if(R.samples>0){if(Yt(R)===!1){const E=R.textures,z=R.width,Z=R.height;let J=s.COLOR_BUFFER_BIT;const K=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Mt=i.get(R),rt=E.length>1;if(rt)for(let ct=0;ct<E.length;ct++)e.bindFramebuffer(s.FRAMEBUFFER,Mt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ct,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,Mt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ct,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,Mt.__webglMultisampledFramebuffer),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,Mt.__webglFramebuffer);for(let ct=0;ct<E.length;ct++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(J|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(J|=s.STENCIL_BUFFER_BIT)),rt){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Mt.__webglColorRenderbuffer[ct]);const Xt=i.get(E[ct]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Xt,0)}s.blitFramebuffer(0,0,z,Z,0,0,z,Z,J,s.NEAREST),l===!0&&(qt.length=0,D.length=0,qt.push(s.COLOR_ATTACHMENT0+ct),R.depthBuffer&&R.resolveDepthBuffer===!1&&(qt.push(K),D.push(K),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,D)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,qt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),rt)for(let ct=0;ct<E.length;ct++){e.bindFramebuffer(s.FRAMEBUFFER,Mt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ct,s.RENDERBUFFER,Mt.__webglColorRenderbuffer[ct]);const Xt=i.get(E[ct]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,Mt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ct,s.TEXTURE_2D,Xt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,Mt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const E=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[E])}}}function Wt(R){return Math.min(n.maxSamples,R.samples)}function Yt(R){const E=i.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function Ct(R){const E=o.render.frame;h.get(R)!==E&&(h.set(R,E),R.update())}function oe(R,E){const z=R.colorSpace,Z=R.format,J=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||z!==Ln&&z!==Tn&&(ie.getTransfer(z)===ue?(Z!==Ti||J!==Ki)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),E}function Pt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=P,this.resetTextureUnits=S,this.setTexture2D=G,this.setTexture2DArray=X,this.setTexture3D=B,this.setTextureCube=$,this.rebindTextures=Et,this.setupRenderTarget=Ot,this.updateRenderTargetMipmap=Qt,this.updateMultisampleRenderTarget=Ge,this.setupDepthRenderbuffer=At,this.setupFrameBufferTexture=tt,this.useMultisampledRTT=Yt}function yM(s,t){function e(i,n=Tn){let r;const o=ie.getTransfer(n);if(i===Ki)return s.UNSIGNED_BYTE;if(i===kc)return s.UNSIGNED_SHORT_4_4_4_4;if(i===Hc)return s.UNSIGNED_SHORT_5_5_5_1;if(i===hd)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===ld)return s.BYTE;if(i===cd)return s.SHORT;if(i===Rr)return s.UNSIGNED_SHORT;if(i===Bc)return s.INT;if(i===Jn)return s.UNSIGNED_INT;if(i===qi)return s.FLOAT;if(i===Bi)return s.HALF_FLOAT;if(i===ud)return s.ALPHA;if(i===fd)return s.RGB;if(i===Ti)return s.RGBA;if(i===dd)return s.LUMINANCE;if(i===pd)return s.LUMINANCE_ALPHA;if(i===Us)return s.DEPTH_COMPONENT;if(i===ts)return s.DEPTH_STENCIL;if(i===Gc)return s.RED;if(i===Vc)return s.RED_INTEGER;if(i===md)return s.RG;if(i===Wc)return s.RG_INTEGER;if(i===Xc)return s.RGBA_INTEGER;if(i===Go||i===Vo||i===Wo||i===Xo)if(o===ue)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Go)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Vo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Wo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Xo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Go)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Vo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Wo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Xo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Xl||i===ql||i===Yl||i===$l)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Xl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ql)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Yl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===$l)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Kl||i===Zl||i===jl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Kl||i===Zl)return o===ue?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===jl)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Jl||i===Ql||i===tc||i===ec||i===ic||i===nc||i===sc||i===rc||i===oc||i===ac||i===lc||i===cc||i===hc||i===uc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Jl)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ql)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===tc)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ec)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ic)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===nc)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===sc)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===rc)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===oc)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ac)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===lc)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===cc)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===hc)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===uc)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===qo||i===fc||i===dc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===qo)return o===ue?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===fc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===dc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===gd||i===pc||i===mc||i===gc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===qo)return r.COMPRESSED_RED_RGTC1_EXT;if(i===pc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===mc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===gc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Qn?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:e}}class EM extends yi{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class fi extends Ae{constructor(){super(),this.isGroup=!0,this.type="Group"}}const wM={type:"move"};class $a{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new fi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new fi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new fi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const g of t.hand.values()){const m=e.getJointPose(g,i),d=this._getHandJoint(c,g);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],u=h.position.distanceTo(f.position),p=.02,_=.005;c.inputState.pinching&&u>p+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=p-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(wM)))}return a!==null&&(a.visible=n!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const i=new fi;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}}const TM=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,bM=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class AM{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,i){if(this.texture===null){const n=new ii,r=t.properties.get(n);r.__webglTexture=e.texture,(e.depthNear!=i.depthNear||e.depthFar!=i.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,i=new ge({vertexShader:TM,fragmentShader:bM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Tt(new qs(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class RM extends Vs{constructor(t,e){super();const i=this;let n=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,f=null,u=null,p=null,_=null;const g=new AM,m=e.getContextAttributes();let d=null,M=null;const x=[],y=[],C=new lt;let T=null;const b=new yi;b.layers.enable(1),b.viewport=new we;const L=new yi;L.layers.enable(2),L.viewport=new we;const O=[b,L],v=new EM;v.layers.enable(1),v.layers.enable(2);let S=null,P=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let tt=x[Y];return tt===void 0&&(tt=new $a,x[Y]=tt),tt.getTargetRaySpace()},this.getControllerGrip=function(Y){let tt=x[Y];return tt===void 0&&(tt=new $a,x[Y]=tt),tt.getGripSpace()},this.getHand=function(Y){let tt=x[Y];return tt===void 0&&(tt=new $a,x[Y]=tt),tt.getHandSpace()};function U(Y){const tt=y.indexOf(Y.inputSource);if(tt===-1)return;const gt=x[tt];gt!==void 0&&(gt.update(Y.inputSource,Y.frame,c||o),gt.dispatchEvent({type:Y.type,data:Y.inputSource}))}function G(){n.removeEventListener("select",U),n.removeEventListener("selectstart",U),n.removeEventListener("selectend",U),n.removeEventListener("squeeze",U),n.removeEventListener("squeezestart",U),n.removeEventListener("squeezeend",U),n.removeEventListener("end",G),n.removeEventListener("inputsourceschange",X);for(let Y=0;Y<x.length;Y++){const tt=y[Y];tt!==null&&(y[Y]=null,x[Y].disconnect(tt))}S=null,P=null,g.reset(),t.setRenderTarget(d),p=null,u=null,f=null,n=null,M=null,Zt.stop(),i.isPresenting=!1,t.setPixelRatio(T),t.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return f},this.getFrame=function(){return _},this.getSession=function(){return n},this.setSession=async function(Y){if(n=Y,n!==null){if(d=t.getRenderTarget(),n.addEventListener("select",U),n.addEventListener("selectstart",U),n.addEventListener("selectend",U),n.addEventListener("squeeze",U),n.addEventListener("squeezestart",U),n.addEventListener("squeezeend",U),n.addEventListener("end",G),n.addEventListener("inputsourceschange",X),m.xrCompatible!==!0&&await e.makeXRCompatible(),T=t.getPixelRatio(),t.getSize(C),n.renderState.layers===void 0){const tt={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(n,e,tt),n.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),M=new vi(p.framebufferWidth,p.framebufferHeight,{format:Ti,type:Ki,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let tt=null,gt=null,ot=null;m.depth&&(ot=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,tt=m.stencil?ts:Us,gt=m.stencil?Qn:Jn);const At={colorFormat:e.RGBA8,depthFormat:ot,scaleFactor:r};f=new XRWebGLBinding(n,e),u=f.createProjectionLayer(At),n.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),M=new vi(u.textureWidth,u.textureHeight,{format:Ti,type:Ki,depthTexture:new Jc(u.textureWidth,u.textureHeight,gt,void 0,void 0,void 0,void 0,void 0,void 0,tt),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await n.requestReferenceSpace(a),Zt.setContext(n),Zt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function X(Y){for(let tt=0;tt<Y.removed.length;tt++){const gt=Y.removed[tt],ot=y.indexOf(gt);ot>=0&&(y[ot]=null,x[ot].disconnect(gt))}for(let tt=0;tt<Y.added.length;tt++){const gt=Y.added[tt];let ot=y.indexOf(gt);if(ot===-1){for(let Et=0;Et<x.length;Et++)if(Et>=y.length){y.push(gt),ot=Et;break}else if(y[Et]===null){y[Et]=gt,ot=Et;break}if(ot===-1)break}const At=x[ot];At&&At.connect(gt)}}const B=new A,$=new A;function V(Y,tt,gt){B.setFromMatrixPosition(tt.matrixWorld),$.setFromMatrixPosition(gt.matrixWorld);const ot=B.distanceTo($),At=tt.projectionMatrix.elements,Et=gt.projectionMatrix.elements,Ot=At[14]/(At[10]-1),Qt=At[14]/(At[10]+1),qt=(At[9]+1)/At[5],D=(At[9]-1)/At[5],Ge=(At[8]-1)/At[0],Wt=(Et[8]+1)/Et[0],Yt=Ot*Ge,Ct=Ot*Wt,oe=ot/(-Ge+Wt),Pt=oe*-Ge;if(tt.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(Pt),Y.translateZ(oe),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),At[10]===-1)Y.projectionMatrix.copy(tt.projectionMatrix),Y.projectionMatrixInverse.copy(tt.projectionMatrixInverse);else{const R=Ot+oe,E=Qt+oe,z=Yt-Pt,Z=Ct+(ot-Pt),J=qt*Qt/E*R,K=D*Qt/E*R;Y.projectionMatrix.makePerspective(z,Z,J,K,R,E),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function Q(Y,tt){tt===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(tt.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(n===null)return;let tt=Y.near,gt=Y.far;g.texture!==null&&(g.depthNear>0&&(tt=g.depthNear),g.depthFar>0&&(gt=g.depthFar)),v.near=L.near=b.near=tt,v.far=L.far=b.far=gt,(S!==v.near||P!==v.far)&&(n.updateRenderState({depthNear:v.near,depthFar:v.far}),S=v.near,P=v.far);const ot=Y.parent,At=v.cameras;Q(v,ot);for(let Et=0;Et<At.length;Et++)Q(At[Et],ot);At.length===2?V(v,b,L):v.projectionMatrix.copy(b.projectionMatrix),nt(Y,v,ot)};function nt(Y,tt,gt){gt===null?Y.matrix.copy(tt.matrixWorld):(Y.matrix.copy(gt.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(tt.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(tt.projectionMatrix),Y.projectionMatrixInverse.copy(tt.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Cr*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function(Y){l=Y,u!==null&&(u.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(v)};let mt=null;function Gt(Y,tt){if(h=tt.getViewerPose(c||o),_=tt,h!==null){const gt=h.views;p!==null&&(t.setRenderTargetFramebuffer(M,p.framebuffer),t.setRenderTarget(M));let ot=!1;gt.length!==v.cameras.length&&(v.cameras.length=0,ot=!0);for(let Et=0;Et<gt.length;Et++){const Ot=gt[Et];let Qt=null;if(p!==null)Qt=p.getViewport(Ot);else{const D=f.getViewSubImage(u,Ot);Qt=D.viewport,Et===0&&(t.setRenderTargetTextures(M,D.colorTexture,u.ignoreDepthValues?void 0:D.depthStencilTexture),t.setRenderTarget(M))}let qt=O[Et];qt===void 0&&(qt=new yi,qt.layers.enable(Et),qt.viewport=new we,O[Et]=qt),qt.matrix.fromArray(Ot.transform.matrix),qt.matrix.decompose(qt.position,qt.quaternion,qt.scale),qt.projectionMatrix.fromArray(Ot.projectionMatrix),qt.projectionMatrixInverse.copy(qt.projectionMatrix).invert(),qt.viewport.set(Qt.x,Qt.y,Qt.width,Qt.height),Et===0&&(v.matrix.copy(qt.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),ot===!0&&v.cameras.push(qt)}const At=n.enabledFeatures;if(At&&At.includes("depth-sensing")){const Et=f.getDepthInformation(gt[0]);Et&&Et.isValid&&Et.texture&&g.init(t,Et,n.renderState)}}for(let gt=0;gt<x.length;gt++){const ot=y[gt],At=x[gt];ot!==null&&At!==void 0&&At.update(ot,tt,c||o)}mt&&mt(Y,tt),tt.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:tt}),_=null}const Zt=new Cd;Zt.setAnimationLoop(Gt),this.setAnimationLoop=function(Y){mt=Y},this.dispose=function(){}}}const Bn=new bi,CM=new Ht;function PM(s,t){function e(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,bd(s)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function n(m,d,M,x,y){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),f(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),u(m,d),d.isMeshPhysicalMaterial&&p(m,d,y)):d.isMeshMatcapMaterial?(r(m,d),_(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),g(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,M,x):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,e(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===ei&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,e(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===ei&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,e(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,e(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const M=t.get(d),x=M.envMap,y=M.envMapRotation;x&&(m.envMap.value=x,Bn.copy(y),Bn.x*=-1,Bn.y*=-1,Bn.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Bn.y*=-1,Bn.z*=-1),m.envMapRotation.value.setFromMatrix4(CM.makeRotationFromEuler(Bn)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,M,x){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*M,m.scale.value=x*.5,d.map&&(m.map.value=d.map,e(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function f(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function u(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,M){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===ei&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,d){d.matcap&&(m.matcap.value=d.matcap)}function g(m,d){const M=t.get(d).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function LM(s,t,e,i){let n={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,x){const y=x.program;i.uniformBlockBinding(M,y)}function c(M,x){let y=n[M.id];y===void 0&&(_(M),y=h(M),n[M.id]=y,M.addEventListener("dispose",m));const C=x.program;i.updateUBOMapping(M,C);const T=t.render.frame;r[M.id]!==T&&(u(M),r[M.id]=T)}function h(M){const x=f();M.__bindingPointIndex=x;const y=s.createBuffer(),C=M.__size,T=M.usage;return s.bindBuffer(s.UNIFORM_BUFFER,y),s.bufferData(s.UNIFORM_BUFFER,C,T),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,x,y),y}function f(){for(let M=0;M<a;M++)if(o.indexOf(M)===-1)return o.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(M){const x=n[M.id],y=M.uniforms,C=M.__cache;s.bindBuffer(s.UNIFORM_BUFFER,x);for(let T=0,b=y.length;T<b;T++){const L=Array.isArray(y[T])?y[T]:[y[T]];for(let O=0,v=L.length;O<v;O++){const S=L[O];if(p(S,T,O,C)===!0){const P=S.__offset,U=Array.isArray(S.value)?S.value:[S.value];let G=0;for(let X=0;X<U.length;X++){const B=U[X],$=g(B);typeof B=="number"||typeof B=="boolean"?(S.__data[0]=B,s.bufferSubData(s.UNIFORM_BUFFER,P+G,S.__data)):B.isMatrix3?(S.__data[0]=B.elements[0],S.__data[1]=B.elements[1],S.__data[2]=B.elements[2],S.__data[3]=0,S.__data[4]=B.elements[3],S.__data[5]=B.elements[4],S.__data[6]=B.elements[5],S.__data[7]=0,S.__data[8]=B.elements[6],S.__data[9]=B.elements[7],S.__data[10]=B.elements[8],S.__data[11]=0):(B.toArray(S.__data,G),G+=$.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,P,S.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function p(M,x,y,C){const T=M.value,b=x+"_"+y;if(C[b]===void 0)return typeof T=="number"||typeof T=="boolean"?C[b]=T:C[b]=T.clone(),!0;{const L=C[b];if(typeof T=="number"||typeof T=="boolean"){if(L!==T)return C[b]=T,!0}else if(L.equals(T)===!1)return L.copy(T),!0}return!1}function _(M){const x=M.uniforms;let y=0;const C=16;for(let b=0,L=x.length;b<L;b++){const O=Array.isArray(x[b])?x[b]:[x[b]];for(let v=0,S=O.length;v<S;v++){const P=O[v],U=Array.isArray(P.value)?P.value:[P.value];for(let G=0,X=U.length;G<X;G++){const B=U[G],$=g(B),V=y%C,Q=V%$.boundary,nt=V+Q;y+=Q,nt!==0&&C-nt<$.storage&&(y+=C-nt),P.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),P.__offset=y,y+=$.storage}}}const T=y%C;return T>0&&(y+=C-T),M.__size=y,M.__cache={},this}function g(M){const x={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(x.boundary=4,x.storage=4):M.isVector2?(x.boundary=8,x.storage=8):M.isVector3||M.isColor?(x.boundary=16,x.storage=12):M.isVector4?(x.boundary=16,x.storage=16):M.isMatrix3?(x.boundary=48,x.storage=48):M.isMatrix4?(x.boundary=64,x.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),x}function m(M){const x=M.target;x.removeEventListener("dispose",m);const y=o.indexOf(x.__bindingPointIndex);o.splice(y,1),s.deleteBuffer(n[x.id]),delete n[x.id],delete r[x.id]}function d(){for(const M in n)s.deleteBuffer(n[M]);o=[],n={},r={}}return{bind:l,update:c,dispose:d}}class DM{constructor(t={}){const{canvas:e=xm(),context:i=null,depth:n=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1}=t;this.isWebGLRenderer=!0;let u;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");u=i.getContextAttributes().alpha}else u=o;const p=new Uint32Array(4),_=new Int32Array(4);let g=null,m=null;const d=[],M=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=ui,this.toneMapping=Rn,this.toneMappingExposure=1;const x=this;let y=!1,C=0,T=0,b=null,L=-1,O=null;const v=new we,S=new we;let P=null;const U=new St(0);let G=0,X=e.width,B=e.height,$=1,V=null,Q=null;const nt=new we(0,0,X,B),mt=new we(0,0,X,B);let Gt=!1;const Zt=new Kc;let Y=!1,tt=!1;const gt=new Ht,ot=new Ht,At=new A,Et=new we,Ot={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Qt=!1;function qt(){return b===null?$:1}let D=i;function Ge(w,N){return e.getContext(w,N)}try{const w={alpha:!0,depth:n,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Fc}`),e.addEventListener("webglcontextlost",j,!1),e.addEventListener("webglcontextrestored",ut,!1),e.addEventListener("webglcontextcreationerror",dt,!1),D===null){const N="webgl2";if(D=Ge(N,w),D===null)throw Ge(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let Wt,Yt,Ct,oe,Pt,R,E,z,Z,J,K,Mt,rt,ct,Xt,et,ht,Lt,Dt,_t,$t,Ft,Jt,I;function at(){Wt=new O_(D),Wt.init(),Ft=new yM(D,Wt),Yt=new L_(D,Wt,t,Ft),Ct=new MM(D),Yt.reverseDepthBuffer&&Ct.buffers.depth.setReversed(!0),oe=new k_(D),Pt=new sM,R=new SM(D,Wt,Ct,Pt,Yt,Ft,oe),E=new I_(x),z=new F_(x),Z=new Ym(D),Jt=new C_(D,Z),J=new z_(D,Z,oe,Jt),K=new G_(D,J,Z,oe),Dt=new H_(D,Yt,R),et=new D_(Pt),Mt=new nM(x,E,z,Wt,Yt,Jt,et),rt=new PM(x,Pt),ct=new oM,Xt=new fM(Wt),Lt=new R_(x,E,z,Ct,K,u,l),ht=new _M(x,K,Yt),I=new LM(D,oe,Yt,Ct),_t=new P_(D,Wt,oe),$t=new B_(D,Wt,oe),oe.programs=Mt.programs,x.capabilities=Yt,x.extensions=Wt,x.properties=Pt,x.renderLists=ct,x.shadowMap=ht,x.state=Ct,x.info=oe}at();const W=new RM(x,D);this.xr=W,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const w=Wt.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=Wt.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(w){w!==void 0&&($=w,this.setSize(X,B,!1))},this.getSize=function(w){return w.set(X,B)},this.setSize=function(w,N,k=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=w,B=N,e.width=Math.floor(w*$),e.height=Math.floor(N*$),k===!0&&(e.style.width=w+"px",e.style.height=N+"px"),this.setViewport(0,0,w,N)},this.getDrawingBufferSize=function(w){return w.set(X*$,B*$).floor()},this.setDrawingBufferSize=function(w,N,k){X=w,B=N,$=k,e.width=Math.floor(w*k),e.height=Math.floor(N*k),this.setViewport(0,0,w,N)},this.getCurrentViewport=function(w){return w.copy(v)},this.getViewport=function(w){return w.copy(nt)},this.setViewport=function(w,N,k,H){w.isVector4?nt.set(w.x,w.y,w.z,w.w):nt.set(w,N,k,H),Ct.viewport(v.copy(nt).multiplyScalar($).round())},this.getScissor=function(w){return w.copy(mt)},this.setScissor=function(w,N,k,H){w.isVector4?mt.set(w.x,w.y,w.z,w.w):mt.set(w,N,k,H),Ct.scissor(S.copy(mt).multiplyScalar($).round())},this.getScissorTest=function(){return Gt},this.setScissorTest=function(w){Ct.setScissorTest(Gt=w)},this.setOpaqueSort=function(w){V=w},this.setTransparentSort=function(w){Q=w},this.getClearColor=function(w){return w.copy(Lt.getClearColor())},this.setClearColor=function(){Lt.setClearColor.apply(Lt,arguments)},this.getClearAlpha=function(){return Lt.getClearAlpha()},this.setClearAlpha=function(){Lt.setClearAlpha.apply(Lt,arguments)},this.clear=function(w=!0,N=!0,k=!0){let H=0;if(w){let F=!1;if(b!==null){const it=b.texture.format;F=it===Xc||it===Wc||it===Vc}if(F){const it=b.texture.type,ft=it===Ki||it===Jn||it===Rr||it===Qn||it===kc||it===Hc,vt=Lt.getClearColor(),xt=Lt.getClearAlpha(),It=vt.r,Ut=vt.g,yt=vt.b;ft?(p[0]=It,p[1]=Ut,p[2]=yt,p[3]=xt,D.clearBufferuiv(D.COLOR,0,p)):(_[0]=It,_[1]=Ut,_[2]=yt,_[3]=xt,D.clearBufferiv(D.COLOR,0,_))}else H|=D.COLOR_BUFFER_BIT}N&&(H|=D.DEPTH_BUFFER_BIT,D.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),k&&(H|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",j,!1),e.removeEventListener("webglcontextrestored",ut,!1),e.removeEventListener("webglcontextcreationerror",dt,!1),ct.dispose(),Xt.dispose(),Pt.dispose(),E.dispose(),z.dispose(),K.dispose(),Jt.dispose(),I.dispose(),Mt.dispose(),W.dispose(),W.removeEventListener("sessionstart",ch),W.removeEventListener("sessionend",hh),In.stop()};function j(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),y=!0}function ut(){console.log("THREE.WebGLRenderer: Context Restored."),y=!1;const w=oe.autoReset,N=ht.enabled,k=ht.autoUpdate,H=ht.needsUpdate,F=ht.type;at(),oe.autoReset=w,ht.enabled=N,ht.autoUpdate=k,ht.needsUpdate=H,ht.type=F}function dt(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function jt(w){const N=w.target;N.removeEventListener("dispose",jt),Ce(N)}function Ce(w){li(w),Pt.remove(w)}function li(w){const N=Pt.get(w).programs;N!==void 0&&(N.forEach(function(k){Mt.releaseProgram(k)}),w.isShaderMaterial&&Mt.releaseShaderCache(w))}this.renderBufferDirect=function(w,N,k,H,F,it){N===null&&(N=Ot);const ft=F.isMesh&&F.matrixWorld.determinant()<0,vt=yp(w,N,k,H,F);Ct.setMaterial(H,ft);let xt=k.index,It=1;if(H.wireframe===!0){if(xt=J.getWireframeAttribute(k),xt===void 0)return;It=2}const Ut=k.drawRange,yt=k.attributes.position;let ae=Ut.start*It,de=(Ut.start+Ut.count)*It;it!==null&&(ae=Math.max(ae,it.start*It),de=Math.min(de,(it.start+it.count)*It)),xt!==null?(ae=Math.max(ae,0),de=Math.min(de,xt.count)):yt!=null&&(ae=Math.max(ae,0),de=Math.min(de,yt.count));const Se=de-ae;if(Se<0||Se===1/0)return;Jt.setup(F,H,vt,k,xt);let di,se=_t;if(xt!==null&&(di=Z.get(xt),se=$t,se.setIndex(di)),F.isMesh)H.wireframe===!0?(Ct.setLineWidth(H.wireframeLinewidth*qt()),se.setMode(D.LINES)):se.setMode(D.TRIANGLES);else if(F.isLine){let wt=H.linewidth;wt===void 0&&(wt=1),Ct.setLineWidth(wt*qt()),F.isLineSegments?se.setMode(D.LINES):F.isLineLoop?se.setMode(D.LINE_LOOP):se.setMode(D.LINE_STRIP)}else F.isPoints?se.setMode(D.POINTS):F.isSprite&&se.setMode(D.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)se.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Wt.get("WEBGL_multi_draw"))se.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const wt=F._multiDrawStarts,Ve=F._multiDrawCounts,re=F._multiDrawCount,Ri=xt?Z.get(xt).bytesPerElement:1,as=Pt.get(H).currentProgram.getUniforms();for(let pi=0;pi<re;pi++)as.setValue(D,"_gl_DrawID",pi),se.render(wt[pi]/Ri,Ve[pi])}else if(F.isInstancedMesh)se.renderInstances(ae,Se,F.count);else if(k.isInstancedBufferGeometry){const wt=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,Ve=Math.min(k.instanceCount,wt);se.renderInstances(ae,Se,Ve)}else se.render(ae,Se)};function te(w,N,k){w.transparent===!0&&w.side===Ye&&w.forceSinglePass===!1?(w.side=ei,w.needsUpdate=!0,Gr(w,N,k),w.side=Cn,w.needsUpdate=!0,Gr(w,N,k),w.side=Ye):Gr(w,N,k)}this.compile=function(w,N,k=null){k===null&&(k=w),m=Xt.get(k),m.init(N),M.push(m),k.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(m.pushLight(F),F.castShadow&&m.pushShadow(F))}),w!==k&&w.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(m.pushLight(F),F.castShadow&&m.pushShadow(F))}),m.setupLights();const H=new Set;return w.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const it=F.material;if(it)if(Array.isArray(it))for(let ft=0;ft<it.length;ft++){const vt=it[ft];te(vt,k,F),H.add(vt)}else te(it,k,F),H.add(it)}),M.pop(),m=null,H},this.compileAsync=function(w,N,k=null){const H=this.compile(w,N,k);return new Promise(F=>{function it(){if(H.forEach(function(ft){Pt.get(ft).currentProgram.isReady()&&H.delete(ft)}),H.size===0){F(w);return}setTimeout(it,10)}Wt.get("KHR_parallel_shader_compile")!==null?it():setTimeout(it,10)})};let ci=null;function Zi(w){ci&&ci(w)}function ch(){In.stop()}function hh(){In.start()}const In=new Cd;In.setAnimationLoop(Zi),typeof self<"u"&&In.setContext(self),this.setAnimationLoop=function(w){ci=w,W.setAnimationLoop(w),w===null?In.stop():In.start()},W.addEventListener("sessionstart",ch),W.addEventListener("sessionend",hh),this.render=function(w,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(y===!0)return;if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(N),N=W.getCamera()),w.isScene===!0&&w.onBeforeRender(x,w,N,b),m=Xt.get(w,M.length),m.init(N),M.push(m),ot.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Zt.setFromProjectionMatrix(ot),tt=this.localClippingEnabled,Y=et.init(this.clippingPlanes,tt),g=ct.get(w,d.length),g.init(),d.push(g),W.enabled===!0&&W.isPresenting===!0){const it=x.xr.getDepthSensingMesh();it!==null&&ga(it,N,-1/0,x.sortObjects)}ga(w,N,0,x.sortObjects),g.finish(),x.sortObjects===!0&&g.sort(V,Q),Qt=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,Qt&&Lt.addToRenderList(g,w),this.info.render.frame++,Y===!0&&et.beginShadows();const k=m.state.shadowsArray;ht.render(k,w,N),Y===!0&&et.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=g.opaque,F=g.transmissive;if(m.setupLights(),N.isArrayCamera){const it=N.cameras;if(F.length>0)for(let ft=0,vt=it.length;ft<vt;ft++){const xt=it[ft];fh(H,F,w,xt)}Qt&&Lt.render(w);for(let ft=0,vt=it.length;ft<vt;ft++){const xt=it[ft];uh(g,w,xt,xt.viewport)}}else F.length>0&&fh(H,F,w,N),Qt&&Lt.render(w),uh(g,w,N);b!==null&&(R.updateMultisampleRenderTarget(b),R.updateRenderTargetMipmap(b)),w.isScene===!0&&w.onAfterRender(x,w,N),Jt.resetDefaultState(),L=-1,O=null,M.pop(),M.length>0?(m=M[M.length-1],Y===!0&&et.setGlobalState(x.clippingPlanes,m.state.camera)):m=null,d.pop(),d.length>0?g=d[d.length-1]:g=null};function ga(w,N,k,H){if(w.visible===!1)return;if(w.layers.test(N.layers)){if(w.isGroup)k=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(N);else if(w.isLight)m.pushLight(w),w.castShadow&&m.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||Zt.intersectsSprite(w)){H&&Et.setFromMatrixPosition(w.matrixWorld).applyMatrix4(ot);const ft=K.update(w),vt=w.material;vt.visible&&g.push(w,ft,vt,k,Et.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||Zt.intersectsObject(w))){const ft=K.update(w),vt=w.material;if(H&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Et.copy(w.boundingSphere.center)):(ft.boundingSphere===null&&ft.computeBoundingSphere(),Et.copy(ft.boundingSphere.center)),Et.applyMatrix4(w.matrixWorld).applyMatrix4(ot)),Array.isArray(vt)){const xt=ft.groups;for(let It=0,Ut=xt.length;It<Ut;It++){const yt=xt[It],ae=vt[yt.materialIndex];ae&&ae.visible&&g.push(w,ft,ae,k,Et.z,yt)}}else vt.visible&&g.push(w,ft,vt,k,Et.z,null)}}const it=w.children;for(let ft=0,vt=it.length;ft<vt;ft++)ga(it[ft],N,k,H)}function uh(w,N,k,H){const F=w.opaque,it=w.transmissive,ft=w.transparent;m.setupLightsView(k),Y===!0&&et.setGlobalState(x.clippingPlanes,k),H&&Ct.viewport(v.copy(H)),F.length>0&&Hr(F,N,k),it.length>0&&Hr(it,N,k),ft.length>0&&Hr(ft,N,k),Ct.buffers.depth.setTest(!0),Ct.buffers.depth.setMask(!0),Ct.buffers.color.setMask(!0),Ct.setPolygonOffset(!1)}function fh(w,N,k,H){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[H.id]===void 0&&(m.state.transmissionRenderTarget[H.id]=new vi(1,1,{generateMipmaps:!0,type:Wt.has("EXT_color_buffer_half_float")||Wt.has("EXT_color_buffer_float")?Bi:Ki,minFilter:bn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ie.workingColorSpace}));const it=m.state.transmissionRenderTarget[H.id],ft=H.viewport||v;it.setSize(ft.z,ft.w);const vt=x.getRenderTarget();x.setRenderTarget(it),x.getClearColor(U),G=x.getClearAlpha(),G<1&&x.setClearColor(16777215,.5),x.clear(),Qt&&Lt.render(k);const xt=x.toneMapping;x.toneMapping=Rn;const It=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),m.setupLightsView(H),Y===!0&&et.setGlobalState(x.clippingPlanes,H),Hr(w,k,H),R.updateMultisampleRenderTarget(it),R.updateRenderTargetMipmap(it),Wt.has("WEBGL_multisampled_render_to_texture")===!1){let Ut=!1;for(let yt=0,ae=N.length;yt<ae;yt++){const de=N[yt],Se=de.object,di=de.geometry,se=de.material,wt=de.group;if(se.side===Ye&&Se.layers.test(H.layers)){const Ve=se.side;se.side=ei,se.needsUpdate=!0,dh(Se,k,H,di,se,wt),se.side=Ve,se.needsUpdate=!0,Ut=!0}}Ut===!0&&(R.updateMultisampleRenderTarget(it),R.updateRenderTargetMipmap(it))}x.setRenderTarget(vt),x.setClearColor(U,G),It!==void 0&&(H.viewport=It),x.toneMapping=xt}function Hr(w,N,k){const H=N.isScene===!0?N.overrideMaterial:null;for(let F=0,it=w.length;F<it;F++){const ft=w[F],vt=ft.object,xt=ft.geometry,It=H===null?ft.material:H,Ut=ft.group;vt.layers.test(k.layers)&&dh(vt,N,k,xt,It,Ut)}}function dh(w,N,k,H,F,it){w.onBeforeRender(x,N,k,H,F,it),w.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),F.onBeforeRender(x,N,k,H,w,it),F.transparent===!0&&F.side===Ye&&F.forceSinglePass===!1?(F.side=ei,F.needsUpdate=!0,x.renderBufferDirect(k,N,H,F,w,it),F.side=Cn,F.needsUpdate=!0,x.renderBufferDirect(k,N,H,F,w,it),F.side=Ye):x.renderBufferDirect(k,N,H,F,w,it),w.onAfterRender(x,N,k,H,F,it)}function Gr(w,N,k){N.isScene!==!0&&(N=Ot);const H=Pt.get(w),F=m.state.lights,it=m.state.shadowsArray,ft=F.state.version,vt=Mt.getParameters(w,F.state,it,N,k),xt=Mt.getProgramCacheKey(vt);let It=H.programs;H.environment=w.isMeshStandardMaterial?N.environment:null,H.fog=N.fog,H.envMap=(w.isMeshStandardMaterial?z:E).get(w.envMap||H.environment),H.envMapRotation=H.environment!==null&&w.envMap===null?N.environmentRotation:w.envMapRotation,It===void 0&&(w.addEventListener("dispose",jt),It=new Map,H.programs=It);let Ut=It.get(xt);if(Ut!==void 0){if(H.currentProgram===Ut&&H.lightsStateVersion===ft)return mh(w,vt),Ut}else vt.uniforms=Mt.getUniforms(w),w.onBeforeCompile(vt,x),Ut=Mt.acquireProgram(vt,xt),It.set(xt,Ut),H.uniforms=vt.uniforms;const yt=H.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(yt.clippingPlanes=et.uniform),mh(w,vt),H.needsLights=wp(w),H.lightsStateVersion=ft,H.needsLights&&(yt.ambientLightColor.value=F.state.ambient,yt.lightProbe.value=F.state.probe,yt.directionalLights.value=F.state.directional,yt.directionalLightShadows.value=F.state.directionalShadow,yt.spotLights.value=F.state.spot,yt.spotLightShadows.value=F.state.spotShadow,yt.rectAreaLights.value=F.state.rectArea,yt.ltc_1.value=F.state.rectAreaLTC1,yt.ltc_2.value=F.state.rectAreaLTC2,yt.pointLights.value=F.state.point,yt.pointLightShadows.value=F.state.pointShadow,yt.hemisphereLights.value=F.state.hemi,yt.directionalShadowMap.value=F.state.directionalShadowMap,yt.directionalShadowMatrix.value=F.state.directionalShadowMatrix,yt.spotShadowMap.value=F.state.spotShadowMap,yt.spotLightMatrix.value=F.state.spotLightMatrix,yt.spotLightMap.value=F.state.spotLightMap,yt.pointShadowMap.value=F.state.pointShadowMap,yt.pointShadowMatrix.value=F.state.pointShadowMatrix),H.currentProgram=Ut,H.uniformsList=null,Ut}function ph(w){if(w.uniformsList===null){const N=w.currentProgram.getUniforms();w.uniformsList=$o.seqWithValue(N.seq,w.uniforms)}return w.uniformsList}function mh(w,N){const k=Pt.get(w);k.outputColorSpace=N.outputColorSpace,k.batching=N.batching,k.batchingColor=N.batchingColor,k.instancing=N.instancing,k.instancingColor=N.instancingColor,k.instancingMorph=N.instancingMorph,k.skinning=N.skinning,k.morphTargets=N.morphTargets,k.morphNormals=N.morphNormals,k.morphColors=N.morphColors,k.morphTargetsCount=N.morphTargetsCount,k.numClippingPlanes=N.numClippingPlanes,k.numIntersection=N.numClipIntersection,k.vertexAlphas=N.vertexAlphas,k.vertexTangents=N.vertexTangents,k.toneMapping=N.toneMapping}function yp(w,N,k,H,F){N.isScene!==!0&&(N=Ot),R.resetTextureUnits();const it=N.fog,ft=H.isMeshStandardMaterial?N.environment:null,vt=b===null?x.outputColorSpace:b.isXRRenderTarget===!0?b.texture.colorSpace:Ln,xt=(H.isMeshStandardMaterial?z:E).get(H.envMap||ft),It=H.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Ut=!!k.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),yt=!!k.morphAttributes.position,ae=!!k.morphAttributes.normal,de=!!k.morphAttributes.color;let Se=Rn;H.toneMapped&&(b===null||b.isXRRenderTarget===!0)&&(Se=x.toneMapping);const di=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,se=di!==void 0?di.length:0,wt=Pt.get(H),Ve=m.state.lights;if(Y===!0&&(tt===!0||w!==O)){const Mi=w===O&&H.id===L;et.setState(H,w,Mi)}let re=!1;H.version===wt.__version?(wt.needsLights&&wt.lightsStateVersion!==Ve.state.version||wt.outputColorSpace!==vt||F.isBatchedMesh&&wt.batching===!1||!F.isBatchedMesh&&wt.batching===!0||F.isBatchedMesh&&wt.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&wt.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&wt.instancing===!1||!F.isInstancedMesh&&wt.instancing===!0||F.isSkinnedMesh&&wt.skinning===!1||!F.isSkinnedMesh&&wt.skinning===!0||F.isInstancedMesh&&wt.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&wt.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&wt.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&wt.instancingMorph===!1&&F.morphTexture!==null||wt.envMap!==xt||H.fog===!0&&wt.fog!==it||wt.numClippingPlanes!==void 0&&(wt.numClippingPlanes!==et.numPlanes||wt.numIntersection!==et.numIntersection)||wt.vertexAlphas!==It||wt.vertexTangents!==Ut||wt.morphTargets!==yt||wt.morphNormals!==ae||wt.morphColors!==de||wt.toneMapping!==Se||wt.morphTargetsCount!==se)&&(re=!0):(re=!0,wt.__version=H.version);let Ri=wt.currentProgram;re===!0&&(Ri=Gr(H,N,F));let as=!1,pi=!1,_a=!1;const be=Ri.getUniforms(),fn=wt.uniforms;if(Ct.useProgram(Ri.program)&&(as=!0,pi=!0,_a=!0),H.id!==L&&(L=H.id,pi=!0),as||O!==w){Yt.reverseDepthBuffer?(gt.copy(w.projectionMatrix),ym(gt),Em(gt),be.setValue(D,"projectionMatrix",gt)):be.setValue(D,"projectionMatrix",w.projectionMatrix),be.setValue(D,"viewMatrix",w.matrixWorldInverse);const Mi=be.map.cameraPosition;Mi!==void 0&&Mi.setValue(D,At.setFromMatrixPosition(w.matrixWorld)),Yt.logarithmicDepthBuffer&&be.setValue(D,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&be.setValue(D,"isOrthographic",w.isOrthographicCamera===!0),O!==w&&(O=w,pi=!0,_a=!0)}if(F.isSkinnedMesh){be.setOptional(D,F,"bindMatrix"),be.setOptional(D,F,"bindMatrixInverse");const Mi=F.skeleton;Mi&&(Mi.boneTexture===null&&Mi.computeBoneTexture(),be.setValue(D,"boneTexture",Mi.boneTexture,R))}F.isBatchedMesh&&(be.setOptional(D,F,"batchingTexture"),be.setValue(D,"batchingTexture",F._matricesTexture,R),be.setOptional(D,F,"batchingIdTexture"),be.setValue(D,"batchingIdTexture",F._indirectTexture,R),be.setOptional(D,F,"batchingColorTexture"),F._colorsTexture!==null&&be.setValue(D,"batchingColorTexture",F._colorsTexture,R));const va=k.morphAttributes;if((va.position!==void 0||va.normal!==void 0||va.color!==void 0)&&Dt.update(F,k,Ri),(pi||wt.receiveShadow!==F.receiveShadow)&&(wt.receiveShadow=F.receiveShadow,be.setValue(D,"receiveShadow",F.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(fn.envMap.value=xt,fn.flipEnvMap.value=xt.isCubeTexture&&xt.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&N.environment!==null&&(fn.envMapIntensity.value=N.environmentIntensity),pi&&(be.setValue(D,"toneMappingExposure",x.toneMappingExposure),wt.needsLights&&Ep(fn,_a),it&&H.fog===!0&&rt.refreshFogUniforms(fn,it),rt.refreshMaterialUniforms(fn,H,$,B,m.state.transmissionRenderTarget[w.id]),$o.upload(D,ph(wt),fn,R)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&($o.upload(D,ph(wt),fn,R),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&be.setValue(D,"center",F.center),be.setValue(D,"modelViewMatrix",F.modelViewMatrix),be.setValue(D,"normalMatrix",F.normalMatrix),be.setValue(D,"modelMatrix",F.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Mi=H.uniformsGroups;for(let Ma=0,Tp=Mi.length;Ma<Tp;Ma++){const gh=Mi[Ma];I.update(gh,Ri),I.bind(gh,Ri)}}return Ri}function Ep(w,N){w.ambientLightColor.needsUpdate=N,w.lightProbe.needsUpdate=N,w.directionalLights.needsUpdate=N,w.directionalLightShadows.needsUpdate=N,w.pointLights.needsUpdate=N,w.pointLightShadows.needsUpdate=N,w.spotLights.needsUpdate=N,w.spotLightShadows.needsUpdate=N,w.rectAreaLights.needsUpdate=N,w.hemisphereLights.needsUpdate=N}function wp(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return b},this.setRenderTargetTextures=function(w,N,k){Pt.get(w.texture).__webglTexture=N,Pt.get(w.depthTexture).__webglTexture=k;const H=Pt.get(w);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=k===void 0,H.__autoAllocateDepthBuffer||Wt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(w,N){const k=Pt.get(w);k.__webglFramebuffer=N,k.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(w,N=0,k=0){b=w,C=N,T=k;let H=!0,F=null,it=!1,ft=!1;if(w){const xt=Pt.get(w);if(xt.__useDefaultFramebuffer!==void 0)Ct.bindFramebuffer(D.FRAMEBUFFER,null),H=!1;else if(xt.__webglFramebuffer===void 0)R.setupRenderTarget(w);else if(xt.__hasExternalTextures)R.rebindTextures(w,Pt.get(w.texture).__webglTexture,Pt.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const yt=w.depthTexture;if(xt.__boundDepthTexture!==yt){if(yt!==null&&Pt.has(yt)&&(w.width!==yt.image.width||w.height!==yt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(w)}}const It=w.texture;(It.isData3DTexture||It.isDataArrayTexture||It.isCompressedArrayTexture)&&(ft=!0);const Ut=Pt.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Ut[N])?F=Ut[N][k]:F=Ut[N],it=!0):w.samples>0&&R.useMultisampledRTT(w)===!1?F=Pt.get(w).__webglMultisampledFramebuffer:Array.isArray(Ut)?F=Ut[k]:F=Ut,v.copy(w.viewport),S.copy(w.scissor),P=w.scissorTest}else v.copy(nt).multiplyScalar($).floor(),S.copy(mt).multiplyScalar($).floor(),P=Gt;if(Ct.bindFramebuffer(D.FRAMEBUFFER,F)&&H&&Ct.drawBuffers(w,F),Ct.viewport(v),Ct.scissor(S),Ct.setScissorTest(P),it){const xt=Pt.get(w.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+N,xt.__webglTexture,k)}else if(ft){const xt=Pt.get(w.texture),It=N||0;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,xt.__webglTexture,k||0,It)}L=-1},this.readRenderTargetPixels=function(w,N,k,H,F,it,ft){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let vt=Pt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&ft!==void 0&&(vt=vt[ft]),vt){Ct.bindFramebuffer(D.FRAMEBUFFER,vt);try{const xt=w.texture,It=xt.format,Ut=xt.type;if(!Yt.textureFormatReadable(It)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Yt.textureTypeReadable(Ut)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=w.width-H&&k>=0&&k<=w.height-F&&D.readPixels(N,k,H,F,Ft.convert(It),Ft.convert(Ut),it)}finally{const xt=b!==null?Pt.get(b).__webglFramebuffer:null;Ct.bindFramebuffer(D.FRAMEBUFFER,xt)}}},this.readRenderTargetPixelsAsync=async function(w,N,k,H,F,it,ft){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let vt=Pt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&ft!==void 0&&(vt=vt[ft]),vt){const xt=w.texture,It=xt.format,Ut=xt.type;if(!Yt.textureFormatReadable(It))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Yt.textureTypeReadable(Ut))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(N>=0&&N<=w.width-H&&k>=0&&k<=w.height-F){Ct.bindFramebuffer(D.FRAMEBUFFER,vt);const yt=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,yt),D.bufferData(D.PIXEL_PACK_BUFFER,it.byteLength,D.STREAM_READ),D.readPixels(N,k,H,F,Ft.convert(It),Ft.convert(Ut),0);const ae=b!==null?Pt.get(b).__webglFramebuffer:null;Ct.bindFramebuffer(D.FRAMEBUFFER,ae);const de=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Sm(D,de,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,yt),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,it),D.deleteBuffer(yt),D.deleteSync(de),it}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(w,N=null,k=0){w.isTexture!==!0&&(Yo("WebGLRenderer: copyFramebufferToTexture function signature has changed."),N=arguments[0]||null,w=arguments[1]);const H=Math.pow(2,-k),F=Math.floor(w.image.width*H),it=Math.floor(w.image.height*H),ft=N!==null?N.x:0,vt=N!==null?N.y:0;R.setTexture2D(w,0),D.copyTexSubImage2D(D.TEXTURE_2D,k,0,0,ft,vt,F,it),Ct.unbindTexture()},this.copyTextureToTexture=function(w,N,k=null,H=null,F=0){w.isTexture!==!0&&(Yo("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,w=arguments[1],N=arguments[2],F=arguments[3]||0,k=null);let it,ft,vt,xt,It,Ut;k!==null?(it=k.max.x-k.min.x,ft=k.max.y-k.min.y,vt=k.min.x,xt=k.min.y):(it=w.image.width,ft=w.image.height,vt=0,xt=0),H!==null?(It=H.x,Ut=H.y):(It=0,Ut=0);const yt=Ft.convert(N.format),ae=Ft.convert(N.type);R.setTexture2D(N,0),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,N.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,N.unpackAlignment);const de=D.getParameter(D.UNPACK_ROW_LENGTH),Se=D.getParameter(D.UNPACK_IMAGE_HEIGHT),di=D.getParameter(D.UNPACK_SKIP_PIXELS),se=D.getParameter(D.UNPACK_SKIP_ROWS),wt=D.getParameter(D.UNPACK_SKIP_IMAGES),Ve=w.isCompressedTexture?w.mipmaps[F]:w.image;D.pixelStorei(D.UNPACK_ROW_LENGTH,Ve.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Ve.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,vt),D.pixelStorei(D.UNPACK_SKIP_ROWS,xt),w.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,F,It,Ut,it,ft,yt,ae,Ve.data):w.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,F,It,Ut,Ve.width,Ve.height,yt,Ve.data):D.texSubImage2D(D.TEXTURE_2D,F,It,Ut,it,ft,yt,ae,Ve),D.pixelStorei(D.UNPACK_ROW_LENGTH,de),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Se),D.pixelStorei(D.UNPACK_SKIP_PIXELS,di),D.pixelStorei(D.UNPACK_SKIP_ROWS,se),D.pixelStorei(D.UNPACK_SKIP_IMAGES,wt),F===0&&N.generateMipmaps&&D.generateMipmap(D.TEXTURE_2D),Ct.unbindTexture()},this.copyTextureToTexture3D=function(w,N,k=null,H=null,F=0){w.isTexture!==!0&&(Yo("WebGLRenderer: copyTextureToTexture3D function signature has changed."),k=arguments[0]||null,H=arguments[1]||null,w=arguments[2],N=arguments[3],F=arguments[4]||0);let it,ft,vt,xt,It,Ut,yt,ae,de;const Se=w.isCompressedTexture?w.mipmaps[F]:w.image;k!==null?(it=k.max.x-k.min.x,ft=k.max.y-k.min.y,vt=k.max.z-k.min.z,xt=k.min.x,It=k.min.y,Ut=k.min.z):(it=Se.width,ft=Se.height,vt=Se.depth,xt=0,It=0,Ut=0),H!==null?(yt=H.x,ae=H.y,de=H.z):(yt=0,ae=0,de=0);const di=Ft.convert(N.format),se=Ft.convert(N.type);let wt;if(N.isData3DTexture)R.setTexture3D(N,0),wt=D.TEXTURE_3D;else if(N.isDataArrayTexture||N.isCompressedArrayTexture)R.setTexture2DArray(N,0),wt=D.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,N.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,N.unpackAlignment);const Ve=D.getParameter(D.UNPACK_ROW_LENGTH),re=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Ri=D.getParameter(D.UNPACK_SKIP_PIXELS),as=D.getParameter(D.UNPACK_SKIP_ROWS),pi=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,Se.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Se.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,xt),D.pixelStorei(D.UNPACK_SKIP_ROWS,It),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ut),w.isDataTexture||w.isData3DTexture?D.texSubImage3D(wt,F,yt,ae,de,it,ft,vt,di,se,Se.data):N.isCompressedArrayTexture?D.compressedTexSubImage3D(wt,F,yt,ae,de,it,ft,vt,di,Se.data):D.texSubImage3D(wt,F,yt,ae,de,it,ft,vt,di,se,Se),D.pixelStorei(D.UNPACK_ROW_LENGTH,Ve),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,re),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Ri),D.pixelStorei(D.UNPACK_SKIP_ROWS,as),D.pixelStorei(D.UNPACK_SKIP_IMAGES,pi),F===0&&N.generateMipmaps&&D.generateMipmap(wt),Ct.unbindTexture()},this.initRenderTarget=function(w){Pt.get(w).__webglFramebuffer===void 0&&R.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?R.setTextureCube(w,0):w.isData3DTexture?R.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?R.setTexture2DArray(w,0):R.setTexture2D(w,0),Ct.unbindTexture()},this.resetState=function(){C=0,T=0,b=null,Ct.reset(),Jt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===qc?"display-p3":"srgb",e.unpackColorSpace=ie.workingColorSpace===ha?"display-p3":"srgb"}}class Qc{constructor(t,e=1,i=1e3){this.isFog=!0,this.name="",this.color=new St(t),this.near=e,this.far=i}clone(){return new Qc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Ud extends Ae{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new bi,this.environmentIntensity=1,this.environmentRotation=new bi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class th extends ii{constructor(t=null,e=1,i=1,n,r,o,a,l,c=ti,h=ti,f,u){super(null,o,a,l,c,h,n,r,f,u),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Er extends xe{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const ys=new Ht,hu=new Ht,ho=[],uu=new Dn,IM=new Ht,tr=new Tt,er=new Xs;class zi extends Tt{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Er(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,IM)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Dn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,ys),uu.copy(t.boundingBox).applyMatrix4(ys),this.boundingBox.union(uu)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Xs),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,ys),er.copy(t.boundingSphere).applyMatrix4(ys),this.boundingSphere.union(er)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,o=t*r+1;for(let a=0;a<i.length;a++)i[a]=n[o+a]}raycast(t,e){const i=this.matrixWorld,n=this.count;if(tr.geometry=this.geometry,tr.material=this.material,tr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),er.copy(this.boundingSphere),er.applyMatrix4(i),t.ray.intersectsSphere(er)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,ys),hu.multiplyMatrices(i,ys),tr.matrixWorld=hu,tr.raycast(t,ho);for(let o=0,a=ho.length;o<a;o++){const l=ho[o];l.instanceId=r,l.object=this,e.push(l)}ho.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Er(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new th(new Float32Array(n*this.count),n,this.count,Gc,qi));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<i.length;c++)o+=i[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=n*t;r[l]=a,r.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Nd extends un{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new St(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const na=new A,sa=new A,fu=new Ht,ir=new Sd,uo=new Xs,Ka=new A,du=new A;class UM extends Ae{constructor(t=new Ue,e=new Nd){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[0];for(let n=1,r=e.count;n<r;n++)na.fromBufferAttribute(e,n-1),sa.fromBufferAttribute(e,n),i[n]=i[n-1],i[n]+=na.distanceTo(sa);t.setAttribute("lineDistance",new fe(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const i=this.geometry,n=this.matrixWorld,r=t.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),uo.copy(i.boundingSphere),uo.applyMatrix4(n),uo.radius+=r,t.ray.intersectsSphere(uo)===!1)return;fu.copy(n).invert(),ir.copy(t.ray).applyMatrix4(fu);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){const p=Math.max(0,o.start),_=Math.min(h.count,o.start+o.count);for(let g=p,m=_-1;g<m;g+=c){const d=h.getX(g),M=h.getX(g+1),x=fo(this,t,ir,l,d,M);x&&e.push(x)}if(this.isLineLoop){const g=h.getX(_-1),m=h.getX(p),d=fo(this,t,ir,l,g,m);d&&e.push(d)}}else{const p=Math.max(0,o.start),_=Math.min(u.count,o.start+o.count);for(let g=p,m=_-1;g<m;g+=c){const d=fo(this,t,ir,l,g,g+1);d&&e.push(d)}if(this.isLineLoop){const g=fo(this,t,ir,l,_-1,p);g&&e.push(g)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){const a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function fo(s,t,e,i,n,r){const o=s.geometry.attributes.position;if(na.fromBufferAttribute(o,n),sa.fromBufferAttribute(o,r),e.distanceSqToSegment(na,sa,Ka,du)>i)return;Ka.applyMatrix4(s.matrixWorld);const l=t.ray.origin.distanceTo(Ka);if(!(l<t.near||l>t.far))return{distance:l,point:du.clone().applyMatrix4(s.matrixWorld),index:n,face:null,faceIndex:null,barycoord:null,object:s}}const pu=new A,mu=new A;class NM extends UM{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[];for(let n=0,r=e.count;n<r;n+=2)pu.fromBufferAttribute(e,n),mu.fromBufferAttribute(e,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+pu.distanceTo(mu);t.setAttribute("lineDistance",new fe(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Pr extends ii{constructor(t,e,i,n,r,o,a,l,c){super(t,e,i,n,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class eh extends Ue{constructor(t=[new lt(0,-.5),new lt(.5,0),new lt(0,.5)],e=12,i=0,n=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:n},e=Math.floor(e),n=qe(n,0,Math.PI*2);const r=[],o=[],a=[],l=[],c=[],h=1/e,f=new A,u=new lt,p=new A,_=new A,g=new A;let m=0,d=0;for(let M=0;M<=t.length-1;M++)switch(M){case 0:m=t[M+1].x-t[M].x,d=t[M+1].y-t[M].y,p.x=d*1,p.y=-m,p.z=d*0,g.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case t.length-1:l.push(g.x,g.y,g.z);break;default:m=t[M+1].x-t[M].x,d=t[M+1].y-t[M].y,p.x=d*1,p.y=-m,p.z=d*0,_.copy(p),p.x+=g.x,p.y+=g.y,p.z+=g.z,p.normalize(),l.push(p.x,p.y,p.z),g.copy(_)}for(let M=0;M<=e;M++){const x=i+M*h*n,y=Math.sin(x),C=Math.cos(x);for(let T=0;T<=t.length-1;T++){f.x=t[T].x*y,f.y=t[T].y,f.z=t[T].x*C,o.push(f.x,f.y,f.z),u.x=M/e,u.y=T/(t.length-1),a.push(u.x,u.y);const b=l[3*T+0]*y,L=l[3*T+1],O=l[3*T+0]*C;c.push(b,L,O)}}for(let M=0;M<e;M++)for(let x=0;x<t.length-1;x++){const y=x+M*t.length,C=y,T=y+t.length,b=y+t.length+1,L=y+1;r.push(C,T,L),r.push(b,L,T)}this.setIndex(r),this.setAttribute("position",new fe(o,3)),this.setAttribute("uv",new fe(a,2)),this.setAttribute("normal",new fe(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new eh(t.points,t.segments,t.phiStart,t.phiLength)}}class ih extends Ue{constructor(t=1,e=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:n},e=Math.max(3,e);const r=[],o=[],a=[],l=[],c=new A,h=new lt;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let f=0,u=3;f<=e;f++,u+=3){const p=i+f/e*n;c.x=t*Math.cos(p),c.y=t*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[u]/t+1)/2,h.y=(o[u+1]/t+1)/2,l.push(h.x,h.y)}for(let f=1;f<=e;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new fe(o,3)),this.setAttribute("normal",new fe(a,3)),this.setAttribute("uv",new fe(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ih(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class ai extends Ue{constructor(t=1,e=1,i=1,n=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;n=Math.floor(n),r=Math.floor(r);const h=[],f=[],u=[],p=[];let _=0;const g=[],m=i/2;let d=0;M(),o===!1&&(t>0&&x(!0),e>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new fe(f,3)),this.setAttribute("normal",new fe(u,3)),this.setAttribute("uv",new fe(p,2));function M(){const y=new A,C=new A;let T=0;const b=(e-t)/i;for(let L=0;L<=r;L++){const O=[],v=L/r,S=v*(e-t)+t;for(let P=0;P<=n;P++){const U=P/n,G=U*l+a,X=Math.sin(G),B=Math.cos(G);C.x=S*X,C.y=-v*i+m,C.z=S*B,f.push(C.x,C.y,C.z),y.set(X,b,B).normalize(),u.push(y.x,y.y,y.z),p.push(U,1-v),O.push(_++)}g.push(O)}for(let L=0;L<n;L++)for(let O=0;O<r;O++){const v=g[O][L],S=g[O+1][L],P=g[O+1][L+1],U=g[O][L+1];t>0&&(h.push(v,S,U),T+=3),e>0&&(h.push(S,P,U),T+=3)}c.addGroup(d,T,0),d+=T}function x(y){const C=_,T=new lt,b=new A;let L=0;const O=y===!0?t:e,v=y===!0?1:-1;for(let P=1;P<=n;P++)f.push(0,m*v,0),u.push(0,v,0),p.push(.5,.5),_++;const S=_;for(let P=0;P<=n;P++){const G=P/n*l+a,X=Math.cos(G),B=Math.sin(G);b.x=O*B,b.y=m*v,b.z=O*X,f.push(b.x,b.y,b.z),u.push(0,v,0),T.x=X*.5+.5,T.y=B*.5*v+.5,p.push(T.x,T.y),_++}for(let P=0;P<n;P++){const U=C+P,G=S+P;y===!0?h.push(G,G+1,U):h.push(G+1,G,U),L+=3}c.addGroup(d,L,y===!0?1:2),d+=L}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ai(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Lr extends ai{constructor(t=1,e=1,i=32,n=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,i,n,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new Lr(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class nh extends Ue{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};const r=[],o=[];a(n),c(i),h(),this.setAttribute("position",new fe(r,3)),this.setAttribute("normal",new fe(r.slice(),3)),this.setAttribute("uv",new fe(o,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function a(M){const x=new A,y=new A,C=new A;for(let T=0;T<e.length;T+=3)p(e[T+0],x),p(e[T+1],y),p(e[T+2],C),l(x,y,C,M)}function l(M,x,y,C){const T=C+1,b=[];for(let L=0;L<=T;L++){b[L]=[];const O=M.clone().lerp(y,L/T),v=x.clone().lerp(y,L/T),S=T-L;for(let P=0;P<=S;P++)P===0&&L===T?b[L][P]=O:b[L][P]=O.clone().lerp(v,P/S)}for(let L=0;L<T;L++)for(let O=0;O<2*(T-L)-1;O++){const v=Math.floor(O/2);O%2===0?(u(b[L][v+1]),u(b[L+1][v]),u(b[L][v])):(u(b[L][v+1]),u(b[L+1][v+1]),u(b[L+1][v]))}}function c(M){const x=new A;for(let y=0;y<r.length;y+=3)x.x=r[y+0],x.y=r[y+1],x.z=r[y+2],x.normalize().multiplyScalar(M),r[y+0]=x.x,r[y+1]=x.y,r[y+2]=x.z}function h(){const M=new A;for(let x=0;x<r.length;x+=3){M.x=r[x+0],M.y=r[x+1],M.z=r[x+2];const y=m(M)/2/Math.PI+.5,C=d(M)/Math.PI+.5;o.push(y,1-C)}_(),f()}function f(){for(let M=0;M<o.length;M+=6){const x=o[M+0],y=o[M+2],C=o[M+4],T=Math.max(x,y,C),b=Math.min(x,y,C);T>.9&&b<.1&&(x<.2&&(o[M+0]+=1),y<.2&&(o[M+2]+=1),C<.2&&(o[M+4]+=1))}}function u(M){r.push(M.x,M.y,M.z)}function p(M,x){const y=M*3;x.x=t[y+0],x.y=t[y+1],x.z=t[y+2]}function _(){const M=new A,x=new A,y=new A,C=new A,T=new lt,b=new lt,L=new lt;for(let O=0,v=0;O<r.length;O+=9,v+=6){M.set(r[O+0],r[O+1],r[O+2]),x.set(r[O+3],r[O+4],r[O+5]),y.set(r[O+6],r[O+7],r[O+8]),T.set(o[v+0],o[v+1]),b.set(o[v+2],o[v+3]),L.set(o[v+4],o[v+5]),C.copy(M).add(x).add(y).divideScalar(3);const S=m(C);g(T,v+0,M,S),g(b,v+2,x,S),g(L,v+4,y,S)}}function g(M,x,y,C){C<0&&M.x===1&&(o[x]=M.x-1),y.x===0&&y.z===0&&(o[x]=C/2/Math.PI+.5)}function m(M){return Math.atan2(M.z,-M.x)}function d(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new nh(t.vertices,t.indices,t.radius,t.details)}}class sh extends nh{constructor(t=1,e=0){const i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new sh(t.radius,t.detail)}}class Ie extends Ue{constructor(t=1,e=32,i=16,n=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let c=0;const h=[],f=new A,u=new A,p=[],_=[],g=[],m=[];for(let d=0;d<=i;d++){const M=[],x=d/i;let y=0;d===0&&o===0?y=.5/e:d===i&&l===Math.PI&&(y=-.5/e);for(let C=0;C<=e;C++){const T=C/e;f.x=-t*Math.cos(n+T*r)*Math.sin(o+x*a),f.y=t*Math.cos(o+x*a),f.z=t*Math.sin(n+T*r)*Math.sin(o+x*a),_.push(f.x,f.y,f.z),u.copy(f).normalize(),g.push(u.x,u.y,u.z),m.push(T+y,1-x),M.push(c++)}h.push(M)}for(let d=0;d<i;d++)for(let M=0;M<e;M++){const x=h[d][M+1],y=h[d][M],C=h[d+1][M],T=h[d+1][M+1];(d!==0||o>0)&&p.push(x,y,T),(d!==i-1||l<Math.PI)&&p.push(y,C,T)}this.setIndex(p),this.setAttribute("position",new fe(_,3)),this.setAttribute("normal",new fe(g,3)),this.setAttribute("uv",new fe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ie(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class FM extends ge{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class wr extends un{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new St(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new St(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ca,this.normalScale=new lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class OM extends wr{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new lt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return qe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new St(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new St(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new St(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class zM extends un{constructor(t){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ca,this.normalScale=new lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(t)}copy(t){return super.copy(t),this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.flatShading=t.flatShading,this}}class Me extends un{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new St(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new St(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ca,this.normalScale=new lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bi,this.combine=Oc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Fd extends Ae{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new St(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class BM extends Fd{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ae.DEFAULT_UP),this.updateMatrix(),this.groundColor=new St(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const Za=new Ht,gu=new A,_u=new A;class kM{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new lt(512,512),this.map=null,this.mapPass=null,this.matrix=new Ht,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Kc,this._frameExtents=new lt(1,1),this._viewportCount=1,this._viewports=[new we(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,i=this.matrix;gu.setFromMatrixPosition(t.matrixWorld),e.position.copy(gu),_u.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(_u),e.updateMatrixWorld(),Za.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Za),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Za)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class HM extends kM{constructor(){super(new Zc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Od extends Fd{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ae.DEFAULT_UP),this.updateMatrix(),this.target=new Ae,this.shadow=new HM}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class GM extends Ue{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){const t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}}class VM{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=vu(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=vu();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function vu(){return performance.now()}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Fc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Fc);function po(s,t=0,e=2){const i=new Ue;i.setAttribute("position",new xe(new Float32Array(s),3));const n=new Float32Array(s.length/3*2);for(let r=0,o=0;r<s.length;r+=3,o+=2)n[o]=s[r+t]/5,n[o+1]=s[r+e]/5;return i.setAttribute("uv",new xe(n,2)),i.computeVertexNormals(),i}function Mu(s,t,e){const i=n=>{const r=(n+s/60)%6;return e-e*t*Math.max(0,Math.min(r,4-r,1))};return Math.round(i(5)*255)<<16|Math.round(i(3)*255)<<8|Math.round(i(1)*255)}let mo;function WM(){if(mo!==void 0)return mo;if(typeof document>"u")return mo=null;const s=512,t=document.createElement("canvas");t.width=t.height=s;const e=t.getContext("2d");let i=7;const n=()=>(i=i*16807%2147483647)/2147483647;e.fillStyle="rgb(128,128,128)",e.fillRect(0,0,s,s);const r=6;for(let d=0;d<r;d++){const M=d*s/r;let x=-n()*80;for(;x<s;){const y=60+n()*110,C=118+n()*20;e.fillStyle=`rgb(${C},${C},${C})`,e.fillRect(x+2,M+2,y-4,s/r-4),e.fillStyle="rgb(70,70,70)",e.fillRect(x,M,2,s/r),e.fillStyle="rgb(165,165,165)";for(let b=M+6;b<M+s/r-4;b+=9)e.beginPath(),e.arc(x+6,b,1.3,0,Math.PI*2),e.fill();const T=n();if(T<.12)for(let b=0;b<6;b++)e.fillStyle="rgb(60,60,60)",e.fillRect(x+18,M+14+b*7,y*.4,3),e.fillStyle="rgb(170,170,170)",e.fillRect(x+18,M+17+b*7,y*.4,1);else T<.24&&(e.strokeStyle="rgb(80,80,80)",e.lineWidth=1.5,e.strokeRect(x+16,M+16,26,20));x+=y}e.fillStyle="rgb(70,70,70)",e.fillRect(0,M,s,2),e.fillStyle="rgb(165,165,165)";for(let y=4;y<s;y+=9)e.beginPath(),e.arc(y,M+6,1.3,0,Math.PI*2),e.fill()}const o=e.getImageData(0,0,s,s).data,a=(d,M)=>o[((M+s)%s*s+(d+s)%s)*4]/255,l=document.createElement("canvas");l.width=l.height=s;const c=l.getContext("2d"),h=c.createImageData(s,s),f=document.createElement("canvas");f.width=f.height=s;const u=f.getContext("2d"),p=u.createImageData(s,s),_=3;for(let d=0;d<s;d++)for(let M=0;M<s;M++){const x=(a(M+1,d-1)+2*a(M+1,d)+a(M+1,d+1)-a(M-1,d-1)-2*a(M-1,d)-a(M-1,d+1))*_,y=(a(M-1,d+1)+2*a(M,d+1)+a(M+1,d+1)-a(M-1,d-1)-2*a(M,d-1)-a(M+1,d-1))*_,C=Math.hypot(x,y,1),T=(d*s+M)*4;h.data[T]=(-x/C*.5+.5)*255,h.data[T+1]=(y/C*.5+.5)*255,h.data[T+2]=(1/C*.5+.5)*255,h.data[T+3]=255;const b=a(M,d),L=.06*Math.sin(M*.05+Math.sin(d*.013)*3)+.04*Math.sin(M*.31+d*.002),O=Math.min(1,Math.max(0,.82+Math.abs(b-.5)*.6+L));p.data[T]=p.data[T+1]=p.data[T+2]=O*255,p.data[T+3]=255}c.putImageData(h,0,0),u.putImageData(p,0,0);const g=new Pr(l),m=new Pr(f);for(const d of[g,m])d.wrapS=d.wrapT=hn,d.repeat.set(2,2),d.anisotropy=4;return mo={normal:g,rough:m}}const XM=`
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`,qM=`
  uniform float uGain;
  uniform float uHeat;
  uniform float uTime;
  uniform float uDiamonds;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float a = vUv.y;                       // 0 at the nozzle, 1 at the tip
    float face = abs(dot(normalize(vN), normalize(vV)));
    float edge = pow(face, 1.6);           // soft silhouette, dense centre
    vec3 core = vec3(0.70, 0.82, 1.0);     // white-blue at the nozzle
    vec3 body = vec3(1.0, 0.55, 0.16);
    vec3 tip = vec3(0.85, 0.18, 0.04);
    vec3 c = mix(core, body, smoothstep(0.0, 0.35 + 0.2 * uHeat, a));
    c = mix(c, tip, smoothstep(0.55, 1.0, a));
    float fade = pow(1.0 - a, 1.3);
    float flick = 0.88 + 0.12 * sin(uTime * 53.0 + a * 21.0) * sin(uTime * 31.0 - a * 9.0);
    float diam = 1.0 + uDiamonds * 0.9 * pow(0.5 + 0.5 * cos(a * 6.2831 * 4.0), 6.0) * (1.0 - a);
    float k = edge * fade * flick * diam * uGain;
    gl_FragColor = vec4(c * k, k);
  }`;function xu(){return new ge({uniforms:{uGain:{value:1},uHeat:{value:0},uTime:{value:0},uDiamonds:{value:0}},vertexShader:XM,fragmentShader:qM,transparent:!0,depthWrite:!1,blending:jn,side:Ye,fog:!1})}const lh=class lh{constructor(t=null){this.group=new fi,this.nav=[],this.elevons=[],this.stabs=[],this.ctl={roll:0,pitch:0,yaw:0};const e=WM(),i=(P,U,G,X=!1)=>new wr({color:P,metalness:U,roughness:G,side:X?Ye:void 0,normalMap:e?.normal??null,normalScale:new lt(.55,.55),roughnessMap:e?.rough??null,envMapIntensity:1}),n=i(t===null?9213859:Mu(t,.5,.85),.22,.38),r=i(t===null?6121072:Mu(t,.65,.45),.25,.45,!0),o=new OM({color:2372170,metalness:.1,roughness:.05,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:1.6,emissive:330516}),a=new wr({color:4867136,metalness:.9,roughness:.35,side:Ye}),l=[[0,-10],[.18,-9.6],[.36,-9],[.52,-8.2],[.66,-7.2],[.78,-6],[.88,-4.6],[.94,-3],[.96,-1],[.95,1.5],[.9,3.5],[.83,5],[.77,6],[.74,6.05]].map(([P,U])=>new lt(P,U)),c=new eh(l,32);c.rotateX(Math.PI/2),c.scale(1.08,.88,1);const h=new Tt(c,n);this.group.add(h);const f=new Tt(new ai(.22,.32,6.5,12),n);f.rotation.x=Math.PI/2,f.scale.set(1.4,1,1),f.position.set(0,.72,-.4),this.group.add(f);const u=new Tt(new Ie(.6,24,16),o);u.scale.set(1,.8,2.4),u.position.set(0,.7,-4.2),this.group.add(u);const p=P=>3.4+(Math.abs(P)-5.2)/-4.6*.6;for(const P of[-1,1]){const U=[.6*P,0,-3],G=[5.2*P,0,3.4],X=[4.8*P,0,p(4.8)],B=[4.8*P,0,p(4.8)-.75],$=[.6*P,0,p(.6)-.75],V=[.6*P,0,p(.6)];this.group.add(new Tt(po([...B,...X,...G,...B,...G,...U,...B,...U,...$]),r)),this.elevons.push(this.hinged(B,$,[X,V],r))}const _=[0,.6,2.5],g=[0,4.2,5.8],m=[0,.6,6],d=P=>5.8+(4.2-P)/3.6*.2,M=[0,3.8,d(3.8)],x=[0,.8,d(.8)],y=[0,3.8,d(3.8)-.6],C=[0,.8,d(.8)-.6];this.group.add(new Tt(po([...y,...M,...g,...y,...g,..._,...y,..._,...C,...C,..._,...m,...C,...m,...x],2,1),r)),this.rudder=this.hinged(C,y,[x,M],r,2,1);for(const P of[-1,1]){const U=new fi;U.position.set(0,0,5.3),U.add(new Tt(po([.5*P,0,4.4-5.3,2.6*P,0,6.3-5.3,.5*P,0,6.3-5.3]),r)),this.group.add(U),this.stabs.push(U)}const T=new Tt(new ai(.7,.77,.9,24,1,!0),a);T.rotation.x=Math.PI/2,T.position.z=6.4,this.group.add(T),this.nozzleRing=new wr({color:3813418,metalness:.85,roughness:.4,emissive:16734750,emissiveIntensity:0,side:Ye});const b=new Tt(new ai(.71,.71,.18,24,1,!0),this.nozzleRing);b.rotation.x=Math.PI/2,b.position.z=6.8,this.group.add(b),this.nozzleGlow=new $e({color:16747066,fog:!1});const L=new Tt(new ih(.68,24),this.nozzleGlow);L.position.z=6.3,this.group.add(L),this.flame=new fi,this.outerMat=xu(),this.coreMat=xu();const O=new Tt(new Lr(.7,4,24,1,!0),this.outerMat),v=new Tt(new Lr(.4,2.6,24,1,!0),this.coreMat);for(const P of[O,v])P.rotation.x=Math.PI/2,P.frustumCulled=!1;O.position.z=2,v.position.z=1.3,this.flame.add(O,v),this.flame.position.z=6.85,this.group.add(this.flame);const S=(P,U,G,X)=>{const B=new $e({color:P});B.color.multiplyScalar(1.4);const $=new Tt(new Ie(.25,8,6),B);return $.position.set(U,G,X),$.visible=!1,this.group.add($),$};this.nav.push(S(16724520,-5.2,.1,3.4),S(2686810,5.2,.1,3.4)),this.strobe=S(16777215,0,4.3,5.8)}hinged(t,e,[i,n],r,o=0,a=2){const l=new fi;l.position.set(t[0],t[1],t[2]);const c=_=>[_[0]-t[0],_[1]-t[1],_[2]-t[2]],h=c(t),f=c(e),u=c(n),p=c(i);return l.add(new Tt(po([...h,...p,...u,...h,...u,...f],o,a),r)),l.userData.axis=new A(f[0],f[1],f[2]).normalize(),this.group.add(l),l}setControls(t,e,i,n){const r=Math.min(1,n*10);this.ctl.roll+=(t-this.ctl.roll)*r,this.ctl.pitch+=(e-this.ctl.pitch)*r,this.ctl.yaw+=(i-this.ctl.yaw)*r;const o=Math.PI/180,{roll:a,pitch:l,yaw:c}=this.ctl,h=(-l*12+a*14)*o,f=(-l*12-a*14)*o;this.elevons[0].quaternion.setFromAxisAngle(this.elevons[0].userData.axis,h),this.elevons[1].quaternion.setFromAxisAngle(this.elevons[1].userData.axis,-f),this.rudder.quaternion.setFromAxisAngle(this.rudder.userData.axis,c*18*o);for(const u of this.stabs)u.rotation.x=-l*14*o}setNight(t,e){for(const i of this.nav)i.visible=t;this.strobe.visible=t&&e%60<5}setFlame(t,e,i){const n=e?1.6+.08*Math.sin(i*40):.25+.35*t,r=e?1:.15+.35*t;this.flame.scale.set(e?1.05:.85,e?1.05:.85,n);const o=this.outerMat.uniforms,a=this.coreMat.uniforms;o.uTime.value=a.uTime.value=i,o.uHeat.value=a.uHeat.value=r,o.uGain.value=e?1.4:.5+.9*t,a.uGain.value=e?2.8:1.2+1.6*t,o.uDiamonds.value=0,a.uDiamonds.value=e?1:0,this.nozzleGlow.color.setHex(e?16756848:16742966).multiplyScalar(e?4:1+1.5*t),this.nozzleRing.emissiveIntensity=e?1.6:.2+.5*t}};lh.WINGTIPS=[[-5.2,0,3.4],[5.2,0,3.4]];let ra=lh;class zd{constructor(t){this.head=0,this.count=0,this.lastFrame=-1e9,this.style=t;const e=t.points;this.px=new Float32Array(e),this.py=new Float32Array(e),this.pz=new Float32Array(e),this.born=new Float64Array(e),this.geo=new Ue,this.pos=new xe(new Float32Array(e*2*3),3),this.col=new xe(new Float32Array(e*2*4),4),this.geo.setAttribute("position",this.pos),this.geo.setAttribute("color",this.col);const i=new Uint32Array((e-1)*6);for(let n=0;n<e-1;n++){const r=n*2;i[n*6]=r,i[n*6+1]=r+1,i[n*6+2]=r+2,i[n*6+3]=r+1,i[n*6+4]=r+3,i[n*6+5]=r+2}this.geo.setIndex(new xe(i,1)),this.mesh=new Tt(this.geo,new $e({vertexColors:!0,transparent:!0,depthWrite:!1,side:Ye})),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1,this.geo.setDrawRange(0,0)}setColor(t){this.style={...this.style,color:t}}clear(){this.count=0,this.head=0,this.lastFrame=-1e9,this.geo.setDrawRange(0,0)}faded(t){return this.count===0||t-this.lastFrame>this.style.life}record(t,e){if(this.count>0){const i=(this.head-1+this.style.points)%this.style.points,n=t.x-this.px[i],r=t.y-this.py[i],o=t.z-this.pz[i];if(n*n+r*r+o*o<this.style.spacing*this.style.spacing)return}this.px[this.head]=t.x,this.py[this.head]=t.y,this.pz[this.head]=t.z,this.born[this.head]=e,this.head=(this.head+1)%this.style.points,this.count=Math.min(this.style.points,this.count+1),this.lastFrame=e}update(t,e,i=1){const n=this.count;if(n<2){this.geo.setDrawRange(0,0);return}const r=this.style,o=this.pos.array,a=this.col.array;let l=0;for(let c=0;c<n;c++){const h=(this.head-1-c+r.points*2)%r.points,f=e-this.born[h],u=Math.max(0,1-f/r.life),p=this.px[h],_=this.py[h],g=this.pz[h],m=c+1<n?(this.head-2-c+r.points*2)%r.points:(this.head-c+r.points*2)%r.points;let d=p-this.px[m],M=_-this.py[m],x=g-this.pz[m];c+1>=n&&(d=-d,M=-M,x=-x);const y=t.x-p,C=t.y-_,T=t.z-g,b=Math.hypot(y,C,T);let L=M*T-x*C,O=x*y-d*T,v=d*C-M*y;const S=Math.hypot(L,O,v)||1,U=Math.max(r.width+(r.widthOld-r.width)*(1-u),b*r.minAngular)/2/S;L*=U,O*=U,v*=U,o[l*6]=p-L,o[l*6+1]=_-O,o[l*6+2]=g-v,o[l*6+3]=p+L,o[l*6+4]=_+O,o[l*6+5]=g+v;const G=r.alpha*(.14+.86*u)*(u>0?1:0);for(let X=0;X<2;X++){const B=(l*2+X)*4;a[B]=r.color[0]*i,a[B+1]=r.color[1]*i,a[B+2]=r.color[2]*i,a[B+3]=G}l++}this.pos.needsUpdate=!0,this.col.needsUpdate=!0,this.geo.setDrawRange(0,(l-1)*6)}}function YM(s,t){const e=new Ud,i=new ge({side:ei,depthWrite:!1,uniforms:{uSun:{value:t.clone().normalize()}},vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,fragmentShader:`
      uniform vec3 uSun;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float up = clamp(d.y, 0.0, 1.0);
        vec3 sky = mix(vec3(0.78, 0.86, 0.95), vec3(0.22, 0.42, 0.85), pow(up, 0.6));
        vec3 ground = mix(vec3(0.42, 0.44, 0.40), vec3(0.16, 0.18, 0.13), clamp(-d.y * 3.0, 0.0, 1.0));
        vec3 c = d.y >= 0.0 ? sky : ground;
        float mu = max(dot(d, uSun), 0.0);
        c += vec3(1.0, 0.92, 0.8) * (pow(mu, 600.0) * 40.0 + pow(mu, 24.0) * 0.6);
        gl_FragColor = vec4(c, 1.0);
      }`});e.add(new Tt(new Ie(100,48,24),i));const n=new _c(s),r=n.fromScene(e,0,.1,1e3).texture;return n.dispose(),i.dispose(),r}const ja=new Ht;class fa{constructor(t){t=t||{},this.vertices={near:[new A,new A,new A,new A],far:[new A,new A,new A,new A]},t.projectionMatrix!==void 0&&this.setFromProjectionMatrix(t.projectionMatrix,t.maxFar||1e4)}setFromProjectionMatrix(t,e){const i=t.elements[11]===0;return ja.copy(t).invert(),this.vertices.near[0].set(1,1,-1),this.vertices.near[1].set(1,-1,-1),this.vertices.near[2].set(-1,-1,-1),this.vertices.near[3].set(-1,1,-1),this.vertices.near.forEach(function(n){n.applyMatrix4(ja)}),this.vertices.far[0].set(1,1,1),this.vertices.far[1].set(1,-1,1),this.vertices.far[2].set(-1,-1,1),this.vertices.far[3].set(-1,1,1),this.vertices.far.forEach(function(n){n.applyMatrix4(ja);const r=Math.abs(n.z);i?n.z*=Math.min(e/r,1):n.multiplyScalar(Math.min(e/r,1))}),this.vertices}split(t,e){for(;t.length>e.length;)e.push(new fa);e.length=t.length;for(let i=0;i<t.length;i++){const n=e[i];if(i===0)for(let r=0;r<4;r++)n.vertices.near[r].copy(this.vertices.near[r]);else for(let r=0;r<4;r++)n.vertices.near[r].lerpVectors(this.vertices.near[r],this.vertices.far[r],t[i-1]);if(i===t.length-1)for(let r=0;r<4;r++)n.vertices.far[r].copy(this.vertices.far[r]);else for(let r=0;r<4;r++)n.vertices.far[r].lerpVectors(this.vertices.near[r],this.vertices.far[r],t[i])}}toSpace(t,e){for(let i=0;i<4;i++)e.vertices.near[i].copy(this.vertices.near[i]).applyMatrix4(t),e.vertices.far[i].copy(this.vertices.far[i]).applyMatrix4(t)}}const Su={lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

vec3 geometryClearcoatNormal = vec3( 0.0 );

#ifdef USE_CLEARCOAT

	geometryClearcoatNormal = clearcoatNormal;

#endif

#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		// Iridescence F0 approximation
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif

IncidentLight directLight;

#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		pointLight = pointLights[ i ];

		getPointLightInfo( pointLight, geometryPosition, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

	SpotLight spotLight;
 	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;

	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		spotLight = spotLights[ i ];

		getSpotLightInfo( spotLight, geometryPosition, directLight );

  		// spot lights are ordered [shadows with maps, shadows without maps, maps without shadows, none]
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;

		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct ) && defined( USE_CSM ) && defined( CSM_CASCADES )

	DirectionalLight directionalLight;
	float linearDepth = (vViewPosition.z) / (shadowFar - cameraNear);
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	#if defined( USE_SHADOWMAP ) && defined( CSM_FADE )
		vec2 cascade;
		float cascadeCenter;
		float closestEdge;
		float margin;
		float csmx;
		float csmy;

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

			directionalLight = directionalLights[ i ];
			getDirectionalLightInfo( directionalLight, directLight );

			#if ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
				// NOTE: Depth gets larger away from the camera.
				// cascade.x is closer, cascade.y is further
				cascade = CSM_cascades[ i ];
				cascadeCenter = ( cascade.x + cascade.y ) / 2.0;
				closestEdge = linearDepth < cascadeCenter ? cascade.x : cascade.y;
				margin = 0.25 * pow( closestEdge, 2.0 );
				csmx = cascade.x - margin / 2.0;
				csmy = cascade.y + margin / 2.0;
				if( linearDepth >= csmx && ( linearDepth < csmy || UNROLLED_LOOP_INDEX == CSM_CASCADES - 1 ) ) {

					float dist = min( linearDepth - csmx, csmy - linearDepth );
					float ratio = clamp( dist / margin, 0.0, 1.0 );

					vec3 prevColor = directLight.color;
					directionalLightShadow = directionalLightShadows[ i ];
					directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;

					bool shouldFadeLastCascade = UNROLLED_LOOP_INDEX == CSM_CASCADES - 1 && linearDepth > cascadeCenter;
					directLight.color = mix( prevColor, directLight.color, shouldFadeLastCascade ? ratio : 1.0 );

					ReflectedLight prevLight = reflectedLight;
					RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

					bool shouldBlend = UNROLLED_LOOP_INDEX != CSM_CASCADES - 1 || UNROLLED_LOOP_INDEX == CSM_CASCADES - 1 && linearDepth < cascadeCenter;
					float blendRatio = shouldBlend ? ratio : 1.0;

					reflectedLight.directDiffuse = mix( prevLight.directDiffuse, reflectedLight.directDiffuse, blendRatio );
					reflectedLight.directSpecular = mix( prevLight.directSpecular, reflectedLight.directSpecular, blendRatio );
					reflectedLight.indirectDiffuse = mix( prevLight.indirectDiffuse, reflectedLight.indirectDiffuse, blendRatio );
					reflectedLight.indirectSpecular = mix( prevLight.indirectSpecular, reflectedLight.indirectSpecular, blendRatio );

				}
			#endif

		}
		#pragma unroll_loop_end
	#elif defined (USE_SHADOWMAP)

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

			directionalLight = directionalLights[ i ];
			getDirectionalLightInfo( directionalLight, directLight );

			#if ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )

				directionalLightShadow = directionalLightShadows[ i ];
				if(linearDepth >= CSM_cascades[UNROLLED_LOOP_INDEX].x && linearDepth < CSM_cascades[UNROLLED_LOOP_INDEX].y) directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;

				if(linearDepth >= CSM_cascades[UNROLLED_LOOP_INDEX].x && (linearDepth < CSM_cascades[UNROLLED_LOOP_INDEX].y || UNROLLED_LOOP_INDEX == CSM_CASCADES - 1)) RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

			#endif

		}
		#pragma unroll_loop_end

	#elif ( NUM_DIR_LIGHT_SHADOWS > 0 )
		// note: no loop here - all CSM lights are in fact one light only
		getDirectionalLightInfo( directionalLights[0], directLight );
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	#endif

	#if ( NUM_DIR_LIGHTS > NUM_DIR_LIGHT_SHADOWS)
		// compute the lights not casting shadows (if any)

		#pragma unroll_loop_start
		for ( int i = NUM_DIR_LIGHT_SHADOWS; i < NUM_DIR_LIGHTS; i ++ ) {

			directionalLight = directionalLights[ i ];

			getDirectionalLightInfo( directionalLight, directLight );

			RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

		}
		#pragma unroll_loop_end

	#endif

#endif


#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct ) && !defined( USE_CSM ) && !defined( CSM_CASCADES )

	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		directionalLight = directionalLights[ i ];

		getDirectionalLightInfo( directionalLight, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

	RectAreaLight rectAreaLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if defined( RE_IndirectDiffuse )

	vec3 iblIrradiance = vec3( 0.0 );

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	#if defined( USE_LIGHT_PROBES )

		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );

	#endif

	#if ( NUM_HEMI_LIGHTS > 0 )

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );

		}
		#pragma unroll_loop_end

	#endif

#endif

#if defined( RE_IndirectSpecular )

	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );

#endif
`,lights_pars_begin:`
#if defined( USE_CSM ) && defined( CSM_CASCADES )
uniform vec2 CSM_cascades[CSM_CASCADES];
uniform float cameraNear;
uniform float shadowFar;
#endif
	`+Rt.lights_pars_begin},yu=new Ht,Ja=new fa,nn=new A,nr=new Dn,Qa=[],tl=[],el=new Ht,Eu=new Ht,$M=new A(0,1,0);class KM{constructor(t){this.camera=t.camera,this.parent=t.parent,this.cascades=t.cascades||3,this.maxFar=t.maxFar||1e5,this.mode=t.mode||"practical",this.shadowMapSize=t.shadowMapSize||2048,this.shadowBias=t.shadowBias||1e-6,this.lightDirection=t.lightDirection||new A(1,-1,1).normalize(),this.lightIntensity=t.lightIntensity||3,this.lightNear=t.lightNear||1,this.lightFar=t.lightFar||2e3,this.lightMargin=t.lightMargin||200,this.customSplitsCallback=t.customSplitsCallback,this.fade=!1,this.mainFrustum=new fa,this.frustums=[],this.breaks=[],this.lights=[],this.shaders=new Map,this.createLights(),this.updateFrustums(),this.injectInclude()}createLights(){for(let t=0;t<this.cascades;t++){const e=new Od(16777215,this.lightIntensity);e.castShadow=!0,e.shadow.mapSize.width=this.shadowMapSize,e.shadow.mapSize.height=this.shadowMapSize,e.shadow.camera.near=this.lightNear,e.shadow.camera.far=this.lightFar,e.shadow.bias=this.shadowBias,this.parent.add(e),this.parent.add(e.target),this.lights.push(e)}}initCascades(){const t=this.camera;t.updateProjectionMatrix(),this.mainFrustum.setFromProjectionMatrix(t.projectionMatrix,this.maxFar),this.mainFrustum.split(this.breaks,this.frustums)}updateShadowBounds(){const t=this.frustums;for(let e=0;e<t.length;e++){const n=this.lights[e].shadow.camera,r=this.frustums[e],o=r.vertices.near,a=r.vertices.far,l=a[0];let c;l.distanceTo(a[2])>l.distanceTo(o[2])?c=a[2]:c=o[2];let h=l.distanceTo(c);if(this.fade){const f=this.camera,u=Math.max(f.far,this.maxFar),p=r.vertices.far[0].z/(u-f.near),_=.25*Math.pow(p,2)*(u-f.near);h+=_}n.left=-h/2,n.right=h/2,n.top=h/2,n.bottom=-h/2,n.updateProjectionMatrix()}}getBreaks(){const t=this.camera,e=Math.min(t.far,this.maxFar);switch(this.breaks.length=0,this.mode){case"uniform":i(this.cascades,t.near,e,this.breaks);break;case"logarithmic":n(this.cascades,t.near,e,this.breaks);break;case"practical":r(this.cascades,t.near,e,.5,this.breaks);break;case"custom":this.customSplitsCallback===void 0&&console.error("CSM: Custom split scheme callback not defined."),this.customSplitsCallback(this.cascades,t.near,e,this.breaks);break}function i(o,a,l,c){for(let h=1;h<o;h++)c.push((a+(l-a)*h/o)/l);c.push(1)}function n(o,a,l,c){for(let h=1;h<o;h++)c.push(a*(l/a)**(h/o)/l);c.push(1)}function r(o,a,l,c,h){Qa.length=0,tl.length=0,n(o,a,l,tl),i(o,a,l,Qa);for(let f=1;f<o;f++)h.push(Mm.lerp(Qa[f-1],tl[f-1],c));h.push(1)}}update(){const t=this.camera,e=this.frustums;el.lookAt(new A,this.lightDirection,$M),Eu.copy(el).invert();for(let i=0;i<e.length;i++){const n=this.lights[i],r=n.shadow.camera,o=(r.right-r.left)/this.shadowMapSize,a=(r.top-r.bottom)/this.shadowMapSize;yu.multiplyMatrices(Eu,t.matrixWorld),e[i].toSpace(yu,Ja);const l=Ja.vertices.near,c=Ja.vertices.far;nr.makeEmpty();for(let h=0;h<4;h++)nr.expandByPoint(l[h]),nr.expandByPoint(c[h]);nr.getCenter(nn),nn.z=nr.max.z+this.lightMargin,nn.x=Math.floor(nn.x/o)*o,nn.y=Math.floor(nn.y/a)*a,nn.applyMatrix4(el),n.position.copy(nn),n.target.position.copy(nn),n.target.position.x+=this.lightDirection.x,n.target.position.y+=this.lightDirection.y,n.target.position.z+=this.lightDirection.z}}injectInclude(){Rt.lights_fragment_begin=Su.lights_fragment_begin,Rt.lights_pars_begin=Su.lights_pars_begin}setupMaterial(t){t.defines=t.defines||{},t.defines.USE_CSM=1,t.defines.CSM_CASCADES=this.cascades,this.fade&&(t.defines.CSM_FADE="");const e=[],i=this,n=this.shaders;t.onBeforeCompile=function(r){const o=Math.min(i.camera.far,i.maxFar);i.getExtendedBreaks(e),r.uniforms.CSM_cascades={value:e},r.uniforms.cameraNear={value:i.camera.near},r.uniforms.shadowFar={value:o},n.set(t,r)},n.set(t,null)}updateUniforms(){const t=Math.min(this.camera.far,this.maxFar);this.shaders.forEach(function(i,n){if(i!==null){const r=i.uniforms;this.getExtendedBreaks(r.CSM_cascades.value),r.cameraNear.value=this.camera.near,r.shadowFar.value=t}!this.fade&&"CSM_FADE"in n.defines?(delete n.defines.CSM_FADE,n.needsUpdate=!0):this.fade&&!("CSM_FADE"in n.defines)&&(n.defines.CSM_FADE="",n.needsUpdate=!0)},this)}getExtendedBreaks(t){for(;t.length<this.breaks.length;)t.push(new lt);t.length=this.breaks.length;for(let e=0;e<this.cascades;e++){const i=this.breaks[e],n=this.breaks[e-1]||0;t[e].x=n,t[e].y=i}}updateFrustums(){this.getBreaks(),this.initCascades(),this.updateShadowBounds(),this.updateUniforms()}remove(){for(let t=0;t<this.lights.length;t++)this.parent.remove(this.lights[t].target),this.parent.remove(this.lights[t])}dispose(){const t=this.shaders;t.forEach(function(e,i){delete i.onBeforeCompile,delete i.defines.USE_CSM,delete i.defines.CSM_CASCADES,delete i.defines.CSM_FADE,e!==null&&(delete e.uniforms.CSM_cascades,delete e.uniforms.cameraNear,delete e.uniforms.shadowFar),i.needsUpdate=!0}),t.clear()}}const wu=3,Dr=6e3,ZM=[75/Dr,720/Dr,1],jM=[.04,.4,3],JM=[-4e-6,-2e-5,-1e-4],go={CSM_cascades:{value:[new lt,new lt,new lt]},cameraNear:{value:1},shadowFar:{value:Dr}},QM=1/32e3,Tu=1/2500;function tx(){Rt.fog_pars_vertex=`
#ifdef USE_FOG
  varying float vFogDepth;
  varying float vFogY;
#endif`,Rt.fog_vertex=`
#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vFogY = ((mvPosition.xyz - viewMatrix[3].xyz) * mat3(viewMatrix)).y;
#endif`,Rt.fog_pars_fragment=`
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying float vFogY;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif`,Rt.fog_fragment=`
#ifdef USE_FOG
  float fogCamY = max(cameraPosition.y, 0.0);
  float fogK = ${Tu.toExponential(6)} * (vFogY - fogCamY);
  float fogLine = abs(fogK) > 1e-4 ? (1.0 - exp(-fogK)) / fogK : 1.0;
  float fogOpt = ${QM.toExponential(6)} * exp(-${Tu.toExponential(6)} * fogCamY) * vFogDepth * fogLine;
  float fogFactor = 1.0 - exp(-max(fogOpt, 0.0));
  #ifdef FOG_EXP2
    fogFactor = max(fogFactor, 1.0 - exp(- fogDensity * fogDensity * vFogDepth * vFogDepth));
  #else
    fogFactor = max(fogFactor, smoothstep(fogNear, fogFar, vFogDepth));
  #endif
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
#endif`}class ex{constructor(t,e,i,n){this.tick=0,tx(),this.csm=new KM({camera:e,parent:t,cascades:wu,maxFar:Dr,mode:"custom",customSplitsCallback:(o,a,l,c)=>{c.push(...ZM)},shadowMapSize:n,lightDirection:i.clone().negate(),lightIntensity:2.2,lightNear:1,lightFar:3e4,lightMargin:8e3}),this.csm.lights.forEach((o,a)=>{o.shadow.normalBias=jM[a],o.shadow.bias=JM[a]});const r=o=>o.replace(/defined\(\s*USE_CSM\s*\)/g,"1").replace(/defined\(\s*CSM_CASCADES\s*\)/g,"1").replace(/CSM_CASCADES/g,String(wu));Rt.lights_fragment_begin=r(Rt.lights_fragment_begin),Rt.lights_pars_begin=r(Rt.lights_pars_begin),un.prototype.onBeforeCompile=function(o){Object.assign(o.uniforms,go)},this.refreshBreaks(e)}refreshBreaks(t){this.csm.getExtendedBreaks(go.CSM_cascades.value),go.cameraNear.value=t.near,go.shadowFar.value=Math.min(t.far,Dr)}resize(t){this.csm.updateFrustums(),this.refreshBreaks(t)}setSun(t,e){for(const i of this.csm.lights)i.color.copy(t),i.intensity=e}setEnabled(t){this.csm.lights.forEach((e,i)=>{e.castShadow=t,i>0&&(e.visible=t)})}update(t){this.csm.update(),this.tick++%30===0&&ix(t)}}function ix(s){s.traverse(t=>{const e=t;if(!e.isMesh||e.userData.noShadow)return;const i=e.material;Array.isArray(i)||i.transparent||(i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial)&&(e.castShadow=!0,e.receiveShadow=!0)})}class nx{constructor(){this.ctx=null,this.out=null,this.listeners=[];const t=()=>{if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}if(!window.AudioContext)return;const e=new AudioContext,i=e.createGain();i.gain.value=.9,i.connect(e.destination),this.ctx=e,this.out=i;for(const n of this.listeners)n(e,i)};window.addEventListener("keydown",t),window.addEventListener("pointerdown",t)}onReady(t){this.ctx&&this.out?t(this.ctx,this.out):this.listeners.push(t)}}const Bd=new nx;class sx{constructor(){this.ctx=null,this.searchGain=null,this.lockGain=null,this.launchGain=null,this.launchOsc=null,this.nextSearch=0,this.nextLockPulse=0,this.launchUntil=0,Bd.onReady((t,e)=>this.build(t,e))}build(t,e){const i=t.createGain();i.gain.value=.2,i.connect(e);const n=(a,l)=>{const c=t.createOscillator();c.type=a,c.frequency.value=l;const h=t.createGain();return h.gain.value=0,c.connect(h).connect(i),c.start(),[c,h]};this.searchGain=n("sine",900)[1],this.lockGain=n("square",1250)[1];const[r,o]=n("triangle",900);this.launchOsc=r,this.launchGain=o,this.ctx=t}update(t,e,i,n){const r=this.ctx;if(!r||!this.searchGain||!this.lockGain||!this.launchGain||!this.launchOsc)return;const o=r.currentTime;if(!n){this.searchGain.gain.setTargetAtTime(0,o,.01),this.lockGain.gain.setTargetAtTime(0,o,.01),this.launchGain.gain.setTargetAtTime(0,o,.01),this.launchUntil=0;return}if(i>0&&o>this.launchUntil-.6){this.launchUntil=o+1.2;const a=this.launchOsc.frequency;a.cancelScheduledValues(o),a.setValueAtTime(700,o);for(let l=1;l<=14;l++)a.linearRampToValueAtTime(l%2?1500:700,o+l*.085);this.launchGain.gain.cancelScheduledValues(o),this.launchGain.gain.setValueAtTime(.8,o),this.launchGain.gain.setValueAtTime(0,o+1.2)}if(e>0){if(o>=this.nextLockPulse){const a=this.lockGain.gain;a.setValueAtTime(.35,o),a.setValueAtTime(0,o+.09),this.nextLockPulse=o+.16}}else if(t>0){if(o>=this.nextSearch){const a=this.searchGain.gain;a.setValueAtTime(.5,o),a.setValueAtTime(0,o+.07),a.setValueAtTime(.5,o+.14),a.setValueAtTime(0,o+.21),this.nextSearch=o+2}}else this.nextSearch=0}}const Tr=44100;function sr(s,t,e,i,n=.35){const r=Math.floor(Tr*i),o=s.createBuffer(1,r,Tr),a=o.getChannelData(0);let l=0;for(let c=0;c<r;c++){const h=c/r,f=t+(e-t)*h;l=(l+2*Math.PI*f/Tr)%(2*Math.PI),a[c]=Math.sin(l)*Math.pow(1-h,1.3)*n}return o}function rx(s,t,e=.45){const i=Math.floor(Tr*t),n=s.createBuffer(1,i,Tr),r=n.getChannelData(0);let o=7,a=0;for(let l=0;l<i;l++){o=o*16807%2147483647;const c=o/2147483647*2-1;a+=(c-a)*.06,r[l]=Math.max(-1,Math.min(1,a*3))*Math.pow(1-l/i,1.6)*e}return n}class ox{constructor(){this.ctx=null,this.out=null,this.bufs=new Map,Bd.onReady((t,e)=>{this.ctx=t,this.out=e,this.bufs.set("shoot",sr(t,840,260,.08)),this.bufs.set("explode",rx(t,.45)),this.bufs.set("ignite",sr(t,140,380,.25)),this.bufs.set("switch",sr(t,600,980,.1)),this.bufs.set("missile",sr(t,1200,500,.18,.25)),this.bufs.set("flare",sr(t,2200,1400,.12,.2))})}play(t,e=0,i=12e3){const n=this.ctx,r=this.bufs.get(t);if(!n||!this.out||!r||e>i)return;const o=n.createBufferSource();o.buffer=r;const a=n.createGain();a.gain.value=1/(1+e/1500),o.connect(a).connect(this.out),o.start()}}const Ii=new ox,_o=34,vo=8,ax=70,il=65,lx=74,bu=new A,Au=new A,Es=new A,ws=new A;class cx{constructor(t){this.offset=new A(0,vo,_o),this.up=new A(0,1,0),this.fov=il,this.camera=new yi(il,t,1,12e4)}snap(t,e){Es.set(0,0,-1).applyQuaternion(e),ws.set(0,1,0).applyQuaternion(e),this.offset.copy(Es).multiplyScalar(-_o).addScaledVector(ws,vo),this.up.copy(ws),this.place(t,Es)}update(t,e,i,n){Es.set(0,0,-1).applyQuaternion(i),ws.set(0,1,0).applyQuaternion(i),bu.copy(Es).multiplyScalar(-_o).addScaledVector(ws,vo);const r=1-Math.exp(-5*t);this.offset.lerp(bu,r),this.offset.setLength(Math.hypot(_o,vo)),this.up.lerp(ws,1-Math.exp(-3.5*t)).normalize();const o=n?lx:il;this.fov+=(o-this.fov)*(1-Math.exp(-2.5*t)),Math.abs(this.camera.fov-this.fov)>.01&&(this.camera.fov=this.fov,this.camera.updateProjectionMatrix()),this.place(e,Es)}place(t,e){this.camera.position.copy(t).add(this.offset),Au.copy(t).addScaledVector(e,ax),this.camera.up.copy(this.up),this.camera.lookAt(Au)}resize(t){this.camera.aspect=t,this.camera.updateProjectionMatrix()}}const Nt=1/60,kd=1.15;let Yi=kd;function hx(s){Yi=s?1:kd}const Nr=s=>Math.min(.98,s*Yi),da=s=>Math.round(s/Yi),Re=.3048,pt=4,Hd=3,ux=s=>s*pt*60*Hd,zt=14e3,kt=5e3,Te=s=>(s-zt/2)*pt,_e=s=>(s-kt/2)*pt,oi=s=>760+110*Math.sin(s/520+.6)+45*Math.sin(s/190+2.1)+18*Math.sin(s/67),fx=2e3,dx=2400,Ru=12,br=35e3,px=3e3,mx=15e3,gx=350*pt,Mc=.35,$s=ux(Mc),_x=.01,vx=100;let es=1,$i=1;function Mx(s){es=Math.min(vx,Math.max(1,Math.round(s))),$i=(Mc+(es-1)*_x)/Mc}const Ir=300,Cu=.09,xc=50,Pu=20,xx=420,Lu=2,Sx=650*pt,Gd=900,Du=4,yx=1/240,Ex=150,Iu=4,wx=520*pt,Tx=180,bx=.7,Ax=1200,Uu=1,Rx=12,Cx=.5,Px=380*pt,Sc=900,Lx=2500*pt,Mo=9e3,Nu=16e3,Dx=30,Ix=Ir,Ux=22*pt,Nx=2.2,Fu=Nx*$s,Fx=420,Ou=90,rr=.35,Vd=2400,Ox=.022,zx=.5,Bx=300,kx=600,Hx=400*pt,Gx=.8,Vx=3.5,Wx=60*Math.PI/180,zu=45*pt,Xx=()=>da(45),qx=()=>1600*pt*Yi,Bu=()=>1200*pt*Yi,Yx=3,$x=4,Kx=.03,Zx=.05,ku=10*pt,jx=20*pt,Jx=2400,Qx=14*pt,tS=8*pt,eS=1200,iS=1800,nS=3600,sS=260*pt,rS=()=>Nr(.85),Wd=()=>da(300),yc=6,Xd=120,qd=()=>da(300),oS=1400,aS=()=>Nr(.85),Hu=180,Gu=4,lS=450*pt,cS=()=>Nr(.6),Yd=()=>da(720),hS=400*pt,nl=150*pt,uS=.05,fS=20*pt,dS=150,Vu=.5,pS=.25,mS=()=>Nr(.45),gS=500,$d=[[150,82,62],[170,150,120],[122,112,100],[140,100,70]],_S=[[255,222,140],[255,196,96],[210,232,255]];function vS(s){let t=s|0;return()=>{t=t+1831565813|0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}const Ec=(s,t)=>(s-9600)/1300+(t-2900)/800+.35*Math.sin(s/700)+.25*Math.sin(t/410)>1,Kd=(s,t)=>s>2300&&s<zt-750&&t<640+160*Math.sin(s/900)+40*Math.sin(s/230);function sl(s,t=3){let e=s;for(let i=0;i<t;i++){const n=[e[0],e[1]];for(let r=0;r+3<e.length;r+=2){const o=e[r],a=e[r+1],l=e[r+2],c=e[r+3];n.push(.75*o+.25*l,.75*a+.25*c,.25*o+.75*l,.25*a+.75*c)}n.push(e[e.length-2],e[e.length-1]),e=n}return e}class MS{constructor(){this.peaks=[],this.tributaries=[],this.border=[],this.cities=[],this.highways=[],this.railways=[],this.airbases=[],this.forests=[],this.villages=[];const t=vS(2026),e=(u,p)=>u+t()*(p-u),i=(u,p)=>u+Math.floor(t()*(p-u+1)),n=(u,p)=>{const _=Math.max(1e-9,t());return u+p*Math.sqrt(-2*Math.log(_))*Math.cos(2*Math.PI*t())};let r=2500;for(;r<zt-900;){for(let u=0;u<3;u++){const p=r+e(-40,40),_=150+u*170+160*Math.sin(r/900)+e(-60,60),g=e(40,95)*(1-u*.2),m=e(-.5,.5),d=[];for(let x=0;x<10;x++){const y=m+x*Math.PI/5,C=1+.6*Math.abs(Math.cos(y-m)),T=g*C*e(.55,1);d.push(p+Math.cos(y)*T*.75,_+Math.sin(y)*T*.5)}const M=t()<.75-u*.3;this.peaks.push({x:p,y:_,r:g,snow:M,ridge:m,outline:d})}r+=e(40,75)}const o=[];let a=kt*.45,l=oi(a)-160;for(;l<=zt+300;)o.push(l,a),l+=e(220,360),a=Math.max(kt*.22,Math.min(kt*.82,a+e(-170,170)));this.river=sl(o);const c=this.river.length/2;for(let u=0;u<4;u++){const p=Math.floor(c*(.2+.18*u));let _=this.river[p*2],g=this.river[p*2+1],m=(u%2===0?-Math.PI/2:Math.PI/2)+e(-.4,.4);const d=[_,g],M=i(5,8);for(let x=0;x<M;x++)m+=e(-.45,.45),_=Math.max(1200,Math.min(zt-150,_+Math.cos(m)*e(200,290))),g=Math.max(120,Math.min(kt-120,g+Math.sin(m)*e(200,290))),d.push(_,g);this.tributaries.push(sl(d))}let h=zt*.78;for(let u=0;u<21;u++)h=Math.max(zt*.72,Math.min(zt*.84,h+e(-160,160))),this.border.push(h,kt*u/20);const f=(zt-2600)/(Ru-1);for(let u=0;u<Ru;u++){const p=1500+u*f+e(-180,180),_=e(1e3,kt-550),g=i(150,250),m=[];for(let d=-g;d<=g;d+=26)for(let M=-g;M<=g;M+=26){const x=Math.hypot(d,M)/g;if(x>.95||t()<x*.55)continue;const y=i(14,21),C=i(14,21),T=i(72,112),b=[],L=Math.floor(i(1,4)*(1.4-x));for(let O=0;O<L;O++)b.push(i(2,y-3),i(2,C-3),i(0,2));m.push({x:p+d-y/2,y:_+M-C/2,w:y,h:C,tone:T,lights:b})}this.cities.push({x:p,y:_,r:g,name:`SECTOR-${String.fromCharCode(65+u)}`,blocks:m})}for(let u=0;u+1<this.cities.length;u++){const p=this.cities[u],_=this.cities[u+1];this.highways.push([p.x,p.y,_.x,_.y])}for(let u=0;u+2<this.cities.length;u++){const p=this.cities[u],_=this.cities[u+2],g=[(p.x+_.x)/2+e(-200,200),(p.y+_.y)/2+e(-400,400)];this.railways.push(sl([p.x,p.y,g[0],g[1],_.x,_.y],2))}for(const u of[2,6,9]){const p=this.cities[u];this.airbases.push(p.x+(t()<.5?-1:1)*520,p.y+e(-260,260))}for(let u=0;u<70;u++){const p=e(1500,zt-400);let _=e(700,kt-300);_>1300&&t()<.6&&(_=e(700,1300));const g=[],m=i(25,45);for(let d=0;d<m;d++)g.push(n(p,60),n(_,40),i(5,10));this.forests.push({x:p,y:_,trees:g})}for(;this.villages.length<240;){const u=e(800,kt-150),p=e(oi(u)+80,zt-150);if(this.cities.some(m=>Math.hypot(m.x-p,m.y-u)<m.r*1.4))continue;const _=[],g=i(5,12);for(let m=0;m<g;m++)_.push(p+e(-28,28),u+e(-20,20),i(0,3));this.villages.push({x:p,y:u,houses:_})}}borderX(t){const e=Math.min(this.border.length/2-2,Math.max(0,Math.floor(t/kt*20))),i=this.border[e*2],n=this.border[e*2+1],r=this.border[e*2+2],o=this.border[e*2+3];return i+(r-i)*((t-n)/(o-n))}nearRiver(t,e,i){const n=this.river;for(let r=0;r<n.length;r+=4)if(Math.hypot(n[r]-t,n[r+1]-e)<i)return!0;return!1}}const bt=new MS,ke=16,hi=Math.ceil(zt/ke)+1,wn=Math.ceil(kt/ke)+1,Zd=0;function xo(s,t){let e=s*374761393+t*668265263|0;return e=Math.imul(e^e>>>13,1274126177),e^=e>>>16,(e&16777215)/16777215}function jd(s,t){const e=Math.floor(s),i=Math.floor(t),n=s-e,r=t-i,o=n*n*(3-2*n),a=r*r*(3-2*r),l=xo(e,i),c=xo(e+1,i),h=xo(e,i+1),f=xo(e+1,i+1);return l+(c-l)*o+(h-l)*a+(l-c-h+f)*o*a}function Ko(s,t){let e=0,i=1,n=1;for(let r=0;r<4;r++)e+=i*jd(s*n+r*17.3,t*n-r*9.1),i*=.5,n*=2.03;return e/1.875}function xS(s,t){return 60+Ko(s/9e3,t/9e3)*380}const or=(s,t,e)=>{const i=Math.min(1,Math.max(0,(e-s)/(t-s)));return i*i*(3-2*i)},Ds=new Float32Array(hi*wn);(function(){const t=new Float32Array(hi*wn).fill(1e9),e=new Float32Array(hi*wn).fill(6),i=[[bt.river,null],...bt.tributaries.map(o=>[o,5])],n=220;for(const[o,a]of i)for(let l=0;l+3<o.length;l+=2){const c=o[l],h=o[l+1],f=o[l+2],u=o[l+3],p=a??7+9*Math.max(0,1-c/zt),_=Math.max(0,Math.floor((Math.min(c,f)-n)/ke)),g=Math.min(hi-1,Math.ceil((Math.max(c,f)+n)/ke)),m=Math.max(0,Math.floor((Math.min(h,u)-n)/ke)),d=Math.min(wn-1,Math.ceil((Math.max(h,u)+n)/ke)),M=f-c,x=u-h,y=M*M+x*x||1;for(let C=m;C<=d;C++)for(let T=_;T<=g;T++){const b=T*ke,L=C*ke,O=Math.max(0,Math.min(1,((b-c)*M+(L-h)*x)/y)),v=Math.hypot(b-c-O*M,L-h-O*x),S=C*hi+T;v<t[S]&&(t[S]=v,e[S]=p)}}const r=new Float32Array(hi*wn);for(const o of bt.peaks){const a=o.r*1.6*2.2,l=o.r*22+(o.snow?300:0),c=Math.max(0,Math.floor((o.x-a)/ke)),h=Math.min(hi-1,Math.ceil((o.x+a)/ke)),f=Math.max(0,Math.floor((o.y-a)/ke)),u=Math.min(wn-1,Math.ceil((o.y+a)/ke));for(let p=f;p<=u;p++)for(let _=c;_<=h;_++){const g=_*ke-o.x,m=p*ke-o.y,d=g*Math.cos(o.ridge)+m*Math.sin(o.ridge),M=-g*Math.sin(o.ridge)+m*Math.cos(o.ridge),x=Math.hypot(d*.7,M)/a;if(x>=1)continue;const y=1-x,C=l*y*y*(3-2*y),T=p*hi+_;C>r[T]&&(r[T]=C)}}for(let o=0;o<wn;o++){const a=o*ke,l=oi(a);for(let c=0;c<hi;c++){const h=c*ke,f=o*hi+c;if(h<l){Ds[f]=Zd;continue}const u=(h-zt/2)*pt,p=(a-kt/2)*pt;let _=xS(u,p);Ec(h,a)&&(_=80+Ko(u/3e3,p/3e3)*90);const g=640+160*Math.sin(h/900)+40*Math.sin(h/230),m=or(g+250,g-150,a)*or(2e3,2600,h)*or(zt-450,zt-900,h);_+=m*(500+Ko(u/4e3,p/4e3)*500)+r[f],Kd(h,a)&&(_+=Ko(u/1500,p/1500)*200),_=1+(_-1)*or(0,260,h-l);const d=e[f],M=or(d*.6,d+200,t[f]);_=1+(_-1)*M,Ds[f]=Math.max(1,_)}}})();function ne(s,t){const e=s/pt+zt/2,i=t/pt+kt/2;return e<0?Zd:e>zt||i<0||i>kt?Xu(Wu(e,zt),Wu(i,kt)):Xu(e,i)}function Wu(s,t){const e=(s%(2*t)+2*t)%(2*t);return e<=t?e:2*t-e}function Xu(s,t){const e=s/ke,i=t/ke,n=Math.min(hi-2,Math.floor(e)),r=Math.min(wn-2,Math.floor(i)),o=e-n,a=i-r,l=r*hi+n,c=Ds[l],h=Ds[l+1],f=Ds[l+hi],u=Ds[l+hi+1];return c+(h-c)*o+(f-c)*a+(c-h-f+u)*o*a}const ar=Math.PI/2,rl=new A,So=new A,yo=new A,qu=new A,Yu=new A(0,1,0),Ts=new A,ol=new A;class SS{constructor(t){this.host=t,this.tracking=!1,this.index=-1,this.t=0,this.cut=document.getElementById("cut"),this.camInit=!1;const{jet:e,threats:i}=t,n=i.launchers.find(g=>g.kind==="TEL"&&g.y<400&&g.z>-2e3&&g.z<6e3&&g.x>-15e3&&g.x<1e4)??i.launchers[0],r=bt.cities[4],o=Te(r.x),a=_e(r.y),l=ne(o,a),c=bt.peaks.filter(g=>g.snow).sort((g,m)=>m.r-g.r)[3]??bt.peaks[0],h=Te(c.x),f=_e(c.y)+1500;let u=!1;const p=(g,m,d,M)=>{e.reset(g,d,M),e.pos.y=m},_=g=>{const m=i.missiles.items;for(let d=0;d<m.length;d++)if(m[d].active&&m[d].launcher===g.index)return m[d];return null};this.shots=[{dur:7,setup:()=>{p(t.start.x,35e3*Re,t.start.z,t.start.heading),t.snapChase()}},{dur:9,setup:()=>{p(n.x-2600,n.y+3e3,n.z+300,ar),u=!1,this.tracking=!0},step:g=>{g>.4&&g<.42&&i.launch(n,e,!0);const m=_(n);m&&!u&&m.pos.distanceTo(e.pos)<900&&m.climbShare>.5&&(i.cm.fireFlares(e.pos,e.vel),u=!0)},camera:(g,m,d)=>{yo.copy(e.vel).normalize(),qu.crossVectors(yo,Yu).normalize(),Ts.copy(e.pos).addScaledVector(qu,55).addScaledVector(Yu,30).addScaledVector(yo,-95);const M=_(n);return ol.copy(e.pos).addScaledVector(yo,120),M&&ol.lerp(M.pos,Math.min(.12,150/Math.max(150,M.pos.distanceTo(e.pos)))),this.ease(g,Ts,ol,d,3),!0}},{dur:6,setup:()=>{const g=i.drones[0];p(g.x-6e3,g.y+800,g.z,ar)},camera:(g,m,d)=>{const M=i.drones[0],x=m*.35+.6;return So.set(M.x,M.y,M.z),Ts.set(M.x+Math.cos(x)*55,M.y+12,M.z+Math.sin(x)*55),this.ease(g,Ts,So,d,8),!0}},{dur:7,setup:()=>{let g=0;for(let m=0;m<12;m++)g=Math.max(g,ne(h-7e3+m*900,f));p(h-7e3,g+450,f,ar),t.snapChase()}},{dur:6,setup:()=>{p(o-3500,l+420,a+200,ar),t.snapChase()}},{dur:7,setup:()=>{t.setDemoNight(!0),p(o-2500,l+600,a-300,ar)},camera:(g,m,d)=>{const M=2.3+m*.06;return Ts.set(o+Math.cos(M)*3200,l+1100,a+Math.sin(M)*3200),So.set(o,l+60,a),this.ease(g,Ts,So,d,6),!0}}]}begin(){this.index=-1,this.next()}end(){this.host.setDemoNight(!1),this.tracking=!1}next(){this.host.setDemoNight(!1),this.tracking=!1,this.index=(this.index+1)%this.shots.length,this.t=0,this.camInit=!1,this.host.threats.reset(Date.now()&2147483647|1),this.host.clearFx(),this.shots[this.index].setup(),this.host.snapTerrain(this.host.jet.pos.x,this.host.jet.pos.z),this.cut&&(this.cut.classList.add("on"),requestAnimationFrame(()=>this.cut?.classList.remove("on")))}step(){if(this.index<0)return;this.t+=Nt;const t=this.shots[this.index];t.step&&t.step(this.t);const e=this.host.jet,i=ne(e.pos.x,e.pos.z);e.pos.y<i+150&&(e.pos.y=i+150),this.t>=t.dur&&this.next()}camera(t,e){if(this.index<0)return!1;const i=this.shots[this.index];return i.camera?i.camera(t,this.t,e):!1}ease(t,e,i,n,r){this.camInit?(t.position.lerp(e,1-Math.exp(-r*n)),rl.lerp(i,1-Math.exp(-r*n))):(t.position.copy(e),rl.copy(i),this.camInit=!0),t.up.set(0,1,0),t.lookAt(rl),t.fov!==60&&(t.fov=60,t.updateProjectionMatrix())}}function Jd(s,t){try{const e=window,i=e.Stratos||(e.parent&&e.parent!==window?e.parent.Stratos:void 0);i&&i.track(s,t)}catch{}}let Zo=0;function Qd(s){Zo=Date.now(),Jd("level_start",{level:s})}function yS(s=0){if(!Zo)return;const t=Math.round((Date.now()-Zo)/1e3);Zo=0,Jd("game_over",{seconds:t,score:s})}const kn=80,$u=.18,al=.15,ll=4,ES=["start","flare","ecm","night","chaff","bomb","agm","aam","aero","sam","nextJet","prevJet","levelUp","levelDown","twoPlayers","p2Left","p2Right","p2Guided","p2Unguided"],wS={Enter:"start",NumpadEnter:"start",KeyC:"flare",KeyX:"ecm",KeyT:"night",KeyK:"chaff",KeyB:"bomb",KeyG:"agm",KeyZ:"aam",KeyV:"aero",KeyM:"sam",KeyN:"levelUp",KeyP:"levelDown",Digit2:"twoPlayers"},Ku={ArrowLeft:"p2Left",ArrowRight:"p2Right",ArrowUp:"p2Guided",ArrowDown:"p2Unguided"},TS=[["start",9],["start",0],["flare",3],["ecm",4],["night",17],["chaff",12],["bomb",13],["agm",1],["aam",2],["aero",10],["nextJet",11],["levelUp",9],["levelDown",8]],bS=[["p2Left",14],["p2Right",15],["p2Guided",0],["p2Unguided",1]],AS=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","Tab"]),Eo=s=>s<-1?-1:s>1?1:s,lr=(s,t)=>{const e=Math.abs(s);return e<t?0:Math.sign(s)*((e-t)/(1-t))};class RS{constructor(t){this.pitch=0,this.roll=0,this.yaw=0,this.throttle=0,this.afterburner=!1,this.touchMode=!1,this.twoPlayers=!1,this.keys=new Set,this.kPitch=0,this.kRoll=0,this.kYaw=0,this.queued=new Map,this.pad1Was=[],this.pad2Was=[],this.padConnected=!1,this.stickId=-1,this.stickCx=0,this.stickCy=0,this.stickX=0,this.stickY=0,this.touchThrUp=!1,this.touchThrDown=!1,this.touchAb=!1;for(const e of ES)this.queued.set(e,!1);window.addEventListener("keydown",e=>{if(AS.has(e.code)&&e.preventDefault(),!e.repeat){e.code==="Tab"&&this.queue(e.shiftKey?"prevJet":"nextJet");const i=wS[e.code];i&&this.queue(i),this.twoPlayers&&Ku[e.code]&&this.queue(Ku[e.code])}this.keys.add(e.code),this.touchMode=!1,this.showTouch(!1)}),window.addEventListener("keyup",e=>this.keys.delete(e.code)),window.addEventListener("blur",()=>this.keys.clear()),window.addEventListener("gamepadconnected",()=>this.padConnected=!0),window.addEventListener("gamepaddisconnected",()=>{const e=navigator.getGamepads();this.padConnected=!1;for(const i of e)i&&(this.padConnected=!0)}),this.buildTouch(t),(navigator.maxTouchPoints>0||"ontouchstart"in window)&&(this.touchMode=!0,this.showTouch(!0))}queue(t){this.queued.set(t,!0)}queueStart(){this.queue("start")}consume(t){const e=this.queued.get(t)===!0;return e&&this.queued.set(t,!1),e}consumeStart(){return this.consume("start")}consumeFlare(){return this.consume("flare")}consumeEcm(){return this.consume("ecm")}consumeNight(){return this.consume("night")}rumble(t,e,i){if(!this.padConnected)return;const n=navigator.getGamepads();for(let r=0;r<n.length;r++){const o=n[r];if(!o||!o.connected)continue;const a=o.vibrationActuator;a&&a.playEffect&&a.playEffect("dual-rumble",{duration:i,strongMagnitude:t,weakMagnitude:e}).catch(()=>{});break}}padEdges(t,e,i){const n=t.buttons;for(let r=0;r<e.length;r++){const[o,a]=e[r],l=!!(n[a]&&n[a].pressed);l&&!i[r]&&this.queue(o),i[r]=l}}update(t){const e=this.keys,i=!this.twoPlayers,n=(e.has("KeyS")||i&&e.has("ArrowDown")?1:0)-(e.has("KeyW")||i&&e.has("ArrowUp")?1:0),r=(e.has("KeyD")||i&&e.has("ArrowRight")?1:0)-(e.has("KeyA")||i&&e.has("ArrowLeft")?1:0),o=(e.has("KeyE")?1:0)-(e.has("KeyQ")?1:0);this.kPitch=cl(this.kPitch,n,ll*t),this.kRoll=cl(this.kRoll,r,ll*t),this.kYaw=cl(this.kYaw,o,ll*t);let a=this.kPitch,l=this.kRoll,c=this.kYaw,h=(e.has("KeyR")?1:0)-(e.has("KeyF")?1:0),f=e.has("Space");if(this.padConnected){const u=navigator.getGamepads();let p=0;for(let _=0;_<u.length;_++){const g=u[_];if(!g||!g.connected)continue;if(p===1){this.twoPlayers&&this.padEdges(g,bS,this.pad2Was);break}p++;const m=g.axes,d=lr(m[0]??0,al),M=lr(m[1]??0,al),x=lr(m[2]??0,al);(d!==0||M!==0||x!==0)&&(l+=d,a+=M,c+=x,this.touchMode=!1,this.showTouch(!1));const y=g.buttons,C=y[7]?y[7].value:0,T=y[6]?y[6].value:0;C>.1&&(h+=C),T>.1&&(h-=T),(y[0]&&y[0].pressed||y[5]&&y[5].pressed)&&(f=!0),this.padEdges(g,TS,this.pad1Was)}}this.stickId>=0&&(l+=this.stickX,a+=this.stickY),this.touchThrUp&&(h+=1),this.touchThrDown&&(h-=1),this.touchAb&&(f=!0),this.pitch=Eo(a),this.roll=Eo(l),this.yaw=Eo(c),this.throttle=Eo(h),this.afterburner=f}setTouchVisible(t){this.touchLayer.style.display=this.touchMode&&t?"block":"none"}showTouch(t){t||(this.touchLayer.style.display="none")}buildTouch(t){const e=document.createElement("div");e.className="touch-layer",e.style.display="none";const i=document.createElement("div");i.className="stick-base",i.style.width=i.style.height=`${kn*2}px`;const n=document.createElement("div");n.className="stick-knob",i.appendChild(n),e.appendChild(i),this.stickBase=i,this.stickKnob=n;const r=document.createElement("div");r.className="stick-zone",e.insertBefore(r,i),r.addEventListener("pointerdown",c=>{this.stickId>=0||(this.stickId=c.pointerId,this.stickCx=c.clientX,this.stickCy=c.clientY,r.setPointerCapture(c.pointerId),this.placeStick(),this.moveStick(c.clientX,c.clientY))}),r.addEventListener("pointermove",c=>{c.pointerId===this.stickId&&this.moveStick(c.clientX,c.clientY)});const o=c=>{c.pointerId===this.stickId&&(this.stickId=-1,this.stickX=this.stickY=0,this.stickKnob.style.transform="translate(-50%, -50%)",this.stickBase.classList.remove("live"))};r.addEventListener("pointerup",o),r.addEventListener("pointercancel",o);const a=(c,h,f)=>{const u=document.createElement("div");u.className=`touch-btn ${h}`,u.textContent=c,u.addEventListener("pointerdown",_=>{u.setPointerCapture(_.pointerId),f(!0),u.classList.add("held")});const p=()=>{f(!1),u.classList.remove("held")};u.addEventListener("pointerup",p),u.addEventListener("pointercancel",p),e.appendChild(u)},l=(c,h,f)=>a(c,h,u=>{u&&this.queue(f)});a("THR +","thr-up",c=>this.touchThrUp=c),a("THR -","thr-down",c=>this.touchThrDown=c),a("AB","ab",c=>this.touchAb=c),l("FLARE","flare","flare"),l("ECM","ecm","ecm"),l("CHAFF","chaff","chaff"),l("BOMB","bomb","bomb"),l("AGM","agm","agm"),l("AAM","aam","aam"),l("NIGHT","night","night"),l("AERO","aero","aero"),l("SAM","sam","sam"),l("JET","jet","nextJet"),l("LV+","lvup","levelUp"),l("LV-","lvdown","levelDown"),t.appendChild(e),this.touchLayer=e,window.addEventListener("pointerdown",c=>{c.pointerType==="touch"&&(this.touchMode=!0)})}placeStick(){this.stickBase.style.left=`${this.stickCx-kn}px`,this.stickBase.style.top=`${this.stickCy-kn}px`,this.stickBase.style.bottom="auto",this.stickBase.classList.add("live")}moveStick(t,e){let i=(t-this.stickCx)/kn,n=(e-this.stickCy)/kn;const r=Math.hypot(i,n);r>1&&(i/=r,n/=r),this.stickKnob.style.transform=`translate(calc(-50% + ${i*kn}px), calc(-50% + ${n*kn}px))`,this.stickX=lr(i,$u),this.stickY=lr(n,$u)}}function cl(s,t,e){const i=t===0?e*2:e;return s<t?Math.min(t,s+i):s>t?Math.max(t,s-i):s}const Zu=[["BARREL ROLL",150],["LOOP",260],["VICTORY ROLLS",150]],CS=[[255/255,140/255,40/255],[245/255,245/255,245/255],[60/255,190/255,90/255]],hl=new A,PS=new A(0,1,0),wo=new A;class LS{constructor(){this.kind="",this.next=0,this.frames=0,this.turned=0,this.prevUp=new A,this.prevDir=new A,this.stick={pitch:0,roll:0,yaw:0,throttle:0,afterburner:!1}}get active(){return this.kind!==""}start(t){const[e]=Zu[this.next%Zu.length];return this.next++,this.kind=e,this.frames=0,this.turned=0,this.prevUp.copy(t.liftUp),this.prevDir.copy(t.vel).normalize(),e}stop(){this.kind=""}control(t){if(!this.active)return!1;this.frames++,wo.copy(t.vel).normalize(),this.kind==="LOOP"?this.turned+=Math.acos(Math.min(1,Math.max(-1,this.prevDir.dot(wo)))):this.turned+=Math.acos(Math.min(1,Math.max(-1,this.prevUp.dot(t.liftUp)))),this.prevUp.copy(t.liftUp),this.prevDir.copy(wo);const e=this.stick;if(e.yaw=0,e.throttle=0,this.kind==="BARREL ROLL")e.roll=1,e.pitch=.45,e.afterburner=!1,(this.turned>=Math.PI*2||this.frames>600)&&(this.kind="");else if(this.kind==="LOOP"){hl.crossVectors(wo,PS);const i=hl.lengthSq()>1e-6?t.liftUp.dot(hl.normalize()):0;e.roll=Math.max(-1,Math.min(1,-i*3)),e.pitch=1,e.afterburner=!0,(this.turned>=Math.PI*2*.97||this.frames>1500)&&(this.kind="")}else e.roll=1,e.pitch=.08,e.afterburner=!1,(this.turned>=Math.PI*6||this.frames>900)&&(this.kind="");return this.active}}const ju=["VIPER-1","EAGLE-2","GHOST-3","TITAN-4","HAWK-5","FALCON-6","RAVEN-7","SHADOW-8","VALKYRIE-9","OMEGA-10"],DS=[["ALPHA",[0,1,2],"V"],["BRAVO",[3,4],"ECHELON"],["CHARLIE",[5,6,7],"LINE"],["DELTA",[8,9],"TRAIL"]],Ju=700,IS=3600,Qu=2200,US=180,NS=.35/40;class FS{constructor(t,e,i){this.id=t,this.callsign=e,this.hue=i,this.pos=new A,this.heading=0,this.bank=0,this.alive=!0,this.downTimer=0,this.model=new ra(i)}}const tf=new bi(0,0,0,"YXZ");class OS{constructor(t){this.jets=[],this.flights=[],this.active=0;let e=35e3;this.rand=()=>(e=e*16807%2147483647,e/2147483647);for(let i=0;i<ju.length;i++){const n=new FS(i,ju[i],i*36%360);t.add(n.model.group),this.jets.push(n)}for(const[i,n,r]of DS)this.flights.push({name:i,ids:n,style:r,track:[0,0,0,0],station:[0,0],wp:0,retask:0,m:[]})}get callsign(){return this.jets[this.active].callsign}reset(t,e){this.active=0;for(const i of this.jets)i.alive=!0,i.downTimer=0;for(const i of this.flights){this.pickStation(i,t,e);const n=this.members(i);if(n.length===0)continue;const r=n[0];r.pos.set(i.track[0],br*Re,i.track[1]),r.heading=Math.atan2(i.track[2]-i.track[0],-(i.track[3]-i.track[1]));for(let o=1;o<n.length;o++)this.slot(r,o-1,i.style,n[o].pos),n[o].heading=r.heading}}members(t){const e=t.m;e.length=0;for(let i=0;i<t.ids.length;i++){const n=t.ids[i];n!==this.active&&this.jets[n].alive&&e.push(this.jets[n])}return e}pickStation(t,e,i){const n=e/pt+zt/2,r=i/pt+kt/2;let o=0,a=0,l=!1;for(let u=0;u<400&&!l;u++){a=700+this.rand()*(kt-1300);const p=bt.borderX(a),_=Math.max(oi(a)+600,p-2600),g=Math.min(zt-900,p+700);o=_+this.rand()*(g-_),l=Math.hypot(o-n,a-r)>Qu+300;for(const m of this.flights){if(m===t||m.retask===0)continue;const d=m.station[0]/pt+zt/2,M=m.station[1]/pt+kt/2;Math.hypot(o-d,a-M)<1200&&(l=!1)}}l||(a=700+this.rand()*(kt-1300),o=n>zt/2?oi(a)+900:zt-1200);const c=this.rand()*Math.PI,h=Math.cos(c)*Ju,f=Math.sin(c)*Ju;t.track=[Te(o+h),_e(a+f),Te(o-h),_e(a-f)],t.station=[Te(o),_e(a)],t.wp=0,t.retask=IS+Math.floor(this.rand()*1200)}slot(t,e,i,n){let r,o;if(i==="ECHELON")r=(e+1)*60,o=(e+1)*60;else if(i==="LINE")r=0,o=(e%2===0?-1:1)*(Math.floor(e/2)+1)*80;else if(i==="TRAIL")r=(e+1)*90,o=0;else{const h=Math.floor(e/2)+1;r=h*70,o=(e%2===0?-1:1)*h*62}const a=Math.sin(t.heading),l=-Math.cos(t.heading),c=pt*.5;n.set(t.pos.x-a*r*c-l*o*c,t.pos.y,t.pos.z-l*r*c+a*o*c)}step(t,e){for(const o of this.jets){if(o.alive||o.id===this.active||--o.downTimer>0)continue;o.alive=!0;const a=this.flights.find(u=>u.ids.includes(o.id)),l=a?this.members(a).find(u=>u!==o):void 0,c=l?l.heading:0,h=l?l.pos.x:a?a.track[0]:0,f=l?l.pos.z:a?a.track[1]:0;o.pos.set(h-Math.sin(c)*520*pt*.5,br*Re,f+Math.cos(c)*520*pt*.5),o.heading=c}const i=$s*$i,n=NS*$i,r=zS;for(const o of this.flights){const a=this.members(o);if(a.length===0)continue;o.retask--,(o.retask<=0||Math.hypot(o.station[0]-t,o.station[1]-e)<Qu*pt)&&this.pickStation(o,t,e);const l=a[0],c=o.track[o.wp*2],h=o.track[o.wp*2+1];Math.hypot(c-l.pos.x,h-l.pos.z)<90*pt*3&&(o.wp=1-o.wp);let u=Math.atan2(c-l.pos.x,-(h-l.pos.z))-l.heading;u=((u+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;const p=Math.max(-n,Math.min(n,u));l.heading+=p,l.bank+=(Math.max(-1,Math.min(1,p/n))*.9-l.bank)*.05,l.pos.x+=Math.sin(l.heading)*i*Nt,l.pos.z-=Math.cos(l.heading)*i*Nt,l.pos.y+=(br*Re-l.pos.y)*.004;for(let _=1;_<a.length;_++){const g=a[_];this.slot(l,_-1,o.style,r),g.pos.x+=Math.sin(l.heading)*i*Nt,g.pos.z-=Math.cos(l.heading)*i*Nt,g.pos.lerp(r,.02);let m=l.heading-g.heading;m=((m+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,g.heading+=m*.08,g.bank+=(l.bank-g.bank)*.08}}}downActive(){const t=this.jets[this.active];t.alive=!1,t.downTimer=US}nextAlive(t=1){for(let e=1;e<=this.jets.length;e++){const i=(this.active+e*t+this.jets.length*10)%this.jets.length;if(this.jets[i].alive)return i}return this.active}switchTo(t,e,i){const n=this.jets[this.active];n.pos.copy(e),n.heading=i,n.bank=0,this.active=t}sync(t,e){for(const i of this.jets){if(i.id===this.active)continue;const n=i.alive;i.model.group.visible=n,n&&(i.model.group.position.copy(i.pos),tf.set(0,-i.heading,-i.bank),i.model.group.rotation.copy(tf),i.model.setFlame(.7,!1,e/60),i.model.setNight(t,e+i.id*13))}}}const zS=new A,Hn=9.81,tp=1.225,BS=8500,sn=1e4,To=38,kS=.022,HS=.12,oa=5,Fs=.28,GS=.27,VS=.42,WS=-.2,ef=9,ul=-3,XS=45e3,qS=16e4,YS=.5,$S=2e4,KS=.9,ZS=3.6,jS=.22,JS=.5,nf=.49,ni=new A,sf=new A,fl=new A,rf=new A,cr=new A,of=new Ht,ep=s=>tp*Math.exp(-Math.max(0,s)/BS),QS=s=>Math.max(295,340.3-.0039*Math.max(0,s));class ty{constructor(){this.pos=new A,this.vel=new A,this.liftUp=new A(0,1,0),this.quat=new Ai,this.nose=new A(0,0,-1),this.bodyUp=new A(0,1,0),this.alpha=0,this.throttle=nf,this.afterburner=!1,this.gLoad=1,this.stalled=!1,this.mach=0,this.hp=Ir,this.alive=!0,this.crashing=!1,this.crashFall=20}reset(t,e,i){this.pos.set(t,br*Re,e),this.vel.set(Math.sin(i),0,-Math.cos(i)).multiplyScalar($s*$i),this.liftUp.set(0,1,0),this.alpha=.03,this.throttle=nf/Yi,this.afterburner=!1,this.gLoad=1,this.stalled=!1,this.hp=Ir,this.alive=!0,this.crashing=!1,this.crashFall=20,this.updateBody()}stepCrash(t){this.vel.x*=.995,this.vel.z*=.995,this.crashFall=Math.min(200,this.crashFall+1.2),this.vel.y=-(this.crashFall*Re)/t,this.pos.x+=this.vel.x*t,this.pos.z+=this.vel.z*t,this.pos.y-=this.crashFall*Re;const e=Math.max(1,this.vel.length());ni.copy(this.vel).divideScalar(e),this.liftUp.applyAxisAngle(ni,Cu),this.liftUp.addScaledVector(ni,-this.liftUp.dot(ni)).normalize(),this.alpha=0,this.afterburner=!1,this.throttle=0,this.gLoad=0,this.updateBody()}get speed(){return this.vel.length()}get headingDeg(){return(Math.atan2(this.vel.x,-this.vel.z)*180/Math.PI+360)%360}step(t,e){const i=Math.max(1,this.vel.length());ni.copy(this.vel).divideScalar(i);const n=this.pos.y,r=ep(n),o=.5*r*i*i,a=Math.min(1,o/$S);let l=0,c=0,h=0;e&&!this.crashing&&(l=e.pitch,c=e.roll,h=e.yaw,this.throttle=Math.min(1,Math.max(0,this.throttle+e.throttle*JS*t)),this.afterburner=e.afterburner),this.crashing&&(this.throttle=0,this.afterburner=!1);let f=0;if(!this.crashing){const L=(l>=0?1+l*(ef-1):1+l*(1-ul))*sn*Hn/Math.max(1,o*To),v=sn*Hn>oa*Fs*o*To&&l>.2?VS:GS;f=Math.min(v,Math.max(WS,L/oa))}const u=KS*Yi*Math.max(.25,a)*t;this.alpha+=Math.max(-u,Math.min(u,f-this.alpha));const p=ey(this.alpha);let _=p*o*To;const g=ef*sn*Hn;_>g&&(_=g),_<ul*sn*Hn&&(_=ul*sn*Hn),this.stalled=Math.abs(this.alpha)>Fs;const m=QS(n);this.mach=i/m;const d=this.mach>.9?.015*Math.min(1,(this.mach-.9)/.25):0;let M=kS+d+HS*p*p;this.stalled&&(M+=.25*(Math.abs(this.alpha)-Fs)*4);const x=M*o*To,y=Math.pow(r/tp,YS),C=(XS*(this.afterburner?1:this.throttle)+(this.afterburner?qS:0))*y*Yi*$i*$i;this.crashing?this.liftUp.applyAxisAngle(ni,-Cu*60*t):this.liftUp.applyAxisAngle(ni,c*ZS*Yi*Math.max(.3,a)*t),fl.copy(ni).multiplyScalar(Math.cos(this.alpha)).addScaledVector(this.liftUp,Math.sin(this.alpha)),cr.set(0,-Hn,0),cr.addScaledVector(this.liftUp,_/sn),cr.addScaledVector(ni,-x/sn),cr.addScaledVector(fl,C/sn),this.vel.addScaledVector(cr,t),h!==0&&!this.crashing&&this.vel.applyAxisAngle(this.liftUp,-h*jS*Math.max(.3,a)*t),this.pos.addScaledVector(this.vel,t),this.gLoad=_/(sn*Hn);const T=Math.max(1,this.vel.length());ni.copy(this.vel).divideScalar(T),this.liftUp.addScaledVector(ni,-this.liftUp.dot(ni)),this.liftUp.lengthSq()<1e-8&&this.liftUp.set(0,1,0),this.liftUp.normalize(),this.updateBody()}updateBody(){const t=Math.max(1,this.vel.length());ni.copy(this.vel).divideScalar(t);const e=Math.cos(this.alpha),i=Math.sin(this.alpha);this.nose.copy(ni).multiplyScalar(e).addScaledVector(this.liftUp,i),this.bodyUp.copy(this.liftUp).multiplyScalar(e).addScaledVector(ni,-i),sf.crossVectors(this.nose,this.bodyUp).normalize(),rf.copy(this.bodyUp),of.makeBasis(sf,rf,fl.copy(this.nose).negate()),this.quat.setFromRotationMatrix(of)}}function ey(s){const t=Math.sign(s),e=Math.abs(s);if(e<=Fs)return oa*s;const i=oa*Fs;return t*Math.max(.7,i-(e-Fs)*3.5)}const We=420,af=6*pt*1.5,iy=1800,lf=2.5,ny=14;class sy{constructor(){this.px=new Float32Array(We),this.py=new Float32Array(We),this.pz=new Float32Array(We),this.born=new Float64Array(We),this.head=0,this.count=0,this.geo=new Ue,this.pos=new xe(new Float32Array(We*2*3),3),this.col=new xe(new Float32Array(We*2*4),4),this.geo.setAttribute("position",this.pos),this.geo.setAttribute("color",this.col);const t=new Uint16Array((We-1)*6);for(let e=0;e<We-1;e++){const i=e*2;t.set([i,i+1,i+2,i+1,i+3,i+2],e*6)}this.geo.setIndex(new xe(t,1)),this.mat=new $e({vertexColors:!0,transparent:!0,depthWrite:!1,side:Ye}),this.mesh=new Tt(this.geo,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1}clear(){this.count=0,this.head=0,this.geo.setDrawRange(0,0)}record(t,e){if(this.count>0){const i=(this.head-1+We)%We,n=t.x-this.px[i],r=t.y-this.py[i],o=t.z-this.pz[i];if(n*n+r*r+o*o<af*af)return}this.px[this.head]=t.x,this.py[this.head]=t.y,this.pz[this.head]=t.z,this.born[this.head]=e,this.head=(this.head+1)%We,this.count=Math.min(We,this.count+1)}update(t,e,i,n){const r=this.count;if(r<1){this.geo.setDrawRange(0,0);return}const o=this.pos.array,a=this.col.array,l=1-.8*n;let c=0,h=e.x,f=e.y,u=e.z,p=0;for(let _=-1;_<r;_++){let g,m,d,M;if(_<0)g=e.x,m=e.y,d=e.z,M=0;else{const Q=(this.head-1-_+We*2)%We;g=this.px[Q],m=this.py[Q],d=this.pz[Q],M=i-this.born[Q]}const x=Math.max(0,1-M/iy);p+=Math.hypot(g-h,m-f,d-u);let y=h-g,C=f-m,T=u-d;if(_<=0){const Q=(this.head-1+We)%We;y=e.x-this.px[Q],C=e.y-this.py[Q],T=e.z-this.pz[Q]}const b=t.x-g,L=t.y-m,O=t.z-d;let v=C*O-T*L,S=T*b-y*O,P=y*L-C*b;const U=Math.hypot(v,S,P)||1,G=(lf+(ny-lf)*(1-x))/2/U;v*=G,S*=G,P*=G,o[c*6]=g-v,o[c*6+1]=m-S,o[c*6+2]=d-P,o[c*6+3]=g+v,o[c*6+4]=m+S,o[c*6+5]=d+P;const X=m/Re,B=.25+.75*Math.min(1,Math.max(0,(X-24e3)/6e3)),$=Math.min(1,Math.max(0,(p-60)/340)),V=(.14+.86*x)*.28*B*$;for(let Q=0;Q<2;Q++){const nt=(c*2+Q)*4;a[nt]=l,a[nt+1]=l,a[nt+2]=l*1.02,a[nt+3]=V}if(h=g,f=m,u=d,c++,c>=We)break}this.pos.needsUpdate=!0,this.col.needsUpdate=!0,this.geo.setDrawRange(0,Math.max(0,(c-1)*6))}}class is{constructor(t,e){this.next=0,this.items=new Array(t);for(let i=0;i<t;i++)this.items[i]=e(i)}acquire(){const t=this.items.length;for(let e=0;e<t;e++){const i=(this.next+e)%t,n=this.items[i];if(!n.active)return this.next=(i+1)%t,n.active=!0,n}return null}acquireOrRecycle(){const t=this.acquire();if(t)return t;const e=this.items[this.next];return this.next=(this.next+1)%this.items.length,e.active=!0,e}countActive(){let t=0;for(let e=0;e<this.items.length;e++)this.items[e].active&&t++;return t}releaseAll(){for(let t=0;t<this.items.length;t++)this.items[t].active=!1}}class ry{constructor(t,e){this.mesh=t,this.mat=e,this.active=!1,this.age=0,this.life=1,this.radius=1}}class oy{constructor(t){const e=new Ie(1,16,10);this.pool=new is(24,()=>{const i=new $e({color:16752704,transparent:!0,depthWrite:!1,blending:jn}),n=new Tt(e,i);return n.visible=!1,t.add(n),new ry(n,i)})}spawn(t,e,i,n,r=1.4){const o=this.pool.acquireOrRecycle();o.age=0,o.life=r,o.radius=n,o.mesh.position.set(t,e,i),o.mesh.visible=!0}update(t){const e=this.pool.items;for(let i=0;i<e.length;i++){const n=e[i];if(!n.active)continue;if(n.age+=t,n.age>=n.life){n.active=!1,n.mesh.visible=!1;continue}const r=n.age/n.life,o=n.radius*(.3+.7*Math.sqrt(r));n.mesh.scale.set(o,o,o),n.mat.opacity=1-r,n.mat.color.setRGB(1,.75-.45*r,.35-.3*r).multiplyScalar(3-2*r)}}clear(){for(const t of this.pool.items)t.active=!1,t.mesh.visible=!1}}const ay=16,ip={guided:[236/255,232/255,224/255],unguided:[206/255,196/255,176/255],AGM:[255/255,214/255,150/255],AAM:[170/255,230/255,255/255]},ly={points:520,spacing:45,life:Vd+900,width:3,widthOld:16,color:ip.guided,alpha:.8,minAngular:.0032};class cy{constructor(t){this.slots=[];for(let e=0;e<ay;e++){const i=new zd(ly);t.add(i.mesh),this.slots.push({ribbon:i,owner:null,lastAge:0})}}clear(){for(const t of this.slots)t.owner=null,t.ribbon.clear()}track(t,e,i){let n=null;for(let r=0;r<this.slots.length;r++){const o=this.slots[r];if(o.owner===t){t.age<o.lastAge?o.owner=null:n=o;break}}if(!n){let r=null;for(let o=0;o<this.slots.length;o++){const a=this.slots[o];if(!a.owner&&((!r||a.ribbon.lastFrame<r.ribbon.lastFrame)&&(r=a),a.ribbon.faded(i))){r=a;break}}if(!r)return;n=r,n.owner=t,n.ribbon.clear(),n.ribbon.setColor(ip[e])}n.lastAge=t.age,n.ribbon.record(t.pos,i)}release(){for(const t of this.slots)t.owner&&!t.owner.active&&(t.owner=null)}update(t,e,i){const n=1-.75*i;for(const r of this.slots)r.ribbon.update(t,e,n)}}const Ar={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class ss{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const hy=new Zc(-1,1,1,-1,0,1);class uy extends Ue{constructor(){super(),this.setAttribute("position",new fe([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new fe([0,2,0,0,2,0],2))}}const fy=new uy;class pa{constructor(t){this._mesh=new Tt(fy,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,hy)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class np extends ss{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof ge?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=wi.clone(t.uniforms),this.material=new ge({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new pa(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class cf extends ss{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){const n=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(n.REPLACE,n.REPLACE,n.REPLACE),r.buffers.stencil.setFunc(n.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(n.EQUAL,1,4294967295),r.buffers.stencil.setOp(n.KEEP,n.KEEP,n.KEEP),r.buffers.stencil.setLocked(!0)}}class dy extends ss{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class py{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const i=t.getSize(new lt);this._width=i.width,this._height=i.height,e=new vi(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Bi}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new np(Ar),this.copyPass.material.blending=Xe,this.clock=new VM}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let i=!1;for(let n=0,r=this.passes.length;n<r;n++){const o=this.passes[n];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(n),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),o.needsSwap){if(i){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}cf!==void 0&&(o instanceof cf?i=!0:o instanceof dy&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new lt);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const i=this._width*this._pixelRatio,n=this._height*this._pixelRatio;this.renderTarget1.setSize(i,n),this.renderTarget2.setSize(i,n);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,n)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}const bo={defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new lt},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Ht},cameraProjectionMatrixInverse:{value:new Ht},cameraWorldMatrix:{value:new Ht},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new A(-1,-1,-1)},sceneBoxMax:{value:new A(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;		
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif
		
		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {  
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {   
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}
		
		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif
			
			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {
				
				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w); 
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));
				
				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));
				
				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);	

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}		

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);		
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},Ao={defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},dl={uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function my(s=5){const t=Math.floor(s)%2===0?Math.floor(s)+1:Math.floor(s),e=gy(t),i=e.length,n=new Uint8Array(i*4);for(let o=0;o<i;++o){const a=e[o],l=2*Math.PI*a/i,c=new A(Math.cos(l),Math.sin(l),0).normalize();n[o*4]=(c.x*.5+.5)*255,n[o*4+1]=(c.y*.5+.5)*255,n[o*4+2]=127,n[o*4+3]=255}const r=new th(n,t,t);return r.wrapS=hn,r.wrapT=hn,r.needsUpdate=!0,r}function gy(s){const t=Math.floor(s)%2===0?Math.floor(s)+1:Math.floor(s),e=t*t,i=Array(e).fill(0);let n=Math.floor(t/2),r=t-1;for(let o=1;o<=e;){if(n===-1&&r===t?(r=t-2,n=0):(r===t&&(r=0),n<0&&(n=t-1)),i[n*t+r]!==0){r-=2,n++;continue}else i[n*t+r]=o++;r++,n--}return i}const Ro={defines:{SAMPLES:16,SAMPLE_VECTORS:sp(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new lt},cameraProjectionMatrixInverse:{value:new Ht},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;
		
		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}
		
		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1    
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1    
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);
			
			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;
		
			denoised += w * neighborColor;
			totalWeight += w;
		}
		
		void main() {
			float depth = getDepth(vUv.xy);	
			vec3 viewNormal = getViewNormal(vUv);	
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);
		
			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}
		
			if (totalWeight > 0.) { 
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function sp(s,t,e){const i=_y(s,t,e);let n="vec3[SAMPLES](";for(let r=0;r<s;r++){const o=i[r];n+=`vec3(${o.x}, ${o.y}, ${o.z})${r<s-1?",":")"}`}return n}function _y(s,t,e){const i=[];for(let n=0;n<s;n++){const r=2*Math.PI*t*n/s,o=Math.pow(n/(s-1),e);i.push(new A(Math.cos(r),Math.sin(r),o))}return i}class vy{constructor(t=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let e=0;e<256;e++)this.p[e]=Math.floor(t.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(t,e,i){return t[0]*e+t[1]*i}dot3(t,e,i,n){return t[0]*e+t[1]*i+t[2]*n}dot4(t,e,i,n,r){return t[0]*e+t[1]*i+t[2]*n+t[3]*r}noise(t,e){let i,n,r;const o=.5*(Math.sqrt(3)-1),a=(t+e)*o,l=Math.floor(t+a),c=Math.floor(e+a),h=(3-Math.sqrt(3))/6,f=(l+c)*h,u=l-f,p=c-f,_=t-u,g=e-p;let m,d;_>g?(m=1,d=0):(m=0,d=1);const M=_-m+h,x=g-d+h,y=_-1+2*h,C=g-1+2*h,T=l&255,b=c&255,L=this.perm[T+this.perm[b]]%12,O=this.perm[T+m+this.perm[b+d]]%12,v=this.perm[T+1+this.perm[b+1]]%12;let S=.5-_*_-g*g;S<0?i=0:(S*=S,i=S*S*this.dot(this.grad3[L],_,g));let P=.5-M*M-x*x;P<0?n=0:(P*=P,n=P*P*this.dot(this.grad3[O],M,x));let U=.5-y*y-C*C;return U<0?r=0:(U*=U,r=U*U*this.dot(this.grad3[v],y,C)),70*(i+n+r)}noise3d(t,e,i){let n,r,o,a;const c=(t+e+i)*.3333333333333333,h=Math.floor(t+c),f=Math.floor(e+c),u=Math.floor(i+c),p=1/6,_=(h+f+u)*p,g=h-_,m=f-_,d=u-_,M=t-g,x=e-m,y=i-d;let C,T,b,L,O,v;M>=x?x>=y?(C=1,T=0,b=0,L=1,O=1,v=0):M>=y?(C=1,T=0,b=0,L=1,O=0,v=1):(C=0,T=0,b=1,L=1,O=0,v=1):x<y?(C=0,T=0,b=1,L=0,O=1,v=1):M<y?(C=0,T=1,b=0,L=0,O=1,v=1):(C=0,T=1,b=0,L=1,O=1,v=0);const S=M-C+p,P=x-T+p,U=y-b+p,G=M-L+2*p,X=x-O+2*p,B=y-v+2*p,$=M-1+3*p,V=x-1+3*p,Q=y-1+3*p,nt=h&255,mt=f&255,Gt=u&255,Zt=this.perm[nt+this.perm[mt+this.perm[Gt]]]%12,Y=this.perm[nt+C+this.perm[mt+T+this.perm[Gt+b]]]%12,tt=this.perm[nt+L+this.perm[mt+O+this.perm[Gt+v]]]%12,gt=this.perm[nt+1+this.perm[mt+1+this.perm[Gt+1]]]%12;let ot=.6-M*M-x*x-y*y;ot<0?n=0:(ot*=ot,n=ot*ot*this.dot3(this.grad3[Zt],M,x,y));let At=.6-S*S-P*P-U*U;At<0?r=0:(At*=At,r=At*At*this.dot3(this.grad3[Y],S,P,U));let Et=.6-G*G-X*X-B*B;Et<0?o=0:(Et*=Et,o=Et*Et*this.dot3(this.grad3[tt],G,X,B));let Ot=.6-$*$-V*V-Q*Q;return Ot<0?a=0:(Ot*=Ot,a=Ot*Ot*this.dot3(this.grad3[gt],$,V,Q)),32*(n+r+o+a)}noise4d(t,e,i,n){const r=this.grad4,o=this.simplex,a=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20;let h,f,u,p,_;const g=(t+e+i+n)*l,m=Math.floor(t+g),d=Math.floor(e+g),M=Math.floor(i+g),x=Math.floor(n+g),y=(m+d+M+x)*c,C=m-y,T=d-y,b=M-y,L=x-y,O=t-C,v=e-T,S=i-b,P=n-L,U=O>v?32:0,G=O>S?16:0,X=v>S?8:0,B=O>P?4:0,$=v>P?2:0,V=S>P?1:0,Q=U+G+X+B+$+V,nt=o[Q][0]>=3?1:0,mt=o[Q][1]>=3?1:0,Gt=o[Q][2]>=3?1:0,Zt=o[Q][3]>=3?1:0,Y=o[Q][0]>=2?1:0,tt=o[Q][1]>=2?1:0,gt=o[Q][2]>=2?1:0,ot=o[Q][3]>=2?1:0,At=o[Q][0]>=1?1:0,Et=o[Q][1]>=1?1:0,Ot=o[Q][2]>=1?1:0,Qt=o[Q][3]>=1?1:0,qt=O-nt+c,D=v-mt+c,Ge=S-Gt+c,Wt=P-Zt+c,Yt=O-Y+2*c,Ct=v-tt+2*c,oe=S-gt+2*c,Pt=P-ot+2*c,R=O-At+3*c,E=v-Et+3*c,z=S-Ot+3*c,Z=P-Qt+3*c,J=O-1+4*c,K=v-1+4*c,Mt=S-1+4*c,rt=P-1+4*c,ct=m&255,Xt=d&255,et=M&255,ht=x&255,Lt=a[ct+a[Xt+a[et+a[ht]]]]%32,Dt=a[ct+nt+a[Xt+mt+a[et+Gt+a[ht+Zt]]]]%32,_t=a[ct+Y+a[Xt+tt+a[et+gt+a[ht+ot]]]]%32,$t=a[ct+At+a[Xt+Et+a[et+Ot+a[ht+Qt]]]]%32,Ft=a[ct+1+a[Xt+1+a[et+1+a[ht+1]]]]%32;let Jt=.6-O*O-v*v-S*S-P*P;Jt<0?h=0:(Jt*=Jt,h=Jt*Jt*this.dot4(r[Lt],O,v,S,P));let I=.6-qt*qt-D*D-Ge*Ge-Wt*Wt;I<0?f=0:(I*=I,f=I*I*this.dot4(r[Dt],qt,D,Ge,Wt));let at=.6-Yt*Yt-Ct*Ct-oe*oe-Pt*Pt;at<0?u=0:(at*=at,u=at*at*this.dot4(r[_t],Yt,Ct,oe,Pt));let W=.6-R*R-E*E-z*z-Z*Z;W<0?p=0:(W*=W,p=W*W*this.dot4(r[$t],R,E,z,Z));let j=.6-J*J-K*K-Mt*Mt-rt*rt;return j<0?_=0:(j*=j,_=j*j*this.dot4(r[Ft],J,K,Mt,rt)),27*(h+f+u+p+_)}}class Ui extends ss{constructor(t,e,i,n,r,o,a){super(),this.width=i!==void 0?i:512,this.height=n!==void 0?n:512,this.clear=!0,this.camera=e,this.scene=t,this.output=0,this._renderGBuffer=!0,this._visibilityCache=new Map,this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=my(),this.pdNoiseTexture=this.generateNoise(),this.gtaoRenderTarget=new vi(this.width,this.height,{type:Bi}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new ge({defines:Object.assign({},bo.defines),uniforms:wi.clone(bo.uniforms),vertexShader:bo.vertexShader,fragmentShader:bo.fragmentShader,blending:Xe,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new zM,this.normalMaterial.blending=Xe,this.pdMaterial=new ge({defines:Object.assign({},Ro.defines),uniforms:wi.clone(Ro.uniforms),vertexShader:Ro.vertexShader,fragmentShader:Ro.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new ge({defines:Object.assign({},Ao.defines),uniforms:wi.clone(Ao.uniforms),vertexShader:Ao.vertexShader,fragmentShader:Ao.fragmentShader,blending:Xe}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new ge({uniforms:wi.clone(Ar.uniforms),vertexShader:Ar.vertexShader,fragmentShader:Ar.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Ul,blendDst:gr,blendEquation:Ni,blendSrcAlpha:Il,blendDstAlpha:gr,blendEquationAlpha:Ni}),this.blendMaterial=new ge({uniforms:wi.clone(dl.uniforms),vertexShader:dl.vertexShader,fragmentShader:dl.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:ed,blendSrc:Ul,blendDst:gr,blendEquation:Ni,blendSrcAlpha:Il,blendDstAlpha:gr,blendEquationAlpha:Ni}),this.fsQuad=new pa(null),this.originalClearColor=new St,this.setGBuffer(r?r.depthTexture:void 0,r?r.normalTexture:void 0),o!==void 0&&this.updateGtaoMaterial(o),a!==void 0&&this.updatePdMaterial(a)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(t,e){t!==void 0?(this.depthTexture=t,this.normalTexture=e,this._renderGBuffer=!1):(this.depthTexture=new Jc,this.depthTexture.format=ts,this.depthTexture.type=Qn,this.normalRenderTarget=new vi(this.width,this.height,{minFilter:ti,magFilter:ti,type:Bi,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);const i=this.normalTexture?1:0,n=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=i,this.gtaoMaterial.defines.DEPTH_SWIZZLING=n,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=i,this.pdMaterial.defines.DEPTH_SWIZZLING=n,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(t){t?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(t.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(t.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(t){t.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=t.radius),t.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=t.distanceExponent),t.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=t.thickness),t.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=t.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),t.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=t.scale),t.samples!==void 0&&t.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=t.samples,this.gtaoMaterial.needsUpdate=!0),t.screenSpaceRadius!==void 0&&(t.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=t.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(t){let e=!1;t.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=t.lumaPhi),t.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=t.depthPhi),t.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=t.normalPhi),t.radius!==void 0&&t.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=t.radius),t.radiusExponent!==void 0&&t.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=t.radiusExponent,e=!0),t.rings!==void 0&&t.rings!==this.pdRings&&(this.pdRings=t.rings,e=!0),t.samples!==void 0&&t.samples!==this.pdSamples&&(this.pdSamples=t.samples,e=!0),e&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=sp(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(t,e,i){switch(this._renderGBuffer&&(this.overrideVisibility(),this.renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this.renderPass(t,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.renderPass(t,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case Ui.OUTPUT.Off:break;case Ui.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=Xe,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case Ui.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=Xe,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case Ui.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=Xe,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case Ui.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:e);break;case Ui.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=Xe,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case Ui.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=Xe,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.renderPass(t,this.blendMaterial,this.renderToScreen?null:e);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}renderPass(t,e,i,n,r){t.getClearColor(this.originalClearColor);const o=t.getClearAlpha(),a=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,n!=null&&(t.setClearColor(n),t.setClearAlpha(r||0),t.clear()),this.fsQuad.material=e,this.fsQuad.render(t),t.autoClear=a,t.setClearColor(this.originalClearColor),t.setClearAlpha(o)}renderOverride(t,e,i,n,r){t.getClearColor(this.originalClearColor);const o=t.getClearAlpha(),a=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,n=e.clearColor||n,r=e.clearAlpha||r,n!=null&&(t.setClearColor(n),t.setClearAlpha(r||0),t.clear()),this.scene.overrideMaterial=e,t.render(this.scene,this.camera),this.scene.overrideMaterial=null,t.autoClear=a,t.setClearColor(this.originalClearColor),t.setClearAlpha(o)}setSize(t,e){this.width=t,this.height=e,this.gtaoRenderTarget.setSize(t,e),this.normalRenderTarget.setSize(t,e),this.pdRenderTarget.setSize(t,e),this.gtaoMaterial.uniforms.resolution.value.set(t,e),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(t,e),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}overrideVisibility(){const t=this.scene,e=this._visibilityCache;t.traverse(function(i){e.set(i,i.visible),(i.isPoints||i.isLine)&&(i.visible=!1)})}restoreVisibility(){const t=this.scene,e=this._visibilityCache;t.traverse(function(i){const n=e.get(i);i.visible=n}),e.clear()}generateNoise(t=64){const e=new vy,i=t*t*4,n=new Uint8Array(i);for(let o=0;o<t;o++)for(let a=0;a<t;a++){const l=o,c=a;n[(o*t+a)*4]=(e.noise(l,c)*.5+.5)*255,n[(o*t+a)*4+1]=(e.noise(l+t,c)*.5+.5)*255,n[(o*t+a)*4+2]=(e.noise(l,c+t)*.5+.5)*255,n[(o*t+a)*4+3]=(e.noise(l+t,c+t)*.5+.5)*255}const r=new th(n,t,t,Ti,Ki);return r.wrapS=hn,r.wrapT=hn,r.needsUpdate=!0,r}}Ui.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};const My={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class xy extends ss{constructor(){super();const t=My;this.uniforms=wi.clone(t.uniforms),this.material=new FM({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new pa(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},ie.getTransfer(this._outputColorSpace)===ue&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===id?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===nd?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===sd?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===zc?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===rd?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===od&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Sy extends ss{constructor(t,e,i=null,n=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=i,this.clearColor=n,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new St}render(t,e,i){const n=t.autoClear;t.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),t.autoClear=n}}const yy={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new St(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Gs extends ss{constructor(t,e,i,n){super(),this.strength=e!==void 0?e:1,this.radius=i,this.threshold=n,this.resolution=t!==void 0?new lt(t.x,t.y):new lt(256,256),this.clearColor=new St(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new vi(r,o,{type:Bi}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let f=0;f<this.nMips;f++){const u=new vi(r,o,{type:Bi});u.texture.name="UnrealBloomPass.h"+f,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);const p=new vi(r,o,{type:Bi});p.texture.name="UnrealBloomPass.v"+f,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),r=Math.round(r/2),o=Math.round(o/2)}const a=yy;this.highPassUniforms=wi.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=n,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new ge({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let f=0;f<this.nMips;f++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[f])),this.separableBlurMaterials[f].uniforms.invSize.value=new lt(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=Ar;this.copyUniforms=wi.clone(h.uniforms),this.blendMaterial=new ge({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:jn,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new St,this.oldClearAlpha=1,this.basic=new $e,this.fsQuad=new pa(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let i=Math.round(t/2),n=Math.round(e/2);this.renderTargetBright.setSize(i,n);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,n),this.renderTargetsVertical[r].setSize(i,n),this.separableBlurMaterials[r].uniforms.invSize.value=new lt(1/i,1/n),i=Math.round(i/2),n=Math.round(n/2)}render(t,e,i,n,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();const o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=i.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=Gs.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Gs.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(i),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=o}getSeperableBlurMaterial(t){const e=[];for(let i=0;i<t;i++)e.push(.39894*Math.exp(-.5*i*i/(t*t))/t);return new ge({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new lt(.5,.5)},direction:{value:new lt(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new ge({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Gs.BlurDirectionX=new lt(1,0);Gs.BlurDirectionY=new lt(0,1);const hf=.55,Ey=.9,wy={uniforms:{tDiffuse:{value:null},uBlur:{value:0},uLines:{value:0},uTime:{value:0},uAspect:{value:1},uHeat:{value:0},uHeatPos:{value:new lt(.5,.5)},uHeatDir:{value:new lt(0,-.1)},uHeatWidth:{value:.02}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uBlur;
    uniform float uLines;
    uniform float uTime;
    uniform float uAspect;
    uniform float uHeat;
    uniform vec2 uHeatPos;
    uniform vec2 uHeatDir;
    uniform float uHeatWidth;
    varying vec2 vUv;
    float hash1(float n) { return fract(sin(n * 91.345) * 47453.5453); }
    void main() {
      vec2 uv = vUv;
      // heat shimmer: a widening capsule from the nozzle along the plume on screen
      if (uHeat > 0.001) {
        vec2 p = (uv - uHeatPos) * vec2(uAspect, 1.0);
        vec2 d = uHeatDir * vec2(uAspect, 1.0);
        float L = max(length(d), 1e-4);
        vec2 dn = d / L;
        float t = clamp(dot(p, dn) / L, 0.0, 1.0);
        float dist = length(p - dn * t * L);
        float w = uHeatWidth * (0.7 + 1.6 * t);
        float m = smoothstep(w, 0.0, dist) * smoothstep(0.0, 0.06, t) * (1.0 - t) * uHeat;
        vec2 wob = vec2(sin(uv.y * 210.0 + uTime * 38.0) + sin(uv.y * 97.0 - uTime * 23.0),
                        cos(uv.x * 190.0 - uTime * 41.0) + cos(uv.x * 83.0 + uTime * 19.0));
        uv += wob * 0.0012 * m;
      }
      vec4 col = texture2D(tDiffuse, uv);
      // motion blur: samples toward the centre, none in the middle (the jet stays sharp), more at the edges
      vec2 toC = uv - 0.5;
      float r = length(toC * vec2(uAspect, 1.0));
      float k = uBlur * smoothstep(0.18, 0.75, r);
      if (k > 0.002) {
        vec4 acc = col;
        for (int i = 1; i < 7; i++) acc += texture2D(tDiffuse, uv - toC * k * 0.022 * float(i));
        col = acc / 7.0;
      }
      // speed lines: thin streaks rushing outward near the edges
      if (uLines > 0.002) {
        float ang = atan(toC.y, toC.x) / 6.28318 + 0.5;
        float cell = floor(ang * 140.0);
        float h = hash1(cell);
        float across = abs(fract(ang * 140.0) - 0.5) * 2.0;
        float streak = smoothstep(0.55, 0.0, fract(r * 2.2 - uTime * (1.6 + h * 1.4) + h * 7.0) - 0.0) ;
        float line = step(0.86, h) * smoothstep(0.35, 0.0, across) * streak * smoothstep(0.32, 0.8, r);
        col.rgb += vec3(0.9, 0.95, 1.0) * line * 0.22 * uLines;
      }
      gl_FragColor = col;
    }`};class Ty{constructor(t,e,i,n=!1){this.ao=null;const r=t.getSize(new lt);if(this.composer=new py(t),this.composer.addPass(new Sy(e,i)),!n){this.ao=new Ui(e,i,r.x,r.y),this.ao.output=Ui.OUTPUT.Default,this.ao.blendIntensity=.8,this.ao.updateGtaoMaterial({radius:2.5,distanceExponent:1.5,thickness:2,scale:1,samples:12,distanceFallOff:1,screenSpaceRadius:!1}),this.ao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:16});const o=this.ao;o.overrideVisibility=function(){const a=this._visibilityCache;this.scene.traverse(l=>{a.set(l,l.visible);const c=l.material,h=!!c&&!Array.isArray(c)&&(c.transparent||c.depthWrite===!1);(l.isPoints||l.isLine||h)&&(l.visible=!1)})},this.composer.addPass(this.ao)}this.bloom=new Gs(new lt(r.x/2,r.y/2),hf,.45,.92),this.composer.addPass(this.bloom),this.speed=new np(wy),this.speed.uniforms.uAspect.value=r.x/r.y,this.composer.addPass(this.speed),this.composer.addPass(new xy)}setPixelRatio(t){this.composer.setPixelRatio(t)}setBloom(t){this.bloom.enabled=t}setAO(t){this.ao&&(this.ao.enabled=t)}setNight(t){this.bloom.strength=t?Ey:hf}setMotion(t){const e=this.speed.uniforms;e.uBlur.value=t.blur,e.uLines.value=t.lines,e.uTime.value=t.time,e.uHeat.value=t.heat,e.uHeatPos.value.copy(t.heatPos),e.uHeatDir.value.copy(t.heatDir),e.uHeatWidth.value=t.heatWidth,this.speed.enabled=t.blur>.002||t.lines>.002||t.heat>.001}resize(t,e){this.composer.setSize(t,e),this.bloom.resolution.set(t/2,e/2),this.speed.uniforms.uAspect.value=t/e}render(){this.composer.render()}}const uf=[15088700,16092200,16112700,4636240,3968230,5261e3,10506450],ff=60,by=15,Ay=13,df=6,Ry=45,pf=[.3*.5*pt*60,-.1*.5*pt*60],bs=5,Cy=40;class Py{constructor(){this.group=new fi,this.pos=new A,this.vel=new A,this.canopy=new fi,this.age=0,this.freefall=ff,this.landed=!1,this.landedFor=0,this.active=!1,this.sink=df;const t=Math.PI*2/uf.length;uf.forEach((l,c)=>{const h=new Tt(new Ie(bs,6,8,c*t,t,0,Math.PI*.42),new Me({color:l,emissive:l,emissiveIntensity:.25,side:Ye}));h.scale.set(1,.65,1),this.canopy.add(h)});const e=new Tt(new ai(bs*.97,bs*.97,.15,28,1,!0),new Me({color:16448250,side:Ye}));e.position.y=bs*.65*Math.cos(Math.PI*.42),this.canopy.add(e),this.canopy.position.y=7,this.group.add(this.canopy);const i=[],n=7+e.position.y;for(let l=0;l<14;l++){const c=l/14*Math.PI*2;i.push(Math.cos(c)*bs*.95,n,Math.sin(c)*bs*.95,0,1.2,0)}const r=new Ue;r.setAttribute("position",new xe(new Float32Array(i),3)),this.cords=new NM(r,new Nd({color:14540253})),this.group.add(this.cords);const o=new Tt(new ai(.28,.24,1.3,8),new Me({color:5925434}));o.position.y=.6;const a=new Tt(new Ie(.22,10,8),new Me({color:15790320}));a.position.y=1.45,this.group.add(o,a),this.seat=new Tt(new ai(.45,.45,1.6,6),new Me({color:3947580})),this.seat.position.y=.6,this.group.add(this.seat),this.group.visible=!1}get chuteOpen(){return this.age>this.freefall}eject(t,e){this.pos.copy(t),this.vel.set(e.x*.6,35,e.z*.6),this.freefall=t.y/Re>12e3?ff:by,this.age=0,this.landed=!1,this.landedFor=0,this.active=!0,this.group.visible=!0}step(t){if(this.active){if(this.age++,this.landed){this.landedFor++;return}this.chuteOpen?(this.age===this.freefall+1&&(this.sink=Math.max(df,(this.pos.y-t)/Ay)),this.vel.x+=(pf[0]-this.vel.x)*.03,this.vel.z+=(pf[1]-this.vel.z)*.03,this.pos.y-=this.sink*Nt):(this.vel.x*=.97,this.vel.z*=.97,this.vel.y*=.9,this.pos.y+=this.vel.y*Nt-Ry*Nt*Math.min(1,this.age/30)),this.pos.x+=this.vel.x*Nt,this.pos.z+=this.vel.z*Nt,this.pos.y<=t&&(this.pos.y=t,this.landed=!0)}}sync(){if(!this.active)return;this.group.position.copy(this.pos);const t=this.chuteOpen?Math.min(1,(this.age-this.freefall)/Cy):0,e=this.landed?1:t*(1.15-.15*Math.cos(t*Math.PI));this.canopy.scale.set(e||.001,(this.landed?.25:e)||.001,e||.001),this.canopy.visible=t>0,this.cords.visible=t>.6&&!this.landed,this.seat.visible=!this.chuteOpen,this.group.rotation.z=this.landed?0:Math.sin(this.age*.035)*.12*t,this.group.rotation.x=this.landed?0:Math.sin(this.age*.027+1)*.08*t,this.landed?this.canopy.position.set(4,.6,0):this.canopy.position.set(0,7,0)}hide(){this.active=!1,this.group.visible=!1}}const Co=1400;class Ly{constructor(t){this.index=t,this.active=!1,this.pos=new A,this.age=0,this.life=1,this.size0=1,this.size1=1}}const mf=new Ht,Dy=new Ai,Iy=new A,pl=new Ht().makeScale(0,0,0);class Uy{constructor(){this.pool=new is(Co,e=>new Ly(e)),this.tmpColor=new St;const t=new Me({color:16777215,transparent:!0,opacity:.8,depthWrite:!1});this.mesh=new zi(new sh(1,1),t,Co),this.mesh.instanceMatrix.setUsage(Yc),this.mesh.frustumCulled=!1;for(let e=0;e<Co;e++)this.mesh.setMatrixAt(e,pl),this.mesh.setColorAt(e,this.tmpColor.setRGB(1,1,1))}emit(t,e,i,n,r,o,a){this.emitRGB(t,e,i,n,r,o,a,a,a*.98)}emitRGB(t,e,i,n,r,o,a,l,c){const h=this.pool.acquireOrRecycle();h.pos.set(t,e,i),h.age=0,h.life=n,h.size0=r,h.size1=o;const f=h.index;this.mesh.setColorAt(f,this.tmpColor.setRGB(a,l,c)),this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}update(t){const e=this.pool.items;for(let i=0;i<e.length;i++){const n=e[i];if(!n.active)continue;if(n.age+=t,n.age>=n.life){n.active=!1,this.mesh.setMatrixAt(i,pl);continue}const r=n.age/n.life,o=(n.size0+(n.size1-n.size0)*Math.sqrt(r))*(r>.8?(1-r)/.2:1);n.pos.y+=1.5*t,mf.compose(n.pos,Dy,Iy.set(o,o,o)),this.mesh.setMatrixAt(i,mf)}this.mesh.instanceMatrix.needsUpdate=!0}clear(){this.pool.releaseAll();for(let t=0;t<Co;t++)this.mesh.setMatrixAt(t,pl);this.mesh.instanceMatrix.needsUpdate=!0}}const Ny=1400*pt,Fy=60;class Oy{constructor(){this.on=!1,this.sel=null,this.cd=0,this.cands=[]}candidates(t,e){const i=this.cands;i.length=0;for(const n of e.launchers)n.hp>0&&Math.hypot(n.x-t.x,n.z-t.z)<Ny&&i.push(n);return i.sort((n,r)=>Math.atan2(n.z-t.z,n.x-t.x)-Math.atan2(r.z-t.z,r.x-t.x)),i}step(t,e){if(this.cd>0&&this.cd--,!this.on||!t)return;const i=this.candidates(t,e);if(this.sel&&i.includes(this.sel))return;let n=null,r=1/0;for(const o of i){const a=Math.hypot(o.x-t.x,o.z-t.z);a<r&&(r=a,n=o)}this.sel=n}pick(t,e,i){const n=this.candidates(e,i);if(n.length===0)return;const r=this.sel?n.indexOf(this.sel):-1;this.sel=r>=0?n[(r+t+n.length)%n.length]:n[0]}fire(t,e,i){const n=this.sel;return!n||n.hp<=0?"P2: NO LAUNCHER PICKED":n.missiles<=0?`P2: ${n.name} IS EMPTY`:this.cd>0?"P2: RELOADING":!e||Math.hypot(e.pos.x-n.x,e.pos.z-n.z)>n.range?`P2: JET OUT OF ${n.name} RANGE`:i.launch(n,e,t)?(this.cd=Fy,`P2: ${n.name} FIRES ${t?"GUIDED":"UNGUIDED"}`):"P2: SKY FULL"}status(t){const e=this.sel;if(!e)return"";const n=Math.hypot(t.x-e.x,t.z-e.z)<=e.range?this.cd===0&&e.missiles>0?"READY":"RELOADING":"OUT OF RANGE";return`P2  ${e.name}  ${e.missiles}  ${n}`}}const Po=yc*4,gf=9.81;class _f{constructor(t){this.index=t,this.active=!1,this.pos=new A,this.vel=new A,this.age=0,this.salvo=0}get heat(){return Math.max(0,1-this.age/Xd)}}const vf=new Ht,zy=new Ai,Mf=new A,Lo=new Ht().makeScale(0,0,0),As=new A,Hi=new A,Do=new A(0,1,0);class By{constructor(t){this.flares=new is(Po,e=>new _f(e)),this.flareCd=0,this.chaffCd=0,this.chaff=new is(Gu*3,e=>new _f(e)),this.chaffSalvo=0,this.ecmCd=0,this.ecmFlash=0,this.salvo=0,this.salvoHeat=0,this.mesh=new zi(new Ie(1,10,8),new $e({color:16776160,transparent:!0,blending:jn,depthWrite:!1}),Po),this.mesh.material.color.multiplyScalar(5),this.mesh.instanceMatrix.setUsage(Yc),this.mesh.frustumCulled=!1;for(let e=0;e<Po;e++)this.mesh.setMatrixAt(e,Lo);t&&t.add(this.mesh)}reset(){this.flares.releaseAll(),this.flareCd=0,this.chaffCd=0,this.chaff.releaseAll(),this.ecmCd=0,this.ecmFlash=0,this.salvoHeat=0;for(let t=0;t<Po;t++)this.mesh.setMatrixAt(t,Lo);this.mesh.instanceMatrix.needsUpdate=!0}fireFlares(t,e){if(this.flareCd>0)return!1;this.flareCd=Wd(),this.salvo++,As.copy(e).normalize(),Hi.crossVectors(As,Do),Hi.lengthSq()<1e-6&&Hi.set(1,0,0),Hi.normalize();for(let i=0;i<yc;i++){const n=this.flares.acquireOrRecycle(),r=i%2*2-1;n.pos.copy(t).addScaledVector(As,-12-i*3),n.vel.copy(e).multiplyScalar(.55).addScaledVector(Hi,r*(14+i*4)).addScaledVector(Do,-6-i),n.age=0,n.salvo=this.salvo}return!0}fireChaff(t,e){if(this.chaffCd>0)return!1;this.chaffCd=qd(),this.chaffSalvo++,As.copy(e).normalize(),Hi.crossVectors(As,Do),Hi.lengthSq()<1e-6&&Hi.set(1,0,0),Hi.normalize();for(let i=0;i<Gu;i++){const n=this.chaff.acquireOrRecycle(),r=i%2*2-1;n.pos.copy(t).addScaledVector(As,-15-i*5),n.vel.copy(e).multiplyScalar(.25).addScaledVector(Hi,r*(10+i*5)).addScaledVector(Do,4-i*2),n.age=0,n.salvo=this.chaffSalvo}return!0}fireEcm(t,e,i){if(this.ecmCd>0)return-1;this.ecmCd=Yd(),this.ecmFlash=40;let n=0;for(let r=0;r<e.length;r++){const o=e[r];!o.active||!o.tracking||o.seeker!=="RADAR"||o.pos.distanceTo(t)>=lS||i()>=cS()||(o.falseTrack.copy(o.pos).addScaledVector(o.dir,hS).add(Mf.set((i()*2-1)*nl,(i()*2-1)*nl*.4,(i()*2-1)*nl)),o.seduce(o.falseTrack),n++)}return n}step(t,e,i){this.flareCd>0&&this.flareCd--,this.chaffCd>0&&this.chaffCd--,this.stepChaff(t,e,i),this.ecmCd>0&&this.ecmCd--,this.ecmFlash>0&&this.ecmFlash--;const n=this.flares.items;let r=null;for(let a=0;a<n.length;a++){const l=n[a];if(!l.active)continue;if(l.age++,l.age>Xd+30){l.active=!1,this.mesh.setMatrixAt(a,Lo);continue}l.vel.multiplyScalar(.985),l.vel.y-=gf*.4*Nt,l.pos.addScaledVector(l.vel,Nt),l.heat>0&&(!r||l.heat>r.heat)&&(r=l);const c=.6+3.2*l.heat;vf.compose(l.pos,zy,Mf.set(c,c,c)),this.mesh.setMatrixAt(a,l.heat>0?vf:Lo)}if(this.mesh.instanceMatrix.needsUpdate=!0,this.salvoHeat=r?r.heat:0,!r)return 0;let o=0;for(let a=0;a<e.length;a++){const l=e[a];if(!(!l.active||!l.tracking||l.seeker!=="IR")&&!(l.flareSalvoTried===r.salvo||l.climbShare<Vu)&&!(l.pos.distanceTo(t)>=sS)&&(l.flareSalvoTried=r.salvo,i()<rS()*r.heat)){let c=r;const h=Math.floor(i()*yc);let f=0;for(let u=0;u<n.length;u++){const p=n[u];p.active&&p.salvo===r.salvo&&(f===h&&(c=p),f++)}l.seduce(c.pos),o++}}return o}stepChaff(t,e,i){const n=this.chaff.items;let r=null;for(let a=0;a<n.length;a++){const l=n[a];if(l.active){if(l.age++,l.age>Hu){l.active=!1;continue}l.vel.multiplyScalar(.96),l.vel.y-=gf*.05*Nt,l.pos.addScaledVector(l.vel,Nt),(!r||l.salvo>r.salvo)&&(r=l)}}if(!r)return;const o=Math.max(0,1-r.age/Hu);for(let a=0;a<e.length;a++){const l=e[a];!l.active||!l.tracking||l.seeker!=="RADAR"||l.chaffSalvoTried===r.salvo||l.climbShare<Vu||l.pos.distanceTo(t)>=oS||(l.chaffSalvoTried=r.salvo,i()<aS()*o&&l.seduce(r.pos))}}get flareHeat(){return this.salvoHeat}}const wc=Cx*$s,ky=wc/(pt*60*Hd),xf=ky/Dx,Hy=40*pt,Gy=new Qe(22,.3,1.6),Vy=new ai(.6,.45,9,8),Wy=new Qe(3.5,.2,1),Xy=new Ie(.7,8,6),Sf=new Me({color:11183286}),qy=new Me({color:12499656}),Yy=new $e({color:13793535});class $y{constructor(){this.mesh=new fi,this.x=0,this.z=0,this.y=0,this.heading=Math.PI,this.spotCd=0,this.alive=!0,this.respawn=0,this.wp=new Float64Array(6),this.wpCount=0;const t=new Tt(Gy,Sf);this.mesh.add(t);const e=new Tt(Vy,qy);e.rotation.x=Math.PI/2,e.position.z=1,this.mesh.add(e);for(const n of[-1,1]){const r=new Tt(Wy,Sf);r.position.set(n*1.3,.9,5),r.rotation.z=n*.6,this.mesh.add(r)}const i=new Tt(Xy,Yy);i.position.set(0,-.6,-3.8),this.mesh.add(i),this.mesh.scale.setScalar(1.5)}reset(t,e){const i=600+t()*(kt-1200),n=oi(i)+400+t()*(zt-600-oi(i)-400);this.x=Te(n),this.z=_e(i),this.y=(Mo+t()*(Nu-Mo))*Re,this.heading=-Math.PI/2,this.spotCd=Math.floor(t()*Sc),this.alive=!0,this.respawn=0,this.mesh.visible=!0,this.wpCount=0}respawnFromBorder(t){const e=600+t()*(kt-1200);this.x=Te(bt.borderX(e)+120),this.z=_e(e),this.y=(Mo+t()*(Nu-Mo))*Re,this.heading=-Math.PI/2,this.spotCd=Math.floor(t()*Sc),this.wpCount=0,this.alive=!0,this.mesh.visible=!0}newWaypoint(t,e,i){let n,r;if(t()<.5){const o=e[Math.floor(t()*e.length)];n=o.x+t()*600-300,r=o.y+t()*600-300}else r=500+t()*(kt-1e3),n=oi(r)+300+t()*(zt-500-oi(r)-300);this.wp[i*2]=Te(n),this.wp[i*2+1]=_e(r)}step(t,e){if(this.wpCount===0){for(let l=0;l<3;l++)this.newWaypoint(t,e,l);this.wpCount=3}const i=this.wp[0],n=this.wp[1];Math.hypot(i-this.x,n-this.z)<Hy&&(this.wp[0]=this.wp[2],this.wp[1]=this.wp[3],this.wp[2]=this.wp[4],this.wp[3]=this.wp[5],this.wpCount--);let o=Math.atan2(i-this.x,-(n-this.z))-this.heading;o=((o+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;const a=$i;this.heading+=Math.max(-xf*a,Math.min(xf*a,o)),this.x+=Math.sin(this.heading)*wc*a*Nt,this.z-=Math.cos(this.heading)*wc*a*Nt,this.spotCd>0&&this.spotCd--}syncMesh(){this.mesh.position.set(this.x,this.y,this.z),this.mesh.rotation.set(0,-this.heading,0)}}function Ky(s){const t=[];for(let e=0;e<Rx;e++){const i=new $y;s&&s.add(i.mesh),t.push(i)}return t}class yf{constructor(t,e,i,n,r,o,a){this.index=t,this.kind=e,this.x=i,this.y=n,this.z=r,this.phase=o,this.camouflaged=a,this.cooldown=0,this.seen=0,this.flash=0,this.range=e==="SAM"?Sx:wx,this.missiles=e==="SAM"?Pu:Iu,this.hp=e==="SAM"?Lu:Uu,this.seeker=e==="SAM"?"RADAR":"IR";const l=e==="SAM"?t+1:t-xc+1;this.name=e==="SAM"?`SAM-${String(l).padStart(2,"0")}`:`TEL-${String(l).padStart(3,"0")}`}get visible(){return!this.camouflaged||this.seen>0||this.hp<=0}get armed(){return this.hp>0&&this.missiles>0}reset(t){this.cooldown=Math.floor(t()*Gd),this.missiles=this.kind==="SAM"?Pu:Iu,this.hp=this.kind==="SAM"?Lu:Uu,this.seen=0,this.flash=0}}function Zy(s,t,e){const i=[],n=[];let r=xx,o=0;for(;i.length<xc&&o<2e5;){o++,o%4e3===0&&(r*=.9);const a=300+s()*(kt-600),l=oi(a)+260+s()*(zt-300-oi(a)-260);if(n.some(u=>Math.hypot(u.x-l,u.y-a)<r)||t.some(u=>Math.hypot(u.x-l,u.y-a)<u.r+140)||bt.nearRiver(l,a,70))continue;const c=Te(l),h=_e(a),f=e(c,h);f<=.5||(n.push({x:l,y:a}),i.push(new yf(i.length,"SAM",c,f,h,s()*Math.PI*2,!1)))}for(o=0;i.length<xc+Ex&&o<4e5;){o++;const a=200+s()*(kt-400),l=oi(a)+150+s()*(zt-200-oi(a)-150);if(n.some(u=>Math.hypot(u.x-l,u.y-a)<Tx)||t.some(u=>Math.hypot(u.x-l,u.y-a)<u.r+40))continue;const c=Te(l),h=_e(a),f=e(c,h);f<=.5||(n.push({x:l,y:a}),i.push(new yf(i.length,"TEL",c,f,h,s()*Math.PI*2,s()<bx)))}return i}const hr=new Ae;class jy{constructor(t,e){this.telShown=[],this.greenOn=[],this.samUp=[],this.sams=e.filter(a=>a.kind==="SAM"),this.tels=e.filter(a=>a.kind==="TEL");const i=this.sams.length,n=this.tels.length,r=(a,l,c)=>{const h=new zi(a,new Me({color:l}),c);return h.frustumCulled=!1,t.add(h),h};this.pads=r(new Qe(44,1.5,34),4212286,i),this.domes=r(new Ie(6,14,8,0,Math.PI*2,0,Math.PI/2),12898002,i),this.faces=r(new Qe(.6,5,7),59070,i),this.cans=r(new Qe(3,8,3),5267006,i*4),this.bodies=r(new Qe(3.4,2.6,13),5528634,n),this.cabs=r(new Qe(3.4,3.2,3),3422760,n),this.tubes=r(new ai(.7,.7,10,8),9870466,n*2);for(let a=0;a<i;a++){const l=this.sams[a];this.put(this.pads,a,l.x,l.y+.6,l.z,l.phase,1),this.put(this.domes,a,l.x-10*Math.cos(l.phase),l.y+1.2,l.z+10*Math.sin(l.phase),0,1);for(let c=0;c<4;c++){const h=4+c%2*6,f=-5+Math.floor(c/2)*8,u=Math.cos(l.phase),p=Math.sin(l.phase);this.put(this.cans,a*4+c,l.x+h*u+f*p,l.y+5,l.z-h*p+f*u,l.phase,1)}}const o=a=>{const l=new $e({color:a});l.color.multiplyScalar(5);const c=new zi(new Ie(2.2,8,6),l,i);return c.frustumCulled=!1,c.visible=!1,t.add(c),c};this.beaconRed=o(16724520),this.beaconGreen=o(3997560);for(let a=0;a<i;a++){const l=this.sams[a];this.put(this.beaconRed,a,l.x-10*Math.cos(l.phase),l.y+9,l.z+10*Math.sin(l.phase),0,1),this.put(this.beaconGreen,a,l.x+16*Math.cos(l.phase),l.y+4,l.z-16*Math.sin(l.phase),0,1)}for(let a=0;a<i;a++)this.greenOn.push(!0);this.beaconRed.instanceMatrix.needsUpdate=!0,this.beaconGreen.instanceMatrix.needsUpdate=!0;for(let a=0;a<n;a++)this.telShown.push(!0);this.update(0,!0),this.pads.instanceMatrix.needsUpdate=!0,this.domes.instanceMatrix.needsUpdate=!0,this.cans.instanceMatrix.needsUpdate=!0}put(t,e,i,n,r,o,a,l=0){hr.position.set(i,n,r),hr.rotation.set(l,o,0,"YXZ"),hr.scale.setScalar(a),hr.updateMatrix(),t.setMatrixAt(e,hr.matrix)}setNight(t,e){if(this.beaconRed.visible=t&&Math.floor(e/20)%3===0,this.beaconGreen.visible=t,!t)return;let i=!1;for(let n=0;n<this.sams.length;n++){const r=this.sams[n],o=r.armed;o!==this.greenOn[n]&&(this.greenOn[n]=o,i=!0,this.put(this.beaconGreen,n,r.x+16*Math.cos(r.phase),r.y+4,r.z-16*Math.sin(r.phase),0,o?1:0))}i&&(this.beaconGreen.instanceMatrix.needsUpdate=!0)}update(t,e=!1){let i=!1;for(let r=0;r<this.sams.length;r++){const o=this.sams[r],a=o.hp>0;if(this.samUp[r]===a)continue;this.samUp[r]=a,i=!0;const l=a?1:0;this.put(this.domes,r,o.x-10*Math.cos(o.phase),o.y+1.2,o.z+10*Math.sin(o.phase),0,l);for(let c=0;c<4;c++){const h=4+c%2*6,f=-5+Math.floor(c/2)*8,u=Math.cos(o.phase),p=Math.sin(o.phase);this.put(this.cans,r*4+c,o.x+h*u+f*p,o.y+5,o.z-h*p+f*u,o.phase,l)}}i&&(this.domes.instanceMatrix.needsUpdate=!0,this.cans.instanceMatrix.needsUpdate=!0);for(let r=0;r<this.sams.length;r++){const o=this.sams[r],a=o.x-10*Math.cos(o.phase),l=o.z+10*Math.sin(o.phase),c=o.phase+t*.02;this.put(this.faces,r,a+Math.cos(c)*4,o.y+5,l-Math.sin(c)*4,c,o.hp>0?1:0)}this.faces.instanceMatrix.needsUpdate=!0;let n=e;for(let r=0;r<this.tels.length;r++){const o=this.tels[r],a=o.visible&&o.hp>0;if(a===this.telShown[r]&&!e)continue;this.telShown[r]=a,n=!0;const l=a?1:0,c=Math.cos(o.phase),h=Math.sin(o.phase);this.put(this.bodies,r,o.x,o.y+1.8,o.z,o.phase,l),this.put(this.cabs,r,o.x-7.5*h,o.y+2,o.z-7.5*c,o.phase,l);for(let f=0;f<2;f++){const u=f===0?-.9:.9;this.put(this.tubes,r*2+f,o.x+u*c+1.5*h,o.y+5,o.z-u*h+1.5*c,o.phase,l,-1)}}n&&(this.bodies.instanceMatrix.needsUpdate=!0,this.cabs.instanceMatrix.needsUpdate=!0,this.tubes.instanceMatrix.needsUpdate=!0)}}const Jy=1.225,ur=9.81,Qy=.25,t1=12e-5,e1=650,i1=45,n1=1500,s1=25,r1=.15,o1=.6*$s,a1=60,Ef=.996,rn=new A,ml=new A,gl=new A,Gi=new A,Rs=new A,Io=new A,_l=new A,l1=new A(0,1,0),wf=new Ai,c1=new ai(.25,.25,5.5,8),h1=new Ie(.7,8,6),Tf=new Me({color:15461350}),u1=new Me({color:15786184}),f1=new Me({color:13158568}),rp=new $e({color:16752704});rp.color.multiplyScalar(4);const d1=new Ie(1.6,10,8),op=new $e({color:16751168,transparent:!0,opacity:.55,blending:jn,depthWrite:!1});op.color.multiplyScalar(3);const p1=1/250,m1=new A;class g1{constructor(){this.active=!1,this.guided=!0,this.seeker="RADAR",this.pos=new A,this.vel=new A,this.dir=new A(0,1,0),this.mesh=new fi,this.age=0,this.speed=0,this.topSpeed=Fu,this.climbFrames=Ou,this.burnout=0,this.lockLost=!1,this.lostBy="",this.decoy=null,this.falseTrack=new A,this.decoyFrames=0,this.flareSalvoTried=-1,this.chaffSalvoTried=-1,this.launcher=-1,this.aLat=0,this.saturated=0,this.prevTgtVel=new A,this.body=new Tt(c1,Tf),this.mesh.add(this.body),this.flame=new Tt(h1,rp),this.flame.position.y=-3.2,this.flame.scale.set(1.4,3,1.4);const t=new Tt(d1,op);this.flame.add(t),this.mesh.add(this.flame),this.mesh.visible=!1}get trailGrey(){return this.guided?.92:.78}get motorOn(){return this.age<=this.burnout}get climbShare(){return Math.min(1,this.age/this.climbFrames)}get tracking(){return this.guided&&!this.lockLost&&this.decoy===null}launch(t,e,i,n,r,o,a,l){this.guided=o,this.seeker=o?a:"NONE",this.body.material=o?a==="IR"?u1:Tf:f1,this.pos.set(t,e+3,i),this.age=0,this.topSpeed=Fu*$i,this.speed=this.topSpeed*rr,this.climbFrames=Math.max(Ou,Fx*(n.y/Re)/br),this.burnout=this.climbFrames+kx,this.lockLost=!1,this.lostBy="",this.decoy=null,this.decoyFrames=0,this.flareSalvoTried=-1,this.chaffSalvoTried=-1,this.launcher=l,this.aLat=0,this.saturated=0,this.prevTgtVel.copy(r);let c=this.climbFrames;for(let h=0;h<8;h++)_l.copy(n).addScaledVector(r,c*Nt),c=this.framesToCover(_l.distanceTo(this.pos));this.dir.copy(_l).sub(this.pos).normalize(),o||(this.burnout=c+Bx),this.vel.copy(this.dir).multiplyScalar(this.speed),this.mesh.visible=!0,this.flame.visible=!0,this.syncMesh()}framesToCover(t){const e=this.climbFrames,i=this.topSpeed*Nt,n=i*(.35*e+.65*e/2);if(t>=n)return e+(t-n)/i;const r=.65*i/(2*e),o=.35*i;return(-o+Math.sqrt(o*o+4*r*t))/(2*r)}seduce(t){this.decoy=t,this.decoyFrames=0}step(t,e,i,n){if(this.age++,this.guided&&this.age>Vd)return"expired";if(!this.guided)this.stepUnguided();else{const r=ep(this.pos.y)/Jy,o=Math.max(Qy,r),a=Math.min(Ox*60*o*this.speed,s1*ur*o);if(Gi.set(0,0,0),this.decoy){if(this.decoyFrames++,this.decoyFrames>dS||this.pos.distanceTo(this.decoy)<fS)return"decoy";rn.copy(this.decoy).sub(this.pos).normalize(),_1(this.dir,rn,uS),this.vel.copy(this.dir).multiplyScalar(this.speed)}else if(!this.lockLost&&t&&e){rn.copy(t).sub(this.pos);const l=rn.length();if(Rs.copy(rn).divideScalar(l),this.age>this.climbFrames){const c=(e.x-this.vel.x)*Rs.x+(e.y-this.vel.y)*Rs.y+(e.z-this.vel.z)*Rs.z>0;(Math.acos(Math.min(1,this.dir.dot(Rs)))>Wx||c&&l<n1)&&(this.lockLost=!0,this.lostBy="gimbal")}if(!this.lockLost&&this.seeker==="RADAR"&&this.age>this.climbFrames){const c=rn.x,h=rn.z,f=Math.hypot(c,h),u=Math.hypot(e.x,e.z),p=f>0?Math.abs(e.x*c+e.z*h)/f:u;f>gS&&u>1&&e.y<-15&&p<pS*u&&n()<1-Math.pow(1-mS(),Nt)&&(this.lockLost=!0,this.lostBy="notch")}if(!this.lockLost){ml.copy(e).sub(this.vel),gl.crossVectors(rn,ml).divideScalar(l*l);const c=-rn.dot(ml)/l;Gi.crossVectors(gl,Rs).multiplyScalar(Vx*Math.max(c,50)),this.motorOn&&(Gi.y+=ur),Gi.addScaledVector(this.dir,-Gi.dot(this.dir));const h=Gi.length(),f=Math.max(1,e.length()),u=gl.copy(e).sub(this.prevTgtVel).length()/(f*Nt),p=a/Math.max(1,this.speed),_=u>p&&l<e1;this.saturated=_?this.saturated+1:0,this.saturated>i1&&(this.lockLost=!0,this.lostBy="gimbal"),h>a&&Gi.multiplyScalar(a/h),this.prevTgtVel.copy(e)}}if(this.aLat=Gi.length(),this.decoy===null){if(this.motorOn)this.speed=this.topSpeed*(rr+(1-rr)*this.climbShare),this.vel.addScaledVector(Gi,Nt),this.vel.y-=ur*Nt,this.vel.setLength(this.speed);else{this.vel.addScaledVector(Gi,Nt),this.vel.y-=ur*Nt;let l=this.vel.length();const c=t1*r*l*l+r1*this.aLat*(this.aLat/Math.max(1,a));if(l=Math.max(0,l-c*Nt),this.vel.setLength(l),this.speed=l,this.flame.visible=!1,l<o1*$i)return"expired"}this.dir.copy(this.vel).divideScalar(Math.max(.001,this.speed))}}return this.pos.addScaledVector(this.vel,Nt),this.age>30&&this.pos.y<=i(this.pos.x,this.pos.z)?"ground":"none"}get armed(){return this.age>a1}stepUnguided(){this.age>this.burnout?(this.vel.x*=Ef,this.vel.z*=Ef,this.vel.y=Math.max(-400,this.vel.y-ur*Nt),this.speed=this.vel.length(),this.dir.copy(this.vel).divideScalar(Math.max(.001,this.speed)),this.flame.visible=!1):(this.speed=this.topSpeed*(rr+(1-rr)*this.climbShare),this.vel.copy(this.dir).multiplyScalar(this.speed))}syncMesh(t){this.mesh.position.copy(this.pos);const e=t?Math.min(60,Math.max(1.6,m1.copy(t).distanceTo(this.pos)*p1)):1.6;this.mesh.scale.setScalar(e),wf.setFromUnitVectors(l1,this.dir),this.mesh.quaternion.copy(wf)}hide(){this.active=!1,this.mesh.visible=!1,this.decoy=null}}function _1(s,t,e){if(Math.acos(Math.min(1,Math.max(-1,s.dot(t))))<=e){s.copy(t);return}Io.crossVectors(s,t),Io.lengthSq()<1e-10&&Io.set(1,0,0),s.applyAxisAngle(Io.normalize(),e)}const v1=8;function vl(s){let t=s|0;return()=>{t=t+1831565813|0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}class M1{constructor(t,e=2026){this.frame=0,this.hitThisFrame=!1,this.lastHitSeeker="",this.lastHitLauncher="",this.launchedThisFrame=0,this.decoyedThisFrame=0,this.painting=0,this.onBlast=null;const i=vl(2026);this.cities=bt.cities,this.launchers=Zy(i,this.cities,ne),this.meshes=t?new jy(t,this.launchers):null,this.drones=Ky(t),this.missiles=new is(v1,()=>{const n=new g1;return t&&t.add(n.mesh),n}),this.cm=new By(t),this.rand=vl(e),this.reset(e)}reset(t){this.rand=vl(t);for(const e of this.launchers)e.reset(this.rand);for(const e of this.drones)e.reset(this.rand,this.cities);for(const e of this.missiles.items)e.hide();this.cm.reset(),this.frame=0}launch(t,e,i=null){const n=this.missiles.acquire();if(!n)return null;t.missiles--,t.flash=24,t.cooldown=Gd,t.seen=Ax;const r=i===null?this.rand()<zx:i;return n.launch(t.x,t.y+12,t.z,e.pos,e.vel,r,t.seeker,t.index),this.launchedThisFrame++,n}airborne(){let t=0;const e=this.missiles.items;for(let i=0;i<e.length;i++)e[i].active&&t++;return t}nearestArmed(t,e,i){let n=null,r=i*i;for(let o=0;o<this.launchers.length;o++){const a=this.launchers[o];if(!a.armed)continue;const l=(a.x-t)*(a.x-t)+(a.z-e)*(a.z-e);l<r&&(r=l,n=a)}return n}step(t,e){this.frame++,this.hitThisFrame=!1,this.launchedThisFrame=0,this.painting=0;const i=this.rand;if(t&&t.pos.y/Re<mx)for(let o=0;o<this.launchers.length;o++){const a=this.launchers[o];a.camouflaged&&a.hp>0&&Math.hypot(a.x-t.pos.x,a.z-t.pos.z)<gx&&(a.seen=Math.max(a.seen,2))}let n=this.airborne();for(let o=0;o<this.drones.length;o++){const a=this.drones[o];if(!a.alive){a.respawn>0&&--a.respawn===0&&a.respawnFromBorder(i);continue}if(a.step(i,this.cities),!e||!t||a.spotCd>0||Math.hypot(t.pos.x-a.x,t.pos.z-a.z)>=Px||n>=Du)continue;const l=this.nearestArmed(t.pos.x,t.pos.z,Lx);l&&this.launch(l,t)&&(n++,a.spotCd=Sc)}for(let o=0;o<this.launchers.length;o++){const a=this.launchers[o];a.seen>0&&a.seen--,a.flash>0&&a.flash--;const l=!!t&&a.armed&&(t.pos.x-a.x)**2+(t.pos.z-a.z)**2<a.range*a.range;if(l&&e&&this.painting++,a.cooldown>0){a.cooldown--;continue}!e||!l||n>=Du||i()<yx&&t&&this.launch(a,t)&&n++}this.decoyedThisFrame=t?this.cm.step(t.pos,this.missiles.items,i):this.cm.step(x1,this.missiles.items,i);const r=this.missiles.items;for(let o=0;o<r.length;o++){const a=r[o];if(!a.active)continue;const l=a.step(t?t.pos:null,t?t.vel:null,ne,i);if(l!=="none"){this.onBlast&&this.onBlast(a.pos.x,a.pos.y,a.pos.z,l==="ground"?40:l==="decoy"?45:35,1.2),a.hide();continue}t&&a.decoy===null&&a.armed&&a.pos.distanceTo(t.pos)<Ux&&(this.onBlast&&this.onBlast(a.pos.x,a.pos.y,a.pos.z,70,1.6),this.lastHitSeeker=a.seeker,this.lastHitLauncher=this.launchers[a.launcher]?.name??"",a.hide(),this.hitThisFrame=!0)}}syncMeshes(t=!1,e){this.meshes&&(this.meshes.update(this.frame),this.meshes.setNight(t,this.frame));for(let n=0;n<this.drones.length;n++)this.drones[n].syncMesh();const i=this.missiles.items;for(let n=0;n<i.length;n++)i[n].active&&i[n].syncMesh(e)}}const x1=new A(0,-1e7,0),S1=()=>Nr(.5),Ml=()=>Math.round(4*Yi),Mn=new A,Uo=new A,bf=new A(0,1,0),Af=new Ai,y1=new A,E1=new ai(.35,.35,3,8),w1=new Me({color:4868668}),Rf=new Me({color:16440490}),T1=new Me({color:12512255}),b1=new ai(.2,.2,3.6,8),ap=new $e({color:16755260});ap.color.multiplyScalar(4);const A1=new Ie(.5,8,6);class R1{constructor(){this.active=!1,this.kind="BOMB",this.pos=new A,this.vel=new A,this.dir=new A,this.impact=new A,this.speed=0,this.age=0,this.fall=0,this.launcher=null,this.drone=null,this.sam=null,this.mesh=new fi,this.bomb=new Tt(E1,w1),this.body=new Tt(b1,Rf),this.flame=new Tt(A1,ap),this.flame.position.y=-2,this.flame.scale.set(1,2,1),this.mesh.add(this.bomb,this.body,this.flame),this.mesh.visible=!1}setKind(t){this.kind=t,this.bomb.visible=t==="BOMB",this.body.visible=t!=="BOMB",this.flame.visible=t!=="BOMB",this.body.material=t==="AGM"?Rf:T1}sync(t){this.mesh.position.copy(this.pos),Af.setFromUnitVectors(bf,this.dir.lengthSq()>0?this.dir:bf),this.mesh.quaternion.copy(Af),this.mesh.scale.setScalar(Math.min(40,Math.max(1.5,y1.copy(t).distanceTo(this.pos)/250)))}}class C1{constructor(t,e,i){this.threats=e,this.hooks=i,this.missileCd=0,this.aamLeft=Ml(),this.frame=0,this.items=new is(16,()=>{const n=new R1;return t&&t.add(n.mesh),n}),this.fires=new is(60,()=>({active:!1,x:0,y:0,z:0,age:0,life:1,size:1}))}reset(){for(const t of this.items.items)t.active=!1,t.mesh.visible=!1;this.fires.releaseAll(),this.missileCd=0,this.aamLeft=Ml()}rearm(){this.missileCd=0,this.aamLeft=Ml()}agmTarget(t){let e=null,i=qx();for(const n of this.threats.launchers){if(n.hp<=0||!n.visible)continue;const r=Math.hypot(n.x-t.x,n.z-t.z);r<i&&(i=r,e=n)}return e}aamTarget(t){let e=null,i=Bu();for(const n of this.threats.drones){if(!n.alive)continue;const r=Math.hypot(n.x-t.x,n.z-t.z);r<i&&(i=r,e=n)}return e}samTarget(t){let e=null,i=Bu();const n=this.threats.missiles.items;for(let r=0;r<n.length;r++){const o=n[r];if(!o.active||o.decoy!==null||!o.armed)continue;const a=o.pos.distanceTo(t);Mn.copy(t).sub(o.pos).divideScalar(Math.max(1,a)),a<i&&o.dir.dot(Mn)>.5&&(i=a,e=o)}return e}dropBomb(t,e){const i=this.items.acquireOrRecycle();i.setKind("BOMB"),i.pos.copy(t).y-=3,i.vel.set(e.x*.9,0,e.z*.9),i.fall=30,i.age=0,i.dir.set(0,-1,0);let n=i.pos.x,r=i.pos.y,o=i.pos.z,a=i.vel.x,l=i.vel.z,c=i.fall;for(let h=0;h<4e3&&r>ne(n,o);h++)n+=a*Nt,o+=l*Nt,a*=.997,l*=.997,c=Math.min(260,c+2.2),r-=c*Re;i.impact.set(n,ne(n,o),o),i.mesh.visible=!0,this.hooks.sound("shoot",null)}fireMissile(t,e,i){if(this.missileCd>0){this.hooks.say("MISSILE RAIL RELOADING");return}if(t==="AAM"&&this.aamLeft<=0){this.hooks.say("NO AAM LEFT");return}const n=t==="AGM"?this.agmTarget(e):null,r=t==="AAM"?this.samTarget(e):null,o=t==="AAM"&&!r?this.aamTarget(e):null;if(!n&&!o&&!r){this.hooks.say(t==="AGM"?"NO BATTERY IN AGM RANGE":"NO DRONE IN AAM RANGE");return}const a=this.items.acquireOrRecycle();a.setKind(t),a.launcher=n,a.drone=o,a.sam=r,a.pos.copy(e).y-=2,a.dir.copy(i).normalize(),a.speed=$s*$i*(t==="AGM"?Yx:$x),a.age=0,a.mesh.visible=!0,this.missileCd=Xx(),t==="AAM"&&this.aamLeft--,this.hooks.sound("missile",null)}step(){this.frame++,this.missileCd>0&&this.missileCd--;const t=this.items.items;for(let i=0;i<t.length;i++){const n=t[i];if(!n.active)continue;if(n.age++,n.kind==="BOMB"){n.pos.x+=n.vel.x*Nt,n.pos.z+=n.vel.z*Nt,n.vel.x*=.997,n.vel.z*=.997,n.fall=Math.min(260,n.fall+2.2),n.pos.y-=n.fall*Re,n.dir.set(n.vel.x*Nt,-n.fall*Re,n.vel.z*Nt).normalize(),this.frame%2===0&&this.hooks.smoke(n.pos.x,n.pos.y,n.pos.z,1.5,2,5,.9);const g=ne(n.pos.x,n.pos.z);n.pos.y<=g&&(n.pos.y=g,this.explode(n),this.groundHit(n.pos,zu,1,"BOMB"));continue}const r=n.sam&&n.sam.active?n.sam:null,o=r?r.pos.x:n.launcher?n.launcher.x:n.drone?n.drone.x:n.pos.x,a=r?r.pos.y:n.launcher?n.launcher.y+4:n.drone?n.drone.y:n.pos.y,l=r?r.pos.z:n.launcher?n.launcher.z:n.drone?n.drone.z:n.pos.z,c=r?!0:n.launcher?n.launcher.hp>0:n.drone?n.drone.alive:!1;Mn.set(o-n.pos.x,a-n.pos.y,l-n.pos.z);const h=Mn.length();Mn.divideScalar(Math.max(.001,h));const f=n.kind==="AGM"?Kx:Zx;Math.acos(Math.min(1,Math.max(-1,n.dir.dot(Mn))))<=f?n.dir.copy(Mn):(Uo.crossVectors(n.dir,Mn),Uo.lengthSq()<1e-10&&Uo.set(1,0,0),n.dir.applyAxisAngle(Uo.normalize(),f));const p=Math.min(1,.4+n.age/90);n.pos.addScaledVector(n.dir,n.speed*p*Nt);const _=n.pos.y<=ne(n.pos.x,n.pos.z);h<ku?(this.explode(n),r?this.threats.rand()<S1()?(this.hooks.blast(r.pos.x,r.pos.y,r.pos.z,45,1.2),r.hide(),this.hooks.say("MISSILE SHOT DOWN")):this.hooks.say("AAM MISSED - FIRE AGAIN"):n.kind==="AGM"?this.groundHit(n.pos,jx,1,"AGM"):n.drone&&n.drone.alive&&(n.drone.alive=!1,n.drone.mesh.visible=!1,n.drone.respawn=eS,this.hooks.say("DRONE SPLASHED"))):(n.age>Jx||_||!c&&h<ku*3)&&(this.hooks.blast(n.pos.x,n.pos.y,n.pos.z,30,.8),n.active=!1,n.mesh.visible=!1)}const e=this.fires.items;for(let i=0;i<e.length;i++){const n=e[i];if(n.active){if(n.age++,n.age>=n.life){n.active=!1;continue}(this.frame+i)%6===0&&this.hooks.smoke(n.x,n.y+6,n.z,6,n.size,n.size*3.5,.22)}}}explode(t){this.hooks.blast(t.pos.x,t.pos.y+5,t.pos.z,t.kind==="BOMB"?zu*.6:50,1.4),this.hooks.sound("explode",t.pos),t.active=!1,t.mesh.visible=!1}burn(t,e){this.addFire(t,e,2400,12)}addFire(t,e,i,n){const r=this.fires.acquireOrRecycle();r.x=t,r.z=e,r.y=ne(t,e),r.age=0,r.life=i,r.size=n}groundHit(t,e,i,n){this.addFire(t.x,t.z,iS,9);for(const r of this.threats.launchers){if(r.hp<=0)continue;const o=r.kind==="SAM"?Qx:tS;Math.hypot(r.x-t.x,r.z-t.z)>=e+o||(r.hp=Math.max(0,r.hp-i),r.hp===0?(r.missiles=0,this.addFire(r.x,r.z,nS,14),this.hooks.say(`${r.name} DESTROYED BY ${n}`)):this.hooks.say(`${r.name} DAMAGED BY ${n}`))}}sync(t){const e=this.items.items;for(let i=0;i<e.length;i++)e[i].active&&e[i].sync(t)}}const xl=6,P1=1.943844,No=24,L1=12,Cf=8,D1=14e3,I1=22e3,Cs=5,U1=180,Si=new A,xn=new A,Pf=new A,Lf=new A;function Vt(s,t,e=""){const i=document.createElement("div");return i.className=t,i.textContent=e,s.appendChild(i),i}class Be{constructor(t){this.node=t,this.last=""}set(t){t!==this.last&&(this.node.textContent=t,this.last=t)}}class lp{constructor(t){this.bombMarks=[],this.arrows=[],this.arrowText=[],this.launcherMarks=[],this.launcherText=[],this.droneMarks=[],this.missileMarks=[],this.missileText=[],this.msgNodes=[],this.msgText=[],this.msgLife=[],this.nearIdx=new Int32Array(No),this.nearD=new Float64Array(No),this.lastHp=-1,this.tick=0;const e=Vt(t,"hud");this.root=e,this.border=Vt(e,"hud-border"),this.ecmRing=Vt(e,"hud-ecm-ring");const i=Vt(e,"hud-box hud-left");Vt(i,"hud-label","SPEED"),this.spd=new Be(Vt(i,"hud-big")),this.mach=new Be(Vt(i,"hud-small"));const n=Vt(e,"hud-box hud-right");Vt(n,"hud-label","ALTITUDE"),this.alt=new Be(Vt(n,"hud-big")),this.agl=new Be(Vt(n,"hud-small"));const r=Vt(e,"hud-top");this.hdg=new Be(Vt(r,"hud-hdg")),this.tag=new Be(Vt(r,"hud-small hud-tag"));const o=Vt(r,"hud-hp"),a=Vt(o,"hud-hp-bar");this.hpFill=Vt(a,"hud-hp-fill"),this.hpText=new Be(Vt(o,"hud-small"));const l=Vt(e,"hud-box hud-bl");this.g=new Be(Vt(l,"hud-mid")),this.thr=new Be(Vt(l,"hud-small"));const c=(f,u)=>{const p=Vt(l,"hud-cm");Vt(p,"hud-cm-label",f);const _=Vt(p,"hud-cm-bar");return[Vt(_,`hud-cm-fill ${u}`),new Be(Vt(p,"hud-cm-state"))]};[this.flareFill,this.flareText]=c("FLARES","flare"),[this.chaffFill,this.chaffText]=c("CHAFF","chaff"),[this.ecmFill,this.ecmText]=c("ECM","ecm"),this.warnNode=Vt(e,"hud-warn"),this.warn=new Be(this.warnNode),this.adviceNode=Vt(e,"hud-advice"),this.advice=new Be(this.adviceNode),this.caution=new Be(Vt(e,"hud-caution")),this.p2Node=Vt(e,"mark mark-p2"),this.p2Node.style.display="none",this.p2Text=new Be(this.p2Node);const h=Vt(e,"hud-log");for(let f=0;f<Cs;f++)this.msgNodes.push(new Be(Vt(h,"hud-log-line"))),this.msgText.push(""),this.msgLife.push(0);for(let f=0;f<Cf;f++){const u=Vt(e,"rwr-arrow");Vt(u,"rwr-tip"),this.arrowText.push(new Be(Vt(u,"rwr-label"))),u.style.display="none",this.arrows.push(u)}for(let f=0;f<No;f++){const u=Vt(e,"mark mark-site");u.style.display="none",this.launcherMarks.push(u),this.launcherText.push(new Be(u))}for(let f=0;f<xl;f++){const u=Vt(e,"mark mark-bomb");u.style.display="none",this.bombMarks.push(u)}for(let f=0;f<L1;f++){const u=Vt(e,"mark mark-drone","UAV");u.style.display="none",this.droneMarks.push(u)}for(let f=0;f<Cf;f++){const u=Vt(e,"mark mark-missile");u.style.display="none",this.missileMarks.push(u),this.missileText.push(new Be(u))}}setTag(t){this.tag.set(t)}p2Mark(t,e,i,n,r){if(!t){this.p2Node.style.display="none";return}Lf.set(t.x,t.y+10,t.z),this.place(this.p2Node,Lf,i,n,r)&&this.p2Text.set(e)}show(t){this.root.style.display=t?"block":"none"}say(t){for(let e=0;e<Cs-1;e++)this.msgText[e]=this.msgText[e+1],this.msgLife[e]=this.msgLife[e+1];this.msgText[Cs-1]=t,this.msgLife[Cs-1]=U1}clearLog(){for(let t=0;t<Cs;t++)this.msgText[t]="",this.msgLife[t]=0,this.msgNodes[t].set("")}static lockCount(t){let e=0;const i=t.missiles.items;for(let n=0;n<i.length;n++)i[n].active&&i[n].tracking&&e++;return e}update(t,e,i,n,r,o,a){this.tick++;const l=this.tick%4===0,c=t.speed;if(l){this.spd.set(`${Math.round(c*P1)} KT`),this.mach.set(`M ${t.mach.toFixed(2)}`);const v=t.pos.y/Re;this.alt.set(`${(Math.round(v/10)*10).toLocaleString("en-US")} FT`),this.agl.set(`AGL ${Math.round(Math.max(0,t.pos.y-e)/Re).toLocaleString("en-US")} FT`),this.hdg.set(`HDG ${String(Math.round(t.headingDeg)%360).padStart(3,"0")}`),this.g.set(`${t.gLoad.toFixed(1)} G`),this.thr.set(`${t.afterburner?"THR AB":`THR ${Math.round(t.throttle*100)}%`}   AAM ${r.aamLeft}`);const S=n.cm;this.flareFill.style.width=`${(100*(1-S.flareCd/Wd())).toFixed(0)}%`,this.flareText.set(S.flareCd===0?"READY":`${(S.flareCd/60).toFixed(1)} s`),this.chaffFill.style.width=`${(100*(1-S.chaffCd/qd())).toFixed(0)}%`,this.chaffText.set(S.chaffCd===0?"READY":`${(S.chaffCd/60).toFixed(1)} s`),this.chaffFill.classList.toggle("ready",S.chaffCd===0),this.ecmFill.style.width=`${(100*(1-S.ecmCd/Yd())).toFixed(0)}%`,this.ecmText.set(S.ecmCd===0?"READY":`${(S.ecmCd/60).toFixed(1)} s`),this.flareFill.classList.toggle("ready",S.flareCd===0),this.ecmFill.classList.toggle("ready",S.ecmCd===0)}t.hp!==this.lastHp&&(this.lastHp=t.hp,this.hpFill.style.width=`${100*t.hp/Ir}%`,this.hpText.set(`HP ${t.hp} / ${Ir}`));for(let v=0;v<Cs;v++)this.msgLife[v]>0&&(this.msgLife[v]--,this.msgLife[v]===0&&(this.msgText[v]="")),this.msgNodes[v].set(this.msgText[v]);const h=n.missiles.items;let f=0,u=0,p=0,_=1/0;const g=Math.atan2(t.vel.x,-t.vel.z),m=r.samTarget(t.pos);for(let v=0;v<h.length;v++){const S=h[v],P=this.arrows[v],U=this.missileMarks[v];let G=!1;if(t.alive&&S.active){xn.copy(S.pos).sub(t.pos);const X=xn.length();if(S.tracking?(G=!0,S.seeker==="IR"?u++:f++):!S.guided&&X<Hx&&-xn.dot(S.dir)/X>Gx&&(G=!0,p++),G){X<_&&(_=X);const $=Math.atan2(xn.x,-xn.z)-g;Pf.copy(S.vel).sub(t.vel);const V=-Pf.dot(xn)/X;if(P.style.display="block",P.style.transform=`translate(-50%, -50%) rotate(${$.toFixed(3)}rad)`,l){const Q=S.guided?S.seeker:"ROCKET",nt=xn.y>600?" HI":xn.y<-600?" LO":"";this.arrowText[v].set(`${Q}${nt} ${(X/1e3).toFixed(1)}km ${V>=0?"+":""}${Math.round(V)}m/s`)}P.lastChild.style.transform=`translateX(-50%) rotate(${(-$).toFixed(3)}rad)`}}G||(P.style.display="none"),!t.alive||!S.active||!this.place(U,S.pos,i,o,a)?U.style.display="none":(U.classList.toggle("target",S===m),l&&this.missileText[v].set(`${(S.pos.distanceTo(t.pos)/1e3).toFixed(1)}`))}const d=f+u>0||p>0,M=(this.tick>>3)%2===0;if(this.border.style.display=d&&M?"block":"none",d){if(l){const v=[];f+u>0&&v.push(`MISSILE LOCK ${f+u}${f&&u?` (RADAR ${f} / IR ${u})`:f?" RADAR":" IR"}`),p>0&&v.push(`ROCKET ${p}`),this.warn.set(`${v.join("  +  ")}  -  ${(_/1e3).toFixed(1)} KM`);const S=n.cm;let P;f+u===0?P="UNGUIDED - TURN HARD OUT OF ITS PATH":u>0&&S.flareCd===0?P="PRESS C (△)  -  FLARES":f>0&&S.chaffCd===0?P="PRESS K (D-PAD ↑)  -  CHAFF   |   X (L1)  -  ECM   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE":f>0&&S.ecmCd===0?P="PRESS X (L1)  -  ECM JAMMER   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE":f>0?P="NOTCH: FLY 90 DEG ACROSS IT AND DIVE, THEN BREAK HARD LATE":P=`FLARES RELOADING ${(S.flareCd/60).toFixed(1)} s - BREAK HARD LATE`,m&&r.missileCd===0&&r.aamLeft>0&&(P+="   |   Z (□)  -  SHOOT IT DOWN"),this.advice.set(P)}this.warnNode.style.visibility=M||_<3e3?"visible":"hidden"}else this.warn.set(""),this.advice.set("");if(this.ecmRing.style.display=n.cm.ecmFlash>0?"block":"none",n.cm.ecmFlash>0){const v=1+(40-n.cm.ecmFlash)*.12;this.ecmRing.style.transform=`translate(-50%, -50%) scale(${v.toFixed(2)})`,this.ecmRing.style.opacity=(n.cm.ecmFlash/40).toFixed(2)}if(l){let v="";t.alive&&t.stalled?v="STALL":t.alive&&t.pos.y-e<px*Re&&t.vel.y<-20&&(v="PULL UP"),this.caution.set(v)}const x=No;let y=0;const C=n.launchers;for(let v=0;v<C.length;v++){const S=C[v];if(!S.visible||S.hp<=0)continue;const P=Math.hypot(S.x-t.pos.x,S.z-t.pos.z);if(P>D1)continue;let U;if(y<x)U=y++;else{if(P>=this.nearD[x-1])continue;U=x-1}for(;U>0&&this.nearD[U-1]>P;)this.nearD[U]=this.nearD[U-1],this.nearIdx[U]=this.nearIdx[U-1],U--;this.nearD[U]=P,this.nearIdx[U]=v}const T=r.agmTarget(t.pos),b=r.aamTarget(t.pos);for(let v=0;v<x;v++){const S=this.launcherMarks[v];if(v>=y){S.style.display="none";continue}const P=C[this.nearIdx[v]];Si.set(P.x,P.y+10,P.z),this.place(S,Si,i,o,a)&&(S.classList.toggle("tel",P.kind==="TEL"),S.classList.toggle("in-range",this.nearD[v]<P.range),S.classList.toggle("target",P===T),l&&this.launcherText[v].set(P.kind))}for(let v=0;v<this.droneMarks.length;v++){const S=this.droneMarks[v],P=n.drones[v];if(!P){S.style.display="none";continue}Si.set(P.x,P.y,P.z),!P.alive||Si.distanceTo(t.pos)>I1||!this.place(S,Si,i,o,a)?S.style.display="none":S.classList.toggle("target",P===b)}let L=0;const O=r.items.items;for(let v=0;v<O.length&&L<xl;v++){const S=O[v];!S.active||S.kind!=="BOMB"||this.place(this.bombMarks[L],S.impact,i,o,a)&&L++}for(;L<xl;L++)this.bombMarks[L].style.display="none"}place(t,e,i,n,r){if(Si.copy(e).project(i),Si.z>1||Si.z<-1||Math.abs(Si.x)>1.05||Math.abs(Si.y)>1.05)return t.style.display="none",!1;const o=(Si.x*.5+.5)*n,a=(-Si.y*.5+.5)*r;return t.style.display="block",t.style.transform=`translate(${o.toFixed(0)}px, ${a.toFixed(0)}px) translate(-50%, -50%)`,!0}}const Sl="M36 456 C 118 452, 112 372, 170 346 S 222 304, 236 280";function N1(s){const t=`<animateMotion dur="2s" begin="0.4s" fill="freeze" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.35 0 0.6 1" path="${Sl}"/>`,e="",i=n=>` class="${n}"`;return`
<svg class="logo" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fighter">
  <defs>
    <radialGradient id="lg-sky" cx="56%" cy="74%" r="78%">
      <stop offset="0%" stop-color="#fff3c2"/>
      <stop offset="12%" stop-color="#ffc35a"/>
      <stop offset="30%" stop-color="#ff7a2e"/>
      <stop offset="48%" stop-color="#c72f55"/>
      <stop offset="68%" stop-color="#4a1d6e"/>
      <stop offset="86%" stop-color="#16154a"/>
      <stop offset="100%" stop-color="#070a26"/>
    </radialGradient>
    <linearGradient id="lg-earth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c1430"/>
      <stop offset="100%" stop-color="#05040c"/>
    </linearGradient>
    <linearGradient id="lg-rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="22%" stop-color="#b9c6d4"/>
      <stop offset="48%" stop-color="#4a5666"/>
      <stop offset="70%" stop-color="#d7e1ec"/>
      <stop offset="100%" stop-color="#2b3340"/>
    </linearGradient>
    <linearGradient id="lg-skin" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#5b6b7c"/>
      <stop offset="30%" stop-color="#e9f1f8"/>
      <stop offset="52%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#9fb0c2"/>
      <stop offset="100%" stop-color="#3d4a58"/>
    </linearGradient>
    <linearGradient id="lg-canopy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe9a8"/>
      <stop offset="45%" stop-color="#d79a2b"/>
      <stop offset="100%" stop-color="#5a3608"/>
    </linearGradient>
    <linearGradient id="lg-plume" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="18%" stop-color="#bfe8ff"/>
      <stop offset="40%" stop-color="#ffb43c"/>
      <stop offset="75%" stop-color="#ff4a1c" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#ff2a10" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lg-smoke" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="45%" stop-color="#f3ecf2" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
    </linearGradient>
    <radialGradient id="lg-sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbe6"/>
      <stop offset="40%" stop-color="#ffe08a" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#ff9a3c" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lg-gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="lg-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="lg-hot" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="lg-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="6" dy="10" stdDeviation="6" flood-color="#12051f" flood-opacity="0.65"/>
    </filter>
    <clipPath id="lg-clip"><circle cx="256" cy="256" r="224"/></clipPath>
  </defs>

  <!-- the badge: sunset sky, the sun, the curve of the earth with a burning rim -->
  <g${i("lg-badge")}>
    <circle cx="256" cy="256" r="232" fill="#0a0d1c"/>
    <g clip-path="url(#lg-clip)">
      <rect x="0" y="0" width="512" height="512" fill="url(#lg-sky)"/>
      <g${i("lg-stars")} fill="#ffffff">
        <circle cx="120" cy="96" r="1.6"/><circle cx="176" cy="62" r="1.2"/><circle cx="246" cy="52" r="1"/>
        <circle cx="96" cy="160" r="1.2"/><circle cx="210" cy="118" r="0.9"/><circle cx="300" cy="70" r="1.1"/>
      </g>
      <circle cx="300" cy="392" r="92" fill="url(#lg-sun)"/>
      <g${i("lg-earth")}>
        <path d="M-10 410 Q 256 338 522 410 L 522 522 L -10 522 Z" fill="url(#lg-earth)"/>
        <path d="M-10 410 Q 256 338 522 410" fill="none" stroke="#ffb35a" stroke-width="3" filter="url(#lg-glow)"/>
        <path d="M60 452 Q 256 404 452 452" fill="none" stroke="#ff7a3c" stroke-opacity="0.25" stroke-width="2"/>
      </g>
      <!-- the missile's smoke trail sweeping up from the ground -->
      <path${i("lg-trail-glow")} d="${Sl}" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="26" stroke-linecap="round" pathLength="1"/>
      <path${i("lg-trail")} d="${Sl}" fill="none" stroke="url(#lg-smoke)" stroke-width="9" stroke-linecap="round" pathLength="1"/>
      <!-- speed streaks behind the jet -->
      <g stroke="#ffffff" stroke-linecap="round" opacity="0.55">
        <path d="M196 214 L150 248" stroke-width="2"/><path d="M240 260 L198 292" stroke-width="1.6"/><path d="M226 178 L186 206" stroke-width="1.4"/>
      </g>
      <rect x="0" y="0" width="512" height="230" fill="url(#lg-gloss)"/>
    </g>
    <!-- bevelled metal rim + a thin hot inner line -->
    <circle cx="256" cy="256" r="232" fill="none" stroke="url(#lg-rim)" stroke-width="16"${i("lg-ring")}/>
    <circle cx="256" cy="256" r="223" fill="none" stroke="#ffb35a" stroke-opacity="0.85" stroke-width="2"/>
    <circle cx="256" cy="256" r="241" fill="none" stroke="#0a0d1c" stroke-width="3"/>
    <g fill="#ffd27a">
      <circle cx="256" cy="24" r="4"/><circle cx="488" cy="256" r="4"/><circle cx="256" cy="488" r="4"/><circle cx="24" cy="256" r="4"/>
    </g>
  </g>

  <!-- the missile rides its trail -->
  <g${i("lg-missile")}${e} filter="url(#lg-glow)">
    <g transform="scale(1.5)">
    <path d="M-18 -4 L12 -4 L22 0 L12 4 L-18 4 Z" fill="#f4f4ee"/>
    <path d="M12 -4 L22 0 L12 4 Z" fill="#e0262a"/>
    <path d="M-18 -4 L-25 -11 L-12 -4 Z M-18 4 L-25 11 L-12 4 Z" fill="#c8c8b8"/>
    <circle cx="-25" cy="0" r="6.5" fill="#ffc050" filter="url(#lg-hot)"/>
    </g>
    ${t}
  </g>

  <!-- flares fanning out behind the jet like wings -->
  <g filter="url(#lg-hot)">
    <g${i("lg-wing lg-wing-l")} fill="#fff4cc">
      <circle cx="282" cy="252" r="6"/><circle cx="262" cy="262" r="5.2"/><circle cx="240" cy="270" r="4.6"/>
      <circle cx="218" cy="282" r="4"/><circle cx="198" cy="298" r="3.4"/><circle cx="182" cy="318" r="2.8"/>
    </g>
    <g${i("lg-wing lg-wing-r")} fill="#fff4cc">
      <circle cx="300" cy="262" r="6"/><circle cx="314" cy="282" r="5.2"/><circle cx="332" cy="298" r="4.6"/>
      <circle cx="352" cy="312" r="4"/><circle cx="370" cy="330" r="3.4"/><circle cx="384" cy="350" r="2.8"/>
    </g>
  </g>

  <!-- the jet: polished steel, climbing hard, twin burners lit -->
  <g${i("lg-jet")}>
    <g transform="translate(350 172) rotate(40) scale(1.18)" filter="url(#lg-shadow)">
      <g${i("lg-plume")} filter="url(#lg-hot)">
        <path d="M-12 60 L-4 60 L-8 150 Z" fill="url(#lg-plume)"/>
        <path d="M4 60 L12 60 L8 150 Z" fill="url(#lg-plume)"/>
      </g>
      <path d="M0 -92 L7 -66 L10 -34 L13 -8 L66 30 L68 42 L13 30 L11 46 L32 62 L32 71 L8 66 L0 72 L-8 66 L-32 71 L-32 62 L-11 46 L-13 30 L-68 42 L-66 30 L-13 -8 L-10 -34 L-7 -66 Z"
            fill="url(#lg-skin)" stroke="#1d2531" stroke-width="1.6"/>
      <path d="M-13 -8 L-26 -20 L-12 -32 Z M13 -8 L26 -20 L12 -32 Z" fill="#8293a6"/>
      <path d="M0 -60 L5 -38 L4 -22 L0 -16 L-4 -22 L-5 -38 Z" fill="url(#lg-canopy)" stroke="#2a1a05" stroke-width="0.8"/>
      <path d="M0 -16 L0 60" stroke="#55657a" stroke-width="1.2"/>
      <path d="M-13 30 L-46 38 M13 30 L46 38" stroke="#6b7c90" stroke-width="1"/>
      <path d="M-68 42 L-66 30 L-56 36 Z M68 42 L66 30 L56 36 Z" fill="#e0262a"/>
      <path d="M-32 71 L-32 62 L-24 64 Z M32 71 L32 62 L24 64 Z" fill="#e0262a"/>
      <circle cx="-8" cy="62" r="4" fill="#ffd27a" filter="url(#lg-hot)"/>
      <circle cx="8" cy="62" r="4" fill="#ffd27a" filter="url(#lg-hot)"/>
    </g>
  </g>

  <!-- lock-on brackets closing round the jet -->
  <g${i("lg-lock")} stroke="#ff2d2d" stroke-width="5.5" fill="none" stroke-linecap="round" filter="url(#lg-glow)">
    <path d="M272 82 H250 V104"/><path d="M438 82 H460 V104"/>
    <path d="M272 268 H250 V246"/><path d="M438 268 H460 V246"/>
  </g>
</svg>`}const Df=N1(),F1=`<svg viewBox="0 0 160 96" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">
  <circle cx="80" cy="48" r="26" stroke-width="2.5" opacity="0.9"/>
  <circle cx="80" cy="48" r="26" stroke-width="2">
    <animate attributeName="r" values="26;44" dur="1.6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.8;0" dur="1.6s" repeatCount="indefinite"/>
  </circle>
  <path d="M80 14 V26 M80 70 V82 M46 48 H58 M102 48 H114" stroke-width="3"/>
  <circle cx="80" cy="48" r="5" stroke-width="2.5"/>
  <path d="M68 48 H75 M85 48 H92 M80 43 V39" stroke-width="2.5"/>
  <path d="M8 30 H34 V35 M152 30 H126 V35 M8 66 H34 V61 M152 66 H126 V61" stroke-width="2.5" opacity="0.85"/>
  <path d="M16 48 H30 M144 48 H130" stroke-width="2" stroke-dasharray="4 4" opacity="0.7"/>
  <path d="M74 22 L80 18 L86 22" stroke-width="2.5"/>
</svg>`,O1='<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 25 a8 8 0 1 1 12 7 c-3 2 -4 3 -4 7" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="46" r="2.8" fill="currentColor"/></svg>',z1='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 20 L44 44 M44 20 L20 44" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',B1=3600;class k1{constructor(t){this.dockTimer=0,this.root=document.getElementById("start"),this.logo=document.getElementById("intro-logo"),this.help=document.getElementById("help"),this.logo.innerHTML=Df;const e=document.getElementById("start-btn"),i=document.getElementById("help-btn"),n=document.getElementById("help-close");e.innerHTML=F1,i.innerHTML=O1,n.innerHTML=z1,this.root.addEventListener("click",r=>{r.target.closest("#help-btn")||t()}),i.addEventListener("click",r=>{r.stopPropagation(),this.help.style.display="flex"}),n.addEventListener("click",()=>this.help.style.display="none"),this.help.addEventListener("click",r=>{r.target===this.help&&(this.help.style.display="none")}),window.addEventListener("keydown",r=>{r.code==="Escape"&&(this.help.style.display="none")}),this.show()}show(){this.root.style.display="flex",this.logo.classList.remove("docked"),this.logo.innerHTML=Df,window.clearTimeout(this.dockTimer),this.dockTimer=window.setTimeout(()=>this.logo.classList.add("docked"),B1)}hide(){this.root.style.display="none",this.help.style.display="none",window.clearTimeout(this.dockTimer)}}const ye=252,Ee=90;class H1{constructor(t,e,i,n){this.tick=0,this.canvas=document.createElement("canvas"),this.canvas.className="minimap",this.canvas.width=ye,this.canvas.height=Ee,t.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.bg=document.createElement("canvas"),this.bg.width=ye,this.bg.height=Ee;const r=this.bg.getContext("2d");r.imageSmoothingQuality="high",r.drawImage(e,0,0,ye,Ee),r.fillStyle="rgba(0, 10, 20, 0.32)",r.fillRect(0,0,ye,Ee),r.strokeStyle="rgba(0, 200, 255, 0.16)",r.lineWidth=1,r.beginPath();for(let a=ye/12;a<ye;a+=ye/12)r.moveTo(Math.round(a)+.5,0),r.lineTo(Math.round(a)+.5,Ee);for(let a=Ee/4;a<Ee;a+=Ee/4)r.moveTo(0,Math.round(a)+.5),r.lineTo(ye,Math.round(a)+.5);r.stroke();const o=r.createRadialGradient(ye/2,Ee/2,Ee*.3,ye/2,Ee/2,ye*.62);o.addColorStop(0,"rgba(0,0,0,0)"),o.addColorStop(1,"rgba(0,8,18,0.45)"),r.fillStyle=o,r.fillRect(0,0,ye,Ee);for(let a=0;a<bt.airbases.length;a+=2){const l=bt.airbases[a]/zt*ye,c=bt.airbases[a+1]/kt*Ee,h=18,f=4;r.save(),r.shadowColor="rgba(255, 255, 255, 0.9)",r.shadowBlur=4,r.fillStyle="#f2f2ea",r.fillRect(l-h/2-1,c-f/2-1,h+2,f+2),r.restore(),r.fillStyle="#2b2f33",r.fillRect(l-h/2,c-f/2,h,f),r.fillStyle="#ffffff";for(let u=-h/2+3;u<h/2-3;u+=3)r.fillRect(l+u,c-.5,1.6,1);r.fillStyle="#3cff6e",r.fillRect(l-h/2,c-f/2,1,f),r.fillRect(l+h/2-1,c-f/2,1,f),r.fillStyle="#9aa0a4",r.fillRect(l-h*.38,c+f/2+2,h*.76,1),r.fillRect(l-3,c+f/2+3,6,3)}this.canvas.addEventListener("click",a=>{const l=this.canvas.getBoundingClientRect(),c=(a.clientX-l.left)/l.width*ye,h=(a.clientY-l.top)/l.height*Ee;let f=-1,u=30;for(const p of n.jets){if(!p.alive)continue;const[_,g]=this.toMap(p.pos.x,p.pos.z),m=3.5*Math.hypot(_-c,g-h);m<u&&(u=m,f=p.id)}f>=0&&i(f)})}toMap(t,e){return[(t/pt+zt/2)/zt*ye,(e/pt+kt/2)/kt*Ee]}show(t){this.canvas.style.display=t?"block":"none"}update(t,e,i,n,r){if(++this.tick%6!==0)return;const o=this.ctx;o.drawImage(this.bg,0,0);const a=ye/(zt*pt),l=Ee/(kt*pt),c=ye/2,h=Ee/2;for(const g of t.launchers){const m=c+g.x*a,d=h+g.z*l;g.kind==="SAM"?(o.fillStyle=g.hp<=0?"#dc3c32":g.missiles>0?"#00dc96":"#787878",o.beginPath(),o.arc(m,d,1.6,0,Math.PI*2),o.fill()):g.visible&&(o.fillStyle=g.hp<=0?"#dc3c32":g.missiles>0?"#e6c85a":"#787878",o.fillRect(m,d,1,1))}const f=c+i*a,u=h+n*l;o.save(),o.beginPath(),o.rect(0,0,ye,Ee),o.clip(),o.strokeStyle="rgba(0, 230, 255, 0.35)",o.lineWidth=1;for(const g of[14,28,42])o.beginPath(),o.arc(f,u,g,0,Math.PI*2),o.stroke();const p=performance.now()/1e3*2.2,_=o.createRadialGradient(f,u,0,f,u,46);_.addColorStop(0,"rgba(0, 255, 200, 0.28)"),_.addColorStop(1,"rgba(0, 255, 200, 0)"),o.fillStyle=_,o.beginPath(),o.moveTo(f,u),o.arc(f,u,46,p-.6,p),o.closePath(),o.fill(),o.strokeStyle="rgba(120, 255, 220, 0.8)",o.beginPath(),o.moveTo(f,u),o.lineTo(f+Math.cos(p)*46,u+Math.sin(p)*46),o.stroke(),o.restore();for(const g of t.drones)g.alive&&If(o,c+g.x*a,h+g.z*l,g.heading,3.4,"#ff5a6e");for(const g of t.missiles.items)g.active&&If(o,c+g.pos.x*a,h+g.pos.z*l,Math.atan2(g.vel.x,-g.vel.z),2.6,"#ff9628");for(const g of e.jets)g.alive&&g.id!==e.active&&G1(o,c+g.pos.x*a,h+g.pos.z*l,g.heading,3.6,"#4aa8ff");o.save(),o.translate(f,u),o.rotate(r),o.fillStyle="#00e6ff",o.beginPath(),o.moveTo(0,-5),o.lineTo(3.5,3.5),o.lineTo(-3.5,3.5),o.closePath(),o.fill(),o.restore(),o.strokeStyle="#00c8ff",o.lineWidth=1,o.strokeRect(.5,.5,ye-1,Ee-1),o.strokeStyle="rgba(0, 200, 255, 0.35)",o.strokeRect(2.5,2.5,ye-5,Ee-5),o.strokeStyle="#7ff4ff",o.lineWidth=2,o.beginPath();for(const[g,m,d,M]of[[1,1,1,1],[ye-1,1,-1,1],[1,Ee-1,1,-1],[ye-1,Ee-1,-1,-1]])o.moveTo(g,m+M*10),o.lineTo(g,m),o.lineTo(g+d*10,m);o.stroke()}}function If(s,t,e,i,n,r){s.save(),s.translate(t,e),s.rotate(i),s.strokeStyle=r,s.lineWidth=1.4,s.beginPath(),s.moveTo(-n,n*.6),s.lineTo(0,-n),s.lineTo(n,n*.6),s.stroke(),s.restore()}function G1(s,t,e,i,n,r){s.save(),s.translate(t,e),s.rotate(i),s.fillStyle=r,s.beginPath(),s.moveTo(0,-n),s.lineTo(n*.7,n*.8),s.lineTo(0,n*.35),s.lineTo(-n*.7,n*.8),s.closePath(),s.fill(),s.restore()}const V1=20,Uf=[.3,-.1],W1=new lt(Uf[0]*.25*pt*60,Uf[1]*.25*pt*60),X1=8;class q1{constructor(){this.drift=new lt;let t=4242;const e=()=>{t=t+1831565813|0;let h=t;return h=Math.imul(h^h>>>15,h|1),h^=h+Math.imul(h^h>>>7,h|61),((h^h>>>14)>>>0)/4294967296},i=(h,f)=>h+e()*(f-h),n=h=>h*Math.sqrt(-2*Math.log(Math.max(1e-9,e())))*Math.cos(2*Math.PI*e()),r=[],o=[],a=[];for(let h=0;h<V1;h++){const f=i(0,zt),u=i(0,kt),p=i(6e3,28e3)*Re,_=e()<.35,g=_?i(160,300):i(90,220),m=g*i(.55,.85),d=Math.floor(_?i(4,9):i(2,5));for(let M=0;M<d;M++){const x=_?i(.07,.12)*g:i(.12,.2)*g,y=i(x*1.6,g-x*1.6),C=i(x*1.6,m-x*1.6),T=Math.min(X1,Math.floor(x*2.2)+6);for(let b=0;b<T;b++){const L=n(x*.3),O=n(x*.25),v=Math.hypot(L/x,O/x);if(v>1.6)continue;const S=Math.max(6,x*i(.4,.8)*Math.max(.4,1-v*.45)),P=(L+O)/x;r.push(Te(f+y+L),p+Math.abs(n(x*.35))*pt-S*.5,_e(u+C+O)),o.push(S*pt*4),a.push(P<-.25?1:P>.35?.35:.7)}}}const l=new GM,c=new qs(2,2);l.index=c.index,l.setAttribute("position",c.getAttribute("position")),l.setAttribute("iOffset",new Er(new Float32Array(r),3)),l.setAttribute("iSize",new Er(new Float32Array(o),1)),l.setAttribute("iShade",new Er(new Float32Array(a),1)),l.instanceCount=o.length,this.mat=new ge({transparent:!0,depthWrite:!1,fog:!0,uniforms:wi.merge([st.fog,{uDrift:{value:new lt},uMin:{value:new lt(Te(0),_e(0))},uSize:{value:new lt(zt*pt,kt*pt)},uLit:{value:new St("#ffffff")},uShade:{value:new St("#c4ccdc")},uNight:{value:0}}]),vertexShader:`
        attribute vec3 iOffset;
        attribute float iSize;
        attribute float iShade;
        uniform vec2 uDrift;
        uniform vec2 uMin;
        uniform vec2 uSize;
        varying vec2 vUv;
        varying float vShade;
        varying float vNear;
        varying float vFar;
        #include <fog_pars_vertex>
        void main() {
          vec3 c = iOffset;
          c.x = uMin.x + mod(c.x - uMin.x + uDrift.x, uSize.x);
          c.z = uMin.y + mod(c.z - uMin.y + uDrift.y, uSize.y);
          vec4 mvPosition = viewMatrix * vec4(c, 1.0);
          mvPosition.xy += position.xy * iSize;
          vUv = position.xy;
          vShade = iShade;
          vNear = smoothstep(300.0, 1500.0, -mvPosition.z); // clouds never block the view: puffs within ~1.5 km of the camera fade out (user: clear viewing)
          vFar = 1.0 - smoothstep(6000.0, 14000.0, -mvPosition.z); // and far away: about one cloud in view (main.py:176)
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,fragmentShader:`
        uniform vec3 uLit;
        uniform vec3 uShade;
        uniform float uNight;
        varying vec2 vUv;
        varying float vShade;
        varying float vNear;
        varying float vFar;
        #include <fog_pars_fragment>
        void main() {
          // break the round edge with a little noise so puffs do not read as discs
          float ang = atan(vUv.y, vUv.x);
          float wob = 0.18 * sin(ang * 5.0 + vShade * 7.0) + 0.12 * sin(ang * 9.0 - vShade * 3.0);
          float r2 = dot(vUv, vUv) * (1.0 + wob);
          if (r2 > 1.0) discard;
          float a = pow(1.0 - r2, 2.6) * 0.28 * vNear * vFar; // soft edges // main.py:1349 dense middle, fading edge
          vec3 col = mix(uShade, uLit, vShade);
          col *= mix(vec3(1.0), vec3(0.07, 0.08, 0.13), uNight); // main.py:1386 moonlit blue-grey
          gl_FragColor = vec4(col, a);
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`}),this.mesh=new Tt(l,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=2}update(t,e){this.drift.copy(W1).multiplyScalar(t),this.mat.uniforms.uDrift.value.copy(this.drift),this.mat.uniforms.uNight.value=e}}const yl=10,El=5,Y1=.12,$1=11,K1=25e3,Z1=.06,Sn=new Ae;class j1{constructor(t){this.convoys=[];let e=35e3;this.rand=()=>(e=e*16807%2147483647,e/2147483647);for(let r=0;r<yl;r++){const o=bt.highways[r%bt.highways.length];this.convoys.push({hw:o,len:Math.max(1,Math.hypot(o[2]-o[0],o[3]-o[1])),t:this.rand(),dir:this.rand()<.5?-1:1})}const i=new Qe(3,3.2,11);i.translate(0,1.6,0),this.trucks=new zi(i,new Me({color:4607538}),yl*El);const n=new $e({color:16773320});n.color.multiplyScalar(4),this.lights=new zi(new Ie(1.6,6,4),n,yl*El),this.trucks.frustumCulled=!1,this.lights.frustumCulled=!1,this.lights.visible=!1,t.add(this.trucks,this.lights)}step(t,e,i){for(const r of this.convoys)r.t+=r.dir*Y1/r.len,r.t>0&&r.t<1||(r.dir=-r.dir,r.t=Math.min(1,Math.max(0,r.t)));const n=e/pt+kt/2;if(n>0&&n<kt&&this.rand()<Z1){const r=Math.min(kt,Math.max(0,n+(this.rand()*2-1)*1500)),o=bt.borderX(r)+(this.rand()*2-1)*90,a=Te(o),l=_e(r);Math.abs(a-t)<K1&&o<zt&&i(a,ne(a,l)+5,l,(6+this.rand()*6)*pt,.6)}}sync(t){this.lights.visible=t;let e=0;for(const i of this.convoys){const[n,r,o,a]=i.hw,l=Math.atan2(o-n,a-r)+(i.dir<0?Math.PI:0);for(let c=0;c<El;c++){const h=i.t-i.dir*c*$1/i.len,f=Te(n+(o-n)*h),u=_e(r+(a-r)*h),p=ne(f,u);Sn.position.set(f,p,u),Sn.rotation.set(0,l,0),Sn.scale.set(1,1,1),Sn.updateMatrix(),this.trucks.setMatrixAt(e,Sn.matrix),t&&(Sn.position.set(f+Math.sin(l)*6,p+1.5,u+Math.cos(l)*6),Sn.updateMatrix(),this.lights.setMatrixAt(e,Sn.matrix)),e++}}this.trucks.instanceMatrix.needsUpdate=!0,t&&(this.lights.instanceMatrix.needsUpdate=!0)}}const J1=8,Nf=.02,Ff=new Ie(1.6,10,8),Q1=new ai(.25,.35,7,6),tE=new Qe(14,.08,.5),eE=new Qe(.08,2.2,.3),Of=new Me({color:4871228}),iE=new Me({color:7908030}),zf=new Me({color:1842204}),cp=new $e({color:16727090});cp.color.multiplyScalar(4);class nE{constructor(){this.group=new fi,this.x=0,this.z=0,this.agl=300,this.heading=0,this.speed=50,this.tx=0,this.tz=0;const t=new Tt(Ff,Of);t.scale.set(1,.9,1.6);const e=new Tt(Ff,iE);e.scale.set(.7,.6,.6),e.position.set(0,.3,-1.6);const i=new Tt(Q1,Of);i.rotation.x=Math.PI/2,i.position.set(0,.4,4.6),this.rotor=new Tt(tE,zf),this.rotor.position.y=1.7,this.tail=new Tt(eE,zf),this.tail.position.set(.3,.8,8),this.beacon=new Tt(new Ie(.35,6,4),cp),this.beacon.position.y=1.5,this.group.add(t,e,i,this.rotor,this.tail,this.beacon),this.group.scale.setScalar(1.6)}waypoint(t,e){if(t()<.4){const i=Math.floor(t()*(bt.airbases.length/2))*2;e[0]=Te(bt.airbases[i]+(t()*200-100)),e[1]=_e(bt.airbases[i+1]+(t()*120-60))}else{const i=bt.cities[Math.floor(t()*bt.cities.length)];e[0]=Te(i.x+(t()*800-400)),e[1]=_e(i.y+(t()*800-400))}}step(t,e){Math.hypot(this.tx-this.x,this.tz-this.z)<30*pt&&(this.waypoint(t,e),this.tx=e[0],this.tz=e[1]);let n=Math.atan2(this.tx-this.x,-(this.tz-this.z))-this.heading;n=((n+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,this.heading+=Math.max(-Nf,Math.min(Nf,n)),this.x+=Math.sin(this.heading)*this.speed*Nt,this.z-=Math.cos(this.heading)*this.speed*Nt}sync(t,e){const i=ne(this.x,this.z);this.group.position.set(this.x,i+this.agl,this.z),this.group.rotation.set(.08,-this.heading,0,"YXZ"),this.rotor.rotation.y=t*.55,this.tail.rotation.x=t*.9,this.beacon.visible=e&&(t+Math.floor(this.x))%50<8}}class sE{constructor(t){this.helis=[],this.wp=[0,0];let e=4242;this.rand=()=>(e=e*16807%2147483647,e/2147483647);for(let i=0;i<J1;i++){const n=new nE;n.waypoint(this.rand,this.wp),n.x=this.wp[0],n.z=this.wp[1],n.waypoint(this.rand,this.wp),n.tx=this.wp[0],n.tz=this.wp[1],n.heading=this.rand()*Math.PI*2,n.agl=(600+this.rand()*1900)*Re,n.speed=(.18+this.rand()*.1)*pt*60,t.add(n.group),this.helis.push(n)}}step(){for(const t of this.helis)t.step(this.rand,this.wp)}sync(t,e){for(const i of this.helis)i.sync(t,e)}}const vr=.25,he=1/vr,Bf=["rgb(70,122,48)","rgb(62,114,42)","rgb(80,130,52)","rgb(92,136,54)","rgb(66,118,46)","rgb(104,140,58)"],kf=[[170,148,102],[162,140,96],[178,156,108],[156,136,94]],$n=s=>`rgb(${s[0]},${s[1]},${s[2]})`;function Hf(){const s=document.createElement("canvas");s.width=Math.round(zt*vr),s.height=Math.round(kt*vr);const t=s.getContext("2d");return t.scale(vr,vr),[s,t]}function Mr(s,t){s.beginPath(),s.moveTo(t[0],t[1]);for(let e=2;e<t.length;e+=2)s.lineTo(t[e],t[e+1])}const rE=(s,t)=>(Math.imul(s,73856093)^Math.imul(t,19349663))&65535;function oE(s){s.fillStyle="rgb(60,108,42)",s.fillRect(0,0,zt,kt);const t=160;for(let i=0;i<zt;i+=t)for(let n=0;n<kt;n+=t){const r=rE(i,n);if(Ec(i+t/2,n+t/2)){const l=kf[r%kf.length];s.fillStyle=$n(l),s.fillRect(i,n,t,t),s.strokeStyle=$n([l[0]-18,l[1]-18,l[2]-14]),s.lineWidth=he;for(let c=0;c<3;c++){const h=n+22+c*48+(r>>c*3)%17,f=i+(r>>c*4)%50,u=70+(r>>c)%50;s.beginPath(),s.ellipse(f+u/2,h+13,u/2,13,0,-2.8,-.3),s.stroke()}continue}if(Kd(i+t/2,n+t/2)){s.fillStyle="rgb(54,60,46)",s.fillRect(i,n,t,t);for(let l=0;l<6;l++)s.fillStyle=l%2?"rgb(46,52,40)":"rgb(62,66,52)",s.beginPath(),s.ellipse(i+r*(l+3)%t+20,n+(r*(l+7)>>3)%t+11,20,11,0,0,Math.PI*2),s.fill();continue}const o=3+r%4,a=Bf[r%Bf.length];s.fillStyle=a,s.fillRect(i+o,n+o,t-2*o,t-2*o),r%7===0&&r%5!==0&&(s.fillStyle="rgb(38,82,32)",s.beginPath(),s.ellipse(i+t/2,n+t/2,(t-2*o-30)/2,(t-2*o-46)/2,0,0,Math.PI*2),s.fill())}for(const i of bt.forests)for(let n=0;n<i.trees.length;n+=3)s.fillStyle="rgb(26,58,24)",s.beginPath(),s.arc(i.trees[n]+2,i.trees[n+1]+2,i.trees[n+2],0,Math.PI*2),s.fill(),s.fillStyle="rgb(40,88,34)",s.beginPath(),s.arc(i.trees[n],i.trees[n+1],i.trees[n+2],0,Math.PI*2),s.fill();for(const i of bt.peaks){const n=i.outline;s.fillStyle="rgb(78,74,60)",Mr(s,n),s.closePath(),s.fill(),s.fillStyle="rgb(52,49,42)",s.beginPath(),s.moveTo(i.x,i.y);for(let r=1;r<5;r++)s.lineTo(n[r*2],n[r*2+1]);if(s.closePath(),s.fill(),i.snow){s.fillStyle="rgb(222,226,232)",s.beginPath();for(let r=0;r<10;r++){const o=i.x+(n[r*2]-i.x)*.32,a=i.y+(n[r*2+1]-i.y)*.32;r===0?s.moveTo(o,a):s.lineTo(o,a)}s.closePath(),s.fill()}}s.lineCap="round",s.strokeStyle="rgb(74,74,68)",s.lineWidth=Math.max(3,he);for(const i of bt.highways)Mr(s,i),s.stroke();s.strokeStyle="rgb(48,42,36)",s.lineWidth=he;for(const i of bt.railways)Mr(s,i),s.stroke();const e=[[bt.river,null],...bt.tributaries.map(i=>[i,5])];for(const i of[0,1])for(const[n,r]of e)for(let o=0;o+3<n.length;o+=2){const a=r??7+9*Math.max(0,1-n[o]/zt);s.strokeStyle=i===0?"rgb(28,54,48)":"rgb(34,84,132)",s.lineWidth=Math.max(he,i===0?a+5:a),s.beginPath(),s.moveTo(n[o],n[o+1]),s.lineTo(n[o+2],n[o+3]),s.stroke()}for(let i=0;i<kt;i+=he){const n=oi(i),r=[[0,n-140,"rgb(14,34,78)"],[n-140,n-50,"rgb(18,46,96)"],[n-50,n,"rgb(26,70,120)"],[n,n+7,"rgb(168,160,120)"]];for(const[o,a,l]of r)s.fillStyle=l,s.fillRect(o,i,Math.max(he,a-o),he)}for(const[i,n]of[[-8,"rgb(200,226,236)"],[-19,"rgb(120,172,204)"],[-32,"rgb(70,122,172)"]]){s.strokeStyle=n,s.lineWidth=he*.7,s.beginPath();for(let r=-8;r<kt+9;r+=8){const o=oi(r)+i+3*Math.sin(r/23+i);r===-8?s.moveTo(o,r):s.lineTo(o,r)}s.stroke()}for(const i of bt.villages)for(let n=0;n<i.houses.length;n+=3)s.fillStyle=$n($d[i.houses[n+2]]),s.fillRect(i.houses[n],i.houses[n+1],he,he);for(let i=0;i<bt.airbases.length;i+=2){const n=bt.airbases[i],r=bt.airbases[i+1];s.fillStyle="rgb(86,88,86)",s.fillRect(n-130,r-6,260,12),s.fillStyle="rgb(220,220,210)";for(let o=-120;o<120;o+=16)s.fillRect(n+o,r-1,8,Math.max(2,he*.5));s.fillStyle="rgb(76,78,76)",s.fillRect(n-100,r+14,200,4),s.fillStyle="rgb(80,82,80)",s.fillRect(n-30,r+20,60,22)}for(const i of bt.cities){s.fillStyle=Ec(i.x,i.y)?"rgb(128,114,84)":"rgb(46,60,48)",s.beginPath(),s.arc(i.x,i.y,i.r*1.25,0,Math.PI*2),s.fill(),s.fillStyle="rgb(56,58,60)",s.beginPath(),s.arc(i.x,i.y,i.r,0,Math.PI*2),s.fill();for(const n of i.blocks)s.fillStyle=`rgb(${n.tone},${n.tone},${n.tone+6})`,s.fillRect(n.x,n.y,n.w,n.h);s.strokeStyle="rgb(176,160,110)",s.lineWidth=he;for(const n of[-1,1])s.beginPath(),s.moveTo(i.x-i.r,i.y+n*6),s.lineTo(i.x+i.r,i.y+n*6),s.moveTo(i.x+n*6,i.y-i.r),s.lineTo(i.x+n*6,i.y+i.r),s.stroke()}s.strokeStyle="rgb(196,92,80)",s.lineWidth=he,s.setLineDash([26,18]),Mr(s,bt.border),s.stroke(),s.setLineDash([])}function aE(s){s.fillStyle="rgb(0,0,0)",s.fillRect(0,0,zt,kt),s.globalCompositeOperation="lighter";const t=(e,i,n,r,o)=>{s.fillStyle=$n(r),s.beginPath(),s.arc(e,i,o,0,Math.PI*2),s.fill(),s.fillStyle=$n([r[0]*2,r[1]*2,r[2]*2]),s.beginPath(),s.arc(e,i,Math.max(1,o/2),0,Math.PI*2),s.fill(),s.fillStyle=n,s.fillRect(e,i,he*.5,he*.5)};for(const e of bt.highways){s.lineCap="round",s.strokeStyle="rgb(40,26,6)",s.lineWidth=7,Mr(s,e),s.stroke(),s.strokeStyle="rgb(110,74,22)",s.lineWidth=he*.5,s.stroke();const i=Math.hypot(e[2]-e[0],e[3]-e[1]);s.fillStyle="rgb(255,196,110)";for(let n=0;n<i;n+=18)s.fillRect(e[0]+(e[2]-e[0])*n/i,e[1]+(e[3]-e[1])*n/i,he*.5,he*.5)}for(const e of bt.villages)for(let i=0,n=0;i<e.houses.length;i+=3,n++)(Math.floor(e.houses[i])+n)%3&&t(e.houses[i],e.houses[i+1],"rgb(255,214,140)",[26,18,6],4);for(let e=0;e<bt.airbases.length;e+=2){const i=bt.airbases[e],n=bt.airbases[e+1];s.fillStyle="rgb(235,235,220)";for(let r=-128;r<130;r+=12)s.fillRect(i+r,n-7,he*.5,he*.5),s.fillRect(i+r,n+6,he*.5,he*.5);s.fillStyle="rgb(40,230,90)";for(const r of[-131,129])s.fillRect(i+r,n-6,he*.5,12);s.fillStyle="rgb(60,52,30)",s.fillRect(i-34,n+18,68,26)}for(const e of bt.cities){for(const[i,n]of[[1.2,[12,8,3]],[.95,[20,13,5]],[.65,[28,19,7]],[.35,[36,25,9]]])s.fillStyle=$n(n),s.beginPath(),s.arc(e.x,e.y,e.r*i,0,Math.PI*2),s.fill();s.strokeStyle="rgb(96,70,28)",s.lineWidth=he*.5,s.beginPath();for(let i=-e.r+13;i<e.r;i+=26){const n=Math.sqrt(Math.max(0,e.r*e.r-i*i));s.moveTo(e.x+i,e.y-n),s.lineTo(e.x+i,e.y+n),s.moveTo(e.x-n,e.y+i),s.lineTo(e.x+n,e.y+i)}s.stroke(),s.strokeStyle="rgb(230,170,80)",s.lineWidth=he*.7,s.beginPath();for(const i of[-1,1])s.moveTo(e.x-e.r,e.y+i*6),s.lineTo(e.x+e.r,e.y+i*6),s.moveTo(e.x+i*6,e.y-e.r),s.lineTo(e.x+i*6,e.y+e.r);s.stroke();for(const i of e.blocks){s.fillStyle="rgb(30,26,18)",s.fillRect(i.x,i.y,i.w,i.h);for(let n=0;n<i.lights.length;n+=3)s.fillStyle=$n(_S[i.lights[n+2]]),s.fillRect(i.x+i.lights[n],i.y+i.lights[n+1],he*.6,he*.6)}}s.globalCompositeOperation="source-over"}function lE(){const[s,t]=Hf();oE(t);const[e,i]=Hf();aE(i);const n=r=>{const o=new Pr(r);return o.colorSpace=ui,o.minFilter=bn,o.anisotropy=4,o.flipY=!1,o};return{day:n(s),night:n(e)}}function hp(s,t){const e=s/pe,i=t/pe,n=Math.floor(e),r=Math.floor(i),o=e-n,a=i-r,l=ne(n*pe,r*pe),c=ne((n+1)*pe,r*pe),h=ne(n*pe,(r+1)*pe);if(o+a<=1)return l+(c-l)*o+(h-l)*a;const f=ne((n+1)*pe,(r+1)*pe);return f+(h-f)*(1-o)+(c-f)*(1-a)}const Kn=9e4;let _i=384,pe=Kn/_i;function cE(s){_i=s,pe=Kn/_i}const Gf=Kn/8,hE=24,uE=`
  #include <common>
  attribute vec3 color;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec2 vWorld;
  varying float vViewZ;
  varying float vWorldY;
  #include <fog_pars_vertex>
  #include <shadowmap_pars_vertex>
  void main() {
    vColor = color;
    vNormal = normal;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    vWorldY = world.y;
    vec4 mvPosition = viewMatrix * world;
    vViewZ = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    // sun shadow coordinates (cascades, fx/Shadows.ts)
    vec4 worldPosition = world;
    vec3 transformedNormal = normalMatrix * normal;
    #include <shadowmap_vertex>
    #include <fog_vertex>
  }`,fE=`
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform float uNightMix;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uSkyLight;
  uniform vec3 uGroundLight;
  uniform vec2 uMapSize; // metres
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec2 vWorld;
  varying float vViewZ;
  varying float vWorldY;
  uniform vec2 CSM_cascades[3];
  uniform float cameraNear;
  uniform float shadowFar;
  #include <common>
  #include <packing>
  #include <fog_pars_fragment>
  #include <shadowmap_pars_fragment>
  /** sun shadow from the cascade this fragment's view depth falls in (1 = lit) */
  float sunShadow() {
    float s = 1.0;
    #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
      float ld = vViewZ / (shadowFar - cameraNear);
      DirectionalLightShadow dls;
      #pragma unroll_loop_start
      for (int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i++) {
        dls = directionalLightShadows[ i ];
        if (ld >= CSM_cascades[ i ].x && ld < CSM_cascades[ i ].y)
          s = getShadow(directionalShadowMap[ i ], dls.shadowMapSize, dls.shadowIntensity, dls.shadowBias, dls.shadowRadius, vDirectionalShadowCoord[ i ]);
      }
      #pragma unroll_loop_end
    #endif
    return s;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  // ---- procedural detail (no texture downloads): value noise, fbm, and its slope for bump normals ----
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm3(vec2 p) {
    return vnoise(p) * 0.55 + vnoise(p * 2.07 + 13.1) * 0.3 + vnoise(p * 4.13 - 7.7) * 0.15;
  }
  /** gradient of fbm3 at p (finite differences), for detail normals */
  vec2 fbmSlope(vec2 p, float e) {
    float c = fbm3(p);
    return vec2(fbm3(p + vec2(e, 0.0)) - c, fbm3(p + vec2(0.0, e)) - c) / e;
  }
  void main() {
    vec2 uv = vWorld / uMapSize + 0.5;
    vec3 albedo = vColor;
    float inMap = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    vec3 lights = vec3(0.0);
    if (uv.x < 0.0) {
      albedo = vec3(0.0048, 0.0159, 0.0782); // the ocean goes on (main.py 14,34,78)
    } else {
      // inside the map: main.py's painted tiles; beyond it the same tiles mirrored (matches Height.ts mirror())
      vec2 uvm = 1.0 - abs(mod(uv, 2.0) - 1.0);
      albedo = texture2D(uDay, uvm).rgb;
      lights = texture2D(uNight, uvm).rgb * mix(0.5, 1.0, inMap);
    }
    vec3 n = normalize(vNormal);
    float h = vWorldY;
    float land = step(1.5, h);
    // distance fades: micro detail only near the camera (no shimmer or tiling seen from altitude), macro always
    float nearFade = 1.0 - smoothstep(250.0, 3500.0, vViewZ);
    float midFade = 1.0 - smoothstep(2000.0, 16000.0, vViewZ);
    // macro variation over km: breaks up big flat colour areas seen from 35,000 ft
    float macro = fbm3(vWorld / 2600.0);
    albedo *= mix(1.0, 0.86 + 0.28 * macro, land);
    // splat weights: grass where the ground is green, dirt where it is brown/sand, rock on steep or high ground,
    // snow above the snow line on the flatter faces (noisy edge)
    float green = clamp((albedo.g - max(albedo.r, albedo.b)) * 12.0, 0.0, 1.0);
    float slope = 1.0 - n.y;
    float mountain = smoothstep(650.0, 1100.0, h);
    float rockW = clamp(smoothstep(0.1, 0.28, slope) * smoothstep(300.0, 700.0, h) + smoothstep(1500.0, 2100.0, h), 0.0, 1.0) * land;
    float snowLine = 2650.0 + (fbm3(vWorld / 900.0) - 0.5) * 600.0;
    float snowW = smoothstep(snowLine - 120.0, snowLine + 120.0, h) * smoothstep(0.08, 0.22, n.y - 0.6 + 0.3) * land;
    // micro detail: grass tufts / dirt patches (8 m and 1.5 m), mid detail 60 m
    float micro = fbm3(vWorld / 7.0) * 0.6 + vnoise(vWorld / 1.6) * 0.4;
    float mid = fbm3(vWorld / 60.0);
    vec3 grassTint = mix(vec3(0.62, 0.72, 0.45), vec3(1.18, 1.12, 0.88), micro);
    vec3 dirtTint = mix(vec3(0.85, 0.8, 0.72), vec3(1.1, 1.04, 0.95), micro);
    vec3 tint = mix(dirtTint, grassTint, green);
    albedo *= mix(vec3(1.0), tint, nearFade * land);
    albedo *= mix(1.0, 0.9 + 0.2 * mid, midFade * land);
    // dirt patches in grassland (worn fields), fading in near the camera
    float patchN = smoothstep(0.62, 0.75, fbm3(vWorld / 35.0)) * green * midFade;
    albedo = mix(albedo, albedo * vec3(1.35, 1.0, 0.7), patchN * 0.5 * land);
    // mountains: stratified rock (bands along the height + noise) replaces the painted faceted faces
    float strata = (0.5 + 0.5 * sin(h / 37.0 + fbm3(vWorld / 210.0) * 9.0)) * 0.5 + fbm3(vWorld / 45.0) * 0.5;
    vec3 rock = mix(vec3(0.075, 0.068, 0.058), vec3(0.16, 0.15, 0.135), strata * 0.6 + micro * 0.4 * nearFade + mid * 0.3);
    albedo = mix(albedo, rock, rockW * max(mountain, smoothstep(0.18, 0.35, slope)));
    vec3 snow = vec3(0.5, 0.53, 0.58) * (0.9 + 0.1 * micro);
    albedo = mix(albedo, snow, snowW);
    // detail normals: soft bumps on grass/dirt, cliff faces on rock (fade with distance)
    vec2 g1 = fbmSlope(vWorld / 9.0, 0.35) / 9.0;
    vec2 g2 = fbmSlope(vWorld / 120.0, 0.35) / 120.0;
    float bump = (0.6 + 2.5 * rockW) * nearFade;
    float cliff = (12.0 + 40.0 * rockW) * midFade;
    n = normalize(n + vec3(-g1.x, 0.0, -g1.y) * bump * 3.0 + vec3(-g2.x, 0.0, -g2.y) * cliff * land);
    vec3 light = uSunColor * max(dot(n, uSunDir), 0.0) * sunShadow() + mix(uGroundLight, uSkyLight, n.y * 0.5 + 0.5);
    vec3 col = albedo * light + lights * uNightMix * 1.8;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }`;class dE{constructor(t,e){this.centerX=0,this.centerZ=0,this.jobX=0,this.jobZ=0,this.jobRow=-1;const i=_i+1,n=new Float32Array(i*i*3),r=new Float32Array(i*i*3);for(let l=0;l<i;l++)for(let c=0;c<i;c++){const h=(l*i+c)*3;n[h]=-Kn/2+c*pe,n[h+2]=-Kn/2+l*pe}const o=new Uint32Array(_i*_i*6);let a=0;for(let l=0;l<_i;l++)for(let c=0;c<_i;c++){const h=l*i+c,f=h+1,u=h+i,p=u+1;o[a++]=h,o[a++]=u,o[a++]=f,o[a++]=f,o[a++]=u,o[a++]=p}this.geo=new Ue,this.pos=new xe(n,3),this.col=new xe(r,3),this.geo.setAttribute("position",this.pos),this.geo.setAttribute("color",this.col),this.geo.setIndex(new xe(o,1)),this.stagingY=new Float32Array(i*i),this.stagingC=new Float32Array(i*i*3),this.material=new ge({vertexShader:uE,fragmentShader:fE,fog:!0,lights:!0,uniforms:wi.merge([st.fog,st.lights,{uDay:{value:null},uNight:{value:null},uNightMix:{value:0},uSunDir:{value:new A(.5,1,.3).normalize()},uSunColor:{value:new St(1,.95,.85).multiplyScalar(1.6)},uSkyLight:{value:new St(.55,.62,.75)},uGroundLight:{value:new St(.2,.22,.16)},uMapSize:{value:{x:zt*pt,y:kt*pt}}}])}),this.material.uniforms.uDay.value=t,this.material.uniforms.uNight.value=e,this.mesh=new Tt(this.geo,this.material),this.mesh.frustumCulled=!1,this.mesh.receiveShadow=!0,this.buildNow(0,0)}follow(t,e){if(this.jobRow<0){(Math.abs(t-this.centerX)>Gf||Math.abs(e-this.centerZ)>Gf)&&(this.jobX=Math.round(t/pe)*pe,this.jobZ=Math.round(e/pe)*pe,this.jobRow=0);return}const i=Math.min(_i+1,this.jobRow+hE);this.fillRows(this.jobX,this.jobZ,this.jobRow,i),this.jobRow=i,i>=_i+1&&(this.jobRow=-1,this.swap(this.jobX,this.jobZ))}snapTo(t,e){this.jobRow=-1,this.buildNow(Math.round(t/pe)*pe,Math.round(e/pe)*pe)}buildNow(t,e){this.fillRows(t,e,0,_i+1),this.swap(t,e)}fillRows(t,e,i,n){const r=_i+1,o=this.stagingY,a=this.stagingC;for(let l=i;l<n;l++){const c=e-Kn/2+l*pe;for(let h=0;h<r;h++){const f=t-Kn/2+h*pe,u=ne(f,c),p=l*r+h;o[p]=u;const _=Math.abs(ne(f+pe,c)-u)/pe;pE(u,_,jd(f/700,c/700),a,p*3)}}}swap(t,e){const i=_i+1,n=this.pos.array,r=this.col.array;for(let o=0;o<i*i;o++)n[o*3+1]=this.stagingY[o];r.set(this.stagingC),this.pos.needsUpdate=!0,this.col.needsUpdate=!0,this.geo.computeVertexNormals(),this.mesh.position.set(t,0,e),this.centerX=t,this.centerZ=e}}function pE(s,t,e,i,n){let r,o,a;s<=.5?(r=.005,o=.016,a=.078):t>.5||s>2600?(r=.1,o=.09,a=.07):(r=.045,o=.15,a=.025);const l=.85+e*.3;i[n]=r*l,i[n+1]=o*l,i[n+2]=a*l}const up=.35;function fp(s){let t=s;return()=>(t=t*16807%2147483647,t/2147483647)}function dp(s,t,e,i,n){s.fillStyle=`rgb(${n},${n},${n+2})`,s.fillRect(0,0,t,e);const r=s.getImageData(0,0,t,e);for(let o=0;o<r.data.length;o+=4){const a=(i()-.5)*22;r.data[o]+=a,r.data[o+1]+=a,r.data[o+2]+=a}s.putImageData(r,0,0)}function mE(){const e=1.9692307692307693,i=96/48,n=document.createElement("canvas");n.width=2048,n.height=96;const r=n.getContext("2d"),o=fp(4242);dp(r,2048,96,o,70);const a=r.createLinearGradient(0,0,0,96);a.addColorStop(0,"rgba(0,0,0,0)"),a.addColorStop(.35,"rgba(10,10,10,0.25)"),a.addColorStop(.5,"rgba(10,10,10,0.32)"),a.addColorStop(.65,"rgba(10,10,10,0.25)"),a.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=a,r.fillRect(0,0,2048,96),r.fillStyle="rgba(25,25,25,0.45)";for(let h=7.5;h<48;h+=7.5)r.fillRect(0,h*i,2048,1);for(let h=25;h<1040;h+=25)r.fillRect(h*e,0,1,96);for(const h of[0,1])for(let f=0;f<140;f++){const u=280+o()*420,p=(h===0?u:1040-u)*e,_=(8+o()*45)*e,g=(24+(o()<.5?-1:1)*(2.5+o()*4)+(o()-.5)*1.5)*i;r.fillStyle=`rgba(12,12,12,${.25+o()*.4})`,r.fillRect(h===0?p:p-_,g,_,Math.max(1,(.3+o()*.4)*i))}const l="rgb(205,205,198)";r.fillStyle=l,r.fillRect(0,1*i,2048,.9*i),r.fillRect(0,96-1.9*i,2048,.9*i);for(const h of[0,1]){const f=(h===0?6:1004)*e;for(let u=0;u<8;u++){const p=3+u*2.6;r.fillRect(f,(24-p-1.8)*i,30*e,1.8*i),r.fillRect(f,(24+p)*i,30*e,1.8*i)}}r.font=`bold ${Math.round(12*i)}px Arial, sans-serif`,r.textAlign="center",r.textBaseline="middle";for(const[h,f]of[[0,"09"],[1,"27"]]){r.save();const u=(h===0?50:990)*e;r.translate(u,96/2),r.rotate(h===0?Math.PI/2:-Math.PI/2),r.scale(1,3.2*(e/i)*.62),r.fillText(f,0,0),r.restore()}for(let h=70;h<940;h+=50)r.fillRect(h*e,(24-.45)*i,30*e,.9*i);for(const h of[0,1]){const f=(u,p)=>(h===0?u:1040-u-p)*e;r.fillRect(f(300,45),11*i,45*e,4*i),r.fillRect(f(300,45),33*i,45*e,4*i);for(const u of[150,450,600])for(const p of[-1,1])r.fillRect(f(u,22),(24+p*6-(p<0?1.8:0))*i,22*e,1.8*i),r.fillRect(f(u,22),(24+p*8.6-(p<0?1.8:0))*i,22*e,1.8*i)}const c=new Pr(n);return c.colorSpace=ui,c.anisotropy=8,c}function Vf(s,t,e,i,n){const r=document.createElement("canvas");r.width=s,r.height=t;const o=r.getContext("2d"),a=fp(s*31+t);dp(o,s,t,a,92);const l=s/e,c=t/i;o.fillStyle="rgba(40,40,40,0.35)";for(let f=5;f<e;f+=5)o.fillRect(f*l,0,1,t);for(let f=5;f<i;f+=5)o.fillRect(0,f*c,s,1);for(let f=0;f<e*i/900;f++)o.fillStyle=`rgba(20,18,15,${.1+a()*.2})`,o.beginPath(),o.ellipse(a()*s,a()*t,(1+a()*3)*l,(1+a()*2)*c,a()*3,0,Math.PI*2),o.fill();n(o,l,c);const h=new Pr(r);return h.colorSpace=ui,h.anisotropy=8,h.wrapS=h.wrapT=hn,h}function wl(s,t,e,i,n){const r=new qs(e,i,Math.max(1,Math.round(e/10)),Math.max(1,Math.round(i/10)));r.rotateX(-Math.PI/2);const o=r.attributes.position;for(let l=0;l<o.count;l++){const c=o.getX(l)+s,h=o.getZ(l)+t;o.setY(l,hp(c,h)+up)}r.computeVertexNormals(),r.computeBoundingSphere();const a=new Tt(r,n);return a.position.set(s,0,t),a}class gE{constructor(t){const e=g=>new wr({map:g,roughness:.88,metalness:0,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),i=e(mE()),n=e(Vf(1024,32,800,16,(g,m,d)=>{g.fillStyle="rgb(226,180,40)",g.fillRect(0,8*d-.15*d,800*m,.3*d+1),g.fillStyle="rgb(226,180,40)",g.fillRect(0,.4*d,800*m,.2*d+1),g.fillRect(0,15.4*d,800*m,.2*d+1)})),r=e(Vf(512,192,240,88,(g,m,d)=>{g.strokeStyle="rgb(226,180,40)",g.lineWidth=Math.max(1,.3*m);for(let M=0;M<6;M++){const x=(20+M*40)*m;g.beginPath(),g.moveTo(x,4*d),g.lineTo(x,60*d),g.moveTo(x-6*m,60*d),g.lineTo(x+6*m,60*d),g.stroke()}g.fillStyle="rgb(200,60,40)",g.fillRect(0,84*d,240*m,.6*d)})),o=new Ie(.45,8,6);this.lightMat=new $e({color:16777215});const a=bt.airbases.length/2,l=2*19+2*10+2*10;this.lights=new zi(o,this.lightMat,a*l),this.lights.instanceMatrix.setUsage(Yc),this.lights.userData.noShadow=!0;const c=new Ht,h=new St(1,.97,.88),f=new St(.2,1,.35),u=new St(1,.12,.08);let p=0;const _=(g,m,d)=>{c.makeTranslation(g,hp(g,m)+up+.4,m),this.lights.setMatrixAt(p,c),this.lights.setColorAt(p,d),p++};for(let g=0;g<bt.airbases.length;g+=2){const m=bt.airbases[g],d=bt.airbases[g+1],M=Te(m),x=_e(d),y=260*pt,C=12*pt;t.add(wl(M,x,y,C,i)),t.add(wl(M,_e(d+16),200*pt,4*pt,n)),t.add(wl(M,_e(d+31),60*pt,22*pt,r));for(let T=0;T<19;T++){const b=M-y/2+4+T*(y-8)/18;_(b,x-C/2-1,h),_(b,x+C/2+1,h)}for(let T=0;T<10;T++){const b=x-C/2+2+T*(C-4)/9;_(M-y/2-1.5,b,f),_(M+y/2+1.5,b,f),_(M-y/2-6,b,u),_(M+y/2+6,b,u)}}this.lights.count=p,t.add(this.lights),this.setNight(!1)}setNight(t){this.lightMat.color.setScalar(t?6:.9)}}const _E=new St("#03050f"),Wf=new St("#1a2246"),Fo=[58e-7,135e-7,331e-7],Oo=21e-6,Tl=8e3,bl=1200,Tc=14;function Xf(s){const t=Math.max(s,0),e=Math.acos(t)*180/Math.PI;return 1/(t+.15*Math.pow(Math.max(93.885-e,.001),-1.253))}const vE=`
  const vec3 BR = vec3(5.8e-6, 13.5e-6, 33.1e-6);
  const float BM = 21e-6;
  const float HR = 8000.0;
  const float HM = 1200.0;
  const float SUN_E = ${Tc.toFixed(1)};
  float airMass(float mu) {
    float m = max(mu, 0.0);
    float zen = degrees(acos(m));
    return 1.0 / (m + 0.15 * pow(max(93.885 - zen, 0.001), -1.253));
  }
  vec3 scatter(vec3 d, vec3 s, float alt) {
    float fr = exp(-alt / HR);
    float fm = exp(-alt / HM);
    float mv = airMass(d.y);
    float ms = airMass(s.y);
    vec3 tauV = BR * HR * fr * mv + BM * 1.1 * HM * fm * mv;
    vec3 tauS = BR * HR * fr * ms + BM * 1.1 * HM * fm * ms;
    vec3 sunT = exp(-tauS);                   // sunlight reaching the air: reddens when the sun is low
    float c = dot(d, s);
    float pR = 0.0596831 * (1.0 + c * c);     // Rayleigh phase
    const float g = 0.76;
    float pM = 0.0795775 * (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * c, 1.5); // Henyey-Greenstein
    vec3 b = BR + BM;
    vec3 inScatter = SUN_E * sunT * (BR * pR + BM * pM) / b * (1.0 - exp(-tauV));
    // a little multiple scattering so the shadowed sky is never black
    inScatter += SUN_E * 0.012 * vec3(0.35, 0.5, 0.8) * (1.0 - exp(-tauV)) * (0.4 + 0.6 * s.y);
    return inScatter;
  }`;class ME{constructor(){this.fog=new Qc(12572398,16e3,42e3),this.sunDir=new A(.55,.62,.35).normalize(),this.day=new St,this.tmp=new St,this.lastAlt=-1,this.mat=new ge({side:ei,depthWrite:!1,fog:!1,uniforms:{uSunDir:{value:this.sunDir},uAlt:{value:0},uNight:{value:0},uNightZenith:{value:_E},uNightHorizon:{value:Wf}},vertexShader:`
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,fragmentShader:`
        uniform vec3 uSunDir;
        uniform float uAlt;
        uniform float uNight;
        uniform vec3 uNightZenith;
        uniform vec3 uNightHorizon;
        varying vec3 vDir;
        ${vE}
        float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
        void main() {
          vec3 d = normalize(vDir);
          vec3 s = normalize(uSunDir);
          vec3 dv = normalize(vec3(d.x, max(d.y, 0.0), d.z)); // below the horizon: the horizon haze
          vec3 day = scatter(dv, s, uAlt);
          // the sun disk (dimmed by the air it shines through) and its glare
          float mu = max(dot(d, s), 0.0);
          float ms = airMass(s.y);
          vec3 sunT = exp(-(BR * HR * exp(-uAlt / HR) * ms + BM * 1.1 * HM * exp(-uAlt / HM) * ms));
          day += sunT * (smoothstep(0.99955, 0.99975, mu) * 60.0 + pow(mu, 800.0) * 2.0) * step(0.0, d.y + 0.02);
          // night: navy gradient, stars, a pale moon where the sun was
          float t = clamp(d.y, 0.0, 1.0);
          vec3 night = mix(uNightHorizon, uNightZenith, pow(t, 0.5));
          if (d.y > 0.0) {
            vec3 cell = floor(d * 420.0);
            float st = step(0.9975, hash(cell));
            night += vec3(0.8, 0.85, 1.0) * st * (0.4 + 0.6 * hash(cell + 3.1)) * smoothstep(0.0, 0.15, d.y);
            night += vec3(0.75, 0.8, 0.9) * smoothstep(0.9990, 0.9994, mu) * 1.5;
          }
          gl_FragColor = vec4(mix(day, night, uNight), 1.0);
          #include <colorspace_fragment>
        }`}),this.mesh=new Tt(new Ie(5e4,48,24),this.mat),this.mesh.renderOrder=-1,this.mesh.frustumCulled=!1}horizonColor(t,e){const i=this.sunDir,n=Math.exp(-t/Tl),r=Math.exp(-t/bl),o=Xf(.03),a=Xf(i.y),l=.0596831,c=.76,h=.0795775*(1-c*c)/Math.pow(1+c*c,1.5),f=[0,0,0];for(let u=0;u<3;u++){const p=Fo[u]*Tl*n*o+Oo*1.1*bl*r*o,_=Fo[u]*Tl*n*a+Oo*1.1*bl*r*a,g=Math.exp(-_),m=Fo[u]+Oo;f[u]=Tc*g*(Fo[u]*l+Oo*h)/m*(1-Math.exp(-p)),f[u]+=Tc*.012*[.35,.5,.8][u]*(1-Math.exp(-p))*(.4+.6*i.y)}return e.setRGB(f[0],f[1],f[2])}update(t,e,i,n){const r=Math.max(0,e);this.mat.uniforms.uAlt.value=r,this.mat.uniforms.uNight.value=n,(Math.abs(r-this.lastAlt)>50||n!==this.mat.userData.night)&&(this.lastAlt=r,this.mat.userData.night=n,this.horizonColor(r,this.day),this.fog.color.copy(this.day).lerp(this.tmp.copy(Wf),n)),this.mesh.position.set(t,e,i)}}const Le=new Ae,Al=new St;function xE(s){let t=s;return()=>(t=t*16807%2147483647,t/2147483647)}function SE(s){const t=xE(99),e=new Qe(1,1,1);e.translate(0,.5,0);let i=0;for(const u of bt.cities)i+=u.blocks.length;const n=new zi(e,new Me({color:16777215}),i);let r=0;for(const u of bt.cities)for(const p of u.blocks){const _=p.x+p.w/2,g=p.y+p.h/2,m=Math.hypot(_-u.x,g-u.y)/u.r,d=14+Math.pow(1-m,2)*110*(.4+.6*t()),M=Te(_),x=_e(g);Le.position.set(M,ne(M,x)-2,x),Le.rotation.set(0,0,0),Le.scale.set(p.w*pt*.8,d,p.h*pt*.8),Le.updateMatrix(),n.setMatrixAt(r,Le.matrix);const y=p.tone/255;n.setColorAt(r,Al.setRGB(y,y,y+6/255,"srgb")),r++}s.add(n);let o=0;for(const u of bt.villages)o+=u.houses.length/3;const a=new zi(e,new Me({color:16777215}),o);r=0;for(const u of bt.villages)for(let p=0;p<u.houses.length;p+=3){const _=Te(u.houses[p]),g=_e(u.houses[p+1]);Le.position.set(_,ne(_,g)-1,g),Le.rotation.set(0,t()*Math.PI,0),Le.scale.set(9+t()*6,6+t()*4,8+t()*5),Le.updateMatrix(),a.setMatrixAt(r,Le.matrix);const m=$d[u.houses[p+2]];a.setColorAt(r,Al.setRGB(m[0]/255,m[1]/255,m[2]/255,"srgb")),r++}s.add(a);let l=0;for(const u of bt.forests)l+=u.trees.length/3;const c=new Lr(1,2.6,6);c.translate(0,1.3,0);const h=new zi(c,new Me({color:16777215}),l);r=0;for(const u of bt.forests)for(let p=0;p<u.trees.length;p+=3){const _=Te(u.trees[p]),g=_e(u.trees[p+1]),m=u.trees[p+2]*1.4;Le.position.set(_,ne(_,g)-1,g),Le.rotation.set(0,0,0),Le.scale.set(m,m*1.2,m),Le.updateMatrix(),h.setMatrixAt(r,Le.matrix),h.setColorAt(r,Al.setRGB(40/255,(80+t()*16)/255,34/255,"srgb")),r++}s.add(h);const f=new zi(e,new Me({color:7238768}),bt.airbases.length/2*4);r=0;for(let u=0;u<bt.airbases.length;u+=2)for(let p=0;p<4;p++){const _=Te(bt.airbases[u]-24+p*14+4.5),g=_e(bt.airbases[u+1]+26+4.5);Le.position.set(_,ne(_,g)-1,g),Le.rotation.set(0,0,0),Le.scale.set(9*pt*.9,11,9*pt*.9),Le.updateMatrix(),f.setMatrixAt(r++,Le.matrix)}s.add(f);for(const u of[n,a,h,f])u.frustumCulled=!1,u.instanceMatrix.needsUpdate=!0,u.instanceColor&&(u.instanceColor.needsUpdate=!0)}const qf=5,bc=Te(fx),Ac=_e(dx),pp=Math.PI/2,rh=document.getElementById("app"),Fr=navigator.maxTouchPoints>0&&Math.min(screen.width,screen.height)<900||(navigator.hardwareConcurrency||8)<=4,ki=new DM({antialias:!Fr,powerPreference:"high-performance"});ki.setPixelRatio(Math.min(window.devicePixelRatio,Fr?1.25:2));ki.setSize(window.innerWidth,window.innerHeight);rh.appendChild(ki.domElement);ki.toneMapping=zc;ki.toneMappingExposure=1.15;ki.outputColorSpace=ui;ki.shadowMap.enabled=!0;const ve=new Ud;ve.background=new St(8893670);const rs=new ME;ve.fog=rs.fog;ve.add(rs.mesh);const Rc=new BM(14674687,4872762,1.1);ve.add(Rc);const Wn=new Od(16774368,2.2);Wn.position.copy(rs.sunDir);ve.environment=YM(ki,rs.sunDir);const Cc=lE();Fr&&cE(256);const os=new dE(Cc.day,Cc.night);os.material.uniforms.uSunDir.value.copy(rs.sunDir);ve.add(os.mesh);SE(ve);const yE=new gE(ve),Pc=new q1;ve.add(Pc.mesh);const mp=new j1(ve),gp=new sE(ve),Ne=new cx(window.innerWidth/window.innerHeight),An=new Ty(ki,ve,Ne.camera,Fr),ma=new ex(ve,Ne.camera,rs.sunDir,Fr?1024:2048),Kt=new RS(rh),me=new lp(rh),EE=new sx,q=new ty,He=new OS(ve),wE=()=>He.jets[He.active].model;let Or=!0;const Xi=new LS,je=new Oy,Pn=new sy;ve.add(Pn.mesh);const TE=4.5,Rl=[0,1].map(()=>{const s=new zd({points:70,spacing:5,life:40,width:.4,widthOld:2.6,color:[1,1,1],alpha:.45,minAngular:9e-4});return ve.add(s.mesh),s}),Yf=new A,on=new A,fr=new A,Cl=new A,Di={blur:0,lines:0,time:0,heat:0,heatPos:new lt,heatDir:new lt,heatWidth:.02};function bE(s,t){Di.time=aa;const e=t?Math.min(1,Math.max(0,(q.mach-.85)/1.3)):0,i=t&&q.afterburner?1:0;if(Di.blur+=(e*.55+i*.25-Di.blur)*.08,Di.lines+=(Math.min(1,Math.max(0,(q.mach-1.05)/.9))*(t?1:0)*.8+i*.3-Di.lines)*.08,Di.heat=0,s.group.visible){const n=Ne.camera;s.group.localToWorld(on.set(0,0,7));const r=on.distanceTo(n.position);s.group.localToWorld(fr.set(0,0,7+(q.afterburner?9:5))),s.group.localToWorld(Cl.set(0,.9,7)),on.project(n),fr.project(n),Cl.project(n),on.z<1&&fr.z<1&&r<220&&(Di.heatPos.set(on.x*.5+.5,on.y*.5+.5),Di.heatDir.set((fr.x-on.x)*.5,(fr.y-on.y)*.5),Di.heatWidth=Math.max(.004,Math.abs(Cl.y-on.y)*.5*1.3),Di.heat=(.35+.65*q.throttle)*(q.afterburner?1.4:1)*(1-r/220))}An.setMotion(Di)}const ln=new Uy;ve.add(ln.mesh);const ns=new oy(ve),Os=new cy(ve),ee=new M1(ve);ee.onBlast=(s,t,e,i,n)=>ns.spawn(s,t,e,i,n);const _p=(s,t,e,i,n)=>ns.spawn(s,t,e,i,n),vp=s=>s.distanceTo(Ne.camera.position),Ei=new C1(ve,ee,{say:s=>me.say(s),blast:_p,sound:(s,t)=>Ii.play(s,t?vp(t):0),smoke:(s,t,e,i,n,r,o)=>ln.emit(s,t,e,i,n,r,o)});let jo=!1,Lc=!1;const yn=os.material.uniforms,Wi=()=>jo||Lc;function oh(){Wi()?(Wn.color.set(8425664),Wn.intensity=.3,Rc.intensity=.18,yn.uSunColor.value.setRGB(.035,.05,.08),yn.uSkyLight.value.setRGB(.03,.045,.07),yn.uGroundLight.value.setRGB(.01,.012,.018),yn.uNightMix.value=1):(Wn.color.set(16774368),Wn.intensity=2.2,Rc.intensity=1.1,yn.uSunColor.value.setRGB(1,.95,.85).multiplyScalar(1.6),yn.uSkyLight.value.setRGB(.55,.62,.75),yn.uGroundLight.value.setRGB(.2,.22,.16),yn.uNightMix.value=0),ve.environmentIntensity=Wi()?.12:1,ma.setSun(Wn.color,Wn.intensity),yE.setNight(Wi()),An.setNight(Wi())}let ce="start",Dc=0,aa=0,Je=0,Ic=0;const zr=new A,Br=new Ai,En=new A,zo=new Ai;let Zn=!0;const le=new Py;ve.add(le.group);const De=new A;let Uc=0;const AE=90,RE=240,$f=3200,CE=720,xr=new A,dr=new A;let Xn=0;const ah=document.getElementById("down"),PE=document.getElementById("down-title"),Nc=document.getElementById("down-hint"),LE=document.getElementById("fps"),DE=new k1(()=>Kt.queueStart()),kr=new H1(document.body,Cc.day.image,s=>{ce==="flying"&&xp(s)},He);kr.show(!1);const Ur=new SS({jet:q,threats:ee,start:{x:bc,z:Ac,heading:pp},setDemoNight:s=>{Lc!==s&&(Lc=s,oh())},clearFx:()=>{ln.clear(),Os.clear(),ns.clear(),Pn.clear()},snapChase:()=>Ne.snap(q.pos,q.quat),snapTerrain:(s,t)=>os.snapTo(s,t)});function Mp(){q.reset(bc,Ac,pp),zr.copy(q.pos),Br.copy(q.quat),ee.reset(Date.now()&2147483647|1),ln.clear(),Os.clear(),ns.clear(),Pn.clear(),Ei.reset(),He.reset(bc,Ac),Xi.stop(),je.sel=null,me.clearLog(),Zn=!0,le.hide(),Or=!0,os.snapTo(q.pos.x,q.pos.z),Ne.snap(q.pos,q.quat)}function IE(){Ur.end(),DE.hide(),Mp(),ce="flying",ah.style.display="none",me.show(!0),kr.show(!0),Kt.setTouchVisible(!0),Qd(es)}function Kf(s,t,e){ce="down",Dc=0,q.alive=!1,He.downActive(),yS(),Xi.stop(),Xn=Math.atan2(q.vel.z,q.vel.x)+Math.PI*.75,xr.copy(q.pos),t?(ns.spawn(q.pos.x,q.pos.y,q.pos.z,60,2.2),Ii.play("explode"),Kt.rumble(1,.8,800),Zn=!1,Or=!1,Ei.burn(q.pos.x,q.pos.z),De.copy(q.pos),Nc.textContent=e):(q.crashing=!0,le.eject(q.pos,q.vel),Ii.play("ignite"),Kt.rumble(.8,.4,450),De.copy(q.pos),Nc.textContent=`${e}  -  PILOT EJECTED`),PE.textContent=s,ah.style.display="block",me.show(!1),kr.show(!1),Kt.setTouchVisible(!1)}function Zf(){ce="arriving",Uc=0,He.active=He.nextAlive();const s=Math.random()*Math.PI*2,t=De.x+Math.cos(s)*$f,e=De.z+Math.sin(s)*$f,i=Math.max(ne(t,e),ne(De.x,De.z))+1500;q.reset(t,e,Math.atan2(De.x-t,-(De.z-e))),q.pos.y=i,zr.copy(q.pos),Br.copy(q.quat),Zn=!0,Or=!0,Pn.clear();for(const n of ee.missiles.items)n.hide();Ei.rearm(),Nc.textContent=le.active?"PILOT LANDED SAFELY  -  NEW JET INBOUND":"NEW JET INBOUND"}function UE(){ce="flying",ah.style.display="none",me.show(!0),kr.show(!0),me.say(`${He.callsign} - YOU HAVE CONTROL`),Qd(es),Kt.setTouchVisible(!0),Ne.snap(q.pos,q.quat)}function xp(s){if(s===He.active||!He.jets[s].alive)return;He.switchTo(s,q.pos,q.headingDeg*Math.PI/180);const t=He.jets[s];q.reset(t.pos.x,t.pos.z,t.heading),q.pos.y=t.pos.y,zr.copy(q.pos),Br.copy(q.quat),Pn.clear(),Xi.stop(),Ei.rearm(),os.snapTo(q.pos.x,q.pos.z),Ne.snap(q.pos,q.quat),Ii.play("switch"),me.say(`JET: ${t.callsign}`)}function NE(s,t){const e=ee.cm,i=t?` from ${t}`:"";if(s==="IR")return`heat-seeking missile${i}  -  ${e.flareCd===0?"flares (C) were ready":"flares were reloading: break hard late"}`;if(s==="RADAR"){const n=[e.chaffCd===0?"chaff (K)":"",e.ecmCd===0?"ECM (X)":""].filter(Boolean).join(" and ");return`radar-guided missile${i}  -  ${n?`${n} ${n.includes(" and ")?"were":"was"} ready`:"notch it: fly 90 deg across it and dive"}`}return`unguided rocket${i}  -  turning away escapes it`}function FE(){Je++,Kt.update(Nt);const s=Kt.consumeStart(),t=Kt.consumeFlare(),e=Kt.consumeEcm(),i=Kt.consume("chaff"),n=Kt.consume("bomb"),r=Kt.consume("agm"),o=Kt.consume("aam"),a=Kt.consume("aero"),l=Kt.consume("sam"),c=Kt.consume("nextJet"),h=Kt.consume("prevJet"),f=Kt.consume("p2Left"),u=Kt.consume("p2Right"),p=Kt.consume("p2Guided"),_=Kt.consume("p2Unguided"),g=Kt.consume("levelUp"),m=Kt.consume("levelDown");if(Kt.consume("twoPlayers")&&(je.on=!je.on,Kt.twoPlayers=je.on,hx(je.on),je.sel=null,me.say(je.on?"2 PLAYERS: PLAYER 2 COMMANDS THE LAUNCHERS":"1 PLAYER")),Kt.consumeNight()&&(jo=!jo,oh(),ce==="flying"&&me.say(jo?"NIGHT VIEW":"DAY VIEW")),mp.step(q.pos.x,q.pos.z,_p),He.step(q.pos.x,q.pos.z),gp.step(),ce==="start"){if(s){IE();return}Ur.step(),q.step(Nt,null),Pn.record(q.pos,Je),ee.step(Ur.tracking?q:null,!1)}else{ce==="down"?(Dc++,le.active?(le.step(ne(le.pos.x,le.pos.z)),le.landed&&De.copy(le.pos),le.landed&&le.landedFor>=AE&&!Zn&&Zf()):Dc>=RE&&Zf()):ce==="flying"&&le.active?(le.step(ne(le.pos.x,le.pos.z)),le.landedFor>600&&le.hide()):ce==="arriving"&&(Uc++,le.step(ne(le.pos.x,le.pos.z)),(Math.hypot(q.pos.x-De.x,q.pos.z-De.z)<500||Uc>=CE)&&UE()),zr.copy(q.pos),Br.copy(q.quat);const d=ce==="flying";if(Zn){if(q.crashing)q.stepCrash(Nt);else{const x=d&&Xi.active&&Xi.control(q);if(q.step(Nt,d?x?Xi.stick:Kt:null),x&&Je%2===0){ko.crossVectors(q.nose,q.bodyUp).normalize();for(let y=0;y<3;y++){const C=(y-1)*4,T=CS[y];ln.emitRGB(q.pos.x+ko.x*C-q.nose.x*12,q.pos.y+ko.y*C-q.nose.y*12,q.pos.z+ko.z*C-q.nose.z*12,20,.6,9,T[0],T[1],T[2])}}}const M=ne(q.pos.x,q.pos.z);q.pos.y<=M+1.5&&(q.pos.y=M+1.5,d?Kf("CRASHED INTO THE GROUND",!0,"watch the height above ground - the PULL UP warning comes at 3,000 ft"):(ns.spawn(q.pos.x,q.pos.y,q.pos.z,70,2.4),Ii.play("explode",vp(q.pos)),Ei.burn(q.pos.x,q.pos.z),Zn=!1,Or=!1)),q.crashing&&Zn&&ln.emit(q.pos.x,q.pos.y,q.pos.z,4,3,14,.15),(d||ce==="arriving")&&Pn.record(q.pos,Je)}if(d){const M=ee.cm;if(t&&(M.fireFlares(q.pos,q.vel)?(me.say("FLARES"),Ii.play("flare"),Kt.rumble(.1,.45,90)):me.say(`FLARES RELOADING ${(M.flareCd/60).toFixed(1)} s`)),i&&(M.fireChaff(q.pos,q.vel)?(me.say("CHAFF"),Ii.play("flare"),Kt.rumble(.1,.45,90)):me.say(`CHAFF RELOADING ${(M.chaffCd/60).toFixed(1)} s`)),a&&!Xi.active&&(me.say(Xi.start(q)),Ii.play("switch")),l){const x=ee.nearestArmed(q.pos.x,q.pos.z,1e9);x&&ee.launch(x,q)?me.say(`${x.name} LAUNCH -> ${He.callsign}`):me.say("NO SAM RESERVE LEFT")}if((c||h)&&xp(He.nextAlive(h?-1:1)),(g||m)&&(Mx(es+(g?1:-1)),me.say(`LEVEL ${es}`)),je.on&&((f||u)&&je.pick(u?1:-1,q.pos,ee),(p||_)&&me.say(je.fire(p,q,ee))),n&&Ei.dropBomb(q.pos,q.vel),r&&Ei.fireMissile("AGM",q.pos,q.vel),o&&Ei.fireMissile("AAM",q.pos,q.vel),(n||r||o)&&Kt.rumble(.3,.5,120),e){const x=M.fireEcm(q.pos,ee.missiles.items,ee.rand);x<0?me.say(`ECM RELOADING ${(M.ecmCd/60).toFixed(1)} s`):(me.say(x?`ECM - ${x} LOCK BROKEN`:"ECM"),Ii.play("ignite"))}}ee.step(d?q:null,d),je.step(d?q.pos:null,ee),Ei.step(),Ic+=ee.launchedThisFrame,d&&ee.launchedThisFrame>0&&(Ii.play("ignite",2e3),Kt.rumble(.25,.6,220)),ee.decoyedThisFrame>0&&me.say(`FLARES - ${ee.decoyedThisFrame} SAM DECOYED`),d&&ee.hitThisFrame&&(Ii.play("explode"),Kt.rumble(1,1,700),q.hp=Math.max(0,q.hp-Ix),q.hp===0&&Kf("SHOT DOWN BY A SAM",!1,NE(ee.lastHitSeeker,ee.lastHitLauncher)))}if(Je%2===0){const d=ee.missiles.items;for(let C=0;C<d.length;C++){const T=d[C];T.active&&Os.track(T,T.guided?"guided":"unguided",Je)}const M=Ei.items.items;for(let C=0;C<M.length;C++){const T=M[C];T.active&&T.kind!=="BOMB"&&Os.track(T,T.kind,Je)}Os.release();const x=ee.cm.flares.items;for(let C=0;C<x.length;C++){const T=x[C];T.active&&T.heat>.2&&Je%4===0&&ce!=="start"&&ln.emit(T.pos.x,T.pos.y,T.pos.z,2.5,1.5,5,.95)}const y=ee.cm.chaff.items;for(let C=0;C<y.length;C++){const T=y[C];T.active&&Je%6===0&&ln.emit(T.pos.x,T.pos.y,T.pos.z,3,6,22,.7)}}ln.update(Nt),ns.update(Nt),aa+=Nt}let jf=performance.now(),pr=0,Pl=0,Bo=0;function Sp(s){requestAnimationFrame(Sp);const t=Math.min(.25,(s-jf)/1e3);jf=s,pr+=t;let e=0;for(;pr>=Nt&&e<qf;)FE(),pr-=Nt,e++;e===qf&&(pr=0);const i=pr/Nt;ce==="start"?(En.copy(q.pos),zo.copy(q.quat)):(En.copy(zr).lerp(q.pos,i),zo.copy(Br).slerp(q.quat,i));const n=wE();n.group.visible=Or,n.group.position.copy(En),n.group.quaternion.copy(zo),n.group.scale.setScalar(ce==="arriving"?Math.max(1,En.distanceTo(Ne.camera.position)/350):1),n.setFlame(q.throttle,q.afterburner,aa);const r=ce==="flying";if(n.setControls(r?Kt.roll:0,r?Kt.pitch:0,r?Kt.yaw:0,t),r&&q.gLoad>TE&&n.group.visible)for(let l=0;l<2;l++){const c=ra.WINGTIPS[l];n.group.localToWorld(Yf.set(c[0],c[1],c[2])),Rl[l].record(Yf,Je)}else if(!r)for(const l of Rl)l.clear();n.setNight(Wi(),Je),He.sync(Wi(),Je),gp.sync(Je,Wi()),ee.syncMeshes(Wi(),Ne.camera.position),Ei.sync(Ne.camera.position),mp.sync(Wi()),le.sync(),ce==="start"&&Ur.camera(Ne.camera,t)||(ce==="down"||ce==="arriving"?OE(t):Ne.update(t,En,zo,q.afterburner));const o=Ne.camera.position,a=Wi()?1:0;rs.update(o.x,o.y,o.z,a),Pc.update(aa,a),Pc.mesh.visible=ce!=="start",Pn.update(o,En,Je,a),Os.update(o,Je,a);for(const l of Rl)l.update(o,Je,a?.35:1);if(os.follow(ce==="start"?o.x:En.x,ce==="start"?o.z:En.z),ce==="flying"&&(me.update(q,ne(q.pos.x,q.pos.z),Ne.camera,ee,Ei,window.innerWidth,window.innerHeight),me.setTag(`${He.callsign}   LEVEL ${es}${je.on?"   2 PLAYERS":""}${Xi.active?"   "+Xi.kind:""}`),me.p2Mark(je.on?je.sel:null,je.on?je.status(q.pos):"",Ne.camera,window.innerWidth,window.innerHeight),kr.update(ee,He,q.pos.x,q.pos.z,q.headingDeg*Math.PI/180)),EE.update(ce==="flying"?ee.painting:0,ce==="flying"?lp.lockCount(ee):0,Ic,ce==="flying"),Ic=0,ma.update(ve),bE(n,r),An.render(),Pl++,Bo+=t,Bo>=.5){const l=Pl/Bo;LE.textContent=ce==="start"?"":`${Math.round(l)} FPS`,zE(l),Pl=0,Bo=0}}const Jf=new A,ko=new A,Qf=new A;function OE(s){const t=Ne.camera,e=1-Math.exp(-3*s);ce==="arriving"?(Jf.set(q.pos.x-De.x,0,q.pos.z-De.z).normalize(),dr.copy(De).addScaledVector(Jf,-24),dr.y=De.y+4,t.position.lerp(dr,e),Qf.copy(De).lerp(q.pos,.55),xr.lerp(Qf,1-Math.exp(-6*s))):le.active?(Xn+=s*.12,t.position.set(le.pos.x+Math.cos(Xn)*40,le.pos.y+7,le.pos.z+Math.sin(Xn)*40),xr.set(le.pos.x,le.pos.y+4,le.pos.z)):(Xn+=s*.1,dr.set(De.x+Math.cos(Xn)*380,De.y+160,De.z+Math.sin(Xn)*380),t.position.lerp(dr,e),xr.lerp(De,e));const i=ne(t.position.x,t.position.z)+3;t.position.y<i&&(t.position.y=i),t.up.set(0,1,0),t.lookAt(xr)}let Ho=0,mr=0;function zE(s){document.hidden||(Ho=s<40?Ho+1:0,!(Ho<4||mr>=4)&&(Ho=0,mr++,mr===1?(ki.setPixelRatio(1),An.setPixelRatio(1),An.resize(window.innerWidth,window.innerHeight)):mr===2?An.setAO(!1):mr===3?An.setBloom(!1):ma.setEnabled(!1)))}window.addEventListener("resize",()=>{ki.setSize(window.innerWidth,window.innerHeight),An.resize(window.innerWidth,window.innerHeight),Ne.resize(window.innerWidth/window.innerHeight),ma.resize(Ne.camera)});oh();Mp();me.show(!1);Ur.begin();requestAnimationFrame(Sp);"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});
