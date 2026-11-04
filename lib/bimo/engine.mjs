// All amounts are kEUR, production is tonnes, and rates are fractions.
// This is a finite-horizon decision model, not an LLM numerical calculator.
export const VERSION = '1.1.0';
export const SERIES_COST_RULE = 'Mise à jour compétition : les changements de ligne/série sont déjà inclus dans les coûts fixes. Aucun second prélèvement.';
export const PRODUCTS = ['Golden','Oreo','Tagger','Tonik','Merendina Big M','Merendina Classique','BIO'];
export const LINES = ['V1','HAAS 1','Gorreri'];
export const BASE_MARGIN = [320,280,360,300,340,310,450];
export const DEMAND = {
  1:[1200,1800,800,1500,600,1000,0],2:[1000,1600,900,1400,700,1200,0],
  3:[1500,2200,700,1300,500,900,0],4:[1100,1700,1000,1600,700,1100,0],
  5:[1200,1800,900,1500,600,1000,500],6:[1600,2400,800,1400,700,1200,800]
};
export const INVESTMENTS = [
  {id:'oven',name:'Révision four HAAS',cost:80,effect:'HAAS : disponibilité 93 %, seuil de panne 2',source:'§5.3, p.8'},
  {id:'spares',name:'Pièces critiques HAAS',cost:35,effect:'Arrêt HAAS 2 j et suppression du malus pièces',source:'§5.3, p.8'},
  {id:'iot',name:'Maintenance prédictive IoT',cost:120,effect:'+3 points de disponibilité ; seuils de panne −2, minimum 1',source:'§5.3, p.8'},
  {id:'training',name:'Formation maintenance',cost:30,effect:'Durée des pannes × 0,75',source:'§5.3, p.8'},
  {id:'safety',name:'Sécurité machines',cost:60,effect:'Accident sur 1 au d10 au lieu de 1–3',source:'§5.3, p.8'},
  {id:'automation',name:'Automate pétrissage',cost:45,effect:'Non-conformité −0,5 point',source:'§5.3, p.8'},
  {id:'conveyor',name:'Tapis Gorreri',cost:25,effect:'Gorreri +2 points, plafond 98 % à interpréter avec IoT',source:'§5.3, p.8'},
];
const option=(code,label,cost,effect,investment=false)=>({code,label,cost,effect,investment});
export const DECISIONS = {
  1:[{key:'repair',title:'P1 · Panne majeure HAAS',source:'Photo p.11',options:[
    option('A','Réparation urgente',180,'5 jours d’arrêt HAAS'),option('B','Réparation standard',90,'15 jours d’arrêt HAAS'),
    option('C','Four mobile',250,'2 jours d’arrêt HAAS'),option('D','Réparation + bascule',120,'15 jours HAAS ; réparation 90 + heures sup. 30 ; série comprise dans les fixes')]},
    {key:'flour',title:'P2 · Fournisseur farine',source:'Photo p.11',options:[
      option('A','Accepter la hausse',30,'30 k€/tour T1–T6'),option('B','Contrat long terme',15,'15 k€/tour T1–T6'),
      option('C','Fournisseur alternatif',20,'30 k€ de transition T1/T2, plus de surcoût dès T3'),
      option('D','Stock de sécurité',150,'5 k€/tour de stockage ; hypothèse de surcoût matière à préciser')]}],
  2:[{key:'ifs',title:'P3 · Certification IFS',source:'Photo p.11',options:[
    option('A','Projet IFS complet',120,'Certification garantie T4, +50 pts'),
    option('B','Projet interne',40,'Jet T4 : réussite 1–6 au d10 ; échec : marge −20 % T5/T6'),
    option('C','Négocier un délai',0,'Jet immédiat : perte du client sur 1–3 ; certification ultérieure non garantie')]},
    {key:'plastic',title:'P4 · Incident plastique',source:'Photo p.12',options:[
      option('A','Rappel volontaire',200,'+10 pts T2 et +20 pts à l’audit T5'),
      option('B','Rappel limité',80,'Bad buzz sur 1–2 au d10 : −50 pts'),
      option('C','Investigation sans rappel',15,'Sur 1–5 : −250 k€, −100 pts et audit T5 −20 pts')]}],
  3:[{key:'bio',title:'P5 · Gamme BIO',source:'Photo p.12',options:[
    option('A','Ligne dédiée',400,'700 t/tour dès T5 ; marge 450 €/t ; innovation au premier revenu',true),
    option('B','Adapter V1 ou HAAS',150,'Utilise la ligne hôte ; nettoyage 8 k€/campagne ; risque allergène non chiffré',true),
    option('C','Sous-traiter BIO',0,'T5/T6 : 50 k€/tour et marge 150 €/t, sans bonus innovation'),
    option('D','Décliner BIO',0,'Aucune demande BIO activée')]},
    {key:'rh',title:'P6 · Absentéisme et climat social',source:'Photo p.12',options:[
      option('A','Plan QVT',100,'Absence 8 % T3, puis 5 % ; +20 pts T3 ; NC −0,3 point dès T4'),
      option('B','Intérim',60,'60 k€/tour maintenu ; perte d’absence compensée ; grève sur 1–2'),
      option('C','Écoute et améliorations',20,'Absence 8 % jusqu’à T6'),
      option('D','Sans action',0,'Absence 12 % ; grève sur 1–4 : 3 j et −20 pts')]}],
  4:[{key:'energy',title:'P7 · Crise énergétique',source:'Photo p.13',options:[
    option('A','Solaire + LED',300,'Surcoût 80 T4 puis 40 T5/T6 ; subvention finale possible',true),
    option('B','Efficacité énergétique',120,'Surcoût réduit à 40 dès T4 ; amélioration structurelle',true),
    option('C','Contrat prix fixe',50,'Surcoût annulé T4–T6 ; protection de prix'),
    option('D','Subir la hausse',0,'Surcoût de 80 k€/tour T4–T6')]},
    {key:'erp',title:'P8 · ERP hors service',source:'Photo p.13',options:[
      option('A','Intervention urgente',80,'Traçabilité sûre ; aucune perte de production explicitement prévue'),
      option('B','Équipe interne',10,'Échec sur 1–3 au d10 : −40 pts à l’audit T5'),
      option('C','Migration cloud',350,'Économie 10 k€/tour dès T5',true)]}],
  5:[{key:'haccp',title:'P9 · Audit HACCP',source:'Photos p.13–14',options:[
    option('A','Consultant externe',50,'Conformité garantie ; NC −0,2 point dès T6'),
    option('B','Mise à jour interne',10,'Échec sur 1–2 au d8 : −60 pts')]},
    {key:'competition',title:'P10 · Réaction au concurrent',source:'Photo p.14',options:[
      option('A','Guerre des prix',100,'100 k€ de marge perdue par tour T5/T6 ; demande maintenue'),
      option('B','Marketing',80,'Réussite sur 1–6 au d10 : demande biscuits +5 % ; échec selon hypothèse'),
      option('C','Lean manufacturing',60,'Demande biscuits −15 % ; fixes −80 k€ dès T6',true),
      option('D','Produit premium',100,'Demande maintenue ; +60 k€ et +40 pts au lancement T6',true)]}],
  6:[{key:'extension',title:'P11 · Rattrapage de production',source:'Photo p.14',options:[
    option('A','Heures supplémentaires',80,'400 t internes supplémentaires'),
    option('B','Sous-traitance',60,'600 t externes à 150 €/t de marge'),
    option('C','Plan combiné',120,'400 t internes et 400 t externes'),
    option('D','Sans action',0,'Production sur les seules capacités existantes')]}]
};
export const RULES = [
  {id:'capacity',title:'Capacité utilisable',source:'Document joueurs §3.1 et §4, p.4/6',url:'/sources/rules.pdf#page=4',formula:'t/j × (65 − arrêts exceptionnels) × disponibilité × [1 − max(0, absence − 4 %)]',text:'L’absence et les pannes s’appliquent séparément. Une capacité disponible ne permet pas de dépasser la demande.'},
  {id:'transfers',title:'Basculements et séries',source:'Mise à jour compétition du 4 novembre 2026, prioritaire sur §3.4',url:'/sources/rules.pdf#page=5',formula:'Oreo sur HAAS ×0,80 ; Golden ×0,85 ; Tonik sur V1 ×0,75. Frais de série inclus dans les fixes.',text:'Les produits natifs sont servis en priorité, puis seule la capacité libre accueille un transfert. Les montants indicatifs 3 /4,5 /3,5 k€ ne sont pas prélevés une seconde fois. Même un petit transfert positif reste utile si la capacité existe.'},
  {id:'investments',title:'Investissements et préventive',source:'§5.2–5.3 et §6, p.7–9',url:'/sources/rules.pdf#page=7',formula:'Investissement ≤500 k€/tour ; net = marge − fixes − dépenses + gains',text:'Les achats sont payés une fois, avec effets techniques au tour suivant. Préventive complète : 75 k€ à chaque tour. Une trésorerie <200 interdit les investissements au tour suivant.'},
  {id:'score',title:'Classement officiel',source:'§7 et §10, p.9–12',url:'/sources/rules.pdf#page=9',formula:'Score = points opérationnels cumulés + résultat net cumulé (k€) /10',text:'Service ≥95 % : +30 ; <85 % : −25. Zéro accident +20, sinon −40/accident. NC <1 % : +25. Net >300 : +15. BIO/premium : +40 au premier revenu. Ne pas inventer un bonus de durabilité.'},
  {id:'timing',title:'Effets dans le temps',source:'Cartes T2–T6, photos p.11–14',url:'/sources/tours-5-6.jpg',formula:'IFS A obtenue T4 ; QVT NC dès T4 ; BIO dès T5 ; premium et Lean dès T6',text:'IFS : +50 au tour de certification, puis effet NC au tour suivant. QVT +20 une fois en T3. Le BIO dédié livre au plus 700 t/tour ; le BIO adapté consomme la capacité de sa ligne hôte.'},
  {id:'uncertainty',title:'Incertitudes explicitement paramétrées',source:'Photos p.12–15',url:'/sources/events.jpg',formula:'Jets d10 uniformes ; audit HACCP B au d8 ; événements finaux sans probabilité imposée',text:'La durée d’une grève RH B, les cartes opportunité, le risque allergène BIO B et la distribution des cartes finales ne sont pas donnés. Les effets non renseignés restent exclus des simulations, et sont signalés.'}
];
export const RESEARCH = [
  {title:'Large Language Models for Supply Chain Optimization',authors:'Li et al., 2023 · OptiGuide',url:'https://arxiv.org/abs/2307.03875',use:'Questions naturelles reliées à des calculs et comparaisons vérifiables.'},
  {title:'Multi-agentic production planning utilising simulation and optimisation',authors:'Korth, Benfer & Lanza, 2026',url:'https://publikationen.bibliothek.kit.edu/1000193429',use:'Planification numérique et validation par simulation.'},
  {title:'ReAct: Synergizing Reasoning and Acting in Language Models',authors:'Yao et al., ICLR 2023',url:'https://react-lm.github.io/',use:'Boucle de décision à appels d’outils avec observations.'},
  {title:'Evolutionary multi-objective multi-agent deep reinforcement learning for sustainable maintenance scheduling',authors:'Ruiz-Rodríguez et al., 2025',url:'https://doi.org/10.1016/j.engappai.2025.111126',use:'Comparaison des objectifs économiques et de durabilité ; aucun modèle RL entraîné n’est prétendu ici.'}
];
const clone=x=>JSON.parse(JSON.stringify(x));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const sum=a=>a.reduce((s,x)=>s+x,0);
const rounded=x=>Math.round((x+Number.EPSILON)*1e8)/1e8;
const validRoll=(x,max)=>Number.isInteger(x)&&x>=1&&x<=max;
export function defaultConfig(){
  const rounds={};
  for(let t=1;t<=6;t++) rounds[t]={
    choices:Object.fromEntries(DECISIONS[t].map((d,i)=>[d.key,
      t===1?(i===0?'A':'C'):t===4?(i===0?'B':'A'):t===5?(i===0?'A':'D'):t===6?'C':'A'])),
    preventive:true,purchases:t===1?['oven','spares']:t===2?['iot','automation']:[],
    bioHost:'V1',bioCampaigns:1,keepTemp:true,internalLine:'V1',allowTransfers:true,
    extraCosts:0,extraGains:0,extraPoints:0,extraDays:[0,0,0],extraCapacity:[0,0,0],
    rolls:{v1:null,haas:null,gorreri:null,accident:null,social:null,ifs:null,plastic:null,erp:null,haccp:null,marketing:null},
    finalCard:'none',floodPrevention:false,otherGreenInvestments:0,businessCase:false,allergenIncident:false
  };
  return {
    version:VERSION,round:5,initialCash:2000,fixedCosts:1340,days:65,
    actuals:{
      1:{net:181,cash:null,points:20,status:'Profit confirmé ; points supposent zéro accident'},
      2:{net:81.7,cash:2270,points:60,status:'Profit et cash confirmés ; points supposent zéro accident'},
      3:{net:68.67,cash:2338.67,points:40,status:'A/A, aucune panne ni accident, aucun achat additionnel'},
    },
    rounds,assumptions:{
      maintenanceResume:'next',conveyorCap:'component',marketingFailure:'loss',
      interimStrikeDays:3,flourDExtra:30,ifsCAfterDeadline:'lost',
      opportunityGains:0,opportunityPoints:0,terminal:'game',
      // A sustainability preference is a user-defined tie breaker, not an official jury score.
      sustainabilityWeight:0,requireEfficiency:false
    },
    search:{trials:192,seed:42,horizon:6,technicalPurchases:true,riskPenalty:0,shortlist:24},
    historyNote:'Mise en service T2 non identifiée : aucun gain technique n’est supposé. Sécurité machines non confirmée.',
  };
}
export function normalizeConfig(value){
  const def=defaultConfig(); if(!value||typeof value!=='object')return def;
  // Whitelist the scenario schema: credentials and unknown imported properties
  // can never enter persisted configuration or reports.
  const pick=(base,input)=>Object.fromEntries(Object.keys(base).map(k=>[k,input?.[k]===undefined?base[k]:input[k]]));
  const finite=(v,fallback)=>Number.isFinite(Number(v))&&v!==null?Number(v):fallback;
  const c={...pick(def,value),version:VERSION,assumptions:pick(def.assumptions,value.assumptions),search:pick(def.search,value.search),actuals:{},rounds:{}};
  c.round=clamp(Math.round(Number(c.round)||5),1,6);c.days=clamp(Number(c.days)||65,1,366);
  c.initialCash=finite(c.initialCash,2000);c.fixedCosts=Math.max(0,finite(c.fixedCosts,1340));
  c.historyNote=typeof c.historyNote==='string'?c.historyNote:def.historyNote;
  for(let t=1;t<=6;t++){
    const actual=value.actuals?.[t]??def.actuals[t];if(!actual)continue;
    c.actuals[t]={...Object.fromEntries(['net','cash','points'].map(k=>[k,actual[k]===null||actual[k]===undefined?null:finite(actual[k],null)])),status:typeof actual.status==='string'?actual.status:'Saisie utilisateur'};
  }
  for(let t=1;t<=6;t++){
    const r=value.rounds?.[t]||{};
    c.rounds[t]={...pick(def.rounds[t],r),choices:pick(def.rounds[t].choices,r.choices),rolls:pick(def.rounds[t].rolls,r.rolls)};
    for(const d of DECISIONS[t])if(!d.options.some(o=>o.code===c.rounds[t].choices[d.key]))c.rounds[t].choices[d.key]=d.options[0].code;
    c.rounds[t].purchases=[...new Set(Array.isArray(c.rounds[t].purchases)?c.rounds[t].purchases:[])].filter(id=>INVESTMENTS.some(i=>i.id===id));
    for(const key of ['preventive','keepTemp','allowTransfers','floodPrevention','businessCase','allergenIncident'])c.rounds[t][key]=typeof r[key]==='boolean'?r[key]:def.rounds[t][key];
    for(const key of Object.keys(c.rounds[t].rolls)){const v=c.rounds[t].rolls[key];c.rounds[t].rolls[key]=validRoll(v,key==='haccp'?8:10)?v:null;}
    for(const name of ['extraCosts','extraGains','extraPoints','otherGreenInvestments'])c.rounds[t][name]=finite(c.rounds[t][name],0);
    c.rounds[t].extraDays=[0,1,2].map(i=>clamp(Number(c.rounds[t].extraDays?.[i])||0,0,c.days));
    c.rounds[t].extraCapacity=[0,1,2].map(i=>clamp(Number(c.rounds[t].extraCapacity?.[i])||0,0,10000));
    c.rounds[t].bioCampaigns=clamp(Math.round(finite(r.bioCampaigns,1)),1,100);
    c.rounds[t].bioHost=['V1','HAAS 1'].includes(r.bioHost)?r.bioHost:'V1';
    c.rounds[t].internalLine=LINES.includes(r.internalLine)?r.internalLine:'V1';
    c.rounds[t].finalCard=['none','unknown','flood','award','salmonella','subsidy'].includes(r.finalCard)?r.finalCard:'none';
  }
  for(const [key,options]of Object.entries({maintenanceResume:['next','immediate'],conveyorCap:['component','final'],marketingFailure:['loss','unchanged'],ifsCAfterDeadline:['lost','retain'],terminal:['game']}))if(!options.includes(c.assumptions[key]))c.assumptions[key]=def.assumptions[key];
  for(const key of ['interimStrikeDays','flourDExtra','opportunityGains','opportunityPoints','sustainabilityWeight'])c.assumptions[key]=finite(c.assumptions[key],def.assumptions[key]);
  c.assumptions.interimStrikeDays=clamp(c.assumptions.interimStrikeDays,0,c.days);
  c.assumptions.requireEfficiency=c.assumptions.requireEfficiency===true;
  c.search.trials=clamp(Math.round(finite(c.search.trials,192)),32,512);
  c.search.horizon=clamp(Math.round(finite(c.search.horizon,6)),c.round,6);
  c.search.seed=Math.round(finite(c.search.seed,42));c.search.shortlist=clamp(Math.round(finite(c.search.shortlist,24)),8,80);
  c.search.riskPenalty=clamp(finite(c.search.riskPenalty,0),0,3);c.search.technicalPurchases=c.search.technicalPurchases===true;
  return c;
}
export function initialState(c){
  return {cash:c.initialCash,profit:0,points:0,assets:{},choices:{},prevPreventive:true,bioInnovated:false,premiumInnovated:false,
    ifsCertified:false,ifsLost:false,plasticForced:false,erpFailure:false,marketingSuccess:false,priorClean:true,
    lastNC:.018,actualGap:0,lastRound:0};
}
function getRoll(r,key,t,scenario){
  const max=key==='haccp'?8:10;
  if(validRoll(r.rolls?.[key],max))return r.rolls[key];
  if(!scenario)return key==='marketing'||key==='ifs'?1:10-1;
  const index=['v1','haas','gorreri','accident','social','ifs','plastic','erp','haccp','marketing'].indexOf(key);
  let x=(scenario.seed+Math.imul(scenario.trial+1,0x9e3779b9)+Math.imul(t+1,0x85ebca6b)+Math.imul(index+11,0xc2b2ae35))>>>0;
  x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);x=(x^(x>>>16))>>>0;
  return 1+Math.floor(x/4294967296*max);
}
function transferPlan(demand,cap,bioOption,bioHost,bioCapacity,allowTransfers){
  const d=[...demand],native=Array(7).fill(0),transfer=Array(7).fill(0),external=Array(7).fill(0);
  if(d[6]>0){
    native[6]=bioOption==='A'?Math.min(d[6],700):bioOption==='C'?d[6]:Math.min(d[6],cap[bioHost==='HAAS 1'?1:0]);
  }
  const usedBio=bioOption==='B'?native[6]:0;
  const free=[Math.max(0,cap[0]-(bioHost==='V1'?usedBio:0)),Math.max(0,cap[1]-(bioHost==='HAAS 1'?usedBio:0)),cap[2]];
  for(let line=0;line<3;line++)for(const i of [line*2,line*2+1]){native[i]=Math.min(d[i],free[line]);free[line]-=native[i];}
  let setup=0;
  if(allowTransfers){
    for(const [i,host,yield_,fee]of [[0,1,.85,4.5],[1,1,.8,3],[3,0,.75,3.5]]){
      const q=Math.min(Math.max(0,d[i]-native[i]),free[host]*yield_);
      // Competition update: setup is covered by fixed costs, so its marginal
      // charge is zero. Keep the nominal fee only as an informational trace.
      if(q>1e-9){transfer[i]=q;free[host]-=q/yield_;setup+=fee;}
    }
  }
  return {native,transfer,external,setup,free,bioCapacity};
}
export function simulateRound(config,state,round,decision=config.rounds[round],scenario=null){
  const c=config,r=decision,t=round,a=c.assumptions,assets=state.assets;
  const s={...state,assets:{...assets},choices:{...state.choices,...r.choices},lastRound:t};
  const q=s.choices,warnings=[],expenses=[],gains=[],score=[],events=[];
  const cost=(label,amount,source)=>{if(amount)expenses.push({label,amount:roundNum(amount),source});};
  const gain=(label,amount,source)=>{if(amount)gains.push({label,amount:roundNum(amount),source});};
  const pts=(label,amount,source)=>{if(amount)score.push({label,amount,source});};
  let optionInvest=0;
  for(const spec of DECISIONS[t]){
    const pick=spec.options.find(x=>x.code===r.choices[spec.key]);
    if(pick.investment)optionInvest+=pick.cost;
    // Recurring prices are charged in their owning schedules below.
    if(['flour','energy','rh'].includes(spec.key))continue;
    cost(spec.title+' · '+pick.label,pick.cost,spec.source);
  }
  let technicalCost=0;
  for(const id of r.purchases){
    const inv=INVESTMENTS.find(x=>x.id===id);
    if(assets[id]){warnings.push(inv.name+' déjà acquis : aucun second paiement.');continue;}
    technicalCost+=inv.cost;s.assets[id]=true;
    cost(inv.name,inv.cost,inv.source);
  }
  const investment=optionInvest+technicalCost;
  if(investment>500+1e-7)warnings.push('Budget investissement dépassé : '+investment.toFixed(0)+' >500 k€.');
  if(state.cash<200&&investment>0)warnings.push('Investissement interdit après une trésorerie inférieure à 200 k€.');
  let omission=!state.prevPreventive;
  if(a.maintenanceResume==='immediate'&&r.preventive)omission=false;
  const downtime=[0,0,0],repairs=[0,0,0],failures=[],thresholds=[2,assets.oven?2:5,1],nominal=[45,40,35];
  const availability=[.92,assets.oven?.93:.85,.96];
  for(let i=0;i<3;i++){
    if(i===2&&assets.conveyor&&a.conveyorCap==='component')availability[i]=Math.min(.98,availability[i]+.02);
    if(assets.iot)availability[i]+=.03;
    if(i===2&&assets.conveyor&&a.conveyorCap==='final')availability[i]=Math.min(.98,availability[i]+.02);
    if(omission)availability[i]-=.05;
    availability[i]=clamp(rounded(availability[i]),0,1);
    thresholds[i]=clamp(thresholds[i]+(omission?2:0)-(assets.iot?2:0),1,9);
    const key=['v1','haas','gorreri'][i],die=getRoll(r,key,t,scenario);
    const failed=die<=thresholds[i]; failures.push(failed);
    if(failed){
      downtime[i]=[2,assets.spares?2:4,1][i]*(assets.training?.75:1);
      repairs[i]=[12,25,8][i];cost('Réparation '+LINES[i],repairs[i],'§5.1');
      if(i===1&&!assets.spares)pts('Panne HAAS sans pièces',-20,'§7.2');
      events.push({label:'Panne '+LINES[i],die,days:downtime[i]});
    } else if(die===10){
      events.push({label:'Carte opportunité '+LINES[i]+' : effet non fourni',die,days:0});
      gain('Opportunité '+LINES[i]+' (hypothèse)',Number(a.opportunityGains)||0,'Hypothèse utilisateur');
      pts('Opportunité '+LINES[i]+' (hypothèse)',Number(a.opportunityPoints)||0,'Hypothèse utilisateur');
    }
  }
  if(t===1){downtime[1]+={A:5,B:15,C:2,D:15}[q.repair];}
  let absence=t<=2?.06:t===3?(q.rh==='A'||q.rh==='C'?.08:.12):(q.rh==='A'?.05:q.rh==='C'?.08:.12);
  const absenceFactor=q.rh==='B'&&t>=3&&r.keepTemp?1:1-Math.max(0,absence-.04);
  if(t===3&&q.rh==='A'){cost('Plan QVT',100,'P6 A');pts('Engagement QVT',20,'§7.1');}
  if(t===3&&q.rh==='C')cost('Écoute et améliorations',20,'P6 C');
  if(t>=3&&q.rh==='B'&&r.keepTemp)cost('Intérim maintenu',60,'P6 B');
  let strikeDays=0;
  if(t>=3&&(q.rh==='B'||q.rh==='D')){
    const die=getRoll(r,'social',t,scenario);
    if(die<=(q.rh==='B'?2:4)){
      strikeDays=q.rh==='D'?3:Number(a.interimStrikeDays)||0;
      pts('Climat social',-20,'P6 / §7.2');events.push({label:'Grève',die,days:strikeDays});
      if(q.rh==='B')warnings.push('Durée grève RH B : hypothèse utilisateur ('+strikeDays+' j).');
    }
  }
  let finalDays=0;
  if(t===6&&r.finalCard==='salmonella'&&!['C','D'].includes(q.flour))finalDays=5;
  if(t===6&&r.finalCard==='flood')cost('Dégâts inondation',r.floodPrevention?75:150,'P12');
  const cap=nominal.map((v,i)=>v*Math.max(0,c.days-downtime[i]-strikeDays-finalDays-r.extraDays[i])*availability[i]*absenceFactor+r.extraCapacity[i]);
  const extraInternal=t===6&&['A','C'].includes(q.extension)?400:0;
  const internalLine=LINES.includes(r.internalLine)?LINES.indexOf(r.internalLine):0;
  cap[internalLine]+=extraInternal;
  const demand=[...DEMAND[t]];
  if(t>=5){
    let factor=1;
    if(q.competition==='C')factor=.85;
    if(q.competition==='B'){
      if(t===5)s.marketingSuccess=getRoll(r,'marketing',t,scenario)<=6;
      factor=s.marketingSuccess?1.05:(a.marketingFailure==='loss'?.85:1);
    }
    demand[0]*=factor;demand[1]*=factor;
    if(q.bio==='D'||!q.bio)demand[6]=0;
  }
  let ifsPenalty=1;
  if(t===2&&q.ifs==='C'){
    s.ifsLost=getRoll(r,'ifs',t,scenario)<=3;
    warnings.push('IFS C : aucune certification ultérieure garantie ; issue T4 selon hypothèse.');
  }
  if(t===4){
    s.ifsCertified=q.ifs==='A'||(q.ifs==='B'&&getRoll(r,'ifs',t,scenario)<=6);
    if(q.ifs==='C'&&a.ifsCAfterDeadline==='lost')s.ifsLost=true;
    if(q.ifs==='B')s.ifsLost=!s.ifsCertified;
    if(s.ifsCertified)pts('Certification IFS obtenue',50,'P3 / §7.1');
    s.erpFailure=q.erp==='B'&&getRoll(r,'erp',t,scenario)<=3;
  }
  if((t===3&&state.ifsLost)||(t>=5&&s.ifsLost))ifsPenalty=.8;
  if(t===2&&q.plastic==='A')pts('Image : rappel volontaire',10,'P4 A');
  if(t===2&&q.plastic==='B'&&getRoll(r,'plastic',t,scenario)<=2)pts('Bad buzz',-50,'P4 B');
  if(t===2&&q.plastic==='C'){
    s.plasticForced=getRoll(r,'plastic',t,scenario)<=5;
    if(s.plasticForced){cost('Rappel forcé',250,'P4 C');pts('Rappel forcé',-100,'P4 C');}
  }
  s.bioHost=t===3?r.bioHost:(state.bioHost||config.rounds[3].bioHost);
  const production=transferPlan(demand,cap,q.bio,s.bioHost,700,r.allowTransfers);
  const externalLimit=t===6?(q.extension==='B'?600:q.extension==='C'?400:0):0;
  let externalLeft=externalLimit;
  for(let i=0;i<7;i++){
    production.external[i]=Math.min(externalLeft,Math.max(0,demand[i]-production.native[i]-production.transfer[i]));
    externalLeft-=production.external[i];
  }
  let margin=0;
  const rows=PRODUCTS.map((name,i)=>{
    const delivered=production.native[i]+production.transfer[i]+production.external[i];
    const rate=i===6&&q.bio==='C'?150:BASE_MARGIN[i];
    const m=((production.native[i]+production.transfer[i])*rate+production.external[i]*150)/1000*ifsPenalty;
    margin+=m;
    return {name,demand:demand[i],rate:rate*ifsPenalty,native:production.native[i],transfer:production.transfer[i],external:production.external[i],delivered,unserved:Math.max(0,demand[i]-delivered),margin:m};
  });
  let nc=.018-(assets.automation?.005:0)-(t>=4&&q.rh==='A'?.003:0)-(t>=5&&state.ifsCertified?.002:0)-(t>=6&&q.haccp==='A'?.002:0);
  if(t===2&&q.plastic==='C')nc+=.01;
  nc=Math.max(0,rounded(nc));
  cost('Coûts fixes · changements de série inclus',c.fixedCosts-(t===6&&q.competition==='C'?80:0),'§6.1 / P10 C ; mise à jour compétition');
  if(r.preventive)cost('Préventive V1 / HAAS / Gorreri',75,'§5.2 : 25 +35 +15');
  if(q.flour==='A')cost('Farine : hausse fournisseur',30,'P2 A');
  if(q.flour==='B')cost('Farine : contrat long terme',15,'P2 B');
  if(q.flour==='C'){if(t===1)cost('Qualification fournisseur',20,'P2 C');if(t<=2)cost('Farine : transition',30,'P2 C');}
  if(q.flour==='D'){if(t===1)cost('Stock farine',150,'P2 D');cost('Farine : stockage et hausse',5+Number(a.flourDExtra),'P2 D : hausse à confirmer');}
  if(t===4)cost('Choix énergie '+q.energy,{A:300,B:120,C:50,D:0}[q.energy]||0,'P7');
  if(t>=4)cost('Surcoût énergie',q.energy==='C'?0:q.energy==='B'?40:q.energy==='A'&&t>=5?40:80,'P7');
  if(t>=5&&q.erp==='C')gain('Économie ERP cloud',10,'P8 C');
  if(t>=5&&q.bio==='C'&&demand[6]>0)cost('BIO : contrat sous-traitance',50,'P5 C');
  if(t>=5&&q.bio==='B'&&production.native[6]>0)cost('Nettoyage allergène BIO',8*Math.max(1,r.bioCampaigns),'P5 B');
  const setupCostIncludedInFixed=production.setup+(t===1&&q.repair==='D'&&production.transfer[3]===0?3.5:0);
  if(t===6&&q.competition==='A')cost('Guerre des prix reconduite',100,'P10 A');
  if(t===6&&q.competition==='D')gain('Marge produit premium',60,'P10 D');
  if(t===6&&r.finalCard==='subsidy')gain('Subvention verte',.5*((q.energy==='A'?300:0)+Math.max(0,r.otherGreenInvestments)),'P12');
  cost('Autres charges',r.extraCosts,'Saisie utilisateur');gain('Autres gains',r.extraGains,'Saisie utilisateur');pts('Autres points',r.extraPoints,'Saisie utilisateur');
  if(t===5){
    if(q.plastic==='A')pts('Audit : crise plastique bien gérée',20,'P9');
    if(s.plasticForced)pts('Audit : rappel forcé passé',-20,'P9');
    if(s.erpFailure)pts('Audit : défaut traçabilité ERP',-40,'P9');
    if(q.haccp==='B'&&getRoll(r,'haccp',t,scenario)<=2)pts('Audit HACCP échoué',-60,'P9 B');
  }
  if(t>=5&&['A','B'].includes(q.bio)&&rows[6].delivered>0&&!state.bioInnovated){s.bioInnovated=true;pts('Innovation : premiers revenus BIO',40,'§7.1');}
  if(t===6&&q.competition==='D'&&!state.premiumInnovated){s.premiumInnovated=true;pts('Innovation : premiers revenus premium',40,'§7.1');}
  if(r.allergenIncident&&t>=5&&q.bio==='B')pts('Incident allergène BIO adapté',-80,'P5 B / carte animateur');
  const accidentDie=getRoll(r,'accident',t,scenario),accidents=accidentDie<=(assets.safety?1:3)?1:0;
  pts(accidents?'Accident du travail':'Zéro accident',accidents?-40:20,'§7');
  const totalDemand=sum(demand),delivered=sum(rows.map(x=>x.delivered)),service=delivered/totalDemand;
  if(service>=.95-1e-10)pts('Service ≥95 %',30,'§7.1');
  else if(service<.85-1e-10)pts('Service <85 %',-25,'§7.2');
  if(nc<.01)pts('Qualité premium NC <1 %',25,'§7.1');
  const totalExpenses=sum(expenses.map(x=>x.amount)),totalGains=sum(gains.map(x=>x.amount)),net=margin-totalExpenses+totalGains,cash=state.cash+net;
  if(net>300+1e-9)pts('Résultat >300 k€',15,'§7.1');
  if(cash<200)pts('Alerte trésorerie',-20,'§6.4');
  const totalDays=sum(downtime)+3*(strikeDays+finalDays)+sum(r.extraDays);
  if(totalDays>10)pts('Arrêts cumulés >10 j',-30,'§7.2');
  if(t===6&&r.businessCase)pts('Business case validé par animateur',30,'§7.1');
  if(t===6&&r.finalCard==='award'&&state.priorClean&&accidents===0&&nc<.01)pts('Prix usine de l’année',80,'P12, T5/T6 sans accident et NC <1 %');
  if(t===5)s.priorClean=accidents===0&&nc<.01;
  s.lastNC=nc;s.cash=cash;s.profit=state.profit+net;s.points=state.points+sum(score.map(x=>x.amount));s.prevPreventive=!!r.preventive;
  const operational=sum(score.map(x=>x.amount));
  const errors=[];
  if(investment>500+1e-7)errors.push('Enveloppe investissement >500 k€');
  if(state.cash<200&&investment>0)errors.push('Investissement interdit par cash précédent');
  if(rows.some(x=>x.delivered>x.demand+1e-6))errors.push('Livraison au-delà de la demande');
  if(rows.some(x=>!Number.isFinite(x.margin)||x.delivered<0))errors.push('Valeur de production invalide');
  if(t===6&&r.finalCard==='unknown')warnings.push('Carte finale inconnue : aucun effet chiffré inclus.');
  return {round:t,state:s,choices:{...r.choices},rows,margin,expenses,gains,totalExpenses,totalGains,net,cash,investment,
    service,delivered,totalDemand,nc,absence,absenceFactor,availability,capacity:cap,thresholds,downtime,failures,setupCostIncludedInFixed,
    accidents,totalDays,score,operational,global:s.points+s.profit/10,events,warnings,errors,feasible:errors.length===0,
    formulas:{capacity:'t/j × (jours − arrêts) × disponibilité × facteur absence + capacité exceptionnelle',
      margin:'Σ [(production interne + transferts) × marge + externe ×150] /1000 × facteur contrat IFS',
      net:'Marge − '+totalExpenses.toFixed(2)+' de dépenses + '+totalGains.toFixed(2)+' de gains',
      cash:state.cash.toFixed(2)+' + '+net.toFixed(2),score:'Points cumulés + profit cumulé /10'}
  };
}
function roundNum(x){return Math.round(x*1e8)/1e8;}
export function stateBefore(config,t){
  const c=normalizeConfig(config);let state=initialState(c),results=[];
  for(let r=1;r<t;r++){
    const result=simulateRound(c,state,r);state=result.state;
    const actual=c.actuals[r];
    if(actual){
      if(Number.isFinite(actual.net)){state.profit+=actual.net-result.net;state.cash+=actual.net-result.net;result.netActual=actual.net;}
      if(Number.isFinite(actual.cash)){state.cash=actual.cash;result.cashActual=actual.cash;}
      if(Number.isFinite(actual.points)){state.points+=actual.points-result.operational;result.pointsActual=actual.points;}
    }
    results.push(result);
  }
  return {state,results};
}
export function evaluate(config,t=config.round,scenario=null){
  const c=normalizeConfig(config),{state}=stateBefore(c,t);return simulateRound(c,state,t,c.rounds[t],scenario);
}
export function financialView(config,result,mode='recorded'){
  const actual=config.actuals?.[result.round];
  const hasNet=Number.isFinite(actual?.net),hasCash=Number.isFinite(actual?.cash);
  const recorded=mode==='recorded'&&(hasNet||hasCash);
  return {
    mode:recorded?'recorded':'simulation',
    net:recorded&&hasNet?actual.net:result.net,
    cash:recorded&&hasCash?actual.cash:recorded&&hasNet?stateBefore(config,result.round).state.cash+actual.net:result.cash,
    netSource:recorded&&hasNet?'recorded':'simulation',
    cashSource:recorded&&hasCash?'recorded':recorded&&hasNet?'recorded_net':'simulation',
    simulatedNet:result.net,simulatedCash:result.cash,
  };
}
export function reconcile(config){
  const c=normalizeConfig(config);let cash=c.initialCash,net=0,lastCash=null,gap=0,last=0;
  for(let t=1;t<=6;t++){
    const a=c.actuals[t];if(!a)continue;
    if(Number.isFinite(a.net)){net+=a.net;cash+=a.net;}
    if(Number.isFinite(a.cash)){lastCash=a.cash;gap=a.cash-cash;last=t;}
  }
  return {lastRound:last,reportedCash:lastCash,profitSum:net,impliedCash:cash,gap:rounded(gap),consistent:Math.abs(gap)<.05};
}
export function diagnose(config){
  const c=normalizeConfig(config),issues=[];
  issues.push({type:'update',label:'Changements de série déjà compris dans les fixes',detail:SERIES_COST_RULE});
  const rec=reconcile(c);
  if(!rec.consistent)issues.push({type:'history',label:'Écart de rapprochement : '+rec.gap.toFixed(2)+' k€',detail:'Cash déclaré conservé. Profits cumulés utilisés séparément pour le score ; ne pas inventer une recette compensatoire.'});
  issues.push({type:'assumption',label:'Mise en service T2 à identifier',detail:c.historyNote});
  issues.push({type:'risk',label:'Cartes opportunité et événement final incomplets',detail:'Jets 10 détectés ; effets non fournis exclus. Aucune distribution des cartes finales n’est inventée.'});
  if(c.rounds[3].choices.bio==='B')issues.push({type:'risk',label:'Risque allergène BIO B non probabilisé',detail:'Le malus de −80 points est applicable manuellement ; aucune probabilité n’est donnée.'});
  if(c.rounds[3].choices.rh==='B')issues.push({type:'assumption',label:'Durée grève intérim supposée',detail:Number(c.assumptions.interimStrikeDays)+' jours, modifiable.'});
  return issues;
}
export function alternatives(config,t,searchInvestments=false){
  const c=config,current=c.rounds[t],combos=[];
  function walk(i,choices){
    if(i===DECISIONS[t].length){
      const bioHosts=t===3&&choices.bio==='B'?['V1','HAAS 1']:[current.bioHost];
      const hosts=t===6&&['A','C'].includes(choices.extension)?LINES:[current.internalLine];
      for(const bioHost of bioHosts)for(const internalLine of hosts)combos.push({...clone(current),choices,bioHost,internalLine,purchases:[]});
      return;
    }
    const d=DECISIONS[t][i];for(const o of d.options)walk(i+1,{...choices,[d.key]:o.code});
  }
  walk(0,{});
  const {state}=stateBefore(c,t),available=INVESTMENTS.filter(i=>!state.assets[i.id]);
  const subsets=[[]];
  if(searchInvestments&&t<6){
    // All subsets at this decision point. Later turns retain the user's purchase schedule.
    for(let mask=1;mask<(1<<available.length);mask++){
      const set=available.filter((_,i)=>mask&(1<<i));if(sum(set.map(x=>x.cost))<=500)subsets.push(set.map(x=>x.id));
    }
  }else subsets[0]=[...current.purchases];
  return combos.flatMap(x=>subsets.map(ids=>({...x,purchases:ids})));
}
function percentile(sorted,p){return sorted[Math.floor((sorted.length-1)*p)]??0;}
function energyMetric(state){
  const energy=state.choices.energy;
  // Categorical preference, never presented as measured CO2/kWh.
  return energy==='A'||energy==='B'?1:0;
}
export function planLabel(plan){
  return plan.map(p=>'T'+p.round+' '+Object.entries(p.decision.choices).map(([k,v])=>k+':'+v).join(' / ')+(p.decision.purchases.length?' +'+p.decision.purchases.join(','):'')+(p.round===6&&['A','C'].includes(p.decision.choices.extension)?' ['+p.decision.internalLine+']':'')).join(' → ');
}
export function simulatePlan(config,plan,scenario=null,startingState=null){
  const start=plan[0].round,before=startingState||stateBefore(config,start).state;let state=before,results=[],feasible=true,minCash=state.cash;
  for(const step of plan){
    const result=simulateRound(config,state,step.round,step.decision,scenario);
    results.push(result);state=result.state;feasible=feasible&&result.feasible;minCash=Math.min(minCash,result.cash);
  }
  return {state,results,feasible,minCash,global:state.points+state.profit/10};
}
export async function optimize(config,options={},onProgress=()=>{}){
  const c=normalizeConfig(config),start=c.round,end=clamp(Number(options.end??c.search.horizon),start,6);
  const maxCandidates=options.maxCandidates??12000;
  const trials=clamp(Number(options.trials??c.search.trials),32,512);
  const includeTech=options.technicalPurchases??c.search.technicalPurchases;
  const startingState=stateBefore(c,start).state;
  let frontier=[[]],truncated=false,generated=0;
  const steps={};
  for(let t=start;t<=end;t++)steps[t]=alternatives(c,t,t===start&&includeTech);
  for(let t=start;t<=end;t++){
    const next=[];
    for(const prefix of frontier)for(const decision of steps[t]){
      const plan=[...prefix,{round:t,decision}],baseline=simulatePlan(c,plan,null,startingState);
      if(!baseline.feasible)continue;
      next.push({plan,value:baseline.global,baseline});
    }
    generated+=next.length;
    const stageLimit=t===end?maxCandidates:Math.min(maxCandidates,256);
    if(next.length>stageLimit){
      next.sort((a,b)=>b.value-a.value);next.length=stageLimit;truncated=true;
    }
    frontier=next.map(x=>x.plan);
    onProgress({phase:'enumerate',round:t,total:frontier.length});
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  const rankedBase=frontier.map(plan=>({plan,baseline:simulatePlan(c,plan,null,startingState)})).filter(x=>x.baseline.feasible);
  // A separate, common-random-number pilot evaluates EVERY retained plan.
  // Optimistic-only screening would systematically discard safety investments.
  const pilotTrials=32;
  for(let index=0;index<rankedBase.length;index++){
    const item=rankedBase[index],scores=[];
    for(let k=0;k<pilotTrials;k++){
      const run=simulatePlan(c,item.plan,{seed:c.search.seed,trial:10000+k},startingState);
      scores.push(run.global-(run.minCash<0||!run.feasible?10000:0));
    }
    const mean=sum(scores)/pilotTrials;scores.sort((a,b)=>a-b);
    item.pilotMetric=mean-c.search.riskPenalty*(mean-percentile(scores,.1))+c.assumptions.sustainabilityWeight*energyMetric(item.baseline.state);
    if(c.assumptions.requireEfficiency&&!energyMetric(item.baseline.state))item.pilotMetric=-Infinity;
    if(index%16===0){onProgress({phase:'pilot',done:index+1,total:rankedBase.length});await new Promise(resolve=>setTimeout(resolve,0));}
  }
  rankedBase.sort((a,b)=>b.pilotMetric-a.pilotMetric);
  const shortlistSize=clamp(Number(options.shortlist??c.search.shortlist),8,80);
  const chosen=new Set(),families=new Map();
  for(const item of rankedBase){
    const family=JSON.stringify(item.plan[0].decision.choices);
    const count=families.get(family)||0;
    if(count<2){chosen.add(item);families.set(family,count+1);}
  }
  for(const item of rankedBase){if(chosen.size>=shortlistSize)break;chosen.add(item);}
  const pool=[...chosen].slice(0,Math.max(shortlistSize,families.size*2));
  const candidates=[];
  for(let index=0;index<pool.length;index++){
    const item=pool[index],scores=[],profits=[],cashValues=[];let bankrupt=0,serviceHits=0,invalid=0;
    for(let k=0;k<trials;k++){
      const run=simulatePlan(c,item.plan,{seed:c.search.seed,trial:k},startingState);
      const global=run.minCash<0||!run.feasible?-10000+run.global:run.global;
      scores.push(global);profits.push(run.state.profit);cashValues.push(run.state.cash);
      if(run.minCash<0)bankrupt++;
      if(!run.feasible)invalid++;
      if(run.results.every(r=>r.service>=.95-1e-9))serviceHits++;
    }
    const mean=sum(scores)/trials,meanProfit=sum(profits)/trials,meanCash=sum(cashValues)/trials;
    scores.sort((a,b)=>a-b);profits.sort((a,b)=>a-b);
    const downside=percentile(scores,.1),std=Math.sqrt(sum(scores.map(x=>(x-mean)**2))/(trials-1));
    const finalState=item.baseline.state,eco=energyMetric(finalState);
    const preference=Number(c.assumptions.sustainabilityWeight)||0;
    const metric=mean-Number(c.search.riskPenalty||0)*(mean-downside)+preference*eco;
    if(c.assumptions.requireEfficiency&&!eco)continue;
    candidates.push({...item,id:'plan-'+index,label:planLabel(item.plan),mean,meanProfit,meanCash,p10:downside,p90:percentile(scores,.9),
      standardError:std/Math.sqrt(trials),bankruptcyProbability:bankrupt/trials,infeasibleProbability:invalid/trials,serviceProbability:serviceHits/trials,eco,metric,
      profitP10:percentile(profits,.1),trials});
    onProgress({phase:'simulate',done:index+1,total:pool.length});
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  candidates.sort((a,b)=>b.metric-a.metric);
  const pareto=candidates.filter(x=>!candidates.some(y=>y!==x&&y.mean>=x.mean&&y.p10>=x.p10&&y.eco>=x.eco&&(y.mean>x.mean+.001||y.p10>x.p10+.001||y.eco>x.eco)));
  return {best:candidates[0]||null,candidates,pareto,meta:{
    start,end,trials,pilotTrials,seed:c.search.seed,generated,screened:rankedBase.length,simulated:pool.length,truncated,
    method:'Énumération, pilote de risque de 32 scénarios sur chaque plan retenu, puis simulation indépendante des plans présélectionnés. Nombres aléatoires communs entre plans.',
    optimality:'Meilleur plan dans la présélection simulée. Pas de certificat d’optimalité globale en espérance.',
    purchaseScope:'Tous les sous-ensembles d’achats au tour courant ; achats futurs fixés au planning saisi. Les 400 t internes sont affectées en bloc à une des trois lignes. Au-delà de 256 préfixes, élagage sur le score sans incident.',
    policy:'Plan ouvert : décisions fixées avant les jets. Les jets observés saisis sont conservés ; comparer après saisie est rétrospectif.',
    excluded:'Effets des opportunités non chiffrés, probabilités de cartes finales et de contamination BIO non fournies.'
  }};
}
export function explain(result){
  const keys=Object.entries(result.choices).map(([k,v])=>k+' '+v).join(' / ');
  return [
    'T'+result.round+' · '+keys,
    'Livraisons : '+result.delivered.toFixed(2)+' / '+result.totalDemand.toFixed(2)+' t, soit '+(result.service*100).toFixed(2)+' %.',
    'Marge '+result.margin.toFixed(2)+' − dépenses '+result.totalExpenses.toFixed(2)+' + gains '+result.totalGains.toFixed(2)+' = net '+result.net.toFixed(2)+' k€.',
    'Disponibilités machines : '+result.availability.map(x=>(x*100).toFixed(0)+' %').join(' / ')+'. Absence '+(result.absence*100).toFixed(0)+' % ; facteur '+result.absenceFactor.toFixed(2)+'.',
    'Points du tour : '+result.operational+'. '+result.score.map(x=>x.label+' '+(x.amount>0?'+':'')+x.amount).join(' ; ')+'.',
    ...result.warnings
  ].join('\n');
}
