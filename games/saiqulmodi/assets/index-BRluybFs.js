(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function e(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=e(n);fetch(n.href,a)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Qh="169",L0=0,Hu=1,D0=2,Yp=1,I0=2,wn=3,Jn=0,di=1,Ge=2,ti=0,ha=1,nn=2,Gu=3,Vu=4,qp=5,Qi=100,U0=101,N0=102,F0=103,O0=104,Qa=200,z0=201,B0=202,k0=203,Hc=204,Gc=205,Vc=206,H0=207,Wc=208,G0=209,V0=210,W0=211,X0=212,Y0=213,q0=214,Xc=0,Yc=1,qc=2,ma=3,$c=4,Kc=5,Zc=6,Jc=7,tu=0,$0=1,K0=2,Zn=0,$p=1,Kp=2,Zp=3,eu=4,Z0=5,Jp=6,jp=7,Qp=300,ga=301,va=302,jc=303,Qc=304,cl=306,Pn=1e3,gs=1001,th=1002,fi=1003,J0=1004,Cr=1005,tn=1006,wl=1007,$n=1008,un=1009,tm=1010,em=1011,pr=1012,iu=1013,Ss=1014,cn=1015,sn=1016,nu=1017,su=1018,ws=1020,im=35902,nm=1021,sm=1022,Hi=1023,am=1024,rm=1025,ua=1026,Es=1027,au=1028,ru=1029,om=1030,ou=1031,lu=1033,zo=33776,Bo=33777,ko=33778,Ho=33779,eh=35840,ih=35841,nh=35842,sh=35843,ah=36196,rh=37492,oh=37496,lh=37808,ch=37809,hh=37810,uh=37811,fh=37812,dh=37813,ph=37814,mh=37815,gh=37816,vh=37817,_h=37818,Mh=37819,xh=37820,yh=37821,Go=36492,Sh=36494,wh=36495,lm=36283,Eh=36284,bh=36285,Th=36286,j0=3200,Q0=3201,hl=0,tg=1,qn="",wi="srgb",Qn="srgb-linear",cu="display-p3",ul="display-p3-linear",Zo="linear",_e="srgb",Jo="rec709",jo="p3",Is=7680,Wu=519,eg=512,ig=513,ng=514,cm=515,sg=516,ag=517,rg=518,og=519,Ah=35044,Rn=35048,Xu="300 es",Tn=2e3,Qo=2001;class Ea{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const i=this._listeners;return i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const n=this._listeners[t];if(n!==void 0){const a=n.indexOf(e);a!==-1&&n.splice(a,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const i=this._listeners[t.type];if(i!==void 0){t.target=this;const n=i.slice(0);for(let a=0,r=n.length;a<r;a++)n[a].call(this,t);t.target=null}}}const ni=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Yu=1234567;const ar=Math.PI/180,mr=180/Math.PI;function Cn(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(ni[s&255]+ni[s>>8&255]+ni[s>>16&255]+ni[s>>24&255]+"-"+ni[t&255]+ni[t>>8&255]+"-"+ni[t>>16&15|64]+ni[t>>24&255]+"-"+ni[e&63|128]+ni[e>>8&255]+"-"+ni[e>>16&255]+ni[e>>24&255]+ni[i&255]+ni[i>>8&255]+ni[i>>16&255]+ni[i>>24&255]).toLowerCase()}function ei(s,t,e){return Math.max(t,Math.min(e,s))}function hu(s,t){return(s%t+t)%t}function lg(s,t,e,i,n){return i+(s-t)*(n-i)/(e-t)}function cg(s,t,e){return s!==t?(e-s)/(t-s):0}function rr(s,t,e){return(1-e)*s+e*t}function hg(s,t,e,i){return rr(s,t,1-Math.exp(-e*i))}function ug(s,t=1){return t-Math.abs(hu(s,t*2)-t)}function fg(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function dg(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function pg(s,t){return s+Math.floor(Math.random()*(t-s+1))}function mg(s,t){return s+Math.random()*(t-s)}function gg(s){return s*(.5-Math.random())}function vg(s){s!==void 0&&(Yu=s);let t=Yu+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function _g(s){return s*ar}function Mg(s){return s*mr}function xg(s){return(s&s-1)===0&&s!==0}function yg(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Sg(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function wg(s,t,e,i,n){const a=Math.cos,r=Math.sin,o=a(e/2),l=r(e/2),c=a((t+i)/2),h=r((t+i)/2),f=a((t-i)/2),u=r((t-i)/2),d=a((i-t)/2),g=r((i-t)/2);switch(n){case"XYX":s.set(o*h,l*f,l*u,o*c);break;case"YZY":s.set(l*u,o*h,l*f,o*c);break;case"ZXZ":s.set(l*f,l*u,o*h,o*c);break;case"XZX":s.set(o*h,l*g,l*d,o*c);break;case"YXY":s.set(l*d,o*h,l*g,o*c);break;case"ZYZ":s.set(l*g,l*d,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function en(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function pe(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Eg={DEG2RAD:ar,RAD2DEG:mr,generateUUID:Cn,clamp:ei,euclideanModulo:hu,mapLinear:lg,inverseLerp:cg,lerp:rr,damp:hg,pingpong:ug,smoothstep:fg,smootherstep:dg,randInt:pg,randFloat:mg,randFloatSpread:gg,seededRandom:vg,degToRad:_g,radToDeg:Mg,isPowerOfTwo:xg,ceilPowerOfTwo:yg,floorPowerOfTwo:Sg,setQuaternionFromProperEuler:wg,normalize:pe,denormalize:en};class at{constructor(t=0,e=0){at.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(ei(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const i=Math.cos(e),n=Math.sin(e),a=this.x-t.x,r=this.y-t.y;return this.x=a*i-r*n+t.x,this.y=a*n+r*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Wt{constructor(t,e,i,n,a,r,o,l,c){Wt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,a,r,o,l,c)}set(t,e,i,n,a,r,o,l,c){const h=this.elements;return h[0]=t,h[1]=n,h[2]=o,h[3]=e,h[4]=a,h[5]=l,h[6]=i,h[7]=r,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,n=e.elements,a=this.elements,r=i[0],o=i[3],l=i[6],c=i[1],h=i[4],f=i[7],u=i[2],d=i[5],g=i[8],v=n[0],m=n[3],p=n[6],M=n[1],y=n[4],S=n[7],C=n[2],w=n[5],E=n[8];return a[0]=r*v+o*M+l*C,a[3]=r*m+o*y+l*w,a[6]=r*p+o*S+l*E,a[1]=c*v+h*M+f*C,a[4]=c*m+h*y+f*w,a[7]=c*p+h*S+f*E,a[2]=u*v+d*M+g*C,a[5]=u*m+d*y+g*w,a[8]=u*p+d*S+g*E,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[1],n=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*r*h-e*o*c-i*a*h+i*o*l+n*a*c-n*r*l}invert(){const t=this.elements,e=t[0],i=t[1],n=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8],f=h*r-o*c,u=o*l-h*a,d=c*a-r*l,g=e*f+i*u+n*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return t[0]=f*v,t[1]=(n*c-h*i)*v,t[2]=(o*i-n*r)*v,t[3]=u*v,t[4]=(h*e-n*l)*v,t[5]=(n*a-o*e)*v,t[6]=d*v,t[7]=(i*l-c*e)*v,t[8]=(r*e-i*a)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,a,r,o){const l=Math.cos(a),c=Math.sin(a);return this.set(i*l,i*c,-i*(l*r+c*o)+r+t,-n*c,n*l,-n*(-c*r+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(El.makeScale(t,e)),this}rotate(t){return this.premultiply(El.makeRotation(-t)),this}translate(t,e){return this.premultiply(El.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const El=new Wt;function hm(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function tl(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function bg(){const s=tl("canvas");return s.style.display="block",s}const qu={};function Vo(s){s in qu||(qu[s]=!0,console.warn(s))}function Tg(s,t,e){return new Promise(function(i,n){function a(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(a,e);break;default:i()}}setTimeout(a,e)})}function Ag(s){const t=s.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Rg(s){const t=s.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const $u=new Wt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Ku=new Wt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ra={[Qn]:{transfer:Zo,primaries:Jo,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s,fromReference:s=>s},[wi]:{transfer:_e,primaries:Jo,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s.convertSRGBToLinear(),fromReference:s=>s.convertLinearToSRGB()},[ul]:{transfer:Zo,primaries:jo,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.applyMatrix3(Ku),fromReference:s=>s.applyMatrix3($u)},[cu]:{transfer:_e,primaries:jo,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.convertSRGBToLinear().applyMatrix3(Ku),fromReference:s=>s.applyMatrix3($u).convertLinearToSRGB()}},Cg=new Set([Qn,ul]),oe={enabled:!0,_workingColorSpace:Qn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(s){if(!Cg.has(s))throw new Error(`Unsupported working color space, "${s}".`);this._workingColorSpace=s},convert:function(s,t,e){if(this.enabled===!1||t===e||!t||!e)return s;const i=Ra[t].toReference,n=Ra[e].fromReference;return n(i(s))},fromWorkingColorSpace:function(s,t){return this.convert(s,this._workingColorSpace,t)},toWorkingColorSpace:function(s,t){return this.convert(s,t,this._workingColorSpace)},getPrimaries:function(s){return Ra[s].primaries},getTransfer:function(s){return s===qn?Zo:Ra[s].transfer},getLuminanceCoefficients:function(s,t=this._workingColorSpace){return s.fromArray(Ra[t].luminanceCoefficients)}};function fa(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function bl(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Us;class Pg{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Us===void 0&&(Us=tl("canvas")),Us.width=t.width,Us.height=t.height;const i=Us.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),e=Us}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=tl("canvas");e.width=t.width,e.height=t.height;const i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);const n=i.getImageData(0,0,t.width,t.height),a=n.data;for(let r=0;r<a.length;r++)a[r]=fa(a[r]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){const e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(fa(e[i]/255)*255):e[i]=fa(e[i]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Lg=0;class um{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Lg++}),this.uuid=Cn(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let a;if(Array.isArray(n)){a=[];for(let r=0,o=n.length;r<o;r++)n[r].isDataTexture?a.push(Tl(n[r].image)):a.push(Tl(n[r]))}else a=Tl(n);i.url=a}return e||(t.images[this.uuid]=i),i}}function Tl(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Pg.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Dg=0;class pi extends Ea{constructor(t=pi.DEFAULT_IMAGE,e=pi.DEFAULT_MAPPING,i=gs,n=gs,a=tn,r=$n,o=Hi,l=un,c=pi.DEFAULT_ANISOTROPY,h=qn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Dg++}),this.uuid=Cn(),this.name="",this.source=new um(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new at(0,0),this.repeat=new at(1,1),this.center=new at(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Wt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Qp)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Pn:t.x=t.x-Math.floor(t.x);break;case gs:t.x=t.x<0?0:1;break;case th:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Pn:t.y=t.y-Math.floor(t.y);break;case gs:t.y=t.y<0?0:1;break;case th:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}pi.DEFAULT_IMAGE=null;pi.DEFAULT_MAPPING=Qp;pi.DEFAULT_ANISOTROPY=1;class Pe{constructor(t=0,e=0,i=0,n=1){Pe.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,i=this.y,n=this.z,a=this.w,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*n+r[12]*a,this.y=r[1]*e+r[5]*i+r[9]*n+r[13]*a,this.z=r[2]*e+r[6]*i+r[10]*n+r[14]*a,this.w=r[3]*e+r[7]*i+r[11]*n+r[15]*a,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,a;const l=t.elements,c=l[0],h=l[4],f=l[8],u=l[1],d=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(f-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(c+1)/2,S=(d+1)/2,C=(p+1)/2,w=(h+u)/4,E=(f+v)/4,A=(g+m)/4;return y>S&&y>C?y<.01?(i=0,n=.707106781,a=.707106781):(i=Math.sqrt(y),n=w/i,a=E/i):S>C?S<.01?(i=.707106781,n=0,a=.707106781):(n=Math.sqrt(S),i=w/n,a=A/n):C<.01?(i=.707106781,n=.707106781,a=0):(a=Math.sqrt(C),i=E/a,n=A/a),this.set(i,n,a,e),this}let M=Math.sqrt((m-g)*(m-g)+(f-v)*(f-v)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(f-v)/M,this.z=(u-h)/M,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Ig extends Ea{constructor(t=1,e=1,i={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Pe(0,0,t,e),this.scissorTest=!1,this.viewport=new Pe(0,0,t,e);const n={width:t,height:e,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:tn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const a=new pi(n,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);a.flipY=!1,a.generateMipmaps=i.generateMipmaps,a.internalFormat=i.internalFormat,this.textures=[];const r=i.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,a=this.textures.length;n<a;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let i=0,n=t.textures.length;i<n;i++)this.textures[i]=t.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new um(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ii extends Ig{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}}class fm extends pi{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=fi,this.minFilter=fi,this.wrapR=gs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ug extends pi{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=fi,this.minFilter=fi,this.wrapR=gs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ei{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,a,r,o){let l=i[n+0],c=i[n+1],h=i[n+2],f=i[n+3];const u=a[r+0],d=a[r+1],g=a[r+2],v=a[r+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f;return}if(o===1){t[e+0]=u,t[e+1]=d,t[e+2]=g,t[e+3]=v;return}if(f!==v||l!==u||c!==d||h!==g){let m=1-o;const p=l*u+c*d+h*g+f*v,M=p>=0?1:-1,y=1-p*p;if(y>Number.EPSILON){const C=Math.sqrt(y),w=Math.atan2(C,p*M);m=Math.sin(m*w)/C,o=Math.sin(o*w)/C}const S=o*M;if(l=l*m+u*S,c=c*m+d*S,h=h*m+g*S,f=f*m+v*S,m===1-o){const C=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=C,c*=C,h*=C,f*=C}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f}static multiplyQuaternionsFlat(t,e,i,n,a,r){const o=i[n],l=i[n+1],c=i[n+2],h=i[n+3],f=a[r],u=a[r+1],d=a[r+2],g=a[r+3];return t[e]=o*g+h*f+l*d-c*u,t[e+1]=l*g+h*u+c*f-o*d,t[e+2]=c*g+h*d+o*u-l*f,t[e+3]=h*g-o*f-l*u-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const i=t._x,n=t._y,a=t._z,r=t._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(n/2),f=o(a/2),u=l(i/2),d=l(n/2),g=l(a/2);switch(r){case"XYZ":this._x=u*h*f+c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f-u*d*g;break;case"YXZ":this._x=u*h*f+c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f+u*d*g;break;case"ZXY":this._x=u*h*f-c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f-u*d*g;break;case"ZYX":this._x=u*h*f-c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f+u*d*g;break;case"YZX":this._x=u*h*f+c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f-u*d*g;break;case"XZY":this._x=u*h*f-c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f+u*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+r)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,i=e[0],n=e[4],a=e[8],r=e[1],o=e[5],l=e[9],c=e[2],h=e[6],f=e[10],u=i+o+f;if(u>0){const d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(h-l)*d,this._y=(a-c)*d,this._z=(r-n)*d}else if(i>o&&i>f){const d=2*Math.sqrt(1+i-o-f);this._w=(h-l)/d,this._x=.25*d,this._y=(n+r)/d,this._z=(a+c)/d}else if(o>f){const d=2*Math.sqrt(1+o-i-f);this._w=(a-c)/d,this._x=(n+r)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+f-i-o);this._w=(r-n)/d,this._x=(a+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<Number.EPSILON?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ei(this.dot(t),-1,1)))}rotateTowards(t,e){const i=this.angleTo(t);if(i===0)return this;const n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const i=t._x,n=t._y,a=t._z,r=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+r*o+n*c-a*l,this._y=n*h+r*l+a*o-i*c,this._z=a*h+r*c+i*l-n*o,this._w=r*h-i*o-n*l-a*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const i=this._x,n=this._y,a=this._z,r=this._w;let o=r*t._w+i*t._x+n*t._y+a*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=r,this._x=i,this._y=n,this._z=a,this;const l=1-o*o;if(l<=Number.EPSILON){const d=1-e;return this._w=d*r+e*this._w,this._x=d*i+e*this._x,this._y=d*n+e*this._y,this._z=d*a+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),f=Math.sin((1-e)*h)/c,u=Math.sin(e*h)/c;return this._w=r*f+this._w*u,this._x=i*f+this._x*u,this._y=n*f+this._y*u,this._z=a*f+this._z*u,this._onChangeCallback(),this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),a*Math.sin(e),a*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class T{constructor(t=0,e=0,i=0){T.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Zu.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Zu.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,i=this.y,n=this.z,a=t.elements;return this.x=a[0]*e+a[3]*i+a[6]*n,this.y=a[1]*e+a[4]*i+a[7]*n,this.z=a[2]*e+a[5]*i+a[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,i=this.y,n=this.z,a=t.elements,r=1/(a[3]*e+a[7]*i+a[11]*n+a[15]);return this.x=(a[0]*e+a[4]*i+a[8]*n+a[12])*r,this.y=(a[1]*e+a[5]*i+a[9]*n+a[13])*r,this.z=(a[2]*e+a[6]*i+a[10]*n+a[14])*r,this}applyQuaternion(t){const e=this.x,i=this.y,n=this.z,a=t.x,r=t.y,o=t.z,l=t.w,c=2*(r*n-o*i),h=2*(o*e-a*n),f=2*(a*i-r*e);return this.x=e+l*c+r*f-o*h,this.y=i+l*h+o*c-a*f,this.z=n+l*f+a*h-r*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,i=this.y,n=this.z,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*n,this.y=a[1]*e+a[5]*i+a[9]*n,this.z=a[2]*e+a[6]*i+a[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const i=t.x,n=t.y,a=t.z,r=e.x,o=e.y,l=e.z;return this.x=n*l-a*o,this.y=a*r-i*l,this.z=i*o-n*r,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Al.copy(this).projectOnVector(t),this.sub(Al)}reflect(t){return this.sub(Al.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(ei(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){const n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Al=new T,Zu=new Ei;class ts{constructor(t=new T(1/0,1/0,1/0),e=new T(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Yi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Yi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const i=Yi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const i=t.geometry;if(i!==void 0){const a=i.getAttribute("position");if(e===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)t.isMesh===!0?t.getVertexPosition(r,Yi):Yi.fromBufferAttribute(a,r),Yi.applyMatrix4(t.matrixWorld),this.expandByPoint(Yi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Pr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Pr.copy(i.boundingBox)),Pr.applyMatrix4(t.matrixWorld),this.union(Pr)}const n=t.children;for(let a=0,r=n.length;a<r;a++)this.expandByObject(n[a],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Yi),Yi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ca),Lr.subVectors(this.max,Ca),Ns.subVectors(t.a,Ca),Fs.subVectors(t.b,Ca),Os.subVectors(t.c,Ca),In.subVectors(Fs,Ns),Un.subVectors(Os,Fs),is.subVectors(Ns,Os);let e=[0,-In.z,In.y,0,-Un.z,Un.y,0,-is.z,is.y,In.z,0,-In.x,Un.z,0,-Un.x,is.z,0,-is.x,-In.y,In.x,0,-Un.y,Un.x,0,-is.y,is.x,0];return!Rl(e,Ns,Fs,Os,Lr)||(e=[1,0,0,0,1,0,0,0,1],!Rl(e,Ns,Fs,Os,Lr))?!1:(Dr.crossVectors(In,Un),e=[Dr.x,Dr.y,Dr.z],Rl(e,Ns,Fs,Os,Lr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Yi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Yi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(dn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),dn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),dn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),dn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),dn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),dn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),dn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),dn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(dn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const dn=[new T,new T,new T,new T,new T,new T,new T,new T],Yi=new T,Pr=new ts,Ns=new T,Fs=new T,Os=new T,In=new T,Un=new T,is=new T,Ca=new T,Lr=new T,Dr=new T,ns=new T;function Rl(s,t,e,i,n){for(let a=0,r=s.length-3;a<=r;a+=3){ns.fromArray(s,a);const o=n.x*Math.abs(ns.x)+n.y*Math.abs(ns.y)+n.z*Math.abs(ns.z),l=t.dot(ns),c=e.dot(ns),h=i.dot(ns);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Ng=new ts,Pa=new T,Cl=new T;class Rs{constructor(t=new T,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const i=this.center;e!==void 0?i.copy(e):Ng.setFromPoints(t).getCenter(i);let n=0;for(let a=0,r=t.length;a<r;a++)n=Math.max(n,i.distanceToSquared(t[a]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Pa.subVectors(t,this.center);const e=Pa.lengthSq();if(e>this.radius*this.radius){const i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(Pa,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Cl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Pa.copy(t.center).add(Cl)),this.expandByPoint(Pa.copy(t.center).sub(Cl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const pn=new T,Pl=new T,Ir=new T,Nn=new T,Ll=new T,Ur=new T,Dl=new T;class uu{constructor(t=new T,e=new T(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,pn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=pn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(pn.copy(this.origin).addScaledVector(this.direction,e),pn.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){Pl.copy(t).add(e).multiplyScalar(.5),Ir.copy(e).sub(t).normalize(),Nn.copy(this.origin).sub(Pl);const a=t.distanceTo(e)*.5,r=-this.direction.dot(Ir),o=Nn.dot(this.direction),l=-Nn.dot(Ir),c=Nn.lengthSq(),h=Math.abs(1-r*r);let f,u,d,g;if(h>0)if(f=r*l-o,u=r*o-l,g=a*h,f>=0)if(u>=-g)if(u<=g){const v=1/h;f*=v,u*=v,d=f*(f+r*u+2*o)+u*(r*f+u+2*l)+c}else u=a,f=Math.max(0,-(r*u+o)),d=-f*f+u*(u+2*l)+c;else u=-a,f=Math.max(0,-(r*u+o)),d=-f*f+u*(u+2*l)+c;else u<=-g?(f=Math.max(0,-(-r*a+o)),u=f>0?-a:Math.min(Math.max(-a,-l),a),d=-f*f+u*(u+2*l)+c):u<=g?(f=0,u=Math.min(Math.max(-a,-l),a),d=u*(u+2*l)+c):(f=Math.max(0,-(r*a+o)),u=f>0?a:Math.min(Math.max(-a,-l),a),d=-f*f+u*(u+2*l)+c);else u=r>0?-a:a,f=Math.max(0,-(r*u+o)),d=-f*f+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,f),n&&n.copy(Pl).addScaledVector(Ir,u),d}intersectSphere(t,e){pn.subVectors(t.center,this.origin);const i=pn.dot(this.direction),n=pn.dot(pn)-i*i,a=t.radius*t.radius;if(n>a)return null;const r=Math.sqrt(a-n),o=i-r,l=i+r;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){const i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,a,r,o,l;const c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,n=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,n=(t.min.x-u.x)*c),h>=0?(a=(t.min.y-u.y)*h,r=(t.max.y-u.y)*h):(a=(t.max.y-u.y)*h,r=(t.min.y-u.y)*h),i>r||a>n||((a>i||isNaN(i))&&(i=a),(r<n||isNaN(n))&&(n=r),f>=0?(o=(t.min.z-u.z)*f,l=(t.max.z-u.z)*f):(o=(t.max.z-u.z)*f,l=(t.min.z-u.z)*f),i>l||o>n)||((o>i||i!==i)&&(i=o),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,pn)!==null}intersectTriangle(t,e,i,n,a){Ll.subVectors(e,t),Ur.subVectors(i,t),Dl.crossVectors(Ll,Ur);let r=this.direction.dot(Dl),o;if(r>0){if(n)return null;o=1}else if(r<0)o=-1,r=-r;else return null;Nn.subVectors(this.origin,t);const l=o*this.direction.dot(Ur.crossVectors(Nn,Ur));if(l<0)return null;const c=o*this.direction.dot(Ll.cross(Nn));if(c<0||l+c>r)return null;const h=-o*Nn.dot(Dl);return h<0?null:this.at(h/r,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class zt{constructor(t,e,i,n,a,r,o,l,c,h,f,u,d,g,v,m){zt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,a,r,o,l,c,h,f,u,d,g,v,m)}set(t,e,i,n,a,r,o,l,c,h,f,u,d,g,v,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=i,p[12]=n,p[1]=a,p[5]=r,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=f,p[14]=u,p[3]=d,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new zt().fromArray(this.elements)}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){const e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,i=t.elements,n=1/zs.setFromMatrixColumn(t,0).length(),a=1/zs.setFromMatrixColumn(t,1).length(),r=1/zs.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*a,e[5]=i[5]*a,e[6]=i[6]*a,e[7]=0,e[8]=i[8]*r,e[9]=i[9]*r,e[10]=i[10]*r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,i=t.x,n=t.y,a=t.z,r=Math.cos(i),o=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(a),f=Math.sin(a);if(t.order==="XYZ"){const u=r*h,d=r*f,g=o*h,v=o*f;e[0]=l*h,e[4]=-l*f,e[8]=c,e[1]=d+g*c,e[5]=u-v*c,e[9]=-o*l,e[2]=v-u*c,e[6]=g+d*c,e[10]=r*l}else if(t.order==="YXZ"){const u=l*h,d=l*f,g=c*h,v=c*f;e[0]=u+v*o,e[4]=g*o-d,e[8]=r*c,e[1]=r*f,e[5]=r*h,e[9]=-o,e[2]=d*o-g,e[6]=v+u*o,e[10]=r*l}else if(t.order==="ZXY"){const u=l*h,d=l*f,g=c*h,v=c*f;e[0]=u-v*o,e[4]=-r*f,e[8]=g+d*o,e[1]=d+g*o,e[5]=r*h,e[9]=v-u*o,e[2]=-r*c,e[6]=o,e[10]=r*l}else if(t.order==="ZYX"){const u=r*h,d=r*f,g=o*h,v=o*f;e[0]=l*h,e[4]=g*c-d,e[8]=u*c+v,e[1]=l*f,e[5]=v*c+u,e[9]=d*c-g,e[2]=-c,e[6]=o*l,e[10]=r*l}else if(t.order==="YZX"){const u=r*l,d=r*c,g=o*l,v=o*c;e[0]=l*h,e[4]=v-u*f,e[8]=g*f+d,e[1]=f,e[5]=r*h,e[9]=-o*h,e[2]=-c*h,e[6]=d*f+g,e[10]=u-v*f}else if(t.order==="XZY"){const u=r*l,d=r*c,g=o*l,v=o*c;e[0]=l*h,e[4]=-f,e[8]=c*h,e[1]=u*f+v,e[5]=r*h,e[9]=d*f-g,e[2]=g*f-d,e[6]=o*h,e[10]=v*f+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Fg,t,Og)}lookAt(t,e,i){const n=this.elements;return Ai.subVectors(t,e),Ai.lengthSq()===0&&(Ai.z=1),Ai.normalize(),Fn.crossVectors(i,Ai),Fn.lengthSq()===0&&(Math.abs(i.z)===1?Ai.x+=1e-4:Ai.z+=1e-4,Ai.normalize(),Fn.crossVectors(i,Ai)),Fn.normalize(),Nr.crossVectors(Ai,Fn),n[0]=Fn.x,n[4]=Nr.x,n[8]=Ai.x,n[1]=Fn.y,n[5]=Nr.y,n[9]=Ai.y,n[2]=Fn.z,n[6]=Nr.z,n[10]=Ai.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,n=e.elements,a=this.elements,r=i[0],o=i[4],l=i[8],c=i[12],h=i[1],f=i[5],u=i[9],d=i[13],g=i[2],v=i[6],m=i[10],p=i[14],M=i[3],y=i[7],S=i[11],C=i[15],w=n[0],E=n[4],A=n[8],D=n[12],_=n[1],x=n[5],L=n[9],U=n[13],G=n[2],H=n[6],B=n[10],$=n[14],N=n[3],Y=n[7],Q=n[11],st=n[15];return a[0]=r*w+o*_+l*G+c*N,a[4]=r*E+o*x+l*H+c*Y,a[8]=r*A+o*L+l*B+c*Q,a[12]=r*D+o*U+l*$+c*st,a[1]=h*w+f*_+u*G+d*N,a[5]=h*E+f*x+u*H+d*Y,a[9]=h*A+f*L+u*B+d*Q,a[13]=h*D+f*U+u*$+d*st,a[2]=g*w+v*_+m*G+p*N,a[6]=g*E+v*x+m*H+p*Y,a[10]=g*A+v*L+m*B+p*Q,a[14]=g*D+v*U+m*$+p*st,a[3]=M*w+y*_+S*G+C*N,a[7]=M*E+y*x+S*H+C*Y,a[11]=M*A+y*L+S*B+C*Q,a[15]=M*D+y*U+S*$+C*st,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[4],n=t[8],a=t[12],r=t[1],o=t[5],l=t[9],c=t[13],h=t[2],f=t[6],u=t[10],d=t[14],g=t[3],v=t[7],m=t[11],p=t[15];return g*(+a*l*f-n*c*f-a*o*u+i*c*u+n*o*d-i*l*d)+v*(+e*l*d-e*c*u+a*r*u-n*r*d+n*c*h-a*l*h)+m*(+e*c*f-e*o*d-a*r*f+i*r*d+a*o*h-i*c*h)+p*(-n*o*h-e*l*f+e*o*u+n*r*f-i*r*u+i*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){const n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){const t=this.elements,e=t[0],i=t[1],n=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8],f=t[9],u=t[10],d=t[11],g=t[12],v=t[13],m=t[14],p=t[15],M=f*m*c-v*u*c+v*l*d-o*m*d-f*l*p+o*u*p,y=g*u*c-h*m*c-g*l*d+r*m*d+h*l*p-r*u*p,S=h*v*c-g*f*c+g*o*d-r*v*d-h*o*p+r*f*p,C=g*f*l-h*v*l-g*o*u+r*v*u+h*o*m-r*f*m,w=e*M+i*y+n*S+a*C;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const E=1/w;return t[0]=M*E,t[1]=(v*u*a-f*m*a-v*n*d+i*m*d+f*n*p-i*u*p)*E,t[2]=(o*m*a-v*l*a+v*n*c-i*m*c-o*n*p+i*l*p)*E,t[3]=(f*l*a-o*u*a-f*n*c+i*u*c+o*n*d-i*l*d)*E,t[4]=y*E,t[5]=(h*m*a-g*u*a+g*n*d-e*m*d-h*n*p+e*u*p)*E,t[6]=(g*l*a-r*m*a-g*n*c+e*m*c+r*n*p-e*l*p)*E,t[7]=(r*u*a-h*l*a+h*n*c-e*u*c-r*n*d+e*l*d)*E,t[8]=S*E,t[9]=(g*f*a-h*v*a-g*i*d+e*v*d+h*i*p-e*f*p)*E,t[10]=(r*v*a-g*o*a+g*i*c-e*v*c-r*i*p+e*o*p)*E,t[11]=(h*o*a-r*f*a-h*i*c+e*f*c+r*i*d-e*o*d)*E,t[12]=C*E,t[13]=(h*v*n-g*f*n+g*i*u-e*v*u-h*i*m+e*f*m)*E,t[14]=(g*o*n-r*v*n-g*i*l+e*v*l+r*i*m-e*o*m)*E,t[15]=(r*f*n-h*o*n+h*i*l-e*f*l-r*i*u+e*o*u)*E,this}scale(t){const e=this.elements,i=t.x,n=t.y,a=t.z;return e[0]*=i,e[4]*=n,e[8]*=a,e[1]*=i,e[5]*=n,e[9]*=a,e[2]*=i,e[6]*=n,e[10]*=a,e[3]*=i,e[7]*=n,e[11]*=a,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const i=Math.cos(e),n=Math.sin(e),a=1-i,r=t.x,o=t.y,l=t.z,c=a*r,h=a*o;return this.set(c*r+i,c*o-n*l,c*l+n*o,0,c*o+n*l,h*o+i,h*l-n*r,0,c*l-n*o,h*l+n*r,a*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,a,r){return this.set(1,i,a,0,t,1,r,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){const n=this.elements,a=e._x,r=e._y,o=e._z,l=e._w,c=a+a,h=r+r,f=o+o,u=a*c,d=a*h,g=a*f,v=r*h,m=r*f,p=o*f,M=l*c,y=l*h,S=l*f,C=i.x,w=i.y,E=i.z;return n[0]=(1-(v+p))*C,n[1]=(d+S)*C,n[2]=(g-y)*C,n[3]=0,n[4]=(d-S)*w,n[5]=(1-(u+p))*w,n[6]=(m+M)*w,n[7]=0,n[8]=(g+y)*E,n[9]=(m-M)*E,n[10]=(1-(u+v))*E,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){const n=this.elements;let a=zs.set(n[0],n[1],n[2]).length();const r=zs.set(n[4],n[5],n[6]).length(),o=zs.set(n[8],n[9],n[10]).length();this.determinant()<0&&(a=-a),t.x=n[12],t.y=n[13],t.z=n[14],qi.copy(this);const c=1/a,h=1/r,f=1/o;return qi.elements[0]*=c,qi.elements[1]*=c,qi.elements[2]*=c,qi.elements[4]*=h,qi.elements[5]*=h,qi.elements[6]*=h,qi.elements[8]*=f,qi.elements[9]*=f,qi.elements[10]*=f,e.setFromRotationMatrix(qi),i.x=a,i.y=r,i.z=o,this}makePerspective(t,e,i,n,a,r,o=Tn){const l=this.elements,c=2*a/(e-t),h=2*a/(i-n),f=(e+t)/(e-t),u=(i+n)/(i-n);let d,g;if(o===Tn)d=-(r+a)/(r-a),g=-2*r*a/(r-a);else if(o===Qo)d=-r/(r-a),g=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,i,n,a,r,o=Tn){const l=this.elements,c=1/(e-t),h=1/(i-n),f=1/(r-a),u=(e+t)*c,d=(i+n)*h;let g,v;if(o===Tn)g=(r+a)*f,v=-2*f;else if(o===Qo)g=a*f,v=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}}const zs=new T,qi=new zt,Fg=new T(0,0,0),Og=new T(1,1,1),Fn=new T,Nr=new T,Ai=new T,Ju=new zt,ju=new Ei;class Vi{constructor(t=0,e=0,i=0,n=Vi.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){const n=t.elements,a=n[0],r=n[4],o=n[8],l=n[1],c=n[5],h=n[9],f=n[2],u=n[6],d=n[10];switch(e){case"XYZ":this._y=Math.asin(ei(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ei(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,a),this._z=0);break;case"ZXY":this._x=Math.asin(ei(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-ei(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin(ei(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,a)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-ei(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Ju.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Ju,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return ju.setFromEuler(this),this.setFromQuaternion(ju,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Vi.DEFAULT_ORDER="XYZ";class dm{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let zg=0;const Qu=new T,Bs=new Ei,mn=new zt,Fr=new T,La=new T,Bg=new T,kg=new Ei,tf=new T(1,0,0),ef=new T(0,1,0),nf=new T(0,0,1),sf={type:"added"},Hg={type:"removed"},ks={type:"childadded",child:null},Il={type:"childremoved",child:null};class Ae extends Ea{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:zg++}),this.uuid=Cn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ae.DEFAULT_UP.clone();const t=new T,e=new Vi,i=new Ei,n=new T(1,1,1);function a(){i.setFromEuler(e,!1)}function r(){e.setFromQuaternion(i,void 0,!1)}e._onChange(a),i._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new zt},normalMatrix:{value:new Wt}}),this.matrix=new zt,this.matrixWorld=new zt,this.matrixAutoUpdate=Ae.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ae.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new dm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Bs.setFromAxisAngle(t,e),this.quaternion.multiply(Bs),this}rotateOnWorldAxis(t,e){return Bs.setFromAxisAngle(t,e),this.quaternion.premultiply(Bs),this}rotateX(t){return this.rotateOnAxis(tf,t)}rotateY(t){return this.rotateOnAxis(ef,t)}rotateZ(t){return this.rotateOnAxis(nf,t)}translateOnAxis(t,e){return Qu.copy(t).applyQuaternion(this.quaternion),this.position.add(Qu.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(tf,t)}translateY(t){return this.translateOnAxis(ef,t)}translateZ(t){return this.translateOnAxis(nf,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(mn.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Fr.copy(t):Fr.set(t,e,i);const n=this.parent;this.updateWorldMatrix(!0,!1),La.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?mn.lookAt(La,Fr,this.up):mn.lookAt(Fr,La,this.up),this.quaternion.setFromRotationMatrix(mn),n&&(mn.extractRotation(n.matrixWorld),Bs.setFromRotationMatrix(mn),this.quaternion.premultiply(Bs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(sf),ks.child=t,this.dispatchEvent(ks),ks.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Hg),Il.child=t,this.dispatchEvent(Il),Il.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),mn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),mn.multiply(t.parent.matrixWorld)),t.applyMatrix4(mn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(sf),ks.child=t,this.dispatchEvent(ks),ks.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){const r=this.children[i].getObjectByProperty(t,e);if(r!==void 0)return r}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);const n=this.children;for(let a=0,r=n.length;a<r;a++)n[a].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(La,t,Bg),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(La,kg,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e){const i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const n=this.children;for(let a=0,r=n.length;a<r;a++)n[a].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const n={};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.visibility=this._visibility,n.active=this._active,n.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.geometryCount=this._geometryCount,n.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere={center:n.boundingSphere.center.toArray(),radius:n.boundingSphere.radius}),this.boundingBox!==null&&(n.boundingBox={min:n.boundingBox.min.toArray(),max:n.boundingBox.max.toArray()}));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=a(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const f=l[c];a(t.shapes,f)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(t.materials,this.material[l]));n.material=o}else n.material=a(t.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];n.animations.push(a(t.animations,l))}}if(e){const o=r(t.geometries),l=r(t.materials),c=r(t.textures),h=r(t.images),f=r(t.shapes),u=r(t.skeletons),d=r(t.animations),g=r(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),f.length>0&&(i.shapes=f),u.length>0&&(i.skeletons=u),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=n,i;function r(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){const n=t.children[i];this.add(n.clone())}return this}}Ae.DEFAULT_UP=new T(0,1,0);Ae.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ae.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const $i=new T,gn=new T,Ul=new T,vn=new T,Hs=new T,Gs=new T,af=new T,Nl=new T,Fl=new T,Ol=new T,zl=new Pe,Bl=new Pe,kl=new Pe;class zi{constructor(t=new T,e=new T,i=new T){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),$i.subVectors(t,e),n.cross($i);const a=n.lengthSq();return a>0?n.multiplyScalar(1/Math.sqrt(a)):n.set(0,0,0)}static getBarycoord(t,e,i,n,a){$i.subVectors(n,e),gn.subVectors(i,e),Ul.subVectors(t,e);const r=$i.dot($i),o=$i.dot(gn),l=$i.dot(Ul),c=gn.dot(gn),h=gn.dot(Ul),f=r*c-o*o;if(f===0)return a.set(0,0,0),null;const u=1/f,d=(c*l-o*h)*u,g=(r*h-o*l)*u;return a.set(1-d-g,g,d)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,vn)===null?!1:vn.x>=0&&vn.y>=0&&vn.x+vn.y<=1}static getInterpolation(t,e,i,n,a,r,o,l){return this.getBarycoord(t,e,i,n,vn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,vn.x),l.addScaledVector(r,vn.y),l.addScaledVector(o,vn.z),l)}static getInterpolatedAttribute(t,e,i,n,a,r){return zl.setScalar(0),Bl.setScalar(0),kl.setScalar(0),zl.fromBufferAttribute(t,e),Bl.fromBufferAttribute(t,i),kl.fromBufferAttribute(t,n),r.setScalar(0),r.addScaledVector(zl,a.x),r.addScaledVector(Bl,a.y),r.addScaledVector(kl,a.z),r}static isFrontFacing(t,e,i,n){return $i.subVectors(i,e),gn.subVectors(t,e),$i.cross(gn).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return $i.subVectors(this.c,this.b),gn.subVectors(this.a,this.b),$i.cross(gn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return zi.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return zi.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,a){return zi.getInterpolation(t,this.a,this.b,this.c,e,i,n,a)}containsPoint(t){return zi.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return zi.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const i=this.a,n=this.b,a=this.c;let r,o;Hs.subVectors(n,i),Gs.subVectors(a,i),Nl.subVectors(t,i);const l=Hs.dot(Nl),c=Gs.dot(Nl);if(l<=0&&c<=0)return e.copy(i);Fl.subVectors(t,n);const h=Hs.dot(Fl),f=Gs.dot(Fl);if(h>=0&&f<=h)return e.copy(n);const u=l*f-h*c;if(u<=0&&l>=0&&h<=0)return r=l/(l-h),e.copy(i).addScaledVector(Hs,r);Ol.subVectors(t,a);const d=Hs.dot(Ol),g=Gs.dot(Ol);if(g>=0&&d<=g)return e.copy(a);const v=d*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(i).addScaledVector(Gs,o);const m=h*g-d*f;if(m<=0&&f-h>=0&&d-g>=0)return af.subVectors(a,n),o=(f-h)/(f-h+(d-g)),e.copy(n).addScaledVector(af,o);const p=1/(m+v+u);return r=v*p,o=u*p,e.copy(i).addScaledVector(Hs,r).addScaledVector(Gs,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const pm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},On={h:0,s:0,l:0},Or={h:0,s:0,l:0};function Hl(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}class gt{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){const n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=wi){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,oe.toWorkingColorSpace(this,e),this}setRGB(t,e,i,n=oe.workingColorSpace){return this.r=t,this.g=e,this.b=i,oe.toWorkingColorSpace(this,n),this}setHSL(t,e,i,n=oe.workingColorSpace){if(t=hu(t,1),e=ei(e,0,1),i=ei(i,0,1),e===0)this.r=this.g=this.b=i;else{const a=i<=.5?i*(1+e):i+e-i*e,r=2*i-a;this.r=Hl(r,a,t+1/3),this.g=Hl(r,a,t),this.b=Hl(r,a,t-1/3)}return oe.toWorkingColorSpace(this,n),this}setStyle(t,e=wi){function i(a){a!==void 0&&parseFloat(a)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let a;const r=n[1],o=n[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,e);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,e);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){const a=n[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,e);if(r===6)return this.setHex(parseInt(a,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=wi){const i=pm[t.toLowerCase()];return i!==void 0?this.setHex(i,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=fa(t.r),this.g=fa(t.g),this.b=fa(t.b),this}copyLinearToSRGB(t){return this.r=bl(t.r),this.g=bl(t.g),this.b=bl(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=wi){return oe.fromWorkingColorSpace(si.copy(this),t),Math.round(ei(si.r*255,0,255))*65536+Math.round(ei(si.g*255,0,255))*256+Math.round(ei(si.b*255,0,255))}getHexString(t=wi){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=oe.workingColorSpace){oe.fromWorkingColorSpace(si.copy(this),e);const i=si.r,n=si.g,a=si.b,r=Math.max(i,n,a),o=Math.min(i,n,a);let l,c;const h=(o+r)/2;if(o===r)l=0,c=0;else{const f=r-o;switch(c=h<=.5?f/(r+o):f/(2-r-o),r){case i:l=(n-a)/f+(n<a?6:0);break;case n:l=(a-i)/f+2;break;case a:l=(i-n)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=oe.workingColorSpace){return oe.fromWorkingColorSpace(si.copy(this),e),t.r=si.r,t.g=si.g,t.b=si.b,t}getStyle(t=wi){oe.fromWorkingColorSpace(si.copy(this),t);const e=si.r,i=si.g,n=si.b;return t!==wi?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(On),this.setHSL(On.h+t,On.s+e,On.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(On),t.getHSL(Or);const i=rr(On.h,Or.h,e),n=rr(On.s,Or.s,e),a=rr(On.l,Or.l,e);return this.setHSL(i,n,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,i=this.g,n=this.b,a=t.elements;return this.r=a[0]*e+a[3]*i+a[6]*n,this.g=a[1]*e+a[4]*i+a[7]*n,this.b=a[2]*e+a[5]*i+a[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const si=new gt;gt.NAMES=pm;let Gg=0;class an extends Ea{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Gg++}),this.uuid=Cn(),this.name="",this.type="Material",this.blending=ha,this.side=Jn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Hc,this.blendDst=Gc,this.blendEquation=Qi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new gt(0,0,0),this.blendAlpha=0,this.depthFunc=ma,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Wu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Is,this.stencilZFail=Is,this.stencilZPass=Is,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const i=t[e];if(i===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const n=this[e];if(n===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ha&&(i.blending=this.blending),this.side!==Jn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Hc&&(i.blendSrc=this.blendSrc),this.blendDst!==Gc&&(i.blendDst=this.blendDst),this.blendEquation!==Qi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ma&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Wu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Is&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Is&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Is&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(a){const r=[];for(const o in a){const l=a[o];delete l.metadata,r.push(l)}return r}if(e){const a=n(t.textures),r=n(t.images);a.length>0&&(i.textures=a),r.length>0&&(i.images=r)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let i=null;if(e!==null){const n=e.length;i=new Array(n);for(let a=0;a!==n;++a)i[a]=e[a].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class ze extends an{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Vi,this.combine=tu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Ne=new T,zr=new at;class he{constructor(t,e,i=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Ah,this.updateRanges=[],this.gpuType=cn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,a=this.itemSize;n<a;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)zr.fromBufferAttribute(this,e),zr.applyMatrix3(t),this.setXY(e,zr.x,zr.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Ne.fromBufferAttribute(this,e),Ne.applyMatrix3(t),this.setXYZ(e,Ne.x,Ne.y,Ne.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Ne.fromBufferAttribute(this,e),Ne.applyMatrix4(t),this.setXYZ(e,Ne.x,Ne.y,Ne.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Ne.fromBufferAttribute(this,e),Ne.applyNormalMatrix(t),this.setXYZ(e,Ne.x,Ne.y,Ne.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Ne.fromBufferAttribute(this,e),Ne.transformDirection(t),this.setXYZ(e,Ne.x,Ne.y,Ne.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=en(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=pe(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=en(e,this.array)),e}setX(t,e){return this.normalized&&(e=pe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=en(e,this.array)),e}setY(t,e){return this.normalized&&(e=pe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=en(e,this.array)),e}setZ(t,e){return this.normalized&&(e=pe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=en(e,this.array)),e}setW(t,e){return this.normalized&&(e=pe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=pe(e,this.array),i=pe(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=pe(e,this.array),i=pe(i,this.array),n=pe(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,a){return t*=this.itemSize,this.normalized&&(e=pe(e,this.array),i=pe(i,this.array),n=pe(n,this.array),a=pe(a,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Ah&&(t.usage=this.usage),t}}class mm extends he{constructor(t,e,i){super(new Uint16Array(t),e,i)}}class gm extends he{constructor(t,e,i){super(new Uint32Array(t),e,i)}}class me extends he{constructor(t,e,i){super(new Float32Array(t),e,i)}}let Vg=0;const Ni=new zt,Gl=new Ae,Vs=new T,Ri=new ts,Da=new ts,Xe=new T;class ve extends Ea{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Vg++}),this.uuid=Cn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(hm(t)?gm:mm)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const a=new Wt().getNormalMatrix(t);i.applyNormalMatrix(a),i.needsUpdate=!0}const n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Ni.makeRotationFromQuaternion(t),this.applyMatrix4(Ni),this}rotateX(t){return Ni.makeRotationX(t),this.applyMatrix4(Ni),this}rotateY(t){return Ni.makeRotationY(t),this.applyMatrix4(Ni),this}rotateZ(t){return Ni.makeRotationZ(t),this.applyMatrix4(Ni),this}translate(t,e,i){return Ni.makeTranslation(t,e,i),this.applyMatrix4(Ni),this}scale(t,e,i){return Ni.makeScale(t,e,i),this.applyMatrix4(Ni),this}lookAt(t){return Gl.lookAt(t),Gl.updateMatrix(),this.applyMatrix4(Gl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vs).negate(),this.translate(Vs.x,Vs.y,Vs.z),this}setFromPoints(t){const e=[];for(let i=0,n=t.length;i<n;i++){const a=t[i];e.push(a.x,a.y,a.z||0)}return this.setAttribute("position",new me(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ts);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new T(-1/0,-1/0,-1/0),new T(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){const a=e[i];Ri.setFromBufferAttribute(a),this.morphTargetsRelative?(Xe.addVectors(this.boundingBox.min,Ri.min),this.boundingBox.expandByPoint(Xe),Xe.addVectors(this.boundingBox.max,Ri.max),this.boundingBox.expandByPoint(Xe)):(this.boundingBox.expandByPoint(Ri.min),this.boundingBox.expandByPoint(Ri.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Rs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new T,1/0);return}if(t){const i=this.boundingSphere.center;if(Ri.setFromBufferAttribute(t),e)for(let a=0,r=e.length;a<r;a++){const o=e[a];Da.setFromBufferAttribute(o),this.morphTargetsRelative?(Xe.addVectors(Ri.min,Da.min),Ri.expandByPoint(Xe),Xe.addVectors(Ri.max,Da.max),Ri.expandByPoint(Xe)):(Ri.expandByPoint(Da.min),Ri.expandByPoint(Da.max))}Ri.getCenter(i);let n=0;for(let a=0,r=t.count;a<r;a++)Xe.fromBufferAttribute(t,a),n=Math.max(n,i.distanceToSquared(Xe));if(e)for(let a=0,r=e.length;a<r;a++){const o=e[a],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Xe.fromBufferAttribute(o,c),l&&(Vs.fromBufferAttribute(t,c),Xe.add(Vs)),n=Math.max(n,i.distanceToSquared(Xe))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.position,n=e.normal,a=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new he(new Float32Array(4*i.count),4));const r=this.getAttribute("tangent"),o=[],l=[];for(let A=0;A<i.count;A++)o[A]=new T,l[A]=new T;const c=new T,h=new T,f=new T,u=new at,d=new at,g=new at,v=new T,m=new T;function p(A,D,_){c.fromBufferAttribute(i,A),h.fromBufferAttribute(i,D),f.fromBufferAttribute(i,_),u.fromBufferAttribute(a,A),d.fromBufferAttribute(a,D),g.fromBufferAttribute(a,_),h.sub(c),f.sub(c),d.sub(u),g.sub(u);const x=1/(d.x*g.y-g.x*d.y);isFinite(x)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(f,-d.y).multiplyScalar(x),m.copy(f).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(x),o[A].add(v),o[D].add(v),o[_].add(v),l[A].add(m),l[D].add(m),l[_].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let A=0,D=M.length;A<D;++A){const _=M[A],x=_.start,L=_.count;for(let U=x,G=x+L;U<G;U+=3)p(t.getX(U+0),t.getX(U+1),t.getX(U+2))}const y=new T,S=new T,C=new T,w=new T;function E(A){C.fromBufferAttribute(n,A),w.copy(C);const D=o[A];y.copy(D),y.sub(C.multiplyScalar(C.dot(D))).normalize(),S.crossVectors(w,D);const x=S.dot(l[A])<0?-1:1;r.setXYZW(A,y.x,y.y,y.z,x)}for(let A=0,D=M.length;A<D;++A){const _=M[A],x=_.start,L=_.count;for(let U=x,G=x+L;U<G;U+=3)E(t.getX(U+0)),E(t.getX(U+1)),E(t.getX(U+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new he(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let u=0,d=i.count;u<d;u++)i.setXYZ(u,0,0,0);const n=new T,a=new T,r=new T,o=new T,l=new T,c=new T,h=new T,f=new T;if(t)for(let u=0,d=t.count;u<d;u+=3){const g=t.getX(u+0),v=t.getX(u+1),m=t.getX(u+2);n.fromBufferAttribute(e,g),a.fromBufferAttribute(e,v),r.fromBufferAttribute(e,m),h.subVectors(r,a),f.subVectors(n,a),h.cross(f),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,m),o.add(h),l.add(h),c.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=e.count;u<d;u+=3)n.fromBufferAttribute(e,u+0),a.fromBufferAttribute(e,u+1),r.fromBufferAttribute(e,u+2),h.subVectors(r,a),f.subVectors(n,a),h.cross(f),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Xe.fromBufferAttribute(t,e),Xe.normalize(),t.setXYZ(e,Xe.x,Xe.y,Xe.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,f=o.normalized,u=new c.constructor(l.length*h);let d=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?d=l[v]*o.data.stride+o.offset:d=l[v]*h;for(let p=0;p<h;p++)u[g++]=c[d++]}return new he(u,h,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new ve,i=this.index.array,n=this.attributes;for(const o in n){const l=n[o],c=t(l,i);e.setAttribute(o,c)}const a=this.morphAttributes;for(const o in a){const l=[],c=a[o];for(let h=0,f=c.length;h<f;h++){const u=c[h],d=t(u,i);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const r=this.groups;for(let o=0,l=r.length;o<l;o++){const c=r[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const i=this.attributes;for(const l in i){const c=i[l];t.data.attributes[l]=c.toJSON(t.data)}const n={};let a=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let f=0,u=c.length;f<u;f++){const d=c[f];h.push(d.toJSON(t.data))}h.length>0&&(n[l]=h,a=!0)}a&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);const r=this.groups;r.length>0&&(t.data.groups=JSON.parse(JSON.stringify(r)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const i=t.index;i!==null&&this.setIndex(i.clone(e));const n=t.attributes;for(const c in n){const h=n[c];this.setAttribute(c,h.clone(e))}const a=t.morphAttributes;for(const c in a){const h=[],f=a[c];for(let u=0,d=f.length;u<d;u++)h.push(f[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const r=t.groups;for(let c=0,h=r.length;c<h;c++){const f=r[c];this.addGroup(f.start,f.count,f.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const rf=new zt,ss=new uu,Br=new Rs,of=new T,kr=new T,Hr=new T,Gr=new T,Vl=new T,Vr=new T,lf=new T,Wr=new T;class St extends Ae{constructor(t=new ve,e=new ze){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=n.length;a<r;a++){const o=n[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(t,e){const i=this.geometry,n=i.attributes.position,a=i.morphAttributes.position,r=i.morphTargetsRelative;e.fromBufferAttribute(n,t);const o=this.morphTargetInfluences;if(a&&o){Vr.set(0,0,0);for(let l=0,c=a.length;l<c;l++){const h=o[l],f=a[l];h!==0&&(Vl.fromBufferAttribute(f,t),r?Vr.addScaledVector(Vl,h):Vr.addScaledVector(Vl.sub(e),h))}e.add(Vr)}return e}raycast(t,e){const i=this.geometry,n=this.material,a=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Br.copy(i.boundingSphere),Br.applyMatrix4(a),ss.copy(t.ray).recast(t.near),!(Br.containsPoint(ss.origin)===!1&&(ss.intersectSphere(Br,of)===null||ss.origin.distanceToSquared(of)>(t.far-t.near)**2))&&(rf.copy(a).invert(),ss.copy(t.ray).applyMatrix4(rf),!(i.boundingBox!==null&&ss.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,ss)))}_computeIntersections(t,e,i){let n;const a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,h=a.attributes.uv1,f=a.attributes.normal,u=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(r))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=r[m.materialIndex],M=Math.max(m.start,d.start),y=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let S=M,C=y;S<C;S+=3){const w=o.getX(S),E=o.getX(S+1),A=o.getX(S+2);n=Xr(this,p,t,i,c,h,f,w,E,A),n&&(n.faceIndex=Math.floor(S/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{const g=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){const M=o.getX(m),y=o.getX(m+1),S=o.getX(m+2);n=Xr(this,r,t,i,c,h,f,M,y,S),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(r))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=r[m.materialIndex],M=Math.max(m.start,d.start),y=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let S=M,C=y;S<C;S+=3){const w=S,E=S+1,A=S+2;n=Xr(this,p,t,i,c,h,f,w,E,A),n&&(n.faceIndex=Math.floor(S/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{const g=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){const M=m,y=m+1,S=m+2;n=Xr(this,r,t,i,c,h,f,M,y,S),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}}}function Wg(s,t,e,i,n,a,r,o){let l;if(t.side===di?l=i.intersectTriangle(r,a,n,!0,o):l=i.intersectTriangle(n,a,r,t.side===Jn,o),l===null)return null;Wr.copy(o),Wr.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Wr);return c<e.near||c>e.far?null:{distance:c,point:Wr.clone(),object:s}}function Xr(s,t,e,i,n,a,r,o,l,c){s.getVertexPosition(o,kr),s.getVertexPosition(l,Hr),s.getVertexPosition(c,Gr);const h=Wg(s,t,e,i,kr,Hr,Gr,lf);if(h){const f=new T;zi.getBarycoord(lf,kr,Hr,Gr,f),n&&(h.uv=zi.getInterpolatedAttribute(n,o,l,c,f,new at)),a&&(h.uv1=zi.getInterpolatedAttribute(a,o,l,c,f,new at)),r&&(h.normal=zi.getInterpolatedAttribute(r,o,l,c,f,new T),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const u={a:o,b:l,c,normal:new T,materialIndex:0};zi.getNormal(kr,Hr,Gr,u.normal),h.face=u,h.barycoord=f}return h}class ui extends ve{constructor(t=1,e=1,i=1,n=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:a,depthSegments:r};const o=this;n=Math.floor(n),a=Math.floor(a),r=Math.floor(r);const l=[],c=[],h=[],f=[];let u=0,d=0;g("z","y","x",-1,-1,i,e,t,r,a,0),g("z","y","x",1,-1,i,e,-t,r,a,1),g("x","z","y",1,1,t,i,e,n,r,2),g("x","z","y",1,-1,t,i,-e,n,r,3),g("x","y","z",1,-1,t,e,i,n,a,4),g("x","y","z",-1,-1,t,e,-i,n,a,5),this.setIndex(l),this.setAttribute("position",new me(c,3)),this.setAttribute("normal",new me(h,3)),this.setAttribute("uv",new me(f,2));function g(v,m,p,M,y,S,C,w,E,A,D){const _=S/E,x=C/A,L=S/2,U=C/2,G=w/2,H=E+1,B=A+1;let $=0,N=0;const Y=new T;for(let Q=0;Q<B;Q++){const st=Q*x-U;for(let Bt=0;Bt<H;Bt++){const Kt=Bt*_-L;Y[v]=Kt*M,Y[m]=st*y,Y[p]=G,c.push(Y.x,Y.y,Y.z),Y[v]=0,Y[m]=0,Y[p]=w>0?1:-1,h.push(Y.x,Y.y,Y.z),f.push(Bt/E),f.push(1-Q/A),$+=1}}for(let Q=0;Q<A;Q++)for(let st=0;st<E;st++){const Bt=u+st+H*Q,Kt=u+st+H*(Q+1),K=u+(st+1)+H*(Q+1),et=u+(st+1)+H*Q;l.push(Bt,Kt,et),l.push(Kt,K,et),N+=6}o.addGroup(d,N,D),d+=N,u+=$}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ui(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function _a(s){const t={};for(const e in s){t[e]={};for(const i in s[e]){const n=s[e][i];n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)?n.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone():Array.isArray(n)?t[e][i]=n.slice():t[e][i]=n}}return t}function gi(s){const t={};for(let e=0;e<s.length;e++){const i=_a(s[e]);for(const n in i)t[n]=i[n]}return t}function Xg(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function vm(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:oe.workingColorSpace}const Bi={clone:_a,merge:gi};var Yg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,qg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Se extends an{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Yg,this.fragmentShader=qg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=_a(t.uniforms),this.uniformsGroups=Xg(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const n in this.uniforms){const r=this.uniforms[n].value;r&&r.isTexture?e.uniforms[n]={type:"t",value:r.toJSON(t).uuid}:r&&r.isColor?e.uniforms[n]={type:"c",value:r.getHex()}:r&&r.isVector2?e.uniforms[n]={type:"v2",value:r.toArray()}:r&&r.isVector3?e.uniforms[n]={type:"v3",value:r.toArray()}:r&&r.isVector4?e.uniforms[n]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?e.uniforms[n]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?e.uniforms[n]={type:"m4",value:r.toArray()}:e.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const i={};for(const n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}}class _m extends Ae{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new zt,this.projectionMatrix=new zt,this.projectionMatrixInverse=new zt,this.coordinateSystem=Tn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const zn=new T,cf=new at,hf=new at;class Oi extends _m{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=mr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(ar*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return mr*2*Math.atan(Math.tan(ar*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){zn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(zn.x,zn.y).multiplyScalar(-t/zn.z),zn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(zn.x,zn.y).multiplyScalar(-t/zn.z)}getViewSize(t,e){return this.getViewBounds(t,cf,hf),e.subVectors(hf,cf)}setViewOffset(t,e,i,n,a,r){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(ar*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,a=-.5*n;const r=this.view;if(this.view!==null&&this.view.enabled){const l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*n/l,e-=r.offsetY*i/c,n*=r.width/l,i*=r.height/c}const o=this.filmOffset;o!==0&&(a+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+n,e,e-i,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ws=-90,Xs=1;class $g extends Ae{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const n=new Oi(Ws,Xs,t,e);n.layers=this.layers,this.add(n);const a=new Oi(Ws,Xs,t,e);a.layers=this.layers,this.add(a);const r=new Oi(Ws,Xs,t,e);r.layers=this.layers,this.add(r);const o=new Oi(Ws,Xs,t,e);o.layers=this.layers,this.add(o);const l=new Oi(Ws,Xs,t,e);l.layers=this.layers,this.add(l);const c=new Oi(Ws,Xs,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[i,n,a,r,o,l]=e;for(const c of e)this.remove(c);if(t===Tn)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Qo)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[a,r,o,l,c,h]=this.children,f=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,t.setRenderTarget(i,0,n),t.render(e,a),t.setRenderTarget(i,1,n),t.render(e,r),t.setRenderTarget(i,2,n),t.render(e,o),t.setRenderTarget(i,3,n),t.render(e,l),t.setRenderTarget(i,4,n),t.render(e,c),i.texture.generateMipmaps=v,t.setRenderTarget(i,5,n),t.render(e,h),t.setRenderTarget(f,u,d),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Mm extends pi{constructor(t,e,i,n,a,r,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:ga,super(t,e,i,n,a,r,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Kg extends Ii{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new Mm(n,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:tn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new ui(5,5,5),a=new Se({name:"CubemapFromEquirect",uniforms:_a(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:di,blending:ti});a.uniforms.tEquirect.value=e;const r=new St(n,a),o=e.minFilter;return e.minFilter===$n&&(e.minFilter=tn),new $g(1,10,this).update(t,r),e.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,e,i,n){const a=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(e,i,n);t.setRenderTarget(a)}}const Wl=new T,Zg=new T,Jg=new Wt;class cs{constructor(t=new T(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){const n=Wl.subVectors(i,e).cross(Zg.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const i=t.delta(Wl),n=this.normal.dot(i);if(n===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const a=-(t.start.dot(this.normal)+this.constant)/n;return a<0||a>1?null:e.copy(t.start).addScaledVector(i,a)}intersectsLine(t){const e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const i=e||Jg.getNormalMatrix(t),n=this.coplanarPoint(Wl).applyMatrix4(t),a=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const as=new Rs,Yr=new T;class fu{constructor(t=new cs,e=new cs,i=new cs,n=new cs,a=new cs,r=new cs){this.planes=[t,e,i,n,a,r]}set(t,e,i,n,a,r){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(n),o[4].copy(a),o[5].copy(r),this}copy(t){const e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Tn){const i=this.planes,n=t.elements,a=n[0],r=n[1],o=n[2],l=n[3],c=n[4],h=n[5],f=n[6],u=n[7],d=n[8],g=n[9],v=n[10],m=n[11],p=n[12],M=n[13],y=n[14],S=n[15];if(i[0].setComponents(l-a,u-c,m-d,S-p).normalize(),i[1].setComponents(l+a,u+c,m+d,S+p).normalize(),i[2].setComponents(l+r,u+h,m+g,S+M).normalize(),i[3].setComponents(l-r,u-h,m-g,S-M).normalize(),i[4].setComponents(l-o,u-f,m-v,S-y).normalize(),e===Tn)i[5].setComponents(l+o,u+f,m+v,S+y).normalize();else if(e===Qo)i[5].setComponents(o,f,v,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),as.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),as.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(as)}intersectsSprite(t){return as.center.set(0,0,0),as.radius=.7071067811865476,as.applyMatrix4(t.matrixWorld),this.intersectsSphere(as)}intersectsSphere(t){const e=this.planes,i=t.center,n=-t.radius;for(let a=0;a<6;a++)if(e[a].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){const e=this.planes;for(let i=0;i<6;i++){const n=e[i];if(Yr.x=n.normal.x>0?t.max.x:t.min.x,Yr.y=n.normal.y>0?t.max.y:t.min.y,Yr.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(Yr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function xm(){let s=null,t=!1,e=null,i=null;function n(a,r){e(a,r),i=s.requestAnimationFrame(n)}return{start:function(){t!==!0&&e!==null&&(i=s.requestAnimationFrame(n),t=!0)},stop:function(){s.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(a){e=a},setContext:function(a){s=a}}}function jg(s){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,f=c.byteLength,u=s.createBuffer();s.bindBuffer(l,u),s.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=s.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=s.HALF_FLOAT:d=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=s.SHORT;else if(c instanceof Uint32Array)d=s.UNSIGNED_INT;else if(c instanceof Int32Array)d=s.INT;else if(c instanceof Int8Array)d=s.BYTE;else if(c instanceof Uint8Array)d=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function i(o,l,c){const h=l.array,f=l.updateRanges;if(s.bindBuffer(c,o),f.length===0)s.bufferSubData(c,0,h);else{f.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<f.length;d++){const g=f[u],v=f[d];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++u,f[u]=v)}f.length=u+1;for(let d=0,g=f.length;d<g;d++){const v=f[d];s.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:n,remove:a,update:r}}class ba extends ve{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};const a=t/2,r=e/2,o=Math.floor(i),l=Math.floor(n),c=o+1,h=l+1,f=t/o,u=e/l,d=[],g=[],v=[],m=[];for(let p=0;p<h;p++){const M=p*u-r;for(let y=0;y<c;y++){const S=y*f-a;g.push(S,-M,0),v.push(0,0,1),m.push(y/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){const y=M+c*p,S=M+c*(p+1),C=M+1+c*(p+1),w=M+1+c*p;d.push(y,S,w),d.push(S,C,w)}this.setIndex(d),this.setAttribute("position",new me(g,3)),this.setAttribute("normal",new me(v,3)),this.setAttribute("uv",new me(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ba(t.width,t.height,t.widthSegments,t.heightSegments)}}var Qg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,tv=`#ifdef USE_ALPHAHASH
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
#endif`,ev=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,iv=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,nv=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,sv=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,av=`#ifdef USE_AOMAP
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
#endif`,rv=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,ov=`#ifdef USE_BATCHING
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
#endif`,lv=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,cv=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,hv=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,uv=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,fv=`#ifdef USE_IRIDESCENCE
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
#endif`,dv=`#ifdef USE_BUMPMAP
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
#endif`,pv=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,mv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,gv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,vv=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,_v=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Mv=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,xv=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,yv=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Sv=`#define PI 3.141592653589793
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
} // validated`,wv=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Ev=`vec3 transformedNormal = objectNormal;
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
#endif`,bv=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Tv=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Av=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Rv=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Cv="gl_FragColor = linearToOutputTexel( gl_FragColor );",Pv=`
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
}`,Lv=`#ifdef USE_ENVMAP
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
#endif`,Dv=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Iv=`#ifdef USE_ENVMAP
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
#endif`,Uv=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Nv=`#ifdef USE_ENVMAP
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
#endif`,Fv=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ov=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,zv=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Bv=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,kv=`#ifdef USE_GRADIENTMAP
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
}`,Hv=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Gv=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Vv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Wv=`uniform bool receiveShadow;
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
#endif`,Xv=`#ifdef USE_ENVMAP
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
#endif`,Yv=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,qv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,$v=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Kv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Zv=`PhysicalMaterial material;
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
#endif`,Jv=`struct PhysicalMaterial {
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
}`,jv=`
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
#endif`,Qv=`#if defined( RE_IndirectDiffuse )
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
#endif`,t_=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,e_=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,i_=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,n_=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,s_=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,a_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,r_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,o_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,l_=`#if defined( USE_POINTS_UV )
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
#endif`,c_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,h_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,u_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,f_=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,d_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,p_=`#ifdef USE_MORPHTARGETS
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
#endif`,m_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,g_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,v_=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,__=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,M_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,x_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,y_=`#ifdef USE_NORMALMAP
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
#endif`,S_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,w_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,E_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,b_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,T_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,A_=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,R_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,C_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,P_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,L_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,D_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,I_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,U_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,N_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,F_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,O_=`float getShadowMask() {
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
}`,z_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,B_=`#ifdef USE_SKINNING
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
#endif`,k_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,H_=`#ifdef USE_SKINNING
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
#endif`,G_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,V_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,W_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,X_=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Y_=`#ifdef USE_TRANSMISSION
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
#endif`,q_=`#ifdef USE_TRANSMISSION
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
#endif`,$_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,K_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Z_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,J_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const j_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Q_=`uniform sampler2D t2D;
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
}`,tM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,eM=`#ifdef ENVMAP_TYPE_CUBE
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
}`,iM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sM=`#include <common>
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
}`,aM=`#if DEPTH_PACKING == 3200
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
}`,rM=`#define DISTANCE
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
}`,oM=`#define DISTANCE
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
}`,lM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,cM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hM=`uniform float scale;
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
}`,uM=`uniform vec3 diffuse;
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
}`,fM=`#include <common>
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
}`,dM=`uniform vec3 diffuse;
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
}`,pM=`#define LAMBERT
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
}`,mM=`#define LAMBERT
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
}`,gM=`#define MATCAP
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
}`,vM=`#define MATCAP
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
}`,_M=`#define NORMAL
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
}`,MM=`#define NORMAL
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
}`,xM=`#define PHONG
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
}`,yM=`#define PHONG
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
}`,SM=`#define STANDARD
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
}`,wM=`#define STANDARD
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
}`,EM=`#define TOON
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
}`,bM=`#define TOON
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
}`,TM=`uniform float size;
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
}`,AM=`uniform vec3 diffuse;
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
}`,RM=`#include <common>
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
}`,CM=`uniform vec3 color;
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
}`,PM=`uniform float rotation;
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
}`,LM=`uniform vec3 diffuse;
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
}`,Rt={alphahash_fragment:Qg,alphahash_pars_fragment:tv,alphamap_fragment:ev,alphamap_pars_fragment:iv,alphatest_fragment:nv,alphatest_pars_fragment:sv,aomap_fragment:av,aomap_pars_fragment:rv,batching_pars_vertex:ov,batching_vertex:lv,begin_vertex:cv,beginnormal_vertex:hv,bsdfs:uv,iridescence_fragment:fv,bumpmap_pars_fragment:dv,clipping_planes_fragment:pv,clipping_planes_pars_fragment:mv,clipping_planes_pars_vertex:gv,clipping_planes_vertex:vv,color_fragment:_v,color_pars_fragment:Mv,color_pars_vertex:xv,color_vertex:yv,common:Sv,cube_uv_reflection_fragment:wv,defaultnormal_vertex:Ev,displacementmap_pars_vertex:bv,displacementmap_vertex:Tv,emissivemap_fragment:Av,emissivemap_pars_fragment:Rv,colorspace_fragment:Cv,colorspace_pars_fragment:Pv,envmap_fragment:Lv,envmap_common_pars_fragment:Dv,envmap_pars_fragment:Iv,envmap_pars_vertex:Uv,envmap_physical_pars_fragment:Xv,envmap_vertex:Nv,fog_vertex:Fv,fog_pars_vertex:Ov,fog_fragment:zv,fog_pars_fragment:Bv,gradientmap_pars_fragment:kv,lightmap_pars_fragment:Hv,lights_lambert_fragment:Gv,lights_lambert_pars_fragment:Vv,lights_pars_begin:Wv,lights_toon_fragment:Yv,lights_toon_pars_fragment:qv,lights_phong_fragment:$v,lights_phong_pars_fragment:Kv,lights_physical_fragment:Zv,lights_physical_pars_fragment:Jv,lights_fragment_begin:jv,lights_fragment_maps:Qv,lights_fragment_end:t_,logdepthbuf_fragment:e_,logdepthbuf_pars_fragment:i_,logdepthbuf_pars_vertex:n_,logdepthbuf_vertex:s_,map_fragment:a_,map_pars_fragment:r_,map_particle_fragment:o_,map_particle_pars_fragment:l_,metalnessmap_fragment:c_,metalnessmap_pars_fragment:h_,morphinstance_vertex:u_,morphcolor_vertex:f_,morphnormal_vertex:d_,morphtarget_pars_vertex:p_,morphtarget_vertex:m_,normal_fragment_begin:g_,normal_fragment_maps:v_,normal_pars_fragment:__,normal_pars_vertex:M_,normal_vertex:x_,normalmap_pars_fragment:y_,clearcoat_normal_fragment_begin:S_,clearcoat_normal_fragment_maps:w_,clearcoat_pars_fragment:E_,iridescence_pars_fragment:b_,opaque_fragment:T_,packing:A_,premultiplied_alpha_fragment:R_,project_vertex:C_,dithering_fragment:P_,dithering_pars_fragment:L_,roughnessmap_fragment:D_,roughnessmap_pars_fragment:I_,shadowmap_pars_fragment:U_,shadowmap_pars_vertex:N_,shadowmap_vertex:F_,shadowmask_pars_fragment:O_,skinbase_vertex:z_,skinning_pars_vertex:B_,skinning_vertex:k_,skinnormal_vertex:H_,specularmap_fragment:G_,specularmap_pars_fragment:V_,tonemapping_fragment:W_,tonemapping_pars_fragment:X_,transmission_fragment:Y_,transmission_pars_fragment:q_,uv_pars_fragment:$_,uv_pars_vertex:K_,uv_vertex:Z_,worldpos_vertex:J_,background_vert:j_,background_frag:Q_,backgroundCube_vert:tM,backgroundCube_frag:eM,cube_vert:iM,cube_frag:nM,depth_vert:sM,depth_frag:aM,distanceRGBA_vert:rM,distanceRGBA_frag:oM,equirect_vert:lM,equirect_frag:cM,linedashed_vert:hM,linedashed_frag:uM,meshbasic_vert:fM,meshbasic_frag:dM,meshlambert_vert:pM,meshlambert_frag:mM,meshmatcap_vert:gM,meshmatcap_frag:vM,meshnormal_vert:_M,meshnormal_frag:MM,meshphong_vert:xM,meshphong_frag:yM,meshphysical_vert:SM,meshphysical_frag:wM,meshtoon_vert:EM,meshtoon_frag:bM,points_vert:TM,points_frag:AM,shadow_vert:RM,shadow_frag:CM,sprite_vert:PM,sprite_frag:LM},rt={common:{diffuse:{value:new gt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Wt}},envmap:{envMap:{value:null},envMapRotation:{value:new Wt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Wt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Wt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Wt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Wt},normalScale:{value:new at(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Wt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Wt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Wt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Wt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new gt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new gt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0},uvTransform:{value:new Wt}},sprite:{diffuse:{value:new gt(16777215)},opacity:{value:1},center:{value:new at(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}}},ln={basic:{uniforms:gi([rt.common,rt.specularmap,rt.envmap,rt.aomap,rt.lightmap,rt.fog]),vertexShader:Rt.meshbasic_vert,fragmentShader:Rt.meshbasic_frag},lambert:{uniforms:gi([rt.common,rt.specularmap,rt.envmap,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.fog,rt.lights,{emissive:{value:new gt(0)}}]),vertexShader:Rt.meshlambert_vert,fragmentShader:Rt.meshlambert_frag},phong:{uniforms:gi([rt.common,rt.specularmap,rt.envmap,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.fog,rt.lights,{emissive:{value:new gt(0)},specular:{value:new gt(1118481)},shininess:{value:30}}]),vertexShader:Rt.meshphong_vert,fragmentShader:Rt.meshphong_frag},standard:{uniforms:gi([rt.common,rt.envmap,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.roughnessmap,rt.metalnessmap,rt.fog,rt.lights,{emissive:{value:new gt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Rt.meshphysical_vert,fragmentShader:Rt.meshphysical_frag},toon:{uniforms:gi([rt.common,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.gradientmap,rt.fog,rt.lights,{emissive:{value:new gt(0)}}]),vertexShader:Rt.meshtoon_vert,fragmentShader:Rt.meshtoon_frag},matcap:{uniforms:gi([rt.common,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.fog,{matcap:{value:null}}]),vertexShader:Rt.meshmatcap_vert,fragmentShader:Rt.meshmatcap_frag},points:{uniforms:gi([rt.points,rt.fog]),vertexShader:Rt.points_vert,fragmentShader:Rt.points_frag},dashed:{uniforms:gi([rt.common,rt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Rt.linedashed_vert,fragmentShader:Rt.linedashed_frag},depth:{uniforms:gi([rt.common,rt.displacementmap]),vertexShader:Rt.depth_vert,fragmentShader:Rt.depth_frag},normal:{uniforms:gi([rt.common,rt.bumpmap,rt.normalmap,rt.displacementmap,{opacity:{value:1}}]),vertexShader:Rt.meshnormal_vert,fragmentShader:Rt.meshnormal_frag},sprite:{uniforms:gi([rt.sprite,rt.fog]),vertexShader:Rt.sprite_vert,fragmentShader:Rt.sprite_frag},background:{uniforms:{uvTransform:{value:new Wt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Rt.background_vert,fragmentShader:Rt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Wt}},vertexShader:Rt.backgroundCube_vert,fragmentShader:Rt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Rt.cube_vert,fragmentShader:Rt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Rt.equirect_vert,fragmentShader:Rt.equirect_frag},distanceRGBA:{uniforms:gi([rt.common,rt.displacementmap,{referencePosition:{value:new T},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Rt.distanceRGBA_vert,fragmentShader:Rt.distanceRGBA_frag},shadow:{uniforms:gi([rt.lights,rt.fog,{color:{value:new gt(0)},opacity:{value:1}}]),vertexShader:Rt.shadow_vert,fragmentShader:Rt.shadow_frag}};ln.physical={uniforms:gi([ln.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Wt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Wt},clearcoatNormalScale:{value:new at(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Wt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Wt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Wt},sheen:{value:0},sheenColor:{value:new gt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Wt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Wt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Wt},transmissionSamplerSize:{value:new at},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Wt},attenuationDistance:{value:0},attenuationColor:{value:new gt(0)},specularColor:{value:new gt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Wt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Wt},anisotropyVector:{value:new at},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Wt}}]),vertexShader:Rt.meshphysical_vert,fragmentShader:Rt.meshphysical_frag};const qr={r:0,b:0,g:0},rs=new Vi,DM=new zt;function IM(s,t,e,i,n,a,r){const o=new gt(0);let l=a===!0?0:1,c,h,f=null,u=0,d=null;function g(M){let y=M.isScene===!0?M.background:null;return y&&y.isTexture&&(y=(M.backgroundBlurriness>0?e:t).get(y)),y}function v(M){let y=!1;const S=g(M);S===null?p(o,l):S&&S.isColor&&(p(S,1),y=!0);const C=s.xr.getEnvironmentBlendMode();C==="additive"?i.buffers.color.setClear(0,0,0,1,r):C==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,r),(s.autoClear||y)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(M,y){const S=g(y);S&&(S.isCubeTexture||S.mapping===cl)?(h===void 0&&(h=new St(new ui(1,1,1),new Se({name:"BackgroundCubeMaterial",uniforms:_a(ln.backgroundCube.uniforms),vertexShader:ln.backgroundCube.vertexShader,fragmentShader:ln.backgroundCube.fragmentShader,side:di,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,w,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(h)),rs.copy(y.backgroundRotation),rs.x*=-1,rs.y*=-1,rs.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(rs.y*=-1,rs.z*=-1),h.material.uniforms.envMap.value=S,h.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(DM.makeRotationFromEuler(rs)),h.material.toneMapped=oe.getTransfer(S.colorSpace)!==_e,(f!==S||u!==S.version||d!==s.toneMapping)&&(h.material.needsUpdate=!0,f=S,u=S.version,d=s.toneMapping),h.layers.enableAll(),M.unshift(h,h.geometry,h.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new St(new ba(2,2),new Se({name:"BackgroundMaterial",uniforms:_a(ln.background.uniforms),vertexShader:ln.background.vertexShader,fragmentShader:ln.background.fragmentShader,side:Jn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=oe.getTransfer(S.colorSpace)!==_e,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(f!==S||u!==S.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,f=S,u=S.version,d=s.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function p(M,y){M.getRGB(qr,vm(s)),i.buffers.color.setClear(qr.r,qr.g,qr.b,y,r)}return{getClearColor:function(){return o},setClearColor:function(M,y=1){o.set(M),l=y,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,p(o,l)},render:v,addToRenderList:m}}function UM(s,t){const e=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=u(null);let a=n,r=!1;function o(_,x,L,U,G){let H=!1;const B=f(U,L,x);a!==B&&(a=B,c(a.object)),H=d(_,U,L,G),H&&g(_,U,L,G),G!==null&&t.update(G,s.ELEMENT_ARRAY_BUFFER),(H||r)&&(r=!1,S(_,x,L,U),G!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(G).buffer))}function l(){return s.createVertexArray()}function c(_){return s.bindVertexArray(_)}function h(_){return s.deleteVertexArray(_)}function f(_,x,L){const U=L.wireframe===!0;let G=i[_.id];G===void 0&&(G={},i[_.id]=G);let H=G[x.id];H===void 0&&(H={},G[x.id]=H);let B=H[U];return B===void 0&&(B=u(l()),H[U]=B),B}function u(_){const x=[],L=[],U=[];for(let G=0;G<e;G++)x[G]=0,L[G]=0,U[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:x,enabledAttributes:L,attributeDivisors:U,object:_,attributes:{},index:null}}function d(_,x,L,U){const G=a.attributes,H=x.attributes;let B=0;const $=L.getAttributes();for(const N in $)if($[N].location>=0){const Q=G[N];let st=H[N];if(st===void 0&&(N==="instanceMatrix"&&_.instanceMatrix&&(st=_.instanceMatrix),N==="instanceColor"&&_.instanceColor&&(st=_.instanceColor)),Q===void 0||Q.attribute!==st||st&&Q.data!==st.data)return!0;B++}return a.attributesNum!==B||a.index!==U}function g(_,x,L,U){const G={},H=x.attributes;let B=0;const $=L.getAttributes();for(const N in $)if($[N].location>=0){let Q=H[N];Q===void 0&&(N==="instanceMatrix"&&_.instanceMatrix&&(Q=_.instanceMatrix),N==="instanceColor"&&_.instanceColor&&(Q=_.instanceColor));const st={};st.attribute=Q,Q&&Q.data&&(st.data=Q.data),G[N]=st,B++}a.attributes=G,a.attributesNum=B,a.index=U}function v(){const _=a.newAttributes;for(let x=0,L=_.length;x<L;x++)_[x]=0}function m(_){p(_,0)}function p(_,x){const L=a.newAttributes,U=a.enabledAttributes,G=a.attributeDivisors;L[_]=1,U[_]===0&&(s.enableVertexAttribArray(_),U[_]=1),G[_]!==x&&(s.vertexAttribDivisor(_,x),G[_]=x)}function M(){const _=a.newAttributes,x=a.enabledAttributes;for(let L=0,U=x.length;L<U;L++)x[L]!==_[L]&&(s.disableVertexAttribArray(L),x[L]=0)}function y(_,x,L,U,G,H,B){B===!0?s.vertexAttribIPointer(_,x,L,G,H):s.vertexAttribPointer(_,x,L,U,G,H)}function S(_,x,L,U){v();const G=U.attributes,H=L.getAttributes(),B=x.defaultAttributeValues;for(const $ in H){const N=H[$];if(N.location>=0){let Y=G[$];if(Y===void 0&&($==="instanceMatrix"&&_.instanceMatrix&&(Y=_.instanceMatrix),$==="instanceColor"&&_.instanceColor&&(Y=_.instanceColor)),Y!==void 0){const Q=Y.normalized,st=Y.itemSize,Bt=t.get(Y);if(Bt===void 0)continue;const Kt=Bt.buffer,K=Bt.type,et=Bt.bytesPerElement,vt=K===s.INT||K===s.UNSIGNED_INT||Y.gpuType===iu;if(Y.isInterleavedBufferAttribute){const lt=Y.data,At=lt.stride,bt=Y.offset;if(lt.isInstancedInterleavedBuffer){for(let kt=0;kt<N.locationSize;kt++)p(N.location+kt,lt.meshPerAttribute);_.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=lt.meshPerAttribute*lt.count)}else for(let kt=0;kt<N.locationSize;kt++)m(N.location+kt);s.bindBuffer(s.ARRAY_BUFFER,Kt);for(let kt=0;kt<N.locationSize;kt++)y(N.location+kt,st/N.locationSize,K,Q,At*et,(bt+st/N.locationSize*kt)*et,vt)}else{if(Y.isInstancedBufferAttribute){for(let lt=0;lt<N.locationSize;lt++)p(N.location+lt,Y.meshPerAttribute);_.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let lt=0;lt<N.locationSize;lt++)m(N.location+lt);s.bindBuffer(s.ARRAY_BUFFER,Kt);for(let lt=0;lt<N.locationSize;lt++)y(N.location+lt,st/N.locationSize,K,Q,st*et,st/N.locationSize*lt*et,vt)}}else if(B!==void 0){const Q=B[$];if(Q!==void 0)switch(Q.length){case 2:s.vertexAttrib2fv(N.location,Q);break;case 3:s.vertexAttrib3fv(N.location,Q);break;case 4:s.vertexAttrib4fv(N.location,Q);break;default:s.vertexAttrib1fv(N.location,Q)}}}}M()}function C(){A();for(const _ in i){const x=i[_];for(const L in x){const U=x[L];for(const G in U)h(U[G].object),delete U[G];delete x[L]}delete i[_]}}function w(_){if(i[_.id]===void 0)return;const x=i[_.id];for(const L in x){const U=x[L];for(const G in U)h(U[G].object),delete U[G];delete x[L]}delete i[_.id]}function E(_){for(const x in i){const L=i[x];if(L[_.id]===void 0)continue;const U=L[_.id];for(const G in U)h(U[G].object),delete U[G];delete L[_.id]}}function A(){D(),r=!0,a!==n&&(a=n,c(a.object))}function D(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:o,reset:A,resetDefaultState:D,dispose:C,releaseStatesOfGeometry:w,releaseStatesOfProgram:E,initAttributes:v,enableAttribute:m,disableUnusedAttributes:M}}function NM(s,t,e){let i;function n(c){i=c}function a(c,h){s.drawArrays(i,c,h),e.update(h,i,1)}function r(c,h,f){f!==0&&(s.drawArraysInstanced(i,c,h,f),e.update(h,i,f))}function o(c,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,f);let d=0;for(let g=0;g<f;g++)d+=h[g];e.update(d,i,1)}function l(c,h,f,u){if(f===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)r(c[g],h[g],u[g]);else{d.multiDrawArraysInstancedWEBGL(i,c,0,h,0,u,0,f);let g=0;for(let v=0;v<f;v++)g+=h[v];for(let v=0;v<u.length;v++)e.update(g,i,u[v])}}this.setMode=n,this.render=a,this.renderInstances=r,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function FM(s,t,e,i){let n;function a(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){const E=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(E){return!(E!==Hi&&i.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(E){const A=E===sn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==un&&i.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==cn&&!A)}function l(E){if(E==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const f=e.logarithmicDepthBuffer===!0,u=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(u===!0){const E=t.get("EXT_clip_control");E.clipControlEXT(E.LOWER_LEFT_EXT,E.ZERO_TO_ONE_EXT)}const d=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),M=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),y=s.getParameter(s.MAX_VARYING_VECTORS),S=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,w=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:f,reverseDepthBuffer:u,maxTextures:d,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:y,maxFragmentUniforms:S,vertexTextures:C,maxSamples:w}}function OM(s){const t=this;let e=null,i=0,n=!1,a=!1;const r=new cs,o=new Wt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){const d=f.length!==0||u||i!==0||n;return n=u,i=f.length,d},this.beginShadows=function(){a=!0,h(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(f,u){e=h(f,u,0)},this.setState=function(f,u,d){const g=f.clippingPlanes,v=f.clipIntersection,m=f.clipShadows,p=s.get(f);if(!n||g===null||g.length===0||a&&!m)a?h(null):c();else{const M=a?0:i,y=M*4;let S=p.clippingState||null;l.value=S,S=h(g,u,y,d);for(let C=0;C!==y;++C)S[C]=e[C];p.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(f,u,d,g){const v=f!==null?f.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const p=d+v*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let y=0,S=d;y!==v;++y,S+=4)r.copy(f[y]).applyMatrix4(M,o),r.normal.toArray(m,S),m[S+3]=r.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}function zM(s){let t=new WeakMap;function e(r,o){return o===jc?r.mapping=ga:o===Qc&&(r.mapping=va),r}function i(r){if(r&&r.isTexture){const o=r.mapping;if(o===jc||o===Qc)if(t.has(r)){const l=t.get(r).texture;return e(l,r.mapping)}else{const l=r.image;if(l&&l.height>0){const c=new Kg(l.height);return c.fromEquirectangularTexture(s,r),t.set(r,c),r.addEventListener("dispose",n),e(c.texture,r.mapping)}else return null}}return r}function n(r){const o=r.target;o.removeEventListener("dispose",n);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function a(){t=new WeakMap}return{get:i,dispose:a}}class du extends _m{constructor(t=-1,e=1,i=1,n=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2;let a=i-t,r=i+t,o=n+e,l=n-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const la=4,uf=[.125,.215,.35,.446,.526,.582],ps=20,Xl=new du,ff=new gt;let Yl=null,ql=0,$l=0,Kl=!1;const hs=(1+Math.sqrt(5))/2,Ys=1/hs,df=[new T(-hs,Ys,0),new T(hs,Ys,0),new T(-Ys,0,hs),new T(Ys,0,hs),new T(0,hs,-Ys),new T(0,hs,Ys),new T(-1,1,-1),new T(1,1,-1),new T(-1,1,1),new T(1,1,1)];class Rh{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,i=.1,n=100){Yl=this._renderer.getRenderTarget(),ql=this._renderer.getActiveCubeFace(),$l=this._renderer.getActiveMipmapLevel(),Kl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const a=this._allocateTargets();return a.depthBuffer=!0,this._sceneToCubeUV(t,i,n,a),e>0&&this._blur(a,0,0,e),this._applyPMREM(a),this._cleanup(a),a}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=mf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Yl,ql,$l),this._renderer.xr.enabled=Kl,t.scissorTest=!1,$r(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ga||t.mapping===va?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Yl=this._renderer.getRenderTarget(),ql=this._renderer.getActiveCubeFace(),$l=this._renderer.getActiveMipmapLevel(),Kl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:tn,minFilter:tn,generateMipmaps:!1,type:sn,format:Hi,colorSpace:Qn,depthBuffer:!1},n=pf(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=pf(t,e,i);const{_lodMax:a}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=BM(a)),this._blurMaterial=kM(a,t,e)}return n}_compileMaterial(t){const e=new St(this._lodPlanes[0],t);this._renderer.compile(e,Xl)}_sceneToCubeUV(t,e,i,n){const o=new Oi(90,1,e,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,u=h.toneMapping;h.getClearColor(ff),h.toneMapping=Zn,h.autoClear=!1;const d=new ze({name:"PMREM.Background",side:di,depthWrite:!1,depthTest:!1}),g=new St(new ui,d);let v=!1;const m=t.background;m?m.isColor&&(d.color.copy(m),t.background=null,v=!0):(d.color.copy(ff),v=!0);for(let p=0;p<6;p++){const M=p%3;M===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):M===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));const y=this._cubeSize;$r(n,M*y,p>2?y:0,y,y),h.setRenderTarget(n),v&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=u,h.autoClear=f,t.background=m}_textureToCubeUV(t,e){const i=this._renderer,n=t.mapping===ga||t.mapping===va;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=gf()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=mf());const a=n?this._cubemapMaterial:this._equirectMaterial,r=new St(this._lodPlanes[0],a),o=a.uniforms;o.envMap.value=t;const l=this._cubeSize;$r(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(r,Xl)}_applyPMREM(t){const e=this._renderer,i=e.autoClear;e.autoClear=!1;const n=this._lodPlanes.length;for(let a=1;a<n;a++){const r=Math.sqrt(this._sigmas[a]*this._sigmas[a]-this._sigmas[a-1]*this._sigmas[a-1]),o=df[(n-a-1)%df.length];this._blur(t,a-1,a,r,o)}e.autoClear=i}_blur(t,e,i,n,a){const r=this._pingPongRenderTarget;this._halfBlur(t,r,e,i,n,"latitudinal",a),this._halfBlur(r,t,i,i,n,"longitudinal",a)}_halfBlur(t,e,i,n,a,r,o){const l=this._renderer,c=this._blurMaterial;r!=="latitudinal"&&r!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,f=new St(this._lodPlanes[n],c),u=c.uniforms,d=this._sizeLods[i]-1,g=isFinite(a)?Math.PI/(2*d):2*Math.PI/(2*ps-1),v=a/g,m=isFinite(a)?1+Math.floor(h*v):ps;m>ps&&console.warn(`sigmaRadians, ${a}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ps}`);const p=[];let M=0;for(let E=0;E<ps;++E){const A=E/v,D=Math.exp(-A*A/2);p.push(D),E===0?M+=D:E<m&&(M+=2*D)}for(let E=0;E<p.length;E++)p[E]=p[E]/M;u.envMap.value=t.texture,u.samples.value=m,u.weights.value=p,u.latitudinal.value=r==="latitudinal",o&&(u.poleAxis.value=o);const{_lodMax:y}=this;u.dTheta.value=g,u.mipInt.value=y-i;const S=this._sizeLods[n],C=3*S*(n>y-la?n-y+la:0),w=4*(this._cubeSize-S);$r(e,C,w,3*S,2*S),l.setRenderTarget(e),l.render(f,Xl)}}function BM(s){const t=[],e=[],i=[];let n=s;const a=s-la+1+uf.length;for(let r=0;r<a;r++){const o=Math.pow(2,n);e.push(o);let l=1/o;r>s-la?l=uf[r-s+la-1]:r===0&&(l=0),i.push(l);const c=1/(o-2),h=-c,f=1+c,u=[h,h,f,h,f,f,h,h,f,f,h,f],d=6,g=6,v=3,m=2,p=1,M=new Float32Array(v*g*d),y=new Float32Array(m*g*d),S=new Float32Array(p*g*d);for(let w=0;w<d;w++){const E=w%3*2/3-1,A=w>2?0:-1,D=[E,A,0,E+2/3,A,0,E+2/3,A+1,0,E,A,0,E+2/3,A+1,0,E,A+1,0];M.set(D,v*g*w),y.set(u,m*g*w);const _=[w,w,w,w,w,w];S.set(_,p*g*w)}const C=new ve;C.setAttribute("position",new he(M,v)),C.setAttribute("uv",new he(y,m)),C.setAttribute("faceIndex",new he(S,p)),t.push(C),n>la&&n--}return{lodPlanes:t,sizeLods:e,sigmas:i}}function pf(s,t,e){const i=new Ii(s,t,e);return i.texture.mapping=cl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function $r(s,t,e,i,n){s.viewport.set(t,e,i,n),s.scissor.set(t,e,i,n)}function kM(s,t,e){const i=new Float32Array(ps),n=new T(0,1,0);return new Se({name:"SphericalGaussianBlur",defines:{n:ps,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:n}},vertexShader:pu(),fragmentShader:`

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
		`,blending:ti,depthTest:!1,depthWrite:!1})}function mf(){return new Se({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:pu(),fragmentShader:`

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
		`,blending:ti,depthTest:!1,depthWrite:!1})}function gf(){return new Se({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:pu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ti,depthTest:!1,depthWrite:!1})}function pu(){return`

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
	`}function HM(s){let t=new WeakMap,e=null;function i(o){if(o&&o.isTexture){const l=o.mapping,c=l===jc||l===Qc,h=l===ga||l===va;if(c||h){let f=t.get(o);const u=f!==void 0?f.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==u)return e===null&&(e=new Rh(s)),f=c?e.fromEquirectangular(o,f):e.fromCubemap(o,f),f.texture.pmremVersion=o.pmremVersion,t.set(o,f),f.texture;if(f!==void 0)return f.texture;{const d=o.image;return c&&d&&d.height>0||h&&d&&n(d)?(e===null&&(e=new Rh(s)),f=c?e.fromEquirectangular(o):e.fromCubemap(o),f.texture.pmremVersion=o.pmremVersion,t.set(o,f),o.addEventListener("dispose",a),f.texture):null}}}return o}function n(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function a(o){const l=o.target;l.removeEventListener("dispose",a);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function r(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:i,dispose:r}}function GM(s){const t={};function e(i){if(t[i]!==void 0)return t[i];let n;switch(i){case"WEBGL_depth_texture":n=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":n=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":n=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":n=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:n=s.getExtension(i)}return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){const n=e(i);return n===null&&Vo("THREE.WebGLRenderer: "+i+" extension not supported."),n}}}function VM(s,t,e,i){const n={},a=new WeakMap;function r(f){const u=f.target;u.index!==null&&t.remove(u.index);for(const g in u.attributes)t.remove(u.attributes[g]);for(const g in u.morphAttributes){const v=u.morphAttributes[g];for(let m=0,p=v.length;m<p;m++)t.remove(v[m])}u.removeEventListener("dispose",r),delete n[u.id];const d=a.get(u);d&&(t.remove(d),a.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(f,u){return n[u.id]===!0||(u.addEventListener("dispose",r),n[u.id]=!0,e.memory.geometries++),u}function l(f){const u=f.attributes;for(const g in u)t.update(u[g],s.ARRAY_BUFFER);const d=f.morphAttributes;for(const g in d){const v=d[g];for(let m=0,p=v.length;m<p;m++)t.update(v[m],s.ARRAY_BUFFER)}}function c(f){const u=[],d=f.index,g=f.attributes.position;let v=0;if(d!==null){const M=d.array;v=d.version;for(let y=0,S=M.length;y<S;y+=3){const C=M[y+0],w=M[y+1],E=M[y+2];u.push(C,w,w,E,E,C)}}else if(g!==void 0){const M=g.array;v=g.version;for(let y=0,S=M.length/3-1;y<S;y+=3){const C=y+0,w=y+1,E=y+2;u.push(C,w,w,E,E,C)}}else return;const m=new(hm(u)?gm:mm)(u,1);m.version=v;const p=a.get(f);p&&t.remove(p),a.set(f,m)}function h(f){const u=a.get(f);if(u){const d=f.index;d!==null&&u.version<d.version&&c(f)}else c(f);return a.get(f)}return{get:o,update:l,getWireframeAttribute:h}}function WM(s,t,e){let i;function n(u){i=u}let a,r;function o(u){a=u.type,r=u.bytesPerElement}function l(u,d){s.drawElements(i,d,a,u*r),e.update(d,i,1)}function c(u,d,g){g!==0&&(s.drawElementsInstanced(i,d,a,u*r,g),e.update(d,i,g))}function h(u,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,a,u,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];e.update(m,i,1)}function f(u,d,g,v){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<u.length;p++)c(u[p]/r,d[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(i,d,0,a,u,0,v,0,g);let p=0;for(let M=0;M<g;M++)p+=d[M];for(let M=0;M<v.length;M++)e.update(p,i,v[M])}}this.setMode=n,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function XM(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,r,o){switch(e.calls++,r){case s.TRIANGLES:e.triangles+=o*(a/3);break;case s.LINES:e.lines+=o*(a/2);break;case s.LINE_STRIP:e.lines+=o*(a-1);break;case s.LINE_LOOP:e.lines+=o*a;break;case s.POINTS:e.points+=o*a;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",r);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function YM(s,t,e){const i=new WeakMap,n=new Pe;function a(r,o,l){const c=r.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=h!==void 0?h.length:0;let u=i.get(o);if(u===void 0||u.count!==f){let _=function(){A.dispose(),i.delete(o),o.removeEventListener("dispose",_)};var d=_;u!==void 0&&u.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],y=o.morphAttributes.color||[];let S=0;g===!0&&(S=1),v===!0&&(S=2),m===!0&&(S=3);let C=o.attributes.position.count*S,w=1;C>t.maxTextureSize&&(w=Math.ceil(C/t.maxTextureSize),C=t.maxTextureSize);const E=new Float32Array(C*w*4*f),A=new fm(E,C,w,f);A.type=cn,A.needsUpdate=!0;const D=S*4;for(let x=0;x<f;x++){const L=p[x],U=M[x],G=y[x],H=C*w*4*x;for(let B=0;B<L.count;B++){const $=B*D;g===!0&&(n.fromBufferAttribute(L,B),E[H+$+0]=n.x,E[H+$+1]=n.y,E[H+$+2]=n.z,E[H+$+3]=0),v===!0&&(n.fromBufferAttribute(U,B),E[H+$+4]=n.x,E[H+$+5]=n.y,E[H+$+6]=n.z,E[H+$+7]=0),m===!0&&(n.fromBufferAttribute(G,B),E[H+$+8]=n.x,E[H+$+9]=n.y,E[H+$+10]=n.z,E[H+$+11]=G.itemSize===4?n.w:1)}}u={count:f,texture:A,size:new at(C,w)},i.set(o,u),o.addEventListener("dispose",_)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",r.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const v=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(s,"morphTargetBaseInfluence",v),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",u.size)}return{update:a}}function qM(s,t,e,i){let n=new WeakMap;function a(l){const c=i.render.frame,h=l.geometry,f=t.get(l,h);if(n.get(f)!==c&&(t.update(f),n.set(f,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),n.get(l)!==c&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),n.set(l,c))),l.isSkinnedMesh){const u=l.skeleton;n.get(u)!==c&&(u.update(),n.set(u,c))}return f}function r(){n=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:a,dispose:r}}class mu extends pi{constructor(t,e,i,n,a,r,o,l,c,h=ua){if(h!==ua&&h!==Es)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===ua&&(i=Ss),i===void 0&&h===Es&&(i=ws),super(null,n,a,r,o,l,h,i,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:fi,this.minFilter=l!==void 0?l:fi,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const ym=new pi,vf=new mu(1,1),Sm=new fm,wm=new Ug,Em=new Mm,_f=[],Mf=[],xf=new Float32Array(16),yf=new Float32Array(9),Sf=new Float32Array(4);function Ta(s,t,e){const i=s[0];if(i<=0||i>0)return s;const n=t*e;let a=_f[n];if(a===void 0&&(a=new Float32Array(n),_f[n]=a),t!==0){i.toArray(a,0);for(let r=1,o=0;r!==t;++r)o+=e,s[r].toArray(a,o)}return a}function Ve(s,t){if(s.length!==t.length)return!1;for(let e=0,i=s.length;e<i;e++)if(s[e]!==t[e])return!1;return!0}function We(s,t){for(let e=0,i=t.length;e<i;e++)s[e]=t[e]}function fl(s,t){let e=Mf[t];e===void 0&&(e=new Int32Array(t),Mf[t]=e);for(let i=0;i!==t;++i)e[i]=s.allocateTextureUnit();return e}function $M(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function KM(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ve(e,t))return;s.uniform2fv(this.addr,t),We(e,t)}}function ZM(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ve(e,t))return;s.uniform3fv(this.addr,t),We(e,t)}}function JM(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ve(e,t))return;s.uniform4fv(this.addr,t),We(e,t)}}function jM(s,t){const e=this.cache,i=t.elements;if(i===void 0){if(Ve(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),We(e,t)}else{if(Ve(e,i))return;Sf.set(i),s.uniformMatrix2fv(this.addr,!1,Sf),We(e,i)}}function QM(s,t){const e=this.cache,i=t.elements;if(i===void 0){if(Ve(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),We(e,t)}else{if(Ve(e,i))return;yf.set(i),s.uniformMatrix3fv(this.addr,!1,yf),We(e,i)}}function tx(s,t){const e=this.cache,i=t.elements;if(i===void 0){if(Ve(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),We(e,t)}else{if(Ve(e,i))return;xf.set(i),s.uniformMatrix4fv(this.addr,!1,xf),We(e,i)}}function ex(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function ix(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ve(e,t))return;s.uniform2iv(this.addr,t),We(e,t)}}function nx(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ve(e,t))return;s.uniform3iv(this.addr,t),We(e,t)}}function sx(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ve(e,t))return;s.uniform4iv(this.addr,t),We(e,t)}}function ax(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function rx(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ve(e,t))return;s.uniform2uiv(this.addr,t),We(e,t)}}function ox(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ve(e,t))return;s.uniform3uiv(this.addr,t),We(e,t)}}function lx(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ve(e,t))return;s.uniform4uiv(this.addr,t),We(e,t)}}function cx(s,t,e){const i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let a;this.type===s.SAMPLER_2D_SHADOW?(vf.compareFunction=cm,a=vf):a=ym,e.setTexture2D(t||a,n)}function hx(s,t,e){const i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||wm,n)}function ux(s,t,e){const i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||Em,n)}function fx(s,t,e){const i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||Sm,n)}function dx(s){switch(s){case 5126:return $M;case 35664:return KM;case 35665:return ZM;case 35666:return JM;case 35674:return jM;case 35675:return QM;case 35676:return tx;case 5124:case 35670:return ex;case 35667:case 35671:return ix;case 35668:case 35672:return nx;case 35669:case 35673:return sx;case 5125:return ax;case 36294:return rx;case 36295:return ox;case 36296:return lx;case 35678:case 36198:case 36298:case 36306:case 35682:return cx;case 35679:case 36299:case 36307:return hx;case 35680:case 36300:case 36308:case 36293:return ux;case 36289:case 36303:case 36311:case 36292:return fx}}function px(s,t){s.uniform1fv(this.addr,t)}function mx(s,t){const e=Ta(t,this.size,2);s.uniform2fv(this.addr,e)}function gx(s,t){const e=Ta(t,this.size,3);s.uniform3fv(this.addr,e)}function vx(s,t){const e=Ta(t,this.size,4);s.uniform4fv(this.addr,e)}function _x(s,t){const e=Ta(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function Mx(s,t){const e=Ta(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function xx(s,t){const e=Ta(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function yx(s,t){s.uniform1iv(this.addr,t)}function Sx(s,t){s.uniform2iv(this.addr,t)}function wx(s,t){s.uniform3iv(this.addr,t)}function Ex(s,t){s.uniform4iv(this.addr,t)}function bx(s,t){s.uniform1uiv(this.addr,t)}function Tx(s,t){s.uniform2uiv(this.addr,t)}function Ax(s,t){s.uniform3uiv(this.addr,t)}function Rx(s,t){s.uniform4uiv(this.addr,t)}function Cx(s,t,e){const i=this.cache,n=t.length,a=fl(e,n);Ve(i,a)||(s.uniform1iv(this.addr,a),We(i,a));for(let r=0;r!==n;++r)e.setTexture2D(t[r]||ym,a[r])}function Px(s,t,e){const i=this.cache,n=t.length,a=fl(e,n);Ve(i,a)||(s.uniform1iv(this.addr,a),We(i,a));for(let r=0;r!==n;++r)e.setTexture3D(t[r]||wm,a[r])}function Lx(s,t,e){const i=this.cache,n=t.length,a=fl(e,n);Ve(i,a)||(s.uniform1iv(this.addr,a),We(i,a));for(let r=0;r!==n;++r)e.setTextureCube(t[r]||Em,a[r])}function Dx(s,t,e){const i=this.cache,n=t.length,a=fl(e,n);Ve(i,a)||(s.uniform1iv(this.addr,a),We(i,a));for(let r=0;r!==n;++r)e.setTexture2DArray(t[r]||Sm,a[r])}function Ix(s){switch(s){case 5126:return px;case 35664:return mx;case 35665:return gx;case 35666:return vx;case 35674:return _x;case 35675:return Mx;case 35676:return xx;case 5124:case 35670:return yx;case 35667:case 35671:return Sx;case 35668:case 35672:return wx;case 35669:case 35673:return Ex;case 5125:return bx;case 36294:return Tx;case 36295:return Ax;case 36296:return Rx;case 35678:case 36198:case 36298:case 36306:case 35682:return Cx;case 35679:case 36299:case 36307:return Px;case 35680:case 36300:case 36308:case 36293:return Lx;case 36289:case 36303:case 36311:case 36292:return Dx}}class Ux{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=dx(e.type)}}class Nx{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Ix(e.type)}}class Fx{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){const n=this.seq;for(let a=0,r=n.length;a!==r;++a){const o=n[a];o.setValue(t,e[o.id],i)}}}const Zl=/(\w+)(\])?(\[|\.)?/g;function wf(s,t){s.seq.push(t),s.map[t.id]=t}function Ox(s,t,e){const i=s.name,n=i.length;for(Zl.lastIndex=0;;){const a=Zl.exec(i),r=Zl.lastIndex;let o=a[1];const l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===n){wf(e,c===void 0?new Ux(o,s,t):new Nx(o,s,t));break}else{let f=e.map[o];f===void 0&&(f=new Fx(o),wf(e,f)),e=f}}}class Wo{constructor(t,e){this.seq=[],this.map={};const i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let n=0;n<i;++n){const a=t.getActiveUniform(e,n),r=t.getUniformLocation(e,a.name);Ox(a,r,this)}}setValue(t,e,i,n){const a=this.map[e];a!==void 0&&a.setValue(t,i,n)}setOptional(t,e,i){const n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let a=0,r=e.length;a!==r;++a){const o=e[a],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,n)}}static seqWithValue(t,e){const i=[];for(let n=0,a=t.length;n!==a;++n){const r=t[n];r.id in e&&i.push(r)}return i}}function Ef(s,t,e){const i=s.createShader(t);return s.shaderSource(i,e),s.compileShader(i),i}const zx=37297;let Bx=0;function kx(s,t){const e=s.split(`
`),i=[],n=Math.max(t-6,0),a=Math.min(t+6,e.length);for(let r=n;r<a;r++){const o=r+1;i.push(`${o===t?">":" "} ${o}: ${e[r]}`)}return i.join(`
`)}function Hx(s){const t=oe.getPrimaries(oe.workingColorSpace),e=oe.getPrimaries(s);let i;switch(t===e?i="":t===jo&&e===Jo?i="LinearDisplayP3ToLinearSRGB":t===Jo&&e===jo&&(i="LinearSRGBToLinearDisplayP3"),s){case Qn:case ul:return[i,"LinearTransferOETF"];case wi:case cu:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",s),[i,"LinearTransferOETF"]}}function bf(s,t,e){const i=s.getShaderParameter(t,s.COMPILE_STATUS),n=s.getShaderInfoLog(t).trim();if(i&&n==="")return"";const a=/ERROR: 0:(\d+)/.exec(n);if(a){const r=parseInt(a[1]);return e.toUpperCase()+`

`+n+`

`+kx(s.getShaderSource(t),r)}else return n}function Gx(s,t){const e=Hx(t);return`vec4 ${s}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function Vx(s,t){let e;switch(t){case $p:e="Linear";break;case Kp:e="Reinhard";break;case Zp:e="Cineon";break;case eu:e="ACESFilmic";break;case Jp:e="AgX";break;case jp:e="Neutral";break;case Z0:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Kr=new T;function Wx(){oe.getLuminanceCoefficients(Kr);const s=Kr.x.toFixed(4),t=Kr.y.toFixed(4),e=Kr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Xx(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(tr).join(`
`)}function Yx(s){const t=[];for(const e in s){const i=s[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function qx(s,t){const e={},i=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){const a=s.getActiveAttrib(t,n),r=a.name;let o=1;a.type===s.FLOAT_MAT2&&(o=2),a.type===s.FLOAT_MAT3&&(o=3),a.type===s.FLOAT_MAT4&&(o=4),e[r]={type:a.type,location:s.getAttribLocation(t,r),locationSize:o}}return e}function tr(s){return s!==""}function Tf(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Af(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const $x=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ch(s){return s.replace($x,Zx)}const Kx=new Map;function Zx(s,t){let e=Rt[t];if(e===void 0){const i=Kx.get(t);if(i!==void 0)e=Rt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return Ch(e)}const Jx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Rf(s){return s.replace(Jx,jx)}function jx(s,t,e,i){let n="";for(let a=parseInt(t);a<parseInt(e);a++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return n}function Cf(s){let t=`precision ${s.precision} float;
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
#define LOW_PRECISION`),t}function Qx(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Yp?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===I0?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===wn&&(t="SHADOWMAP_TYPE_VSM"),t}function ty(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case ga:case va:t="ENVMAP_TYPE_CUBE";break;case cl:t="ENVMAP_TYPE_CUBE_UV";break}return t}function ey(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case va:t="ENVMAP_MODE_REFRACTION";break}return t}function iy(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case tu:t="ENVMAP_BLENDING_MULTIPLY";break;case $0:t="ENVMAP_BLENDING_MIX";break;case K0:t="ENVMAP_BLENDING_ADD";break}return t}function ny(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:i,maxMip:e}}function sy(s,t,e,i){const n=s.getContext(),a=e.defines;let r=e.vertexShader,o=e.fragmentShader;const l=Qx(e),c=ty(e),h=ey(e),f=iy(e),u=ny(e),d=Xx(e),g=Yx(a),v=n.createProgram();let m,p,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(tr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(tr).join(`
`),p.length>0&&(p+=`
`)):(m=[Cf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(tr).join(`
`),p=[Cf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Zn?"#define TONE_MAPPING":"",e.toneMapping!==Zn?Rt.tonemapping_pars_fragment:"",e.toneMapping!==Zn?Vx("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Rt.colorspace_pars_fragment,Gx("linearToOutputTexel",e.outputColorSpace),Wx(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(tr).join(`
`)),r=Ch(r),r=Tf(r,e),r=Af(r,e),o=Ch(o),o=Tf(o,e),o=Af(o,e),r=Rf(r),o=Rf(o),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===Xu?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Xu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=M+m+r,S=M+p+o,C=Ef(n,n.VERTEX_SHADER,y),w=Ef(n,n.FRAGMENT_SHADER,S);n.attachShader(v,C),n.attachShader(v,w),e.index0AttributeName!==void 0?n.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&n.bindAttribLocation(v,0,"position"),n.linkProgram(v);function E(x){if(s.debug.checkShaderErrors){const L=n.getProgramInfoLog(v).trim(),U=n.getShaderInfoLog(C).trim(),G=n.getShaderInfoLog(w).trim();let H=!0,B=!0;if(n.getProgramParameter(v,n.LINK_STATUS)===!1)if(H=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,v,C,w);else{const $=bf(n,C,"vertex"),N=bf(n,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(v,n.VALIDATE_STATUS)+`

Material Name: `+x.name+`
Material Type: `+x.type+`

Program Info Log: `+L+`
`+$+`
`+N)}else L!==""?console.warn("THREE.WebGLProgram: Program Info Log:",L):(U===""||G==="")&&(B=!1);B&&(x.diagnostics={runnable:H,programLog:L,vertexShader:{log:U,prefix:m},fragmentShader:{log:G,prefix:p}})}n.deleteShader(C),n.deleteShader(w),A=new Wo(n,v),D=qx(n,v)}let A;this.getUniforms=function(){return A===void 0&&E(this),A};let D;this.getAttributes=function(){return D===void 0&&E(this),D};let _=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=n.getProgramParameter(v,zx)),_},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Bx++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=C,this.fragmentShader=w,this}let ay=0;class ry{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,i=t.fragmentShader,n=this._getShaderStage(e),a=this._getShaderStage(i),r=this._getShaderCacheForMaterial(t);return r.has(n)===!1&&(r.add(n),n.usedTimes++),r.has(a)===!1&&(r.add(a),a.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){const e=this.shaderCache;let i=e.get(t);return i===void 0&&(i=new oy(t),e.set(t,i)),i}}class oy{constructor(t){this.id=ay++,this.code=t,this.usedTimes=0}}function ly(s,t,e,i,n,a,r){const o=new dm,l=new ry,c=new Set,h=[],f=n.logarithmicDepthBuffer,u=n.reverseDepthBuffer,d=n.vertexTextures;let g=n.precision;const v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(_){return c.add(_),_===0?"uv":`uv${_}`}function p(_,x,L,U,G){const H=U.fog,B=G.geometry,$=_.isMeshStandardMaterial?U.environment:null,N=(_.isMeshStandardMaterial?e:t).get(_.envMap||$),Y=N&&N.mapping===cl?N.image.height:null,Q=v[_.type];_.precision!==null&&(g=n.getMaxPrecision(_.precision),g!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",g,"instead."));const st=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Bt=st!==void 0?st.length:0;let Kt=0;B.morphAttributes.position!==void 0&&(Kt=1),B.morphAttributes.normal!==void 0&&(Kt=2),B.morphAttributes.color!==void 0&&(Kt=3);let K,et,vt,lt;if(Q){const yi=ln[Q];K=yi.vertexShader,et=yi.fragmentShader}else K=_.vertexShader,et=_.fragmentShader,l.update(_),vt=l.getVertexShaderID(_),lt=l.getFragmentShaderID(_);const At=s.getRenderTarget(),bt=G.isInstancedMesh===!0,kt=G.isBatchedMesh===!0,ae=!!_.map,$t=!!_.matcap,F=!!N,$e=!!_.aoMap,Yt=!!_.lightMap,Zt=!!_.bumpMap,Pt=!!_.normalMap,ue=!!_.displacementMap,Lt=!!_.emissiveMap,P=!!_.metalnessMap,b=!!_.roughnessMap,V=_.anisotropy>0,J=_.clearcoat>0,tt=_.dispersion>0,Z=_.iridescence>0,xt=_.sheen>0,ot=_.transmission>0,ht=V&&!!_.anisotropyMap,qt=J&&!!_.clearcoatMap,it=J&&!!_.clearcoatNormalMap,ut=J&&!!_.clearcoatRoughnessMap,It=Z&&!!_.iridescenceMap,Ut=Z&&!!_.iridescenceThicknessMap,_t=xt&&!!_.sheenColorMap,Jt=xt&&!!_.sheenRoughnessMap,Ot=!!_.specularMap,ie=!!_.specularColorMap,O=!!_.specularIntensityMap,ct=ot&&!!_.transmissionMap,q=ot&&!!_.thicknessMap,j=!!_.gradientMap,ft=!!_.alphaMap,mt=_.alphaTest>0,te=!!_.alphaHash,Ue=!!_.extensions;let xi=Zn;_.toneMapped&&(At===null||At.isXRRenderTarget===!0)&&(xi=s.toneMapping);const re={shaderID:Q,shaderType:_.type,shaderName:_.name,vertexShader:K,fragmentShader:et,defines:_.defines,customVertexShaderID:vt,customFragmentShaderID:lt,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:g,batching:kt,batchingColor:kt&&G._colorsTexture!==null,instancing:bt,instancingColor:bt&&G.instanceColor!==null,instancingMorph:bt&&G.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:At===null?s.outputColorSpace:At.isXRRenderTarget===!0?At.texture.colorSpace:Qn,alphaToCoverage:!!_.alphaToCoverage,map:ae,matcap:$t,envMap:F,envMapMode:F&&N.mapping,envMapCubeUVHeight:Y,aoMap:$e,lightMap:Yt,bumpMap:Zt,normalMap:Pt,displacementMap:d&&ue,emissiveMap:Lt,normalMapObjectSpace:Pt&&_.normalMapType===tg,normalMapTangentSpace:Pt&&_.normalMapType===hl,metalnessMap:P,roughnessMap:b,anisotropy:V,anisotropyMap:ht,clearcoat:J,clearcoatMap:qt,clearcoatNormalMap:it,clearcoatRoughnessMap:ut,dispersion:tt,iridescence:Z,iridescenceMap:It,iridescenceThicknessMap:Ut,sheen:xt,sheenColorMap:_t,sheenRoughnessMap:Jt,specularMap:Ot,specularColorMap:ie,specularIntensityMap:O,transmission:ot,transmissionMap:ct,thicknessMap:q,gradientMap:j,opaque:_.transparent===!1&&_.blending===ha&&_.alphaToCoverage===!1,alphaMap:ft,alphaTest:mt,alphaHash:te,combine:_.combine,mapUv:ae&&m(_.map.channel),aoMapUv:$e&&m(_.aoMap.channel),lightMapUv:Yt&&m(_.lightMap.channel),bumpMapUv:Zt&&m(_.bumpMap.channel),normalMapUv:Pt&&m(_.normalMap.channel),displacementMapUv:ue&&m(_.displacementMap.channel),emissiveMapUv:Lt&&m(_.emissiveMap.channel),metalnessMapUv:P&&m(_.metalnessMap.channel),roughnessMapUv:b&&m(_.roughnessMap.channel),anisotropyMapUv:ht&&m(_.anisotropyMap.channel),clearcoatMapUv:qt&&m(_.clearcoatMap.channel),clearcoatNormalMapUv:it&&m(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ut&&m(_.clearcoatRoughnessMap.channel),iridescenceMapUv:It&&m(_.iridescenceMap.channel),iridescenceThicknessMapUv:Ut&&m(_.iridescenceThicknessMap.channel),sheenColorMapUv:_t&&m(_.sheenColorMap.channel),sheenRoughnessMapUv:Jt&&m(_.sheenRoughnessMap.channel),specularMapUv:Ot&&m(_.specularMap.channel),specularColorMapUv:ie&&m(_.specularColorMap.channel),specularIntensityMapUv:O&&m(_.specularIntensityMap.channel),transmissionMapUv:ct&&m(_.transmissionMap.channel),thicknessMapUv:q&&m(_.thicknessMap.channel),alphaMapUv:ft&&m(_.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(Pt||V),vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!B.attributes.uv&&(ae||ft),fog:!!H,useFog:_.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:_.flatShading===!0,sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:f,reverseDepthBuffer:u,skinning:G.isSkinnedMesh===!0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:Bt,morphTextureStride:Kt,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:s.shadowMap.enabled&&L.length>0,shadowMapType:s.shadowMap.type,toneMapping:xi,decodeVideoTexture:ae&&_.map.isVideoTexture===!0&&oe.getTransfer(_.map.colorSpace)===_e,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Ge,flipSided:_.side===di,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Ue&&_.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ue&&_.extensions.multiDraw===!0||kt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return re.vertexUv1s=c.has(1),re.vertexUv2s=c.has(2),re.vertexUv3s=c.has(3),c.clear(),re}function M(_){const x=[];if(_.shaderID?x.push(_.shaderID):(x.push(_.customVertexShaderID),x.push(_.customFragmentShaderID)),_.defines!==void 0)for(const L in _.defines)x.push(L),x.push(_.defines[L]);return _.isRawShaderMaterial===!1&&(y(x,_),S(x,_),x.push(s.outputColorSpace)),x.push(_.customProgramCacheKey),x.join()}function y(_,x){_.push(x.precision),_.push(x.outputColorSpace),_.push(x.envMapMode),_.push(x.envMapCubeUVHeight),_.push(x.mapUv),_.push(x.alphaMapUv),_.push(x.lightMapUv),_.push(x.aoMapUv),_.push(x.bumpMapUv),_.push(x.normalMapUv),_.push(x.displacementMapUv),_.push(x.emissiveMapUv),_.push(x.metalnessMapUv),_.push(x.roughnessMapUv),_.push(x.anisotropyMapUv),_.push(x.clearcoatMapUv),_.push(x.clearcoatNormalMapUv),_.push(x.clearcoatRoughnessMapUv),_.push(x.iridescenceMapUv),_.push(x.iridescenceThicknessMapUv),_.push(x.sheenColorMapUv),_.push(x.sheenRoughnessMapUv),_.push(x.specularMapUv),_.push(x.specularColorMapUv),_.push(x.specularIntensityMapUv),_.push(x.transmissionMapUv),_.push(x.thicknessMapUv),_.push(x.combine),_.push(x.fogExp2),_.push(x.sizeAttenuation),_.push(x.morphTargetsCount),_.push(x.morphAttributeCount),_.push(x.numDirLights),_.push(x.numPointLights),_.push(x.numSpotLights),_.push(x.numSpotLightMaps),_.push(x.numHemiLights),_.push(x.numRectAreaLights),_.push(x.numDirLightShadows),_.push(x.numPointLightShadows),_.push(x.numSpotLightShadows),_.push(x.numSpotLightShadowsWithMaps),_.push(x.numLightProbes),_.push(x.shadowMapType),_.push(x.toneMapping),_.push(x.numClippingPlanes),_.push(x.numClipIntersection),_.push(x.depthPacking)}function S(_,x){o.disableAll(),x.supportsVertexTextures&&o.enable(0),x.instancing&&o.enable(1),x.instancingColor&&o.enable(2),x.instancingMorph&&o.enable(3),x.matcap&&o.enable(4),x.envMap&&o.enable(5),x.normalMapObjectSpace&&o.enable(6),x.normalMapTangentSpace&&o.enable(7),x.clearcoat&&o.enable(8),x.iridescence&&o.enable(9),x.alphaTest&&o.enable(10),x.vertexColors&&o.enable(11),x.vertexAlphas&&o.enable(12),x.vertexUv1s&&o.enable(13),x.vertexUv2s&&o.enable(14),x.vertexUv3s&&o.enable(15),x.vertexTangents&&o.enable(16),x.anisotropy&&o.enable(17),x.alphaHash&&o.enable(18),x.batching&&o.enable(19),x.dispersion&&o.enable(20),x.batchingColor&&o.enable(21),_.push(o.mask),o.disableAll(),x.fog&&o.enable(0),x.useFog&&o.enable(1),x.flatShading&&o.enable(2),x.logarithmicDepthBuffer&&o.enable(3),x.reverseDepthBuffer&&o.enable(4),x.skinning&&o.enable(5),x.morphTargets&&o.enable(6),x.morphNormals&&o.enable(7),x.morphColors&&o.enable(8),x.premultipliedAlpha&&o.enable(9),x.shadowMapEnabled&&o.enable(10),x.doubleSided&&o.enable(11),x.flipSided&&o.enable(12),x.useDepthPacking&&o.enable(13),x.dithering&&o.enable(14),x.transmission&&o.enable(15),x.sheen&&o.enable(16),x.opaque&&o.enable(17),x.pointsUvs&&o.enable(18),x.decodeVideoTexture&&o.enable(19),x.alphaToCoverage&&o.enable(20),_.push(o.mask)}function C(_){const x=v[_.type];let L;if(x){const U=ln[x];L=Bi.clone(U.uniforms)}else L=_.uniforms;return L}function w(_,x){let L;for(let U=0,G=h.length;U<G;U++){const H=h[U];if(H.cacheKey===x){L=H,++L.usedTimes;break}}return L===void 0&&(L=new sy(s,x,_,a),h.push(L)),L}function E(_){if(--_.usedTimes===0){const x=h.indexOf(_);h[x]=h[h.length-1],h.pop(),_.destroy()}}function A(_){l.remove(_)}function D(){l.dispose()}return{getParameters:p,getProgramCacheKey:M,getUniforms:C,acquireProgram:w,releaseProgram:E,releaseShaderCache:A,programs:h,dispose:D}}function cy(){let s=new WeakMap;function t(r){return s.has(r)}function e(r){let o=s.get(r);return o===void 0&&(o={},s.set(r,o)),o}function i(r){s.delete(r)}function n(r,o,l){s.get(r)[o]=l}function a(){s=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:a}}function hy(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function Pf(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function Lf(){const s=[];let t=0;const e=[],i=[],n=[];function a(){t=0,e.length=0,i.length=0,n.length=0}function r(f,u,d,g,v,m){let p=s[t];return p===void 0?(p={id:f.id,object:f,geometry:u,material:d,groupOrder:g,renderOrder:f.renderOrder,z:v,group:m},s[t]=p):(p.id=f.id,p.object=f,p.geometry=u,p.material=d,p.groupOrder=g,p.renderOrder=f.renderOrder,p.z=v,p.group=m),t++,p}function o(f,u,d,g,v,m){const p=r(f,u,d,g,v,m);d.transmission>0?i.push(p):d.transparent===!0?n.push(p):e.push(p)}function l(f,u,d,g,v,m){const p=r(f,u,d,g,v,m);d.transmission>0?i.unshift(p):d.transparent===!0?n.unshift(p):e.unshift(p)}function c(f,u){e.length>1&&e.sort(f||hy),i.length>1&&i.sort(u||Pf),n.length>1&&n.sort(u||Pf)}function h(){for(let f=t,u=s.length;f<u;f++){const d=s[f];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:i,transparent:n,init:a,push:o,unshift:l,finish:h,sort:c}}function uy(){let s=new WeakMap;function t(i,n){const a=s.get(i);let r;return a===void 0?(r=new Lf,s.set(i,[r])):n>=a.length?(r=new Lf,a.push(r)):r=a[n],r}function e(){s=new WeakMap}return{get:t,dispose:e}}function fy(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new T,color:new gt};break;case"SpotLight":e={position:new T,direction:new T,color:new gt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new T,color:new gt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new T,skyColor:new gt,groundColor:new gt};break;case"RectAreaLight":e={color:new gt,position:new T,halfWidth:new T,halfHeight:new T};break}return s[t.id]=e,e}}}function dy(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let py=0;function my(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function gy(s){const t=new fy,e=dy(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new T);const n=new T,a=new zt,r=new zt;function o(c){let h=0,f=0,u=0;for(let D=0;D<9;D++)i.probe[D].set(0,0,0);let d=0,g=0,v=0,m=0,p=0,M=0,y=0,S=0,C=0,w=0,E=0;c.sort(my);for(let D=0,_=c.length;D<_;D++){const x=c[D],L=x.color,U=x.intensity,G=x.distance,H=x.shadow&&x.shadow.map?x.shadow.map.texture:null;if(x.isAmbientLight)h+=L.r*U,f+=L.g*U,u+=L.b*U;else if(x.isLightProbe){for(let B=0;B<9;B++)i.probe[B].addScaledVector(x.sh.coefficients[B],U);E++}else if(x.isDirectionalLight){const B=t.get(x);if(B.color.copy(x.color).multiplyScalar(x.intensity),x.castShadow){const $=x.shadow,N=e.get(x);N.shadowIntensity=$.intensity,N.shadowBias=$.bias,N.shadowNormalBias=$.normalBias,N.shadowRadius=$.radius,N.shadowMapSize=$.mapSize,i.directionalShadow[d]=N,i.directionalShadowMap[d]=H,i.directionalShadowMatrix[d]=x.shadow.matrix,M++}i.directional[d]=B,d++}else if(x.isSpotLight){const B=t.get(x);B.position.setFromMatrixPosition(x.matrixWorld),B.color.copy(L).multiplyScalar(U),B.distance=G,B.coneCos=Math.cos(x.angle),B.penumbraCos=Math.cos(x.angle*(1-x.penumbra)),B.decay=x.decay,i.spot[v]=B;const $=x.shadow;if(x.map&&(i.spotLightMap[C]=x.map,C++,$.updateMatrices(x),x.castShadow&&w++),i.spotLightMatrix[v]=$.matrix,x.castShadow){const N=e.get(x);N.shadowIntensity=$.intensity,N.shadowBias=$.bias,N.shadowNormalBias=$.normalBias,N.shadowRadius=$.radius,N.shadowMapSize=$.mapSize,i.spotShadow[v]=N,i.spotShadowMap[v]=H,S++}v++}else if(x.isRectAreaLight){const B=t.get(x);B.color.copy(L).multiplyScalar(U),B.halfWidth.set(x.width*.5,0,0),B.halfHeight.set(0,x.height*.5,0),i.rectArea[m]=B,m++}else if(x.isPointLight){const B=t.get(x);if(B.color.copy(x.color).multiplyScalar(x.intensity),B.distance=x.distance,B.decay=x.decay,x.castShadow){const $=x.shadow,N=e.get(x);N.shadowIntensity=$.intensity,N.shadowBias=$.bias,N.shadowNormalBias=$.normalBias,N.shadowRadius=$.radius,N.shadowMapSize=$.mapSize,N.shadowCameraNear=$.camera.near,N.shadowCameraFar=$.camera.far,i.pointShadow[g]=N,i.pointShadowMap[g]=H,i.pointShadowMatrix[g]=x.shadow.matrix,y++}i.point[g]=B,g++}else if(x.isHemisphereLight){const B=t.get(x);B.skyColor.copy(x.color).multiplyScalar(U),B.groundColor.copy(x.groundColor).multiplyScalar(U),i.hemi[p]=B,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=rt.LTC_FLOAT_1,i.rectAreaLTC2=rt.LTC_FLOAT_2):(i.rectAreaLTC1=rt.LTC_HALF_1,i.rectAreaLTC2=rt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=f,i.ambient[2]=u;const A=i.hash;(A.directionalLength!==d||A.pointLength!==g||A.spotLength!==v||A.rectAreaLength!==m||A.hemiLength!==p||A.numDirectionalShadows!==M||A.numPointShadows!==y||A.numSpotShadows!==S||A.numSpotMaps!==C||A.numLightProbes!==E)&&(i.directional.length=d,i.spot.length=v,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.pointShadow.length=y,i.pointShadowMap.length=y,i.spotShadow.length=S,i.spotShadowMap.length=S,i.directionalShadowMatrix.length=M,i.pointShadowMatrix.length=y,i.spotLightMatrix.length=S+C-w,i.spotLightMap.length=C,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=E,A.directionalLength=d,A.pointLength=g,A.spotLength=v,A.rectAreaLength=m,A.hemiLength=p,A.numDirectionalShadows=M,A.numPointShadows=y,A.numSpotShadows=S,A.numSpotMaps=C,A.numLightProbes=E,i.version=py++)}function l(c,h){let f=0,u=0,d=0,g=0,v=0;const m=h.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){const y=c[p];if(y.isDirectionalLight){const S=i.directional[f];S.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),S.direction.sub(n),S.direction.transformDirection(m),f++}else if(y.isSpotLight){const S=i.spot[d];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),S.direction.sub(n),S.direction.transformDirection(m),d++}else if(y.isRectAreaLight){const S=i.rectArea[g];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),r.identity(),a.copy(y.matrixWorld),a.premultiply(m),r.extractRotation(a),S.halfWidth.set(y.width*.5,0,0),S.halfHeight.set(0,y.height*.5,0),S.halfWidth.applyMatrix4(r),S.halfHeight.applyMatrix4(r),g++}else if(y.isPointLight){const S=i.point[u];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),u++}else if(y.isHemisphereLight){const S=i.hemi[v];S.direction.setFromMatrixPosition(y.matrixWorld),S.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:i}}function Df(s){const t=new gy(s),e=[],i=[];function n(h){c.camera=h,e.length=0,i.length=0}function a(h){e.push(h)}function r(h){i.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:n,state:c,setupLights:o,setupLightsView:l,pushLight:a,pushShadow:r}}function vy(s){let t=new WeakMap;function e(n,a=0){const r=t.get(n);let o;return r===void 0?(o=new Df(s),t.set(n,[o])):a>=r.length?(o=new Df(s),r.push(o)):o=r[a],o}function i(){t=new WeakMap}return{get:e,dispose:i}}class _y extends an{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=j0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class My extends an{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const xy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,yy=`uniform sampler2D shadow_pass;
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
}`;function Sy(s,t,e){let i=new fu;const n=new at,a=new at,r=new Pe,o=new _y({depthPacking:Q0}),l=new My,c={},h=e.maxTextureSize,f={[Jn]:di,[di]:Jn,[Ge]:Ge},u=new Se({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new at},radius:{value:4}},vertexShader:xy,fragmentShader:yy}),d=u.clone();d.defines.HORIZONTAL_PASS=1;const g=new ve;g.setAttribute("position",new he(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new St(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Yp;let p=this.type;this.render=function(w,E,A){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;const D=s.getRenderTarget(),_=s.getActiveCubeFace(),x=s.getActiveMipmapLevel(),L=s.state;L.setBlending(ti),L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const U=p!==wn&&this.type===wn,G=p===wn&&this.type!==wn;for(let H=0,B=w.length;H<B;H++){const $=w[H],N=$.shadow;if(N===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(N.autoUpdate===!1&&N.needsUpdate===!1)continue;n.copy(N.mapSize);const Y=N.getFrameExtents();if(n.multiply(Y),a.copy(N.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(a.x=Math.floor(h/Y.x),n.x=a.x*Y.x,N.mapSize.x=a.x),n.y>h&&(a.y=Math.floor(h/Y.y),n.y=a.y*Y.y,N.mapSize.y=a.y)),N.map===null||U===!0||G===!0){const st=this.type!==wn?{minFilter:fi,magFilter:fi}:{};N.map!==null&&N.map.dispose(),N.map=new Ii(n.x,n.y,st),N.map.texture.name=$.name+".shadowMap",N.camera.updateProjectionMatrix()}s.setRenderTarget(N.map),s.clear();const Q=N.getViewportCount();for(let st=0;st<Q;st++){const Bt=N.getViewport(st);r.set(a.x*Bt.x,a.y*Bt.y,a.x*Bt.z,a.y*Bt.w),L.viewport(r),N.updateMatrices($,st),i=N.getFrustum(),S(E,A,N.camera,$,this.type)}N.isPointLightShadow!==!0&&this.type===wn&&M(N,A),N.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(D,_,x)};function M(w,E){const A=t.update(v);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,d.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Ii(n.x,n.y)),u.uniforms.shadow_pass.value=w.map.texture,u.uniforms.resolution.value=w.mapSize,u.uniforms.radius.value=w.radius,s.setRenderTarget(w.mapPass),s.clear(),s.renderBufferDirect(E,null,A,u,v,null),d.uniforms.shadow_pass.value=w.mapPass.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,s.setRenderTarget(w.map),s.clear(),s.renderBufferDirect(E,null,A,d,v,null)}function y(w,E,A,D){let _=null;const x=A.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(x!==void 0)_=x;else if(_=A.isPointLight===!0?l:o,s.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0){const L=_.uuid,U=E.uuid;let G=c[L];G===void 0&&(G={},c[L]=G);let H=G[U];H===void 0&&(H=_.clone(),G[U]=H,E.addEventListener("dispose",C)),_=H}if(_.visible=E.visible,_.wireframe=E.wireframe,D===wn?_.side=E.shadowSide!==null?E.shadowSide:E.side:_.side=E.shadowSide!==null?E.shadowSide:f[E.side],_.alphaMap=E.alphaMap,_.alphaTest=E.alphaTest,_.map=E.map,_.clipShadows=E.clipShadows,_.clippingPlanes=E.clippingPlanes,_.clipIntersection=E.clipIntersection,_.displacementMap=E.displacementMap,_.displacementScale=E.displacementScale,_.displacementBias=E.displacementBias,_.wireframeLinewidth=E.wireframeLinewidth,_.linewidth=E.linewidth,A.isPointLight===!0&&_.isMeshDistanceMaterial===!0){const L=s.properties.get(_);L.light=A}return _}function S(w,E,A,D,_){if(w.visible===!1)return;if(w.layers.test(E.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&_===wn)&&(!w.frustumCulled||i.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,w.matrixWorld);const U=t.update(w),G=w.material;if(Array.isArray(G)){const H=U.groups;for(let B=0,$=H.length;B<$;B++){const N=H[B],Y=G[N.materialIndex];if(Y&&Y.visible){const Q=y(w,Y,D,_);w.onBeforeShadow(s,w,E,A,U,Q,N),s.renderBufferDirect(A,null,U,Q,w,N),w.onAfterShadow(s,w,E,A,U,Q,N)}}}else if(G.visible){const H=y(w,G,D,_);w.onBeforeShadow(s,w,E,A,U,H,null),s.renderBufferDirect(A,null,U,H,w,null),w.onAfterShadow(s,w,E,A,U,H,null)}}const L=w.children;for(let U=0,G=L.length;U<G;U++)S(L[U],E,A,D,_)}function C(w){w.target.removeEventListener("dispose",C);for(const A in c){const D=c[A],_=w.target.uuid;_ in D&&(D[_].dispose(),delete D[_])}}}const wy={[Xc]:Yc,[qc]:Zc,[$c]:Jc,[ma]:Kc,[Yc]:Xc,[Zc]:qc,[Jc]:$c,[Kc]:ma};function Ey(s){function t(){let O=!1;const ct=new Pe;let q=null;const j=new Pe(0,0,0,0);return{setMask:function(ft){q!==ft&&!O&&(s.colorMask(ft,ft,ft,ft),q=ft)},setLocked:function(ft){O=ft},setClear:function(ft,mt,te,Ue,xi){xi===!0&&(ft*=Ue,mt*=Ue,te*=Ue),ct.set(ft,mt,te,Ue),j.equals(ct)===!1&&(s.clearColor(ft,mt,te,Ue),j.copy(ct))},reset:function(){O=!1,q=null,j.set(-1,0,0,0)}}}function e(){let O=!1,ct=!1,q=null,j=null,ft=null;return{setReversed:function(mt){ct=mt},setTest:function(mt){mt?vt(s.DEPTH_TEST):lt(s.DEPTH_TEST)},setMask:function(mt){q!==mt&&!O&&(s.depthMask(mt),q=mt)},setFunc:function(mt){if(ct&&(mt=wy[mt]),j!==mt){switch(mt){case Xc:s.depthFunc(s.NEVER);break;case Yc:s.depthFunc(s.ALWAYS);break;case qc:s.depthFunc(s.LESS);break;case ma:s.depthFunc(s.LEQUAL);break;case $c:s.depthFunc(s.EQUAL);break;case Kc:s.depthFunc(s.GEQUAL);break;case Zc:s.depthFunc(s.GREATER);break;case Jc:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}j=mt}},setLocked:function(mt){O=mt},setClear:function(mt){ft!==mt&&(s.clearDepth(mt),ft=mt)},reset:function(){O=!1,q=null,j=null,ft=null}}}function i(){let O=!1,ct=null,q=null,j=null,ft=null,mt=null,te=null,Ue=null,xi=null;return{setTest:function(re){O||(re?vt(s.STENCIL_TEST):lt(s.STENCIL_TEST))},setMask:function(re){ct!==re&&!O&&(s.stencilMask(re),ct=re)},setFunc:function(re,yi,fn){(q!==re||j!==yi||ft!==fn)&&(s.stencilFunc(re,yi,fn),q=re,j=yi,ft=fn)},setOp:function(re,yi,fn){(mt!==re||te!==yi||Ue!==fn)&&(s.stencilOp(re,yi,fn),mt=re,te=yi,Ue=fn)},setLocked:function(re){O=re},setClear:function(re){xi!==re&&(s.clearStencil(re),xi=re)},reset:function(){O=!1,ct=null,q=null,j=null,ft=null,mt=null,te=null,Ue=null,xi=null}}}const n=new t,a=new e,r=new i,o=new WeakMap,l=new WeakMap;let c={},h={},f=new WeakMap,u=[],d=null,g=!1,v=null,m=null,p=null,M=null,y=null,S=null,C=null,w=new gt(0,0,0),E=0,A=!1,D=null,_=null,x=null,L=null,U=null;const G=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,B=0;const $=s.getParameter(s.VERSION);$.indexOf("WebGL")!==-1?(B=parseFloat(/^WebGL (\d)/.exec($)[1]),H=B>=1):$.indexOf("OpenGL ES")!==-1&&(B=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),H=B>=2);let N=null,Y={};const Q=s.getParameter(s.SCISSOR_BOX),st=s.getParameter(s.VIEWPORT),Bt=new Pe().fromArray(Q),Kt=new Pe().fromArray(st);function K(O,ct,q,j){const ft=new Uint8Array(4),mt=s.createTexture();s.bindTexture(O,mt),s.texParameteri(O,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(O,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let te=0;te<q;te++)O===s.TEXTURE_3D||O===s.TEXTURE_2D_ARRAY?s.texImage3D(ct,0,s.RGBA,1,1,j,0,s.RGBA,s.UNSIGNED_BYTE,ft):s.texImage2D(ct+te,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ft);return mt}const et={};et[s.TEXTURE_2D]=K(s.TEXTURE_2D,s.TEXTURE_2D,1),et[s.TEXTURE_CUBE_MAP]=K(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),et[s.TEXTURE_2D_ARRAY]=K(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),et[s.TEXTURE_3D]=K(s.TEXTURE_3D,s.TEXTURE_3D,1,1),n.setClear(0,0,0,1),a.setClear(1),r.setClear(0),vt(s.DEPTH_TEST),a.setFunc(ma),Yt(!1),Zt(Hu),vt(s.CULL_FACE),F(ti);function vt(O){c[O]!==!0&&(s.enable(O),c[O]=!0)}function lt(O){c[O]!==!1&&(s.disable(O),c[O]=!1)}function At(O,ct){return h[O]!==ct?(s.bindFramebuffer(O,ct),h[O]=ct,O===s.DRAW_FRAMEBUFFER&&(h[s.FRAMEBUFFER]=ct),O===s.FRAMEBUFFER&&(h[s.DRAW_FRAMEBUFFER]=ct),!0):!1}function bt(O,ct){let q=u,j=!1;if(O){q=f.get(ct),q===void 0&&(q=[],f.set(ct,q));const ft=O.textures;if(q.length!==ft.length||q[0]!==s.COLOR_ATTACHMENT0){for(let mt=0,te=ft.length;mt<te;mt++)q[mt]=s.COLOR_ATTACHMENT0+mt;q.length=ft.length,j=!0}}else q[0]!==s.BACK&&(q[0]=s.BACK,j=!0);j&&s.drawBuffers(q)}function kt(O){return d!==O?(s.useProgram(O),d=O,!0):!1}const ae={[Qi]:s.FUNC_ADD,[U0]:s.FUNC_SUBTRACT,[N0]:s.FUNC_REVERSE_SUBTRACT};ae[F0]=s.MIN,ae[O0]=s.MAX;const $t={[Qa]:s.ZERO,[z0]:s.ONE,[B0]:s.SRC_COLOR,[Hc]:s.SRC_ALPHA,[V0]:s.SRC_ALPHA_SATURATE,[Wc]:s.DST_COLOR,[Vc]:s.DST_ALPHA,[k0]:s.ONE_MINUS_SRC_COLOR,[Gc]:s.ONE_MINUS_SRC_ALPHA,[G0]:s.ONE_MINUS_DST_COLOR,[H0]:s.ONE_MINUS_DST_ALPHA,[W0]:s.CONSTANT_COLOR,[X0]:s.ONE_MINUS_CONSTANT_COLOR,[Y0]:s.CONSTANT_ALPHA,[q0]:s.ONE_MINUS_CONSTANT_ALPHA};function F(O,ct,q,j,ft,mt,te,Ue,xi,re){if(O===ti){g===!0&&(lt(s.BLEND),g=!1);return}if(g===!1&&(vt(s.BLEND),g=!0),O!==qp){if(O!==v||re!==A){if((m!==Qi||y!==Qi)&&(s.blendEquation(s.FUNC_ADD),m=Qi,y=Qi),re)switch(O){case ha:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case nn:s.blendFunc(s.ONE,s.ONE);break;case Gu:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Vu:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}else switch(O){case ha:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case nn:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case Gu:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Vu:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}p=null,M=null,S=null,C=null,w.set(0,0,0),E=0,v=O,A=re}return}ft=ft||ct,mt=mt||q,te=te||j,(ct!==m||ft!==y)&&(s.blendEquationSeparate(ae[ct],ae[ft]),m=ct,y=ft),(q!==p||j!==M||mt!==S||te!==C)&&(s.blendFuncSeparate($t[q],$t[j],$t[mt],$t[te]),p=q,M=j,S=mt,C=te),(Ue.equals(w)===!1||xi!==E)&&(s.blendColor(Ue.r,Ue.g,Ue.b,xi),w.copy(Ue),E=xi),v=O,A=!1}function $e(O,ct){O.side===Ge?lt(s.CULL_FACE):vt(s.CULL_FACE);let q=O.side===di;ct&&(q=!q),Yt(q),O.blending===ha&&O.transparent===!1?F(ti):F(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),a.setFunc(O.depthFunc),a.setTest(O.depthTest),a.setMask(O.depthWrite),n.setMask(O.colorWrite);const j=O.stencilWrite;r.setTest(j),j&&(r.setMask(O.stencilWriteMask),r.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),r.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),ue(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?vt(s.SAMPLE_ALPHA_TO_COVERAGE):lt(s.SAMPLE_ALPHA_TO_COVERAGE)}function Yt(O){D!==O&&(O?s.frontFace(s.CW):s.frontFace(s.CCW),D=O)}function Zt(O){O!==L0?(vt(s.CULL_FACE),O!==_&&(O===Hu?s.cullFace(s.BACK):O===D0?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):lt(s.CULL_FACE),_=O}function Pt(O){O!==x&&(H&&s.lineWidth(O),x=O)}function ue(O,ct,q){O?(vt(s.POLYGON_OFFSET_FILL),(L!==ct||U!==q)&&(s.polygonOffset(ct,q),L=ct,U=q)):lt(s.POLYGON_OFFSET_FILL)}function Lt(O){O?vt(s.SCISSOR_TEST):lt(s.SCISSOR_TEST)}function P(O){O===void 0&&(O=s.TEXTURE0+G-1),N!==O&&(s.activeTexture(O),N=O)}function b(O,ct,q){q===void 0&&(N===null?q=s.TEXTURE0+G-1:q=N);let j=Y[q];j===void 0&&(j={type:void 0,texture:void 0},Y[q]=j),(j.type!==O||j.texture!==ct)&&(N!==q&&(s.activeTexture(q),N=q),s.bindTexture(O,ct||et[O]),j.type=O,j.texture=ct)}function V(){const O=Y[N];O!==void 0&&O.type!==void 0&&(s.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function J(){try{s.compressedTexImage2D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function tt(){try{s.compressedTexImage3D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Z(){try{s.texSubImage2D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function xt(){try{s.texSubImage3D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ot(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ht(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function qt(){try{s.texStorage2D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function it(){try{s.texStorage3D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ut(){try{s.texImage2D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function It(){try{s.texImage3D.apply(s,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Ut(O){Bt.equals(O)===!1&&(s.scissor(O.x,O.y,O.z,O.w),Bt.copy(O))}function _t(O){Kt.equals(O)===!1&&(s.viewport(O.x,O.y,O.z,O.w),Kt.copy(O))}function Jt(O,ct){let q=l.get(ct);q===void 0&&(q=new WeakMap,l.set(ct,q));let j=q.get(O);j===void 0&&(j=s.getUniformBlockIndex(ct,O.name),q.set(O,j))}function Ot(O,ct){const j=l.get(ct).get(O);o.get(ct)!==j&&(s.uniformBlockBinding(ct,j,O.__bindingPointIndex),o.set(ct,j))}function ie(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),c={},N=null,Y={},h={},f=new WeakMap,u=[],d=null,g=!1,v=null,m=null,p=null,M=null,y=null,S=null,C=null,w=new gt(0,0,0),E=0,A=!1,D=null,_=null,x=null,L=null,U=null,Bt.set(0,0,s.canvas.width,s.canvas.height),Kt.set(0,0,s.canvas.width,s.canvas.height),n.reset(),a.reset(),r.reset()}return{buffers:{color:n,depth:a,stencil:r},enable:vt,disable:lt,bindFramebuffer:At,drawBuffers:bt,useProgram:kt,setBlending:F,setMaterial:$e,setFlipSided:Yt,setCullFace:Zt,setLineWidth:Pt,setPolygonOffset:ue,setScissorTest:Lt,activeTexture:P,bindTexture:b,unbindTexture:V,compressedTexImage2D:J,compressedTexImage3D:tt,texImage2D:ut,texImage3D:It,updateUBOMapping:Jt,uniformBlockBinding:Ot,texStorage2D:qt,texStorage3D:it,texSubImage2D:Z,texSubImage3D:xt,compressedTexSubImage2D:ot,compressedTexSubImage3D:ht,scissor:Ut,viewport:_t,reset:ie}}function If(s,t,e,i){const n=by(i);switch(e){case nm:return s*t;case am:return s*t;case rm:return s*t*2;case au:return s*t/n.components*n.byteLength;case ru:return s*t/n.components*n.byteLength;case om:return s*t*2/n.components*n.byteLength;case ou:return s*t*2/n.components*n.byteLength;case sm:return s*t*3/n.components*n.byteLength;case Hi:return s*t*4/n.components*n.byteLength;case lu:return s*t*4/n.components*n.byteLength;case zo:case Bo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case ko:case Ho:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case ih:case sh:return Math.max(s,16)*Math.max(t,8)/4;case eh:case nh:return Math.max(s,8)*Math.max(t,8)/2;case ah:case rh:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case oh:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case lh:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case ch:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case hh:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case uh:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case fh:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case dh:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case ph:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case mh:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case gh:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case vh:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case _h:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case Mh:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case xh:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case yh:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case Go:case Sh:case wh:return Math.ceil(s/4)*Math.ceil(t/4)*16;case lm:case Eh:return Math.ceil(s/4)*Math.ceil(t/4)*8;case bh:case Th:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function by(s){switch(s){case un:case tm:return{byteLength:1,components:1};case pr:case em:case sn:return{byteLength:2,components:1};case nu:case su:return{byteLength:2,components:4};case Ss:case iu:case cn:return{byteLength:4,components:1};case im:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function Ty(s,t,e,i,n,a,r){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new at,h=new WeakMap;let f;const u=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(P,b){return d?new OffscreenCanvas(P,b):tl("canvas")}function v(P,b,V){let J=1;const tt=Lt(P);if((tt.width>V||tt.height>V)&&(J=V/Math.max(tt.width,tt.height)),J<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const Z=Math.floor(J*tt.width),xt=Math.floor(J*tt.height);f===void 0&&(f=g(Z,xt));const ot=b?g(Z,xt):f;return ot.width=Z,ot.height=xt,ot.getContext("2d").drawImage(P,0,0,Z,xt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+Z+"x"+xt+")."),ot}else return"data"in P&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),P;return P}function m(P){return P.generateMipmaps&&P.minFilter!==fi&&P.minFilter!==tn}function p(P){s.generateMipmap(P)}function M(P,b,V,J,tt=!1){if(P!==null){if(s[P]!==void 0)return s[P];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let Z=b;if(b===s.RED&&(V===s.FLOAT&&(Z=s.R32F),V===s.HALF_FLOAT&&(Z=s.R16F),V===s.UNSIGNED_BYTE&&(Z=s.R8)),b===s.RED_INTEGER&&(V===s.UNSIGNED_BYTE&&(Z=s.R8UI),V===s.UNSIGNED_SHORT&&(Z=s.R16UI),V===s.UNSIGNED_INT&&(Z=s.R32UI),V===s.BYTE&&(Z=s.R8I),V===s.SHORT&&(Z=s.R16I),V===s.INT&&(Z=s.R32I)),b===s.RG&&(V===s.FLOAT&&(Z=s.RG32F),V===s.HALF_FLOAT&&(Z=s.RG16F),V===s.UNSIGNED_BYTE&&(Z=s.RG8)),b===s.RG_INTEGER&&(V===s.UNSIGNED_BYTE&&(Z=s.RG8UI),V===s.UNSIGNED_SHORT&&(Z=s.RG16UI),V===s.UNSIGNED_INT&&(Z=s.RG32UI),V===s.BYTE&&(Z=s.RG8I),V===s.SHORT&&(Z=s.RG16I),V===s.INT&&(Z=s.RG32I)),b===s.RGB_INTEGER&&(V===s.UNSIGNED_BYTE&&(Z=s.RGB8UI),V===s.UNSIGNED_SHORT&&(Z=s.RGB16UI),V===s.UNSIGNED_INT&&(Z=s.RGB32UI),V===s.BYTE&&(Z=s.RGB8I),V===s.SHORT&&(Z=s.RGB16I),V===s.INT&&(Z=s.RGB32I)),b===s.RGBA_INTEGER&&(V===s.UNSIGNED_BYTE&&(Z=s.RGBA8UI),V===s.UNSIGNED_SHORT&&(Z=s.RGBA16UI),V===s.UNSIGNED_INT&&(Z=s.RGBA32UI),V===s.BYTE&&(Z=s.RGBA8I),V===s.SHORT&&(Z=s.RGBA16I),V===s.INT&&(Z=s.RGBA32I)),b===s.RGB&&V===s.UNSIGNED_INT_5_9_9_9_REV&&(Z=s.RGB9_E5),b===s.RGBA){const xt=tt?Zo:oe.getTransfer(J);V===s.FLOAT&&(Z=s.RGBA32F),V===s.HALF_FLOAT&&(Z=s.RGBA16F),V===s.UNSIGNED_BYTE&&(Z=xt===_e?s.SRGB8_ALPHA8:s.RGBA8),V===s.UNSIGNED_SHORT_4_4_4_4&&(Z=s.RGBA4),V===s.UNSIGNED_SHORT_5_5_5_1&&(Z=s.RGB5_A1)}return(Z===s.R16F||Z===s.R32F||Z===s.RG16F||Z===s.RG32F||Z===s.RGBA16F||Z===s.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function y(P,b){let V;return P?b===null||b===Ss||b===ws?V=s.DEPTH24_STENCIL8:b===cn?V=s.DEPTH32F_STENCIL8:b===pr&&(V=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Ss||b===ws?V=s.DEPTH_COMPONENT24:b===cn?V=s.DEPTH_COMPONENT32F:b===pr&&(V=s.DEPTH_COMPONENT16),V}function S(P,b){return m(P)===!0||P.isFramebufferTexture&&P.minFilter!==fi&&P.minFilter!==tn?Math.log2(Math.max(b.width,b.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?b.mipmaps.length:1}function C(P){const b=P.target;b.removeEventListener("dispose",C),E(b),b.isVideoTexture&&h.delete(b)}function w(P){const b=P.target;b.removeEventListener("dispose",w),D(b)}function E(P){const b=i.get(P);if(b.__webglInit===void 0)return;const V=P.source,J=u.get(V);if(J){const tt=J[b.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&A(P),Object.keys(J).length===0&&u.delete(V)}i.remove(P)}function A(P){const b=i.get(P);s.deleteTexture(b.__webglTexture);const V=P.source,J=u.get(V);delete J[b.__cacheKey],r.memory.textures--}function D(P){const b=i.get(P);if(P.depthTexture&&P.depthTexture.dispose(),P.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(b.__webglFramebuffer[J]))for(let tt=0;tt<b.__webglFramebuffer[J].length;tt++)s.deleteFramebuffer(b.__webglFramebuffer[J][tt]);else s.deleteFramebuffer(b.__webglFramebuffer[J]);b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer[J])}else{if(Array.isArray(b.__webglFramebuffer))for(let J=0;J<b.__webglFramebuffer.length;J++)s.deleteFramebuffer(b.__webglFramebuffer[J]);else s.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&s.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let J=0;J<b.__webglColorRenderbuffer.length;J++)b.__webglColorRenderbuffer[J]&&s.deleteRenderbuffer(b.__webglColorRenderbuffer[J]);b.__webglDepthRenderbuffer&&s.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const V=P.textures;for(let J=0,tt=V.length;J<tt;J++){const Z=i.get(V[J]);Z.__webglTexture&&(s.deleteTexture(Z.__webglTexture),r.memory.textures--),i.remove(V[J])}i.remove(P)}let _=0;function x(){_=0}function L(){const P=_;return P>=n.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+P+" texture units while this GPU supports only "+n.maxTextures),_+=1,P}function U(P){const b=[];return b.push(P.wrapS),b.push(P.wrapT),b.push(P.wrapR||0),b.push(P.magFilter),b.push(P.minFilter),b.push(P.anisotropy),b.push(P.internalFormat),b.push(P.format),b.push(P.type),b.push(P.generateMipmaps),b.push(P.premultiplyAlpha),b.push(P.flipY),b.push(P.unpackAlignment),b.push(P.colorSpace),b.join()}function G(P,b){const V=i.get(P);if(P.isVideoTexture&&Pt(P),P.isRenderTargetTexture===!1&&P.version>0&&V.__version!==P.version){const J=P.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Kt(V,P,b);return}}e.bindTexture(s.TEXTURE_2D,V.__webglTexture,s.TEXTURE0+b)}function H(P,b){const V=i.get(P);if(P.version>0&&V.__version!==P.version){Kt(V,P,b);return}e.bindTexture(s.TEXTURE_2D_ARRAY,V.__webglTexture,s.TEXTURE0+b)}function B(P,b){const V=i.get(P);if(P.version>0&&V.__version!==P.version){Kt(V,P,b);return}e.bindTexture(s.TEXTURE_3D,V.__webglTexture,s.TEXTURE0+b)}function $(P,b){const V=i.get(P);if(P.version>0&&V.__version!==P.version){K(V,P,b);return}e.bindTexture(s.TEXTURE_CUBE_MAP,V.__webglTexture,s.TEXTURE0+b)}const N={[Pn]:s.REPEAT,[gs]:s.CLAMP_TO_EDGE,[th]:s.MIRRORED_REPEAT},Y={[fi]:s.NEAREST,[J0]:s.NEAREST_MIPMAP_NEAREST,[Cr]:s.NEAREST_MIPMAP_LINEAR,[tn]:s.LINEAR,[wl]:s.LINEAR_MIPMAP_NEAREST,[$n]:s.LINEAR_MIPMAP_LINEAR},Q={[eg]:s.NEVER,[og]:s.ALWAYS,[ig]:s.LESS,[cm]:s.LEQUAL,[ng]:s.EQUAL,[rg]:s.GEQUAL,[sg]:s.GREATER,[ag]:s.NOTEQUAL};function st(P,b){if(b.type===cn&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===tn||b.magFilter===wl||b.magFilter===Cr||b.magFilter===$n||b.minFilter===tn||b.minFilter===wl||b.minFilter===Cr||b.minFilter===$n)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(P,s.TEXTURE_WRAP_S,N[b.wrapS]),s.texParameteri(P,s.TEXTURE_WRAP_T,N[b.wrapT]),(P===s.TEXTURE_3D||P===s.TEXTURE_2D_ARRAY)&&s.texParameteri(P,s.TEXTURE_WRAP_R,N[b.wrapR]),s.texParameteri(P,s.TEXTURE_MAG_FILTER,Y[b.magFilter]),s.texParameteri(P,s.TEXTURE_MIN_FILTER,Y[b.minFilter]),b.compareFunction&&(s.texParameteri(P,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(P,s.TEXTURE_COMPARE_FUNC,Q[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===fi||b.minFilter!==Cr&&b.minFilter!==$n||b.type===cn&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||i.get(b).__currentAnisotropy){const V=t.get("EXT_texture_filter_anisotropic");s.texParameterf(P,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,n.getMaxAnisotropy())),i.get(b).__currentAnisotropy=b.anisotropy}}}function Bt(P,b){let V=!1;P.__webglInit===void 0&&(P.__webglInit=!0,b.addEventListener("dispose",C));const J=b.source;let tt=u.get(J);tt===void 0&&(tt={},u.set(J,tt));const Z=U(b);if(Z!==P.__cacheKey){tt[Z]===void 0&&(tt[Z]={texture:s.createTexture(),usedTimes:0},r.memory.textures++,V=!0),tt[Z].usedTimes++;const xt=tt[P.__cacheKey];xt!==void 0&&(tt[P.__cacheKey].usedTimes--,xt.usedTimes===0&&A(b)),P.__cacheKey=Z,P.__webglTexture=tt[Z].texture}return V}function Kt(P,b,V){let J=s.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(J=s.TEXTURE_2D_ARRAY),b.isData3DTexture&&(J=s.TEXTURE_3D);const tt=Bt(P,b),Z=b.source;e.bindTexture(J,P.__webglTexture,s.TEXTURE0+V);const xt=i.get(Z);if(Z.version!==xt.__version||tt===!0){e.activeTexture(s.TEXTURE0+V);const ot=oe.getPrimaries(oe.workingColorSpace),ht=b.colorSpace===qn?null:oe.getPrimaries(b.colorSpace),qt=b.colorSpace===qn||ot===ht?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,qt);let it=v(b.image,!1,n.maxTextureSize);it=ue(b,it);const ut=a.convert(b.format,b.colorSpace),It=a.convert(b.type);let Ut=M(b.internalFormat,ut,It,b.colorSpace,b.isVideoTexture);st(J,b);let _t;const Jt=b.mipmaps,Ot=b.isVideoTexture!==!0,ie=xt.__version===void 0||tt===!0,O=Z.dataReady,ct=S(b,it);if(b.isDepthTexture)Ut=y(b.format===Es,b.type),ie&&(Ot?e.texStorage2D(s.TEXTURE_2D,1,Ut,it.width,it.height):e.texImage2D(s.TEXTURE_2D,0,Ut,it.width,it.height,0,ut,It,null));else if(b.isDataTexture)if(Jt.length>0){Ot&&ie&&e.texStorage2D(s.TEXTURE_2D,ct,Ut,Jt[0].width,Jt[0].height);for(let q=0,j=Jt.length;q<j;q++)_t=Jt[q],Ot?O&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,_t.width,_t.height,ut,It,_t.data):e.texImage2D(s.TEXTURE_2D,q,Ut,_t.width,_t.height,0,ut,It,_t.data);b.generateMipmaps=!1}else Ot?(ie&&e.texStorage2D(s.TEXTURE_2D,ct,Ut,it.width,it.height),O&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,it.width,it.height,ut,It,it.data)):e.texImage2D(s.TEXTURE_2D,0,Ut,it.width,it.height,0,ut,It,it.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Ot&&ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ct,Ut,Jt[0].width,Jt[0].height,it.depth);for(let q=0,j=Jt.length;q<j;q++)if(_t=Jt[q],b.format!==Hi)if(ut!==null)if(Ot){if(O)if(b.layerUpdates.size>0){const ft=If(_t.width,_t.height,b.format,b.type);for(const mt of b.layerUpdates){const te=_t.data.subarray(mt*ft/_t.data.BYTES_PER_ELEMENT,(mt+1)*ft/_t.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,mt,_t.width,_t.height,1,ut,te,0,0)}b.clearLayerUpdates()}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,0,_t.width,_t.height,it.depth,ut,_t.data,0,0)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,q,Ut,_t.width,_t.height,it.depth,0,_t.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ot?O&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,0,_t.width,_t.height,it.depth,ut,It,_t.data):e.texImage3D(s.TEXTURE_2D_ARRAY,q,Ut,_t.width,_t.height,it.depth,0,ut,It,_t.data)}else{Ot&&ie&&e.texStorage2D(s.TEXTURE_2D,ct,Ut,Jt[0].width,Jt[0].height);for(let q=0,j=Jt.length;q<j;q++)_t=Jt[q],b.format!==Hi?ut!==null?Ot?O&&e.compressedTexSubImage2D(s.TEXTURE_2D,q,0,0,_t.width,_t.height,ut,_t.data):e.compressedTexImage2D(s.TEXTURE_2D,q,Ut,_t.width,_t.height,0,_t.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ot?O&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,_t.width,_t.height,ut,It,_t.data):e.texImage2D(s.TEXTURE_2D,q,Ut,_t.width,_t.height,0,ut,It,_t.data)}else if(b.isDataArrayTexture)if(Ot){if(ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ct,Ut,it.width,it.height,it.depth),O)if(b.layerUpdates.size>0){const q=If(it.width,it.height,b.format,b.type);for(const j of b.layerUpdates){const ft=it.data.subarray(j*q/it.data.BYTES_PER_ELEMENT,(j+1)*q/it.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,j,it.width,it.height,1,ut,It,ft)}b.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,it.width,it.height,it.depth,ut,It,it.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Ut,it.width,it.height,it.depth,0,ut,It,it.data);else if(b.isData3DTexture)Ot?(ie&&e.texStorage3D(s.TEXTURE_3D,ct,Ut,it.width,it.height,it.depth),O&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,it.width,it.height,it.depth,ut,It,it.data)):e.texImage3D(s.TEXTURE_3D,0,Ut,it.width,it.height,it.depth,0,ut,It,it.data);else if(b.isFramebufferTexture){if(ie)if(Ot)e.texStorage2D(s.TEXTURE_2D,ct,Ut,it.width,it.height);else{let q=it.width,j=it.height;for(let ft=0;ft<ct;ft++)e.texImage2D(s.TEXTURE_2D,ft,Ut,q,j,0,ut,It,null),q>>=1,j>>=1}}else if(Jt.length>0){if(Ot&&ie){const q=Lt(Jt[0]);e.texStorage2D(s.TEXTURE_2D,ct,Ut,q.width,q.height)}for(let q=0,j=Jt.length;q<j;q++)_t=Jt[q],Ot?O&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,ut,It,_t):e.texImage2D(s.TEXTURE_2D,q,Ut,ut,It,_t);b.generateMipmaps=!1}else if(Ot){if(ie){const q=Lt(it);e.texStorage2D(s.TEXTURE_2D,ct,Ut,q.width,q.height)}O&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,ut,It,it)}else e.texImage2D(s.TEXTURE_2D,0,Ut,ut,It,it);m(b)&&p(J),xt.__version=Z.version,b.onUpdate&&b.onUpdate(b)}P.__version=b.version}function K(P,b,V){if(b.image.length!==6)return;const J=Bt(P,b),tt=b.source;e.bindTexture(s.TEXTURE_CUBE_MAP,P.__webglTexture,s.TEXTURE0+V);const Z=i.get(tt);if(tt.version!==Z.__version||J===!0){e.activeTexture(s.TEXTURE0+V);const xt=oe.getPrimaries(oe.workingColorSpace),ot=b.colorSpace===qn?null:oe.getPrimaries(b.colorSpace),ht=b.colorSpace===qn||xt===ot?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ht);const qt=b.isCompressedTexture||b.image[0].isCompressedTexture,it=b.image[0]&&b.image[0].isDataTexture,ut=[];for(let j=0;j<6;j++)!qt&&!it?ut[j]=v(b.image[j],!0,n.maxCubemapSize):ut[j]=it?b.image[j].image:b.image[j],ut[j]=ue(b,ut[j]);const It=ut[0],Ut=a.convert(b.format,b.colorSpace),_t=a.convert(b.type),Jt=M(b.internalFormat,Ut,_t,b.colorSpace),Ot=b.isVideoTexture!==!0,ie=Z.__version===void 0||J===!0,O=tt.dataReady;let ct=S(b,It);st(s.TEXTURE_CUBE_MAP,b);let q;if(qt){Ot&&ie&&e.texStorage2D(s.TEXTURE_CUBE_MAP,ct,Jt,It.width,It.height);for(let j=0;j<6;j++){q=ut[j].mipmaps;for(let ft=0;ft<q.length;ft++){const mt=q[ft];b.format!==Hi?Ut!==null?Ot?O&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft,0,0,mt.width,mt.height,Ut,mt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft,Jt,mt.width,mt.height,0,mt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ot?O&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft,0,0,mt.width,mt.height,Ut,_t,mt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft,Jt,mt.width,mt.height,0,Ut,_t,mt.data)}}}else{if(q=b.mipmaps,Ot&&ie){q.length>0&&ct++;const j=Lt(ut[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,ct,Jt,j.width,j.height)}for(let j=0;j<6;j++)if(it){Ot?O&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,ut[j].width,ut[j].height,Ut,_t,ut[j].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Jt,ut[j].width,ut[j].height,0,Ut,_t,ut[j].data);for(let ft=0;ft<q.length;ft++){const te=q[ft].image[j].image;Ot?O&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft+1,0,0,te.width,te.height,Ut,_t,te.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft+1,Jt,te.width,te.height,0,Ut,_t,te.data)}}else{Ot?O&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,Ut,_t,ut[j]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Jt,Ut,_t,ut[j]);for(let ft=0;ft<q.length;ft++){const mt=q[ft];Ot?O&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft+1,0,0,Ut,_t,mt.image[j]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft+1,Jt,Ut,_t,mt.image[j])}}}m(b)&&p(s.TEXTURE_CUBE_MAP),Z.__version=tt.version,b.onUpdate&&b.onUpdate(b)}P.__version=b.version}function et(P,b,V,J,tt,Z){const xt=a.convert(V.format,V.colorSpace),ot=a.convert(V.type),ht=M(V.internalFormat,xt,ot,V.colorSpace);if(!i.get(b).__hasExternalTextures){const it=Math.max(1,b.width>>Z),ut=Math.max(1,b.height>>Z);tt===s.TEXTURE_3D||tt===s.TEXTURE_2D_ARRAY?e.texImage3D(tt,Z,ht,it,ut,b.depth,0,xt,ot,null):e.texImage2D(tt,Z,ht,it,ut,0,xt,ot,null)}e.bindFramebuffer(s.FRAMEBUFFER,P),Zt(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,J,tt,i.get(V).__webglTexture,0,Yt(b)):(tt===s.TEXTURE_2D||tt>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,J,tt,i.get(V).__webglTexture,Z),e.bindFramebuffer(s.FRAMEBUFFER,null)}function vt(P,b,V){if(s.bindRenderbuffer(s.RENDERBUFFER,P),b.depthBuffer){const J=b.depthTexture,tt=J&&J.isDepthTexture?J.type:null,Z=y(b.stencilBuffer,tt),xt=b.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ot=Yt(b);Zt(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ot,Z,b.width,b.height):V?s.renderbufferStorageMultisample(s.RENDERBUFFER,ot,Z,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,Z,b.width,b.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,xt,s.RENDERBUFFER,P)}else{const J=b.textures;for(let tt=0;tt<J.length;tt++){const Z=J[tt],xt=a.convert(Z.format,Z.colorSpace),ot=a.convert(Z.type),ht=M(Z.internalFormat,xt,ot,Z.colorSpace),qt=Yt(b);V&&Zt(b)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,qt,ht,b.width,b.height):Zt(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,qt,ht,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,ht,b.width,b.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function lt(P,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(s.FRAMEBUFFER,P),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(b.depthTexture).__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),G(b.depthTexture,0);const J=i.get(b.depthTexture).__webglTexture,tt=Yt(b);if(b.depthTexture.format===ua)Zt(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,J,0,tt):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,J,0);else if(b.depthTexture.format===Es)Zt(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,J,0,tt):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function At(P){const b=i.get(P),V=P.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==P.depthTexture){const J=P.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),J){const tt=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,J.removeEventListener("dispose",tt)};J.addEventListener("dispose",tt),b.__depthDisposeCallback=tt}b.__boundDepthTexture=J}if(P.depthTexture&&!b.__autoAllocateDepthBuffer){if(V)throw new Error("target.depthTexture not supported in Cube render targets");lt(b.__webglFramebuffer,P)}else if(V){b.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[J]),b.__webglDepthbuffer[J]===void 0)b.__webglDepthbuffer[J]=s.createRenderbuffer(),vt(b.__webglDepthbuffer[J],P,!1);else{const tt=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Z=b.__webglDepthbuffer[J];s.bindRenderbuffer(s.RENDERBUFFER,Z),s.framebufferRenderbuffer(s.FRAMEBUFFER,tt,s.RENDERBUFFER,Z)}}else if(e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=s.createRenderbuffer(),vt(b.__webglDepthbuffer,P,!1);else{const J=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,tt=b.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,tt),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,tt)}e.bindFramebuffer(s.FRAMEBUFFER,null)}function bt(P,b,V){const J=i.get(P);b!==void 0&&et(J.__webglFramebuffer,P,P.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),V!==void 0&&At(P)}function kt(P){const b=P.texture,V=i.get(P),J=i.get(b);P.addEventListener("dispose",w);const tt=P.textures,Z=P.isWebGLCubeRenderTarget===!0,xt=tt.length>1;if(xt||(J.__webglTexture===void 0&&(J.__webglTexture=s.createTexture()),J.__version=b.version,r.memory.textures++),Z){V.__webglFramebuffer=[];for(let ot=0;ot<6;ot++)if(b.mipmaps&&b.mipmaps.length>0){V.__webglFramebuffer[ot]=[];for(let ht=0;ht<b.mipmaps.length;ht++)V.__webglFramebuffer[ot][ht]=s.createFramebuffer()}else V.__webglFramebuffer[ot]=s.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){V.__webglFramebuffer=[];for(let ot=0;ot<b.mipmaps.length;ot++)V.__webglFramebuffer[ot]=s.createFramebuffer()}else V.__webglFramebuffer=s.createFramebuffer();if(xt)for(let ot=0,ht=tt.length;ot<ht;ot++){const qt=i.get(tt[ot]);qt.__webglTexture===void 0&&(qt.__webglTexture=s.createTexture(),r.memory.textures++)}if(P.samples>0&&Zt(P)===!1){V.__webglMultisampledFramebuffer=s.createFramebuffer(),V.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let ot=0;ot<tt.length;ot++){const ht=tt[ot];V.__webglColorRenderbuffer[ot]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,V.__webglColorRenderbuffer[ot]);const qt=a.convert(ht.format,ht.colorSpace),it=a.convert(ht.type),ut=M(ht.internalFormat,qt,it,ht.colorSpace,P.isXRRenderTarget===!0),It=Yt(P);s.renderbufferStorageMultisample(s.RENDERBUFFER,It,ut,P.width,P.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ot,s.RENDERBUFFER,V.__webglColorRenderbuffer[ot])}s.bindRenderbuffer(s.RENDERBUFFER,null),P.depthBuffer&&(V.__webglDepthRenderbuffer=s.createRenderbuffer(),vt(V.__webglDepthRenderbuffer,P,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(Z){e.bindTexture(s.TEXTURE_CUBE_MAP,J.__webglTexture),st(s.TEXTURE_CUBE_MAP,b);for(let ot=0;ot<6;ot++)if(b.mipmaps&&b.mipmaps.length>0)for(let ht=0;ht<b.mipmaps.length;ht++)et(V.__webglFramebuffer[ot][ht],P,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,ht);else et(V.__webglFramebuffer[ot],P,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0);m(b)&&p(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(xt){for(let ot=0,ht=tt.length;ot<ht;ot++){const qt=tt[ot],it=i.get(qt);e.bindTexture(s.TEXTURE_2D,it.__webglTexture),st(s.TEXTURE_2D,qt),et(V.__webglFramebuffer,P,qt,s.COLOR_ATTACHMENT0+ot,s.TEXTURE_2D,0),m(qt)&&p(s.TEXTURE_2D)}e.unbindTexture()}else{let ot=s.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(ot=P.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(ot,J.__webglTexture),st(ot,b),b.mipmaps&&b.mipmaps.length>0)for(let ht=0;ht<b.mipmaps.length;ht++)et(V.__webglFramebuffer[ht],P,b,s.COLOR_ATTACHMENT0,ot,ht);else et(V.__webglFramebuffer,P,b,s.COLOR_ATTACHMENT0,ot,0);m(b)&&p(ot),e.unbindTexture()}P.depthBuffer&&At(P)}function ae(P){const b=P.textures;for(let V=0,J=b.length;V<J;V++){const tt=b[V];if(m(tt)){const Z=P.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:s.TEXTURE_2D,xt=i.get(tt).__webglTexture;e.bindTexture(Z,xt),p(Z),e.unbindTexture()}}}const $t=[],F=[];function $e(P){if(P.samples>0){if(Zt(P)===!1){const b=P.textures,V=P.width,J=P.height;let tt=s.COLOR_BUFFER_BIT;const Z=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,xt=i.get(P),ot=b.length>1;if(ot)for(let ht=0;ht<b.length;ht++)e.bindFramebuffer(s.FRAMEBUFFER,xt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ht,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,xt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ht,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,xt.__webglMultisampledFramebuffer),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,xt.__webglFramebuffer);for(let ht=0;ht<b.length;ht++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(tt|=s.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(tt|=s.STENCIL_BUFFER_BIT)),ot){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,xt.__webglColorRenderbuffer[ht]);const qt=i.get(b[ht]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,qt,0)}s.blitFramebuffer(0,0,V,J,0,0,V,J,tt,s.NEAREST),l===!0&&($t.length=0,F.length=0,$t.push(s.COLOR_ATTACHMENT0+ht),P.depthBuffer&&P.resolveDepthBuffer===!1&&($t.push(Z),F.push(Z),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,F)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,$t))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ot)for(let ht=0;ht<b.length;ht++){e.bindFramebuffer(s.FRAMEBUFFER,xt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ht,s.RENDERBUFFER,xt.__webglColorRenderbuffer[ht]);const qt=i.get(b[ht]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,xt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ht,s.TEXTURE_2D,qt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,xt.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.resolveDepthBuffer===!1&&l){const b=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[b])}}}function Yt(P){return Math.min(n.maxSamples,P.samples)}function Zt(P){const b=i.get(P);return P.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Pt(P){const b=r.render.frame;h.get(P)!==b&&(h.set(P,b),P.update())}function ue(P,b){const V=P.colorSpace,J=P.format,tt=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||V!==Qn&&V!==qn&&(oe.getTransfer(V)===_e?(J!==Hi||tt!==un)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",V)),b}function Lt(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=L,this.resetTextureUnits=x,this.setTexture2D=G,this.setTexture2DArray=H,this.setTexture3D=B,this.setTextureCube=$,this.rebindTextures=bt,this.setupRenderTarget=kt,this.updateRenderTargetMipmap=ae,this.updateMultisampleRenderTarget=$e,this.setupDepthRenderbuffer=At,this.setupFrameBufferTexture=et,this.useMultisampledRTT=Zt}function Ay(s,t){function e(i,n=qn){let a;const r=oe.getTransfer(n);if(i===un)return s.UNSIGNED_BYTE;if(i===nu)return s.UNSIGNED_SHORT_4_4_4_4;if(i===su)return s.UNSIGNED_SHORT_5_5_5_1;if(i===im)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===tm)return s.BYTE;if(i===em)return s.SHORT;if(i===pr)return s.UNSIGNED_SHORT;if(i===iu)return s.INT;if(i===Ss)return s.UNSIGNED_INT;if(i===cn)return s.FLOAT;if(i===sn)return s.HALF_FLOAT;if(i===nm)return s.ALPHA;if(i===sm)return s.RGB;if(i===Hi)return s.RGBA;if(i===am)return s.LUMINANCE;if(i===rm)return s.LUMINANCE_ALPHA;if(i===ua)return s.DEPTH_COMPONENT;if(i===Es)return s.DEPTH_STENCIL;if(i===au)return s.RED;if(i===ru)return s.RED_INTEGER;if(i===om)return s.RG;if(i===ou)return s.RG_INTEGER;if(i===lu)return s.RGBA_INTEGER;if(i===zo||i===Bo||i===ko||i===Ho)if(r===_e)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===zo)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Bo)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===ko)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Ho)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===zo)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Bo)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===ko)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Ho)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===eh||i===ih||i===nh||i===sh)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===eh)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ih)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===nh)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===sh)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===ah||i===rh||i===oh)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(i===ah||i===rh)return r===_e?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===oh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===lh||i===ch||i===hh||i===uh||i===fh||i===dh||i===ph||i===mh||i===gh||i===vh||i===_h||i===Mh||i===xh||i===yh)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(i===lh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ch)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===hh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===uh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===fh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===dh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ph)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===mh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===gh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===vh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===_h)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Mh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===xh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===yh)return r===_e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Go||i===Sh||i===wh)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(i===Go)return r===_e?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Sh)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===wh)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===lm||i===Eh||i===bh||i===Th)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(i===Go)return a.COMPRESSED_RED_RGTC1_EXT;if(i===Eh)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===bh)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Th)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ws?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:e}}class Ry extends Oi{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class hi extends Ae{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Cy={type:"move"};class Jl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new hi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new hi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new T,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new T),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new hi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new T,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new T),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,a=null,r=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){r=!0;for(const v of t.hand.values()){const m=e.getJointPose(v,i),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],u=h.position.distanceTo(f.position),d=.02,g=.005;c.inputState.pinching&&u>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(a=e.getPose(t.gripSpace,i),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&a!==null&&(n=a),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Cy)))}return o!==null&&(o.visible=n!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const i=new hi;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}}const Py=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ly=`
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

}`;class Dy{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,i){if(this.texture===null){const n=new pi,a=t.properties.get(n);a.__webglTexture=e.texture,(e.depthNear!=i.depthNear||e.depthFar!=i.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,i=new Se({vertexShader:Py,fragmentShader:Ly,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new St(new ba(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Iy extends Ea{constructor(t,e){super();const i=this;let n=null,a=1,r=null,o="local-floor",l=1,c=null,h=null,f=null,u=null,d=null,g=null;const v=new Dy,m=e.getContextAttributes();let p=null,M=null;const y=[],S=[],C=new at;let w=null;const E=new Oi;E.layers.enable(1),E.viewport=new Pe;const A=new Oi;A.layers.enable(2),A.viewport=new Pe;const D=[E,A],_=new Ry;_.layers.enable(1),_.layers.enable(2);let x=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let et=y[K];return et===void 0&&(et=new Jl,y[K]=et),et.getTargetRaySpace()},this.getControllerGrip=function(K){let et=y[K];return et===void 0&&(et=new Jl,y[K]=et),et.getGripSpace()},this.getHand=function(K){let et=y[K];return et===void 0&&(et=new Jl,y[K]=et),et.getHandSpace()};function U(K){const et=S.indexOf(K.inputSource);if(et===-1)return;const vt=y[et];vt!==void 0&&(vt.update(K.inputSource,K.frame,c||r),vt.dispatchEvent({type:K.type,data:K.inputSource}))}function G(){n.removeEventListener("select",U),n.removeEventListener("selectstart",U),n.removeEventListener("selectend",U),n.removeEventListener("squeeze",U),n.removeEventListener("squeezestart",U),n.removeEventListener("squeezeend",U),n.removeEventListener("end",G),n.removeEventListener("inputsourceschange",H);for(let K=0;K<y.length;K++){const et=S[K];et!==null&&(S[K]=null,y[K].disconnect(et))}x=null,L=null,v.reset(),t.setRenderTarget(p),d=null,u=null,f=null,n=null,M=null,Kt.stop(),i.isPresenting=!1,t.setPixelRatio(w),t.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){a=K,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return f},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(K){if(n=K,n!==null){if(p=t.getRenderTarget(),n.addEventListener("select",U),n.addEventListener("selectstart",U),n.addEventListener("selectend",U),n.addEventListener("squeeze",U),n.addEventListener("squeezestart",U),n.addEventListener("squeezeend",U),n.addEventListener("end",G),n.addEventListener("inputsourceschange",H),m.xrCompatible!==!0&&await e.makeXRCompatible(),w=t.getPixelRatio(),t.getSize(C),n.renderState.layers===void 0){const et={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(n,e,et),n.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),M=new Ii(d.framebufferWidth,d.framebufferHeight,{format:Hi,type:un,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let et=null,vt=null,lt=null;m.depth&&(lt=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=m.stencil?Es:ua,vt=m.stencil?ws:Ss);const At={colorFormat:e.RGBA8,depthFormat:lt,scaleFactor:a};f=new XRWebGLBinding(n,e),u=f.createProjectionLayer(At),n.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),M=new Ii(u.textureWidth,u.textureHeight,{format:Hi,type:un,depthTexture:new mu(u.textureWidth,u.textureHeight,vt,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await n.requestReferenceSpace(o),Kt.setContext(n),Kt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function H(K){for(let et=0;et<K.removed.length;et++){const vt=K.removed[et],lt=S.indexOf(vt);lt>=0&&(S[lt]=null,y[lt].disconnect(vt))}for(let et=0;et<K.added.length;et++){const vt=K.added[et];let lt=S.indexOf(vt);if(lt===-1){for(let bt=0;bt<y.length;bt++)if(bt>=S.length){S.push(vt),lt=bt;break}else if(S[bt]===null){S[bt]=vt,lt=bt;break}if(lt===-1)break}const At=y[lt];At&&At.connect(vt)}}const B=new T,$=new T;function N(K,et,vt){B.setFromMatrixPosition(et.matrixWorld),$.setFromMatrixPosition(vt.matrixWorld);const lt=B.distanceTo($),At=et.projectionMatrix.elements,bt=vt.projectionMatrix.elements,kt=At[14]/(At[10]-1),ae=At[14]/(At[10]+1),$t=(At[9]+1)/At[5],F=(At[9]-1)/At[5],$e=(At[8]-1)/At[0],Yt=(bt[8]+1)/bt[0],Zt=kt*$e,Pt=kt*Yt,ue=lt/(-$e+Yt),Lt=ue*-$e;if(et.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(Lt),K.translateZ(ue),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),At[10]===-1)K.projectionMatrix.copy(et.projectionMatrix),K.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{const P=kt+ue,b=ae+ue,V=Zt-Lt,J=Pt+(lt-Lt),tt=$t*ae/b*P,Z=F*ae/b*P;K.projectionMatrix.makePerspective(V,J,tt,Z,P,b),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function Y(K,et){et===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(et.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(n===null)return;let et=K.near,vt=K.far;v.texture!==null&&(v.depthNear>0&&(et=v.depthNear),v.depthFar>0&&(vt=v.depthFar)),_.near=A.near=E.near=et,_.far=A.far=E.far=vt,(x!==_.near||L!==_.far)&&(n.updateRenderState({depthNear:_.near,depthFar:_.far}),x=_.near,L=_.far);const lt=K.parent,At=_.cameras;Y(_,lt);for(let bt=0;bt<At.length;bt++)Y(At[bt],lt);At.length===2?N(_,E,A):_.projectionMatrix.copy(E.projectionMatrix),Q(K,_,lt)};function Q(K,et,vt){vt===null?K.matrix.copy(et.matrixWorld):(K.matrix.copy(vt.matrixWorld),K.matrix.invert(),K.matrix.multiply(et.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(et.projectionMatrix),K.projectionMatrixInverse.copy(et.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=mr*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(K){l=K,u!==null&&(u.fixedFoveation=K),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=K)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(_)};let st=null;function Bt(K,et){if(h=et.getViewerPose(c||r),g=et,h!==null){const vt=h.views;d!==null&&(t.setRenderTargetFramebuffer(M,d.framebuffer),t.setRenderTarget(M));let lt=!1;vt.length!==_.cameras.length&&(_.cameras.length=0,lt=!0);for(let bt=0;bt<vt.length;bt++){const kt=vt[bt];let ae=null;if(d!==null)ae=d.getViewport(kt);else{const F=f.getViewSubImage(u,kt);ae=F.viewport,bt===0&&(t.setRenderTargetTextures(M,F.colorTexture,u.ignoreDepthValues?void 0:F.depthStencilTexture),t.setRenderTarget(M))}let $t=D[bt];$t===void 0&&($t=new Oi,$t.layers.enable(bt),$t.viewport=new Pe,D[bt]=$t),$t.matrix.fromArray(kt.transform.matrix),$t.matrix.decompose($t.position,$t.quaternion,$t.scale),$t.projectionMatrix.fromArray(kt.projectionMatrix),$t.projectionMatrixInverse.copy($t.projectionMatrix).invert(),$t.viewport.set(ae.x,ae.y,ae.width,ae.height),bt===0&&(_.matrix.copy($t.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),lt===!0&&_.cameras.push($t)}const At=n.enabledFeatures;if(At&&At.includes("depth-sensing")){const bt=f.getDepthInformation(vt[0]);bt&&bt.isValid&&bt.texture&&v.init(t,bt,n.renderState)}}for(let vt=0;vt<y.length;vt++){const lt=S[vt],At=y[vt];lt!==null&&At!==void 0&&At.update(lt,et,c||r)}st&&st(K,et),et.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:et}),g=null}const Kt=new xm;Kt.setAnimationLoop(Bt),this.setAnimationLoop=function(K){st=K},this.dispose=function(){}}}const os=new Vi,Uy=new zt;function Ny(s,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,vm(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function n(m,p,M,y,S){p.isMeshBasicMaterial||p.isMeshLambertMaterial?a(m,p):p.isMeshToonMaterial?(a(m,p),f(m,p)):p.isMeshPhongMaterial?(a(m,p),h(m,p)):p.isMeshStandardMaterial?(a(m,p),u(m,p),p.isMeshPhysicalMaterial&&d(m,p,S)):p.isMeshMatcapMaterial?(a(m,p),g(m,p)):p.isMeshDepthMaterial?a(m,p):p.isMeshDistanceMaterial?(a(m,p),v(m,p)):p.isMeshNormalMaterial?a(m,p):p.isLineBasicMaterial?(r(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,M,y):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function a(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===di&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===di&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const M=t.get(p),y=M.envMap,S=M.envMapRotation;y&&(m.envMap.value=y,os.copy(S),os.x*=-1,os.y*=-1,os.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(os.y*=-1,os.z*=-1),m.envMapRotation.value.setFromMatrix4(Uy.makeRotationFromEuler(os)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function r(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=y*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function f(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,M){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===di&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const M=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function Fy(s,t,e,i){let n={},a={},r=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,y){const S=y.program;i.uniformBlockBinding(M,S)}function c(M,y){let S=n[M.id];S===void 0&&(g(M),S=h(M),n[M.id]=S,M.addEventListener("dispose",m));const C=y.program;i.updateUBOMapping(M,C);const w=t.render.frame;a[M.id]!==w&&(u(M),a[M.id]=w)}function h(M){const y=f();M.__bindingPointIndex=y;const S=s.createBuffer(),C=M.__size,w=M.usage;return s.bindBuffer(s.UNIFORM_BUFFER,S),s.bufferData(s.UNIFORM_BUFFER,C,w),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,y,S),S}function f(){for(let M=0;M<o;M++)if(r.indexOf(M)===-1)return r.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(M){const y=n[M.id],S=M.uniforms,C=M.__cache;s.bindBuffer(s.UNIFORM_BUFFER,y);for(let w=0,E=S.length;w<E;w++){const A=Array.isArray(S[w])?S[w]:[S[w]];for(let D=0,_=A.length;D<_;D++){const x=A[D];if(d(x,w,D,C)===!0){const L=x.__offset,U=Array.isArray(x.value)?x.value:[x.value];let G=0;for(let H=0;H<U.length;H++){const B=U[H],$=v(B);typeof B=="number"||typeof B=="boolean"?(x.__data[0]=B,s.bufferSubData(s.UNIFORM_BUFFER,L+G,x.__data)):B.isMatrix3?(x.__data[0]=B.elements[0],x.__data[1]=B.elements[1],x.__data[2]=B.elements[2],x.__data[3]=0,x.__data[4]=B.elements[3],x.__data[5]=B.elements[4],x.__data[6]=B.elements[5],x.__data[7]=0,x.__data[8]=B.elements[6],x.__data[9]=B.elements[7],x.__data[10]=B.elements[8],x.__data[11]=0):(B.toArray(x.__data,G),G+=$.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,L,x.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function d(M,y,S,C){const w=M.value,E=y+"_"+S;if(C[E]===void 0)return typeof w=="number"||typeof w=="boolean"?C[E]=w:C[E]=w.clone(),!0;{const A=C[E];if(typeof w=="number"||typeof w=="boolean"){if(A!==w)return C[E]=w,!0}else if(A.equals(w)===!1)return A.copy(w),!0}return!1}function g(M){const y=M.uniforms;let S=0;const C=16;for(let E=0,A=y.length;E<A;E++){const D=Array.isArray(y[E])?y[E]:[y[E]];for(let _=0,x=D.length;_<x;_++){const L=D[_],U=Array.isArray(L.value)?L.value:[L.value];for(let G=0,H=U.length;G<H;G++){const B=U[G],$=v(B),N=S%C,Y=N%$.boundary,Q=N+Y;S+=Y,Q!==0&&C-Q<$.storage&&(S+=C-Q),L.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=S,S+=$.storage}}}const w=S%C;return w>0&&(S+=C-w),M.__size=S,M.__cache={},this}function v(M){const y={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(y.boundary=4,y.storage=4):M.isVector2?(y.boundary=8,y.storage=8):M.isVector3||M.isColor?(y.boundary=16,y.storage=12):M.isVector4?(y.boundary=16,y.storage=16):M.isMatrix3?(y.boundary=48,y.storage=48):M.isMatrix4?(y.boundary=64,y.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),y}function m(M){const y=M.target;y.removeEventListener("dispose",m);const S=r.indexOf(y.__bindingPointIndex);r.splice(S,1),s.deleteBuffer(n[y.id]),delete n[y.id],delete a[y.id]}function p(){for(const M in n)s.deleteBuffer(n[M]);r=[],n={},a={}}return{bind:l,update:c,dispose:p}}class Oy{constructor(t={}){const{canvas:e=bg(),context:i=null,depth:n=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1}=t;this.isWebGLRenderer=!0;let u;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");u=i.getContextAttributes().alpha}else u=r;const d=new Uint32Array(4),g=new Int32Array(4);let v=null,m=null;const p=[],M=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=wi,this.toneMapping=Zn,this.toneMappingExposure=1;const y=this;let S=!1,C=0,w=0,E=null,A=-1,D=null;const _=new Pe,x=new Pe;let L=null;const U=new gt(0);let G=0,H=e.width,B=e.height,$=1,N=null,Y=null;const Q=new Pe(0,0,H,B),st=new Pe(0,0,H,B);let Bt=!1;const Kt=new fu;let K=!1,et=!1;const vt=new zt,lt=new zt,At=new T,bt=new Pe,kt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ae=!1;function $t(){return E===null?$:1}let F=i;function $e(R,z){return e.getContext(R,z)}try{const R={alpha:!0,depth:n,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Qh}`),e.addEventListener("webglcontextlost",j,!1),e.addEventListener("webglcontextrestored",ft,!1),e.addEventListener("webglcontextcreationerror",mt,!1),F===null){const z="webgl2";if(F=$e(z,R),F===null)throw $e(z)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let Yt,Zt,Pt,ue,Lt,P,b,V,J,tt,Z,xt,ot,ht,qt,it,ut,It,Ut,_t,Jt,Ot,ie,O;function ct(){Yt=new GM(F),Yt.init(),Ot=new Ay(F,Yt),Zt=new FM(F,Yt,t,Ot),Pt=new Ey(F),Zt.reverseDepthBuffer&&Pt.buffers.depth.setReversed(!0),ue=new XM(F),Lt=new cy,P=new Ty(F,Yt,Pt,Lt,Zt,Ot,ue),b=new zM(y),V=new HM(y),J=new jg(F),ie=new UM(F,J),tt=new VM(F,J,ue,ie),Z=new qM(F,tt,J,ue),Ut=new YM(F,Zt,P),it=new OM(Lt),xt=new ly(y,b,V,Yt,Zt,ie,it),ot=new Ny(y,Lt),ht=new uy,qt=new vy(Yt),It=new IM(y,b,V,Pt,Z,u,l),ut=new Sy(y,Z,Zt),O=new Fy(F,ue,Zt,Pt),_t=new NM(F,Yt,ue),Jt=new WM(F,Yt,ue),ue.programs=xt.programs,y.capabilities=Zt,y.extensions=Yt,y.properties=Lt,y.renderLists=ht,y.shadowMap=ut,y.state=Pt,y.info=ue}ct();const q=new Iy(y,F);this.xr=q,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const R=Yt.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=Yt.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(R){R!==void 0&&($=R,this.setSize(H,B,!1))},this.getSize=function(R){return R.set(H,B)},this.setSize=function(R,z,W=!0){if(q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}H=R,B=z,e.width=Math.floor(R*$),e.height=Math.floor(z*$),W===!0&&(e.style.width=R+"px",e.style.height=z+"px"),this.setViewport(0,0,R,z)},this.getDrawingBufferSize=function(R){return R.set(H*$,B*$).floor()},this.setDrawingBufferSize=function(R,z,W){H=R,B=z,$=W,e.width=Math.floor(R*W),e.height=Math.floor(z*W),this.setViewport(0,0,R,z)},this.getCurrentViewport=function(R){return R.copy(_)},this.getViewport=function(R){return R.copy(Q)},this.setViewport=function(R,z,W,X){R.isVector4?Q.set(R.x,R.y,R.z,R.w):Q.set(R,z,W,X),Pt.viewport(_.copy(Q).multiplyScalar($).round())},this.getScissor=function(R){return R.copy(st)},this.setScissor=function(R,z,W,X){R.isVector4?st.set(R.x,R.y,R.z,R.w):st.set(R,z,W,X),Pt.scissor(x.copy(st).multiplyScalar($).round())},this.getScissorTest=function(){return Bt},this.setScissorTest=function(R){Pt.setScissorTest(Bt=R)},this.setOpaqueSort=function(R){N=R},this.setTransparentSort=function(R){Y=R},this.getClearColor=function(R){return R.copy(It.getClearColor())},this.setClearColor=function(){It.setClearColor.apply(It,arguments)},this.getClearAlpha=function(){return It.getClearAlpha()},this.setClearAlpha=function(){It.setClearAlpha.apply(It,arguments)},this.clear=function(R=!0,z=!0,W=!0){let X=0;if(R){let k=!1;if(E!==null){const nt=E.texture.format;k=nt===lu||nt===ou||nt===ru}if(k){const nt=E.texture.type,dt=nt===un||nt===Ss||nt===pr||nt===ws||nt===nu||nt===su,Mt=It.getClearColor(),yt=It.getClearAlpha(),Nt=Mt.r,Ft=Mt.g,wt=Mt.b;dt?(d[0]=Nt,d[1]=Ft,d[2]=wt,d[3]=yt,F.clearBufferuiv(F.COLOR,0,d)):(g[0]=Nt,g[1]=Ft,g[2]=wt,g[3]=yt,F.clearBufferiv(F.COLOR,0,g))}else X|=F.COLOR_BUFFER_BIT}z&&(X|=F.DEPTH_BUFFER_BIT,F.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),W&&(X|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",j,!1),e.removeEventListener("webglcontextrestored",ft,!1),e.removeEventListener("webglcontextcreationerror",mt,!1),ht.dispose(),qt.dispose(),Lt.dispose(),b.dispose(),V.dispose(),Z.dispose(),ie.dispose(),O.dispose(),xt.dispose(),q.dispose(),q.removeEventListener("sessionstart",Iu),q.removeEventListener("sessionend",Uu),es.stop()};function j(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function ft(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;const R=ue.autoReset,z=ut.enabled,W=ut.autoUpdate,X=ut.needsUpdate,k=ut.type;ct(),ue.autoReset=R,ut.enabled=z,ut.autoUpdate=W,ut.needsUpdate=X,ut.type=k}function mt(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function te(R){const z=R.target;z.removeEventListener("dispose",te),Ue(z)}function Ue(R){xi(R),Lt.remove(R)}function xi(R){const z=Lt.get(R).programs;z!==void 0&&(z.forEach(function(W){xt.releaseProgram(W)}),R.isShaderMaterial&&xt.releaseShaderCache(R))}this.renderBufferDirect=function(R,z,W,X,k,nt){z===null&&(z=kt);const dt=k.isMesh&&k.matrixWorld.determinant()<0,Mt=A0(R,z,W,X,k);Pt.setMaterial(X,dt);let yt=W.index,Nt=1;if(X.wireframe===!0){if(yt=tt.getWireframeAttribute(W),yt===void 0)return;Nt=2}const Ft=W.drawRange,wt=W.attributes.position;let fe=Ft.start*Nt,xe=(Ft.start+Ft.count)*Nt;nt!==null&&(fe=Math.max(fe,nt.start*Nt),xe=Math.min(xe,(nt.start+nt.count)*Nt)),yt!==null?(fe=Math.max(fe,0),xe=Math.min(xe,yt.count)):wt!=null&&(fe=Math.max(fe,0),xe=Math.min(xe,wt.count));const Re=xe-fe;if(Re<0||Re===1/0)return;ie.setup(k,X,Mt,W,yt);let bi,le=_t;if(yt!==null&&(bi=J.get(yt),le=Jt,le.setIndex(bi)),k.isMesh)X.wireframe===!0?(Pt.setLineWidth(X.wireframeLinewidth*$t()),le.setMode(F.LINES)):le.setMode(F.TRIANGLES);else if(k.isLine){let Tt=X.linewidth;Tt===void 0&&(Tt=1),Pt.setLineWidth(Tt*$t()),k.isLineSegments?le.setMode(F.LINES):k.isLineLoop?le.setMode(F.LINE_LOOP):le.setMode(F.LINE_STRIP)}else k.isPoints?le.setMode(F.POINTS):k.isSprite&&le.setMode(F.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)le.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(Yt.get("WEBGL_multi_draw"))le.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const Tt=k._multiDrawStarts,Ke=k._multiDrawCounts,ce=k._multiDrawCount,Xi=yt?J.get(yt).bytesPerElement:1,Ds=Lt.get(X).currentProgram.getUniforms();for(let Ti=0;Ti<ce;Ti++)Ds.setValue(F,"_gl_DrawID",Ti),le.render(Tt[Ti]/Xi,Ke[Ti])}else if(k.isInstancedMesh)le.renderInstances(fe,Re,k.count);else if(W.isInstancedBufferGeometry){const Tt=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Ke=Math.min(W.instanceCount,Tt);le.renderInstances(fe,Re,Ke)}else le.render(fe,Re)};function re(R,z,W){R.transparent===!0&&R.side===Ge&&R.forceSinglePass===!1?(R.side=di,R.needsUpdate=!0,Rr(R,z,W),R.side=Jn,R.needsUpdate=!0,Rr(R,z,W),R.side=Ge):Rr(R,z,W)}this.compile=function(R,z,W=null){W===null&&(W=R),m=qt.get(W),m.init(z),M.push(m),W.traverseVisible(function(k){k.isLight&&k.layers.test(z.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),R!==W&&R.traverseVisible(function(k){k.isLight&&k.layers.test(z.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),m.setupLights();const X=new Set;return R.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const nt=k.material;if(nt)if(Array.isArray(nt))for(let dt=0;dt<nt.length;dt++){const Mt=nt[dt];re(Mt,W,k),X.add(Mt)}else re(nt,W,k),X.add(nt)}),M.pop(),m=null,X},this.compileAsync=function(R,z,W=null){const X=this.compile(R,z,W);return new Promise(k=>{function nt(){if(X.forEach(function(dt){Lt.get(dt).currentProgram.isReady()&&X.delete(dt)}),X.size===0){k(R);return}setTimeout(nt,10)}Yt.get("KHR_parallel_shader_compile")!==null?nt():setTimeout(nt,10)})};let yi=null;function fn(R){yi&&yi(R)}function Iu(){es.stop()}function Uu(){es.start()}const es=new xm;es.setAnimationLoop(fn),typeof self<"u"&&es.setContext(self),this.setAnimationLoop=function(R){yi=R,q.setAnimationLoop(R),R===null?es.stop():es.start()},q.addEventListener("sessionstart",Iu),q.addEventListener("sessionend",Uu),this.render=function(R,z){if(z!==void 0&&z.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(q.cameraAutoUpdate===!0&&q.updateCamera(z),z=q.getCamera()),R.isScene===!0&&R.onBeforeRender(y,R,z,E),m=qt.get(R,M.length),m.init(z),M.push(m),lt.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),Kt.setFromProjectionMatrix(lt),et=this.localClippingEnabled,K=it.init(this.clippingPlanes,et),v=ht.get(R,p.length),v.init(),p.push(v),q.enabled===!0&&q.isPresenting===!0){const nt=y.xr.getDepthSensingMesh();nt!==null&&Ml(nt,z,-1/0,y.sortObjects)}Ml(R,z,0,y.sortObjects),v.finish(),y.sortObjects===!0&&v.sort(N,Y),ae=q.enabled===!1||q.isPresenting===!1||q.hasDepthSensing()===!1,ae&&It.addToRenderList(v,R),this.info.render.frame++,K===!0&&it.beginShadows();const W=m.state.shadowsArray;ut.render(W,R,z),K===!0&&it.endShadows(),this.info.autoReset===!0&&this.info.reset();const X=v.opaque,k=v.transmissive;if(m.setupLights(),z.isArrayCamera){const nt=z.cameras;if(k.length>0)for(let dt=0,Mt=nt.length;dt<Mt;dt++){const yt=nt[dt];Fu(X,k,R,yt)}ae&&It.render(R);for(let dt=0,Mt=nt.length;dt<Mt;dt++){const yt=nt[dt];Nu(v,R,yt,yt.viewport)}}else k.length>0&&Fu(X,k,R,z),ae&&It.render(R),Nu(v,R,z);E!==null&&(P.updateMultisampleRenderTarget(E),P.updateRenderTargetMipmap(E)),R.isScene===!0&&R.onAfterRender(y,R,z),ie.resetDefaultState(),A=-1,D=null,M.pop(),M.length>0?(m=M[M.length-1],K===!0&&it.setGlobalState(y.clippingPlanes,m.state.camera)):m=null,p.pop(),p.length>0?v=p[p.length-1]:v=null};function Ml(R,z,W,X){if(R.visible===!1)return;if(R.layers.test(z.layers)){if(R.isGroup)W=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(z);else if(R.isLight)m.pushLight(R),R.castShadow&&m.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||Kt.intersectsSprite(R)){X&&bt.setFromMatrixPosition(R.matrixWorld).applyMatrix4(lt);const dt=Z.update(R),Mt=R.material;Mt.visible&&v.push(R,dt,Mt,W,bt.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||Kt.intersectsObject(R))){const dt=Z.update(R),Mt=R.material;if(X&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),bt.copy(R.boundingSphere.center)):(dt.boundingSphere===null&&dt.computeBoundingSphere(),bt.copy(dt.boundingSphere.center)),bt.applyMatrix4(R.matrixWorld).applyMatrix4(lt)),Array.isArray(Mt)){const yt=dt.groups;for(let Nt=0,Ft=yt.length;Nt<Ft;Nt++){const wt=yt[Nt],fe=Mt[wt.materialIndex];fe&&fe.visible&&v.push(R,dt,fe,W,bt.z,wt)}}else Mt.visible&&v.push(R,dt,Mt,W,bt.z,null)}}const nt=R.children;for(let dt=0,Mt=nt.length;dt<Mt;dt++)Ml(nt[dt],z,W,X)}function Nu(R,z,W,X){const k=R.opaque,nt=R.transmissive,dt=R.transparent;m.setupLightsView(W),K===!0&&it.setGlobalState(y.clippingPlanes,W),X&&Pt.viewport(_.copy(X)),k.length>0&&Ar(k,z,W),nt.length>0&&Ar(nt,z,W),dt.length>0&&Ar(dt,z,W),Pt.buffers.depth.setTest(!0),Pt.buffers.depth.setMask(!0),Pt.buffers.color.setMask(!0),Pt.setPolygonOffset(!1)}function Fu(R,z,W,X){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[X.id]===void 0&&(m.state.transmissionRenderTarget[X.id]=new Ii(1,1,{generateMipmaps:!0,type:Yt.has("EXT_color_buffer_half_float")||Yt.has("EXT_color_buffer_float")?sn:un,minFilter:$n,samples:4,stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:oe.workingColorSpace}));const nt=m.state.transmissionRenderTarget[X.id],dt=X.viewport||_;nt.setSize(dt.z,dt.w);const Mt=y.getRenderTarget();y.setRenderTarget(nt),y.getClearColor(U),G=y.getClearAlpha(),G<1&&y.setClearColor(16777215,.5),y.clear(),ae&&It.render(W);const yt=y.toneMapping;y.toneMapping=Zn;const Nt=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),m.setupLightsView(X),K===!0&&it.setGlobalState(y.clippingPlanes,X),Ar(R,W,X),P.updateMultisampleRenderTarget(nt),P.updateRenderTargetMipmap(nt),Yt.has("WEBGL_multisampled_render_to_texture")===!1){let Ft=!1;for(let wt=0,fe=z.length;wt<fe;wt++){const xe=z[wt],Re=xe.object,bi=xe.geometry,le=xe.material,Tt=xe.group;if(le.side===Ge&&Re.layers.test(X.layers)){const Ke=le.side;le.side=di,le.needsUpdate=!0,Ou(Re,W,X,bi,le,Tt),le.side=Ke,le.needsUpdate=!0,Ft=!0}}Ft===!0&&(P.updateMultisampleRenderTarget(nt),P.updateRenderTargetMipmap(nt))}y.setRenderTarget(Mt),y.setClearColor(U,G),Nt!==void 0&&(X.viewport=Nt),y.toneMapping=yt}function Ar(R,z,W){const X=z.isScene===!0?z.overrideMaterial:null;for(let k=0,nt=R.length;k<nt;k++){const dt=R[k],Mt=dt.object,yt=dt.geometry,Nt=X===null?dt.material:X,Ft=dt.group;Mt.layers.test(W.layers)&&Ou(Mt,z,W,yt,Nt,Ft)}}function Ou(R,z,W,X,k,nt){R.onBeforeRender(y,z,W,X,k,nt),R.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),k.onBeforeRender(y,z,W,X,R,nt),k.transparent===!0&&k.side===Ge&&k.forceSinglePass===!1?(k.side=di,k.needsUpdate=!0,y.renderBufferDirect(W,z,X,k,R,nt),k.side=Jn,k.needsUpdate=!0,y.renderBufferDirect(W,z,X,k,R,nt),k.side=Ge):y.renderBufferDirect(W,z,X,k,R,nt),R.onAfterRender(y,z,W,X,k,nt)}function Rr(R,z,W){z.isScene!==!0&&(z=kt);const X=Lt.get(R),k=m.state.lights,nt=m.state.shadowsArray,dt=k.state.version,Mt=xt.getParameters(R,k.state,nt,z,W),yt=xt.getProgramCacheKey(Mt);let Nt=X.programs;X.environment=R.isMeshStandardMaterial?z.environment:null,X.fog=z.fog,X.envMap=(R.isMeshStandardMaterial?V:b).get(R.envMap||X.environment),X.envMapRotation=X.environment!==null&&R.envMap===null?z.environmentRotation:R.envMapRotation,Nt===void 0&&(R.addEventListener("dispose",te),Nt=new Map,X.programs=Nt);let Ft=Nt.get(yt);if(Ft!==void 0){if(X.currentProgram===Ft&&X.lightsStateVersion===dt)return Bu(R,Mt),Ft}else Mt.uniforms=xt.getUniforms(R),R.onBeforeCompile(Mt,y),Ft=xt.acquireProgram(Mt,yt),Nt.set(yt,Ft),X.uniforms=Mt.uniforms;const wt=X.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(wt.clippingPlanes=it.uniform),Bu(R,Mt),X.needsLights=C0(R),X.lightsStateVersion=dt,X.needsLights&&(wt.ambientLightColor.value=k.state.ambient,wt.lightProbe.value=k.state.probe,wt.directionalLights.value=k.state.directional,wt.directionalLightShadows.value=k.state.directionalShadow,wt.spotLights.value=k.state.spot,wt.spotLightShadows.value=k.state.spotShadow,wt.rectAreaLights.value=k.state.rectArea,wt.ltc_1.value=k.state.rectAreaLTC1,wt.ltc_2.value=k.state.rectAreaLTC2,wt.pointLights.value=k.state.point,wt.pointLightShadows.value=k.state.pointShadow,wt.hemisphereLights.value=k.state.hemi,wt.directionalShadowMap.value=k.state.directionalShadowMap,wt.directionalShadowMatrix.value=k.state.directionalShadowMatrix,wt.spotShadowMap.value=k.state.spotShadowMap,wt.spotLightMatrix.value=k.state.spotLightMatrix,wt.spotLightMap.value=k.state.spotLightMap,wt.pointShadowMap.value=k.state.pointShadowMap,wt.pointShadowMatrix.value=k.state.pointShadowMatrix),X.currentProgram=Ft,X.uniformsList=null,Ft}function zu(R){if(R.uniformsList===null){const z=R.currentProgram.getUniforms();R.uniformsList=Wo.seqWithValue(z.seq,R.uniforms)}return R.uniformsList}function Bu(R,z){const W=Lt.get(R);W.outputColorSpace=z.outputColorSpace,W.batching=z.batching,W.batchingColor=z.batchingColor,W.instancing=z.instancing,W.instancingColor=z.instancingColor,W.instancingMorph=z.instancingMorph,W.skinning=z.skinning,W.morphTargets=z.morphTargets,W.morphNormals=z.morphNormals,W.morphColors=z.morphColors,W.morphTargetsCount=z.morphTargetsCount,W.numClippingPlanes=z.numClippingPlanes,W.numIntersection=z.numClipIntersection,W.vertexAlphas=z.vertexAlphas,W.vertexTangents=z.vertexTangents,W.toneMapping=z.toneMapping}function A0(R,z,W,X,k){z.isScene!==!0&&(z=kt),P.resetTextureUnits();const nt=z.fog,dt=X.isMeshStandardMaterial?z.environment:null,Mt=E===null?y.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:Qn,yt=(X.isMeshStandardMaterial?V:b).get(X.envMap||dt),Nt=X.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Ft=!!W.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),wt=!!W.morphAttributes.position,fe=!!W.morphAttributes.normal,xe=!!W.morphAttributes.color;let Re=Zn;X.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(Re=y.toneMapping);const bi=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,le=bi!==void 0?bi.length:0,Tt=Lt.get(X),Ke=m.state.lights;if(K===!0&&(et===!0||R!==D)){const Ui=R===D&&X.id===A;it.setState(X,R,Ui)}let ce=!1;X.version===Tt.__version?(Tt.needsLights&&Tt.lightsStateVersion!==Ke.state.version||Tt.outputColorSpace!==Mt||k.isBatchedMesh&&Tt.batching===!1||!k.isBatchedMesh&&Tt.batching===!0||k.isBatchedMesh&&Tt.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&Tt.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&Tt.instancing===!1||!k.isInstancedMesh&&Tt.instancing===!0||k.isSkinnedMesh&&Tt.skinning===!1||!k.isSkinnedMesh&&Tt.skinning===!0||k.isInstancedMesh&&Tt.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Tt.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Tt.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Tt.instancingMorph===!1&&k.morphTexture!==null||Tt.envMap!==yt||X.fog===!0&&Tt.fog!==nt||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==it.numPlanes||Tt.numIntersection!==it.numIntersection)||Tt.vertexAlphas!==Nt||Tt.vertexTangents!==Ft||Tt.morphTargets!==wt||Tt.morphNormals!==fe||Tt.morphColors!==xe||Tt.toneMapping!==Re||Tt.morphTargetsCount!==le)&&(ce=!0):(ce=!0,Tt.__version=X.version);let Xi=Tt.currentProgram;ce===!0&&(Xi=Rr(X,z,k));let Ds=!1,Ti=!1,xl=!1;const Le=Xi.getUniforms(),Dn=Tt.uniforms;if(Pt.useProgram(Xi.program)&&(Ds=!0,Ti=!0,xl=!0),X.id!==A&&(A=X.id,Ti=!0),Ds||D!==R){Zt.reverseDepthBuffer?(vt.copy(R.projectionMatrix),Ag(vt),Rg(vt),Le.setValue(F,"projectionMatrix",vt)):Le.setValue(F,"projectionMatrix",R.projectionMatrix),Le.setValue(F,"viewMatrix",R.matrixWorldInverse);const Ui=Le.map.cameraPosition;Ui!==void 0&&Ui.setValue(F,At.setFromMatrixPosition(R.matrixWorld)),Zt.logarithmicDepthBuffer&&Le.setValue(F,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&Le.setValue(F,"isOrthographic",R.isOrthographicCamera===!0),D!==R&&(D=R,Ti=!0,xl=!0)}if(k.isSkinnedMesh){Le.setOptional(F,k,"bindMatrix"),Le.setOptional(F,k,"bindMatrixInverse");const Ui=k.skeleton;Ui&&(Ui.boneTexture===null&&Ui.computeBoneTexture(),Le.setValue(F,"boneTexture",Ui.boneTexture,P))}k.isBatchedMesh&&(Le.setOptional(F,k,"batchingTexture"),Le.setValue(F,"batchingTexture",k._matricesTexture,P),Le.setOptional(F,k,"batchingIdTexture"),Le.setValue(F,"batchingIdTexture",k._indirectTexture,P),Le.setOptional(F,k,"batchingColorTexture"),k._colorsTexture!==null&&Le.setValue(F,"batchingColorTexture",k._colorsTexture,P));const yl=W.morphAttributes;if((yl.position!==void 0||yl.normal!==void 0||yl.color!==void 0)&&Ut.update(k,W,Xi),(Ti||Tt.receiveShadow!==k.receiveShadow)&&(Tt.receiveShadow=k.receiveShadow,Le.setValue(F,"receiveShadow",k.receiveShadow)),X.isMeshGouraudMaterial&&X.envMap!==null&&(Dn.envMap.value=yt,Dn.flipEnvMap.value=yt.isCubeTexture&&yt.isRenderTargetTexture===!1?-1:1),X.isMeshStandardMaterial&&X.envMap===null&&z.environment!==null&&(Dn.envMapIntensity.value=z.environmentIntensity),Ti&&(Le.setValue(F,"toneMappingExposure",y.toneMappingExposure),Tt.needsLights&&R0(Dn,xl),nt&&X.fog===!0&&ot.refreshFogUniforms(Dn,nt),ot.refreshMaterialUniforms(Dn,X,$,B,m.state.transmissionRenderTarget[R.id]),Wo.upload(F,zu(Tt),Dn,P)),X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(Wo.upload(F,zu(Tt),Dn,P),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&Le.setValue(F,"center",k.center),Le.setValue(F,"modelViewMatrix",k.modelViewMatrix),Le.setValue(F,"normalMatrix",k.normalMatrix),Le.setValue(F,"modelMatrix",k.matrixWorld),X.isShaderMaterial||X.isRawShaderMaterial){const Ui=X.uniformsGroups;for(let Sl=0,P0=Ui.length;Sl<P0;Sl++){const ku=Ui[Sl];O.update(ku,Xi),O.bind(ku,Xi)}}return Xi}function R0(R,z){R.ambientLightColor.needsUpdate=z,R.lightProbe.needsUpdate=z,R.directionalLights.needsUpdate=z,R.directionalLightShadows.needsUpdate=z,R.pointLights.needsUpdate=z,R.pointLightShadows.needsUpdate=z,R.spotLights.needsUpdate=z,R.spotLightShadows.needsUpdate=z,R.rectAreaLights.needsUpdate=z,R.hemisphereLights.needsUpdate=z}function C0(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(R,z,W){Lt.get(R.texture).__webglTexture=z,Lt.get(R.depthTexture).__webglTexture=W;const X=Lt.get(R);X.__hasExternalTextures=!0,X.__autoAllocateDepthBuffer=W===void 0,X.__autoAllocateDepthBuffer||Yt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),X.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(R,z){const W=Lt.get(R);W.__webglFramebuffer=z,W.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(R,z=0,W=0){E=R,C=z,w=W;let X=!0,k=null,nt=!1,dt=!1;if(R){const yt=Lt.get(R);if(yt.__useDefaultFramebuffer!==void 0)Pt.bindFramebuffer(F.FRAMEBUFFER,null),X=!1;else if(yt.__webglFramebuffer===void 0)P.setupRenderTarget(R);else if(yt.__hasExternalTextures)P.rebindTextures(R,Lt.get(R.texture).__webglTexture,Lt.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){const wt=R.depthTexture;if(yt.__boundDepthTexture!==wt){if(wt!==null&&Lt.has(wt)&&(R.width!==wt.image.width||R.height!==wt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");P.setupDepthRenderbuffer(R)}}const Nt=R.texture;(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)&&(dt=!0);const Ft=Lt.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(Ft[z])?k=Ft[z][W]:k=Ft[z],nt=!0):R.samples>0&&P.useMultisampledRTT(R)===!1?k=Lt.get(R).__webglMultisampledFramebuffer:Array.isArray(Ft)?k=Ft[W]:k=Ft,_.copy(R.viewport),x.copy(R.scissor),L=R.scissorTest}else _.copy(Q).multiplyScalar($).floor(),x.copy(st).multiplyScalar($).floor(),L=Bt;if(Pt.bindFramebuffer(F.FRAMEBUFFER,k)&&X&&Pt.drawBuffers(R,k),Pt.viewport(_),Pt.scissor(x),Pt.setScissorTest(L),nt){const yt=Lt.get(R.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+z,yt.__webglTexture,W)}else if(dt){const yt=Lt.get(R.texture),Nt=z||0;F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,yt.__webglTexture,W||0,Nt)}A=-1},this.readRenderTargetPixels=function(R,z,W,X,k,nt,dt){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Mt=Lt.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&dt!==void 0&&(Mt=Mt[dt]),Mt){Pt.bindFramebuffer(F.FRAMEBUFFER,Mt);try{const yt=R.texture,Nt=yt.format,Ft=yt.type;if(!Zt.textureFormatReadable(Nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Zt.textureTypeReadable(Ft)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=R.width-X&&W>=0&&W<=R.height-k&&F.readPixels(z,W,X,k,Ot.convert(Nt),Ot.convert(Ft),nt)}finally{const yt=E!==null?Lt.get(E).__webglFramebuffer:null;Pt.bindFramebuffer(F.FRAMEBUFFER,yt)}}},this.readRenderTargetPixelsAsync=async function(R,z,W,X,k,nt,dt){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Mt=Lt.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&dt!==void 0&&(Mt=Mt[dt]),Mt){const yt=R.texture,Nt=yt.format,Ft=yt.type;if(!Zt.textureFormatReadable(Nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Zt.textureTypeReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(z>=0&&z<=R.width-X&&W>=0&&W<=R.height-k){Pt.bindFramebuffer(F.FRAMEBUFFER,Mt);const wt=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,wt),F.bufferData(F.PIXEL_PACK_BUFFER,nt.byteLength,F.STREAM_READ),F.readPixels(z,W,X,k,Ot.convert(Nt),Ot.convert(Ft),0);const fe=E!==null?Lt.get(E).__webglFramebuffer:null;Pt.bindFramebuffer(F.FRAMEBUFFER,fe);const xe=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Tg(F,xe,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,wt),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,nt),F.deleteBuffer(wt),F.deleteSync(xe),nt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(R,z=null,W=0){R.isTexture!==!0&&(Vo("WebGLRenderer: copyFramebufferToTexture function signature has changed."),z=arguments[0]||null,R=arguments[1]);const X=Math.pow(2,-W),k=Math.floor(R.image.width*X),nt=Math.floor(R.image.height*X),dt=z!==null?z.x:0,Mt=z!==null?z.y:0;P.setTexture2D(R,0),F.copyTexSubImage2D(F.TEXTURE_2D,W,0,0,dt,Mt,k,nt),Pt.unbindTexture()},this.copyTextureToTexture=function(R,z,W=null,X=null,k=0){R.isTexture!==!0&&(Vo("WebGLRenderer: copyTextureToTexture function signature has changed."),X=arguments[0]||null,R=arguments[1],z=arguments[2],k=arguments[3]||0,W=null);let nt,dt,Mt,yt,Nt,Ft;W!==null?(nt=W.max.x-W.min.x,dt=W.max.y-W.min.y,Mt=W.min.x,yt=W.min.y):(nt=R.image.width,dt=R.image.height,Mt=0,yt=0),X!==null?(Nt=X.x,Ft=X.y):(Nt=0,Ft=0);const wt=Ot.convert(z.format),fe=Ot.convert(z.type);P.setTexture2D(z,0),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,z.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,z.unpackAlignment);const xe=F.getParameter(F.UNPACK_ROW_LENGTH),Re=F.getParameter(F.UNPACK_IMAGE_HEIGHT),bi=F.getParameter(F.UNPACK_SKIP_PIXELS),le=F.getParameter(F.UNPACK_SKIP_ROWS),Tt=F.getParameter(F.UNPACK_SKIP_IMAGES),Ke=R.isCompressedTexture?R.mipmaps[k]:R.image;F.pixelStorei(F.UNPACK_ROW_LENGTH,Ke.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Ke.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,Mt),F.pixelStorei(F.UNPACK_SKIP_ROWS,yt),R.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,k,Nt,Ft,nt,dt,wt,fe,Ke.data):R.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,k,Nt,Ft,Ke.width,Ke.height,wt,Ke.data):F.texSubImage2D(F.TEXTURE_2D,k,Nt,Ft,nt,dt,wt,fe,Ke),F.pixelStorei(F.UNPACK_ROW_LENGTH,xe),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Re),F.pixelStorei(F.UNPACK_SKIP_PIXELS,bi),F.pixelStorei(F.UNPACK_SKIP_ROWS,le),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Tt),k===0&&z.generateMipmaps&&F.generateMipmap(F.TEXTURE_2D),Pt.unbindTexture()},this.copyTextureToTexture3D=function(R,z,W=null,X=null,k=0){R.isTexture!==!0&&(Vo("WebGLRenderer: copyTextureToTexture3D function signature has changed."),W=arguments[0]||null,X=arguments[1]||null,R=arguments[2],z=arguments[3],k=arguments[4]||0);let nt,dt,Mt,yt,Nt,Ft,wt,fe,xe;const Re=R.isCompressedTexture?R.mipmaps[k]:R.image;W!==null?(nt=W.max.x-W.min.x,dt=W.max.y-W.min.y,Mt=W.max.z-W.min.z,yt=W.min.x,Nt=W.min.y,Ft=W.min.z):(nt=Re.width,dt=Re.height,Mt=Re.depth,yt=0,Nt=0,Ft=0),X!==null?(wt=X.x,fe=X.y,xe=X.z):(wt=0,fe=0,xe=0);const bi=Ot.convert(z.format),le=Ot.convert(z.type);let Tt;if(z.isData3DTexture)P.setTexture3D(z,0),Tt=F.TEXTURE_3D;else if(z.isDataArrayTexture||z.isCompressedArrayTexture)P.setTexture2DArray(z,0),Tt=F.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,z.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,z.unpackAlignment);const Ke=F.getParameter(F.UNPACK_ROW_LENGTH),ce=F.getParameter(F.UNPACK_IMAGE_HEIGHT),Xi=F.getParameter(F.UNPACK_SKIP_PIXELS),Ds=F.getParameter(F.UNPACK_SKIP_ROWS),Ti=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,Re.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Re.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,yt),F.pixelStorei(F.UNPACK_SKIP_ROWS,Nt),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Ft),R.isDataTexture||R.isData3DTexture?F.texSubImage3D(Tt,k,wt,fe,xe,nt,dt,Mt,bi,le,Re.data):z.isCompressedArrayTexture?F.compressedTexSubImage3D(Tt,k,wt,fe,xe,nt,dt,Mt,bi,Re.data):F.texSubImage3D(Tt,k,wt,fe,xe,nt,dt,Mt,bi,le,Re),F.pixelStorei(F.UNPACK_ROW_LENGTH,Ke),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,ce),F.pixelStorei(F.UNPACK_SKIP_PIXELS,Xi),F.pixelStorei(F.UNPACK_SKIP_ROWS,Ds),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Ti),k===0&&z.generateMipmaps&&F.generateMipmap(Tt),Pt.unbindTexture()},this.initRenderTarget=function(R){Lt.get(R).__webglFramebuffer===void 0&&P.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?P.setTextureCube(R,0):R.isData3DTexture?P.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?P.setTexture2DArray(R,0):P.setTexture2D(R,0),Pt.unbindTexture()},this.resetState=function(){C=0,w=0,E=null,Pt.reset(),ie.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Tn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===cu?"display-p3":"srgb",e.unpackColorSpace=oe.workingColorSpace===ul?"display-p3":"srgb"}}class gu{constructor(t,e=1,i=1e3){this.isFog=!0,this.name="",this.color=new gt(t),this.near=e,this.far=i}clone(){return new gu(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class bm extends Ae{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Vi,this.environmentIntensity=1,this.environmentRotation=new Vi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class zy{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Ah,this.updateRanges=[],this.version=0,this.uuid=Cn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let n=0,a=this.stride;n<a;n++)this.array[t+n]=e.array[i+n];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Cn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Cn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const mi=new T;class el{constructor(t,e,i,n=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=n}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)mi.fromBufferAttribute(this,e),mi.applyMatrix4(t),this.setXYZ(e,mi.x,mi.y,mi.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)mi.fromBufferAttribute(this,e),mi.applyNormalMatrix(t),this.setXYZ(e,mi.x,mi.y,mi.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)mi.fromBufferAttribute(this,e),mi.transformDirection(t),this.setXYZ(e,mi.x,mi.y,mi.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=en(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=pe(i,this.array)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=pe(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=pe(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=pe(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=pe(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=en(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=en(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=en(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=en(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=pe(e,this.array),i=pe(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=pe(e,this.array),i=pe(i,this.array),n=pe(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this}setXYZW(t,e,i,n,a){return t=t*this.data.stride+this.offset,this.normalized&&(e=pe(e,this.array),i=pe(i,this.array),n=pe(n,this.array),a=pe(a,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this.data.array[t+3]=a,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let i=0;i<this.count;i++){const n=i*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)e.push(this.data.array[n+a])}return new he(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new el(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let i=0;i<this.count;i++){const n=i*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)e.push(this.data.array[n+a])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Tm extends an{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new gt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let qs;const Ia=new T,$s=new T,Ks=new T,Zs=new at,Ua=new at,Am=new zt,Zr=new T,Na=new T,Jr=new T,Uf=new at,jl=new at,Nf=new at;class By extends Ae{constructor(t=new Tm){if(super(),this.isSprite=!0,this.type="Sprite",qs===void 0){qs=new ve;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new zy(e,5);qs.setIndex([0,1,2,0,2,3]),qs.setAttribute("position",new el(i,3,0,!1)),qs.setAttribute("uv",new el(i,2,3,!1))}this.geometry=qs,this.material=t,this.center=new at(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),$s.setFromMatrixScale(this.matrixWorld),Am.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Ks.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&$s.multiplyScalar(-Ks.z);const i=this.material.rotation;let n,a;i!==0&&(a=Math.cos(i),n=Math.sin(i));const r=this.center;jr(Zr.set(-.5,-.5,0),Ks,r,$s,n,a),jr(Na.set(.5,-.5,0),Ks,r,$s,n,a),jr(Jr.set(.5,.5,0),Ks,r,$s,n,a),Uf.set(0,0),jl.set(1,0),Nf.set(1,1);let o=t.ray.intersectTriangle(Zr,Na,Jr,!1,Ia);if(o===null&&(jr(Na.set(-.5,.5,0),Ks,r,$s,n,a),jl.set(0,1),o=t.ray.intersectTriangle(Zr,Jr,Na,!1,Ia),o===null))return;const l=t.ray.origin.distanceTo(Ia);l<t.near||l>t.far||e.push({distance:l,point:Ia.clone(),uv:zi.getInterpolation(Ia,Zr,Na,Jr,Uf,jl,Nf,new at),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function jr(s,t,e,i,n,a){Zs.subVectors(s,e).addScalar(.5).multiply(i),n!==void 0?(Ua.x=a*Zs.x-n*Zs.y,Ua.y=n*Zs.x+a*Zs.y):Ua.copy(Zs),s.copy(t),s.x+=Ua.x,s.y+=Ua.y,s.applyMatrix4(Am)}class vu extends pi{constructor(t=null,e=1,i=1,n,a,r,o,l,c=fi,h=fi,f,u){super(null,r,o,l,c,h,n,a,f,u),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class or extends he{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Js=new zt,Ff=new zt,Qr=[],Of=new ts,ky=new zt,Fa=new St,Oa=new Rs;class Gi extends St{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new or(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,ky)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new ts),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Js),Of.copy(t.boundingBox).applyMatrix4(Js),this.boundingBox.union(Of)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Rs),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Js),Oa.copy(t.boundingSphere).applyMatrix4(Js),this.boundingSphere.union(Oa)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,a=i.length+1,r=t*a+1;for(let o=0;o<i.length;o++)i[o]=n[r+o]}raycast(t,e){const i=this.matrixWorld,n=this.count;if(Fa.geometry=this.geometry,Fa.material=this.material,Fa.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Oa.copy(this.boundingSphere),Oa.applyMatrix4(i),t.ray.intersectsSphere(Oa)!==!1))for(let a=0;a<n;a++){this.getMatrixAt(a,Js),Ff.multiplyMatrices(i,Js),Fa.matrixWorld=Ff,Fa.raycast(t,Qr);for(let r=0,o=Qr.length;r<o;r++){const l=Qr[r];l.instanceId=a,l.object=this,e.push(l)}Qr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new or(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new vu(new Float32Array(n*this.count),n,this.count,au,cn));const a=this.morphTexture.source.data.data;let r=0;for(let c=0;c<i.length;c++)r+=i[c];const o=this.geometry.morphTargetsRelative?1:1-r,l=n*t;a[l]=o,a.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class _u extends an{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new gt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const il=new T,nl=new T,zf=new zt,za=new uu,to=new Rs,Ql=new T,Bf=new T;class Rm extends Ae{constructor(t=new ve,e=new _u){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[0];for(let n=1,a=e.count;n<a;n++)il.fromBufferAttribute(e,n-1),nl.fromBufferAttribute(e,n),i[n]=i[n-1],i[n]+=il.distanceTo(nl);t.setAttribute("lineDistance",new me(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const i=this.geometry,n=this.matrixWorld,a=t.params.Line.threshold,r=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),to.copy(i.boundingSphere),to.applyMatrix4(n),to.radius+=a,t.ray.intersectsSphere(to)===!1)return;zf.copy(n).invert(),za.copy(t.ray).applyMatrix4(zf);const o=a/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){const d=Math.max(0,r.start),g=Math.min(h.count,r.start+r.count);for(let v=d,m=g-1;v<m;v+=c){const p=h.getX(v),M=h.getX(v+1),y=eo(this,t,za,l,p,M);y&&e.push(y)}if(this.isLineLoop){const v=h.getX(g-1),m=h.getX(d),p=eo(this,t,za,l,v,m);p&&e.push(p)}}else{const d=Math.max(0,r.start),g=Math.min(u.count,r.start+r.count);for(let v=d,m=g-1;v<m;v+=c){const p=eo(this,t,za,l,v,v+1);p&&e.push(p)}if(this.isLineLoop){const v=eo(this,t,za,l,g-1,d);v&&e.push(v)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=n.length;a<r;a++){const o=n[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}}function eo(s,t,e,i,n,a){const r=s.geometry.attributes.position;if(il.fromBufferAttribute(r,n),nl.fromBufferAttribute(r,a),e.distanceSqToSegment(il,nl,Ql,Bf)>i)return;Ql.applyMatrix4(s.matrixWorld);const l=t.ray.origin.distanceTo(Ql);if(!(l<t.near||l>t.far))return{distance:l,point:Bf.clone().applyMatrix4(s.matrixWorld),index:n,face:null,faceIndex:null,barycoord:null,object:s}}const kf=new T,Hf=new T;class Hy extends Rm{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[];for(let n=0,a=e.count;n<a;n+=2)kf.fromBufferAttribute(e,n),Hf.fromBufferAttribute(e,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+kf.distanceTo(Hf);t.setAttribute("lineDistance",new me(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Ph extends an{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new gt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Gf=new zt,Lh=new uu,io=new Rs,no=new T;class Vf extends Ae{constructor(t=new ve,e=new Ph){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const i=this.geometry,n=this.matrixWorld,a=t.params.Points.threshold,r=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),io.copy(i.boundingSphere),io.applyMatrix4(n),io.radius+=a,t.ray.intersectsSphere(io)===!1)return;Gf.copy(n).invert(),Lh.copy(t.ray).applyMatrix4(Gf);const o=a/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,f=i.attributes.position;if(c!==null){const u=Math.max(0,r.start),d=Math.min(c.count,r.start+r.count);for(let g=u,v=d;g<v;g++){const m=c.getX(g);no.fromBufferAttribute(f,m),Wf(no,m,l,n,t,e,this)}}else{const u=Math.max(0,r.start),d=Math.min(f.count,r.start+r.count);for(let g=u,v=d;g<v;g++)no.fromBufferAttribute(f,g),Wf(no,g,l,n,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=n.length;a<r;a++){const o=n[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}}function Wf(s,t,e,i,n,a,r){const o=Lh.distanceSqToPoint(s);if(o<e){const l=new T;Lh.closestPointToPoint(s,l),l.applyMatrix4(i);const c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;a.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:r})}}class Ma extends pi{constructor(t,e,i,n,a,r,o,l,c){super(t,e,i,n,a,r,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Mu extends ve{constructor(t=[new at(0,-.5),new at(.5,0),new at(0,.5)],e=12,i=0,n=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:n},e=Math.floor(e),n=ei(n,0,Math.PI*2);const a=[],r=[],o=[],l=[],c=[],h=1/e,f=new T,u=new at,d=new T,g=new T,v=new T;let m=0,p=0;for(let M=0;M<=t.length-1;M++)switch(M){case 0:m=t[M+1].x-t[M].x,p=t[M+1].y-t[M].y,d.x=p*1,d.y=-m,d.z=p*0,v.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case t.length-1:l.push(v.x,v.y,v.z);break;default:m=t[M+1].x-t[M].x,p=t[M+1].y-t[M].y,d.x=p*1,d.y=-m,d.z=p*0,g.copy(d),d.x+=v.x,d.y+=v.y,d.z+=v.z,d.normalize(),l.push(d.x,d.y,d.z),v.copy(g)}for(let M=0;M<=e;M++){const y=i+M*h*n,S=Math.sin(y),C=Math.cos(y);for(let w=0;w<=t.length-1;w++){f.x=t[w].x*S,f.y=t[w].y,f.z=t[w].x*C,r.push(f.x,f.y,f.z),u.x=M/e,u.y=w/(t.length-1),o.push(u.x,u.y);const E=l[3*w+0]*S,A=l[3*w+1],D=l[3*w+0]*C;c.push(E,A,D)}}for(let M=0;M<e;M++)for(let y=0;y<t.length-1;y++){const S=y+M*t.length,C=S,w=S+t.length,E=S+t.length+1,A=S+1;a.push(C,w,A),a.push(E,A,w)}this.setIndex(a),this.setAttribute("position",new me(r,3)),this.setAttribute("uv",new me(o,2)),this.setAttribute("normal",new me(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Mu(t.points,t.segments,t.phiStart,t.phiLength)}}class xu extends ve{constructor(t=1,e=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:n},e=Math.max(3,e);const a=[],r=[],o=[],l=[],c=new T,h=new at;r.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let f=0,u=3;f<=e;f++,u+=3){const d=i+f/e*n;c.x=t*Math.cos(d),c.y=t*Math.sin(d),r.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(r[u]/t+1)/2,h.y=(r[u+1]/t+1)/2,l.push(h.x,h.y)}for(let f=1;f<=e;f++)a.push(f,f+1,0);this.setIndex(a),this.setAttribute("position",new me(r,3)),this.setAttribute("normal",new me(o,3)),this.setAttribute("uv",new me(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new xu(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class ii extends ve{constructor(t=1,e=1,i=1,n=32,a=1,r=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:a,openEnded:r,thetaStart:o,thetaLength:l};const c=this;n=Math.floor(n),a=Math.floor(a);const h=[],f=[],u=[],d=[];let g=0;const v=[],m=i/2;let p=0;M(),r===!1&&(t>0&&y(!0),e>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new me(f,3)),this.setAttribute("normal",new me(u,3)),this.setAttribute("uv",new me(d,2));function M(){const S=new T,C=new T;let w=0;const E=(e-t)/i;for(let A=0;A<=a;A++){const D=[],_=A/a,x=_*(e-t)+t;for(let L=0;L<=n;L++){const U=L/n,G=U*l+o,H=Math.sin(G),B=Math.cos(G);C.x=x*H,C.y=-_*i+m,C.z=x*B,f.push(C.x,C.y,C.z),S.set(H,E,B).normalize(),u.push(S.x,S.y,S.z),d.push(U,1-_),D.push(g++)}v.push(D)}for(let A=0;A<n;A++)for(let D=0;D<a;D++){const _=v[D][A],x=v[D+1][A],L=v[D+1][A+1],U=v[D][A+1];t>0&&(h.push(_,x,U),w+=3),e>0&&(h.push(x,L,U),w+=3)}c.addGroup(p,w,0),p+=w}function y(S){const C=g,w=new at,E=new T;let A=0;const D=S===!0?t:e,_=S===!0?1:-1;for(let L=1;L<=n;L++)f.push(0,m*_,0),u.push(0,_,0),d.push(.5,.5),g++;const x=g;for(let L=0;L<=n;L++){const G=L/n*l+o,H=Math.cos(G),B=Math.sin(G);E.x=D*B,E.y=m*_,E.z=D*H,f.push(E.x,E.y,E.z),u.push(0,_,0),w.x=H*.5+.5,w.y=B*.5*_+.5,d.push(w.x,w.y),g++}for(let L=0;L<n;L++){const U=C+L,G=x+L;S===!0?h.push(G,G+1,U):h.push(G+1,G,U),A+=3}c.addGroup(p,A,S===!0?1:2),p+=A}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ii(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class xa extends ii{constructor(t=1,e=1,i=32,n=1,a=!1,r=0,o=Math.PI*2){super(0,t,e,i,n,a,r,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:a,thetaStart:r,thetaLength:o}}static fromJSON(t){return new xa(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class yu extends ve{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};const a=[],r=[];o(n),c(i),h(),this.setAttribute("position",new me(a,3)),this.setAttribute("normal",new me(a.slice(),3)),this.setAttribute("uv",new me(r,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function o(M){const y=new T,S=new T,C=new T;for(let w=0;w<e.length;w+=3)d(e[w+0],y),d(e[w+1],S),d(e[w+2],C),l(y,S,C,M)}function l(M,y,S,C){const w=C+1,E=[];for(let A=0;A<=w;A++){E[A]=[];const D=M.clone().lerp(S,A/w),_=y.clone().lerp(S,A/w),x=w-A;for(let L=0;L<=x;L++)L===0&&A===w?E[A][L]=D:E[A][L]=D.clone().lerp(_,L/x)}for(let A=0;A<w;A++)for(let D=0;D<2*(w-A)-1;D++){const _=Math.floor(D/2);D%2===0?(u(E[A][_+1]),u(E[A+1][_]),u(E[A][_])):(u(E[A][_+1]),u(E[A+1][_+1]),u(E[A+1][_]))}}function c(M){const y=new T;for(let S=0;S<a.length;S+=3)y.x=a[S+0],y.y=a[S+1],y.z=a[S+2],y.normalize().multiplyScalar(M),a[S+0]=y.x,a[S+1]=y.y,a[S+2]=y.z}function h(){const M=new T;for(let y=0;y<a.length;y+=3){M.x=a[y+0],M.y=a[y+1],M.z=a[y+2];const S=m(M)/2/Math.PI+.5,C=p(M)/Math.PI+.5;r.push(S,1-C)}g(),f()}function f(){for(let M=0;M<r.length;M+=6){const y=r[M+0],S=r[M+2],C=r[M+4],w=Math.max(y,S,C),E=Math.min(y,S,C);w>.9&&E<.1&&(y<.2&&(r[M+0]+=1),S<.2&&(r[M+2]+=1),C<.2&&(r[M+4]+=1))}}function u(M){a.push(M.x,M.y,M.z)}function d(M,y){const S=M*3;y.x=t[S+0],y.y=t[S+1],y.z=t[S+2]}function g(){const M=new T,y=new T,S=new T,C=new T,w=new at,E=new at,A=new at;for(let D=0,_=0;D<a.length;D+=9,_+=6){M.set(a[D+0],a[D+1],a[D+2]),y.set(a[D+3],a[D+4],a[D+5]),S.set(a[D+6],a[D+7],a[D+8]),w.set(r[_+0],r[_+1]),E.set(r[_+2],r[_+3]),A.set(r[_+4],r[_+5]),C.copy(M).add(y).add(S).divideScalar(3);const x=m(C);v(w,_+0,M,x),v(E,_+2,y,x),v(A,_+4,S,x)}}function v(M,y,S,C){C<0&&M.x===1&&(r[y]=M.x-1),S.x===0&&S.z===0&&(r[y]=C/2/Math.PI+.5)}function m(M){return Math.atan2(M.z,-M.x)}function p(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new yu(t.vertices,t.indices,t.radius,t.details)}}class Su extends yu{constructor(t=1,e=0){const i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],a=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,a,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Su(t.radius,t.detail)}}class Be extends ve{constructor(t=1,e=32,i=16,n=0,a=Math.PI*2,r=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:a,thetaStart:r,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));const l=Math.min(r+o,Math.PI);let c=0;const h=[],f=new T,u=new T,d=[],g=[],v=[],m=[];for(let p=0;p<=i;p++){const M=[],y=p/i;let S=0;p===0&&r===0?S=.5/e:p===i&&l===Math.PI&&(S=-.5/e);for(let C=0;C<=e;C++){const w=C/e;f.x=-t*Math.cos(n+w*a)*Math.sin(r+y*o),f.y=t*Math.cos(r+y*o),f.z=t*Math.sin(n+w*a)*Math.sin(r+y*o),g.push(f.x,f.y,f.z),u.copy(f).normalize(),v.push(u.x,u.y,u.z),m.push(w+S,1-y),M.push(c++)}h.push(M)}for(let p=0;p<i;p++)for(let M=0;M<e;M++){const y=h[p][M+1],S=h[p][M],C=h[p+1][M],w=h[p+1][M+1];(p!==0||r>0)&&d.push(y,S,w),(p!==i-1||l<Math.PI)&&d.push(S,C,w)}this.setIndex(d),this.setAttribute("position",new me(g,3)),this.setAttribute("normal",new me(v,3)),this.setAttribute("uv",new me(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Be(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class wu extends ve{constructor(t=1,e=.4,i=12,n=48,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:n,arc:a},i=Math.floor(i),n=Math.floor(n);const r=[],o=[],l=[],c=[],h=new T,f=new T,u=new T;for(let d=0;d<=i;d++)for(let g=0;g<=n;g++){const v=g/n*a,m=d/i*Math.PI*2;f.x=(t+e*Math.cos(m))*Math.cos(v),f.y=(t+e*Math.cos(m))*Math.sin(v),f.z=e*Math.sin(m),o.push(f.x,f.y,f.z),h.x=t*Math.cos(v),h.y=t*Math.sin(v),u.subVectors(f,h).normalize(),l.push(u.x,u.y,u.z),c.push(g/n),c.push(d/i)}for(let d=1;d<=i;d++)for(let g=1;g<=n;g++){const v=(n+1)*d+g-1,m=(n+1)*(d-1)+g-1,p=(n+1)*(d-1)+g,M=(n+1)*d+g;r.push(v,m,M),r.push(m,p,M)}this.setIndex(r),this.setAttribute("position",new me(o,3)),this.setAttribute("normal",new me(l,3)),this.setAttribute("uv",new me(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new wu(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class Gy extends Se{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class ms extends an{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new gt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=hl,this.normalScale=new at(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Vi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Vy extends ms{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new at(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ei(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new gt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new gt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new gt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class Wy extends an{constructor(t){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=hl,this.normalScale=new at(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(t)}copy(t){return super.copy(t),this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.flatShading=t.flatShading,this}}class be extends an{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=hl,this.normalScale=new at(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Vi,this.combine=tu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Cm extends Ae{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new gt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Xy extends Cm{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ae.DEFAULT_UP),this.updateMatrix(),this.groundColor=new gt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const tc=new zt,Xf=new T,Yf=new T;class Yy{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new at(512,512),this.map=null,this.mapPass=null,this.matrix=new zt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new fu,this._frameExtents=new at(1,1),this._viewportCount=1,this._viewports=[new Pe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,i=this.matrix;Xf.setFromMatrixPosition(t.matrixWorld),e.position.copy(Xf),Yf.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Yf),e.updateMatrixWorld(),tc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(tc),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(tc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class qy extends Yy{constructor(){super(new du(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Pm extends Cm{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ae.DEFAULT_UP),this.updateMatrix(),this.target=new Ae,this.shadow=new qy}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class $y extends ve{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){const t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}}class Ky{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=qf(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=qf();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function qf(){return performance.now()}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Qh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Qh);function so(s,t=0,e=2){const i=new ve;i.setAttribute("position",new he(new Float32Array(s),3));const n=new Float32Array(s.length/3*2);for(let a=0,r=0;a<s.length;a+=3,r+=2)n[r]=s[a+t]/5,n[r+1]=s[a+e]/5;return i.setAttribute("uv",new he(n,2)),i.computeVertexNormals(),i}function $f(s,t,e){const i=n=>{const a=(n+s/60)%6;return e-e*t*Math.max(0,Math.min(a,4-a,1))};return Math.round(i(5)*255)<<16|Math.round(i(3)*255)<<8|Math.round(i(1)*255)}let ao;function Zy(){if(ao!==void 0)return ao;if(typeof document>"u")return ao=null;const s=512,t=document.createElement("canvas");t.width=t.height=s;const e=t.getContext("2d");let i=7;const n=()=>(i=i*16807%2147483647)/2147483647;e.fillStyle="rgb(128,128,128)",e.fillRect(0,0,s,s);const a=6;for(let p=0;p<a;p++){const M=p*s/a;let y=-n()*80;for(;y<s;){const S=60+n()*110,C=118+n()*20;e.fillStyle=`rgb(${C},${C},${C})`,e.fillRect(y+2,M+2,S-4,s/a-4),e.fillStyle="rgb(70,70,70)",e.fillRect(y,M,2,s/a),e.fillStyle="rgb(165,165,165)";for(let E=M+6;E<M+s/a-4;E+=9)e.beginPath(),e.arc(y+6,E,1.3,0,Math.PI*2),e.fill();const w=n();if(w<.12)for(let E=0;E<6;E++)e.fillStyle="rgb(60,60,60)",e.fillRect(y+18,M+14+E*7,S*.4,3),e.fillStyle="rgb(170,170,170)",e.fillRect(y+18,M+17+E*7,S*.4,1);else w<.24&&(e.strokeStyle="rgb(80,80,80)",e.lineWidth=1.5,e.strokeRect(y+16,M+16,26,20));y+=S}e.fillStyle="rgb(70,70,70)",e.fillRect(0,M,s,2),e.fillStyle="rgb(165,165,165)";for(let S=4;S<s;S+=9)e.beginPath(),e.arc(S,M+6,1.3,0,Math.PI*2),e.fill()}const r=e.getImageData(0,0,s,s).data,o=(p,M)=>r[((M+s)%s*s+(p+s)%s)*4]/255,l=document.createElement("canvas");l.width=l.height=s;const c=l.getContext("2d"),h=c.createImageData(s,s),f=document.createElement("canvas");f.width=f.height=s;const u=f.getContext("2d"),d=u.createImageData(s,s),g=3;for(let p=0;p<s;p++)for(let M=0;M<s;M++){const y=(o(M+1,p-1)+2*o(M+1,p)+o(M+1,p+1)-o(M-1,p-1)-2*o(M-1,p)-o(M-1,p+1))*g,S=(o(M-1,p+1)+2*o(M,p+1)+o(M+1,p+1)-o(M-1,p-1)-2*o(M,p-1)-o(M+1,p-1))*g,C=Math.hypot(y,S,1),w=(p*s+M)*4;h.data[w]=(-y/C*.5+.5)*255,h.data[w+1]=(S/C*.5+.5)*255,h.data[w+2]=(1/C*.5+.5)*255,h.data[w+3]=255;const E=o(M,p),A=.06*Math.sin(M*.05+Math.sin(p*.013)*3)+.04*Math.sin(M*.31+p*.002),D=Math.min(1,Math.max(0,.82+Math.abs(E-.5)*.6+A));d.data[w]=d.data[w+1]=d.data[w+2]=D*255,d.data[w+3]=255}c.putImageData(h,0,0),u.putImageData(d,0,0);const v=new Ma(l),m=new Ma(f);for(const p of[v,m])p.wrapS=p.wrapT=Pn,p.repeat.set(2,2),p.anisotropy=4;return ao={normal:v,rough:m}}const Jy=`
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`,jy=`
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
  }`;function Kf(){return new Se({uniforms:{uGain:{value:1},uHeat:{value:0},uTime:{value:0},uDiamonds:{value:0}},vertexShader:Jy,fragmentShader:jy,transparent:!0,depthWrite:!1,blending:nn,side:Ge,fog:!1})}const Du=class Du{constructor(t=null){this.group=new hi,this.nav=[],this.elevons=[],this.stabs=[],this.ctl={roll:0,pitch:0,yaw:0},this.gear=new hi,this.gearLegs=[],this.gearPos=0,this.ab=0,this.lastT=0;const e=Zy(),i=(H,B,$,N=!1)=>new ms({color:H,metalness:B,roughness:$,side:N?Ge:void 0,normalMap:e?.normal??null,normalScale:new at(.55,.55),roughnessMap:e?.rough??null,envMapIntensity:1}),n=i(t===null?9213859:$f(t,.5,.85),.22,.38),a=i(t===null?6121072:$f(t,.65,.45),.25,.45,!0),r=new Vy({color:2372170,metalness:.1,roughness:.05,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:1.6,emissive:330516}),o=new ms({color:4867136,metalness:.9,roughness:.35,side:Ge}),l=[[0,-10],[.18,-9.6],[.36,-9],[.52,-8.2],[.66,-7.2],[.78,-6],[.88,-4.6],[.94,-3],[.96,-1],[.95,1.5],[.9,3.5],[.83,5],[.77,6],[.74,6.05]].map(([H,B])=>new at(H,B)),c=new Mu(l,32);c.rotateX(Math.PI/2),c.scale(1.08,.88,1);const h=new St(c,n);this.group.add(h);const f=new St(new ii(.22,.32,6.5,12),n);f.rotation.x=Math.PI/2,f.scale.set(1.4,1,1),f.position.set(0,.72,-.4),this.group.add(f);const u=new St(new Be(.6,24,16),r);u.scale.set(1,.8,2.4),u.position.set(0,.7,-4.2),this.group.add(u);const d=H=>3.4+(Math.abs(H)-5.2)/-4.6*.6;for(const H of[-1,1]){const B=[.6*H,0,-3],$=[5.2*H,0,3.4],N=[4.8*H,0,d(4.8)],Y=[4.8*H,0,d(4.8)-.75],Q=[.6*H,0,d(.6)-.75],st=[.6*H,0,d(.6)];this.group.add(new St(so([...Y,...N,...$,...Y,...$,...B,...Y,...B,...Q]),a)),this.elevons.push(this.hinged(Y,Q,[N,st],a))}const g=[0,.6,2.5],v=[0,4.2,5.8],m=[0,.6,6],p=H=>5.8+(4.2-H)/3.6*.2,M=[0,3.8,p(3.8)],y=[0,.8,p(.8)],S=[0,3.8,p(3.8)-.6],C=[0,.8,p(.8)-.6];this.group.add(new St(so([...S,...M,...v,...S,...v,...g,...S,...g,...C,...C,...g,...m,...C,...m,...y],2,1),a)),this.rudder=this.hinged(C,S,[y,M],a,2,1);for(const H of[-1,1]){const B=new hi;B.position.set(0,0,5.3),B.add(new St(so([.5*H,0,4.4-5.3,2.6*H,0,6.3-5.3,.5*H,0,6.3-5.3]),a)),this.group.add(B),this.stabs.push(B)}const w=new St(new ii(.7,.77,.9,24,1,!0),o);w.rotation.x=Math.PI/2,w.position.z=6.4,this.group.add(w),this.nozzleRing=new ms({color:3813418,metalness:.85,roughness:.4,emissive:16734750,emissiveIntensity:0,side:Ge});const E=new St(new ii(.71,.71,.18,24,1,!0),this.nozzleRing);E.rotation.x=Math.PI/2,E.position.z=6.8,this.group.add(E),this.nozzleGlow=new ze({color:16747066,fog:!1});const A=new St(new xu(.68,24),this.nozzleGlow);A.position.z=6.3,this.group.add(A),this.flame=new hi,this.outerMat=Kf(),this.coreMat=Kf();const D=new St(new xa(.7,4,24,1,!0),this.outerMat),_=new St(new xa(.4,2.6,24,1,!0),this.coreMat);for(const H of[D,_])H.rotation.x=Math.PI/2,H.frustumCulled=!1;D.position.z=2,_.position.z=1.3,this.flame.add(D,_),this.flame.position.z=6.85,this.group.add(this.flame);const x=(H,B,$,N)=>{const Y=new ze({color:H});Y.color.multiplyScalar(1.4);const Q=new St(new Be(.25,8,6),Y);return Q.position.set(B,$,N),Q.visible=!1,this.group.add(Q),Q};this.nav.push(x(16724520,-5.2,.1,3.4),x(2686810,5.2,.1,3.4)),this.strobe=x(16777215,0,4.3,5.8);const L=new ms({color:1842204,roughness:.7,metalness:.3}),U=new ms({color:12106944,roughness:.4,metalness:.8}),G=(H,B,$,N)=>{const Y=new hi;Y.position.set(H,-.75,B);const Q=new St(new ii(.09,.11,$,8),U);Q.position.y=-$/2;const st=new St(new ii(N,N,.28,16),L);return st.rotation.z=Math.PI/2,st.position.y=-$,Y.add(Q,st),this.gear.add(Y),Y};this.gearLegs.push(G(0,-5.6,1.25,.3),G(-1.4,1.2,1.2,.35),G(1.4,1.2,1.2,.35)),this.gear.visible=!1,this.group.add(this.gear)}hinged(t,e,[i,n],a,r=0,o=2){const l=new hi;l.position.set(t[0],t[1],t[2]);const c=g=>[g[0]-t[0],g[1]-t[1],g[2]-t[2]],h=c(t),f=c(e),u=c(n),d=c(i);return l.add(new St(so([...h,...d,...u,...h,...u,...f],r,o),a)),l.userData.axis=new T(f[0],f[1],f[2]).normalize(),this.group.add(l),l}setControls(t,e,i,n){const a=Math.min(1,n*10);this.ctl.roll+=(t-this.ctl.roll)*a,this.ctl.pitch+=(e-this.ctl.pitch)*a,this.ctl.yaw+=(i-this.ctl.yaw)*a;const r=Math.PI/180,{roll:o,pitch:l,yaw:c}=this.ctl,h=(-l*12+o*14)*r,f=(-l*12-o*14)*r;this.elevons[0].quaternion.setFromAxisAngle(this.elevons[0].userData.axis,h),this.elevons[1].quaternion.setFromAxisAngle(this.elevons[1].userData.axis,-f),this.rudder.quaternion.setFromAxisAngle(this.rudder.userData.axis,c*18*r);for(const u of this.stabs)u.rotation.x=-l*14*r}setGear(t,e){this.gearPos+=Math.max(-e/2,Math.min(e/2,(t?1:0)-this.gearPos)),this.gear.visible=this.gearPos>.02;for(const i of this.gearLegs)i.rotation.x=(1-this.gearPos)*(Math.PI/2)}setNight(t,e){for(const i of this.nav)i.visible=t;this.strobe.visible=t&&e%60<5}setFlame(t,e,i){const n=Math.min(.1,Math.max(0,i-this.lastT));this.lastT=i,this.ab+=((e?1:0)-this.ab)*Math.min(1,n*(e?7:4));const a=this.ab,r=(u,d)=>u+(d-u)*a,o=r(.25+.35*t,1.6+.08*Math.sin(i*40)),l=r(.15+.35*t,1),c=r(.85,1.05);this.flame.scale.set(c,c,o);const h=this.outerMat.uniforms,f=this.coreMat.uniforms;h.uTime.value=f.uTime.value=i,h.uHeat.value=f.uHeat.value=l,h.uGain.value=r(.5+.9*t,1.4),f.uGain.value=r(1.2+1.6*t,2.8),h.uDiamonds.value=0,f.uDiamonds.value=a*a,this.nozzleGlow.color.setHex(a>.5?16756848:16742966).multiplyScalar(r(1+1.5*t,4)),this.nozzleRing.emissiveIntensity=r(.2+.5*t,1.6)}};Du.WINGTIPS=[[-5.2,0,3.4],[5.2,0,3.4]];let sl=Du;class Lm{constructor(t){this.head=0,this.count=0,this.lastFrame=-1e9,this.style=t;const e=t.points;this.px=new Float32Array(e),this.py=new Float32Array(e),this.pz=new Float32Array(e),this.born=new Float64Array(e),this.geo=new ve,this.pos=new he(new Float32Array(e*2*3),3),this.col=new he(new Float32Array(e*2*4),4),this.geo.setAttribute("position",this.pos),this.geo.setAttribute("color",this.col);const i=new Uint32Array((e-1)*6);for(let n=0;n<e-1;n++){const a=n*2;i[n*6]=a,i[n*6+1]=a+1,i[n*6+2]=a+2,i[n*6+3]=a+1,i[n*6+4]=a+3,i[n*6+5]=a+2}this.geo.setIndex(new he(i,1)),this.mesh=new St(this.geo,new ze({vertexColors:!0,transparent:!0,depthWrite:!1,side:Ge})),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1,this.geo.setDrawRange(0,0)}setColor(t){this.style={...this.style,color:t}}clear(){this.count=0,this.head=0,this.lastFrame=-1e9,this.geo.setDrawRange(0,0)}faded(t){return this.count===0||t-this.lastFrame>this.style.life}record(t,e){if(this.count>0){const i=(this.head-1+this.style.points)%this.style.points,n=t.x-this.px[i],a=t.y-this.py[i],r=t.z-this.pz[i];if(n*n+a*a+r*r<this.style.spacing*this.style.spacing)return}this.px[this.head]=t.x,this.py[this.head]=t.y,this.pz[this.head]=t.z,this.born[this.head]=e,this.head=(this.head+1)%this.style.points,this.count=Math.min(this.style.points,this.count+1),this.lastFrame=e}update(t,e,i=1){const n=this.count;if(n<2){this.geo.setDrawRange(0,0);return}const a=this.style,r=this.pos.array,o=this.col.array;let l=0;for(let c=0;c<n;c++){const h=(this.head-1-c+a.points*2)%a.points,f=e-this.born[h],u=Math.max(0,1-f/a.life),d=this.px[h],g=this.py[h],v=this.pz[h],m=c+1<n?(this.head-2-c+a.points*2)%a.points:(this.head-c+a.points*2)%a.points;let p=d-this.px[m],M=g-this.py[m],y=v-this.pz[m];c+1>=n&&(p=-p,M=-M,y=-y);const S=t.x-d,C=t.y-g,w=t.z-v,E=Math.hypot(S,C,w);let A=M*w-y*C,D=y*S-p*w,_=p*C-M*S;const x=Math.hypot(A,D,_)||1,U=Math.max(a.width+(a.widthOld-a.width)*(1-u),E*a.minAngular)/2/x;A*=U,D*=U,_*=U,r[l*6]=d-A,r[l*6+1]=g-D,r[l*6+2]=v-_,r[l*6+3]=d+A,r[l*6+4]=g+D,r[l*6+5]=v+_;const G=a.alpha*(.14+.86*u)*(u>0?1:0);for(let H=0;H<2;H++){const B=(l*2+H)*4;o[B]=a.color[0]*i,o[B+1]=a.color[1]*i,o[B+2]=a.color[2]*i,o[B+3]=G}l++}this.pos.needsUpdate=!0,this.col.needsUpdate=!0,this.geo.setDrawRange(0,(l-1)*6)}}function Qy(s,t){const e=new bm,i=new Se({side:di,depthWrite:!1,uniforms:{uSun:{value:t.clone().normalize()}},vertexShader:`
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
      }`});e.add(new St(new Be(100,48,24),i));const n=new Rh(s),a=n.fromScene(e,0,.1,1e3).texture;return n.dispose(),i.dispose(),a}const ec=new zt;class dl{constructor(t){t=t||{},this.vertices={near:[new T,new T,new T,new T],far:[new T,new T,new T,new T]},t.projectionMatrix!==void 0&&this.setFromProjectionMatrix(t.projectionMatrix,t.maxFar||1e4)}setFromProjectionMatrix(t,e){const i=t.elements[11]===0;return ec.copy(t).invert(),this.vertices.near[0].set(1,1,-1),this.vertices.near[1].set(1,-1,-1),this.vertices.near[2].set(-1,-1,-1),this.vertices.near[3].set(-1,1,-1),this.vertices.near.forEach(function(n){n.applyMatrix4(ec)}),this.vertices.far[0].set(1,1,1),this.vertices.far[1].set(1,-1,1),this.vertices.far[2].set(-1,-1,1),this.vertices.far[3].set(-1,1,1),this.vertices.far.forEach(function(n){n.applyMatrix4(ec);const a=Math.abs(n.z);i?n.z*=Math.min(e/a,1):n.multiplyScalar(Math.min(e/a,1))}),this.vertices}split(t,e){for(;t.length>e.length;)e.push(new dl);e.length=t.length;for(let i=0;i<t.length;i++){const n=e[i];if(i===0)for(let a=0;a<4;a++)n.vertices.near[a].copy(this.vertices.near[a]);else for(let a=0;a<4;a++)n.vertices.near[a].lerpVectors(this.vertices.near[a],this.vertices.far[a],t[i-1]);if(i===t.length-1)for(let a=0;a<4;a++)n.vertices.far[a].copy(this.vertices.far[a]);else for(let a=0;a<4;a++)n.vertices.far[a].lerpVectors(this.vertices.near[a],this.vertices.far[a],t[i])}}toSpace(t,e){for(let i=0;i<4;i++)e.vertices.near[i].copy(this.vertices.near[i]).applyMatrix4(t),e.vertices.far[i].copy(this.vertices.far[i]).applyMatrix4(t)}}const Zf={lights_fragment_begin:`
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
	`+Rt.lights_pars_begin},Jf=new zt,ic=new dl,_n=new T,Ba=new ts,nc=[],sc=[],ac=new zt,jf=new zt,t1=new T(0,1,0);class e1{constructor(t){this.camera=t.camera,this.parent=t.parent,this.cascades=t.cascades||3,this.maxFar=t.maxFar||1e5,this.mode=t.mode||"practical",this.shadowMapSize=t.shadowMapSize||2048,this.shadowBias=t.shadowBias||1e-6,this.lightDirection=t.lightDirection||new T(1,-1,1).normalize(),this.lightIntensity=t.lightIntensity||3,this.lightNear=t.lightNear||1,this.lightFar=t.lightFar||2e3,this.lightMargin=t.lightMargin||200,this.customSplitsCallback=t.customSplitsCallback,this.fade=!1,this.mainFrustum=new dl,this.frustums=[],this.breaks=[],this.lights=[],this.shaders=new Map,this.createLights(),this.updateFrustums(),this.injectInclude()}createLights(){for(let t=0;t<this.cascades;t++){const e=new Pm(16777215,this.lightIntensity);e.castShadow=!0,e.shadow.mapSize.width=this.shadowMapSize,e.shadow.mapSize.height=this.shadowMapSize,e.shadow.camera.near=this.lightNear,e.shadow.camera.far=this.lightFar,e.shadow.bias=this.shadowBias,this.parent.add(e),this.parent.add(e.target),this.lights.push(e)}}initCascades(){const t=this.camera;t.updateProjectionMatrix(),this.mainFrustum.setFromProjectionMatrix(t.projectionMatrix,this.maxFar),this.mainFrustum.split(this.breaks,this.frustums)}updateShadowBounds(){const t=this.frustums;for(let e=0;e<t.length;e++){const n=this.lights[e].shadow.camera,a=this.frustums[e],r=a.vertices.near,o=a.vertices.far,l=o[0];let c;l.distanceTo(o[2])>l.distanceTo(r[2])?c=o[2]:c=r[2];let h=l.distanceTo(c);if(this.fade){const f=this.camera,u=Math.max(f.far,this.maxFar),d=a.vertices.far[0].z/(u-f.near),g=.25*Math.pow(d,2)*(u-f.near);h+=g}n.left=-h/2,n.right=h/2,n.top=h/2,n.bottom=-h/2,n.updateProjectionMatrix()}}getBreaks(){const t=this.camera,e=Math.min(t.far,this.maxFar);switch(this.breaks.length=0,this.mode){case"uniform":i(this.cascades,t.near,e,this.breaks);break;case"logarithmic":n(this.cascades,t.near,e,this.breaks);break;case"practical":a(this.cascades,t.near,e,.5,this.breaks);break;case"custom":this.customSplitsCallback===void 0&&console.error("CSM: Custom split scheme callback not defined."),this.customSplitsCallback(this.cascades,t.near,e,this.breaks);break}function i(r,o,l,c){for(let h=1;h<r;h++)c.push((o+(l-o)*h/r)/l);c.push(1)}function n(r,o,l,c){for(let h=1;h<r;h++)c.push(o*(l/o)**(h/r)/l);c.push(1)}function a(r,o,l,c,h){nc.length=0,sc.length=0,n(r,o,l,sc),i(r,o,l,nc);for(let f=1;f<r;f++)h.push(Eg.lerp(nc[f-1],sc[f-1],c));h.push(1)}}update(){const t=this.camera,e=this.frustums;ac.lookAt(new T,this.lightDirection,t1),jf.copy(ac).invert();for(let i=0;i<e.length;i++){const n=this.lights[i],a=n.shadow.camera,r=(a.right-a.left)/this.shadowMapSize,o=(a.top-a.bottom)/this.shadowMapSize;Jf.multiplyMatrices(jf,t.matrixWorld),e[i].toSpace(Jf,ic);const l=ic.vertices.near,c=ic.vertices.far;Ba.makeEmpty();for(let h=0;h<4;h++)Ba.expandByPoint(l[h]),Ba.expandByPoint(c[h]);Ba.getCenter(_n),_n.z=Ba.max.z+this.lightMargin,_n.x=Math.floor(_n.x/r)*r,_n.y=Math.floor(_n.y/o)*o,_n.applyMatrix4(ac),n.position.copy(_n),n.target.position.copy(_n),n.target.position.x+=this.lightDirection.x,n.target.position.y+=this.lightDirection.y,n.target.position.z+=this.lightDirection.z}}injectInclude(){Rt.lights_fragment_begin=Zf.lights_fragment_begin,Rt.lights_pars_begin=Zf.lights_pars_begin}setupMaterial(t){t.defines=t.defines||{},t.defines.USE_CSM=1,t.defines.CSM_CASCADES=this.cascades,this.fade&&(t.defines.CSM_FADE="");const e=[],i=this,n=this.shaders;t.onBeforeCompile=function(a){const r=Math.min(i.camera.far,i.maxFar);i.getExtendedBreaks(e),a.uniforms.CSM_cascades={value:e},a.uniforms.cameraNear={value:i.camera.near},a.uniforms.shadowFar={value:r},n.set(t,a)},n.set(t,null)}updateUniforms(){const t=Math.min(this.camera.far,this.maxFar);this.shaders.forEach(function(i,n){if(i!==null){const a=i.uniforms;this.getExtendedBreaks(a.CSM_cascades.value),a.cameraNear.value=this.camera.near,a.shadowFar.value=t}!this.fade&&"CSM_FADE"in n.defines?(delete n.defines.CSM_FADE,n.needsUpdate=!0):this.fade&&!("CSM_FADE"in n.defines)&&(n.defines.CSM_FADE="",n.needsUpdate=!0)},this)}getExtendedBreaks(t){for(;t.length<this.breaks.length;)t.push(new at);t.length=this.breaks.length;for(let e=0;e<this.cascades;e++){const i=this.breaks[e],n=this.breaks[e-1]||0;t[e].x=n,t[e].y=i}}updateFrustums(){this.getBreaks(),this.initCascades(),this.updateShadowBounds(),this.updateUniforms()}remove(){for(let t=0;t<this.lights.length;t++)this.parent.remove(this.lights[t].target),this.parent.remove(this.lights[t])}dispose(){const t=this.shaders;t.forEach(function(e,i){delete i.onBeforeCompile,delete i.defines.USE_CSM,delete i.defines.CSM_CASCADES,delete i.defines.CSM_FADE,e!==null&&(delete e.uniforms.CSM_cascades,delete e.uniforms.cameraNear,delete e.uniforms.shadowFar),i.needsUpdate=!0}),t.clear()}}const Qf=3,gr=6e3,i1=[75/gr,720/gr,1],n1=[.04,.4,3],s1=[-4e-6,-2e-5,-1e-4],ro={CSM_cascades:{value:[new at,new at,new at]},cameraNear:{value:1},shadowFar:{value:gr}},a1=1/32e3,td=1/2500;function r1(){Rt.fog_pars_vertex=`
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
  float fogK = ${td.toExponential(6)} * (vFogY - fogCamY);
  float fogLine = abs(fogK) > 1e-4 ? (1.0 - exp(-fogK)) / fogK : 1.0;
  float fogOpt = ${a1.toExponential(6)} * exp(-${td.toExponential(6)} * fogCamY) * vFogDepth * fogLine;
  float fogFactor = 1.0 - exp(-max(fogOpt, 0.0));
  #ifdef FOG_EXP2
    fogFactor = max(fogFactor, 1.0 - exp(- fogDensity * fogDensity * vFogDepth * vFogDepth));
  #else
    fogFactor = max(fogFactor, smoothstep(fogNear, fogFar, vFogDepth));
  #endif
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
#endif`}class o1{constructor(t,e,i,n){this.tick=0,r1(),this.csm=new e1({camera:e,parent:t,cascades:Qf,maxFar:gr,mode:"custom",customSplitsCallback:(r,o,l,c)=>{c.push(...i1)},shadowMapSize:n,lightDirection:i.clone().negate(),lightIntensity:2.2,lightNear:1,lightFar:3e4,lightMargin:8e3}),this.csm.lights.forEach((r,o)=>{r.shadow.normalBias=n1[o],r.shadow.bias=s1[o]});const a=r=>r.replace(/defined\(\s*USE_CSM\s*\)/g,"1").replace(/defined\(\s*CSM_CASCADES\s*\)/g,"1").replace(/CSM_CASCADES/g,String(Qf));Rt.lights_fragment_begin=a(Rt.lights_fragment_begin),Rt.lights_pars_begin=a(Rt.lights_pars_begin),an.prototype.onBeforeCompile=function(r){Object.assign(r.uniforms,ro)},this.refreshBreaks(e)}refreshBreaks(t){this.csm.getExtendedBreaks(ro.CSM_cascades.value),ro.cameraNear.value=t.near,ro.shadowFar.value=Math.min(t.far,gr)}resize(t){this.csm.updateFrustums(),this.refreshBreaks(t)}setSun(t,e){for(const i of this.csm.lights)i.color.copy(t),i.intensity=e}setEnabled(t){this.csm.lights.forEach((e,i)=>{e.castShadow=t,i>0&&(e.visible=t)})}update(t){this.csm.update(),this.tick++%30===0&&l1(t)}}function l1(s){s.traverse(t=>{const e=t;if(!e.isMesh||e.userData.noShadow)return;const i=e.material;Array.isArray(i)||i.transparent||(i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial)&&(e.castShadow=!0,e.receiveShadow=!0)})}class c1{constructor(){this.ctx=null,this.out=null,this.listeners=[];const t=()=>{if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}if(!window.AudioContext)return;const e=new AudioContext,i=e.createGain();i.gain.value=.9,i.connect(e.destination),this.ctx=e,this.out=i;for(const n of this.listeners)n(e,i)};window.addEventListener("keydown",t),window.addEventListener("pointerdown",t)}onReady(t){this.ctx&&this.out?t(this.ctx,this.out):this.listeners.push(t)}}const Dm=new c1;class h1{constructor(){this.ctx=null,this.searchGain=null,this.lockGain=null,this.launchGain=null,this.launchOsc=null,this.nextSearch=0,this.nextLockPulse=0,this.launchUntil=0,Dm.onReady((t,e)=>this.build(t,e))}build(t,e){const i=t.createGain();i.gain.value=.2,i.connect(e);const n=(o,l)=>{const c=t.createOscillator();c.type=o,c.frequency.value=l;const h=t.createGain();return h.gain.value=0,c.connect(h).connect(i),c.start(),[c,h]};this.searchGain=n("sine",900)[1],this.lockGain=n("square",1250)[1];const[a,r]=n("triangle",900);this.launchOsc=a,this.launchGain=r,this.ctx=t}update(t,e,i,n){const a=this.ctx;if(!a||!this.searchGain||!this.lockGain||!this.launchGain||!this.launchOsc)return;const r=a.currentTime;if(!n){this.searchGain.gain.setTargetAtTime(0,r,.01),this.lockGain.gain.setTargetAtTime(0,r,.01),this.launchGain.gain.setTargetAtTime(0,r,.01),this.launchUntil=0;return}if(i>0&&r>this.launchUntil-.6){this.launchUntil=r+1.2;const o=this.launchOsc.frequency;o.cancelScheduledValues(r),o.setValueAtTime(700,r);for(let l=1;l<=14;l++)o.linearRampToValueAtTime(l%2?1500:700,r+l*.085);this.launchGain.gain.cancelScheduledValues(r),this.launchGain.gain.setValueAtTime(.8,r),this.launchGain.gain.setValueAtTime(0,r+1.2)}if(e>0){if(r>=this.nextLockPulse){const o=this.lockGain.gain;o.setValueAtTime(.35,r),o.setValueAtTime(0,r+.09),this.nextLockPulse=r+.16}}else if(t>0){if(r>=this.nextSearch){const o=this.searchGain.gain;o.setValueAtTime(.5,r),o.setValueAtTime(0,r+.07),o.setValueAtTime(.5,r+.14),o.setValueAtTime(0,r+.21),this.nextSearch=r+2}}else this.nextSearch=0}}const lr=44100;function ka(s,t,e,i,n=.35){const a=Math.floor(lr*i),r=s.createBuffer(1,a,lr),o=r.getChannelData(0);let l=0;for(let c=0;c<a;c++){const h=c/a,f=t+(e-t)*h;l=(l+2*Math.PI*f/lr)%(2*Math.PI),o[c]=Math.sin(l)*Math.pow(1-h,1.3)*n}return r}function ed(s,t,e=.45){const i=Math.floor(lr*t),n=s.createBuffer(1,i,lr),a=n.getChannelData(0);let r=7,o=0;for(let l=0;l<i;l++){r=r*16807%2147483647;const c=r/2147483647*2-1;o+=(c-o)*.06,a[l]=Math.max(-1,Math.min(1,o*3))*Math.pow(1-l/i,1.6)*e}return n}class u1{constructor(){this.ctx=null,this.out=null,this.bufs=new Map,Dm.onReady((t,e)=>{this.ctx=t,this.out=e,this.bufs.set("shoot",ka(t,840,260,.08)),this.bufs.set("explode",ed(t,.45)),this.bufs.set("ignite",ka(t,140,380,.25)),this.bufs.set("switch",ka(t,600,980,.1)),this.bufs.set("missile",ka(t,1200,500,.18,.25)),this.bufs.set("flare",ka(t,2200,1400,.12,.2)),this.bufs.set("boom",ed(t,.9,.8))})}play(t,e=0,i=12e3){const n=this.ctx,a=this.bufs.get(t);if(!n||!this.out||!a||e>i)return;const r=n.createBufferSource();r.buffer=a;const o=n.createGain();o.gain.value=1/(1+e/1500),r.connect(o).connect(this.out),r.start()}}const _i=new u1,oo=34,lo=8,f1=70,rc=65,d1=74,id=new T,nd=new T,js=new T,Qs=new T;class p1{constructor(t){this.offset=new T(0,lo,oo),this.up=new T(0,1,0),this.fov=rc,this.camera=new Oi(rc,t,1,12e4)}snap(t,e){js.set(0,0,-1).applyQuaternion(e),Qs.set(0,1,0).applyQuaternion(e),this.offset.copy(js).multiplyScalar(-oo).addScaledVector(Qs,lo),this.up.copy(Qs),this.place(t,js)}update(t,e,i,n){js.set(0,0,-1).applyQuaternion(i),Qs.set(0,1,0).applyQuaternion(i),id.copy(js).multiplyScalar(-oo).addScaledVector(Qs,lo);const a=1-Math.exp(-5*t);this.offset.lerp(id,a),this.offset.setLength(Math.hypot(oo,lo)),this.up.lerp(Qs,1-Math.exp(-3.5*t)).normalize();const r=n?d1:rc;this.fov+=(r-this.fov)*(1-Math.exp(-2.5*t)),Math.abs(this.camera.fov-this.fov)>.01&&(this.camera.fov=this.fov,this.camera.updateProjectionMatrix()),this.place(e,js)}place(t,e){this.camera.position.copy(t).add(this.offset),nd.copy(t).addScaledVector(e,f1),this.camera.up.copy(this.up),this.camera.lookAt(nd)}resize(t){this.camera.aspect=t,this.camera.updateProjectionMatrix()}}const Ct=1/60,Im=1.15;let ki=Im;function m1(s){ki=s?1:Im,typeof window<"u"&&(window.__fighterTwo=s)}const xr=s=>Math.min(.98,s*ki),pl=s=>Math.round(s/ki),Ie=.3048,pt=4,Um=3,g1=s=>s*pt*60*Um,Gt=14e3,Xt=5e3,Te=s=>(s-Gt/2)*pt,we=s=>(s-Xt/2)*pt,Mi=s=>760+110*Math.sin(s/520+.6)+45*Math.sin(s/190+2.1)+18*Math.sin(s/67),v1=2e3,_1=2400,sd=12,cr=35e3,M1=3e3,x1=15e3,y1=350*pt,Dh=.35,Aa=g1(Dh),S1=.01,w1=100;let Ln=1,hn=1;function Nm(s){Ln=Math.min(w1,Math.max(1,Math.round(s))),hn=(Dh+(Ln-1)*S1)/Dh}const vr=300,ad=.09,Ih=50,rd=20,E1=420,od=2,b1=650*pt,Fm=900,ld=4,T1=1/240,A1=150,cd=4,R1=520*pt,C1=180,P1=.7,L1=1200,hd=1,D1=12,I1=.5,U1=380*pt,Uh=900,N1=2500*pt,co=9e3,ud=16e3,F1=30,O1=vr,z1=22*pt,B1=2.2,fd=B1*Aa,k1=420,dd=90,Ha=.35,Om=2400,H1=.022,G1=.5,V1=300,W1=600,X1=400*pt,Y1=.8,q1=3.5,$1=60*Math.PI/180,pd=45*pt,K1=()=>pl(45),Z1=()=>1600*pt*ki,md=()=>1200*pt*ki,J1=3,j1=4,Q1=.03,tS=.05,gd=10*pt,eS=20*pt,iS=2400,nS=14*pt,sS=8*pt,aS=1200,rS=1800,oS=3600,lS=260*pt,cS=()=>xr(.85),zm=()=>pl(300),Nh=6,Bm=120,km=()=>pl(300),hS=1400,uS=()=>xr(.85),vd=180,_d=4,fS=450*pt,dS=()=>xr(.6),Hm=()=>pl(720),pS=400*pt,oc=150*pt,mS=.05,gS=20*pt,vS=150,Md=.5,_S=.25,MS=()=>xr(.45),xS=500,Gm=[[150,82,62],[170,150,120],[122,112,100],[140,100,70]],yS=[[255,222,140],[255,196,96],[210,232,255]];function SS(s){let t=s|0;return()=>{t=t+1831565813|0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}const Fh=(s,t)=>(s-9600)/1300+(t-2900)/800+.35*Math.sin(s/700)+.25*Math.sin(t/410)>1,Vm=(s,t)=>s>2300&&s<Gt-750&&t<640+160*Math.sin(s/900)+40*Math.sin(s/230);function lc(s,t=3){let e=s;for(let i=0;i<t;i++){const n=[e[0],e[1]];for(let a=0;a+3<e.length;a+=2){const r=e[a],o=e[a+1],l=e[a+2],c=e[a+3];n.push(.75*r+.25*l,.75*o+.25*c,.25*r+.75*l,.25*o+.75*c)}n.push(e[e.length-2],e[e.length-1]),e=n}return e}class wS{constructor(){this.peaks=[],this.tributaries=[],this.border=[],this.cities=[],this.highways=[],this.railways=[],this.airbases=[],this.forests=[],this.villages=[];const t=SS(2026),e=(u,d)=>u+t()*(d-u),i=(u,d)=>u+Math.floor(t()*(d-u+1)),n=(u,d)=>{const g=Math.max(1e-9,t());return u+d*Math.sqrt(-2*Math.log(g))*Math.cos(2*Math.PI*t())};let a=2500;for(;a<Gt-900;){for(let u=0;u<3;u++){const d=a+e(-40,40),g=150+u*170+160*Math.sin(a/900)+e(-60,60),v=e(40,95)*(1-u*.2),m=e(-.5,.5),p=[];for(let y=0;y<10;y++){const S=m+y*Math.PI/5,C=1+.6*Math.abs(Math.cos(S-m)),w=v*C*e(.55,1);p.push(d+Math.cos(S)*w*.75,g+Math.sin(S)*w*.5)}const M=t()<.75-u*.3;this.peaks.push({x:d,y:g,r:v,snow:M,ridge:m,outline:p})}a+=e(40,75)}const r=[];let o=Xt*.45,l=Mi(o)-160;for(;l<=Gt+300;)r.push(l,o),l+=e(220,360),o=Math.max(Xt*.22,Math.min(Xt*.82,o+e(-170,170)));this.river=lc(r);const c=this.river.length/2;for(let u=0;u<4;u++){const d=Math.floor(c*(.2+.18*u));let g=this.river[d*2],v=this.river[d*2+1],m=(u%2===0?-Math.PI/2:Math.PI/2)+e(-.4,.4);const p=[g,v],M=i(5,8);for(let y=0;y<M;y++)m+=e(-.45,.45),g=Math.max(1200,Math.min(Gt-150,g+Math.cos(m)*e(200,290))),v=Math.max(120,Math.min(Xt-120,v+Math.sin(m)*e(200,290))),p.push(g,v);this.tributaries.push(lc(p))}let h=Gt*.78;for(let u=0;u<21;u++)h=Math.max(Gt*.72,Math.min(Gt*.84,h+e(-160,160))),this.border.push(h,Xt*u/20);const f=(Gt-2600)/(sd-1);for(let u=0;u<sd;u++){const d=1500+u*f+e(-180,180),g=e(1e3,Xt-550),v=i(150,250),m=[];for(let p=-v;p<=v;p+=26)for(let M=-v;M<=v;M+=26){const y=Math.hypot(p,M)/v;if(y>.95||t()<y*.55)continue;const S=i(14,21),C=i(14,21),w=i(72,112),E=[],A=Math.floor(i(1,4)*(1.4-y));for(let D=0;D<A;D++)E.push(i(2,S-3),i(2,C-3),i(0,2));m.push({x:d+p-S/2,y:g+M-C/2,w:S,h:C,tone:w,lights:E})}this.cities.push({x:d,y:g,r:v,name:`SECTOR-${String.fromCharCode(65+u)}`,blocks:m})}for(let u=0;u+1<this.cities.length;u++){const d=this.cities[u],g=this.cities[u+1];this.highways.push([d.x,d.y,g.x,g.y])}for(let u=0;u+2<this.cities.length;u++){const d=this.cities[u],g=this.cities[u+2],v=[(d.x+g.x)/2+e(-200,200),(d.y+g.y)/2+e(-400,400)];this.railways.push(lc([d.x,d.y,v[0],v[1],g.x,g.y],2))}for(const u of[2,6,9]){const d=this.cities[u];this.airbases.push(d.x+(t()<.5?-1:1)*520,d.y+e(-260,260))}for(let u=0;u<70;u++){const d=e(1500,Gt-400);let g=e(700,Xt-300);g>1300&&t()<.6&&(g=e(700,1300));const v=[],m=i(25,45);for(let p=0;p<m;p++)v.push(n(d,60),n(g,40),i(5,10));this.forests.push({x:d,y:g,trees:v})}for(;this.villages.length<240;){const u=e(800,Xt-150),d=e(Mi(u)+80,Gt-150);if(this.cities.some(m=>Math.hypot(m.x-d,m.y-u)<m.r*1.4))continue;const g=[],v=i(5,12);for(let m=0;m<v;m++)g.push(d+e(-28,28),u+e(-20,20),i(0,3));this.villages.push({x:d,y:u,houses:g})}}borderX(t){const e=Math.min(this.border.length/2-2,Math.max(0,Math.floor(t/Xt*20))),i=this.border[e*2],n=this.border[e*2+1],a=this.border[e*2+2],r=this.border[e*2+3];return i+(a-i)*((t-n)/(r-n))}nearRiver(t,e,i){const n=this.river;for(let a=0;a<n.length;a+=4)if(Math.hypot(n[a]-t,n[a+1]-e)<i)return!0;return!1}}const Et=new wS,Ye=16,Si=Math.ceil(Gt/Ye)+1,Xn=Math.ceil(Xt/Ye)+1,Wm=0;function ho(s,t){let e=s*374761393+t*668265263|0;return e=Math.imul(e^e>>>13,1274126177),e^=e>>>16,(e&16777215)/16777215}function Xm(s,t){const e=Math.floor(s),i=Math.floor(t),n=s-e,a=t-i,r=n*n*(3-2*n),o=a*a*(3-2*a),l=ho(e,i),c=ho(e+1,i),h=ho(e,i+1),f=ho(e+1,i+1);return l+(c-l)*r+(h-l)*o+(l-c-h+f)*r*o}function Xo(s,t){let e=0,i=1,n=1;for(let a=0;a<4;a++)e+=i*Xm(s*n+a*17.3,t*n-a*9.1),i*=.5,n*=2.03;return e/1.875}function ES(s,t){return 60+Xo(s/9e3,t/9e3)*380}const Ga=(s,t,e)=>{const i=Math.min(1,Math.max(0,(e-s)/(t-s)));return i*i*(3-2*i)},ca=new Float32Array(Si*Xn);(function(){const t=new Float32Array(Si*Xn).fill(1e9),e=new Float32Array(Si*Xn).fill(6),i=[[Et.river,null],...Et.tributaries.map(r=>[r,5])],n=220;for(const[r,o]of i)for(let l=0;l+3<r.length;l+=2){const c=r[l],h=r[l+1],f=r[l+2],u=r[l+3],d=o??7+9*Math.max(0,1-c/Gt),g=Math.max(0,Math.floor((Math.min(c,f)-n)/Ye)),v=Math.min(Si-1,Math.ceil((Math.max(c,f)+n)/Ye)),m=Math.max(0,Math.floor((Math.min(h,u)-n)/Ye)),p=Math.min(Xn-1,Math.ceil((Math.max(h,u)+n)/Ye)),M=f-c,y=u-h,S=M*M+y*y||1;for(let C=m;C<=p;C++)for(let w=g;w<=v;w++){const E=w*Ye,A=C*Ye,D=Math.max(0,Math.min(1,((E-c)*M+(A-h)*y)/S)),_=Math.hypot(E-c-D*M,A-h-D*y),x=C*Si+w;_<t[x]&&(t[x]=_,e[x]=d)}}const a=new Float32Array(Si*Xn);for(const r of Et.peaks){const o=r.r*1.6*2.2,l=r.r*22+(r.snow?300:0),c=Math.max(0,Math.floor((r.x-o)/Ye)),h=Math.min(Si-1,Math.ceil((r.x+o)/Ye)),f=Math.max(0,Math.floor((r.y-o)/Ye)),u=Math.min(Xn-1,Math.ceil((r.y+o)/Ye));for(let d=f;d<=u;d++)for(let g=c;g<=h;g++){const v=g*Ye-r.x,m=d*Ye-r.y,p=v*Math.cos(r.ridge)+m*Math.sin(r.ridge),M=-v*Math.sin(r.ridge)+m*Math.cos(r.ridge),y=Math.hypot(p*.7,M)/o;if(y>=1)continue;const S=1-y,C=l*S*S*(3-2*S),w=d*Si+g;C>a[w]&&(a[w]=C)}}for(let r=0;r<Xn;r++){const o=r*Ye,l=Mi(o);for(let c=0;c<Si;c++){const h=c*Ye,f=r*Si+c;if(h<l){ca[f]=Wm;continue}const u=(h-Gt/2)*pt,d=(o-Xt/2)*pt;let g=ES(u,d);Fh(h,o)&&(g=80+Xo(u/3e3,d/3e3)*90);const v=640+160*Math.sin(h/900)+40*Math.sin(h/230),m=Ga(v+250,v-150,o)*Ga(2e3,2600,h)*Ga(Gt-450,Gt-900,h);g+=m*(500+Xo(u/4e3,d/4e3)*500)+a[f],Vm(h,o)&&(g+=Xo(u/1500,d/1500)*200),g=1+(g-1)*Ga(0,260,h-l);const p=e[f],M=Ga(p*.6,p+200,t[f]);g=1+(g-1)*M,ca[f]=Math.max(1,g)}}})();function jt(s,t){const e=s/pt+Gt/2,i=t/pt+Xt/2;return e<0?Wm:e>Gt||i<0||i>Xt?yd(xd(e,Gt),xd(i,Xt)):yd(e,i)}function xd(s,t){const e=(s%(2*t)+2*t)%(2*t);return e<=t?e:2*t-e}function yd(s,t){const e=s/Ye,i=t/Ye,n=Math.min(Si-2,Math.floor(e)),a=Math.min(Xn-2,Math.floor(i)),r=e-n,o=i-a,l=a*Si+n,c=ca[l],h=ca[l+1],f=ca[l+Si],u=ca[l+Si+1];return c+(h-c)*r+(f-c)*o+(c-h-f+u)*r*o}const Va=Math.PI/2,cc=new T,uo=new T,fo=new T,Sd=new T,wd=new T(0,1,0),ta=new T,hc=new T;class bS{constructor(t){this.host=t,this.tracking=!1,this.index=-1,this.t=0,this.cut=document.getElementById("cut"),this.camInit=!1;const{jet:e,threats:i}=t,n=i.launchers.find(v=>v.kind==="TEL"&&v.y<400&&v.z>-2e3&&v.z<6e3&&v.x>-15e3&&v.x<1e4)??i.launchers[0],a=Et.cities[4],r=Te(a.x),o=we(a.y),l=jt(r,o),c=Et.peaks.filter(v=>v.snow).sort((v,m)=>m.r-v.r)[3]??Et.peaks[0],h=Te(c.x),f=we(c.y)+1500;let u=!1;const d=(v,m,p,M)=>{e.reset(v,p,M),e.pos.y=m},g=v=>{const m=i.missiles.items;for(let p=0;p<m.length;p++)if(m[p].active&&m[p].launcher===v.index)return m[p];return null};this.shots=[{dur:7,setup:()=>{d(t.start.x,35e3*Ie,t.start.z,t.start.heading),t.snapChase()}},{dur:9,setup:()=>{d(n.x-2600,n.y+3e3,n.z+300,Va),u=!1,this.tracking=!0},step:v=>{v>.4&&v<.42&&i.launch(n,e,!0);const m=g(n);m&&!u&&m.pos.distanceTo(e.pos)<900&&m.climbShare>.5&&(i.cm.fireFlares(e.pos,e.vel),u=!0)},camera:(v,m,p)=>{fo.copy(e.vel).normalize(),Sd.crossVectors(fo,wd).normalize(),ta.copy(e.pos).addScaledVector(Sd,55).addScaledVector(wd,30).addScaledVector(fo,-95);const M=g(n);return hc.copy(e.pos).addScaledVector(fo,120),M&&hc.lerp(M.pos,Math.min(.12,150/Math.max(150,M.pos.distanceTo(e.pos)))),this.ease(v,ta,hc,p,3),!0}},{dur:6,setup:()=>{const v=i.drones[0];d(v.x-6e3,v.y+800,v.z,Va)},camera:(v,m,p)=>{const M=i.drones[0],y=m*.35+.6;return uo.set(M.x,M.y,M.z),ta.set(M.x+Math.cos(y)*55,M.y+12,M.z+Math.sin(y)*55),this.ease(v,ta,uo,p,8),!0}},{dur:7,setup:()=>{let v=0;for(let m=0;m<12;m++)v=Math.max(v,jt(h-7e3+m*900,f));d(h-7e3,v+450,f,Va),t.snapChase()}},{dur:6,setup:()=>{d(r-3500,l+420,o+200,Va),t.snapChase()}},{dur:7,setup:()=>{t.setDemoNight(!0),d(r-2500,l+600,o-300,Va)},camera:(v,m,p)=>{const M=2.3+m*.06;return ta.set(r+Math.cos(M)*3200,l+1100,o+Math.sin(M)*3200),uo.set(r,l+60,o),this.ease(v,ta,uo,p,6),!0}}]}begin(){this.index=-1,this.next()}end(){this.host.setDemoNight(!1),this.tracking=!1}next(){this.host.setDemoNight(!1),this.tracking=!1,this.index=(this.index+1)%this.shots.length,this.t=0,this.camInit=!1,this.host.threats.reset(Date.now()&2147483647|1),this.host.clearFx(),this.shots[this.index].setup(),this.host.snapTerrain(this.host.jet.pos.x,this.host.jet.pos.z),this.cut&&(this.cut.classList.add("on"),requestAnimationFrame(()=>this.cut?.classList.remove("on")))}step(){if(this.index<0)return;this.t+=Ct;const t=this.shots[this.index];t.step&&t.step(this.t);const e=this.host.jet,i=jt(e.pos.x,e.pos.z);e.pos.y<i+150&&(e.pos.y=i+150),this.t>=t.dur&&this.next()}camera(t,e){if(this.index<0)return!1;const i=this.shots[this.index];return i.camera?i.camera(t,this.t,e):!1}ease(t,e,i,n,a){this.camInit?(t.position.lerp(e,1-Math.exp(-a*n)),cc.lerp(i,1-Math.exp(-a*n))):(t.position.copy(e),cc.copy(i),this.camInit=!0),t.up.set(0,1,0),t.lookAt(cc),t.fov!==60&&(t.fov=60,t.updateProjectionMatrix())}}function Ym(s,t){try{const e=window,i=e.Stratos||(e.parent&&e.parent!==window?e.parent.Stratos:void 0);i&&i.track(s,t)}catch{}}let Yo=0;function TS(s){try{if(window.dispatchEvent(new CustomEvent("fighter-kill",{detail:s})),ki===1)return"";const t=window,e=t.Stratos||(t.parent&&t.parent!==window?t.parent.Stratos:void 0);if(!e||!e.coins||!e.coins.earn)return"";const i=e.coins.earn("match_win",{game:"saiqulmodi",level:Math.min(4,Math.ceil(Ln/25)),ref:`site-${s}-${Date.now()}`});return i&&i.ok&&i.amount?` +${i.amount} STRATOS COINS`:""}catch{return""}}function qm(s){Yo=Date.now(),Ym("level_start",{level:s})}function AS(s=0){if(!Yo)return;const t=Math.round((Date.now()-Yo)/1e3);Yo=0,Ym("game_over",{seconds:t,score:s})}const ls=80,Ed=.18,uc=.15,fc=4,$m=["mnv1","mnv2","mnv3","mnv4","mnv5","mnv6","mnv7","mnv8"],RS=["start","flare","ecm","night","chaff","bomb","agm","aam","aero","sam","nextJet","prevJet","levelUp","levelDown","twoPlayers","p2Left","p2Right","p2Guided","p2Unguided","mnv1","mnv2","mnv3","mnv4","mnv5","mnv6","mnv7","mnv8","mnvNext","rtb","limiter"],CS={Enter:"start",NumpadEnter:"start",KeyC:"flare",KeyX:"ecm",KeyT:"night",KeyK:"chaff",KeyB:"bomb",KeyG:"agm",KeyZ:"aam",KeyV:"aero",KeyM:"sam",KeyN:"levelUp",KeyP:"levelDown",Digit2:"twoPlayers",KeyO:"limiter"},bd={ArrowLeft:"p2Left",ArrowRight:"p2Right",ArrowUp:"p2Guided",ArrowDown:"p2Unguided"},PS=[["start",9],["start",0],["flare",3],["ecm",4],["night",17],["chaff",12],["bomb",13],["agm",1],["aam",2],["aero",10],["nextJet",11],["levelUp",9],["levelDown",8]],LS=[["p2Left",14],["p2Right",15],["p2Guided",0],["p2Unguided",1]],DS=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","Tab"]),po=s=>s<-1?-1:s>1?1:s,Wa=(s,t)=>{const e=Math.abs(s);return e<t?0:Math.sign(s)*((e-t)/(1-t))};class IS{constructor(t){this.pitch=0,this.roll=0,this.yaw=0,this.throttle=0,this.afterburner=!1,this.touchMode=!1,this.twoPlayers=!1,this.keys=new Set,this.kPitch=0,this.kRoll=0,this.kYaw=0,this.queued=new Map,this.pad1Was=[],this.pad2Was=[],this.padConnected=!1,this.stickId=-1,this.stickCx=0,this.stickCy=0,this.stickX=0,this.stickY=0,this.touchThrUp=!1,this.touchThrDown=!1,this.touchAb=!1,this.playing=!1;for(const e of RS)this.queued.set(e,!1);window.addEventListener("keydown",e=>{if(DS.has(e.code)&&e.preventDefault(),!e.repeat){e.code==="Tab"&&this.queue(e.shiftKey?"prevJet":"nextJet");const i=/^(?:Digit|Numpad)([1-8])$/.exec(e.code),n=!!i&&(e.shiftKey||e.code.startsWith("Numpad"));n&&this.queue($m[Number(i[1])-1]),(e.code==="Numpad9"||e.code==="Digit9"&&e.shiftKey)&&this.queue("rtb");const a=n?void 0:CS[e.code];a&&this.queue(a),this.twoPlayers&&bd[e.code]&&this.queue(bd[e.code])}this.keys.add(e.code),this.touchMode=!1,this.showTouch(!1)}),window.addEventListener("keyup",e=>this.keys.delete(e.code)),window.addEventListener("blur",()=>this.keys.clear()),window.addEventListener("gamepadconnected",()=>this.padConnected=!0),window.addEventListener("gamepaddisconnected",()=>{const e=navigator.getGamepads();this.padConnected=!1;for(const i of e)i&&(this.padConnected=!0)}),this.buildTouch(t),(navigator.maxTouchPoints>0||"ontouchstart"in window||matchMedia("(pointer: coarse)").matches)&&(this.touchMode=!0,this.showTouch(!0))}queue(t){this.queued.set(t,!0)}queueStart(){this.queue("start")}consume(t){const e=this.queued.get(t)===!0;return e&&this.queued.set(t,!1),e}consumeStart(){return this.consume("start")}consumeFlare(){return this.consume("flare")}consumeEcm(){return this.consume("ecm")}consumeNight(){return this.consume("night")}rumble(t,e,i){if(!this.padConnected)return;const n=navigator.getGamepads();for(let a=0;a<n.length;a++){const r=n[a];if(!r||!r.connected)continue;const o=r.vibrationActuator;o&&o.playEffect&&o.playEffect("dual-rumble",{duration:i,strongMagnitude:t,weakMagnitude:e}).catch(()=>{});break}}padEdges(t,e,i){const n=t.buttons;for(let a=0;a<e.length;a++){const[r,o]=e[a],l=!!(n[o]&&n[o].pressed);l&&!i[a]&&this.queue(r),i[a]=l}}update(t){const e=this.keys,i=!this.twoPlayers,n=(e.has("KeyS")||i&&e.has("ArrowDown")?1:0)-(e.has("KeyW")||i&&e.has("ArrowUp")?1:0),a=(e.has("KeyD")||i&&e.has("ArrowRight")?1:0)-(e.has("KeyA")||i&&e.has("ArrowLeft")?1:0),r=(e.has("KeyE")?1:0)-(e.has("KeyQ")?1:0);this.kPitch=dc(this.kPitch,n,fc*t),this.kRoll=dc(this.kRoll,a,fc*t),this.kYaw=dc(this.kYaw,r,fc*t);let o=this.kPitch,l=this.kRoll,c=this.kYaw,h=(e.has("KeyR")?1:0)-(e.has("KeyF")?1:0),f=e.has("Space");if(this.padConnected){const u=navigator.getGamepads();let d=0;for(let g=0;g<u.length;g++){const v=u[g];if(!v||!v.connected)continue;if(d===1){this.twoPlayers&&this.padEdges(v,LS,this.pad2Was);break}d++;const m=v.axes,p=Wa(m[0]??0,uc),M=Wa(m[1]??0,uc),y=Wa(m[2]??0,uc);(p!==0||M!==0||y!==0)&&(l+=p,o+=M,c+=y,this.touchMode=!1,this.showTouch(!1));const S=v.buttons,C=S[7]?S[7].value:0,w=S[6]?S[6].value:0;C>.1&&(h+=C),w>.1&&(h-=w),(S[0]&&S[0].pressed||S[5]&&S[5].pressed)&&(f=!0),this.padEdges(v,PS,this.pad1Was)}}this.stickId>=0&&(l+=this.stickX,o+=this.stickY),this.touchThrUp&&(h+=1),this.touchThrDown&&(h-=1),this.touchAb&&(f=!0),this.pitch=po(o),this.roll=po(l),this.yaw=po(c),this.throttle=po(h),this.afterburner=f}setTouchVisible(t){this.playing=t,this.touchLayer.style.display=this.touchMode&&t?"block":"none"}showTouch(t){t||(this.touchLayer.style.display="none")}buildTouch(t){const e=document.createElement("div");e.className="touch-layer",e.style.display="none";const i=document.createElement("div");i.className="stick-base",i.style.width=i.style.height=`${ls*2}px`;const n=document.createElement("div");n.className="stick-knob",i.appendChild(n),e.appendChild(i),this.stickBase=i,this.stickKnob=n;const a=document.createElement("div");a.className="stick-zone",e.insertBefore(a,i),a.addEventListener("pointerdown",c=>{this.stickId>=0||(this.stickId=c.pointerId,this.stickCx=c.clientX,this.stickCy=c.clientY,a.setPointerCapture(c.pointerId),this.placeStick(),this.moveStick(c.clientX,c.clientY))}),a.addEventListener("pointermove",c=>{c.pointerId===this.stickId&&this.moveStick(c.clientX,c.clientY)});const r=c=>{c.pointerId===this.stickId&&(this.stickId=-1,this.stickX=this.stickY=0,this.stickKnob.style.transform="translate(-50%, -50%)",this.stickBase.classList.remove("live"))};a.addEventListener("pointerup",r),a.addEventListener("pointercancel",r);const o=(c,h,f)=>{const u=document.createElement("div");u.className=`touch-btn ${h}`,u.textContent=c,u.addEventListener("pointerdown",g=>{u.setPointerCapture(g.pointerId),f(!0),u.classList.add("held")});const d=()=>{f(!1),u.classList.remove("held")};u.addEventListener("pointerup",d),u.addEventListener("pointercancel",d),e.appendChild(u)},l=(c,h,f)=>o(c,h,u=>{u&&this.queue(f)});o("THR +","thr-up",c=>this.touchThrUp=c),o("THR -","thr-down",c=>this.touchThrDown=c),o("AB","ab",c=>this.touchAb=c),l("FLARE","flare","flare"),l("ECM","ecm","ecm"),l("CHAFF","chaff","chaff"),l("BOMB","bomb","bomb"),l("AGM","agm","agm"),l("AAM","aam","aam"),l("NIGHT","night","night"),l("AERO","aero","aero"),l("MNV","mnv","mnvNext"),l("RTB","rtb","rtb"),l("SAM","sam","sam"),l("JET","jet","nextJet"),l("LV+","lvup","levelUp"),l("LV-","lvdown","levelDown"),t.appendChild(e),this.touchLayer=e,window.addEventListener("pointerdown",c=>{c.pointerType==="touch"&&(this.touchMode=!0,this.playing&&(this.touchLayer.style.display="block"))})}placeStick(){this.stickBase.style.left=`${this.stickCx-ls}px`,this.stickBase.style.top=`${this.stickCy-ls}px`,this.stickBase.style.bottom="auto",this.stickBase.classList.add("live")}moveStick(t,e){let i=(t-this.stickCx)/ls,n=(e-this.stickCy)/ls;const a=Math.hypot(i,n);a>1&&(i/=a,n/=a),this.stickKnob.style.transform=`translate(calc(-50% + ${i*ls}px), calc(-50% + ${n*ls}px))`,this.stickX=Wa(i,Ed),this.stickY=Wa(n,Ed)}}function dc(s,t,e){const i=t===0?e*2:e;return s<t?Math.min(t,s+i):s>t?Math.max(t,s-i):s}const Td=[["BARREL ROLL",150],["LOOP",260],["VICTORY ROLLS",150]],US=[[255/255,140/255,40/255],[245/255,245/255,245/255],[60/255,190/255,90/255]],pc=new T,NS=new T(0,1,0),mo=new T;class FS{constructor(){this.kind="",this.next=0,this.frames=0,this.turned=0,this.prevUp=new T,this.prevDir=new T,this.stick={pitch:0,roll:0,yaw:0,throttle:0,afterburner:!1}}get active(){return this.kind!==""}start(t){const[e]=Td[this.next%Td.length];return this.next++,this.kind=e,this.frames=0,this.turned=0,this.prevUp.copy(t.liftUp),this.prevDir.copy(t.vel).normalize(),e}stop(){this.kind=""}control(t){if(!this.active)return!1;this.frames++,mo.copy(t.vel).normalize(),this.kind==="LOOP"?this.turned+=Math.acos(Math.min(1,Math.max(-1,this.prevDir.dot(mo)))):this.turned+=Math.acos(Math.min(1,Math.max(-1,this.prevUp.dot(t.liftUp)))),this.prevUp.copy(t.liftUp),this.prevDir.copy(mo);const e=this.stick;if(e.yaw=0,e.throttle=0,this.kind==="BARREL ROLL")e.roll=1,e.pitch=.45,e.afterburner=!1,(this.turned>=Math.PI*2||this.frames>600)&&(this.kind="");else if(this.kind==="LOOP"){pc.crossVectors(mo,NS);const i=pc.lengthSq()>1e-6?t.liftUp.dot(pc.normalize()):0;e.roll=Math.max(-1,Math.min(1,-i*3)),e.pitch=1,e.afterburner=!0,(this.turned>=Math.PI*2*.97||this.frames>1500)&&(this.kind="")}else e.roll=1,e.pitch=.08,e.afterburner=!1,(this.turned>=Math.PI*6||this.frames>900)&&(this.kind="");return this.active}}const Ji=9.81,al=1.225,OS=8500,vi=1e4,Yn=38,Ad=.022,Rd=.12,ys=5,da=.28,ml=.27,Cd=.42,zS=-.2,rl=9,hr=-3,Pd=45e3,Ld=16e4,Dd=.5,BS=2e4,kS=.9,HS=3.6,GS=.22,Id=.5,Ud=.49,Ze=new T,go=new T,vo=new T,_o=new T,Xa=new T,Mo=new zt,Nd=new T(0,1,0),ya=s=>al*Math.exp(-Math.max(0,s)/OS),mc=(s,t)=>Math.min(rl,ys*ml*.5*ya(s)*t*t*Yn/(vi*Ji)),Km=s=>s>=1?(s-1)/(rl-1):(s-1)/(1-hr),VS=hr,An=2.3,Fd=.025,WS=.025,XS=.5,YS=.17,qS=ml/1.69*180/Math.PI,Zm=Math.sqrt(2*vi*Ji/(al*Yn*ys*ml)),Od=s=>Math.max(295,340.3-.0039*Math.max(0,s));class Jm{constructor(){this.pos=new T,this.vel=new T,this.liftUp=new T(0,1,0),this.quat=new Ei,this.nose=new T(0,0,-1),this.bodyUp=new T(0,1,0),this.alpha=0,this.throttle=Ud,this.afterburner=!1,this.gLoad=1,this.stalled=!1,this.mach=0,this.hp=vr,this.alive=!0,this.limiterOff=!1,this.wingDrop=0,this.spin=0,this.gearDown=!1,this.onGround=!1,this.brakes=!1,this.groundDir=new T(1,0,0),this.crashing=!1,this.crashFall=20}reset(t,e,i){this.pos.set(t,cr*Ie,e),this.vel.set(Math.sin(i),0,-Math.cos(i)).multiplyScalar(Aa*hn),this.liftUp.set(0,1,0),this.alpha=.03,this.throttle=Ud/ki,this.afterburner=!1,this.gLoad=1,this.stalled=!1,this.hp=vr,this.alive=!0,this.crashing=!1,this.crashFall=20,this.gearDown=!1,this.onGround=!1,this.brakes=!1,this.limiterOff=!1,this.wingDrop=0,this.spin=0,this.updateBody()}touchDown(t){this.onGround=!0,this.pos.y=t+An;const e=Math.hypot(this.vel.x,this.vel.z);if(e>.5)this.groundDir.set(this.vel.x/e,0,this.vel.z/e);else{const i=Math.hypot(this.nose.x,this.nose.z)||1;this.groundDir.set(this.nose.x/i,0,this.nose.z/i)}this.vel.y=0,this.liftUp.set(0,1,0),this.gLoad=1,this.updateBodyGround(this.groundDir.x,this.groundDir.z)}stepGround(t,e,i){let n=0,a=0;e&&(n=e.pitch,a=e.yaw||e.roll,this.throttle=Math.min(1,Math.max(0,this.throttle+e.throttle*Id*t)),this.afterburner=e.afterburner);const r=this.vel.x,o=this.vel.z;let l=Math.hypot(r,o);const c=l>.5?r/l:this.groundDir.x,h=l>.5?o/l:this.groundDir.z,f=ya(this.pos.y),u=.5*f*l*l,d=n>.2&&l>.85*Zm?YS*Math.min(1,n*1.5):0;this.alpha+=Math.max(-.25*t,Math.min(.5*t,d-this.alpha));const g=ys*this.alpha,v=g*u*Yn,p=(Ad+(this.gearDown?Fd:0)+Rd*g*g)*u*Yn,M=Math.pow(f/al,Dd),y=(Pd*(this.afterburner?1:this.throttle)+(this.afterburner?Ld:0))*M*ki,S=Math.max(0,vi*Ji-v),C=(this.brakes?XS:WS)*S;l+=(y-p)/vi*t,l=Math.max(0,l-C/vi*t);const w=a*Math.min(.6,6/Math.max(1,l))*t,E=Math.cos(w),A=Math.sin(w),D=c*E-h*A,_=c*A+h*E;return this.vel.set(D*l,0,_*l),this.groundDir.set(D,0,_),this.pos.x+=this.vel.x*t,this.pos.z+=this.vel.z*t,this.pos.y=i+An,this.gLoad=1,this.stalled=!1,this.mach=l/Od(this.pos.y),this.liftUp.set(0,1,0),this.nose.set(D,0,_),this.updateBodyGround(D,_),v>vi*Ji*1.02&&d>0?(this.onGround=!1,this.vel.y=1.5,!0):!1}updateBodyGround(t,e){const i=Math.cos(this.alpha),n=Math.sin(this.alpha);this.nose.set(t*i,n,e*i),this.bodyUp.set(-t*n,i,-e*n),go.crossVectors(this.nose,this.bodyUp).normalize(),_o.copy(this.bodyUp),Mo.makeBasis(go,_o,vo.copy(this.nose).negate()),this.quat.setFromRotationMatrix(Mo)}stepCrash(t){this.vel.x*=.995,this.vel.z*=.995,this.crashFall=Math.min(200,this.crashFall+1.2),this.vel.y=-(this.crashFall*Ie)/t,this.pos.x+=this.vel.x*t,this.pos.z+=this.vel.z*t,this.pos.y-=this.crashFall*Ie;const e=Math.max(1,this.vel.length());Ze.copy(this.vel).divideScalar(e),this.liftUp.applyAxisAngle(Ze,ad),this.liftUp.addScaledVector(Ze,-this.liftUp.dot(Ze)).normalize(),this.alpha=0,this.afterburner=!1,this.throttle=0,this.gLoad=0,this.updateBody()}get speed(){return this.vel.length()}get headingDeg(){return(Math.atan2(this.vel.x,-this.vel.z)*180/Math.PI+360)%360}step(t,e){const i=Math.max(1,this.vel.length());Ze.copy(this.vel).divideScalar(i);const n=this.pos.y,a=ya(n),r=.5*a*i*i,o=Math.min(1,r/BS);let l=0,c=0,h=0;e&&!this.crashing&&(l=e.pitch,c=e.roll,h=e.yaw,this.throttle=Math.min(1,Math.max(0,this.throttle+e.throttle*Id*t)),this.afterburner=e.afterburner),this.crashing&&(this.throttle=0,this.afterburner=!1);let f=0;if(!this.crashing){const D=(l>=0?1+l*(rl-1):1+l*(1-hr))*vi*Ji/Math.max(1,r*Yn),x=vi*Ji>ys*da*r*Yn&&l>.2?Cd:this.limiterOff&&l>.8?Cd*1.15:ml;f=Math.min(x,Math.max(zS,D/ys)),this.limiterOff&&l>.9&&(f=x)}const u=kS*ki*Math.max(.25,o)*t;this.alpha+=Math.max(-u,Math.min(u,f-this.alpha));const d=$S(this.alpha);let g=d*r*Yn;const v=rl*vi*Ji;g>v&&(g=v),g<hr*vi*Ji&&(g=hr*vi*Ji);const m=this.stalled;this.stalled=Math.abs(this.alpha)>da,this.stalled&&!m&&(this.wingDrop=(Math.random()<.5?-1:1)*.5),this.stalled||(this.wingDrop=0);const p=Od(n);this.mach=i/p;const M=this.mach>.9?.015*Math.min(1,(this.mach-.9)/.25):0;let y=Ad+M+Rd*d*d+(this.gearDown?Fd:0);this.stalled&&(y+=.25*(Math.abs(this.alpha)-da)*4);const S=y*r*Yn,C=Math.pow(a/al,Dd),w=(Pd*(this.afterburner?1:this.throttle)+(this.afterburner?Ld:0))*C*ki*hn*hn;if(this.crashing)this.liftUp.applyAxisAngle(Ze,-ad*60*t);else{this.liftUp.applyAxisAngle(Ze,c*HS*ki*Math.max(.3,o)*t),this.stalled&&this.liftUp.applyAxisAngle(Ze,this.wingDrop*t);const A=Math.sign(this.wingDrop||this.spin||1);let D=0;this.limiterOff&&this.stalled&&l>.5&&(D=A*(h*A<-.3?.8:h*A>.3?2:1.4)),this.spin+=(D-this.spin)*(1-Math.exp(-t/(D?2:.8))),Math.abs(this.spin)<.005&&!D&&(this.spin=0),this.spin&&(this.vel.applyAxisAngle(Nd,-this.spin*.5*t),this.liftUp.applyAxisAngle(Nd,-this.spin*.5*t),this.liftUp.applyAxisAngle(Ze,this.spin*.7*t))}vo.copy(Ze).multiplyScalar(Math.cos(this.alpha)).addScaledVector(this.liftUp,Math.sin(this.alpha)),Xa.set(0,-Ji,0),Xa.addScaledVector(this.liftUp,g/vi),Xa.addScaledVector(Ze,-S/vi),Xa.addScaledVector(vo,w/vi),this.vel.addScaledVector(Xa,t),h!==0&&!this.crashing&&this.vel.applyAxisAngle(this.liftUp,-h*GS*Math.max(.3,o)*t),this.pos.addScaledVector(this.vel,t),this.gLoad=g/(vi*Ji);const E=Math.max(1,this.vel.length());Ze.copy(this.vel).divideScalar(E),this.liftUp.addScaledVector(Ze,-this.liftUp.dot(Ze)),this.liftUp.lengthSq()<1e-8&&this.liftUp.set(0,1,0),this.liftUp.normalize(),this.updateBody()}updateBody(){const t=Math.max(1,this.vel.length());Ze.copy(this.vel).divideScalar(t);const e=Math.cos(this.alpha),i=Math.sin(this.alpha);this.nose.copy(Ze).multiplyScalar(e).addScaledVector(this.liftUp,i),this.bodyUp.copy(this.liftUp).multiplyScalar(e).addScaledVector(Ze,-i),go.crossVectors(this.nose,this.bodyUp).normalize(),_o.copy(this.bodyUp),Mo.makeBasis(go,_o,vo.copy(this.nose).negate()),this.quat.setFromRotationMatrix(Mo)}}function $S(s){const t=Math.sign(s),e=Math.abs(s);if(e<=da)return ys*s;const i=ys*da;return t*Math.max(.7,i-(e-da)*3.5)}const Ki=9.81,us=Math.PI/180,KS=.514444,He=(s,t,e)=>Math.max(t,Math.min(e,s)),qo=s=>Math.atan2(Math.sin(s),Math.cos(s)),ur={1:{id:"loop",name:"LOOP",minKt:400,minAglM:600,throttle:1,energy:!0},2:{id:"immelmann",name:"IMMELMANN",minKt:420,minAglM:600,throttle:1,energy:!0},3:{id:"splitS",name:"SPLIT-S",minKt:220,minAglM:1500,throttle:.35},4:{id:"break",name:"BREAK 180",minKt:250,minAglM:300,throttle:1},5:{id:"aroll",name:"AILERON ROLL",minKt:200,minAglM:300},6:{id:"barrel",name:"BARREL ROLL",minKt:300,minAglM:600,throttle:.6},7:{id:"cuban",name:"CUBAN EIGHT",minKt:420,minAglM:800,throttle:1,energy:!0},8:{id:"wingover",name:"WINGOVER",minKt:300,minAglM:500,throttle:.45}},ZS=8,jm=()=>({up:new T,right:new T,nose:new T,vHat:new T,v:1,gamma:0,bank:0,az:0});function fr(s,t){return t.v=Math.max(1,s.vel.length()),t.vHat.copy(s.vel).divideScalar(t.v),t.up.copy(s.liftUp),t.nose.copy(s.nose),t.right.crossVectors(t.vHat,t.up).normalize(),t.gamma=Math.asin(He(t.vHat.y,-1,1)),t.bank=Math.atan2(-t.right.y,t.up.y),t.az=Math.atan2(-s.vel.x,-s.vel.z),t}const Qt=s=>({time:0,ok:0,rolled:0,gTrim:0,...s});class Qm{constructor(){this.active=!1,this.flying=!1,this.def=null,this.num=0,this.finished=!1,this.turnDir=-1,this.t=0,this.entry={y:0,az:0,v:0},this.segs=[],this.si=-1,this.f=jm(),this.prevUp=new T,this._a=new T,this._b=new T,this._c=new T,this._acc=new T,this._up0=new T,this.out={pitch:0,roll:0,yaw:0,throttle:0,afterburner:!1}}start(t,e,i){const n=ur[t];return n?e.speed<n.minKt*KS?"SPD LOW":i.aglM<n.minAglM?"ALT LOW":(this.def=n,this.num=t,this.turnDir=i.turnDir||-1,this.active=this.flying=!0,this.finished=!1,this.t=0,fr(e,this.f),this.entry={y:e.pos.y,az:this.f.az,v:this.f.v},this.segs=this.plan(n.id,e),this.si=-1,this.next(e),""):"NONE"}stop(){this.active=this.flying=!1,this.segs=[]}handOver(){this.flying=!1}loopRadius(t){const e=He(mc(t.pos.y,this.entry.v)-1.3,3.2,5.5);return this.entry.v*this.entry.v/(Ki*e)}plan(t,e){const i=this.loopRadius(e),n=this.entry.v*this.entry.v,a=Math.min(6.5,mc(e.pos.y,this.entry.v)-.4),r=this.entry.y;switch(t){case"loop":return[Qt({t:"level"}),Qt({t:"arc",sweep:2*Math.PI-.06,R:i}),Qt({t:"level"})];case"immelmann":return[Qt({t:"level"}),Qt({t:"arc",sweep:Math.PI-.04,R:i}),Qt({t:"roll",by:Math.PI,rate:.9}),Qt({t:"level"})];case"splitS":return[Qt({t:"level"}),Qt({t:"roll",by:Math.PI,rate:.9}),Qt({t:"arc",sweep:Math.PI-.04,R:n/(Ki*He(a-2,2.5,4))}),Qt({t:"level"})];case"break":return[Qt({t:"level"}),Qt({t:"hturn",sweep:Math.PI-.12,R:n/(Ki*Math.sqrt(Math.max(2,a*a-1)))}),Qt({t:"level"})];case"aroll":return[Qt({t:"level"}),Qt({t:"climb",gamma:4*us}),Qt({t:"roll",by:2*Math.PI,rate:1}),Qt({t:"level"})];case"barrel":return[Qt({t:"level"}),Qt({t:"track",kind:"barrel",T:2*Math.PI/.6,alpha:20*us}),Qt({t:"level"})];case"cuban":return[Qt({t:"level"}),Qt({t:"arc",sweep:1.25*Math.PI,R:i}),Qt({t:"roll",by:Math.PI,rate:.9}),Qt({t:"line",downTo:r+i*(1-Math.SQRT1_2)}),Qt({t:"arc",sweep:1.5*Math.PI,R:i}),Qt({t:"roll",by:Math.PI,rate:.9}),Qt({t:"line",downTo:r+i*(1-Math.SQRT1_2)}),Qt({t:"arc",sweep:.25*Math.PI-.02,R:i}),Qt({t:"level"})];case"wingover":{const o=mc(e.pos.y,this.entry.v);return[Qt({t:"level"}),Qt({t:"track",kind:"wingover",T:20*He(7/o,1,1.6),gammaMax:40*us*He((o-2)/5,.5,1)}),Qt({t:"level"})]}default:return[Qt({t:"level"})]}}next(t){if(this.si++,this.si>=this.segs.length){this.active=this.flying=!1,this.finished=!0;return}const e=this.sg=this.segs[this.si],i=fr(t,this.f);if(e.time=0,e.ok=0,e.rolled=0,e.gTrim=0,this.prevUp.copy(i.up),e.t==="arc"){const n=Math.sign(i.up.y)||1,a=this._a.set(0,n,0).addScaledVector(i.vHat,-n*i.vHat.y).normalize();e.center=t.pos.clone().addScaledVector(a,e.R),e.normal=new T().crossVectors(i.vHat,a).normalize(),e.side=e.normal.clone().multiplyScalar(Math.sign(e.normal.dot(i.right))||1),e.prevR=t.pos.clone().sub(e.center),e.swept=0}else if(e.t==="hturn"){const n=new T(Math.cos(i.az),0,-Math.sin(i.az)).multiplyScalar(this.turnDir);e.center=t.pos.clone().addScaledVector(n,e.R),e.center.y=t.pos.y,e.y0=t.pos.y,e.az0=i.az}else e.t==="track"&&(e.az0=i.az,e.y0=t.pos.y,e.axis=new T(-Math.sin(i.az),0,-Math.cos(i.az)),e.side0=new T(Math.cos(i.az),0,-Math.sin(i.az)),e.dWant=new T,e.dNext=new T)}trackDir(t,e,i,n){const a=t.T,r=He(e/a,0,1);if(t.kind==="barrel"){const c=t.alpha*Math.sin(Math.PI*r),h=2*Math.PI*r;return n.copy(t.axis).multiplyScalar(Math.cos(c)).addScaledVector(this._up0.set(0,1,0),Math.sin(c)*Math.cos(h)).addScaledVector(t.side0,Math.sin(c)*Math.sin(h))}const o=t.az0-this.turnDir*Math.PI*(1-Math.cos(Math.PI*r))/2;let l=t.gammaMax*Math.sin(Math.PI*r);if(r>.5){const c=Math.max(.5,a-e);l=Math.min(l,-Math.asin(He((i.pos.y-t.y0)/(i.vel.length()*c),0,.6)))}return n.set(-Math.sin(o)*Math.cos(l),Math.sin(l),-Math.cos(o)*Math.cos(l))}update(t,e){if(!this.active)return null;this.t+=e;const i=fr(t,this.f),n=this.sg;n.time+=e;const a=this._a.crossVectors(this.prevUp,i.up).dot(i.vHat),r=Math.atan2(a,this.prevUp.dot(i.up));n.rolled+=Math.abs(r)<1?r:0,this.prevUp.copy(i.up);let o=0,l=0,c=null;const h=this.def;let f=h.throttle;if(n.t==="level")c=Math.cos(i.gamma)/Math.max(.3,Math.cos(i.bank))-.6*i.gamma*i.v/Ki,l=He(-2.2*i.bank,-1,1),Math.abs(i.bank)>1.6&&(l=Math.sign(l||1)),Math.abs(i.bank)<4*us&&Math.abs(i.gamma)<3*us?n.ok+=e:n.ok=0,(n.ok>.3||n.time>7)&&this.next(t),(this.si===this.segs.length-1||!this.active)&&(f=void 0);else if(n.t==="climb")c=(Math.cos(i.gamma)+1.2*(n.gamma-i.gamma)*i.v/Ki)/Math.max(.3,Math.cos(i.bank)),l=He(-2.2*i.bank,-1,1),(Math.abs(n.gamma-i.gamma)<1*us||n.time>4)&&this.next(t),f=void 0;else if(n.t==="arc"){const d=this._b.copy(t.pos).sub(n.center);d.addScaledVector(n.normal,-d.dot(n.normal));const g=d.length(),v=this._c.copy(d).multiplyScalar(-1/Math.max(1,g)),m=t.vel.dot(d)/Math.max(1,g);c=i.v*i.v/(Ki*n.R)+v.y+.004*(g-n.R)+.03*m,l=He(-3*n.side.dot(i.up),-1,1);const p=this._a.crossVectors(n.prevR,d).dot(n.normal);n.swept+=Math.abs(Math.atan2(p,n.prevR.dot(d))),n.prevR.copy(d),n.swept>=n.sweep&&this.next(t)}else if(n.t==="roll"){const d=n.by-Math.abs(n.rolled);l=Math.min(n.rate,.25+d*1.6),c=Math.cos(i.gamma)*Math.cos(i.bank),f=n.by>3.5?void 0:f,d<=.03&&this.next(t)}else if(n.t==="line")c=Math.cos(i.gamma)*Math.cos(i.bank),l=He(-2.2*i.bank,-1,1),(t.pos.y<=n.downTo||n.time>20)&&this.next(t);else if(n.t==="hturn"){const d=this._b.copy(t.pos).sub(n.center);d.y=0;const g=d.length(),v=(t.vel.x*d.x+t.vel.z*d.z)/Math.max(1,g),m=Math.hypot(t.vel.x,t.vel.z),p=m*m/(Ki*n.R)+.004*(g-n.R)+.03*v,M=1+.01*(n.y0-t.pos.y)-.04*t.vel.y,y=this.turnDir*Math.atan2(Math.max(0,p),M);c=Math.hypot(p,M),l=He(2.5*qo(y-i.bank),-1,1),Math.abs(qo(i.az-n.az0))>=n.sweep&&Math.sign(qo(n.az0-i.az))===this.turnDir&&this.next(t)}else if(n.t==="track"){const d=this.trackDir(n,n.time,t,n.dWant),g=this.trackDir(n,n.time+.05,t,n.dNext),v=this._acc.copy(g).sub(d).divideScalar(.05).addScaledVector(this._b.copy(d).sub(i.vHat),1.5).multiplyScalar(i.v);v.y+=Ki,v.addScaledVector(i.vHat,-v.dot(i.vHat));const m=v.length()/Ki;if(m>.05){v.divideScalar(m*Ki);const p=Math.atan2(this._c.crossVectors(i.up,v).dot(i.vHat),i.up.dot(v));l=He(2.5*p,-1,1),c=m*Math.max(0,Math.cos(p))}else l=0,c=0;n.time>=n.T&&this.next(t)}if(h.energy&&this.active&&n.t!=="level"){const d=Math.sqrt(Math.max(1600,this.entry.v**2-2*Ki*(t.pos.y-this.entry.y)));f=He(.7+.05*(d-i.v),.1,1)}if(c!==null){const d=c-t.gLoad;Math.abs(d)<2&&(n.gTrim=He(n.gTrim+.6*d*e,-1,1)),o=Km(He(c+n.gTrim,VS,7.5))}const u=this.out;return u.pitch=He(o,-1,1),u.roll=He(l,-1,1),u.yaw=0,u.throttle=0,u.throttleAbs=f,u}}function t0(s,t){if(t.throttleAbs===void 0){t.afterburner=s.afterburner;return}const e=t.throttleAbs;t.afterburner=e>.75,s.throttle=t.afterburner?1:Math.min(1,e/.7)}function JS(s,t,e){const i=new Jm;i.pos.copy(t.pos),i.vel.copy(t.vel),i.liftUp.copy(t.liftUp),i.alpha=t.alpha,i.throttle=t.throttle,i.afterburner=t.afterburner,i.gLoad=t.gLoad;const n=new Qm;if(n.start(s,i,e)!=="")return null;const a=1/60,r=[];let o=0,l=0;for(;o<180&&n.active;o+=a,l++){const c=n.update(i,a);if(!c)break;t0(i,c),i.step(a,c),l%6===0&&r.push(i.pos.clone())}return r.push(i.pos.clone()),{points:r,duration:o,exitAz:Math.atan2(-i.vel.x,-i.vel.z),exitY:i.pos.y,name:ur[s].name}}class jS{constructor(){this.on=!1,this.i=0,this.g=null,this.sum=0,this.n=0,this.t=0}start(t){this.g=t,this.i=0,this.sum=0,this.n=0,this.t=0,this.on=!!t}stop(){this.on=!1}update(t,e,i){if(!this.on||!this.g)return null;this.t+=i;const n=this.g.points;let a=1/0,r=this.i;for(let l=this.i;l<Math.min(n.length,this.i+40);l++){const c=n[l].distanceToSquared(t);c<a&&(a=c,r=l)}this.i=r;const o=Math.sqrt(a);return this.sum+=o,this.n++,o>4e3||this.t>this.g.duration*2+10?(this.on=!1,{name:this.g.name,score:0,stars:0}):r>=n.length-3?this.finish(t,e):null}finish(t,e){if(!this.on||!this.g)return null;this.on=!1;const i=Math.atan2(-e.x,-e.z),n=Math.abs(qo(i-this.g.exitAz))/us,a=Math.abs(t.y-this.g.exitY),r=this.sum/Math.max(1,this.n),o=Math.round(He(100-r/6-n*1.5-a/12,0,100));return{name:this.g.name,score:o,stars:o>=85?3:o>=65?2:1}}}const zd=2e3,Bd=160,QS=250;class tw{constructor(t){this.ringIdx=[],this.lastPassed=-1,this.color=new gt,this._m=new zt,this._q=new Ei,this._x=new T,this._s=new T(1,1,1),this._z=new T(0,0,1),this.rings=new Gi(new wu(14,.6,6,36),new ze({transparent:!0,opacity:.9,depthWrite:!1,blending:nn,toneMapped:!1}),Bd),this.rings.instanceMatrix.setUsage(Rn),this.rings.frustumCulled=!1,this.rings.visible=!1,this.rings.setColorAt(0,this.color.setRGB(1,1,1)),t.add(this.rings);const e=new ve;e.setAttribute("position",new he(new Float32Array(zd*3),3)),this.line=new Rm(e,new _u({color:10148095,transparent:!0,opacity:.4,depthWrite:!1,toneMapped:!1})),this.line.frustumCulled=!1,this.line.visible=!1,t.add(this.line)}set(t){if(this.lastPassed=-1,!t){this.rings.visible=this.line.visible=!1;return}const e=Math.min(t.length,zd),i=this.line.geometry.attributes.position;for(let a=0;a<e;a++)i.setXYZ(a,t[a].x,t[a].y,t[a].z);this.line.geometry.setDrawRange(0,e),i.needsUpdate=!0,this.line.visible=!0,this.ringIdx=[];let n=0;for(let a=1;a<e&&this.ringIdx.length<Bd;a++)n+=t[a].distanceTo(t[a-1]),n>=QS&&(this.ringIdx.push(a),n=0);this.ringIdx.forEach((a,r)=>{const o=t[Math.max(0,a-1)],l=t[Math.min(e-1,a+1)];this._x.copy(l).sub(o).normalize(),this._q.setFromUnitVectors(this._z,this._x),this._m.compose(t[a],this._q,this._s),this.rings.setMatrixAt(r,this._m)}),this.rings.count=this.ringIdx.length,this.rings.instanceMatrix.needsUpdate=!0,this.paint(0),this.rings.visible=this.ringIdx.length>0}update(t,e){!this.rings.visible||t===this.lastPassed||(this.lastPassed=t,this.paint(t,e))}paint(t,e=!1){let i=0;const n=e?.7:1;this.ringIdx.forEach((a,r)=>{const o=a>=t,l=o&&i++<3;this.color.setRGB(.55,.85,1).multiplyScalar(n*(l?.95:o?.4:.06)),this.rings.setColorAt(r,this.color)}),this.rings.instanceColor&&(this.rings.instanceColor.needsUpdate=!0)}}const ew=new T(5.2,.05,3.4),xo={normal:new gt(.25,.9,1),transonic:new gt(1,.62,.12),supersonic:new gt(1,1,1),highG:new gt(1,.16,.1)};class kd{constructor(t,e,i){this.o=i,this.last=new T,this.hasLast=!1,this.n=e,this.center=new Float32Array(e*3),this.tangent=new Float32Array(e*3),this.rgb=new Float32Array(e*3),this.strength=new Float32Array(e),this.born=new Float32Array(e).fill(-1e9),this.pos=new Float32Array(e*6),this.col=new Float32Array(e*8);const n=new ve;n.setAttribute("position",new he(this.pos,3).setUsage(Rn)),n.setAttribute("color",new he(this.col,4).setUsage(Rn));const a=[];for(let r=0;r<e-1;r++){const o=2*r;a.push(o,o+1,o+2,o+1,o+3,o+2)}n.setIndex(a),this.mesh=new St(n,new ze({vertexColors:!0,transparent:!0,side:Ge,depthWrite:!1,blending:i.blending,toneMapped:!1,fog:!1})),this.mesh.frustumCulled=!1,this.mesh.visible=!1,t.add(this.mesh)}clear(){this.strength.fill(0),this.hasLast=!1}push(t,e,i,n){const a=this.center,r=this.tangent,o=this.n;if(!this.hasLast){for(let l=0;l<o;l++)a[3*l]=t.x,a[3*l+1]=t.y,a[3*l+2]=t.z;this.strength.fill(0)}if(a.copyWithin(3,0,(o-1)*3),r.copyWithin(3,0,(o-1)*3),this.rgb.copyWithin(3,0,(o-1)*3),this.strength.copyWithin(1,0,o-1),this.born.copyWithin(1,0,o-1),a[0]=t.x,a[1]=t.y,a[2]=t.z,this.hasLast){const l=t.x-this.last.x,c=t.y-this.last.y,h=t.z-this.last.z,f=Math.hypot(l,c,h)||1;r[0]=l/f,r[1]=c/f,r[2]=h/f}this.rgb[0]=e.r,this.rgb[1]=e.g,this.rgb[2]=e.b,this.strength[0]=i,this.born[0]=n,this.last.copy(t),this.hasLast=!0}update(t,e,i){let n=!1;const{pos:a,col:r,center:o,tangent:l,n:c}=this;for(let h=0;h<c;h++){const f=t-this.born[h];let d=this.strength[h]>0&&(h===c-1||this.strength[h+1]>0||h>0&&this.strength[h-1]>0)&&f<=this.o.life?this.o.alpha(f/this.o.life)*this.strength[h]*i:0;const g=3*h,v=e.x-o[g],m=e.y-o[g+1],p=e.z-o[g+2];d*=Math.min(1,Math.max(0,(Math.hypot(v,m,p)-30)/90));let M=l[g+1]*p-l[g+2]*m,y=l[g+2]*v-l[g]*p,S=l[g]*m-l[g+1]*v;const C=this.o.width(Math.max(0,f))/(Math.hypot(M,y,S)||1);M*=C,y*=C,S*=C,a[6*h]=o[g]-M,a[6*h+1]=o[g+1]-y,a[6*h+2]=o[g+2]-S,a[6*h+3]=o[g]+M,a[6*h+4]=o[g+1]+y,a[6*h+5]=o[g+2]+S;for(let w=0;w<2;w++){const E=8*h+4*w;r[E]=this.rgb[g],r[E+1]=this.rgb[g+1],r[E+2]=this.rgb[g+2],r[E+3]=d}d>.003&&(n=!0)}this.mesh.visible=n,n&&(this.mesh.geometry.attributes.position.needsUpdate=!0,this.mesh.geometry.attributes.color.needsUpdate=!0)}}const Hd=24,gc=24,Bn=12;class iw{constructor(t){this.now=0,this.tipGap=0,this.p=new T,this.lastPos=new T,this.omega=new T,this.prevVel=new T,this._w=new T,this._d=new T,this._x=new T,this._q=new Ei,this.mslPrev=new Map,this.mslOmega=new Map,this.vapour=[],this.vapourLevel=0,this.host=null;const e={blending:nn,life:20,width:l=>.3+l*.06,alpha:l=>.55*(1-l)**1.5};this.tips=[new kd(t,400,e),new kd(t,400,e)];const i=new ve;this.futurePos=new Float32Array(Hd*3),i.setAttribute("position",new he(this.futurePos,3).setUsage(Rn)),this.future=new Vf(i,new Ph({color:8257456,size:5,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1,toneMapped:!1,fog:!1})),this.future.frustumCulled=!1,this.future.visible=!1,t.add(this.future);const n=new ve;this.mslPos=new Float32Array(gc*Bn*3),this.mslCol=new Float32Array(gc*Bn*3),n.setAttribute("position",new he(this.mslPos,3).setUsage(Rn)),n.setAttribute("color",new he(this.mslCol,3).setUsage(Rn)),this.msl=new Vf(n,new Ph({vertexColors:!0,size:4,sizeAttenuation:!1,transparent:!0,opacity:.9,depthWrite:!1,toneMapped:!1,fog:!1})),this.msl.frustumCulled=!1,this.msl.visible=!1,t.add(this.msl);const a=new xa(5.6,8,28,1,!0);a.rotateX(-Math.PI/2),this.coneMat=new ze({color:16777215,transparent:!0,opacity:0,side:Ge,blending:nn,depthWrite:!1,toneMapped:!1}),this.cone=new St(a,this.coneMat),this.cone.position.z=.8,this.cone.visible=!1;const r=document.createElement("canvas");r.width=r.height=64;const o=r.getContext("2d");if(o){const l=o.createRadialGradient(32,32,0,32,32,32);l.addColorStop(0,"rgba(255,255,255,1)"),l.addColorStop(.5,"rgba(255,255,255,0.45)"),l.addColorStop(1,"rgba(255,255,255,0)"),o.fillStyle=l,o.fillRect(0,0,64,64)}this.vapourMat=new Tm({map:new Ma(r),transparent:!0,opacity:0,depthWrite:!1,blending:nn,toneMapped:!1});for(const l of[-1,1])for(let c=0;c<5;c++){const h=c/4,f=new By(this.vapourMat);f.position.set(l*(1.2+3*h),.5-.1*h,-.6+3*h),f.userData.base=2.6-1*h,f.visible=!1,this.vapour.push(f)}}attach(t){if(this.host!==t){this.host=t,t.add(this.cone);for(const e of this.vapour)t.add(e)}}clear(){for(const t of this.tips)t.clear();this.mslPrev.clear(),this.mslOmega.clear()}update(t,e,i,n,a,r,o){if(this.now+=t,this.lastPos.distanceToSquared(e.pos)>2e3*2e3)for(const p of this.tips)p.clear();if(this.lastPos.copy(e.pos),this.tipGap+=t,this.tipGap>=.05){this.tipGap=0;const p=e.gLoad>5?xo.highG:e.mach>1.2?xo.supersonic:e.mach>=.85?xo.transonic:xo.normal;this.tips.forEach((M,y)=>{this.p.copy(ew),y&&(this.p.x=-this.p.x),this.p.applyQuaternion(e.quat).add(e.pos),M.push(this.p,p,i?1:0,this.now)})}for(const p of this.tips)p.update(this.now,n,a?.6:1);if(i&&t>0){const p=e.vel.lengthSq();p>100&&this.prevVel.lengthSq()>100&&(this._w.crossVectors(this.prevVel,e.vel).divideScalar(p*t),this.omega.lerp(this._w,Math.min(1,t/.3))),this.prevVel.copy(e.vel),this.project(e.pos,e.vel,this.omega,.35,Hd,this.futurePos,0),this.future.geometry.attributes.position.needsUpdate=!0,this.future.visible=!0}else this.future.visible=!1,this.prevVel.copy(e.vel);let l=0;const c=new Set,h=(p,M,y,S)=>{for(const C of p){if(!C.active||l>=gc)continue;c.add(C);let w=this.mslPrev.get(C),E=this.mslOmega.get(C);if(!w||!E)w=C.vel.clone(),E=new T,this.mslPrev.set(C,w),this.mslOmega.set(C,E);else if(t>0){const A=C.vel.lengthSq();A>100&&w.lengthSq()>100&&(this._w.crossVectors(w,C.vel).divideScalar(A*t),E.lerp(this._w,Math.min(1,t/.25))),w.copy(C.vel)}this.project(C.pos,C.vel,E,.5,Bn,this.mslPos,l*Bn);for(let A=0;A<Bn;A++){const D=1-.6*A/Bn,_=3*(l*Bn+A);this.mslCol[_]=M*D,this.mslCol[_+1]=y*D,this.mslCol[_+2]=S*D}l++}};h(r,1,.25,.2),h(o,.4,.8,1);for(const p of this.mslPrev.keys())c.has(p)||(this.mslPrev.delete(p),this.mslOmega.delete(p));this.msl.geometry.setDrawRange(0,l*Bn),this.msl.visible=l>0,l>0&&(this.msl.geometry.attributes.position.needsUpdate=!0,this.msl.geometry.attributes.color.needsUpdate=!0);const f=Math.max(0,1-Math.abs(e.mach-1)/.05),u=i?f*.28:0;this.coneMat.opacity+=(u-this.coneMat.opacity)*Math.min(1,8*t),this.cone.visible=this.coneMat.opacity>.01,this.cone.visible&&this.cone.scale.setScalar(.95+Math.random()*.07);const d=e.alpha*180/Math.PI,g=1-Math.min(1,Math.max(0,(e.pos.y-3e3)/1500)),v=i&&e.mach<.95?Math.min(1,Math.max(0,(d-10)/6))*Math.min(1,Math.max(0,(e.gLoad-4)/2))*g:0;this.vapourLevel+=(v-this.vapourLevel)*Math.min(1,6*t),this.vapourMat.opacity=.42*this.vapourLevel;const m=this.vapourLevel>.02;for(const p of this.vapour)p.visible=m,m&&p.scale.setScalar(p.userData.base*(.85+Math.random()*.3))}project(t,e,i,n,a,r,o){const l=i.length();this._d.copy(e),this._x.copy(t),l>1e-5&&this._q.setFromAxisAngle(this._w.copy(i).divideScalar(l),l*n);for(let c=0;c<a;c++){l>1e-5&&this._d.applyQuaternion(this._q),this._x.addScaledVector(this._d,n);const h=3*(o+c);r[h]=this._x.x,r[h+1]=this._x.y,r[h+2]=this._x.z}}}const Gd=9.81,nw=.3048,oi=Math.PI/180,e0=.514444,yo=3*oi,vc=100,ai=(s,t,e)=>Math.max(t,Math.min(e,s)),Mn=s=>Math.atan2(Math.sin(s),Math.cos(s)),_c=1.3*Zm/e0;class sw{constructor(){this.active=!1,this.finished=!1,this.phase="RTB",this.gearDown=!1,this.brakes=!1,this.goArounds=0,this.side=-1,this.rwyYaw=0,this.right=new at,this.patternY=0,this.thrI=.6,this.f=jm(),this.dwCross=0,this.baseR=500,this.baseCenter={along:0,cross:0},this.baseY0=0,this.baseSwept=0,this.baseAz=null,this.groundAt=()=>0,this.out={pitch:0,roll:0,yaw:0,throttle:0,afterburner:!1}}start(t,e,i){this.end=t,this.groundAt=i,this.rwyYaw=Math.atan2(-t.dirX,-t.dirZ),this.right.set(-t.dirZ,t.dirX),this.patternY=t.y+1500*nw,this.phase="RTB",this.thrI=ai(e.throttle,0,.95),this.gearDown=!1,this.brakes=!1,this.active=!0,this.finished=!1,this.goArounds=0;const n=fr(e,this.f),a=this.rel(e.pos.x,e.pos.z),r=t.y+An+Math.max(0,vc-a.along)*Math.tan(yo);a.along>-12e3&&a.along<-800&&Math.abs(a.cross)<600&&Math.abs(Mn(n.az-this.rwyYaw))<20*oi&&Math.abs(e.pos.y-r)<200&&(this.phase="FINAL",this.gearDown=!0)}stop(){this.active=!1,this.gearDown=!1,this.brakes=!1}rel(t,e){const i=t-this.end.thrX,n=e-this.end.thrZ;return{along:i*this.end.dirX+n*this.end.dirZ,cross:i*this.right.x+n*this.right.y}}lineYaw(t,e,i,n,a){let r=this.rel(t,e).cross-n;return Math.abs(Mn(i-this.rwyYaw))>Math.PI/2&&(r=-r),i+ai(Math.atan(r/a),-60*oi,60*oi)}setPhase(t,e){this.phase=t;const i=this.rel(e.pos.x,e.pos.z);t==="DOWNWIND"&&(this.dwCross=i.cross),t==="BASE"&&(this.baseR=Math.max(500,Math.abs(i.cross)/2),this.baseCenter={along:i.along,cross:i.cross/2},this.baseY0=e.pos.y,this.baseSwept=0,this.baseAz=null)}update(t,e){if(!this.active)return null;const i=fr(t,this.f),n=this.end,a=this.rel(t.pos.x,t.pos.z),r=i.v*Math.sqrt(ya(t.pos.y)/1.225)/e0,o=t.pos.y-An-n.y;let l=0,c=45*oi,h=null,f=0,u=350,d=!1;const g=this.out;switch(g.afterburner=!1,t.onGround&&this.phase!=="ROLLOUT"&&this.setPhase("ROLLOUT",t),this.phase){case"RTB":{const p=n.thrX-n.dirX*12e3,M=n.thrZ-n.dirZ*12e3,y=Math.hypot(p-t.pos.x,M-t.pos.z);l=Math.atan2(-(p-t.pos.x),-(M-t.pos.z));let S=this.patternY;for(const w of[1500,3e3,5e3,8e3])S=Math.max(S,this.groundAt(t.pos.x+i.vHat.x*w,t.pos.z+i.vHat.z*w)+300);f=ai((S-t.pos.y)/(i.v*8),-.15,.25),u=400,c=60*oi;const C=t.pos.y-S;if(C>300&&C>y*.12){h=this.side*45*oi,f=-.15,u=300;break}C<300&&(y<3e3||a.along<-4e3&&a.along>-14e3&&Math.abs(a.cross)<1500&&Math.abs(Mn(i.az-this.rwyYaw))<40*oi)&&this.setPhase("INITIAL",t);break}case"INITIAL":l=this.lineYaw(t.pos.x,t.pos.z,this.rwyYaw,0,1500),f=ai((this.patternY-t.pos.y)/(i.v*6),-.12,.12),u=350,a.along>=n.lengthM*.25&&this.setPhase("BREAK",t);break;case"BREAK":h=this.side*60*oi,f=ai((this.patternY-t.pos.y)/(i.v*5),-.08,.08),d=!0,Math.abs(Mn(i.az-(this.rwyYaw+Math.PI)))<12*oi&&this.setPhase("DOWNWIND",t);break;case"DOWNWIND":l=this.lineYaw(t.pos.x,t.pos.z,this.rwyYaw+Math.PI,this.dwCross,1200),f=ai((this.patternY-t.pos.y)/(i.v*6),-.1,.1),u=200,this.gearDown=!0,a.along<=-2e3&&this.setPhase("BASE",t);break;case"BASE":{const p=this.baseCenter,M=this.baseR,y=a.along-p.along,S=a.cross-p.cross,C=Math.hypot(y,S),w=((t.vel.x*n.dirX+t.vel.z*n.dirZ)*y+(t.vel.x*this.right.x+t.vel.z*this.right.y)*S)/Math.max(1,C),E=Math.hypot(t.vel.x,t.vel.z),A=E*E/(Gd*M)+.004*(C-M)+.03*w;h=this.side*Math.atan(Math.max(0,A)),this.baseAz!==null&&(this.baseSwept+=Math.abs(Mn(i.az-this.baseAz))),this.baseAz=i.az;const D=ai(this.baseSwept/Math.PI,0,1),_=n.y+An+(vc-a.along)*Math.tan(yo),x=this.baseY0+(_-this.baseY0)*D;f=ai((x-t.pos.y)/(i.v*4)-.06*(1-D),-.14,.05),u=_c+20*(1-D),this.gearDown=!0,this.baseSwept>150*oi&&Math.abs(Mn(i.az-this.rwyYaw))<12*oi&&this.setPhase("FINAL",t);break}case"FINAL":{l=this.lineYaw(t.pos.x,t.pos.z,this.rwyYaw,0,500),c=25*oi;const p=n.y+An+Math.max(0,vc-a.along)*Math.tan(yo);if(f=ai(-yo+.004*(p-t.pos.y),-8*oi,1*oi),u=_c,this.gearDown=!0,a.along>-600&&(t.pos.y-p>40||Math.abs(a.cross)>30)){this.goArounds++,this.gearDown=!1,this.setPhase("RTB",t);break}o<3&&this.setPhase("FLARE",t);break}case"FLARE":{l=this.lineYaw(t.pos.x,t.pos.z,this.rwyYaw,0,500),c=5*oi;const p=-Math.max(1.5,.6*o);f=Math.asin(ai(p/i.v,-.2,.05)),u=_c-5,d=!0,this.gearDown=!0;break}case"ROLLOUT":return this.brakes=!0,g.yaw=-ai(.02*a.cross+2*Mn(this.rwyYaw-i.az),-1,1),g.pitch=0,g.roll=0,g.throttle=0,t.throttle=0,r<15&&(this.active=!1,this.finished=!0,this.brakes=!1),g}h===null&&(h=-ai(2*Mn(l-i.az),-c,c)),g.roll=ai(2.5*Mn(h-i.bank),-1,1);const v=(Math.cos(i.gamma)+1*(f-i.gamma)*i.v/Gd)/Math.max(.35,Math.cos(i.bank));g.pitch=Km(ai(v,-1,6.5)),g.yaw=0;const m=u-r;return this.thrI=ai(this.thrI+.006*m*e,0,1),t.throttle=d?0:ai(this.thrI+.012*m,0,1),g.throttle=0,g}}function Eu(s,t){const e=s/ye,i=t/ye,n=Math.floor(e),a=Math.floor(i),r=e-n,o=i-a,l=jt(n*ye,a*ye),c=jt((n+1)*ye,a*ye),h=jt(n*ye,(a+1)*ye);if(r+o<=1)return l+(c-l)*r+(h-l)*o;const f=jt((n+1)*ye,(a+1)*ye);return f+(h-f)*(1-r)+(c-f)*(1-o)}const vs=9e4;let Ci=384,ye=vs/Ci;function aw(s){Ci=s,ye=vs/Ci}const Vd=vs/8,rw=24,ow=`
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
  }`,lw=`
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
  }`;class cw{constructor(t,e){this.centerX=0,this.centerZ=0,this.jobX=0,this.jobZ=0,this.jobRow=-1;const i=Ci+1,n=new Float32Array(i*i*3),a=new Float32Array(i*i*3);for(let l=0;l<i;l++)for(let c=0;c<i;c++){const h=(l*i+c)*3;n[h]=-vs/2+c*ye,n[h+2]=-vs/2+l*ye}const r=new Uint32Array(Ci*Ci*6);let o=0;for(let l=0;l<Ci;l++)for(let c=0;c<Ci;c++){const h=l*i+c,f=h+1,u=h+i,d=u+1;r[o++]=h,r[o++]=u,r[o++]=f,r[o++]=f,r[o++]=u,r[o++]=d}this.geo=new ve,this.pos=new he(n,3),this.col=new he(a,3),this.geo.setAttribute("position",this.pos),this.geo.setAttribute("color",this.col),this.geo.setIndex(new he(r,1)),this.stagingY=new Float32Array(i*i),this.stagingC=new Float32Array(i*i*3),this.material=new Se({vertexShader:ow,fragmentShader:lw,fog:!0,lights:!0,uniforms:Bi.merge([rt.fog,rt.lights,{uDay:{value:null},uNight:{value:null},uNightMix:{value:0},uSunDir:{value:new T(.5,1,.3).normalize()},uSunColor:{value:new gt(1,.95,.85).multiplyScalar(1.6)},uSkyLight:{value:new gt(.55,.62,.75)},uGroundLight:{value:new gt(.2,.22,.16)},uMapSize:{value:{x:Gt*pt,y:Xt*pt}}}])}),this.material.uniforms.uDay.value=t,this.material.uniforms.uNight.value=e,this.mesh=new St(this.geo,this.material),this.mesh.frustumCulled=!1,this.mesh.receiveShadow=!0,this.buildNow(0,0)}follow(t,e){if(this.jobRow<0){(Math.abs(t-this.centerX)>Vd||Math.abs(e-this.centerZ)>Vd)&&(this.jobX=Math.round(t/ye)*ye,this.jobZ=Math.round(e/ye)*ye,this.jobRow=0);return}const i=Math.min(Ci+1,this.jobRow+rw);this.fillRows(this.jobX,this.jobZ,this.jobRow,i),this.jobRow=i,i>=Ci+1&&(this.jobRow=-1,this.swap(this.jobX,this.jobZ))}snapTo(t,e){this.jobRow=-1,this.buildNow(Math.round(t/ye)*ye,Math.round(e/ye)*ye)}buildNow(t,e){this.fillRows(t,e,0,Ci+1),this.swap(t,e)}fillRows(t,e,i,n){const a=Ci+1,r=this.stagingY,o=this.stagingC;for(let l=i;l<n;l++){const c=e-vs/2+l*ye;for(let h=0;h<a;h++){const f=t-vs/2+h*ye,u=jt(f,c),d=l*a+h;r[d]=u;const g=Math.abs(jt(f+ye,c)-u)/ye;hw(u,g,Xm(f/700,c/700),o,d*3)}}}swap(t,e){const i=Ci+1,n=this.pos.array,a=this.col.array;for(let r=0;r<i*i;r++)n[r*3+1]=this.stagingY[r];a.set(this.stagingC),this.pos.needsUpdate=!0,this.col.needsUpdate=!0,this.geo.computeVertexNormals(),this.mesh.position.set(t,0,e),this.centerX=t,this.centerZ=e}}function hw(s,t,e,i,n){let a,r,o;s<=.5?(a=.005,r=.016,o=.078):t>.5||s>2600?(a=.1,r=.09,o=.07):(a=.045,r=.15,o=.025);const l=.85+e*.3;i[n]=a*l,i[n+1]=r*l,i[n+2]=o*l}const Oh=260*pt,uw=12*pt,fw=.35;let So=null;function zh(){if(!So){So=[];for(let s=0;s<Et.airbases.length;s+=2)So.push({x:Te(Et.airbases[s]),z:we(Et.airbases[s+1]),id:s/2+1})}return So}const bs=(s,t)=>Eu(s,t)+fw;function bu(s,t){let e=zh()[0],i=1/0;for(const n of zh()){const a=Math.hypot(n.x-s,n.z-t);a<i&&(i=a,e=n)}return{field:e,dist:i}}function i0(s,t,e=6){for(const i of zh())if(Math.abs(s-i.x)<=Oh/2+e&&Math.abs(t-i.z)<=uw/2+e)return i;return null}function dw(s,t,e,i,n){const a=t<s.x,r=i>0,o=Math.abs(t-s.x)>6e3?a:a||r&&Math.abs(e-s.z)<3e3;return pw(s,o)}function pw(s,t){const e=t?1:-1,i=s.x-e*Oh/2;return{field:s,ident:t?"09":"27",thrX:i,thrZ:s.z,dirX:e,dirZ:0,y:bs(i,s.z),lengthM:Oh}}const Wd=4,mw=15*Math.PI/180;function gw(s){const t=i0(s.pos.x,s.pos.z);if(!t)return null;const e=bs(s.pos.x,s.pos.z);if(s.pos.y-An>e||s.vel.y>=0)return null;const i=-s.vel.y,n=Math.abs(s.pos.z-t.z),a=Math.acos(Math.max(-1,Math.min(1,s.liftUp.y)));let r="";s.gearDown?i>Wd?r=`TOO HARD - ${i.toFixed(1)} m/s sink (max ${Wd})`:a>mw?r="WINGS NOT LEVEL at touchdown":s.nose.y<-.05&&(r="NOSE DOWN at touchdown"):r="GEAR UP - landing needs the gear down (below 1,000 ft, under 250 kt near a runway)";const o=r?0:1+(i<2?1:0)+(n<6&&i<1.5?1:0);return{ok:!r,why:r,sink:i,off:n,stars:o}}const vw=(s,t,e)=>Math.max(t,Math.min(e,s)),Mc=(s,t,e)=>{const i=vw((e-s)/(t-s),0,1);return i*i*(3-2*i)},_w={onsetFrom:5.5,perG:3.2,riseSec:2.5,fallSec:3,blackHoldSec:1,glocSec:6,wakeSec:3,redFrom:2,redPerG:1.5,redRiseSec:1,redFallSec:2},n0=()=>({stress:0,red:0,blackT:0,gloc:0,wake:0});function Mw(s,t,e,i=_w){const n=Math.max(0,(t-i.onsetFrom)/i.perG),a=n>s.stress?i.riseSec:i.fallSec;s.stress+=(n-s.stress)*(1-Math.exp(-e/a));const r=t<-i.redFrom?Math.min(1,(-t-i.redFrom)/i.redPerG):0;s.red+=(r-s.red)*(1-Math.exp(-e/(r>s.red?i.redRiseSec:i.redFallSec))),s.gloc>0?(s.gloc-=e,s.gloc<=0&&(s.gloc=0,s.wake=i.wakeSec)):s.wake>0?s.wake=Math.max(0,s.wake-e):s.stress>=1?(s.blackT+=e,s.blackT>=i.blackHoldSec&&(s.gloc=i.glocSec,s.blackT=0)):s.blackT=Math.max(0,s.blackT-e);const o=s.gloc>0,l=s.wake>0?s.wake/i.wakeSec:0,c=o?1:Math.max(Mc(.92,1,s.stress),l);return{grey:Mc(.25,.6,s.stress),tunnel:Math.max(Mc(.55,1,s.stress),l),black:c,red:s.red,controlsLost:o||l>.5,gloc:o}}const Je=Math.PI/180,kn=new T,Xd=new T,ea=new T,xc=new T,Yd=new T,Ya=new T;function ri(s,t,e,i=0){const n=Math.cos(e);return s.set(-Math.sin(t)*n,Math.sin(e),-Math.cos(t)*n),i&&(Xd.set(Math.cos(t),0,-Math.sin(t)),s.addScaledVector(Xd,Math.tan(i)).normalize()),s}const xw=(s,t=2)=>Math.floor(s/1e3*t*2)%2===0;function yw(s,t,e,i){const n=Math.round(Math.max(11,Math.min(16,t/58))),a=Math.min(s*(e?.62:.5),t*(e?.9:.8)),r=t*(e?.5:.58),o=t*(e?.42:.5);return{W:s,H:t,font:n,lw:Math.max(1.5,n/9),color:i,compact:e,outline:!0,clip:{x:s/2-a/2,y:o-r/2,w:a,h:r},tapeLX:s/2-a/2-n*3.2,tapeRX:s/2+a/2+n*3.2,tapeHalf:r*.34,midY:o,headY:o-r/2-n*.4,mnvY:o+r/2+n*1.6,bankY:o+r/2-n*4.2,bankR:n*3.2}}class Sw{constructor(t){this.dpr=1,this.canvas=document.createElement("canvas"),this.canvas.className="fighter-hud",t.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.show(!1)}show(t){this.canvas.style.display=t?"block":"none"}draw(t,e,i){const n=window.innerWidth,a=window.innerHeight,r=Math.min(2,window.devicePixelRatio||1);(this.canvas.width!==Math.round(n*r)||this.canvas.height!==Math.round(a*r))&&(this.canvas.width=Math.round(n*r),this.canvas.height=Math.round(a*r),this.dpr=r);const o=this.ctx;o.setTransform(this.dpr,0,0,this.dpr,0,0),o.clearRect(0,0,n,a);const l=yw(n,a,i,"#3cff8c"),c=e.position;ww(o,l,t,f=>(Ya.copy(f).multiplyScalar(5e3).add(c).project(e),Ya.z>1||Ya.z<-1?null:[(Ya.x*.5+.5)*n,(-Ya.y*.5+.5)*a]))}}function ww(s,t,e,i){const{W:n,clip:a,font:r}=t,o=t.color;s.save(),s.strokeStyle=o,s.fillStyle=o,s.lineWidth=t.lw,s.lineJoin="round",s.globalAlpha=e.dim?.7:.95,s.font=`bold ${r}px monospace`,t.outline&&(s.shadowColor="rgba(0,0,0,0.85)",s.shadowBlur=3);const l=(w,E)=>{!w||!E||(s.moveTo(w[0],w[1]),s.lineTo(E[0],E[1]))};s.save(),s.beginPath(),s.rect(a.x,a.y,a.w,a.h),s.clip();const c=e.yaw,h=Math.asin(Math.max(-1,Math.min(1,xc.set(0,0,-1).applyQuaternion(e.q).y)))/Je;s.beginPath(),l(i(ri(kn,c,0,-40*Je)),i(ri(ea,c,0,-3*Je))),l(i(ri(kn,c,0,3*Je)),i(ri(ea,c,0,40*Je))),s.stroke();const f=t.compact?10:5,u=2.2*Je,d=7*Je,g=8.6*Je;s.textBaseline="middle";for(let w=-85;w<=85;w+=f){if(w===0||Math.abs(w-h)>40)continue;const E=w*Je,A=(w>0?-1.3:1.3)*Je,D=i(ri(kn,c,E,-d)),_=i(ri(ea,c,E,-u)),x=i(ri(Yd,c,E,u)),L=i(ri(xc,c,E,d));if(!D||!_||!x||!L)continue;const U=i(ri(kn,c,E+A,-d)),G=i(ri(ea,c,E+A,d));s.setLineDash(w<0?[r*.55,r*.4]:[]),s.beginPath(),U&&l(U,D),l(D,_),l(x,L),G&&l(L,G),s.stroke(),s.setLineDash([]);const H=i(ri(kn,c,E,-g)),B=i(ri(ea,c,E,g));s.textAlign="center",H&&s.fillText(String(Math.abs(w)),H[0],H[1]),B&&s.fillText(String(Math.abs(w)),B[0],B[1])}for(const[w,E]of[[89.999,!1],[-89.999,!0]]){if(Math.abs(w-h)>40)continue;const A=i(ri(kn,c,w*Je));if(!A)continue;const D=r*.8;s.beginPath(),s.arc(A[0],A[1],D,0,Math.PI*2),E&&(s.moveTo(A[0]-D,A[1]-D),s.lineTo(A[0]+D,A[1]+D),s.moveTo(A[0]+D,A[1]-D),s.lineTo(A[0]-D,A[1]+D)),s.stroke()}const v=i(xc.set(0,0,-1).applyQuaternion(e.q));if(v){const w=r*.9;s.beginPath(),s.moveTo(v[0]-2*w,v[1]),s.lineTo(v[0]-w,v[1]),s.lineTo(v[0]-w/2,v[1]+w*.6),s.lineTo(v[0],v[1]),s.lineTo(v[0]+w/2,v[1]+w*.6),s.lineTo(v[0]+w,v[1]),s.lineTo(v[0]+2*w,v[1]),s.stroke()}const m=e.vel.length();if(m>15){const w=i(Yd.copy(e.vel).divideScalar(m));if(w){const E=r*.6,A=E*3,D=w[0]<a.x+A||w[0]>a.x+a.w-A||w[1]<a.y+A||w[1]>a.y+a.h-A,_=Math.max(a.x+A,Math.min(a.x+a.w-A,w[0])),x=Math.max(a.y+A,Math.min(a.y+a.h-A,w[1]));if(s.beginPath(),s.arc(_,x,E,0,Math.PI*2),s.moveTo(_-E,x),s.lineTo(_-2.6*E,x),s.moveTo(_+E,x),s.lineTo(_+2.6*E,x),s.moveTo(_,x-E),s.lineTo(_,x-1.9*E),D&&(s.moveTo(_-E*.7,x-E*.7),s.lineTo(_+E*.7,x+E*.7),s.moveTo(_+E*.7,x-E*.7),s.lineTo(_-E*.7,x+E*.7)),s.stroke(),e.aoaBracket!==null&&!e.onGround){const L=r*.55,U=x+(e.aoaDeg-e.aoaBracket)*L,G=_-3.3*E;s.beginPath(),s.moveTo(G+E*.6,U-2*L),s.lineTo(G,U-2*L),s.lineTo(G,U+2*L),s.lineTo(G+E*.6,U+2*L),s.moveTo(G,U),s.lineTo(G+E*.4,U),s.stroke()}}}if(e.navTurn!==null&&!t.compact){const w=i(ri(kn,c-e.navTurn*Je,0));if(w){const E=r*.6,A=E*2,D=w[0]<a.x+A||w[0]>a.x+a.w-A||w[1]<a.y+A||w[1]>a.y+a.h-A,_=Math.max(a.x+A,Math.min(a.x+a.w-A,w[0])),x=Math.max(a.y+A,Math.min(a.y+a.h-A,w[1]));s.strokeStyle=s.fillStyle="#ff6bff",s.beginPath(),s.moveTo(_,x-E),s.lineTo(_+E,x),s.lineTo(_,x+E),s.lineTo(_-E,x),s.closePath(),D?s.fill():s.stroke(),s.strokeStyle=s.fillStyle=o}}if(e.ils&&!t.compact){const w=a.x+a.w/2,E=a.y+a.h/2,A=Math.min(a.w,a.h)*.22;s.save(),s.setLineDash([r*.5,r*.35]),s.beginPath();const D=w+e.ils.loc*A,_=E-e.ils.gs*A;s.moveTo(D,E-A),s.lineTo(D,E+A),s.moveTo(w-A,_),s.lineTo(w+A,_),s.stroke(),s.restore()}s.restore(),s.textBaseline="alphabetic";const p=t.midY;qd(s,t,e.iasKt,10,50,t.tapeLX,-1,p,t.compact),qd(s,t,e.altFt,100,500,t.tapeRX,1,p,t.compact,e.radarAlt?"R":"");const M=t.tapeLX,y=t.tapeRX,S=r*1.25;if(s.textAlign="center",s.font=`bold ${r}px monospace`,s.fillText(`${e.gLoad.toFixed(1)}G`,M,p-t.tapeHalf-S*1.4),t.compact)s.fillText(`M ${e.mach.toFixed(2)}`,M,p+t.tapeHalf+S*.9);else{s.fillText(`MAX ${e.maxG.toFixed(1)}`,M,p-t.tapeHalf-S*.4),s.fillText(`M ${e.mach.toFixed(2)}`,M,p+t.tapeHalf+S*.9),s.fillText(`α ${e.aoaDeg.toFixed(1)}`,M,p+t.tapeHalf+S*1.9),s.fillText(e.isAfterburner?"AB":`${Math.round(e.power)}%`,y,p-t.tapeHalf-S*.4);const w=Math.round(e.vsiFpm/10)*10;s.fillText(`${w>0?"+":""}${w}`,y,p+t.tapeHalf+S*.9)}if(!t.compact){const w=n/2,E=t.headY,A=Math.min(a.w*.42,r*14),D=A/17;s.save(),s.beginPath(),s.rect(w-A,E-r*1.6,A*2,r*2.4),s.clip(),s.beginPath();const _=Math.floor((e.headingDeg-18)/5)*5;s.font=`bold ${Math.round(r*.85)}px monospace`;for(let x=_;x<=e.headingDeg+18;x+=5){const L=w+(x-e.headingDeg)*D,U=(x%10+10)%10===0;s.moveTo(L,E),s.lineTo(L,E-(U?r*.6:r*.3)),U&&s.fillText(String((x%360+360)%360).padStart(3,"0"),L,E-r*.8)}s.stroke(),s.restore(),s.beginPath(),s.moveTo(w,E+2),s.lineTo(w-r*.4,E+r*.6),s.lineTo(w+r*.4,E+r*.6),s.closePath(),s.stroke()}if(!t.compact){const w=n/2,E=t.bankY,A=t.bankR;s.beginPath();for(const L of[-60,-45,-30,-20,-10,0,10,20,30,45,60]){const U=L*Je,G=L%30===0?r*.8:r*.45;s.moveTo(w+Math.sin(U)*A,E+Math.cos(U)*A),s.lineTo(w+Math.sin(U)*(A+G),E+Math.cos(U)*(A+G))}s.stroke();const D=i(ri(kn,c,h*Je)),_=i(ri(ea,c,h*Je,2*Je));let x=-e.bankDeg*Je;if(D&&_&&(x=Math.atan2(_[1]-D[1],_[0]-D[0])),Math.abs(x)<=Math.PI*.6){const L=-Math.sin(x),U=Math.cos(x),G=Math.cos(x),H=Math.sin(x),B=r*.55,$=w+L*(A-2),N=E+U*(A-2);s.beginPath(),s.moveTo($,N),s.lineTo($-L*B*1.4-G*B,N-U*B*1.4-H*B),s.lineTo($-L*B*1.4+G*B,N-U*B*1.4+H*B),s.closePath(),s.fill()}Math.abs(e.bankDeg)>=5&&s.fillText(`${Math.round(Math.abs(e.bankDeg))}`,w,E+A+r*2)}if(e.mnv){const w=t.compact?a.y+r*1.2:t.mnvY;s.font=`bold ${Math.round(r*1.05)}px monospace`,s.textAlign="center";const E=e.mnv.stars?"  "+"★".repeat(e.mnv.stars)+"☆".repeat(3-e.mnv.stars):"";s.fillText(e.mnv.text+E,n/2,w)}const C=[];e.stalled&&C.push("STALL"),e.limiterOff&&C.push("LIM OFF"),C.length&&(xw(e.nowMs)||C[0]==="LIM OFF")&&(s.font=`bold ${Math.round(r*1.1)}px monospace`,s.fillStyle=e.stalled?"#ff5a4f":o,s.fillText(C.join("  "),n/2,t.compact?a.y+a.h-r:t.bankY-r*.8)),s.restore()}function qd(s,t,e,i,n,a,r,o,l,c=""){const h=t.font,f=t.tapeHalf,u=f/(n*2.2),d=h*4.6,g=h*1.8;if(!l){const m=a-r*d*.25;s.save(),s.beginPath(),s.rect(m-h*5,o-f,h*10,f*2),s.clip(),s.beginPath(),s.moveTo(m,o-f),s.lineTo(m,o+f),s.font=`bold ${Math.round(h*.85)}px monospace`,s.textAlign=r<0?"right":"left";const p=f/u;for(let M=Math.floor((e-p)/i)*i;M<=e+p;M+=i){if(M<0)continue;const y=o-(M-e)*u,S=M%n===0;s.moveTo(m,y),s.lineTo(m+r*(S?h*.7:h*.35),y),S&&Math.abs(y-o)>g*.7&&s.fillText(String(M),m+r*h*.9,y+h*.3)}s.stroke(),s.restore()}const v=a-d/2;s.save(),s.shadowBlur=0,s.fillStyle="rgba(0,0,0,0.35)",s.fillRect(v,o-g/2,d,g),s.restore(),s.strokeRect(v,o-g/2,d,g),s.font=`bold ${Math.round(h*1.15)}px monospace`,s.textAlign="center",s.fillText(String(Math.max(0,Math.round(e)))+c,a,o+h*.42)}class Ew{constructor(t,e){this.view=e,this.last="";const i=n=>{const a=document.createElement("div");return a.className=`gvision ${n}`,t.appendChild(a),a};this.tunnel=i("gv-tunnel"),this.black=i("gv-black"),this.red=i("gv-red"),this.set(null)}set(t){const e=t?t.grey:0,i=t?t.tunnel:0,n=t?t.black:0,a=t?t.red:0,r=`${e.toFixed(2)}|${i.toFixed(2)}|${n.toFixed(2)}|${a.toFixed(2)}`;if(r===this.last)return;this.last=r,this.view.style.filter=e>.01?`grayscale(${e.toFixed(2)}) brightness(${(1-.25*e).toFixed(2)})`:"";const o=75-55*i;this.tunnel.style.opacity=i>.01?"1":"0",this.tunnel.style.background=`radial-gradient(ellipse at center, rgba(0,0,0,0) ${o.toFixed(0)}%, rgba(0,0,0,0.97) ${(o+18).toFixed(0)}%)`,this.black.style.opacity=n.toFixed(2),this.red.style.opacity=(.75*a).toFixed(2)}}const bw=["#40e6ff","#ff9e1f","#ffffff","#ff2a1a"],ia=360;class Tw{constructor(t){this.pts=new Float32Array(ia*3),this.cat=new Uint8Array(ia),this.count=0,this.head=0,this.gap=0,this.az=.6,this.fullUntil=0,this.lastDraw=0,this.lastX=null,this.isFull=!1;const e=this.canvas=document.createElement("canvas");e.className="path-mini",t.appendChild(e),this.ctx=e.getContext("2d"),e.addEventListener("click",()=>{this.fullUntil=performance.now()+5e3,this.place()}),window.addEventListener("resize",()=>this.place()),this.place(),this.show(!1)}show(t){this.canvas.style.display=t?"block":"none"}place(){const t=performance.now()<this.fullUntil,e=window.innerWidth,i=t?e:Math.round(Math.max(130,Math.min(200,e*.15))),n=t?window.innerHeight:Math.round(i*.72),a=this.canvas.style;a.left=t?"0px":"10px",a.top=t?"0px":"10px",a.borderRadius=t?"0":"8px",a.background=t?"rgba(6,12,20,.92)":"rgba(6,12,20,.72)",a.zIndex=t?"40":"11";const r=Math.min(2,window.devicePixelRatio||1);(this.canvas.width!==Math.round(i*r)||this.canvas.height!==Math.round(n*r))&&(this.canvas.width=Math.round(i*r),this.canvas.height=Math.round(n*r),a.width=`${i}px`,a.height=`${n}px`),this.isFull=t}clear(){this.count=0,this.head=0}record(t,e,i,n,a){if(this.lastX!==null&&Math.hypot(e.x-this.lastX.x,e.z-this.lastX.z)>3e3&&this.clear(),this.lastX={x:e.x,z:e.z},this.gap+=t,this.gap<.5||!a)return;this.gap=0;const r=this.head;this.pts[3*r]=e.x,this.pts[3*r+1]=e.y,this.pts[3*r+2]=e.z,this.cat[r]=n>5?3:i>1.2?2:i>=.85?1:0,this.head=(this.head+1)%ia,this.count=Math.min(ia,this.count+1)}draw(t,e,i){if(this.isFull!==t<this.fullUntil&&this.place(),this.az+=e*.12,t-this.lastDraw<(this.isFull?33:120))return;this.lastDraw=t;const n=this.ctx,a=this.canvas.width,r=this.canvas.height;n.clearRect(0,0,a,r);const o=[];for(let N=0;N<this.count;N++){const Y=(this.head-this.count+N+ia)%ia;o.push([this.pts[3*Y],this.pts[3*Y+1],this.pts[3*Y+2],this.cat[Y]])}o.push([i.pos.x,i.pos.y,i.pos.z,o.length?o[o.length-1][3]:0]);const l=[];if(i.ghost)for(const N of i.ghost)l.push([N.x,N.y,N.z]);const c=i.runway;c&&l.push([c.thrX,c.y,c.thrZ],[c.thrX+c.dirX*c.lengthM,c.y,c.thrZ+c.dirZ*c.lengthM]);let h=1/0,f=-1/0,u=1/0,d=-1/0,g=1/0,v=-1/0;for(const N of[...o,...l])h=Math.min(h,N[0]),f=Math.max(f,N[0]),u=Math.min(u,N[1]),d=Math.max(d,N[1]),g=Math.min(g,N[2]),v=Math.max(v,N[2]);const m=Math.min(u,i.groundY),p=(h+f)/2,M=(g+v)/2,y=(m+d)/2,S=Math.max(400,f-h,v-g,(d-m)*1.3),C=Math.min(a,r)*.78/S,w=Math.cos(this.az),E=Math.sin(this.az),A=.42,D=Math.cos(A),_=Math.sin(A),x=(N,Y,Q)=>{const st=N-p,Bt=Q-M,Kt=Y-y,K=st*w-Bt*E,et=st*E+Bt*w;return[a/2+K*C,r/2-(Kt*D-et*_)*C]},L=Math.max(1,Math.min(a,r)/180);n.strokeStyle="rgba(80,140,110,0.35)",n.lineWidth=1,n.beginPath();const U=S*.6;for(let N=-4;N<=4;N++){const Y=N/4*U;let Q=x(p-U,m,M+Y),st=x(p+U,m,M+Y);n.moveTo(Q[0],Q[1]),n.lineTo(st[0],st[1]),Q=x(p+Y,m,M-U),st=x(p+Y,m,M+U),n.moveTo(Q[0],Q[1]),n.lineTo(st[0],st[1])}if(n.stroke(),c){const N=x(c.thrX,c.y,c.thrZ),Y=x(c.thrX+c.dirX*c.lengthM,c.y,c.thrZ+c.dirZ*c.lengthM);n.strokeStyle="#e2e8f0",n.lineWidth=L*3,n.beginPath(),n.moveTo(N[0],N[1]),n.lineTo(Y[0],Y[1]),n.stroke()}n.strokeStyle="rgba(148,163,184,0.25)",n.lineWidth=1,n.beginPath();for(let N=0;N<o.length;N+=8){const Y=x(o[N][0],o[N][1],o[N][2]),Q=x(o[N][0],m,o[N][2]);n.moveTo(Y[0],Y[1]),n.lineTo(Q[0],Q[1])}n.stroke(),i.ghost&&i.ghost.length>1&&(n.strokeStyle="rgba(154,216,255,0.75)",n.lineWidth=L,n.setLineDash([L*4,L*3]),n.beginPath(),i.ghost.forEach((N,Y)=>{const Q=x(N.x,N.y,N.z);Y?n.lineTo(Q[0],Q[1]):n.moveTo(Q[0],Q[1])}),n.stroke(),n.setLineDash([])),n.lineWidth=L*2,n.lineCap="round";for(let N=1;N<o.length;N++){const Y=x(o[N-1][0],o[N-1][1],o[N-1][2]),Q=x(o[N][0],o[N][1],o[N][2]);n.globalAlpha=.35+.65*N/o.length,n.strokeStyle=bw[o[N][3]],n.beginPath(),n.moveTo(Y[0],Y[1]),n.lineTo(Q[0],Q[1]),n.stroke()}n.globalAlpha=1,n.fillStyle="#ff5040";for(const N of i.missiles){if(Math.abs(N.x-p)>S*.6||Math.abs(N.z-M)>S*.6)continue;const Y=x(N.x,N.y,N.z);n.beginPath(),n.arc(Y[0],Y[1],L*2,0,Math.PI*2),n.fill()}const G=x(i.pos.x,i.pos.y,i.pos.z),H=i.vel,B=Math.max(1,Math.hypot(H.x,H.y,H.z)),$=x(i.pos.x+H.x/B*S*.08,i.pos.y+H.y/B*S*.08,i.pos.z+H.z/B*S*.08);n.strokeStyle="#4ade80",n.lineWidth=L*2,n.beginPath(),n.moveTo(G[0],G[1]),n.lineTo($[0],$[1]),n.stroke(),n.fillStyle="#4ade80",n.beginPath(),n.arc(G[0],G[1],L*3.2,0,Math.PI*2),n.fill()}}const $d=["VIPER-1","EAGLE-2","GHOST-3","TITAN-4","HAWK-5","FALCON-6","RAVEN-7","SHADOW-8","VALKYRIE-9","OMEGA-10"],Aw=[["ALPHA",[0,1,2],"V"],["BRAVO",[3,4],"ECHELON"],["CHARLIE",[5,6,7],"LINE"],["DELTA",[8,9],"TRAIL"]],Kd=700,Rw=3600,Zd=2200,Cw=180,Pw=.35/40;class Lw{constructor(t,e,i){this.id=t,this.callsign=e,this.hue=i,this.pos=new T,this.heading=0,this.bank=0,this.alive=!0,this.downTimer=0,this.model=new sl(i)}}const Jd=new Vi(0,0,0,"YXZ");class Dw{constructor(t){this.jets=[],this.flights=[],this.active=0;let e=35e3;this.rand=()=>(e=e*16807%2147483647,e/2147483647);for(let i=0;i<$d.length;i++){const n=new Lw(i,$d[i],i*36%360);t.add(n.model.group),this.jets.push(n)}for(const[i,n,a]of Aw)this.flights.push({name:i,ids:n,style:a,track:[0,0,0,0],station:[0,0],wp:0,retask:0,m:[]})}get callsign(){return this.jets[this.active].callsign}reset(t,e){this.active=0;for(const i of this.jets)i.alive=!0,i.downTimer=0;for(const i of this.flights){this.pickStation(i,t,e);const n=this.members(i);if(n.length===0)continue;const a=n[0];a.pos.set(i.track[0],cr*Ie,i.track[1]),a.heading=Math.atan2(i.track[2]-i.track[0],-(i.track[3]-i.track[1]));for(let r=1;r<n.length;r++)this.slot(a,r-1,i.style,n[r].pos),n[r].heading=a.heading}}members(t){const e=t.m;e.length=0;for(let i=0;i<t.ids.length;i++){const n=t.ids[i];n!==this.active&&this.jets[n].alive&&e.push(this.jets[n])}return e}pickStation(t,e,i){const n=e/pt+Gt/2,a=i/pt+Xt/2;let r=0,o=0,l=!1;for(let u=0;u<400&&!l;u++){o=700+this.rand()*(Xt-1300);const d=Et.borderX(o),g=Math.max(Mi(o)+600,d-2600),v=Math.min(Gt-900,d+700);r=g+this.rand()*(v-g),l=Math.hypot(r-n,o-a)>Zd+300;for(const m of this.flights){if(m===t||m.retask===0)continue;const p=m.station[0]/pt+Gt/2,M=m.station[1]/pt+Xt/2;Math.hypot(r-p,o-M)<1200&&(l=!1)}}l||(o=700+this.rand()*(Xt-1300),r=n>Gt/2?Mi(o)+900:Gt-1200);const c=this.rand()*Math.PI,h=Math.cos(c)*Kd,f=Math.sin(c)*Kd;t.track=[Te(r+h),we(o+f),Te(r-h),we(o-f)],t.station=[Te(r),we(o)],t.wp=0,t.retask=Rw+Math.floor(this.rand()*1200)}slot(t,e,i,n){let a,r;if(i==="ECHELON")a=(e+1)*60,r=(e+1)*60;else if(i==="LINE")a=0,r=(e%2===0?-1:1)*(Math.floor(e/2)+1)*80;else if(i==="TRAIL")a=(e+1)*90,r=0;else{const h=Math.floor(e/2)+1;a=h*70,r=(e%2===0?-1:1)*h*62}const o=Math.sin(t.heading),l=-Math.cos(t.heading),c=pt*.5;n.set(t.pos.x-o*a*c-l*r*c,t.pos.y,t.pos.z-l*a*c+o*r*c)}step(t,e){for(const r of this.jets){if(r.alive||r.id===this.active||--r.downTimer>0)continue;r.alive=!0;const o=this.flights.find(u=>u.ids.includes(r.id)),l=o?this.members(o).find(u=>u!==r):void 0,c=l?l.heading:0,h=l?l.pos.x:o?o.track[0]:0,f=l?l.pos.z:o?o.track[1]:0;r.pos.set(h-Math.sin(c)*520*pt*.5,cr*Ie,f+Math.cos(c)*520*pt*.5),r.heading=c}const i=Aa*hn,n=Pw*hn,a=Iw;for(const r of this.flights){const o=this.members(r);if(o.length===0)continue;r.retask--,(r.retask<=0||Math.hypot(r.station[0]-t,r.station[1]-e)<Zd*pt)&&this.pickStation(r,t,e);const l=o[0],c=r.track[r.wp*2],h=r.track[r.wp*2+1];Math.hypot(c-l.pos.x,h-l.pos.z)<90*pt*3&&(r.wp=1-r.wp);let u=Math.atan2(c-l.pos.x,-(h-l.pos.z))-l.heading;u=((u+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;const d=Math.max(-n,Math.min(n,u));l.heading+=d,l.bank+=(Math.max(-1,Math.min(1,d/n))*.9-l.bank)*.05,l.pos.x+=Math.sin(l.heading)*i*Ct,l.pos.z-=Math.cos(l.heading)*i*Ct,l.pos.y+=(cr*Ie-l.pos.y)*.004;for(let g=1;g<o.length;g++){const v=o[g];this.slot(l,g-1,r.style,a),v.pos.x+=Math.sin(l.heading)*i*Ct,v.pos.z-=Math.cos(l.heading)*i*Ct,v.pos.lerp(a,.02);let m=l.heading-v.heading;m=((m+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,v.heading+=m*.08,v.bank+=(l.bank-v.bank)*.08}}}downActive(){const t=this.jets[this.active];t.alive=!1,t.downTimer=Cw}nextAlive(t=1){for(let e=1;e<=this.jets.length;e++){const i=(this.active+e*t+this.jets.length*10)%this.jets.length;if(this.jets[i].alive)return i}return this.active}switchTo(t,e,i){const n=this.jets[this.active];n.pos.copy(e),n.heading=i,n.bank=0,this.active=t}sync(t,e){for(const i of this.jets){if(i.id===this.active)continue;const n=i.alive;i.model.group.visible=n,n&&(i.model.group.position.copy(i.pos),Jd.set(0,-i.heading,-i.bank),i.model.group.rotation.copy(Jd),i.model.setFlame(.7,!1,e/60),i.model.setNight(t,e+i.id*13))}}}const Iw=new T,je=420,jd=6*pt*1.5,Uw=1800,Qd=2.5,Nw=14;class Fw{constructor(){this.px=new Float32Array(je),this.py=new Float32Array(je),this.pz=new Float32Array(je),this.born=new Float64Array(je),this.head=0,this.count=0,this.geo=new ve,this.pos=new he(new Float32Array(je*2*3),3),this.col=new he(new Float32Array(je*2*4),4),this.geo.setAttribute("position",this.pos),this.geo.setAttribute("color",this.col);const t=new Uint16Array((je-1)*6);for(let e=0;e<je-1;e++){const i=e*2;t.set([i,i+1,i+2,i+1,i+3,i+2],e*6)}this.geo.setIndex(new he(t,1)),this.mat=new ze({vertexColors:!0,transparent:!0,depthWrite:!1,side:Ge}),this.mesh=new St(this.geo,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1}clear(){this.count=0,this.head=0,this.geo.setDrawRange(0,0)}record(t,e){if(this.count>0){const i=(this.head-1+je)%je,n=t.x-this.px[i],a=t.y-this.py[i],r=t.z-this.pz[i];if(n*n+a*a+r*r<jd*jd)return}this.px[this.head]=t.x,this.py[this.head]=t.y,this.pz[this.head]=t.z,this.born[this.head]=e,this.head=(this.head+1)%je,this.count=Math.min(je,this.count+1)}update(t,e,i,n){const a=this.count;if(a<1){this.geo.setDrawRange(0,0);return}const r=this.pos.array,o=this.col.array,l=1-.8*n;let c=0,h=e.x,f=e.y,u=e.z,d=0;for(let g=-1;g<a;g++){let v,m,p,M;if(g<0)v=e.x,m=e.y,p=e.z,M=0;else{const Y=(this.head-1-g+je*2)%je;v=this.px[Y],m=this.py[Y],p=this.pz[Y],M=i-this.born[Y]}const y=Math.max(0,1-M/Uw);d+=Math.hypot(v-h,m-f,p-u);let S=h-v,C=f-m,w=u-p;if(g<=0){const Y=(this.head-1+je)%je;S=e.x-this.px[Y],C=e.y-this.py[Y],w=e.z-this.pz[Y]}const E=t.x-v,A=t.y-m,D=t.z-p;let _=C*D-w*A,x=w*E-S*D,L=S*A-C*E;const U=Math.hypot(_,x,L)||1,G=(Qd+(Nw-Qd)*(1-y))/2/U;_*=G,x*=G,L*=G,r[c*6]=v-_,r[c*6+1]=m-x,r[c*6+2]=p-L,r[c*6+3]=v+_,r[c*6+4]=m+x,r[c*6+5]=p+L;const H=m/Ie,B=.25+.75*Math.min(1,Math.max(0,(H-24e3)/6e3)),$=Math.min(1,Math.max(0,(d-60)/340)),N=(.14+.86*y)*.28*B*$;for(let Y=0;Y<2;Y++){const Q=(c*2+Y)*4;o[Q]=l,o[Q+1]=l,o[Q+2]=l*1.02,o[Q+3]=N}if(h=v,f=m,u=p,c++,c>=je)break}this.pos.needsUpdate=!0,this.col.needsUpdate=!0,this.geo.setDrawRange(0,Math.max(0,(c-1)*6))}}class Ts{constructor(t,e){this.next=0,this.items=new Array(t);for(let i=0;i<t;i++)this.items[i]=e(i)}acquire(){const t=this.items.length;for(let e=0;e<t;e++){const i=(this.next+e)%t,n=this.items[i];if(!n.active)return this.next=(i+1)%t,n.active=!0,n}return null}acquireOrRecycle(){const t=this.acquire();if(t)return t;const e=this.items[this.next];return this.next=(this.next+1)%this.items.length,e.active=!0,e}countActive(){let t=0;for(let e=0;e<this.items.length;e++)this.items[e].active&&t++;return t}releaseAll(){for(let t=0;t<this.items.length;t++)this.items[t].active=!1}}class Ow{constructor(t,e){this.mesh=t,this.mat=e,this.active=!1,this.age=0,this.life=1,this.radius=1}}class zw{constructor(t){const e=new Be(1,16,10);this.pool=new Ts(24,()=>{const i=new ze({color:16752704,transparent:!0,depthWrite:!1,blending:nn}),n=new St(e,i);return n.visible=!1,t.add(n),new Ow(n,i)})}spawn(t,e,i,n,a=1.4){const r=this.pool.acquireOrRecycle();r.age=0,r.life=a,r.radius=n,r.mesh.position.set(t,e,i),r.mesh.visible=!0}update(t){const e=this.pool.items;for(let i=0;i<e.length;i++){const n=e[i];if(!n.active)continue;if(n.age+=t,n.age>=n.life){n.active=!1,n.mesh.visible=!1;continue}const a=n.age/n.life,r=n.radius*(.3+.7*Math.sqrt(a));n.mesh.scale.set(r,r,r),n.mat.opacity=1-a,n.mat.color.setRGB(1,.75-.45*a,.35-.3*a).multiplyScalar(3-2*a)}}clear(){for(const t of this.pool.items)t.active=!1,t.mesh.visible=!1}}const Bw=16,s0={guided:[236/255,232/255,224/255],unguided:[206/255,196/255,176/255],AGM:[255/255,214/255,150/255],AAM:[170/255,230/255,255/255]},kw={points:520,spacing:45,life:Om+900,width:3,widthOld:16,color:s0.guided,alpha:.8,minAngular:.0032};class Hw{constructor(t){this.slots=[];for(let e=0;e<Bw;e++){const i=new Lm(kw);t.add(i.mesh),this.slots.push({ribbon:i,owner:null,lastAge:0})}}clear(){for(const t of this.slots)t.owner=null,t.ribbon.clear()}track(t,e,i){let n=null;for(let a=0;a<this.slots.length;a++){const r=this.slots[a];if(r.owner===t){t.age<r.lastAge?r.owner=null:n=r;break}}if(!n){let a=null;for(let r=0;r<this.slots.length;r++){const o=this.slots[r];if(!o.owner&&((!a||o.ribbon.lastFrame<a.ribbon.lastFrame)&&(a=o),o.ribbon.faded(i))){a=o;break}}if(!a)return;n=a,n.owner=t,n.ribbon.clear(),n.ribbon.setColor(s0[e])}n.lastAge=t.age,n.ribbon.record(t.pos,i)}release(){for(const t of this.slots)t.owner&&!t.owner.active&&(t.owner=null)}update(t,e,i){const n=1-.75*i;for(const a of this.slots)a.ribbon.update(t,e,n)}}const dr={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class Cs{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Gw=new du(-1,1,1,-1,0,1);class Vw extends ve{constructor(){super(),this.setAttribute("position",new me([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new me([0,2,0,0,2,0],2))}}const Ww=new Vw;class gl{constructor(t){this._mesh=new St(Ww,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,Gw)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class a0 extends Cs{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof Se?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Bi.clone(t.uniforms),this.material=new Se({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new gl(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class tp extends Cs{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){const n=t.getContext(),a=t.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,o;this.inverse?(r=0,o=1):(r=1,o=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(n.REPLACE,n.REPLACE,n.REPLACE),a.buffers.stencil.setFunc(n.ALWAYS,r,4294967295),a.buffers.stencil.setClear(o),a.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(n.EQUAL,1,4294967295),a.buffers.stencil.setOp(n.KEEP,n.KEEP,n.KEEP),a.buffers.stencil.setLocked(!0)}}class Xw extends Cs{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class Yw{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const i=t.getSize(new at);this._width=i.width,this._height=i.height,e=new Ii(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:sn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new a0(dr),this.copyPass.material.blending=ti,this.clock=new Ky}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let i=!1;for(let n=0,a=this.passes.length;n<a;n++){const r=this.passes[n];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(n),r.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),r.needsSwap){if(i){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}tp!==void 0&&(r instanceof tp?i=!0:r instanceof Xw&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new at);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const i=this._width*this._pixelRatio,n=this._height*this._pixelRatio;this.renderTarget1.setSize(i,n),this.renderTarget2.setSize(i,n);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(i,n)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}const wo={defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new at},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new zt},cameraProjectionMatrixInverse:{value:new zt},cameraWorldMatrix:{value:new zt},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new T(-1,-1,-1)},sceneBoxMax:{value:new T(1,1,1)}},vertexShader:`

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
		}`},Eo={defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
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

		}`},yc={uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
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
		}`};function qw(s=5){const t=Math.floor(s)%2===0?Math.floor(s)+1:Math.floor(s),e=$w(t),i=e.length,n=new Uint8Array(i*4);for(let r=0;r<i;++r){const o=e[r],l=2*Math.PI*o/i,c=new T(Math.cos(l),Math.sin(l),0).normalize();n[r*4]=(c.x*.5+.5)*255,n[r*4+1]=(c.y*.5+.5)*255,n[r*4+2]=127,n[r*4+3]=255}const a=new vu(n,t,t);return a.wrapS=Pn,a.wrapT=Pn,a.needsUpdate=!0,a}function $w(s){const t=Math.floor(s)%2===0?Math.floor(s)+1:Math.floor(s),e=t*t,i=Array(e).fill(0);let n=Math.floor(t/2),a=t-1;for(let r=1;r<=e;){if(n===-1&&a===t?(a=t-2,n=0):(a===t&&(a=0),n<0&&(n=t-1)),i[n*t+a]!==0){a-=2,n++;continue}else i[n*t+a]=r++;a++,n--}return i}const bo={defines:{SAMPLES:16,SAMPLE_VECTORS:r0(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new at},cameraProjectionMatrixInverse:{value:new zt},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
		}`};function r0(s,t,e){const i=Kw(s,t,e);let n="vec3[SAMPLES](";for(let a=0;a<s;a++){const r=i[a];n+=`vec3(${r.x}, ${r.y}, ${r.z})${a<s-1?",":")"}`}return n}function Kw(s,t,e){const i=[];for(let n=0;n<s;n++){const a=2*Math.PI*t*n/s,r=Math.pow(n/(s-1),e);i.push(new T(Math.cos(a),Math.sin(a),r))}return i}class Zw{constructor(t=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let e=0;e<256;e++)this.p[e]=Math.floor(t.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(t,e,i){return t[0]*e+t[1]*i}dot3(t,e,i,n){return t[0]*e+t[1]*i+t[2]*n}dot4(t,e,i,n,a){return t[0]*e+t[1]*i+t[2]*n+t[3]*a}noise(t,e){let i,n,a;const r=.5*(Math.sqrt(3)-1),o=(t+e)*r,l=Math.floor(t+o),c=Math.floor(e+o),h=(3-Math.sqrt(3))/6,f=(l+c)*h,u=l-f,d=c-f,g=t-u,v=e-d;let m,p;g>v?(m=1,p=0):(m=0,p=1);const M=g-m+h,y=v-p+h,S=g-1+2*h,C=v-1+2*h,w=l&255,E=c&255,A=this.perm[w+this.perm[E]]%12,D=this.perm[w+m+this.perm[E+p]]%12,_=this.perm[w+1+this.perm[E+1]]%12;let x=.5-g*g-v*v;x<0?i=0:(x*=x,i=x*x*this.dot(this.grad3[A],g,v));let L=.5-M*M-y*y;L<0?n=0:(L*=L,n=L*L*this.dot(this.grad3[D],M,y));let U=.5-S*S-C*C;return U<0?a=0:(U*=U,a=U*U*this.dot(this.grad3[_],S,C)),70*(i+n+a)}noise3d(t,e,i){let n,a,r,o;const c=(t+e+i)*.3333333333333333,h=Math.floor(t+c),f=Math.floor(e+c),u=Math.floor(i+c),d=1/6,g=(h+f+u)*d,v=h-g,m=f-g,p=u-g,M=t-v,y=e-m,S=i-p;let C,w,E,A,D,_;M>=y?y>=S?(C=1,w=0,E=0,A=1,D=1,_=0):M>=S?(C=1,w=0,E=0,A=1,D=0,_=1):(C=0,w=0,E=1,A=1,D=0,_=1):y<S?(C=0,w=0,E=1,A=0,D=1,_=1):M<S?(C=0,w=1,E=0,A=0,D=1,_=1):(C=0,w=1,E=0,A=1,D=1,_=0);const x=M-C+d,L=y-w+d,U=S-E+d,G=M-A+2*d,H=y-D+2*d,B=S-_+2*d,$=M-1+3*d,N=y-1+3*d,Y=S-1+3*d,Q=h&255,st=f&255,Bt=u&255,Kt=this.perm[Q+this.perm[st+this.perm[Bt]]]%12,K=this.perm[Q+C+this.perm[st+w+this.perm[Bt+E]]]%12,et=this.perm[Q+A+this.perm[st+D+this.perm[Bt+_]]]%12,vt=this.perm[Q+1+this.perm[st+1+this.perm[Bt+1]]]%12;let lt=.6-M*M-y*y-S*S;lt<0?n=0:(lt*=lt,n=lt*lt*this.dot3(this.grad3[Kt],M,y,S));let At=.6-x*x-L*L-U*U;At<0?a=0:(At*=At,a=At*At*this.dot3(this.grad3[K],x,L,U));let bt=.6-G*G-H*H-B*B;bt<0?r=0:(bt*=bt,r=bt*bt*this.dot3(this.grad3[et],G,H,B));let kt=.6-$*$-N*N-Y*Y;return kt<0?o=0:(kt*=kt,o=kt*kt*this.dot3(this.grad3[vt],$,N,Y)),32*(n+a+r+o)}noise4d(t,e,i,n){const a=this.grad4,r=this.simplex,o=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20;let h,f,u,d,g;const v=(t+e+i+n)*l,m=Math.floor(t+v),p=Math.floor(e+v),M=Math.floor(i+v),y=Math.floor(n+v),S=(m+p+M+y)*c,C=m-S,w=p-S,E=M-S,A=y-S,D=t-C,_=e-w,x=i-E,L=n-A,U=D>_?32:0,G=D>x?16:0,H=_>x?8:0,B=D>L?4:0,$=_>L?2:0,N=x>L?1:0,Y=U+G+H+B+$+N,Q=r[Y][0]>=3?1:0,st=r[Y][1]>=3?1:0,Bt=r[Y][2]>=3?1:0,Kt=r[Y][3]>=3?1:0,K=r[Y][0]>=2?1:0,et=r[Y][1]>=2?1:0,vt=r[Y][2]>=2?1:0,lt=r[Y][3]>=2?1:0,At=r[Y][0]>=1?1:0,bt=r[Y][1]>=1?1:0,kt=r[Y][2]>=1?1:0,ae=r[Y][3]>=1?1:0,$t=D-Q+c,F=_-st+c,$e=x-Bt+c,Yt=L-Kt+c,Zt=D-K+2*c,Pt=_-et+2*c,ue=x-vt+2*c,Lt=L-lt+2*c,P=D-At+3*c,b=_-bt+3*c,V=x-kt+3*c,J=L-ae+3*c,tt=D-1+4*c,Z=_-1+4*c,xt=x-1+4*c,ot=L-1+4*c,ht=m&255,qt=p&255,it=M&255,ut=y&255,It=o[ht+o[qt+o[it+o[ut]]]]%32,Ut=o[ht+Q+o[qt+st+o[it+Bt+o[ut+Kt]]]]%32,_t=o[ht+K+o[qt+et+o[it+vt+o[ut+lt]]]]%32,Jt=o[ht+At+o[qt+bt+o[it+kt+o[ut+ae]]]]%32,Ot=o[ht+1+o[qt+1+o[it+1+o[ut+1]]]]%32;let ie=.6-D*D-_*_-x*x-L*L;ie<0?h=0:(ie*=ie,h=ie*ie*this.dot4(a[It],D,_,x,L));let O=.6-$t*$t-F*F-$e*$e-Yt*Yt;O<0?f=0:(O*=O,f=O*O*this.dot4(a[Ut],$t,F,$e,Yt));let ct=.6-Zt*Zt-Pt*Pt-ue*ue-Lt*Lt;ct<0?u=0:(ct*=ct,u=ct*ct*this.dot4(a[_t],Zt,Pt,ue,Lt));let q=.6-P*P-b*b-V*V-J*J;q<0?d=0:(q*=q,d=q*q*this.dot4(a[Jt],P,b,V,J));let j=.6-tt*tt-Z*Z-xt*xt-ot*ot;return j<0?g=0:(j*=j,g=j*j*this.dot4(a[Ot],tt,Z,xt,ot)),27*(h+f+u+d+g)}}class ji extends Cs{constructor(t,e,i,n,a,r,o){super(),this.width=i!==void 0?i:512,this.height=n!==void 0?n:512,this.clear=!0,this.camera=e,this.scene=t,this.output=0,this._renderGBuffer=!0,this._visibilityCache=new Map,this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=qw(),this.pdNoiseTexture=this.generateNoise(),this.gtaoRenderTarget=new Ii(this.width,this.height,{type:sn}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new Se({defines:Object.assign({},wo.defines),uniforms:Bi.clone(wo.uniforms),vertexShader:wo.vertexShader,fragmentShader:wo.fragmentShader,blending:ti,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Wy,this.normalMaterial.blending=ti,this.pdMaterial=new Se({defines:Object.assign({},bo.defines),uniforms:Bi.clone(bo.uniforms),vertexShader:bo.vertexShader,fragmentShader:bo.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new Se({defines:Object.assign({},Eo.defines),uniforms:Bi.clone(Eo.uniforms),vertexShader:Eo.vertexShader,fragmentShader:Eo.fragmentShader,blending:ti}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new Se({uniforms:Bi.clone(dr.uniforms),vertexShader:dr.vertexShader,fragmentShader:dr.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Wc,blendDst:Qa,blendEquation:Qi,blendSrcAlpha:Vc,blendDstAlpha:Qa,blendEquationAlpha:Qi}),this.blendMaterial=new Se({uniforms:Bi.clone(yc.uniforms),vertexShader:yc.vertexShader,fragmentShader:yc.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:qp,blendSrc:Wc,blendDst:Qa,blendEquation:Qi,blendSrcAlpha:Vc,blendDstAlpha:Qa,blendEquationAlpha:Qi}),this.fsQuad=new gl(null),this.originalClearColor=new gt,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),r!==void 0&&this.updateGtaoMaterial(r),o!==void 0&&this.updatePdMaterial(o)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(t,e){t!==void 0?(this.depthTexture=t,this.normalTexture=e,this._renderGBuffer=!1):(this.depthTexture=new mu,this.depthTexture.format=Es,this.depthTexture.type=ws,this.normalRenderTarget=new Ii(this.width,this.height,{minFilter:fi,magFilter:fi,type:sn,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);const i=this.normalTexture?1:0,n=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=i,this.gtaoMaterial.defines.DEPTH_SWIZZLING=n,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=i,this.pdMaterial.defines.DEPTH_SWIZZLING=n,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(t){t?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(t.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(t.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(t){t.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=t.radius),t.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=t.distanceExponent),t.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=t.thickness),t.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=t.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),t.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=t.scale),t.samples!==void 0&&t.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=t.samples,this.gtaoMaterial.needsUpdate=!0),t.screenSpaceRadius!==void 0&&(t.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=t.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(t){let e=!1;t.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=t.lumaPhi),t.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=t.depthPhi),t.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=t.normalPhi),t.radius!==void 0&&t.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=t.radius),t.radiusExponent!==void 0&&t.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=t.radiusExponent,e=!0),t.rings!==void 0&&t.rings!==this.pdRings&&(this.pdRings=t.rings,e=!0),t.samples!==void 0&&t.samples!==this.pdSamples&&(this.pdSamples=t.samples,e=!0),e&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=r0(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(t,e,i){switch(this._renderGBuffer&&(this.overrideVisibility(),this.renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this.renderPass(t,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.renderPass(t,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case ji.OUTPUT.Off:break;case ji.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=ti,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case ji.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=ti,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case ji.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=ti,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case ji.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:e);break;case ji.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=ti,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case ji.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=ti,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.renderPass(t,this.blendMaterial,this.renderToScreen?null:e);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}renderPass(t,e,i,n,a){t.getClearColor(this.originalClearColor);const r=t.getClearAlpha(),o=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,n!=null&&(t.setClearColor(n),t.setClearAlpha(a||0),t.clear()),this.fsQuad.material=e,this.fsQuad.render(t),t.autoClear=o,t.setClearColor(this.originalClearColor),t.setClearAlpha(r)}renderOverride(t,e,i,n,a){t.getClearColor(this.originalClearColor);const r=t.getClearAlpha(),o=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,n=e.clearColor||n,a=e.clearAlpha||a,n!=null&&(t.setClearColor(n),t.setClearAlpha(a||0),t.clear()),this.scene.overrideMaterial=e,t.render(this.scene,this.camera),this.scene.overrideMaterial=null,t.autoClear=o,t.setClearColor(this.originalClearColor),t.setClearAlpha(r)}setSize(t,e){this.width=t,this.height=e,this.gtaoRenderTarget.setSize(t,e),this.normalRenderTarget.setSize(t,e),this.pdRenderTarget.setSize(t,e),this.gtaoMaterial.uniforms.resolution.value.set(t,e),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(t,e),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}overrideVisibility(){const t=this.scene,e=this._visibilityCache;t.traverse(function(i){e.set(i,i.visible),(i.isPoints||i.isLine)&&(i.visible=!1)})}restoreVisibility(){const t=this.scene,e=this._visibilityCache;t.traverse(function(i){const n=e.get(i);i.visible=n}),e.clear()}generateNoise(t=64){const e=new Zw,i=t*t*4,n=new Uint8Array(i);for(let r=0;r<t;r++)for(let o=0;o<t;o++){const l=r,c=o;n[(r*t+o)*4]=(e.noise(l,c)*.5+.5)*255,n[(r*t+o)*4+1]=(e.noise(l+t,c)*.5+.5)*255,n[(r*t+o)*4+2]=(e.noise(l,c+t)*.5+.5)*255,n[(r*t+o)*4+3]=(e.noise(l+t,c+t)*.5+.5)*255}const a=new vu(n,t,t,Hi,un);return a.wrapS=Pn,a.wrapT=Pn,a.needsUpdate=!0,a}}ji.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};const Jw={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class jw extends Cs{constructor(){super();const t=Jw;this.uniforms=Bi.clone(t.uniforms),this.material=new Gy({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new gl(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},oe.getTransfer(this._outputColorSpace)===_e&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===$p?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Kp?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Zp?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===eu?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Jp?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===jp&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Qw extends Cs{constructor(t,e,i=null,n=null,a=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=i,this.clearColor=n,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new gt}render(t,e,i){const n=t.autoClear;t.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(a=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),t.autoClear=n}}const tE={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new gt(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Sa extends Cs{constructor(t,e,i,n){super(),this.strength=e!==void 0?e:1,this.radius=i,this.threshold=n,this.resolution=t!==void 0?new at(t.x,t.y):new at(256,256),this.clearColor=new gt(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new Ii(a,r,{type:sn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let f=0;f<this.nMips;f++){const u=new Ii(a,r,{type:sn});u.texture.name="UnrealBloomPass.h"+f,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);const d=new Ii(a,r,{type:sn});d.texture.name="UnrealBloomPass.v"+f,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),a=Math.round(a/2),r=Math.round(r/2)}const o=tE;this.highPassUniforms=Bi.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=n,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Se({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let f=0;f<this.nMips;f++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[f])),this.separableBlurMaterials[f].uniforms.invSize.value=new at(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=dr;this.copyUniforms=Bi.clone(h.uniforms),this.blendMaterial=new Se({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:nn,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new gt,this.oldClearAlpha=1,this.basic=new ze,this.fsQuad=new gl(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let i=Math.round(t/2),n=Math.round(e/2);this.renderTargetBright.setSize(i,n);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(i,n),this.renderTargetsVertical[a].setSize(i,n),this.separableBlurMaterials[a].uniforms.invSize.value=new at(1/i,1/n),i=Math.round(i/2),n=Math.round(n/2)}render(t,e,i,n,a){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();const r=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=i.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=Sa.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Sa.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(i),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=r}getSeperableBlurMaterial(t){const e=[];for(let i=0;i<t;i++)e.push(.39894*Math.exp(-.5*i*i/(t*t))/t);return new Se({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new at(.5,.5)},direction:{value:new at(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(t){return new Se({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}}Sa.BlurDirectionX=new at(1,0);Sa.BlurDirectionY=new at(0,1);const ep=.55,eE=.9,iE={uniforms:{tDiffuse:{value:null},uBlur:{value:0},uLines:{value:0},uTime:{value:0},uAspect:{value:1},uHeat:{value:0},uHeatPos:{value:new at(.5,.5)},uHeatDir:{value:new at(0,-.1)},uHeatWidth:{value:.02}},vertexShader:`
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
    }`};class nE{constructor(t,e,i,n=!1){this.ao=null;const a=t.getSize(new at);if(this.composer=new Yw(t),this.composer.addPass(new Qw(e,i)),!n){this.ao=new ji(e,i,a.x,a.y),this.ao.output=ji.OUTPUT.Default,this.ao.blendIntensity=.8,this.ao.updateGtaoMaterial({radius:2.5,distanceExponent:1.5,thickness:2,scale:1,samples:12,distanceFallOff:1,screenSpaceRadius:!1}),this.ao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:16});const r=this.ao;r.overrideVisibility=function(){const o=this._visibilityCache;this.scene.traverse(l=>{o.set(l,l.visible);const c=l.material,h=!!c&&!Array.isArray(c)&&(c.transparent||c.depthWrite===!1);(l.isPoints||l.isLine||h)&&(l.visible=!1)})},this.composer.addPass(this.ao)}this.bloom=new Sa(new at(a.x/2,a.y/2),ep,.45,.92),this.composer.addPass(this.bloom),this.speed=new a0(iE),this.speed.uniforms.uAspect.value=a.x/a.y,this.composer.addPass(this.speed),this.composer.addPass(new jw)}setPixelRatio(t){this.composer.setPixelRatio(t)}setBloom(t){this.bloom.enabled=t}setAO(t){this.ao&&(this.ao.enabled=t)}setNight(t){this.bloom.strength=t?eE:ep}setMotion(t){const e=this.speed.uniforms;e.uBlur.value=t.blur,e.uLines.value=t.lines,e.uTime.value=t.time,e.uHeat.value=t.heat,e.uHeatPos.value.copy(t.heatPos),e.uHeatDir.value.copy(t.heatDir),e.uHeatWidth.value=t.heatWidth,this.speed.enabled=t.blur>.002||t.lines>.002||t.heat>.001}resize(t,e){this.composer.setSize(t,e),this.bloom.resolution.set(t/2,e/2),this.speed.uniforms.uAspect.value=t/e}render(){this.composer.render()}}const ip=[15088700,16092200,16112700,4636240,3968230,5261e3,10506450],np=60,sE=15,aE=13,sp=6,rE=45,ap=[.3*.5*pt*60,-.1*.5*pt*60],na=5,oE=40;class lE{constructor(){this.group=new hi,this.pos=new T,this.vel=new T,this.canopy=new hi,this.age=0,this.freefall=np,this.landed=!1,this.landedFor=0,this.active=!1,this.sink=sp;const t=Math.PI*2/ip.length;ip.forEach((l,c)=>{const h=new St(new Be(na,6,8,c*t,t,0,Math.PI*.42),new be({color:l,emissive:l,emissiveIntensity:.25,side:Ge}));h.scale.set(1,.65,1),this.canopy.add(h)});const e=new St(new ii(na*.97,na*.97,.15,28,1,!0),new be({color:16448250,side:Ge}));e.position.y=na*.65*Math.cos(Math.PI*.42),this.canopy.add(e),this.canopy.position.y=7,this.group.add(this.canopy);const i=[],n=7+e.position.y;for(let l=0;l<14;l++){const c=l/14*Math.PI*2;i.push(Math.cos(c)*na*.95,n,Math.sin(c)*na*.95,0,1.2,0)}const a=new ve;a.setAttribute("position",new he(new Float32Array(i),3)),this.cords=new Hy(a,new _u({color:14540253})),this.group.add(this.cords);const r=new St(new ii(.28,.24,1.3,8),new be({color:5925434}));r.position.y=.6;const o=new St(new Be(.22,10,8),new be({color:15790320}));o.position.y=1.45,this.group.add(r,o),this.seat=new St(new ii(.45,.45,1.6,6),new be({color:3947580})),this.seat.position.y=.6,this.group.add(this.seat),this.group.visible=!1}get chuteOpen(){return this.age>this.freefall}eject(t,e){this.pos.copy(t),this.vel.set(e.x*.6,35,e.z*.6),this.freefall=t.y/Ie>12e3?np:sE,this.age=0,this.landed=!1,this.landedFor=0,this.active=!0,this.group.visible=!0}step(t){if(this.active){if(this.age++,this.landed){this.landedFor++;return}this.chuteOpen?(this.age===this.freefall+1&&(this.sink=Math.max(sp,(this.pos.y-t)/aE)),this.vel.x+=(ap[0]-this.vel.x)*.03,this.vel.z+=(ap[1]-this.vel.z)*.03,this.pos.y-=this.sink*Ct):(this.vel.x*=.97,this.vel.z*=.97,this.vel.y*=.9,this.pos.y+=this.vel.y*Ct-rE*Ct*Math.min(1,this.age/30)),this.pos.x+=this.vel.x*Ct,this.pos.z+=this.vel.z*Ct,this.pos.y<=t&&(this.pos.y=t,this.landed=!0)}}sync(){if(!this.active)return;this.group.position.copy(this.pos);const t=this.chuteOpen?Math.min(1,(this.age-this.freefall)/oE):0,e=this.landed?1:t*(1.15-.15*Math.cos(t*Math.PI));this.canopy.scale.set(e||.001,(this.landed?.25:e)||.001,e||.001),this.canopy.visible=t>0,this.cords.visible=t>.6&&!this.landed,this.seat.visible=!this.chuteOpen,this.group.rotation.z=this.landed?0:Math.sin(this.age*.035)*.12*t,this.group.rotation.x=this.landed?0:Math.sin(this.age*.027+1)*.08*t,this.landed?this.canopy.position.set(4,.6,0):this.canopy.position.set(0,7,0)}hide(){this.active=!1,this.group.visible=!1}}const To=1400;class cE{constructor(t){this.index=t,this.active=!1,this.pos=new T,this.age=0,this.life=1,this.size0=1,this.size1=1}}const rp=new zt,hE=new Ei,uE=new T,Sc=new zt().makeScale(0,0,0);class fE{constructor(){this.pool=new Ts(To,e=>new cE(e)),this.tmpColor=new gt;const t=new be({color:16777215,transparent:!0,opacity:.8,depthWrite:!1});this.mesh=new Gi(new Su(1,1),t,To),this.mesh.instanceMatrix.setUsage(Rn),this.mesh.frustumCulled=!1;for(let e=0;e<To;e++)this.mesh.setMatrixAt(e,Sc),this.mesh.setColorAt(e,this.tmpColor.setRGB(1,1,1))}emit(t,e,i,n,a,r,o){this.emitRGB(t,e,i,n,a,r,o,o,o*.98)}emitRGB(t,e,i,n,a,r,o,l,c){const h=this.pool.acquireOrRecycle();h.pos.set(t,e,i),h.age=0,h.life=n,h.size0=a,h.size1=r;const f=h.index;this.mesh.setColorAt(f,this.tmpColor.setRGB(o,l,c)),this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}update(t){const e=this.pool.items;for(let i=0;i<e.length;i++){const n=e[i];if(!n.active)continue;if(n.age+=t,n.age>=n.life){n.active=!1,this.mesh.setMatrixAt(i,Sc);continue}const a=n.age/n.life,r=(n.size0+(n.size1-n.size0)*Math.sqrt(a))*(a>.8?(1-a)/.2:1);n.pos.y+=1.5*t,rp.compose(n.pos,hE,uE.set(r,r,r)),this.mesh.setMatrixAt(i,rp)}this.mesh.instanceMatrix.needsUpdate=!0}clear(){this.pool.releaseAll();for(let t=0;t<To;t++)this.mesh.setMatrixAt(t,Sc);this.mesh.instanceMatrix.needsUpdate=!0}}const dE=1400*pt,pE=60;class mE{constructor(){this.on=!1,this.sel=null,this.cd=0,this.cands=[]}candidates(t,e){const i=this.cands;i.length=0;for(const n of e.launchers)n.hp>0&&Math.hypot(n.x-t.x,n.z-t.z)<dE&&i.push(n);return i.sort((n,a)=>Math.atan2(n.z-t.z,n.x-t.x)-Math.atan2(a.z-t.z,a.x-t.x)),i}step(t,e){if(this.cd>0&&this.cd--,!this.on||!t)return;const i=this.candidates(t,e);if(this.sel&&i.includes(this.sel))return;let n=null,a=1/0;for(const r of i){const o=Math.hypot(r.x-t.x,r.z-t.z);o<a&&(a=o,n=r)}this.sel=n}pick(t,e,i){const n=this.candidates(e,i);if(n.length===0)return;const a=this.sel?n.indexOf(this.sel):-1;this.sel=a>=0?n[(a+t+n.length)%n.length]:n[0]}fire(t,e,i){const n=this.sel;return!n||n.hp<=0?"P2: NO LAUNCHER PICKED":n.missiles<=0?`P2: ${n.name} IS EMPTY`:this.cd>0?"P2: RELOADING":!e||Math.hypot(e.pos.x-n.x,e.pos.z-n.z)>n.range?`P2: JET OUT OF ${n.name} RANGE`:i.launch(n,e,t)?(this.cd=pE,`P2: ${n.name} FIRES ${t?"GUIDED":"UNGUIDED"}`):"P2: SKY FULL"}status(t){const e=this.sel;if(!e)return"";const n=Math.hypot(t.x-e.x,t.z-e.z)<=e.range?this.cd===0&&e.missiles>0?"READY":"RELOADING":"OUT OF RANGE";return`P2  ${e.name}  ${e.missiles}  ${n}`}}const Ao=Nh*4,op=9.81;class lp{constructor(t){this.index=t,this.active=!1,this.pos=new T,this.vel=new T,this.age=0,this.salvo=0}get heat(){return Math.max(0,1-this.age/Bm)}}const cp=new zt,gE=new Ei,hp=new T,Ro=new zt().makeScale(0,0,0),sa=new T,rn=new T,Co=new T(0,1,0);class vE{constructor(t){this.flares=new Ts(Ao,e=>new lp(e)),this.flareCd=0,this.chaffCd=0,this.chaff=new Ts(_d*3,e=>new lp(e)),this.chaffSalvo=0,this.ecmCd=0,this.ecmFlash=0,this.salvo=0,this.salvoHeat=0,this.mesh=new Gi(new Be(1,10,8),new ze({color:16776160,transparent:!0,blending:nn,depthWrite:!1}),Ao),this.mesh.material.color.multiplyScalar(5),this.mesh.instanceMatrix.setUsage(Rn),this.mesh.frustumCulled=!1;for(let e=0;e<Ao;e++)this.mesh.setMatrixAt(e,Ro);t&&t.add(this.mesh)}reset(){this.flares.releaseAll(),this.flareCd=0,this.chaffCd=0,this.chaff.releaseAll(),this.ecmCd=0,this.ecmFlash=0,this.salvoHeat=0;for(let t=0;t<Ao;t++)this.mesh.setMatrixAt(t,Ro);this.mesh.instanceMatrix.needsUpdate=!0}fireFlares(t,e){if(this.flareCd>0)return!1;this.flareCd=zm(),this.salvo++,sa.copy(e).normalize(),rn.crossVectors(sa,Co),rn.lengthSq()<1e-6&&rn.set(1,0,0),rn.normalize();for(let i=0;i<Nh;i++){const n=this.flares.acquireOrRecycle(),a=i%2*2-1;n.pos.copy(t).addScaledVector(sa,-12-i*3),n.vel.copy(e).multiplyScalar(.55).addScaledVector(rn,a*(14+i*4)).addScaledVector(Co,-6-i),n.age=0,n.salvo=this.salvo}return!0}fireChaff(t,e){if(this.chaffCd>0)return!1;this.chaffCd=km(),this.chaffSalvo++,sa.copy(e).normalize(),rn.crossVectors(sa,Co),rn.lengthSq()<1e-6&&rn.set(1,0,0),rn.normalize();for(let i=0;i<_d;i++){const n=this.chaff.acquireOrRecycle(),a=i%2*2-1;n.pos.copy(t).addScaledVector(sa,-15-i*5),n.vel.copy(e).multiplyScalar(.25).addScaledVector(rn,a*(10+i*5)).addScaledVector(Co,4-i*2),n.age=0,n.salvo=this.chaffSalvo}return!0}fireEcm(t,e,i){if(this.ecmCd>0)return-1;this.ecmCd=Hm(),this.ecmFlash=40;let n=0;for(let a=0;a<e.length;a++){const r=e[a];!r.active||!r.tracking||r.seeker!=="RADAR"||r.pos.distanceTo(t)>=fS||i()>=dS()||(r.falseTrack.copy(r.pos).addScaledVector(r.dir,pS).add(hp.set((i()*2-1)*oc,(i()*2-1)*oc*.4,(i()*2-1)*oc)),r.seduce(r.falseTrack),n++)}return n}step(t,e,i){this.flareCd>0&&this.flareCd--,this.chaffCd>0&&this.chaffCd--,this.stepChaff(t,e,i),this.ecmCd>0&&this.ecmCd--,this.ecmFlash>0&&this.ecmFlash--;const n=this.flares.items;let a=null;for(let o=0;o<n.length;o++){const l=n[o];if(!l.active)continue;if(l.age++,l.age>Bm+30){l.active=!1,this.mesh.setMatrixAt(o,Ro);continue}l.vel.multiplyScalar(.985),l.vel.y-=op*.4*Ct,l.pos.addScaledVector(l.vel,Ct),l.heat>0&&(!a||l.heat>a.heat)&&(a=l);const c=.6+3.2*l.heat;cp.compose(l.pos,gE,hp.set(c,c,c)),this.mesh.setMatrixAt(o,l.heat>0?cp:Ro)}if(this.mesh.instanceMatrix.needsUpdate=!0,this.salvoHeat=a?a.heat:0,!a)return 0;let r=0;for(let o=0;o<e.length;o++){const l=e[o];if(!(!l.active||!l.tracking||l.seeker!=="IR")&&!(l.flareSalvoTried===a.salvo||l.climbShare<Md)&&!(l.pos.distanceTo(t)>=lS)&&(l.flareSalvoTried=a.salvo,i()<cS()*a.heat)){let c=a;const h=Math.floor(i()*Nh);let f=0;for(let u=0;u<n.length;u++){const d=n[u];d.active&&d.salvo===a.salvo&&(f===h&&(c=d),f++)}l.seduce(c.pos),r++}}return r}stepChaff(t,e,i){const n=this.chaff.items;let a=null;for(let o=0;o<n.length;o++){const l=n[o];if(l.active){if(l.age++,l.age>vd){l.active=!1;continue}l.vel.multiplyScalar(.96),l.vel.y-=op*.05*Ct,l.pos.addScaledVector(l.vel,Ct),(!a||l.salvo>a.salvo)&&(a=l)}}if(!a)return;const r=Math.max(0,1-a.age/vd);for(let o=0;o<e.length;o++){const l=e[o];!l.active||!l.tracking||l.seeker!=="RADAR"||l.chaffSalvoTried===a.salvo||l.climbShare<Md||l.pos.distanceTo(t)>=hS||(l.chaffSalvoTried=a.salvo,i()<uS()*r&&l.seduce(a.pos))}}get flareHeat(){return this.salvoHeat}}const Bh=I1*Aa,_E=Bh/(pt*60*Um),up=_E/F1,ME=40*pt,xE=new ui(22,.3,1.6),yE=new ii(.6,.45,9,8),SE=new ui(3.5,.2,1),wE=new Be(.7,8,6),fp=new be({color:11183286}),EE=new be({color:12499656}),bE=new ze({color:13793535});class TE{constructor(){this.mesh=new hi,this.x=0,this.z=0,this.y=0,this.heading=Math.PI,this.spotCd=0,this.alive=!0,this.respawn=0,this.wp=new Float64Array(6),this.wpCount=0;const t=new St(xE,fp);this.mesh.add(t);const e=new St(yE,EE);e.rotation.x=Math.PI/2,e.position.z=1,this.mesh.add(e);for(const n of[-1,1]){const a=new St(SE,fp);a.position.set(n*1.3,.9,5),a.rotation.z=n*.6,this.mesh.add(a)}const i=new St(wE,bE);i.position.set(0,-.6,-3.8),this.mesh.add(i),this.mesh.scale.setScalar(1.5)}reset(t,e){const i=600+t()*(Xt-1200),n=Mi(i)+400+t()*(Gt-600-Mi(i)-400);this.x=Te(n),this.z=we(i),this.y=(co+t()*(ud-co))*Ie,this.heading=-Math.PI/2,this.spotCd=Math.floor(t()*Uh),this.alive=!0,this.respawn=0,this.mesh.visible=!0,this.wpCount=0}respawnFromBorder(t){const e=600+t()*(Xt-1200);this.x=Te(Et.borderX(e)+120),this.z=we(e),this.y=(co+t()*(ud-co))*Ie,this.heading=-Math.PI/2,this.spotCd=Math.floor(t()*Uh),this.wpCount=0,this.alive=!0,this.mesh.visible=!0}newWaypoint(t,e,i){let n,a;if(t()<.5){const r=e[Math.floor(t()*e.length)];n=r.x+t()*600-300,a=r.y+t()*600-300}else a=500+t()*(Xt-1e3),n=Mi(a)+300+t()*(Gt-500-Mi(a)-300);this.wp[i*2]=Te(n),this.wp[i*2+1]=we(a)}step(t,e){if(this.wpCount===0){for(let l=0;l<3;l++)this.newWaypoint(t,e,l);this.wpCount=3}const i=this.wp[0],n=this.wp[1];Math.hypot(i-this.x,n-this.z)<ME&&(this.wp[0]=this.wp[2],this.wp[1]=this.wp[3],this.wp[2]=this.wp[4],this.wp[3]=this.wp[5],this.wpCount--);let r=Math.atan2(i-this.x,-(n-this.z))-this.heading;r=((r+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;const o=hn;this.heading+=Math.max(-up*o,Math.min(up*o,r)),this.x+=Math.sin(this.heading)*Bh*o*Ct,this.z-=Math.cos(this.heading)*Bh*o*Ct,this.spotCd>0&&this.spotCd--}syncMesh(){this.mesh.position.set(this.x,this.y,this.z),this.mesh.rotation.set(0,-this.heading,0)}}function AE(s){const t=[];for(let e=0;e<D1;e++){const i=new TE;s&&s.add(i.mesh),t.push(i)}return t}class dp{constructor(t,e,i,n,a,r,o){this.index=t,this.kind=e,this.x=i,this.y=n,this.z=a,this.phase=r,this.camouflaged=o,this.cooldown=0,this.seen=0,this.flash=0,this.range=e==="SAM"?b1:R1,this.missiles=e==="SAM"?rd:cd,this.hp=e==="SAM"?od:hd,this.seeker=e==="SAM"?"RADAR":"IR";const l=e==="SAM"?t+1:t-Ih+1;this.name=e==="SAM"?`SAM-${String(l).padStart(2,"0")}`:`TEL-${String(l).padStart(3,"0")}`}get visible(){return!this.camouflaged||this.seen>0||this.hp<=0}get armed(){return this.hp>0&&this.missiles>0}reset(t){this.cooldown=Math.floor(t()*Fm),this.missiles=this.kind==="SAM"?rd:cd,this.hp=this.kind==="SAM"?od:hd,this.seen=0,this.flash=0}}function RE(s,t,e){const i=[],n=[];let a=E1,r=0;for(;i.length<Ih&&r<2e5;){r++,r%4e3===0&&(a*=.9);const o=300+s()*(Xt-600),l=Mi(o)+260+s()*(Gt-300-Mi(o)-260);if(n.some(u=>Math.hypot(u.x-l,u.y-o)<a)||t.some(u=>Math.hypot(u.x-l,u.y-o)<u.r+140)||Et.nearRiver(l,o,70))continue;const c=Te(l),h=we(o),f=e(c,h);f<=.5||(n.push({x:l,y:o}),i.push(new dp(i.length,"SAM",c,f,h,s()*Math.PI*2,!1)))}for(r=0;i.length<Ih+A1&&r<4e5;){r++;const o=200+s()*(Xt-400),l=Mi(o)+150+s()*(Gt-200-Mi(o)-150);if(n.some(u=>Math.hypot(u.x-l,u.y-o)<C1)||t.some(u=>Math.hypot(u.x-l,u.y-o)<u.r+40))continue;const c=Te(l),h=we(o),f=e(c,h);f<=.5||(n.push({x:l,y:o}),i.push(new dp(i.length,"TEL",c,f,h,s()*Math.PI*2,s()<P1)))}return i}const qa=new Ae;class CE{constructor(t,e){this.telShown=[],this.greenOn=[],this.samUp=[],this.sams=e.filter(o=>o.kind==="SAM"),this.tels=e.filter(o=>o.kind==="TEL");const i=this.sams.length,n=this.tels.length,a=(o,l,c)=>{const h=new Gi(o,new be({color:l}),c);return h.frustumCulled=!1,t.add(h),h};this.pads=a(new ui(44,1.5,34),4212286,i),this.domes=a(new Be(6,14,8,0,Math.PI*2,0,Math.PI/2),12898002,i),this.faces=a(new ui(.6,5,7),59070,i),this.cans=a(new ui(3,8,3),5267006,i*4),this.bodies=a(new ui(3.4,2.6,13),5528634,n),this.cabs=a(new ui(3.4,3.2,3),3422760,n),this.tubes=a(new ii(.7,.7,10,8),9870466,n*2);for(let o=0;o<i;o++){const l=this.sams[o];this.put(this.pads,o,l.x,l.y+.6,l.z,l.phase,1),this.put(this.domes,o,l.x-10*Math.cos(l.phase),l.y+1.2,l.z+10*Math.sin(l.phase),0,1);for(let c=0;c<4;c++){const h=4+c%2*6,f=-5+Math.floor(c/2)*8,u=Math.cos(l.phase),d=Math.sin(l.phase);this.put(this.cans,o*4+c,l.x+h*u+f*d,l.y+5,l.z-h*d+f*u,l.phase,1)}}const r=o=>{const l=new ze({color:o});l.color.multiplyScalar(5);const c=new Gi(new Be(2.2,8,6),l,i);return c.frustumCulled=!1,c.visible=!1,t.add(c),c};this.beaconRed=r(16724520),this.beaconGreen=r(3997560);for(let o=0;o<i;o++){const l=this.sams[o];this.put(this.beaconRed,o,l.x-10*Math.cos(l.phase),l.y+9,l.z+10*Math.sin(l.phase),0,1),this.put(this.beaconGreen,o,l.x+16*Math.cos(l.phase),l.y+4,l.z-16*Math.sin(l.phase),0,1)}for(let o=0;o<i;o++)this.greenOn.push(!0);this.beaconRed.instanceMatrix.needsUpdate=!0,this.beaconGreen.instanceMatrix.needsUpdate=!0;for(let o=0;o<n;o++)this.telShown.push(!0);this.update(0,!0),this.pads.instanceMatrix.needsUpdate=!0,this.domes.instanceMatrix.needsUpdate=!0,this.cans.instanceMatrix.needsUpdate=!0}put(t,e,i,n,a,r,o,l=0){qa.position.set(i,n,a),qa.rotation.set(l,r,0,"YXZ"),qa.scale.setScalar(o),qa.updateMatrix(),t.setMatrixAt(e,qa.matrix)}setNight(t,e){if(this.beaconRed.visible=t&&Math.floor(e/20)%3===0,this.beaconGreen.visible=t,!t)return;let i=!1;for(let n=0;n<this.sams.length;n++){const a=this.sams[n],r=a.armed;r!==this.greenOn[n]&&(this.greenOn[n]=r,i=!0,this.put(this.beaconGreen,n,a.x+16*Math.cos(a.phase),a.y+4,a.z-16*Math.sin(a.phase),0,r?1:0))}i&&(this.beaconGreen.instanceMatrix.needsUpdate=!0)}update(t,e=!1){let i=!1;for(let a=0;a<this.sams.length;a++){const r=this.sams[a],o=r.hp>0;if(this.samUp[a]===o)continue;this.samUp[a]=o,i=!0;const l=o?1:0;this.put(this.domes,a,r.x-10*Math.cos(r.phase),r.y+1.2,r.z+10*Math.sin(r.phase),0,l);for(let c=0;c<4;c++){const h=4+c%2*6,f=-5+Math.floor(c/2)*8,u=Math.cos(r.phase),d=Math.sin(r.phase);this.put(this.cans,a*4+c,r.x+h*u+f*d,r.y+5,r.z-h*d+f*u,r.phase,l)}}i&&(this.domes.instanceMatrix.needsUpdate=!0,this.cans.instanceMatrix.needsUpdate=!0);for(let a=0;a<this.sams.length;a++){const r=this.sams[a],o=r.x-10*Math.cos(r.phase),l=r.z+10*Math.sin(r.phase),c=r.phase+t*.02;this.put(this.faces,a,o+Math.cos(c)*4,r.y+5,l-Math.sin(c)*4,c,r.hp>0?1:0)}this.faces.instanceMatrix.needsUpdate=!0;let n=e;for(let a=0;a<this.tels.length;a++){const r=this.tels[a],o=r.visible&&r.hp>0;if(o===this.telShown[a]&&!e)continue;this.telShown[a]=o,n=!0;const l=o?1:0,c=Math.cos(r.phase),h=Math.sin(r.phase);this.put(this.bodies,a,r.x,r.y+1.8,r.z,r.phase,l),this.put(this.cabs,a,r.x-7.5*h,r.y+2,r.z-7.5*c,r.phase,l);for(let f=0;f<2;f++){const u=f===0?-.9:.9;this.put(this.tubes,a*2+f,r.x+u*c+1.5*h,r.y+5,r.z-u*h+1.5*c,r.phase,l,-1)}}n&&(this.bodies.instanceMatrix.needsUpdate=!0,this.cabs.instanceMatrix.needsUpdate=!0,this.tubes.instanceMatrix.needsUpdate=!0)}}const PE=1.225,$a=9.81,LE=.25,DE=12e-5,IE=650,UE=45,NE=1500,FE=25,OE=.15,zE=.6*Aa,BE=60,pp=.996,xn=new T,wc=new T,Ec=new T,on=new T,aa=new T,Po=new T,bc=new T,kE=new T(0,1,0),mp=new Ei,HE=new ii(.25,.25,5.5,8),GE=new Be(.7,8,6),gp=new be({color:15461350}),VE=new be({color:15786184}),WE=new be({color:13158568}),o0=new ze({color:16752704});o0.color.multiplyScalar(4);const XE=new Be(1.6,10,8),l0=new ze({color:16751168,transparent:!0,opacity:.55,blending:nn,depthWrite:!1});l0.color.multiplyScalar(3);const YE=1/250,qE=new T;class $E{constructor(){this.active=!1,this.guided=!0,this.seeker="RADAR",this.pos=new T,this.vel=new T,this.dir=new T(0,1,0),this.mesh=new hi,this.age=0,this.speed=0,this.topSpeed=fd,this.climbFrames=dd,this.burnout=0,this.lockLost=!1,this.lostBy="",this.decoy=null,this.falseTrack=new T,this.decoyFrames=0,this.flareSalvoTried=-1,this.chaffSalvoTried=-1,this.launcher=-1,this.aLat=0,this.saturated=0,this.prevTgtVel=new T,this.body=new St(HE,gp),this.mesh.add(this.body),this.flame=new St(GE,o0),this.flame.position.y=-3.2,this.flame.scale.set(1.4,3,1.4);const t=new St(XE,l0);this.flame.add(t),this.mesh.add(this.flame),this.mesh.visible=!1}get trailGrey(){return this.guided?.92:.78}get motorOn(){return this.age<=this.burnout}get climbShare(){return Math.min(1,this.age/this.climbFrames)}get tracking(){return this.guided&&!this.lockLost&&this.decoy===null}launch(t,e,i,n,a,r,o,l){this.guided=r,this.seeker=r?o:"NONE",this.body.material=r?o==="IR"?VE:gp:WE,this.pos.set(t,e+3,i),this.age=0,this.topSpeed=fd*hn,this.speed=this.topSpeed*Ha,this.climbFrames=Math.max(dd,k1*(n.y/Ie)/cr),this.burnout=this.climbFrames+W1,this.lockLost=!1,this.lostBy="",this.decoy=null,this.decoyFrames=0,this.flareSalvoTried=-1,this.chaffSalvoTried=-1,this.launcher=l,this.aLat=0,this.saturated=0,this.prevTgtVel.copy(a);let c=this.climbFrames;for(let h=0;h<8;h++)bc.copy(n).addScaledVector(a,c*Ct),c=this.framesToCover(bc.distanceTo(this.pos));this.dir.copy(bc).sub(this.pos).normalize(),r||(this.burnout=c+V1),this.vel.copy(this.dir).multiplyScalar(this.speed),this.mesh.visible=!0,this.flame.visible=!0,this.syncMesh()}framesToCover(t){const e=this.climbFrames,i=this.topSpeed*Ct,n=i*(.35*e+.65*e/2);if(t>=n)return e+(t-n)/i;const a=.65*i/(2*e),r=.35*i;return(-r+Math.sqrt(r*r+4*a*t))/(2*a)}seduce(t){this.decoy=t,this.decoyFrames=0}step(t,e,i,n){if(this.age++,this.guided&&this.age>Om)return"expired";if(!this.guided)this.stepUnguided();else{const a=ya(this.pos.y)/PE,r=Math.max(LE,a),o=Math.min(H1*60*r*this.speed,FE*$a*r);if(on.set(0,0,0),this.decoy){if(this.decoyFrames++,this.decoyFrames>vS||this.pos.distanceTo(this.decoy)<gS)return"decoy";xn.copy(this.decoy).sub(this.pos).normalize(),KE(this.dir,xn,mS),this.vel.copy(this.dir).multiplyScalar(this.speed)}else if(!this.lockLost&&t&&e){xn.copy(t).sub(this.pos);const l=xn.length();if(aa.copy(xn).divideScalar(l),this.age>this.climbFrames){const c=(e.x-this.vel.x)*aa.x+(e.y-this.vel.y)*aa.y+(e.z-this.vel.z)*aa.z>0;(Math.acos(Math.min(1,this.dir.dot(aa)))>$1||c&&l<NE)&&(this.lockLost=!0,this.lostBy="gimbal")}if(!this.lockLost&&this.seeker==="RADAR"&&this.age>this.climbFrames){const c=xn.x,h=xn.z,f=Math.hypot(c,h),u=Math.hypot(e.x,e.z),d=f>0?Math.abs(e.x*c+e.z*h)/f:u;f>xS&&u>1&&e.y<-15&&d<_S*u&&n()<1-Math.pow(1-MS(),Ct)&&(this.lockLost=!0,this.lostBy="notch")}if(!this.lockLost){wc.copy(e).sub(this.vel),Ec.crossVectors(xn,wc).divideScalar(l*l);const c=-xn.dot(wc)/l;on.crossVectors(Ec,aa).multiplyScalar(q1*Math.max(c,50)),this.motorOn&&(on.y+=$a),on.addScaledVector(this.dir,-on.dot(this.dir));const h=on.length(),f=Math.max(1,e.length()),u=Ec.copy(e).sub(this.prevTgtVel).length()/(f*Ct),d=o/Math.max(1,this.speed),g=u>d&&l<IE;this.saturated=g?this.saturated+1:0,this.saturated>UE&&(this.lockLost=!0,this.lostBy="gimbal"),h>o&&on.multiplyScalar(o/h),this.prevTgtVel.copy(e)}}if(this.aLat=on.length(),this.decoy===null){if(this.motorOn)this.speed=this.topSpeed*(Ha+(1-Ha)*this.climbShare),this.vel.addScaledVector(on,Ct),this.vel.y-=$a*Ct,this.vel.setLength(this.speed);else{this.vel.addScaledVector(on,Ct),this.vel.y-=$a*Ct;let l=this.vel.length();const c=DE*a*l*l+OE*this.aLat*(this.aLat/Math.max(1,o));if(l=Math.max(0,l-c*Ct),this.vel.setLength(l),this.speed=l,this.flame.visible=!1,l<zE*hn)return"expired"}this.dir.copy(this.vel).divideScalar(Math.max(.001,this.speed))}}return this.pos.addScaledVector(this.vel,Ct),this.age>30&&this.pos.y<=i(this.pos.x,this.pos.z)?"ground":"none"}get armed(){return this.age>BE}stepUnguided(){this.age>this.burnout?(this.vel.x*=pp,this.vel.z*=pp,this.vel.y=Math.max(-400,this.vel.y-$a*Ct),this.speed=this.vel.length(),this.dir.copy(this.vel).divideScalar(Math.max(.001,this.speed)),this.flame.visible=!1):(this.speed=this.topSpeed*(Ha+(1-Ha)*this.climbShare),this.vel.copy(this.dir).multiplyScalar(this.speed))}syncMesh(t){this.mesh.position.copy(this.pos);const e=t?Math.min(60,Math.max(1.6,qE.copy(t).distanceTo(this.pos)*YE)):1.6;this.mesh.scale.setScalar(e),mp.setFromUnitVectors(kE,this.dir),this.mesh.quaternion.copy(mp)}hide(){this.active=!1,this.mesh.visible=!1,this.decoy=null}}function KE(s,t,e){if(Math.acos(Math.min(1,Math.max(-1,s.dot(t))))<=e){s.copy(t);return}Po.crossVectors(s,t),Po.lengthSq()<1e-10&&Po.set(1,0,0),s.applyAxisAngle(Po.normalize(),e)}const ZE=8;function Tc(s){let t=s|0;return()=>{t=t+1831565813|0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}class JE{constructor(t,e=2026){this.frame=0,this.hitThisFrame=!1,this.lastHitSeeker="",this.lastHitLauncher="",this.launchedThisFrame=0,this.decoyedThisFrame=0,this.painting=0,this.onBlast=null;const i=Tc(2026);this.cities=Et.cities,this.launchers=RE(i,this.cities,jt),this.meshes=t?new CE(t,this.launchers):null,this.drones=AE(t),this.missiles=new Ts(ZE,()=>{const n=new $E;return t&&t.add(n.mesh),n}),this.cm=new vE(t),this.rand=Tc(e),this.reset(e)}reset(t){this.rand=Tc(t);for(const e of this.launchers)e.reset(this.rand);for(const e of this.drones)e.reset(this.rand,this.cities);for(const e of this.missiles.items)e.hide();this.cm.reset(),this.frame=0}launch(t,e,i=null){const n=this.missiles.acquire();if(!n)return null;t.missiles--,t.flash=24,t.cooldown=Fm,t.seen=L1;const a=i===null?this.rand()<G1:i;return n.launch(t.x,t.y+12,t.z,e.pos,e.vel,a,t.seeker,t.index),this.launchedThisFrame++,n}airborne(){let t=0;const e=this.missiles.items;for(let i=0;i<e.length;i++)e[i].active&&t++;return t}nearestArmed(t,e,i){let n=null,a=i*i;for(let r=0;r<this.launchers.length;r++){const o=this.launchers[r];if(!o.armed)continue;const l=(o.x-t)*(o.x-t)+(o.z-e)*(o.z-e);l<a&&(a=l,n=o)}return n}step(t,e){globalThis.__fighterHold&&(e=!1),this.frame++,this.hitThisFrame=!1,this.launchedThisFrame=0,this.painting=0;const i=this.rand;if(t&&t.pos.y/Ie<x1)for(let r=0;r<this.launchers.length;r++){const o=this.launchers[r];o.camouflaged&&o.hp>0&&Math.hypot(o.x-t.pos.x,o.z-t.pos.z)<y1&&(o.seen=Math.max(o.seen,2))}let n=this.airborne();for(let r=0;r<this.drones.length;r++){const o=this.drones[r];if(!o.alive){o.respawn>0&&--o.respawn===0&&o.respawnFromBorder(i);continue}if(o.step(i,this.cities),!e||!t||o.spotCd>0||Math.hypot(t.pos.x-o.x,t.pos.z-o.z)>=U1||n>=ld)continue;const l=this.nearestArmed(t.pos.x,t.pos.z,N1);l&&this.launch(l,t)&&(n++,o.spotCd=Uh)}for(let r=0;r<this.launchers.length;r++){const o=this.launchers[r];o.seen>0&&o.seen--,o.flash>0&&o.flash--;const l=!!t&&o.armed&&(t.pos.x-o.x)**2+(t.pos.z-o.z)**2<o.range*o.range;if(l&&e&&this.painting++,o.cooldown>0){o.cooldown--;continue}!e||!l||n>=ld||i()<T1&&t&&this.launch(o,t)&&n++}this.decoyedThisFrame=t?this.cm.step(t.pos,this.missiles.items,i):this.cm.step(jE,this.missiles.items,i);const a=this.missiles.items;for(let r=0;r<a.length;r++){const o=a[r];if(!o.active)continue;const l=o.step(t?t.pos:null,t?t.vel:null,jt,i);if(l!=="none"){this.onBlast&&this.onBlast(o.pos.x,o.pos.y,o.pos.z,l==="ground"?40:l==="decoy"?45:35,1.2),o.hide();continue}t&&o.decoy===null&&o.armed&&o.pos.distanceTo(t.pos)<z1&&(this.onBlast&&this.onBlast(o.pos.x,o.pos.y,o.pos.z,70,1.6),this.lastHitSeeker=o.seeker,this.lastHitLauncher=this.launchers[o.launcher]?.name??"",o.hide(),this.hitThisFrame=!0)}}syncMeshes(t=!1,e){this.meshes&&(this.meshes.update(this.frame),this.meshes.setNight(t,this.frame));for(let n=0;n<this.drones.length;n++)this.drones[n].syncMesh();const i=this.missiles.items;for(let n=0;n<i.length;n++)i[n].active&&i[n].syncMesh(e)}}const jE=new T(0,-1e7,0),QE=()=>xr(.5),Ac=()=>Math.round(4*ki),Hn=new T,Lo=new T,vp=new T(0,1,0),_p=new Ei,t2=new T,e2=new ii(.35,.35,3,8),i2=new be({color:4868668}),Mp=new be({color:16440490}),n2=new be({color:12512255}),s2=new ii(.2,.2,3.6,8),c0=new ze({color:16755260});c0.color.multiplyScalar(4);const a2=new Be(.5,8,6);class r2{constructor(){this.active=!1,this.kind="BOMB",this.pos=new T,this.vel=new T,this.dir=new T,this.impact=new T,this.speed=0,this.age=0,this.fall=0,this.launcher=null,this.drone=null,this.sam=null,this.mesh=new hi,this.bomb=new St(e2,i2),this.body=new St(s2,Mp),this.flame=new St(a2,c0),this.flame.position.y=-2,this.flame.scale.set(1,2,1),this.mesh.add(this.bomb,this.body,this.flame),this.mesh.visible=!1}setKind(t){this.kind=t,this.bomb.visible=t==="BOMB",this.body.visible=t!=="BOMB",this.flame.visible=t!=="BOMB",this.body.material=t==="AGM"?Mp:n2}sync(t){this.mesh.position.copy(this.pos),_p.setFromUnitVectors(vp,this.dir.lengthSq()>0?this.dir:vp),this.mesh.quaternion.copy(_p),this.mesh.scale.setScalar(Math.min(40,Math.max(1.5,t2.copy(t).distanceTo(this.pos)/250)))}}class o2{constructor(t,e,i){this.threats=e,this.hooks=i,this.missileCd=0,this.aamLeft=Ac(),this.frame=0,this.items=new Ts(16,()=>{const n=new r2;return t&&t.add(n.mesh),n}),this.fires=new Ts(60,()=>({active:!1,x:0,y:0,z:0,age:0,life:1,size:1}))}reset(){for(const t of this.items.items)t.active=!1,t.mesh.visible=!1;this.fires.releaseAll(),this.missileCd=0,this.aamLeft=Ac()}rearm(){this.missileCd=0,this.aamLeft=Ac()}agmTarget(t){let e=null,i=Z1();for(const n of this.threats.launchers){if(n.hp<=0||!n.visible)continue;const a=Math.hypot(n.x-t.x,n.z-t.z);a<i&&(i=a,e=n)}return e}aamTarget(t){let e=null,i=md();for(const n of this.threats.drones){if(!n.alive)continue;const a=Math.hypot(n.x-t.x,n.z-t.z);a<i&&(i=a,e=n)}return e}samTarget(t){let e=null,i=md();const n=this.threats.missiles.items;for(let a=0;a<n.length;a++){const r=n[a];if(!r.active||r.decoy!==null||!r.armed)continue;const o=r.pos.distanceTo(t);Hn.copy(t).sub(r.pos).divideScalar(Math.max(1,o)),o<i&&r.dir.dot(Hn)>.5&&(i=o,e=r)}return e}dropBomb(t,e){const i=this.items.acquireOrRecycle();i.setKind("BOMB"),i.pos.copy(t).y-=3,i.vel.set(e.x*.9,0,e.z*.9),i.fall=30,i.age=0,i.dir.set(0,-1,0);let n=i.pos.x,a=i.pos.y,r=i.pos.z,o=i.vel.x,l=i.vel.z,c=i.fall;for(let h=0;h<4e3&&a>jt(n,r);h++)n+=o*Ct,r+=l*Ct,o*=.997,l*=.997,c=Math.min(260,c+2.2),a-=c*Ie;i.impact.set(n,jt(n,r),r),i.mesh.visible=!0,this.hooks.sound("shoot",null)}fireMissile(t,e,i){if(this.missileCd>0){this.hooks.say("MISSILE RAIL RELOADING");return}if(t==="AAM"&&this.aamLeft<=0){this.hooks.say("NO AAM LEFT");return}const n=t==="AGM"?this.agmTarget(e):null,a=t==="AAM"?this.samTarget(e):null,r=t==="AAM"&&!a?this.aamTarget(e):null;if(!n&&!r&&!a){this.hooks.say(t==="AGM"?"NO BATTERY IN AGM RANGE":"NO DRONE IN AAM RANGE");return}const o=this.items.acquireOrRecycle();o.setKind(t),o.launcher=n,o.drone=r,o.sam=a,o.pos.copy(e).y-=2,o.dir.copy(i).normalize(),o.speed=Aa*hn*(t==="AGM"?J1:j1),o.age=0,o.mesh.visible=!0,this.missileCd=K1(),t==="AAM"&&this.aamLeft--,this.hooks.sound("missile",null)}step(){this.frame++,this.missileCd>0&&this.missileCd--;const t=this.items.items;for(let i=0;i<t.length;i++){const n=t[i];if(!n.active)continue;if(n.age++,n.kind==="BOMB"){n.pos.x+=n.vel.x*Ct,n.pos.z+=n.vel.z*Ct,n.vel.x*=.997,n.vel.z*=.997,n.fall=Math.min(260,n.fall+2.2),n.pos.y-=n.fall*Ie,n.dir.set(n.vel.x*Ct,-n.fall*Ie,n.vel.z*Ct).normalize(),this.frame%2===0&&this.hooks.smoke(n.pos.x,n.pos.y,n.pos.z,1.5,2,5,.9);const v=jt(n.pos.x,n.pos.z);n.pos.y<=v&&(n.pos.y=v,this.explode(n),this.groundHit(n.pos,pd,1,"BOMB"));continue}const a=n.sam&&n.sam.active?n.sam:null,r=a?a.pos.x:n.launcher?n.launcher.x:n.drone?n.drone.x:n.pos.x,o=a?a.pos.y:n.launcher?n.launcher.y+4:n.drone?n.drone.y:n.pos.y,l=a?a.pos.z:n.launcher?n.launcher.z:n.drone?n.drone.z:n.pos.z,c=a?!0:n.launcher?n.launcher.hp>0:n.drone?n.drone.alive:!1;Hn.set(r-n.pos.x,o-n.pos.y,l-n.pos.z);const h=Hn.length();Hn.divideScalar(Math.max(.001,h));const f=n.kind==="AGM"?Q1:tS;Math.acos(Math.min(1,Math.max(-1,n.dir.dot(Hn))))<=f?n.dir.copy(Hn):(Lo.crossVectors(n.dir,Hn),Lo.lengthSq()<1e-10&&Lo.set(1,0,0),n.dir.applyAxisAngle(Lo.normalize(),f));const d=Math.min(1,.4+n.age/90);n.pos.addScaledVector(n.dir,n.speed*d*Ct);const g=n.pos.y<=jt(n.pos.x,n.pos.z);h<gd?(this.explode(n),a?this.threats.rand()<QE()?(this.hooks.blast(a.pos.x,a.pos.y,a.pos.z,45,1.2),a.hide(),this.hooks.say("MISSILE SHOT DOWN")):this.hooks.say("AAM MISSED - FIRE AGAIN"):n.kind==="AGM"?this.groundHit(n.pos,eS,1,"AGM"):n.drone&&n.drone.alive&&(n.drone.alive=!1,n.drone.mesh.visible=!1,n.drone.respawn=aS,this.hooks.say("DRONE SPLASHED"))):(n.age>iS||g||!c&&h<gd*3)&&(this.hooks.blast(n.pos.x,n.pos.y,n.pos.z,30,.8),n.active=!1,n.mesh.visible=!1)}const e=this.fires.items;for(let i=0;i<e.length;i++){const n=e[i];if(n.active){if(n.age++,n.age>=n.life){n.active=!1;continue}(this.frame+i)%6===0&&this.hooks.smoke(n.x,n.y+6,n.z,6,n.size,n.size*3.5,.22)}}}explode(t){this.hooks.blast(t.pos.x,t.pos.y+5,t.pos.z,t.kind==="BOMB"?pd*.6:50,1.4),this.hooks.sound("explode",t.pos),t.active=!1,t.mesh.visible=!1}burn(t,e){this.addFire(t,e,2400,12)}addFire(t,e,i,n){const a=this.fires.acquireOrRecycle();a.x=t,a.z=e,a.y=jt(t,e),a.age=0,a.life=i,a.size=n}groundHit(t,e,i,n){this.addFire(t.x,t.z,rS,9);for(const a of this.threats.launchers){if(a.hp<=0)continue;const r=a.kind==="SAM"?nS:sS;Math.hypot(a.x-t.x,a.z-t.z)>=e+r||(a.hp=Math.max(0,a.hp-i),a.hp===0?(a.missiles=0,this.addFire(a.x,a.z,oS,14),this.hooks.say(`${a.name} DESTROYED BY ${n}`+TS(a.name))):this.hooks.say(`${a.name} DAMAGED BY ${n}`))}}sync(t){const e=this.items.items;for(let i=0;i<e.length;i++)e[i].active&&e[i].sync(t)}}const Rc=6,l2=1.943844,Do=24,c2=12,xp=8,h2=14e3,u2=22e3,ra=5,f2=180,Fi=new T,Gn=new T,yp=new T,Sp=new T;function Vt(s,t,e=""){const i=document.createElement("div");return i.className=t,i.textContent=e,s.appendChild(i),i}class ke{constructor(t){this.node=t,this.last=""}set(t){t!==this.last&&(this.node.textContent=t,this.last=t)}}class h0{constructor(t){this.bombMarks=[],this.arrows=[],this.arrowText=[],this.launcherMarks=[],this.launcherText=[],this.droneMarks=[],this.missileMarks=[],this.missileText=[],this.msgNodes=[],this.msgText=[],this.msgLife=[],this.nearIdx=new Int32Array(Do),this.nearD=new Float64Array(Do),this.lastHp=-1,this.tick=0;const e=Vt(t,"hud");this.root=e,this.border=Vt(e,"hud-border"),this.ecmRing=Vt(e,"hud-ecm-ring");const i=Vt(e,"hud-box hud-left");Vt(i,"hud-label","SPEED"),this.spd=new ke(Vt(i,"hud-big")),this.mach=new ke(Vt(i,"hud-small"));const n=Vt(e,"hud-box hud-right");Vt(n,"hud-label","ALTITUDE"),this.alt=new ke(Vt(n,"hud-big")),this.agl=new ke(Vt(n,"hud-small"));const a=Vt(e,"hud-top");this.hdg=new ke(Vt(a,"hud-hdg")),this.tag=new ke(Vt(a,"hud-small hud-tag"));const r=Vt(a,"hud-hp"),o=Vt(r,"hud-hp-bar");this.hpFill=Vt(o,"hud-hp-fill"),this.hpText=new ke(Vt(r,"hud-small"));const l=Vt(e,"hud-box hud-bl");this.g=new ke(Vt(l,"hud-mid")),this.thr=new ke(Vt(l,"hud-small"));const c=(f,u)=>{const d=Vt(l,"hud-cm");Vt(d,"hud-cm-label",f);const g=Vt(d,"hud-cm-bar");return[Vt(g,`hud-cm-fill ${u}`),new ke(Vt(d,"hud-cm-state"))]};[this.flareFill,this.flareText]=c("FLARES","flare"),[this.chaffFill,this.chaffText]=c("CHAFF","chaff"),[this.ecmFill,this.ecmText]=c("ECM","ecm"),this.warnNode=Vt(e,"hud-warn"),this.warn=new ke(this.warnNode),this.adviceNode=Vt(e,"hud-advice"),this.advice=new ke(this.adviceNode),this.caution=new ke(Vt(e,"hud-caution")),this.p2Node=Vt(e,"mark mark-p2"),this.p2Node.style.display="none",this.p2Text=new ke(this.p2Node),this.rwyNode=Vt(e,"mark mark-rwy"),this.rwyNode.style.display="none",this.rwyText=new ke(this.rwyNode);const h=Vt(e,"hud-log");for(let f=0;f<ra;f++)this.msgNodes.push(new ke(Vt(h,"hud-log-line"))),this.msgText.push(""),this.msgLife.push(0);for(let f=0;f<xp;f++){const u=Vt(e,"rwr-arrow");Vt(u,"rwr-tip"),this.arrowText.push(new ke(Vt(u,"rwr-label"))),u.style.display="none",this.arrows.push(u)}for(let f=0;f<Do;f++){const u=Vt(e,"mark mark-site");u.style.display="none",this.launcherMarks.push(u),this.launcherText.push(new ke(u))}for(let f=0;f<Rc;f++){const u=Vt(e,"mark mark-bomb");u.style.display="none",this.bombMarks.push(u)}for(let f=0;f<c2;f++){const u=Vt(e,"mark mark-drone","UAV");u.style.display="none",this.droneMarks.push(u)}for(let f=0;f<xp;f++){const u=Vt(e,"mark mark-missile");u.style.display="none",this.missileMarks.push(u),this.missileText.push(new ke(u))}}setTag(t){this.tag.set(t)}rwyMark(t,e,i,n,a){if(!t){this.rwyNode.style.display="none";return}this.place(this.rwyNode,t,i,n,a)&&this.rwyText.set(e)}p2Mark(t,e,i,n,a){if(!t){this.p2Node.style.display="none";return}Sp.set(t.x,t.y+10,t.z),this.place(this.p2Node,Sp,i,n,a)&&this.p2Text.set(e)}show(t){this.root.style.display=t?"block":"none"}say(t){try{window.dispatchEvent(new CustomEvent("fighter-say",{detail:String(t)}))}catch{}for(let e=0;e<ra-1;e++)this.msgText[e]=this.msgText[e+1],this.msgLife[e]=this.msgLife[e+1];this.msgText[ra-1]=t,this.msgLife[ra-1]=f2}clearLog(){for(let t=0;t<ra;t++)this.msgText[t]="",this.msgLife[t]=0,this.msgNodes[t].set("")}static lockCount(t){let e=0;const i=t.missiles.items;for(let n=0;n<i.length;n++)i[n].active&&i[n].tracking&&e++;return e}update(t,e,i,n,a,r,o){this.tick++;const l=this.tick%4===0,c=t.speed;if(l){this.spd.set(`${Math.round(c*l2)} KT`),this.mach.set(`M ${t.mach.toFixed(2)}`);const _=t.pos.y/Ie;this.alt.set(`${(Math.round(_/10)*10).toLocaleString("en-US")} FT`),this.agl.set(`AGL ${Math.round(Math.max(0,t.pos.y-e)/Ie).toLocaleString("en-US")} FT`),this.hdg.set(`HDG ${String(Math.round(t.headingDeg)%360).padStart(3,"0")}`),this.g.set(`${t.gLoad.toFixed(1)} G`),this.thr.set(`${t.afterburner?"THR AB":`THR ${Math.round(t.throttle*100)}%`}   AAM ${a.aamLeft}`);const x=n.cm;this.flareFill.style.width=`${(100*(1-x.flareCd/zm())).toFixed(0)}%`,this.flareText.set(x.flareCd===0?"READY":`${(x.flareCd/60).toFixed(1)} s`),this.chaffFill.style.width=`${(100*(1-x.chaffCd/km())).toFixed(0)}%`,this.chaffText.set(x.chaffCd===0?"READY":`${(x.chaffCd/60).toFixed(1)} s`),this.chaffFill.classList.toggle("ready",x.chaffCd===0),this.ecmFill.style.width=`${(100*(1-x.ecmCd/Hm())).toFixed(0)}%`,this.ecmText.set(x.ecmCd===0?"READY":`${(x.ecmCd/60).toFixed(1)} s`),this.flareFill.classList.toggle("ready",x.flareCd===0),this.ecmFill.classList.toggle("ready",x.ecmCd===0)}t.hp!==this.lastHp&&(this.lastHp=t.hp,this.hpFill.style.width=`${100*t.hp/vr}%`,this.hpText.set(`HP ${t.hp} / ${vr}`));for(let _=0;_<ra;_++)this.msgLife[_]>0&&(this.msgLife[_]--,this.msgLife[_]===0&&(this.msgText[_]="")),this.msgNodes[_].set(this.msgText[_]);const h=n.missiles.items;let f=0,u=0,d=0,g=1/0;const v=Math.atan2(t.vel.x,-t.vel.z),m=a.samTarget(t.pos);for(let _=0;_<h.length;_++){const x=h[_],L=this.arrows[_],U=this.missileMarks[_];let G=!1;if(t.alive&&x.active){Gn.copy(x.pos).sub(t.pos);const H=Gn.length();if(x.tracking?(G=!0,x.seeker==="IR"?u++:f++):!x.guided&&H<X1&&-Gn.dot(x.dir)/H>Y1&&(G=!0,d++),G){H<g&&(g=H);const $=Math.atan2(Gn.x,-Gn.z)-v;yp.copy(x.vel).sub(t.vel);const N=-yp.dot(Gn)/H;if(L.style.display="block",L.style.transform=`translate(-50%, -50%) rotate(${$.toFixed(3)}rad)`,l){const Y=x.guided?x.seeker:"ROCKET",Q=Gn.y>600?" HI":Gn.y<-600?" LO":"";this.arrowText[_].set(`${Y}${Q} ${(H/1e3).toFixed(1)}km ${N>=0?"+":""}${Math.round(N)}m/s`)}L.lastChild.style.transform=`translateX(-50%) rotate(${(-$).toFixed(3)}rad)`}}G||(L.style.display="none"),!t.alive||!x.active||!this.place(U,x.pos,i,r,o)?U.style.display="none":(U.classList.toggle("target",x===m),l&&this.missileText[_].set(`${(x.pos.distanceTo(t.pos)/1e3).toFixed(1)}`))}const p=f+u>0||d>0,M=(this.tick>>3)%2===0;if(this.border.style.display=p&&M?"block":"none",window.__fighterThreat=f+u>0,p){if(l){const _=[];f+u>0&&_.push(`MISSILE LOCK ${f+u}${f&&u?` (RADAR ${f} / IR ${u})`:f?" RADAR":" IR"}`),d>0&&_.push(`ROCKET ${d}`),this.warn.set(`${_.join("  +  ")}  -  ${(g/1e3).toFixed(1)} KM`);const x=n.cm,L=document.querySelector(".touch-layer")?.style.display==="block";let U;f+u===0?U="UNGUIDED - TURN HARD OUT OF ITS PATH":u>0&&x.flareCd===0?U=L?"TAP FLARE":"PRESS C (△)  -  FLARES":f>0&&x.chaffCd===0?U=L?"TAP CHAFF   |   ECM   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE":"PRESS K (D-PAD ↑)  -  CHAFF   |   X (L1)  -  ECM   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE":f>0&&x.ecmCd===0?U=L?"TAP ECM   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE":"PRESS X (L1)  -  ECM JAMMER   |   NOTCH: FLY 90 DEG ACROSS IT AND DIVE":f>0?U="NOTCH: FLY 90 DEG ACROSS IT AND DIVE, THEN BREAK HARD LATE":U=`FLARES RELOADING ${(x.flareCd/60).toFixed(1)} s - BREAK HARD LATE`,m&&a.missileCd===0&&a.aamLeft>0&&(U+=L?"   |   AAM  -  SHOOT IT DOWN":"   |   Z (□)  -  SHOOT IT DOWN"),this.advice.set(U)}this.warnNode.style.visibility=M||g<3e3?"visible":"hidden"}else this.warn.set(""),this.advice.set("");if(this.ecmRing.style.display=n.cm.ecmFlash>0?"block":"none",n.cm.ecmFlash>0){const _=1+(40-n.cm.ecmFlash)*.12;this.ecmRing.style.transform=`translate(-50%, -50%) scale(${_.toFixed(2)})`,this.ecmRing.style.opacity=(n.cm.ecmFlash/40).toFixed(2)}if(l){let _="";t.alive&&t.stalled?_="STALL":t.alive&&t.pos.y-e<M1*Ie&&t.vel.y<-20&&(_="PULL UP"),this.caution.set(_)}const y=Do;let S=0;const C=n.launchers;for(let _=0;_<C.length;_++){const x=C[_];if(!x.visible||x.hp<=0)continue;const L=Math.hypot(x.x-t.pos.x,x.z-t.pos.z);if(L>h2)continue;let U;if(S<y)U=S++;else{if(L>=this.nearD[y-1])continue;U=y-1}for(;U>0&&this.nearD[U-1]>L;)this.nearD[U]=this.nearD[U-1],this.nearIdx[U]=this.nearIdx[U-1],U--;this.nearD[U]=L,this.nearIdx[U]=_}const w=a.agmTarget(t.pos),E=a.aamTarget(t.pos);for(let _=0;_<y;_++){const x=this.launcherMarks[_];if(_>=S){x.style.display="none";continue}const L=C[this.nearIdx[_]];Fi.set(L.x,L.y+10,L.z),this.place(x,Fi,i,r,o)&&(x.classList.toggle("tel",L.kind==="TEL"),x.classList.toggle("in-range",this.nearD[_]<L.range),x.classList.toggle("target",L===w),l&&this.launcherText[_].set(L.kind))}for(let _=0;_<this.droneMarks.length;_++){const x=this.droneMarks[_],L=n.drones[_];if(!L){x.style.display="none";continue}Fi.set(L.x,L.y,L.z),!L.alive||Fi.distanceTo(t.pos)>u2||!this.place(x,Fi,i,r,o)?x.style.display="none":x.classList.toggle("target",L===E)}let A=0;const D=a.items.items;for(let _=0;_<D.length&&A<Rc;_++){const x=D[_];!x.active||x.kind!=="BOMB"||this.place(this.bombMarks[A],x.impact,i,r,o)&&A++}for(;A<Rc;A++)this.bombMarks[A].style.display="none"}place(t,e,i,n,a){if(Fi.copy(e).project(i),Fi.z>1||Fi.z<-1||Math.abs(Fi.x)>1.05||Math.abs(Fi.y)>1.05)return t.style.display="none",!1;const r=(Fi.x*.5+.5)*n,o=(-Fi.y*.5+.5)*a;return t.style.display="block",t.style.transform=`translate(${r.toFixed(0)}px, ${o.toFixed(0)}px) translate(-50%, -50%)`,!0}}const Cc="M36 456 C 118 452, 112 372, 170 346 S 222 304, 236 280";function d2(s){const t=`<animateMotion dur="2s" begin="0.4s" fill="freeze" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.35 0 0.6 1" path="${Cc}"/>`,e="",i=n=>` class="${n}"`;return`
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
      <path${i("lg-trail-glow")} d="${Cc}" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="26" stroke-linecap="round" pathLength="1"/>
      <path${i("lg-trail")} d="${Cc}" fill="none" stroke="url(#lg-smoke)" stroke-width="9" stroke-linecap="round" pathLength="1"/>
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
</svg>`}const wp=d2(),p2=`<svg viewBox="0 0 160 96" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">
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
</svg>`,m2='<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 25 a8 8 0 1 1 12 7 c-3 2 -4 3 -4 7" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="46" r="2.8" fill="currentColor"/></svg>',g2='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 20 L44 44 M44 20 L20 44" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',v2=3600;class _2{constructor(t){this.dockTimer=0,this.root=document.getElementById("start"),this.logo=document.getElementById("intro-logo"),this.help=document.getElementById("help"),this.logo.innerHTML=wp;const e=document.getElementById("start-btn"),i=document.getElementById("help-btn"),n=document.getElementById("help-close");e.innerHTML=p2,i.innerHTML=m2,n.innerHTML=g2,this.root.addEventListener("click",a=>{a.target.closest("#help-btn")||t()}),i.addEventListener("click",a=>{a.stopPropagation(),this.help.style.display="flex"}),n.addEventListener("click",()=>this.help.style.display="none"),this.help.addEventListener("click",a=>{a.target===this.help&&(this.help.style.display="none")}),window.addEventListener("keydown",a=>{a.code==="Escape"&&(this.help.style.display="none")}),this.show()}show(){this.root.style.display="flex",this.logo.classList.remove("docked"),this.logo.innerHTML=wp,window.clearTimeout(this.dockTimer),this.dockTimer=window.setTimeout(()=>this.logo.classList.add("docked"),v2)}hide(){this.root.style.display="none",this.help.style.display="none",window.clearTimeout(this.dockTimer)}}const Ce=252,Ee=90;class M2{constructor(t,e,i,n){this.tick=0,this.canvas=document.createElement("canvas"),this.canvas.className="minimap",this.canvas.width=Ce,this.canvas.height=Ee,t.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.bg=document.createElement("canvas"),this.bg.width=Ce,this.bg.height=Ee;const a=this.bg.getContext("2d");a.imageSmoothingQuality="high",a.drawImage(e,0,0,Ce,Ee),a.fillStyle="rgba(0, 10, 20, 0.32)",a.fillRect(0,0,Ce,Ee),a.strokeStyle="rgba(0, 200, 255, 0.16)",a.lineWidth=1,a.beginPath();for(let o=Ce/12;o<Ce;o+=Ce/12)a.moveTo(Math.round(o)+.5,0),a.lineTo(Math.round(o)+.5,Ee);for(let o=Ee/4;o<Ee;o+=Ee/4)a.moveTo(0,Math.round(o)+.5),a.lineTo(Ce,Math.round(o)+.5);a.stroke();const r=a.createRadialGradient(Ce/2,Ee/2,Ee*.3,Ce/2,Ee/2,Ce*.62);r.addColorStop(0,"rgba(0,0,0,0)"),r.addColorStop(1,"rgba(0,8,18,0.45)"),a.fillStyle=r,a.fillRect(0,0,Ce,Ee);for(let o=0;o<Et.airbases.length;o+=2){const l=Et.airbases[o]/Gt*Ce,c=Et.airbases[o+1]/Xt*Ee,h=18,f=4;a.save(),a.shadowColor="rgba(255, 255, 255, 0.9)",a.shadowBlur=4,a.fillStyle="#f2f2ea",a.fillRect(l-h/2-1,c-f/2-1,h+2,f+2),a.restore(),a.fillStyle="#2b2f33",a.fillRect(l-h/2,c-f/2,h,f),a.fillStyle="#ffffff";for(let u=-h/2+3;u<h/2-3;u+=3)a.fillRect(l+u,c-.5,1.6,1);a.fillStyle="#3cff6e",a.fillRect(l-h/2,c-f/2,1,f),a.fillRect(l+h/2-1,c-f/2,1,f),a.fillStyle="#9aa0a4",a.fillRect(l-h*.38,c+f/2+2,h*.76,1),a.fillRect(l-3,c+f/2+3,6,3)}this.canvas.addEventListener("click",o=>{const l=this.canvas.getBoundingClientRect(),c=(o.clientX-l.left)/l.width*Ce,h=(o.clientY-l.top)/l.height*Ee;let f=-1,u=30;for(const d of n.jets){if(!d.alive)continue;const[g,v]=this.toMap(d.pos.x,d.pos.z),m=3.5*Math.hypot(g-c,v-h);m<u&&(u=m,f=d.id)}f>=0&&i(f)})}toMap(t,e){return[(t/pt+Gt/2)/Gt*Ce,(e/pt+Xt/2)/Xt*Ee]}show(t){this.canvas.style.display=t?"block":"none"}update(t,e,i,n,a,r=null){if(++this.tick%6!==0)return;const o=this.ctx;o.drawImage(this.bg,0,0);const l=Ce/(Gt*pt),c=Ee/(Xt*pt),h=Ce/2,f=Ee/2;for(const m of t.launchers){const p=h+m.x*l,M=f+m.z*c;m.kind==="SAM"?(o.fillStyle=m.hp<=0?"#dc3c32":m.missiles>0?"#00dc96":"#787878",o.beginPath(),o.arc(p,M,1.6,0,Math.PI*2),o.fill()):m.visible&&(o.fillStyle=m.hp<=0?"#dc3c32":m.missiles>0?"#e6c85a":"#787878",o.fillRect(p,M,1,1))}const u=h+i*l,d=f+n*c;o.save(),o.beginPath(),o.rect(0,0,Ce,Ee),o.clip(),o.strokeStyle="rgba(0, 230, 255, 0.35)",o.lineWidth=1;for(const m of[14,28,42])o.beginPath(),o.arc(u,d,m,0,Math.PI*2),o.stroke();const g=performance.now()/1e3*2.2,v=o.createRadialGradient(u,d,0,u,d,46);if(v.addColorStop(0,"rgba(0, 255, 200, 0.28)"),v.addColorStop(1,"rgba(0, 255, 200, 0)"),o.fillStyle=v,o.beginPath(),o.moveTo(u,d),o.arc(u,d,46,g-.6,g),o.closePath(),o.fill(),o.strokeStyle="rgba(120, 255, 220, 0.8)",o.beginPath(),o.moveTo(u,d),o.lineTo(u+Math.cos(g)*46,d+Math.sin(g)*46),o.stroke(),o.restore(),r){const m=h+r.x*l,p=f+r.z*c;o.save(),o.strokeStyle="#3cff6e",o.lineWidth=1.5,o.shadowColor="#3cff6e",o.shadowBlur=5,o.beginPath(),o.arc(m,p,11,0,Math.PI*2),o.stroke(),o.setLineDash([3,3]),o.lineWidth=1,o.beginPath(),o.moveTo(u,d),o.lineTo(m,p),o.stroke(),o.setLineDash([]),o.shadowBlur=0,o.font="bold 9px monospace";const M=o.measureText(r.label).width;o.fillStyle="rgba(0, 16, 8, 0.75)",o.fillRect(4,Ee-15,M+6,12),o.fillStyle="#3cff6e",o.fillText(r.label,7,Ee-6),o.restore()}for(const m of t.drones)m.alive&&Ep(o,h+m.x*l,f+m.z*c,m.heading,3.4,"#ff5a6e");for(const m of t.missiles.items)m.active&&Ep(o,h+m.pos.x*l,f+m.pos.z*c,Math.atan2(m.vel.x,-m.vel.z),2.6,"#ff9628");for(const m of e.jets)m.alive&&m.id!==e.active&&x2(o,h+m.pos.x*l,f+m.pos.z*c,m.heading,3.6,"#4aa8ff");o.save(),o.translate(u,d),o.rotate(a),o.fillStyle="#00e6ff",o.beginPath(),o.moveTo(0,-5),o.lineTo(3.5,3.5),o.lineTo(-3.5,3.5),o.closePath(),o.fill(),o.restore(),o.strokeStyle="#00c8ff",o.lineWidth=1,o.strokeRect(.5,.5,Ce-1,Ee-1),o.strokeStyle="rgba(0, 200, 255, 0.35)",o.strokeRect(2.5,2.5,Ce-5,Ee-5),o.strokeStyle="#7ff4ff",o.lineWidth=2,o.beginPath();for(const[m,p,M,y]of[[1,1,1,1],[Ce-1,1,-1,1],[1,Ee-1,1,-1],[Ce-1,Ee-1,-1,-1]])o.moveTo(m,p+y*10),o.lineTo(m,p),o.lineTo(m+M*10,p);o.stroke()}}function Ep(s,t,e,i,n,a){s.save(),s.translate(t,e),s.rotate(i),s.strokeStyle=a,s.lineWidth=1.4,s.beginPath(),s.moveTo(-n,n*.6),s.lineTo(0,-n),s.lineTo(n,n*.6),s.stroke(),s.restore()}function x2(s,t,e,i,n,a){s.save(),s.translate(t,e),s.rotate(i),s.fillStyle=a,s.beginPath(),s.moveTo(0,-n),s.lineTo(n*.7,n*.8),s.lineTo(0,n*.35),s.lineTo(-n*.7,n*.8),s.closePath(),s.fill(),s.restore()}const y2=20,bp=[.3,-.1],S2=new at(bp[0]*.25*pt*60,bp[1]*.25*pt*60),w2=8;class E2{constructor(){this.drift=new at;let t=4242;const e=()=>{t=t+1831565813|0;let h=t;return h=Math.imul(h^h>>>15,h|1),h^=h+Math.imul(h^h>>>7,h|61),((h^h>>>14)>>>0)/4294967296},i=(h,f)=>h+e()*(f-h),n=h=>h*Math.sqrt(-2*Math.log(Math.max(1e-9,e())))*Math.cos(2*Math.PI*e()),a=[],r=[],o=[];for(let h=0;h<y2;h++){const f=i(0,Gt),u=i(0,Xt),d=i(6e3,28e3)*Ie,g=e()<.35,v=g?i(160,300):i(90,220),m=v*i(.55,.85),p=Math.floor(g?i(4,9):i(2,5));for(let M=0;M<p;M++){const y=g?i(.07,.12)*v:i(.12,.2)*v,S=i(y*1.6,v-y*1.6),C=i(y*1.6,m-y*1.6),w=Math.min(w2,Math.floor(y*2.2)+6);for(let E=0;E<w;E++){const A=n(y*.3),D=n(y*.25),_=Math.hypot(A/y,D/y);if(_>1.6)continue;const x=Math.max(6,y*i(.4,.8)*Math.max(.4,1-_*.45)),L=(A+D)/y;a.push(Te(f+S+A),d+Math.abs(n(y*.35))*pt-x*.5,we(u+C+D)),r.push(x*pt*4),o.push(L<-.25?1:L>.35?.35:.7)}}}const l=new $y,c=new ba(2,2);l.index=c.index,l.setAttribute("position",c.getAttribute("position")),l.setAttribute("iOffset",new or(new Float32Array(a),3)),l.setAttribute("iSize",new or(new Float32Array(r),1)),l.setAttribute("iShade",new or(new Float32Array(o),1)),l.instanceCount=r.length,this.mat=new Se({transparent:!0,depthWrite:!1,fog:!0,uniforms:Bi.merge([rt.fog,{uDrift:{value:new at},uMin:{value:new at(Te(0),we(0))},uSize:{value:new at(Gt*pt,Xt*pt)},uLit:{value:new gt("#ffffff")},uShade:{value:new gt("#c4ccdc")},uNight:{value:0}}]),vertexShader:`
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
        }`}),this.mesh=new St(l,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=2}update(t,e){this.drift.copy(S2).multiplyScalar(t),this.mat.uniforms.uDrift.value.copy(this.drift),this.mat.uniforms.uNight.value=e}}const Pc=10,Lc=5,b2=.12,T2=11,A2=25e3,R2=.06,Vn=new Ae;class C2{constructor(t){this.convoys=[];let e=35e3;this.rand=()=>(e=e*16807%2147483647,e/2147483647);for(let a=0;a<Pc;a++){const r=Et.highways[a%Et.highways.length];this.convoys.push({hw:r,len:Math.max(1,Math.hypot(r[2]-r[0],r[3]-r[1])),t:this.rand(),dir:this.rand()<.5?-1:1})}const i=new ui(3,3.2,11);i.translate(0,1.6,0),this.trucks=new Gi(i,new be({color:4607538}),Pc*Lc);const n=new ze({color:16773320});n.color.multiplyScalar(4),this.lights=new Gi(new Be(1.6,6,4),n,Pc*Lc),this.trucks.frustumCulled=!1,this.lights.frustumCulled=!1,this.lights.visible=!1,t.add(this.trucks,this.lights)}step(t,e,i){for(const a of this.convoys)a.t+=a.dir*b2/a.len,a.t>0&&a.t<1||(a.dir=-a.dir,a.t=Math.min(1,Math.max(0,a.t)));const n=e/pt+Xt/2;if(n>0&&n<Xt&&this.rand()<R2){const a=Math.min(Xt,Math.max(0,n+(this.rand()*2-1)*1500)),r=Et.borderX(a)+(this.rand()*2-1)*90,o=Te(r),l=we(a);Math.abs(o-t)<A2&&r<Gt&&i(o,jt(o,l)+5,l,(6+this.rand()*6)*pt,.6)}}sync(t){this.lights.visible=t;let e=0;for(const i of this.convoys){const[n,a,r,o]=i.hw,l=Math.atan2(r-n,o-a)+(i.dir<0?Math.PI:0);for(let c=0;c<Lc;c++){const h=i.t-i.dir*c*T2/i.len,f=Te(n+(r-n)*h),u=we(a+(o-a)*h),d=jt(f,u);Vn.position.set(f,d,u),Vn.rotation.set(0,l,0),Vn.scale.set(1,1,1),Vn.updateMatrix(),this.trucks.setMatrixAt(e,Vn.matrix),t&&(Vn.position.set(f+Math.sin(l)*6,d+1.5,u+Math.cos(l)*6),Vn.updateMatrix(),this.lights.setMatrixAt(e,Vn.matrix)),e++}}this.trucks.instanceMatrix.needsUpdate=!0,t&&(this.lights.instanceMatrix.needsUpdate=!0)}}const P2=8,Tp=.02,Ap=new Be(1.6,10,8),L2=new ii(.25,.35,7,6),D2=new ui(14,.08,.5),I2=new ui(.08,2.2,.3),Rp=new be({color:4871228}),U2=new be({color:7908030}),Cp=new be({color:1842204}),u0=new ze({color:16727090});u0.color.multiplyScalar(4);class N2{constructor(){this.group=new hi,this.x=0,this.z=0,this.agl=300,this.heading=0,this.speed=50,this.tx=0,this.tz=0;const t=new St(Ap,Rp);t.scale.set(1,.9,1.6);const e=new St(Ap,U2);e.scale.set(.7,.6,.6),e.position.set(0,.3,-1.6);const i=new St(L2,Rp);i.rotation.x=Math.PI/2,i.position.set(0,.4,4.6),this.rotor=new St(D2,Cp),this.rotor.position.y=1.7,this.tail=new St(I2,Cp),this.tail.position.set(.3,.8,8),this.beacon=new St(new Be(.35,6,4),u0),this.beacon.position.y=1.5,this.group.add(t,e,i,this.rotor,this.tail,this.beacon),this.group.scale.setScalar(1.6)}waypoint(t,e){if(t()<.4){const i=Math.floor(t()*(Et.airbases.length/2))*2;e[0]=Te(Et.airbases[i]+(t()*200-100)),e[1]=we(Et.airbases[i+1]+(t()*120-60))}else{const i=Et.cities[Math.floor(t()*Et.cities.length)];e[0]=Te(i.x+(t()*800-400)),e[1]=we(i.y+(t()*800-400))}}step(t,e){Math.hypot(this.tx-this.x,this.tz-this.z)<30*pt&&(this.waypoint(t,e),this.tx=e[0],this.tz=e[1]);let n=Math.atan2(this.tx-this.x,-(this.tz-this.z))-this.heading;n=((n+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,this.heading+=Math.max(-Tp,Math.min(Tp,n)),this.x+=Math.sin(this.heading)*this.speed*Ct,this.z-=Math.cos(this.heading)*this.speed*Ct}sync(t,e){const i=jt(this.x,this.z);this.group.position.set(this.x,i+this.agl,this.z),this.group.rotation.set(.08,-this.heading,0,"YXZ"),this.rotor.rotation.y=t*.55,this.tail.rotation.x=t*.9,this.beacon.visible=e&&(t+Math.floor(this.x))%50<8}}class F2{constructor(t){this.helis=[],this.wp=[0,0];let e=4242;this.rand=()=>(e=e*16807%2147483647,e/2147483647);for(let i=0;i<P2;i++){const n=new N2;n.waypoint(this.rand,this.wp),n.x=this.wp[0],n.z=this.wp[1],n.waypoint(this.rand,this.wp),n.tx=this.wp[0],n.tz=this.wp[1],n.heading=this.rand()*Math.PI*2,n.agl=(600+this.rand()*1900)*Ie,n.speed=(.18+this.rand()*.1)*pt*60,t.add(n.group),this.helis.push(n)}}step(){for(const t of this.helis)t.step(this.rand,this.wp)}sync(t,e){for(const i of this.helis)i.sync(t,e)}}const er=.25,ge=1/er,Pp=["rgb(70,122,48)","rgb(62,114,42)","rgb(80,130,52)","rgb(92,136,54)","rgb(66,118,46)","rgb(104,140,58)"],Lp=[[170,148,102],[162,140,96],[178,156,108],[156,136,94]],_s=s=>`rgb(${s[0]},${s[1]},${s[2]})`;function Dp(){const s=document.createElement("canvas");s.width=Math.round(Gt*er),s.height=Math.round(Xt*er);const t=s.getContext("2d");return t.scale(er,er),[s,t]}function ir(s,t){s.beginPath(),s.moveTo(t[0],t[1]);for(let e=2;e<t.length;e+=2)s.lineTo(t[e],t[e+1])}const O2=(s,t)=>(Math.imul(s,73856093)^Math.imul(t,19349663))&65535;function z2(s){s.fillStyle="rgb(60,108,42)",s.fillRect(0,0,Gt,Xt);const t=160;for(let i=0;i<Gt;i+=t)for(let n=0;n<Xt;n+=t){const a=O2(i,n);if(Fh(i+t/2,n+t/2)){const l=Lp[a%Lp.length];s.fillStyle=_s(l),s.fillRect(i,n,t,t),s.strokeStyle=_s([l[0]-18,l[1]-18,l[2]-14]),s.lineWidth=ge;for(let c=0;c<3;c++){const h=n+22+c*48+(a>>c*3)%17,f=i+(a>>c*4)%50,u=70+(a>>c)%50;s.beginPath(),s.ellipse(f+u/2,h+13,u/2,13,0,-2.8,-.3),s.stroke()}continue}if(Vm(i+t/2,n+t/2)){s.fillStyle="rgb(54,60,46)",s.fillRect(i,n,t,t);for(let l=0;l<6;l++)s.fillStyle=l%2?"rgb(46,52,40)":"rgb(62,66,52)",s.beginPath(),s.ellipse(i+a*(l+3)%t+20,n+(a*(l+7)>>3)%t+11,20,11,0,0,Math.PI*2),s.fill();continue}const r=3+a%4,o=Pp[a%Pp.length];s.fillStyle=o,s.fillRect(i+r,n+r,t-2*r,t-2*r),a%7===0&&a%5!==0&&(s.fillStyle="rgb(38,82,32)",s.beginPath(),s.ellipse(i+t/2,n+t/2,(t-2*r-30)/2,(t-2*r-46)/2,0,0,Math.PI*2),s.fill())}for(const i of Et.forests)for(let n=0;n<i.trees.length;n+=3)s.fillStyle="rgb(26,58,24)",s.beginPath(),s.arc(i.trees[n]+2,i.trees[n+1]+2,i.trees[n+2],0,Math.PI*2),s.fill(),s.fillStyle="rgb(40,88,34)",s.beginPath(),s.arc(i.trees[n],i.trees[n+1],i.trees[n+2],0,Math.PI*2),s.fill();for(const i of Et.peaks){const n=i.outline;s.fillStyle="rgb(78,74,60)",ir(s,n),s.closePath(),s.fill(),s.fillStyle="rgb(52,49,42)",s.beginPath(),s.moveTo(i.x,i.y);for(let a=1;a<5;a++)s.lineTo(n[a*2],n[a*2+1]);if(s.closePath(),s.fill(),i.snow){s.fillStyle="rgb(222,226,232)",s.beginPath();for(let a=0;a<10;a++){const r=i.x+(n[a*2]-i.x)*.32,o=i.y+(n[a*2+1]-i.y)*.32;a===0?s.moveTo(r,o):s.lineTo(r,o)}s.closePath(),s.fill()}}s.lineCap="round",s.strokeStyle="rgb(74,74,68)",s.lineWidth=Math.max(3,ge);for(const i of Et.highways)ir(s,i),s.stroke();s.strokeStyle="rgb(48,42,36)",s.lineWidth=ge;for(const i of Et.railways)ir(s,i),s.stroke();const e=[[Et.river,null],...Et.tributaries.map(i=>[i,5])];for(const i of[0,1])for(const[n,a]of e)for(let r=0;r+3<n.length;r+=2){const o=a??7+9*Math.max(0,1-n[r]/Gt);s.strokeStyle=i===0?"rgb(28,54,48)":"rgb(34,84,132)",s.lineWidth=Math.max(ge,i===0?o+5:o),s.beginPath(),s.moveTo(n[r],n[r+1]),s.lineTo(n[r+2],n[r+3]),s.stroke()}for(let i=0;i<Xt;i+=ge){const n=Mi(i),a=[[0,n-140,"rgb(14,34,78)"],[n-140,n-50,"rgb(18,46,96)"],[n-50,n,"rgb(26,70,120)"],[n,n+7,"rgb(168,160,120)"]];for(const[r,o,l]of a)s.fillStyle=l,s.fillRect(r,i,Math.max(ge,o-r),ge)}for(const[i,n]of[[-8,"rgb(200,226,236)"],[-19,"rgb(120,172,204)"],[-32,"rgb(70,122,172)"]]){s.strokeStyle=n,s.lineWidth=ge*.7,s.beginPath();for(let a=-8;a<Xt+9;a+=8){const r=Mi(a)+i+3*Math.sin(a/23+i);a===-8?s.moveTo(r,a):s.lineTo(r,a)}s.stroke()}for(const i of Et.villages)for(let n=0;n<i.houses.length;n+=3)s.fillStyle=_s(Gm[i.houses[n+2]]),s.fillRect(i.houses[n],i.houses[n+1],ge,ge);for(let i=0;i<Et.airbases.length;i+=2){const n=Et.airbases[i],a=Et.airbases[i+1];s.fillStyle="rgb(86,88,86)",s.fillRect(n-130,a-6,260,12),s.fillStyle="rgb(220,220,210)";for(let r=-120;r<120;r+=16)s.fillRect(n+r,a-1,8,Math.max(2,ge*.5));s.fillStyle="rgb(76,78,76)",s.fillRect(n-100,a+14,200,4),s.fillStyle="rgb(80,82,80)",s.fillRect(n-30,a+20,60,22)}for(const i of Et.cities){s.fillStyle=Fh(i.x,i.y)?"rgb(128,114,84)":"rgb(46,60,48)",s.beginPath(),s.arc(i.x,i.y,i.r*1.25,0,Math.PI*2),s.fill(),s.fillStyle="rgb(56,58,60)",s.beginPath(),s.arc(i.x,i.y,i.r,0,Math.PI*2),s.fill();for(const n of i.blocks)s.fillStyle=`rgb(${n.tone},${n.tone},${n.tone+6})`,s.fillRect(n.x,n.y,n.w,n.h);s.strokeStyle="rgb(176,160,110)",s.lineWidth=ge;for(const n of[-1,1])s.beginPath(),s.moveTo(i.x-i.r,i.y+n*6),s.lineTo(i.x+i.r,i.y+n*6),s.moveTo(i.x+n*6,i.y-i.r),s.lineTo(i.x+n*6,i.y+i.r),s.stroke()}s.strokeStyle="rgb(196,92,80)",s.lineWidth=ge,s.setLineDash([26,18]),ir(s,Et.border),s.stroke(),s.setLineDash([])}function B2(s){s.fillStyle="rgb(0,0,0)",s.fillRect(0,0,Gt,Xt),s.globalCompositeOperation="lighter";const t=(e,i,n,a,r)=>{s.fillStyle=_s(a),s.beginPath(),s.arc(e,i,r,0,Math.PI*2),s.fill(),s.fillStyle=_s([a[0]*2,a[1]*2,a[2]*2]),s.beginPath(),s.arc(e,i,Math.max(1,r/2),0,Math.PI*2),s.fill(),s.fillStyle=n,s.fillRect(e,i,ge*.5,ge*.5)};for(const e of Et.highways){s.lineCap="round",s.strokeStyle="rgb(40,26,6)",s.lineWidth=7,ir(s,e),s.stroke(),s.strokeStyle="rgb(110,74,22)",s.lineWidth=ge*.5,s.stroke();const i=Math.hypot(e[2]-e[0],e[3]-e[1]);s.fillStyle="rgb(255,196,110)";for(let n=0;n<i;n+=18)s.fillRect(e[0]+(e[2]-e[0])*n/i,e[1]+(e[3]-e[1])*n/i,ge*.5,ge*.5)}for(const e of Et.villages)for(let i=0,n=0;i<e.houses.length;i+=3,n++)(Math.floor(e.houses[i])+n)%3&&t(e.houses[i],e.houses[i+1],"rgb(255,214,140)",[26,18,6],4);for(let e=0;e<Et.airbases.length;e+=2){const i=Et.airbases[e],n=Et.airbases[e+1];s.fillStyle="rgb(235,235,220)";for(let a=-128;a<130;a+=12)s.fillRect(i+a,n-7,ge*.5,ge*.5),s.fillRect(i+a,n+6,ge*.5,ge*.5);s.fillStyle="rgb(40,230,90)";for(const a of[-131,129])s.fillRect(i+a,n-6,ge*.5,12);s.fillStyle="rgb(60,52,30)",s.fillRect(i-34,n+18,68,26)}for(const e of Et.cities){for(const[i,n]of[[1.2,[12,8,3]],[.95,[20,13,5]],[.65,[28,19,7]],[.35,[36,25,9]]])s.fillStyle=_s(n),s.beginPath(),s.arc(e.x,e.y,e.r*i,0,Math.PI*2),s.fill();s.strokeStyle="rgb(96,70,28)",s.lineWidth=ge*.5,s.beginPath();for(let i=-e.r+13;i<e.r;i+=26){const n=Math.sqrt(Math.max(0,e.r*e.r-i*i));s.moveTo(e.x+i,e.y-n),s.lineTo(e.x+i,e.y+n),s.moveTo(e.x-n,e.y+i),s.lineTo(e.x+n,e.y+i)}s.stroke(),s.strokeStyle="rgb(230,170,80)",s.lineWidth=ge*.7,s.beginPath();for(const i of[-1,1])s.moveTo(e.x-e.r,e.y+i*6),s.lineTo(e.x+e.r,e.y+i*6),s.moveTo(e.x+i*6,e.y-e.r),s.lineTo(e.x+i*6,e.y+e.r);s.stroke();for(const i of e.blocks){s.fillStyle="rgb(30,26,18)",s.fillRect(i.x,i.y,i.w,i.h);for(let n=0;n<i.lights.length;n+=3)s.fillStyle=_s(yS[i.lights[n+2]]),s.fillRect(i.x+i.lights[n],i.y+i.lights[n+1],ge*.6,ge*.6)}}s.globalCompositeOperation="source-over"}function k2(){const[s,t]=Dp();z2(t);const[e,i]=Dp();B2(i);const n=a=>{const r=new Ma(a);return r.colorSpace=wi,r.minFilter=$n,r.anisotropy=4,r.flipY=!1,r};return{day:n(s),night:n(e)}}const f0=.35;function d0(s){let t=s;return()=>(t=t*16807%2147483647,t/2147483647)}function p0(s,t,e,i,n){s.fillStyle=`rgb(${n},${n},${n+2})`,s.fillRect(0,0,t,e);const a=s.getImageData(0,0,t,e);for(let r=0;r<a.data.length;r+=4){const o=(i()-.5)*22;a.data[r]+=o,a.data[r+1]+=o,a.data[r+2]+=o}s.putImageData(a,0,0)}function H2(){const e=1.9692307692307693,i=96/48,n=document.createElement("canvas");n.width=2048,n.height=96;const a=n.getContext("2d"),r=d0(4242);p0(a,2048,96,r,70);const o=a.createLinearGradient(0,0,0,96);o.addColorStop(0,"rgba(0,0,0,0)"),o.addColorStop(.35,"rgba(10,10,10,0.25)"),o.addColorStop(.5,"rgba(10,10,10,0.32)"),o.addColorStop(.65,"rgba(10,10,10,0.25)"),o.addColorStop(1,"rgba(0,0,0,0)"),a.fillStyle=o,a.fillRect(0,0,2048,96),a.fillStyle="rgba(25,25,25,0.45)";for(let h=7.5;h<48;h+=7.5)a.fillRect(0,h*i,2048,1);for(let h=25;h<1040;h+=25)a.fillRect(h*e,0,1,96);for(const h of[0,1])for(let f=0;f<140;f++){const u=280+r()*420,d=(h===0?u:1040-u)*e,g=(8+r()*45)*e,v=(24+(r()<.5?-1:1)*(2.5+r()*4)+(r()-.5)*1.5)*i;a.fillStyle=`rgba(12,12,12,${.25+r()*.4})`,a.fillRect(h===0?d:d-g,v,g,Math.max(1,(.3+r()*.4)*i))}const l="rgb(205,205,198)";a.fillStyle=l,a.fillRect(0,1*i,2048,.9*i),a.fillRect(0,96-1.9*i,2048,.9*i);for(const h of[0,1]){const f=(h===0?6:1004)*e;for(let u=0;u<8;u++){const d=3+u*2.6;a.fillRect(f,(24-d-1.8)*i,30*e,1.8*i),a.fillRect(f,(24+d)*i,30*e,1.8*i)}}a.font=`bold ${Math.round(12*i)}px Arial, sans-serif`,a.textAlign="center",a.textBaseline="middle";for(const[h,f]of[[0,"09"],[1,"27"]]){a.save();const u=(h===0?50:990)*e;a.translate(u,96/2),a.rotate(h===0?Math.PI/2:-Math.PI/2),a.scale(1,3.2*(e/i)*.62),a.fillText(f,0,0),a.restore()}for(let h=70;h<940;h+=50)a.fillRect(h*e,(24-.45)*i,30*e,.9*i);for(const h of[0,1]){const f=(u,d)=>(h===0?u:1040-u-d)*e;a.fillRect(f(300,45),11*i,45*e,4*i),a.fillRect(f(300,45),33*i,45*e,4*i);for(const u of[150,450,600])for(const d of[-1,1])a.fillRect(f(u,22),(24+d*6-(d<0?1.8:0))*i,22*e,1.8*i),a.fillRect(f(u,22),(24+d*8.6-(d<0?1.8:0))*i,22*e,1.8*i)}const c=new Ma(n);return c.colorSpace=wi,c.anisotropy=8,c}function Ip(s,t,e,i,n){const a=document.createElement("canvas");a.width=s,a.height=t;const r=a.getContext("2d"),o=d0(s*31+t);p0(r,s,t,o,92);const l=s/e,c=t/i;r.fillStyle="rgba(40,40,40,0.35)";for(let f=5;f<e;f+=5)r.fillRect(f*l,0,1,t);for(let f=5;f<i;f+=5)r.fillRect(0,f*c,s,1);for(let f=0;f<e*i/900;f++)r.fillStyle=`rgba(20,18,15,${.1+o()*.2})`,r.beginPath(),r.ellipse(o()*s,o()*t,(1+o()*3)*l,(1+o()*2)*c,o()*3,0,Math.PI*2),r.fill();n(r,l,c);const h=new Ma(a);return h.colorSpace=wi,h.anisotropy=8,h.wrapS=h.wrapT=Pn,h}function Dc(s,t,e,i,n){const a=new ba(e,i,Math.max(1,Math.round(e/10)),Math.max(1,Math.round(i/10)));a.rotateX(-Math.PI/2);const r=a.attributes.position;for(let l=0;l<r.count;l++){const c=r.getX(l)+s,h=r.getZ(l)+t;r.setY(l,Eu(c,h)+f0)}a.computeVertexNormals(),a.computeBoundingSphere();const o=new St(a,n);return o.position.set(s,0,t),o}class G2{constructor(t){const e=v=>new ms({map:v,roughness:.88,metalness:0,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),i=e(H2()),n=e(Ip(1024,32,800,16,(v,m,p)=>{v.fillStyle="rgb(226,180,40)",v.fillRect(0,8*p-.15*p,800*m,.3*p+1),v.fillStyle="rgb(226,180,40)",v.fillRect(0,.4*p,800*m,.2*p+1),v.fillRect(0,15.4*p,800*m,.2*p+1)})),a=e(Ip(512,192,240,88,(v,m,p)=>{v.strokeStyle="rgb(226,180,40)",v.lineWidth=Math.max(1,.3*m);for(let M=0;M<6;M++){const y=(20+M*40)*m;v.beginPath(),v.moveTo(y,4*p),v.lineTo(y,60*p),v.moveTo(y-6*m,60*p),v.lineTo(y+6*m,60*p),v.stroke()}v.fillStyle="rgb(200,60,40)",v.fillRect(0,84*p,240*m,.6*p)})),r=new Be(.45,8,6);this.lightMat=new ze({color:16777215});const o=Et.airbases.length/2,l=2*19+2*10+2*10;this.lights=new Gi(r,this.lightMat,o*l),this.lights.instanceMatrix.setUsage(Rn),this.lights.userData.noShadow=!0;const c=new zt,h=new gt(1,.97,.88),f=new gt(.2,1,.35),u=new gt(1,.12,.08);let d=0;const g=(v,m,p)=>{c.makeTranslation(v,Eu(v,m)+f0+.4,m),this.lights.setMatrixAt(d,c),this.lights.setColorAt(d,p),d++};for(let v=0;v<Et.airbases.length;v+=2){const m=Et.airbases[v],p=Et.airbases[v+1],M=Te(m),y=we(p),S=260*pt,C=12*pt;t.add(Dc(M,y,S,C,i)),t.add(Dc(M,we(p+16),200*pt,4*pt,n)),t.add(Dc(M,we(p+31),60*pt,22*pt,a));for(let w=0;w<19;w++){const E=M-S/2+4+w*(S-8)/18;g(E,y-C/2-1,h),g(E,y+C/2+1,h)}for(let w=0;w<10;w++){const E=y-C/2+2+w*(C-4)/9;g(M-S/2-1.5,E,f),g(M+S/2+1.5,E,f),g(M-S/2-6,E,u),g(M+S/2+6,E,u)}}this.lights.count=d,t.add(this.lights),this.setNight(!1)}setNight(t){this.lightMat.color.setScalar(t?6:.9)}}const V2=new gt("#03050f"),Up=new gt("#1a2246"),Io=[58e-7,135e-7,331e-7],Uo=21e-6,Ic=8e3,Uc=1200,kh=14;function Np(s){const t=Math.max(s,0),e=Math.acos(t)*180/Math.PI;return 1/(t+.15*Math.pow(Math.max(93.885-e,.001),-1.253))}const W2=`
  const vec3 BR = vec3(5.8e-6, 13.5e-6, 33.1e-6);
  const float BM = 21e-6;
  const float HR = 8000.0;
  const float HM = 1200.0;
  const float SUN_E = ${kh.toFixed(1)};
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
  }`;class X2{constructor(){this.fog=new gu(12572398,16e3,42e3),this.sunDir=new T(.55,.62,.35).normalize(),this.day=new gt,this.tmp=new gt,this.lastAlt=-1,this.mat=new Se({side:di,depthWrite:!1,fog:!1,uniforms:{uSunDir:{value:this.sunDir},uAlt:{value:0},uNight:{value:0},uNightZenith:{value:V2},uNightHorizon:{value:Up}},vertexShader:`
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
        ${W2}
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
        }`}),this.mesh=new St(new Be(5e4,48,24),this.mat),this.mesh.renderOrder=-1,this.mesh.frustumCulled=!1}horizonColor(t,e){const i=this.sunDir,n=Math.exp(-t/Ic),a=Math.exp(-t/Uc),r=Np(.03),o=Np(i.y),l=.0596831,c=.76,h=.0795775*(1-c*c)/Math.pow(1+c*c,1.5),f=[0,0,0];for(let u=0;u<3;u++){const d=Io[u]*Ic*n*r+Uo*1.1*Uc*a*r,g=Io[u]*Ic*n*o+Uo*1.1*Uc*a*o,v=Math.exp(-g),m=Io[u]+Uo;f[u]=kh*v*(Io[u]*l+Uo*h)/m*(1-Math.exp(-d)),f[u]+=kh*.012*[.35,.5,.8][u]*(1-Math.exp(-d))*(.4+.6*i.y)}return e.setRGB(f[0],f[1],f[2])}update(t,e,i,n){const a=Math.max(0,e);this.mat.uniforms.uAlt.value=a,this.mat.uniforms.uNight.value=n,(Math.abs(a-this.lastAlt)>50||n!==this.mat.userData.night)&&(this.lastAlt=a,this.mat.userData.night=n,this.horizonColor(a,this.day),this.fog.color.copy(this.day).lerp(this.tmp.copy(Up),n)),this.mesh.position.set(t,e,i)}}const Fe=new Ae,Nc=new gt;function Y2(s){let t=s;return()=>(t=t*16807%2147483647,t/2147483647)}function q2(s){const t=Y2(99),e=new ui(1,1,1);e.translate(0,.5,0);let i=0;for(const u of Et.cities)i+=u.blocks.length;const n=new Gi(e,new be({color:16777215}),i);let a=0;for(const u of Et.cities)for(const d of u.blocks){const g=d.x+d.w/2,v=d.y+d.h/2,m=Math.hypot(g-u.x,v-u.y)/u.r,p=14+Math.pow(1-m,2)*110*(.4+.6*t()),M=Te(g),y=we(v);Fe.position.set(M,jt(M,y)-2,y),Fe.rotation.set(0,0,0),Fe.scale.set(d.w*pt*.8,p,d.h*pt*.8),Fe.updateMatrix(),n.setMatrixAt(a,Fe.matrix);const S=d.tone/255;n.setColorAt(a,Nc.setRGB(S,S,S+6/255,"srgb")),a++}s.add(n);let r=0;for(const u of Et.villages)r+=u.houses.length/3;const o=new Gi(e,new be({color:16777215}),r);a=0;for(const u of Et.villages)for(let d=0;d<u.houses.length;d+=3){const g=Te(u.houses[d]),v=we(u.houses[d+1]);Fe.position.set(g,jt(g,v)-1,v),Fe.rotation.set(0,t()*Math.PI,0),Fe.scale.set(9+t()*6,6+t()*4,8+t()*5),Fe.updateMatrix(),o.setMatrixAt(a,Fe.matrix);const m=Gm[u.houses[d+2]];o.setColorAt(a,Nc.setRGB(m[0]/255,m[1]/255,m[2]/255,"srgb")),a++}s.add(o);let l=0;for(const u of Et.forests)l+=u.trees.length/3;const c=new xa(1,2.6,6);c.translate(0,1.3,0);const h=new Gi(c,new be({color:16777215}),l);a=0;for(const u of Et.forests)for(let d=0;d<u.trees.length;d+=3){const g=Te(u.trees[d]),v=we(u.trees[d+1]),m=u.trees[d+2]*1.4;Fe.position.set(g,jt(g,v)-1,v),Fe.rotation.set(0,0,0),Fe.scale.set(m,m*1.2,m),Fe.updateMatrix(),h.setMatrixAt(a,Fe.matrix),h.setColorAt(a,Nc.setRGB(40/255,(80+t()*16)/255,34/255,"srgb")),a++}s.add(h);const f=new Gi(e,new be({color:7238768}),Et.airbases.length/2*4);a=0;for(let u=0;u<Et.airbases.length;u+=2)for(let d=0;d<4;d++){const g=Te(Et.airbases[u]-24+d*14+4.5),v=we(Et.airbases[u+1]+26+4.5);Fe.position.set(g,jt(g,v)-1,v),Fe.rotation.set(0,0,0),Fe.scale.set(9*pt*.9,11,9*pt*.9),Fe.updateMatrix(),f.setMatrixAt(a++,Fe.matrix)}s.add(f);for(const u of[n,o,h,f])u.frustumCulled=!1,u.instanceMatrix.needsUpdate=!0,u.instanceColor&&(u.instanceColor.needsUpdate=!0)}const Fp=5,Hh=Te(v1),Gh=we(_1),m0=Math.PI/2,Tu=document.getElementById("app"),yr=navigator.maxTouchPoints>0&&Math.min(screen.width,screen.height)<900||(navigator.hardwareConcurrency||8)<=4,Wi=new Oy({antialias:!yr,powerPreference:"high-performance"});Wi.setPixelRatio(Math.min(window.devicePixelRatio,yr?1.25:2));Wi.setSize(window.innerWidth,window.innerHeight);Tu.appendChild(Wi.domElement);Wi.toneMapping=eu;Wi.toneMappingExposure=1.15;Wi.outputColorSpace=wi;Wi.shadowMap.enabled=!0;const Me=new bm;Me.background=new gt(8893670);const Ps=new X2;Me.fog=Ps.fog;Me.add(Ps.mesh);const Vh=new Xy(14674687,4872762,1.1);Me.add(Vh);const fs=new Pm(16774368,2.2);fs.position.copy(Ps.sunDir);Me.environment=Qy(Wi,Ps.sunDir);const Wh=k2();yr&&aw(256);const Ls=new cw(Wh.day,Wh.night);Ls.material.uniforms.uSunDir.value.copy(Ps.sunDir);Me.add(Ls.mesh);q2(Me);const $2=new G2(Me),Xh=new E2;Me.add(Xh.mesh);const g0=new C2(Me),v0=new F2(Me),De=new p1(window.innerWidth/window.innerHeight),Kn=new nE(Wi,Me,De.camera,yr),vl=new o1(Me,De.camera,Ps.sunDir,yr?1024:2048),Dt=new IS(Tu),Ht=new h0(Tu),K2=new h1,I=new Jm,qe=new Dw(Me),_0=()=>qe.jets[qe.active].model;let Sr=!0;const Li=new FS,Qe=new Qm,Ms=new jS,wr=new tw(Me),Yh=new iw(Me),se=new sw,Z2=new T,M0=()=>I.speed*Math.sqrt(ya(I.pos.y)/1.225)/.514444;function J2(){if(I.onGround)return!0;const s=bu(I.pos.x,I.pos.z);return s.dist<4e3&&I.pos.y-bs(s.field.x,s.field.z)<305&&M0()<250}function j2(){if(se.active){se.stop(),Ht.say("RTB OFF - YOU HAVE CONTROL");return}if(I.onGround){Ht.say("ON THE RUNWAY - FULL POWER AND PULL TO TAKE OFF");return}wa(),Li.stop();const{field:s}=bu(I.pos.x,I.pos.z),t=dw(s,I.pos.x,I.pos.z,I.vel.x,I.vel.z);se.start(t,I,jt),Ht.say(`RTB - BASE ${s.id} RUNWAY ${t.ident}`),_i.play("switch")}let Fc=!0,Oc=1;function wa(){_l=null,Qe.stop(),Ms.stop(),wr.set(null)}function Q2(s){if(I.onGround){Ht.say(`${ur[s].name} - ON THE GROUND`);return}se.active&&se.stop();const t=I.pos.y-jt(I.pos.x,I.pos.z),i=sr.crossVectors(I.vel,I.liftUp).normalize().y>.02?-1:1,n={aglM:t,turnDir:i},a=JS(s,I,n),r=Qe.start(s,I,n);if(r){Ht.say(`${ur[s].name} - ${r}`);return}Li.stop(),wr.set(a?a.points:null),_l=a?a.points:null,Ms.start(a),Ht.say(`${s} ${ur[s].name}`),_i.play("switch")}function Op(s){s&&(Ht.say(`${s.name}  ${s.score}  ${"*".repeat(s.stars)}`),wr.set(null),_l=null,$o={text:`${s.name}  ${s.score}`,stars:s.stars,until:performance.now()+5e3})}let _l=null,$o=null;const x0=n0();let En=null,ol=1,qh=!1;const y0=new Sw(document.body),Au=new Ew(document.body,Wi.domElement),_r=new Tw(document.body),tb={pitch:0,roll:0,yaw:0,throttle:0,afterburner:!1};function Ru(){Object.assign(x0,n0()),En=null,ol=1,qh=!1,Au.set(null)}function Cu(s){y0.show(s),_r.show(s),s||Au.set(null)}const li=new mE,jn=new Fw;Me.add(jn.mesh);const eb=4.5,zc=[0,1].map(()=>{const s=new Lm({points:70,spacing:5,life:40,width:.4,widthOld:2.6,color:[1,1,1],alpha:.45,minAngular:9e-4});return Me.add(s.mesh),s}),zp=new T,yn=new T,Ka=new T,Bc=new T,Zi={blur:0,lines:0,time:0,heat:0,heatPos:new at,heatDir:new at,heatWidth:.02};function ib(s,t){Zi.time=ll;const e=t?Math.min(1,Math.max(0,(I.mach-.85)/1.3)):0,i=t&&I.afterburner?1:0;if(Zi.blur+=(e*.55+i*.25-Zi.blur)*.08,Zi.lines+=(Math.min(1,Math.max(0,(I.mach-1.05)/.9))*(t?1:0)*.8+i*.3-Zi.lines)*.08,Zi.heat=0,s.group.visible){const n=De.camera;s.group.localToWorld(yn.set(0,0,7));const a=yn.distanceTo(n.position);s.group.localToWorld(Ka.set(0,0,7+(I.afterburner?9:5))),s.group.localToWorld(Bc.set(0,.9,7)),yn.project(n),Ka.project(n),Bc.project(n),yn.z<1&&Ka.z<1&&a<220&&(Zi.heatPos.set(yn.x*.5+.5,yn.y*.5+.5),Zi.heatDir.set((Ka.x-yn.x)*.5,(Ka.y-yn.y)*.5),Zi.heatWidth=Math.max(.004,Math.abs(Bc.y-yn.y)*.5*1.3),Zi.heat=(.35+.65*I.throttle)*(I.afterburner?1.4:1)*(1-a/220))}Kn.setMotion(Zi)}const bn=new fE;Me.add(bn.mesh);const As=new zw(Me),pa=new Hw(Me),ee=new JE(Me);ee.onBlast=(s,t,e,i,n)=>As.spawn(s,t,e,i,n);const S0=(s,t,e,i,n)=>As.spawn(s,t,e,i,n),w0=s=>s.distanceTo(De.camera.position),Di=new o2(Me,ee,{say:s=>Ht.say(s),blast:S0,sound:(s,t)=>_i.play(s,t?w0(t):0),smoke:(s,t,e,i,n,a,r)=>bn.emit(s,t,e,i,n,a,r)});let Ko=!1,$h=!1;const Wn=Ls.material.uniforms,Pi=()=>Ko||$h;function Pu(){Pi()?(fs.color.set(8425664),fs.intensity=.3,Vh.intensity=.18,Wn.uSunColor.value.setRGB(.035,.05,.08),Wn.uSkyLight.value.setRGB(.03,.045,.07),Wn.uGroundLight.value.setRGB(.01,.012,.018),Wn.uNightMix.value=1):(fs.color.set(16774368),fs.intensity=2.2,Vh.intensity=1.1,Wn.uSunColor.value.setRGB(1,.95,.85).multiplyScalar(1.6),Wn.uSkyLight.value.setRGB(.55,.62,.75),Wn.uGroundLight.value.setRGB(.2,.22,.16),Wn.uNightMix.value=0),Me.environmentIntensity=Pi()?.12:1,vl.setSun(fs.color,fs.intensity),$2.setNight(Pi()),Kn.setNight(Pi())}let ne="start",Kh=0,ll=0,ci=0,Zh=0;const Er=new T,br=new Ei,Sn=new T,oa=new Ei;let xs=!0;const de=new lE;Me.add(de.group);const Oe=new T;let Jh=0;const nb=90,sb=240,Bp=3200,ab=720,nr=new T,Za=new T;let ds=0;const Lu=document.getElementById("down"),rb=document.getElementById("down-title"),jh=document.getElementById("down-hint"),ob=document.getElementById("fps"),lb=new _2(()=>Dt.queueStart());window.__fighterLevel={get:()=>Ln,set:s=>Nm(s)};const Tr=new M2(document.body,Wh.day.image,s=>{ne==="flying"&&b0(s)},qe);Tr.show(!1);const Mr=new bS({jet:I,threats:ee,start:{x:Hh,z:Gh,heading:m0},setDemoNight:s=>{$h!==s&&($h=s,Pu())},clearFx:()=>{bn.clear(),pa.clear(),As.clear(),jn.clear()},snapChase:()=>De.snap(I.pos,I.quat),snapTerrain:(s,t)=>Ls.snapTo(s,t)});function E0(){I.reset(Hh,Gh,m0),Er.copy(I.pos),br.copy(I.quat),ee.reset(Date.now()&2147483647|1),bn.clear(),pa.clear(),As.clear(),jn.clear(),Yh.clear(),_r.clear(),Di.reset(),qe.reset(Hh,Gh),Li.stop(),wa(),se.stop(),li.sel=null,Ht.clearLog(),xs=!0,de.hide(),Sr=!0,Ls.snapTo(I.pos.x,I.pos.z),De.snap(I.pos,I.quat)}function cb(){Mr.end(),lb.hide(),E0(),ne="flying",Lu.style.display="none",Ht.show(!0),Tr.show(!0),Cu(!0),Ru(),Dt.setTouchVisible(!0),qm(Ln)}function No(s,t,e){ne="down",Kh=0,I.alive=!1,qe.downActive(),AS(),Li.stop(),wa(),se.stop(),ds=Math.atan2(I.vel.z,I.vel.x)+Math.PI*.75,nr.copy(I.pos),t?(As.spawn(I.pos.x,I.pos.y,I.pos.z,60,2.2),_i.play("explode"),Dt.rumble(1,.8,800),xs=!1,Sr=!1,Di.burn(I.pos.x,I.pos.z),Oe.copy(I.pos),jh.textContent=e):(I.crashing=!0,de.eject(I.pos,I.vel),_i.play("ignite"),Dt.rumble(.8,.4,450),Oe.copy(I.pos),jh.textContent=`${e}  -  PILOT EJECTED`),rb.textContent=s,Lu.style.display="block",Ht.show(!1),Tr.show(!1),Cu(!1),Ru(),Dt.setTouchVisible(!1)}function kp(){ne="arriving",Jh=0,qe.active=qe.nextAlive();const s=Math.random()*Math.PI*2,t=Oe.x+Math.cos(s)*Bp,e=Oe.z+Math.sin(s)*Bp,i=Math.max(jt(t,e),jt(Oe.x,Oe.z))+1500;I.reset(t,e,Math.atan2(Oe.x-t,-(Oe.z-e))),I.pos.y=i,Er.copy(I.pos),br.copy(I.quat),xs=!0,Sr=!0,jn.clear();for(const n of ee.missiles.items)n.hide();Di.rearm(),jh.textContent=de.active?"PILOT LANDED SAFELY  -  NEW JET INBOUND":"NEW JET INBOUND"}function hb(){ne="flying",Lu.style.display="none",Ht.show(!0),Tr.show(!0),Cu(!0),Ru(),_r.clear(),Ht.say(`${qe.callsign} - YOU HAVE CONTROL`),qm(Ln),Dt.setTouchVisible(!0),De.snap(I.pos,I.quat)}function b0(s){if(s===qe.active||!qe.jets[s].alive)return;if(I.onGround){Ht.say("ON THE RUNWAY - TAKE OFF FIRST");return}_0().setGear(!1,99),qe.switchTo(s,I.pos,I.headingDeg*Math.PI/180);const t=qe.jets[s];I.reset(t.pos.x,t.pos.z,t.heading),I.pos.y=t.pos.y,Er.copy(I.pos),br.copy(I.quat),jn.clear(),Li.stop(),wa(),se.stop(),Di.rearm(),Ls.snapTo(I.pos.x,I.pos.z),De.snap(I.pos,I.quat),_i.play("switch"),Ht.say(`JET: ${t.callsign}`)}function ub(s,t){const e=ee.cm,i=t?` from ${t}`:"";if(s==="IR")return`heat-seeking missile${i}  -  ${e.flareCd===0?"flares (C) were ready":"flares were reloading: break hard late"}`;if(s==="RADAR"){const n=[e.chaffCd===0?"chaff (K)":"",e.ecmCd===0?"ECM (X)":""].filter(Boolean).join(" and ");return`radar-guided missile${i}  -  ${n?`${n} ${n.includes(" and ")?"were":"was"} ready`:"notch it: fly 90 deg across it and dive"}`}return`unguided rocket${i}  -  turning away escapes it`}function fb(){ci++,Dt.update(Ct);const s=Dt.consumeStart(),t=Dt.consumeFlare(),e=Dt.consumeEcm(),i=Dt.consume("chaff"),n=Dt.consume("bomb"),a=Dt.consume("agm"),r=Dt.consume("aam"),o=Dt.consume("aero");let l=0;$m.forEach((S,C)=>{Dt.consume(S)&&(l=C+1)});const c=Dt.consume("rtb"),h=Dt.consume("limiter");Dt.consume("mnvNext")&&(l=Oc,Oc=Oc%ZS+1);const f=Dt.consume("sam"),u=Dt.consume("nextJet"),d=Dt.consume("prevJet"),g=Dt.consume("p2Left"),v=Dt.consume("p2Right"),m=Dt.consume("p2Guided"),p=Dt.consume("p2Unguided"),M=Dt.consume("levelUp"),y=Dt.consume("levelDown");if(Dt.consume("twoPlayers")&&(li.on=!li.on,Dt.twoPlayers=li.on,m1(li.on),li.sel=null,Ht.say(li.on?"2 PLAYERS: PLAYER 2 COMMANDS THE LAUNCHERS":"1 PLAYER")),Dt.consumeNight()&&(Ko=!Ko,Pu(),ne==="flying"&&Ht.say(Ko?"NIGHT VIEW":"DAY VIEW")),g0.step(I.pos.x,I.pos.z,S0),qe.step(I.pos.x,I.pos.z),v0.step(),ne==="start"){if(s){cb();return}Mr.step(),I.step(Ct,null),jn.record(I.pos,ci),ee.step(Mr.tracking?I:null,!1)}else{ne==="down"?(Kh++,de.active?(de.step(jt(de.pos.x,de.pos.z)),de.landed&&Oe.copy(de.pos),de.landed&&de.landedFor>=nb&&!xs&&kp()):Kh>=sb&&kp()):ne==="flying"&&de.active?(de.step(jt(de.pos.x,de.pos.z)),de.landedFor>600&&de.hide()):ne==="arriving"&&(Jh++,de.step(jt(de.pos.x,de.pos.z)),(Math.hypot(I.pos.x-Oe.x,I.pos.z-Oe.z)<500||Jh>=ab)&&hb()),Er.copy(I.pos),br.copy(I.quat);const S=ne==="flying";if(xs){if(I.crashing)I.stepCrash(Ct);else{const E=S&&Li.active&&Li.control(I);En=S?Mw(x0,I.onGround?1:I.gLoad,Ct):null,S&&!I.onGround&&(ol=Math.max(ol,I.gLoad));const A=!!En&&En.controlsLost;En&&En.gloc&&!qh&&Ht.say("G-LOC - THE PILOT HAS BLACKED OUT"),qh=!!En&&En.gloc;const D=A?Object.assign(tb,{afterburner:I.afterburner}):Dt;S&&!A&&Qe.flying&&(Math.abs(Dt.pitch)>.15||Math.abs(Dt.roll)>.15||Math.abs(Dt.yaw)>.3)&&(Qe.handOver(),Ht.say("MANUAL - FOLLOW THE RINGS")),S&&!A&&se.active&&(Math.abs(Dt.pitch)>.15||Math.abs(Dt.roll)>.15||Math.abs(Dt.yaw)>.3)&&(se.stop(),Ht.say("RTB OFF - YOU HAVE CONTROL"));const _=S&&se.active?se.update(I,Ct):null;se.finished&&(se.finished=!1,Ht.say("STOPPED ON THE RUNWAY - FULL POWER AND PULL TO TAKE OFF"));const x=!_&&S&&Qe.flying?Qe.update(I,Ct):null;x&&t0(I,x),I.gearDown=se.active?se.gearDown:J2(),I.brakes=se.active?se.brakes:I.onGround&&I.throttle<.05&&!D.afterburner;const L=S?_??x??(E?Li.stick:D):null;if(I.onGround?I.stepGround(Ct,L,bs(I.pos.x,I.pos.z))?Ht.say("AIRBORNE"):S&&!i0(I.pos.x,I.pos.z,0)&&No("RAN OFF THE RUNWAY",!0,"slow down on the runway: power to idle brakes the wheels"):I.step(Ct,L),S&&Ms.on){const U=Ms.update(I.pos,I.vel,Ct);U?Op(U):Qe.finished&&!Qe.active&&Op(Ms.finish(I.pos,I.vel))}if(Qe.finished&&!Ms.on&&!Qe.active&&(Qe.finished=!1,wr.set(null)),E&&ci%2===0){sr.crossVectors(I.nose,I.bodyUp).normalize();for(let U=0;U<3;U++){const G=(U-1)*4,H=US[U];bn.emitRGB(I.pos.x+sr.x*G-I.nose.x*12,I.pos.y+sr.y*G-I.nose.y*12,I.pos.z+sr.z*G-I.nose.z*12,20,.6,9,H[0],H[1],H[2])}}}const C=jt(I.pos.x,I.pos.z),w=S&&!I.onGround&&!I.crashing?gw(I):null;w&&w.ok?(I.touchDown(bs(I.pos.x,I.pos.z)),wa(),Li.stop(),Ht.say(`LANDED  ${w.sink.toFixed(1)} m/s  ${w.off.toFixed(0)} m off centre  ${"*".repeat(w.stars)}`),Dt.rumble(.4,.3,200)):w&&ne==="flying"?(I.pos.y=C+1.5,No("CRASH LANDING",!0,w.why)):!I.onGround&&I.pos.y<=C+1.5&&(I.pos.y=C+1.5,S?No("CRASHED INTO THE GROUND",!0,"watch the height above ground - the PULL UP warning comes at 3,000 ft"):(As.spawn(I.pos.x,I.pos.y,I.pos.z,70,2.4),_i.play("explode",w0(I.pos)),Di.burn(I.pos.x,I.pos.z),xs=!1,Sr=!1)),I.crashing&&xs&&bn.emit(I.pos.x,I.pos.y,I.pos.z,4,3,14,.15),(S||ne==="arriving")&&jn.record(I.pos,ci)}if(S){const C=ee.cm;if(t&&(C.fireFlares(I.pos,I.vel)?(Ht.say("FLARES"),_i.play("flare"),Dt.rumble(.1,.45,90)):Ht.say(`FLARES RELOADING ${(C.flareCd/60).toFixed(1)} s`)),i&&(C.fireChaff(I.pos,I.vel)?(Ht.say("CHAFF"),_i.play("flare"),Dt.rumble(.1,.45,90)):Ht.say(`CHAFF RELOADING ${(C.chaffCd/60).toFixed(1)} s`)),l&&Q2(l),c&&j2(),h&&(I.limiterOff=!I.limiterOff,Ht.say(I.limiterOff?"AoA LIMITER OFF - the wing can stall and spin":"AoA LIMITER ON"),_i.play("switch")),o&&!Li.active&&(wa(),Ht.say(Li.start(I)),_i.play("switch")),f){const w=ee.nearestArmed(I.pos.x,I.pos.z,1e9);w&&ee.launch(w,I)?Ht.say(`${w.name} LAUNCH -> ${qe.callsign}`):Ht.say("NO SAM RESERVE LEFT")}if((u||d)&&b0(qe.nextAlive(d?-1:1)),(M||y)&&(Nm(Ln+(M?1:-1)),Ht.say(`LEVEL ${Ln}`)),li.on&&((g||v)&&li.pick(v?1:-1,I.pos,ee),(m||p)&&Ht.say(li.fire(m,I,ee))),n&&Di.dropBomb(I.pos,I.vel),a&&Di.fireMissile("AGM",I.pos,I.vel),r&&Di.fireMissile("AAM",I.pos,I.vel),(n||a||r)&&Dt.rumble(.3,.5,120),e){const w=C.fireEcm(I.pos,ee.missiles.items,ee.rand);w<0?Ht.say(`ECM RELOADING ${(C.ecmCd/60).toFixed(1)} s`):(Ht.say(w?`ECM - ${w} LOCK BROKEN`:"ECM"),_i.play("ignite"))}}ee.step(S?I:null,S),li.step(S?I.pos:null,ee),Di.step(),Zh+=ee.launchedThisFrame,S&&ee.launchedThisFrame>0&&(_i.play("ignite",2e3),Dt.rumble(.25,.6,220)),ee.decoyedThisFrame>0&&Ht.say(`FLARES - ${ee.decoyedThisFrame} SAM DECOYED`),S&&ee.hitThisFrame&&(_i.play("explode"),Dt.rumble(1,1,700),I.hp=Math.max(0,I.hp-O1),I.hp===0&&No("SHOT DOWN BY A SAM",!1,ub(ee.lastHitSeeker,ee.lastHitLauncher)))}if(ci%2===0){const S=ee.missiles.items;for(let A=0;A<S.length;A++){const D=S[A];D.active&&pa.track(D,D.guided?"guided":"unguided",ci)}const C=Di.items.items;for(let A=0;A<C.length;A++){const D=C[A];D.active&&D.kind!=="BOMB"&&pa.track(D,D.kind,ci)}pa.release();const w=ee.cm.flares.items;for(let A=0;A<w.length;A++){const D=w[A];D.active&&D.heat>.2&&ci%4===0&&ne!=="start"&&bn.emit(D.pos.x,D.pos.y,D.pos.z,2.5,1.5,5,.95)}const E=ee.cm.chaff.items;for(let A=0;A<E.length;A++){const D=E[A];D.active&&ci%6===0&&bn.emit(D.pos.x,D.pos.y,D.pos.z,3,6,22,.7)}}bn.update(Ct),As.update(Ct),ll+=Ct}let Hp=performance.now(),Ja=0,kc=0,Fo=0;function T0(s){requestAnimationFrame(T0);const t=Math.min(.25,(s-Hp)/1e3);Hp=s,Ja+=t;let e=0;for(;Ja>=Ct&&e<Fp;)fb(),Ja-=Ct,e++;e===Fp&&(Ja=0);const i=Ja/Ct;ne==="start"?(Sn.copy(I.pos),oa.copy(I.quat)):(Sn.copy(Er).lerp(I.pos,i),oa.copy(br).slerp(I.quat,i));const n=_0();n.group.visible=Sr,n.group.position.copy(Sn),n.group.quaternion.copy(oa),n.group.scale.setScalar(ne==="arriving"?Math.max(1,Sn.distanceTo(De.camera.position)/350):1),n.setFlame(I.throttle,I.afterburner,ll),n.setGear(I.gearDown&&ne!=="start",t);const a=ne==="flying";if(a&&Fc&&I.mach>=1?(Fc=!1,_i.play("boom"),Dt.rumble(.6,.3,300)):I.mach<.97&&(Fc=!0),n.setControls(a?Dt.roll:0,a?Dt.pitch:0,a?Dt.yaw:0,t),a&&I.gLoad>eb&&n.group.visible)for(let l=0;l<2;l++){const c=sl.WINGTIPS[l];n.group.localToWorld(zp.set(c[0],c[1],c[2])),zc[l].record(zp,ci)}else if(!a)for(const l of zc)l.clear();n.setNight(Pi(),ci),qe.sync(Pi(),ci),v0.sync(ci,Pi()),ee.syncMeshes(Pi(),De.camera.position),Di.sync(De.camera.position),g0.sync(Pi()),de.sync(),ne==="start"&&Mr.camera(De.camera,t)||(ne==="down"||ne==="arriving"?mb(t):De.update(t,Sn,oa,I.afterburner));const r=De.camera.position,o=Pi()?1:0;Ps.update(r.x,r.y,r.z,o),Xh.update(ll,o),Xh.mesh.visible=ne!=="start",jn.update(r,Sn,ci,o),pa.update(r,ci,o);for(const l of zc)l.update(r,ci,o?.35:1);if(Yh.attach(n.group),Yh.update(t,{pos:Sn,vel:I.vel,quat:oa,gLoad:I.gLoad,mach:I.mach,alpha:I.alpha},a&&n.group.visible,r,Pi(),ne==="start"?[]:ee.missiles.items,ne==="start"?[]:Di.items.items),Ls.follow(ne==="start"?r.x:Sn.x,ne==="start"?r.z:Sn.z),ne==="flying"){Ht.update(I,jt(I.pos.x,I.pos.z),De.camera,ee,Di,window.innerWidth,window.innerHeight),Ht.setTag(`${qe.callsign}   LEVEL ${Ln}${li.on?"   2 PLAYERS":""}${Li.active?"   "+Li.kind:""}${Qe.active?"   "+Qe.def.name+(Qe.flying?"":" (MANUAL)"):""}${se.active?`   RTB: ${se.phase} ${se.end.ident}${se.goArounds?" (GO AROUND)":""}`:""}${I.gearDown?"   GEAR DOWN":""}`),wr.update(Ms.i,Pi()),Ht.p2Mark(li.on?li.sel:null,li.on?li.status(I.pos):"",De.camera,window.innerWidth,window.innerHeight);const l=bu(I.pos.x,I.pos.z),c=se.active?se.end.field:l.field,h=Math.hypot(c.x-I.pos.x,c.z-I.pos.z),f=`RWY ${c.id}  ${h<1e3?`${h.toFixed(0)} m`:`${(h/1e3).toFixed(1)} km`}`;Tr.update(ee,qe,I.pos.x,I.pos.z,I.headingDeg*Math.PI/180,{x:c.x,z:c.z,label:f}),pb(t,c),Ht.rwyMark(I.onGround?null:Z2.set(c.x,bs(c.x,c.z)+5,c.z),f,De.camera,window.innerWidth,window.innerHeight)}if(K2.update(ne==="flying"?ee.painting:0,ne==="flying"?h0.lockCount(ee):0,Zh,ne==="flying"),Zh=0,vl.update(Me),ib(n,a),Kn.render(),kc++,Fo+=t,Fo>=.5){const l=kc/Fo;ob.textContent=ne==="start"?"":`${Math.round(l)} FPS`,gb(l),kc=0,Fo=0}}const Gp=new T,Vp=new T,db=navigator.maxTouchPoints>0&&Math.min(window.innerWidth,window.innerHeight)<600;function pb(s,t){const e=I.onGround?0:I.pos.y-An-Math.max(jt(I.pos.x,I.pos.z),bs(I.pos.x,I.pos.z)-1),i=Math.max(0,e)/.3048;Gp.copy(I.vel).normalize(),Vp.crossVectors(Gp,I.liftUp).normalize();const n=Math.atan2(-Vp.y,I.liftUp.y)*180/Math.PI,a=performance.now();let r=null;if(se.active&&(se.phase==="FINAL"||se.phase==="FLARE")){const h=se.rel(I.pos.x,I.pos.z),f=se.end.y+An+Math.max(0,100-h.along)*Math.tan(3*Math.PI/180);r={loc:Math.max(-1,Math.min(1,-h.cross/100)),gs:Math.max(-1,Math.min(1,(f-I.pos.y)/30))}}let o=null;(se.active||I.gearDown)&&(o=(Math.atan2(t.x-I.pos.x,-(t.z-I.pos.z))*180/Math.PI-I.headingDeg+540)%360-180);const l=Qe.active?{text:`${Qe.def.name}${Qe.flying?"":"  MANUAL"}`,stars:0}:$o&&a<$o.until?$o:null;y0.draw({q:oa,vel:I.vel,yaw:Math.atan2(-I.nose.x,-I.nose.z),bankDeg:n,headingDeg:I.headingDeg,iasKt:M0(),mach:I.mach,altFt:i<5e3?i:I.pos.y/.3048,radarAlt:i<5e3,vsiFpm:I.vel.y*196.85,gLoad:I.gLoad,maxG:ol,aoaDeg:I.alpha*180/Math.PI,power:I.throttle*100,isAfterburner:I.afterburner,limiterOff:I.limiterOff,stalled:I.stalled,onGround:I.onGround,navTurn:o,nowMs:a,mnv:l,aoaBracket:I.gearDown&&!I.onGround?qS:null,ils:r,dim:Pi()},De.camera,db),Au.set(En),_r.record(s,I.pos,I.mach,I.gLoad,!I.onGround);const c=[];for(const h of ee.missiles.items)h.active&&c.push(h.pos);_r.draw(a,s,{pos:I.pos,vel:I.vel,groundY:jt(I.pos.x,I.pos.z),ghost:_l,runway:se.active?se.end:null,missiles:c})}const Wp=new T,sr=new T,Xp=new T;function mb(s){const t=De.camera,e=1-Math.exp(-3*s);ne==="arriving"?(Wp.set(I.pos.x-Oe.x,0,I.pos.z-Oe.z).normalize(),Za.copy(Oe).addScaledVector(Wp,-24),Za.y=Oe.y+4,t.position.lerp(Za,e),Xp.copy(Oe).lerp(I.pos,.55),nr.lerp(Xp,1-Math.exp(-6*s))):de.active?(ds+=s*.12,t.position.set(de.pos.x+Math.cos(ds)*40,de.pos.y+7,de.pos.z+Math.sin(ds)*40),nr.set(de.pos.x,de.pos.y+4,de.pos.z)):(ds+=s*.1,Za.set(Oe.x+Math.cos(ds)*380,Oe.y+160,Oe.z+Math.sin(ds)*380),t.position.lerp(Za,e),nr.lerp(Oe,e));const i=jt(t.position.x,t.position.z)+3;t.position.y<i&&(t.position.y=i),t.up.set(0,1,0),t.lookAt(nr)}let Oo=0,ja=0;function gb(s){document.hidden||(Oo=s<40?Oo+1:0,!(Oo<4||ja>=4)&&(Oo=0,ja++,ja===1?(Wi.setPixelRatio(1),Kn.setPixelRatio(1),Kn.resize(window.innerWidth,window.innerHeight)):ja===2?Kn.setAO(!1):ja===3?Kn.setBloom(!1):vl.setEnabled(!1)))}window.addEventListener("resize",()=>{Wi.setSize(window.innerWidth,window.innerHeight),Kn.resize(window.innerWidth,window.innerHeight),De.resize(window.innerWidth/window.innerHeight),vl.resize(De.camera)});Pu();E0();Ht.show(!1);Mr.begin();requestAnimationFrame(T0);"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});
