/* Nossos Restaurantes: busca (Google Places API New) e lista salva */
(function(){
var LS='nossos.v1',DEMO=[
 {id:'demo1',name:'Cantina do Pixel (demo)',addr:'Rua das Fases, 8 – Centro',rating:4.6,price:'$$',uri:''},
 {id:'demo2',name:'Sushi Bit (demo)',addr:'Av. Sprite, 16 – Savassi',rating:4.4,price:'$$$',uri:''},
 {id:'demo3',name:'Hamburgueria 1UP (demo)',addr:'Rua Joystick, 64',rating:4.2,price:'$',uri:''},
 {id:'demo4',name:'Bistrô Level Final (demo)',addr:'Praça do Cartucho, 128',rating:4.8,price:'$$$$',uri:''}];
var CFG=window.CONFIG||{},S={key:'',saved:[]},OK=true;
try{var r=JSON.parse(localStorage.getItem(LS));if(r){S.key=r.key||'';S.saved=r.saved||[]}}catch(e){OK=false}
if(!S.key)S.key=String(CFG.apiKey||'').trim();
function save(){try{localStorage.setItem(LS,JSON.stringify(S));OK=true}catch(e){OK=false}mode();return OK}
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var HEART=['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'];
function heart(on){var p='';HEART.forEach(function(row,y){for(var x=0;x<7;x++)if(row[x]==='X')p+='<rect x="'+x+'" y="'+y+'" width="1" height="1"/>'});
 return '<svg viewBox="0 0 7 6" shape-rendering="crispEdges" fill="'+(on?'#ff3b6b':'#a24868')+'" aria-hidden="true">'+p+'</svg>'}
var PRICE={PRICE_LEVEL_INEXPENSIVE:'$',PRICE_LEVEL_MODERATE:'$$',PRICE_LEVEL_EXPENSIVE:'$$$',PRICE_LEVEL_VERY_EXPENSIVE:'$$$$'};
function mode(){$('mode').textContent=(S.key?'MODO REAL: buscando no Google Places.':'MODO DEMO: sem chave, a busca usa 4 lugares de exemplo.')+(OK?'':' ATENÇÃO: o navegador bloqueou o salvamento local. Coloque a chave em config.js e use um navegador sem modo anônimo.');$('key').value=S.key}
function tab(v){$('p-s').hidden=v;$('p-v').hidden=!v;$('t-s').setAttribute('aria-selected',!v);$('t-v').setAttribute('aria-selected',v);if(v)renderSaved()}
$('t-s').onclick=function(){tab(false)};$('t-v').onclick=function(){tab(true)};
$('savekey').onclick=function(){S.key=$('key').value.trim();save();mode()};

function isSaved(id){return S.saved.some(function(p){return p.id===id})}
function renderRes(list,note){
 var h=note?'<div class="msg'+(note.err?' err':'')+'">'+esc(note.t)+'</div>':'';
 if(!list.length&&!note)h='<div class="empty">NENHUM LUGAR ENCONTRADO.</div>';
 h+=list.map(function(p,i){return '<article class="box card"><h2>'+esc(p.name)+'</h2><div class="addr">'+esc(p.addr)+'</div>'+
  '<div class="meta">'+(p.rating?'<span>NOTA '+p.rating+'</span>':'')+(p.price?'<span>'+p.price+'</span>':'')+(p.uri?'<a href="'+esc(p.uri)+'" target="_blank" rel="noopener">VER NO MAPA</a>':'')+'</div>'+
  '<button data-i="'+i+'"'+(isSaved(p.id)?' disabled>JÁ SALVO':'>FOMOS AQUI ♥')+'</button></article>'}).join('');
 $('res').innerHTML=h;LAST=list}
var LAST=[];
$('res').onclick=function(e){var b=e.target.closest('button[data-i]');if(!b)return;var p=LAST[+b.dataset.i];if(!p||isSaved(p.id))return;
 S.saved.unshift({id:p.id,name:p.name,addr:p.addr,rating:p.rating,price:p.price,uri:p.uri,date:new Date().toISOString().slice(0,10),love:0,note:''});
 save();renderRes(LAST);count()};
$('sf').onsubmit=function(e){e.preventDefault();var q=$('q').value.trim();if(!q)return;
 if(!S.key){var t=q.toLowerCase();renderRes(DEMO.filter(function(d){return !t||true}),{t:'MODO DEMO: resultados de exemplo. Adicione sua chave em CONFIGURAÇÃO.'});return}
 $('res').innerHTML='<div class="msg">CARREGANDO...</div>';
 fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':S.key,
  'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.googleMapsUri'},
  body:JSON.stringify({textQuery:q,includedType:'restaurant',languageCode:'pt-BR',maxResultCount:10})})
 .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error((j.error&&j.error.message)||('Erro '+r.status));return j})})
 .then(function(j){renderRes((j.places||[]).map(function(p){return{id:p.id,name:(p.displayName&&p.displayName.text)||'Sem nome',addr:p.formattedAddress||'',rating:p.rating||0,price:PRICE[p.priceLevel]||'',uri:p.googleMapsUri||''}}))})
 .catch(function(err){renderRes([],{t:'ERRO: '+err.message,err:1})})};

