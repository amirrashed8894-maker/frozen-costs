const FC=require('../core.js');let ok=true;const eq=(l,a,b)=>{const p=Object.is(a,b)||(Number.isNaN(a)&&Number.isNaN(b));ok=ok&&p;console.log((p?'PASS':'FAIL')+' '+l+': '+a+' (expected '+b+')')};
[['28',28],['٢٨',28],['۲۸',28],['28,5',28.5],['٢٨٫٥',28.5],['3,500',3500],['0,75',0.75],['١٢٬٥٠٠',12500],['',NaN],['abc',NaN],['1e9',NaN],['-5',-5]].forEach(([x,y])=>eq('parse '+JSON.stringify(x),FC.parse(x),y));
const d=FC.defaults('x');eq('defaults valid',FC.validate(d).length,0);
const t=k=>v=>{const z=FC.defaults('x');z.inputs[k]=v;return FC.validate(z).map(e=>e.k).join()};
eq('tons 0',t('tons')('0'),'tons');eq('usd empty',t('usd')(''),'usd');eq('waste 100',t('waste')('100'),'waste');eq('over -1',t('over')('-1'),'over');eq('truckLoad 0',t('truckLoad')('0'),'truckLoad');eq('price -1',t('price')('-1'),'price');eq('carton abc',t('carton')('abc'),'carton');eq('price ٢٨ ok',t('price')('٢٨'),'');
const z=FC.defaults('x');z.supplies[0].v='-3';z.supplies[1].v='';eq('supply neg flagged / empty ok',FC.validate(z).map(e=>e.s).join(),'0');
const a=FC.defaults('x');a.inputs.price='٢٨';eq('arabic digits total',Math.round(FC.calc(a).total),36432);
process.exit(ok?0:1);
