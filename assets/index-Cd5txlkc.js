(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},t={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},n=1e3,r=1001,i=1002,a=1003,o=1004,s=1005,c=1006,l=1007,u=1008,d=1009,f=1010,p=1011,m=1012,h=1013,g=1014,_=1015,v=1016,y=1017,b=1018,x=1020,S=35902,C=35899,w=1021,T=1022,E=1023,D=1026,O=1027,k=1028,A=1029,j=1030,M=1031,N=1033,P=33776,F=33777,I=33778,ee=33779,te=35840,ne=35841,re=35842,ie=35843,ae=36196,oe=37492,L=37496,se=37488,ce=37489,le=37490,ue=37491,de=37808,fe=37809,pe=37810,me=37811,he=37812,ge=37813,_e=37814,ve=37815,ye=37816,be=37817,xe=37818,Se=37819,Ce=37820,we=37821,Te=36492,Ee=36494,De=36495,Oe=36283,ke=36284,Ae=36285,je=36286,R=2300,Me=2301,Ne=2302,Pe=2303,z=2400,Fe=2401,B=2402,V=3200,Ie=`srgb`,Le=`srgb-linear`,Re=`linear`,ze=`srgb`,Be=7680,Ve=35044,He=2e3;function Ue(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function We(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Ge(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Ke(){let e=Ge(`canvas`);return e.style.display=`block`,e}var qe={};function Je(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Ye(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function H(...e){e=Ye(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function U(...e){e=Ye(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Xe(...e){let t=e.join(` `);t in qe||(qe[t]=!0,H(...e))}function Ze(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Qe={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},$e=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},et=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),tt=1234567,nt=Math.PI/180,rt=180/Math.PI;function it(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(et[e&255]+et[e>>8&255]+et[e>>16&255]+et[e>>24&255]+`-`+et[t&255]+et[t>>8&255]+`-`+et[t>>16&15|64]+et[t>>24&255]+`-`+et[n&63|128]+et[n>>8&255]+`-`+et[n>>16&255]+et[n>>24&255]+et[r&255]+et[r>>8&255]+et[r>>16&255]+et[r>>24&255]).toLowerCase()}function W(e,t,n){return Math.max(t,Math.min(n,e))}function at(e,t){return(e%t+t)%t}function ot(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function st(e,t,n){return e===t?0:(n-e)/(t-e)}function ct(e,t,n){return(1-n)*e+n*t}function lt(e,t,n,r){return ct(e,t,1-Math.exp(-n*r))}function ut(e,t=1){return t-Math.abs(at(e,t*2)-t)}function dt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function ft(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function pt(e,t){return e+Math.floor(Math.random()*(t-e+1))}function mt(e,t){return e+Math.random()*(t-e)}function ht(e){return e*(.5-Math.random())}function gt(e){e!==void 0&&(tt=e);let t=tt+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function _t(e){return e*nt}function vt(e){return e*rt}function yt(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function bt(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function xt(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function St(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:H(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Ct(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function wt(e,t){if(t.constructor===Float32Array)return e;let n=Ct(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function Tt(e,t){if(t.constructor===Float32Array)return e;let n=Ct(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}var Et={DEG2RAD:nt,RAD2DEG:rt,generateUUID:it,clamp:W,euclideanModulo:at,mapLinear:ot,inverseLerp:st,lerp:ct,damp:lt,pingpong:ut,smoothstep:dt,smootherstep:ft,randInt:pt,randFloat:mt,randFloatSpread:ht,seededRandom:gt,degToRad:_t,radToDeg:vt,isPowerOfTwo:yt,ceilPowerOfTwo:bt,floorPowerOfTwo:xt,setQuaternionFromProperEuler:St,normalize:Tt,denormalize:wt},G=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=W(this.x,e.x,t.x),this.y=W(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=W(this.x,e,t),this.y=W(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(W(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(W(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Dt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:H(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(W(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},K=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(kt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(kt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=W(this.x,e.x,t.x),this.y=W(this.y,e.y,t.y),this.z=W(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=W(this.x,e,t),this.y=W(this.y,e,t),this.z=W(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(W(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ot.copy(this).projectOnVector(e),this.sub(Ot)}reflect(e){return this.sub(Ot.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(W(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ot=new K,kt=new Dt,q=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return Xe(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(At.makeScale(e,t)),this}rotate(e){return Xe(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(At.makeRotation(-e)),this}translate(e,t){return Xe(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(At.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},At=new q,jt=new q().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Mt=new q().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Nt(){let e={enabled:!0,workingColorSpace:Le,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=Ft(e.r),e.g=Ft(e.g),e.b=Ft(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=It(e.r),e.g=It(e.g),e.b=It(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Re:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Le]:{primaries:t,whitePoint:r,transfer:Re,toXYZ:jt,fromXYZ:Mt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Ie},outputColorSpaceConfig:{drawingBufferColorSpace:Ie}},[Ie]:{primaries:t,whitePoint:r,transfer:ze,toXYZ:jt,fromXYZ:Mt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Ie}}}),e}var Pt=Nt();function Ft(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function It(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Lt,Rt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Lt===void 0&&(Lt=Ge(`canvas`)),Lt.width=e.width,Lt.height=e.height;let t=Lt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Lt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Ge(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Ft(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Ft(t[e]/255)*255):t[e]=Ft(t[e]);return{data:t,width:e.width,height:e.height}}return H(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},zt=0,Bt=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:zt++}),this.uuid=it(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Vt(r[t].image)):e.push(Vt(r[t]))}else e=Vt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Vt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Rt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(H(`Texture: Unable to serialize Texture.`),{})}var Ht=0,Ut=new K,Wt=class e extends $e{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,i=r,a=r,o=c,s=u,l=E,f=d,p=e.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ht++}),this.uuid=it(),this.name=``,this.source=new Bt(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=o,this.minFilter=s,this.anisotropy=p,this.format=l,this.internalFormat=null,this.type=f,this.offset=new G(0,0),this.repeat=new G(1,1),this.center=new G(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new q,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Ut).x}get height(){return this.source.getSize(Ut).y}get depth(){return this.source.getSize(Ut).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){H(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?H(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case n:e.x-=Math.floor(e.x);break;case r:e.x=e.x<0?0:1;break;case i:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case n:e.y-=Math.floor(e.y);break;case r:e.y=e.y<0?0:1;break;case i:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Wt.DEFAULT_IMAGE=null,Wt.DEFAULT_MAPPING=300,Wt.DEFAULT_ANISOTROPY=1;var Gt=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=W(this.x,e.x,t.x),this.y=W(this.y,e.y,t.y),this.z=W(this.z,e.z,t.z),this.w=W(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=W(this.x,e,t),this.y=W(this.y,e,t),this.z=W(this.z,e,t),this.w=W(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(W(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Kt=class extends $e{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:c,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Gt(0,0,e,t),this.scissorTest=!1,this.viewport=new Gt(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new Wt({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:c,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Bt(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},qt=class extends Kt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Jt=class extends Wt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=a,this.minFilter=a,this.wrapR=r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Yt=class extends Wt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=a,this.minFilter=a,this.wrapR=r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Xt=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Zt.setFromMatrixColumn(e,0).length(),i=1/Zt.setFromMatrixColumn(e,1).length(),a=1/Zt.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose($t,e,en)}lookAt(e,t,n){let r=this.elements;return rn.subVectors(e,t),rn.lengthSq()===0&&(rn.z=1),rn.normalize(),tn.crossVectors(n,rn),tn.lengthSq()===0&&(Math.abs(n.z)===1?rn.x+=1e-4:rn.z+=1e-4,rn.normalize(),tn.crossVectors(n,rn)),tn.normalize(),nn.crossVectors(rn,tn),r[0]=tn.x,r[4]=nn.x,r[8]=rn.x,r[1]=tn.y,r[5]=nn.y,r[9]=rn.y,r[2]=tn.z,r[6]=nn.z,r[10]=rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],P=r[7],F=r[11],I=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*P,i[8]=a*C+o*D+s*j+c*F,i[12]=a*w+o*O+s*M+c*I,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*P,i[9]=l*C+u*D+d*j+f*F,i[13]=l*w+u*O+d*M+f*I,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*P,i[10]=p*C+m*D+h*j+g*F,i[14]=p*w+m*O+h*M+g*I,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*P,i[11]=_*C+v*D+y*j+b*F,i[15]=_*w+v*O+y*M+b*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Zt.set(r[0],r[1],r[2]).length(),o=Zt.set(r[4],r[5],r[6]).length(),s=Zt.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Qt.copy(this);let c=1/a,l=1/o,u=1/s;return Qt.elements[0]*=c,Qt.elements[1]*=c,Qt.elements[2]*=c,Qt.elements[4]*=l,Qt.elements[5]*=l,Qt.elements[6]*=l,Qt.elements[8]*=u,Qt.elements[9]*=u,Qt.elements[10]*=u,t.setFromRotationMatrix(Qt),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=He,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=He,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Zt=new K,Qt=new Xt,$t=new K(0,0,0),en=new K(1,1,1),tn=new K,nn=new K,rn=new K,an=new Xt,on=new Dt,sn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(W(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-W(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(W(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-W(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(W(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-W(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:H(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return an.makeRotationFromQuaternion(e),this.setFromRotationMatrix(an,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return on.setFromEuler(this),this.setFromQuaternion(on,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};sn.DEFAULT_ORDER=`XYZ`;var cn=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},ln=0,un=new K,dn=new Dt,fn=new Xt,pn=new K,mn=new K,hn=new K,gn=new Dt,_n=new K(1,0,0),vn=new K(0,1,0),yn=new K(0,0,1),bn={type:`added`},xn={type:`removed`},Sn={type:`childadded`,child:null},Cn={type:`childremoved`,child:null},wn=class e extends $e{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ln++}),this.uuid=it(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new K,n=new sn,r=new Dt,i=new K(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Xt},normalMatrix:{value:new q}}),this.matrix=new Xt,this.matrixWorld=new Xt,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new cn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return dn.setFromAxisAngle(e,t),this.quaternion.multiply(dn),this}rotateOnWorldAxis(e,t){return dn.setFromAxisAngle(e,t),this.quaternion.premultiply(dn),this}rotateX(e){return this.rotateOnAxis(_n,e)}rotateY(e){return this.rotateOnAxis(vn,e)}rotateZ(e){return this.rotateOnAxis(yn,e)}translateOnAxis(e,t){return un.copy(e).applyQuaternion(this.quaternion),this.position.add(un.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(_n,e)}translateY(e){return this.translateOnAxis(vn,e)}translateZ(e){return this.translateOnAxis(yn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(fn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?pn.copy(e):pn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),mn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?fn.lookAt(mn,pn,this.up):fn.lookAt(pn,mn,this.up),this.quaternion.setFromRotationMatrix(fn),r&&(fn.extractRotation(r.matrixWorld),dn.setFromRotationMatrix(fn),this.quaternion.premultiply(dn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(U(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(bn),Sn.child=e,this.dispatchEvent(Sn),Sn.child=null):U(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(xn),Cn.child=e,this.dispatchEvent(Cn),Cn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),fn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),fn.multiply(e.parent.matrixWorld)),e.applyMatrix4(fn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(bn),Sn.child=e,this.dispatchEvent(Sn),Sn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(mn,e,hn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(mn,gn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};wn.DEFAULT_UP=new K(0,1,0),wn.DEFAULT_MATRIX_AUTO_UPDATE=!0,wn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Tn=class extends wn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},En={type:`move`},Dn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Tn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Tn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new K,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new K),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Tn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new K,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new K,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(En)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Tn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},On={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},kn={h:0,s:0,l:0},An={h:0,s:0,l:0};function jn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var J=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ie){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Pt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Pt.workingColorSpace){return this.r=e,this.g=t,this.b=n,Pt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Pt.workingColorSpace){if(e=at(e,1),t=W(t,0,1),n=W(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=jn(i,r,e+1/3),this.g=jn(i,r,e),this.b=jn(i,r,e-1/3)}return Pt.colorSpaceToWorking(this,r),this}setStyle(e,t=Ie){function n(t){t!==void 0&&parseFloat(t)<1&&H(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:H(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);H(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ie){let n=On[e.toLowerCase()];return n===void 0?H(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ft(e.r),this.g=Ft(e.g),this.b=Ft(e.b),this}copyLinearToSRGB(e){return this.r=It(e.r),this.g=It(e.g),this.b=It(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ie){return Pt.workingToColorSpace(Mn.copy(this),e),Math.round(W(Mn.r*255,0,255))*65536+Math.round(W(Mn.g*255,0,255))*256+Math.round(W(Mn.b*255,0,255))}getHexString(e=Ie){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Pt.workingColorSpace){Pt.workingToColorSpace(Mn.copy(this),t);let n=Mn.r,r=Mn.g,i=Mn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Pt.workingColorSpace){return Pt.workingToColorSpace(Mn.copy(this),t),e.r=Mn.r,e.g=Mn.g,e.b=Mn.b,e}getStyle(e=Ie){Pt.workingToColorSpace(Mn.copy(this),e);let t=Mn.r,n=Mn.g,r=Mn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(kn),this.setHSL(kn.h+e,kn.s+t,kn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(kn),e.getHSL(An);let n=ct(kn.h,An.h,t),r=ct(kn.s,An.s,t),i=ct(kn.l,An.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Mn=new J;J.NAMES=On;var Nn=class extends wn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new sn,this.environmentIntensity=1,this.environmentRotation=new sn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Pn=new K,Fn=new K,In=new K,Ln=new K,Rn=new K,zn=new K,Bn=new K,Vn=new K,Hn=new K,Un=new K,Wn=new Gt,Gn=new Gt,Kn=new Gt,qn=class e{constructor(e=new K,t=new K,n=new K){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Pn.subVectors(e,t),r.cross(Pn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Pn.subVectors(r,t),Fn.subVectors(n,t),In.subVectors(e,t);let a=Pn.dot(Pn),o=Pn.dot(Fn),s=Pn.dot(In),c=Fn.dot(Fn),l=Fn.dot(In),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Ln)!==null&&Ln.x>=0&&Ln.y>=0&&Ln.x+Ln.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Ln)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Ln.x),s.addScaledVector(a,Ln.y),s.addScaledVector(o,Ln.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Wn.setScalar(0),Gn.setScalar(0),Kn.setScalar(0),Wn.fromBufferAttribute(e,t),Gn.fromBufferAttribute(e,n),Kn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Wn,i.x),a.addScaledVector(Gn,i.y),a.addScaledVector(Kn,i.z),a}static isFrontFacing(e,t,n,r){return Pn.subVectors(n,t),Fn.subVectors(e,t),Pn.cross(Fn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Pn.subVectors(this.c,this.b),Fn.subVectors(this.a,this.b),Pn.cross(Fn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Rn.subVectors(r,n),zn.subVectors(i,n),Vn.subVectors(e,n);let s=Rn.dot(Vn),c=zn.dot(Vn);if(s<=0&&c<=0)return t.copy(n);Hn.subVectors(e,r);let l=Rn.dot(Hn),u=zn.dot(Hn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(Rn,a);Un.subVectors(e,i);let f=Rn.dot(Un),p=zn.dot(Un);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(zn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Bn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Bn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Rn,a).addScaledVector(zn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Jn=class{constructor(e=new K(1/0,1/0,1/0),t=new K(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Xn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Xn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Xn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Xn):Xn.fromBufferAttribute(r,t),Xn.applyMatrix4(e.matrixWorld),this.expandByPoint(Xn);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Zn.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Zn.copy(e.boundingBox)),Zn.applyMatrix4(e.matrixWorld),this.union(Zn)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Xn),Xn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ir),ar.subVectors(this.max,ir),Qn.subVectors(e.a,ir),$n.subVectors(e.b,ir),er.subVectors(e.c,ir),tr.subVectors($n,Qn),nr.subVectors(er,$n),rr.subVectors(Qn,er);let t=[0,-tr.z,tr.y,0,-nr.z,nr.y,0,-rr.z,rr.y,tr.z,0,-tr.x,nr.z,0,-nr.x,rr.z,0,-rr.x,-tr.y,tr.x,0,-nr.y,nr.x,0,-rr.y,rr.x,0];return!cr(t,Qn,$n,er,ar)||(t=[1,0,0,0,1,0,0,0,1],!cr(t,Qn,$n,er,ar))?!1:(or.crossVectors(tr,nr),t=[or.x,or.y,or.z],cr(t,Qn,$n,er,ar))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Xn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Xn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Yn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Yn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Yn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Yn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Yn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Yn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Yn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Yn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Yn)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Yn=[new K,new K,new K,new K,new K,new K,new K,new K],Xn=new K,Zn=new Jn,Qn=new K,$n=new K,er=new K,tr=new K,nr=new K,rr=new K,ir=new K,ar=new K,or=new K,sr=new K;function cr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){sr.fromArray(e,a);let o=i.x*Math.abs(sr.x)+i.y*Math.abs(sr.y)+i.z*Math.abs(sr.z),s=t.dot(sr),c=n.dot(sr),l=r.dot(sr);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var lr=new K,ur=new G,dr=0,fr=class extends $e{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:dr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Ve,this.updateRanges=[],this.gpuType=_,this.version=0,this._normalizationScale=e===void 0?void 0:Ct(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ur.fromBufferAttribute(this,t),ur.applyMatrix3(e),this.setXY(t,ur.x,ur.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)lr.fromBufferAttribute(this,t),lr.applyMatrix3(e),this.setXYZ(t,lr.x,lr.y,lr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)lr.fromBufferAttribute(this,t),lr.applyMatrix4(e),this.setXYZ(t,lr.x,lr.y,lr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)lr.fromBufferAttribute(this,t),lr.applyNormalMatrix(e),this.setXYZ(t,lr.x,lr.y,lr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)lr.fromBufferAttribute(this,t),lr.transformDirection(e),this.setXYZ(t,lr.x,lr.y,lr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?wt(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?Tt(e,this.array):Math.round(e*t)}},pr=class extends fr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},mr=class extends fr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},hr=class extends fr{constructor(e,t,n){super(new Float32Array(e),t,n)}},gr=new Jn,_r=new K,vr=new K,yr=class{constructor(e=new K,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?gr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;_r.subVectors(e,this.center);let t=_r.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(_r,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(vr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(_r.copy(e.center).add(vr)),this.expandByPoint(_r.copy(e.center).sub(vr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},br=0,xr=new Xt,Sr=new wn,Cr=new K,wr=new Jn,Tr=new Jn,Er=new K,Dr=class e extends $e{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:br++}),this.uuid=it(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Ue(e)?mr:pr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new q().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return xr.makeRotationFromQuaternion(e),this.applyMatrix4(xr),this}rotateX(e){return xr.makeRotationX(e),this.applyMatrix4(xr),this}rotateY(e){return xr.makeRotationY(e),this.applyMatrix4(xr),this}rotateZ(e){return xr.makeRotationZ(e),this.applyMatrix4(xr),this}translate(e,t,n){return xr.makeTranslation(e,t,n),this.applyMatrix4(xr),this}scale(e,t,n){return xr.makeScale(e,t,n),this.applyMatrix4(xr),this}lookAt(e){return Sr.lookAt(e),Sr.updateMatrix(),this.applyMatrix4(Sr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Cr).negate(),this.translate(Cr.x,Cr.y,Cr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new hr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&H(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Jn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)U(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new K(-1/0,-1/0,-1/0),new K(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];wr.setFromBufferAttribute(n),this.morphTargetsRelative?(Er.addVectors(this.boundingBox.min,wr.min),this.boundingBox.expandByPoint(Er),Er.addVectors(this.boundingBox.max,wr.max),this.boundingBox.expandByPoint(Er)):(this.boundingBox.expandByPoint(wr.min),this.boundingBox.expandByPoint(wr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&U(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new yr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)U(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new K,1/0);else if(e){let n=this.boundingSphere.center;if(wr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Tr.setFromBufferAttribute(n),this.morphTargetsRelative?(Er.addVectors(wr.min,Tr.min),wr.expandByPoint(Er),Er.addVectors(wr.max,Tr.max),wr.expandByPoint(Er)):(wr.expandByPoint(Tr.min),wr.expandByPoint(Tr.max))}wr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Er.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Er));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Er.fromBufferAttribute(a,t),o&&(Cr.fromBufferAttribute(e,t),Er.add(Cr)),r=Math.max(r,n.distanceToSquared(Er))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&U(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){U(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new fr(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new K,s[e]=new K;let l=new K,u=new K,d=new K,f=new G,p=new G,m=new G,h=new K,g=new K;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new K,b=new K,x=new K,S=new K;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new fr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new K,i=new K,a=new K,o=new K,s=new K,c=new K,l=new K,u=new K;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Er.fromBufferAttribute(e,t),Er.normalize(),e.setXYZ(t,Er.x,Er.y,Er.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new fr(a,r,i)}if(this.index===null)return H(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Or=new K,kr=new K,Ar=new q,jr=class{constructor(e=new K(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Or.subVectors(n,t).cross(kr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Or),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ar.getNormalMatrix(e),r=this.coplanarPoint(Or).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Mr=0,Nr=class extends $e{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Mr++}),this.uuid=it(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new J(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Be,this.stencilZFail=Be,this.stencilZPass=Be,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){H(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?H(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new J().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new jr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new G().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new G().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Pr=new K,Fr=new K,Ir=new K,Lr=new K,Rr=class{constructor(e=new K,t=new K(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Pr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Pr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Pr.copy(this.origin).addScaledVector(this.direction,t),Pr.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Fr.copy(e).add(t).multiplyScalar(.5),Ir.copy(t).sub(e).normalize(),Lr.copy(this.origin).sub(Fr);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Ir),o=Lr.dot(this.direction),s=-Lr.dot(Ir),c=Lr.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Fr).addScaledVector(Ir,d),f}intersectSphere(e,t){if(e.radius<0)return null;Pr.subVectors(e.center,this.origin);let n=Pr.dot(this.direction),r=Pr.dot(Pr)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Pr)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,M,N;if(y>=b&&y>=x?(w=s,D=u,A=p,N=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,M=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,M=_)):b>=x?(w=c,D=d,A=m,N=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,M=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,M=v)):(w=l,D=f,A=h,N=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,M=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,M=g)),w===0)return null;let P=S/w,F=C/w,I=1/w,ee=T-P*D,te=E-F*D,ne=O-P*A,re=k-F*A,ie=j-P*N,ae=M-F*N,oe=ie*re-ae*ne,L=ee*ae-te*ie,se=ne*te-re*ee;if(r){if(oe<0||L<0||se<0)return null}else if((oe<0||L<0||se<0)&&(oe>0||L>0||se>0))return null;let ce=oe+L+se;if(ce===0)return null;let le=I*(oe*D+L*A+se*N);return(ce>0?le<0:le>0)?null:this.at(le/ce,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},zr=class extends Nr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new J(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Br=new Xt,Vr=new Rr,Hr=new yr,Ur=new K,Wr=new K,Gr=new K,Kr=new K,qr=new K,Jr=new K,Yr=new K,Xr=new K,Zr=class extends wn{constructor(e=new Dr,t=new zr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Jr.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(qr.fromBufferAttribute(s,e),a?Jr.addScaledVector(qr,r):Jr.addScaledVector(qr.sub(t),r))}t.add(Jr)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Hr.copy(n.boundingSphere),Hr.applyMatrix4(i),Vr.copy(e.ray).recast(e.near),Hr.containsPoint(Vr.origin)===!1&&(Vr.intersectSphere(Hr,Ur)===null||Vr.origin.distanceToSquared(Ur)>(e.far-e.near)**2)||(Br.copy(i).invert(),Vr.copy(e.ray).applyMatrix4(Br),(n.boundingBox===null||Vr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Vr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=$r(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=$r(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=$r(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=$r(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Qr(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Xr.copy(s),Xr.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Xr);return l<n.near||l>n.far?null:{distance:l,point:Xr.clone(),object:e}}function $r(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Wr),e.getVertexPosition(c,Gr),e.getVertexPosition(l,Kr);let u=Qr(e,t,n,r,Wr,Gr,Kr,Yr);if(u){let e=new K;qn.getBarycoord(Yr,Wr,Gr,Kr,e),i&&(u.uv=qn.getInterpolatedAttribute(i,s,c,l,e,new G)),a&&(u.uv1=qn.getInterpolatedAttribute(a,s,c,l,e,new G)),o&&(u.normal=qn.getInterpolatedAttribute(o,s,c,l,e,new K),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new K,materialIndex:0};qn.getNormal(Wr,Gr,Kr,t.normal),u.face=t,u.barycoord=e}return u}var ei=class extends Wt{constructor(e=null,t=1,n=1,r,i,o,s,c,l=a,u=a,d,f){super(null,o,s,c,l,u,r,i,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ti=class extends fr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ni=new Xt,ri=new Xt,ii=[],ai=new Jn,oi=new Xt,si=new Zr,ci=new yr,li=class extends Zr{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ti(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,oi)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Jn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ni),ai.copy(e.boundingBox).applyMatrix4(ni),this.boundingBox.union(ai)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new yr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ni),ci.copy(e.boundingSphere).applyMatrix4(ni),this.boundingSphere.union(ci)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(si.geometry=this.geometry,si.material=this.material,si.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ci.copy(this.boundingSphere),ci.applyMatrix4(n),e.ray.intersectsSphere(ci)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,ni),ri.multiplyMatrices(n,ni),si.matrixWorld=ri,si.raycast(e,ii);for(let e=0,n=ii.length;e<n;e++){let n=ii[e];n.instanceId=i,n.object=this,t.push(n)}ii.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ti(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new ei(new Float32Array(r*this.count),r,this.count,k,_));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ui=new yr,di=new G(.5,.5),fi=new K,pi=class{constructor(e=new jr,t=new jr,n=new jr,r=new jr,i=new jr,a=new jr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=He,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ui.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ui.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ui)}intersectsSprite(e){return ui.center.set(0,0,0),ui.radius=.7071067811865476+di.distanceTo(e.center),ui.applyMatrix4(e.matrixWorld),this.intersectsSphere(ui)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(fi.x=r.normal.x>0?e.max.x:e.min.x,fi.y=r.normal.y>0?e.max.y:e.min.y,fi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(fi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},mi=new Xt,hi=class e{constructor(){this.coordinateSystem=He,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];mi.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new pi),n[e].setFromProjectionMatrix(mi,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new pi),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},gi=class extends Nr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new J(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},_i=new K,vi=new K,yi=new Xt,bi=new Rr,xi=new yr,Si=new K,Ci=new K,wi=class extends wn{constructor(e=new Dr,t=new gi){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)_i.fromBufferAttribute(t,e-1),vi.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=_i.distanceTo(vi);e.setAttribute(`lineDistance`,new hr(n,1))}else H(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),xi.copy(n.boundingSphere),xi.applyMatrix4(r),xi.radius+=i,e.ray.intersectsSphere(xi)===!1)return;yi.copy(r).invert(),bi.copy(e.ray).applyMatrix4(yi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=Ti(this,e,bi,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=Ti(this,e,bi,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=Ti(this,e,bi,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=Ti(this,e,bi,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Ti(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(_i.fromBufferAttribute(s,i),vi.fromBufferAttribute(s,a),n.distanceSqToSegment(_i,vi,Si,Ci)>r)return;Si.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Si);if(!(c<t.near||c>t.far))return{distance:c,point:Ci.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Ei=new K,Di=new K,Oi=class extends wi{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)Ei.fromBufferAttribute(t,e),Di.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+Ei.distanceTo(Di);e.setAttribute(`lineDistance`,new hr(n,1))}else H(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},ki=class extends Wt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ai=class extends Wt{constructor(e,t,n=g,r,i,o,s=a,c=a,l,u=D,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},r,i,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Bt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},ji=class extends Ai{constructor(e,t=g,n=301,r,i,o=a,s=a,c,l=D){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,r,i,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Mi=class extends Wt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ni=class e extends Dr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new hr(c,3)),this.setAttribute(`normal`,new hr(l,3)),this.setAttribute(`uv`,new hr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new K;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Pi=class e extends Dr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new hr(u,3)),this.setAttribute(`normal`,new hr(d,3)),this.setAttribute(`uv`,new hr(f,2));function _(){let a=new K,_=new K,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new G,m=new K,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Fi=new K,Ii=new K,Li=new K,Ri=new qn,zi=class extends Dr{constructor(e=null,t=1){if(super(),this.type=`EdgesGeometry`,this.parameters={geometry:e,thresholdAngle:t},e!==null){let n=1e4,r=Math.cos(nt*t),i=e.getIndex(),a=e.getAttribute(`position`),o=i?i.count:a.count,s=[0,0,0],c=[`a`,`b`,`c`],l=[,,,],u=new Map,d=[];for(let e=0;e<o;e+=3){i?(s[0]=i.getX(e),s[1]=i.getX(e+1),s[2]=i.getX(e+2)):(s[0]=e,s[1]=e+1,s[2]=e+2);let{a:t,b:o,c:f}=Ri;if(t.fromBufferAttribute(a,s[0]),o.fromBufferAttribute(a,s[1]),f.fromBufferAttribute(a,s[2]),Ri.getNormal(Li),l[0]=`${Math.round(t.x*n)},${Math.round(t.y*n)},${Math.round(t.z*n)}`,l[1]=`${Math.round(o.x*n)},${Math.round(o.y*n)},${Math.round(o.z*n)}`,l[2]=`${Math.round(f.x*n)},${Math.round(f.y*n)},${Math.round(f.z*n)}`,l[0]!==l[1]&&l[1]!==l[2]&&l[2]!==l[0])for(let e=0;e<3;e++){let t=(e+1)%3,n=l[e],i=l[t],a=Ri[c[e]],o=Ri[c[t]],f=`${n}_${i}`,p=`${i}_${n}`,m=u.get(p);m?(Li.dot(m.normal)<=r&&(d.push(a.x,a.y,a.z),d.push(o.x,o.y,o.z)),u.set(p,null)):u.has(f)||u.set(f,{index0:s[e],index1:s[t],normal:Li.clone()})}}for(let e of u.values())if(e){let{index0:t,index1:n}=e;Fi.fromBufferAttribute(a,t),Ii.fromBufferAttribute(a,n),d.push(Fi.x,Fi.y,Fi.z),d.push(Ii.x,Ii.y,Ii.z)}this.setAttribute(`position`,new hr(d,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},Bi=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){H(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new G:new K);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new K,r=[],i=[],a=[],o=new K,s=new Xt;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new K)}i[0]=new K,a[0]=new K;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(W(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(W(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}},Vi=class extends Bi{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new G){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Hi=class extends Vi{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function Ui(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var Wi=new K,Gi=new K,Ki=new Ui,qi=new Ui,Ji=new Ui,Yi=class extends Bi{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new K){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Gi.subVectors(r[0],r[1]).add(r[0]),c=Gi);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(Wi.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=Wi),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),Ki.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),qi.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),Ji.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(Ki.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),qi.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),Ji.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(Ki.calc(s),qi.calc(s),Ji.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new K().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Xi(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function Zi(e,t){let n=1-e;return n*n*t}function Qi(e,t){return 2*(1-e)*e*t}function $i(e,t){return e*e*t}function ea(e,t,n,r){return Zi(e,t)+Qi(e,n)+$i(e,r)}function ta(e,t){let n=1-e;return n*n*n*t}function na(e,t){let n=1-e;return 3*n*n*e*t}function ra(e,t){return 3*(1-e)*e*e*t}function ia(e,t){return e*e*e*t}function aa(e,t,n,r,i){return ta(e,t)+na(e,n)+ra(e,r)+ia(e,i)}var oa=class extends Bi{constructor(e=new G,t=new G,n=new G,r=new G){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new G){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(aa(e,r.x,i.x,a.x,o.x),aa(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},sa=class extends Bi{constructor(e=new K,t=new K,n=new K,r=new K){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new K){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(aa(e,r.x,i.x,a.x,o.x),aa(e,r.y,i.y,a.y,o.y),aa(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ca=class extends Bi{constructor(e=new G,t=new G){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new G){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new G){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},la=class extends Bi{constructor(e=new K,t=new K){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new K){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new K){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ua=class extends Bi{constructor(e=new G,t=new G,n=new G){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new G){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(ea(e,r.x,i.x,a.x),ea(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},da=class extends Bi{constructor(e=new K,t=new K,n=new K){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new K){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(ea(e,r.x,i.x,a.x),ea(e,r.y,i.y,a.y),ea(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},fa=class extends Bi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new G){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(Xi(o,s.x,c.x,l.x,u.x),Xi(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new G().fromArray(n))}return this}},pa=Object.freeze({__proto__:null,ArcCurve:Hi,CatmullRomCurve3:Yi,CubicBezierCurve:oa,CubicBezierCurve3:sa,EllipseCurve:Vi,LineCurve:ca,LineCurve3:la,QuadraticBezierCurve:ua,QuadraticBezierCurve3:da,SplineCurve:fa}),ma=class extends Bi{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new pa[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new pa[n.type]().fromJSON(n))}return this.cacheLengths=null,this}},ha=class extends ma{constructor(e){super(),this.type=`Path`,this.currentPoint=new G,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new ca(this.currentPoint.clone(),new G(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new ua(this.currentPoint.clone(),new G(e,t),new G(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new oa(this.currentPoint.clone(),new G(e,t),new G(n,r),new G(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new fa([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new Vi(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},ga=class extends ha{constructor(e){super(e),this.uuid=it(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new ha().fromJSON(n))}return this}};function _a(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=va(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=Ta(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return ba(a,o,n,s,c,l,0),o}function va(e,t,n,r,i){let a;if(i===Ya(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=Ka(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=Ka(i/r|0,e[i],e[i+1],a);return a&&Ra(a,a.next)&&(qa(a),a=a.next),a}function ya(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(Ra(n,n.next)||La(n.prev,n,n.next)===0)){if(qa(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function ba(e,t,n,r,i,a,o){if(!e)return;!o&&a&&Aa(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?Sa(e,r,i,a):xa(e))t.push(c.i,e.i,l.i),qa(e),e=l.next,s=l.next;else if(e=l,e===s){o?o===1?(e=Ca(ya(e),t),ba(e,t,n,r,i,a,2)):o===2&&wa(e,t,n,r,i,a):ba(ya(e),t,n,r,i,a,1);break}}}function xa(e){let t=e.prev,n=e,r=e.next;if(La(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&Fa(i,s,a,c,o,l,m.x,m.y)&&La(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function Sa(e,t,n,r){let i=e.prev,a=e,o=e.next;if(La(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=Ma(p,m,t,n,r),v=Ma(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Fa(s,u,c,d,l,f,y.x,y.y)&&La(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Fa(s,u,c,d,l,f,b.x,b.y)&&La(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Fa(s,u,c,d,l,f,y.x,y.y)&&La(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Fa(s,u,c,d,l,f,b.x,b.y)&&La(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function Ca(e,t){let n=e;do{let r=n.prev,i=n.next.next;!Ra(r,i)&&za(r,n,n.next,i)&&Ua(r,i)&&Ua(i,r)&&(t.push(r.i,n.i,i.i),qa(n),qa(n.next),n=e=i),n=n.next}while(n!==e);return ya(n)}function wa(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&Ia(o,e)){let s=Ga(o,e);o=ya(o,o.next),s=ya(s,s.next),ba(o,t,n,r,i,a,0),ba(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function Ta(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=va(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(Na(o))}i.sort(Ea);for(let e=0;e<i.length;e++)n=Da(i[e],n);return n}function Ea(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function Da(e,t){let n=Oa(e,t);if(!n)return t;let r=Ga(n,e);return ya(r,r.next),ya(n,n.next)}function Oa(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(Ra(e,n))return n;do{if(Ra(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&Pa(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);Ua(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&ka(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function ka(e,t){return La(e.prev,e,t.prev)<0&&La(t.next,e,e.next)<0}function Aa(e,t,n,r){let i=e;do i.z===0&&(i.z=Ma(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,ja(i)}function ja(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function Ma(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function Na(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function Pa(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function Fa(e,t,n,r,i,a,o,s){return(e!==o||t!==s)&&Pa(e,t,n,r,i,a,o,s)}function Ia(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Ha(e,t)&&(Ua(e,t)&&Ua(t,e)&&Wa(e,t)&&(La(e.prev,e,t.prev)||La(e,t.prev,t))||Ra(e,t)&&La(e.prev,e,e.next)>0&&La(t.prev,t,t.next)>0)}function La(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function Ra(e,t){return e.x===t.x&&e.y===t.y}function za(e,t,n,r){let i=Va(La(e,t,n)),a=Va(La(e,t,r)),o=Va(La(n,r,e)),s=Va(La(n,r,t));return!!(i!==a&&o!==s||i===0&&Ba(e,n,t)||a===0&&Ba(e,r,t)||o===0&&Ba(n,e,r)||s===0&&Ba(n,t,r))}function Ba(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function Va(e){return e>0?1:e<0?-1:0}function Ha(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&za(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Ua(e,t){return La(e.prev,e,e.next)<0?La(e,t,e.next)>=0&&La(e,e.prev,t)>=0:La(e,t,e.prev)<0||La(e,e.next,t)<0}function Wa(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function Ga(e,t){let n=Ja(e.i,e.x,e.y),r=Ja(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function Ka(e,t,n,r){let i=Ja(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function qa(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function Ja(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ya(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var Xa=class{static triangulate(e,t,n=2){return _a(e,t,n)}},Za=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];Qa(e),$a(n,e);let a=e.length;t.forEach(Qa);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,$a(n,t[e]);let o=Xa.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function Qa(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function $a(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var eo=class e extends Dr{constructor(e=new ga([new G(.5,.5),new G(-.5,.5),new G(-.5,-.5),new G(.5,-.5)]),t={}){super(),this.type=`ExtrudeGeometry`,this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],i=[];for(let t=0,n=e.length;t<n;t++){let n=e[t];a(n)}this.setAttribute(`position`,new hr(r,3)),this.setAttribute(`uv`,new hr(i,2)),this.computeVertexNormals();function a(e){let a=[],o=t.curveSegments===void 0?12:t.curveSegments,s=t.steps===void 0?1:t.steps,c=t.depth===void 0?1:t.depth,l=t.bevelEnabled===void 0||t.bevelEnabled,u=t.bevelThickness===void 0?.2:t.bevelThickness,d=t.bevelSize===void 0?u-.1:t.bevelSize,f=t.bevelOffset===void 0?0:t.bevelOffset,p=t.bevelSegments===void 0?3:t.bevelSegments,m=t.extrudePath,h=t.UVGenerator===void 0?to:t.UVGenerator,g,_=!1,v,y,b,x;if(m){g=m.getSpacedPoints(s),_=!0,l=!1;let e=m.isCatmullRomCurve3?m.closed:!1;v=m.computeFrenetFrames(s,e),y=new K,b=new K,x=new K}l||(p=0,u=0,d=0,f=0);let S=e.extractPoints(o),C=S.shape,w=S.holes;if(!Za.isClockWise(C)){C=C.reverse();for(let e=0,t=w.length;e<t;e++){let t=w[e];Za.isClockWise(t)&&(w[e]=t.reverse())}}function T(e){let t=e[0];for(let n=1;n<=e.length;n++){let r=n%e.length,i=e[r],a=i.x-t.x,o=i.y-t.y,s=a*a+o*o,c=Math.max(Math.abs(i.x),Math.abs(i.y),Math.abs(t.x),Math.abs(t.y));s<=10000000000000001e-36*c*c?(e.splice(r,1),n--):t=i}}T(C),w.forEach(T);let E=w.length,D=C;for(let e=0;e<E;e++){let t=w[e];C=C.concat(t)}function O(e,t,n){return t||U(`ExtrudeGeometry: vec does not exist`),e.clone().addScaledVector(t,n)}let k=C.length;function A(e,t,n){let r,i,a,o=e.x-t.x,s=e.y-t.y,c=n.x-e.x,l=n.y-e.y,u=o*o+s*s,d=o*l-s*c;if(Math.abs(d)>2**-52){let d=Math.sqrt(u),f=Math.sqrt(c*c+l*l),p=t.x-s/d,m=t.y+o/d,h=n.x-l/f,g=n.y+c/f,_=((h-p)*l-(g-m)*c)/(o*l-s*c);r=p+o*_-e.x,i=m+s*_-e.y;let v=r*r+i*i;if(v<=2)return new G(r,i);a=Math.sqrt(v/2)}else{let e=!1;o>2**-52?c>2**-52&&(e=!0):o<-(2**-52)?c<-(2**-52)&&(e=!0):Math.sign(s)===Math.sign(l)&&(e=!0),e?(r=-s,i=o,a=Math.sqrt(u)):(r=o,i=s,a=Math.sqrt(u/2))}return new G(r/a,i/a)}let j=[];for(let e=0,t=D.length,n=t-1,r=e+1;e<t;e++,n++,r++)n===t&&(n=0),r===t&&(r=0),j[e]=A(D[e],D[n],D[r]);let M=[],N,P=j.concat();for(let e=0,t=E;e<t;e++){let t=w[e];N=[];for(let e=0,n=t.length,r=n-1,i=e+1;e<n;e++,r++,i++)r===n&&(r=0),i===n&&(i=0),N[e]=A(t[e],t[r],t[i]);M.push(N),P=P.concat(N)}let F;if(p===0)F=Za.triangulateShape(D,w);else{let e=[],t=[];for(let n=0;n<p;n++){let r=n/p,i=u*Math.cos(r*Math.PI/2),a=d*Math.sin(r*Math.PI/2)+f;for(let t=0,n=D.length;t<n;t++){let n=O(D[t],j[t],a);ie(n.x,n.y,-i),r===0&&e.push(n)}for(let e=0,n=E;e<n;e++){let n=w[e];N=M[e];let o=[];for(let e=0,t=n.length;e<t;e++){let t=O(n[e],N[e],a);ie(t.x,t.y,-i),r===0&&o.push(t)}r===0&&t.push(o)}}F=Za.triangulateShape(e,t)}let I=F.length,ee=d+f;for(let e=0;e<k;e++){let t=l?O(C[e],P[e],ee):C[e];_?(b.copy(v.normals[0]).multiplyScalar(t.x),y.copy(v.binormals[0]).multiplyScalar(t.y),x.copy(g[0]).add(b).add(y),ie(x.x,x.y,x.z)):ie(t.x,t.y,0)}for(let e=1;e<=s;e++)for(let t=0;t<k;t++){let n=l?O(C[t],P[t],ee):C[t];_?(b.copy(v.normals[e]).multiplyScalar(n.x),y.copy(v.binormals[e]).multiplyScalar(n.y),x.copy(g[e]).add(b).add(y),ie(x.x,x.y,x.z)):ie(n.x,n.y,c/s*e)}for(let e=p-1;e>=0;e--){let t=e/p,n=u*Math.cos(t*Math.PI/2),r=d*Math.sin(t*Math.PI/2)+f;for(let e=0,t=D.length;e<t;e++){let t=O(D[e],j[e],r);ie(t.x,t.y,c+n)}for(let e=0,t=w.length;e<t;e++){let t=w[e];N=M[e];for(let e=0,i=t.length;e<i;e++){let i=O(t[e],N[e],r);_?ie(i.x,i.y+g[s-1].y,g[s-1].x+n):ie(i.x,i.y,c+n)}}}te(),ne();function te(){let e=r.length/3;if(l){let e=0,t=k*e;for(let e=0;e<I;e++){let n=F[e];ae(n[2]+t,n[1]+t,n[0]+t)}e=s+p*2,t=k*e;for(let e=0;e<I;e++){let n=F[e];ae(n[0]+t,n[1]+t,n[2]+t)}}else{for(let e=0;e<I;e++){let t=F[e];ae(t[2],t[1],t[0])}for(let e=0;e<I;e++){let t=F[e];ae(t[0]+k*s,t[1]+k*s,t[2]+k*s)}}n.addGroup(e,r.length/3-e,0)}function ne(){let e=r.length/3,t=0;re(D,t),t+=D.length;for(let e=0,n=w.length;e<n;e++){let n=w[e];re(n,t),t+=n.length}n.addGroup(e,r.length/3-e,1)}function re(e,t){let n=e.length;for(;--n>=0;){let r=n,i=n-1;i<0&&(i=e.length-1);for(let e=0,n=s+p*2;e<n;e++){let n=k*e,a=k*(e+1);oe(t+r+n,t+i+n,t+i+a,t+r+a)}}}function ie(e,t,n){a.push(e),a.push(t),a.push(n)}function ae(e,t,i){L(e),L(t),L(i);let a=r.length/3,o=h.generateTopUV(n,r,a-3,a-2,a-1);se(o[0]),se(o[1]),se(o[2])}function oe(e,t,i,a){L(e),L(t),L(a),L(t),L(i),L(a);let o=r.length/3,s=h.generateSideWallUV(n,r,o-6,o-3,o-2,o-1);se(s[0]),se(s[1]),se(s[3]),se(s[1]),se(s[2]),se(s[3])}function L(e){r.push(a[e*3+0]),r.push(a[e*3+1]),r.push(a[e*3+2])}function se(e){i.push(e.x),i.push(e.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return no(t,n,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new pa[i.type]().fromJSON(i)),new e(r,t.options)}},to={generateTopUV:function(e,t,n,r,i){let a=t[n*3],o=t[n*3+1],s=t[r*3],c=t[r*3+1],l=t[i*3],u=t[i*3+1];return[new G(a,o),new G(s,c),new G(l,u)]},generateSideWallUV:function(e,t,n,r,i,a){let o=t[n*3],s=t[n*3+1],c=t[n*3+2],l=t[r*3],u=t[r*3+1],d=t[r*3+2],f=t[i*3],p=t[i*3+1],m=t[i*3+2],h=t[a*3],g=t[a*3+1],_=t[a*3+2];return Math.abs(s-u)<Math.abs(o-l)?[new G(o,1-c),new G(l,1-d),new G(f,1-m),new G(h,1-_)]:[new G(s,1-c),new G(u,1-d),new G(p,1-m),new G(g,1-_)]}};function no(e,t,n){if(n.shapes=[],Array.isArray(e))for(let t=0,r=e.length;t<r;t++){let r=e[t];n.shapes.push(r.uuid)}else n.shapes.push(e.uuid);return n.options=Object.assign({},t),t.extrudePath!==void 0&&(n.options.extrudePath=t.extrudePath.toJSON()),n}var ro=class e extends Dr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new hr(p,3)),this.setAttribute(`normal`,new hr(m,3)),this.setAttribute(`uv`,new hr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};function io(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(oo(i))i.isRenderTargetTexture?(H(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(oo(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function ao(e){let t={};for(let n=0;n<e.length;n++){let r=io(e[n]);for(let e in r)t[e]=r[e]}return t}function oo(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function so(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function co(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Pt.workingColorSpace}var lo={clone:io,merge:ao},uo=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,fo=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,po=class extends Nr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=uo,this.fragmentShader=fo,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=io(e.uniforms),this.uniformsGroups=so(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new J().setHex(r.value);break;case`v2`:this.uniforms[n].value=new G().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new K().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Gt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new q().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Xt().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},mo=class extends po{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},ho=class extends Nr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new J(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new J(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new G(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},go=class extends Nr{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new J(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new J(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new G(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},_o=class extends Nr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=V,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},vo=class extends Nr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function yo(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function bo(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var xo=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},So=class extends xo{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:z,endingEnd:z}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Fe:i=e,o=2*t-n;break;case B:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Fe:a=e,s=2*n-t;break;case B:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Co=class extends xo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},wo=class extends xo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},To=class extends xo{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Oo(n,t,g,y,r);i[p]=Eo(x,o,_,b,m)}return i}};function Eo(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Do(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Oo(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Eo(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Do(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var ko=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=yo(t,this.TimeBufferType),this.values=yo(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:yo(e.times,Array),values:yo(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),bo(e.settings)&&(n.settings={inTangents:yo(e.settings.inTangents,Array),outTangents:yo(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new wo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Co(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new So(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new To(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case R:t=this.InterpolantFactoryMethodDiscrete;break;case Me:t=this.InterpolantFactoryMethodLinear;break;case Ne:t=this.InterpolantFactoryMethodSmooth;break;case Pe:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return H(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return R;case this.InterpolantFactoryMethodLinear:return Me;case this.InterpolantFactoryMethodSmooth:return Ne;case this.InterpolantFactoryMethodBezier:return Pe}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;bo(this.settings)&&(Ao(this.settings.inTangents,e),Ao(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;bo(this.settings)&&(jo(this.settings.inTangents,e),jo(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(U(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(U(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){U(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){U(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&We(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){U(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Ne,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,bo(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Ao(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function jo(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}ko.prototype.ValueTypeName=``,ko.prototype.TimeBufferType=Float32Array,ko.prototype.ValueBufferType=Float32Array,ko.prototype.DefaultInterpolation=Me;var Mo=class extends ko{constructor(e,t,n){super(e,t,n)}};Mo.prototype.ValueTypeName=`bool`,Mo.prototype.ValueBufferType=Array,Mo.prototype.DefaultInterpolation=R,Mo.prototype.InterpolantFactoryMethodLinear=void 0,Mo.prototype.InterpolantFactoryMethodSmooth=void 0;var No=class extends ko{constructor(e,t,n,r){super(e,t,n,r)}};No.prototype.ValueTypeName=`color`;var Po=class extends ko{constructor(e,t,n,r){super(e,t,n,r)}};Po.prototype.ValueTypeName=`number`;var Fo=class extends xo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Dt.slerpFlat(i,0,a,c-o,a,c,s);return i}},Io=class extends ko{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Fo(this.times,this.values,this.getValueSize(),e)}};Io.prototype.ValueTypeName=`quaternion`,Io.prototype.InterpolantFactoryMethodSmooth=void 0;var Lo=class extends ko{constructor(e,t,n){super(e,t,n)}};Lo.prototype.ValueTypeName=`string`,Lo.prototype.ValueBufferType=Array,Lo.prototype.DefaultInterpolation=R,Lo.prototype.InterpolantFactoryMethodLinear=void 0,Lo.prototype.InterpolantFactoryMethodSmooth=void 0;var Ro=class extends ko{constructor(e,t,n,r){super(e,t,n,r)}};Ro.prototype.ValueTypeName=`vector`;var zo=class extends wn{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new J(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Bo=class extends zo{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(wn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new J(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Vo=new Xt,Ho=new K,Uo=new K,Wo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new G(512,512),this.mapType=d,this.map=null,this.mapPass=null,this.matrix=new Xt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new pi,this._frameExtents=new G(1,1),this._viewportCount=1,this._viewports=[new Gt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Ho.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ho),Uo.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Uo),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Vo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Vo,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Vo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Go=new K,Ko=new Dt,qo=new K,Jo=class extends wn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Xt,this.projectionMatrix=new Xt,this.projectionMatrixInverse=new Xt,this.coordinateSystem=He,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Go,Ko,qo),qo.x===1&&qo.y===1&&qo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Go,Ko,qo.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Go,Ko,qo),qo.x===1&&qo.y===1&&qo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Go,Ko,qo.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Yo=new K,Xo=new G,Zo=new G,Qo=class extends Jo{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=rt*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(nt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rt*2*Math.atan(Math.tan(nt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Yo.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yo.x,Yo.y).multiplyScalar(-e/Yo.z),Yo.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yo.x,Yo.y).multiplyScalar(-e/Yo.z)}getViewSize(e,t){return this.getViewBounds(e,Xo,Zo),t.subVectors(Zo,Xo)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(nt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},$o=class extends Wo{constructor(){super(new Qo(90,1,.5,500)),this.isPointLightShadow=!0}},es=class extends zo{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new $o}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},ts=class extends Jo{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ns=class extends Wo{constructor(){super(new ts(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},rs=class extends zo{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(wn.DEFAULT_UP),this.updateMatrix(),this.target=new wn,this.shadow=new ns}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},is=class extends zo{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},as=-90,os=1,ss=class extends wn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Qo(as,os,e,t);r.layers=this.layers,this.add(r);let i=new Qo(as,os,e,t);i.layers=this.layers,this.add(i);let a=new Qo(as,os,e,t);a.layers=this.layers,this.add(a);let o=new Qo(as,os,e,t);o.layers=this.layers,this.add(o);let s=new Qo(as,os,e,t);s.layers=this.layers,this.add(s);let c=new Qo(as,os,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},cs=class extends Qo{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},ls=`\\[\\]\\.:\\/`,us=RegExp(`[\\[\\]\\.:\\/]`,`g`),ds=`[^\\[\\]\\.:\\/]`,fs=`[^`+ls.replace(`\\.`,``)+`]`,ps=`((?:WC+[\\/:])*)`.replace(`WC`,ds),ms=`(WCOD+)?`.replace(`WCOD`,fs),hs=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,ds),gs=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,ds),_s=RegExp(`^`+ps+ms+hs+gs+`$`),vs=[`material`,`materials`,`bones`,`map`],ys=class{constructor(e,t,n){let r=n||bs.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},bs=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(us,``)}static parseTrackName(e){let t=_s.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);vs.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){H(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){U(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){U(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){U(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){U(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){U(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){U(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){U(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;U(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){U(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){U(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};bs.Composite=ys,bs.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},bs.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},bs.prototype.GetterByBindingType=[bs.prototype._getValue_direct,bs.prototype._getValue_array,bs.prototype._getValue_arrayElement,bs.prototype._getValue_toArray],bs.prototype.SetterByBindingTypeAndVersioning=[[bs.prototype._setValue_direct,bs.prototype._setValue_direct_setNeedsUpdate,bs.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[bs.prototype._setValue_array,bs.prototype._setValue_array_setNeedsUpdate,bs.prototype._setValue_array_setMatrixWorldNeedsUpdate],[bs.prototype._setValue_arrayElement,bs.prototype._setValue_arrayElement_setNeedsUpdate,bs.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[bs.prototype._setValue_fromArray,bs.prototype._setValue_fromArray_setNeedsUpdate,bs.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var xs=new Xt,Ss=class{constructor(e,t,n=0,r=1/0){this.ray=new Rr(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new cn,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):U(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return xs.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(xs),this}intersectObject(e,t=!0,n=[]){return ws(e,this,n,t),n.sort(Cs),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)ws(e[r],this,n,t);return n.sort(Cs),n}};function Cs(e,t){return e.distance-t.distance}function ws(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)ws(r[e],t,n,!0)}}var Ts=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){let e=1e-6;return this.phi=W(this.phi,e,Math.PI-e),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(W(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};(class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});var Es=class extends Oi{constructor(e=10,t=10,n=4473924,r=8947848){n=new J(n),r=new J(r);let i=t/2,a=e/t,o=e/2,s=[],c=[];for(let e=0,l=0,u=-o;e<=t;e++,u+=a){s.push(-o,0,u,o,0,u),s.push(u,0,-o,u,0,o);let t=e===i?n:r;t.toArray(c,l),l+=3,t.toArray(c,l),l+=3,t.toArray(c,l),l+=3,t.toArray(c,l),l+=3}let l=new Dr;l.setAttribute(`position`,new hr(s,3)),l.setAttribute(`color`,new hr(c,3));let u=new gi({vertexColors:!0,toneMapped:!1});super(l,u),this.type=`GridHelper`}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},Ds=class extends $e{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Os(e,t,n,r){let i=ks(r);switch(n){case w:return e*t;case k:return e*t/i.components*i.byteLength;case A:return e*t/i.components*i.byteLength;case j:return e*t*2/i.components*i.byteLength;case M:return e*t*2/i.components*i.byteLength;case T:return e*t*3/i.components*i.byteLength;case E:return e*t*4/i.components*i.byteLength;case N:return e*t*4/i.components*i.byteLength;case P:case F:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case I:case ee:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ne:case ie:return Math.max(e,16)*Math.max(t,8)/4;case te:case re:return Math.max(e,8)*Math.max(t,8)/2;case ae:case oe:case se:case ce:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case L:case le:case ue:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case de:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case fe:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case pe:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case me:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case he:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ge:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case _e:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case ve:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case ye:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case be:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case xe:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Se:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Ce:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case we:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Te:case Ee:case De:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Oe:case ke:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Ae:case je:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function ks(e){switch(e){case d:case f:return{byteLength:1,components:1};case m:case p:case v:return{byteLength:2,components:1};case y:case b:return{byteLength:2,components:4};case g:case h:case _:return{byteLength:4,components:1};case S:case C:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?H(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);function As(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function js(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Ms={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
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
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
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
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
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
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
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
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
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
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
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
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
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
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
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
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
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
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
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
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
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
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
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
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
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
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
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
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
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
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
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
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
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
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
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
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
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
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
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
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
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
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
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
		return 0.5 / max( gv + gl, EPSILON );
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
		float roughness = max( material.clearcoatRoughness, 0.045 );
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
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
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
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
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
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
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
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
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
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
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
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
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
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
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
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
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
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
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
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
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
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
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
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
	#ifdef DOUBLE_SIDED
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
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
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
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
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
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
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
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
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
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
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
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
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
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
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
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
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
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
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
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
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
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
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
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
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
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
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
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
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
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
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
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
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
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
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
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
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
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
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
}`,depth_frag:`#if DEPTH_PACKING == 3200
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
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
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
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
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
}`,linedashed_frag:`uniform vec3 diffuse;
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
}`,meshbasic_vert:`#include <common>
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
}`,meshbasic_frag:`uniform vec3 diffuse;
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
}`,meshlambert_vert:`#define LAMBERT
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
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
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
}`,meshmatcap_vert:`#define MATCAP
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
}`,meshmatcap_frag:`#define MATCAP
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
}`,meshnormal_vert:`#define NORMAL
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
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
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
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
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
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
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
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
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
}`,meshphysical_vert:`#define STANDARD
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
}`,meshphysical_frag:`#define STANDARD
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
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
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
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
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
}`,meshtoon_vert:`#define TOON
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
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
}`,points_vert:`uniform float size;
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
}`,points_frag:`uniform vec3 diffuse;
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
}`,shadow_vert:`#include <common>
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
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
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
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
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
}`,sprite_frag:`uniform vec3 diffuse;
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
}`},Y={common:{diffuse:{value:new J(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new q},alphaMap:{value:null},alphaMapTransform:{value:new q},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new q}},envmap:{envMap:{value:null},envMapRotation:{value:new q},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new q}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new q}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new q},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new q},normalScale:{value:new G(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new q},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new q}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new q}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new q}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new J(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new J(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new q},alphaTest:{value:0},uvTransform:{value:new q}},sprite:{diffuse:{value:new J(16777215)},opacity:{value:1},center:{value:new G(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new q},alphaMap:{value:null},alphaMapTransform:{value:new q},alphaTest:{value:0}}},Ns={basic:{uniforms:ao([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.fog]),vertexShader:Ms.meshbasic_vert,fragmentShader:Ms.meshbasic_frag},lambert:{uniforms:ao([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,Y.lights,{emissive:{value:new J(0)},envMapIntensity:{value:1}}]),vertexShader:Ms.meshlambert_vert,fragmentShader:Ms.meshlambert_frag},phong:{uniforms:ao([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,Y.lights,{emissive:{value:new J(0)},specular:{value:new J(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ms.meshphong_vert,fragmentShader:Ms.meshphong_frag},standard:{uniforms:ao([Y.common,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.roughnessmap,Y.metalnessmap,Y.fog,Y.lights,{emissive:{value:new J(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ms.meshphysical_vert,fragmentShader:Ms.meshphysical_frag},toon:{uniforms:ao([Y.common,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.gradientmap,Y.fog,Y.lights,{emissive:{value:new J(0)}}]),vertexShader:Ms.meshtoon_vert,fragmentShader:Ms.meshtoon_frag},matcap:{uniforms:ao([Y.common,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,{matcap:{value:null}}]),vertexShader:Ms.meshmatcap_vert,fragmentShader:Ms.meshmatcap_frag},points:{uniforms:ao([Y.points,Y.fog]),vertexShader:Ms.points_vert,fragmentShader:Ms.points_frag},dashed:{uniforms:ao([Y.common,Y.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ms.linedashed_vert,fragmentShader:Ms.linedashed_frag},depth:{uniforms:ao([Y.common,Y.displacementmap]),vertexShader:Ms.depth_vert,fragmentShader:Ms.depth_frag},normal:{uniforms:ao([Y.common,Y.bumpmap,Y.normalmap,Y.displacementmap,{opacity:{value:1}}]),vertexShader:Ms.meshnormal_vert,fragmentShader:Ms.meshnormal_frag},sprite:{uniforms:ao([Y.sprite,Y.fog]),vertexShader:Ms.sprite_vert,fragmentShader:Ms.sprite_frag},background:{uniforms:{uvTransform:{value:new q},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ms.background_vert,fragmentShader:Ms.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new q}},vertexShader:Ms.backgroundCube_vert,fragmentShader:Ms.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ms.cube_vert,fragmentShader:Ms.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ms.equirect_vert,fragmentShader:Ms.equirect_frag},distance:{uniforms:ao([Y.common,Y.displacementmap,{referencePosition:{value:new K},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ms.distance_vert,fragmentShader:Ms.distance_frag},shadow:{uniforms:ao([Y.lights,Y.fog,{color:{value:new J(0)},opacity:{value:1}}]),vertexShader:Ms.shadow_vert,fragmentShader:Ms.shadow_frag}};Ns.physical={uniforms:ao([Ns.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new q},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new q},clearcoatNormalScale:{value:new G(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new q},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new q},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new q},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new q},sheen:{value:0},sheenColor:{value:new J(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new q},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new q},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new q},transmissionSamplerSize:{value:new G},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new q},attenuationDistance:{value:0},attenuationColor:{value:new J(0)},specularColor:{value:new J(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new q},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new q},anisotropyVector:{value:new G},anisotropyMap:{value:null},anisotropyMapTransform:{value:new q}}]),vertexShader:Ms.meshphysical_vert,fragmentShader:Ms.meshphysical_frag};var Ps={r:0,b:0,g:0},Fs=new Xt,Is=new q;Is.set(-1,0,0,0,1,0,0,0,1);function Ls(e,t,n,r,i,a){let o=new J(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new Zr(new Ni(1,1,1),new po({name:`BackgroundCubeMaterial`,uniforms:io(Ns.backgroundCube.uniforms),vertexShader:Ns.backgroundCube.vertexShader,fragmentShader:Ns.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Fs.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Is),l.material.toneMapped=Pt.getTransfer(i.colorSpace)!==ze,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new Zr(new ro(2,2),new po({name:`BackgroundMaterial`,uniforms:io(Ns.background.uniforms),vertexShader:Ns.background.vertexShader,fragmentShader:Ns.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=Pt.getTransfer(i.colorSpace)!==ze,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Ps,co(e)),n.buffers.color.setClear(Ps.r,Ps.g,Ps.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Rs(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function zs(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Bs(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(H(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&H(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&H(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Vs(e){let t=this,n=null,r=0,i=!1,a=!1,o=new jr,s=new q,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Hs=class extends qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new ki(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Ni(5,5,5),i=new po({name:`CubemapFromEquirect`,uniforms:io(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new Zr(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=c),new ss(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},Us=256,Ws=3,Gs=20,Ks=256,qs=16,Js=3,Ys=new K,Xs=new J,Zs=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new ss(1,10,null),this._boxMesh=new Zr(new Ni(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Ys}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(Xs));let h=new ss(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ic(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=rc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Us,xt(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?Us:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Qs(e,!1,!1),n=Math.log2(e)-Ws;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Qs(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=ic()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=rc()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=ec(),this._integrationMaterial=tc());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/qs);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-Js)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(Ks*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=nc());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function Qs(e,t,n){return new Hs(e,{minFilter:u,generateMipmaps:t,type:v,colorSpace:Le,depthBuffer:n})}function $s(e,t,n){return new po({name:e,uniforms:t,vertexShader:Ms.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function ec(){return $s(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Ks}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function tc(){return $s(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:qs}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function nc(){return $s(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Gs}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function rc(){return $s(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function ic(){return $s(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function ac(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new Hs(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Zs(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Zs(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function oc(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Xe(`WebGLRenderer: `+e+` extension not supported.`),t}}}function sc(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?mr:pr)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function cc(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function lc(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:U(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function uc(e,t,n){let r=new WeakMap,i=new Gt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new Jt(h,p,m,u);g.type=_,g.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new G(p,m)},r.set(o,d);function y(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function dc(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var fc={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function pc(e,t,n,r,i,a){let o=new qt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new Dr;u.setAttribute(`position`,new hr([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new hr([0,2,0,0,2,0],2));let d=new mo({uniforms:{tDiffuse:{value:null}},vertexShader:`
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

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

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
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new Zr(u,d),p=new ts(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,y=null,b=[],S=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<b.length;n++){let r=b[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){b=e,S=b.length>0&&b[0].isRenderPass===!0;let t=o.width,n=o.height;b.length>0&&s===null&&(s=new qt(t,n,{type:v,depthBuffer:!1,stencilBuffer:!1}),c=new qt(t,n,{type:v,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&b.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new Ai(t,n),a===!0&&(l.format=O,l.type=x)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<b.length;e++){let i=b[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&b.length===0)return!1;if(y=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return S===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return S},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<b.length;i++){let a=b[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},Pt.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=fc[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(y),e.render(f,p),y=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var mc=new Wt,hc=new Ai(1,1),gc=new ji(1),_c=new Jt,vc=new Yt,yc=new ki,bc=[],xc=[],Sc=new Float32Array(16),Cc=new Float32Array(9),wc=new Float32Array(4);function Tc(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=bc[i];if(a===void 0&&(a=new Float32Array(i),bc[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Ec(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Dc(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Oc(e,t){let n=xc[t];n===void 0&&(n=new Int32Array(t),xc[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function kc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Ac(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ec(n,t))return;e.uniform2fv(this.addr,t),Dc(n,t)}}function jc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Ec(n,t))return;e.uniform3fv(this.addr,t),Dc(n,t)}}function Mc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ec(n,t))return;e.uniform4fv(this.addr,t),Dc(n,t)}}function Nc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ec(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Dc(n,t)}else{if(Ec(n,r))return;wc.set(r),e.uniformMatrix2fv(this.addr,!1,wc),Dc(n,r)}}function Pc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ec(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Dc(n,t)}else{if(Ec(n,r))return;Cc.set(r),e.uniformMatrix3fv(this.addr,!1,Cc),Dc(n,r)}}function Fc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ec(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Dc(n,t)}else{if(Ec(n,r))return;Sc.set(r),e.uniformMatrix4fv(this.addr,!1,Sc),Dc(n,r)}}function Ic(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Lc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ec(n,t))return;e.uniform2iv(this.addr,t),Dc(n,t)}}function Rc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ec(n,t))return;e.uniform3iv(this.addr,t),Dc(n,t)}}function zc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ec(n,t))return;e.uniform4iv(this.addr,t),Dc(n,t)}}function Bc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Vc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ec(n,t))return;e.uniform2uiv(this.addr,t),Dc(n,t)}}function Hc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ec(n,t))return;e.uniform3uiv(this.addr,t),Dc(n,t)}}function Uc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ec(n,t))return;e.uniform4uiv(this.addr,t),Dc(n,t)}}function Wc(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function Gc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?Wc(hc):mc,n.setTexture2D(t||a,i)}function Kc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||vc,i)}function qc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?Wc(gc):yc,n.setTextureCube(t||a,i)}function Jc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||_c,i)}function Yc(e){switch(e){case 5126:return kc;case 35664:return Ac;case 35665:return jc;case 35666:return Mc;case 35674:return Nc;case 35675:return Pc;case 35676:return Fc;case 5124:case 35670:return Ic;case 35667:case 35671:return Lc;case 35668:case 35672:return Rc;case 35669:case 35673:return zc;case 5125:return Bc;case 36294:return Vc;case 36295:return Hc;case 36296:return Uc;case 35678:case 36198:case 36298:case 36306:case 35682:return Gc;case 35679:case 36299:case 36307:return Kc;case 35680:case 36300:case 36308:case 36293:return qc;case 36289:case 36303:case 36311:case 36292:return Jc}}function Xc(e,t){e.uniform1fv(this.addr,t)}function Zc(e,t){let n=Tc(t,this.size,2);e.uniform2fv(this.addr,n)}function Qc(e,t){let n=Tc(t,this.size,3);e.uniform3fv(this.addr,n)}function $c(e,t){let n=Tc(t,this.size,4);e.uniform4fv(this.addr,n)}function el(e,t){let n=Tc(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function tl(e,t){let n=Tc(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function nl(e,t){let n=Tc(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function rl(e,t){e.uniform1iv(this.addr,t)}function il(e,t){e.uniform2iv(this.addr,t)}function al(e,t){e.uniform3iv(this.addr,t)}function ol(e,t){e.uniform4iv(this.addr,t)}function sl(e,t){e.uniform1uiv(this.addr,t)}function cl(e,t){e.uniform2uiv(this.addr,t)}function ll(e,t){e.uniform3uiv(this.addr,t)}function ul(e,t){e.uniform4uiv(this.addr,t)}function dl(e,t,n){let r=this.cache,i=t.length,a=Oc(n,i);Ec(r,a)||(e.uniform1iv(this.addr,a),Dc(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Wc(hc):mc;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function fl(e,t,n){let r=this.cache,i=t.length,a=Oc(n,i);Ec(r,a)||(e.uniform1iv(this.addr,a),Dc(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||vc,a[e])}function pl(e,t,n){let r=this.cache,i=t.length,a=Oc(n,i);Ec(r,a)||(e.uniform1iv(this.addr,a),Dc(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?Wc(gc):yc;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function ml(e,t,n){let r=this.cache,i=t.length,a=Oc(n,i);Ec(r,a)||(e.uniform1iv(this.addr,a),Dc(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||_c,a[e])}function hl(e){switch(e){case 5126:return Xc;case 35664:return Zc;case 35665:return Qc;case 35666:return $c;case 35674:return el;case 35675:return tl;case 35676:return nl;case 5124:case 35670:return rl;case 35667:case 35671:return il;case 35668:case 35672:return al;case 35669:case 35673:return ol;case 5125:return sl;case 36294:return cl;case 36295:return ll;case 36296:return ul;case 35678:case 36198:case 36298:case 36306:case 35682:return dl;case 35679:case 36299:case 36307:return fl;case 35680:case 36300:case 36308:case 36293:return pl;case 36289:case 36303:case 36311:case 36292:return ml}}var gl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Yc(t.type)}},_l=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=hl(t.type)}},vl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},yl=/(\w+)(\])?(\[|\.)?/g;function bl(e,t){e.seq.push(t),e.map[t.id]=t}function xl(e,t,n){let r=e.name,i=r.length;for(yl.lastIndex=0;;){let a=yl.exec(r),o=yl.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){bl(n,l===void 0?new gl(s,e,t):new _l(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new vl(s),bl(n,e)),n=e}}}var Sl=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);xl(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Cl(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var wl=37297,Tl=0;function El(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Dl=new q;function Ol(e){Pt._getMatrix(Dl,Pt.workingColorSpace,e);let t=`mat3( ${Dl.elements.map(e=>e.toFixed(4))} )`;switch(Pt.getTransfer(e)){case Re:return[t,`LinearTransferOETF`];case ze:return[t,`sRGBTransferOETF`];default:return H(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function kl(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+El(e.getShaderSource(t),r)}return i}function Al(e,t){let n=Ol(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var jl={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Ml(e,t){let n=jl[t];return n===void 0?(H(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Nl=new K;function Pl(){return Pt.getLuminanceCoefficients(Nl),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Nl.x.toFixed(4)}, ${Nl.y.toFixed(4)}, ${Nl.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Fl(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Rl).join(`
`)}function Il(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Ll(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Rl(e){return e!==``}function zl(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function Bl(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Vl=/^[ \t]*#include +<([\w\d./]+)>/gm;function Hl(e){return e.replace(Vl,Ul)}function Ul(e,t){let n=Ms[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return Hl(n)}var Wl=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Gl(e){return e.replace(Wl,Kl)}function Kl(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function ql(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Jl={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Yl(e){return Jl[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Xl={302:`ENVMAP_MODE_REFRACTION`};function Zl(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Xl[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Ql={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function $l(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Ql[e.combine]||`ENVMAP_BLENDING_NONE`}function eu(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Yl(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=Zl(n),d=$l(n),f=Fl(n),p=Il(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Rl).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Rl).join(`
`),g.length>0&&(g+=`
`)):(h=[ql(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Rl).join(`
`),g=[ql(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Ms.tonemapping_pars_fragment,n.toneMapping===0?``:Ml(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Ms.colorspace_pars_fragment,Al(`linearToOutputTexel`,n.outputColorSpace),Pl(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Rl).join(`
`)),o=Hl(o),o=zl(o,n),o=Bl(o,n),s=Hl(s),s=zl(s,n),s=Bl(s,n),o=Gl(o),s=Gl(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=Cl(i,i.VERTEX_SHADER,v),x=Cl(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=kl(i,b,`vertex`),n=kl(i,x,`fragment`);U(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):H(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new Sl(i,m),w=Ll(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,wl)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Tl++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var tu=0,nu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ru(e),t.set(e,n)),n}},ru=class{constructor(e){this.id=tu++,this.code=e,this.usedTimes=0}};function iu(e){return e===1030||e===37490||e===36285}function au(e,t,n,r,i,a){let o=new cn,s=new nu,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&H(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=Ns[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),M=m.isInstancedMesh===!0,N=m.isBatchedMesh===!0,P=!!i.map,F=!!i.matcap,I=!!b,ee=I&&b.isPMREMTexture===!0,te=!!i.aoMap,ne=!!i.lightMap,re=!!i.bumpMap&&i.wireframe===!1,ie=!!i.normalMap,ae=!!i.displacementMap,oe=!!i.emissiveMap,L=!!i.metalnessMap,se=!!i.roughnessMap,ce=i.anisotropy>0,le=i.clearcoat>0,ue=i.diffuseRoughness>0,de=i.dispersion>0,fe=i.retroreflectivity>0,pe=i.iridescence>0,me=i.sheen>0,he=i.transmission>0,ge=ce&&!!i.anisotropyMap,_e=le&&!!i.clearcoatMap,ve=le&&!!i.clearcoatNormalMap,ye=le&&!!i.clearcoatRoughnessMap,be=ue&&!!i.diffuseRoughnessMap,xe=pe&&!!i.iridescenceMap,Se=pe&&!!i.iridescenceThicknessMap,Ce=me&&!!i.sheenColorMap,we=me&&!!i.sheenRoughnessMap,Te=!!i.specularMap,Ee=!!i.specularColorMap,De=!!i.specularIntensityMap,Oe=he&&!!i.transmissionMap,ke=he&&!!i.thicknessMap,Ae=!!i.gradientMap,je=!!i.alphaMap,R=i.alphaTest>0,Me=!!i.alphaHash,Ne=!!i.extensions,Pe=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Pe=e.toneMapping);let z=ee?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,Fe={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:N,batchingColor:N&&m._colorsTexture!==null,instancing:M,instancingColor:M&&m.instanceColor!==null,instancingMorph:M&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Pt.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:P,matcap:F,envMap:I,envMapMode:I&&b.mapping,envMapPMREM:ee,envMapMaxLod:ee?z.length-1:null,envMapSize:ee?z[0].width:null,aoMap:te,lightMap:ne,bumpMap:re,normalMap:ie,displacementMap:ae,emissiveMap:oe,normalMapObjectSpace:ie&&i.normalMapType===1,normalMapTangentSpace:ie&&i.normalMapType===0,packedNormalMap:ie&&i.normalMapType===0&&iu(i.normalMap.format),metalnessMap:L,roughnessMap:se,anisotropy:ce,anisotropyMap:ge,clearcoat:le,clearcoatMap:_e,clearcoatNormalMap:ve,clearcoatRoughnessMap:ye,diffuseRoughness:ue,diffuseRoughnessMap:be,dispersion:de,retroreflection:fe,iridescence:pe,iridescenceMap:xe,iridescenceThicknessMap:Se,sheen:me,sheenColorMap:Ce,sheenRoughnessMap:we,specularMap:Te,specularColorMap:Ee,specularIntensityMap:De,transmission:he,transmissionMap:Oe,thicknessMap:ke,gradientMap:Ae,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:je,alphaTest:R,alphaHash:Me,combine:i.combine,mapUv:P&&p(i.map.channel),aoMapUv:te&&p(i.aoMap.channel),lightMapUv:ne&&p(i.lightMap.channel),bumpMapUv:re&&p(i.bumpMap.channel),normalMapUv:ie&&p(i.normalMap.channel),displacementMapUv:ae&&p(i.displacementMap.channel),emissiveMapUv:oe&&p(i.emissiveMap.channel),metalnessMapUv:L&&p(i.metalnessMap.channel),roughnessMapUv:se&&p(i.roughnessMap.channel),anisotropyMapUv:ge&&p(i.anisotropyMap.channel),clearcoatMapUv:_e&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:ve&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ye&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:be&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:xe&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:we&&p(i.sheenRoughnessMap.channel),specularMapUv:Te&&p(i.specularMap.channel),specularColorMapUv:Ee&&p(i.specularColorMap.channel),specularIntensityMapUv:De&&p(i.specularIntensityMap.channel),transmissionMapUv:Oe&&p(i.transmissionMap.channel),thicknessMapUv:ke&&p(i.thicknessMap.channel),alphaMapUv:je&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(ie||ce),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(P||je),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&ie===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Pe,decodeVideoTexture:P&&i.map.isVideoTexture===!0&&Pt.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:oe&&i.emissiveMap.isVideoTexture===!0&&Pt.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Ne&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ne&&i.extensions.multiDraw===!0||N)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Fe.vertexUv1s=c.has(1),Fe.vertexUv2s=c.has(2),Fe.vertexUv3s=c.has(3),c.clear(),Fe}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=Ns[t];n=lo.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new eu(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function ou(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function su(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function cu(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function lu(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||su),r.length>1&&r.sort(t||cu),i.length>1&&i.sort(t||cu)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function uu(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new lu,e.set(t,[i])):n>=r.length?(i=new lu,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function du(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new K,color:new J};break;case`SpotLight`:n={position:new K,direction:new K,color:new J,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new K,color:new J,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new K,skyColor:new J,groundColor:new J};break;case`RectAreaLight`:n={color:new J,position:new K,halfWidth:new K,halfHeight:new K}}return e[t.id]=n,n}}}function fu(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new G};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new G};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new G,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var pu=0;function mu(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function hu(e){let t=new du,n=fu(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new K);let i=new K,a=new Xt,o=new Xt;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(mu);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Y.LTC_FLOAT_1,r.rectAreaLTC2=Y.LTC_FLOAT_2):(r.rectAreaLTC1=Y.LTC_HALF_1,r.rectAreaLTC2=Y.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=pu++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function gu(e){let t=new hu(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function _u(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new gu(e),t.set(n,[a])):r>=i.length?(a=new gu(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var vu=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,yu=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,bu=[new K(1,0,0),new K(-1,0,0),new K(0,1,0),new K(0,-1,0),new K(0,0,1),new K(0,0,-1)],xu=[new K(0,-1,0),new K(0,-1,0),new K(0,0,1),new K(0,0,-1),new K(0,-1,0),new K(0,-1,0)],Su=new Xt,Cu=new K,wu=new K;function Tu(e,t,n){let r=new pi,i=new G,o=new G,s=new Gt,l=new _o,u=new vo,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},m=new po({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new G},radius:{value:4}},vertexShader:vu,fragmentShader:yu}),h=m.clone();h.defines.HORIZONTAL_PASS=1;let y=new Dr;y.setAttribute(`position`,new fr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new Zr(y,m),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,l){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(H(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.state;m.setBlending(0),m.buffers.depth.getReversed()===!0?m.buffers.color.setClear(0,0,0,0):m.buffers.color.setClear(1,1,1,1),m.buffers.depth.setTest(!0),m.setScissorTest(!1);let h=S!==this.type;h&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){H(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;i.copy(p.mapSize);let y=p.getFrameExtents();i.multiply(y),o.copy(p.mapSize),(i.x>f||i.y>f)&&(i.x>f&&(o.x=Math.floor(f/y.x),i.x=o.x*y.x,p.mapSize.x=o.x),i.y>f&&(o.y=Math.floor(f/y.y),i.y=o.y*y.y,p.mapSize.y=o.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||h===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){H(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new qt(i.x,i.y,{format:j,type:v,minFilter:c,magFilter:c,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new Ai(i.x,i.y,_),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=D,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=a,p.map.depthTexture.magFilter=a}else d.isPointLight?(p.map=new Hs(i.x),p.map.depthTexture=new ji(i.x,g)):(p.map=new qt(i.x,i.y),p.map.depthTexture=new Ai(i.x,i.y,g)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=D,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=c,p.map.depthTexture.magFilter=c):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=a,p.map.depthTexture.magFilter=a);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==i.x||p.map.height!==i.y)&&p.map.setSize(i.x,i.y);let x=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,l);let S=p.camera.layers.mask&4294967294?p.camera.layers:l.layers;for(let t=0;t<x;t++){let i=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Cu.setFromMatrixPosition(d.matrixWorld),e.position.copy(Cu),wu.copy(e.position),wu.add(bu[t]),e.up.copy(xu[t]),e.lookAt(wu),e.updateMatrixWorld(),n.makeTranslation(-Cu.x,-Cu.y,-Cu.z),Su.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(Su,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);s.set(o.x*n.x,o.y*n.y,o.x*n.z,o.y*n.w),m.viewport(s)}r=p.getFrustum(t),T(n,l,i,d,S,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,l),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let a=t.update(b);m.defines.VSM_SAMPLES!==n.blurSamples&&(m.defines.VSM_SAMPLES=n.blurSamples,h.defines.VSM_SAMPLES=n.blurSamples,m.needsUpdate=!0,h.needsUpdate=!0),n.mapPass===null?n.mapPass=new qt(i.x,i.y,{format:j,type:v}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),m.uniforms.shadow_pass.value=n.map.depthTexture,m.uniforms.resolution.value.set(n.map.width,n.map.height),m.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,m,b,null),h.uniforms.shadow_pass.value=n.mapPass.texture,h.uniforms.resolution.value.set(n.map.width,n.map.height),h.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,h,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,E)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function T(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=w(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)T(l[e],i,a,o,s,c)}function E(e){e.target.removeEventListener(`dispose`,E);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Eu(e,t){function n(){let t=!1,n=new Gt,r=null,i=new Gt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?L(e.DEPTH_TEST):se(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Qe[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?L(e.STENCIL_TEST):se(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new J(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,M=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),N=!1,P=0,F=e.getParameter(e.VERSION);F.indexOf(`WebGL`)===-1?F.indexOf(`OpenGL ES`)!==-1&&(P=parseFloat(/^OpenGL ES (\d)/.exec(F)[1]),N=P>=2):(P=parseFloat(/^WebGL (\d)/.exec(F)[1]),N=P>=1);let I=null,ee={},te=e.getParameter(e.SCISSOR_BOX),ne=e.getParameter(e.VIEWPORT),re=new Gt().fromArray(te),ie=new Gt().fromArray(ne);function ae(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let oe={};oe[e.TEXTURE_2D]=ae(e.TEXTURE_2D,e.TEXTURE_2D,1),oe[e.TEXTURE_CUBE_MAP]=ae(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[e.TEXTURE_2D_ARRAY]=ae(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),oe[e.TEXTURE_3D]=ae(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),L(e.DEPTH_TEST),o.setFunc(3),he(!1),ge(1),L(e.CULL_FACE),pe(0);function L(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function se(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ce(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function le(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ue(t){return h!==t&&(e.useProgram(t),h=t,!0)}let de={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};de[103]=e.MIN,de[104]=e.MAX;let fe={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function pe(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(se(e.BLEND),g=!1);else if(g===!1&&(L(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:U(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:U(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:U(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:U(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(de[n],de[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(fe[r],fe[i],fe[o],fe[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function me(t,n){t.side===2?se(e.CULL_FACE):L(e.CULL_FACE);let r=t.side===1;n&&(r=!r),he(r),t.blending===1&&t.transparent===!1?pe(0):pe(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),ve(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?L(e.SAMPLE_ALPHA_TO_COVERAGE):se(e.SAMPLE_ALPHA_TO_COVERAGE)}function he(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ge(t){t===0?se(e.CULL_FACE):(L(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function _e(t){t!==k&&(N&&e.lineWidth(t),k=t)}function ve(t,n,r){t?(L(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):se(e.POLYGON_OFFSET_FILL)}function ye(t){t?L(e.SCISSOR_TEST):se(e.SCISSOR_TEST)}function be(t){t===void 0&&(t=e.TEXTURE0+M-1),I!==t&&(e.activeTexture(t),I=t)}function xe(t,n,r){r===void 0&&(r=I===null?e.TEXTURE0+M-1:I);let i=ee[r];i===void 0&&(i={type:void 0,texture:void 0},ee[r]=i),(i.type!==t||i.texture!==n)&&(I!==r&&(e.activeTexture(r),I=r),e.bindTexture(t,n||oe[t]),i.type=t,i.texture=n)}function Se(){let t=ee[I];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ce(){try{e.compressedTexImage2D(...arguments)}catch(e){U(`WebGLState:`,e)}}function we(){try{e.compressedTexImage3D(...arguments)}catch(e){U(`WebGLState:`,e)}}function Te(){try{e.texSubImage2D(...arguments)}catch(e){U(`WebGLState:`,e)}}function Ee(){try{e.texSubImage3D(...arguments)}catch(e){U(`WebGLState:`,e)}}function De(){try{e.compressedTexSubImage2D(...arguments)}catch(e){U(`WebGLState:`,e)}}function Oe(){try{e.compressedTexSubImage3D(...arguments)}catch(e){U(`WebGLState:`,e)}}function ke(){try{e.texStorage2D(...arguments)}catch(e){U(`WebGLState:`,e)}}function Ae(){try{e.texStorage3D(...arguments)}catch(e){U(`WebGLState:`,e)}}function je(){try{e.texImage2D(...arguments)}catch(e){U(`WebGLState:`,e)}}function R(){try{e.texImage3D(...arguments)}catch(e){U(`WebGLState:`,e)}}function Me(t){return d[t]===void 0?e.getParameter(t):d[t]}function Ne(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Pe(t){re.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),re.copy(t))}function z(t){ie.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ie.copy(t))}function Fe(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function B(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function V(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},I=null,ee={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new J(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,re.set(0,0,e.canvas.width,e.canvas.height),ie.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:L,disable:se,bindFramebuffer:ce,drawBuffers:le,useProgram:ue,setBlending:pe,setMaterial:me,setFlipSided:he,setCullFace:ge,setLineWidth:_e,setPolygonOffset:ve,setScissorTest:ye,activeTexture:be,bindTexture:xe,unbindTexture:Se,compressedTexImage2D:Ce,compressedTexImage3D:we,texImage2D:je,texImage3D:R,pixelStorei:Ne,getParameter:Me,updateUBOMapping:Fe,uniformBlockBinding:B,texStorage2D:ke,texStorage3D:Ae,texSubImage2D:Te,texSubImage3D:Ee,compressedTexSubImage2D:De,compressedTexSubImage3D:Oe,scissor:Pe,viewport:z,reset:V}}function Du(e,t,d,f,p,m,h){let g=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new G,y=new WeakMap,b=new Set,x,S=new WeakMap,C=new Set,w=new FinalizationRegistry(e=>C.delete(e)),T=!1;try{T=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function E(e,t){return T?new OffscreenCanvas(e,t):Ge(`canvas`)}function D(e,t,n){let r=1,i=V(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=E(n,a));let o=t?E(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),H(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&H(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function k(e){return e.generateMipmaps}function A(t){e.generateMipmap(t)}function j(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function M(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];H(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||H(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Re:Pt.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function N(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,H(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function P(e,t){return k(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function F(e){let t=new WeakRef(e);f.get(e).__ref=t,C.add(t),w.register(e,t,t)}function I(e){let t=f.get(e).__ref;t!==void 0&&(C.delete(t),w.unregister(t))}function ee(e){ne(e.target)}function te(e){re(e.target)}function ne(e){e.removeEventListener(`dispose`,ee),I(e),ae(e),e.isVideoTexture&&y.delete(e),e.isHTMLTexture&&b.delete(e)}function re(e){e.removeEventListener(`dispose`,te),I(e),L(e)}function ie(){for(let e of C){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?re(t):ne(t))}C.clear(),b.clear()}function ae(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&oe(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function oe(t){let n=f.get(t);e.deleteTexture(n.__webglTexture);let r=t.source,i=S.get(r);delete i[n.__cacheKey],h.memory.textures--}function L(t){let n=f.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let r=t.depthTexture;if(r&&r.renderTarget===t&&ne(r),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=f.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),h.memory.textures--),f.remove(i[t])}f.remove(t)}let se=0;function ce(){se=0}function le(){return se}function ue(e){se=e}function de(){let e=se;return e>=p.maxTextures&&H(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+p.maxTextures),se+=1,e}function fe(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function pe(t,n){let r=f.get(t);if(t.isVideoTexture&&Fe(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&r.__version!==t.version){let e=t.image;if(e===null)H(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)H(`WebGLRenderer: Texture marked for update but image is incomplete`);else{we(r,t,n);return}}else t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null);d.bindTexture(e.TEXTURE_2D,r.__webglTexture,e.TEXTURE0+n)}function me(t,n){let r=f.get(t);t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version?we(r,t,n):(t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null),d.bindTexture(e.TEXTURE_2D_ARRAY,r.__webglTexture,e.TEXTURE0+n))}function he(t,n){let r=f.get(t);t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version?we(r,t,n):d.bindTexture(e.TEXTURE_3D,r.__webglTexture,e.TEXTURE0+n)}function ge(t,n){let r=f.get(t);t.version>0&&r.__version!==t.version?Te(r,t,n):d.bindTexture(e.TEXTURE_CUBE_MAP,r.__webglTexture,e.TEXTURE0+n)}let _e={[n]:e.REPEAT,[r]:e.CLAMP_TO_EDGE,[i]:e.MIRRORED_REPEAT},ve={[a]:e.NEAREST,[o]:e.NEAREST_MIPMAP_NEAREST,[s]:e.NEAREST_MIPMAP_LINEAR,[c]:e.LINEAR,[l]:e.LINEAR_MIPMAP_NEAREST,[u]:e.LINEAR_MIPMAP_LINEAR},ye={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function be(n,r){if(r.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(r.magFilter===1006||r.magFilter===1007||r.magFilter===1005||r.magFilter===1008||r.minFilter===1006||r.minFilter===1007||r.minFilter===1005||r.minFilter===1008)&&H(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,_e[r.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,_e[r.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,_e[r.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,ve[r.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,ve[r.minFilter]),r.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,ye[r.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(r.magFilter===1003||r.minFilter!==1005&&r.minFilter!==1008||r.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(r.anisotropy>1||f.get(r).__currentAnisotropy){let i=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,i.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(r.anisotropy,p.getMaxAnisotropy())),f.get(r).__currentAnisotropy=r.anisotropy}}}function xe(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,ee),F(n));let i=n.source,a=S.get(i);a===void 0&&(a={},S.set(i,a));let o=fe(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},h.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&oe(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function Se(e,t,n){return Math.floor(Math.floor(e/n)/t)}function Ce(t,n,r,i){let a=t.updateRanges;if(a.length===0)d.texSubImage2D(e.TEXTURE_2D,0,0,0,n.width,n.height,r,i,n.data);else{a.sort((e,t)=>e.start-t.start);let o=0;for(let e=1;e<a.length;e++){let t=a[o],r=a[e],i=t.start+t.count,s=Se(r.start,n.width,4),c=Se(t.start,n.width,4);r.start<=i+1&&s===c&&Se(r.start+r.count-1,n.width,4)===s?t.count=Math.max(t.count,r.start+r.count-t.start):(++o,a[o]=r)}a.length=o+1;let s=d.getParameter(e.UNPACK_ROW_LENGTH),c=d.getParameter(e.UNPACK_SKIP_PIXELS),l=d.getParameter(e.UNPACK_SKIP_ROWS);d.pixelStorei(e.UNPACK_ROW_LENGTH,n.width);for(let t=0,o=a.length;t<o;t++){let o=a[t],s=Math.floor(o.start/4),c=Math.ceil(o.count/4),l=s%n.width,u=Math.floor(s/n.width),f=c;d.pixelStorei(e.UNPACK_SKIP_PIXELS,l),d.pixelStorei(e.UNPACK_SKIP_ROWS,u),d.texSubImage2D(e.TEXTURE_2D,0,l,u,f,1,r,i,n.data)}t.clearUpdateRanges(),d.pixelStorei(e.UNPACK_ROW_LENGTH,s),d.pixelStorei(e.UNPACK_SKIP_PIXELS,c),d.pixelStorei(e.UNPACK_SKIP_ROWS,l)}}function we(t,n,r){let i=e.TEXTURE_2D;(n.isDataArrayTexture||n.isCompressedArrayTexture)&&(i=e.TEXTURE_2D_ARRAY),n.isData3DTexture&&(i=e.TEXTURE_3D);let a=xe(t,n),o=n.source;d.bindTexture(i,t.__webglTexture,e.TEXTURE0+r);let s=f.get(o);if(o.version!==s.__version||a===!0){if(d.activeTexture(e.TEXTURE0+r),!(typeof ImageBitmap<`u`&&n.image instanceof ImageBitmap)){let t=Pt.getPrimaries(Pt.workingColorSpace),r=n.colorSpace===``?null:Pt.getPrimaries(n.colorSpace),i=n.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}d.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment);let t=D(n.image,!1,p.maxTextureSize);t=B(n,t);let c=m.convert(n.format,n.colorSpace),l=m.convert(n.type),u=M(n.internalFormat,c,l,n.normalized,n.colorSpace,n.isVideoTexture);be(i,n);let f,h=n.mipmaps,g=n.isVideoTexture!==!0,_=s.__version===void 0||a===!0,v=o.dataReady,y=P(n,t);if(n.isDepthTexture)u=N(n.format===O,n.type),_&&(g?d.texStorage2D(e.TEXTURE_2D,1,u,t.width,t.height):d.texImage2D(e.TEXTURE_2D,0,u,t.width,t.height,0,c,l,null));else if(n.isDataTexture){if(h.length>0){g&&_&&d.texStorage2D(e.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let t=0,n=h.length;t<n;t++)f=h[t],g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,l,f.data):d.texImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,c,l,f.data);n.generateMipmaps=!1}else g?(_&&d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height),v&&Ce(n,t,c,l)):d.texImage2D(e.TEXTURE_2D,0,u,t.width,t.height,0,c,l,t.data)}else if(n.isCompressedTexture){if(n.isCompressedArrayTexture){g&&_&&d.texStorage3D(e.TEXTURE_2D_ARRAY,y,u,h[0].width,h[0].height,t.depth);for(let r=0,i=h.length;r<i;r++)if(f=h[r],n.format!==1023){if(c!==null){if(g){if(v){if(n.layerUpdates.size>0){let t=Os(f.width,f.height,n.format,n.type);for(let i of n.layerUpdates){let n=f.data.subarray(i*t/f.data.BYTES_PER_ELEMENT,(i+1)*t/f.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,i,f.width,f.height,1,c,n)}}else d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,0,f.width,f.height,t.depth,c,f.data)}}else d.compressedTexImage3D(e.TEXTURE_2D_ARRAY,r,u,f.width,f.height,t.depth,0,f.data,0,0)}else H(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else g?v&&d.texSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,0,f.width,f.height,t.depth,c,l,f.data):d.texImage3D(e.TEXTURE_2D_ARRAY,r,u,f.width,f.height,t.depth,0,c,l,f.data);n.layerUpdates.size>0&&n.clearLayerUpdates()}else{g&&_&&d.texStorage2D(e.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let t=0,r=h.length;t<r;t++)f=h[t],n.format===1023?g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,l,f.data):d.texImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,c,l,f.data):c===null?H(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&d.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,f.data):d.compressedTexImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,f.data)}}else if(n.isDataArrayTexture){if(g){if(_&&d.texStorage3D(e.TEXTURE_2D_ARRAY,y,u,t.width,t.height,t.depth),v){if(n.layerUpdates.size>0){let r=Os(t.width,t.height,n.format,n.type);for(let i of n.layerUpdates){let n=t.data.subarray(i*r/t.data.BYTES_PER_ELEMENT,(i+1)*r/t.data.BYTES_PER_ELEMENT);d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,i,t.width,t.height,1,c,l,n)}n.clearLayerUpdates()}else d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,c,l,t.data)}}else d.texImage3D(e.TEXTURE_2D_ARRAY,0,u,t.width,t.height,t.depth,0,c,l,t.data)}else if(n.isData3DTexture)g?(_&&d.texStorage3D(e.TEXTURE_3D,y,u,t.width,t.height,t.depth),v&&d.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,c,l,t.data)):d.texImage3D(e.TEXTURE_3D,0,u,t.width,t.height,t.depth,0,c,l,t.data);else if(n.isFramebufferTexture){if(_){if(g)d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height);else{let n=t.width,r=t.height;for(let t=0;t<y;t++)d.texImage2D(e.TEXTURE_2D,t,u,n,r,0,c,l,null),n>>=1,r>>=1}}}else if(n.isHTMLTexture){if(`texElementImage2D`in e){let r=e.canvas;if(r.hasAttribute(`layoutsubtree`)||r.setAttribute(`layoutsubtree`,`true`),t.parentNode!==r){r.appendChild(t),b.add(n),r.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},r.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let t=V(h[0]);d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height)}for(let t=0,n=h.length;t<n;t++)f=h[t],g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,c,l,f):d.texImage2D(e.TEXTURE_2D,t,u,c,l,f);n.generateMipmaps=!1}else if(g){if(_){let n=V(t);d.texStorage2D(e.TEXTURE_2D,y,u,n.width,n.height)}v&&d.texSubImage2D(e.TEXTURE_2D,0,0,0,c,l,t)}else d.texImage2D(e.TEXTURE_2D,0,u,c,l,t);k(n)&&n.mipmapsAutoUpdate===!0&&A(i),s.__version=o.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function Te(t,n,r){if(n.image.length!==6)return;let i=xe(t,n),a=n.source;d.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+r);let o=f.get(a);if(a.version!==o.__version||i===!0){d.activeTexture(e.TEXTURE0+r);let t=Pt.getPrimaries(Pt.workingColorSpace),s=n.colorSpace===``?null:Pt.getPrimaries(n.colorSpace),c=n.colorSpace===``||t===s?e.NONE:e.BROWSER_DEFAULT_WEBGL;d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),d.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment),d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,c);let l=n.isCompressedTexture||n.image[0].isCompressedTexture,u=n.image[0]&&n.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!l&&!u?f[e]=D(n.image[e],!0,p.maxCubemapSize):f[e]=u?n.image[e].image:n.image[e],f[e]=B(n,f[e]);let h=f[0],g=m.convert(n.format,n.colorSpace),_=m.convert(n.type),v=M(n.internalFormat,g,_,n.normalized,n.colorSpace),y=n.isVideoTexture!==!0,b=o.__version===void 0||i===!0,x=a.dataReady,S=P(n,h);be(e.TEXTURE_CUBE_MAP,n);let C;if(n.isDepthTexture){if(v=N(n.format===O,n.type),b){if(y)d.texStorage2D(e.TEXTURE_CUBE_MAP,1,v,h.width,h.height);else for(let t=0;t<6;t++)d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,h.width,h.height,0,g,_,null)}}else if(l){y&&b&&d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=f[t].mipmaps;for(let r=0;r<C.length;r++){let i=C[r];n.format===1023?y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,g,_,i.data):g===null?H(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):d.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,i.data)}}}else{if(C=n.mipmaps,y&&b){C.length>0&&S++;let t=V(f[0]);d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(u){y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,f[t].width,f[t].height,g,_,f[t].data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,f[t].width,f[t].height,0,g,_,f[t].data);for(let n=0;n<C.length;n++){let r=C[n].image[t].image;y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,r.width,r.height,g,_,r.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,r.width,r.height,0,g,_,r.data)}}else{y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,f[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,f[t]);for(let n=0;n<C.length;n++){let r=C[n];y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,g,_,r.image[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,g,_,r.image[t])}}}k(n)&&n.mipmapsAutoUpdate===!0&&A(e.TEXTURE_CUBE_MAP),o.__version=a.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function Ee(t,n,r,i,a,o){let s=m.convert(r.format,r.colorSpace),c=m.convert(r.type),l=M(r.internalFormat,s,c,r.normalized,r.colorSpace),u=f.get(n),p=f.get(r);if(p.__renderTarget=n,!u.__hasExternalTextures){let t=Math.max(1,n.width>>o),r=Math.max(1,n.height>>o);a===e.TEXTURE_3D||a===e.TEXTURE_2D_ARRAY?d.texImage3D(a,o,l,t,r,n.depth,0,s,c,null):d.texImage2D(a,o,l,t,r,0,s,c,null)}d.bindFramebuffer(e.FRAMEBUFFER,t),z(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,i,a,p.__webglTexture,0,Pe(n)):(a===e.TEXTURE_2D||a>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&a<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,i,a,p.__webglTexture,o),d.bindFramebuffer(e.FRAMEBUFFER,null)}function De(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=N(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;z(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Pe(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Pe(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],o=m.convert(a.format,a.colorSpace),s=m.convert(a.type),c=M(a.internalFormat,o,s,a.normalized,a.colorSpace);z(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Pe(n),c,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Pe(n),c,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,c,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Oe(t,n,r){let i=n.isWebGLCubeRenderTarget===!0;if(d.bindFramebuffer(e.FRAMEBUFFER,t),!(n.depthTexture&&n.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let a=f.get(n.depthTexture);a.__renderTarget=n;let o=i?n.depthTexture.image[0]:n.depthTexture.image;a.__webglTexture&&o.width===n.width&&o.height===n.height||(o.width=n.width,o.height=n.height,n.depthTexture.needsUpdate=!0),i?ge(n.depthTexture,0):pe(n.depthTexture,0);let s=a.__webglTexture,c=Pe(n),l=i?e.TEXTURE_CUBE_MAP_POSITIVE_X+r:e.TEXTURE_2D,u=n.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(n.depthTexture.format===1026)z(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else if(n.depthTexture.format===1027)z(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function ke(t){let n=f.get(t),r=t.isWebGLCubeRenderTarget===!0;if(n.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(n.__depthDisposeCallback&&n.__depthDisposeCallback(),e){let t=()=>{delete n.__boundDepthTexture,delete n.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),n.__depthDisposeCallback=t}n.__boundDepthTexture=e}if(t.depthTexture&&!n.__autoAllocateDepthBuffer){if(r)for(let e=0;e<6;e++)Oe(n.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?Oe(n.__webglFramebuffer[0],t,0):Oe(n.__webglFramebuffer,t,0)}else if(r){n.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[r]),n.__webglDepthbuffer[r]===void 0)n.__webglDepthbuffer[r]=e.createRenderbuffer(),De(n.__webglDepthbuffer[r],t,!1);else{let i=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=n.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,i,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[0]):d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer),n.__webglDepthbuffer===void 0)n.__webglDepthbuffer=e.createRenderbuffer(),De(n.__webglDepthbuffer,t,!1);else{let r=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,i=n.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,r,e.RENDERBUFFER,i)}d.bindFramebuffer(e.FRAMEBUFFER,null)}function Ae(t,n,r){let i=f.get(t);n!==void 0&&Ee(i.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),r!==void 0&&ke(t)}function je(t){let n=t.texture,r=f.get(t),i=f.get(n);t.addEventListener(`dispose`,te),F(t);let a=t.textures,o=t.isWebGLCubeRenderTarget===!0,s=a.length>1;if(s||(i.__webglTexture===void 0&&(i.__webglTexture=e.createTexture()),i.__version=n.version,h.memory.textures++),o){r.__webglFramebuffer=[];for(let t=0;t<6;t++)if(n.mipmaps.length>0){r.__webglFramebuffer[t]=[];for(let i=0;i<n.mipmaps.length;i++)r.__webglFramebuffer[t][i]=e.createFramebuffer()}else r.__webglFramebuffer[t]=e.createFramebuffer()}else{if(n.mipmaps.length>0){r.__webglFramebuffer=[];for(let t=0;t<n.mipmaps.length;t++)r.__webglFramebuffer[t]=e.createFramebuffer()}else r.__webglFramebuffer=e.createFramebuffer();if(s)for(let t=0,n=a.length;t<n;t++){let n=f.get(a[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),h.memory.textures++)}if(t.samples>0&&z(t)===!1){r.__webglMultisampledFramebuffer=e.createFramebuffer(),r.__webglColorRenderbuffer=[],d.bindFramebuffer(e.FRAMEBUFFER,r.__webglMultisampledFramebuffer);for(let n=0;n<a.length;n++){let i=a[n];r.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.__webglColorRenderbuffer[n]);let o=m.convert(i.format,i.colorSpace),s=m.convert(i.type),c=M(i.internalFormat,o,s,i.normalized,i.colorSpace,t.isXRRenderTarget===!0),l=Pe(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,r.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(r.__webglDepthRenderbuffer=e.createRenderbuffer(),De(r.__webglDepthRenderbuffer,t,!0)),d.bindFramebuffer(e.FRAMEBUFFER,null)}}if(o){d.bindTexture(e.TEXTURE_CUBE_MAP,i.__webglTexture),be(e.TEXTURE_CUBE_MAP,n);for(let i=0;i<6;i++)if(n.mipmaps.length>0)for(let a=0;a<n.mipmaps.length;a++)Ee(r.__webglFramebuffer[i][a],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,a);else Ee(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,0);k(n)?A(e.TEXTURE_CUBE_MAP):n.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,n.mipmaps.length-1),d.unbindTexture()}else if(s){for(let n=0,i=a.length;n<i;n++){let i=a[n],o=f.get(i),s=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(s=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(s,o.__webglTexture),be(s,i),Ee(r.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0+n,s,0),k(i)&&A(s)}d.unbindTexture()}else{let a=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(a=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(a,i.__webglTexture),be(a,n),n.mipmaps.length>0)for(let i=0;i<n.mipmaps.length;i++)Ee(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,a,i);else Ee(r.__webglFramebuffer,t,n,e.COLOR_ATTACHMENT0,a,0);k(n)?A(a):n.mipmaps.length>0&&e.texParameteri(a,e.TEXTURE_MAX_LEVEL,n.mipmaps.length-1),d.unbindTexture()}t.depthBuffer&&ke(t)}function R(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(k(r)&&r.mipmapsAutoUpdate===!0){let t=j(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),A(t),d.unbindTexture()}}}let Me=[];function Ne(t){if(t.samples>0){if(z(t)===!1){let n=t.textures,r=t.width,i=t.height,a=e.COLOR_BUFFER_BIT,o=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,s=f.get(t),c=n.length>1;if(c)for(let t=0;t<n.length;t++)d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);d.bindFramebuffer(e.READ_FRAMEBUFFER,s.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer[0]):d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer);for(let l=0;l<n.length;l++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(a|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(a|=e.STENCIL_BUFFER_BIT)),c){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,s.__webglColorRenderbuffer[l]);let t=f.get(n[l]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,r,i,0,0,r,i,a,e.NEAREST),_===!0&&(Me.length=0,Me.push(e.COLOR_ATTACHMENT0+l),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&Me.push(o),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Me))}if(d.bindFramebuffer(e.READ_FRAMEBUFFER,null),d.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),c)for(let t=0;t<n.length;t++){d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,s.__webglColorRenderbuffer[t]);let r=f.get(n[t]).__webglTexture;d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,r,0)}d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&_){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Pe(e){return Math.min(p.maxSamples,e.samples)}function z(e){let n=f.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Fe(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function B(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Pt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&H(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):U(`WebGLTextures: Unsupported texture color space:`,n)),t}function V(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=de,this.resetTextureUnits=ce,this.getTextureUnits=le,this.setTextureUnits=ue,this.setTexture2D=pe,this.setTexture2DArray=me,this.setTexture3D=he,this.setTextureCube=ge,this.rebindTextures=Ae,this.setupRenderTarget=je,this.updateRenderTargetMipmap=R,this.updateMultisampleRenderTarget=Ne,this.setupDepthRenderbuffer=ke,this.setupFrameBufferTexture=Ee,this.useMultisampledRTT=z,this.dispose=ie}function Ou(e,t){function n(n,r=``){let i,a=Pt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var ku=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Au=`
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

}`,ju=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Mi(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new po({vertexShader:ku,fragmentShader:Au,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Zr(new ro(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Mu=class extends $e{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,f=null,p=null,m=null,h=typeof XRWebGLBinding<`u`,_=new ju,v={},y=t.getContextAttributes(),b=null,S=null,C=[],w=[],T=new G,k=null,A=null,j=new Qo;j.viewport=new Gt;let M=new Qo;M.viewport=new Gt;let N=[j,M],P=new cs,F=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new Dn,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new Dn,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new Dn,C[e]=t),t.getHandSpace()};function ee(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function te(){r.removeEventListener(`select`,ee),r.removeEventListener(`selectstart`,ee),r.removeEventListener(`selectend`,ee),r.removeEventListener(`squeeze`,ee),r.removeEventListener(`squeezestart`,ee),r.removeEventListener(`squeezeend`,ee),r.removeEventListener(`end`,te),r.removeEventListener(`inputsourceschange`,ne);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}F=null,I=null,_.reset();for(let e in v)delete v[e];if(e.setRenderTarget(b),p=null,f=null,u=null,r=null,S=null,L.stop(),n.isPresenting=!1,e.setPixelRatio(k),e.setSize(T.width,T.height,!1),A!==null){let e=A.camera;e.fov=A.fov,e.zoom=A.zoom,e.updateProjectionMatrix(),A=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&H(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&H(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return u===null&&h&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(b=e.getRenderTarget(),r.addEventListener(`select`,ee),r.addEventListener(`selectstart`,ee),r.addEventListener(`selectend`,ee),r.addEventListener(`squeeze`,ee),r.addEventListener(`squeezestart`,ee),r.addEventListener(`squeezeend`,ee),r.addEventListener(`end`,te),r.addEventListener(`inputsourceschange`,ne),y.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(T),h&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;y.depth&&(o=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=y.stencil?O:D,a=y.stencil?x:g);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),f=u.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new qt(f.textureWidth,f.textureHeight,{format:E,type:d,depthTexture:new Ai(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new qt(p.framebufferWidth,p.framebufferHeight,{format:E,type:d,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),L.setContext(r),L.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function ne(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}function re(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),P.near=M.near=j.near=t,P.far=M.far=j.far=n,(F!==P.near||I!==P.far)&&(r.updateRenderState({depthNear:P.near,depthFar:P.far}),F=P.near,I=P.far),P.layers.mask=e.layers.mask|6,j.layers.mask=P.layers.mask&-5,M.layers.mask=P.layers.mask&-3;let i=e.parent,a=P.cameras;re(P,i);for(let e=0;e<a.length;e++)re(a[e],i);P.projectionMatrix.copy(j.projectionMatrix),P.projectionMatrixInverse.copy(j.projectionMatrixInverse),A===null&&e.isPerspectiveCamera&&(A={camera:e,fov:e.fov,zoom:e.zoom}),ie(e,P,i)};function ie(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=rt*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return P},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(P)},this.getCameraTexture=function(e){return v[e]};let ae=null;function oe(t,i){if(l=i.getViewerPose(c||a),m=i,l!==null){let t=l.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==P.cameras.length&&(P.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=u.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=N[n];o===void 0&&(o=new Qo,o.layers.enable(n),o.viewport=new Gt,N[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(P.matrix.copy(o.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale)),i===!0&&P.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&h){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&h){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new Mi,v[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}ae&&ae(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),m=null}let L=new As;L.setAnimationLoop(oe),this.setAnimationLoop=function(e){ae=e},this.dispose=function(){}}},Nu=new Xt,Pu=new q;Pu.set(-1,0,0,0,1,0,0,0,1);function Fu(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,co(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Nu.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Pu),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Iu(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?H(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):H(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var Lu=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ru=null;function zu(){return Ru===null&&(Ru=new ei(Lu,16,16,j,v),Ru.name=`DFG_LUT`,Ru.minFilter=c,Ru.magFilter=c,Ru.wrapS=r,Ru.wrapT=r,Ru.generateMipmaps=!1,Ru.needsUpdate=!0),Ru}var Bu=class{constructor(e={}){let{canvas:t=Ke(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:p=!1,outputBufferType:h=d}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);_=n.getContextAttributes().alpha}else _=a;let S=h,C=new Set([N,M,A]),w=new Set([d,g,m,x,y,b]),T=new Uint32Array(4),E=new Int32Array(4),D={textures:[],min:[],max:[],resolution:[]},O=null,k=null,j=[],P=[],F=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,ee=!1,te=null,ne=null,re=null,ie=null;this._outputColorSpace=Ie;let ae=0,oe=0,L=null,se=-1,ce=null,le=new Gt,ue=new Gt,de=null,fe=new J(0),pe=0,me=t.width,he=t.height,ge=1,_e=null,ve=null,ye=new Gt(0,0,me,he),be=new Gt(0,0,me,he),xe=!1,Se=new pi,Ce=new hi,we=!1,Te=!1,Ee=new Xt,De=new K,Oe=new Gt,ke={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ae=!1;function je(){return L===null?ge:1}let R=n;function Me(e,n){return t.getContext(e,n)}let Ne,Pe,z,Fe,B,V,Le,Re,ze,Be,Ve,Ue,We,Ge,qe,Ye,Xe,Qe,$e,et,tt,nt,rt;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:f};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,at,!1),t.addEventListener(`webglcontextrestored`,ot,!1),t.addEventListener(`webglcontextcreationerror`,st,!1),R===null){let t=`webgl2`;if(R=Me(t,e),R===null)throw Me(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}it()}catch(e){throw t.removeEventListener(`webglcontextlost`,at,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),U(`WebGLRenderer: `+e.message),e}function it(){Ne=new oc(R),Ne.init(),tt=new Ou(R,Ne),Pe=new Bs(R,Ne,e,tt),z=new Eu(R,Ne),Pe.reversedDepthBuffer&&p&&z.buffers.depth.setReversed(!0),ne=R.createFramebuffer(),re=R.createFramebuffer(),ie=R.createFramebuffer(),Fe=new lc(R),B=new ou,V=new Du(R,Ne,z,B,Pe,tt,Fe),Le=new ac(I),Re=new js(R),nt=new Rs(R,Re),ze=new sc(R,Re,Fe,nt),Be=new dc(R,ze,Re,nt,Fe),Qe=new uc(R,Pe,V),qe=new Vs(B),Ve=new au(I,Le,Ne,Pe,nt,qe),Ue=new Fu(I,B),We=new uu,Ge=new _u(Ne),Xe=new Ls(I,Le,z,Be,_,s),Ye=new Tu(I,Be,Pe),rt=new Iu(R,Fe,Pe,z),$e=new zs(R,Ne,Fe),et=new cc(R,Ne,Fe),Fe.programs=Ve.programs,I.capabilities=Pe,I.extensions=Ne,I.properties=B,I.renderLists=We,I.shadowMap=Ye,I.state=z,I.info=Fe}S!==1009&&(F=new pc(S,t.width,t.height,o,r,i));let W=new Mu(I,R);this.xr=W,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){let e=Ne.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ne.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ge},this.setPixelRatio=function(e){e!==void 0&&(ge=e,this.setSize(me,he,!1))},this.getSize=function(e){return e.set(me,he)},this.setSize=function(e,n,r=!0){W.isPresenting?H(`WebGLRenderer: Can't change size while VR device is presenting.`):(me=e,he=n,t.width=Math.floor(e*ge),t.height=Math.floor(n*ge),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),F!==null&&F.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(me*ge,he*ge).floor()},this.setDrawingBufferSize=function(e,n,r){me=e,he=n,ge=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(S===1009)U(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){H(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}F.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(le)},this.getViewport=function(e){return e.copy(ye)},this.setViewport=function(e,t,n,r){e.isVector4?ye.set(e.x,e.y,e.z,e.w):ye.set(e,t,n,r),z.viewport(le.copy(ye).multiplyScalar(je()).round())},this.getScissor=function(e){return e.copy(be)},this.setScissor=function(e,t,n,r){e.isVector4?be.set(e.x,e.y,e.z,e.w):be.set(e,t,n,r),z.scissor(ue.copy(be).multiplyScalar(je()).round())},this.getScissorTest=function(){return xe},this.setScissorTest=function(e){z.setScissorTest(xe=e)},this.setOpaqueSort=function(e){_e=e},this.setTransparentSort=function(e){ve=e},this.getClearColor=function(e){return e.copy(Xe.getClearColor())},this.setClearColor=function(){Xe.setClearColor(...arguments)},this.getClearAlpha=function(){return Xe.getClearAlpha()},this.setClearAlpha=function(){Xe.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(L!==null){let t=L.texture.format;e=C.has(t)}if(e){let e=L.texture.type,t=w.has(e),n=Xe.getClearColor(),r=Xe.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,R.clearBufferuiv(R.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,R.clearBufferiv(R.COLOR,0,E))}else r|=R.COLOR_BUFFER_BIT}t&&(r|=R.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&R.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),te=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,at,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),Xe.dispose(),We.dispose(),Ge.dispose(),V.dispose(),B.dispose(),Le.dispose(),Be.dispose(),ze.dispose(),nt.dispose(),rt.dispose(),Ve.dispose(),W.dispose(),W.removeEventListener(`sessionstart`,mt),W.removeEventListener(`sessionend`,ht),gt.stop()};function at(e){e.preventDefault(),Je(`WebGLRenderer: Context Lost.`),ee=!0}function ot(){Je(`WebGLRenderer: Context Restored.`),ee=!1;let e=Fe.autoReset,t=Ye.enabled,n=Ye.autoUpdate,r=Ye.needsUpdate,i=Ye.type;it(),Fe.autoReset=e,Ye.enabled=t,Ye.autoUpdate=n,Ye.needsUpdate=r,Ye.type=i}function st(e){U(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ct(e){let t=e.target;t.removeEventListener(`dispose`,ct),lt(t)}function lt(e){ut(e),B.remove(e)}function ut(e){let t=B.get(e).programs;t!==void 0&&(t.forEach(function(e){Ve.releaseProgram(e)}),e.isShaderMaterial&&Ve.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=ke);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=G(e,t,n,r,i);z.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=ze.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;nt.setup(i,r,s,n,c);let h,g=$e;if(c!==null&&(h=Re.get(c),g=et,g.setIndex(h)),i.isMesh)r.wireframe===!0?(z.setLineWidth(r.wireframeLinewidth*je()),g.setMode(R.LINES)):g.setMode(R.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),z.setLineWidth(e*je()),i.isLineSegments?g.setMode(R.LINES):i.isLineLoop?g.setMode(R.LINE_LOOP):g.setMode(R.LINE_STRIP)}else i.isPoints?g.setMode(R.POINTS):i.isSprite&&g.setMode(R.TRIANGLES);if(i.isBatchedMesh){if(Ne.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Re.get(c).bytesPerElement:1,o=B.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(R,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function dt(e,t,n,r){te!==null&&e.isNodeMaterial&&te.setObject(r,e),we===!0&&qe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Ct(e,t,r),e.side=0,e.needsUpdate=!0,Ct(e,t,r),e.side=2):Ct(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),te!==null&&te.renderStart(e,t,n),k=Ge.get(n),k.init(t),P.push(k),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),k.setupLights(),te!==null&&te.updateLights(k.state.lightsArray),Te=this.localClippingEnabled,we=qe.init(this.clippingPlanes,Te),we===!0&&qe.setGlobalState(this.clippingPlanes,t),te!==null&&Ye.render(k.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];dt(o,n,t,e),r.add(o)}else dt(i,n,t,e),r.add(i)}}),k=P.pop(),te!==null&&te.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=B.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Ne.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let ft=null;function pt(e){ft&&ft(e)}function mt(){gt.stop()}function ht(){gt.start()}let gt=new As;gt.setAnimationLoop(pt),typeof self<`u`&&gt.setContext(self),this.setAnimationLoop=function(e){ft=e,W.setAnimationLoop(e),e===null?gt.stop():gt.start()},W.addEventListener(`sessionstart`,mt),W.addEventListener(`sessionend`,ht),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){U(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(ee===!0)return;te!==null&&te.renderStart(e,t);let n=W.enabled===!0&&W.isPresenting===!0,r=F!==null&&(L===null||n)&&F.begin(I,L);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(F===null||F.isCompositing()===!1)&&(W.cameraAutoUpdate===!0&&W.updateCamera(t),t=W.getCamera()),e.isScene===!0&&e.onBeforeRender(I,e,t,L),k=Ge.get(e,P.length),k.init(t),k.state.textureUnits=V.getTextureUnits(),P.push(k),Ee.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?Ce.setFromArrayCamera(t):Se.setFromProjectionMatrix(Ee,He,t.reversedDepth),Te=this.localClippingEnabled,we=qe.init(this.clippingPlanes,Te),O=We.get(e,j.length),O.init(),j.push(O),this.info.render.frame++,W.enabled===!0&&W.isPresenting===!0){let e=I.xr.getDepthSensingMesh();e!==null&&_t(e,t,-1/0,I.sortObjects)}_t(e,t,0,I.sortObjects),O.finish(),te!==null&&te.updateLights(k.state.lightsArray),I.sortObjects===!0&&O.sort(_e,ve),Ae=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,Ae&&Xe.addToRenderList(O,e),this.info.autoReset===!0&&this.info.reset(),we===!0&&qe.beginShadows();let i=k.state.shadowsArray;if(Ye.render(i,e,t),we===!0&&qe.endShadows(),(r&&F.hasRenderPass())===!1){let n=O.opaque,r=O.transmissive;if(k.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];yt(n,r,e,a)}Ae&&Xe.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];vt(O,e,n,n.viewport)}}else r.length>0&&yt(n,r,e,t),Ae&&Xe.render(e),vt(O,e,t)}L!==null&&oe===0&&(V.updateMultisampleRenderTarget(L),V.updateRenderTargetMipmap(L)),r&&F.end(I),e.isScene===!0&&e.onAfterRender(I,e,t),nt.resetDefaultState(),se=-1,ce=null,P.pop(),P.length>0?(k=P[P.length-1],V.setTextureUnits(k.state.textureUnits),we===!0&&qe.setGlobalState(I.clippingPlanes,k.state.camera)):k=null,j.pop(),O=j.length>0?j[j.length-1]:null,te!==null&&te.renderEnd()};function _t(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)k.pushLight(e),e.castShadow&&k.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?Ce:Se;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&Oe.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Ee);let i=Be.update(e),a=e.material;a.visible&&O.push(e,i,a,n,Oe.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?Ce:Se;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=Be.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Oe.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Oe.copy(e.boundingSphere.center)),Oe.applyMatrix4(e.matrixWorld).applyMatrix4(Ee)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&O.push(e,i,c,n,Oe.z,s,t)}}else a.visible&&O.push(e,i,a,n,Oe.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)_t(i[e],t,n,r)}function vt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;k.setupLightsView(n),we===!0&&qe.setGlobalState(I.clippingPlanes,n),r&&z.viewport(le.copy(r)),i.length>0&&bt(i,t,n),a.length>0&&bt(a,t,n),o.length>0&&bt(o,t,n),z.buffers.depth.setTest(!0),z.buffers.depth.setMask(!0),z.buffers.color.setMask(!0),z.setPolygonOffset(!1)}function yt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(k.state.transmissionRenderTarget[r.id]===void 0){let e=Ne.has(`EXT_color_buffer_half_float`)||Ne.has(`EXT_color_buffer_float`);k.state.transmissionRenderTarget[r.id]=new qt(1,1,{generateMipmaps:!0,type:e?v:d,minFilter:u,samples:Math.max(4,Pe.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Pt.workingColorSpace})}let a=k.state.transmissionRenderTarget[r.id],o=r.viewport||le;a.setSize(o.z*I.transmissionResolutionScale,o.w*I.transmissionResolutionScale);let s=I.getRenderTarget(),c=I.getActiveCubeFace(),l=I.getActiveMipmapLevel();I.setRenderTarget(a),I.getClearColor(fe),pe=I.getClearAlpha(),pe<1&&I.setClearColor(16777215,.5),I.clear(),Ae&&Xe.render(n);let f=I.toneMapping;I.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),k.setupLightsView(r),we===!0&&qe.setGlobalState(I.clippingPlanes,r),bt(e,n,r),V.updateMultisampleRenderTarget(a),V.updateRenderTargetMipmap(a),Ne.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,xt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(V.updateMultisampleRenderTarget(a),V.updateRenderTargetMipmap(a))}I.setRenderTarget(s,c,l),I.setClearColor(fe,pe),p!==void 0&&(r.viewport=p),I.toneMapping=f}function bt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&xt(o,t,n,s,l,c)}}function xt(e,t,n,r,i,a){te!==null&&i.isNodeMaterial&&te.setObject(e,i),e.onBeforeRender(I,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(I,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,I.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,I.renderBufferDirect(n,t,r,i,e,a),i.side=2):I.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(I,t,n,r,i,a)}function St(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function Ct(e,t,n){t.isScene!==!0&&(t=ke);let r=B.get(e),i=k.state.lights,a=k.state.shadowsArray,o=i.state.version,s=Ve.getParameters(e,i.state,a,t,n,k.state.lightProbeGridArray),c=Ve.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Le.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ct),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Et(e,s),d}else s.uniforms=Ve.getUniforms(e),te!==null&&e.isNodeMaterial&&te.build(e,n,s),e.onBeforeCompile(s,I),d=Ve.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=qe.uniform),Et(e,s),r.needsLights=Ot(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=St(k.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function wt(e,t,n,r,i){let a=B.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=Ct(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function Tt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Sl.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Et(e,t){let n=B.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function G(e,t,n,r,i){t.isScene!==!0&&(t=ke),V.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=L===null?I.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:Pt.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Le.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(h=I.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=B.get(r),y=k.state.lights;if(we===!0&&(Te===!0||e!==ce)){let t=e===ce&&r.id===se;qe.setState(r,e,t)}let b=!1,x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==qe.numPlanes||v.numIntersection!==qe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===St(k.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(x=!0):b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;(b===!0||x===!0)&&(S=x===!0?wt(r,t,i,s,h):Ct(r,t,i),te&&r.isNodeMaterial&&te.onUpdateProgram(r,S,v));let C=!1,w=!1,T=!1,E=S.getUniforms(),O=v.uniforms;if(z.useProgram(S.program)&&(C=!0,w=!0,T=!0),r.id!==se&&(se=r.id,w=!0),C||ce!==e){z.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),E.setValue(R,`projectionMatrix`,e.projectionMatrix),E.setValue(R,`viewMatrix`,e.matrixWorldInverse);let t=E.map.cameraPosition;t!==void 0&&t.setValue(R,De.setFromMatrixPosition(e.matrixWorld)),Pe.logarithmicDepthBuffer&&E.setValue(R,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&E.setValue(R,`isOrthographic`,e.isOrthographicCamera===!0),ce!==e&&(ce=e,w=!0,T=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&E.setValue(R,`sunShadowMap`,y.state.sunShadowMap,V),y.state.directionalShadowMap.length>0&&E.setValue(R,`directionalShadowMap`,y.state.directionalShadowMap,V),y.state.spotShadowMap.length>0&&E.setValue(R,`spotShadowMap`,y.state.spotShadowMap,V),y.state.pointShadowMap.length>0&&E.setValue(R,`pointShadowMap`,y.state.pointShadowMap,V)),i.isSkinnedMesh){E.setOptional(R,i,`bindMatrix`),E.setOptional(R,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),E.setValue(R,`boneTexture`,e.boneTexture,V))}i.isBatchedMesh&&(E.setOptional(R,i,`batchingTexture`),E.setValue(R,`batchingTexture`,i._matricesTexture,V),E.setOptional(R,i,`batchingIdTexture`),E.setValue(R,`batchingIdTexture`,i._indirectTexture,V),E.setOptional(R,i,`batchingColorTexture`),i._colorsTexture!==null&&E.setValue(R,`batchingColorTexture`,i._colorsTexture,V));let A=n.morphAttributes;if((A.position!==void 0||A.normal!==void 0||A.color!==void 0)&&Qe.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,E.setValue(R,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(O.envMapIntensity.value=t.environmentIntensity),O.dfgLUT!==void 0&&(O.dfgLUT.value=zu()),w){if(E.setValue(R,`toneMappingExposure`,I.toneMappingExposure),v.needsLights&&Dt(O,T),a&&r.fog===!0&&Ue.refreshFogUniforms(O,a),Ue.refreshMaterialUniforms(O,r,ge,he,k.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=D,t=0;for(let n of k.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;O.probesSH.value=e.textures,O.probesMin.value=e.min,O.probesMax.value=e.max,O.probesResolution.value=e.resolution}Sl.upload(R,Tt(v),O,V)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Sl.upload(R,Tt(v),O,V),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&E.setValue(R,`center`,i.center),E.setValue(R,`modelViewMatrix`,i.modelViewMatrix),E.setValue(R,`normalMatrix`,i.normalMatrix),E.setValue(R,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];rt.update(n,S),rt.bind(n,S)}}return S}function Dt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Ot(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return ae},this.getActiveMipmapLevel=function(){return oe},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(e,t,n){let r=B.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),B.get(e.texture).__webglTexture=t,B.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=B.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){L=e,ae=t,oe=n;let r=null,i=!1,a=!1;if(e){let o=B.get(e);if(o.__useDefaultFramebuffer!==void 0){z.bindFramebuffer(R.FRAMEBUFFER,o.__webglFramebuffer),le.copy(e.viewport),ue.copy(e.scissor),de=e.scissorTest,z.viewport(le),z.scissor(ue),z.setScissorTest(de),se=-1;return}if(o.__webglFramebuffer===void 0)V.setupRenderTarget(e);else if(o.__hasExternalTextures)V.rebindTextures(e,B.get(e.texture).__webglTexture,B.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&B.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);V.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=B.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&V.useMultisampledRTT(e)===!1?B.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,le.copy(e.viewport),ue.copy(e.scissor),de=e.scissorTest}else le.copy(ye).multiplyScalar(ge).floor(),ue.copy(be).multiplyScalar(ge).floor(),de=xe;if(n!==0&&(r=ne),z.bindFramebuffer(R.FRAMEBUFFER,r)&&z.drawBuffers(e,r),z.viewport(le),z.scissor(ue),z.setScissorTest(de),i){let r=B.get(e.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=B.get(e.textures[t]);R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=B.get(e.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,t.__webglTexture,n)}se=-1};function kt(e){let t=B.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Pe.textureFormatReadable(e.format),t.__typeReadable=Pe.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){U(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=B.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){z.bindFramebuffer(R.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+s);let u=kt(o);if(u.__formatReadable===!1){U(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){U(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&R.readPixels(t,n,r,i,tt.convert(c),tt.convert(l),a)}finally{let e=L===null?null:B.get(L).__webglFramebuffer;z.bindFramebuffer(R.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=B.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){z.bindFramebuffer(R.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+s);let d=kt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,f),R.bufferData(R.PIXEL_PACK_BUFFER,a.byteLength,R.STREAM_READ),R.readPixels(t,n,r,i,tt.convert(l),tt.convert(u),0),R.bindBuffer(R.PIXEL_PACK_BUFFER,null);let p=L===null?null:B.get(L).__webglFramebuffer;z.bindFramebuffer(R.FRAMEBUFFER,p);let m=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await Ze(R,m,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,f),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,a),R.bindBuffer(R.PIXEL_PACK_BUFFER,null),R.deleteBuffer(f),R.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;V.setTexture2D(e,0),R.copyTexSubImage2D(R.TEXTURE_2D,n,0,0,o,s,i,a),z.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=tt.convert(t.format),_=tt.convert(t.type),v;t.isData3DTexture?(V.setTexture3D(t,0),v=R.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(V.setTexture2DArray(t,0),v=R.TEXTURE_2D_ARRAY):(V.setTexture2D(t,0),v=R.TEXTURE_2D),z.activeTexture(R.TEXTURE0),z.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,t.flipY),z.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),z.pixelStorei(R.UNPACK_ALIGNMENT,t.unpackAlignment);let y=z.getParameter(R.UNPACK_ROW_LENGTH),b=z.getParameter(R.UNPACK_IMAGE_HEIGHT),x=z.getParameter(R.UNPACK_SKIP_PIXELS),S=z.getParameter(R.UNPACK_SKIP_ROWS),C=z.getParameter(R.UNPACK_SKIP_IMAGES);z.pixelStorei(R.UNPACK_ROW_LENGTH,h.width),z.pixelStorei(R.UNPACK_IMAGE_HEIGHT,h.height),z.pixelStorei(R.UNPACK_SKIP_PIXELS,l),z.pixelStorei(R.UNPACK_SKIP_ROWS,u),z.pixelStorei(R.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=B.get(e),r=B.get(t),h=B.get(n.__renderTarget),g=B.get(r.__renderTarget);z.bindFramebuffer(R.READ_FRAMEBUFFER,h.__webglFramebuffer),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,B.get(e).__webglTexture,i,d+n),R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,B.get(t).__webglTexture,a,m+n)),R.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,R.DEPTH_BUFFER_BIT,R.NEAREST);z.bindFramebuffer(R.READ_FRAMEBUFFER,null),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||B.has(e)){let n=B.get(e),r=B.get(t);z.bindFramebuffer(R.READ_FRAMEBUFFER,re),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,ie);for(let e=0;e<c;e++)w?R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):R.framebufferTexture2D(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,n.__webglTexture,i),T?R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):R.framebufferTexture2D(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,r.__webglTexture,a),i===0?T?R.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):R.copyTexSubImage2D(v,a,f,p,l,u,o,s):R.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,R.COLOR_BUFFER_BIT,R.NEAREST);z.bindFramebuffer(R.READ_FRAMEBUFFER,null),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?R.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?R.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):R.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):R.texSubImage2D(R.TEXTURE_2D,a,f,p,o,s,g,_,h);z.pixelStorei(R.UNPACK_ROW_LENGTH,y),z.pixelStorei(R.UNPACK_IMAGE_HEIGHT,b),z.pixelStorei(R.UNPACK_SKIP_PIXELS,x),z.pixelStorei(R.UNPACK_SKIP_ROWS,S),z.pixelStorei(R.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&R.generateMipmap(v),z.unbindTexture()},this.initRenderTarget=function(e){B.get(e).__webglFramebuffer===void 0&&V.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?V.setTextureCube(e,0):e.isData3DTexture?V.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?V.setTexture2DArray(e,0):V.setTexture2D(e,0),z.unbindTexture()},this.resetState=function(){ae=0,oe=0,L=null,z.reset(),nt.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return He}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Pt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Pt._getUnpackColorSpace()}},Vu={type:`change`},Hu={type:`start`},Uu={type:`end`},Wu=new Rr,Gu=new jr,Ku=Math.cos(70*Et.DEG2RAD),qu=new K,Ju=2*Math.PI,Yu={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Xu=1e-6,Zu=class extends Ds{constructor(n,r=null){super(n,r),this.state=Yu.NONE,this.target=new K,this.cursor=new K,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:`ArrowLeft`,UP:`ArrowUp`,RIGHT:`ArrowRight`,BOTTOM:`ArrowDown`},this.mouseButtons={LEFT:e.ROTATE,MIDDLE:e.DOLLY,RIGHT:e.PAN},this.touches={ONE:t.ROTATE,TWO:t.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle=`auto`,this._domElementKeyEvents=null,this._lastPosition=new K,this._lastQuaternion=new Dt,this._lastTargetPosition=new K,this._quat=new Dt().setFromUnitVectors(n.up,new K(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Ts,this._sphericalDelta=new Ts,this._scale=1,this._panOffset=new K,this._rotateStart=new G,this._rotateEnd=new G,this._rotateDelta=new G,this._panStart=new G,this._panEnd=new G,this._panDelta=new G,this._dollyStart=new G,this._dollyEnd=new G,this._dollyDelta=new G,this._dollyDirection=new K,this._mouse=new G,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=$u.bind(this),this._onPointerDown=Qu.bind(this),this._onPointerUp=ed.bind(this),this._onContextMenu=sd.bind(this),this._onMouseWheel=rd.bind(this),this._onKeyDown=id.bind(this),this._onTouchStart=ad.bind(this),this._onTouchMove=od.bind(this),this._onMouseDown=td.bind(this),this._onMouseMove=nd.bind(this),this._interceptControlDown=cd.bind(this),this._interceptControlUp=ld.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e===`grab`?this.domElement.style.cursor=`grab`:this.domElement.style.cursor=`auto`}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener(`pointerdown`,this._onPointerDown),this.domElement.addEventListener(`pointercancel`,this._onPointerUp),this.domElement.addEventListener(`contextmenu`,this._onContextMenu),this.domElement.addEventListener(`wheel`,this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener(`keydown`,this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction=`none`}disconnect(){this.state=Yu.NONE,this.domElement.removeEventListener(`pointerdown`,this._onPointerDown),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.domElement.removeEventListener(`pointercancel`,this._onPointerUp),this.domElement.removeEventListener(`wheel`,this._onMouseWheel),this.domElement.removeEventListener(`contextmenu`,this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener(`keydown`,this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener(`keyup`,this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction=``,this.domElement.style.cursor=`auto`}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Vu),this.update(),this.state=Yu.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;qu.copy(t).sub(this.target),qu.applyQuaternion(this._quat),this._spherical.setFromVector3(qu),this.autoRotate&&this.state===Yu.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=Ju:n>Math.PI&&(n-=Ju),r<-Math.PI?r+=Ju:r>Math.PI&&(r-=Ju),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let i=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let e=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),i=e!=this._spherical.radius}if(qu.setFromSpherical(this._spherical),qu.applyQuaternion(this._quatInverse),t.copy(this.target).add(qu),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let e=null;if(this.object.isPerspectiveCamera){let t=qu.length();e=this._clampDistance(t*this._scale);let n=t-e;this.object.position.addScaledVector(this._dollyDirection,n),this.object.updateMatrixWorld(),i=!!n}else if(this.object.isOrthographicCamera){let t=new K(this._mouse.x,this._mouse.y,0);t.unproject(this.object);let n=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),i=n!==this.object.zoom;let r=new K(this._mouse.x,this._mouse.y,0);r.unproject(this.object),this.object.position.sub(r).add(t),this.object.updateMatrixWorld(),e=qu.length()}else console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.`),this.zoomToCursor=!1;e!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position):(Wu.origin.copy(this.object.position),Wu.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Wu.direction))<Ku?this.object.lookAt(this.target):(Gu.setFromNormalAndCoplanarPoint(this.object.up,this.target),Wu.intersectPlane(Gu,this.target))))}else if(this.object.isOrthographicCamera){let e=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),e!==this.object.zoom&&(this.object.updateProjectionMatrix(),i=!0)}return this._scale=1,this._performCursorZoom=!1,i||this._lastPosition.distanceToSquared(this.object.position)>Xu||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Xu||this._lastTargetPosition.distanceToSquared(this.target)>Xu?(this.dispatchEvent(Vu),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e===null?Ju/60/60*this.autoRotateSpeed:Ju/60*this.autoRotateSpeed*e}_getZoomScale(e){let t=Math.abs(e*.01);return .95**(this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){qu.setFromMatrixColumn(t,0),qu.multiplyScalar(-e),this._panOffset.add(qu)}_panUp(e,t){this.screenSpacePanning===!0?qu.setFromMatrixColumn(t,1):(qu.setFromMatrixColumn(t,0),qu.crossVectors(this.object.up,qu)),qu.multiplyScalar(e),this._panOffset.add(qu)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;qu.copy(r).sub(this.target);let i=qu.length();i*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*i/n.clientHeight,this.object.matrix),this._panUp(2*t*i/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.`),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),r=e-n.left,i=t-n.top,a=n.width,o=n.height;this._mouse.x=r/a*2-1,this._mouse.y=-(i/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientY),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Ju*this._rotateDelta.x/t.clientHeight),this._rotateUp(Ju*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Ju*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Ju*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Ju*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Ju*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyStart.set(0,i)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Ju*this._rotateDelta.x/t.clientHeight),this._rotateUp(Ju*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,i),this._dollyDelta.set(0,(this._dollyEnd.y/this._dollyStart.y)**+this.zoomSpeed),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new G,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function Qu(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.ownerDocument.addEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.addEventListener(`pointerup`,this._onPointerUp)),this._isTrackingPointer(e)||(this._addPointer(e),e.pointerType===`touch`?this._onTouchStart(e):this._onMouseDown(e),this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grabbing`)))}function $u(e){this.enabled!==!1&&(e.pointerType===`touch`?this._onTouchMove(e):this._onMouseMove(e))}function ed(e){switch(this._removePointer(e),this._pointers.length){case 0:this.domElement.releasePointerCapture(e.pointerId),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.dispatchEvent(Uu),this.state=Yu.NONE,this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grab`);break;case 1:let t=this._pointers[0],n=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:n.x,pageY:n.y})}}function td(t){let n;switch(t.button){case 0:n=this.mouseButtons.LEFT;break;case 1:n=this.mouseButtons.MIDDLE;break;case 2:n=this.mouseButtons.RIGHT;break;default:n=-1}switch(n){case e.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(t),this.state=Yu.DOLLY;break;case e.ROTATE:if(t.ctrlKey||t.metaKey||t.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(t),this.state=Yu.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(t),this.state=Yu.ROTATE}break;case e.PAN:if(t.ctrlKey||t.metaKey||t.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(t),this.state=Yu.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(t),this.state=Yu.PAN}break;default:this.state=Yu.NONE}this.state!==Yu.NONE&&this.dispatchEvent(Hu)}function nd(e){switch(this.state){case Yu.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(e);break;case Yu.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(e);break;case Yu.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(e)}}function rd(e){this.enabled!==!1&&this.enableZoom!==!1&&this.state===Yu.NONE&&(e.preventDefault(),this.dispatchEvent(Hu),this._handleMouseWheel(this._customWheelEvent(e)),this.dispatchEvent(Uu))}function id(e){this.enabled!==!1&&this._handleKeyDown(e)}function ad(e){switch(this._trackPointer(e),this._pointers.length){case 1:switch(this.touches.ONE){case t.ROTATE:if(this.enableRotate===!1){this.state=Yu.NONE;break}this._handleTouchStartRotate(e),this.state=Yu.TOUCH_ROTATE;break;case t.PAN:if(this.enablePan===!1){this.state=Yu.NONE;break}this._handleTouchStartPan(e),this.state=Yu.TOUCH_PAN;break;default:this.state=Yu.NONE}break;case 2:switch(this.touches.TWO){case t.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(e),this.state=Yu.TOUCH_DOLLY_PAN;break;case t.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(e),this.state=Yu.TOUCH_DOLLY_ROTATE;break;default:this.state=Yu.NONE}break;default:this.state=Yu.NONE}this.state!==Yu.NONE&&this.dispatchEvent(Hu)}function od(e){switch(this._trackPointer(e),this.state){case Yu.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(e),this.update();break;case Yu.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(e),this.update();break;case Yu.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(e),this.update();break;case Yu.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(e),this.update();break;default:this.state=Yu.NONE}}function sd(e){this.enabled!==!1&&e.preventDefault()}function cd(e){e.key===`Control`&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}function ld(e){e.key===`Control`&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}var ud=class extends Nn{constructor(){super(),this.name=`RoomEnvironment`,this.position.y=-3.5;let e=new Ni;e.deleteAttribute(`uv`);let t=new ho({side:1}),n=new ho,r=new es(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);let i=new Zr(e,t);i.position.set(-.757,13.219,.717),i.scale.set(31.713,28.305,28.591),this.add(i);let a=new li(e,n,6),o=new wn;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let s=new Zr(e,dd(50));s.position.set(-16.116,14.37,8.208),s.scale.set(.1,2.428,2.739),this.add(s);let c=new Zr(e,dd(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let l=new Zr(e,dd(17));l.position.set(14.904,12.198,-1.832),l.scale.set(.15,4.265,6.331),this.add(l);let u=new Zr(e,dd(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new Zr(e,dd(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new Zr(e,dd(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function dd(e){return new go({color:0,emissive:16777215,emissiveIntensity:e})}var fd=new URL(`blade_wasm_bg-O-1yLtel.wasm`,import.meta.url).href,pd=class e{static __wrap(t){let n=Object.create(e.prototype);return n.__wbg_ptr=t,Dd.register(n,n.__wbg_ptr,n),n}__destroy_into_raw(){let e=this.__wbg_ptr;return this.__wbg_ptr=0,Dd.unregister(this),e}free(){let e=this.__destroy_into_raw();X.__wbg_meshdata_free(e,0)}get indices(){let e=X.meshdata_indices(this.__wbg_ptr);var t=Ad(e[0],e[1]).slice();return X.__wbindgen_free(e[0],e[1]*4,4),t}get positions(){let e=X.meshdata_positions(this.__wbg_ptr);var t=Od(e[0],e[1]).slice();return X.__wbindgen_free(e[0],e[1]*4,4),t}get span_max_mm(){return X.meshdata_span_max_mm(this.__wbg_ptr)}get span_min_mm(){return X.meshdata_span_min_mm(this.__wbg_ptr)}get triangle_count(){return X.meshdata_triangle_count(this.__wbg_ptr)>>>0}get tube_axis(){let e=X.meshdata_tube_axis(this.__wbg_ptr);var t=kd(e[0],e[1]).slice();return X.__wbindgen_free(e[0],e[1]*8,8),t}get vertex_count(){return X.meshdata_vertex_count(this.__wbg_ptr)>>>0}get volume_mm3(){return X.meshdata_volume_mm3(this.__wbg_ptr)}};Symbol.dispose&&(pd.prototype[Symbol.dispose]=pd.prototype.free);function md(e,t){let n,r,i,a;try{n=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),r=Jd,i=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),a=Jd}catch(e){throw i&&X.__wbindgen_free(i,a*1,1),n&&X.__wbindgen_free(n,r*1,1),e}let o=X.build_mesh(n,r,i,a);if(o[2])throw Hd(o[1]);return pd.__wrap(o[0])}function hd(e){let t=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),n=Jd,r=X.export_3mf_bytes(t,n);if(r[3])throw Hd(r[2]);var i=jd(r[0],r[1]).slice();return X.__wbindgen_free(r[0],r[1]*1,1),i}function gd(e,t){let n,r,i,a;try{n=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),r=Jd,i=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),a=Jd}catch(e){throw i&&X.__wbindgen_free(i,a*1,1),n&&X.__wbindgen_free(n,r*1,1),e}let o=X.export_fabricated_3mf_bytes(n,r,i,a);if(o[3])throw Hd(o[2]);var s=jd(o[0],o[1]).slice();return X.__wbindgen_free(o[0],o[1]*1,1),s}function _d(e,t){let n,r;try{let o,s,c,l;try{o=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),s=Jd,c=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),l=Jd}catch(e){throw c&&X.__wbindgen_free(c,l*1,1),o&&X.__wbindgen_free(o,s*1,1),e}let u=X.export_fabricated_step(o,s,c,l);var i=u[0],a=u[1];if(u[3])throw i=0,a=0,Hd(u[2]);return n=i,r=a,Id(i,a)}finally{X.__wbindgen_free(n,r,1)}}function vd(e,t){let n,r,i,a;try{n=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),r=Jd,i=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),a=Jd}catch(e){throw i&&X.__wbindgen_free(i,a*1,1),n&&X.__wbindgen_free(n,r*1,1),e}let o=X.export_fabricated_stl_bytes(n,r,i,a);if(o[3])throw Hd(o[2]);var s=jd(o[0],o[1]).slice();return X.__wbindgen_free(o[0],o[1]*1,1),s}function yd(e,t){let n,r,i,a;try{n=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),r=Jd,i=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),a=Jd}catch(e){throw i&&X.__wbindgen_free(i,a*1,1),n&&X.__wbindgen_free(n,r*1,1),e}let o=X.export_part_3mf_bytes(n,r,i,a);if(o[3])throw Hd(o[2]);var s=jd(o[0],o[1]).slice();return X.__wbindgen_free(o[0],o[1]*1,1),s}function bd(e,t){let n,r,i,a;try{n=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),r=Jd,i=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),a=Jd}catch(e){throw i&&X.__wbindgen_free(i,a*1,1),n&&X.__wbindgen_free(n,r*1,1),e}let o=X.export_part_stl_bytes(n,r,i,a);if(o[3])throw Hd(o[2]);var s=jd(o[0],o[1]).slice();return X.__wbindgen_free(o[0],o[1]*1,1),s}function xd(e,t){let n,r;try{let o,s,c,l;try{o=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),s=Jd,c=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),l=Jd}catch(e){throw c&&X.__wbindgen_free(c,l*1,1),o&&X.__wbindgen_free(o,s*1,1),e}let u=X.export_step(o,s,c,l);var i=u[0],a=u[1];if(u[3])throw i=0,a=0,Hd(u[2]);return n=i,r=a,Id(i,a)}finally{X.__wbindgen_free(n,r,1)}}function Sd(e){let t=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),n=Jd,r=X.export_stl_bytes(t,n);if(r[3])throw Hd(r[2]);var i=jd(r[0],r[1]).slice();return X.__wbindgen_free(r[0],r[1]*1,1),i}function Cd(e,t){let n,r;try{let o,s,c,l;try{o=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),s=Jd,c=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),l=Jd}catch(e){throw c&&X.__wbindgen_free(c,l*1,1),o&&X.__wbindgen_free(o,s*1,1),e}let u=X.fabrication_report(o,s,c,l);var i=u[0],a=u[1];if(u[3])throw i=0,a=0,Hd(u[2]);return n=i,r=a,Id(i,a)}finally{X.__wbindgen_free(n,r,1)}}function wd(e,t){let n,r;try{let o,s,c,l;try{o=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),s=Jd,c=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),l=Jd}catch(e){throw c&&X.__wbindgen_free(c,l*1,1),o&&X.__wbindgen_free(o,s*1,1),e}let u=X.optimize_blade_wasm(o,s,c,l);var i=u[0],a=u[1];if(u[3])throw i=0,a=0,Hd(u[2]);return n=i,r=a,Id(i,a)}finally{X.__wbindgen_free(n,r,1)}}function Td(e,t){let n,r;try{let o,s,c,l;try{o=Vd(e,X.__wbindgen_malloc,X.__wbindgen_realloc),s=Jd,c=Vd(t,X.__wbindgen_malloc,X.__wbindgen_realloc),l=Jd}catch(e){throw c&&X.__wbindgen_free(c,l*1,1),o&&X.__wbindgen_free(o,s*1,1),e}let u=X.simulate_aero(o,s,c,l);var i=u[0],a=u[1];if(u[3])throw i=0,a=0,Hd(u[2]);return n=i,r=a,Id(i,a)}finally{X.__wbindgen_free(n,r,1)}}function Ed(){return{__proto__:null,"./blade_wasm_bg.js":{__proto__:null,__wbg___wbindgen_throw_4c88d8bf264fd984:function(e,t){throw Error(Id(e,t))},__wbg_getTime_edc91481cbc4cd78:function(e){return e.getTime()},__wbg_new_0_36d738a0c8cfac43:function(){return new Date},__wbindgen_generic_0000000000000001:function(e,t){return Id(e,t)},__wbindgen_init_externref_table:function(){let e=X.__wbindgen_externrefs;e.set(0,void 0),e.set(1024,void 0),e.set(1025,null),e.set(1026,!0),e.set(1027,!1)}}}}var Dd=typeof FinalizationRegistry>`u`?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(e=>X.__wbg_meshdata_free(e,1));function Od(e,t){return e>>>=0,Nd().subarray(e/4,e/4+t)}function kd(e,t){return e>>>=0,Fd().subarray(e/8,e/8+t)}function Ad(e,t){return e>>>=0,Rd().subarray(e/4,e/4+t)}function jd(e,t){return e>>>=0,Bd().subarray(e/1,e/1+t)}var Md=null;function Nd(){return(Md===null||Md.byteLength===0)&&(Md=new Float32Array(X.memory.buffer)),Md}var Pd=null;function Fd(){return(Pd===null||Pd.byteLength===0)&&(Pd=new Float64Array(X.memory.buffer)),Pd}function Id(e,t){return e>>>=0,Kd(Bd().subarray(e,e+t))}var Ld=null;function Rd(){return(Ld===null||Ld.byteLength===0)&&(Ld=new Uint32Array(X.memory.buffer)),Ld}var zd=null;function Bd(){return(zd===null||zd.byteLength===0)&&(zd=new Uint8Array(X.memory.buffer)),zd}function Vd(e,t,n){if(n===void 0){let n=qd.encode(e),r=t(n.length,1)>>>0;return Bd().subarray(r,r+n.length).set(n),Jd=n.length,r}let r=e.length,i=t(r,1)>>>0,a=Bd(),o=0;for(;o<r;o++){let t=e.charCodeAt(o);if(t>127)break;a[i+o]=t}if(o!==r){o!==0&&(e=e.slice(o)),i=n(i,r,r=o+e.length*3,1)>>>0;let t=Bd().subarray(i+o,i+r),a=qd.encodeInto(e,t);o+=a.written,i=n(i,r,o,1)>>>0}return Jd=o,i}function Hd(e){let t=X.__wbindgen_externrefs.get(e);return X.__externref_table_dealloc(e),t}var Ud=new TextDecoder(`utf-8`,{ignoreBOM:!0});Ud.decode();var Wd=2146435072,Gd=0;function Kd(e){return Gd+=e.length,Gd>=Wd&&(Ud=new TextDecoder(`utf-8`,{ignoreBOM:!0}),Ud.decode(),Gd=e.length),Ud.decode(e)}var qd=new TextEncoder;`encodeInto`in qd||(qd.encodeInto=function(e,t){let n=qd.encode(e);return t.set(n),{read:e.length,written:n.length}});var Jd=0,X;function Yd(e,t){return X=e.exports,Md=null,Pd=null,Ld=null,zd=null,X.__wbindgen_start(),X}async function Xd(e,t){if(typeof Response==`function`&&e instanceof Response){if(!e.ok)throw Error(`failed to fetch Wasm: ${e.status} ${e.statusText} fetching '${e.url}'`);if(typeof WebAssembly.instantiateStreaming==`function`)try{return await WebAssembly.instantiateStreaming(e,t)}catch(t){if(n(e.type)&&e.headers.get(`Content-Type`)!==`application/wasm`)console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",t);else throw t}let r=await e.arrayBuffer();return await WebAssembly.instantiate(r,t)}{let n=await WebAssembly.instantiate(e,t);return n instanceof WebAssembly.Instance?{instance:n,module:e}:n}function n(e){switch(e){case`basic`:case`cors`:case`default`:return!0}return!1}}var Zd;async function Qd(e){return X===void 0?(Zd===void 0&&(Zd=$d(e),Zd.catch(()=>{Zd=void 0})),Zd):X}async function $d(e){e!==void 0&&(Object.getPrototypeOf(e)===Object.prototype?{module_or_path:e}=e:console.warn(`using deprecated parameters for the initialization function; pass a single object instead`)),e===void 0&&(e=new URL(new URL(`blade_wasm_bg-O-1yLtel.wasm`,import.meta.url).href,``+import.meta.url));let t=Ed();(typeof e==`string`||typeof Request==`function`&&e instanceof Request||typeof URL==`function`&&e instanceof URL)&&(e=fetch(e));let{instance:n,module:r}=await Xd(await e,t);return Yd(n,r)}var ef=`{
  "schema_version": 1,
  "rotor": {
    "radius_mm": 600.0,
    "hub_radius_mm": 60.0,
    "blade_count": 3,
    "design_tsr": 4.5,
    "wind_speed_mps": 8.0,
    "pitch_axis_ratio": 0.25,
    "station_count": 11
  },
  "distributions": {
    "chord_mm": {
      "type": "linear",
      "root": 70.0,
      "tip": 35.0
    },
    "twist_deg": {
      "type": "linear",
      "root": 20.0,
      "tip": 3.0
    }
  },
  "airfoils": [
    {
      "span_ratio": 0.0,
      "airfoil": {
        "type": "naca4",
        "max_camber": 0.04,
        "camber_position": 0.4,
        "thickness_ratio": 0.12
      }
    },
    {
      "span_ratio": 1.0,
      "airfoil": {
        "type": "naca4",
        "max_camber": 0.04,
        "camber_position": 0.4,
        "thickness_ratio": 0.12
      }
    }
  ],
  "overrides": [],
  "hub": {
    "diameter_mm": 120.0,
    "bore_diameter_mm": 12.0,
    "length_mm": 50.0
  },
  "manufacturing": {
    "min_trailing_edge_mm": 0.05,
    "wall_thickness_mm": 1.2
  }
}
`;function tf(){return{enabled:!0,hub_fit_mode:`kidwind4_lockrev4`,aero_profile:`adaptive`,wrap_style:`saddle`,view_mode:`mounted`,cone_length_mm:68,skirt_length_mm:20,wall_thickness_mm:2.2,blade_clearance_mm:.5,trefoil_clearance_mm:.25,assembly_slide_pct:0,cutaway_mode:!1,hub_diameter_mm:60,bolt_circle_mm:40,trefoil_center_r_mm:15,trefoil_lobe_r_mm:7.5,trefoil_depth_mm:2}}function nf(e,t,n){return Math.max(t,Math.min(n,e))}function rf(e,t){let n=((e-t)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;return n>Math.PI&&(n-=Math.PI*2),n}function af(e,t,n,r=Math.PI,i=64,a=18){let o=nf(t,0,1),s=n;if(e===`elliptical`)s=n*Math.sqrt(Math.max(0,1-(1-o)*(1-o)));else if(e===`vonkarman`){let e=Math.acos(nf(1-2*o,-1,1));s=n*Math.sqrt(Math.max(0,(e-.5*Math.sin(2*e))/Math.PI))}else if(e===`bell`){let e=o**1.32,t=.17*Math.sin(Math.PI*o)*(1-o);s=n*nf(e*(3-2*e)+t*1.4,0,1.05)}else{let e=Math.acos(nf(1-2*o,-1,1)),t=Math.sqrt(Math.max(0,(e-.5*Math.sin(2*e))/Math.PI)),c=Math.exp(-(r*r)/(.34*.34)),l=nf((a-6)/28,0,1.2),u=nf((i-30)/65,0,1.2),d=o**2.4*(.9+2.4*c*(.55+.3*u+.25*l));s=n*t+d}return Math.max(0,s)}function of(e,t,n,r,i,a=0){let o=Math.cos(e),s=Math.sin(e),c=t,l=Math.max(2,Math.round(i));for(let e=0;e<l;e++){let t=(e+.5)*2*Math.PI/l,i=r*Math.cos(t),a=r*Math.sin(t),u=i*o+a*s,d=i*i+a*a,f=u*u-(d-n*n);if(f>0){let e=u+Math.sqrt(f);e>c&&(c=e)}}return c+a}function sf(e,t,n,r,i){let a=nf(n*.44,18,38);a*.5;let o=nf(r,-35,55)*Math.PI/180,s=Math.cos(o),c=Math.sin(o),l=t*s+e*c,u=-t*c+e*s,d=(l+.38*a)/a;if(d>=0&&d<=1){let e=.725*(.2969*Math.sqrt(Math.max(1e-5,d))-.126*d-.3516*d*d+.2843*d*d*d-.1015*d*d*d*d)*a,t=Math.max(2.6,e+i),n=Math.abs(u)/t,r=Math.min(d,1-d)*a;return r<i?Math.hypot(i-r,Math.max(0,Math.abs(u)-e))/Math.max(.5,i):n}let f=d<0?-d*a:(d-1)*a;return Math.hypot(f,Math.max(0,Math.abs(u)-(d<0?1.8:.9)))/Math.max(2.5,i+2.2)}function cf(){let e=[],t=[];return{positions:e,indices:t,addVert(t,n,r){let i=e.length/3;return e.push(t,n,r),i},addTri(e,n,r){e!==n&&n!==r&&e!==r&&t.push(e,n,r)}}}function lf(e,t,n){let r=n*.5,i=e.wrap_style===`flush`?0:nf(e.skirt_length_mm,8,Math.max(10,t.hub_length_mm+2)),a=nf(e.cone_length_mm,30,140),o=nf(e.wall_thickness_mm,1.2,5),s=Math.max(1,Math.round(t.blade_count)),c=nf(e.blade_clearance_mm,.2,1.5),l=t.root_twist_deg+t.collective_pitch_deg,u=e.wrap_style===`flush`?0:16,d=u+26,f=[];for(let e=0;e<u;e++)f.push(-i+e/u*i);for(let e=0;e<26;e++){let t=e/26*.96;f.push(t*a)}let p=-nf((e.hub_fit_mode===`kidwind4_lockrev4`?20:t.hub_length_mm)*.5,4,Math.max(4.5,i-3)),m=nf(t.root_chord_mm*.22,9,15.5)+c,h=d-1,g=Array.from({length:h},()=>Array(120).fill(!0)),_=Array.from({length:d},()=>Array(120).fill(0)),v=[];for(let e=0;e<s;e++)v.push(e*2*Math.PI/s);let y=(n,i)=>{let a=1/0,o=Math.PI;for(let s of v){let u=rf(i,s);if(o=Math.min(o,Math.abs(u)),Math.abs(u)<1.15){let i=r*u,o=n-p;if(e.wrap_style===`cuff`)a=Math.min(a,Math.hypot(i,o)/Math.max(4,m));else if(e.wrap_style===`closed`||e.wrap_style===`saddle`){let e=sf(i,o,t.root_chord_mm,l,c);a=Math.min(a,e)}}}return{minNorm:a,minDelta:o}};if(e.wrap_style!==`flush`){for(let e=0;e<h-4;e++){let t=.5*(f[e]+f[e+1]);if(!(t>3.5))for(let n=0;n<120;n++){let{minNorm:r}=y(t,(n+.5)*2*Math.PI/120);r<1&&(g[e][n]=!1)}}if(e.wrap_style===`saddle`)for(let e=0;e<120;e++){let t=-1;for(let n=0;n<u;n++)g[n][e]||(t=Math.max(t,n));if(t>=0)for(let n=0;n<=t;n++)g[n][e]=!1}let t=!0,n=0;for(;t&&n<16;){t=!1,n++;for(let e=0;e<h-1;e++)for(let n=0;n<120;n++){let r=(n+1)%120,i=g[e][n],a=g[e][r],o=g[e+1][n];i===g[e+1][r]&&a===o&&i!==a&&(i?g[e][r]=!0:g[e][n]=!0,t=!0)}}}for(let t=0;t<d;t++){let n=f[t];for(let r=0;r<120;r++){let{minNorm:i}=y(n,r*2*Math.PI/120);if(e.wrap_style===`closed`&&i>=.95&&i<1.65){let e=1-(i-.95)/.7;_[t][r]=2.2*Math.sin(nf(e,0,1)*Math.PI*.5)}}}let b=cf(),x=Array.from({length:d},()=>Array(120).fill(-1)),S=Array.from({length:d},()=>Array(120).fill(-1));for(let n=0;n<d;n++){let s=f[n],c=[],u=[];for(let e=0;e<120;e++){let t=e*2*Math.PI/120;c.push(Math.cos(t)),u.push(Math.sin(t))}for(let f=0;f<120;f++){let p=f*2*Math.PI/120,m=Math.PI;for(let e of v)m=Math.min(m,Math.abs(rf(p,e)));let h=r+o,g=r+.25;if(s<0){let a=Math.abs(s)/Math.max(1,i),c=0;if(e.aero_profile===`adaptive`){let e=Math.exp(-(m*m)/(.34*.34)),n=nf((l-6)/28,0,1.2),r=nf((t.root_chord_mm-30)/65,0,1.2);c=(.9+2.4*e*(.55+.3*r+.25*n))*(1-.35*a)}g=r+.25,h=g+o+c+_[n][f]}else{let i=nf(1-s/a,0,1);h=af(e.aero_profile,i,r+.25+o,m,t.root_chord_mm,l)+_[n][f];let c=s<1.5?r+.25:Math.max(.9,h-o);g=Math.min(h-.85,c),n===d-1&&(h=Math.max(2.6,h),g=Math.max(.7,h-o*.72))}x[n][f]=b.addVert(h*c[f],h*u[f],s),S[n][f]=b.addVert(g*c[f],g*u[f],s)}}let C=b.addVert(0,0,a),w=b.addVert(0,0,Math.max(4,a-Math.max(o,2.6)));for(let e=0;e<h;e++)for(let t=0;t<120;t++){if(!g[e][t])continue;let n=(t+1)%120,r=x[e][t],i=x[e][n],a=x[e+1][n],o=x[e+1][t],s=S[e][t],c=S[e][n],l=S[e+1][n],u=S[e+1][t];b.addTri(r,i,a),b.addTri(r,a,o),b.addTri(s,l,c),b.addTri(s,u,l);let d=(e,t,n,r)=>{b.addTri(e,r,t),b.addTri(e,n,r)};e!==0&&g[e-1][t]||d(r,i,s,c),e+1<h&&!g[e+1][t]&&d(a,o,l,u),g[e][n]||d(i,a,c,l);let f=(t-1+120)%120;g[e][f]||d(o,r,u,s)}let T=d-1;for(let e=0;e<120;e++){let t=(e+1)%120;b.addTri(x[T][e],x[T][t],C),b.addTri(S[T][e],w,S[T][t])}return{id:`nose-shell`,color_hex:2450411,positions:new Float32Array(b.positions),indices:new Uint32Array(b.indices)}}function uf(e,t,n){let r=n*.5,i=cf(),a=Math.max(1,Math.round(t.blade_count)),o=(e.hub_fit_mode===`kidwind4_lockrev4`?e.trefoil_depth_mm:Math.min(3.5,e.trefoil_depth_mm))+1.5,s=r+.35,c=[0,.55,o],l=[],u=[];for(let n=0;n<c.length;n++){let o=c[n],d=[],f=[],p=n===0?.55:0;for(let n=0;n<120;n++){let c=n*2*Math.PI/120,l=Math.cos(c),u=Math.sin(c),m=r*.45;m=e.hub_fit_mode===`kidwind4_lockrev4`?of(c,e.trefoil_center_r_mm,e.trefoil_lobe_r_mm,e.bolt_circle_mm*.5,a,e.trefoil_clearance_mm+p):Math.max(3,t.hub_bore_mm*.5+e.trefoil_clearance_mm+p),m=Math.min(s-1.5,m),d.push(i.addVert(s*l,s*u,o)),f.push(i.addVert(m*l,m*u,o))}l.push(d),u.push(f)}for(let e=0;e<c.length-1;e++)for(let t=0;t<120;t++){let n=(t+1)%120;i.addTri(l[e][t],l[e][n],l[e+1][n]),i.addTri(l[e][t],l[e+1][n],l[e+1][t]),i.addTri(u[e][t],u[e+1][n],u[e][n]),i.addTri(u[e][t],u[e+1][t],u[e+1][n])}let d=c.length-1;for(let e=0;e<120;e++){let t=(e+1)%120;i.addTri(u[0][e],u[0][t],l[0][t]),i.addTri(u[0][e],l[0][t],l[0][e]),i.addTri(u[d][e],l[d][t],u[d][t]),i.addTri(u[d][e],l[d][e],l[d][t])}return{id:`trefoil-pocket-ring`,color_hex:16096779,positions:new Float32Array(i.positions),indices:new Uint32Array(i.indices)}}function df(e,t,n){let r=cf(),i=Math.max(1,Math.round(t.blade_count)),a=e.hub_fit_mode===`kidwind4_lockrev4`?e.bolt_circle_mm*.5:nf(n*.31,6,n*.38),o=nf(e.cone_length_mm*.42,8.5,14.5),s=.05,c=o-2.6,l=4.5,u=1.48,d=[[u,s],[l,s],[l,o],[0,o],[0,c],[u,c]];for(let e=0;e<i;e++){let t=(e+.5)*2*Math.PI/i,n=a*Math.cos(t),o=a*Math.sin(t),s=[],c=-1,l=-1;for(let e=0;e<d.length;e++){let[t,i]=d[e];if(t===0)e===3?c=r.addVert(n,o,i):l=r.addVert(n,o,i),s.push([]);else{let e=[];for(let a=0;a<20;a++){let s=a*2*Math.PI/20;e.push(r.addVert(n+t*Math.cos(s),o+t*Math.sin(s),i))}s.push(e)}}for(let e=0;e<20;e++){let t=(e+1)%20;r.addTri(s[0][e],s[0][t],s[1][t]),r.addTri(s[0][e],s[1][t],s[1][e]),r.addTri(s[1][e],s[1][t],s[2][t]),r.addTri(s[1][e],s[2][t],s[2][e]),r.addTri(s[2][e],s[2][t],c),r.addTri(s[5][e],l,s[5][t]),r.addTri(s[0][e],s[5][t],s[0][t]),r.addTri(s[0][e],s[5][e],s[5][t])}}return{id:`m3-blind-bosses`,color_hex:959977,positions:new Float32Array(r.positions),indices:new Uint32Array(r.indices)}}function ff(e,t){if(e.wrap_style!==`cuff`)return[];let n=cf(),r=nf(t.root_chord_mm*.22,9,15.5),i=2.55,a=nf(e.wall_thickness_mm+1.4,2.8,5.2),o=[],s=[],c=[],l=[];for(let e=0;e<28;e++){let t=e*2*Math.PI/28,u=Math.cos(t),d=Math.sin(t);o.push(n.addVert(i*u,i*d,0)),s.push(n.addVert(r*u,r*d,0)),c.push(n.addVert(r*u,r*d,a)),l.push(n.addVert(i*u,i*d,a))}for(let e=0;e<28;e++){let t=(e+1)%28;n.addTri(s[e],s[t],c[t]),n.addTri(s[e],c[t],c[e]),n.addTri(o[e],l[t],o[t]),n.addTri(o[e],l[e],l[t]),n.addTri(o[e],o[t],s[t]),n.addTri(o[e],s[t],s[e]),n.addTri(l[e],c[t],l[t]),n.addTri(l[e],c[e],c[t])}return[{id:`blade-rotating-cuff`,color_hex:16096779,positions:new Float32Array(n.positions),indices:new Uint32Array(n.indices)}]}function pf(e,t){let n=Math.max(1,Math.round(t.blade_count)),r=e.hub_fit_mode===`kidwind4_lockrev4`?e.hub_diameter_mm:t.hub_diameter_mm,i=e.hub_fit_mode===`kidwind4_lockrev4`?20:t.hub_length_mm,a=r*.5,o=Math.max(2.65,t.hub_bore_mm*.5),s=cf(),c=[],l=[],u=[],d=[];for(let e=0;e<48;e++){let t=e*2*Math.PI/48,n=Math.cos(t),r=Math.sin(t);c.push(s.addVert(o*n,o*r,-i)),l.push(s.addVert(a*n,a*r,-i)),u.push(s.addVert(a*n,a*r,0)),d.push(s.addVert(o*n,o*r,0))}for(let e=0;e<48;e++){let t=(e+1)%48;s.addTri(l[e],l[t],u[t]),s.addTri(l[e],u[t],u[e]),s.addTri(c[e],d[t],c[t]),s.addTri(c[e],d[e],d[t]),s.addTri(c[e],c[t],l[t]),s.addTri(c[e],l[t],l[e]),s.addTri(d[e],u[t],d[t]),s.addTri(d[e],u[e],u[t])}let f=[{id:`ghost-hub-body`,color_hex:6583435,positions:new Float32Array(s.positions),indices:new Uint32Array(s.indices)}];if(e.hub_fit_mode===`kidwind4_lockrev4`){let t=cf(),r=[],i=[],a=[],s=[];for(let c=0;c<96;c++){let l=c*2*Math.PI/96,u=of(l,e.trefoil_center_r_mm,e.trefoil_lobe_r_mm,e.bolt_circle_mm*.5,n,0),d=Math.max(o+1,u-1.2),f=Math.cos(l),p=Math.sin(l);r.push(t.addVert(o*f,o*p,0)),i.push(t.addVert(u*f,u*p,0)),a.push(t.addVert(d*f,d*p,e.trefoil_depth_mm)),s.push(t.addVert(o*f,o*p,e.trefoil_depth_mm))}for(let e=0;e<96;e++){let n=(e+1)%96;t.addTri(i[e],i[n],a[n]),t.addTri(i[e],a[n],a[e]),t.addTri(r[e],s[n],r[n]),t.addTri(r[e],s[e],s[n]),t.addTri(r[e],r[n],i[n]),t.addTri(r[e],i[n],i[e]),t.addTri(s[e],a[n],s[n]),t.addTri(s[e],a[e],a[n])}f.push({id:`ghost-hub-trefoil`,color_hex:9741240,positions:new Float32Array(t.positions),indices:new Uint32Array(t.indices)})}let p=cf(),m=e.hub_fit_mode===`kidwind4_lockrev4`?e.bolt_circle_mm*.5:nf(a*.62,6,a*.76);for(let e=0;e<n;e++){let t=(e+.5)*2*Math.PI/n,r=m*Math.cos(t),a=m*Math.sin(t),o=-i-3,s=-i,c=p.addVert(r,a,o),l=p.addVert(r,a,8),u=[],d=[],f=[],h=[];for(let e=0;e<14;e++){let t=e*2*Math.PI/14,n=Math.cos(t),i=Math.sin(t);u.push(p.addVert(r+2.7*n,a+2.7*i,o)),d.push(p.addVert(r+2.7*n,a+2.7*i,s)),f.push(p.addVert(r+1.45*n,a+1.45*i,s)),h.push(p.addVert(r+1.45*n,a+1.45*i,8))}for(let e=0;e<14;e++){let t=(e+1)%14;p.addTri(c,u[t],u[e]),p.addTri(u[e],u[t],d[t]),p.addTri(u[e],d[t],d[e]),p.addTri(f[e],d[e],d[t]),p.addTri(f[e],d[t],f[t]),p.addTri(f[e],f[t],h[t]),p.addTri(f[e],h[t],h[e]),p.addTri(h[e],h[t],l)}}return f.push({id:`ghost-hub-bolts`,color_hex:15222046,positions:new Float32Array(p.positions),indices:new Uint32Array(p.indices)}),f}function mf(e,t,n=0){let r=e.hub_fit_mode===`kidwind4_lockrev4`?e.hub_diameter_mm:t.hub_diameter_mm,i=e.wrap_style===`flush`?0:e.skirt_length_mm,a=Math.max(1,Math.round(t.blade_count)),o=e.hub_fit_mode===`kidwind4_lockrev4`?e.bolt_circle_mm:Number((r*.62).toFixed(1)),s=t.root_twist_deg+t.collective_pitch_deg,c={adaptive:{cd:.14,boost:18},vonkarman:{cd:.12,boost:11},elliptical:{cd:.16,boost:13},bell:{cd:.21,boost:21}},l={saddle:4,closed:8,cuff:6,flush:0},u=c[e.aero_profile],d=nf(u.cd+(68-e.cone_length_mm)*9e-4-l[e.wrap_style]*.002,.08,.34),f=Math.max(4,Math.round(u.boost+l[e.wrap_style]*.6+(s-14)*.12+(t.root_chord_mm-60)*.06)),p=r*.5,m=((Math.PI*p*Math.sqrt(p*p+e.cone_length_mm*e.cone_length_mm)*.72+Math.PI*r*i*.78)*e.wall_thickness_mm+a*1150+2100)/1e3*1.27,h=e.hub_fit_mode===`kidwind4_lockrev4`?`Fits Kidwind4-LockRev4.step: Ø${r.toFixed(0)}mm · +${e.trefoil_clearance_mm.toFixed(2)}mm Trefoil slip · 60° blade-bolt clearance`:`Auto-matched to current Rotor Hub Ø${r.toFixed(0)}mm (${a} blades)`;return{hub_diameter_mm:r,skirt_length_mm:i,bolt_circle_mm:o,nose_cd:Number(d.toFixed(2)),root_flow_boost_pct:f,est_mass_g:Number(m.toFixed(1)),total_triangles:n,hardware_label:`${a}× M3×30 Blind`,fit_note:h}}function hf(e,t){let n=e.hub_fit_mode===`kidwind4_lockrev4`?e.hub_diameter_mm:t.hub_diameter_mm,r=lf(e,t,n),i=uf(e,t,n),a=df(e,t,n),o=ff(e,t),s=pf(e,t),c=[r,i,a];return{submeshes:c,cuff_submeshes:o,ghost_hub_submeshes:s,metrics:mf(e,t,c.reduce((e,t)=>e+Math.floor(t.indices.length/3),0))}}function gf(e,t,n=`cone`){let r=hf({...e,cutaway_mode:!1},t),i=[];if(n===`cuff`){let n=r.cuff_submeshes[0]??ff({...e,wrap_style:`cuff`},t)[0],a=Math.max(1,Math.round(t.blade_count));for(let e=0;e<a;e++)i.push({positions:n.positions,indices:n.indices,offsetX:e*38,offsetY:0})}else for(let e of r.submeshes)i.push({positions:e.positions,indices:e.indices,offsetX:0,offsetY:0});let a=1/0,o=0;for(let e of i){o+=Math.floor(e.indices.length/3);for(let t=2;t<e.positions.length;t+=3){let n=e.positions[t];n<a&&(a=n)}}let s=Number.isFinite(a)?-a:0,c=new ArrayBuffer(84+o*50),l=new DataView(c),u=`BladeLab NoseCone ${e.aero_profile}/${e.wrap_style} D=${r.metrics.hub_diameter_mm.toFixed(0)}mm`;for(let e=0;e<Math.min(80,u.length);e++)l.setUint8(e,u.charCodeAt(e));l.setUint32(80,o,!0);let d=84;for(let e of i){let t=e.positions,n=e.indices;for(let r=0;r+2<n.length;r+=3){let i=n[r]*3,a=n[r+1]*3,o=n[r+2]*3,c=t[i]+e.offsetX,u=t[i+1]+e.offsetY,f=t[i+2]+s,p=t[a]+e.offsetX,m=t[a+1]+e.offsetY,h=t[a+2]+s,g=t[o]+e.offsetX,_=t[o+1]+e.offsetY,v=t[o+2]+s,y=p-c,b=m-u,x=h-f,S=g-c,C=_-u,w=v-f,T=b*w-x*C,E=x*S-y*w,D=y*C-b*S,O=Math.hypot(T,E,D);O>1e-12&&(T/=O,E/=O,D/=O),l.setFloat32(d,T,!0),l.setFloat32(d+4,E,!0),l.setFloat32(d+8,D,!0),l.setFloat32(d+12,c,!0),l.setFloat32(d+16,u,!0),l.setFloat32(d+20,f,!0),l.setFloat32(d+24,p,!0),l.setFloat32(d+28,m,!0),l.setFloat32(d+32,h,!0),l.setFloat32(d+36,g,!0),l.setFloat32(d+40,_,!0),l.setFloat32(d+44,v,!0),l.setUint16(d+48,0,!0),d+=50}}return new Uint8Array(c)}function _f(e,t,n,r,i=0){let a=.04,o=.4,s=Math.cos(t),c=Math.sin(t),l=[],u=[];for(let t=0;t<=24;t++){let d=.5*(1-Math.cos(Math.PI*t/24)),f=5*.14*(.2969*Math.sqrt(d)-.126*d-.3516*d*d+.2843*d**3-.1015*d**4),p=d<o?a/(o*o)*(2*o*d-d*d):a/.6**2*(1-2*o+2*o*d-d*d),m=(d-.35)*e,h=-(p+f)*e-i,g=-(p-f)*e+i;l.push([n+m*s-h*c,r+m*c+h*s]),u.push([n+m*s-g*c,r+m*c+g*s])}return{upper:l,lower:u,all:l.concat([...u].reverse())}}function vf(e,t,n,r,i){let a=e.getContext(`2d`);if(!a)return;let o=typeof window<`u`?Math.min(window.devicePixelRatio||1,2):1,s=e.clientWidth||340,c=e.clientHeight||196;(e.width!==Math.round(s*o)||e.height!==Math.round(c*o))&&(e.width=Math.round(s*o),e.height=Math.round(c*o)),a.save(),a.scale(o,o),a.clearRect(0,0,s,c);let l=i===`atelier`,u={fg:l?`#18181b`:`#f1f5f9`,muted:l?`#475569`:`#94a3b8`,card:l?`#ffffff`:`#0b0e15`,border:l?`#cbd5e1`:`rgba(255,255,255,0.12)`,primary:l?`#1d4ed8`:`#22d3ee`,warn:l?`#e8451e`:`#fbbf24`,ok:l?`#047857`:`#34d399`,hubFill:l?`rgba(100,116,139,0.20)`:`rgba(148,163,184,0.20)`,hubStroke:l?`#475569`:`#94a3b8`},d=(t.hub_fit_mode===`kidwind4_lockrev4`?t.hub_diameter_mm:n.hub_diameter_mm)*.5,f=n.root_twist_deg+n.collective_pitch_deg,p=t.assembly_slide_pct/100,m=Math.round(s*.57),h=Math.min(1.5,m*.44/Math.max(55,t.cone_length_mm*.9)),g=c*.56,_=m*.65,v=20*h,y=d*h,b=(d+t.wall_thickness_mm)*h,x=t.wrap_style===`flush`?0:t.skirt_length_mm,S=t.wrap_style===`saddle`||t.wrap_style===`flush`?-p*24*h:0,C=t.wrap_style===`closed`||t.wrap_style===`cuff`?p*20*h:0,w=_-t.cone_length_mm*h+S,T=_+x*h+S;a.save(),a.font=`600 10px ui-monospace, monospace`,a.fillStyle=u.fg,a.fillText(`Side Aero + Slide`,8,14),a.fillStyle=u.hubFill,a.strokeStyle=u.hubStroke,a.lineWidth=1.3,a.fillRect(_,g-y,v,y*2),a.strokeRect(_,g-y,v,y*2),t.hub_fit_mode===`kidwind4_lockrev4`&&a.fillRect(_-2*h,g-26*h,2*h,52*h);let E=g+(t.hub_fit_mode===`kidwind4_lockrev4`?20*h:y*.62);a.fillStyle=u.warn,a.fillRect(_-9*h+S,E-1.2*h,v+12*h-S,2.4*h);let D=e=>{let r=nf((e-w)/Math.max(1,t.cone_length_mm*h),0,1);return af(t.aero_profile,r,d+t.wall_thickness_mm,0,n.root_chord_mm,f)*h};a.fillStyle=l?`rgba(29,78,216,0.16)`:`rgba(34,211,238,0.16)`,a.strokeStyle=u.primary,a.lineWidth=1.6,a.beginPath(),a.moveTo(w,g);for(let e=w;e<=_+S;e+=2)a.lineTo(e,g-D(e));a.lineTo(T,g-b),a.lineTo(T,g+b);for(let e=_+S;e>=w;e-=2)a.lineTo(e,g+D(e));a.closePath(),a.fill(),a.stroke();let O=_+10*h,k=g-y-C,A=Math.max(18,k-26*h);a.fillStyle=l?`rgba(29,78,216,0.25)`:`rgba(34,211,238,0.28)`,a.strokeStyle=u.primary,a.fillRect(O-5*h,A,10*h,k-A),a.strokeRect(O-5*h,A,10*h,k-A),t.wrap_style===`cuff`&&(a.fillStyle=u.warn,a.fillRect(O-7*h,k-4*h,14*h,4*h)),a.setLineDash([5,5]),a.lineDashOffset=-r*22;for(let e=0;e<3;e++){a.strokeStyle=e===0?u.ok:u.primary,a.globalAlpha=e===0?.9:.45,a.lineWidth=e===0?1.4:1,a.beginPath();for(let t=6;t<=m-8;t+=4){let n=g-8-e*10;if(t>w-8){let r=t<=_+S?D(t):b;n=Math.min(n,g-r-(5+e*5))}t===6?a.moveTo(t,n):a.lineTo(t,n)}a.stroke()}a.restore(),a.save(),a.strokeStyle=u.border,a.lineWidth=1,a.beginPath(),a.moveTo(m,8),a.lineTo(m,c-8),a.stroke();let j=s-m,M=m+j*.5,N=c*.55,P=Math.min(j,c)/48;a.font=`600 10px ui-monospace, monospace`,a.fillStyle=u.fg,a.fillText(`Skirt Cutout`,m+8,14);let F=M-10*P*1.4,I=M+10*P*1.4;a.fillStyle=l?`rgba(29,78,216,0.08)`:`rgba(34,211,238,0.08)`,a.fillRect(F,24,I-F,c-42);let ee=18*P,te=t.blade_clearance_mm*P*2,ne=nf(f,-35,55)*Math.PI/180;if(t.wrap_style===`saddle`){let{upper:e,lower:t}=_f(ee,ne,M,N,te),n=0;for(let t=1;t<e.length;t++)e[t][1]<e[n][1]&&(n=t);let r=0;for(let e=1;e<t.length;e++)t[e][1]>t[r][1]&&(r=e);a.fillStyle=u.card,a.strokeStyle=u.warn,a.lineWidth=1.4,a.setLineDash([3,2]),a.beginPath(),a.moveTo(I+4,e[n][1]);for(let t=n;t>=0;t--)a.lineTo(e[t][0],e[t][1]);for(let e=0;e<=r;e++)a.lineTo(t[e][0],t[e][1]);a.lineTo(I+4,t[r][1]),a.closePath(),a.fill(),a.stroke(),a.setLineDash([])}else if(t.wrap_style===`closed`){let e=_f(ee,ne,M,N,te).all;a.fillStyle=u.card,a.strokeStyle=u.ok,a.lineWidth=1.5,a.beginPath(),e.forEach((e,t)=>t===0?a.moveTo(e[0],e[1]):a.lineTo(e[0],e[1])),a.closePath(),a.fill(),a.stroke()}else if(t.wrap_style===`cuff`){let e=ee*.56;a.fillStyle=u.card,a.strokeStyle=u.warn,a.lineWidth=1.4,a.beginPath(),a.arc(M,N,e+te,0,Math.PI*2),a.fill(),a.stroke(),a.strokeStyle=u.warn,a.beginPath(),a.arc(M,N,e,0,Math.PI*2),a.stroke()}let re=_f(ee,ne,M,N,0).all;a.fillStyle=l?`rgba(29,78,216,0.26)`:`rgba(34,211,238,0.28)`,a.strokeStyle=u.primary,a.lineWidth=1.5,a.beginPath(),re.forEach((e,t)=>t===0?a.moveTo(e[0],e[1]):a.lineTo(e[0],e[1])),a.closePath(),a.fill(),a.stroke(),a.font=`400 9.5px ui-monospace, monospace`,a.fillStyle=u.muted,a.textAlign=`center`,a.fillText(`Z=0..${x.toFixed(0)}mm`,M,c-6),a.restore(),a.restore()}var yf=1e-9;function bf(e,t){if(e.length===0)return 0;if(e.length===1)return e[0].y;let n=Math.min(1,Math.max(0,t));if(n<=0)return e[0].y;if(n>=1)return e[e.length-1].y;let r=(t,n)=>{let r=e.map(e=>e[t]),i=r.length;for(let e=1;e<i;e++)for(let t=0;t<i-e;t++)r[t]=(1-n)*r[t]+n*r[t+1];return r[0]},i=0,a=1;for(let e=0;e<48;e++){let e=.5*(i+a);r(`x`,e)<n?i=e:a=e}return r(`y`,.5*(i+a))}function xf(e){let t=[],n=0,r=e.length;for(;n<r;){let i=e[n];if(i===` `||i===`	`||i===`
`||i===`\r`)n++;else if(i>=`0`&&i<=`9`||i===`.`&&n+1<r&&e[n+1]>=`0`&&e[n+1]<=`9`){let i=n,a=!1;for(;n<r;){let t=e[n];if(t>=`0`&&t<=`9`)n++;else if(t===`.`&&!a)a=!0,n++;else break}if(n<r&&(e[n]===`e`||e[n]===`E`)){n++,n<r&&(e[n]===`+`||e[n]===`-`)&&n++;let t=n;for(;n<r&&e[n]>=`0`&&e[n]<=`9`;)n++;if(n===t)return null}let o=Number(e.slice(i,n));if(!Number.isFinite(o))return null;t.push({kind:`num`,value:o})}else if(i>=`a`&&i<=`z`||i>=`A`&&i<=`Z`||i===`_`){let i=n;for(;n<r;){let t=e[n];if(t>=`a`&&t<=`z`||t>=`A`&&t<=`Z`||t>=`0`&&t<=`9`||t===`_`)n++;else break}t.push({kind:`id`,name:e.slice(i,n)})}else if(i===`*`&&n+1<r&&e[n+1]===`*`)t.push({kind:`op`,value:`^`}),n+=2;else if(i===`+`||i===`-`||i===`*`||i===`/`||i===`%`||i===`^`)t.push({kind:`op`,value:i}),n++;else if(i===`(`)t.push({kind:`lparen`}),n++;else if(i===`)`)t.push({kind:`rparen`}),n++;else if(i===`,`)t.push({kind:`comma`}),n++;else return null}return t}var Sf={sin:{minArgs:1,maxArgs:1,fn:e=>Math.sin(e)},cos:{minArgs:1,maxArgs:1,fn:e=>Math.cos(e)},tan:{minArgs:1,maxArgs:1,fn:e=>Math.tan(e)},asin:{minArgs:1,maxArgs:1,fn:e=>Math.asin(e)},acos:{minArgs:1,maxArgs:1,fn:e=>Math.acos(e)},atan:{minArgs:1,maxArgs:1,fn:e=>Math.atan(e)},atan2:{minArgs:2,maxArgs:2,fn:(e,t)=>Math.atan2(e,t)},sqrt:{minArgs:1,maxArgs:1,fn:e=>Math.sqrt(e)},abs:{minArgs:1,maxArgs:1,fn:e=>Math.abs(e)},exp:{minArgs:1,maxArgs:1,fn:e=>Math.exp(e)},ln:{minArgs:1,maxArgs:1,fn:e=>Math.log(e)},log:{minArgs:1,maxArgs:1,fn:e=>Math.log(e)},pow:{minArgs:2,maxArgs:2,fn:(e,t)=>e**+t},deg:{minArgs:1,maxArgs:1,fn:e=>e*180/Math.PI},rad:{minArgs:1,maxArgs:1,fn:e=>e*Math.PI/180},min:{minArgs:1,maxArgs:8,fn:(...e)=>Math.min(...e)},max:{minArgs:1,maxArgs:8,fn:(...e)=>Math.max(...e)},floor:{minArgs:1,maxArgs:1,fn:e=>Math.floor(e)},ceil:{minArgs:1,maxArgs:1,fn:e=>Math.ceil(e)},round:{minArgs:1,maxArgs:1,fn:e=>Math.round(e)}};function Cf(e,t,n,r){let i=e.trim();if(!i||i.length>512)return 0;let a=xf(i);if(!a||a.length===0)return 0;let o={x:n,s:r,r:n*t.radius_mm,R:t.radius_mm,r_hub:t.hub_radius_mm,B:t.blade_count,tsr:t.design_tsr,pi:Math.PI},s=0,c=!1,l=()=>a[s],u=()=>a[s++],d=()=>{let e=f();for(;!c;){let t=l();if(t?.kind===`op`&&(t.value===`+`||t.value===`-`)){u();let n=f();e=t.value===`+`?e+n:e-n}else break}return e},f=()=>{let e=p();for(;!c;){let t=l();if(t?.kind===`op`&&(t.value===`*`||t.value===`/`||t.value===`%`)){u();let n=p();t.value===`*`?e*=n:t.value===`/`?e/=n:e%=n}else break}return e},p=()=>{let e=l();if(e?.kind===`op`&&(e.value===`+`||e.value===`-`)){u();let t=p();return e.value===`-`?-t:t}return m()},m=()=>{let e=h(),t=l();return!c&&t?.kind===`op`&&t.value===`^`?(u(),e**+p()):e},h=()=>{let e=u();if(!e)return c=!0,0;if(e.kind===`num`)return e.value;if(e.kind===`id`){if(l()?.kind===`lparen`){let t=Object.prototype.hasOwnProperty.call(Sf,e.name)?Sf[e.name]:void 0;if(!t)return c=!0,0;u();let n=[];if(l()?.kind!==`rparen`)for(;!c&&(n.push(d()),l()?.kind===`comma`);)u();return l()?.kind!==`rparen`||(u(),n.length<t.minArgs||n.length>t.maxArgs)?(c=!0,0):t.fn(...n)}return Object.prototype.hasOwnProperty.call(o,e.name)?o[e.name]:(c=!0,0)}if(e.kind===`lparen`){let e=d();return l()?.kind===`rparen`?(u(),e):(c=!0,0)}return c=!0,0},g=d();return c||s!==a.length||!Number.isFinite(g)?0:g}function wf(e){return JSON.parse(JSON.stringify(e))}function Tf(e,t){return JSON.stringify(e)===JSON.stringify(t)}function Ef(e,t,n,r){switch(e.type){case`constant`:return e.value;case`linear`:return e.root+(e.tip-e.root)*r;case`schmitz`:{let r=e.design_cl??1,i=n*t.radius_mm,a=t.design_tsr*n,o=2/3*Math.atan2(1,a),s=Math.sin(.5*o);return 16*Math.PI*i/(t.blade_count*r)*s*s}case`bezier`:return bf(e.points,r);case`formula`:return Cf(e.expr,t,n,r)}}function Df(e,t,n,r){switch(e.type){case`constant`:return e.value;case`linear`:return e.root+(e.tip-e.root)*r;case`schmitz`:{let r=e.design_alpha_deg??0,i=t.design_tsr*n;return 2/3*Math.atan2(1,i)*180/Math.PI-r}case`bezier`:return bf(e.points,r);case`formula`:return Cf(e.expr,t,n,r)}}function Of(e){let{rotor:t,distributions:n,overrides:r}=e,i=t.hub_radius_mm/t.radius_mm,a=1-i,o=Math.max(2,Math.round(t.station_count)),s=[];for(let e=0;e<o;e++){let t=e/(o-1);s.push(i+a*t)}for(let e of r)s.push(e.span_ratio);s.sort((e,t)=>e-t);let c=[];for(let e of s)(c.length===0||Math.abs(e-c[c.length-1])>1e-9)&&c.push(e);return c.map((e,o)=>{let s=a>0?Math.min(1,Math.max(0,(e-i)/a)):0,c=Ef(n.chord_mm,t,e,s),l=Df(n.twist_deg,t,e,s),u=r.find(t=>Math.abs(t.span_ratio-e)<=yf),d=u?.chord_mm??null,f=u?.twist_deg??null;return{index:o,span_ratio:e,radius_mm:e*t.radius_mm,base_chord_mm:c,base_twist_deg:l,override_chord_mm:d,override_twist_deg:f,effective_chord_mm:d??c,effective_twist_deg:f??l,has_override:d!==null||f!==null}})}function kf(e,t){let n=t.hub_radius_mm/t.radius_mm;if(!Number.isFinite(e)||e<=n+1e-5)return n;if(e>=.99999)return 1;let r=Math.max(2,Math.round(t.station_count)),i=1-n;for(let t=0;t<r;t++){let a=n+i*(t/(r-1));if(Math.abs(e-a)<=1e-4)return a}return e}function Af(e,t,n,r){if(!e||e.length===0)return[];if(Math.abs(n-t)<1e-9)return r?e.map(e=>({...e,span_ratio:kf(e.span_ratio,r)})):[...e];let i=Number.isFinite(t)&&t>=0&&t<1?t:n,a=Math.max(1e-6,1-i),o=Math.max(1e-6,1-n),s=e.map(e=>{let t=Math.max(0,Math.min(1,(e.span_ratio-i)/a)),s=Math.max(n,Math.min(1,n+o*t));return r&&(s=kf(s,r)),{...e,span_ratio:s}});return s.sort((e,t)=>e.span_ratio-t.span_ratio),s}function jf(e,t,n,r){let i=Number.isFinite(t)&&t>=0&&t<1?t:n,a=Math.max(1e-6,1-i),o=Math.max(1e-6,1-n),s=Math.max(0,Math.min(1,(e-i)/a)),c=Math.max(n,Math.min(1,n+o*s));return r?kf(c,r):c}function Mf(e,t,n){let r=wf(e),i=e.rotor.hub_radius_mm/e.rotor.radius_mm;r.rotor[t]=n,t===`hub_radius_mm`&&typeof n==`number`&&Number.isFinite(n)&&n>0&&(r.hub.diameter_mm=Number((2*n).toFixed(4)),r.hub.bore_diameter_mm>=r.hub.diameter_mm&&(r.hub.bore_diameter_mm=Number((r.hub.diameter_mm*.5).toFixed(2)),typeof r.hub.shaft_flat_radial_mm==`number`&&r.hub.shaft_flat_radial_mm>=r.hub.bore_diameter_mm/2&&(r.hub.shaft_flat_radial_mm=null)));let a=r.rotor.hub_radius_mm/r.rotor.radius_mm;return(t===`radius_mm`||t===`hub_radius_mm`)&&Number.isFinite(a)&&a>0&&a<1&&r.overrides.length>0&&(r.overrides=Af(r.overrides,i,a,r.rotor)),r}function Nf(e,t){let n=wf(e),r=e.rotor.hub_radius_mm/e.rotor.radius_mm,i=Math.max(10,t);n.rotor.radius_mm=Number((n.rotor.hub_radius_mm+i).toFixed(4));let a=n.rotor.hub_radius_mm/n.rotor.radius_mm;return Number.isFinite(a)&&a>0&&a<1&&n.overrides.length>0&&(n.overrides=Af(n.overrides,r,a,n.rotor)),n}function Pf(e,t){let n=wf(e);return n.rotor.pitch_axis_ratio=Number(Math.min(1,Math.max(0,t)).toFixed(4)),n}function Ff(e,t,n=[]){let r=Math.max(.1,Math.min(5,t)),i=wf(e),a=i.distributions.chord_mm;if(a.type===`linear`)a.root=Number(Math.max(2,a.root*r).toFixed(3)),a.tip=Number(Math.max(2,a.tip*r).toFixed(3));else if(a.type===`constant`)a.value=Number(Math.max(2,a.value*r).toFixed(3));else if(a.type===`bezier`)a.points=a.points.map(e=>({x:e.x,y:Number(Math.max(2,e.y*r).toFixed(3))}));else if(a.type===`schmitz`){let e=a.design_cl??1;a.design_cl=Number(Math.max(.1,e/r).toFixed(4))}else a.type===`formula`&&(a.expr=`(${a.expr}) * ${Number(r.toFixed(4))}`);return i.overrides=i.overrides.map(e=>({...e,chord_mm:e.chord_mm===null?null:Number(Math.max(2,e.chord_mm*r).toFixed(3))})),Rf(e,i,n)}function If(e,t,n=[]){let r=wf(e),i=r.distributions.chord_mm;if(i.type===`linear`)i.root=Number(Math.max(2,i.root+t).toFixed(3)),i.tip=Number(Math.max(2,i.tip+t).toFixed(3));else if(i.type===`constant`)i.value=Number(Math.max(2,i.value+t).toFixed(3));else if(i.type===`bezier`)i.points=i.points.map(e=>({x:e.x,y:Number(Math.max(2,e.y+t).toFixed(3))}));else if(i.type===`formula`){let e=t>=0?`+`:`-`;i.expr=`(${i.expr}) ${e} ${Math.abs(t)}`}else{let n=Of(e);for(let e of n){let n=Number(Math.max(2,e.effective_chord_mm+t).toFixed(3)),i=r.overrides.find(t=>Math.abs(t.span_ratio-e.span_ratio)<=yf);i?i.chord_mm=n:r.overrides.push({span_ratio:e.span_ratio,chord_mm:n,twist_deg:null,airfoil:null})}r.overrides.sort((e,t)=>e.span_ratio-t.span_ratio)}return i.type!==`schmitz`&&(r.overrides=r.overrides.map(e=>({...e,chord_mm:e.chord_mm===null?null:Number(Math.max(2,e.chord_mm+t).toFixed(3))}))),Rf(e,r,n)}function Lf(e,t){let n=wf(e);return n.airfoils=n.airfoils.length===0?[{span_ratio:0,airfoil:t},{span_ratio:1,airfoil:t}]:n.airfoils.map(e=>({span_ratio:e.span_ratio,airfoil:JSON.parse(JSON.stringify(t))})),n}function Rf(e,t,n){if(n.length===0)return t;let r=Of(e),i=e.rotor.hub_radius_mm/e.rotor.radius_mm,a=t.rotor.hub_radius_mm/t.rotor.radius_mm,o=Math.max(1e-6,1-i),s=Math.max(1e-6,1-a),c=wf(t);for(let e of n){let t=r.find(t=>Math.abs(t.span_ratio-e)<=yf);if(t){let e=Math.max(0,Math.min(1,(t.span_ratio-i)/o)),n=kf(Math.max(a,Math.min(1,a+s*e)),c.rotor);c=rp(c,n,{chord_mm:t.effective_chord_mm,twist_deg:t.effective_twist_deg})}}return c}function zf(e=70,t=35){return[{x:0,y:e},{x:1/3,y:e+(t-e)*.25},{x:2/3,y:e+(t-e)*.7},{x:1,y:t}]}function Bf(e=20,t=3){return[{x:0,y:e},{x:1/3,y:e+(t-e)*.45},{x:2/3,y:e+(t-e)*.8},{x:1,y:t}]}function Vf(e,t){let n=Math.min(.9,Math.max(.02,t))/2,r=Math.min(.95-n,Math.max(.05+n,e));return{rootEnd:r-n,tipStart:r+n}}function Hf(e,t,n,r,i=.5*(e+t)){let{rootEnd:a,tipStart:o}=Vf(n,r),s=e=>e.toFixed(4),c=e=>`((abs(${e}) - abs((${e}) - 1) + 1) / 2)`,l=`(1 - cos(pi * ${c(`s / ${s(a)}`)})) / 2`,u=`(1 - cos(pi * ${c(`(s - ${s(o)}) / ${s(1-o)}`)})) / 2`;return`${s(e)} + (${s(i-e)}) * (${l}) + (${s(t-i)}) * (${u})`}function Uf(e){if(!e.includes(`cos(pi`))return null;let t=/abs\(s \/ ([0-9.]+)\)/.exec(e),n=/\(\(s - ([0-9.]+)\) \//.exec(e);if(!t||!n)return null;let r=Number.parseFloat(t[1]),i=Number.parseFloat(n[1]);return!Number.isFinite(r)||!Number.isFinite(i)||i<=r?null:{center:.5*(r+i),width:i-r}}function Wf(e,t){let n=e.hub_radius_mm/e.radius_mm;return n+(1-n)*t}function Gf(e,t){let n=e.airfoils[0]?.airfoil;for(let r of e.airfoils)r.span_ratio<=t+1e-9&&(n=r.airfoil);return n??{type:`naca4`,max_camber:.04,camber_position:.4,thickness_ratio:.12}}function Kf(e,t){let{rotor:n,distributions:r}=e,i=n.hub_radius_mm/n.radius_mm,a=a=>{let o=a===`root`?0:a===`tip`?1:t,s=a===`root`?i:a===`tip`?1:Wf(n,t),c=a===`root`?e.airfoils[0]?.airfoil??Gf(e,s):a===`tip`?e.airfoils[e.airfoils.length-1]?.airfoil??Gf(e,s):Gf(e,s);return{chord_mm:Ef(r.chord_mm,n,s,o),twist_deg:Df(r.twist_deg,n,s,o),airfoil:JSON.parse(JSON.stringify(c))}};return{root:a(`root`),mid:a(`mid`),tip:a(`tip`)}}function qf(e,t,n){let r=wf(e);return r.airfoils=[{span_ratio:0,airfoil:t.root.airfoil},{span_ratio:Wf(e.rotor,n),airfoil:t.mid.airfoil},{span_ratio:1,airfoil:t.tip.airfoil}].map(e=>({span_ratio:e.span_ratio,airfoil:JSON.parse(JSON.stringify(e.airfoil))})),r}function Jf(e){if(e.type===`named`){let[t,n,r]={SG6043:[.055,.42,.1],SD7062:[.038,.38,.14],E387:[.032,.4,.091],S833:[.025,.787,.18]}[e.name]??[.04,.4,.12];return{m:t,p:n,t:r,label:e.name}}return{m:e.max_camber,p:e.camber_position>0?e.camber_position:.4,t:e.thickness_ratio,label:`NACA t=${(e.thickness_ratio*100).toFixed(0)}%`}}function Yf(e,t,n=`dark`){let r=n===`atelier`,i=224/Math.max(1,e.root.chord_mm,e.mid.chord_mm,e.tip.chord_mm),a=r?{root:`#e8451e`,mid:`#1d4ed8`,tip:`#047857`}:{root:`#f6b94d`,mid:`#8ea6ff`,tip:`#6fd6a6`},o=t=>{let n=e[t],{m:r,p:a,t:o}=Jf(n.airfoil),s=n.chord_mm*i,c=n.twist_deg*Math.PI/180,l=Math.cos(c),u=Math.sin(c),d=[],f=[];for(let e=0;e<=40;e++){let t=.5*(1-Math.cos(Math.PI*e/40)),n=5*o*(.2969*Math.sqrt(t)-.126*t-.3516*t**2+.2843*t**3-.1015*t**4),i=0;r>0&&a>0&&a<1&&(i=t<a?r/(a*a)*(2*a*t-t*t):r/(1-a)**2*(1-2*a+2*a*t-t*t)),d.push([(t-.25)*s,-(i+n)*s]),f.push([(t-.25)*s,-(i-n)*s])}return[...d,...f.reverse()].map(([e,t])=>`${(96+e*l-t*u).toFixed(1)},${(75+e*u+t*l).toFixed(1)}`).join(` `)},s=[`root`,`mid`,`tip`].map(e=>{let n=e===t;return`<polygon points="${o(e)}" fill="${a[e]}" fill-opacity="${n?r?.24:.34:.12}" stroke="${a[e]}" stroke-width="${n?1.8:1}" stroke-opacity="${n?1:.7}" />`}).join(``);return`<line x1="96" y1="14" x2="96" y2="136" stroke="${r?`rgba(29,78,216,0.22)`:`rgba(238,240,245,0.16)`}" stroke-dasharray="3 3" />
<line x1="12" y1="75" x2="308" y2="75" stroke="${r?`rgba(29,78,216,0.12)`:`rgba(238,240,245,0.08)`}" />
${s}
<circle cx="96" cy="75" r="2.5" fill="${r?`#e8451e`:`#f59e0b`}" />
<text x="102" y="22" font-size="10" fill="${r?`#475569`:`#8b93a7`}" font-family="IBM Plex Mono, monospace">pitch axis 25% c</text>`}function Xf(e,t=1,n=6,r=[]){let i=wf(e);return i.distributions.chord_mm={type:`schmitz`,design_cl:t},i.distributions.twist_deg={type:`schmitz`,design_alpha_deg:n},Rf(e,i,r)}function Zf(e,t=70,n=35,r=20,i=3,a=[]){let o=wf(e);return o.distributions.chord_mm={type:`linear`,root:t,tip:n},o.distributions.twist_deg={type:`linear`,root:r,tip:i},Rf(e,o,a)}function Qf(e,t,n,r=[]){let i=wf(e),a=n.map((e,t)=>{let r=Math.min(1,Math.max(0,e.x));return t===0&&(r=0),t===n.length-1&&(r=1),{x:r,y:e.y}});for(let e=1;e<a.length-1;e++)a[e].x=Math.max(a[e-1].x,a[e].x);for(let e=a.length-2;e>=1;e--)a[e].x=Math.min(a[e+1].x,a[e].x);return i.distributions[t]={type:`bezier`,points:a},Rf(e,i,r)}function $f(e,t,n,r,i=[]){let a=e.distributions[t],o=a.type===`bezier`?a.points.map(e=>({...e})):t===`chord_mm`?zf():Bf();if(n<0||n>=o.length)return wf(e);let s=o[n];return o[n]={x:r.x===void 0?s.x:r.x,y:r.y===void 0?s.y:r.y},Qf(e,t,o,i)}function ep(e,t,n,r=[]){let i=wf(e);return i.distributions[t]={type:`formula`,expr:n},Rf(e,i,r)}function tp(e,t,n,r={},i={},a=4){let o=n*(r.shiftKey?10:r.altKey?.1:1),s=e+t/Math.max(1,a)*o;return i.min!==void 0&&(s=Math.max(i.min,s)),i.max!==void 0&&(s=Math.min(i.max,s)),Number(s.toFixed(6))}function np(e,t,n,r=[]){let i=Number((t*n).toFixed(6)),a=wf(e);if(a.distributions.chord_mm.type===`bezier`){let n=a.distributions.chord_mm.points.map(e=>({...e}));if(n.length>=2)return n[0].y=t,n[n.length-1].y=i,Qf(e,`chord_mm`,n,r)}return a.distributions.chord_mm={type:`linear`,root:t,tip:i},Rf(e,a,r)}function rp(e,t,n){let r=wf(e),i=r.overrides.findIndex(e=>Math.abs(e.span_ratio-t)<=yf);if(i>=0){let e=r.overrides[i],t={span_ratio:e.span_ratio,chord_mm:n.chord_mm===void 0?e.chord_mm:n.chord_mm,twist_deg:n.twist_deg===void 0?e.twist_deg:n.twist_deg,airfoil:e.airfoil};t.chord_mm===null&&t.twist_deg===null&&t.airfoil===null?r.overrides.splice(i,1):r.overrides[i]=t}else{let e={span_ratio:t,chord_mm:n.chord_mm??null,twist_deg:n.twist_deg??null,airfoil:null};(e.chord_mm!==null||e.twist_deg!==null)&&(r.overrides.push(e),r.overrides.sort((e,t)=>e.span_ratio-t.span_ratio))}return r}function ip(e,t){let n=wf(e);return n.overrides=n.overrides.filter(e=>Math.abs(e.span_ratio-t)>yf),n}function ap(e){let t=wf(e);return t.overrides=[],t}var op=class{past=[];present;future=[];maxDepth;constructor(e,t=100){this.present=wf(e),this.maxDepth=t}current(){return wf(this.present)}canUndo(){return this.past.length>0}canRedo(){return this.future.length>0}counts(){return{undo:this.past.length,redo:this.future.length}}commit(e){return!Tf(this.present,e)&&(this.past.push(wf(this.present)),this.past.length>this.maxDepth&&this.past.shift(),this.present=wf(e),this.future=[],!0)}undo(){let e=this.past.pop();return e?(this.future.push(wf(this.present)),this.present=e,this.current()):null}redo(){let e=this.future.pop();return e?(this.past.push(wf(this.present)),this.present=e,this.current()):null}};function sp(e,t){if(e.length===0)return 0;if(e.length===1||t<=e[0].tsr)return e[0].cp;let n=e[e.length-1];if(t>=n.tsr)return n.cp;for(let n=0;n<e.length-1;n++){let r=e[n],i=e[n+1];if(t>=r.tsr&&t<=i.tsr){let e=Math.max(1e-9,i.tsr-r.tsr),n=(t-r.tsr)/e;return r.cp+n*(i.cp-r.cp)}}return n.cp}function cp(e,t){return{delta_design_cp:t.design_point.cp-e.design_point.cp,delta_peak_cp:t.peak_cp-e.peak_cp,delta_peak_tsr:t.peak_tsr-e.peak_tsr,delta_power_w:t.design_point.power_w-e.design_point.power_w}}function lp(e,t=600,n=8,r=1.225){let i=[],a=Math.max(.001,t*.001),o=Math.max(.001,n),s=.5*r*Math.PI*a*a*o*o*o;for(let t of e.split(/\r?\n/)){let e=t.trim();if(!e||e.startsWith(`#`))continue;if(e.toLowerCase().includes(`rpm=`)){let t=/rpm\s*=\s*([+-]?\d+(?:\.\d+)?)/i.exec(e),n=/power_w\s*=\s*([+-]?\d+(?:\.\d+)?)/i.exec(e);if(t&&n){let e=Number.parseFloat(t[1]),r=Number.parseFloat(n[1]);if(Number.isFinite(e)&&Number.isFinite(r)&&e>=0){let t=e*2*Math.PI/60*a/o,n=s>0?r/s:0;i.push({tsr:t,cp:n,rpm:e,power_w:r})}}continue}let n=e.split(/[,\s;]+/).filter(Boolean);if(n.length<2)continue;let r=Number.parseFloat(n[0]),c=Number.parseFloat(n[1]);if(!Number.isFinite(r)||!Number.isFinite(c))continue;let l=n.length>=3?Number.parseFloat(n[2]):null,u=n.length>=4?Number.parseFloat(n[3]):null;i.push({tsr:r,cp:c,rpm:l!==null&&Number.isFinite(l)?l:null,power_w:u!==null&&Number.isFinite(u)?u:null})}return i}function up(e,t){if(t.length===0||e.length===0)return{count:0,rmse_cp:0,mae_cp:0,residuals:[]};let n=[],r=0,i=0;for(let a of t){let t=sp(e,a.tsr),o=a.cp-t;r+=o*o,i+=Math.abs(o),n.push({tsr:a.tsr,measured_cp:a.cp,simulated_cp:t,error_cp:o})}return{count:t.length,rmse_cp:Math.sqrt(r/t.length),mae_cp:i/t.length,residuals:n}}function dp(e,t={}){let n=t.theme===`atelier`,r=n?`rgba(29,78,216,0.16)`:`rgba(148,163,184,0.16)`,i=n?`rgba(29,78,216,0.10)`:`rgba(148,163,184,0.10)`,a=n?`#475569`:`#7c879b`,o=n?`#e8451e`:`#fbbf24`,s=n?`rgba(29,78,216,0.32)`:`rgba(148,163,184,0.22)`,c=n?`#64748b`:`#7c879b`,l=n?`#1d4ed8`:`#22d3ee`,u=n?`#ffffff`:`#090b10`,d=n?`#18181b`:`#f1f5f9`,f=e=>28+(Math.min(9.5,Math.max(1,e))-1)/8.5*264,p=e=>137-(Math.min(.65,Math.max(0,e))-0)/.65*119,m=e=>e.map((e,t)=>`${t===0?`M`:`L`}${f(e.tsr).toFixed(1)},${p(e.cp).toFixed(1)}`).join(` `),h=p(16/27).toFixed(1),g=p(.45).toFixed(1),_=p(.3).toFixed(1),v=p(.15).toFixed(1),y=[`<line x1="28" y1="18" x2="28" y2="137" stroke="${r}" stroke-width="1" />`,`<line x1="28" y1="137" x2="292" y2="137" stroke="${r}" stroke-width="1" />`,`<line x1="28" y1="${v}" x2="292" y2="${v}" stroke="${i}" stroke-width="1" />`,`<line x1="28" y1="${_}" x2="292" y2="${_}" stroke="${i}" stroke-width="1" />`,`<line x1="28" y1="${g}" x2="292" y2="${g}" stroke="${i}" stroke-width="1" />`,`<line class="betz-limit" x1="28" y1="${h}" x2="292" y2="${h}" stroke="${o}" stroke-width="1.2" stroke-dasharray="4 3" />`,`<text x="292" y="${Number(h)-4}" text-anchor="end" fill="${o}" font-size="9" font-family="'JetBrains Mono', monospace">Betz 0.593</text>`,`<text x="24" y="${Number(g)+3}" text-anchor="end" fill="${a}" font-size="8.5" font-family="'JetBrains Mono', monospace">.45</text>`,`<text x="24" y="${Number(_)+3}" text-anchor="end" fill="${a}" font-size="8.5" font-family="'JetBrains Mono', monospace">.30</text>`,`<text x="24" y="${Number(v)+3}" text-anchor="end" fill="${a}" font-size="8.5" font-family="'JetBrains Mono', monospace">.15</text>`,`<text x="28" y="150" fill="${a}" font-size="8.5" font-family="'JetBrains Mono', monospace">λ 1</text>`,`<text x="${f(5).toFixed(1)}" y="150" text-anchor="middle" fill="${a}" font-size="8.5" font-family="'JetBrains Mono', monospace">5</text>`,`<text x="292" y="150" text-anchor="end" fill="${a}" font-size="8.5" font-family="'JetBrains Mono', monospace">9.5</text>`];if(t.designTsr!==void 0&&Number.isFinite(t.designTsr)){let e=f(t.designTsr).toFixed(1);y.push(`<line class="design-tsr" x1="${e}" y1="18" x2="${e}" y2="137" stroke="${s}" stroke-width="1" stroke-dasharray="2 2" />`)}t.baselineASweep&&t.baselineASweep.length>0&&y.push(`<path class="curve-a" d="${m(t.baselineASweep)}" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="4 3" />`),e.length>0&&y.push(`<path class="curve-b" d="${m(e)}" fill="none" stroke="${l}" stroke-width="2.2" />`);for(let e of t.experimentalPoints??[]){let t=f(e.tsr).toFixed(1),n=p(e.cp).toFixed(1);y.push(`<circle class="exp-point" data-tsr="${e.tsr}" data-cp="${e.cp}" cx="${t}" cy="${n}" r="3.5" fill="${o}" stroke="${u}" stroke-width="1.2" />`)}return y.push(`<g class="chart-crosshair" style="display:none;pointer-events:none"><line class="ch-line" x1="28" y1="18" x2="28" y2="137" stroke="${d}" stroke-width="1" stroke-dasharray="2 2" opacity="0.65" /><circle class="ch-dot-secondary" cx="28" cy="137" r="3.2" fill="${c}" stroke="${u}" stroke-width="1.2" style="display:none" /><circle class="ch-dot-primary" cx="28" cy="137" r="4" fill="${l}" stroke="${u}" stroke-width="1.5" /></g>`),y.join(`
`)}function fp(e,t,n=null,r=600,i=8){let a=Math.min(292,Math.max(28,e)),o=1+(a-28)/264*8.5,s=sp(t,o),c=e=>137-(Math.min(.65,Math.max(0,e))-0)/.65*119,l=c(s),u=null,d=null;n&&n.length>0&&(u=sp(n,o),d=c(u));let f=Math.max(0,s/(16/27)*100),p=Math.max(.001,r*.001),m=o*Math.max(.1,i)/p*(60/(2*Math.PI)),h=u===null?``:`  ΔA ${s-u>=0?`+`:``}${(s-u).toFixed(3)}`;return{tsr:o,cp:s,cp_baseline_a:u,betz_pct:f,rpm:m,svg_x:a,svg_y_b:l,svg_y_a:d,readout:`λ ${o.toFixed(2)}  |  Cp ${s.toFixed(3)} (${f.toFixed(0)}% Betz)  |  ${m.toFixed(0)} RPM${h}`}}function pp(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function mp(e,t,n=`dark`){let r=n===`atelier`,i=r?`#cbd5e1`:`#262c3a`,a=r?`rgba(29, 78, 216, 0.14)`:`rgba(56, 189, 248, 0.14)`,o=r?`#1d4ed8`:`#38bdf8`,s=r?`#64748b`:`#7a8296`,c=r?`#e8451e`:`#f59e0b`,l=r?`rgba(4, 120, 87, 0.18)`:`rgba(76, 195, 138, 0.22)`,u=r?`#047857`:`#4cc38a`,d=r?`rgba(232, 69, 30, 0.22)`:`rgba(245, 158, 11, 0.28)`,f=r?`#ffffff`:`#07080d`,p=r?`#1e293b`:`#7a8296`,m=e.airfoils[0]?.airfoil,h=.04,g=.4,_=.12,v=`NACA 4412`;m&&(m.type===`named`?(v=m.name,m.name===`SG6043`?(h=.055,g=.42,_=.1):m.name===`SD7062`?(h=.038,g=.38,_=.14):m.name===`E387`?(h=.032,g=.4,_=.091):m.name===`S833`&&(h=.025,g=.787,_=.18)):(h=m.max_camber,g=m.camber_position>0?m.camber_position:.4,_=m.thickness_ratio,v=`NACA t=${(_*100).toFixed(1)}% m=${(h*100).toFixed(1)}%`));let y=[],b=[],x=[];for(let e=0;e<=48;e++){let t=Math.PI*e/48,n=.5*(1-Math.cos(t)),r=5*_*(.2969*Math.sqrt(n)-.126*n-.3516*n*n+.2843*n*n*n-.1015*n*n*n*n),i=0,a=0;h>0&&g>0&&g<1&&(n<g?(i=h/(g*g)*(2*g*n-n*n),a=2*h/(g*g)*(g-n)):(i=h/((1-g)*(1-g))*(1-2*g+2*g*n-n*n),a=2*h/((1-g)*(1-g))*(g-n)));let o=Math.atan(a),s=n-r*Math.sin(o),c=i+r*Math.cos(o),l=n+r*Math.sin(o),u=i-r*Math.cos(o),d=e=>(22+e*276).toFixed(1),f=e=>(52-e*276*1.35).toFixed(1);y.push(`${d(s)},${f(c)}`),b.unshift(`${d(l)},${f(u)}`),x.push(`${e===0?`M`:`L`}${d(n)},${f(i)}`)}let S=[...y,...b].join(` `),C=(22+e.rotor.pitch_axis_ratio*276).toFixed(1),w=[`<line x1="22" y1="52" x2="298" y2="52" stroke="${i}" stroke-width="1" stroke-dasharray="3 3" />`,`<polygon class="airfoil-contour" points="${S}" fill="${a}" stroke="${o}" stroke-width="1.5" />`,`<path class="airfoil-camber" d="${x.join(` `)}" fill="none" stroke="${s}" stroke-width="1" stroke-dasharray="2 2" />`,`<line x1="${C}" y1="12" x2="${C}" y2="84" stroke="${c}" stroke-width="1" stroke-dasharray="2 2" />`],T=Math.max(Of(e)[0]?.effective_chord_mm??70,5),E=_*T,D=.3,O=.75*h,k=0;if(t&&t.diameterMm>.1){k=Math.min(.5*t.diameterMm,.38*E);let e=Math.max(-.15*E,Math.min(.15*E,t.offsetXMm??0)),n=Math.max(-.15*E,Math.min(.15*E,t.offsetYMm??0));D=.3+e/T,O=.75*h+n/T;let r=(22+D*276).toFixed(1),i=(52-O*276*1.35).toFixed(1),a=Math.max(2.2,k/T*276*1.35).toFixed(1);w.push(`<circle class="spar-hole-circle" cx="${r}" cy="${i}" r="${a}" fill="${l}" stroke="${u}" stroke-width="1.5" />`)}if(t?.jointShape&&t.jointShape!==`none`){let e=t.jointShape,n=Math.max(1,Math.min(2,t.jointCount??2)),r=Math.max(.8,.5*(t.jointSizeMm??3)),i=e===`round`||e===`snaplock`?r:Math.max(1.2,.5*(t.jointLengthMm??6)),a=n===2?[-1,1]:k>0?[1]:[0],o=k+Math.hypot(i,r)+1.2;for(let t of a){let n=22+(D+t*o/T)*276,a=52-O*276*1.35,s=Math.max(2,i/T*276),l=Math.max(1.8,r/T*276*1.35);if(e===`round`||e===`snaplock`)w.push(`<circle class="joint-preview" cx="${n.toFixed(1)}" cy="${a.toFixed(1)}" r="${l.toFixed(1)}" fill="${d}" stroke="${c}" stroke-width="1.3" />`);else if(e===`dovetail`){let e=l*.52,t=[`${n.toFixed(1)},${(a+e).toFixed(1)}`,`${(n+s).toFixed(1)},${(a+l).toFixed(1)}`,`${(n+s).toFixed(1)},${(a-l).toFixed(1)}`,`${n.toFixed(1)},${(a-e).toFixed(1)}`,`${(n-s).toFixed(1)},${(a-l).toFixed(1)}`,`${(n-s).toFixed(1)},${(a+l).toFixed(1)}`].join(` `);w.push(`<polygon class="joint-preview" points="${t}" fill="${d}" stroke="${c}" stroke-width="1.3" />`)}else if(e===`cruciform`){let e=s*.38,t=l*.42,r=[`${(n+e).toFixed(1)},${(a+l).toFixed(1)}`,`${(n+e).toFixed(1)},${(a+t).toFixed(1)}`,`${(n+s).toFixed(1)},${(a+t).toFixed(1)}`,`${(n+s).toFixed(1)},${(a-t).toFixed(1)}`,`${(n+e).toFixed(1)},${(a-t).toFixed(1)}`,`${(n+e).toFixed(1)},${(a-l).toFixed(1)}`,`${(n-e).toFixed(1)},${(a-l).toFixed(1)}`,`${(n-e).toFixed(1)},${(a-t).toFixed(1)}`,`${(n-s).toFixed(1)},${(a-t).toFixed(1)}`,`${(n-s).toFixed(1)},${(a+t).toFixed(1)}`,`${(n-e).toFixed(1)},${(a+t).toFixed(1)}`,`${(n-e).toFixed(1)},${(a+l).toFixed(1)}`].join(` `);w.push(`<polygon class="joint-preview" points="${r}" fill="${d}" stroke="${c}" stroke-width="1.3" />`)}else w.push(`<rect class="joint-preview" x="${(n-s).toFixed(1)}" y="${(a-l).toFixed(1)}" width="${(2*s).toFixed(1)}" height="${(2*l).toFixed(1)}" fill="${d}" stroke="${c}" stroke-width="1.3" />`)}}return w.push(`<circle class="pitch-axis-dot" cx="${C}" cy="52" r="3.8" fill="${c}" stroke="${f}" stroke-width="1.4" />`,`<text x="22" y="14" fill="${p}" font-size="10" font-family="'IBM Plex Mono', ui-monospace, monospace">${pp(v)}  [x/c ${e.rotor.pitch_axis_ratio.toFixed(2)}]</text>`),w.join(`
`)}var hp=`bladelab:ui-style:v1`,gp=`bladelab.autosave.v1`,_p=`bladelab.slots.v1`;function vp(){return{spar_hole_enabled:!1,spar_show_rod:!0,spar_hole_diameter_mm:5,spar_hole_depth_mm:240,spar_hole_offset_x_mm:0,spar_hole_offset_y_mm:0,spar_hole_tolerance_mm:.2,split_parts:1,split_active_part:`all`,split_ratio_pct:50,split_explode_gap_mm:0,align_shape:`round`,align_count:2,align_size_mm:3,align_key_length_mm:6,align_height_mm:6,align_spacing_mm:0,align_clearance_mm:.2,align_depth_clearance_mm:.5,align_min_wall_mm:.8}}function yp(){return{ui_style:`atelier`,planform_cosine:!1,planform_center_pct:45,planform_width_pct:25,locked_span_ratios:[],bind_taper:!1,taper_ratio:.457,chord_offset_x_mm:0,chord_offset_y_mm:0,global_light_intensity:1.35,view_mode:`rotor`,wireframe_mode:!1,heatmap_mode:`segment`,structural_material:`petg`,site_avg_wind_mps:5.5,printer_preset:`bambu_256`,printer_max_z_mm:256,blade_preset:`schmitz_600`,gen_preset:`low_rpm_pmg`,gen_gear_ratio:1,gen_kv:35,gen_r_int:.8,gen_r_load:12,exp_data_log:``,gearbox:Wp(),nosecone:tf(),studio_mode:`blade`,gearbox_selected_gear:null,gearbox_inspector_open:!0,collective_pitch_deg:0,winglet:{enabled:!1,cant_angle_deg:50,height_mm:22,sweep_angle_deg:10,blend_radius_mm:15},flip_blade:!0}}function bp(e,t={},n={},r,i){let a=wf(e);if(Array.isArray(a.overrides)&&a.overrides.length>0){let e=a.rotor.hub_radius_mm/a.rotor.radius_mm;a.overrides=Af(a.overrides,e,e,a.rotor)}let o={...vp(),...t},s=yp(),c={...s,...n,locked_span_ratios:Array.isArray(n.locked_span_ratios)?[...n.locked_span_ratios]:[],winglet:{...s.winglet,...n.winglet&&typeof n.winglet==`object`?n.winglet:{}},gearbox:{...s.gearbox,...n.gearbox&&typeof n.gearbox==`object`?n.gearbox:{}},nosecone:{...s.nosecone,...n.nosecone&&typeof n.nosecone==`object`?n.nosecone:{}}};if(n.planform_cosine===void 0&&a.distributions.chord_mm.type===`formula`){let e=Uf(a.distributions.chord_mm.expr);e&&(c.planform_cosine=!0,c.planform_center_pct=Math.round(e.center*100),c.planform_width_pct=Math.round(e.width*100))}let l={bladelab_snapshot_version:1,saved_at:i??new Date().toISOString(),design:a,fabrication:o,workbench:c};return r&&r.trim().length>0&&(l.name=r.trim()),l}function xp(e){if(!e||typeof e!=`object`)return!1;let t=e,n=t.rotor,r=t.distributions,i=t.airfoils,a=t.overrides,o=t.hub,s=t.manufacturing;if(!n||typeof n!=`object`||typeof n.radius_mm!=`number`||!Number.isFinite(n.radius_mm)||n.radius_mm<=0||typeof n.hub_radius_mm!=`number`||!Number.isFinite(n.hub_radius_mm)||n.hub_radius_mm<0||n.radius_mm<=n.hub_radius_mm||typeof n.blade_count!=`number`||!Number.isFinite(n.blade_count)||n.blade_count<1||typeof n.station_count!=`number`||!Number.isFinite(n.station_count)||n.station_count<2||typeof n.pitch_axis_ratio!=`number`||!Number.isFinite(n.pitch_axis_ratio)||!r||typeof r!=`object`)return!1;let c=r.chord_mm,l=r.twist_deg;return!(!c||typeof c!=`object`||typeof c.type!=`string`||!l||typeof l!=`object`||typeof l.type!=`string`||!Array.isArray(i)||i.length===0||!Array.isArray(a)||!o||typeof o!=`object`||!s||typeof s!=`object`)}function Sp(e){let t;try{t=JSON.parse(e)}catch(e){throw Error(`Invalid JSON syntax: ${e instanceof Error?e.message:String(e)}`)}if(!t||typeof t!=`object`)throw Error(`Project JSON must be an object.`);let n=t;if(`design`in n&&xp(n.design)){let e=n.fabrication&&typeof n.fabrication==`object`?n.fabrication:{},t=n.workbench&&typeof n.workbench==`object`?n.workbench:{},r=typeof n.name==`string`?n.name:void 0,i=typeof n.saved_at==`string`?n.saved_at:void 0;return bp(n.design,e,t,r,i)}if(xp(n))return bp(n);throw Error(`Unrecognized JSON schema: expected a BladeLab WorkbenchSnapshot or Design object with rotor, distributions, and airfoils.`)}function Cp(e,t,n,r,i=25){let a=n.trim()||t.name||`Rotor R${t.design.rotor.radius_mm} B${t.design.rotor.blade_count}`,o=new Date().toISOString(),s=r?e.findIndex(e=>e.id===r):e.findIndex(e=>e.name.toLowerCase()===a.toLowerCase());return[{id:s>=0?e[s].id:r||`slot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,name:a,saved_at:o,snapshot:{...bp(t.design,t.fabrication,t.workbench,a,o)}},...e.filter((e,t)=>t!==s)].slice(0,Math.max(1,i))}function wp(e,t){return e.filter(e=>e.id!==t)}var Tp={pla:{name:`PLA (Standard 3D Print)`,density_kg_m3:1240,modulus_gpa:3.1,yield_mpa:45,shell_infill_factor:.42},petg:{name:`PETG (Tough / Outdoor)`,density_kg_m3:1270,modulus_gpa:2.1,yield_mpa:42,shell_infill_factor:.42},asa:{name:`ASA (UV / Weather Resistant)`,density_kg_m3:1070,modulus_gpa:2.2,yield_mpa:40,shell_infill_factor:.42},pacf:{name:`PA-CF (Carbon-Reinforced Nylon)`,density_kg_m3:1180,modulus_gpa:6.8,yield_mpa:85,shell_infill_factor:.48}};function Ep(e,t,n,r=`petg`){let i=Tp[r]??Tp.petg,{rotor:a}=e,o=Math.max(1,a.blade_count),s=a.hub_radius_mm,c=a.radius_mm,l=Math.max(10,c-s),u=l*.001,d=Of(e),f=t.design_point.stations??[],p=d.length,m=[],h=[],g=[],_=[],v=Math.max(.05,t.design_point.thrust_n/o);for(let t=0;t<p;t++){let n=d[t],r=n.radius_mm,i=Math.max(4,n.effective_chord_mm),a=Dp(e,n.span_ratio),s=Math.max(1.2,i*a),c=0;c=f.length>0?Op(f,n.span_ratio,`thrust_per_m_n`):2*v*o*n.span_ratio/u,m.push(r*.001),h.push(i),g.push(s),_.push(Math.max(0,c/o))}let y=Array(p).fill(0);for(let e=0;e<p;e++){let t=0,n=m[e];for(let r=e;r<p-1;r++){let e=m[r],i=m[r+1],a=Math.max(0,i-e),o=_[r]*(e-n),s=_[r+1]*(i-n);t+=.5*(o+s)*a}y[e]=t}let b=!!(n.spar_hole_enabled&&n.spar_hole_diameter_mm>=1),x=b?n.spar_hole_diameter_mm*.001:0,S=Math.min(.0012,.22*x),C=Math.max(0,x-2*S),w=b?Math.PI/64*(x**4-C**4):0,T=b?Math.PI/4*(x**2-C**2):0,E=115e9,D=b?Math.max(0,n.spar_hole_depth_mm):0,O=i.modulus_gpa*1e9,k=t.design_point.omega_rad_s??t.design_point.rpm*2*Math.PI/60,A=0,j=0,M=0,N=Array(p).fill(0),P=[];for(let e=0;e<p;e++){let t=d[e],n=t.radius_mm-s,r=b&&n<=D+.001,a=h[e]*.001,o=g[e]*.001,c=Math.max(1e-7,.65*a*o*i.shell_infill_factor-(r?Math.PI/4*x**2:0)),l=O*Math.max(1e-13,.036*a*o**3*(.55+.45*i.shell_infill_factor)-(r?Math.PI/64*x**4:0))+(r?E*w:0),u=y[e],f=l>0?u/l:0;N[e]=f;let _=O*f*(.5*o)*1e-6,v=r?E*f*(.5*x)*1e-6:0;M=Math.max(M,_);let S=_>1e-4?i.yield_mpa/_:99.9,C=r&&v>1e-4?850/v:99.9,F=Math.min(99.9,Math.min(S,C));if(P.push({span_ratio:t.span_ratio,radius_mm:t.radius_mm,chord_mm:h[e],thickness_mm:g[e],bending_moment_nm:u,shell_stress_mpa:_,cf_stress_mpa:v,safety_factor:F}),e<p-1){let t=Math.max(0,m[e+1]-m[e]),n=.5*(m[e]+m[e+1]),a=(i.density_kg_m3*c+(r?1550*T:0))*t;A+=a,j+=a*k*k*n}}let F=0,I=0;for(let e=0;e<p-1;e++){let t=Math.max(0,m[e+1]-m[e]),n=.5*(N[e]+N[e+1]),r=n*t;I+=F*t+.5*n*t*t,F+=r}let ee=I*1e3,te=ee/l*100,ne=Math.max(1,n.split_parts||1),re=ne===2?Math.max(.12,Math.min(.88,(n.split_ratio_pct||50)/100)):ne>2?1/ne:.5,ie=P[Math.min(p-1,Math.max(0,Math.round(re*(p-1))))],ae=ne>1?ie.bending_moment_nm:0,oe=P[0]?.safety_factor??99.9,L=oe;if(ne>1){let e=ie.radius_mm-s,t=b&&D>=e+15,r=n.align_shape===`contour`?.78:n.align_shape===`dovetail`||n.align_shape===`cruciform`?.65:n.align_shape===`none`?.35:.55;L=Math.min(99.9,ie.safety_factor*(t?.95:r))}let se=Math.min(oe,L),ce=se>=2&&te<=6?`safe`:se>=1.2&&te<=10?`caution`:`critical`,le=`Cantilever stress & tip deflection within safe operating envelope.`;return ce===`critical`?le=b?ne>1&&D<ie.radius_mm-s+20?`Extend CF Spar Tube depth past the split plane or use Full-Span 85%.`:`Increase root chord / thickness ratio or switch to PA-CF / larger CF tube.`:`Enable a 6 mm or 8 mm Carbon-Fiber Spar Tube to reinforce root bending.`:ce===`caution`&&(le=b?`Moderate load: consider increasing CF tube diameter or Contour Lip engagement.`:`Consider enabling a Carbon-Fiber Spar Tube for higher safety margin.`),{material:r,material_name:i.name,root_moment_nm:y[0]??0,split_moment_nm:ae,centrifugal_root_n:j,centrifugal_runaway_n:j*2.25,blade_mass_g:Math.max(5,A*1e3),tip_deflection_mm:ee,tip_deflection_pct:te,root_safety_factor:oe,joint_safety_factor:L,max_shell_stress_mpa:M,status:ce,recommendation:le,stations:P}}function Dp(e,t){let n=e.airfoils;if(!n||n.length===0)return .12;let r=n[0];if(n.length===1||t<=r.span_ratio)return Jf(r.airfoil).t;let i=n[n.length-1];if(t>=i.span_ratio)return Jf(i.airfoil).t;for(let e=0;e<n.length-1;e++){let r=n[e],i=n[e+1];if(t>=r.span_ratio&&t<=i.span_ratio){let e=(t-r.span_ratio)/Math.max(1e-9,i.span_ratio-r.span_ratio);return(1-e)*Jf(r.airfoil).t+e*Jf(i.airfoil).t}}return Jf(i.airfoil).t}function Op(e,t,n){if(e.length===0)return 0;if(e.length===1||t<=e[0].span_ratio)return Number(e[0][n])||0;let r=e[e.length-1];if(t>=r.span_ratio)return Number(r[n])||0;for(let r=0;r<e.length-1;r++){let i=e[r],a=e[r+1];if(t>=i.span_ratio&&t<=a.span_ratio){let e=(t-i.span_ratio)/Math.max(1e-9,a.span_ratio-i.span_ratio),r=Number(i[n])||0;return r+e*((Number(a[n])||0)-r)}}return Number(r[n])||0}function kp(e){let t=Math.max(0,Math.min(1,e));if(t<=.42){let e=t/.42;return[.16+e*(.29-.16),.62+e*(.78-.62),.96+e*(.54-.96)]}if(t<=.75){let e=(t-.42)/.33;return[.29+e*(.96-.29),.78+e*(.62-.78),.54+e*(.05-.54)]}let n=(t-.75)/.25;return[.96+n*(.91-.96),.62+n*-.36,.05+n*.24]}function Ap(e){let t=Math.max(0,Math.min(1,e));if(t<=.45){let e=t/.45;return[.22+e*(.2-.22),.32+e*.42,.62+e*(.96-.62)]}if(t<=.82){let e=(t-.45)/.37;return[.2+e*(.3-.2),.74+e*(.82-.74),.96+e*(.54-.96)]}let n=(t-.82)/.18;return[.3+n*(.96-.3),.82+n*(.72-.82),.54+n*(.18-.54)]}function jp(e){let t=Math.max(-1,Math.min(1,e));if(t<0){let e=-t;if(e<=.45){let t=e/.45;return[.06+t*(.02-.06),.72+t*(.71-.72),.51+t*(.83-.51)]}let n=(e-.45)/.55;return[.02+n*(.12-.02),.71+n*-.48,.83+n*(.54-.83)]}{if(t<=.45){let e=t/.45;return[.06+e*(.96-.06),.72+e*(.62-.72),.51+e*(.04-.51)]}let e=(t-.45)/.55;return[.96+e*(.94-.96),.62+e*-.35,.04+e*.23]}}function Mp(e,t,n,r,i,a,o=0){let s=Math.floor(e.length/3),c=new Float32Array(s*3),l=t.rotor.hub_radius_mm,u=Math.max(l+10,t.rotor.radius_mm),d=n?.design_point.stations??[],f=`Angle of Attack α & Stall Margin`,p=`0° (Low)`,m=`6.5° (Opt)`,h=`14°+ (Stall)`,g=`linear-gradient(90deg, #299ef5 0%, #4ac78a 42%, #f59e0b 75%, #e8434a 100%)`;if(i===`cl_cd`){let t=25;for(let e of d)e.cd>1e-5&&(t=Math.max(t,e.cl/e.cd));f=`Aerodynamic Glide Ratio (Cl / Cd)`,p=`0`,m=`${(.5*t).toFixed(0)}`,h=`${t.toFixed(0)} Peak L/D`,g=`linear-gradient(90deg, #38529e 0%, #33bdf5 45%, #4cd18a 82%, #f5b82e 100%)`;let n=l/u;for(let r=0;r<s;r++){let i=Number(e[r*3+2])||l,a=Math.max(n,Math.min(1,i/u)),o=Op(d,a,`cl`),s=Math.max(1e-4,Op(d,a,`cd`)),[f,p,m]=Ap(Math.max(0,o/s)/Math.max(10,t));c[r*3]=f,c[r*3+1]=p,c[r*3+2]=m}return{mode:i,colors:c,title:f,minLabel:p,midLabel:m,maxLabel:h,gradientCss:g}}if(i===`torque`){let t=.5;for(let e of d)t=Math.max(t,e.torque_per_m_nm);f=`Spanwise Torque Production (dQ/dr)`,p=`0 N·m/m`,m=`${(.5*t).toFixed(2)}`,h=`${t.toFixed(2)} N·m/m`,g=`linear-gradient(90deg, #38529e 0%, #33bdf5 45%, #4cd18a 82%, #f5b82e 100%)`;let n=l/u;for(let r=0;r<s;r++){let i=Number(e[r*3+2])||l,a=Math.max(n,Math.min(1,i/u)),[o,s,f]=Ap(Math.max(0,Op(d,a,`torque_per_m_nm`))/t);c[r*3]=o,c[r*3+1]=s,c[r*3+2]=f}return{mode:i,colors:c,title:f,minLabel:p,midLabel:m,maxLabel:h,gradientCss:g}}if(i===`wall_stress`){let t=r?.stations??[],n=Math.max(5,r?.max_shell_stress_mpa??20);f=`Bending Stress & Wall Utilization`,p=`0 MPa (Low)`,m=`${(.5*n).toFixed(1)} MPa`,h=`${n.toFixed(1)} MPa`;let a=l/u;for(let r=0;r<s;r++){let i=Number(e[r*3+1])||0,o=Number(e[r*3+2])||l,s=Math.max(a,Math.min(1,o/u)),d=0,f=6;if(t.length===1||t.length>1&&s<=t[0].span_ratio)d=t[0].shell_stress_mpa,f=Math.max(1.5,t[0].thickness_mm);else if(t.length>1){let e=t[t.length-1];if(s>=e.span_ratio)d=e.shell_stress_mpa,f=Math.max(1.5,e.thickness_mm);else for(let e=0;e<t.length-1;e++){let n=t[e],r=t[e+1];if(s>=n.span_ratio&&s<=r.span_ratio){let e=(s-n.span_ratio)/Math.max(1e-9,r.span_ratio-n.span_ratio);d=n.shell_stress_mpa+e*(r.shell_stress_mpa-n.shell_stress_mpa),f=Math.max(1.5,n.thickness_mm+e*(r.thickness_mm-n.thickness_mm));break}}}let p=Math.min(1.15,Math.abs(i)/(.45*f)),[m,h,g]=kp(d*(.35+.65*p)/Math.max(10,n*1.1));c[r*3]=m,c[r*3+1]=h,c[r*3+2]=g}return{mode:i,colors:c,title:f,minLabel:p,midLabel:m,maxLabel:h,gradientCss:g}}if(i===`wind_impact`){let n=t.rotor.wind_speed_mps||8,r=t.rotor.design_tsr||4.5,_=Math.max(.1,t.rotor.radius_mm/1e3),v=r*n/_,y=1.225,b=.5*y*(n*n+(v*_*.7)**2),x=Math.max(20,b*1.05),S=Math.max(25,b*1.35);f=`Windward Impact & Surface Pressure (Pa)`,p=`-${S.toFixed(0)} Pa (Suction Lift)`,m=`0 Pa (Ambient)`,h=`+${x.toFixed(0)} Pa (Stagnation Impact)`,g=`linear-gradient(90deg, #1e3a8a 0%, #06b6d4 30%, #10b981 50%, #f59e0b 75%, #ef4444 100%)`;let C=!!(a&&a.length>=s*3),w=l/u;for(let t=0;t<s;t++){let r=Number(e[t*3+2])||l,i=Math.max(.01,r/1e3),s=Math.max(w,Math.min(1,r/u)),f=n*.75,p=v*i*1.01,m=Math.hypot(f,p),h=.5*y*m*m,g=Math.atan2(f,Math.max(.1,p))-((d.length>0?Op(d,s,`twist_deg`):6)+o)*(Math.PI/180),_=0,b=-1;C&&a?(_=Number(a[t*3])||0,b=Number(a[t*3+1])||0):b=Number(e[t*3+1])<=0?-1:1;let T=Math.max(0,-_*Math.cos(g)),E=b<0?-b*(.35+.65*Math.sin(Math.max(.04,g))):0,D=Math.min(1,T+E),O=0;if(b<=0||T>.25){let e=Math.min(1.35,.42+h/x*.58);O=Math.min(1,D*e)}else{let e=d.length>0?Math.max(.25,Op(d,s,`cl`)):.85,t=Math.min(1.35,.42+h/S*.58);O=-Math.min(1,e/1.35*b*t)}let[k,A,j]=jp(O);c[t*3]=k,c[t*3+1]=A,c[t*3+2]=j}return{mode:i,colors:c,title:f,minLabel:p,midLabel:m,maxLabel:h,gradientCss:g}}let _=l/u;for(let t=0;t<s;t++){let n=Number(e[t*3+2])||l,r=Math.max(_,Math.min(1,n/u)),[i,a,o]=kp(((d.length>0?Op(d,r,`alpha_deg`):6)+1)/15);c[t*3]=i,c[t*3+1]=a,c[t*3+2]=o}return{mode:i,colors:c,title:f,minLabel:p,midLabel:m,maxLabel:h,gradientCss:g}}function Np(e,t,n){if(!n.enabled)return;let r=Math.floor(e.length/3),i=t.rotor.radius_mm;for(let t=0;t<r;t++){let n=e[t*3+2];n>i&&(i=n)}let a=Number.isFinite(n.blend_radius_mm)?n.blend_radius_mm:15,o=i-Math.max(5,Math.min(80,a)),s=i-o;if(s<=0)return;let c=Number.isFinite(n.cant_angle_deg)?n.cant_angle_deg:50,l=Number.isFinite(n.sweep_angle_deg)?n.sweep_angle_deg:10,u=Number.isFinite(n.height_mm)?n.height_mm:20,d=Math.max(-85,Math.min(85,c))*Math.PI/180,f=Math.max(-60,Math.min(60,l))*Math.PI/180,p=Math.max(2,Math.min(100,u)),m=Math.abs(d);for(let t=0;t<r;t++){let n=e[t*3+2];if(n>o){let r=Math.min(1,Math.max(0,(n-o)/s)),i=r*r*(3-2*r),a=e[t*3],c=e[t*3+1],l=i*p*Math.sin(d),u=i*p*Math.tan(f),h=o+s*(m>1e-6?Math.sin(m*r)/m:r);e[t*3]=a+u,e[t*3+1]=c+l,e[t*3+2]=h}}}function Pp(e,t,n,r=5.5,i=1.225){let a=Math.max(.05,e.rotor.radius_mm*.001),o=Math.PI*a*a,s=Math.max(.05,t.peak_cp||t.design_point.cp||.35),c=Math.max(.5,t.peak_tsr||e.rotor.design_tsr||4.5),l=Math.max(.1,n.gear_ratio??1),u=t.sweep[0],d=u&&u.tsr>.1?Math.max(.008,u.cp/u.tsr):Math.max(.012,s/(c*2.4)),f=.65+.35*Math.min(4,l),p=Math.max(.012,.032*a*a*f),m=Math.max(1e-6,.5*i*o*a*d),h=Math.min(7.5,Math.max(1.4,Math.sqrt(p/m))),g=Math.max(1,n.kv||35),_=Math.max(.02,n.r_int||.8),v=Math.max(.1,n.r_load||12),y=_+v,b=Math.abs(l-1)<.001?1:Math.max(.85,.97-.012*Math.abs(l-1)),x=[];for(let e=2;e<=18;e+=1){if(e<h){x.push({wind_mps:e,rpm:0,tsr:0,mech_power_w:0,elec_power_w:0,torque_nm:.5*i*o*a*e*e*d});continue}let t=Math.min(1,(e-h)/Math.max(.8,.35*h)+.25),n=e>13?1/(1+.08*(e-13)**1.6):1,r=s*t*n,u=.5*i*o*e**3*r,f=c*e/a,p=f*60/(2*Math.PI),m=f>.001?u/f:0,_=p*l/g,S=_/y,C=_*S,w=Math.min(.92,v/y*.94)*b,T=C>0?Math.min(u*w,S**2*v*b):u*.78*b;x.push({wind_mps:e,rpm:p,tsr:c,mech_power_w:u,elec_power_w:Math.max(0,T),torque_nm:m})}let S=Math.max(2,Math.min(14,r||5.5)),C=2*S/Math.sqrt(Math.PI),w=0;for(let e=0;e<x.length-1;e++){let t=x[e],n=x[e+1],r=1-Math.exp(-((t.wind_mps/C)**2)),i=1-Math.exp(-((n.wind_mps/C)**2)),a=Math.max(0,i-r);w+=.5*(t.elec_power_w+n.elec_power_w)*a}let T=w*8760/1e3,E=x.find(e=>e.wind_mps===12)??x[x.length-1],D=Math.max(1,E.elec_power_w),O=Math.min(100,w/D*100);return{cut_in_mps:h,rated_mech_power_w:E.mech_power_w,rated_elec_power_w:E.elec_power_w,aep_kwh_yr:T,capacity_factor_pct:O,site_avg_wind_mps:S,points:x}}function Fp(e,t=`dark`){let n=t===`atelier`,r=n?`rgba(29,78,216,0.18)`:`rgba(148,163,184,0.18)`,i=n?`rgba(29,78,216,0.10)`:`rgba(148,163,184,0.10)`,a=n?`#e8451e`:`#fbbf24`,o=n?`#1d4ed8`:`#22d3ee`,s=n?`#047857`:`#34d399`,c=n?`#475569`:`#7c879b`,l=n?`#18181b`:`#f1f5f9`,u=n?`#ffffff`:`#090b10`,d=Math.max(25,...e.points.map(e=>Math.max(e.mech_power_w,e.elec_power_w)))*1.1,f=e=>38+(e-2)/16*268,p=e=>122-Math.min(d,Math.max(0,e))/d*108,m=e.points.map((e,t)=>`${t===0?`M`:`L`}${f(e.wind_mps).toFixed(1)},${p(e.mech_power_w).toFixed(1)}`).join(` `),h=e.points.map((e,t)=>`${t===0?`M`:`L`}${f(e.wind_mps).toFixed(1)},${p(e.elec_power_w).toFixed(1)}`).join(` `),g=f(Math.max(2,Math.min(18,e.cut_in_mps))).toFixed(1);return[`<line x1="38" y1="14" x2="38" y2="122" stroke="${r}" stroke-width="1" />`,`<line x1="38" y1="122" x2="306" y2="122" stroke="${r}" stroke-width="1" />`,`<line x1="38" y1="${68 .toFixed(1)}" x2="306" y2="${68 .toFixed(1)}" stroke="${i}" stroke-width="1" stroke-dasharray="3 3" />`,`<line x1="${g}" y1="14" x2="${g}" y2="122" stroke="${a}" stroke-width="1.2" stroke-dasharray="3 2" />`,`<path d="${m}" fill="none" stroke="${o}" stroke-width="2" />`,`<path d="${h}" fill="none" stroke="${s}" stroke-width="2" />`,`<text x="${Number(g)+4}" y="24" fill="${a}" font-size="9.5" font-family="'JetBrains Mono', monospace">Cut-in ${e.cut_in_mps.toFixed(1)} m/s</text>`,`<text x="34" y="22" text-anchor="end" fill="${c}" font-size="9.5" font-family="'JetBrains Mono', monospace">${Math.round(d)}W</text>`,`<text x="34" y="122" text-anchor="end" fill="${c}" font-size="9.5" font-family="'JetBrains Mono', monospace">0W</text>`,`<text x="38" y="140" fill="${c}" font-size="9.5" font-family="'JetBrains Mono', monospace">2 m/s</text>`,`<text x="172" y="140" text-anchor="middle" fill="${c}" font-size="9.5" font-family="'JetBrains Mono', monospace">10 m/s</text>`,`<text x="306" y="140" text-anchor="end" fill="${c}" font-size="9.5" font-family="'JetBrains Mono', monospace">18 m/s</text>`,`<g class="chart-crosshair" style="display:none;pointer-events:none"><line class="ch-line" x1="38" y1="14" x2="38" y2="122" stroke="${l}" stroke-width="1" stroke-dasharray="2 2" opacity="0.65" /><circle class="ch-dot-primary" cx="38" cy="122" r="3.8" fill="${o}" stroke="${u}" stroke-width="1.4" /><circle class="ch-dot-secondary" cx="38" cy="122" r="3.8" fill="${s}" stroke="${u}" stroke-width="1.4" /></g>`].join(`
`)}function Ip(e,t){let n=Math.max(25,...t.points.map(e=>Math.max(e.mech_power_w,e.elec_power_w)))*1.1,r=Math.min(306,Math.max(38,e)),i=2+(r-38)/268*16,a=0,o=0,s=0,c=t.points;if(c.length>0){if(i<=c[0].wind_mps)a=c[0].mech_power_w,o=c[0].elec_power_w,s=c[0].rpm;else if(i>=c[c.length-1].wind_mps){let e=c[c.length-1];a=e.mech_power_w,o=e.elec_power_w,s=e.rpm}else for(let e=0;e<c.length-1;e++){let t=c[e],n=c[e+1];if(i>=t.wind_mps&&i<=n.wind_mps){let e=(i-t.wind_mps)/Math.max(1e-6,n.wind_mps-t.wind_mps);a=t.mech_power_w+e*(n.mech_power_w-t.mech_power_w),o=t.elec_power_w+e*(n.elec_power_w-t.elec_power_w),s=t.rpm+e*(n.rpm-t.rpm);break}}}let l=e=>122-Math.min(n,Math.max(0,e))/n*108;return{wind_mps:i,mech_power_w:a,elec_power_w:o,rpm:s,svg_x:r,svg_y_mech:l(a),svg_y_elec:l(o),readout:i<t.cut_in_mps?`V ${i.toFixed(1)} m/s  |  Below cut-in (${t.cut_in_mps.toFixed(1)} m/s) — parked`:`V ${i.toFixed(1)} m/s  |  Mech ${a.toFixed(0)} W  |  Elec ${o.toFixed(0)} W  |  ${s.toFixed(0)} RPM`}}var Lp={bambu_256:{name:`Bambu X1/P1/A1 (256³ mm)`,bed_x_mm:256,bed_y_mm:256,max_z_mm:256},prusa_mk4:{name:`Prusa MK4 / Core One (250×210×220 mm)`,bed_x_mm:250,bed_y_mm:210,max_z_mm:220},ender3:{name:`Ender 3 / 220 Class (220×220×250 mm)`,bed_x_mm:220,bed_y_mm:220,max_z_mm:250},voron_350:{name:`Voron 2.4 / Large (350³ mm)`,bed_x_mm:350,bed_y_mm:350,max_z_mm:350},custom:{name:`Custom Build Height`,bed_x_mm:250,bed_y_mm:250,max_z_mm:250}};function Rp(e,t,n=`bambu_256`,r){let i=Lp[n]??Lp.bambu_256,a=n===`custom`&&r&&r>=50?r:i.max_z_mm,o=Math.hypot(i.bed_x_mm,i.bed_y_mm)*.92,s=e.rotor.hub_radius_mm,c=e.rotor.radius_mm,l=Math.max(10,c-s),u=Math.max(1,Math.min(4,t.split_parts||1)),d=Math.max(.12,Math.min(.88,(t.split_ratio_pct||50)/100)),f=t.align_shape===`none`?0:Math.max(0,Number.isFinite(t.align_height_mm)?t.align_height_mm:6),p=u>1?f:0,m=[0];if(u===2)m.push(d,1);else for(let e=1;e<=u;e++)m.push(e/u);let h=Of(e),g=Math.max(10,...h.map(e=>e.effective_chord_mm)),_=[];for(let e=0;e<u;e++){let t=m[e],n=m[e+1],r=s+t*l,i=s+n*l,c=i-r,d=e<u-1?p:0,f=c+d;_.push({part_index:e,span_start_mm:r,span_end_mm:i,body_length_mm:c,joint_protrusion_mm:d,total_print_z_mm:f,max_chord_mm:g,fits_z:f<=a+1e-6,fits_xy:g<=o})}let v=_.every(e=>e.fits_z),y=_.every(e=>e.fits_xy),b=v&&y,x=4;for(let e=1;e<=4;e++)if(l/e+(e>1?f:0)<=a+1e-6){x=e;break}let S=_.reduce((e,t)=>t.total_print_z_mm>e.total_print_z_mm?t:e,_[0]),C;return C=b?`All ${u} part(s) fit ${a} mm Z limit (tallest: Part ${S.part_index+1} at ${S.total_print_z_mm.toFixed(1)} mm)`:v?`Max chord ${g.toFixed(1)} mm exceeds ${i.name} XY diagonal limit (${o.toFixed(1)} mm)`:`Part ${S.part_index+1} is ${S.total_print_z_mm.toFixed(1)} mm tall (exceeds ${a} mm Z limit by ${(S.total_print_z_mm-a).toFixed(1)} mm) — split into ${x} parts`,{preset:n,printer_name:i.name,max_z_mm:a,bed_xy_mm:Math.min(i.bed_x_mm,i.bed_y_mm),blade_span_mm:l,all_fit:b,segments:_,recommended_split_parts:x,recommended_split_ratio_pct:50,summary:C}}var zp={low_wind:{key:`low_wind`,name:`Low-Speed Wind (3.5 m/s · High Starting Torque · λ 3.5)`,badge:`3.5 m/s Low-Wind`,description:`Wide root/mid chord (74→58→32 mm) and steep 26° root twist with S833 root + Selig SG6043 low-Re high-lift profile to overcome generator cogging and self-start at 1.8–2.2 m/s.`,rotor:{radius_mm:300,hub_radius_mm:35,blade_count:3,design_tsr:3.5,wind_speed_mps:3.5,station_count:13,pitch_axis_ratio:.25},planform:{cosine:!0,center_pct:45,width_pct:28},sections:{root:{chord_mm:74,twist_deg:26,airfoil:{type:`named`,name:`S833`}},mid:{chord_mm:58,twist_deg:13,airfoil:{type:`named`,name:`SG6043`}},tip:{chord_mm:32,twist_deg:3.5,airfoil:{type:`named`,name:`SG6043`}}},recommended_drivetrain:{gen_preset:`kidwind_red`,gear_ratio:3,r_load_ohm:12,site_avg_wind_mps:3.5}},med_kidwind:{key:`med_kidwind`,name:`KidWind Competition Standard (4.5 m/s · Geared 3:1 · λ 4.2)`,badge:`4.5 m/s KidWind`,description:`Balanced 350 mm radius competition rotor (64→48→25 mm cosine planform, S833 root + SG6043 mid/tip) tuned for 4.0–5.0 m/s KidWind tunnels with a 2.5:1–3.5:1 gear stage.`,rotor:{radius_mm:350,hub_radius_mm:40,blade_count:3,design_tsr:4.2,wind_speed_mps:4.5,station_count:13,pitch_axis_ratio:.25},planform:{cosine:!0,center_pct:45,width_pct:25},sections:{root:{chord_mm:64,twist_deg:22,airfoil:{type:`named`,name:`S833`}},mid:{chord_mm:48,twist_deg:10.5,airfoil:{type:`named`,name:`SG6043`}},tip:{chord_mm:25,twist_deg:2.5,airfoil:{type:`named`,name:`SG6043`}}},recommended_drivetrain:{gen_preset:`kidwind_red`,gear_ratio:3,r_load_ohm:10,site_avg_wind_mps:4.5}},scimitar_belly:{key:`scimitar_belly`,name:`Scimitar Elliptical Belly (45→76→22 mm · High Mid-Span Torque · λ 4.5)`,badge:`45→76→22 Scimitar`,description:`Pinched 45 mm S833 root swelling into a 76 mm SG6043 mid-span power belly and tapering to a low-drag 22 mm tip (22°→11.5°→2.5° twist). Auto-enables 5 mm CF spar tube for high Root Safety Factor.`,rotor:{radius_mm:350,hub_radius_mm:40,blade_count:3,design_tsr:4.5,wind_speed_mps:4.5,station_count:13,pitch_axis_ratio:.25},planform:{cosine:!0,center_pct:45,width_pct:22},sections:{root:{chord_mm:45,twist_deg:22,airfoil:{type:`named`,name:`S833`}},mid:{chord_mm:76,twist_deg:11.5,airfoil:{type:`named`,name:`SG6043`}},tip:{chord_mm:22,twist_deg:2.5,airfoil:{type:`named`,name:`SG6043`}}},recommended_drivetrain:{gen_preset:`kidwind_red`,gear_ratio:3,r_load_ohm:10,site_avg_wind_mps:4.5},recommended_spar_mm:5},high_wind:{key:`high_wind`,name:`High-Speed Wind (8.0 m/s · Fast TSR Direct-Drive · λ 5.5)`,badge:`8.0 m/s High-Speed`,description:`Slender low-drag planform (52→36→24 mm) pairing S833 root, SD7062 mid, and Eppler E387 fast tip for high RPM and minimal profile drag at 7–10 m/s.`,rotor:{radius_mm:350,hub_radius_mm:40,blade_count:3,design_tsr:5.5,wind_speed_mps:8,station_count:13,pitch_axis_ratio:.25},planform:{cosine:!0,center_pct:48,width_pct:22},sections:{root:{chord_mm:52,twist_deg:16.5,airfoil:{type:`named`,name:`S833`}},mid:{chord_mm:36,twist_deg:6.5,airfoil:{type:`named`,name:`SD7062`}},tip:{chord_mm:24,twist_deg:1,airfoil:{type:`named`,name:`E387`}}},recommended_drivetrain:{gen_preset:`outrunner_bldc`,gear_ratio:1,r_load_ohm:6,site_avg_wind_mps:7.5}},schmitz_600:{key:`schmitz_600`,name:`Reference 600 mm Rotor (8.0 m/s · NACA 4412 · λ 4.5)`,badge:`600 mm Reference`,description:`Full-scale 600 mm radius 3-blade NACA 4412 reference rotor (70→35 mm linear taper, 20°→3° twist) paired with a 1:1 low-RPM permanent-magnet alternator.`,rotor:{radius_mm:600,hub_radius_mm:60,blade_count:3,design_tsr:4.5,wind_speed_mps:8,station_count:11,pitch_axis_ratio:.25},planform:{cosine:!1,center_pct:45,width_pct:25},sections:{root:{chord_mm:70,twist_deg:20,airfoil:{type:`naca4`,max_camber:.04,camber_position:.4,thickness_ratio:.12}},mid:{chord_mm:52.5,twist_deg:11.5,airfoil:{type:`naca4`,max_camber:.04,camber_position:.4,thickness_ratio:.12}},tip:{chord_mm:35,twist_deg:3,airfoil:{type:`naca4`,max_camber:.04,camber_position:.4,thickness_ratio:.12}}},recommended_drivetrain:{gen_preset:`low_rpm_pmg`,gear_ratio:1,r_load_ohm:5,site_avg_wind_mps:6}}};function Bp(e,t){let n=zp[t]??zp.med_kidwind,r=wf(e);r.overrides=[],r.rotor={...r.rotor,...n.rotor},r.hub={...r.hub,diameter_mm:Math.max(24,n.rotor.hub_radius_mm*2)};let i=n.planform.center_pct/100,a=n.planform.width_pct/100;return n.planform.cosine?(r.distributions.chord_mm={type:`formula`,expr:Hf(n.sections.root.chord_mm,n.sections.tip.chord_mm,i,a,n.sections.mid.chord_mm)},r.distributions.twist_deg={type:`formula`,expr:Hf(n.sections.root.twist_deg,n.sections.tip.twist_deg,i,a,n.sections.mid.twist_deg)}):(r.distributions.chord_mm={type:`linear`,root:n.sections.root.chord_mm,tip:n.sections.tip.chord_mm},r.distributions.twist_deg={type:`linear`,root:n.sections.root.twist_deg,tip:n.sections.tip.twist_deg}),r=qf(r,n.sections,i),{design:r,spec:n}}var Vp={kidwind_red:{key:`kidwind_red`,name:`KidWind Red Generator (Kv 240 · R_int 6.2 Ω)`,kv_rpm_per_v:240,r_int_ohm:6.2,no_load_current_a:.03,default_gear_ratio:3,default_r_load_ohm:10,notes:`Standard KidWind DC generator. Because Kv=240 RPM/V is high and R_int=6.2 Ω, use a 2.5:1–4:1 gear ratio and 8–15 Ω load resistor so voltage isn't lost as heat.`},kidwind_gen2:{key:`kidwind_gen2`,name:`KidWind GEN2 / High-RPM DC (Kv 320 · R_int 4.8 Ω)`,kv_rpm_per_v:320,r_int_ohm:4.8,no_load_current_a:.035,default_gear_ratio:3.5,default_r_load_ohm:12,notes:`Fast small DC armature (320 RPM/V). Needs 3:1–5:1 step-up gearing in 3.5–4.5 m/s wind tunnels to spin the generator fast enough for high voltage.`},outrunner_bldc:{key:`outrunner_bldc`,name:`Gimbal / Drone Outrunner BLDC (Kv 100 · R_int 1.4 Ω)`,kv_rpm_per_v:100,r_int_ohm:1.4,no_load_current_a:.05,default_gear_ratio:1.5,default_r_load_ohm:6,notes:`3-phase rectified outrunner with low winding resistance (1.4 Ω). Delivers >80% electrical efficiency with 1:1 direct drive or 1.5:1–2:1 gearing.`},low_rpm_pmg:{key:`low_rpm_pmg`,name:`Low-RPM Direct-Drive PMG (Kv 35 · R_int 0.8 Ω)`,kv_rpm_per_v:35,r_int_ohm:.8,no_load_current_a:.08,default_gear_ratio:1,default_r_load_ohm:5,notes:`High-pole-count permanent magnet alternator (Kv=35 RPM/V, R_int=0.8 Ω) designed for 1:1 direct drive at 400–800 RPM.`},custom:{key:`custom`,name:`Custom Generator Spec`,kv_rpm_per_v:100,r_int_ohm:2,no_load_current_a:.05,default_gear_ratio:1,default_r_load_ohm:10,notes:`Custom Kv, internal winding resistance R_int, gear ratio G:1, and load resistor R_load.`}};function Hp(e,t,n,r,i,a,o){let s=60/(2*Math.PI*Math.max(.001,n)),c=Math.max(.05,r+o),l=Math.abs(a-1)<.001?1:Math.max(.85,.97-.012*Math.abs(a-1)),u=e=>{if(e<=0)return 0;let t=e*a/n/c;return a*s*(t+i)/l};if(e.length===0)return{tsr:t,rotor_rpm:0,gen_rpm:0,voltage_v:0,current_a:0,elec_power_w:0,mech_power_w:0,efficiency:0,stalled:!0};let d=e[0].tsr,f=e[0].rpm,p=e[0].power_w,m=!1,h=1/0;for(let t=e.length-1;t>=1;t--){let n=e[t],r=e[t-1],i=n.torque_nm-u(n.rpm),a=r.torque_nm-u(r.rpm);if(Math.abs(i)<h&&(h=Math.abs(i),d=n.tsr,f=n.rpm,p=n.power_w),a>=0&&i<=0){let e=a/Math.max(1e-9,a-i);d=r.tsr+e*(n.tsr-r.tsr),f=r.rpm+e*(n.rpm-r.rpm),p=Math.max(0,r.power_w+e*(n.power_w-r.power_w)),m=!0;break}}let g=Math.max(...e.map(e=>e.torque_nm)),_=u(e.reduce((e,t)=>t.cp>e.cp?t:e,e[0]).rpm),v=!m&&_>g;v&&(d=e[0].tsr*.55,f=e[0].rpm*.55,p=e[0].power_w*.35);let y=f*a,b=y/n/c,x=b*o,S=x*b,C=Math.min(Math.max(0,p*l*.94),S),w=p>1e-6?Math.min(.95,C/p):0;return{tsr:d,rotor_rpm:f,gen_rpm:y,voltage_v:x,current_a:b,elec_power_w:C,mech_power_w:p,efficiency:w,stalled:v}}function Up(e,t,n){let r=Math.max(1,n.kv||35),i=Math.max(.05,n.r_int||.8),a=Math.max(.1,n.r_load||5),o=Math.max(.25,n.gear_ratio||1),s=Math.max(0,n.i0??.04),c=Math.max(.5,t.peak_tsr||e.rotor.design_tsr||4.5),l=Hp(t.sweep,c,r,i,s,o,a),u=t.generator_match?.tip_speed_ratio??l.tsr,d=t.generator_match?.generator.rotor_rpm??l.rotor_rpm,f=t.generator_match?.generator.generator_rpm??d*o,p=t.generator_match?.generator.terminal_voltage_v??l.voltage_v,m=t.generator_match?.generator.current_a??l.current_a,h=t.generator_match?.generator.electrical_power_w??l.elec_power_w,g=(t.generator_match?.generator.efficiency??l.efficiency)*100,_=[];for(let e=.5;e<=15;e+=.5)_.push(Number(e.toFixed(2)));for(let e=16;e<=50;e+=1)_.push(Number(e.toFixed(2)));for(let e=55;e<=120;e+=5)_.push(Number(e.toFixed(2)));let v=a,y=-1;for(let e of _){let n=Hp(t.sweep,c,r,i,s,o,e),a=!n.stalled&&n.tsr>=.9*c?1:.72,l=n.elec_power_w*a;l>y&&(y=l,v=e)}let b=Hp(t.sweep,c,r,i,s,o,v),x=[1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.25,3.5,4,4.5,5,6,7,8],S=o,C=v,w=b,T=-1;for(let e of x)for(let n of _){let a=Hp(t.sweep,c,r,i,s,e,n),o=!a.stalled&&a.tsr>=.92*c&&a.tsr<=1.18*c,l=a.elec_power_w*(o?1.05:a.stalled?.5:.9);l>T&&(T=l,S=e,C=n,w=a)}let E=`optimal_band`,D=`Matched near Peak Cp (λ=${u.toFixed(2)} vs Opt λ=${c.toFixed(2)})`;l.stalled||u<.88*c?(E=`stalled_overload`,D=`Over-Loaded / Braking Stall (λ=${u.toFixed(2)} < Opt λ=${c.toFixed(2)})`):u>1.14*c&&(E=`overspeed_underload`,D=`Under-Loaded / Free-Spinning High TSR (λ=${u.toFixed(2)} > Opt λ=${c.toFixed(2)})`);let O=Math.max(0,w.elec_power_w-h),k=h>.001?O/h*100:0,A=[];return E===`stalled_overload`?A.push(`1. Relieve Generator Braking: Your load pulls rotor TSR down to λ=${u.toFixed(2)} (stalling the blades). Increase Load R_load toward ${C.toFixed(1)} Ω or reduce Gear Ratio to ${S.toFixed(2)}:1 so the rotor can spin up to Peak λ=${c.toFixed(2)} (${w.rotor_rpm.toFixed(0)} RPM).`):E===`overspeed_underload`?A.push(`1. Capture More Shaft Torque: Rotor is overspeeding at λ=${u.toFixed(2)} because generator counter-torque is too weak. Step up Gear Ratio to ${S.toFixed(2)}:1 (Gen ${w.gen_rpm.toFixed(0)} RPM) and set Load R_load = ${C.toFixed(1)} Ω to load the blades at Peak λ=${c.toFixed(2)}.`):A.push(`1. Fine-Tune Gear & Load Impedance: Set Gear Ratio = ${S.toFixed(2)}:1 and Load Resistor R_load = ${C.toFixed(1)} Ω (R_load / R_int = ${(C/i).toFixed(1)}×) to reach ${w.elec_power_w.toFixed(1)} W (${(w.efficiency*100).toFixed(0)}% efficiency).`),A.push(`2. Match Blade Design TSR to Tunnel Equilibrium: Set Rotor Design TSR λ = ${c.toFixed(2)} and click "Auto-Optimize Blade (Max Cp)" in the BEM section so every station sits at its peak Cl/Cd glide angle (~6°).`),e.rotor.wind_speed_mps<=4.5?A.push(`3. Low-Wind Tunnel Tip: At ${e.rotor.wind_speed_mps.toFixed(1)} m/s, keep R_load ≥ ${(1.6*i).toFixed(1)} Ω during start-up so current draw doesn't brake the hub before the blades pass Cut-In.`):A.push(`3. High-Wind Tip: At ${e.rotor.wind_speed_mps.toFixed(1)} m/s (${w.rotor_rpm.toFixed(0)} RPM), enable a Carbon-Fiber Spar Tube in Fabrication so tip deflection stays < 5% and pitch twist doesn't wash out.`),{regime:E,regime_label:D,current_tsr:u,current_rotor_rpm:d,current_gen_rpm:f,current_voltage_v:p,current_current_a:m,current_elec_power_w:h,current_efficiency_pct:g,best_r_load_at_current_gear_ohm:v,power_at_current_gear_best_load_w:b.elec_power_w,opt_gear_ratio:S,opt_r_load_ohm:C,opt_tsr:w.tsr,opt_rotor_rpm:w.rotor_rpm,opt_gen_rpm:w.gen_rpm,opt_voltage_v:w.voltage_v,opt_elec_power_w:w.elec_power_w,opt_efficiency_pct:w.efficiency*100,gain_power_w:O,gain_pct:k,how_to_max_out_steps:A}}function Wp(){return{stage_mode:`compound_2stage`,layout_mode:`meshed`,module_mm:1.25,pressure_angle_deg:20,helix_angle_deg:15,backlash_mm:.15,spoke_width_pct:26,rim_wall_mm:3.5,hub_ring_mm:2.5,g1_teeth:60,g1_face_width_mm:5,g1_spokes:4,g1_bore_mm:6,g1_d_flat_mm:.5,g1_hub_diameter_mm:24,g1_hub_height_mm:18,g2_wheel_teeth:56,g2_wheel_face_mm:5,g2_spokes:4,g2_pinion_teeth:15,g2_pinion_face_mm:14,g2_bore_mm:5,g2_d_flat_mm:0,g3_teeth:20,g3_face_width_mm:14,g3_bore_mm:3,g3_d_flat_mm:.4,g3_boss_height_mm:4.5,g3_helix_hand:1}}function Gp(e){let t=Math.max(.4,e.module_mm||1.25),n=Math.max(10,Math.round(e.g1_teeth||60)),r=Math.max(10,Math.round(e.g2_wheel_teeth||56)),i=Math.max(8,Math.round(e.g2_pinion_teeth||15)),a=Math.max(8,Math.round(e.g3_teeth||20)),o=t*n,s=o+2*t,c=t*r,l=c+2*t,u=t*i,d=u+2*t,f=t*a,p=f+2*t,m=1,h=1,g=0,_=0,v=96;e.stage_mode===`direct_1stage`?(m=n/a,h=1,g=.5*(o+f),_=0,v=96.5):e.stage_mode===`compound_2stage`?(m=n/i,h=r/a,g=.5*(o+u),_=.5*(c+f),v=93.5):(m=n/r,h=r/a,g=.5*(o+c),_=.5*(c+f),v=94.5);let y=m*h,b=e.stage_mode===`direct_1stage`?.5*s+g+.5*p:.5*s+g+_+.5*p,x=Math.max(e.g1_face_width_mm+e.g1_hub_height_mm,e.g2_wheel_face_mm+e.g2_pinion_face_mm+2.5,e.g3_face_width_mm+e.g3_boss_height_mm);return{stage1_ratio:Number(m.toFixed(3)),stage2_ratio:Number(h.toFixed(3)),total_ratio:Number(y.toFixed(3)),efficiency_pct:v,g1_pitch_dia_mm:o,g1_outer_dia_mm:s,g2_wheel_pitch_dia_mm:c,g2_wheel_outer_dia_mm:l,g2_pinion_pitch_dia_mm:u,g2_pinion_outer_dia_mm:d,g3_pitch_dia_mm:f,g3_outer_dia_mm:p,center_distance_12_mm:Number(g.toFixed(2)),center_distance_23_mm:Number(_.toFixed(2)),total_span_width_mm:Number(b.toFixed(1)),max_height_z_mm:Number(x.toFixed(1))}}function Kp(e,t){let n=Math.max(.5,Math.min(20,t||3)),r={...e};if(e.stage_mode===`direct_1stage`||e.stage_mode===`idler_reference`){let t=r.g1_teeth,i=r.g3_teeth,a=1/0;for(let e=14;e<=30;e++){let r=Math.max(16,Math.min(96,Math.round(e*n))),o=r/e,s=Math.abs(o-n)+.002*Math.abs(r-60);s<a&&(a=s,t=r,i=e)}return r.g1_teeth=t,r.g3_teeth=i,e.stage_mode===`idler_reference`&&(r.g2_wheel_teeth=Math.max(24,Math.min(84,Math.round(.92*t)))),r}let i=Math.sqrt(n),a={z1:r.g1_teeth,z2p:r.g2_pinion_teeth,z2w:r.g2_wheel_teeth,z3:r.g3_teeth},o=1/0;for(let e=13;e<=24;e++)for(let t=14;t<=26;t++){let r=Math.max(20,Math.min(84,Math.round(e*i))),s=n/(r/e),c=Math.max(20,Math.min(80,Math.round(t*s))),l=r/e*(c/t),u=Math.abs(l-n)+.015*Math.abs(r/e-c/t)+.001*Math.abs(r-56);u<o&&(o=u,a={z1:r,z2p:e,z2w:c,z3:t})}return r.g1_teeth=a.z1,r.g2_pinion_teeth=a.z2p,r.g2_wheel_teeth=a.z2w,r.g3_teeth=a.z3,r}function qp(e){return Math.tan(e)-e}function Jp(e,t,n,r,i){let a=Math.max(8,Math.round(e)),o=Math.max(.4,t),s=(n||20)*Math.PI/180,c=.5*o*a,l=c*Math.cos(s),u=c+1*o,d=Math.max(.35*c,c-1.2*o),f=2*Math.PI/a,p=Math.min(.18*f,Math.max(0,r)/Math.max(1,c)),m=Math.PI/(2*a)-.5*p+qp(s),h=l<u?Math.acos(l/u):0,g=Math.max(f/2*.08,m-qp(h)),_=Math.min(.36*f,Math.max(g*1.65,m*1.08)),v=a*i,y=new Float64Array(v),b=new Float64Array(v);for(let e=0;e<v;e++){let t=2*Math.PI*e/v;y[e]=t;let n=Math.floor((t+.5*f)/f),r=Math.abs(t-n*f),i=d;if(r<=g){let e=r/Math.max(1e-6,g);i=u-.03*o*e*e}else if(r<_){let e=1-((r-g)/Math.max(1e-6,_-g))**1.35;i=d+(u-d)*e}else i=d;b[e]=i}return{angles:y,radii:b}}function Yp(e,t,n){let r=e.length,i=Math.max(.8,.5*t),a=Math.max(0,Math.min(.42*i,n||0)),o=i-a,s=new Float64Array(r);for(let t=0;t<r;t++){let n=e[t],r=Math.cos(n);a>1e-4&&r>o/i?s[t]=o/r:s[t]=i}return s}var Xp=class{positions=[];indices=[];addVertex(e,t,n){let r=this.positions.length/3;return this.positions.push(e,t,n),r}addTri(e,t,n){e!==t&&t!==n&&n!==e&&this.indices.push(e,t,n)}addQuad(e,t,n,r){this.addTri(e,t,n),this.addTri(e,n,r)}addPolarRing(e,t,n,r=0){let i=this.positions.length/3,a=typeof t==`number`;for(let i=0;i<e.length;i++){let o=e[i]+r,s=a?t:t[i];this.addVertex(s*Math.cos(o),s*Math.sin(o),n)}return i}stitchRings(e,t,n,r=!1){for(let i=0;i<n;i++){let a=(i+1)%n,o=e+i,s=e+a,c=t+i,l=t+a;r?this.addQuad(o,c,l,s):this.addQuad(o,s,l,c)}}toSubMesh(e){let t=new Float32Array(this.positions),n=new Uint32Array(this.indices),r=Zp(t,n);return{...e,positions:t,normals:r,indices:n}}};function Zp(e,t){let n=new Float32Array(e.length);for(let r=0;r<t.length;r+=3){let i=t[r]*3,a=t[r+1]*3,o=t[r+2]*3,s=e[i],c=e[i+1],l=e[i+2],u=e[a],d=e[a+1],f=e[a+2],p=e[o],m=e[o+1],h=e[o+2],g=u-s,_=d-c,v=f-l,y=p-s,b=m-c,x=h-l,S=_*x-v*b,C=v*y-g*x,w=g*b-_*y;n[i]+=S,n[i+1]+=C,n[i+2]+=w,n[a]+=S,n[a+1]+=C,n[a+2]+=w,n[o]+=S,n[o+1]+=C,n[o+2]+=w}for(let e=0;e<n.length;e+=3){let t=n[e],r=n[e+1],i=n[e+2],a=Math.hypot(t,r,i);a>1e-12?(n[e]=t/a,n[e+1]=r/a,n[e+2]=i/a):n[e+2]=1}return n}function Qp(e){let t=new Xp,{angles:n,radii:r}=Jp(e.teeth,e.moduleMm,e.pressureAngleDeg,e.backlashMm,8),i=n.length,a=.5*e.moduleMm*e.teeth,o=Math.max(.35*a,a-1.2*e.moduleMm),s=Math.max(1.2,e.rimWallMm??2.8*e.moduleMm),c=Math.max(e.hubOuterRadiusMm+2,o-s),l=e.spokes>=3&&e.spokes<=8&&c>e.hubOuterRadiusMm+2.5,u=Yp(n,e.boreDiaMm,e.dFlatMm),d=e.zOffsetMm,f=e.zOffsetMm+e.faceWidthMm,p=(e.helixAngleDeg||0)*Math.PI/180,m=[];for(let i=0;i<=6;i++){let o=d+i/6*e.faceWidthMm,s=e.helixHand*((o-d)*Math.tan(p))/Math.max(2,a);m.push(t.addPolarRing(n,r,o,s))}for(let e=0;e<6;e++)t.stitchRings(m[e],m[e+1],i,!1);if(!l){let e=t.addPolarRing(n,u,d,0),r=t.addPolarRing(n,u,f,0);return t.stitchRings(e,r,i,!0),t.stitchRings(e,m[0],i,!1),t.stitchRings(r,m[6],i,!0),t}let h=Math.max(e.boreDiaMm*.65,e.hubOuterRadiusMm),g=t.addPolarRing(n,u,d,0),_=t.addPolarRing(n,u,f,0),v=t.addPolarRing(n,h,d,0),y=t.addPolarRing(n,h,f,0),b=t.addPolarRing(n,c,d,0),x=t.addPolarRing(n,c,f,0);t.stitchRings(g,_,i,!0),t.stitchRings(g,v,i,!1),t.stitchRings(_,y,i,!0),t.stitchRings(b,m[0],i,!1),t.stitchRings(x,m[6],i,!0);let S=e.spokes,C=.5*Math.max(.1,Math.min(.65,(e.spokeWidthPct??26)/100)),w=Array(i);for(let e=0;e<i;e++){let t=2*Math.PI*(e+.5)/i*S/(2*Math.PI)%1;w[e]=t<C||t>1-C}for(let e=0;e<i;e++){let n=(e+1)%i,r=(e-1+i)%i;w[e]?(t.addQuad(v+e,v+n,b+n,b+e),t.addQuad(y+e,x+e,x+n,y+n),w[r]||t.addQuad(v+e,b+e,x+e,y+e),w[n]||t.addQuad(v+n,y+n,x+n,b+n)):(t.addQuad(v+e,v+n,y+n,y+e),t.addQuad(b+e,x+e,x+n,b+n))}return t}function $p(e){let t=new Xp,n=new Float64Array(96);for(let e=0;e<96;e++)n[e]=2*Math.PI*e/96;let r=Yp(n,e.boreDiaMm,e.dFlatMm),i=Math.max(e.boreDiaMm*.8,.5*e.hubDiaMm),a=i*1.24,o=Math.max(4,e.hubHeightMm),s=e.zBaseMm,c=[{z:s,r:a},{z:s+.22*o,r:i},{z:s+.78*o,r:i},{z:s+.84*o,r:i*.86},{z:s+.9*o,r:i*.86},{z:s+.94*o,r:i*.68},{z:s+1*o,r:i*.68}],l=[];for(let e of c)l.push(t.addPolarRing(n,e.r,e.z,0));for(let e=0;e<l.length-1;e++)t.stitchRings(l[e],l[e+1],96,!1);let u=t.addPolarRing(n,r,s,0),d=t.addPolarRing(n,r,s+o,0);return t.stitchRings(u,d,96,!0),t.stitchRings(u,l[0],96,!1),t.stitchRings(d,l[l.length-1],96,!0),t}function em(e){let t=Gp(e),n=[],r=Math.max(10,Math.round(e.g1_teeth||60)),i=Math.max(10,Math.round(e.g2_wheel_teeth||56)),a=Math.max(8,Math.round(e.g2_pinion_teeth||15)),o=Math.max(8,Math.round(e.g3_teeth||20)),s=e.stage_mode===`direct_1stage`?r/o:e.stage_mode===`compound_2stage`?r/a:r/i,c=s*(e.stage_mode===`direct_1stage`?1:i/o),l=.5*t.g1_pitch_dia_mm,u=.5*t.g2_wheel_pitch_dia_mm,d=.5*t.g2_pinion_pitch_dia_mm,f=.5*t.g3_pitch_dia_mm,p=e.stage_mode===`direct_1stage`?l+f:e.stage_mode===`compound_2stage`?l+d:l+u,m=u+f,h=0,g=0,_=0,v=0,y=0,b=0;if(e.layout_mode===`side_by_side`){let t=4*e.module_mm;h=-(l+u+t),_=0,y=u+f+t,g=e.g2_wheel_face_mm,v=0,b=0}else e.stage_mode===`direct_1stage`?(h=-.5*p,y=.5*p,g=0,b=0):e.stage_mode===`compound_2stage`?(h=-p,_=0,y=+m,g=e.g2_wheel_face_mm,v=0,b=0):(h=-p,_=0,y=+m,g=0,v=0,b=0);let x=Math.max(10,Math.min(65,e.spoke_width_pct??26)),S=Math.max(1.5,Math.min(12,e.rim_wall_mm??3.5)),C=Math.max(1,Math.min(12,e.hub_ring_mm??2.5)),w=e.g1_hub_height_mm>.5?.5*e.g1_hub_diameter_mm:.5*e.g1_bore_mm,T=Math.max(e.g1_bore_mm*.75,w+C),E=Qp({teeth:e.g1_teeth,moduleMm:e.module_mm,pressureAngleDeg:e.pressure_angle_deg,helixAngleDeg:e.helix_angle_deg,helixHand:1,backlashMm:e.backlash_mm,faceWidthMm:e.g1_face_width_mm,boreDiaMm:e.g1_bore_mm,dFlatMm:e.g1_d_flat_mm,spokes:e.g1_spokes,spokeWidthPct:x,rimWallMm:S,hubOuterRadiusMm:T,zOffsetMm:0});if(n.push(E.toSubMesh({id:`gear1-rim`,gear_index:1,label:`Gear 1 · Rotor Spoked Wheel (${e.g1_teeth}T)`,color_hex:9427382,metalness:.18,roughness:.36,center_x_mm:h,center_y_mm:0,base_z_mm:g,mesh_phase_rad:0,spin_ratio:1})),e.g1_hub_height_mm>.5){let t=$p({boreDiaMm:e.g1_bore_mm,dFlatMm:e.g1_d_flat_mm,hubDiaMm:e.g1_hub_diameter_mm,hubHeightMm:e.g1_hub_height_mm,zBaseMm:e.g1_face_width_mm});n.push(t.toSubMesh({id:`gear1-hub-boss`,gear_index:1,label:`Gear 1 · Stepped Rotor Hub Boss`,color_hex:14242598,metalness:.25,roughness:.32,center_x_mm:h,center_y_mm:0,base_z_mm:g,mesh_phase_rad:0,spin_ratio:1}))}let D=0;if(e.stage_mode!==`direct_1stage`){let r=-s,o=e.stage_mode===`compound_2stage`?a:i;D=o%2==0?Math.PI/o:0;let c=Math.max(e.g2_bore_mm*.75,.5*t.g2_pinion_outer_dia_mm+C),l=Qp({teeth:e.g2_wheel_teeth,moduleMm:e.module_mm,pressureAngleDeg:e.pressure_angle_deg,helixAngleDeg:e.helix_angle_deg,helixHand:-1,backlashMm:e.backlash_mm,faceWidthMm:e.g2_wheel_face_mm,boreDiaMm:e.g2_bore_mm,dFlatMm:e.g2_d_flat_mm,spokes:e.g2_spokes??0,spokeWidthPct:x,rimWallMm:S,hubOuterRadiusMm:c,zOffsetMm:0});n.push(l.toSubMesh({id:`gear2-wheel`,gear_index:2,label:`Gear 2 · Compound Wheel (${e.g2_wheel_teeth}T)`,color_hex:12077985,metalness:.2,roughness:.38,center_x_mm:_,center_y_mm:0,base_z_mm:v,mesh_phase_rad:D,spin_ratio:r}));let u=Qp({teeth:e.g2_pinion_teeth,moduleMm:e.module_mm,pressureAngleDeg:e.pressure_angle_deg,helixAngleDeg:e.helix_angle_deg,helixHand:-1,backlashMm:e.backlash_mm,faceWidthMm:e.g2_pinion_face_mm,boreDiaMm:e.g2_bore_mm,dFlatMm:e.g2_d_flat_mm,spokes:0,hubOuterRadiusMm:e.g2_bore_mm,zOffsetMm:e.g2_wheel_face_mm});n.push(u.toSubMesh({id:`gear2-pinion`,gear_index:2,label:`Gear 2 · Coaxial Helical Pinion (${e.g2_pinion_teeth}T)`,color_hex:7521365,metalness:.22,roughness:.34,center_x_mm:_,center_y_mm:0,base_z_mm:v,mesh_phase_rad:D,spin_ratio:r}));let f=$p({boreDiaMm:e.g2_bore_mm,dFlatMm:e.g2_d_flat_mm,hubDiaMm:Math.max(e.g2_bore_mm+3,2*d*.62),hubHeightMm:2.2,zBaseMm:e.g2_wheel_face_mm+e.g2_pinion_face_mm});n.push(f.toSubMesh({id:`gear2-collar`,gear_index:2,label:`Gear 2 · Pinion Collar`,color_hex:7521365,metalness:.22,roughness:.34,center_x_mm:_,center_y_mm:0,base_z_mm:v,mesh_phase_rad:D,spin_ratio:r}))}let O=e.stage_mode===`direct_1stage`?-c:+c,k=o%2==0?Math.PI/o:0,A=e.stage_mode===`direct_1stage`?k:k-i/o*D,j=e.stage_mode===`direct_1stage`||e.g3_helix_hand===-1?-1:1,M=Qp({teeth:e.g3_teeth,moduleMm:e.module_mm,pressureAngleDeg:e.pressure_angle_deg,helixAngleDeg:e.helix_angle_deg,helixHand:j,backlashMm:e.backlash_mm,faceWidthMm:e.g3_face_width_mm,boreDiaMm:e.g3_bore_mm,dFlatMm:e.g3_d_flat_mm,spokes:0,hubOuterRadiusMm:e.g3_bore_mm,zOffsetMm:0});if(n.push(M.toSubMesh({id:`gear3-pinion`,gear_index:3,label:`Gear 3 · Generator Pinion (${e.g3_teeth}T)`,color_hex:7177096,metalness:.28,roughness:.35,center_x_mm:y,center_y_mm:0,base_z_mm:b,mesh_phase_rad:A,spin_ratio:O})),e.g3_boss_height_mm>.5){let t=$p({boreDiaMm:e.g3_bore_mm,dFlatMm:e.g3_d_flat_mm,hubDiaMm:Math.max(e.g3_bore_mm+3.2,2*f*.42),hubHeightMm:e.g3_boss_height_mm,zBaseMm:e.g3_face_width_mm});n.push(t.toSubMesh({id:`gear3-boss`,gear_index:3,label:`Gear 3 · Motor Shaft Boss`,color_hex:7177096,metalness:.28,roughness:.35,center_x_mm:y,center_y_mm:0,base_z_mm:b,mesh_phase_rad:A,spin_ratio:O}))}return{metrics:t,submeshes:n,total_triangles:n.reduce((e,t)=>e+t.indices.length/3,0)}}function tm(e,t){let n=em({...e,layout_mode:`side_by_side`}),r=n.submeshes.filter(e=>t===`all`?!0:t===`gear1`?e.gear_index===1:t===`gear2`?e.gear_index===2:e.gear_index===3),i=r.reduce((e,t)=>e+t.indices.length/3,0),a=new ArrayBuffer(84+i*50),o=new DataView(a),s=`BladeLab Gearbox STL (${t}) G=${n.metrics.total_ratio}:1 m=${e.module_mm}mm`;for(let e=0;e<Math.min(79,s.length);e++)o.setUint8(e,s.charCodeAt(e));o.setUint32(80,i,!0);let c=84;for(let e of r){let n=t===`all`?e.center_x_mm:0,r=t===`all`?e.center_y_mm:0,i=e.positions,a=e.indices;for(let e=0;e<a.length;e+=3){let t=a[e]*3,s=a[e+1]*3,l=a[e+2]*3,u=i[t]+n,d=i[t+1]+r,f=i[t+2]+0,p=i[s]+n,m=i[s+1]+r,h=i[s+2]+0,g=i[l]+n,_=i[l+1]+r,v=i[l+2]+0,y=p-u,b=m-d,x=h-f,S=g-u,C=_-d,w=v-f,T=b*w-x*C,E=x*S-y*w,D=y*C-b*S,O=Math.hypot(T,E,D);O>1e-12?(T/=O,E/=O,D/=O):D=1,o.setFloat32(c,T,!0),o.setFloat32(c+4,E,!0),o.setFloat32(c+8,D,!0),o.setFloat32(c+12,u,!0),o.setFloat32(c+16,d,!0),o.setFloat32(c+20,f,!0),o.setFloat32(c+24,p,!0),o.setFloat32(c+28,m,!0),o.setFloat32(c+32,h,!0),o.setFloat32(c+36,g,!0),o.setFloat32(c+40,_,!0),o.setFloat32(c+44,v,!0),o.setUint16(c+48,0,!0),c+=50}}return new Uint8Array(a)}function nm(e,t=`BladeLab STL Model`){let n=Math.floor(e.length/9),r=new ArrayBuffer(84+n*50),i=new DataView(r);for(let e=0;e<Math.min(79,t.length);e++)i.setUint8(e,t.charCodeAt(e));i.setUint32(80,n,!0);let a=84;for(let t=0;t<n;t++){let n=Number(e[t*9])||0,r=Number(e[t*9+1])||0,o=Number(e[t*9+2])||0,s=Number(e[t*9+3])||0,c=Number(e[t*9+4])||0,l=Number(e[t*9+5])||0,u=Number(e[t*9+6])||0,d=Number(e[t*9+7])||0,f=Number(e[t*9+8])||0,p=s-n,m=c-r,h=l-o,g=u-n,_=d-r,v=f-o,y=m*v-h*_,b=h*g-p*v,x=p*_-m*g,S=Math.hypot(y,b,x);S>1e-12?(y/=S,b/=S,x/=S):x=1,i.setFloat32(a,y,!0),i.setFloat32(a+4,b,!0),i.setFloat32(a+8,x,!0),i.setFloat32(a+12,n,!0),i.setFloat32(a+16,r,!0),i.setFloat32(a+20,o,!0),i.setFloat32(a+24,s,!0),i.setFloat32(a+28,c,!0),i.setFloat32(a+32,l,!0),i.setFloat32(a+36,u,!0),i.setFloat32(a+40,d,!0),i.setFloat32(a+44,f,!0),i.setUint16(a+48,0,!0),a+=50}return new Uint8Array(r)}var rm=`bladelab.github_token`,im=`[BladeLab] `,am=`bladelab-design.json`;function om(e){let t=(e||``).trim();if(!t)return``;let n=/[?&]gist=([^&#\s]+)/i.exec(t);if(n&&n[1])try{t=decodeURIComponent(n[1]).trim()}catch{t=n[1].trim()}let r=/gist\.githubusercontent\.com\/[^/\s]+\/([a-f0-9]+)/i.exec(t);if(r&&r[1])return r[1];let i=/api\.github\.com\/gists\/([a-f0-9]+)/i.exec(t);if(i&&i[1])return i[1];let a=/gist\.github\.com\/(?:[^/\s]+\/)?([a-f0-9]+)/i.exec(t);if(a&&a[1])return a[1];let o=t.split(/[?#]/)[0].replace(/\/+$/,``);return(o.split(`/`).pop()||o).trim()}function sm(){try{let e=localStorage.getItem(rm);return e?e.trim():null}catch{return null}}function cm(e){try{e&&e.trim().length>0?localStorage.setItem(rm,e.trim()):localStorage.removeItem(rm)}catch{}}var lm=class extends Error{status;constructor(e,t){super(t),this.name=`GitHubAuthError`,this.status=e}};async function um(e){let t=await fetch(`https://api.github.com/user`,{headers:{Accept:`application/vnd.github+json`,Authorization:`Bearer ${e.trim()}`,"X-GitHub-Api-Version":`2022-11-28`}});if(!t.ok)throw t.status===401?new lm(401,`Invalid GitHub token. Please verify token permissions (needs 'gist' scope).`):Error(`GitHub API error: ${t.status} ${t.statusText}`);let n=await t.json();return{login:n.login,name:n.name,avatar_url:n.avatar_url,html_url:n.html_url}}async function dm(e){let t=await fetch(`https://api.github.com/gists?per_page=100`,{headers:{Accept:`application/vnd.github+json`,Authorization:`Bearer ${e.trim()}`,"X-GitHub-Api-Version":`2022-11-28`}});if(!t.ok)throw Error(`Failed to list Gists: ${t.status} ${t.statusText}`);let n=await t.json(),r=[];for(let e of n){let t=e.description||``,n=!!(e.files&&e.files[`bladelab-design.json`]),i=t.startsWith(im);if(n||i){let i=t;i.startsWith(`[BladeLab] `)&&(i=i.slice(11).trim()),!i&&n&&(i=`Design-${e.id.slice(0,7)}`),r.push({id:e.id,name:i||`Untitled Blade`,description:t,updated_at:e.updated_at,created_at:e.created_at,html_url:e.html_url,is_public:e.public,raw_url:e.files[am]?.raw_url})}}return r}async function fm(e,t,n,r=!1,i){let a=`${im}${t.trim()||`Rotor-R${n.design.rotor.radius_mm}-B${n.design.rotor.blade_count}`}`,o=JSON.stringify(n,null,2),s={description:a,files:{[am]:{content:o}}},c=i?om(i):void 0,l=c?`https://api.github.com/gists/${encodeURIComponent(c)}`:`https://api.github.com/gists`,u=c?`PATCH`:`POST`;c||(s.public=r);let d=await fetch(l,{method:u,headers:{Accept:`application/vnd.github+json`,Authorization:`Bearer ${e.trim()}`,"Content-Type":`application/json`,"X-GitHub-Api-Version":`2022-11-28`},body:JSON.stringify(s)});if(!d.ok){let e=await d.text().catch(()=>``);throw Error(`Failed to save Gist (${d.status}): ${e||d.statusText}`)}let f=await d.json();return{id:f.id,html_url:f.html_url,description:f.description}}async function pm(e,t){let n=om(e);if(!n)throw Error(`Please provide a valid GitHub Gist ID or URL.`);let r=e=>{let t={Accept:`application/vnd.github+json`,"X-GitHub-Api-Version":`2022-11-28`};return e&&e.trim()&&(t.Authorization=`Bearer ${e.trim()}`),t},i=`https://api.github.com/gists/${encodeURIComponent(n)}`,a=await fetch(i,{headers:r(t)});if(!a.ok&&(a.status===401||a.status===403)&&t&&(console.warn(`GitHub Gist request failed with token auth, retrying anonymously:`,a.status),a=await fetch(i,{headers:r(null)})),!a.ok)throw a.status===404?Error(`Gist not found (${n}). Make sure the Gist ID or link is correct and public.`):a.status===403?Error(`GitHub API rate limit exceeded. Please wait a few minutes or add a GitHub Personal Access Token.`):Error(`GitHub error loading Gist (${a.status}): ${a.statusText}`);let o=await a.json(),s=async e=>{if(!e)return null;if(!e.truncated&&e.content&&e.content.trim().length>0)return e.content;if(e.raw_url){let t=await fetch(e.raw_url);if(t.ok){let e=await t.text();if(e.trim().length>0)return e}}return e.content&&e.content.trim().length>0?e.content:null},c=null;if(o.files&&o.files[`bladelab-design.json`]&&(c=await s(o.files[am])),!c&&o.files)for(let e of Object.keys(o.files)){let t=o.files[e];if(t&&(e.endsWith(`.json`)||e.toLowerCase().includes(`bladelab`))&&(c=await s(t),c))break}if(!c&&o.files)for(let e of Object.values(o.files)){let t=await s(e);if(t&&t.trim().startsWith(`{`)){c=t;break}}if(!c)throw Error(`No JSON design file found in Gist ${n}.`);let l=Sp(c),u=o.description||``;return u.startsWith(`[BladeLab] `)&&(u=u.slice(11).trim()),u||=`Gist-${n.slice(0,7)}`,{name:u,snapshot:l,html_url:o.html_url}}async function mm(e,t){let n=om(t),r=await fetch(`https://api.github.com/gists/${encodeURIComponent(n)}`,{method:`DELETE`,headers:{Accept:`application/vnd.github+json`,Authorization:`Bearer ${e.trim()}`,"X-GitHub-Api-Version":`2022-11-28`}});if(!r.ok)throw Error(`Failed to delete Gist (${r.status}): ${r.statusText}`)}function hm(e){if(typeof window<`u`&&window.location){let t=new URL(window.location.href);return t.searchParams.set(`gist`,e.trim()),t.toString()}return`https://pannawat2008.github.io/BladeLab/?gist=${encodeURIComponent(e.trim())}`}await Qd(fd);var gm=JSON.parse(ef),_m=new op(gm),Z=_m.current(),vm=new Nn;vm.background=new J(592656);var ym=new Qo(48,innerWidth/innerHeight,1,1e4);ym.position.set(420,320,820);var bm=new Bu({antialias:!0});bm.setSize(innerWidth,innerHeight),bm.setPixelRatio(Math.min(devicePixelRatio,2)),bm.toneMapping=4,bm.toneMappingExposure=1.35,document.getElementById(`app`).appendChild(bm.domElement);var xm=new Zs(bm);xm.compileEquirectangularShader();var Sm=new ud;vm.environment=xm.fromScene(Sm,.04).texture,vm.environmentIntensity=.85,Sm.dispose(),xm.dispose();var Cm=new Zu(ym,bm.domElement);Cm.target.set(0,0,120),Cm.enableDamping=!0,Cm.dampingFactor=.08,Cm.update();var wm=new is(16777215,.9);vm.add(wm);var Tm=new Bo(15660287,3686738,1.35);vm.add(Tm);var Em=new rs(16777215,1.85);Em.position.set(220,340,380),vm.add(Em);var Dm=new rs(14412542,1.2);Dm.position.set(-240,-190,-260),vm.add(Dm);var Om=new rs(16708551,.95);Om.position.set(-160,240,-360),vm.add(Om);function km(e){let t=Math.max(.1,e);bm.toneMappingExposure=1.05*t,vm.environmentIntensity=.65*t,wm.intensity=.7*t,Tm.intensity=1*t,Em.intensity=1.4*t,Dm.intensity=.9*t,Om.intensity=.7*t}km(1.35);var Am=new Es(1800,36,9684477,14209990);Am.position.y=-120,vm.add(Am);var jm=typeof localStorage<`u`&&localStorage.getItem(`bladelab:ui-style:v1`)===`dark`?`dark`:`atelier`,Mm=1,Nm=!1,Pm=`layer1-distributions`;function Fm(e){let t=e===`atelier`;vm.background=new J(t?16052972:592656),vm.remove(Am),Am.geometry.dispose(),Array.isArray(Am.material)?Am.material.forEach(e=>e.dispose()):Am.material.dispose(),Am=new Es(1800,36,t?9684477:2897480,t?14209990:1580843),Am.position.y=-120,vm.add(Am)}function Im(){if(innerWidth>1180){if(Dy===`nose`){if(Uy?.classList.contains(`open`)){let e=jm===`atelier`?201:-197;ym.setViewOffset(innerWidth,innerHeight,e,0,innerWidth,innerHeight)}else ym.clearViewOffset();return}if(jm===`atelier`&&Dy===`blade`&&document.body.getAttribute(`data-studio-mode`)!==`gearbox`&&!document.body.classList.contains(`studio-gearbox-mode`)&&!Nm){let e=innerWidth<=1359?344:376,t=Math.round((e+10)/2);ym.setViewOffset(innerWidth,innerHeight,t,0,innerWidth,innerHeight);return}}ym.clearViewOffset()}var Lm=document.getElementById(`btn-undo`),Rm=document.getElementById(`btn-redo`),zm=document.getElementById(`btn-reset`),Bm=document.getElementById(`btn-clear-overrides`),Vm=document.getElementById(`btn-view-single`),Hm=document.getElementById(`btn-view-rotor`),Um=document.getElementById(`btn-view-gearbox`),Wm=document.getElementById(`btn-view-wireframe`),Gm=document.getElementById(`btn-view-spin`),Km=document.getElementById(`btn-cam-iso`),qm=document.getElementById(`btn-cam-top`),Jm=document.getElementById(`btn-cam-tip`),Ym=document.getElementById(`btn-export-main`),Xm=document.getElementById(`btn-style-atelier`),Zm=document.getElementById(`btn-style-dark`),Qm=document.getElementById(`atelier-hud-spec`),$m=document.getElementById(`atelier-hud-cp`),eh=document.getElementById(`atelier-hud-power`),th=document.getElementById(`atelier-hud-ms`),nh=document.getElementById(`atelier-wizard-header`),rh=document.getElementById(`atelier-wizard-footer`),ih=document.getElementById(`atelier-step-title`),ah=document.getElementById(`atelier-wizard-progress`),oh=document.getElementById(`btn-wizard-prev`),sh=document.getElementById(`btn-wizard-next`),ch=document.querySelectorAll(`#atelier-wizard-steps button[data-wizard-step]`),lh=document.getElementById(`export-dropdown-menu`),uh=document.getElementById(`export-part`),dh=document.getElementById(`btn-export-stl`),fh=document.getElementById(`btn-export-3mf`),ph=document.getElementById(`btn-export-step`),mh=document.getElementById(`btn-export-split-step`),hh=document.getElementById(`btn-export-split-fab-step`),gh=document.getElementById(`btn-export-json`),_h=document.getElementById(`btn-load-json`),vh=document.getElementById(`input-load-json-file`),yh=document.getElementById(`autosave-badge`),bh=document.getElementById(`export-status`),xh=document.getElementById(`btn-toggle-projects`),Sh=document.getElementById(`projects-drawer`),Ch=document.getElementById(`saved-slots-count`),wh=document.getElementById(`autosave-detail`),Th=document.getElementById(`slot-name-input`),Eh=document.getElementById(`btn-save-slot`),Dh=document.getElementById(`btn-drawer-load-json`),Oh=document.getElementById(`btn-drawer-save-json`),kh=document.getElementById(`saved-slots-list`),Ah=document.getElementById(`rotor-summary`),jh=document.getElementById(`rotor-radius`),Mh=document.getElementById(`rotor-hub-radius`),Nh=document.getElementById(`rotor-blades`),Ph=document.getElementById(`rotor-radius-slider`),Fh=document.getElementById(`rotor-hub-slider`),Ih=document.getElementById(`rotor-blades-slider`),Lh=document.getElementById(`rotor-tsr`),Rh=document.getElementById(`rotor-wind`),zh=document.getElementById(`rotor-stations`),Bh=document.getElementById(`rotor-blade-length`),Vh=document.getElementById(`rotor-pitch-axis`),Hh=document.getElementById(`rotor-length-slider`),Uh=document.getElementById(`blade-length-val`),Wh=document.getElementById(`hud-mesh-ms`),Gh=document.getElementById(`chord-offset-x`),Kh=document.getElementById(`chord-offset-x-val`),qh=document.getElementById(`chord-offset-y`),Jh=document.getElementById(`chord-offset-y-val`),Yh=document.getElementById(`global-light-intensity`),Xh=document.getElementById(`global-light-val`),Zh=document.getElementById(`tb-collective-pitch`),Qh=document.getElementById(`tb-pitch-val`),$h=document.getElementById(`btn-pitch-feather`),eg=document.getElementById(`rotor-collective-pitch`),tg=document.getElementById(`rotor-collective-pitch-val`),ng=document.getElementById(`collective-pitch-badge`),rg=document.getElementById(`btn-pitch-run`),ig=document.getElementById(`btn-pitch-start`),ag=document.getElementById(`btn-pitch-feather-panel`),og=document.getElementById(`btn-flip-blade`),sg=document.getElementById(`btn-flip-blade-panel`),cg=0,lg=!0,ug=document.getElementById(`winglet-enabled`),dg=document.getElementById(`winglet-controls-subbox`),fg=document.getElementById(`winglet-cant`),pg=document.getElementById(`winglet-height`),mg=document.getElementById(`winglet-sweep`),hg=document.getElementById(`winglet-radius`),gg=document.getElementById(`btn-chord-minus`),_g=document.getElementById(`btn-chord-plus`),vg=document.getElementById(`btn-chord-narrow`),yg=document.getElementById(`btn-chord-widen`),bg=document.getElementById(`airfoil-family`),xg=document.getElementById(`naca4-controls`),Sg=document.getElementById(`airfoil-thickness`),Cg=document.getElementById(`airfoil-camber`),wg=document.getElementById(`airfoil-preview-svg`),Tg=document.getElementById(`planform-linear`),Eg=document.getElementById(`planform-cosine`),Dg=document.getElementById(`planform-center`),Og=document.getElementById(`planform-width`),kg=document.getElementById(`planform-center-val`),Ag=document.getElementById(`planform-width-val`),jg=document.getElementById(`planform-badge`),Mg=document.querySelector(`.planform-card`),Ng=document.getElementById(`planform-zone-bar`),Pg=document.getElementById(`planform-zone-ranges`),Fg=document.getElementById(`planform-pin`),Ig=document.getElementById(`planform-pin-text`),Lg=document.getElementById(`btn-planform-unpin`),Rg=Array.from(document.querySelectorAll(`.sec-tab`)),zg=document.getElementById(`sec-role`),Bg=document.getElementById(`sec-airfoil`),Vg=document.getElementById(`sec-chord`),Hg=document.getElementById(`sec-chord-num`),Ug=document.getElementById(`sec-twist`),Wg=document.getElementById(`sec-twist-num`),Gg=document.getElementById(`sec-thick`),Kg=document.getElementById(`sec-thick-num`),qg=document.getElementById(`sec-note`),Jg=document.getElementById(`sec-stack`),Yg=document.getElementById(`mode-linear`),Xg=document.getElementById(`mode-schmitz`),Zg=document.getElementById(`mode-bezier`),Qg=document.getElementById(`mode-formula`),$g=document.getElementById(`controls-linear`),e_=document.getElementById(`controls-schmitz`),t_=document.getElementById(`controls-bezier`),n_=document.getElementById(`controls-formula`),r_=document.getElementById(`bind-taper`),i_=document.getElementById(`taper-ratio`),a_=document.getElementById(`root-chord`),o_=document.getElementById(`root-twist`),s_=document.getElementById(`twist`),c_=document.getElementById(`chord`),l_=document.getElementById(`twist-val`),u_=document.getElementById(`chord-val`),d_=document.getElementById(`schmitz-cl`),f_=document.getElementById(`schmitz-alpha`),p_=document.getElementById(`bezier-target-chord`),m_=document.getElementById(`bezier-target-twist`),h_=document.getElementById(`bezier-svg`),g_=document.getElementById(`bezier-points-body`),__=document.getElementById(`formula-chord`),v_=document.getElementById(`formula-twist`),y_=document.getElementById(`fab-summary`),b_=document.getElementById(`spar-hole-enabled`),x_=document.getElementById(`spar-show-rod`),S_=document.getElementById(`btn-cf-4`),C_=document.getElementById(`btn-cf-5`),w_=document.getElementById(`btn-cf-6`),T_=document.getElementById(`btn-cf-8`),E_=document.getElementById(`btn-spar-full-span`),D_=document.getElementById(`spar-hole-diameter`),O_=document.getElementById(`spar-hole-depth`),k_=document.getElementById(`spar-hole-offset-x`),A_=document.getElementById(`spar-hole-offset-y`),j_=document.getElementById(`spar-hole-depth-slider`),M_=document.getElementById(`spar-hole-depth-val`),N_=document.getElementById(`spar-hole-status`),P_=document.getElementById(`split-parts`),F_=document.getElementById(`split-active-part`),I_=document.getElementById(`split-ratio-slider`),L_=document.getElementById(`split-ratio-val`),R_=document.getElementById(`split-explode-gap`),z_=document.getElementById(`split-explode-val`),B_=document.getElementById(`btn-export-split-all`),V_=document.getElementById(`btn-export-split-all-step`),H_=document.getElementById(`btn-export-split-all-fab-step`),U_=document.getElementById(`spar-hole-tolerance`),W_=document.getElementById(`align-shape`),G_=document.getElementById(`align-count`),K_=document.getElementById(`align-size`),q_=document.getElementById(`align-key-length`),J_=document.getElementById(`align-height`),Y_=document.getElementById(`align-spacing`),X_=document.getElementById(`align-clearance`),Z_=document.getElementById(`align-depth-clearance`),Q_=document.getElementById(`align-min-wall`),$_=document.getElementById(`btn-fit-tight`),ev=document.getElementById(`btn-fit-standard`),tv=document.getElementById(`btn-fit-loose`),nv=document.getElementById(`align-status`),rv=document.getElementById(`printer-preset`),iv=document.getElementById(`printer-max-z`),av=document.getElementById(`btn-auto-fit-printer`),ov=document.getElementById(`printer-fit-status`),sv=document.getElementById(`heatmap-mode`),cv=document.getElementById(`viewport-heatmap-legend`),lv=document.getElementById(`heatmap-legend-title`),uv=document.getElementById(`heatmap-legend-min`),dv=document.getElementById(`heatmap-legend-bar`),fv=document.getElementById(`heatmap-legend-max`),pv=document.getElementById(`station-table-body`),mv=document.getElementById(`error-banner`),hv=document.getElementById(`aero-summary`),gv=document.getElementById(`kpi-cp`),_v=document.getElementById(`kpi-betz-pct`),vv=document.getElementById(`kpi-betz-bar`),yv=document.getElementById(`kpi-peak-cp`),bv=document.getElementById(`kpi-power`),xv=document.getElementById(`kpi-gen-elec`),Sv=document.getElementById(`hud-rotor-spec`),Cv=document.getElementById(`cp-tsr-svg`),wv=document.getElementById(`cp-tsr-hover-readout`),Tv=document.getElementById(`bem-sec-meta`),Ev=document.getElementById(`opt-objective`),Dv=document.getElementById(`btn-auto-optimize`),Ov=document.getElementById(`opt-status`),kv=document.getElementById(`btn-snapshot-a`),Av=document.getElementById(`btn-clear-a`),jv=document.getElementById(`ab-delta-summary`),Mv=document.getElementById(`btn-preset-low-wind`),Nv=document.getElementById(`btn-preset-kidwind`),Pv=document.getElementById(`btn-preset-scimitar`),Fv=document.getElementById(`btn-preset-high-wind`),Iv=document.getElementById(`btn-preset-ref`),Lv=document.getElementById(`blade-preset-desc`),Rv=document.getElementById(`gen-preset`),zv=document.getElementById(`gen-kv`),Bv=document.getElementById(`gen-r-int`),Vv=document.getElementById(`gen-gear-ratio`),Hv=document.getElementById(`gen-r-load`),Uv=document.getElementById(`btn-gear-1`),Wv=document.getElementById(`btn-gear-2`),Gv=document.getElementById(`btn-gear-3`),Kv=document.getElementById(`btn-gear-4`),qv=document.getElementById(`gen-summary`),Jv=document.getElementById(`gen-opt-target`),Yv=document.getElementById(`gen-regime-badge`),Xv=document.getElementById(`btn-max-out-drivetrain`),Zv=document.getElementById(`btn-match-load-only`),Qv=document.getElementById(`gen-maxout-guide`),$v=document.getElementById(`site-avg-wind`),ey=document.getElementById(`aep-cutin-badge`),ty=document.getElementById(`kpi-aep-kwh`),ny=document.getElementById(`wind-power-svg`),ry=document.getElementById(`wind-power-hover-readout`),iy=document.getElementById(`aep-summary`),ay=document.getElementById(`struct-material`),oy=document.getElementById(`struct-sec-meta`),sy=document.getElementById(`struct-root-moment`),cy=document.getElementById(`struct-tip-defl`),ly=document.getElementById(`struct-sf`),uy=document.getElementById(`struct-mass-pull`),dy=document.getElementById(`struct-status`),fy=document.getElementById(`exp-data-input`),py=document.getElementById(`exp-fit-summary`),my=document.getElementById(`exp-sec-meta`),hy=document.getElementById(`sections-summary`),gy=`chord_mm`,_y=!1,vy=`root`,yy=`schmitz_600`,by=[],xy=null,Sy=null,Cy=null,wy=null,Ty=null,Ey=`rotor`,Dy=`blade`,Oy=null,ky=null,Ay=!1,jy=!1,My=0,Ny=`adaptive`,Py=`saddle`,Fy=`mounted`,Iy=!1,Ly=0,Ry=tf(),zy={blade_count:3,hub_diameter_mm:60,hub_length_mm:20,hub_bore_mm:5.3,root_chord_mm:70,root_twist_deg:20,collective_pitch_deg:0},By=document.getElementById(`tab-studio-blade`),Vy=document.getElementById(`tab-studio-nose`),Hy=document.getElementById(`tab-studio-gearbox`),Uy=document.getElementById(`nosecone-inspector`),Wy=document.getElementById(`btn-close-nose-inspector`),Gy=document.getElementById(`btn-toggle-nose-inspector`),Ky=document.getElementById(`nose-summary`),qy=document.getElementById(`nose-preview-canvas`),Jy=document.getElementById(`nose-enabled`),Yy=document.getElementById(`nose-hub-fit`),Xy=document.getElementById(`nose-profile-tabs`),Zy=document.getElementById(`nose-wrap-tabs`),Qy=document.getElementById(`nose-slide`),$y=document.getElementById(`nose-slide-label`),eb=document.getElementById(`nose-slide-val`),tb=document.getElementById(`nose-length`),nb=document.getElementById(`nose-length-val`),rb=document.getElementById(`nose-skirt`),ib=document.getElementById(`nose-skirt-val`),ab=document.getElementById(`nose-wall`),ob=document.getElementById(`nose-wall-val`),sb=document.getElementById(`nose-gap`),cb=document.getElementById(`nose-gap-val`),lb=document.getElementById(`nose-trefoil-tol`),ub=document.getElementById(`nose-trefoil-tol-val`),db=document.getElementById(`nose-kpi-cd`),fb=document.getElementById(`nose-kpi-boost`),pb=document.getElementById(`nose-kpi-mass`),mb=document.getElementById(`nose-kpi-hardware`),hb=document.getElementById(`nose-fit-note`),gb=document.getElementById(`btn-nose-view-mounted`),_b=document.getElementById(`btn-nose-view-only`),vb=document.getElementById(`btn-nose-view-rear`),yb=document.getElementById(`btn-nose-cutaway`),bb=document.getElementById(`btn-tb-nose-spin`),xb=document.getElementById(`btn-tb-nose-export`),Sb=document.getElementById(`btn-export-nose-stl`),Cb=document.getElementById(`btn-export-nose-cuff-stl`),wb=document.getElementById(`btn-export-nose-menu`),Tb=document.getElementById(`gearbox-inspector`),Eb=document.getElementById(`btn-close-gearbox-inspector`),Db=document.getElementById(`btn-toggle-gearbox-inspector`),Ob=document.getElementById(`gear-inspector-active-badge`),kb=document.getElementById(`btn-select-gear-train`),Ab=document.getElementById(`btn-select-gear-g1`),jb=document.getElementById(`btn-select-gear-g2`),Mb=document.getElementById(`btn-select-gear-g3`),Nb=document.getElementById(`btn-tb-gear-layout-side`),Pb=document.getElementById(`btn-tb-gear-layout-mesh`),Fb=document.getElementById(`btn-tb-gear-spin`),Ib=document.getElementById(`btn-tb-gear-export-all`),Lb=document.getElementById(`gearbox-summary`),Rb=document.getElementById(`btn-gearbox-3d-view`),zb=document.getElementById(`btn-gear-layout-side`),Bb=document.getElementById(`btn-gear-layout-mesh`),Vb=document.getElementById(`gear-tooth-badge`),Hb=document.getElementById(`gear-stage-mode`),Ub=document.getElementById(`gear-module`),Wb=document.getElementById(`gear-helix`),Gb=document.getElementById(`gear-pressure`),Kb=document.getElementById(`gear-backlash`),qb=document.getElementById(`btn-gear-solve-ratio`),Jb=document.getElementById(`btn-gear-sync-aero`),Yb=document.getElementById(`gear-cutout-badge`),Xb=document.getElementById(`gear-spoke-width`),Zb=document.getElementById(`gear-rim-wall`),Qb=document.getElementById(`gear-hub-ring`),$b=document.getElementById(`g1-dia-badge`),ex=document.getElementById(`g1-teeth`),tx=document.getElementById(`g1-face`),nx=document.getElementById(`g1-spokes`),rx=document.getElementById(`g1-bore`),ix=document.getElementById(`g1-dflat`),ax=document.getElementById(`g1-hub-dia`),ox=document.getElementById(`g1-hub-h`),sx=document.getElementById(`gear2-card`),cx=document.getElementById(`g2-dia-badge`),lx=document.getElementById(`g2-wheel-teeth`),ux=document.getElementById(`g2-wheel-face`),dx=document.getElementById(`g2-spokes`),fx=document.getElementById(`g2-pinion-teeth`),px=document.getElementById(`g2-pinion-face`),mx=document.getElementById(`g2-bore`),hx=document.getElementById(`g2-dflat`),gx=document.getElementById(`g3-dia-badge`),_x=document.getElementById(`g3-teeth`),vx=document.getElementById(`g3-face`),yx=document.getElementById(`g3-bore`),bx=document.getElementById(`g3-dflat`),xx=document.getElementById(`g3-boss-h`),Sx=document.getElementById(`g3-helix-hand`),Cx=document.getElementById(`gearbox-metrics-readout`),wx=document.getElementById(`btn-export-gears-all`),Tx=document.getElementById(`btn-export-gear1`),Ex=document.getElementById(`btn-export-gear2`),Dx=document.getElementById(`btn-export-gear3`),Ox=`side_by_side`;function kx(e){return by.some(t=>Math.abs(t-e)<=yf)}function Ax(e){let t=by.findIndex(t=>Math.abs(t-e)<=yf);t>=0?by.splice(t,1):by.push(e)}function jx(e,t){if(e===void 0||e.trim()===``)return t;let n=Number.parseFloat(e);return Number.isFinite(n)?n:t}function Mx(){return{enabled:!!ug?.checked,cant_angle_deg:Math.max(15,Math.min(75,jx(fg?.value,50))),height_mm:Math.max(5,Math.min(50,jx(pg?.value,22))),sweep_angle_deg:Math.max(0,Math.min(25,jx(mg?.value,10))),blend_radius_mm:Math.max(5,Math.min(40,jx(hg?.value,15)))}}function Nx(e){let t=e||{enabled:!1,cant_angle_deg:50,height_mm:22,sweep_angle_deg:10,blend_radius_mm:15};ug&&(ug.checked=t.enabled),dg&&(dg.style.display=t.enabled?`block`:`none`),fg&&(fg.value=String(t.cant_angle_deg)),pg&&(pg.value=String(t.height_mm)),mg&&(mg.value=String(t.sweep_angle_deg)),hg&&(hg.value=String(t.blend_radius_mm))}function Px(e,t=!0){cg=Math.max(-10,Math.min(35,Math.round(e*2)/2));let n=`${cg>=0?`+`:``}${cg.toFixed(1)}°`;eg&&(eg.value=String(cg),dS(eg)),Zh&&(Zh.value=String(cg),dS(Zh)),tg&&(tg.textContent=n),ng&&(ng.textContent=n),Qh&&(Qh.textContent=n),rg&&rg.classList.toggle(`active`,Math.abs(cg-0)<.2),ig&&ig.classList.toggle(`active`,Math.abs(cg-4)<.2),ag&&ag.classList.toggle(`active`,Math.abs(cg-30)<.2),$h&&$h.classList.toggle(`active`,Math.abs(cg-30)<.2),t&&(rS(Z),$())}function Fx(e,t=!0){lg=e,og&&(og.classList.toggle(`active`,lg),og.setAttribute(`aria-pressed`,String(lg))),sg&&(sg.classList.toggle(`active`,lg),sg.setAttribute(`aria-pressed`,String(lg))),t&&(rS(Z),$())}var Q=null;function Ix(){let e=Gh&&Gh.valueAsNumber||0,t=qh&&qh.valueAsNumber||0;Q&&Q.children.forEach(n=>{if(n.userData.isBladeBranch){let r=n.children[0];r&&r.position.set(e,t,0)}})}function Lx(e,t){let n=b_.checked,r=Math.max(.5,Number.parseFloat(D_.value)||5),i=Math.max(5,Number.parseFloat(O_.value)||240),a=Number.parseFloat(k_.value)||0,o=Number.parseFloat(A_.value)||0,s=Math.max(1,Number.parseInt(P_.value,10)||1),c=Math.max(.12,Math.min(.88,(I_.valueAsNumber||50)/100)),l=R_.valueAsNumber||0,u;if(e!==void 0)u=e===null?void 0:e;else if(F_.value!==`all`){let e=Number.parseInt(F_.value,10);Number.isFinite(e)&&e>=0&&e<s&&(u=e)}let d={};return t&&(d.step_mode=t),n&&(d.spar_hole_diameter_mm=r,d.spar_hole_depth_mm=i,d.spar_hole_offset_x_mm=a,d.spar_hole_offset_y_mm=o,d.spar_hole_tolerance_mm=Math.max(0,Number.parseFloat(U_.value)||0)),s>1&&(d.split_parts=s,d.split_ratio=c,u===void 0?l>0&&(d.explode_gap_mm=l):d.active_part=u,W_.value!==`none`&&(d.align_shape=W_.value,d.align_count=Number.parseInt(G_.value,10)||2,d.align_size_mm=Math.max(1,Number.parseFloat(K_.value)||3),d.align_key_length_mm=Math.max(2,Number.parseFloat(q_.value)||6),d.align_height_mm=Math.max(1,Number.parseFloat(J_.value)||6),d.align_spacing_mm=Math.max(0,Number.parseFloat(Y_.value)||0),d.align_clearance_mm=Math.max(0,Number.parseFloat(X_.value)||0),d.align_depth_clearance_mm=Math.max(0,Number.parseFloat(Z_.value)||0),d.align_min_wall_mm=Math.max(.4,Number.parseFloat(Q_.value)||.8))),JSON.stringify(d)}function Rx(e){let t=Math.max(1,Number.parseInt(P_.value,10)||1),n=W_.value,r=n===`contour`;if(q_.disabled=n!==`key`&&n!==`dovetail`&&n!==`cruciform`&&n!==`tapered`,G_.disabled=r,K_.disabled=r,Y_.disabled=r,n===`none`)nv.textContent=`Alignment / interlocking joints off`,nv.classList.remove(`warn`);else if(t<2)nv.textContent=`Choose 2+ split parts (or click a Joint Preset) to place interlocking joints`;else try{let t=JSON.parse(Cd(JSON.stringify(e),Lx(null))),r=t.filter(e=>e.placed<e.requested),i=t.reduce((e,t)=>e+t.placed,0),a=t.reduce((e,t)=>e+t.requested,0),o={contour:`airfoil contour lip sleeves`,dovetail:`dovetail interlocks`,cruciform:`cruciform (+) interlocks`,snaplock:`3D snap-lock joints`,tapered:`tapered wedge locks`,key:`keys`,round:`dowel pins`}[n]??`joints`,s=t[0],c=s?` / height ${s.pin_height_mm.toFixed(1)} mm, socket depth ${s.socket_depth_mm.toFixed(1)} mm`:``;nv.textContent=r.length>0?`Warning: only ${i}/${a} ${o} fit (${r.map(e=>`r=${e.span_mm.toFixed(0)} mm`).join(`, `)}). Reduce size, clearance or min wall${c}`:`${i}/${a} ${o} placed on ${t.length} split face(s)${c}`,nv.classList.toggle(`warn`,r.length>0)}catch(e){nv.textContent=`Alignment plan error: ${String(e)}`}}function zx(e){let t=Of(e)[0]?.effective_chord_mm??70,n=e.airfoils[0]?.airfoil,r=.12;n&&(n.type===`naca4`?r=n.thickness_ratio:n.name===`SG6043`?r=.1:n.name===`SD7062`?r=.14:n.name===`E387`?r=.091:n.name===`S833`&&(r=.18));let i=t*r,a=.76*i,o=b_.checked,s=Number.parseFloat(D_.value)||5,c=Math.min(s,a),l=Number.parseFloat(O_.value)||240,u=Math.max(1,Number.parseInt(P_.value,10)||1),d=(I_.valueAsNumber||50)/100,f=e.rotor.hub_radius_mm+d*(e.rotor.radius_mm-e.rotor.hub_radius_mm);if(L_.textContent=`${Math.round(d*100)}% (r=${f.toFixed(0)} mm)`,z_.textContent=`${R_.valueAsNumber||0} mm`,M_.textContent=`${l.toFixed(0)} mm`,o){let e=s>a+.05?` (clamped to safe Ø${c.toFixed(1)} mm)`:``;N_.textContent=`Root thickness ${i.toFixed(1)} mm (max safe Ø${a.toFixed(1)} mm) / Bore Ø${c.toFixed(1)} × ${l.toFixed(0)} mm${e}`}else N_.textContent=`Root thickness ${i.toFixed(1)} mm (max safe Ø${a.toFixed(1)} mm) / Base hole off`;y_.textContent=`${o?`CF Ø${c.toFixed(1)}×${l.toFixed(0)}mm`:`Solid`} / ${u>1?`${u} Parts`:`1 Part`}${u>1&&W_.value!==`none`?{contour:` / Contour Lip`,dovetail:` / Dovetail Lock`,cruciform:` / Cruciform +`,snaplock:` / 3D Snap-Lock`,tapered:` / Taper Wedge`,key:` / Keys`,round:` / Pins`}[W_.value]??` / Joint`:``}`,Rx(e),Bx(e);let p=u>1&&W_.value!==`none`;wg.innerHTML=mp(e,o||p?{diameterMm:o?s:0,offsetXMm:Number.parseFloat(k_.value)||0,offsetYMm:Number.parseFloat(A_.value)||0,jointShape:p?W_.value:`none`,jointCount:Number.parseInt(G_.value,10)||2,jointSizeMm:Number.parseFloat(K_.value)||3,jointLengthMm:Number.parseFloat(q_.value)||6}:void 0,jm)}function Bx(e){let t=rv.value||`bambu_256`;if(t!==`custom`){let e=Lp[t];e&&(iv.value=String(e.max_z_mm))}let n=Number.parseFloat(iv.value)||256,r=Rp(e,CS(),t,n);ov.textContent=r.summary,ov.classList.toggle(`ok`,r.all_fit),ov.classList.toggle(`warn`,!r.all_fit),av.disabled=r.all_fit}function Vx(e,t,n=32){let r=e.length/3|0,i=t.length/3|0,a=new Float32Array(i*3),o=new Float32Array(i*3),s=Array.from({length:r},()=>[]);for(let n=0;n<i;n++){let r=t[3*n],i=t[3*n+1],c=t[3*n+2];s[r]?.push(n),s[i]?.push(n),s[c]?.push(n);let l=e[3*r],u=e[3*r+1],d=e[3*r+2],f=e[3*i],p=e[3*i+1],m=e[3*i+2],h=e[3*c],g=e[3*c+1],_=e[3*c+2],v=f-l,y=p-u,b=m-d,x=h-l,S=g-u,C=_-d,w=y*C-b*S,T=b*x-v*C,E=v*S-y*x,D=Math.hypot(w,T,E);o[3*n]=w,o[3*n+1]=T,o[3*n+2]=E,D>1e-12&&(a[3*n]=w/D,a[3*n+1]=T/D,a[3*n+2]=E/D)}let c=Math.cos(n*Math.PI/180),l=new Float32Array(i*9),u=new Float32Array(i*9);for(let n=0;n<i;n++){let r=a[3*n],i=a[3*n+1],d=a[3*n+2];for(let f=0;f<3;f++){let p=t[3*n+f],m=9*n+3*f;l[m]=e[3*p],l[m+1]=e[3*p+1],l[m+2]=e[3*p+2];let h=0,g=0,_=0,v=s[p];for(let e=0;e<v.length;e++){let t=v[e],n=a[3*t],s=a[3*t+1],l=a[3*t+2];r*n+i*s+d*l>=c&&(h+=o[3*t],g+=o[3*t+1],_+=o[3*t+2])}let y=Math.hypot(h,g,_);if(y>1e-12)u[m]=h/y,u[m+1]=g/y,u[m+2]=_/y;else{let e=Math.hypot(r,i,d);e>1e-12?(u[m]=r/e,u[m+1]=i/e,u[m+2]=d/e):(u[m]=0,u[m+1]=1,u[m+2]=0)}}}let d=new Dr;return d.setAttribute(`position`,new fr(l,3)),d.setAttribute(`normal`,new fr(u,3)),d}function Hx(){let e=Wp();return{stage_mode:Hb?.value||e.stage_mode,layout_mode:Ox,module_mm:Math.max(.4,Number.parseFloat(Ub?.value||``)||e.module_mm),pressure_angle_deg:Math.max(14.5,Math.min(25,Number.parseFloat(Gb?.value||``)||e.pressure_angle_deg)),helix_angle_deg:Math.max(0,Math.min(35,Number.parseFloat(Wb?.value||`0`)||0)),backlash_mm:Math.max(0,Math.min(.6,Number.parseFloat(Kb?.value||`0`)||0)),spoke_width_pct:Math.max(10,Math.min(65,Number.parseFloat(Xb?.value||``)||e.spoke_width_pct)),rim_wall_mm:Math.max(1.5,Math.min(12,Number.parseFloat(Zb?.value||``)||e.rim_wall_mm)),hub_ring_mm:Math.max(1,Math.min(12,Number.parseFloat(Qb?.value||``)||e.hub_ring_mm)),g1_teeth:Math.max(10,Math.round(Number.parseFloat(ex?.value||``)||e.g1_teeth)),g1_face_width_mm:Math.max(2,Number.parseFloat(tx?.value||``)||e.g1_face_width_mm),g1_spokes:Number.parseInt(nx?.value??String(e.g1_spokes),10)||0,g1_bore_mm:Math.max(1.5,Number.parseFloat(rx?.value||``)||e.g1_bore_mm),g1_d_flat_mm:Math.max(0,Number.parseFloat(ix?.value||`0`)||0),g1_hub_diameter_mm:Math.max(8,Number.parseFloat(ax?.value||``)||e.g1_hub_diameter_mm),g1_hub_height_mm:Math.max(0,Number.parseFloat(ox?.value||`0`)||0),g2_wheel_teeth:Math.max(10,Math.round(Number.parseFloat(lx?.value||``)||e.g2_wheel_teeth)),g2_wheel_face_mm:Math.max(2,Number.parseFloat(ux?.value||``)||e.g2_wheel_face_mm),g2_spokes:Number.parseInt(dx?.value??String(e.g2_spokes),10)||0,g2_pinion_teeth:Math.max(8,Math.round(Number.parseFloat(fx?.value||``)||e.g2_pinion_teeth)),g2_pinion_face_mm:Math.max(2,Number.parseFloat(px?.value||``)||e.g2_pinion_face_mm),g2_bore_mm:Math.max(1.5,Number.parseFloat(mx?.value||``)||e.g2_bore_mm),g2_d_flat_mm:Math.max(0,Number.parseFloat(hx?.value||`0`)||0),g3_teeth:Math.max(8,Math.round(Number.parseFloat(_x?.value||``)||e.g3_teeth)),g3_face_width_mm:Math.max(2,Number.parseFloat(vx?.value||``)||e.g3_face_width_mm),g3_bore_mm:Math.max(1.2,Number.parseFloat(yx?.value||``)||e.g3_bore_mm),g3_d_flat_mm:Math.max(0,Number.parseFloat(bx?.value||`0`)||0),g3_boss_height_mm:Math.max(0,Number.parseFloat(xx?.value||`0`)||0),g3_helix_hand:Sx?.value===`-1`?-1:1}}function Ux(e){Ox=e.layout_mode||`side_by_side`,zb?.classList.toggle(`active`,Ox===`side_by_side`),Bb?.classList.toggle(`active`,Ox===`meshed`),Hb&&(Hb.value=e.stage_mode),Ub&&(Ub.value=String(e.module_mm)),Wb&&(Wb.value=String(e.helix_angle_deg)),Gb&&(Gb.value=String(e.pressure_angle_deg)),Kb&&(Kb.value=String(e.backlash_mm)),Xb&&(Xb.value=String(e.spoke_width_pct??26)),Zb&&(Zb.value=String(e.rim_wall_mm??3.5)),Qb&&(Qb.value=String(e.hub_ring_mm??2.5)),ex&&(ex.value=String(e.g1_teeth)),tx&&(tx.value=String(e.g1_face_width_mm)),nx&&(nx.value=String(e.g1_spokes)),rx&&(rx.value=String(e.g1_bore_mm)),ix&&(ix.value=String(e.g1_d_flat_mm)),ax&&(ax.value=String(e.g1_hub_diameter_mm)),ox&&(ox.value=String(e.g1_hub_height_mm)),lx&&(lx.value=String(e.g2_wheel_teeth)),ux&&(ux.value=String(e.g2_wheel_face_mm)),dx&&(dx.value=String(e.g2_spokes??4)),fx&&(fx.value=String(e.g2_pinion_teeth)),px&&(px.value=String(e.g2_pinion_face_mm)),mx&&(mx.value=String(e.g2_bore_mm)),hx&&(hx.value=String(e.g2_d_flat_mm)),_x&&(_x.value=String(e.g3_teeth)),vx&&(vx.value=String(e.g3_face_width_mm)),yx&&(yx.value=String(e.g3_bore_mm)),bx&&(bx.value=String(e.g3_d_flat_mm)),xx&&(xx.value=String(e.g3_boss_height_mm)),Sx&&(Sx.value=String(e.g3_helix_hand??1))}function Wx(){let e=Hx(),t=Gp(e);if(Lb&&(Lb.textContent=`${t.total_ratio.toFixed(2)}:1 · m ${e.module_mm}`),Vb&&(Vb.textContent=e.helix_angle_deg>.1?`Helical ${e.helix_angle_deg.toFixed(0)}°`:`Spur 0°`),Yb){let t=Math.round(e.spoke_width_pct);Yb.textContent=`${t}% Spoke · ${100-t}% Window`}if($b&&($b.textContent=`Øp ${t.g1_pitch_dia_mm.toFixed(1)} · Øo ${t.g1_outer_dia_mm.toFixed(1)} mm`),cx&&(cx.textContent=`Øp ${t.g2_wheel_pitch_dia_mm.toFixed(1)} / ${t.g2_pinion_pitch_dia_mm.toFixed(1)} mm`),gx&&(gx.textContent=`Øp ${t.g3_pitch_dia_mm.toFixed(1)} · Øo ${t.g3_outer_dia_mm.toFixed(1)} mm`),sx&&(sx.style.display=e.stage_mode===`direct_1stage`?`none`:`block`),Ex&&(Ex.disabled=e.stage_mode===`direct_1stage`),Rb&&(Rb.textContent=Ey===`gearbox`?`3D: Gearbox (Switch to Rotor)`:`Show Gearbox in 3D`),Cx){let n=e.stage_mode===`direct_1stage`?`Shaft Center Distance: a₁₃ = ${t.center_distance_12_mm.toFixed(2)} mm`:`Shaft Centers: a₁₂ = ${t.center_distance_12_mm.toFixed(2)} mm · a₂₃ = ${t.center_distance_23_mm.toFixed(2)} mm`;Cx.textContent=`Total Ratio G = ${t.total_ratio.toFixed(2)}:1 (Stage 1: ${t.stage1_ratio.toFixed(2)}× · Stage 2: ${t.stage2_ratio.toFixed(2)}×) · ${n}`}return e}function Gx(e){Q&&Q.userData.isGearboxGroup&&Q.traverse(t=>{if(t instanceof Zr&&t.userData.gearIndex){let n=t.material;e!==null&&t.userData.gearIndex===e?(n.emissive.setHex(3718648),n.emissiveIntensity=.45):(n.emissive.setHex(0),n.emissiveIntensity=0)}})}function Kx(e){if(Ey!==`gearbox`)return;let t=Hx(),n=Gp(t),r=``;r=e===1?`GEAR 1 · ROTOR BULL GEAR (Z1 = ${t.g1_teeth}, Øp ${n.g1_pitch_dia_mm.toFixed(1)} mm, Face ${t.g1_face_width_mm} mm)`:e===2?`GEAR 2 · COMPOUND IDLER (Z2w = ${t.g2_wheel_teeth}, Z2p = ${t.g2_pinion_teeth}, Øp ${n.g2_wheel_pitch_dia_mm.toFixed(1)} / ${n.g2_pinion_pitch_dia_mm.toFixed(1)} mm)`:e===3?`GEAR 3 · GENERATOR PINION (Z3 = ${t.g3_teeth}, Øp ${n.g3_pitch_dia_mm.toFixed(1)} mm, Face ${t.g3_face_width_mm} mm)`:`GEAR TRAIN G = ${n.total_ratio.toFixed(2)}:1 · m ${t.module_mm} · CLICK ANY GEAR IN 3D TO EDIT SETTINGS`,Sv&&(Sv.textContent=r),Qm&&(Qm.textContent=r)}function qx(e,t=!0){Oy=e,Gx(e),t&&Tb&&(Tb.classList.add(`open`),Db?.classList.add(`active`),Db?.setAttribute(`aria-pressed`,`true`)),Ob&&(e===1?(Ob.textContent=`G1 · Bull`,Ob.style.color=`#8fd9b6`):e===2?(Ob.textContent=`G2 · Compound`,Ob.style.color=`#b84ba1`):e===3?(Ob.textContent=`G3 · Pinion`,Ob.style.color=`#38bdf8`):(Ob.textContent=`All Gears`,Ob.style.color=`var(--text-secondary)`)),kb?.classList.toggle(`active`,e===null),Ab?.classList.toggle(`active`,e===1),jb?.classList.toggle(`active`,e===2),Mb?.classList.toggle(`active`,e===3);let n=document.getElementById(`gear1-card`),r=document.getElementById(`gear2-card`),i=document.getElementById(`gear3-card`),a=document.getElementById(`gear-train-card`);n?.classList.toggle(`card-selected`,e===1),r?.classList.toggle(`card-selected`,e===2),i?.classList.toggle(`card-selected`,e===3),e===null?a?.scrollIntoView({behavior:`smooth`,block:`nearest`}):document.getElementById(`gear${e}-card`)?.scrollIntoView({behavior:`smooth`,block:`nearest`}),Kx(e)}function Jx(e){let t=new Set,n=new Set;e.traverse(e=>{let r=e;if(r.geometry instanceof Dr&&t.add(r.geometry),Array.isArray(r.material))for(let e of r.material)e&&n.add(e);else r.material&&n.add(r.material)});for(let e of t)e.dispose();for(let e of n)e.dispose()}function Yx(e){let t=Of(e);return{blade_count:Math.max(1,e.rotor.blade_count),hub_diameter_mm:e.hub.diameter_mm,hub_length_mm:e.hub.length_mm,hub_bore_mm:e.hub.bore_diameter_mm,root_chord_mm:t[0]?.effective_chord_mm??70,root_twist_deg:t[0]?.effective_twist_deg??20,collective_pitch_deg:cg}}function Xx(){let e=tf(),t=Yy?.value===`match_design`?`match_design`:`kidwind4_lockrev4`;return{...e,enabled:Jy?Jy.checked:e.enabled,hub_fit_mode:t,aero_profile:Ny,wrap_style:Py,view_mode:Fy,cone_length_mm:Math.max(35,Math.min(150,Number.parseFloat(tb?.value||String(e.cone_length_mm))||e.cone_length_mm)),skirt_length_mm:Math.max(6,Math.min(36,Number.parseFloat(rb?.value||String(e.skirt_length_mm))||e.skirt_length_mm)),wall_thickness_mm:Math.max(1.6,Math.min(5,Number.parseFloat(ab?.value||String(e.wall_thickness_mm))||e.wall_thickness_mm)),blade_clearance_mm:Math.max(.2,Math.min(2.5,Number.parseFloat(sb?.value||String(e.blade_clearance_mm))||e.blade_clearance_mm)),trefoil_clearance_mm:Math.max(.1,Math.min(.6,Number.parseFloat(lb?.value||String(e.trefoil_clearance_mm))||e.trefoil_clearance_mm)),assembly_slide_pct:Math.max(0,Math.min(100,Number.parseFloat(Qy?.value||`0`)||0)),cutaway_mode:Iy}}function Zx(e){let t=e?{...tf(),...e}:tf();Ny=t.aero_profile,Py=t.wrap_style,Fy=t.view_mode,Iy=!!t.cutaway_mode,Jy&&(Jy.checked=!!t.enabled),Yy&&(Yy.value=t.hub_fit_mode),Qy&&(Qy.value=String(t.assembly_slide_pct)),tb&&(tb.value=String(t.cone_length_mm)),rb&&(rb.value=String(t.skirt_length_mm)),ab&&(ab.value=String(t.wall_thickness_mm)),sb&&(sb.value=String(t.blade_clearance_mm)),lb&&(lb.value=String(t.trefoil_clearance_mm))}function Qx(e){let t=Xx(),n=Yx(e);Ry=t,zy=n;let r=mf(t,n),i={adaptive:`Adaptive`,vonkarman:`Von Kármán`,elliptical:`Elliptical`,bell:`Bell`},a={saddle:`Saddle`,closed:`Window`,cuff:`Cuff`,flush:`Flush`};Xy&&Xy.querySelectorAll(`[data-nose-profile]`).forEach(e=>{let n=e.dataset.noseProfile===t.aero_profile;e.classList.toggle(`active`,n),e.setAttribute(`aria-selected`,String(n))}),Zy&&Zy.querySelectorAll(`[data-nose-wrap]`).forEach(e=>{let n=e.dataset.noseWrap===t.wrap_style;e.classList.toggle(`active`,n),e.setAttribute(`aria-selected`,String(n))});for(let[e,n]of[[gb,`mounted`],[_b,`cone_only`],[vb,`rear_fit`]])if(e){let r=t.view_mode===n;e.classList.toggle(`active`,r),e.setAttribute(`aria-pressed`,String(r))}yb&&(yb.classList.toggle(`active`,t.cutaway_mode),yb.setAttribute(`aria-pressed`,String(t.cutaway_mode)));let o=t.wrap_style===`closed`||t.wrap_style===`cuff`;if($y&&($y.textContent=o?`Blade Slide (Radial)`:`Assembly Slide (Axial)`),eb&&(eb.textContent=t.assembly_slide_pct<=0?`0% Seated`:`${Math.round(t.assembly_slide_pct)}% Open`),nb&&(nb.textContent=`${Math.round(t.cone_length_mm)} mm`),ib&&(ib.textContent=`${Math.round(t.skirt_length_mm)} mm`),ob&&(ob.textContent=`${t.wall_thickness_mm.toFixed(1)} mm`),cb&&(cb.textContent=`${t.blade_clearance_mm.toFixed(1)} mm`),ub&&(ub.textContent=`${t.trefoil_clearance_mm.toFixed(2)} mm`),Ky&&(Ky.textContent=`${i[t.aero_profile]} · ${a[t.wrap_style]} · Ø${r.hub_diameter_mm.toFixed(0)} mm`),db&&(db.textContent=r.nose_cd.toFixed(2)),fb&&(fb.textContent=`+${r.root_flow_boost_pct}%`),pb&&(pb.textContent=`${r.est_mass_g.toFixed(1)} g`),mb&&(mb.textContent=r.hardware_label),hb&&(hb.textContent=r.fit_note),Cb&&(Cb.style.opacity=t.wrap_style===`cuff`?`1`:`0.72`,Cb.title=t.wrap_style===`cuff`?`Export ${n.blade_count} Rotating Blade Cuffs as STL`:`Export B Rotating Blade Cuffs (wrap style option 3)`),Dy===`nose`){let e=`NOSE · ${i[t.aero_profile].toUpperCase()} · ${a[t.wrap_style].toUpperCase()} · Ø${r.hub_diameter_mm.toFixed(0)} mm · ${r.hardware_label}`;Sv&&(Sv.textContent=e),Qm&&(Qm.textContent=e)}return t}function $x(e){e===`mounted`?(ym.position.set(145,105,165),Cm.target.set(0,18,0)):e===`cone_only`?(ym.position.set(108,82,128),Cm.target.set(0,26,0)):(ym.position.set(95,-95,120),Cm.target.set(0,8,0)),Cm.update()}function eS(e,t,n=1,r){let i=new Tn,a=t?null:new gi({color:988970,transparent:!0,opacity:.24});return e.forEach((e,o)=>{let s=new Dr;s.setAttribute(`position`,new fr(e.positions,3)),s.setIndex(new fr(e.indices,1)),s.computeVertexNormals();let c=e.id.startsWith(`ghost-hub-body`)||e.id.startsWith(`ghost-hub-trefoil`),l=c?n:1,u=new Zr(s,new ho({color:e.color_hex,metalness:e.id.includes(`bolt`)?.55:c?.35:.16,roughness:e.id.includes(`bolt`)?.28:c?.45:.34,wireframe:t,transparent:l<.99,opacity:l,side:2,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1}));if(r){let[e,t,n]=r(o);u.position.set(e,t,n)}if(i.add(u),a&&!c){let e=new Oi(new zi(s,30),a);if(r){let[t,n,i]=r(o);e.position.set(t,n,i)}i.add(e)}}),i}function tS(e){let t=new Tn;t.rotation.y=-Math.PI/2;let n=new Tn;return n.rotation.x=-Math.PI/2,n.add(e),t.add(n),t}function nS(e,t,n,r,i,a){let o=new Tn;if(e.length===0)return o;let s=e[0],c=new Dr;c.setAttribute(`position`,new fr(s.positions,3)),c.setIndex(new fr(s.indices,1)),c.computeVertexNormals();let l=new ho({color:s.color_hex,metalness:.18,roughness:.34,wireframe:a,side:2,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1}),u=a?null:new zi(c,30),d=a?null:new gi({color:988970,transparent:!0,opacity:.24}),f=new K(0,0,1),p=n*.5-1.2+i,m=-r*.5,h=Math.max(1,t);for(let e=0;e<h;e++){let t=e*2*Math.PI/h,n=new K(Math.cos(t),Math.sin(t),0),r=new Tn;r.position.set(n.x*p,n.y*p,m),r.quaternion.setFromUnitVectors(f,n),r.add(new Zr(c,l)),u&&d&&r.add(new Oi(u,d)),o.add(r)}return o}function rS(e){try{zx(e),aS(e);let t=Wx(),n=Qx(e);if(Dy===`nose`&&n.view_mode!==`mounted`){let t=performance.now(),r=Yx(e),i=hf(n,r),a=performance.now()-t;mv.style.display=`none`,mv.textContent=``,cv.classList.remove(`visible`),cv.setAttribute(`aria-hidden`,`true`),Q!==null&&(Jx(Q),vm.remove(Q)),Q=new Tn,Q.userData.isNoseGroup=!0;let o=n.assembly_slide_pct/100,s=n.view_mode===`rear_fit`&&o===0?.35:o,c=n.hub_fit_mode===`kidwind4_lockrev4`?20:Math.max(10,e.hub.length_mm),l=c/2,u=Math.max(1,r.blade_count),d=n.hub_fit_mode===`kidwind4_lockrev4`?n.hub_diameter_mm:e.hub.diameter_mm,f=o*65;if(n.view_mode===`cone_only`){let e=tS(eS(i.submeshes,Ay));if(e.position.y=0,Q.add(e),i.cuff_submeshes.length>0){let e=tS(nS(i.cuff_submeshes,u,d,c,f,Ay));e.position.y=0,Q.add(e)}}else{let e=tS(eS(i.ghost_hub_submeshes,Ay,.84));e.position.y=l,Q.add(e);let t=n.wrap_style===`closed`||n.wrap_style===`cuff`?s*48:s*58,r=tS(eS(i.submeshes,Ay));if(r.position.y=l+t,Q.add(r),i.cuff_submeshes.length>0){let e=tS(nS(i.cuff_submeshes,u,d,c,f,Ay));e.position.y=l+t,Q.add(e)}}vm.add(Q),oS(a,{triangle_count:i.metrics.total_triangles,volume_mm3:Math.round(i.metrics.est_mass_g/1.27*1e3),span_min_mm:-i.metrics.skirt_length_mm,span_max_mm:n.cone_length_mm});return}if(Ey===`gearbox`){let e=performance.now(),n=em(t),r=performance.now()-e;mv.style.display=`none`,mv.textContent=``,cv.classList.remove(`visible`),cv.setAttribute(`aria-hidden`,`true`),Q!==null&&(Jx(Q),vm.remove(Q)),Q=new Tn,Q.userData.isGearboxGroup=!0;let i=new gi({color:988970,transparent:!0,opacity:.35}),a=new Map;for(let e of n.submeshes){let t=a.get(e.gear_index);t||(t=new Tn,t.position.set(e.center_x_mm,e.base_z_mm,-e.center_y_mm),t.userData.isGearPivot=!0,t.userData.spinRatio=e.spin_ratio,t.userData.meshPhaseRad=e.mesh_phase_rad,t.rotation.y=My*e.spin_ratio+e.mesh_phase_rad,a.set(e.gear_index,t),Q.add(t));let n=new Dr;n.setAttribute(`position`,new fr(e.positions,3)),n.setAttribute(`normal`,new fr(e.normals,3)),n.setIndex(new fr(e.indices,1)),n.rotateX(-Math.PI/2);let r=new Zr(n,new ho({color:e.color_hex,metalness:e.metalness,roughness:e.roughness,wireframe:Ay,side:2,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1}));if(r.userData.gearIndex=e.gear_index,r.userData.submeshId=e.id,r.userData.submeshName=e.label,r.userData.baseColor=e.color_hex,t.add(r),!Ay){let e=new Oi(new zi(n,28),i);t.add(e)}}Ay&&i.dispose(),vm.add(Q),Gx(Oy),oS(r,{triangle_count:n.total_triangles,volume_mm3:0,span_min_mm:0,span_max_mm:n.metrics.total_span_width_mm});return}let r=performance.now(),i=Lx(),a=md(JSON.stringify(e),i),o=performance.now()-r,s,c,l,u;try{s=new Float32Array(a.positions),c=new Uint32Array(a.indices);let e=a.tube_axis;l=e&&e.length>=7?new Float64Array(e):null,u={triangle_count:a.triangle_count,volume_mm3:a.volume_mm3,span_min_mm:a.span_min_mm,span_max_mm:a.span_max_mm}}finally{a.free()}mv.style.display=`none`,mv.textContent=``,Q!==null&&(Jx(Q),vm.remove(Q)),Q=new Tn;let d=Mx();Np(s,e,d);let f=Vx(s,c,32),p=f.getAttribute(`position`),m=Ay?null:new zi(f,32),h=Ay?null:new gi({color:988970,transparent:!0,opacity:jm===`atelier`?.42:.36}),g=b_.checked&&x_.checked,_=sv.value||`segment`,v=_!==`segment`;if(v){let t=f.getAttribute(`normal`),n=Mp(p.array,e,Sy,Cy,_,t?t.array:void 0,cg);f.setAttribute(`color`,new fr(n.colors,3)),cv.classList.add(`visible`),cv.setAttribute(`aria-hidden`,`false`),lv.textContent=n.title,uv.textContent=n.minLabel,dv.style.background=n.gradientCss,fv.textContent=n.maxLabel}else cv.classList.remove(`visible`),cv.setAttribute(`aria-hidden`,`true`);let y=new ho({color:v?16777215:jm===`atelier`?2450411:3900150,vertexColors:v,metalness:.16,roughness:.38,wireframe:Ay,transparent:g,opacity:g?.86:1,side:2,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1}),b=Of(e),x=b[0]?.effective_chord_mm??70,S=e.rotor.pitch_axis_ratio*x,C=b.map(t=>new K(e.rotor.pitch_axis_ratio*t.effective_chord_mm,0,t.radius_mm)),w=new Dr().setFromPoints(C),T=new gi({color:jm===`atelier`?15222046:16096779}),E=Math.max(.5,Number.parseFloat(D_.value)||5),D=Math.max(5,Number.parseFloat(O_.value)||240),O=Number.parseFloat(k_.value)||0,k=Number.parseFloat(A_.value)||0,A=-S,j=null,M=null,N=null,P=null;if(g){let t=l&&l.length>=7?new K(l[0]+A,l[1],l[2]):new K(S+O+A,k,e.rotor.hub_radius_mm),n=l&&l.length>=7?new K(l[3]+A,l[4],l[5]):new K(S+O+A,k,e.rotor.hub_radius_mm+D),r=l&&l.length>=7?Math.max(.4,l[6]*.94):Math.max(.5,E*.48),i=new K().subVectors(n,t),a=i.length()>1e-6?i.clone().normalize():new K(0,0,1),o=t.clone().addScaledVector(a,-18),s=o.distanceTo(n);N=new K().addVectors(o,n).multiplyScalar(.5),P=new Dt().setFromUnitVectors(new K(0,1,0),a),j=new Pi(r,r,s,28),M=new ho({color:1096065,metalness:.65,roughness:.25})}let F=Ey===`rotor`?Math.max(1,e.rotor.blade_count):1;for(let t=0;t<F;t++){let r=new Tn;r.userData.isBladeBranch=!0;let i=new Tn,a=lg?Math.PI:0;i.rotation.z=a+cg*Math.PI/180;let o=new Zr(f,y);if(o.position.x=A,i.add(o),m&&h){let e=new Oi(m,h);e.position.x=A,i.add(e)}let s=new wi(w,T);if(s.position.x=A,i.add(s),j&&M&&N&&P){let e=new Zr(j,M);e.position.copy(N),e.quaternion.copy(P),i.add(e)}if(r.add(i),Ey===`rotor`){let i=2*Math.PI*t/F;if(r.rotation.y=i,Dy===`nose`){let t=(n.hub_fit_mode===`kidwind4_lockrev4`?Math.min(0,n.hub_diameter_mm*.5-e.rotor.hub_radius_mm):0)+(n.wrap_style===`closed`||n.wrap_style===`cuff`?n.assembly_slide_pct/100*65:0);Math.abs(t)>1e-4&&r.position.set(Math.sin(i)*t,0,Math.cos(i)*t)}}Q.add(r)}if(Ey===`rotor`){let t=l&&l.length>=7?l[1]:0,r=lg?-t:t,i=Yx(e);if(Dy===`nose`){let t=n.hub_fit_mode===`kidwind4_lockrev4`?20:Math.max(10,e.hub.length_mm),a=t/2+r,o=hf(n,i),s=tS(eS(o.ghost_hub_submeshes,Ay,.85));s.position.y=a,Q.add(s);let c=n.assembly_slide_pct/100,l=n.wrap_style===`saddle`||n.wrap_style===`flush`?c*58:0,u=n.wrap_style===`closed`||n.wrap_style===`cuff`?c*65:0,d=tS(eS(o.submeshes,Ay));if(d.position.y=a+l,Q.add(d),o.cuff_submeshes.length>0){let r=Math.max(1,i.blade_count),s=n.hub_fit_mode===`kidwind4_lockrev4`?n.hub_diameter_mm:e.hub.diameter_mm,c=tS(nS(o.cuff_submeshes,r,s,t,u,Ay));c.position.y=a,Q.add(c)}Q.userData.isNoseGroup=!0}else{let t=Math.max(12,e.hub.diameter_mm/2),a=Math.max(2,Math.min(t-2,e.hub.bore_diameter_mm/2)),o=Math.max(10,e.hub.length_mm),s=new ga;s.absarc(0,0,t,0,Math.PI*2,!1);let c=new ha;c.absarc(0,0,a,0,Math.PI*2,!0),s.holes.push(c);let l=new eo(s,{depth:o,bevelEnabled:!1,curveSegments:64});l.rotateX(Math.PI/2),l.translate(0,o/2+r,0);let u=new Zr(l,new ho({color:jm===`atelier`?3359061:6583435,metalness:.45,roughness:.35,wireframe:Ay,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1}));if(Q.add(u),h){let e=new Oi(new zi(l,32),h);Q.add(e)}if(n.enabled){let e={...n,hub_fit_mode:Math.abs(t*2-60)>1?`match_design`:n.hub_fit_mode,cutaway_mode:!1,assembly_slide_pct:0},a={...i,hub_diameter_mm:t*2},s=hf(e,a),c=tS(eS(s.submeshes,Ay));if(c.position.y=o/2+r,Q.add(c),s.cuff_submeshes.length>0){let e=tS(nS(s.cuff_submeshes,a.blade_count,t*2,o,0,Ay));e.position.y=o/2+r,Q.add(e)}}}}vm.add(Q),Ix(),oS(o,u)}catch(e){mv.style.display=`block`,mv.textContent=String(e)}}function iS(e){for(let[t,n]of[[Uv,1],[Wv,2],[Gv,3],[Kv,4]])t&&t.classList.toggle(`active`,Math.abs(e-n)<.04)}function aS(e){try{let t=Number.parseFloat(zv.value)||35,n=Number.parseFloat(Bv.value)||.8,r=Math.max(.25,Number.parseFloat(Vv.value)||1),i=Number.parseFloat(Hv.value)||5,a=Vp[Rv?.value||`low_rpm_pmg`]?.no_load_current_a??.05;iS(r);let o=Td(JSON.stringify(e),JSON.stringify({pitch_deg:cg,tsr_min:1.5,tsr_max:9,tsr_steps:16,generator_kv:t,generator_r_int:n,generator_r_load:i,generator_gear_ratio:r,generator_i0:a})),s=JSON.parse(o);Sy=s;let c=Math.min(100,Math.max(0,s.design_point.cp/(16/27)*100));if(hv.textContent=`Cp ${s.design_point.cp.toFixed(3)}  P ${s.design_point.power_w.toFixed(0)} W`,Tv&&(Tv.textContent=`Pk ${s.peak_cp.toFixed(3)} @λ${s.peak_tsr.toFixed(1)}`),gv.textContent=s.design_point.cp.toFixed(3),_v&&(_v.textContent=`${c.toFixed(0)}% Betz`),vv&&(vv.style.width=`${c.toFixed(1)}%`),yv.textContent=`${s.peak_cp.toFixed(2)} @λ${s.peak_tsr.toFixed(1)}`,bv.textContent=`${s.design_point.power_w.toFixed(1)} W`,$m&&($m.textContent=s.design_point.cp.toFixed(2)),eh&&(eh.textContent=`${s.design_point.power_w.toFixed(0)} W`),Ov&&(!Ov.textContent||Ov.textContent.startsWith(`Ready`))&&(Ov.textContent=`Ready — peak Cp ${s.peak_cp.toFixed(3)} @ λ ${s.peak_tsr.toFixed(1)}`),s.generator_match){let e=s.generator_match,t=e.generator,n=t.generator_rpm??t.rotor_rpm*r;xv.textContent=`${t.electrical_power_w.toFixed(1)} W`,xv.title=`${t.terminal_voltage_v.toFixed(1)} V · ${t.current_a.toFixed(2)} A · η ${(t.efficiency*100).toFixed(0)}%`,qv.textContent=`Rotor ${t.rotor_rpm.toFixed(0)} RPM · Gen ${n.toFixed(0)} RPM (${r.toFixed(2)}:1, λ=${e.tip_speed_ratio.toFixed(2)}) / V=${t.terminal_voltage_v.toFixed(1)} V / I=${t.current_a.toFixed(2)} A / P=${t.electrical_power_w.toFixed(1)} W (η=${(t.efficiency*100).toFixed(0)}%)`}else xv.textContent=`–`,xv.title=``,qv.textContent=`Gen: uncoupled`;let l=Up(e,s,{kv:t,r_int:n,r_load:i,gear_ratio:r,i0:a});if(Ty=l,Jv&&(Jv.textContent=`${l.opt_gear_ratio.toFixed(1)}:1 · ${l.opt_r_load_ohm.toFixed(0)}Ω (${l.opt_elec_power_w.toFixed(1)}W)`),Yv){let e=l.gain_power_w>=.15?` — Max-Out adds +${l.gain_power_w.toFixed(1)} W (+${l.gain_pct.toFixed(0)}%)`:` — Drivetrain at peak output`;Yv.textContent=`${l.regime_label}${e}`,Yv.classList.toggle(`ok`,l.regime===`optimal_band`),Yv.classList.toggle(`warn`,l.regime===`overspeed_underload`),Yv.classList.toggle(`crit`,l.regime===`stalled_overload`)}Qv&&(Qv.textContent=l.how_to_max_out_steps.join(`
`));let u=Number.parseFloat($v.value)||5.5,d=Pp(e,s,{kv:t,r_int:n,r_load:i,gear_ratio:r},u);wy=d,ey.textContent=`Cut-in ${d.cut_in_mps.toFixed(1)} m/s`,ty.textContent=`${d.aep_kwh_yr.toFixed(0)} kWh/yr`,ny.innerHTML=Fp(d,jm),iy.textContent=`Rated @12 m/s: ${d.rated_elec_power_w.toFixed(0)} W elec (${d.rated_mech_power_w.toFixed(0)} W mech) / CF ${d.capacity_factor_pct.toFixed(1)}% @ V_avg=${d.site_avg_wind_mps.toFixed(1)} m/s`;let f=ay.value||`petg`,p=Ep(e,s,CS(),f);Cy=p,sy.textContent=p.split_moment_nm>0?`${p.root_moment_nm.toFixed(2)} / ${p.split_moment_nm.toFixed(2)} N·m`:`${p.root_moment_nm.toFixed(2)} N·m`,cy.textContent=`${p.tip_deflection_mm.toFixed(1)} mm (${p.tip_deflection_pct.toFixed(1)}%)`;let m=p.root_safety_factor>=50?`>50×`:`${p.root_safety_factor.toFixed(1)}×`;ly.textContent=`${m} / ${p.joint_safety_factor>=50?`>50×`:`${p.joint_safety_factor.toFixed(1)}×`}`,oy&&(oy.textContent=`SF ${m}`),uy.textContent=`${p.blade_mass_g.toFixed(0)} g / ${p.centrifugal_root_n.toFixed(1)} N`,dy.textContent=`[${p.status.toUpperCase()}] Peak shell σ=${p.max_shell_stress_mpa.toFixed(1)} MPa — ${p.recommendation}`,dy.classList.toggle(`ok`,p.status===`safe`),dy.classList.toggle(`warn`,p.status===`caution`),dy.classList.toggle(`crit`,p.status===`critical`);let h=lp(fy.value,e.rotor.radius_mm,e.rotor.wind_speed_mps),g=up(s.sweep,h);if(my&&(my.textContent=`${g.count} pts`),py.textContent=g.count>0?`Exp log: ${g.count} pts / RMSE ΔCp=${g.rmse_cp.toFixed(4)} / MAE=${g.mae_cp.toFixed(4)}`:`Exp log: 0 pts (enter 'tsr, cp' or 'rpm=.., power_w=..')`,xy){let e=cp(xy,s),t=e.delta_design_cp>=0?`+`:``,n=e.delta_peak_cp>=0?`+`:``,r=e.delta_power_w>=0?`+`:``;jv.textContent=`B−A: ΔCp=${t}${e.delta_design_cp.toFixed(3)} (pk ${n}${e.delta_peak_cp.toFixed(3)}) / ΔP=${r}${e.delta_power_w.toFixed(1)} W`}else jv.textContent=`No Baseline A`;Cv.innerHTML=dp(s.sweep,{baselineASweep:xy?xy.sweep:null,experimentalPoints:h,designTsr:e.rotor.design_tsr,theme:jm})}catch(e){hv.textContent=`Aero error: ${String(e)}`}}function oS(e,t){let n=document.getElementById(`ms`);n.textContent=`${e.toFixed(1)} ms`,n.className=e<50?`ok`:`slow`,Wh&&(Wh.textContent=`${e.toFixed(1)} ms`),th&&(th.textContent=`${e.toFixed(1)} ms`),document.getElementById(`tris`).textContent=String(t.triangle_count),document.getElementById(`vol`).textContent=t.volume_mm3.toFixed(0),document.title=`BladeLab — ${t.span_min_mm.toFixed(0)}–${t.span_max_mm.toFixed(0)} mm [${e.toFixed(1)} ms]`}function sS(e){let{chord_mm:t,twist_deg:n}=e.distributions;return t.type===`bezier`||n.type===`bezier`?`bezier`:t.type===`formula`||n.type===`formula`?`formula`:t.type===`schmitz`||n.type===`schmitz`?`schmitz`:`linear`}function cS(e,t=!0){let n=e.distributions.chord_mm;if(_y=n.type===`formula`&&n.expr.includes(`cos(pi`),t&&n.type===`formula`){let e=Uf(n.expr);e&&(Dg.value=String(Math.round(e.center*100)),Og.value=String(Math.round(e.width*100)))}let r=Math.max(0,e.rotor.radius_mm-e.rotor.hub_radius_mm),i=Number.parseFloat(Dg.value)/100,a=Number.parseFloat(Og.value)/100,{rootEnd:o,tipStart:s}=Vf(i,a);Tg.classList.toggle(`active`,!_y),Tg.setAttribute(`aria-selected`,String(!_y)),Eg.classList.toggle(`active`,_y),Eg.setAttribute(`aria-selected`,String(_y)),Mg.classList.toggle(`is-linear`,!_y),jg.textContent=_y?`Optimized`:`Linear`,Dg.disabled=!_y,Og.disabled=!_y,kg.textContent=`${Math.round(i*100)}% of span`,Ag.textContent=`${Math.round(a*100)}% (${Math.round(a*r)} mm)`,Dg.style.setProperty(`--fill`,`${(Number(Dg.value)-15)/70*100}%`),Og.style.setProperty(`--fill`,`${(Number(Og.value)-5)/55*100}%`),Ng.style.setProperty(`--z-root`,`${o}fr`),Ng.style.setProperty(`--z-mid`,`${s-o}fr`),Ng.style.setProperty(`--z-tip`,`${1-s}fr`);let c=e=>(e*r/1e3).toFixed(2);Pg.textContent=`Root 0 – ${c(o)} m | Mid ${c(o)} – ${c(s)} m | Tip ${c(s)} – ${c(1)} m`;let l=e.overrides.filter(e=>e.chord_mm!==null&&e.chord_mm!==void 0);Fg.hidden=l.length===0,l.length>0&&(Ig.textContent=`Station override pins chord at ${l.map(e=>`${Math.round(e.span_ratio*100)}%`).join(`, `)} of span`)}var lS={root:`Structural and hub attachment`,mid:`Primary power production`,tip:`Low drag and vortex relief`};function uS(){return(Number.parseFloat(Dg.value)||45)/100}function dS(e){let t=Number(e.min),n=Number(e.max),r=Number(e.value),i=n-t,a=Number.isFinite(i)&&i>0&&Number.isFinite(r)?Math.min(100,Math.max(0,(r-t)/i*100)):0;e.style.setProperty(`--fill`,`${a.toFixed(1)}%`)}function fS(){document.querySelectorAll(`input[type="range"]`).forEach(e=>{dS(e)})}function pS(e){let t=Kf(e,uS());hy&&(hy.textContent=`c ${t.root.chord_mm.toFixed(0)}→${t.tip.chord_mm.toFixed(0)} mm`);for(let e of Rg){let n=e.dataset.sec,r=n===vy;e.classList.toggle(`active`,r),e.setAttribute(`aria-selected`,String(r));let i=document.getElementById(`sec-sum-${n}`);i.textContent=`${t[n].chord_mm.toFixed(0)} mm / ${t[n].twist_deg.toFixed(1).replace(/\.0$/,``)}°`}zg.textContent=lS[vy];let n=t[vy],r=Jf(n.airfoil);Bg.value=n.airfoil.type===`named`?n.airfoil.name:`naca4`,Vg.value=String(Math.round(n.chord_mm)),Hg.value=String(Math.round(n.chord_mm)),Ug.value=String(Number(n.twist_deg.toFixed(1))),Wg.value=String(Number(n.twist_deg.toFixed(1))),Gg.value=String(Number((r.t*100).toFixed(1))),Kg.value=String(Number((r.t*100).toFixed(1)));let i=n.airfoil.type===`named`;Gg.disabled=i,Kg.disabled=i,qg.textContent=n.airfoil.type===`named`?`${n.airfoil.name} has a fixed profile; t/c is nominal. Switch to NACA to tune thickness.`:``;for(let e of[Vg,Ug,Gg])dS(e);Jg.innerHTML=Yf(t,vy,jm)}function mS(){let e=uS(),t=Kf(Z,e),n=t[vy].airfoil,r=(Number.parseFloat(Kg.value)||12)/100;t[vy].airfoil=Bg.value===`naca4`?{type:`naca4`,max_camber:n.type===`naca4`?n.max_camber:.04,camber_position:n.type===`naca4`?n.camber_position:.4,thickness_ratio:Math.min(.3,Math.max(.06,r))}:{type:`named`,name:Bg.value},MS(qf(Z,t,e))}function hS(e,t){let n=uS(),r=(Number.parseFloat(Og.value)||25)/100,i=Kf(Z,n),a=e===`chord_mm`?`chord_mm`:`twist_deg`;i[vy][a]=t;let o=Hf(i.root[a],i.tip[a],n,r,i.mid[a]);MS(ep(Z,e,o,by))}function gS(e,t,n){e.addEventListener(`input`,()=>{t.value=e.value,dS(e)}),e.addEventListener(`change`,()=>n(Number(e.value))),t.addEventListener(`change`,()=>{let r=Number(t.min),i=Number(t.max),a=Math.min(i,Math.max(r,Number.parseFloat(t.value)));Number.isFinite(a)?(e.value=String(a),t.value=String(a),n(a)):pS(Z)})}for(let e of Rg)e.addEventListener(`click`,()=>{vy=e.dataset.sec,pS(Z)});Bg.addEventListener(`change`,mS),gS(Vg,Hg,e=>hS(`chord_mm`,e)),gS(Ug,Wg,e=>hS(`twist_deg`,e)),gS(Gg,Kg,()=>mS());function _S(e){let{rotor:t,distributions:n}=e,r=Math.max(0,t.radius_mm-t.hub_radius_mm);Ah.textContent=`R ${t.radius_mm} · L ${r.toFixed(0)} · ${t.blade_count}B`,Sv&&(Sv.textContent=`R ${t.radius_mm} · L ${r.toFixed(0)} mm · ${t.blade_count}B`),Qm&&(Qm.textContent=`R ${t.radius_mm} · L ${r.toFixed(0)} mm · ${t.blade_count}B`),jh.value=String(t.radius_mm),Mh.value=String(t.hub_radius_mm),Nh.value=String(t.blade_count),Ph&&(Ph.value=String(t.radius_mm)),Fh&&(Fh.value=String(t.hub_radius_mm)),Ih&&(Ih.value=String(t.blade_count)),Lh.value=String(t.design_tsr),Rh.value=String(t.wind_speed_mps),zh.value=String(t.station_count),Bh.value=String(Number(r.toFixed(1))),Hh.value=String(Math.round(r)),Uh.textContent=`${r.toFixed(0)} mm`,Vh.value=String(t.pitch_axis_ratio);let i=e.airfoils[0]?.airfoil;i&&(i.type===`named`?(bg.value=i.name,xg.style.display=`none`):(bg.value=`naca4`,xg.style.display=`grid`,Sg.value=String(Number((i.thickness_ratio*100).toFixed(1))),Cg.value=String(Number((i.max_camber*100).toFixed(1))))),zx(e);let a=sS(e);Yg.classList.toggle(`active`,a===`linear`),Yg.setAttribute(`aria-selected`,String(a===`linear`)),Xg.classList.toggle(`active`,a===`schmitz`),Xg.setAttribute(`aria-selected`,String(a===`schmitz`)),Zg.classList.toggle(`active`,a===`bezier`),Zg.setAttribute(`aria-selected`,String(a===`bezier`)),Qg.classList.toggle(`active`,a===`formula`),Qg.setAttribute(`aria-selected`,String(a===`formula`)),$g.style.display=a===`linear`?`block`:`none`,e_.style.display=a===`schmitz`?`block`:`none`,t_.style.display=a===`bezier`?`block`:`none`,n_.style.display=a===`formula`?`block`:`none`,n.chord_mm.type===`linear`&&(a_.value=String(n.chord_mm.root),c_.value=String(n.chord_mm.tip),u_.textContent=`${n.chord_mm.tip} mm`),n.twist_deg.type===`linear`&&(o_.value=String(n.twist_deg.root),s_.value=String(n.twist_deg.tip),l_.textContent=`${n.twist_deg.tip}°`),n.chord_mm.type===`schmitz`&&(d_.value=String(n.chord_mm.design_cl??1)),n.twist_deg.type===`schmitz`&&(f_.value=String(n.twist_deg.design_alpha_deg??6)),n.chord_mm.type===`formula`&&(__.value=n.chord_mm.expr),n.twist_deg.type===`formula`&&(v_.value=n.twist_deg.expr),p_.classList.toggle(`active`,gy===`chord_mm`),p_.setAttribute(`aria-selected`,String(gy===`chord_mm`)),m_.classList.toggle(`active`,gy===`twist_deg`),m_.setAttribute(`aria-selected`,String(gy===`twist_deg`)),yS(e),cS(e),pS(e);let o=_m.counts();Lm.disabled=!_m.canUndo(),Rm.disabled=!_m.canRedo(),Lm.title=o.undo>0?`Undo (${o.undo}) (Ctrl+Z)`:`Undo (Ctrl+Z)`,Rm.title=o.redo>0?`Redo (${o.redo}) (Ctrl+Y)`:`Redo (Ctrl+Y)`,Lm.setAttribute(`aria-label`,Lm.title),Rm.setAttribute(`aria-label`,Rm.title),bS(e),fS()}function vS(e,t){let n=e.distributions[t];return n.type===`bezier`?n.points:t===`chord_mm`?zf():Bf()}function yS(e){let t=vS(e,gy),n=gy===`chord_mm`?5:-20,r=gy===`chord_mm`?140:45,i=e=>24+e*272,a=e=>132-(e-n)/Math.max(1e-6,r-n)*114,o=[];for(let e=0;e<=48;e++){let n=e/48,r=bf(t,n);o.push(`${e===0?`M`:`L`}${i(n).toFixed(1)},${a(r).toFixed(1)}`)}let s=t.map(e=>`${i(e.x).toFixed(1)},${a(e.y).toFixed(1)}`).join(` `),c=jm===`atelier`,l=c?`#cbd5e1`:`#262c3a`,u=c?`#1d4ed8`:`#38bdf8`,d=c?`#e8451e`:`#f59e0b`,f=c?`#1d4ed8`:`#38bdf8`,p=c?`#ffffff`:`#07080d`,m=o.join(` `),h=h_.querySelector(`polyline[data-bezier-poly]`),g=h_.querySelector(`path[data-bezier-curve]`),_=h_.querySelectorAll(`circle[data-bezier-pt]`),v=h_.dataset.theme===jm;if(h&&g&&_.length===t.length&&v)h.setAttribute(`points`,s),g.setAttribute(`d`,m),t.forEach((e,n)=>{let r=_[n];r.setAttribute(`cx`,i(e.x).toFixed(1)),r.setAttribute(`cy`,a(e.y).toFixed(1)),r.setAttribute(`fill`,n===0||n===t.length-1?d:f)});else{h_.dataset.theme=jm,h_.innerHTML=``;let e=`http://www.w3.org/2000/svg`,n=document.createElementNS(e,`polyline`);n.setAttribute(`data-bezier-poly`,`1`),n.setAttribute(`points`,s),n.setAttribute(`fill`,`none`),n.setAttribute(`stroke`,l),n.setAttribute(`stroke-width`,`1`),n.setAttribute(`stroke-dasharray`,`3 3`),h_.appendChild(n);let r=document.createElementNS(e,`path`);r.setAttribute(`data-bezier-curve`,`1`),r.setAttribute(`d`,m),r.setAttribute(`fill`,`none`),r.setAttribute(`stroke`,u),r.setAttribute(`stroke-width`,`2`),h_.appendChild(r);let o=t.length;t.forEach((t,n)=>{let r=document.createElementNS(e,`circle`);r.setAttribute(`data-bezier-pt`,String(n)),r.setAttribute(`cx`,i(t.x).toFixed(1)),r.setAttribute(`cy`,a(t.y).toFixed(1)),r.setAttribute(`r`,`5`),r.setAttribute(`fill`,n===0||n===o-1?d:f),r.setAttribute(`stroke`,p),r.setAttribute(`stroke-width`,`1.5`),r.style.cursor=`grab`,r.addEventListener(`pointerdown`,e=>{e.preventDefault(),r.setPointerCapture(e.pointerId);let t=_m.current(),i=gy,a=i===`chord_mm`?5:-20,s=i===`chord_mm`?140:45,c=e=>{let r=h_.getBoundingClientRect(),c=(e.clientX-r.left)*(320/Math.max(1,r.width)),l=(e.clientY-r.top)*(150/Math.max(1,r.height)),u=n===0?0:n===o-1?1:Math.min(1,Math.max(0,(c-24)/272)),d=a+(1-(l-18)/114)*(s-a);Z=$f(t,i,n,{x:Number(u.toFixed(3)),y:Number(Math.min(s,Math.max(a,d)).toFixed(2))},by),yS(Z),bS(Z),rS(Z)},l=()=>{r.removeEventListener(`pointermove`,c),r.removeEventListener(`pointerup`,l),r.removeEventListener(`pointercancel`,l),r.removeEventListener(`lostpointercapture`,l),MS(Z)};r.addEventListener(`pointermove`,c),r.addEventListener(`pointerup`,l),r.addEventListener(`pointercancel`,l),r.addEventListener(`lostpointercapture`,l)}),h_.appendChild(r)})}let y=g_.querySelectorAll(`tr[data-bezier-row]`);y.length===t.length?t.forEach((e,t)=>{let n=y[t],r=n.querySelector(`input[data-axis='x']`),i=n.querySelector(`input[data-axis='y']`);r&&document.activeElement!==r&&(r.value=e.x.toFixed(3)),i&&document.activeElement!==i&&(i.value=e.y.toFixed(2))}):(g_.innerHTML=``,t.forEach((e,n)=>{let r=document.createElement(`tr`);r.setAttribute(`data-bezier-row`,String(n));let i=document.createElement(`td`);i.textContent=`P${n}`;let a=document.createElement(`td`),o=document.createElement(`input`);o.setAttribute(`data-axis`,`x`),o.type=`number`,o.step=`0.05`,o.min=`0`,o.max=`1`,o.value=e.x.toFixed(3),o.disabled=n===0||n===t.length-1,o.addEventListener(`change`,()=>{let e=Number.parseFloat(o.value);Number.isFinite(e)&&MS($f(Z,gy,n,{x:e},by))}),a.appendChild(o);let s=document.createElement(`td`),c=document.createElement(`input`);c.setAttribute(`data-axis`,`y`),c.type=`number`,c.step=`0.5`,c.value=e.y.toFixed(2),c.addEventListener(`change`,()=>{let e=Number.parseFloat(c.value);Number.isFinite(e)&&MS($f(Z,gy,n,{y:e},by))}),s.appendChild(c),r.append(i,a,s),g_.appendChild(r)}))}function bS(e){let t=Of(e);pv.innerHTML=``;for(let e of t){let t=document.createElement(`tr`);e.has_override&&t.classList.add(`overridden`);let n=document.createElement(`td`);n.textContent=String(e.index+1);let r=document.createElement(`td`);r.textContent=e.span_ratio.toFixed(3);let i=document.createElement(`td`);i.textContent=e.radius_mm.toFixed(1);let a=document.createElement(`td`),o=document.createElement(`input`);o.type=`number`,o.step=`0.5`,o.min=`2`,o.max=`500`,o.value=e.effective_chord_mm.toFixed(2),o.title=e.override_chord_mm===null?`Layer 1/2 base (${e.base_chord_mm.toFixed(2)} mm)`:`Layer 3 override (base: ${e.base_chord_mm.toFixed(2)} mm)`,o.addEventListener(`change`,()=>{let t=Number.parseFloat(o.value);Number.isFinite(t)&&t>0&&MS(rp(Z,e.span_ratio,{chord_mm:t}))}),a.appendChild(o);let s=document.createElement(`td`),c=document.createElement(`input`);c.type=`number`,c.step=`0.25`,c.min=`-90`,c.max=`90`,c.value=e.effective_twist_deg.toFixed(2),c.title=e.override_twist_deg===null?`Layer 1/2 base (${e.base_twist_deg.toFixed(2)}°)`:`Layer 3 override (base: ${e.base_twist_deg.toFixed(2)}°)`,c.addEventListener(`change`,()=>{let t=Number.parseFloat(c.value);Number.isFinite(t)&&MS(rp(Z,e.span_ratio,{twist_deg:t}))}),s.appendChild(c);let l=document.createElement(`td`),u=kx(e.span_ratio),d=document.createElement(`button`);d.type=`button`,d.className=u?`lock-btn locked`:`lock-btn`,d.textContent=u?`Locked`:`Pin`,d.title=u?`Station locked against Layer 1/2 changes (click to unlock)`:`Click to lock station against Layer 1/2 changes`,d.addEventListener(`click`,()=>{Ax(e.span_ratio),bS(Z),$()}),l.appendChild(d);let f=document.createElement(`td`);if(e.has_override){let t=document.createElement(`button`);t.type=`button`,t.className=`btn-mini`,t.textContent=`Clear`,t.title=`Clear station override`,t.addEventListener(`click`,()=>{MS(ip(Z,e.span_ratio))}),f.appendChild(t)}t.append(n,r,i,a,s,l,f),pv.appendChild(t)}}var xS=null,SS=!1;function CS(){return{spar_hole_enabled:b_.checked,spar_show_rod:x_.checked,spar_hole_diameter_mm:Math.max(.5,Number.parseFloat(D_.value)||5),spar_hole_depth_mm:Math.max(5,Number.parseFloat(O_.value)||240),spar_hole_offset_x_mm:Number.parseFloat(k_.value)||0,spar_hole_offset_y_mm:Number.parseFloat(A_.value)||0,spar_hole_tolerance_mm:Math.max(0,Number.parseFloat(U_.value)||0),split_parts:Math.max(1,Number.parseInt(P_.value,10)||1),split_active_part:F_.value||`all`,split_ratio_pct:Math.max(12,Math.min(88,I_.valueAsNumber||50)),split_explode_gap_mm:Math.max(0,R_.valueAsNumber||0),align_shape:W_.value||`round`,align_count:Math.max(1,Number.parseInt(G_.value,10)||2),align_size_mm:Math.max(1,Number.parseFloat(K_.value)||3),align_key_length_mm:Math.max(2,Number.parseFloat(q_.value)||6),align_height_mm:Math.max(1,Number.parseFloat(J_.value)||6),align_spacing_mm:Math.max(0,Number.parseFloat(Y_.value)||0),align_clearance_mm:Math.max(0,Number.parseFloat(X_.value)||0),align_depth_clearance_mm:Math.max(0,Number.parseFloat(Z_.value)||0),align_min_wall_mm:Math.max(.4,Number.parseFloat(Q_.value)||.8)}}function wS(e){b_.checked=!!e.spar_hole_enabled,x_.checked=e.spar_show_rod!==!1,D_.value=String(e.spar_hole_diameter_mm??5),O_.value=String(e.spar_hole_depth_mm??240),j_.value=String(e.spar_hole_depth_mm??240),k_.value=String(e.spar_hole_offset_x_mm??0),A_.value=String(e.spar_hole_offset_y_mm??0),U_.value=String(e.spar_hole_tolerance_mm??.2),P_.value=String(Math.max(1,Math.min(4,e.split_parts||1))),F_.value=e.split_active_part||`all`,I_.value=String(Math.max(12,Math.min(88,e.split_ratio_pct??50))),L_.textContent=`${I_.value}%`,R_.value=String(Math.max(0,e.split_explode_gap_mm??0)),z_.textContent=`${R_.value} mm`,W_.value=e.align_shape||`round`,G_.value=String(Math.max(1,Math.min(2,e.align_count??2))),K_.value=String(e.align_size_mm??3),q_.value=String(e.align_key_length_mm??6),J_.value=String(e.align_height_mm??6),Y_.value=String(e.align_spacing_mm??0),X_.value=String(e.align_clearance_mm??.2),Z_.value=String(e.align_depth_clearance_mm??.5),Q_.value=String(e.align_min_wall_mm??.8)}function TS(){return{ui_style:jm,planform_cosine:_y,planform_center_pct:Number.parseFloat(Dg.value)||45,planform_width_pct:Number.parseFloat(Og.value)||25,locked_span_ratios:[...by],bind_taper:r_.checked,taper_ratio:Number.parseFloat(i_.value)||.457,chord_offset_x_mm:Gh.valueAsNumber||0,chord_offset_y_mm:qh.valueAsNumber||0,global_light_intensity:Yh.valueAsNumber||1.35,view_mode:Ey,wireframe_mode:Ay,heatmap_mode:sv.value||`segment`,structural_material:ay.value||`petg`,site_avg_wind_mps:Number.parseFloat($v.value)||5.5,printer_preset:rv.value||`bambu_256`,printer_max_z_mm:Number.parseFloat(iv.value)||256,blade_preset:yy,gen_preset:Rv?.value||`low_rpm_pmg`,gen_gear_ratio:Math.max(.25,Number.parseFloat(Vv?.value)||1),gen_kv:Number.parseFloat(zv.value)||35,gen_r_int:Number.parseFloat(Bv.value)||.8,gen_r_load:Number.parseFloat(Hv.value)||12,exp_data_log:fy.value||``,gearbox:Hx(),nosecone:Xx(),studio_mode:Dy,gearbox_selected_gear:Oy,gearbox_inspector_open:Tb?.classList.contains(`open`)??!0,collective_pitch_deg:cg,winglet:Mx(),flip_blade:lg}}function ES(e){yy=e;for(let[t,n]of[[Mv,`low_wind`],[Nv,`med_kidwind`],[Pv,`scimitar_belly`],[Fv,`high_wind`],[Iv,`schmitz_600`]])t&&t.classList.toggle(`active`,e===n);let t=zp[e];if(Lv&&t){let e=t.sections.mid.airfoil.type===`named`?t.sections.mid.airfoil.name:`NACA 4412`,n=t.sections.root.airfoil.type===`named`?t.sections.root.airfoil.name:`NACA 4412`,r=n===e?e:`${n}→${e}`,i=t.recommended_spar_mm?`${t.recommended_spar_mm} mm CF spar`:`${t.recommended_drivetrain.gear_ratio}:1 drive`;Lv.textContent=`${t.badge} · ${r} · ${i}`,Lv.title=t.description}}function DS(e){_y=!!e.planform_cosine,Dg.value=String(e.planform_center_pct??45),Og.value=String(e.planform_width_pct??25),by.splice(0,by.length,...e.locked_span_ratios??[]),r_.checked=!!e.bind_taper,i_.value=String(e.taper_ratio??.457);let t=e.chord_offset_x_mm??0,n=e.chord_offset_y_mm??0;Gh.value=String(t),Kh.textContent=`${t} mm`,qh.value=String(n),Jh.textContent=`${n} mm`;let r=e.global_light_intensity??1.35;if(Yh.value=String(r),Xh.textContent=`${r.toFixed(2)}×`,km(r),Ey=e.view_mode===`single`?`single`:e.view_mode===`gearbox`?`gearbox`:`rotor`,Vm.classList.toggle(`active`,Ey===`single`),Vm.setAttribute(`aria-pressed`,String(Ey===`single`)),Hm.classList.toggle(`active`,Ey===`rotor`),Hm.setAttribute(`aria-pressed`,String(Ey===`rotor`)),Um?.classList.toggle(`active`,Ey===`gearbox`),Um?.setAttribute(`aria-pressed`,String(Ey===`gearbox`)),e.gearbox?Ux(e.gearbox):Ux(Wp()),e.nosecone?Zx(e.nosecone):Zx(tf()),e.studio_mode===`gearbox`||e.view_mode===`gearbox`){PS(`gearbox`);let t=!!(e.gearbox_inspector_open??!0);e.gearbox_selected_gear!==void 0&&qx(e.gearbox_selected_gear,t),t||(Tb?.classList.remove(`open`),Db?.classList.remove(`active`),Db?.setAttribute(`aria-pressed`,`false`),$C())}else if(e.studio_mode===`nose`)PS(`nose`);else{Dy=`blade`,By?.classList.add(`active`),By?.setAttribute(`aria-selected`,`true`),Vy?.classList.remove(`active`),Vy?.setAttribute(`aria-selected`,`false`),Hy?.classList.remove(`active`),Hy?.setAttribute(`aria-selected`,`false`),document.body.classList.remove(`studio-gearbox-mode`),document.body.classList.remove(`studio-nose-mode`),Tb?.classList.remove(`open`),Uy?.classList.remove(`open`),Db?.classList.remove(`active`),Db?.setAttribute(`aria-pressed`,`false`),Gy?.classList.remove(`active`),Gy?.setAttribute(`aria-pressed`,`false`),qx(null,!1);let e=Z.rotor.radius_mm;Ey===`single`?(ym.position.set(e*.7,e*.55,e*1.35),Cm.target.set(30,0,e*.55)):(ym.position.set(e*.7,e*.55,e*1.35),Cm.target.set(0,0,0)),Cm.update();let t=Math.max(0,e-Z.rotor.hub_radius_mm);Sv&&(Sv.textContent=`R ${e} · L ${t.toFixed(0)} mm · ${Z.rotor.blade_count}B`),Qm&&(Qm.textContent=`R ${e} · L ${t.toFixed(0)} mm · ${Z.rotor.blade_count}B`),Im(),$C(),QC()}Ay=!!e.wireframe_mode,Wm.classList.toggle(`active`,Ay),Wm.setAttribute(`aria-pressed`,String(Ay)),sv.value=e.heatmap_mode||`segment`,ay.value=e.structural_material||`petg`,$v.value=String(e.site_avg_wind_mps??5.5),rv.value=e.printer_preset||`bambu_256`,iv.value=String(e.printer_max_z_mm??256),ES(e.blade_preset||`schmitz_600`),Rv&&(Rv.value=e.gen_preset||`low_rpm_pmg`),Vv&&(Vv.value=String(e.gen_gear_ratio??1)),iS(e.gen_gear_ratio??1),zv.value=String(e.gen_kv??35),Bv.value=String(e.gen_r_int??.8),Hv.value=String(e.gen_r_load??12),fy.value=e.exp_data_log??``,Px(e.collective_pitch_deg??0,!1),Nx(e.winglet),Fx(e.flip_blade??!0,!1)}function OS(e){return bp(Z,CS(),TS(),e||Th.value.trim()||void 0)}function kS(e){try{let t=new Date(e);return Number.isNaN(t.getTime())?`just now`:t.toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`,second:`2-digit`})}catch{return`just now`}}function AS(e=`Auto-saved`){if(!SS){xS!==null&&(clearTimeout(xS),xS=null);try{let t=OS();localStorage.setItem(gp,JSON.stringify(t));let n=kS(t.saved_at);yh.classList.remove(`saving`),yh.textContent=e===`Auto-saved`?`Saved`:e,yh.title=`${e} at ${n} — click to open Projects`,wh.textContent=`${e} at ${n}`}catch{yh.classList.remove(`saving`),yh.textContent=`Local save full`}}}function $(e=`Auto-saved`){SS||(yh.classList.add(`saving`),yh.textContent=`Saving...`,xS!==null&&clearTimeout(xS),xS=setTimeout(()=>{AS(e)},160))}function jS(e,t={}){let n=SS;SS=!0;try{t.commitToHistory!==!1&&_m.commit(e.design),Z=_m.current(),wS(e.fabrication),DS(e.workbench),e.name&&(Th.value=e.name),_S(Z),rS(Z)}finally{SS=n}AS(t.badgePrefix??`Loaded`)}function MS(e){_m.commit(e),Z=_m.current(),_S(Z),rS(Z),$()}function NS(e){if(Ey=e,Vm.classList.toggle(`active`,Ey===`single`),Vm.setAttribute(`aria-pressed`,String(Ey===`single`)),Hm.classList.toggle(`active`,Ey===`rotor`),Hm.setAttribute(`aria-pressed`,String(Ey===`rotor`)),Um?.classList.toggle(`active`,Ey===`gearbox`),Um?.setAttribute(`aria-pressed`,String(Ey===`gearbox`)),Ey===`single`){let e=Z.rotor.radius_mm;ym.position.set(e*.7,e*.55,e*1.35),Cm.target.set(30,0,e*.55)}else if(Ey===`rotor`){let e=Z.rotor.radius_mm;ym.position.set(e*.7,e*.55,e*1.35),Cm.target.set(0,0,0)}else{let e=Gp(Hx()),t=Math.max(120,e.total_span_width_mm);ym.position.set(0,t*.85,t*1.15),Cm.target.set(0,8,0)}Cm.update(),rS(Z),$()}function PS(e){if(Dy=e,By?.classList.toggle(`active`,e===`blade`),By?.setAttribute(`aria-selected`,String(e===`blade`)),Vy?.classList.toggle(`active`,e===`nose`),Vy?.setAttribute(`aria-selected`,String(e===`nose`)),Hy?.classList.toggle(`active`,e===`gearbox`),Hy?.setAttribute(`aria-selected`,String(e===`gearbox`)),e===`gearbox`)document.body.classList.add(`studio-gearbox-mode`),document.body.classList.remove(`studio-nose-mode`),Uy?.classList.remove(`open`),Gy?.classList.remove(`active`),Gy?.setAttribute(`aria-pressed`,`false`),NS(`gearbox`),Tb?.classList.add(`open`),Db?.classList.add(`active`),Db?.setAttribute(`aria-pressed`,`true`),qx(1,!0);else if(e===`nose`)document.body.classList.remove(`studio-gearbox-mode`),document.body.classList.add(`studio-nose-mode`),Tb?.classList.remove(`open`),Db?.classList.remove(`active`),Db?.setAttribute(`aria-pressed`,`false`),qx(null,!1),Uy?.classList.add(`open`),Gy?.classList.add(`active`),Gy?.setAttribute(`aria-pressed`,`true`),Ey=`rotor`,Vm.classList.remove(`active`),Vm.setAttribute(`aria-pressed`,`false`),Hm.classList.add(`active`),Hm.setAttribute(`aria-pressed`,`true`),Um?.classList.remove(`active`),Um?.setAttribute(`aria-pressed`,`false`),$x(Fy),rS(Z);else{document.body.classList.remove(`studio-gearbox-mode`),document.body.classList.remove(`studio-nose-mode`),Tb?.classList.remove(`open`),Db?.classList.remove(`active`),Db?.setAttribute(`aria-pressed`,`false`),Uy?.classList.remove(`open`),Gy?.classList.remove(`active`),Gy?.setAttribute(`aria-pressed`,`false`),qx(null,!1),NS(`rotor`);let e=Z.rotor.radius_mm,t=Math.max(0,e-Z.rotor.hub_radius_mm);Sv&&(Sv.textContent=`R ${e} · L ${t.toFixed(0)} mm · ${Z.rotor.blade_count}B`),Qm&&(Qm.textContent=`R ${e} · L ${t.toFixed(0)} mm · ${Z.rotor.blade_count}B`)}Im(),$C(),QC(),$()}By?.addEventListener(`click`,()=>PS(`blade`)),Vy?.addEventListener(`click`,()=>PS(`nose`)),Hy?.addEventListener(`click`,()=>PS(`gearbox`)),Wy?.addEventListener(`click`,()=>{Uy?.classList.remove(`open`),Gy?.classList.remove(`active`),Gy?.setAttribute(`aria-pressed`,`false`),Im(),$C()}),Gy?.addEventListener(`click`,()=>{let e=Uy?.classList.toggle(`open`);Gy.classList.toggle(`active`,!!e),Gy.setAttribute(`aria-pressed`,String(!!e)),Im(),$C()}),Xy?.querySelectorAll(`[data-nose-profile]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.noseProfile;t&&(Ny=t,rS(Z),$())})}),Zy?.querySelectorAll(`[data-nose-wrap]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.noseWrap;t&&(Py=t,rS(Z),$())})});for(let[e,t]of[[gb,`mounted`],[_b,`cone_only`],[vb,`rear_fit`]])e?.addEventListener(`click`,()=>{Fy=t,$x(t),rS(Z),$()});yb?.addEventListener(`click`,()=>{Iy=!Iy,rS(Z),$()}),bb?.addEventListener(`click`,()=>{jy=!jy,Gm.classList.toggle(`active`,jy),Gm.setAttribute(`aria-pressed`,String(jy)),Fb?.classList.toggle(`active`,jy),Fb?.setAttribute(`aria-pressed`,String(jy)),bb.classList.toggle(`active`,jy),bb.setAttribute(`aria-pressed`,String(jy))}),[Jy,Yy].forEach(e=>{e?.addEventListener(`change`,()=>{rS(Z),$()})}),[Qy,tb,rb,ab,sb,lb].forEach(e=>{e?.addEventListener(`input`,()=>{rS(Z)}),e?.addEventListener(`change`,()=>{$()})});function FS(e){let t=Xx(),n=Yx(Z),r=gf(t,n,e),i=t.hub_fit_mode===`kidwind4_lockrev4`?t.hub_diameter_mm:n.hub_diameter_mm,a=`bladelab-${e===`cuff`?`nose-cuffs-${n.blade_count}B`:`nosecone-${t.aero_profile}-${t.wrap_style}-D${i.toFixed(0)}`}.stl`;LS(r,a,`model/stl`),bh.textContent=`Saved ${a} (${(r.byteLength/1024).toFixed(1)} kB)`}Sb?.addEventListener(`click`,()=>FS(`cone`)),xb?.addEventListener(`click`,()=>FS(`cone`)),wb?.addEventListener(`click`,()=>FS(`cone`)),Cb?.addEventListener(`click`,()=>FS(`cuff`)),Eb?.addEventListener(`click`,()=>{Tb?.classList.remove(`open`),Db?.classList.remove(`active`),Db?.setAttribute(`aria-pressed`,`false`),$C()}),Db?.addEventListener(`click`,()=>{let e=Tb?.classList.toggle(`open`);Db.classList.toggle(`active`,!!e),Db.setAttribute(`aria-pressed`,String(!!e)),$C()}),kb?.addEventListener(`click`,()=>qx(null,!0)),Ab?.addEventListener(`click`,()=>qx(1,!0)),jb?.addEventListener(`click`,()=>qx(2,!0)),Mb?.addEventListener(`click`,()=>qx(3,!0)),Vm.addEventListener(`click`,()=>NS(`single`)),Hm.addEventListener(`click`,()=>NS(`rotor`)),Um?.addEventListener(`click`,()=>PS(`gearbox`)),Rb?.addEventListener(`click`,()=>{PS(Dy===`gearbox`?`blade`:`gearbox`)}),Nb?.addEventListener(`click`,()=>{Ox=`side_by_side`,Nb.classList.add(`active`),Pb?.classList.remove(`active`),zb?.classList.add(`active`),Bb?.classList.remove(`active`),rS(Z),$()}),Pb?.addEventListener(`click`,()=>{Ox=`meshed`,Pb.classList.add(`active`),Nb?.classList.remove(`active`),Bb?.classList.add(`active`),zb?.classList.remove(`active`),rS(Z),$()}),Fb?.addEventListener(`click`,()=>{Gm.click(),Fb.classList.toggle(`active`,jy)}),Ib?.addEventListener(`click`,()=>{wx?.click()}),zb?.addEventListener(`click`,()=>{Ox=`side_by_side`,zb.classList.add(`active`),Bb?.classList.remove(`active`),Nb?.classList.add(`active`),Pb?.classList.remove(`active`),Ey===`gearbox`?(rS(Z),$()):PS(`gearbox`)}),Bb?.addEventListener(`click`,()=>{Ox=`meshed`,Bb.classList.add(`active`),zb?.classList.remove(`active`),Pb?.classList.add(`active`),Nb?.classList.remove(`active`),Ey===`gearbox`?(rS(Z),$()):PS(`gearbox`)}),[Hb,Ub,Wb,Gb,Kb,Xb,Zb,Qb,ex,tx,nx,rx,ix,ax,ox,lx,ux,dx,fx,px,mx,hx,_x,vx,yx,bx,xx,Sx].forEach(e=>{e?.addEventListener(`change`,()=>{rS(Z),$()})}),qb?.addEventListener(`click`,()=>{let e=Ty?.opt_gear_ratio||Number.parseFloat(Vv?.value||`3.0`)||3,t=Kp(Hx(),e);Ux(t);let n=Gp(t);Vv&&(Vv.value=String(n.total_ratio),iS(n.total_ratio)),rS(Z),$()}),Jb?.addEventListener(`click`,()=>{let e=Gp(Hx());Vv&&(Vv.value=String(e.total_ratio),iS(e.total_ratio)),aS(Z),$()});function IS(e){let t=Hx(),n=Gp(t),r=tm(t,e),i=`bladelab-${e===`all`?`all-3gears-G${n.total_ratio.toFixed(2)}-m${t.module_mm}`:e===`gear1`?`gear1-rotor-${t.g1_teeth}T-m${t.module_mm}`:e===`gear2`?`gear2-compound-${t.g2_wheel_teeth}T-${t.g2_pinion_teeth}T-m${t.module_mm}`:`gear3-pinion-${t.g3_teeth}T-m${t.module_mm}`}.stl`;LS(r,i,`model/stl`),bh.textContent=`Saved ${i} (${(r.byteLength/1024).toFixed(1)} kB)`}wx?.addEventListener(`click`,()=>IS(`all`)),Tx?.addEventListener(`click`,()=>IS(`gear1`)),Ex?.addEventListener(`click`,()=>IS(`gear2`)),Dx?.addEventListener(`click`,()=>IS(`gear3`)),Wm.addEventListener(`click`,()=>{Ay=!Ay,Wm.classList.toggle(`active`,Ay),Wm.setAttribute(`aria-pressed`,String(Ay)),rS(Z),$()}),Gm.addEventListener(`click`,()=>{jy=!jy,Gm.classList.toggle(`active`,jy),Gm.setAttribute(`aria-pressed`,String(jy)),Fb?.classList.toggle(`active`,jy),Fb?.setAttribute(`aria-pressed`,String(jy)),bb?.classList.toggle(`active`,jy),bb?.setAttribute(`aria-pressed`,String(jy))}),sv.addEventListener(`change`,()=>{rS(Z),$()}),rv.addEventListener(`change`,()=>{let e=rv.value||`bambu_256`;if(e!==`custom`){let t=Lp[e];t&&(iv.value=String(t.max_z_mm))}Bx(Z),$()}),iv.addEventListener(`change`,()=>{rv.value=`custom`,Bx(Z),$()}),av.addEventListener(`click`,()=>{let e=rv.value||`bambu_256`,t=Number.parseFloat(iv.value)||256,n=Rp(Z,CS(),e,t);P_.value=String(n.recommended_split_parts),I_.value=String(n.recommended_split_ratio_pct),rS(Z),$()}),Km.addEventListener(`click`,()=>{if(Dy===`nose`){$x(Fy);return}if(Ey===`gearbox`){let e=Gp(Hx()),t=Math.max(120,e.total_span_width_mm);ym.position.set(0,t*.85,t*1.15),Cm.target.set(0,8,0),Cm.update();return}let e=Z.rotor.radius_mm;ym.position.set(e*.85,e*.65,e*1.35),Cm.target.set(0,0,Ey===`rotor`?0:e*.5),Cm.update()}),qm.addEventListener(`click`,()=>{if(Dy===`nose`){ym.position.set(0,210,.01),Cm.target.set(0,20,0),Cm.update();return}if(Ey===`gearbox`){let e=Gp(Hx()),t=Math.max(120,e.total_span_width_mm);ym.position.set(0,t*1.5,.01),Cm.target.set(0,0,0),Cm.update();return}let e=Z.rotor.radius_mm;ym.position.set(0,e*1.9,.01),Cm.target.set(0,0,Ey===`rotor`?0:e*.5),Cm.update()}),Jm.addEventListener(`click`,()=>{if(Dy===`nose`){ym.position.set(175,22,.01),Cm.target.set(0,22,0),Cm.update();return}if(Ey===`gearbox`){let e=Gp(Hx()),t=Math.max(120,e.total_span_width_mm);ym.position.set(0,12,t*1.3),Cm.target.set(0,10,0),Cm.update();return}let e=Z.rotor.radius_mm;ym.position.set(0,60,e*1.75),Cm.target.set(0,0,Ey===`rotor`?0:e*.5),Cm.update()});function LS(e,t,n){let r=typeof e==`string`?new Blob([e],{type:n}):new Blob([e.buffer],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(i),15e3)}function RS(e,t){let n=JSON.parse(Lx());delete n.explode_gap_mm;let r=md(JSON.stringify(e),JSON.stringify(n)),i,a;try{i=new Float32Array(r.positions),a=new Uint32Array(r.indices)}finally{r.free()}Np(i,e,t);let o=Vx(i,a,32);try{return nm(o.getAttribute(`position`).array,`BladeLab R${e.rotor.radius_mm} Winglet Blade STL`)}finally{o.dispose()}}async function zS(e){let t=uh.value,n=Math.max(1,Number.parseInt(P_.value,10)||1),r=t===`blade`&&n>1&&F_.value!==`all`?`-part${Number.parseInt(F_.value,10)+1}`:``,i=t===`blade`&&e!==`step`&&b_.checked?`-cfhole`:``,a=`bladelab-R${Z.rotor.radius_mm}-B${Z.rotor.blade_count}-${t}${i}${r}`;bh.textContent=`Exporting ${e.toUpperCase()}...`;try{let r=Lx();if(e===`step`)try{let e=t===`blade`&&n>1?_d(JSON.stringify(Z),Lx(void 0,`smooth`)):xd(JSON.stringify(Z),t);LS(e,`${a}.step`,`application/step`),bh.textContent=`Saved ${a}.step (${(new Blob([e]).size/1024).toFixed(1)} kB)`;return}catch(e){console.warn(`In-browser STEP export failed, attempting server fallback:`,e)}if(t===`blade`&&e===`stl`){let e=Mx(),t=e.enabled?RS(Z,e):r===`{}`?Sd(JSON.stringify(Z)):vd(JSON.stringify(Z),r);LS(t,`${a}.stl`,`model/stl`),bh.textContent=`Saved ${a}.stl (${(t.byteLength/1024).toFixed(1)} kB)`;return}if(t===`blade`&&e===`3mf`){let e=r===`{}`?hd(JSON.stringify(Z)):gd(JSON.stringify(Z),r);LS(e,`${a}.3mf`,`application/vnd.ms-package.3dmanufacturing-3dmodel+xml`),bh.textContent=`Saved ${a}.3mf (${(e.byteLength/1024).toFixed(1)} kB)`;return}if(t===`hub`||t===`assembly`){if(e===`stl`)try{let e=bd(JSON.stringify(Z),t);LS(e,`${a}.stl`,`model/stl`),bh.textContent=`Saved ${a}.stl (${(e.byteLength/1024).toFixed(1)} kB)`;return}catch(e){console.warn(`In-browser part STL export failed, attempting server fallback:`,e)}if(e===`3mf`)try{let e=yd(JSON.stringify(Z),t);LS(e,`${a}.3mf`,`application/vnd.ms-package.3dmanufacturing-3dmodel+xml`),bh.textContent=`Saved ${a}.3mf (${(e.byteLength/1024).toFixed(1)} kB)`;return}catch(e){console.warn(`In-browser part 3MF export failed, attempting server fallback:`,e)}}let i=await fetch(`/api/v1/export?format=${e}&part=${t}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(Z)});if(!i.ok){let e=await i.text();throw Error(`HTTP ${i.status}: ${e}`)}let o=new Uint8Array(await i.arrayBuffer()),s=e===`step`?`application/step`:e===`3mf`?`application/vnd.ms-package.3dmanufacturing-3dmodel+xml`:`model/stl`;LS(o,`${a}.${e}`,s),bh.textContent=`Saved ${a}.${e} (${(o.byteLength/1024).toFixed(1)} kB)`}catch(r){let i=Lx();if(e===`step`)try{let e=t===`blade`&&n>1?_d(JSON.stringify(Z),Lx(void 0,`smooth`)):xd(JSON.stringify(Z),t);LS(e,`${a}.step`,`application/step`),bh.textContent=`Saved ${a}.step (${(new Blob([e]).size/1024).toFixed(1)} kB)`;return}catch{}if(e===`stl`)try{let e=t===`hub`||t===`assembly`?bd(JSON.stringify(Z),t):vd(JSON.stringify(Z),i);LS(e,`${a}.stl`,`model/stl`),bh.textContent=`Saved ${a}.stl (${(e.byteLength/1024).toFixed(1)} kB)`;return}catch{}if(e===`3mf`)try{let e=t===`hub`||t===`assembly`?yd(JSON.stringify(Z),t):gd(JSON.stringify(Z),i);LS(e,`${a}.3mf`,`application/vnd.ms-package.3dmanufacturing-3dmodel+xml`),bh.textContent=`Saved ${a}.3mf (${(e.byteLength/1024).toFixed(1)} kB)`;return}catch{}bh.textContent=`Export failed: ${String(r).replace(/<[^>]+>/g,` `).replace(/\s+/g,` `).trim()}`}}for(let e of[b_,x_,D_,O_,k_,A_,P_,F_,I_,R_,U_,W_,G_,K_,q_,J_,Y_,X_,Z_,Q_])e.addEventListener(`input`,()=>{e===O_&&(j_.value=O_.value),rS(Z),$()}),e.addEventListener(`change`,()=>{rS(Z),$()});j_.addEventListener(`input`,()=>{O_.value=String(j_.valueAsNumber),rS(Z),$()});for(let[e,t,n]of[[$_,.1,.1],[ev,.2,.2],[tv,.35,.4]])e.addEventListener(`click`,()=>{X_.value=t.toFixed(2),U_.value=n.toFixed(2),rS(Z),$()});for(let[e,t,n,r]of[[`btn-joint-contour`,`contour`,3,6],[`btn-joint-dovetail`,`dovetail`,3.2,6.5],[`btn-joint-cruciform`,`cruciform`,3.6,6.5],[`btn-joint-snaplock`,`snaplock`,3.4,6],[`btn-joint-tapered`,`tapered`,3.2,6],[`btn-joint-round`,`round`,3,6]])document.getElementById(e)?.addEventListener(`click`,()=>{(Number.parseInt(P_.value,10)||1)<2&&(P_.value=`2`),W_.value=t,t===`contour`?(Q_.value=`1.2`,J_.value=`8.0`):(K_.value=n.toFixed(1),q_.value=r.toFixed(1)),rS(Z),$()});for(let[e,t]of[[S_,4],[C_,5],[w_,6],[T_,8]])e.addEventListener(`click`,()=>{b_.checked=!0,D_.value=t.toFixed(1),rS(Z),$()});E_.addEventListener(`click`,()=>{b_.checked=!0;let e=Math.max(20,Z.rotor.radius_mm-Z.rotor.hub_radius_mm),t=Math.round(e*.85);O_.value=String(t),j_.max=String(Math.round(e)),j_.value=String(t),rS(Z),$()}),B_.addEventListener(`click`,()=>{let e=Math.max(1,Number.parseInt(P_.value,10)||1),t=b_.checked?`-cfhole`:``;bh.textContent=`Exporting ${e} split STL part(s)...`;try{let n=[];for(let r=0;r<e;r++){let i=Lx(r),a=vd(JSON.stringify(Z),i),o=`bladelab-R${Z.rotor.radius_mm}-part${r+1}of${e}${t}.stl`;n.push({bytes:a,fname:o})}n.forEach(({bytes:e,fname:t},n)=>{n===0?LS(e,t,`model/stl`):setTimeout(()=>LS(e,t,`model/stl`),n*180)}),bh.textContent=`Saved ${e} split STL part(s)`}catch(e){bh.textContent=`STL split export failed: ${e instanceof Error?e.message:String(e)}`}});function BS(e=`smooth`){let t=Math.max(1,Number.parseInt(P_.value,10)||1),n=b_.checked&&e===`features`?`-cfhole`:``,r=e===`features`?`-joints`:`-smooth`;bh.textContent=`Exporting ${t} split STEP part(s) (${e})...`;try{let i=[];for(let a=0;a<t;a++){let o=Lx(a,e),s=_d(JSON.stringify(Z),o),c=`bladelab-R${Z.rotor.radius_mm}-part${a+1}of${t}${n}${r}.step`;i.push({stepText:s,fname:c})}i.forEach(({stepText:e,fname:t},n)=>{n===0?LS(e,t,`application/step`):setTimeout(()=>LS(e,t,`application/step`),n*180)}),bh.textContent=`Saved ${t} split STEP part(s) (${e})`}catch(e){bh.textContent=`STEP export failed: ${e instanceof Error?e.message:String(e)}`}}V_?.addEventListener(`click`,()=>BS(`smooth`)),mh?.addEventListener(`click`,()=>BS(`smooth`)),H_?.addEventListener(`click`,()=>BS(`features`)),hh?.addEventListener(`click`,()=>BS(`features`)),dh.addEventListener(`click`,()=>{zS(`stl`)}),fh.addEventListener(`click`,()=>{zS(`3mf`)}),ph.addEventListener(`click`,()=>{zS(`step`)});function VS(){let e=OS(),t=`bladelab-${(e.name?e.name.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``):`R${Z.rotor.radius_mm}-B${Z.rotor.blade_count}`)||`project`}.json`;LS(JSON.stringify(e,null,2),t,`application/json`),bh.textContent=`Saved ${t}`,AS(`Saved`)}gh.addEventListener(`click`,VS),Oh.addEventListener(`click`,VS);function HS(){vh.value=``,vh.click()}_h.addEventListener(`click`,HS),Dh.addEventListener(`click`,HS),vh.addEventListener(`change`,async()=>{let e=vh.files?.[0];if(e)try{let t=Sp(await e.text());t.name||=e.name.replace(/\.json$/i,``),IC=null,LC=null,jS(t,{commitToHistory:!0,badgePrefix:`Loaded`}),bh.textContent=`Loaded ${e.name}`,mv.style.display=`none`}catch(t){let n=t instanceof Error?t.message:String(t);bh.textContent=`Load failed`,mv.textContent=`Could not load ${e.name}: ${n}`,mv.style.display=`block`}}),Ym?.addEventListener(`click`,e=>{e.stopPropagation();let t=lh?.classList.toggle(`open`);Ym.setAttribute(`aria-expanded`,String(!!t))}),document.addEventListener(`click`,e=>{if(lh?.classList.contains(`open`)){let t=e.target,n=t===Ym||!!Ym?.contains(t),r=t===sh||!!sh?.contains(t);lh.contains(t)||n||r||(lh.classList.remove(`open`),Ym?.setAttribute(`aria-expanded`,`false`))}}),window.addEventListener(`keydown`,e=>{e.key===`Escape`&&lh?.classList.contains(`open`)&&(lh.classList.remove(`open`),Ym?.setAttribute(`aria-expanded`,`false`))}),[dh,fh,wb,ph,gh,_h].forEach(e=>{e?.addEventListener(`click`,()=>{lh?.classList.remove(`open`),Ym?.setAttribute(`aria-expanded`,`false`)})});var US=[];function WS(){try{let e=localStorage.getItem(_p);if(!e)return[];let t=JSON.parse(e);return Array.isArray(t)?t.filter(e=>{if(!e||typeof e!=`object`)return!1;let t=e;if(typeof t.id!=`string`||typeof t.name!=`string`)return!1;let n=t.snapshot?.design?.rotor;return!!(n&&typeof n.radius_mm==`number`&&Number.isFinite(n.radius_mm)&&typeof n.blade_count==`number`&&Number.isFinite(n.blade_count))}):[]}catch{return[]}}function GS(e){try{localStorage.setItem(_p,JSON.stringify(e))}catch{}}function KS(){if(Ch.textContent=String(US.length),kh.innerHTML=``,US.length===0){let e=document.createElement(`div`);e.className=`slot-empty`,e.textContent=`No named slots saved yet`,kh.appendChild(e)}else for(let e of US){let t=document.createElement(`div`);t.className=`slot-row`,t.setAttribute(`role`,`listitem`);let n=document.createElement(`div`);n.className=`slot-info`;let r=document.createElement(`span`);r.className=`slot-name`,r.textContent=e.name;let i=document.createElement(`span`);i.className=`slot-sub`;let a=e.snapshot?.design?.rotor,o=e.snapshot?.fabrication,s=o&&o.split_parts>1?`${o.split_parts}-part (${o.align_shape})`:`1-part`;i.textContent=a?`R${a.radius_mm} B${a.blade_count} · ${s} · ${kS(e.saved_at)}`:`Saved · ${kS(e.saved_at)}`,n.append(r,i);let c=document.createElement(`div`);c.className=`slot-actions`;let l=document.createElement(`button`);l.type=`button`,l.className=`btn-mini`,l.textContent=`Load`,l.title=`Load "${e.name}" into workbench`,l.addEventListener(`click`,()=>{try{let t=Sp(JSON.stringify(e.snapshot));t.name=e.name,IC=null,LC=null,jS(t,{commitToHistory:!0,badgePrefix:`Loaded`}),bh.textContent=`Loaded slot "${e.name}"`}catch(e){bh.textContent=`Slot error: ${String(e)}`}});let u=document.createElement(`button`);u.type=`button`,u.className=`btn-mini`,u.textContent=`×`,u.title=`Delete saved slot "${e.name}"`,u.setAttribute(`aria-label`,`Delete saved slot ${e.name}`),u.addEventListener(`click`,()=>{US=wp(US,e.id),GS(US),KS()}),c.append(l,u),t.append(n,c),kh.appendChild(t)}}function qS(e){let t=e===void 0?Sh.classList.toggle(`open`):Sh.classList.toggle(`open`,e);xh.classList.toggle(`active`,t),xh.setAttribute(`aria-expanded`,String(t)),t&&(document.body.classList.remove(`hide-left-dock`),innerWidth<=1180&&document.body.setAttribute(`data-mobile-pane`,`cad`))}xh.addEventListener(`click`,e=>{e.stopPropagation(),qS()}),yh.addEventListener(`click`,e=>{e.stopPropagation(),qS()}),document.addEventListener(`click`,e=>{if(!Sh.classList.contains(`open`))return;let t=e.target;Sh.contains(t)||t===xh||xh.contains(t)||t===yh||AC?.contains(t)||kC?.contains(t)||qS(!1)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&Sh.classList.contains(`open`)&&qS(!1)});var JS=null;function YS(){let e=(bh.textContent||``).trim();!e||e===`Ready`?bh.classList.remove(`toast-visible`):(bh.classList.add(`toast-visible`),JS!==null&&(clearTimeout(JS),JS=null),e.endsWith(`...`)||(JS=setTimeout(()=>{bh.classList.remove(`toast-visible`)},4500)))}typeof MutationObserver<`u`&&new MutationObserver(()=>YS()).observe(bh,{childList:!0,characterData:!0,subtree:!0}),document.addEventListener(`input`,e=>{let t=e.target;t instanceof HTMLInputElement&&t.type===`range`&&dS(t)}),Eh.addEventListener(`click`,()=>{let e=Th.value.trim(),t=OS(e),n=e||`Rotor R${Z.rotor.radius_mm} B${Z.rotor.blade_count}`;US=Cp(US,t,n),Th.value=n,GS(US),KS(),AS(`Saved`),bh.textContent=`Saved slot "${n}"`,OC&&(OC.value=n)}),Th.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),Eh.click())});function XS(e,t,n=!1){e.addEventListener(`input`,()=>{let r=n?Number.parseInt(e.value,10):Number.parseFloat(e.value);if(!Number.isFinite(r)||t===`radius_mm`&&r<=Z.rotor.hub_radius_mm+5||t===`hub_radius_mm`&&(r<0||r>=Z.rotor.radius_mm-5)||t===`blade_count`&&r<1||t===`station_count`&&r<2)return;Z=Mf(_m.current(),t,r);let i=Math.max(0,Z.rotor.radius_mm-Z.rotor.hub_radius_mm);t===`radius_mm`?(Ph&&(Ph.value=String(Z.rotor.radius_mm)),Bh.value=String(Number(i.toFixed(1))),Hh.value=String(Math.round(i)),Uh.textContent=`${i.toFixed(0)} mm`):t===`hub_radius_mm`?(Fh&&(Fh.value=String(Z.rotor.hub_radius_mm)),Bh.value=String(Number(i.toFixed(1))),Hh.value=String(Math.round(i)),Uh.textContent=`${i.toFixed(0)} mm`):t===`blade_count`&&Ih&&(Ih.value=String(Z.rotor.blade_count)),fS(),bS(Z),rS(Z)}),e.addEventListener(`change`,()=>{let r=n?Number.parseInt(e.value,10):Number.parseFloat(e.value);Number.isFinite(r)&&MS(Mf(_m.current(),t,r))})}XS(jh,`radius_mm`),XS(Mh,`hub_radius_mm`),XS(Nh,`blade_count`,!0),XS(Lh,`design_tsr`),XS(Rh,`wind_speed_mps`),XS(zh,`station_count`,!0);function ZS(e,t,n,r=!1){e&&(e.addEventListener(`input`,()=>{t.value=e.value,dS(e);let i=r?Number.parseInt(e.value,10):Number.parseFloat(e.value);if(!Number.isFinite(i)||n===`radius_mm`&&i<=Z.rotor.hub_radius_mm+5||n===`hub_radius_mm`&&(i<0||i>=Z.rotor.radius_mm-5)||n===`blade_count`&&i<1)return;Z=Mf(_m.current(),n,i);let a=Math.max(0,Z.rotor.radius_mm-Z.rotor.hub_radius_mm);Bh.value=String(Number(a.toFixed(1))),Hh.value=String(Math.round(a)),Uh.textContent=`${a.toFixed(0)} mm`,fS(),bS(Z),rS(Z)}),e.addEventListener(`change`,()=>{let t=r?Number.parseInt(e.value,10):Number.parseFloat(e.value);Number.isFinite(t)&&MS(Mf(_m.current(),n,t))}))}ZS(Ph,jh,`radius_mm`),ZS(Fh,Mh,`hub_radius_mm`),ZS(Ih,Nh,`blade_count`,!0),Bh.addEventListener(`change`,()=>{let e=Number.parseFloat(Bh.value);if(Number.isFinite(e)&&e>=10){let t=Z.rotor.hub_radius_mm/Z.rotor.radius_mm,n=Nf(Z,e),r=n.rotor.hub_radius_mm/n.rotor.radius_mm;if(Math.abs(r-t)>1e-9&&by.length>0)for(let e=0;e<by.length;e++)by[e]=kf(jf(by[e],t,r),n.rotor);MS(n)}});var QS=null;Hh.addEventListener(`pointerdown`,()=>{QS=[...by]}),Hh.addEventListener(`input`,()=>{let e=Hh.valueAsNumber;Uh.textContent=`${e} mm`,QS===null&&(QS=[...by]);let t=_m.current(),n=t.rotor.hub_radius_mm/t.rotor.radius_mm;Z=Nf(t,e);let r=Z.rotor.hub_radius_mm/Z.rotor.radius_mm;if(QS.length>0){let e=Math.abs(r-n)>yf;for(let t=0;t<QS.length;t++)by[t]=e?kf(jf(QS[t],n,r),Z.rotor):QS[t]}jh.value=String(Z.rotor.radius_mm),Bh.value=String(e),bS(Z),rS(Z)}),Hh.addEventListener(`change`,()=>{QS=null,MS(Nf(_m.current(),Hh.valueAsNumber))}),Vh.addEventListener(`change`,()=>{let e=Number.parseFloat(Vh.value);Number.isFinite(e)&&MS(Pf(Z,e))}),Gh.addEventListener(`input`,()=>{Kh.textContent=`${Gh.valueAsNumber} mm`,Ix(),$()}),qh.addEventListener(`input`,()=>{Jh.textContent=`${qh.valueAsNumber} mm`,Ix(),$()}),Yh.addEventListener(`input`,()=>{let e=Yh.valueAsNumber||1.35;Xh.textContent=`${e.toFixed(2)}×`,km(e),$()}),eg?.addEventListener(`input`,()=>{Px(eg.valueAsNumber)}),Zh?.addEventListener(`input`,()=>{Px(Zh.valueAsNumber)}),rg?.addEventListener(`click`,()=>Px(0)),ig?.addEventListener(`click`,()=>Px(4)),ag?.addEventListener(`click`,()=>Px(30)),$h?.addEventListener(`click`,()=>Px(30)),og?.addEventListener(`click`,()=>Fx(!lg)),sg?.addEventListener(`click`,()=>Fx(!lg)),ug?.addEventListener(`change`,()=>{dg&&(dg.style.display=ug.checked?`block`:`none`),rS(Z),$()});for(let e of[fg,pg,mg,hg])e?.addEventListener(`input`,()=>{rS(Z),$()}),e?.addEventListener(`change`,()=>{rS(Z),$()});gg.addEventListener(`click`,()=>{MS(If(Z,-5,by))}),_g.addEventListener(`click`,()=>{MS(If(Z,5,by))}),vg.addEventListener(`click`,()=>{MS(Ff(Z,.9,by))}),yg.addEventListener(`click`,()=>{MS(Ff(Z,1.1,by))});function $S(){let e=bg.value,t;if(e===`naca4`){let e=Math.min(30,Math.max(4,Number.parseFloat(Sg.value)||12)),n=Math.min(9.5,Math.max(0,Number.parseFloat(Cg.value)||0));t={type:`naca4`,max_camber:Number((n/100).toFixed(4)),camber_position:n>0?.4:0,thickness_ratio:Number((e/100).toFixed(4))}}else t={type:`named`,name:e};MS(Lf(Z,t))}bg.addEventListener(`change`,$S),Sg.addEventListener(`change`,$S),Cg.addEventListener(`change`,$S);function eC(e){let{rotor:t,distributions:n}=e,r=t.radius_mm>0?t.hub_radius_mm/t.radius_mm:.1;return{root:Ef(n.chord_mm,t,r,0),tip:Ef(n.chord_mm,t,1,1)}}function tC(e,t){let n=e.distributions[t];return n.type===`formula`?Uf(n.expr)?.center??null:null}function nC(){let e=Number.parseFloat(Dg.value)/100,t=Number.parseFloat(Og.value)/100,n=Z;for(let r of[`chord_mm`,`twist_deg`]){let i=tC(Z,r);if(i===null&&r===`twist_deg`)continue;let a=r,o=Kf(Z,i??e),s=o.root[a],c=o.tip[a],l=i===null?.5*(s+c):o.mid[a];n=ep(n,r,Hf(s,c,e,t,l),by)}MS(n)}Tg.addEventListener(`click`,()=>{if(!_y)return;let{root:e,tip:t}=eC(Z),n=wf(Z);n.distributions.chord_mm={type:`linear`,root:e,tip:t};let r=tC(Z,`twist_deg`);if(r!==null){let e=Kf(Z,r);n.distributions.twist_deg={type:`linear`,root:e.root.twist_deg,tip:e.tip.twist_deg}}MS(Rf(Z,n,by))}),Lg.addEventListener(`click`,()=>{MS(ap(Z))}),Eg.addEventListener(`click`,()=>{_y||nC()});for(let e of[Dg,Og])e.addEventListener(`input`,()=>cS(Z,!1)),e.addEventListener(`change`,()=>{_y&&nC()});Yg.addEventListener(`click`,()=>{let e=jx(a_.value,70),t=jx(c_.value,35),n=jx(o_.value,20),r=jx(s_.value,3);MS(Zf(Z,e,t,n,r,by))}),Xg.addEventListener(`click`,()=>{let e=jx(d_.value,1),t=jx(f_.value,6);MS(Xf(Z,e,t,by))}),Zg.addEventListener(`click`,()=>{let e=vS(Z,`chord_mm`),t=vS(Z,`twist_deg`);MS(Qf(Qf(Z,`chord_mm`,e,by),`twist_deg`,t,by))}),Qg.addEventListener(`click`,()=>{let e=__.value.trim()||`70 - 35 * s`,t=v_.value.trim()||`20 - 17 * s`;MS(ep(ep(Z,`chord_mm`,e,by),`twist_deg`,t,by))}),p_.addEventListener(`click`,()=>{gy=`chord_mm`,_S(Z)}),m_.addEventListener(`click`,()=>{gy=`twist_deg`,_S(Z)}),__.addEventListener(`change`,()=>{MS(ep(Z,`chord_mm`,__.value,by))}),v_.addEventListener(`change`,()=>{MS(ep(Z,`twist_deg`,v_.value,by))}),a_.addEventListener(`change`,()=>{let e=Number.parseFloat(a_.value);if(Number.isFinite(e)){if(r_.checked){let t=Number.parseFloat(i_.value)||.5;MS(np(Z,e,t,by))}else if(Z.distributions.chord_mm.type===`linear`){let t=wf(Z);t.distributions.chord_mm={type:`linear`,root:e,tip:Z.distributions.chord_mm.tip},MS(Rf(Z,t,by))}}}),i_.addEventListener(`change`,()=>{if(r_.checked){let e=Number.parseFloat(a_.value)||70,t=Number.parseFloat(i_.value)||.5;MS(np(Z,e,t,by))}}),o_.addEventListener(`change`,()=>{let e=Number.parseFloat(o_.value);if(Number.isFinite(e)&&Z.distributions.twist_deg.type===`linear`){let t=wf(Z);t.distributions.twist_deg={type:`linear`,root:e,tip:Z.distributions.twist_deg.tip},MS(Rf(Z,t,by))}});function rC(e){let t=wf(e);return t.distributions.twist_deg.type===`linear`&&(t.distributions.twist_deg.tip=s_.valueAsNumber),t.distributions.chord_mm.type===`linear`&&(t.distributions.chord_mm.tip=c_.valueAsNumber),Rf(e,t,by)}function iC(){l_.textContent=`${s_.valueAsNumber}°`,u_.textContent=`${c_.valueAsNumber} mm`,Z=rC(_m.current()),bS(Z),rS(Z)}function aC(){MS(rC(_m.current()))}s_.addEventListener(`input`,iC),c_.addEventListener(`input`,iC),s_.addEventListener(`change`,aC),c_.addEventListener(`change`,aC),d_.addEventListener(`change`,()=>{let e=Number.parseFloat(d_.value),t=jx(f_.value,6);Number.isFinite(e)&&e>0&&MS(Xf(Z,e,t,by))}),f_.addEventListener(`change`,()=>{let e=jx(d_.value,1),t=Number.parseFloat(f_.value);Number.isFinite(t)&&MS(Xf(Z,e,t,by))}),document.querySelectorAll(`[data-scrub-for]`).forEach(e=>{let t=e.dataset.scrubFor;if(!t)return;let n=document.getElementById(t);n&&e.addEventListener(`pointerdown`,r=>{r.preventDefault(),e.setPointerCapture(r.pointerId);let i=r.clientX,a=jx(n.value,0),o=jx(n.step,1),s=t===`rotor-blades`||t===`rotor-stations`||n.step===`1`&&Number.isInteger(a),c=n.min===``?void 0:Number.parseFloat(n.min),l=n.max===``?void 0:Number.parseFloat(n.max),u=!1,d=e=>{let t=tp(a,e.clientX-i,o,{shiftKey:e.shiftKey,altKey:!s&&e.altKey},{min:c,max:l});s&&(t=Math.round(t));let r=String(t);n.value!==r&&(u=!0,n.value=r,n.dispatchEvent(new Event(`input`,{bubbles:!0})))},f=()=>{e.removeEventListener(`pointermove`,d),e.removeEventListener(`pointerup`,f),e.removeEventListener(`pointercancel`,f),e.removeEventListener(`lostpointercapture`,f),u&&n.dispatchEvent(new Event(`change`,{bubbles:!0}))};e.addEventListener(`pointermove`,d),e.addEventListener(`pointerup`,f),e.addEventListener(`pointercancel`,f),e.addEventListener(`lostpointercapture`,f)})}),Bm.addEventListener(`click`,()=>{MS(ap(Z))}),Dv.addEventListener(`click`,()=>{try{Sy&&!xy&&(xy=JSON.parse(JSON.stringify(Sy)),Av.disabled=!1);let e={objective:Ev.value===`broadband_tsr`?{mode:`broadband_tsr`,spread_ratio:.2}:{mode:`design_tsr`},locked_span_ratios:Array.from(by),max_iterations:20},t=wd(JSON.stringify(Z),JSON.stringify(e)),n=JSON.parse(t);MS(n.optimized_design);let r=n.delta_cp>=0?`+`:``;Ov.textContent=`Optimized in ${n.evaluations} evals: Cp ${n.initial_cp.toFixed(3)} → ${n.optimized_cp.toFixed(3)} (${r}${n.delta_cp.toFixed(3)}) / P ${n.optimized_power_w.toFixed(1)} W`}catch(e){Ov.textContent=`Optimization error: ${String(e)}`}}),kv.addEventListener(`click`,()=>{Sy&&(xy=JSON.parse(JSON.stringify(Sy)),Av.disabled=!1,aS(Z))}),Av.addEventListener(`click`,()=>{xy=null,Av.disabled=!0,aS(Z)});function oC(e){let{design:t,spec:n}=Bp(Z,e);_y=n.planform.cosine,Dg.value=String(n.planform.center_pct),Og.value=String(n.planform.width_pct),kg.textContent=`${n.planform.center_pct}%`,Ag.textContent=`${n.planform.width_pct}%`;let r=n.recommended_drivetrain.gen_preset,i=Vp[r];Rv.value=r,i&&(zv.value=String(i.kv_rpm_per_v),Bv.value=String(i.r_int_ohm)),Vv.value=String(n.recommended_drivetrain.gear_ratio),Hv.value=String(n.recommended_drivetrain.r_load_ohm),$v.value=String(n.recommended_drivetrain.site_avg_wind_mps),n.recommended_spar_mm&&n.recommended_spar_mm>0&&(b_.checked=!0,D_.value=String(n.recommended_spar_mm)),iS(n.recommended_drivetrain.gear_ratio),ES(e),MS(t)}Mv?.addEventListener(`click`,()=>oC(`low_wind`)),Nv?.addEventListener(`click`,()=>oC(`med_kidwind`)),Pv?.addEventListener(`click`,()=>oC(`scimitar_belly`)),Fv?.addEventListener(`click`,()=>oC(`high_wind`)),Iv?.addEventListener(`click`,()=>oC(`schmitz_600`)),Rv.addEventListener(`change`,()=>{let e=Rv.value,t=Vp[e];t&&e!==`custom`&&(zv.value=String(t.kv_rpm_per_v),Bv.value=String(t.r_int_ohm),Vv.value=String(t.default_gear_ratio),Hv.value=String(t.default_r_load_ohm),iS(t.default_gear_ratio)),aS(Z),$()}),[zv,Bv,Vv,Hv,$v].forEach(e=>{e.addEventListener(`change`,()=>{if((e===zv||e===Bv)&&(Rv.value=`custom`),e===Vv){let e=Math.max(.25,Math.min(20,parseFloat(Vv.value)||1));Vv.value=String(e),iS(e)}aS(Z),$()})}),[{btn:Uv,g:1},{btn:Wv,g:2},{btn:Gv,g:3},{btn:Kv,g:4}].forEach(({btn:e,g:t})=>{e?.addEventListener(`click`,()=>{Vv.value=String(t),iS(t),aS(Z),$()})}),Xv?.addEventListener(`click`,()=>{Ty&&(Vv.value=String(Ty.opt_gear_ratio),Hv.value=String(Ty.opt_r_load_ohm),iS(Ty.opt_gear_ratio),Sy&&Number.isFinite(Sy.peak_tsr)&&Math.abs(Z.rotor.design_tsr-Sy.peak_tsr)>.05?MS(Mf(Z,`design_tsr`,Number(Sy.peak_tsr.toFixed(2)))):(aS(Z),$()))}),Zv?.addEventListener(`click`,()=>{Ty&&(Hv.value=String(Ty.best_r_load_at_current_gear_ohm),aS(Z),$())}),ay.addEventListener(`change`,()=>{aS(Z),sv.value===`wall_stress`&&rS(Z),$()}),fy.addEventListener(`input`,()=>{aS(Z),$()});var sC=document.getElementById(`tab-drawer-gist`),cC=document.getElementById(`tab-drawer-local`),lC=document.getElementById(`drawer-gist-panel`),uC=document.getElementById(`drawer-local-panel`),dC=document.getElementById(`gist-auth-row`),fC=document.getElementById(`gist-token-input`),pC=document.getElementById(`btn-gist-connect`),mC=document.getElementById(`gist-token-help`),hC=document.getElementById(`gist-user-bar`),gC=document.getElementById(`gist-user-login`),_C=document.getElementById(`btn-gist-refresh`),vC=document.getElementById(`btn-gist-disconnect`),yC=document.getElementById(`gist-save-container`),bC=document.getElementById(`gist-design-name`),xC=document.getElementById(`gist-is-public`),SC=document.getElementById(`btn-save-gist`),CC=document.getElementById(`gist-status`),wC=document.getElementById(`gist-designs-list`),TC=document.getElementById(`gist-load-input`),EC=document.getElementById(`btn-gist-load`),DC=document.getElementById(`gist-load-status`),OC=document.getElementById(`cloud-design-name`),kC=document.getElementById(`btn-cloud-save`),AC=document.getElementById(`btn-cloud-open-drawer`),jC=document.getElementById(`cloud-status`),MC=document.getElementById(`cloud-designs-list`);sC?.addEventListener(`click`,()=>{sC.classList.add(`active`),sC.setAttribute(`aria-selected`,`true`),cC?.classList.remove(`active`),cC?.setAttribute(`aria-selected`,`false`),lC&&(lC.style.display=`block`),uC&&(uC.style.display=`none`)}),cC?.addEventListener(`click`,()=>{cC.classList.add(`active`),cC.setAttribute(`aria-selected`,`true`),sC?.classList.remove(`active`),sC?.setAttribute(`aria-selected`,`false`),lC&&(lC.style.display=`none`),uC&&(uC.style.display=`block`)}),AC?.addEventListener(`click`,()=>{qS(!0),sC?.click()});var NC=[];function PC(e){if(wC){if(wC.innerHTML=``,e.length===0){let e=document.createElement(`div`);e.className=`slot-empty`,e.textContent=`No BladeLab Gists saved yet in this account.`,wC.appendChild(e)}else for(let t of e){let e=document.createElement(`div`);e.className=`slot-row`;let n=document.createElement(`div`);n.className=`slot-info`;let r=document.createElement(`div`);r.className=`slot-name`,r.style.display=`flex`,r.style.alignItems=`center`,r.style.gap=`6px`;let i=document.createElement(`span`);i.textContent=t.name;let a=document.createElement(`span`);a.className=`layer-tag`,a.style.fontSize=`10px`,a.textContent=t.is_public?`Public`:`Secret`,t.is_public&&(a.style.color=`var(--accent)`,a.style.borderColor=`var(--accent)`),r.append(i,a);let o=document.createElement(`div`);o.className=`slot-sub`,o.textContent=`${new Date(t.updated_at).toLocaleString(void 0,{month:`short`,day:`numeric`,hour:`2-digit`,minute:`2-digit`})} · ID: ${t.id.slice(0,7)}`,n.append(r,o);let s=document.createElement(`div`);s.className=`slot-actions`;let c=document.createElement(`button`);c.type=`button`,c.className=`btn-mini btn-primary`,c.textContent=`Load`,c.title=`Load Gist "${t.name}" into workbench`,c.addEventListener(`click`,async()=>{try{c.textContent=`Loading...`,c.disabled=!0;let e=await pm(t.id,sm());IC=t.id,LC=e.name,jS(e.snapshot,{commitToHistory:!0,badgePrefix:`Gist`}),bC&&(bC.value=e.name),OC&&(OC.value=e.name),CC&&(CC.textContent=`Loaded "${e.name}"`),c.textContent=`Loaded!`,setTimeout(()=>{c.textContent=`Load`,c.disabled=!1},1200)}catch(e){alert(`Failed to load Gist: ${String(e)}`),c.textContent=`Load`,c.disabled=!1}});let l=document.createElement(`button`);l.type=`button`,l.className=`btn-mini`,l.textContent=`Share`,l.title=`Copy shareable link for any device`,l.addEventListener(`click`,async()=>{let e=hm(t.id);try{await navigator.clipboard.writeText(e),l.textContent=`Copied!`,l.style.color=`var(--status-ok)`,setTimeout(()=>{l.textContent=`Share`,l.style.color=``},1500)}catch{prompt(`Share link:`,e)}});let u=document.createElement(`a`);u.href=t.html_url,u.target=`_blank`,u.rel=`noopener`,u.className=`btn-mini`,u.title=`View raw Gist file & Git history on GitHub`,u.textContent=`↗`,u.style.display=`inline-flex`,u.style.alignItems=`center`,u.style.textDecoration=`none`;let d=document.createElement(`button`);d.type=`button`,d.className=`btn-mini`,d.textContent=`×`,d.title=`Delete Gist "${t.name}"`,d.style.color=`var(--status-err)`,d.addEventListener(`click`,async()=>{if(!confirm(`Delete Gist "${t.name}" permanently from GitHub?`))return;let e=sm();if(e)try{d.textContent=`...`,d.disabled=!0,await mm(e,t.id),IC===t.id&&(IC=null,LC=null),NC=NC.filter(e=>e.id!==t.id),PC(NC),CC&&(CC.textContent=`Deleted Gist "${t.name}"`)}catch(e){alert(`Failed to delete Gist: ${String(e)}`),d.textContent=`×`,d.disabled=!1}}),s.append(c,l,u,d),e.append(n,s),wC.appendChild(e)}}if(MC){if(MC.innerHTML=``,e.length===0){let e=document.createElement(`div`);e.className=`slot-empty`,e.textContent=`No cloud Gists saved yet.`,MC.appendChild(e)}else for(let t of e){let e=document.createElement(`div`);e.className=`bind-row`,e.style.margin=`0`;let n=document.createElement(`span`);n.style.fontSize=`11px`,n.textContent=`${t.name} [${t.is_public?`Public`:`Secret`}]`;let r=document.createElement(`button`);r.type=`button`,r.className=`btn-mini`,r.textContent=`Load`,r.addEventListener(`click`,async()=>{try{r.textContent=`...`;let e=await pm(t.id,sm());IC=t.id,LC=e.name,jS(e.snapshot,{commitToHistory:!0,badgePrefix:`Gist`}),jC&&(jC.textContent=`Loaded ${e.name}`),r.textContent=`Load`}catch(e){alert(`Load failed: ${String(e)}`),r.textContent=`Load`}});let i=document.createElement(`button`);i.type=`button`,i.className=`btn-mini`,i.textContent=`Share`,i.addEventListener(`click`,async()=>{let e=hm(t.id);try{await navigator.clipboard.writeText(e),i.textContent=`Copied!`,setTimeout(()=>{i.textContent=`Share`},1500)}catch{prompt(`Share link:`,e)}}),e.append(n,r,i),MC.appendChild(e)}jC&&(jC.textContent=`GitHub Gists: ${e.length} saved`)}}async function FC(e){CC&&(CC.textContent=`Fetching gists...`);try{NC=await dm(e),PC(NC),CC&&(CC.textContent=`${NC.length} cloud design(s)`)}catch(e){CC&&(CC.textContent=`Fetch error: ${String(e)}`)}}var IC=null,LC=null;async function RC(){let e=sm();if(e)try{pC&&(pC.textContent=`Verifying...`,pC.disabled=!0);let t=await um(e);dC&&(dC.style.display=`none`),mC&&(mC.style.display=`none`),hC&&(hC.style.display=`flex`),gC&&(gC.textContent=`@${t.login}`),yC&&(yC.style.display=`block`),bC&&!bC.value&&(bC.value=`Rotor-R${Z.rotor.radius_mm}-B${Z.rotor.blade_count}`),jC&&(jC.textContent=`Connected as @${t.login}`),await FC(e)}catch(e){console.warn(`GitHub token verification failed:`,e),e instanceof lm&&e.status===401?(cm(null),IC=null,LC=null,dC&&(dC.style.display=`flex`),mC&&(mC.style.display=`block`),hC&&(hC.style.display=`none`),yC&&(yC.style.display=`none`),wC&&(wC.innerHTML=`<div class="slot-empty" style="color: var(--status-err)">Invalid token or expired. Please re-enter your GitHub token.</div>`),jC&&(jC.textContent=`Not connected to GitHub`)):(dC&&(dC.style.display=`none`),mC&&(mC.style.display=`none`),hC&&(hC.style.display=`flex`),gC&&(gC.textContent=`Offline (token saved)`),yC&&(yC.style.display=`block`),wC&&(wC.innerHTML=`<div class="slot-empty">Could not reach GitHub (offline or rate-limited). Token preserved — click Refresh to retry.</div>`),jC&&(jC.textContent=`GitHub offline (token preserved)`))}finally{pC&&(pC.textContent=`Connect`,pC.disabled=!1)}else IC=null,LC=null,dC&&(dC.style.display=`flex`),mC&&(mC.style.display=`block`),hC&&(hC.style.display=`none`),yC&&(yC.style.display=`none`),wC&&(wC.innerHTML=`<div class="slot-empty">Connect your GitHub token to view and save cloud designs</div>`),jC&&(jC.textContent=`Not connected to GitHub`)}pC?.addEventListener(`click`,async()=>{let e=fC?.value.trim()||``;e?(cm(e),fC&&(fC.value=``),await RC()):alert(`Please enter a GitHub personal access token with 'gist' scope.`)}),fC?.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),pC?.click())}),_C?.addEventListener(`click`,()=>{let e=sm();e&&FC(e)}),vC?.addEventListener(`click`,()=>{confirm(`Disconnect GitHub account and remove token from this browser?`)&&(cm(null),RC())});async function zC(){let e=TC?.value.trim();if(!e){DC&&(DC.textContent=`Please enter a Gist ID or URL.`,DC.style.display=`block`,DC.style.color=`var(--status-err)`);return}let t=om(e);if(!t)DC&&(DC.textContent=`Could not parse a valid Gist ID from the input.`,DC.style.display=`block`,DC.style.color=`var(--status-err)`);else try{EC&&(EC.textContent=`Loading...`,EC.disabled=!0),DC&&(DC.textContent=`Fetching Gist ${t.slice(0,7)}...`,DC.style.display=`block`,DC.style.color=`var(--text-muted)`);let e=await pm(t,sm());IC=t,LC=e.name,jS(e.snapshot,{commitToHistory:!0,badgePrefix:`Gist`}),bC&&(bC.value=e.name),OC&&(OC.value=e.name),DC&&(DC.textContent=`Loaded "${e.name}" successfully!`,DC.style.color=`var(--status-ok)`),EC&&(EC.textContent=`Loaded!`),setTimeout(()=>{EC&&(EC.textContent=`Load Gist`,EC.disabled=!1)},1500)}catch(e){console.error(`Failed to load Gist from input:`,e),DC&&(DC.textContent=`Error: ${String(e)}`,DC.style.color=`var(--status-err)`),EC&&(EC.textContent=`Load Gist`,EC.disabled=!1)}}EC?.addEventListener(`click`,zC),TC?.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),zC())});async function BC(){let e=sm();if(!e){qS(!0),sC?.click(),fC?.focus();return}let t=bC?.value.trim()||OC?.value.trim()||`Rotor-R${Z.rotor.radius_mm}-B${Z.rotor.blade_count}`,n=xC?.checked||!1;try{SC&&(SC.textContent=`Saving...`,SC.disabled=!0),kC&&(kC.textContent=`Saving...`,kC.disabled=!0),CC&&(CC.textContent=`Saving to GitHub Gist...`);let r=OS(t),i=IC!==null&&LC===t&&NC.some(e=>e.id===IC),a=await fm(e,t,r,n,i?IC??void 0:void 0);IC=a.id,LC=t,CC&&(CC.textContent=`${i?`Updated`:`Saved`}: ${a.id.slice(0,7)}`),bh&&(bh.textContent=`${i?`Updated`:`Saved`} Gist "${t}"`),AS(`Saved to Gist`),await FC(e),SC&&(SC.textContent=`Saved!`,setTimeout(()=>{SC.textContent=`Save to Gist`,SC.disabled=!1},1500)),kC&&(kC.textContent=`Saved!`,setTimeout(()=>{kC.textContent=`Save to Gist`,kC.disabled=!1},1500))}catch(e){alert(`Failed to save Gist: ${String(e)}`),SC&&(SC.textContent=`Save to Gist`,SC.disabled=!1),kC&&(kC.textContent=`Save to Gist`,kC.disabled=!1),CC&&(CC.textContent=`Save error`)}}SC?.addEventListener(`click`,BC),kC?.addEventListener(`click`,BC),RC();function VC(){let e=_m.undo();e&&(Z=e,_S(Z),rS(Z),$(`Auto-saved`))}function HC(){let e=_m.redo();e&&(Z=e,_S(Z),rS(Z),$(`Auto-saved`))}Lm.addEventListener(`click`,VC),Rm.addEventListener(`click`,HC),zm.addEventListener(`click`,()=>{Th.value=``,IC=null,LC=null,jS(bp(gm,vp(),yp()),{commitToHistory:!0,badgePrefix:`Reset`}),bh.textContent=`Reset to factory default`});var UC=document.getElementById(`top-dock`),WC=document.getElementById(`panel`),GC=document.getElementById(`aero-dock`),KC=document.getElementById(`btn-toggle-left`),qC=document.getElementById(`btn-toggle-right`),JC=document.getElementById(`btn-zen-3d`),YC=document.getElementById(`panel-scroll-container`),XC=document.getElementById(`aero-scroll-container`),ZC=document.querySelectorAll(`#mobile-workspace-nav button[data-mobile-target]`);Cv.addEventListener(`pointermove`,e=>{if(!Sy)return;let t=Cv.getBoundingClientRect();if(t.width<=0)return;let n=fp((e.clientX-t.left)/t.width*320,Sy.sweep,xy?xy.sweep:null,Z.rotor.radius_mm,Z.rotor.wind_speed_mps),r=Cv.querySelector(`.chart-crosshair`);if(r){r.style.display=`block`;let e=r.querySelector(`.ch-line`),t=r.querySelector(`.ch-dot-primary`),i=r.querySelector(`.ch-dot-secondary`);e&&(e.setAttribute(`x1`,n.svg_x.toFixed(1)),e.setAttribute(`x2`,n.svg_x.toFixed(1))),t&&(t.setAttribute(`cx`,n.svg_x.toFixed(1)),t.setAttribute(`cy`,n.svg_y_b.toFixed(1))),i&&(n.svg_y_a===null?i.style.display=`none`:(i.style.display=`block`,i.setAttribute(`cx`,n.svg_x.toFixed(1)),i.setAttribute(`cy`,n.svg_y_a.toFixed(1))))}wv&&(wv.classList.add(`active`),wv.textContent=n.readout)}),Cv.addEventListener(`pointerleave`,()=>{let e=Cv.querySelector(`.chart-crosshair`);e&&(e.style.display=`none`),wv&&(wv.classList.remove(`active`),wv.textContent=`Hover curve to inspect λ, Cp & RPM`)}),ny.addEventListener(`pointermove`,e=>{if(!wy)return;let t=ny.getBoundingClientRect();if(t.width<=0)return;let n=Ip((e.clientX-t.left)/t.width*320,wy),r=ny.querySelector(`.chart-crosshair`);if(r){r.style.display=`block`;let e=r.querySelector(`.ch-line`),t=r.querySelector(`.ch-dot-primary`),i=r.querySelector(`.ch-dot-secondary`);e&&(e.setAttribute(`x1`,n.svg_x.toFixed(1)),e.setAttribute(`x2`,n.svg_x.toFixed(1))),t&&(t.setAttribute(`cx`,n.svg_x.toFixed(1)),t.setAttribute(`cy`,n.svg_y_mech.toFixed(1))),i&&(i.setAttribute(`cx`,n.svg_x.toFixed(1)),i.setAttribute(`cy`,n.svg_y_elec.toFixed(1)))}ry&&(ry.classList.add(`active`),ry.textContent=n.readout)}),ny.addEventListener(`pointerleave`,()=>{let e=ny.querySelector(`.chart-crosshair`);e&&(e.style.display=`none`),ry&&(ry.classList.remove(`active`),ry.textContent=`Hover curve to inspect V, Watts & RPM`)});function QC(){if(!UC)return;let e=Math.max(44,Math.ceil(UC.getBoundingClientRect().height));document.documentElement.style.setProperty(`--top-dock-h`,`${e}px`)}UC&&typeof ResizeObserver<`u`&&new ResizeObserver(()=>QC()).observe(UC),QC();function $C(){let e=innerWidth<=1180,t=document.body.getAttribute(`data-mobile-pane`)||`cad`;if(Dy===`gearbox`){if(WC&&(WC.inert=!0,WC.setAttribute(`aria-hidden`,`true`)),GC&&(GC.inert=!0,GC.setAttribute(`aria-hidden`,`true`)),nh&&(nh.inert=!0,nh.setAttribute(`aria-hidden`,`true`)),rh&&(rh.inert=!0,rh.setAttribute(`aria-hidden`,`true`)),Tb){let e=Tb.classList.contains(`open`);Tb.inert=!e,Tb.setAttribute(`aria-hidden`,String(!e))}Uy&&(Uy.inert=!0,Uy.setAttribute(`aria-hidden`,`true`));return}if(Dy===`nose`){if(WC&&(WC.inert=!0,WC.setAttribute(`aria-hidden`,`true`)),GC&&(GC.inert=!0,GC.setAttribute(`aria-hidden`,`true`)),nh&&(nh.inert=!0,nh.setAttribute(`aria-hidden`,`true`)),rh&&(rh.inert=!0,rh.setAttribute(`aria-hidden`,`true`)),Tb&&(Tb.inert=!0,Tb.setAttribute(`aria-hidden`,`true`)),Uy){let n=e&&t!==`cad`,r=Uy.classList.contains(`open`)&&!n;Uy.inert=!r,Uy.setAttribute(`aria-hidden`,String(!r))}return}if(Tb&&(Tb.inert=!0,Tb.setAttribute(`aria-hidden`,`true`)),Uy&&(Uy.inert=!0,Uy.setAttribute(`aria-hidden`,`true`)),jm===`atelier`){let n=e?t===`canvas`:Nm,r=Mm===3;if(nh&&(nh.inert=n,nh.setAttribute(`aria-hidden`,String(n))),rh&&(rh.inert=n,rh.setAttribute(`aria-hidden`,String(n))),WC){let e=n||r;WC.inert=e,WC.setAttribute(`aria-hidden`,String(e))}if(GC){let e=n||!r;GC.inert=e,GC.setAttribute(`aria-hidden`,String(e))}JC?.classList.toggle(`active`,Nm),JC?.setAttribute(`aria-pressed`,String(Nm));return}nh&&(nh.inert=!0,nh.setAttribute(`aria-hidden`,`true`)),rh&&(rh.inert=!0,rh.setAttribute(`aria-hidden`,`true`));let n=e?t!==`cad`:document.body.classList.contains(`hide-left-dock`),r=e?t!==`aero`:document.body.classList.contains(`hide-right-dock`);WC&&(WC.inert=n,WC.setAttribute(`aria-hidden`,String(n))),GC&&(GC.inert=r,GC.setAttribute(`aria-hidden`,String(r))),KC?.classList.toggle(`active`,!n),KC?.setAttribute(`aria-pressed`,String(!n)),qC?.classList.toggle(`active`,!r),qC?.setAttribute(`aria-pressed`,String(!r));let i=document.body.classList.contains(`hide-left-dock`)&&document.body.classList.contains(`hide-right-dock`);JC?.classList.toggle(`active`,i),JC?.setAttribute(`aria-pressed`,String(i))}KC?.addEventListener(`click`,()=>{document.body.classList.toggle(`hide-left-dock`),$C(),QC()}),qC?.addEventListener(`click`,()=>{document.body.classList.toggle(`hide-right-dock`),$C()}),JC?.addEventListener(`click`,()=>{jm===`atelier`?(Nm=!Nm,document.body.classList.toggle(`atelier-sheet-hidden`,Nm),Im(),$C(),QC()):(document.body.classList.contains(`hide-left-dock`)&&document.body.classList.contains(`hide-right-dock`)?document.body.classList.remove(`hide-left-dock`,`hide-right-dock`):document.body.classList.add(`hide-left-dock`,`hide-right-dock`),$C(),QC())});function ew(e,t,n,r){let i=document.querySelectorAll(`${e} button[data-scroll-target]`);function a(e){if(e){for(let t of n){let n=document.getElementById(t);if(!n)continue;let r=t===e;n.classList.toggle(`tab-active`,r),r&&(n.classList.remove(`collapsed`),n.querySelector(`[data-collapse-section]`)?.setAttribute(`aria-expanded`,`true`))}i.forEach(t=>{let n=t.dataset.scrollTarget===e;t.classList.toggle(`active`,n),n?t.setAttribute(`aria-current`,`true`):t.removeAttribute(`aria-current`)}),t&&(t.scrollTop=0),r?.(e)}}return i.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.scrollTarget;t&&a(t)})}),n[0]&&a(n[0]),{activateSectionTab:a}}var tw=new Set([`layer1-distributions`,`layer2-planform`,`layer2-sections`,`layer3-stations`]),{activateSectionTab:nw}=ew(`#panel-section-nav`,YC,[`layer1-rotor`,`layer1-distributions`,`layer2-planform`,`layer2-sections`,`layer-fabrication`,`layer3-stations`],e=>{tw.has(e)&&(Pm=e)});ew(`#aero-section-nav`,XC,[`layer-aero`,`layer-aero-aep`,`layer-aero-struct`,`layer-aero-cloud`]);var rw={1:`01 WIND`,2:`02 SHAPE`,3:`03 AERO`,4:`04 PRINT`};function iw(e){if(Mm=e,document.body.setAttribute(`data-atelier-step`,String(e)),ch.forEach(t=>{let n=Number(t.dataset.wizardStep)===e;t.classList.toggle(`active`,n),t.setAttribute(`aria-selected`,String(n))}),ih&&(ih.textContent=rw[e]),ah&&(ah.textContent=`STEP ${e}/4`),oh&&(oh.disabled=e===1),sh){let t=e===4;sh.textContent=t?`EXPORT ✓`:`NEXT →`,sh.classList.toggle(`is-export`,t)}if(e===1?nw(`layer1-rotor`):e===2?nw(Pm):e===4&&nw(`layer-fabrication`),(document.body.getAttribute(`data-mobile-pane`)||`cad`)!==`canvas`){let t=e===3?`aero`:`cad`;document.body.setAttribute(`data-mobile-pane`,t),ZC.forEach(e=>{let n=(e.dataset.mobileTarget||`cad`)===t;e.classList.toggle(`active`,n),e.setAttribute(`aria-pressed`,String(n))})}$C()}function aw(e,t={}){jm=e,document.body.setAttribute(`data-ui-style`,e);let n=e===`atelier`;if(Xm?.classList.toggle(`active`,n),Xm?.setAttribute(`aria-pressed`,String(n)),Zm?.classList.toggle(`active`,!n),Zm?.setAttribute(`aria-pressed`,String(!n)),t.persist!==!1&&typeof localStorage<`u`)try{localStorage.setItem(hp,e)}catch{}Fm(e),n&&iw(Mm),Im(),$C(),QC(),t.rerender!==!1&&(rS(Z),yS(Z))}Xm?.addEventListener(`click`,()=>aw(`atelier`)),Zm?.addEventListener(`click`,()=>aw(`dark`)),ch.forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.wizardStep);t>=1&&t<=4&&iw(t)})}),oh?.addEventListener(`click`,()=>{Mm>1&&iw(Mm-1)}),sh?.addEventListener(`click`,e=>{if(Mm<4)iw(Mm+1);else{e.stopPropagation();let t=lh?.classList.toggle(`open`);Ym?.setAttribute(`aria-expanded`,String(!!t))}}),document.querySelectorAll(`button[data-collapse-section]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`section`);if(!t)return;let n=t.classList.toggle(`collapsed`);e.setAttribute(`aria-expanded`,String(!n))})}),ZC.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.mobileTarget||`cad`;document.body.setAttribute(`data-mobile-pane`,t),ZC.forEach(t=>{let n=t===e;t.classList.toggle(`active`,n),t.setAttribute(`aria-pressed`,String(n))}),jm===`atelier`&&(t===`aero`?iw(3):t===`cad`&&Mm===3&&iw(1)),$C()})}),$C(),addEventListener(`keydown`,e=>{let t=(document.activeElement?.tagName||``).toLowerCase(),n=t===`input`||t===`textarea`||t===`select`;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`z`)e.shiftKey?(e.preventDefault(),HC()):(e.preventDefault(),VC());else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`y`)e.preventDefault(),HC();else if(!n&&!e.ctrlKey&&!e.metaKey&&!e.altKey){if(Dy===`nose`&&(e.key===`[`||e.key===`]`)){let e=Uy?.classList.toggle(`open`);Gy?.classList.toggle(`active`,!!e),Gy?.setAttribute(`aria-pressed`,String(!!e)),Im(),$C()}else jm===`atelier`&&(e.key===`[`||e.key===`]`)?(Nm=!Nm,document.body.classList.toggle(`atelier-sheet-hidden`,Nm),Im(),$C(),QC()):e.key===`[`?(document.body.classList.toggle(`hide-left-dock`),$C(),QC()):e.key===`]`&&(document.body.classList.toggle(`hide-right-dock`),$C())}});var ow=performance.now();bm.setAnimationLoop(e=>{let t=Math.min(.05,(e-ow)/1e3);if(ow=e,jy&&Q){let e=Sy?.design_point.rpm??300,n=Math.min(8,e*2*Math.PI/60/12);Q.userData.isGearboxGroup?(My+=n*.65*t,Q.children.forEach(e=>{if(e.userData.isGearPivot){let t=Number(e.userData.spinRatio??1),n=Number(e.userData.meshPhaseRad??0);e.rotation.y=My*t+n}})):Q.rotation.y+=n*t}Dy===`nose`&&qy&&Uy?.classList.contains(`open`)&&(Ly+=t*(jy?3.2:1.4),vf(qy,Ry,zy,Ly,jm)),Cm.update(),bm.render(vm,ym)});var sw=new Ss,cw=new G,lw={x:0,y:0};bm.domElement.addEventListener(`pointerdown`,e=>{lw={x:e.clientX,y:e.clientY}}),bm.domElement.addEventListener(`pointermove`,e=>{if(Ey!==`gearbox`||!Q||!Q.userData.isGearboxGroup){bm.domElement.style.cursor=`default`;return}let t=bm.domElement.getBoundingClientRect();cw.x=(e.clientX-t.left)/t.width*2-1,cw.y=-((e.clientY-t.top)/t.height)*2+1,sw.setFromCamera(cw,ym);let n=sw.intersectObjects(Q.children,!0),r=null;for(let e of n)if(e.object instanceof Zr&&e.object.userData.gearIndex){r=e.object.userData.gearIndex;break}r===null?(bm.domElement.style.cursor=`default`,ky!==null&&(ky=null,Kx(Oy))):(bm.domElement.style.cursor=`pointer`,ky!==r&&(ky=r,Kx(r)))}),bm.domElement.addEventListener(`pointerup`,e=>{if(Math.hypot(e.clientX-lw.x,lw.y-e.clientY)>6||Ey!==`gearbox`||!Q||!Q.userData.isGearboxGroup)return;let t=bm.domElement.getBoundingClientRect();cw.x=(e.clientX-t.left)/t.width*2-1,cw.y=-((e.clientY-t.top)/t.height)*2+1,sw.setFromCamera(cw,ym);let n=sw.intersectObjects(Q.children,!0),r=null;for(let e of n)if(e.object instanceof Zr&&e.object.userData.gearIndex){r=e.object.userData.gearIndex;break}r===null?qx(null,!1):qx(r,!0)}),addEventListener(`keydown`,e=>{e.key===`Escape`&&Dy===`gearbox`&&Tb?.classList.contains(`open`)?(Tb.classList.remove(`open`),Db?.classList.remove(`active`),Db?.setAttribute(`aria-pressed`,`false`),$C()):e.key===`Escape`&&Dy===`nose`&&Uy?.classList.contains(`open`)&&(Uy.classList.remove(`open`),Gy?.classList.remove(`active`),Gy?.setAttribute(`aria-pressed`,`false`),Im(),$C())}),addEventListener(`resize`,()=>{ym.aspect=innerWidth/innerHeight,ym.updateProjectionMatrix(),Im(),bm.setSize(innerWidth,innerHeight),QC(),$C()}),addEventListener(`beforeunload`,()=>{AS(`Auto-saved`)}),aw(jm,{persist:!1,rerender:!1}),US=WS(),KS();var uw=!1;try{let e=localStorage.getItem(gp);if(e){let t=Sp(e);jS(t,{commitToHistory:JSON.stringify(t.design)!==JSON.stringify(gm),badgePrefix:`Restored`}),uw=!0}}catch{}uw||(Zx(tf()),_S(Z),rS(Z),AS(`Auto-saved`));var dw=new URLSearchParams(window.location.search).get(`gist`);if(dw){let e=om(dw);e&&(yh.textContent=`Loading Gist...`,pm(e,sm()).then(t=>{IC=e,LC=t.name,jS(t.snapshot,{commitToHistory:!0,badgePrefix:`Gist`}),yh.textContent=`Gist: ${t.name}`,yh.title=`Loaded from GitHub Gist ${e}`,bC&&(bC.value=t.name),OC&&(OC.value=t.name),console.log(`Loaded design from GitHub Gist ${dw} (${t.name})`)}).catch(e=>{console.error(`Failed to load Gist from URL param:`,e),mv.textContent=`Could not load design from Gist URL: ${String(e)}`,mv.style.display=`block`,yh.textContent=`Gist load failed`}))}