function count(){$('cnt').textContent=S.saved.length}
function renderSaved(){
 var n=S.saved.length,rated=S.saved.filter(function(p){return p.love});
 var avg=rated.length?(rated.reduce(function(a,p){return a+p.love},0)/rated.length).toFixed(1):'–';
 $('stats').textContent=n?'LUGARES: '+n+'  |  MÉDIA DE CORAÇÕES: '+avg:'';
 $('saved').innerHTML=n?S.saved.map(function(p){return '<article class="box card" data-id="'+esc(p.id)+'"><h2>'+esc(p.name)+'</h2><div class="addr">'+esc(p.addr)+'</div>'+
  '<div class="meta">'+(p.uri?'<a href="'+esc(p.uri)+'" target="_blank" rel="noopener">VER NO MAPA</a>':'')+'</div>'+
  '<label for="d-'+esc(p.id)+'">DATA</label><input type="date" id="d-'+esc(p.id)+'" data-f="date" value="'+esc(p.date)+'">'+
  '<label>NOSSA NOTA</label><div class="hearts">'+[1,2,3,4,5].map(function(k){return '<button data-love="'+k+'" aria-label="'+k+' coração(ões)">'+heart(k<=p.love)+'</button>'}).join('')+'</div>'+
  '<label for="n-'+esc(p.id)+'">O QUE PEDIMOS / LEMBRANÇAS</label><textarea id="n-'+esc(p.id)+'" data-f="note">'+esc(p.note)+'</textarea>'+
  '<p><button class="bad" data-del="1">REMOVER</button></p></article>'}).join(''):'<div class="empty">NENHUM LUGAR AINDA.<br>BUSQUE E CLIQUE EM "FOMOS AQUI".</div>'}
function find(el){var a=el.closest('[data-id]');return a&&S.saved.find(function(p){return p.id===a.dataset.id})}
$('saved').onclick=function(e){var p=find(e.target);if(!p)return;var b=e.target.closest('button');if(!b)return;
 if(b.dataset.love){p.love=p.love===+b.dataset.love?0:+b.dataset.love;save();renderSaved()}
 else if(b.dataset.del&&confirm('Remover "'+p.name+'"?')){S.saved=S.saved.filter(function(x){return x!==p});save();renderSaved();count()}};
$('saved').oninput=function(e){var p=find(e.target),f=e.target.dataset.f;if(p&&f){p[f]=e.target.value;save()}};
$('exp').onclick=function(){var b=new Blob([JSON.stringify({v:1,saved:S.saved})],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(b);a.download='nossos-restaurantes-backup-'+new Date().toISOString().slice(0,10)+'.json';
 document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)};
var bf=document.createElement('input');bf.type='file';bf.accept='application/json,.json';
$('imp').onclick=function(){bf.click()};
bf.onchange=function(){var f=this.files[0];this.value='';if(!f)return;var rd=new FileReader();
 rd.onload=function(){var bak=JSON.parse(JSON.stringify(S.saved)),n=0;
  try{var j=JSON.parse(rd.result);if(!j||!Array.isArray(j.saved))throw new Error('formato');
   j.saved.forEach(function(q){if(!q||!q.id||!q.name)return;
    q.uri=/^https?:\/\//.test(q.uri||'')?q.uri:'';q.img=/^data:image\//.test(q.img||'')?q.img:'';q.love=Math.max(0,Math.min(5,+q.love||0));
    var i=S.saved.findIndex(function(p){return p.id===q.id});if(i>=0)S.saved[i]=q;else S.saved.push(q);n++});
   if(!save()){S.saved=bak;save();alert('Sem espaço no navegador para importar tudo.');return}
   renderSaved();count();alert(n+' lugar(es) importado(s).')}
  catch(e){S.saved=bak;alert('Esse arquivo não parece um backup válido.')}};
 rd.readAsText(f)};
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
mode();count();if(!OK)$('cfg').open=true;
})();
