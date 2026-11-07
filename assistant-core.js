/* Deterministic finance facts, validated drafts, and atomic expense batches. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PesoAssistantCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const KINDS=['Expense','Income','Transfer','Refund','Savings Contribution','Emergency Fund Contribution','Allowance Payment','Bill Payment','Adjustment','Fund Withdrawal'];
 const TYPES=['transaction','wallet','category','fund','bill','budget','debt','payment','transactionType'];
 const text=(v,max=120)=>String(v??'').slice(0,max);
 const amount=v=>Number.isSafeInteger(v)?v:0;
 const money=v=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(amount(v)/100);
 function canonical(s,label){const seen=new Set();while(s.typeAliases?.[label]&&!seen.has(label)){seen.add(label);label=s.typeAliases[label];}return label||'Expense';}
 const expense=(s,t)=>['Expense','Bill Payment','Allowance Payment'].includes(canonical(s,t.typeLabel))?amount(t.amount):canonical(s,t.typeLabel)==='Refund'?-amount(t.amount):0;
 function walletBalance(s,a){return amount(a.openingBalance)+(s.transactions||[]).reduce((sum,t)=>{const k=canonical(s,t.typeLabel),v=amount(t.amount);return sum+(t.account===a.name?(['Income','Refund','Adjustment','Fund Withdrawal'].includes(k)?v:-v):0)+(k==='Transfer'&&t.destinationAccount===a.name?v:0);},0);}
 function fundBalance(s,f){return (s.transactions||[]).filter(t=>t.fundId===f.id).reduce((sum,t)=>{const k=canonical(s,t.typeLabel);return sum+(['Savings Contribution','Emergency Fund Contribution'].includes(k)?amount(t.amount):k==='Fund Withdrawal'?-amount(t.amount):0);},0);}
 function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number(value.slice(0,4))>=1900&&Number(value.slice(0,4))<=2200&&!Number.isNaN(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
 function redact(value){return text(value,8000).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email removed]').replace(/(?:\+?\d[\d ()-]{8,}\d)/g,'[number removed]');}
 function buildContext(s,opt={}){
  const today=opt.today||new Date().toISOString().slice(0,10),month=opt.month||s.selectedMonth||today.slice(0,7),focus=(s.accounts||[]).find(a=>a.id===opt.focus),all=s.transactions||[];
  const relevant=all.filter(t=>(!focus||t.account===focus.name||t.destinationAccount===focus.name)&&(opt.day?t.date===opt.day:opt.start?t.date>=opt.start&&t.date<=opt.end:month==='all'||t.date?.startsWith(month)));
  const categoryTotals=new Map();for(const t of relevant){const n=expense(s,t);if(n)categoryTotals.set(t.category||'Uncategorized',(categoryTotals.get(t.category||'Uncategorized')||0)+n);}
  const accountByName=new Map((s.accounts||[]).map(a=>[a.name,a.id]));
  const accounts=(s.accounts||[]).map(a=>({id:text(a.id),name:redact(a.name),kind:text(a.kind,30),balanceCentavos:walletBalance(s,a),archived:!!a.archived}));
  const funds=(s.funds||[]).map(f=>({id:text(f.id),name:redact(f.name),kind:text(f.type,25),balanceCentavos:fundBalance(s,f),targetCentavos:amount(f.target),monthlyCentavos:amount(f.monthly),archived:!!f.archived}));
  const income=relevant.filter(t=>canonical(s,t.typeLabel)==='Income').reduce((n,t)=>n+amount(t.amount),0),spending=relevant.reduce((n,t)=>n+expense(s,t),0);
  const recent=relevant.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||(b.createdAt||0)-(a.createdAt||0));
  const series=[...new Set(all.map(t=>String(t.date||'').slice(0,7)).filter(m=>/^\d{4}-\d{2}$/.test(m)))].sort().slice(-12).map(m=>{const rows=all.filter(t=>t.date?.startsWith(m)&&(!focus||t.account===focus.name||t.destinationAccount===focus.name));return {month:m,incomeCentavos:rows.filter(t=>canonical(s,t.typeLabel)==='Income').reduce((n,t)=>n+amount(t.amount),0),spendingCentavos:rows.reduce((n,t)=>n+expense(s,t),0)};});
  const cfg=s.monthly?.[month]||{};
  return {today,month,day:opt.day||'',start:opt.start||'',end:opt.end||'',view:text(opt.view||'Dashboard',50),focus:focus?focus.id:'',currency:'PHP',unit:'integer centavos (100 centavos = 1 peso)',defaults:{date:today,accountId:opt.defaultExpenseWalletId||focus?.id||'',autoAddExpenses:!!opt.autoExpenses},
   totals:{incomeCentavos:income,spendingCentavos:spending,netCashflowCentavos:income-spending,transactionCount:relevant.length,netWorthCentavos:accounts.reduce((n,a)=>n+a.balanceCentavos,0)+funds.filter(f=>f.kind!=='allowance').reduce((n,f)=>n+f.balanceCentavos,0)},
   accounts:accounts.slice(0,80),categories:(s.categories||[]).slice(0,100).map(c=>text(c,60)),transactionTypes:(s.transactionTypes||[]).slice(0,40).map(name=>({name:text(name,60),behavior:canonical(s,name)})),paymentMethods:(s.paymentMethods||[]).slice(0,40).map(p=>text(p,60)),funds:funds.slice(0,60),
   categoryTotals:[...categoryTotals].sort((a,b)=>b[1]-a[1]).map(([name,n])=>({name,spendingCentavos:n,budgetCentavos:amount(s.budgets?.[month]?.[name])})),
   budgets:Object.entries(s.budgets?.[month]||{}).slice(0,100).map(([category,v])=>({category,limitCentavos:amount(v),spentCentavos:categoryTotals.get(category)||0})),
   targets:{incomeCentavos:amount(cfg.incomeTarget),spendingCentavos:amount(cfg.spendingTarget),savingsCentavos:amount(cfg.savingsTarget)},
   bills:(s.bills||[]).filter(b=>!focus||b.account===focus.name).slice().sort((a,b)=>String(a.nextDue).localeCompare(String(b.nextDue))).slice(0,40).map(b=>({id:text(b.id),name:redact(b.name),amountCentavos:amount(b.amount),nextDue:text(b.nextDue,10),frequency:text(b.frequency,20),accountId:accountByName.get(b.account)||''})),
   debts:(s.plus?.debts||[]).slice(0,30).map((d,i)=>({id:String(i),name:redact(d.name),balanceCentavos:amount(d.balance),apr:Number(d.apr)||0,paymentCentavos:amount(d.payment)})),
   transactions:recent.slice(0,40).map(t=>({id:text(t.id),date:text(t.date,10),kind:canonical(s,t.typeLabel),amountCentavos:amount(t.amount),accountId:accountByName.get(t.account)||'',destinationId:accountByName.get(t.destinationAccount)||'',category:text(t.category,60),description:redact(text(t.description,200)),merchant:redact(text(t.merchant,100)),fundId:text(t.fundId)})),
   monthlyHistory:series,coverage:'Totals include every matching record. Detail rows are limited to the 40 most recent records in the chosen period and wallet. Balances and net worth are current across all dates. Monthly history contains up to 12 recorded months. Notes, profile, email, card digits, logos and deleted records are excluded.'};
 }
 function entity(s,a){switch(a.type){case'transaction':return s.transactions.find(x=>x.id===a.id);case'wallet':return s.accounts.find(x=>x.id===a.id);case'fund':return s.funds.find(x=>x.id===a.id);case'bill':return s.bills.find(x=>x.id===a.id);case'category':return s.categories.includes(a.id)?a.id:undefined;case'payment':return s.paymentMethods.includes(a.id)?a.id:undefined;case'transactionType':return s.transactionTypes.includes(a.id)?a.id:undefined;case'debt':return s.plus?.debts?.[Number(a.id)];case'budget':return {targets:s.monthly?.[a.month||s.selectedMonth]||{},categories:s.budgets?.[a.month||s.selectedMonth]||{}};}}
 function validateAction(raw,s,opt={}){
  if(!raw||typeof raw!=='object'||!TYPES.includes(raw.type))throw Error('Unsupported action. Ask for a transaction, wallet, category, budget, fund, bill, or debt.');
  const operation=raw.operation||'create';if(!['create','edit','delete','pay'].includes(operation)||operation==='pay'&&raw.type!=='bill'||['budget','payment','transactionType'].includes(raw.type)&&operation==='delete')throw Error('This action is not supported. Use the corresponding settings page.');
  const a={type:raw.type,operation};if(raw.id!==undefined){if(typeof raw.id!=='string'||raw.id.length>120)throw Error('Invalid record reference.');a.id=raw.id;}
  if(operation!=='create'&&raw.type!=='budget'&&!entity(s,a))throw Error('That record is no longer available. Ask again using its current name.');
  if(raw.type==='budget')a.month=opt.month||s.selectedMonth;
  const moneyFields=['amountCentavos','openingBalanceCentavos','targetCentavos','monthlyCentavos','budgetCentavos','incomeTargetCentavos','spendingTargetCentavos','savingsTargetCentavos','balanceCentavos','minimumCentavos','paymentCentavos'];
  for(const key of moneyFields)if(raw[key]!==undefined){if(!Number.isSafeInteger(raw[key])||Math.abs(raw[key])>999999999999)throw Error('Use a valid amount with at most two decimal places.');a[key]=raw[key];}
  for(const key of ['kind','name','description','merchant','category','accountId','destinationId','fundId','paymentMethod','frequency','date','nextDue','targetDate'])if(raw[key]!==undefined){if(typeof raw[key]!=='string'||raw[key].length>(key==='description'?200:120))throw Error('An action field is invalid or too long.');a[key]=raw[key].trim();}
  for(const key of ['name','category'])if(['__proto__','constructor','prototype'].includes(a[key]))throw Error('Choose a different name.');
  if(a.type==='transaction'&&a.kind&&!KINDS.includes(a.kind))throw Error('Unknown transaction behavior.');
  for(const key of moneyFields)if(a[key]<0&&!['openingBalanceCentavos'].includes(key)&&!(key==='amountCentavos'&&a.kind==='Adjustment'))throw Error('This amount cannot be negative.');
  for(const key of ['accountId','destinationId'])if(a[key]){const wallet=s.accounts.find(x=>x.id===a[key]);if(!wallet||wallet.archived)throw Error('Choose an active wallet.');}
  if(a.accountId&&a.destinationId&&a.accountId===a.destinationId)throw Error('A transfer needs two different wallets.');
  if(a.fundId&&!s.funds.some(f=>f.id===a.fundId&&!f.archived))throw Error('Choose an active fund.');
  if(a.category&&!s.categories.includes(a.category)&&a.type!=='category')throw Error('That category does not exist. Add it in Settings first.');
  if(a.paymentMethod&&!s.paymentMethods.includes(a.paymentMethod))throw Error('That payment method does not exist.');
  for(const key of ['date','nextDue','targetDate'])if(a[key]&&!validDate(a[key]))throw Error('Choose a real date in YYYY-MM-DD format.');
  if(a.type==='wallet'&&a.kind&&!['Cash','Bank','E-Wallet','Credit Card','Investment','Other'].includes(a.kind))throw Error('Unsupported wallet type.');
  if(a.type==='fund'&&a.kind&&!['savings','goal','emergency','allowance'].includes(a.kind))throw Error('Unsupported allocation type.');
  if(a.type==='bill'&&a.frequency&&!['Monthly','Weekly','Biweekly','Quarterly','Yearly'].includes(a.frequency))throw Error('Unsupported bill frequency.');
  if(a.type==='transactionType'&&a.kind&&!KINDS.includes(a.kind))throw Error('Choose a financial behavior.');
  if(raw.apr!==undefined){if(typeof raw.apr!=='number'||!Number.isFinite(raw.apr)||raw.apr<0||raw.apr>1000)throw Error('Invalid annual interest rate.');a.apr=raw.apr;}
  return a;
 }
 function validateResponse(raw,s,opt={}){
  if(!raw||typeof raw.reply!=='string'||!raw.reply.trim()||raw.reply.length>12000)throw Error('The assistant returned an unreadable answer. Try again.');
  if(raw.actions!==undefined&&(!Array.isArray(raw.actions)||raw.actions.length>50))throw Error('Ask for up to 50 changes at a time.');
  return {reply:raw.reply,actions:(raw.actions||[]).map(a=>validateAction(a,s,opt))};
 }
 const reEscape=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 function named(items,message,getName=x=>x.name){return items.map(item=>({item,index:message.toLowerCase().search(new RegExp('(^|[^a-z0-9])'+reEscape(getName(item).toLowerCase())+'(?=$|[^a-z0-9])','i'))})).filter(x=>x.index>=0).sort((a,b)=>a.index-b.index).map(x=>x.item);}
 function parseMoney(message){const clean=message.replace(/\b\d{4}-\d{2}(?:-\d{2})?\b/g,'').replace(/\b(?:BPI|BDO|RCBC|PNB|UB|wallet|account)\s*\d{4}\b/gi,'');const m=clean.match(/(?:₱|\bphp\s*|\bpeso[s]?\s*)?(-?\d[\d,]*(?:\.\d+)?)(\s*[kK]\b)?/);if(!m)return undefined;const raw=m[1].replace(/,/g,'');if(!/^-?\d+(\.\d{1,2})?$/.test(raw))return NaN;const n=Math.round(Number(raw)*100*(m[2]?1000:1));return Number.isSafeInteger(n)?n:NaN;}
 function shiftedDay(today,days){return new Date(Date.parse(today+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);}
 function expenseFingerprint(t){return [t.date,t.account,t.amount,String(t.description||'').trim().toLowerCase().replace(/\s+/g,' '),String(t.merchant||'').trim().toLowerCase()].join('|');}
 function prepareExpenseBatch(s,actions,opt={}){
  if(!Array.isArray(actions)||!actions.length||actions.length>50)throw Error('Choose between 1 and 50 expenses.');
  const seen=new Set((s.transactions||[]).filter(t=>canonical(s,t.typeLabel)==='Expense').map(expenseFingerprint)),duplicates=[];
  const rows=actions.map((raw,index)=>{
   const a=validateAction(raw,s);if(a.type!=='transaction'||a.operation!=='create'||a.kind!=='Expense'||a.fundId||a.destinationId)throw Error('Only new expenses without allocations can be added together. Review other actions separately.');
   if(!Number.isSafeInteger(a.amountCentavos)||a.amountCentavos<=0)throw Error('Entry '+(index+1)+': enter an amount greater than zero.');
   const wallet=s.accounts.find(w=>w.id===(a.accountId||opt.defaultWalletId)&&!w.archived);if(!wallet)throw Error('Entry '+(index+1)+': choose an active wallet.');
   const date=a.date||opt.today;if(!validDate(date))throw Error('Entry '+(index+1)+': choose a valid date.');if(!a.description?.trim())throw Error('Entry '+(index+1)+': add a description.');
   const row={typeLabel:s.transactionTypes.find(v=>canonical(s,v)==='Expense')||'Expense',amount:a.amountCentavos,date,account:wallet.name,destinationAccount:null,category:a.category||'',description:a.description,merchant:a.merchant||'',paymentMethod:a.paymentMethod||(s.paymentMethods.includes(s.settings?.defaultPayment)?s.settings.defaultPayment:''),fundId:null,essential:true,recurring:false,notes:''};
   const fingerprint=expenseFingerprint(row);if(seen.has(fingerprint))duplicates.push(index);seen.add(fingerprint);return row;
  });
  const total=rows.reduce((sum,row)=>sum+row.amount,0);if(!Number.isSafeInteger(total))throw Error('The total is too large.');return {rows,total,duplicates};
 }
 function expenseList(s,q,opt={}){
  if(/^(?:show|list|what|how|summar|which)\b/i.test(q))return null;
  if(/\b(?:do not|don't|dont|never|example|sample|hypothetical|preview|draft|what if)\b/i.test(q))return {reply:'I have not added anything. Use an explicit Add expenses request when you want to record the list.',actions:[],provider:'Built-in'};
  if(/^(?:please\s+)?(?:delete|remove|edit|change|update|transfer|refund)\b/i.test(q)&&/[\n;]/.test(q))return {reply:'Review changes to existing records one at a time, using the exact description and amount.',actions:[],provider:'Built-in'};
  let body=q,header='';const colon=q.indexOf(':');if(colon>=0&&/\b(?:add|record|log|save|enter|expenses|gastos)\b/i.test(q.slice(0,colon))){header=q.slice(0,colon);body=q.slice(colon+1);}
  let lines=body.split(/[\n;]+|,\s*(?=[A-Za-z₱])/).map(v=>v.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, '')).filter(Boolean);
  if(!header&&lines.length>1&&/\b(?:add|record|log|save|enter)\b.*\b(?:expenses|entries)\b/i.test(lines[0]))header=lines.shift();
  if(lines.length<2&&!header)return null;if(lines.length>50)return {reply:'Send up to 50 expenses at a time.',actions:[],provider:'Built-in'};
  if(lines.some(line=>/\b(?:income|received|salary|transfer|refund|delete|edit|withdraw|contribute|fund|budget|category)\b/i.test(line)))return null;
  if(!lines.length||lines.some(line=>!/[A-Za-z]/.test(line)||parseMoney(line)===undefined))return null;
  const wallets=named(s.accounts.filter(w=>!w.archived),header||q),commonWallet=wallets.length===1?wallets[0].id:opt.focus||opt.defaultExpenseWalletId;
  if(header&&/\b(?:from|using|via)\s+/i.test(header)&&!wallets.length)return {reply:'That wallet was not found. Use an existing wallet name or choose one in the review form.',actions:[],provider:'Built-in'};
  const headerDate=header.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0]||(/\b(yesterday|kahapon)\b/i.test(header)?shiftedDay(opt.today,-1):undefined),actions=[];
  for(const line of lines){
   const localWallets=named(s.accounts.filter(w=>!w.archived),line),accountId=localWallets[0]?.id||(/\b(?:from|using|via)\s+/i.test(line)?undefined:commonWallet);
   const amountText=line.replace(/\b\d{4}-\d{2}-\d{2}\b/g,''),nums=amountText.match(/(?:₱\s*|php\s*)?-?\d[\d,]*(?:\.\d+)?(?:\s*k\b)?/gi)||[];
   if(nums.length!==1)return {reply:'Please use one total amount per line, for example “Lunch 150”. Quantities and multiple amounts need a clear total.',actions:[],provider:'Built-in'};
   const n=parseMoney(line);if(!Number.isSafeInteger(n)||n<=0)return {reply:'Each expense needs a positive amount with up to two decimal places.',actions:[],provider:'Built-in'};
   const date=line.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0]||(/\b(yesterday|kahapon)\b/i.test(line)?shiftedDay(opt.today,-1):headerDate||opt.today);
   let description=line.replace(/\b\d{4}-\d{2}-\d{2}\b/g,'').replace(nums[0],'').replace(/^(?:add|record|log|spent|paid|expense)\s+(?:an?\s+)?/i,'').replace(/\b(?:today|yesterday|kahapon|ngayon)\b/gi,'');
   for(const wallet of localWallets)description=description.replace(new RegExp('(?:\\b(?:from|using|via|in)\\s+)?'+reEscape(wallet.name),'ig'),'');
   description=description.replace(/^[\s:—–\-₱]+|[\s:—–\-₱]+$/g,'').replace(/\s+/g,' ').slice(0,200);
   const category=named(s.categories,line,x=>x)[0]||(/lunch|dinner|breakfast|meal|food|pagkain/i.test(line)?s.categories.find(c=>/^food$/i.test(c)):/coffee|kape/i.test(line)?s.categories.find(c=>/coffee/i.test(c)):/grab|jeep|fare|pamasahe|transport/i.test(line)?s.categories.find(c=>/transport/i.test(c)):undefined);
   try{actions.push(validateAction({type:'transaction',operation:'create',kind:'Expense',amountCentavos:n,date,description,...(accountId?{accountId}:{}),...(category?{category}:{})},s));}catch(e){return {reply:e.message,actions:[],provider:'Built-in'};}
  }
  return {reply:actions.length+' expenses · '+money(actions.reduce((n,a)=>n+a.amountCentavos,0))+'. Review the list or add them together.',actions,provider:'Built-in'};
 }
 function queryOptions(s,q,opt={}){
  const today=opt.today||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila'}).format(new Date());
  let month=opt.month||s.selectedMonth||today.slice(0,7),day='',start='',end='';
  if(/\blast month\b/i.test(q)){const d=new Date(today+'T12:00:00Z');d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-1);month=d.toISOString().slice(0,7);}
  else if(/\bthis month\b/i.test(q))month=today.slice(0,7);else if(/\ball time\b/i.test(q))month='all';else if(/\b\d{4}-\d{2}\b/.test(q))month=q.match(/\b\d{4}-\d{2}\b/)[0];
  if(/\byesterday\b/i.test(q))day=shiftedDay(today,-1);else if(/\btoday\b/i.test(q))day=today;else day=q.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0]||'';
  if(/\blast (?:7|seven) days\b/i.test(q)){start=shiftedDay(today,-6);end=today;day='';}
  else if(/\b(?:last|this) week\b/i.test(q)){const offset=(new Date(today+'T12:00:00Z').getUTCDay()+6)%7;start=shiftedDay(today,-offset-(/last week/i.test(q)?7:0));end=/last week/i.test(q)?shiftedDay(start,6):today;day='';}
  const matches=named(s.accounts||[],q);return {...opt,today,month,day,start,end,focus:matches.length===1?matches[0].id:opt.focus||''};
 }
 function localReply(s,message,opt={}){
  const q=message.trim(),lower=q.toLowerCase(),query=queryOptions(s,q,opt),{today,month,day,focus}=query;
  const ctx=buildContext(s,query),scope=(day||(query.start?query.start+' to '+query.end:month))+(focus?' · '+s.accounts.find(a=>a.id===focus)?.name:''),result=(reply,actions=[],choices=[])=>({reply,actions,choices,provider:'Built-in'});
  const batch=expenseList(s,q,{...opt,today,focus});if(batch)return batch;
  const lines=q.split(/[\n;]+/).map(x=>x.trim()).filter(Boolean);
  if(lines.length>1){if(lines.length>50)return result('Please send up to 50 entries at a time.');const replies=lines.map(line=>localReply(s,line,opt));return result('Review each draft below. Nothing has been saved.\n\n'+replies.map((r,i)=>(i+1)+'. '+r.reply).join('\n'),replies.flatMap(r=>r.actions));}
  const shorthand=/^(?:lunch|dinner|breakfast|coffee|groceries|pamasahe|fare|food)\b.*\d/i.test(q);
  if(/\b(?:payday|forecast|theme|appearance|backup|export|import)\b/i.test(q))return result('Open the '+(/payday/i.test(q)?'payday planner':/forecast/i.test(q)?'cash-flow forecast':'settings')+' to review and adjust these options.',[],[{label:'Open '+(/payday/i.test(q)?'payday planner':/forecast/i.test(q)?'forecast':'settings'),view:/payday/i.test(q)?'payday':/forecast/i.test(q)?'forecast':'settings'}]);
  const write=shorthand||/\b(add|record|log|spent|paid|received|transfer|move|create|new|edit|change|rename|update|delete|remove|set|pay|save|withdraw|contribute)\b/i.test(q)&&! /^(how|what|which|when|why|show|list|summar|can i|could i|do i|am i|is |are )/i.test(q);
  if(write){
   const operation=/\b(delete|remove)\b/i.test(q)?'delete':/\b(edit|change|rename|update)\b/i.test(q)?'edit':'create';
   let type=/\b(category|categories)\b/i.test(q)?'category':/\b(budget|target)\b/i.test(q)&&! /\b(fund|goal|savings)\b/i.test(q)?'budget':/\b(wallet|account|bank|e-wallet)\b/i.test(q)&&!shorthand&&! /\b(expense|refund|income|spent|paid|received|transfer|move|withdraw|contribute|save)\b/i.test(q)?'wallet':/\b(bill)\b/i.test(q)?'bill':/\b(debt|loan)\b/i.test(q)?'debt':/\b(payment method)\b/i.test(q)?'payment':/\b(transaction type)\b/i.test(q)?'transactionType':/\b(fund|goal|allocation)\b/i.test(q)&&! /\b(transfer|move|withdraw|contribute|spent|paid|received)\b/i.test(q)?'fund':'transaction';
   const a={type,operation},n=parseMoney(q),wallets=named(s.accounts.filter(x=>!x.archived),q),funds=named(s.funds.filter(x=>!x.archived),q),cats=named(s.categories,q,x=>x);
   if(Number.isNaN(n))return result('Use an amount with up to two decimal places, for example ₱125.50.');
   if(type==='transaction'){
    if(operation==='create'){
     a.kind=/\b(transfer|move)\b/i.test(q)?'Transfer':/\b(refund)\b/i.test(q)?'Refund':/\b(withdraw)\b/i.test(q)&&funds.length?'Fund Withdrawal':/\b(contribute|save|saving|savings)\b/i.test(q)?(funds[0]?.type==='emergency'?'Emergency Fund Contribution':'Savings Contribution'):/\b(allowance)\b/i.test(q)&&funds[0]?.type==='allowance'?'Allowance Payment':/\b(income|salary|received|earned)\b/i.test(q)?'Income':'Expense';
     if(n!==undefined)a.amountCentavos=n;a.date=q.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0]||(/\byesterday\b/i.test(q)?shiftedDay(today,-1):today);a.description=q.slice(0,200);
     if(wallets[0])a.accountId=wallets[0].id;else if(!/\b(?:from|using|via)\s+/i.test(q)){if(focus)a.accountId=focus;else if(a.kind==='Expense'&&opt.defaultExpenseWalletId)a.accountId=opt.defaultExpenseWalletId;}
     if(a.kind==='Transfer'){const from=q.match(/\bfrom\s+(.+?)(?:\s+to\s+|$)/i)?.[1],to=q.match(/\bto\s+(.+)/i)?.[1];if(from)a.accountId=named(s.accounts,from)[0]?.id;if(to)a.destinationId=named(s.accounts,to)[0]?.id;else if(wallets[1])a.destinationId=wallets[1].id;}
     if(funds[0])a.fundId=funds[0].id;if(cats[0])a.category=cats[0];else if(/\b(lunch|dinner|breakfast|food|meal)\b/i.test(q)&&s.categories.includes('Food'))a.category='Food';else if(/\bcoffee\b/i.test(q)&&s.categories.includes('Coffee'))a.category='Coffee';
    }else{
     const eligible=s.transactions.filter(t=>month==='all'||t.date?.startsWith(month)).filter(t=>!focus||t.account===s.accounts.find(x=>x.id===focus)?.name||t.destinationAccount===s.accounts.find(x=>x.id===focus)?.name);
     const hits=eligible.filter(t=>(t.description&&lower.includes(t.description.toLowerCase()))||(t.merchant&&lower.includes(t.merchant.toLowerCase()))||(n!==undefined&&t.amount===n));
     if(hits.length!==1)return result('Choose the exact transaction in Transactions, or include its description and amount. I won’t guess which record to '+operation+'.',[],[{label:'Open transactions',view:'transactions'}]);a.id=hits[0].id;if(operation==='edit'){const change=q.match(/\bto\s+(?:₱|php\s*)?(-?\d[\d,.]*(?:k\b)?)/i);if(change){const replacement=parseMoney(change[1]);if(!Number.isSafeInteger(replacement))return result('Use an amount with up to two decimal places.');a.amountCentavos=replacement;a.kind=canonical(s,hits[0].typeLabel);}}
    }
   }else if(type==='budget'){a.operation='edit';if(n!==undefined){if(cats[0]){a.category=cats[0];a.budgetCentavos=n;}else if(/income/i.test(q))a.incomeTargetCentavos=n;else if(/saving/i.test(q))a.savingsTargetCentavos=n;else if(/spending|overall/i.test(q))a.spendingTargetCentavos=n;else return result('Name an existing category, or say “overall spending target”. I won’t guess which budget to change.');}}
   else{
    const list=type==='wallet'?s.accounts:type==='fund'?s.funds:type==='bill'?s.bills:type==='debt'?(s.plus?.debts||[]).map((d,i)=>({...d,id:String(i)})):type==='category'?s.categories.map(name=>({id:name,name})):type==='payment'?s.paymentMethods.map(name=>({id:name,name})):s.transactionTypes.map(name=>({id:name,name}));
    const matches=named(list,q);if(type==='bill'&&/\bpay\b/i.test(q))a.operation='pay';
    if(a.operation!=='create'){if(matches.length!==1)return result('Name the exact '+type+' you want to '+a.operation+'. You can also manage it from its page.');a.id=matches[0].id;}
    const renamed=q.match(/\bto\s+["“]?([^"”]+?)["”]?$/i),quoted=q.match(/["“]([^"”]+)["”]/),tail=q.match(/\b(?:named|called)\s+(.+)$/i)||q.match(/\b(?:category|wallet|account|fund|goal|allocation|bill|debt|loan|payment method|transaction type)\s+(.+)$/i);
    if(a.operation==='create')a.name=text(quoted?.[1]||tail?.[1]||'',80).replace(/^(?:with|for|of|at)\s+.*$/i,'').replace(/\s+(?:for|with|of|at)\s+.*$/i,'').trim();else if(renamed&&/rename/i.test(q))a.name=text(renamed[1],80);
    if(n!==undefined){if(type==='wallet')a.openingBalanceCentavos=n;else if(type==='category')a.budgetCentavos=n;else if(type==='fund')a.targetCentavos=n;else if(type==='bill')a.amountCentavos=n;else if(type==='debt')a.balanceCentavos=n;}
    if(type==='wallet'){if(a.operation==='create')a.kind=/\b(gcash|maya|e-wallet)\b/i.test(q)?'E-Wallet':/\bbank\b/i.test(q)?'Bank':'Cash';if(!a.name&&a.operation==='create')a.name=q.match(/(?:add|create)\s+(?:a\s+)?(.+?)\s+(?:wallet|account)/i)?.[1]||'';}if(type==='fund'&&a.operation==='create')a.kind=/\bgoal\b/i.test(q)?'goal':/allowance/i.test(q)?'allowance':/emergency/i.test(q)?'emergency':'savings';
   }
   try{return result((a.operation==='delete'?'Removal is ready to review.':a.operation==='pay'?'Review the bill payment before recording it.':'Your '+a.type+' draft is ready. Fill any missing details in the review form.')+' Nothing has been saved.',[validateAction(a,s,{month})]);}catch(e){return result(e.message);}
  }
  if(/\b(bill|due|upcoming|overdue)\b/i.test(q))return result(ctx.bills.length?'Upcoming bills\n'+ctx.bills.slice(0,8).map(b=>b.nextDue+' · '+b.name+' · '+money(b.amountCentavos)).join('\n'):'You have no recurring bills in this wallet scope.',[],[{label:'Manage bills',view:'bills'}]);
  if(/\b(balance|wallet|net worth|money left)\b/i.test(q))return result('Current balances · all dates\n'+ctx.accounts.filter(a=>!focus||a.id===focus).map(a=>a.name+': '+money(a.balanceCentavos)+(a.archived?' (archived)':'')).join('\n')+'\n\nTracked net worth: '+money(ctx.totals.netWorthCentavos)+' including savings pots. These are your recorded balances, not live bank balances.');
  if(/\b(budget|afford|spend today|left to spend|over budget)\b/i.test(q)){const target=ctx.targets.spendingCentavos,remaining=target-ctx.totals.spendingCentavos;return result('Budget · '+scope+'\n'+(target?'Overall monthly target: '+money(target)+'\nRecorded spending in this scope: '+money(ctx.totals.spendingCentavos)+'\n'+(focus?'Compare the full workspace for total budget remaining.':remaining>=0?'Remaining: '+money(remaining):'Over target: '+money(-remaining)):'No monthly spending target is set.')+'\n\n'+ctx.budgets.slice(0,8).map(b=>b.category+': '+money(b.spentCentavos)+' / '+money(b.limitCentavos)).join('\n'),[],[{label:'Edit budget',prompt:'Edit my budget'}]);}
  if(/\b(fund|goal|savings|emergency|allowance)\b/i.test(q))return result('Savings & allocations · current\n'+ctx.funds.map(f=>f.name+': '+(f.kind==='allowance'?'monthly allowance target '+money(f.monthlyCentavos):money(f.balanceCentavos)+' of '+money(f.targetCentavos))).join('\n'),[],[{label:'Manage allocations',view:'savings'}]);
  if(/\b(debt|loan)\b/i.test(q))return result(ctx.debts.length?'Debt plans\n'+ctx.debts.map(d=>d.name+': '+money(d.balanceCentavos)+' · '+d.apr+'% APR · '+money(d.paymentCentavos)+'/month').join('\n'):'No debt plans yet.',[],[{label:'Open debt planner',view:'debt'}]);
  if(/\b(summary|summarize|overview|expense|expenses|spend|spent|spending|income|earned|month|today|yesterday|food|coffee)\b/i.test(q)){
   const cat=named(s.categories,q,x=>x)[0];if(cat)return result(cat+' · '+scope+'\nNet spending: '+money(ctx.categoryTotals.find(c=>c.name===cat)?.spendingCentavos||0)+'\nIncludes linked expenses, bill payments and allowance payments, minus refunds.');
   return result('Your money · '+scope+'\nIncome: '+money(ctx.totals.incomeCentavos)+'\nExpenses, less refunds: '+money(ctx.totals.spendingCentavos)+'\nIncome less spending: '+money(ctx.totals.netCashflowCentavos)+'\n'+ctx.totals.transactionCount+' recorded transactions. Transfers are excluded from income and spending.'+(ctx.categoryTotals.length?'\n\nTop categories\n'+ctx.categoryTotals.slice(0,5).map(c=>c.name+': '+money(c.spendingCentavos)).join('\n'):''));
  }
  return result(/^(hi|hello|hey|thanks)[!. ]*$/i.test(q)?'Hi! I can help you understand your money and prepare changes. What would you like to do?':'I can summarize spending, check balances and bills, and prepare entries or edits. Try “Spent 250 on lunch from Main Wallet” or “Transfer 500 from Main Wallet to GCash”. Built-in tools use set commands; connect Gemini or Groq for open-ended conversation.',[],[{label:'Monthly summary',prompt:'Summarize this month'},{label:'Record expense',prompt:'Add an expense'},{label:'Wallet balances',prompt:'Show wallet balances'}]);
 }
 return {queryOptions,KINDS,TYPES,money,canonical,expense,walletBalance,fundBalance,validDate,redact,buildContext,entity,validateAction,validateResponse,localReply,parseMoney,expenseList,expenseFingerprint,prepareExpenseBatch};
});
