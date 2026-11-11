(function(){
'use strict';
var VER='1.0.1',KEY='frozen-costs-v1';
var BUILTIN=[['strawberry','فراولة'],['broccoli','بروكلي'],['cauliflower','قرنبيط'],['artichoke','خرشوف']];
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function f0(x){return (Math.round(x)+0).toLocaleString('en-US')}
function f2(x){x=Math.round(x*100)/100+0;return x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function f3(x){x=Math.round(x*1000)/1000+0;return x.toLocaleString('en-US',{minimumFractionDigits:3,maximumFractionDigits:3})}
function d0(x){return '$'+f0(x)}function d2(x){return '$'+f2(x)}
function pct(x){return '<span class="ltr">'+x.toFixed(1)+'%</span>'}
function dash(x,fn){return Math.abs(x)<0.005?'-':fn(x)}
function today(){var d=new Date();return ('0'+d.getDate()).slice(-2)+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+d.getFullYear()}
function load(){var s=null;try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(!s||!s.v){s={cur:'strawberry',v:{}}}
 BUILTIN.forEach(function(b){if(!s.v[b[0]]){var d=FC.defaults(b[1]);d.builtin=true;d.needs=b[0]!=='strawberry';s.v[b[0]]=d}});
 if(!s.order)s.order=BUILTIN.map(function(b){return b[0]});
 Object.keys(s.v).forEach(function(k){if(s.order.indexOf(k)<0)s.order.push(k)});
 if(!s.v[s.cur])s.cur='strawberry';return s}
var S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function V(){return S.v[S.cur]}
var FIELDS=[
 ['sec','الكمية'],['carton','وزن الكرتونة الصافي','كجم'],['tons','صافي الحاوية','طن'],['usd','سعر الدولار','ج'],
 ['sec','الخام'],['price','سعر كيلو الخام','ج / كجم'],['waste','نسبة الهالك','%','فقد وزن طبيعي من الخام'],
 ['sizeLabel','اسم الحجم اللي مش بيدخل الكرتونة','txt'],['over','نسبة {L}','%'],['overPrice','سعر بيع كيلو {L}','ج / كجم'],
 ['sec','نقل الخام'],['truckLoad','حمولة النقلة','طن'],['truckPrice','سعر النقلة','ج']
];
function renderVars(){var h='';S.order.forEach(function(k){var v=S.v[k];if(!v)return;h+='<button class="chip'+(k===S.cur?' on':'')+'" data-k="'+k+'">'+esc(v.name)+'</button>'});
 h+='<button class="chip add" id="addVar">+ صنف جديد</button>';$('#vars').innerHTML=h}
function renderInputs(){var v=V(),L=esc(v.sizeLabel||'الحجم الكبير'),h='';
 FIELDS.forEach(function(f){if(f[0]==='sec'){h+='<div class="sec">'+f[1]+'</div>';return}
  var lab=f[1].replace('{L}',L);
  if(f[2]==='txt'){h+='<div class="f full"><label>'+lab+'</label><div class="in"><input class="txt" data-t="sizeLabel" value="'+esc(v.sizeLabel)+'"></div></div>';return}
  h+='<div class="f"><label>'+lab+'</label><div class="in"><input inputmode="decimal" data-i="'+f[0]+'" value="'+esc(v.inputs[f[0]])+'"><span class="u">'+f[2]+'</span></div>'+(f[3]?'<div class="hint">'+f[3]+'</div>':'')+'</div>'});
 $('#inputs').innerHTML=h}
function renderSupplies(){var v=V(),h='';v.supplies.forEach(function(s,i){h+='<div class="sup"><input data-sn="'+i+'" value="'+esc(s.name)+'" aria-label="اسم البند"><input class="v" inputmode="decimal" data-sv="'+i+'" value="'+esc(s.v)+'" aria-label="ج للطن"><button class="x" data-sd="'+i+'" aria-label="حذف">×</button></div>'});
 h+='<div class="suptot"><span>إجمالي المستلزمات</span><span class="num" id="supTot"></span></div>';$('#supplies').innerHTML=h}
function errs(){return FC.validate(V())}
function markBad(E){document.querySelectorAll('.bad').forEach(function(x){x.classList.remove('bad')});document.querySelectorAll('.emsg').forEach(function(x){x.remove()});
 E.forEach(function(e){var el=e.k?document.querySelector('[data-i="'+e.k+'"]'):document.querySelector('[data-sv="'+e.s+'"]');if(!el)return;var box=e.k?el.parentNode:el.parentNode;(e.k?el.parentNode:el).classList.add('bad');
  var m=document.createElement('div');m.className='emsg';m.textContent=e.msg.replace(/^[^:]*: /,'');if(e.k)box.insertAdjacentElement('afterend',m);else box.insertAdjacentElement('afterend',m)})}
function renderLive(){var v=V(),r=FC.calc(v),E=FC.validate(v);markBad(E);
 $('#net').textContent=r.I.carton+' ك · '+r.I.tons+' طن · الدولار '+r.I.usd;
 var bad=E.length>0;document.body.classList.toggle('invalid',bad);
 if(bad){$('#sum').innerHTML='<div class="lbl">تكلفة الطن الصافي ظهر الحاوية — '+esc(v.name)+'</div><div class="big"><span class="egp num">—</span></div><div class="err"><b>مفيش حساب لحد ما تصحح الخانات المعلّمة:</b><ul>'+E.map(function(e){return '<li>'+esc(e.msg)+'</li>'}).join('')+'</ul></div>';
  var st0=$('#supTot');if(st0)st0.textContent='—';$('#breakdown').innerHTML='<h2>المجمل</h2><div class="hint">هيظهر بعد تصحيح المدخلات.</div>';
  var n0=$('#notice');n0.hidden=true;$('#bDel').hidden=!!v.builtin;return}
 $('#sum').innerHTML='<div class="lbl">تكلفة الطن الصافي ظهر الحاوية — '+esc(v.name)+'</div><div class="big"><span class="egp num">'+f0(r.total)+'<i>ج</i></span><span class="usd num">'+d2(r.usd)+'</span></div>'+
 '<div class="kpis"><div class="kpi"><span>الكيلو</span><b class="num">'+f2(r.kg)+' ج</b><em class="num">'+'$'+f3(r.kgUsd)+'</em></div><div class="kpi"><span>الكرتونة '+r.I.carton+' ك</span><b class="num">'+f2(r.carton)+' ج</b><em class="num">'+d2(r.cartonUsd)+'</em></div><div class="kpi"><span>الحاوية '+r.I.tons+' طن</span><b class="num">'+f0(r.cont)+' ج</b><em class="num">'+d0(r.contUsd)+'</em></div></div>';
 var st=$('#supTot');if(st)st.textContent=f0(r.supT)+' ج';
 var rows='';r.rawLines.forEach(function(l){rows+='<tr><td>'+esc(l.name)+'</td><td class="v num">'+f0(l.v)+'</td><td class="v num">'+pct(r.total?l.v/r.total*100:0)+'</td></tr>'});
 $('#breakdown').innerHTML='<h2>المجمل</h2><div class="bar"><i style="width:'+r.rawPct+'%"></i><i style="width:'+r.supPct+'%"></i></div><div class="bk"><table>'+
 '<tr class="g"><td>إجمالي الخام</td><td class="v num">'+f0(r.rawT)+'</td><td class="v num">'+pct(r.rawPct)+'</td></tr>'+rows+
 '<tr class="g"><td>إجمالي المستلزمات</td><td class="v num">'+f0(r.supT)+'</td><td class="v num">'+pct(r.supPct)+'</td></tr>'+
 '<tr class="t"><td>إجمالي تكلفة الطن</td><td class="v num">'+f0(r.total)+'</td><td class="v num">'+d2(r.usd)+'</td></tr></table>'+
 '<div class="hint" style="font-size:13px;color:#777;margin-top:8px">الخام المطلوب للحاوية '+f0(r.raw)+' كجم · هالك '+f0(r.wasteKg)+' كجم · '+esc(v.sizeLabel)+' '+f0(r.overKg)+' كجم · '+r.trucks+' نقلة</div></div>';
 var n=$('#notice');if(v.needs){n.hidden=false;n.innerHTML='<b>'+esc(v.name)+':</b> الأرقام دي منسوخة من الفراولة كبداية بس — محتاجة أرقامك الفعلية (سعر الخام، الهالك، الحجم، النقل، المستلزمات). <button class="btn ghost" id="bOk" style="padding:3px 10px;font-size:13px;margin-inline-start:6px">تم تحديثها</button>'}else n.hidden=true;
 $('#bDel').hidden=!!v.builtin}
function renderAll(){renderVars();renderInputs();renderSupplies();renderLive();$('#ver').textContent='· v'+VER}
document.addEventListener('input',function(e){var t=e.target,v=V();if(!v)return;
 if(t.dataset.i){v.inputs[t.dataset.i]=t.value;save();renderLive()}
 else if(t.dataset.t){v.sizeLabel=t.value;save();renderLive();document.querySelectorAll('#inputs label').forEach(function(l,i){});clearTimeout(window.__lt);window.__lt=setTimeout(function(){var a=document.activeElement;renderInputs();var x=document.querySelector('[data-t="sizeLabel"]');if(a&&a.dataset.t&&x){x.focus();x.setSelectionRange(x.value.length,x.value.length)}},600)}
 else if(t.dataset.sn!=null){v.supplies[+t.dataset.sn].name=t.value;save()}
 else if(t.dataset.sv!=null){v.supplies[+t.dataset.sv].v=t.value;save();renderLive()}});
document.addEventListener('change',function(e){var t=e.target,v=V();if(!v)return;var k=t.dataset.i,si=t.dataset.sv;if(!k&&si==null)return;
 var x=FC.parse(t.value);if(!isFinite(x))return;var s=String(x);if(s!==t.value.trim()){t.value=s;if(k)v.inputs[k]=s;else v.supplies[+si].v=s;save();renderLive()}});
function blocked(){var E=errs();if(!E.length)return false;alert('صحّح الخانات دي الأول:\n• '+E.map(function(e){return e.msg}).join('\n• '));return true}
document.addEventListener('click',function(e){var t=e.target.closest('button');if(!t)return;var v=V();
 if(t.dataset.k){S.cur=t.dataset.k;save();renderAll();scrollTo(0,0)}
 else if(t.id==='addVar'){var nm=(prompt('اسم الصنف الجديد:')||'').trim();if(!nm)return;var id='v'+Date.now(),d=FC.defaults(nm);d.needs=true;S.v[id]=d;S.order.push(id);S.cur=id;save();renderAll()}
 else if(t.dataset.sd!=null){var i=+t.dataset.sd;if(!confirm('حذف بند «'+v.supplies[i].name+'»؟'))return;v.supplies.splice(i,1);save();renderSupplies();renderLive()}
 else if(t.id==='bAddSup'){v.supplies.push({name:'بند جديد',v:0});save();renderSupplies();renderLive();var ins=document.querySelectorAll('[data-sn]');var l=ins[ins.length-1];l.focus();l.select()}
 else if(t.id==='bOk'){v.needs=false;save();renderLive()}
 else if(t.id==='bRename'){var nm2=(prompt('اسم الصنف:',v.name)||'').trim();if(nm2){v.name=nm2;save();renderAll()}}
 else if(t.id==='bReset'){if(!confirm('ترجع أرقام «'+v.name+'» للأرقام الافتراضية (أرقام تقرير الفراولة)؟'))return;var d2_=FC.defaults(v.name);d2_.builtin=v.builtin;d2_.needs=S.cur!=='strawberry';S.v[S.cur]=d2_;save();renderAll()}
 else if(t.id==='bDel'){if(v.builtin||!confirm('حذف صنف «'+v.name+'» وكل أرقامه؟'))return;delete S.v[S.cur];S.order=S.order.filter(function(k){return k!==S.cur});S.cur='strawberry';save();renderAll()}
 else if(t.id==='bReport'){if(blocked())return;openRep()}
 else if(t.id==='bPrint'||t.id==='rPrint'){if(blocked())return;buildPages();$('#rep').hidden=false;fit();setTimeout(function(){window.print()},350)}
 else if(t.id==='bShare'||t.id==='rShare'){if(blocked())return;sharePdf()}
 else if(t.id==='rClose'){$('#rep').hidden=true}});
/* ---------- report ---------- */
function reportHtml(){var v=V(),r=FC.calc(v),I=r.I,dt=today(),T=I.tons,U=I.usd||1,tot=r.total||1;
 var head=function(t){return '<div class="ph"><div><h1>'+t+'</h1><div class="meta">بتاريخ <span class="ltr">'+dt+'</span> — كرتونة '+I.carton+' ك — الحاوية '+T.toFixed(1)+' طن صافي — الدولار '+I.usd.toFixed(2)+' ج</div></div><span class="tag">تكلفة المجمدات</span></div>'};
 var foot=function(p){return '<div class="pf"><span>التكلفة للمنتج محمّلًا على الحاوية في المحطة، بدون نقل للميناء أو شحن.</span><span>صفحة '+p+' من 2</span></div>'};
 var row=function(n,x,cls){return '<tr'+(cls?' class="'+cls+'"':'')+'><td>'+esc(n)+'</td><td class="n">'+dash(x,f0)+'</td><td class="n">'+dash(x/U,d2)+'</td><td class="n">'+dash(x*T,f0)+'</td><td class="n">'+dash(x*T/U,d0)+'</td><td class="n">'+pct(x/tot*100)+'</td></tr>'};
 var title='التقرير النهائي — تكلفة طن '+esc(v.name)+' مجمدة ظهر الحاوية';
 var p1='<div class="page"><div class="pc">'+head(title)+
 '<h3>الملخص</h3><div class="rsum"><div class="m main"><span>تكلفة الطن الصافي</span><b>'+f0(r.total)+' ج</b><em>'+d2(r.usd)+'</em></div>'+
 '<div class="m"><span>الكيلو</span><b>'+f2(r.kg)+' ج</b><em>$'+f3(r.kgUsd)+'</em></div><div class="m"><span>الكرتونة '+I.carton+' ك</span><b>'+f2(r.carton)+' ج</b><em>'+d2(r.cartonUsd)+'</em></div><div class="m"><span>الحاوية '+T+' طن</span><b>'+f0(r.cont)+' ج</b><em>'+d0(r.contUsd)+'</em></div></div>'+
 '<h3>المجمل</h3><div class="rgrp"><div class="m"><span>الخام — '+pct(r.rawPct)+'</span><b>'+f0(r.rawT)+' ج / طن</b><em>'+d2(r.rawT/U)+' · الحاوية '+f0(r.rawT*T)+' ج</em></div><div class="m"><span>المستلزمات — '+pct(r.supPct)+'</span><b>'+f0(r.supT)+' ج / طن</b><em>'+d2(r.supT/U)+' · الحاوية '+f0(r.supT*T)+' ج</em></div><div class="m t"><span>الإجمالي — <span class="ltr">100%</span></span><b>'+f0(r.total)+' ج / طن</b><em>'+d2(r.usd)+' · الحاوية '+f0(r.cont)+' ج</em></div></div>'+
 '<h3>التفاصيل</h3><table class="rt"><thead><tr><th>البند</th><th>ج / طن</th><th>$ / طن</th><th>ج / حاوية</th><th>$ / حاوية</th><th>% من التكلفة</th></tr></thead><tbody>'+
 '<tr class="gh"><td colspan="6">1) الخام</td></tr>'+r.rawLines.map(function(l){return row(l.name,l.v)}).join('')+row('إجمالي الخام',r.rawT,'st')+
 '<tr class="gh"><td colspan="6">2) مستلزمات التصنيع</td></tr>'+r.sup.map(function(l){return row(l.name,l.v)}).join('')+row('إجمالي المستلزمات',r.supT,'st')+
 row('إجمالي تكلفة الطن الصافي',r.total,'gt')+'</tbody></table>'+
 '<div class="note">الخام المطلوب للحاوية '+f0(r.raw)+' كجم — هالك '+I.waste+'% ('+f0(r.wasteKg)+' كجم) — '+esc(v.sizeLabel)+' '+I.over+'% ('+f0(r.overKg)+' كجم، بيتباع بـ '+I.overPrice+' ج) — '+r.trucks+' نقلة × '+f0(I.truckPrice)+' ج. طريقة الحساب بالتفصيل في الصفحة التالية.</div></div>'+foot(1)+'</div>';
 var L=esc(v.sizeLabel),st=[
 ['الخام المطلوب','الصافي ÷ ((1 − نسبة الهالك) × (1 − نسبة '+L+'))',f0(r.raw),'كجم للحاوية'],
 ['الهالك','الخام × نسبة الهالك',f0(r.wasteKg),'كجم'],
 [L,'(الخام − الهالك) × نسبة '+L,f0(r.overKg),'كجم'],
 ['عدد نقلات الخام','الخام بالطن ÷ حمولة النقلة ('+I.truckLoad+' طن)، مقرّب لأعلى',String(r.trucks),'نقلة'],
 ['شراء الخام للطن','سعر كيلو الخام × 1,000',f0(r.buy),'ج / طن'],
 ['تكلفة الهالك للطن','وزن الهالك × سعر الخام ÷ أطنان الصافي',f0(r.wasteC),'ج / طن'],
 ['تكلفة '+L+' للطن','وزن '+L+' × (سعر الخام − سعر بيعه) ÷ أطنان الصافي',f0(r.overC),'ج / طن'],
 ['نقل الخام للطن','عدد النقلات × سعر النقلة ÷ أطنان الصافي',f0(r.trans),'ج / طن'],
 ['تكلفة الخام في الطن','مجموع الخطوات 5 + 6 + 7 + 8',f0(r.rawT),'ج / طن'],
 ['مستلزمات التصنيع','مجموع بنود المستلزمات للطن الصافي',f0(r.supT),'ج / طن'],
 ['إجمالي تكلفة الطن','تكلفة الخام + المستلزمات',f0(r.total),'ج / طن'],
 ['بالدولار','الإجمالي ÷ سعر الدولار',d2(r.usd),'$ / طن'],
 ['الكيلو / الكرتونة / الحاوية','الطن ÷ 1,000 — الكيلو × وزن الكرتونة — الطن × أطنان الصافي',f2(r.kg)+' / '+f2(r.carton)+' / '+f0(r.cont),'ج']];
 var p2='<div class="page"><div class="pc">'+head('طريقة حساب تكلفة طن '+esc(v.name)+' مجمدة ظهر الحاوية')+
 '<div class="note" style="margin:0 0 10px;font-size:13.5px">الحساب بيبدأ من الوزن الصافي المطلوب في الكرتون، ويرجع لكمية الخام اللي لازم تتشترى، وبعدين بيجمع كل البنود على الطن الصافي. القيم محسوبة من المدخلات الحالية.</div>'+
 '<table class="rt mt"><thead><tr><th>م</th><th>الخطوة</th><th>طريقة الحساب</th><th>القيمة</th><th>الوحدة</th></tr></thead><tbody>'+
 st.map(function(s,i){return '<tr><td>'+(i+1)+'</td><td class="k">'+s[0]+'</td><td class="fm">'+s[1]+'</td><td class="n" style="font-weight:700;white-space:nowrap">'+s[2]+'</td><td>'+s[3]+'</td></tr>'}).join('')+'</tbody></table>'+
 '<h3>المدخلات</h3><table class="rt"><tbody>'+
 [['وزن الكرتونة الصافي',I.carton+' كجم'],['صافي الحاوية',T+' طن'],['سعر الدولار',I.usd+' ج'],['سعر كيلو الخام',I.price+' ج'],['نسبة الهالك',I.waste+'%'],['نسبة '+L,I.over+'%'],['سعر بيع كيلو '+L,I.overPrice+' ج'],['حمولة النقلة / سعرها',I.truckLoad+' طن / '+f0(I.truckPrice)+' ج']].map(function(x){return '<tr><td>'+x[0]+'</td><td style="text-align:left;font-weight:700">'+x[1]+'</td></tr>'}).join('')+'</tbody></table>'+
 '<h3>الافتراضات</h3><ul><li>الخام بيتشترى من ثلاجات مختلفة، وبيتنقل لثلاجة التعبئة بمصروف نقل بالنقلة.</li><li>الهالك فقد وزن طبيعي من الخام.</li><li>'+L+' مش بيدخل الكرتونة، وبيتباع بسعر أقل، والفرق بيتحمله الطن المعبأ.</li><li>المستلزمات (الكرتون بالهالك، التعبئة، العمولة، الباليت …) محسوبة على الطن الصافي في الكرتون.</li><li>التكلفة للمنتج محمّلًا على الحاوية في المحطة، بدون نقل للميناء أو شحن.</li>'+(v.needs?'<li><b>تنبيه: أرقام هذا الصنف منسوخة من الفراولة ولم تُحدَّث بعد.</b></li>':'')+'</ul></div>'+foot(2)+'</div>';
 return [p1,p2]}
function shrink(root){root.querySelectorAll('.page').forEach(function(pg){var pc=pg.querySelector('.pc');pc.style.transform='';pc.style.width='';var avail=1123-36-62,h=pc.offsetHeight;if(h>avail){var s=Math.max(0.55,avail/h);pc.style.width=(706/s)+'px';h=pc.offsetHeight;s=Math.max(0.55,avail/h);pc.style.width=(706/s)+'px';pc.style.transformOrigin='top right';pc.style.transform='scale('+s+')'}})}
function buildPages(){$('#rep').hidden=false;$('#pages').innerHTML=reportHtml().map(function(p){return '<div class="pagewrap">'+p+'</div>'}).join('');var w=document.querySelectorAll('.pagewrap .page');w.forEach(function(x){x.style.transform='none'});shrink($('#pages'))}
function fit(){document.querySelectorAll('.pagewrap').forEach(function(w){var pg=w.firstChild,s=Math.min(1,w.clientWidth/794);pg.style.transform='scale('+s+')';w.style.height=(1123*s)+'px'})}
window.addEventListener('resize',function(){if(!$('#rep').hidden)fit()});
function openRep(){buildPages();$('#rep').hidden=false;$('#rep').scrollTop=0;fit()}
var libs=null;function loadLibs(){if(libs)return libs;libs=Promise.all(['html2canvas.min.js','jspdf.umd.min.js'].map(function(s){return new Promise(function(ok,no){var e=document.createElement('script');e.src=s;e.onload=ok;e.onerror=no;document.head.appendChild(e)})}));return libs}
function makePdf(){var wasHidden=$('#rep').hidden;buildPages();$('#rep').hidden=false;
 var holder=document.createElement('div');holder.style.cssText='position:fixed;left:-10000px;top:0;width:794px';holder.innerHTML=reportHtml().join('');document.body.appendChild(holder);shrink(holder);
 return loadLibs().then(function(){return document.fonts?document.fonts.ready:null}).then(function(){var pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true}),pgs=holder.querySelectorAll('.page'),ch=Promise.resolve();
  pgs.forEach(function(p,i){ch=ch.then(function(){return html2canvas(p,{scale:2,backgroundColor:'#fff',useCORS:true}).then(function(c){if(i)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',0.92),'JPEG',0,0,210,297)})})});
  return ch.then(function(){holder.remove();if(wasHidden)$('#rep').hidden=true;else fit();return pdf})})}
function fname(){return 'تكلفة_'+V().name.replace(/\s+/g,'_')+'_'+today()+'.pdf'}
function sharePdf(){$('#busy').hidden=false;makePdf().then(function(pdf){var blob=pdf.output('blob'),name=fname();window.__lastPdf={size:blob.size,name:name};
  var file=null;try{file=new File([blob],name,{type:'application/pdf'})}catch(e){}
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){$('#busy').hidden=true;return navigator.share({files:[file],title:name.replace('.pdf',''),text:'تقرير '+name.replace(/_/g,' ').replace('.pdf','')}).catch(function(){})}
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000);$('#busy').hidden=true})
 .catch(function(e){$('#busy').hidden=true;alert('ماقدرتش أجهز الـ PDF: '+e)})}
window.FCAPP={makePdf:makePdf,state:function(){return S},render:renderAll};
renderAll();
})();
