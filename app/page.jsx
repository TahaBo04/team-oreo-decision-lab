'use client';

import {useState,useEffect,useMemo,useRef} from 'react';
import {LayoutDashboard,GitBranch,History,BookOpen,ArrowUpRight,ArrowRight,ChevronDown,ChevronRight,
  Check,X,Plus,Play,Download,Upload,RefreshCw,Send,Sparkles,ShieldCheck,SlidersHorizontal,KeyRound,
  AlertTriangle,Info,Activity,Coins,Target,ExternalLink,CheckCircle2,Loader2,FileText,Settings2} from 'lucide-react';
import {defaultConfig,normalizeConfig,evaluate,financialView,stateBefore,optimize,DECISIONS,INVESTMENTS,LINES,RULES,RESEARCH,diagnose,reconcile,explain,VERSION} from '../lib/bimo/engine.mjs';
import {runLocalAssistant} from '../lib/bimo/agent.mjs';

const fmt=(n,d=2)=>Number.isFinite(n)?new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n):'—';
const money=n=>fmt(n)+' k€';
const percent=n=>fmt(n*100)+' %';
const clone=x=>JSON.parse(JSON.stringify(x));
const STORAGE='bimo-decision-lab-v1';
const asset=path=>import.meta.env.BASE_URL+path.replace(/^\//,'');
const CONNECTED_SITE='https://bimo-decision-lab.icyolive17.chatgpt.site';
const NAV=[['dashboard','Tableau de bord',LayoutDashboard],['compare','Laboratoire',GitBranch],['history','Registre des tours',History],['rules','Règles & méthode',BookOpen]];
const TOOLS_LABELS={read_rules:'Lecture des règles',evaluate_scenario:'Calcul du scénario',optimize_horizon:'Recherche de plans',check_history:'Contrôle de l’historique',compare_energy:'Comparaison énergétique',propose_scenario:'Préparation d’un scénario'};
function Tag({children,tone=''}){return <span className={'tag '+tone}>{children}</span>;}
function NumberInput({value,onChange,min,step='any',max,label}){
  return <input type="number" aria-label={label} value={value??''} min={min} max={max} step={step} onChange={e=>onChange(e.target.value===''?null:Number(e.target.value))}/>;
}
function Currency({n}){return <>{fmt(n)} <span>k€</span></>;}
function download(name,text,type='application/json'){
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function DecisionCard({spec,choice,onChange}){
  const selected=spec.options.find(x=>x.code===choice);
  return <section className="decision-card">
    <div className="section-eyebrow">{spec.title.split(' · ')[0]}<span>{spec.source}</span></div>
    <h3>{spec.title.split(' · ')[1]}</h3>
    <div className="option-tabs" role="group" aria-label={spec.title}>
      {spec.options.map(o=><button key={o.code} aria-pressed={o.code===choice} className={o.code===choice?'selected':''} onClick={()=>onChange(o.code)}>
        <span>{o.code}</span><small>{fmt(o.cost,0)} k€</small>{o.code===choice&&<Check size={13}/>}
      </button>)}
    </div>
    <div className="decision-description"><strong>{selected.label}</strong><p>{selected.effect}</p></div>
    <div className="decision-footer"><span>{selected.investment?'Investissement':'Dépense du tour'}</span><b>{money(selected.cost)}</b></div>
  </section>;
}
function KPI({label,value,unit,icon:Icon,detail,tone}){
  return <div className={'kpi '+(tone||'')}><div className="kpi-title"><span>{label}</span><Icon size={17}/></div><div className="kpi-value">{value}<small>{unit}</small></div><p>{detail}</p></div>;
}
function Production({result:r}){
  return <section className="panel production-panel"><div className="panel-header"><div><span className="eyebrow">PRODUCTION</span><h3>Un plan qui respecte vos capacités.</h3></div><Tag>{fmt(r.delivered,0)} tonnes livrées</Tag></div>
    <div className="table-scroll"><table><thead><tr><th>Produit</th><th>Demande <small>t</small></th><th>Interne <small>t</small></th><th>Transfert <small>t</small></th><th>Externe <small>t</small></th><th>Livré <small>t</small></th><th>Marge <small>k€</small></th></tr></thead>
      <tbody>{r.rows.map((p,i)=><tr key={p.name}><td><span className={'product-dot dot-'+i}/>{p.name}</td><td>{fmt(p.demand)}</td><td>{fmt(p.native)}</td><td className={p.transfer>0?'accent-number':''}>{p.transfer>0?fmt(p.transfer):'—'}</td><td>{p.external>0?fmt(p.external):'—'}</td><td><b>{fmt(p.delivered)}</b></td><td>{fmt(p.margin)}</td></tr>)}</tbody>
      <tfoot><tr><td>Total</td><td>{fmt(r.totalDemand)}</td><td></td><td></td><td></td><td>{fmt(r.delivered)}</td><td>{fmt(r.margin)}</td></tr></tfoot></table></div>
    <div className="panel-note"><Info size={14}/><span>Priorité aux marges sur les lignes natives. Transferts sur capacité libre avec leur rendement ; les frais de série sont déjà inclus dans les coûts fixes.</span></div>
  </section>;
}
function Capacity({r}){
  return <section className="panel"><div className="panel-header"><div><span className="eyebrow">DISPONIBILITÉ</span><h3>Trois lignes, trois contraintes.</h3></div><Tag tone="blue">Absence {percent(r.absence)}</Tag></div>
    <div className="capacity-lines">{LINES.map((name,i)=><div className="capacity-row" key={name}><div className="capacity-top"><strong>{name}</strong><b>{fmt(r.capacity[i])} <small>t disponibles</small></b></div><div className="capacity-bar"><div style={{width:Math.min(100,r.availability[i]*r.absenceFactor*100)+'%'}}/></div><div className="capacity-meta"><span>Machine {percent(r.availability[i])}</span><span>Facteur RH {fmt(r.absenceFactor)}</span><span>{fmt(r.downtime[i],1)} j d’arrêt panne</span></div></div>)}</div>
    <details className="formula-detail"><summary>Comprendre le calcul <ChevronDown size={13}/></summary><p>{r.formulas.capacity}</p><p>Le facteur RH est 1 − max(0, absentéisme −4 %). La disponibilité machine et l’absentéisme sont deux données différentes.</p></details>
  </section>;
}
function Finance({r}){
  return <section className="panel finance-panel"><div className="panel-header"><div><span className="eyebrow">COMPTE DU TOUR</span><h3>Chaque euro a sa place.</h3></div><Coins size={20}/></div>
    <div className="ledger"><div className="ledger-lead"><span>Marge produits</span><b>+{money(r.margin)}</b></div>
      {r.expenses.map((x,i)=><div key={i} className="ledger-row"><span>{x.label}<small>{x.source}</small></span><b>−{money(x.amount)}</b></div>)}
      {r.gains.map((x,i)=><div key={'gain'+i} className="ledger-row gain"><span>{x.label}<small>{x.source}</small></span><b>+{money(x.amount)}</b></div>)}
      <div className="ledger-total"><span>Résultat simulé T{r.round}</span><b>{money(r.net)}</b></div></div>
    <div className="panel-note"><Info size={14}/><span>Compte du scénario calculé. Changements de série déjà compris dans les fixes{r.setupCostIncludedInFixed>0?' : '+money(r.setupCostIncludedInFixed)+' à titre informatif':''} ; aucun prélèvement supplémentaire.</span></div>
    <details className="formula-detail"><summary>Formules et trésorerie <ChevronDown size={13}/></summary><p>{r.formulas.net}</p><p>Trésorerie : {r.formulas.cash} = {money(r.cash)}</p><p>Les investissements sont déduits intégralement selon le jeu, avec effets techniques au tour suivant.</p></details>
  </section>;
}
function Score({r}){
  return <section className="panel score-panel"><div className="panel-header"><div><span className="eyebrow">SCORE OPÉRATIONNEL</span><h3>Les points, sans les compter deux fois.</h3></div><b className="score-total">{r.operational>0?'+':''}{r.operational}</b></div>
    {r.score.map((x,i)=><div className="score-row" key={i}><span><CheckCircle2 size={15}/>{x.label}</span><b className={x.amount<0?'red':''}>{x.amount>0?'+':''}{x.amount}</b></div>)}
    <div className="panel-note">Non-conformité : <b>{percent(r.nc)}</b>. Le bonus qualité exige strictement moins de 1 %.</div>
  </section>;
}
function SimulationSettings({config:c,setConfig,result:r}){
  const t=c.round,round=c.rounds[t],assets=stateBefore(c,t).state.assets;
  const edit=(key,val)=>setConfig(prev=>({...prev,rounds:{...prev.rounds,[t]:{...prev.rounds[t],[key]:val}}}));
  const editRoll=(key,val)=>edit('rolls',{...round.rolls,[key]:val});
  const roles=[['v1','V1',10],['haas','HAAS 1',10],['gorreri','Gorreri',10],['accident','Accident',10]];
  const rh=c.rounds[3].choices.rh;
  if(t>=3&&['B','D'].includes(rh))roles.push(['social','Grève',10]);
  if(t===2&&round.choices.ifs==='C')roles.push(['ifs','Départ client',10]);
  if(t===2&&round.choices.plastic!=='A')roles.push(['plastic','Incident plastique',10]);
  if(t===4&&c.rounds[2].choices.ifs==='B')roles.push(['ifs','Certification IFS',10]);
  if(t===4&&round.choices.erp==='B')roles.push(['erp','Traçabilité ERP',10]);
  if(t===5&&round.choices.haccp==='B')roles.push(['haccp','Audit HACCP',8]);
  if(t===5&&round.choices.competition==='B')roles.push(['marketing','Marketing',10]);
  return <details className="panel settings-panel"><summary><span><SlidersHorizontal size={17}/>Investissements, jets et ajustements</span><span className="settings-hint">Configurer <ChevronDown size={15}/></span></summary>
    <div className="settings-body">
      <div className="settings-section"><div className="subheading"><h4>Jets observés</h4><Tag>Cases vides = inconnus</Tag></div>
        <p className="muted">Un jet saisi reste fixe. Sans jet, le tableau affiche un scénario sans incident ; la recherche simule les risques inconnus.</p>
        <div className="dice-grid">{roles.map(([key,label,max])=><label key={key}>{label}<span className="dice-input"><NumberInput label={'Dé '+label} value={round.rolls[key]} min={1} max={max} step={1} onChange={v=>editRoll(key,v)}/><small>d{max}</small></span></label>)}</div>
      </div>
      <div className="settings-section"><div className="subheading"><h4>Achats techniques au T{t}</h4><b>{money(r.investment)} /500 k€</b></div><div className="investment-list">{INVESTMENTS.map(inv=><label key={inv.id} className={assets[inv.id]?'owned':''}>
        <input type="checkbox" disabled={!!assets[inv.id]} checked={!!assets[inv.id]||round.purchases.includes(inv.id)} onChange={e=>edit('purchases',e.target.checked?[...round.purchases,inv.id]:round.purchases.filter(x=>x!==inv.id))}/>
        <span><strong>{inv.name}</strong><small>{inv.effect}</small></span><b>{assets[inv.id]?'Déjà acquis':money(inv.cost)}</b>
      </label>)}</div></div>
      <div className="settings-section"><h4>Réglages du scénario</h4><div className="form-grid">
        <label className="check-control"><input type="checkbox" checked={round.preventive} onChange={e=>edit('preventive',e.target.checked)}/>Préventive complète · 75 k€/tour</label>
        <label className="check-control"><input type="checkbox" checked={round.allowTransfers} onChange={e=>edit('allowTransfers',e.target.checked)}/>Autoriser les transferts rentables</label>
        {t===3&&<label>Ligne hôte BIO B<select value={round.bioHost} onChange={e=>edit('bioHost',e.target.value)}><option>V1</option><option>HAAS 1</option></select></label>}
        {t>=3&&rh==='B'&&<label className="check-control"><input type="checkbox" checked={round.keepTemp} onChange={e=>edit('keepTemp',e.target.checked)}/>Maintenir intérim · 60 k€/tour</label>}
        <label>Autres charges · k€<NumberInput label="Autres charges" value={round.extraCosts} onChange={v=>edit('extraCosts',v||0)}/></label>
        <label>Autres gains · k€<NumberInput label="Autres gains" value={round.extraGains} onChange={v=>edit('extraGains',v||0)}/></label>
        <label>Autres points<NumberInput label="Autres points" value={round.extraPoints} onChange={v=>edit('extraPoints',v||0)}/></label>
        {t>=5&&c.rounds[3].choices.bio==='B'&&<><label>Campagnes BIO<NumberInput label="Campagnes BIO" value={round.bioCampaigns} min={1} step={1} onChange={v=>edit('bioCampaigns',v||1)}/></label><label className="check-control"><input type="checkbox" checked={round.allergenIncident} onChange={e=>edit('allergenIncident',e.target.checked)}/>Carte allergène déclarée · −80 pts</label></>}
        {t===6&&<>
          <label>Affecter les 400 t internes<select value={round.internalLine} onChange={e=>edit('internalLine',e.target.value)}>{LINES.map(l=><option key={l}>{l}</option>)}</select></label>
          <label>Carte finale<select value={round.finalCard} onChange={e=>edit('finalCard',e.target.value)}><option value="none">Aucun effet renseigné</option><option value="unknown">À tirer</option><option value="flood">Inondation</option><option value="award">Prix de l’usine</option><option value="salmonella">Salmonelle</option><option value="subsidy">Subvention écologique</option></select></label>
          <label className="check-control"><input type="checkbox" checked={round.businessCase} onChange={e=>edit('businessCase',e.target.checked)}/>Business case validé par l’animateur · +30 pts</label>
          <label className="check-control"><input type="checkbox" checked={round.floodPrevention} onChange={e=>edit('floodPrevention',e.target.checked)}/>Plan prévention inondation déjà exécuté</label>
          <label>Autres achats verts éligibles · k€<NumberInput value={round.otherGreenInvestments} min={0} onChange={v=>edit('otherGreenInvestments',v||0)}/></label>
        </>}
      </div></div>
      <div className="settings-section"><h4>Événements de ligne supplémentaires</h4><p className="muted">À renseigner pour les cartes dont les effets ne sont pas fournis dans le document.</p><div className="line-adjust-grid">{LINES.map((name,i)=><div key={name}><strong>{name}</strong><label>Autres arrêts · jours<NumberInput value={round.extraDays[i]} min={0} onChange={v=>{const a=[...round.extraDays];a[i]=v||0;edit('extraDays',a);}}/></label><label>Capacité bonus · tonnes<NumberInput value={round.extraCapacity[i]} min={0} onChange={v=>{const a=[...round.extraCapacity];a[i]=v||0;edit('extraCapacity',a);}}/></label></div>)}</div></div>
    </div>
  </details>;
}
function PlanSteps({plan}){
  return <div className="plan-steps">{plan.map(step=><div key={step.round}><span className="step-tour">T{step.round}</span><strong>{Object.values(step.decision.choices).join(' / ')}</strong><small>{DECISIONS[step.round].map(d=>d.options.find(o=>o.code===step.decision.choices[d.key])?.label).join(' · ')}</small>{step.decision.purchases.length>0&&<small>+ {step.decision.purchases.map(id=>INVESTMENTS.find(x=>x.id===id)?.name).join(', ')}</small>}{step.round===6&&['A','C'].includes(step.decision.choices.extension)&&<small>400 t sur {step.decision.internalLine}</small>}</div>)}</div>;
}
function Frontier({items,best}){
  if(items.length<2)return null;
  const xs=items.map(x=>x.mean),ys=items.map(x=>x.p10),minX=Math.min(...xs)-8,maxX=Math.max(...xs)+8,minY=Math.min(...ys)-8,maxY=Math.max(...ys)+8;
  const px=x=>55+(x-minX)/(maxX-minX)*580,py=y=>220-(y-minY)/(maxY-minY)*175;
  return <div className="frontier"><svg viewBox="0 0 690 270" role="img" aria-label="Comparaison du score moyen et du score défavorable des plans simulés">
    {[0,.25,.5,.75,1].map(v=><g key={v}><line x1="55" x2="635" y1={45+175*v} y2={45+175*v} stroke="var(--brand-line)"/><text x="44" y={49+175*v} textAnchor="end">{fmt(maxY-(maxY-minY)*v,0)}</text></g>)}
    <line x1="55" x2="635" y1="220" y2="220" stroke="var(--brand-muted)"/>
    {items.map(x=><circle key={x.id} cx={px(x.mean)} cy={py(x.p10)} r={x.id===best?.id?8:4.5} fill={x.id===best?.id?'var(--brand-orange)':x.eco?'var(--brand-purple)':'var(--brand-ink)'} opacity={x.id===best?.id?1:.5}><title>{x.label+' · moyen '+fmt(x.mean,1)+' · P10 '+fmt(x.p10,1)}</title></circle>)}
    <text x="345" y="258" textAnchor="middle">Score final moyen · points</text><text x="20" y="25">P10 · scénario défavorable</text>
    <text x="55" y="239">{fmt(minX,0)}</text><text x="635" y="239" textAnchor="end">{fmt(maxX,0)}</text>
  </svg><p><span className="legend-dot orange"/>Recommandé <span className="legend-dot purple"/>Action énergétique structurelle <span className="legend-dot black"/>Autres plans</p></div>;
}
function Compare({config:c,setConfig,search,setSearch,busy,setBusy,onApply,onToast}){
  const [progress,setProgress]=useState(null);
  async function run(){
    setBusy(true);setProgress({phase:'enumerate',total:0});
    try{const result=await optimize(c,{},p=>setProgress(p));setSearch({...result,inputSignature:JSON.stringify(c)});if(!result.best)onToast('Aucun plan ne satisfait ces contraintes.');}
    catch(e){onToast(e.message);}finally{setBusy(false);setProgress(null);}
  }
  const stale=search&&search.inputSignature!==JSON.stringify(c);
  const prefs=(key,v)=>setConfig(prev=>({...prev,search:{...prev.search,[key]:v}}));
  return <div className="compare-view">
    <section className="panel laboratory-intro"><div><span className="eyebrow">RECHERCHE DE DÉCISION</span><h2>Comparez les plans.<br/>Voyez aussi le risque.</h2><p>Des choix fixés avant les jets, évalués sur plusieurs tours. Les résultats sont calculés et les limites de recherche sont explicites.</p></div><div className="lab-controls">
      <label>Horizon<select value={c.search.horizon} onChange={e=>prefs('horizon',Number(e.target.value))}>{Array.from({length:7-c.round},(_,i)=>c.round+i).map(t=><option key={t} value={t}>Jusqu’à T{t}</option>)}</select></label>
      <label>Simulation<select value={c.search.trials} onChange={e=>prefs('trials',Number(e.target.value))}><option value={96}>96 scénarios par plan</option><option value={192}>192 scénarios par plan</option><option value={384}>384 scénarios par plan</option></select></label>
      <label>Priorité<select value={c.search.riskPenalty} onChange={e=>prefs('riskPenalty',Number(e.target.value))}><option value={0}>Score moyen</option><option value={.5}>Compromis prudent</option><option value={1}>Scénario défavorable P10</option></select></label>
      <label className="check-control"><input type="checkbox" checked={c.search.technicalPurchases} onChange={e=>prefs('technicalPurchases',e.target.checked)}/>Examiner les achats techniques du tour courant</label>
      <label className="check-control"><input type="checkbox" checked={c.assumptions.requireEfficiency} onChange={e=>setConfig(prev=>({...prev,assumptions:{...prev.assumptions,requireEfficiency:e.target.checked}}))}/>Exiger une action énergétique structurelle (A/B)</label>
      <button className="primary" disabled={busy} onClick={run}>{busy?<Loader2 className="spin" size={16}/>:<Play size={16}/>} {busy?'Recherche en cours…':'Chercher le meilleur plan'}</button>
    </div></section>
    {busy&&<div className="progress-line" role="status"><Loader2 size={16} className="spin"/>{progress?.phase==='simulate'?'Simulation des risques · '+progress.done+' / '+progress.total+' plans':progress?.phase==='pilot'?'Évaluation initiale du risque · '+progress.done+' / '+progress.total+' plans':'Énumération des plans · '+(progress?.total||0)+' candidats'}<span>Les scénarios utilisent la même graine aléatoire.</span></div>}
    {stale&&<div className="notice"><AlertTriangle size={17}/>Les paramètres ont changé. Relancez la recherche avant de comparer ces résultats.</div>}
    {search?.best?<><div className="recommendation-grid">{search.candidates.slice(0,3).map((p,i)=><section className={'panel recommendation '+(!i?'winner':'')} key={p.id}>
      <div className="recommendation-title"><span>{i===0?'Plan recommandé':'Alternative '+i}</span>{!i&&<ArrowUpRight size={20}/>}</div><PlanSteps plan={p.plan}/><div className="recommendation-score">{fmt(p.mean,1)}<span>points moyens</span></div>
      <div className="recommendation-meta"><span>P10 <b>{fmt(p.p10,1)}</b></span><span>Cash final moyen <b>{money(p.meanCash)}</b></span></div>
      <button className={!i?'primary':'secondary'} disabled={stale} onClick={()=>onApply(p.plan)}>Appliquer au simulateur <ArrowRight size={15}/></button>
    </section>)}</div>
    <section className="panel"><div className="panel-header"><div><span className="eyebrow">ROBUSTESSE</span><h3>La moyenne ne raconte pas toute l’histoire.</h3></div><Tag>{search.meta.trials} scénarios /plan</Tag></div><Frontier items={search.candidates} best={search.best}/>
      <div className="table-scroll"><table><thead><tr><th>Plan</th><th>Score moyen</th><th>P10</th><th>Erreur type</th><th>Risque faillite</th><th>Service ≥95 % à chaque tour</th></tr></thead><tbody>{search.candidates.slice(0,8).map((p,i)=><tr key={p.id}><td className="plan-table-label"><b>#{i+1}</b> {p.plan.map(x=>'T'+x.round+' '+Object.values(x.decision.choices).join('/')+(x.round===6&&['A','C'].includes(x.decision.choices.extension)?' ('+x.decision.internalLine+')':'')).join(' · ')}<small>{p.plan.flatMap(x=>x.decision.purchases.map(id=>'T'+x.round+' + '+INVESTMENTS.find(inv=>inv.id===id)?.name)).join(' · ')||'Sans achat technique supplémentaire'}</small></td><td>{fmt(p.mean,1)}</td><td>{fmt(p.p10,1)}</td><td>±{fmt(p.standardError,1)}</td><td>{percent(p.bankruptcyProbability)}</td><td>{percent(p.serviceProbability)}</td></tr>)}</tbody></table></div>
      <details className="method-detail"><summary>Méthode, portée et hypothèses de recherche <ChevronDown size={15}/></summary><p>{search.meta.screened} plans faisables examinés, {search.meta.simulated} plans simulés. {search.meta.method}</p><p>{search.meta.optimality}</p><p>{search.meta.purchaseScope}</p><p>{search.meta.excluded}</p><p>{search.meta.policy}</p>{search.meta.truncated&&<p>Le plafond de candidats a été atteint : la recherche n’est pas exhaustive.</p>}</details>
    </section></>:!busy&&<section className="empty-state"><GitBranch size={38}/><h3>Votre prochaine décision mérite une comparaison.</h3><p>Lancez la recherche pour voir les plans, leur score attendu et leur résistance aux incidents.</p></section>}
  </div>;
}
function HistoryView({config:c,setConfig,onToast}){
  const rec=reconcile(c);
  function actual(t,key,value){setConfig(prev=>({...prev,actuals:{...prev.actuals,[t]:{...(prev.actuals[t]||{net:null,cash:null,points:null,status:'Saisie utilisateur'}),[key]:value}}}));}
  return <div className="history-view"><section className="panel"><div className="panel-header"><div><span className="eyebrow">DONNÉES QUI FONT FOI</span><h2>Votre historique, pas un exemple fictif.</h2></div><History size={24}/></div>
    <p className="muted padded">Une valeur vide conserve la projection. Zéro est une valeur réelle. Les profits et le cash restent deux séries indépendantes.</p>
    <div className="table-scroll"><table className="history-table"><thead><tr><th>Tour</th><th>Résultat réel · k€</th><th>Cash sortie réel · k€</th><th>Points du tour</th><th>Statut</th></tr></thead><tbody>{[1,2,3,4,5,6].map(t=><tr key={t}><td><b>T{t}</b></td><td><NumberInput label={'Résultat réel T'+t} value={c.actuals[t]?.net} onChange={v=>actual(t,'net',v)}/></td><td><NumberInput label={'Cash réel T'+t} value={c.actuals[t]?.cash} onChange={v=>actual(t,'cash',v)}/></td><td><NumberInput label={'Points réels T'+t} value={c.actuals[t]?.points} onChange={v=>actual(t,'points',v)}/></td><td><small>{c.actuals[t]?.status||'Projection'}</small></td></tr>)}</tbody></table></div>
    <div className={'reconciliation '+(!rec.consistent?'warning':'')}><AlertTriangle size={20}/><div><strong>{rec.consistent?'Trésorerie rapprochée':'Écart de rapprochement : '+money(rec.gap)}</strong><p>Les profits renseignés impliquent {money(rec.impliedCash)} à partir des 2 000 k€ initiaux ; le dernier cash déclaré est {money(rec.reportedCash)}. Le cash déclaré reste prioritaire, sans recette fictive ajoutée au résultat.</p></div></div>
  </section>
  <section className="panel"><div className="panel-header"><div><span className="eyebrow">ENGAGEMENTS PASSÉS</span><h3>Les effets se transmettent au bon tour.</h3></div></div>
    <div className="history-rounds">{[1,2,3,4,5,6].map(t=><div className="history-round" key={t}><div><b>T{t}</b><span>{DECISIONS[t].map(d=>d.key+' '+c.rounds[t].choices[d.key]).join(' · ')}</span><small>{c.rounds[t].purchases.map(id=>INVESTMENTS.find(x=>x.id===id)?.name).join(' + ')||'Aucun achat technique additionnel'}</small></div><button className="text-button" onClick={()=>{setConfig(prev=>({...prev,round:t}));onToast('T'+t+' sélectionné. Modifiez les décisions dans le tableau de bord.');}}>Consulter <ArrowUpRight size={14}/></button></div>)}</div>
    <div className="panel-note"><Info size={14}/>Les points T1 et T2 proposés supposent zéro accident. Corrigez-les avec les résultats validés par l’animateur.</div>
  </section></div>;
}
function RulesView({config:c,setConfig}){
  const setAssumption=(key,value)=>setConfig(prev=>({...prev,assumptions:{...prev.assumptions,[key]:value}}));
  return <div className="rules-view"><div className="view-intro"><span className="eyebrow">MODÈLE EXPLICABLE</span><h2>Les règles avant les recommandations.</h2><p>Les données chiffrées proviennent du document joueurs et des cartes fournies. Chaque interprétation non certaine reste visible.</p></div>
    <div className="rules-grid">{RULES.map(rule=><article key={rule.id} className="panel rule-card"><span className="eyebrow">{rule.source}</span><h3>{rule.title}</h3><div className="rule-formula">{rule.formula}</div><p>{rule.text}</p><a target="_blank" rel="noreferrer" href={asset(rule.url)}>Ouvrir la source <ExternalLink size={13}/></a></article>)}</div>
    <section className="panel"><div className="panel-header"><div><span className="eyebrow">HYPOTHÈSES MODIFIABLES</span><h3>Des inconnues déclarées, jamais des certitudes inventées.</h3></div></div>
      <div className="form-grid assumptions-grid">
        <label>Reprise de préventive<select value={c.assumptions.maintenanceResume} onChange={e=>setAssumption('maintenanceResume',e.target.value)}><option value="next">Rétablissement au tour suivant</option><option value="immediate">Rétablissement immédiat au paiement</option></select></label>
        <label>Tapis + IoT : plafond 98 %<select value={c.assumptions.conveyorCap} onChange={e=>setAssumption('conveyorCap',e.target.value)}><option value="component">Plafond sur le tapis, puis IoT (+3 pts)</option><option value="final">Plafond final sur Gorreri</option></select></label>
        <label>Échec marketing B<select value={c.assumptions.marketingFailure} onChange={e=>setAssumption('marketingFailure',e.target.value)}><option value="loss">La concurrence réduit la demande de 15 %</option><option value="unchanged">Demande initiale conservée</option></select></label>
        <label>Durée grève RH B · jours<NumberInput value={c.assumptions.interimStrikeDays} min={0} onChange={v=>setAssumption('interimStrikeDays',v||0)}/></label>
        <label>Surcoût matière si fournisseur D · k€/tour<NumberInput value={c.assumptions.flourDExtra} min={0} onChange={v=>setAssumption('flourDExtra',v||0)}/></label>
        <label>Gain moyen supposé par opportunité · k€<NumberInput value={c.assumptions.opportunityGains} onChange={v=>setAssumption('opportunityGains',v||0)}/></label>
        <label>Points supposés par opportunité<NumberInput value={c.assumptions.opportunityPoints} onChange={v=>setAssumption('opportunityPoints',v||0)}/></label>
        <label>IFS C après échéance<select value={c.assumptions.ifsCAfterDeadline} onChange={e=>setAssumption('ifsCAfterDeadline',e.target.value)}><option value="lost">Contrat perdu sans certificat</option><option value="retain">Client conservé, si animateur l’accorde</option></select></label>
      </div>
    </section>
    <section className="panel architecture"><div className="panel-header"><div><span className="eyebrow">FONCTIONNEMENT DU COPILOTE</span><h3>Un agent qui demande aux outils de calculer.</h3></div></div><div className="architecture-steps">
      {[['01','Comprendre','L’agent lit votre question et l’état du jeu.'],['02','Calculer','Il appelle les règles, le calculateur ou la recherche de plans.'],['03','Vérifier','Les contraintes et le rapprochement des chiffres restent inspectables.'],['04','Expliquer','La réponse cite les résultats. Une proposition peut être appliquée au simulateur.']].map(([n,t,d])=><div key={n}><span>{n}</span><h4>{t}</h4><p>{d}</p></div>)}</div>
      <p className="padded muted">Moteur écrit pour BIMO : énumération de décisions, allocation selon les règles du jeu et Monte Carlo. L’agent OpenAI utilise de vrais appels d’outils Responses. Sans clé connectée, le mode numérique traite des intentions limitées et indique cette limite.</p>
    </section>
    <section className="panel"><div className="panel-header"><div><span className="eyebrow">FONDEMENTS</span><h3>La recherche qui inspire le modèle.</h3></div><a className="text-button" href={asset('/sources/rules.pdf')} target="_blank">Document joueurs <ArrowUpRight size={15}/></a></div><div className="research-list">{RESEARCH.map(x=><a key={x.title} href={x.url} target="_blank" rel="noreferrer"><span><small>{x.authors}</small><strong>{x.title}</strong><p>{x.use}</p></span><ExternalLink size={17}/></a>)}</div></section>
  </div>;
}
function ConnectModal({onClose}){
  const modalRef=useRef(null);
  useEffect(()=>{
    const previous=document.activeElement;modalRef.current?.querySelector('button')?.focus();
    const handle=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const all=[...modalRef.current.querySelectorAll('button,a[href]')];const first=all[0],last=all.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
    document.addEventListener('keydown',handle);return()=>{document.removeEventListener('keydown',handle);previous?.focus?.();};
  },[]);
  return <div className="modal-backdrop" onClick={onClose}><section ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="connect-title" onClick={e=>e.stopPropagation()}>
    <button className="modal-x icon-button" onClick={onClose} aria-label="Fermer"><X size={20}/></button><div className="modal-icon"><ShieldCheck size={25}/></div><span className="eyebrow">COPILOTE NUMÉRIQUE</span><h2 id="connect-title">Vos calculs restent disponibles.</h2>
    <p>Le calculateur, le laboratoire et les confirmations du copilote fonctionnent ici sans clé API. Les scénarios restent enregistrés dans votre navigateur.</p>
    <p>Pour les questions libres avec OpenAI, ouvrez la version connectée. Exportez puis importez votre scénario pour retrouver les mêmes données.</p>
    <a className="primary" href={CONNECTED_SITE} target="_blank" rel="noreferrer">Ouvrir la version OpenAI <ArrowUpRight size={16}/></a>
  </section></div>;
}

function Assistant({config:c,onProposal,onConnect,apiKey,model,onVerified}){
  const [messages,setMessages]=useState([{role:'assistant',content:'Bonjour Team Oreo. Votre historique est chargé.\n\nJe peux comparer les options, expliquer le résultat ou rechercher un plan jusqu’à T6. Chaque recommandation s’appuie sur les outils de calcul.',mode:'Moteur numérique',trace:[]}]);
  const [input,setInput]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[trace,setTrace]=useState([]),[proposal,setProposal]=useState(null);
  const scroll=useRef(null),abort=useRef(null);
  useEffect(()=>{scroll.current?.scrollTo({top:scroll.current.scrollHeight,behavior:'smooth'});},[messages,status,trace.length]);
  async function send(text=input){
    if(!text.trim()||busy)return;
    if(/sk-[A-Za-z0-9_-]{18,}/.test(text)){setInput('');setMessages(m=>[...m,{role:'assistant',content:'Pour votre clé, utilisez le bouton de connexion OpenAI. Ne l’envoyez pas dans une question.',mode:'Connexion',trace:[]}]);return;}
    const history=[...messages.filter(x=>['user','assistant'].includes(x.role)).map(({role,content})=>({role,content})),{role:'user',content:text}];
    setMessages(m=>[...m,{role:'user',content:text}]);setInput('');setBusy(true);setStatus('Préparation du calcul…');setTrace([]);setProposal(null);
    const events=[];let answered=false;
    const emit=event=>{
      if(event.type==='status')setStatus(event.text);
      if(event.type==='progress')setStatus(event.phase==='simulate'?'Simulation '+event.done+' / '+event.total+' plans…':event.phase==='pilot'?'Évaluation du risque '+event.done+' / '+event.total+'…':'Énumération des décisions…');
      if(event.type==='tool_start'){events.push(event);setTrace([...events]);setStatus(TOOLS_LABELS[event.name]||event.name);}
      if(event.type==='tool_result'){events.push(event);setTrace([...events]);}
      if(event.type==='proposal')setProposal(event.proposal);
      if(event.type==='answer'){answered=true;setMessages(m=>[...m,{role:'assistant',content:event.text,mode:event.mode||'OpenAI',trace:[...events]}]);if(apiKey)onVerified();}
      if(event.type==='error'){answered=true;setMessages(m=>[...m,{role:'assistant',content:event.text,mode:'Erreur',trace:[...events]}]);}
    };
    try{
      if(!apiKey)await runLocalAssistant(text,c,emit);
      else throw Error('Les questions OpenAI sont disponibles sur la version connectée.');
    }catch(e){setMessages(m=>[...m,{role:'assistant',content:e.name==='AbortError'?'Requête interrompue.':e.message,mode:'Erreur',trace:[...events]}]);}
    finally{setBusy(false);setStatus('');abort.current=null;}
  }
  return <aside className="assistant-panel"><div className="assistant-header"><div className="assistant-symbol"><Sparkles size={19}/></div><div><h3>Le copilote</h3><span>{apiKey?'OpenAI · appels d’outils':'Moteur numérique · sans clé'}</span></div><button className="icon-button" onClick={onConnect} aria-label="Connexion OpenAI"><Settings2 size={17}/></button></div>
    <div className="assistant-messages" ref={scroll}>{messages.map((m,i)=><div className={'chat-message '+m.role} key={i}>{m.role==='assistant'&&<span className={'message-mode '+(m.mode==='Erreur'?'red':'')}>{m.mode}</span>}<div className="message-text">{m.content}</div>{m.trace?.length>0&&<details className="tool-trace"><summary>{m.trace.filter(x=>x.type==='tool_result').length} outils exécutés <ChevronDown size={12}/></summary>{m.trace.filter(x=>x.type==='tool_result').map((e,j)=><details key={j}><summary><CheckCircle2 size={12}/>{TOOLS_LABELS[e.name]||e.name}</summary><pre>{JSON.stringify(e.result,null,2)}</pre></details>)}</details>}</div>)}
      {busy&&<div className="agent-status" role="status"><Loader2 size={14} className="spin"/><span>{status}</span><button onClick={()=>abort.current?.abort()} disabled={!apiKey} aria-label="Interrompre"><X size={13}/></button></div>}
      {proposal&&<div className="proposal-card"><span>PROPOSITION CALCULÉE</span><strong>T{proposal.round} · {Object.values(proposal.decision.choices).join(' / ')}</strong><button className="primary compact" onClick={()=>{onProposal(proposal);setProposal(null);}}>Appliquer au simulateur <ArrowRight size={13}/></button></div>}
    </div>
    <div className="assistant-bottom"><div className="question-chips">{['Optimise jusqu’à T6','Pourquoi ce résultat ?','Explique la disponibilité'].map(q=><button key={q} disabled={busy} onClick={()=>send(q)}>{q}<ArrowUpRight size={11}/></button>)}</div>
      <form className="chat-composer" onSubmit={e=>{e.preventDefault();send();}}><textarea aria-label="Question au copilote" value={input} onChange={e=>setInput(e.target.value)} placeholder="Posez votre question, simplement…" rows={2} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}/><div><span>État actuel · T{c.round}</span><button disabled={busy||!input.trim()} aria-label="Envoyer"><ArrowUpRight size={18}/></button></div></form>
      {!apiKey&&<button className="connect-link" onClick={onConnect}><KeyRound size={12}/>Questions libres : ouvrir la version connectée</button>}
    </div>
  </aside>;
}
export default function Home(){
  const [config,setConfigRaw]=useState(defaultConfig),[loaded,setLoaded]=useState(false),[nav,setNav]=useState('dashboard'),[search,setSearch]=useState(null),[searchBusy,setSearchBusy]=useState(false),[apiKey,setApiKey]=useState(''),[model,setModel]=useState('gpt-4.1-mini'),[connect,setConnect]=useState(false),[verified,setVerified]=useState(false),[toast,setToast]=useState(''),[mobileChat,setMobileChat]=useState(false);
  const fileInput=useRef(null);
  const [financialMode,setFinancialMode]=useState('recorded');
  useEffect(()=>{try{const saved=localStorage.getItem(STORAGE);if(saved)setConfigRaw(normalizeConfig(JSON.parse(saved)));}catch{}setLoaded(true);},[]);
  useEffect(()=>{if(loaded)localStorage.setItem(STORAGE,JSON.stringify(config));},[config,loaded]);
  useEffect(()=>{setFinancialMode('recorded');},[config.round]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(timer);},[toast]);
  const setConfig=update=>setConfigRaw(prev=>normalizeConfig(typeof update==='function'?update(prev):update));
  const result=useMemo(()=>evaluate(config),[config]),issues=useMemo(()=>diagnose(config),[config]);
  const actual=config.actuals[config.round],hasActual=Number.isFinite(actual?.net)||Number.isFinite(actual?.cash);
  const figures=useMemo(()=>financialView(config,result,financialMode),[config,result,financialMode]);
  const selected=config.rounds[config.round];
  const firstSpec=DECISIONS[config.round][0],secondSpec=DECISIONS[config.round][1];
  const hasDice=Object.values(selected.rolls).some(x=>x!==null);
  function editScenario(update){setFinancialMode('simulation');setConfig(update);}
  function choice(key,value){editScenario(prev=>({...prev,rounds:{...prev.rounds,[prev.round]:{...prev.rounds[prev.round],choices:{...prev.rounds[prev.round].choices,[key]:value}}}}));}
  function applyPlan(plan){
    editScenario(prev=>{const next=clone(prev);for(const step of plan)if(step.round>=prev.round)next.rounds[step.round]=clone(step.decision);return next;});
    setToast('Plan appliqué au simulateur. Les résultats historiques restent distincts.');setNav('dashboard');
  }
  function applyProposal(p){applyPlan([{round:p.round,decision:p.decision}]);}
  function exportReport(){
    const recorded=financialView(config,result,'recorded');
    const report=['# BIMO Decision Lab — T'+config.round,'',...(hasActual?['## Valeurs du registre','Net : '+money(recorded.net)+' ; trésorerie : '+money(recorded.cash)+' ('+(recorded.cashSource==='recorded'?'déclarée':'issue du net enregistré')+').','']:[]),'## Scénario calculé','Scénario '+(hasDice?'avec jets observés':'sans incident inconnu'),'',explain(result),'','## Détail des charges',...result.expenses.map(x=>'- '+x.label+' : '+money(x.amount)+' ('+x.source+')'),'Changements de série : compris dans les fixes, sans charge supplémentaire.','','## Hypothèses',...issues.map(x=>'- '+x.label+' : '+x.detail),'','## Méthode','Planification numérique et simulation ; aucun optimum global en espérance n’est certifié.','Les résultats dépendent des règles fournies et des hypothèses saisies.'].join('\n');
    download('BIMO_T'+config.round+'_decision.md',report,'text/markdown;charset=utf-8');
  }
  async function importConfig(e){
    const file=e.target.files?.[0];if(!file)return;
    try{if(file.size>500000)throw Error('Fichier trop volumineux.');const text=await file.text();if(/"apiKey"\s*:|"OPENAI_API_KEY"\s*:/.test(text))throw Error('Ce fichier contient une clé. Importez uniquement un scénario.');const data=JSON.parse(text);setConfig(data);setSearch(null);setToast('Scénario importé.');}catch(err){setToast('Import impossible : '+err.message);}e.target.value='';
  }
  function saveActual(){
    if(config.round===6&&['none','unknown'].includes(selected.finalCard)){setToast('Renseignez la carte finale remise par l’animateur avant de valider T6.');return;}
    const missing=['v1','haas','gorreri','accident'].filter(k=>!Number.isInteger(selected.rolls[k]));
    if(missing.length){setToast('Saisissez les trois jets de panne et le jet accident avant de valider un résultat réel.');return;}
    const extra=[];
    if(config.round===2&&selected.choices.ifs==='C')extra.push('ifs');
    if(config.round===2&&selected.choices.plastic!=='A')extra.push('plastic');
    if(config.round===5&&selected.choices.haccp==='B')extra.push('haccp');
    if(config.round===5&&selected.choices.competition==='B')extra.push('marketing');
    if(config.round===4&&selected.choices.erp==='B')extra.push('erp');
    if(config.round===4&&config.rounds[2].choices.ifs==='B')extra.push('ifs');
    if(config.round>=3&&['B','D'].includes(config.rounds[3].choices.rh))extra.push('social');
    if(extra.some(k=>!Number.isInteger(selected.rolls[k]))){setToast('Un jet conditionnel requis n’est pas encore renseigné.');return;}
    if(!result.feasible){setToast('Corrigez les contraintes avant de valider le tour.');return;}
    setConfig(prev=>({...prev,actuals:{...prev.actuals,[prev.round]:{net:result.net,cash:result.cash,points:result.operational,status:'Résultat validé depuis les jets saisis'}}}));
    setToast('Résultat T'+config.round+' enregistré dans le registre.');setNav('history');
  }
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand team-brand" href="#" aria-label="Team Oreo — Tableau de bord" onClick={e=>{e.preventDefault();setNav('dashboard');}}><img className="team-brand-logo" src={asset('/team-oreo-logo.png')} alt="Team Oreo" width="1681" height="936" fetchPriority="high"/><span className="team-brand-caption">DECISION LAB</span></a>
      <div className="workspace-label">ESPACE DE PILOTAGE</div><nav>{NAV.map(([id,label,Icon])=><button key={id} aria-label={label} aria-current={nav===id?'page':undefined} title={label} className={nav===id?'active':''} onClick={()=>setNav(id)}><Icon size={18}/><span>{label}</span>{nav===id&&<span className="nav-active-dot"/>}</button>)}</nav>
      <div className="sidebar-project"><span className="eyebrow">FACTORY CHALLENGE</span><strong>Six tours.<br/>Un cap à tenir.</strong><div className="sidebar-progress">{[1,2,3,4,5,6].map(t=><button key={t} title={'Aller au tour '+t} className={t===config.round?'current':t<config.round?'past':''} onClick={()=>setConfig(prev=>({...prev,round:t,search:{...prev.search,horizon:Math.max(t,prev.search.horizon)}}))}>{t}</button>)}</div><small>Tour {config.round} sur 6</small></div>
      <div className="sidebar-bottom"><div className="team-avatar">TO</div><div><strong>Équipe Oreo</strong><span>Team Oreo · Comité de pilotage</span></div><ShieldCheck size={15}/></div>
    </aside>
    <div className="app-content"><header className="topbar"><div className="breadcrumbs"><span>Factory Challenge</span><ChevronRight size={13}/><b>{NAV.find(x=>x[0]===nav)?.[1]}</b></div><div className="topbar-actions"><button className={'connection-status '+(apiKey?'connected':'')} onClick={()=>setConnect(true)}><span/>{apiKey?(verified?'OpenAI connecté':'Clé en session'):'Copilote local'}<KeyRound size={13}/></button><button className="secondary compact export-top" onClick={exportReport}><Download size={14}/>Exporter</button></div></header>
      <div className="workspace-grid"><main className="main-canvas">
        <div className="page-intro"><div><span className="eyebrow">COPIL INTELLIGENT <span className="eyebrow-divider"/> ÉQUIPE OREO</span><h1>{nav==='dashboard'?'Chaque décision compte.':nav==='compare'?'Choisir avec une longueur d’avance.':nav==='history'?'Les faits avant les projections.':'Comprendre pour mieux décider.'}</h1><p>{nav==='dashboard'?'Vos options, leurs conséquences, les chiffres pour trancher.':'Un modèle de décision transparent, relié à votre situation réelle.'}</p></div><button className="icon-button" aria-label="Exporter le scénario JSON" title="Exporter le scénario JSON" onClick={()=>download('BIMO_scenario.json',JSON.stringify(config,null,2))}><Download size={19}/></button></div>
        <div className="tour-switcher"><div className="tour-tabs">{[1,2,3,4,5,6].map(t=><button aria-pressed={config.round===t} className={config.round===t?'active':''} key={t} onClick={()=>setConfig(prev=>({...prev,round:t,search:{...prev.search,horizon:Math.max(t,prev.search.horizon)}}))}><span className="tour-label">Tour</span> {t}{config.actuals[t]&&<span className="tour-recorded"/>}</button>)}</div><Tag tone={hasDice?'blue':''}>{figures.mode==='recorded'?'Finances du registre':hasDice?'Avec jets observés':'Projection sans incident'}</Tag></div>
        {nav==='dashboard'&&<>
          {hasActual&&<div className="recorded-result"><History size={14}/><span>Finances T{config.round}</span><div className="financial-toggle" role="group" aria-label="Source des chiffres financiers"><button aria-pressed={figures.mode==='recorded'} onClick={()=>setFinancialMode('recorded')}>Résultats enregistrés</button><button aria-pressed={figures.mode==='simulation'} onClick={()=>setFinancialMode('simulation')}>Scénario calculé</button></div><button className="text-button" onClick={()=>setNav('history')}>Registre <ArrowUpRight size={12}/></button></div>}
          <div className="kpi-grid"><KPI label={figures.netSource==='recorded'?'Résultat net enregistré':'Résultat net simulé'} value={fmt(figures.net)} unit="k€" icon={Coins} detail={figures.netSource==='recorded'?'Scénario : '+money(result.net):'Marge '+money(result.margin)} tone="highlight"/><KPI label={figures.cashSource==='recorded'?'Trésorerie enregistrée':'Trésorerie de sortie'} value={fmt(figures.cash)} unit="k€" icon={Activity} detail={figures.mode==='recorded'?'Scénario : '+money(result.cash):'Investissements '+money(result.investment)}/><KPI label={figures.mode==='recorded'?'Service du scénario':'Taux de service'} value={fmt(result.service*100)} unit="%" icon={Target} detail={result.service>=.95?'Seuil de bonus atteint · +30 pts':'Objectif bonus ≥95 %'}/><KPI label="Points du scénario" value={(result.operational>=0?'+':'')+result.operational} unit="pts" icon={ShieldCheck} detail="Bonus et malus calculés du tour"/></div>
          <div className="decision-section-title"><div><span className="eyebrow">VOTRE SCÉNARIO ACTIF</span><h2>{secondSpec?'Deux choix. Tous leurs effets.':'Un dernier choix à arbitrer.'}</h2></div><button className="text-button" onClick={()=>setNav('compare')}>Comparer les plans <ArrowUpRight size={15}/></button></div>
          <div className={'decision-grid '+(!secondSpec?'single':'')}><DecisionCard spec={firstSpec} choice={selected.choices[firstSpec.key]} onChange={v=>choice(firstSpec.key,v)}/>{secondSpec?<DecisionCard spec={secondSpec} choice={selected.choices[secondSpec.key]} onChange={v=>choice(secondSpec.key,v)}/>:<section className="decision-card final-card"><span className="section-eyebrow">P12 · CARTE FINALE</span><h3>Le dernier événement.</h3><p>Aucune distribution de tirage n’est inventée. Renseignez la carte remise par l’animateur dans les réglages ci-dessous.</p><Tag>Effet actuel : {selected.finalCard==='none'?'aucun renseigné':selected.finalCard}</Tag></section>}</div>
          {result.errors.map((e,i)=><div className="notice error" key={i}><AlertTriangle size={17}/>{e}</div>)}
          <SimulationSettings config={config} setConfig={editScenario} result={result}/>
          <Production result={result}/>
          <div className="analysis-grid"><Capacity r={result}/><Score r={result}/></div>
          <Finance r={result}/>
          <div className="model-notes"><div><Info size={18}/><strong>Hypothèses à garder en vue</strong></div>{issues.map(x=><p key={x.label}><b>{x.label}.</b> {x.detail}</p>)}<button className="text-button" onClick={()=>setNav('rules')}>Voir et modifier les hypothèses <ArrowRight size={14}/></button></div>
          <div className="round-footer"><span>Vérifiez les jets et les cartes avec l’animateur avant d’enregistrer un résultat réel.</span><button className="secondary" onClick={saveActual}><CheckCircle2 size={16}/>Enregistrer le résultat réel</button></div>
        </>}
        {nav==='compare'&&<Compare config={config} setConfig={setConfig} search={search} setSearch={setSearch} busy={searchBusy} setBusy={setSearchBusy} onApply={applyPlan} onToast={setToast}/>}
        {nav==='history'&&<HistoryView config={config} setConfig={setConfig} onToast={setToast}/>}
        {nav==='rules'&&<RulesView config={config} setConfig={editScenario}/>}
        <footer className="app-footer"><span>BIMO Decision Lab · v{VERSION} · Outil indépendant pour l’équipe Oreo</span><div><a href={asset('/downloads/bimo-model-source.zip')} download>Code source</a><button onClick={()=>fileInput.current?.click()}><Upload size={12}/>Importer</button><button onClick={()=>{if(window.confirm('Réinitialiser le scénario et le registre aux données de départ ?')){setConfig(defaultConfig());setSearch(null);setToast('Scénario initial restauré.');}}}><RefreshCw size={12}/>Réinitialiser</button></div></footer>
        <input type="file" accept=".json,application/json" className="visually-hidden" ref={fileInput} onChange={importConfig}/>
      </main><div className={'assistant-container '+(mobileChat?'mobile-open':'')}><button className="mobile-chat-close icon-button" aria-label="Fermer le copilote" onClick={()=>setMobileChat(false)}><X size={20}/></button><Assistant config={config} onProposal={applyProposal} onConnect={()=>setConnect(true)} apiKey={apiKey} model={model} onVerified={()=>setVerified(true)}/></div></div>
    </div>
    <button className="mobile-chat-button" onClick={()=>setMobileChat(true)}><Sparkles size={18}/>Copilote</button>
    {connect&&<ConnectModal onClose={()=>setConnect(false)} connected={!!apiKey} model={model} setModel={setModel} onConnect={key=>{setApiKey(key);setVerified(false);setConnect(false);setToast(key?'Clé en mémoire pour cette session. Posez une question pour vérifier la connexion.':'Clé déconnectée.');}}/>}
    {toast&&<div className="toast" role="status"><Info size={17}/>{toast}<button onClick={()=>setToast('')} aria-label="Fermer"><X size={14}/></button></div>}
  </div>;
}
