/* تكلفة المجمدات — محرك الحساب */
(function(g){
const DEF_SUPPLIES=[['كرتون جينريال 10ك بالهالك',1600],['باليت',334],['كيس',330],['لزق',71],['استرتش',41],['التعبئة بالسيزر',2000],['الورق',500],['زوايا',70],['ستيكر فحص',14],['داتا لوجر',15],['إكراميات',62],['عمولات شراء',840],['فحص / مصاريف أخرى',0]];
const DEF_INPUTS={carton:10,tons:24,usd:52,price:28,waste:0.75,over:10,overPrice:15,truckLoad:5,truckPrice:3500};
function defaults(name){return{name:name,sizeLabel:'حجم 35 فأعلى',inputs:Object.assign({},DEF_INPUTS),supplies:DEF_SUPPLIES.map(function(s){return{name:s[0],v:s[1]}})}}
function n(x){x=parseFloat(String(x).replace(/,/g,''));return isFinite(x)?x:0}
function calc(v){
  var I={};for(var k in v.inputs)I[k]=n(v.inputs[k]);
  var net=I.tons*1000,w=I.waste/100,o=I.over/100;
  var den=(1-w)*(1-o);var raw=den>0?net/den:0;
  var wasteKg=raw*w,overKg=(raw-wasteKg)*o;
  var trucks=I.truckLoad>0?Math.ceil(raw/1000/I.truckLoad-1e-9):0;
  var T=I.tons>0?I.tons:0;
  var buy=I.price*1000,wasteC=T?wasteKg*I.price/T:0,overC=T?overKg*(I.price-I.overPrice)/T:0,trans=T?trucks*I.truckPrice/T:0;
  var rawLines=[{name:'شراء الخام (1 طن)',v:buy},{name:'تكلفة الهالك',v:wasteC},{name:'تكلفة '+(v.sizeLabel||'الحجم الكبير')+' (فرق السعر)',v:overC},{name:'نقل الخام',v:trans}];
  var rawT=buy+wasteC+overC+trans;
  var sup=(v.supplies||[]).map(function(s){return{name:s.name,v:n(s.v)}});
  var supT=sup.reduce(function(a,s){return a+s.v},0);
  var total=rawT+supT,usd=I.usd>0?total/I.usd:0;
  return{I:I,net:net,raw:raw,wasteKg:wasteKg,overKg:overKg,trucks:trucks,buy:buy,wasteC:wasteC,overC:overC,trans:trans,rawLines:rawLines,rawT:rawT,sup:sup,supT:supT,total:total,usd:usd,
    kg:total/1000,kgUsd:usd/1000,carton:total/1000*I.carton,cartonUsd:usd/1000*I.carton,cont:total*I.tons,contUsd:usd*I.tons,
    rawPct:total?rawT/total*100:0,supPct:total?supT/total*100:0}
}
g.FC={calc:calc,defaults:defaults,DEF_SUPPLIES:DEF_SUPPLIES,DEF_INPUTS:DEF_INPUTS,num:n};
if(typeof module!=='undefined')module.exports=g.FC;
})(typeof window!=='undefined'?window:globalThis);
