'use strict';
// Authored examples, not recognition output. Browser imports never leave this page.
const categories=['美甲','聊天记录','付款凭证','文字资料','穿搭','美食','待确认'];
const info={'美甲':['✿','nails'],'聊天记录':['☏','chat'],'付款凭证':['¥','receipt'],'文字资料':['▤','learn'],'穿搭':['♧','outfit'],'美食':['◒','food'],'待确认':['◇','unknown']};
const seed=[
{id:1,title:'粉色小花美甲',categories:['美甲'],art:'nails',color:'粉色',pattern:'花朵',text:'粉色底，白色小花。虚构款式参考。'},
{id:2,title:'粉色波点美甲',categories:['美甲'],art:'nails',color:'粉色',pattern:'波点',text:'粉色底，深色波点。虚构款式参考。'},
{id:3,title:'奶白色法式美甲',categories:['美甲'],art:'nails',color:'奶白色',pattern:'法式',text:'奶白色底，弧形边缘。虚构款式参考。'},
{id:4,title:'文化学概论 · 概念整理',categories:['文字资料'],art:'learn',kind:'学习笔记',subject:'文化学概论',question:'概念辨析',text:'示例笔记：概念名称、课堂摘记、易混淆点。仅用于演示查找。'},
{id:5,title:'文化学概论 · 简答练习',categories:['文字资料'],art:'learn',kind:'学习笔记',subject:'文化学概论',question:'简答题',text:'示例练习：题目、答题提纲、课后补充。仅用于演示查找。'},
{id:6,title:'产品设计 · 课堂摘记',categories:['文字资料'],art:'learn',kind:'学习笔记',subject:'产品设计',text:'示例笔记：用户任务、方案草图、待验证的问题。'},
{id:7,title:'工作项目 · 评审提纲',categories:['文字资料'],art:'learn',kind:'工作文档',text:'示例工作文档：目标、评审事项、下一步安排。科目和题型留空。'},
{id:8,title:'和朋友的一段对话',categories:['聊天记录'],art:'chat',text:'虚构对话：今天聊得很开心。／这段话，我想好好留着。'},
{id:9,title:'聊天中的付款记录',categories:['聊天记录','付款凭证'],art:'receipt',text:'虚构记录：款项已收到。付款信息与对话在同一张图中。'},
{id:10,title:'付款结果示例',categories:['付款凭证'],art:'receipt',text:'虚构记录：付款完成。仅供演示，不是真实交易凭证。'},
{id:11,title:'浅色衬衫搭配',categories:['穿搭'],art:'outfit',color:'浅色',text:'浅色上衣与深色长裤的搭配参考。'},
{id:12,title:'粉色针织搭配',categories:['穿搭'],art:'outfit',color:'粉色',text:'粉色上衣搭配示例，不属于美甲分类。'},
{id:13,title:'周末面食收藏',categories:['美食'],art:'food',text:'虚构菜品收藏：周末想尝试的面食。'},
{id:14,title:'蔬菜沙拉搭配',categories:['美食'],art:'food',text:'虚构食谱收藏：蔬菜与配料组合。'},
{id:15,title:'尚未归类的截图',categories:['待确认'],art:'unknown',text:'示例没有可靠分类，可以在详情中手动补充。'},
{id:16,title:'粉色法式美甲',categories:['美甲'],art:'nails',color:'粉色',pattern:'法式',text:'粉色底，白色弧形边缘。可与小花、波点款式对照辨认。'}
];
let items=[],view='home',group='全部',query='',filters={},selected=new Set(),lastAction=null,currentDetail=null,priorFocus,toastTimer;
const scrollPositions=new Map(),app=document.getElementById('phone-app'),modal=document.getElementById('modal'),dialog=document.querySelector('.dialog');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const live=i=>i.status!=='deleted',allLive=()=>items.filter(live),count=s=>items.filter(i=>i.status===s).length;
const unique=values=>[...new Set(values.filter(Boolean))];
function notify(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3600);}
function sampleSVG(i){
let d='';
if(i.art==='nails'){
 const fill=i.color==='奶白色'?'#f8efdf':'#efa7b9';
 d='<rect width="360" height="440" fill="#f9e9e8"/><circle cx="290" cy="100" r="100" fill="#f3d3d7"/><path d="M65 350Q45 280 80 265L100 287V145Q100 125 120 125Q140 125 140 145V260H147V106Q147 85 167 85Q188 85 188 106V255H195V125Q195 105 215 105Q236 105 236 125V265H243V166Q243 147 262 147Q282 147 282 166V300Q282 377 225 390H145Q90 390 65 350" fill="#dfad99"/>';
 [120,167,215,262].forEach((x,n)=>{
  const y=[145,106,125,166][n];d+='<rect x="'+(x-14)+'" y="'+y+'" width="28" height="57" rx="13" fill="'+fill+'"/>';
  if(i.pattern==='花朵'){
   for(let a=0;a<5;a++){const angle=a*Math.PI*2/5;d+='<circle cx="'+(x+Math.sin(angle)*7)+'" cy="'+(y+30+Math.cos(angle)*7)+'" r="4.5" fill="#fff9ef"/>';}
   d+='<circle cx="'+x+'" cy="'+(y+30)+'" r="3.5" fill="#d7a34c"/>';
  }else if(i.pattern==='波点'){[15,30,44].forEach((dy,m)=>d+='<circle cx="'+(x+(m%2?5:-5))+'" cy="'+(y+dy)+'" r="3" fill="#9b6074"/>');}
  else d+='<path d="M'+(x-12)+' '+(y+17)+'Q'+x+' '+(y+7)+' '+(x+12)+' '+(y+17)+'" fill="none" stroke="#fff" stroke-width="7"/>';
 });
 d+='<text x="30" y="45" fill="#985c71" font-size="19">款式参考 · '+esc(i.pattern)+'</text>';
}else if(i.art==='learn'){
 d='<rect width="360" height="440" fill="#f5f1e7"/><rect x="23" y="25" width="314" height="390" rx="8" fill="#fffdf5"/><rect x="45" y="50" width="75" height="7" rx="3" fill="#b7a2d4"/><text x="45" y="94" font-size="24" fill="#52435f">'+esc(i.subject||'工作项目')+'</text><text x="45" y="125" font-size="15" fill="#88789a">'+esc(i.question||i.kind||'资料')+'</text>';
 ['01 关键内容','02 整理提纲','03 需要再看一遍'].forEach((line,n)=>{const y=174+n*73;d+='<text x="45" y="'+y+'" font-size="15" fill="#5f5966">'+line+'</text><path d="M45 '+(y+18)+'H298M45 '+(y+32)+'H270" stroke="#dbd6e0" stroke-width="4"/>';});
}else if(i.art==='chat'){
 d='<rect width="360" height="440" fill="#e9eee9"/><rect width="360" height="60" fill="#fff"/><text x="135" y="38" font-size="20" fill="#4e6156">朋友</text><circle cx="40" cy="110" r="20" fill="#aaa0ce"/><rect x="72" y="87" width="220" height="64" rx="10" fill="#fff"/><text x="88" y="124" font-size="18" fill="#56615a">今天聊得很开心。</text><circle cx="320" cy="204" r="20" fill="#a5c3a3"/><rect x="67" y="181" width="217" height="86" rx="10" fill="#c4ddb7"/><text x="83" y="216" font-size="17" fill="#52644d">这段话，</text><text x="83" y="244" font-size="17" fill="#52644d">我想好好留着。</text>';
}else if(i.art==='receipt'){
 d='<rect width="360" height="440" fill="#e9f0e7"/><rect x="30" y="45" width="300" height="345" rx="14" fill="#fff"/><circle cx="180" cy="120" r="32" fill="#dcebd7"/><path d="M166 120l10 10 20-22" fill="none" stroke="#6c9160" stroke-width="7"/><text x="132" y="191" font-size="24" fill="#456139">付款记录</text><text x="75" y="236" font-size="16" fill="#7b8675">款项已收到 · 示例</text><path d="M58 268H300M58 309H300" stroke="#e8eae3"/><text x="58" y="294" font-size="15" fill="#888">保留可供查阅的信息</text><text x="58" y="345" font-size="14" fill="#aaa">虚构内容，不是真实凭证</text>';
}else if(i.art==='outfit'){
 d='<rect width="360" height="440" fill="#eeeee7"/><path d="M130 75l50 20 50-20 67 73-47 40-24-30-4 130H137l-4-130-24 30-46-40z" fill="'+(i.color==='粉色'?'#d996b0':'#ede4d8')+'" stroke="#c3b8ac" stroke-width="3"/><path d="M140 287h80l35 130h-62l-12-91-14 91h-61z" fill="#686d76"/><path d="M165 89l15 29 16-29" fill="none" stroke="#aa8f91" stroke-width="3"/>';
}else if(i.art==='food'){
 d='<rect width="360" height="440" fill="#f4eada"/><circle cx="180" cy="221" r="132" fill="#fffdf5"/><circle cx="180" cy="221" r="105" fill="#e7dfbe"/>';
 for(let n=0;n<17;n++){const a=n*2.4,r=18+(n%5)*16,x=180+Math.cos(a)*r,y=221+Math.sin(a)*r;d+='<ellipse cx="'+x+'" cy="'+y+'" rx="29" ry="13" transform="rotate('+n*37+' '+x+' '+y+')" fill="'+['#d88965','#8ca66d','#d9bd75'][n%3]+'"/>';}
}else d='<rect width="360" height="440" fill="#eae8ef"/><rect x="54" y="80" width="252" height="275" rx="16" fill="#f9f7fc"/><text x="147" y="217" font-size="70" fill="#b3a9c4">?</text><text x="103" y="283" font-size="20" fill="#8d809d">等待你来归类</text>';
return '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="440" viewBox="0 0 360 440">'+d+'<text x="18" y="427" font-family="sans-serif" font-size="10" fill="#786e79">拾序 · 虚构演示插画</text></svg>';
}
function imageURL(i){if(i.url)return i.url;if(!i.sampleURL)i.sampleURL='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(i.originalSVG||sampleSVG(i));return i.sampleURL;}
function shotArt(i,enlarged=false){return '<div class="shot-art image-shot '+esc(i.art||'unknown')+(enlarged?' enlarged':'')+'"><img src="'+esc(imageURL(i))+'" alt="'+esc(i.title)+'" draggable="false" '+(enlarged?'':'loading="lazy"')+'></div>';}
function scrollKey(){return JSON.stringify([view,group,query,filters]);}
function rememberScroll(){const el=app.querySelector('.app-scroll');if(el)scrollPositions.set(scrollKey(),el.scrollTop);}
function showModal(html){if(modal.hidden)priorFocus=document.activeElement;document.getElementById('dialog-content').innerHTML=html;modal.hidden=false;document.body.style.overflow='hidden';dialog.scrollTop=0;dialog.focus();}
function closeModal(){modal.hidden=true;document.body.style.overflow='';if(priorFocus?.isConnected)priorFocus.focus({preventScroll:true});else app.querySelector('button')?.focus({preventScroll:true});}
function baseItems(){return items.filter(i=>view==='queue'?i.status==='pending':live(i));}
function visibleItems(){const q=query.trim().toLowerCase();return baseItems().filter(i=>(group==='全部'||i.categories.includes(group))&&Object.entries(filters).every(([key,value])=>!value||i[key]===value)&&(!q||q.split(/\s+/).every(word=>[i.title,i.text,...i.categories,i.color,i.pattern,i.subject,i.question,i.kind].join(' ').toLowerCase().includes(word))));}
function resetFilters(){query='';filters={};selected.clear();}
function go(nextView,nextGroup='全部'){rememberScroll();view=nextView;group=nextGroup;resetFilters();render();}
function tabs(){return '<div class="app-tabs"><button data-action="view" data-view="home" class="'+(view!=='queue'?'current':'')+'" aria-pressed="'+(view!=='queue')+'">▧ 分类找图</button><button data-action="view" data-view="queue" class="'+(view==='queue'?'current':'')+'" aria-pressed="'+(view==='queue')+'">↺ 清理 '+count('pending')+'</button></div>';}
function homeContent(){
if(!allLive().length)return '<div class="welcome-panel"><span class="welcome-symbol">▧</span><h3>想用的时候，<br>找得到。</h3><p>先进入熟悉的分类，再靠画面认出来。</p><button class="app-btn full" data-action="load">体验找图 · 加载 16 张示例</button><button class="app-btn full secondary" data-action="import">导入自己的截图</button><small>示例是虚构插画；自己的图片只在当前页面使用，刷新后需重新导入。</small></div>';
return '<div class="find-summary"><div><strong>'+allLive().length+'</strong><span>张截图 · 按你记得的方式找</span></div><button data-action="browse-all">查看全部 →</button></div><div class="category-grid">'+categories.map(c=>'<button class="category-tile '+info[c][1]+'" data-action="category" data-category="'+c+'"><span class="category-icon">'+info[c][0]+'</span><strong>'+c+'</strong><small>'+allLive().filter(i=>i.categories.includes(c)).length+' 张</small></button>').join('')+'</div><p class="category-footnote">一张图可以出现在多个分类，原图只有一份。</p><div class="home-note"><b>先试两条找图路线</b><p>美甲 → 粉色 → 看图案<br>文字资料 → 文化学概论 → 看题型</p></div><button class="app-btn full secondary" data-action="load">重新载入示例（保留自己的图片）</button>';
}
function facetRow(key,label,values){const vals=unique(values);if(!vals.length)return '';return '<div class="facet-row"><span>'+label+'</span><div role="group" aria-label="'+label+'筛选">'+['全部',...vals].map(value=>'<button data-action="facet" data-key="'+key+'" data-value="'+esc(value==='全部'?'':value)+'" class="'+((filters[key]||'')===(value==='全部'?'':value)?'current':'')+'" aria-pressed="'+((filters[key]||'')===(value==='全部'?'':value))+'">'+esc(value)+'</button>').join('')+'</div></div>';}
function filterContent(){const candidates=baseItems().filter(i=>group==='全部'||i.categories.includes(group));let html='';if(group==='美甲')html=facetRow('color','颜色',candidates.map(i=>i.color))+facetRow('pattern','图案',candidates.map(i=>i.pattern));if(group==='文字资料')html=facetRow('kind','资料',candidates.map(i=>i.kind))+facetRow('subject','科目',candidates.map(i=>i.subject))+facetRow('question','题型',candidates.map(i=>i.question));return html?'<div class="facet-box">'+html+'</div>':'';}
function cards(){return visibleItems().map(i=>{const pick=view==='queue',meta=unique(group==='文字资料'?[i.kind,i.subject,i.question]:[i.color,i.pattern,...i.categories]);return '<article class="screenshot-card '+(selected.has(i.id)?'picked':'')+'"><button class="card-select" data-action="'+(pick?'pick':'detail')+'" data-id="'+i.id+'" aria-label="'+(pick?'选择':'查看')+esc(i.title)+'" '+(pick?'aria-pressed="'+selected.has(i.id)+'"':'')+'>'+(pick?'<span class="card-check">'+(selected.has(i.id)?'✓':'')+'</span>':'')+shotArt(i)+'<span class="card-label">'+esc(i.title)+'</span></button><div class="card-tags">'+meta.slice(0,3).map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><div class="card-footer"><span>'+esc(i.date||'虚构示例')+'</span><button data-action="detail" data-id="'+i.id+'" aria-label="打开'+esc(i.title)+'详情">查看 ↗</button></div></article>';}).join('');}
function listContent(){
const list=visibleItems(),hasFilters=!!query||Object.values(filters).some(Boolean);
let html=view==='queue'?'<div class="clean-explainer">只清理尚未处理的截图。分享和分类不会自动删除图片。</div>':'';
html+='<div class="list-controls"><label class="category-switch">分类<select id="group-select" aria-label="切换分类">'+['全部',...categories].map(c=>'<option value="'+c+'" '+(c===group?'selected':'')+'>'+c+'</option>').join('')+'</select></label><button data-action="import">＋ 导入</button></div><input class="library-search" id="library-search" type="search" autocomplete="off" placeholder="在当前分类搜索标题、科目或标签" aria-label="搜索当前分类" value="'+esc(query)+'">'+filterContent();
html+='<div class="selection-row"><span>'+list.length+' 张'+(hasFilters?' · 已筛选':'')+(view==='queue'?' · 已选 '+selected.size:'')+'</span><div>'+(hasFilters?'<button data-action="clear-filters">清空条件</button>':'')+(view==='queue'?' <button data-action="all" '+(list.length?'':'disabled')+'>'+(list.length&&list.every(i=>selected.has(i.id))?'取消全选':'本组全选')+'</button>':'')+'</div></div>';
if(list.length)return html+'<div class="screenshot-grid">'+cards()+'</div>';
const emptyQueue=view==='queue'&&!hasFilters;
const title=emptyQueue?(count('pending')===0?'这一批，整理好了':'本分类暂时没有待清理截图'):hasFilters?'没有匹配这些条件的截图':group==='全部'?'还没有截图':'这个分类暂时没有截图';
const message=emptyQueue?'已保留的图片仍可从分类首页找到；也可以切换分类继续清理。':hasFilters?'试试清空条件，或使用更宽泛的关键词。':group!=='全部'?'可以导入截图，或去“待确认”给图片补充分类。':'你可以回到分类首页查看全部已保留的内容。';
return html+'<div class="library-empty"><span class="empty-symbol">◇</span><h3>'+title+'</h3><p>'+message+'</p><button data-action="'+(hasFilters?'clear-filters':'view')+'" data-view="home">'+(hasFilters?'清空筛选条件':'返回分类首页')+'</button></div>';
}
function render(){
const title=view==='home'?'想找哪类截图？':view==='queue'?'用完后，再清理':group==='全部'?'全部截图':group;
const subtitle=view==='home'?'按分类找回，重要的内容留得住。':view==='queue'?'先看清楚，再决定删留。':group==='文字资料'?'先选科目、题型，再看笔记内容。':'看缩略图辨认，不确定时点开看。';
app.innerHTML='<div class="phone-head"><div class="phone-title"><h3>'+title+'</h3><button data-action="'+(view==='library'?'view':'import')+'" data-view="home">'+(view==='library'?'‹ 分类':'＋ 导入')+'</button></div><p>'+subtitle+'</p></div><div class="app-scroll">'+(view==='home'?homeContent():listContent())+'</div><div class="app-bottom">'+(view==='queue'&&count('pending')?'<small>已选 '+selected.size+' 张 · 只影响所选图片</small><div class="phone-actions"><button class="app-btn danger" data-action="delete" '+(selected.size?'':'disabled')+'>模拟删除 '+selected.size+' 张</button><button class="app-btn" data-action="keep" '+(selected.size?'':'disabled')+'>保留 '+selected.size+' 张</button></div>':'')+(lastAction?'<button class="app-undo" data-action="undo">↶ 撤销上次'+(lastAction.action==='kept'?'保留':'模拟删除')+'（'+lastAction.ids.length+' 张）</button>':'')+tabs()+'</div>';
app.querySelector('.app-scroll').scrollTop=scrollPositions.get(scrollKey())||0;
}
function loadSamples(){items=items.filter(i=>!i.isSample);items.push(...seed.map(i=>({...i,categories:[...i.categories],originalSVG:sampleSVG(i),status:'pending',isSample:true})));lastAction=null;currentDetail=null;scrollPositions.clear();view='home';group='全部';resetFilters();render();notify('已加载 16 张虚构示例，可直接按分类找图');}
function importPrompt(){showModal('<span class="eyebrow">导入截图</span><h3 id="dialog-title">从你熟悉的图片开始</h3><p>图片只在当前浏览器页面中使用，不上传。刷新或关闭页面后，本次导入和分类记录不会保留。</p><div class="dialog-warning neutral">当前没有接入 AI 或文字识别。自己的截图会进入“待确认”，可在详情中手动填写分类、科目等标签。</div><div class="dialog-actions"><button class="app-btn secondary" data-action="close">取消</button><button class="app-btn" data-action="choose-files">选择图片</button></div><button class="app-undo" data-action="load">先体验虚构示例 →</button>');}
const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='image/png,image/jpeg,image/webp,image/gif';fileInput.multiple=true;fileInput.hidden=true;document.body.append(fileInput);
fileInput.addEventListener('change',async()=>{
const files=[...fileInput.files];fileInput.value='';let added=0,skipped=0,failed=0,nextId=Math.max(1000,...items.map(i=>i.id))+1;
for(const file of files){const fingerprint=[file.name,file.size,file.lastModified].join(':');if(items.some(i=>i.fingerprint===fingerprint)){skipped++;continue;}const url=URL.createObjectURL(file);try{const probe=new Image();probe.src=url;await probe.decode();items.push({id:nextId++,title:file.name.replace(/\.[^.]+$/,''),categories:['待确认'],art:'unknown',text:'你的截图，可以补充分类和查找标签。',date:'本次导入',file,url,fingerprint,status:'pending',isSample:false});added++;}catch{URL.revokeObjectURL(url);failed++;}}
go('home');notify('已导入 '+added+' 张，进入待确认'+(skipped?'；'+skipped+' 张重复已跳过':'')+(failed?'；'+failed+' 张格式无法读取':''));
});
function tagEditor(i){return '<details class="tag-editor"><summary>修改分类与查找标签</summary><fieldset class="category-checks"><legend>分类（可多选）</legend>'+categories.map(c=>'<label><input type="checkbox" name="item-category" value="'+c+'" '+(i.categories.includes(c)?'checked':'')+'> '+c+'</label>').join('')+'</fieldset><div class="metadata-fields">'+[['kind','资料类型','学习笔记 / 工作文档'],['subject','科目','如：文化学概论'],['question','题型','如：简答题；没有则留空'],['color','颜色','如：粉色'],['pattern','图案','如：花朵']].map(([key,label,placeholder])=>'<label>'+label+'<input data-meta="'+key+'" value="'+esc(i[key]||'')+'" placeholder="'+placeholder+'" maxlength="40"></label>').join('')+'</div><button class="app-btn full secondary" data-action="save-tags" data-id="'+i.id+'">保存分类与标签</button></details>';}
function detail(id){const i=items.find(i=>i.id===id&&live(i));if(!i)return;rememberScroll();currentDetail=id;showModal('<span class="eyebrow">'+(i.isSample?'虚构示例 / 图片详情':'本次导入 / 图片详情')+'</span><h3 id="dialog-title">'+esc(i.title)+'</h3><div class="detail-tags">'+i.categories.map(c=>'<span>'+c+'</span>').join('')+'</div><div class="image-viewport">'+shotArt(i,true)+'</div><div class="zoom-tools"><span>看清图案与文字</span><button data-action="zoom" aria-label="放大图片">放大 150%</button><button data-action="zoom-reset">还原</button></div><p>'+esc(i.text)+'</p>'+tagEditor(i)+'<div class="dialog-actions"><button class="app-btn secondary" data-action="close">返回列表</button><button class="app-btn" data-action="share-preview" data-id="'+id+'">分享图片 ↗</button></div><button class="detail-delete" data-action="delete-one" data-id="'+id+'">不再需要了 · 模拟删除</button>');}
function saveTags(id){const i=items.find(i=>i.id===id);if(!i)return;const checked=[...dialog.querySelectorAll('input[name="item-category"]:checked')].map(e=>e.value),main=checked.filter(c=>c!=='待确认');i.categories=main.length?main:['待确认'];dialog.querySelectorAll('[data-meta]').forEach(e=>i[e.dataset.meta]=e.value.trim());selected.clear();render();closeModal();notify('分类与标签已更新；图片内容和删留状态保持不变');}
function sharePreview(id){const i=items.find(i=>i.id===id&&live(i));if(!i)return;showModal('<span class="eyebrow">分享前预览</span><h3 id="dialog-title">把这张图分享出去</h3>'+shotArt(i,true)+'<p>'+esc(i.title)+'</p><small>分享后，图片仍留在资料库。等你确认不再需要时，再自行清理。</small><div class="dialog-actions"><button class="app-btn secondary" data-action="detail" data-id="'+id+'">返回详情</button><button class="app-btn" data-action="share-file" data-id="'+id+'">选择分享方式</button></div><button class="app-undo" data-action="download" data-id="'+id+'">'+(i.isSample?'下载示例插画':'下载这张图片')+'</button>');}
function fileFor(i){return i.file||new File([i.originalSVG||sampleSVG(i)],i.title+'.svg',{type:'image/svg+xml'});}
function downloadItem(i){const file=fileFor(i),url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);notify(i.isSample?'已下载虚构示例插画，可自行选择分享':'图片已下载，可自行选择分享');}
async function shareFile(id){const i=items.find(i=>i.id===id&&live(i));if(!i)return;const file=fileFor(i);if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:i.title});notify('已交给系统分享，图片仍保留');}catch(error){if(error.name!=='AbortError')notify('系统分享未完成，可以使用下载图片');}}else notify('当前浏览器无法直接分享此图片，请使用下方的下载图片');}
function applyAction(status,ids=[...selected]){const targets=items.filter(i=>ids.includes(i.id)&&live(i));if(!targets.length)return;rememberScroll();lastAction={ids:targets.map(i=>i.id),previous:targets.map(i=>i.status),action:status};targets.forEach(i=>i.status=status);selected.clear();render();notify(targets.length+' 张已'+(status==='kept'?'保留，仍可在分类中找到':'模拟删除，可撤销'));}
function deletePrompt(ids=[...selected]){const targets=items.filter(i=>ids.includes(i.id)&&live(i));if(!targets.length)return;const returnId=currentDetail;showModal('<span class="eyebrow">由你决定删留</span><h3 id="dialog-title">模拟删除这 '+targets.length+' 张截图？</h3><p>确认已经不再需要这些内容，再继续。</p><div class="dialog-warning">这里只会从本页资料库中移除图片，不会删除你手机或电脑中的原图。分类、分享和时间不会触发自动删除。</div><div class="dialog-actions"><button class="app-btn secondary" data-action="'+(returnId?'detail':'close')+'" data-id="'+(returnId||'')+'">继续检查</button><button class="app-btn danger" data-action="confirm-delete" data-ids="'+targets.map(i=>i.id).join(',')+'">确认模拟删除</button></div>');}
function undo(){if(!lastAction){notify('还没有可撤销的删留操作');return;}const action=lastAction;action.ids.forEach((id,n)=>{const i=items.find(i=>i.id===id);if(i)i.status=action.previous[n];});lastAction=null;selected.clear();render();notify('已撤销，'+action.ids.length+' 张已恢复原状态');}
document.addEventListener('click',e=>{
const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,id=Number(b.dataset.id);
if(action==='close'){closeModal();return;}if(action==='load'){closeModal();loadSamples();return;}if(action==='import'){importPrompt();return;}if(action==='choose-files'){closeModal();fileInput.click();return;}
if(action==='view'){go(b.dataset.view);return;}if(action==='category'){go('library',b.dataset.category);return;}if(action==='browse-all'){go('library');return;}
if(action==='facet'){rememberScroll();filters[b.dataset.key]=b.dataset.value;selected.clear();render();return;}if(action==='clear-filters'){rememberScroll();resetFilters();render();return;}
if(action==='detail'){detail(id);return;}if(action==='save-tags'){saveTags(id);return;}if(action==='share-preview'){sharePreview(id);return;}if(action==='share-file'){shareFile(id);return;}
if(action==='download'){const i=items.find(i=>i.id===id&&live(i));if(i)downloadItem(i);return;}
if(action==='zoom'||action==='zoom-reset'){const image=dialog.querySelector('.image-viewport img');if(!image)return;const zoom=action==='zoom-reset'?100:(Number(image.dataset.zoom||100)>=200?100:Number(image.dataset.zoom||100)+50);image.dataset.zoom=zoom;image.style.width=zoom+'%';image.style.maxWidth='none';image.style.height='auto';dialog.querySelector('[data-action="zoom"]').textContent='放大 '+(zoom>=200?100:zoom+50)+'%';return;}
if(action==='pick'){rememberScroll();selected.has(id)?selected.delete(id):selected.add(id);render();return;}if(action==='all'){rememberScroll();const ids=visibleItems().map(i=>i.id),all=ids.length&&ids.every(n=>selected.has(n));selected=all?new Set():new Set(ids);render();return;}
if(action==='keep'){currentDetail=null;applyAction('kept');return;}if(action==='delete'){currentDetail=null;deletePrompt();return;}if(action==='delete-one'){currentDetail=id;deletePrompt([id]);return;}
if(action==='confirm-delete'){const ids=b.dataset.ids.split(',').map(Number);closeModal();applyAction('deleted',ids);currentDetail=null;return;}if(action==='undo'){undo();return;}
if(action==='confirm-reset'){items.forEach(i=>{if(i.url)URL.revokeObjectURL(i.url);});items=[];lastAction=null;currentDetail=null;scrollPositions.clear();closeModal();go('home');notify('演示已重置');}
});
app.addEventListener('change',e=>{if(e.target.id==='group-select')go(view,e.target.value);});
let composingSearch=false;
function updateSearch(target){query=target.value;selected.clear();render();document.getElementById('library-search').focus({preventScroll:true});}
app.addEventListener('compositionstart',e=>{if(e.target.id==='library-search')composingSearch=true;});
app.addEventListener('compositionend',e=>{if(e.target.id==='library-search'){composingSearch=false;updateSearch(e.target);}});
app.addEventListener('input',e=>{if(e.target.id!=='library-search'||composingSearch||e.isComposing)return;updateSearch(e.target);});
document.querySelector('.dialog-close').addEventListener('click',closeModal);document.querySelector('.modal-backdrop').addEventListener('click',closeModal);
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape'){closeModal();return;}if(e.key==='Tab'){const nodes=[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not([hidden]),select,summary,[tabindex="0"]')].filter(el=>el.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){e.preventDefault();first?.focus();}}});
document.getElementById('reset-demo')?.addEventListener('click',()=>{if(!items.length){notify('当前已经是初始状态');return;}showModal('<span class="eyebrow">重新开始</span><h3 id="dialog-title">重置本次演示？</h3><p>本页导入的图片、分类标签和删留记录会清空。你的原图不会受影响。</p><div class="dialog-actions"><button class="app-btn secondary" data-action="close">继续当前演示</button><button class="app-btn" data-action="confirm-reset">重置演示</button></div>');});
document.querySelectorAll('[data-guide]').forEach(b=>b.addEventListener('click',()=>{if(!items.length)loadSamples();const target=b.dataset.guide;go(target==='clean'?'queue':target==='home'?'home':'library',target==='nails'?'美甲':target==='notes'?'文字资料':'全部');}));
const requirements=[
{id:'FR-01',title:'授权与新增导入',priority:'P0',summary:'访问清楚，导入后直接可查',description:'真实 App 说明权限与处理方式，导入去重。原型支持 16 张示例或本地图片；个人图片不上传，默认待确认。',accept:'拒绝不虚报成功；重复导入同一文件不新增副本；失败图片有反馈。'},
{id:'FR-02',title:'分类首页与多标签',priority:'P0',summary:'六类入口，一张图可多处找到',description:'首页提供美甲、聊天记录、付款凭证、文字资料、穿搭、美食及待确认。已保留和未处理图片均可浏览，多标签引用同一张图。',accept:'聊天中的付款记录可从两个入口找到；唯一图片总数不重复累计；不用先保留再查找。'},
{id:'FR-03',title:'分类浏览与线索筛选',priority:'P0',summary:'美甲看颜色图案，笔记看科目题型',description:'美甲支持颜色、图案筛选；文字资料支持类型、科目、题型筛选。未知标签不编造。',accept:'粉色美甲出现对应样例；文化学概论筛选得到对应笔记；无结果可清空条件。'},
{id:'FR-04',title:'详情放大与分享',priority:'P0',summary:'辨认目标后，方便拿来使用',description:'点开详情后可放大、还原、预览分享。支持文件分享时交给系统，不支持时可下载图片。',accept:'返回列表保留分类、筛选与位置；取消分享不删图；分享不支持时有替代入口。'},
{id:'FR-05',title:'分类与标签纠错',priority:'P0',summary:'按自己的查找习惯修改',description:'详情可多选分类、补充科目题型及颜色图案。用户修正优先；空分类进入待确认。',accept:'计数和列表同步；多标签不复制图片；纠错不改变删留状态。'},
{id:'FR-06',title:'分类内文本搜索',priority:'P1',summary:'找不到时，补充关键词',description:'在当前分类按标题、说明和标签匹配关键词。原型没有 OCR、自然语言理解或自动视觉识别。',accept:'范围明确；空结果与空分类区分；清空条件恢复列表。'},
{id:'FR-07',title:'用后清理与撤销',priority:'P1',summary:'独立入口，用户确认删留',description:'默认零选择，支持批量保留、确认模拟删除、撤销最近一次操作。分享或分类不自动删除。',accept:'取消不改状态；仅所选项更新；撤销恢复原状态；分类计数同步。'},
{id:'FR-08',title:'跨会话与真机能力',priority:'P1',summary:'真实 App 的下一阶段验证',description:'相册读取、识别、持久保存、系统分享、真实删除与恢复依赖目标系统验证。网页刷新后清空状态。',accept:'不把演示当作真机能力或识别质量结果；状态与实际能力相符。'}
];
function renderReq(filter='all'){const target=document.getElementById('req-list');if(!target)return;target.innerHTML=requirements.filter(r=>filter==='all'||r.priority===filter).map(r=>'<details><summary><span class="req-id">'+r.id+'</span><span class="req-title">'+r.title+'</span><span class="priority '+(r.priority==='P1'?'p1':'')+'">'+r.priority+'</span><span class="req-summary">'+r.summary+'</span><span class="req-toggle" aria-hidden="true">+</span></summary><div class="req-description"><p>'+r.description+'</p><strong>验收要点</strong><p>'+r.accept+'</p></div></details>').join('');}
document.querySelectorAll('[data-req]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-req]').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});renderReq(b.dataset.req);}));
const sections=[...document.querySelectorAll('section[id]')],navLinks=[...document.querySelectorAll('nav a')];
function updateNav(){if(!sections.length)return;let current=sections[0].id;for(const s of sections)if(s.getBoundingClientRect().top<window.innerHeight*.35)current=s.id;for(const a of navLinks){const on=a.hash==='#'+current;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}}
let scrollQueued=false;window.addEventListener('scroll',()=>{if(!scrollQueued){requestAnimationFrame(()=>{updateNav();scrollQueued=false;});scrollQueued=true;}},{passive:true});
render();renderReq();updateNav();
