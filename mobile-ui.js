/* Focused search, a compact card wallet, and touch-sized controls. */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id),escText=esc;
  const paths={
    search:'m21 21-4.5-4.5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',
    close:'m6 6 12 12M6 18 18 6',plus:'M12 5v14M5 12h14',
    up:'m6 14 6-6 6 6',down:'m6 10 6 6 6-6',left:'m14 6-6 6 6 6',right:'m10 6 6 6-6 6',
    wallet:'M3 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13v2M20 10h-6v5h6M16 12.5h.01',
    income:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
    expense:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
    transfer:'M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4',
    history:'M3 11a9 9 0 1 1 2 7M3 3v8h8M12 7v5l3 2',
    grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    stack:'m3 7 9-5 9 5-9 5-9-5m0 5 9 5 9-5m-18 5 9 5 9-5',
    list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    sliders:'M4 5h16M4 12h16M4 19h16M8 3v4M16 10v4M10 17v4',
    eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    eyeOff:'m3 3 18 18M10 5a12 12 0 0 1 12 7 18 18 0 0 1-4 5M6 6a18 18 0 0 0-4 6s4 7 10 7a12 12 0 0 0 5-1',
    palette:'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4 2 2 0 0 1 0-4h4a3 3 0 0 0 3-3 9 9 0 0 0-9-7M7 8h.01M11 6h.01M16 7h.01M6 13h.01',
    more:'M5 12h.01M12 12h.01M19 12h.01',
    home:'m3 10 9-7 9 7v10h-6v-7H9v7H3V10',
    receipt:'M5 3h14v18l-3-2-4 2-4-2-3 2V3M8 7h8M8 11h8M8 15h4',
    target:'M21 12a9 9 0 1 1-9-9M17 12a5 5 0 1 1-5-5M12 12l8-8m-4 0h4v4',
    bill:'M6 3h12v18l-3-2-3 2-3-2-3 2V3M9 7h6M9 11h6',
    user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
    contactless:'M8 9a5 5 0 0 1 0 6M12 6a10 10 0 0 1 0 12M16 3a15 15 0 0 1 0 18'
  };
  const icon=name=>'<svg class="pb-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[name]||paths.wallet)+'"/></svg>';
  function iconButton(name,label,attrs=''){return '<button type="button" class="touch-icon" aria-label="'+escText(label)+'" title="'+escText(label)+'" '+attrs+'>'+icon(name)+'</button>';}
  function setButton(button,name,label,visible=false){if(!button)return;button.innerHTML=icon(name)+(visible?'<span>'+escText(label)+'</span>':'');button.setAttribute('aria-label',label);button.title=label;button.classList.add('has-icon');}

  // Searches only transaction records. Amount tokens match exact pesos, not arbitrary digits in notes.
  function matches(t,query){
    const tokens=String(query||'').toLowerCase().match(/"[^"]+"|\S+/g)||[];
    const text=[t.description,t.merchant,t.category,t.account,t.destinationAccount,t.paymentMethod,t.typeLabel].join(' ').toLocaleLowerCase();
    return tokens.every(raw=>{const token=raw.replace(/^"|"$/g,'');
      if(/^\d{4}-\d{2}(?:-\d{2})?$/.test(token))return String(t.date||'').startsWith(token);
      if(/^(?:₱|php)?[\d,]+(?:\.\d{1,2})?$/.test(token)){const n=Number(token.replace(/₱|php|,/g,''));return Number.isFinite(n)&&Math.abs(t.amount)===Math.round(n*100);}
      return text.includes(token);
    });
  }
  const findTransactions=query=>state.transactions.filter(t=>matches(t,query)).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||(b.createdAt||0)-(a.createdAt||0));
  const top=document.querySelector('.top-actions'),monthNav=document.createElement('div');monthNav.className='month-navigation';top.insertBefore(monthNav,$('monthPicker'));[top.querySelector('[aria-label="Previous month"]'),$('monthPicker'),top.querySelector('[aria-label="Next month"]')].forEach(el=>monthNav.append(el));
  const input=$('globalSearch'),search=input.parentElement;
  search.classList.add('transaction-search');input.type='search';input.placeholder='Find a transaction…';input.setAttribute('aria-label','Find a transaction');input.setAttribute('autocomplete','off');input.setAttribute('aria-controls','transactionSearchResults');input.setAttribute('aria-expanded','false');
  search.insertAdjacentHTML('afterbegin',icon('search'));
  search.insertAdjacentHTML('beforeend','<button id="searchClear" class="touch-icon" type="button" aria-label="Clear transaction search" hidden>'+icon('close')+'</button><section id="transactionSearchResults" class="transaction-search-results" aria-label="Transaction search results" hidden></section>');
  let searchPage=0,searchRows=[],searchHighlight=-1;
  function closeSearch(){ $('transactionSearchResults').hidden=true;input.setAttribute('aria-expanded','false');searchHighlight=-1; }
  function renderSearch(reset=true){
    const query=input.value.trim();$('searchClear').hidden=!query;
    if(!query){closeSearch();return;}
    if(reset)searchPage=0;searchRows=findTransactions(query);searchPage=Math.min(searchPage,Math.max(0,Math.ceil(searchRows.length/6)-1));
    const rows=searchRows.slice(searchPage*6,searchPage*6+6),host=$('transactionSearchResults');
    host.innerHTML='<div class="search-result-heading"><b>'+searchRows.length+' matching transaction'+(searchRows.length===1?'':'s')+'</b><span>All dates</span></div><div class="search-matches">'+(rows.map(t=>'<button class="search-match" data-search-id="'+escText(t.id)+'"><span class="search-match-icon">'+icon(isType(t,'Transfer')?'transfer':txDirection(t)==='in'?'income':'receipt')+'</span><span><b>'+escText(t.description||t.category||t.typeLabel)+'</b><small>'+escText(t.date+' · '+(t.merchant||t.account||'Unassigned'))+'</small></span><strong class="'+(txDirection(t)==='in'?'pos':'')+'">'+txAmount(t)+'</strong></button>').join('')||'<div class="search-no-results">No transactions match “'+escText(query)+'”.<small>Try a merchant, wallet, exact amount, or date.</small></div>')+'</div>'+(searchRows.length?'<div class="search-result-footer"><button class="text-button" id="searchViewAll">Open matching transactions '+icon('right')+'</button><div>'+iconButton('left','Previous search results','id="searchPrevious" '+(!searchPage?'disabled':''))+'<span>'+(searchPage+1)+' / '+Math.ceil(searchRows.length/6)+'</span>'+iconButton('right','Next search results','id="searchNext" '+((searchPage+1)*6>=searchRows.length?'disabled':''))+'</div></div>':'');
    host.hidden=false;input.setAttribute('aria-expanded','true');searchHighlight=-1;
    host.querySelectorAll('[data-search-id]').forEach(button=>button.onclick=()=>{closeSearch();transactionDetail(button.dataset.searchId);});
    if($('searchViewAll')){$('searchViewAll').onclick=openSearchInLedger;$('searchPrevious').onclick=()=>{searchPage--;renderSearch(false);};$('searchNext').onclick=()=>{searchPage++;renderSearch(false);};}
  }
  function openSearchInLedger(){
    const query=input.value.trim();closeSearch();
    ['txType','txAccount','txCategory','txFund'].forEach(id=>$(id).value='');
    $('txPeriod').value='all';$('txSort').value='newest';$('txSearch').value=query;input.value='';$('searchClear').hidden=true;
    document.querySelector('.ledger-filters').hidden=true;$('ledgerFilterToggle')?.setAttribute('aria-expanded','false');
    showView('transactions');renderTransactions();
  }
  input.oninput=()=>renderSearch();input.addEventListener('focus',()=>{if(input.value.trim())renderSearch();});
  input.addEventListener('keydown',event=>{
    const buttons=[...$('transactionSearchResults').querySelectorAll('[data-search-id]')];
    if(event.key==='Escape'){closeSearch();return;}
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();searchHighlight=Math.max(0,Math.min(buttons.length-1,searchHighlight+(event.key==='ArrowDown'?1:-1)));buttons[searchHighlight]?.focus();}
    if(event.key==='Enter'&&input.value.trim()){event.preventDefault();openSearchInLedger();}
  });
  $('transactionSearchResults').addEventListener('keydown',event=>{
    const buttons=[...$('transactionSearchResults').querySelectorAll('[data-search-id]')],i=buttons.indexOf(document.activeElement);
    if(event.key==='Escape'){closeSearch();input.focus();closeSearch();}
    if(i>=0&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();buttons[Math.max(0,Math.min(buttons.length-1,i+(event.key==='ArrowDown'?1:-1)))]?.focus();}
  });
  $('searchClear').onclick=()=>{input.value='';renderSearch();input.focus();};
  document.addEventListener('pointerdown',event=>{if(!search.contains(event.target))closeSearch();});
  $('txSearch').oninput=()=>renderTransactions();
  const previousClear=clearTxFilters;clearTxFilters=function(){previousClear();closeSearch();$('searchClear').hidden=true;};
  const oldView=showView;showView=function(){closeSearch();return oldView.apply(this,arguments);};

  // Preserve the ledger's filtering/export/selection handlers, with a quieter mobile layout.
  const filters=document.querySelector('.ledger-filters');filters.hidden=true;filters.id='ledgerFilterControls';
  const filterToggle=document.createElement('button');filterToggle.id='ledgerFilterToggle';filterToggle.className='secondary has-icon';filterToggle.innerHTML=icon('sliders')+'<span>Filters</span>';filterToggle.setAttribute('aria-controls',filters.id);filterToggle.setAttribute('aria-expanded','false');
  filterToggle.onclick=()=>{filters.hidden=!filters.hidden;filterToggle.setAttribute('aria-expanded',String(!filters.hidden));};document.querySelector('.ledger-toolbar').append(filterToggle);
  const ledgerRender=renderTransactions;renderTransactions=function(){const result=ledgerRender.apply(this,arguments);const count=['txType','txAccount','txCategory','txFund'].filter(id=>$(id).value).length;filterToggle.querySelector('span').textContent='Filters'+(count?' · '+count:'');return result;};

  const walletPrefs=()=>{const p=state.settings.walletView||{};return {mode:['stack','grid','list'].includes(p.mode)?p.mode:'stack',selectedId:typeof p.selectedId==='string'?p.selectedId:'',collapsed:p.collapsed===true};};
  function saveWalletView(change){state.settings.walletView={...walletPrefs(),...change};save();renderWallets();}
  function visibleWallets(){return state.accounts.filter(a=>(showArchivedWallets||!a.archived)&&(walletFilter==='All'||a.kind===walletFilter)&&[a.name,a.institution].join(' ').toLowerCase().includes(walletSearch.toLowerCase()));}
  function selectedWallet(list){return list.find(a=>a.id===walletPrefs().selectedId)||list.find(a=>a.name===state.settings.defaultAccount)||list[0];}
  function actions(a){
    if(a.archived)return '<div class="card-actions">'+action('history','Activity',a.id,'activity')+action('palette','Customize',a.id,'edit')+'</div>';
    return '<div class="card-actions">'+[['expense','Expense','expense'],['income','Income','income'],['transfer','Transfer','transfer'],['history','Activity','activity']].map(([symbol,label,actionName])=>action(symbol,label,a.id,actionName)).join('')+'</div>';
  }
  function action(symbol,label,id,actionName){return '<button class="card-action" type="button" data-wallet-action="'+actionName+'" data-wallet-id="'+escText(id)+'" aria-label="'+label+' · '+escText(state.accounts.find(a=>a.id===id)?.name||'wallet')+'"><span>'+icon(symbol)+'</span><b>'+label+'</b></button>';}
  walletCardPremium=function(a){
    const bank=bankFor(a),balance=allAccountBalance(a.name),credit=a.kind==='Credit Card',value=credit?Math.max(0,-balance):balance,design=CARD_DESIGNS.includes(a.design)?a.design:'aurora';
    return '<article class="premium-wallet physical-card style-'+escText(design)+(a.archived?' is-archived':'')+'" style="--wallet-accent:'+colorSafe(a.color,bank.color)+'" data-card-id="'+escText(a.id)+'"><div class="card-sheen" aria-hidden="true"></div><div class="pw-top"><div class="bank-mark">'+accountLogo(a)+'<b class="card-bank-name">'+escText(a.institution||bank.name||a.name)+'</b></div>'+iconButton('more','Customize '+a.name,'data-wallet-action="edit" data-wallet-id="'+escText(a.id)+'"')+'</div><div class="pw-mid"><span class="pw-chip" aria-hidden="true"></span><span class="card-contactless">'+icon('contactless')+'</span><span class="pw-digits">'+(a.last4?'•••• '+escText(a.last4):escText(a.kind))+'</span></div><div class="card-balance"><div class="pw-label">'+(a.archived?'ARCHIVED · ':'')+(credit?'AMOUNT OWED':'AVAILABLE BALANCE')+'</div><div class="pw-value">'+walletDisplayAmount(value)+'</div></div><div class="pw-bottom"><span><b>'+escText(a.name)+'</b><small>'+escText(a.institution||bank.name)+(state.settings.defaultAccount===a.name?' · DEFAULT':'')+'</small></span><strong class="pw-network">'+escText(a.network||'')+'</strong></div></article>';
  };
  function row(a,choose=false){return '<button class="wallet-list-row" '+(choose?'data-wallet-select="'+escText(a.id)+'"':'data-wallet-action="activity" data-wallet-id="'+escText(a.id)+'"')+'><span class="wallet-row-logo" style="--wallet-accent:'+colorSafe(a.color,bankFor(a).color)+'">'+accountLogo(a)+'</span><span><b>'+escText(a.name)+'</b><small>'+escText(a.kind)+(a.archived?' · Archived':'')+'</small></span><strong>'+walletDisplayAmount(allAccountBalance(a.name))+'</strong>'+icon(choose?'down':'right')+'</button>';}
  function deck(list,context='wallet'){
    const a=selectedWallet(list),p=walletPrefs();if(!a)return '<div class="empty">No wallets match. Change the filter or add a wallet.</div>';
    const index=list.indexOf(a),peeks=list.filter(x=>x.id!==a.id).slice(0,3).reverse();
    return '<div class="wallet-deck" data-deck-context="'+context+'"><div class="deck-toolbar"><button class="wallet-picker-button" data-wallet-picker="'+context+'" aria-label="Choose wallet">'+icon('wallet')+'<span>'+escText(a.name)+'</span>'+icon('down')+'</button>'+iconButton(p.collapsed?'down':'up',p.collapsed?'Expand wallet card':'Collapse wallet card','data-deck-collapse')+'</div><div class="deck-expanded" '+(p.collapsed?'hidden':'')+'><div class="card-stack" tabindex="0" role="group" aria-label="Wallet cards. Swipe up or down, or use arrow keys, to change wallet." data-card-stack="'+context+'">'+peeks.map((x,i)=>'<button class="stack-peek" style="--peek-index:'+i+';--wallet-accent:'+colorSafe(x.color,bankFor(x).color)+'" data-wallet-select="'+escText(x.id)+'" aria-label="Select '+escText(x.name)+'"><span>'+escText(x.name)+'</span></button>').join('')+walletCardPremium(a)+'</div><div class="deck-navigation">'+iconButton('up','Previous wallet','data-deck-step="-1" data-deck-context="'+context+'" '+(list.length<2?'disabled':''))+'<span><b>'+(index+1)+' / '+list.length+'</b><small>'+(list.length>1?'Swipe the card up to switch':'Your everyday wallet')+'</small></span>'+iconButton('down','Next wallet','data-deck-step="1" data-deck-context="'+context+'" '+(list.length<2?'disabled':''))+'</div>'+actions(a)+'</div><div class="deck-collapsed" '+(!p.collapsed?'hidden':'')+'><span>Available balance</span><b>'+walletDisplayAmount(allAccountBalance(a.name))+'</b></div></div>';
  }
  function changeCard(step,context){const list=context==='dashboard'?state.accounts.filter(a=>!a.archived):visibleWallets();if(list.length<2)return;const at=list.indexOf(selectedWallet(list));saveWalletView({selectedId:list[(at+step+list.length)%list.length].id});}
  function picker(context){
    const list=context==='dashboard'?state.accounts.filter(a=>!a.archived):visibleWallets();
    openModal('Choose a wallet','<div class="wallet-picker-list">'+list.map(a=>row(a,true)).join('')+'</div><div class="dialog-actions"><button class="secondary has-icon" id="pickerAddWallet">'+icon('plus')+'Add wallet</button></div>');
    $('pickerAddWallet').onclick=()=>openAccount();
  }
  function decorateWalletHeader(){
    setButton($('balanceToggle'),balancesHidden?'eye':'eyeOff',balancesHidden?'Show balances':'Hide balances');
    setButton(document.querySelector('#wallets .hero-actions [onclick="openCardCatalog()"]'),'palette','Card designs');
    setButton(document.querySelector('#wallets .hero-actions [onclick="openAccount()"]'),'plus','Add wallet');
  }
  renderWallets=function(){
    const accounts=state.accounts,balances=accounts.map(a=>allAccountBalance(a.name)),assets=balances.reduce((n,v)=>n+Math.max(0,v),0),debt=balances.reduce((n,v)=>n+Math.max(0,-v),0),list=visibleWallets(),prefs=walletPrefs();
    $('walletTotal').textContent=walletDisplayAmount(assets-debt);
    $('walletSubtext').textContent=accounts.filter(a=>!a.archived).length+' active wallets · savings funds shown separately';
    $('walletStats').innerHTML=[['Assets',walletDisplayAmount(assets)],['Liabilities',walletDisplayAmount(debt)],['Wallets',String(accounts.length)]].map(([title,value])=>'<div class="wallet-stat"><span>'+title+'</span><b>'+value+'</b></div>').join('');
    $('walletGroups').innerHTML='<div class="wallet-view-bar"><label class="wallet-kind-select">'+icon('sliders')+'<select id="walletKindFilter" aria-label="Filter wallet type">'+['All','Bank','E-Wallet','Credit Card','Cash','Investment','Other'].map(k=>'<option '+(walletFilter===k?'selected':'')+'>'+k+'</option>').join('')+'</select></label><div class="wallet-view-switch" aria-label="Wallet display">'+[['stack','stack','Stack view'],['grid','grid','Grid view'],['list','list','List view']].map(([value,symbol,label])=>iconButton(symbol,label,'data-wallet-mode="'+value+'" aria-pressed="'+(prefs.mode===value)+'"')).join('')+'</div></div><div class="wallet-collection mode-'+prefs.mode+'">'+(prefs.mode==='stack'?deck(list):prefs.mode==='grid'?'<div class="physical-wallet-grid">'+list.map(a=>'<div>'+walletCardPremium(a)+actions(a)+'</div>').join('')+'</div>':'<div class="wallet-list">'+list.map(a=>row(a)).join('')+'</div>')+(!list.length&&prefs.mode!=='stack'?'<div class="empty">No matching wallets.</div>':'')+'</div><label class="archive-toggle wallet-archive"><input id="walletArchivedToggle" type="checkbox" '+(showArchivedWallets?'checked':'')+'> Include archived wallets</label><details class="wallet-movement"><summary>'+icon('history')+'Monthly wallet activity'+icon('down')+'</summary><div class="wallet-movement-list">'+accounts.map(a=>{const f=walletFlows(a);return '<button data-wallet-action="activity" data-wallet-id="'+escText(a.id)+'"><span><b>'+escText(a.name)+'</b><small>'+monthLabel()+'</small></span><span>In '+walletDisplayAmount(f.in)+'<small>Out '+walletDisplayAmount(f.out)+'</small></span>'+icon('right')+'</button>';}).join('')+'</div></details>';
    $('dashboardWalletPreview').innerHTML=deck(accounts.filter(a=>!a.archived),'dashboard');
    $('walletKindFilter').onchange=e=>{walletFilter=e.target.value;renderWallets();};$('walletArchivedToggle').onchange=e=>{showArchivedWallets=e.target.checked;renderWallets();};decorateWalletHeader();
  };
  document.querySelector('#wallets .hero h1').textContent='Wallet';
  document.querySelector('#wallets .hero .eyebrow').textContent='YOUR MONEY, TOGETHER';
  document.querySelector('#wallets .hero .muted').textContent='A place for every peso.';
  document.querySelector('.wallet-summary-main .eyebrow').textContent='TOTAL WALLET BALANCE';
  const walletToolbar=document.querySelector('.wallet-toolbar');
  [...walletToolbar.children].filter(el=>!el.matches('input')).forEach(el=>el.remove());
  walletToolbar.querySelector('input').placeholder='Find a wallet…';
  const previousDetails=walletDetails;walletDetails=function(id){previousDetails(id);const account=state.accounts.find(a=>a.id===id);if(account)document.querySelector('.wallet-detail-head').insertAdjacentHTML('beforeend',actions(account));};

  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.walletAction){const a=state.accounts.find(a=>a.id===button.dataset.walletId);if(!a)return;const kind=button.dataset.walletAction;
      if(kind==='activity')walletDetails(a.id);else if(kind==='edit')openAccount(a.id);else if(!a.archived)walletTransaction(a.id,kind);}
    if(button.hasAttribute('data-wallet-select')){saveWalletView({selectedId:button.dataset.walletSelect,collapsed:false});if($('modalTitle').textContent==='Choose a wallet')closeModal();}
    if(button.dataset.walletMode)saveWalletView({mode:button.dataset.walletMode});
    if(button.hasAttribute('data-deck-collapse'))saveWalletView({collapsed:!walletPrefs().collapsed});
    if(button.hasAttribute('data-deck-step'))changeCard(Number(button.dataset.deckStep),button.dataset.deckContext);
    if(button.dataset.walletPicker)picker(button.dataset.walletPicker);
  });
  let swipe=null,suppressCardClick=false;
  document.addEventListener('pointerdown',event=>{
    const stack=event.target.closest('[data-card-stack]');if(!stack||event.target.closest('button')||event.button>0)return;
    swipe={target:stack,id:event.pointerId,x:event.clientX,y:event.clientY,context:stack.dataset.cardStack,moved:false};stack.setPointerCapture?.(event.pointerId);
  });
  document.addEventListener('pointermove',event=>{if(!swipe||event.pointerId!==swipe.id)return;const dy=event.clientY-swipe.y;if(Math.abs(dy)>10){swipe.moved=true;swipe.target.style.setProperty('--swipe-y',Math.max(-28,Math.min(28,dy))+'px');}});
  document.addEventListener('pointerup',event=>{if(!swipe||event.pointerId!==swipe.id)return;const {x,y,context,target,moved}=swipe;swipe=null;target.style.removeProperty('--swipe-y');const dy=event.clientY-y,dx=event.clientX-x;if(moved&&Math.abs(dy)>38&&Math.abs(dy)>Math.abs(dx)){suppressCardClick=true;changeCard(dy<0?1:-1,context);setTimeout(()=>suppressCardClick=false,0);}});
  document.addEventListener('pointercancel',()=>{swipe?.target.style.removeProperty('--swipe-y');swipe=null;});
  document.addEventListener('click',event=>{if(suppressCardClick){event.preventDefault();event.stopImmediatePropagation();}},true);
  document.addEventListener('keydown',event=>{const stack=event.target.closest('[data-card-stack]');if(stack&&event.target===stack&&['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();const context=stack.dataset.cardStack;changeCard(event.key==='ArrowUp'?1:-1,context);document.querySelector('[data-card-stack="'+context+'"]')?.focus();}});

  function decorate(){
    setButton(document.querySelector('.top-actions .appearance-button'),'palette','Appearance');
    setButton(document.querySelector('.top-actions .command-button'),'grid','Quick actions');
    setButton(document.querySelector('.top-actions [aria-label="Previous month"]'),'left','Previous month');
    setButton(document.querySelector('.top-actions [aria-label="Next month"]'),'right','Next month');
    $('profileBtn').setAttribute('aria-label','Account menu');
    [...$('monthPicker').options].forEach(option=>{if(/^\d{4}-\d{2}$/.test(option.value))option.textContent=new Date(option.value+'-01T12:00:00Z').toLocaleDateString('en-PH',{month:'short',year:'numeric',timeZone:'UTC'});});
    setButton($('customizeDashboard'),'sliders','Customize',true);
    setButton(document.querySelector('#dashboard .hero-actions .primary'),'plus','Add expense',true);
    const symbols=['expense','income','transfer','target','bill','sliders'];document.querySelectorAll('#dashboard .quick button').forEach((b,i)=>setButton(b,symbols[i],['Expense','Income','Transfer','Fund','Bill','Budget'][i],true));
    const mobile=document.querySelector('.mobile-nav');if(mobile){[...mobile.querySelectorAll('button')].forEach((b,i)=>{const labels=['Home','Wallets','Add','Transactions','More'],icons=['home','wallet','plus','receipt','grid'];setButton(b,icons[i],labels[i],true);});}
  }
  const nav=renderNav;renderNav=function(){const result=nav.apply(this,arguments);decorate();return result;};
  const render=renderAll;renderAll=function(){const result=render.apply(this,arguments);decorate();if(!$('transactionSearchResults').hidden)renderSearch(false);return result;};
  window.PesoMobile={icon,matches,findTransactions,renderSearch,changeCard,walletPrefs};
  decorate();
})();
