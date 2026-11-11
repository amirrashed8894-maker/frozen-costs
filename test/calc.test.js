const FC=require('../core.js');const r=FC.calc(FC.defaults('فراولة'));
const R=x=>Math.round(x),f2=x=>x.toFixed(2);const ok=[];
function eq(l,a,b){const p=a===b;ok.push(p);console.log((p?'PASS':'FAIL')+' '+l+': '+a+' (expected '+b+')')}
eq('raw kg',R(r.raw),26868);eq('waste kg',R(r.wasteKg),202);eq('oversize kg',R(r.overKg),2667);eq('trucks',r.trucks,6);
eq('buy',R(r.buy),28000);eq('waste/t',R(r.wasteC),235);eq('over/t',R(r.overC),1444);eq('trans/t',R(r.trans),875);
eq('raw total',R(r.rawT),30555);eq('supplies',R(r.supT),5877);eq('total/t',R(r.total),36432);eq('usd/t',f2(r.usd),'700.61');
eq('kg',f2(r.kg),'36.43');eq('carton',f2(r.carton),'364.32');eq('carton $',f2(r.cartonUsd),'7.01');eq('container',R(r.cont),874357);eq('container $',R(r.contUsd),16815);
eq('raw cont',R(r.rawT*24),733309);eq('sup cont',R(r.supT*24),141048);eq('raw %',r.rawPct.toFixed(1),'83.9');eq('buy %',(r.buy/r.total*100).toFixed(1),'76.9');
eq('over cont $',R(r.overC*24/52),667);eq('sup $/t',f2(r.supT/52),'113.02');
process.exit(ok.every(Boolean)?0:1);
