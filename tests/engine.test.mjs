import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultConfig,evaluate,financialView,simulateRound,stateBefore,optimize,alternatives,reconcile,normalizeConfig,initialState} from '../lib/bimo/engine.mjs';
import {energyComparison,runOpenAIAgent,TOOLS,executeTool} from '../lib/bimo/agent.mjs';
const close=(a,b,t=1e-5)=>assert.ok(Math.abs(a-b)<t,a+' differs from '+b);
test('import schema drops credentials and invalid rolls while preserving real zeros',()=>{
  const c=defaultConfig();c.apiKey='private-placeholder';c.search.apiKey='private-placeholder';c.rounds[5].rolls.haccp=9;c.rounds[5].apiKey='private-placeholder';c.actuals[3].net=0;
  const safe=normalizeConfig(c);assert.ok(!JSON.stringify(safe).includes('private-placeholder'));assert.equal(safe.rounds[5].rolls.haccp,null);assert.equal(safe.actuals[3].net,0);
  assert.doesNotThrow(()=>normalizeConfig({rounds:{5:{purchases:null}}}));
});
test('P1 D pays repair and overtime without charging setup again',()=>{
  const c=defaultConfig();c.rounds[1].choices.repair='D';
  const r=evaluate(c,1);assert.equal(r.expenses.find(x=>x.label.startsWith('P1')).amount,120);
  assert.ok(!r.expenses.some(x=>x.label==='Changements de série'&&x.amount===3.5));
});
test('risk pilot retains safety investment despite its lower incident-free profit',async()=>{
  const c=defaultConfig(),r=await optimize(c,{trials:192});
  assert.ok(r.best.plan[0].decision.purchases.includes('safety'));
  assert.equal(r.best.plan[0].decision.choices.haccp,'A');assert.equal(r.best.plan[1].decision.choices.extension,'C');assert.equal(r.meta.pilotTrials,32);
});
test('confirmed numeric benchmarks, exact thresholds and once-only bonuses',()=>{
  const c=defaultConfig(),r3=evaluate(c,3),r4=evaluate(c,4),r5=evaluate(c,5),r6=evaluate(c,6);
  close(r3.net,71.66784);close(r5.net,742.18246);close(r6.net,1184.98246);
  close(r3.rows[1].transfer,316.928);close(r5.rows[1].transfer,56.832);close(r6.rows[1].transfer,216.832);
  close(r6.service,.9626735393258427);assert.equal(r3.operational,40);assert.equal(r4.nc,.01);
  assert.ok(!r4.score.some(x=>x.label.startsWith('Qualité')));
  assert.equal(r5.operational,150);assert.equal(r6.operational,130);
  assert.equal(r5.score.find(x=>x.label.includes('BIO')).amount,40);
  assert.ok(!r6.score.some(x=>x.label.includes('BIO')));
});
test('history cash and profit remain separate, preserving the actual 7.3 gap',()=>{
  const c=defaultConfig();close(reconcile(c).gap,7.3);close(stateBefore(c,4).state.cash,2338.67);
  close(stateBefore(c,4).state.profit,331.37);
  c.actuals[3].cash=0;assert.equal(stateBefore(c,4).state.cash,0);
});
test('all round decision combinations satisfy demand and cash identities',()=>{
  const c=defaultConfig();
  for(let t=1;t<=6;t++)for(const d of alternatives(c,t)){
    const state=stateBefore(c,t).state,r=simulateRound(c,state,t,d);
    for(const p of r.rows){assert.ok(p.delivered<=p.demand+1e-6);assert.ok(p.delivered>=0);}
    close(r.net,r.margin-r.totalExpenses+r.totalGains);close(r.cash,state.cash+r.net);
  }
});
test('new technical investments charge once and activate next tour',()=>{
  const c=defaultConfig();c.rounds[4].purchases=['training','safety'];
  const r4=evaluate(c,4);assert.ok(!r4.state.assets.safety===false);
  close(r4.investment,210); // energy B120 + training30 + safety60
  c.rounds[4].rolls.accident=2;assert.equal(evaluate(c,4).accidents,1);
  c.rounds[5].rolls.accident=2;assert.equal(evaluate(c,5).accidents,0);
  c.rounds[5].purchases=['safety'];assert.ok(!evaluate(c,5).expenses.some(x=>x.label==='Sécurité machines'));
});
test('failure thresholds, spare stock and training duration',()=>{
  const c=defaultConfig();c.rounds[5].rolls.haas=1;
  const r=evaluate(c,5);assert.equal(r.downtime[1],2);
  assert.ok(!r.score.some(x=>x.label.includes('sans pièces')));
  c.rounds[4].purchases=['training'];assert.equal(evaluate(c,5).downtime[1],1.5);
  c.rounds[4].preventive=false;assert.equal(evaluate(c,5).thresholds[1],2);
});
test('HACCP uses d8 boundary and ERP risk is carried to T5 once',()=>{
  const c=defaultConfig();c.rounds[5].choices.haccp='B';c.rounds[5].rolls.haccp=2;
  assert.ok(evaluate(c,5).score.some(x=>x.amount===-60));
  c.rounds[5].rolls.haccp=3;assert.ok(!evaluate(c,5).score.some(x=>x.amount===-60));
  c.rounds[4].choices.erp='B';c.rounds[4].rolls.erp=3;
  assert.equal(evaluate(c,5).score.filter(x=>x.label.includes('traçabilité')).length,1);
  assert.equal(evaluate(c,4).downtime.reduce((a,b)=>a+b),0);
});
test('BIO adapted capacity is consumed on its chosen historical host',()=>{
  const c=defaultConfig();c.rounds[3].choices.bio='B';c.rounds[3].bioHost='HAAS 1';
  const r=evaluate(c,5);close(r.rows[6].native,500);assert.ok(r.rows[3].native<1500);
  close(r.rows[2].native+r.rows[3].native+r.rows[6].native,r.capacity[1]);
  assert.equal(r.expenses.find(x=>x.label.includes('Nettoyage')).amount,8);
});
test('final cards, business case and no repeated innovation',()=>{
  const c=defaultConfig();c.rounds[6].businessCase=true;assert.equal(evaluate(c,6).operational,160);
  c.rounds[6].finalCard='award';assert.equal(evaluate(c,6).operational,240);
  c.rounds[6].finalCard='salmonella';assert.equal(evaluate(c,6).totalDays,0);
  c.rounds[6].finalCard='flood';close(evaluate(c,6).net,1034.98246);
  c.rounds[6].floodPrevention=true;close(evaluate(c,6).net,1109.98246);
});
test('all T6 choices benchmark correctly and C crosses service threshold',()=>{
  const c=defaultConfig(),expected={A:1164.98246,B:1162.98246,C:1184.98246,D:1132.98246};
  for(const [choice,net]of Object.entries(expected)){c.rounds[6].choices.extension=choice;const r=evaluate(c,6);close(r.net,net);assert.equal(r.service>=.95,choice==='C');}
});
test('energy ROI and recurring cost timing',()=>{
  const c=defaultConfig(),costs=energyComparison();
  assert.equal(costs.options[1].roiPercent,0);assert.equal(costs.options[2].total,50);
  c.rounds[4].choices.energy='A';assert.equal(evaluate(c,4).expenses.find(x=>x.label==='Surcoût énergie').amount,80);
  assert.equal(evaluate(c,5).expenses.find(x=>x.label==='Surcoût énergie').amount,40);
});
test('scenario sampler is reproducible; preserves actual observed rolls',()=>{
  const c=defaultConfig(),a=evaluate(c,5,{seed:13,trial:5}),b=evaluate(c,5,{seed:13,trial:5});close(a.net,b.net);
  c.rounds[5].rolls.v1=1;assert.equal(evaluate(c,5,{seed:432,trial:2}).failures[0],true);
});
test('optimizer searches real alternatives, returns uncertainty and correctly applies proposals',async()=>{
  const c=defaultConfig();c.round=6;c.search.technicalPurchases=false;
  const r=await optimize(c,{trials:64,shortlist:16});assert.ok(r.best);assert.ok(r.meta.screened>=4);assert.ok(Number.isFinite(r.best.p10));
  assert.equal(r.best.plan[0].decision.choices.extension,'C');
  const proposal=await executeTool('propose_scenario',{round:6,first:'A',second:null,investments:[]},c);
  assert.equal(proposal.proposal.decision.choices.extension,'A');assert.equal(c.rounds[6].choices.extension,'C');
});
test('OpenAI Responses tool loop executes actual calculator calls and never exposes key in output',async()=>{
  const events=[];let calls=0;const key='not-a-real-secret-key-for-testing';
  const fetcher=async(_url,request)=>{
    calls++;const body=JSON.parse(request.body);
    assert.equal(request.headers.Authorization,'Bearer '+key);assert.equal(body.store,false);
    assert.ok(!JSON.stringify(body).includes(key));
    if(calls===1)return {ok:true,json:async()=>({output:[{type:'function_call',name:'evaluate_scenario',call_id:'call-1',arguments:JSON.stringify({round:5,first:'A',second:'D',investments:[]})}]})};
    const out=body.input.find(x=>x.type==='function_call_output');assert.ok(out);close(JSON.parse(out.output).net,742.18246);
    return {ok:true,json:async()=>({output:[{type:'message',content:[{type:'output_text',text:'Le net calculé est 742,18 k€.'}]}]})};
  };
  const r=await runOpenAIAgent({key,config:defaultConfig(),messages:[{role:'user',content:'Calcule T5'}],fetcher,emit:x=>events.push(x)});
  assert.equal(calls,2);assert.equal(r.toolCount,1);assert.ok(!JSON.stringify(events).includes(key));
  for(const tool of TOOLS){assert.equal(tool.strict,true);assert.equal(tool.parameters.additionalProperties,false);assert.deepEqual(tool.parameters.required,Object.keys(tool.parameters.properties));}
});
test('series costs stay within fixed costs and tiny positive transfers remain useful',()=>{
  const c=defaultConfig();
  c.rounds[5].extraDays[1]=(71.04-5)/(40*.96*.99);
  const r=evaluate(c,5);close(r.rows[1].transfer,4);close(r.setupCostIncludedInFixed,3);
  assert.ok(!r.expenses.some(x=>x.label==='Changements de série'));
  close(r.expenses.find(x=>x.label.startsWith('Coûts fixes')).amount,1340);
  c.rounds[5].allowTransfers=false;close(r.net-evaluate(c,5).net,1.12);
});
test('historical view prioritizes T1 net 181 and T2 cash 2270 without changing scenario arithmetic',()=>{
  const c=defaultConfig(),r1=evaluate(c,1),r2=evaluate(c,2);
  const f1=financialView(c,r1),f2=financialView(c,r2);
  close(f1.net,181);close(f1.cash,2181);assert.equal(f1.netSource,'recorded');
  close(f2.cash,2270);assert.equal(f2.cashSource,'recorded');
  close(financialView(c,r1,'simulation').net,188.1704);close(financialView(c,r2,'simulation').cash,2373);
  close(stateBefore(c,3).state.cash,2270);
  c.actuals[2].cash=0;assert.equal(financialView(c,r2).cash,0);
});
