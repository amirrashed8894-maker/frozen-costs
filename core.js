/* تكلفة المجمدات — محرك الحساب */
(function(g){
const DEF_SUPPLIES=[['كرتون جينريال 10ك بالهالك',1600],['باليت',334],['كيس',330],['لزق',71],['استرتش',41],['التعبئة بالسيزر',2000],['الورق',500],['زوايا',70],['ستيكر فحص',14],['داتا لوجر',15],['إكراميات',62],['عمولات شراء',840],['فحص / مصاريف أخرى',0]];
const DEF_INPUTS={carton:10,tons:24,usd:52,price:28,waste:0.75,over:10,overPrice:15,truckLoad:5,truckPrice:3500};
function defaults(name){return{name:name,sizeLabel:'حجم 35 فأعلى',inputs:Object.assign({},DEF_INPUTS),supplies:DEF_SUPPLIES.map(function(s){return{name:s[0],v:s[1]}})}}
/* تحويل المدخل لرقم: يقبل الأرقام العربية (٠-٩ و ۰-۹) والفاصلة العشرية العربية «٫» وفاصل الآلاف «٬»؛
   الفاصلة «,» تعتبر فاصل آلاف لو بعدها مجموعات من 3 أرقام (3,500)، وغير كده تعتبر علامة عشرية (28,5 = 28.5). يرجّع NaN لو المدخل مش رقم. */
function parse(x){if(typeof x==='number')return isFinite(x)?x:NaN;
  var s=String(x==null?'':x).trim().replace(/[\u0660-\u0669]/g,function(c){return c.charCodeAt(0)-0x660}).replace(/[\u06F0-\u06F9]/g,function(c){return c.charCodeAt(0)-0x6F0})
    .replace(/\u066B/g,'.').replace(/[\u066C\s\u00A0\u202F]/g,'').replace(/[\u2212\u2013]/g,'-');
  if(s==='')return NaN;
  if(/^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s))s=s.replace(/,/g,'');
  else if(/^[-+]?\d*,\d+$/.test(s))s=s.replace(',','.');
  if(!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s))return NaN;
  return parseFloat(s)}
function n(x){var v=parse(x);return isFinite(v)?v:0}
var RULES={carton:['وزن الكرتونة','gt0'],tons:['صافي الحاوية','gt0'],usd:['سعر الدولار','gt0'],price:['سعر كيلو الخام','ge0'],waste:['نسبة الهالك','pct'],over:['نسبة الحجم الكبير','pct'],overPrice:['سعر بيع الحجم الكبير','ge0'],truckLoad:['حمولة النقلة','gt0'],truckPrice:['سعر النقلة','ge0']};
/* يرجّع قائمة الأخطاء: [{k:'tons',msg:'…'}] أو [{s:3,msg:'…'}] لبنود المستلزمات */
function validate(v){var e=[],I=v.inputs||{};
  Object.keys(RULES).forEach(function(k){var r=RULES[k],x=parse(I[k]),nm=r[0];if(k==='over'||k==='overPrice')nm=nm.replace('الحجم الكبير',v.sizeLabel||'الحجم الكبير');
    if(!isFinite(x)){e.push({k:k,msg:nm+': مكتوب غلط أو فاضي'});return}
    if(r[1]==='gt0'&&!(x>0))e.push({k:k,msg:nm+': لازم يكون أكبر من صفر'});
    else if(r[1]==='ge0'&&x<0)e.push({k:k,msg:nm+': مينفعش يكون بالسالب'});
    else if(r[1]==='pct'&&(x<0||x>=100))e.push({k:k,msg:nm+': لازم تكون صفر أو أكتر، وأقل من 100'})});
  (v.supplies||[]).forEach(function(s,i){var raw=String(s.v==null?'':s.v).trim();if(raw==='')return;var x=parse(raw);
    if(!isFinite(x))e.push({s:i,msg:'بند «'+s.name+'»: مكتوب غلط'});else if(x<0)e.push({s:i,msg:'بند «'+s.name+'»: مينفعش يكون بالسالب'})});
  return e}
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
g.FC={calc:calc,defaults:defaults,DEF_SUPPLIES:DEF_SUPPLIES,DEF_INPUTS:DEF_INPUTS,num:n,parse:parse,validate:validate};
if(typeof module!=='undefined')module.exports=g.FC;
})(typeof window!=='undefined'?window:globalThis);
