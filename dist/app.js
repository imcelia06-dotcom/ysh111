'use strict';
// Authored examples, not recognition output. Browser imports never leave this page.
const sampleCategories={'出行与预约':['↗','trip'],'学习工作':['▤','learn'],'操作指南':['≡','learn'],'生活参考':['♧','room'],'订单凭证':['¥','receipt'],'重要记录':['“','chat']};
let categories=['待确认'];
const info=new Map([['待确认',['◇','unknown']]]);
const metaFields=[['keywords','关键词','按自己的习惯填写，用逗号分隔'],['kind','资料类型','可选，如：学习笔记、工作文档'],['subject','主题 / 科目','可选，如：项目、科目名称'],['question','题型','可选，没有则留空'],['color','颜色','可选，如：粉色'],['pattern','图案','可选，如：花朵']];
const seed=[
{id:1,title:'集合地点 · 出门前再看',categories:['出行与预约'],art:'trip',kind:'地址路线',subject:'周末出行',keywords:'集合,地址',text:'虚构场景：出门前找回保存的集合地点与路线参考；没有真实位置。'},
{id:2,title:'预约确认 · 时间与安排',categories:['出行与预约'],art:'booking',kind:'预约信息',subject:'日常安排',keywords:'预约,时间',text:'虚构预约卡片：核对日期、时间与准备事项，不是真实预约。'},
{id:3,title:'交通路线 · 换乘提示',categories:['出行与预约'],art:'trip',kind:'交通路线',subject:'路线参考',keywords:'换乘,路线',text:'虚构路线示意：需要时找回保存的换乘提示，不提供真实导航。'},
{id:4,title:'操作说明 · 三步设置',categories:['操作指南'],art:'guide',kind:'操作步骤',subject:'设备设置',keywords:'设置,步骤',text:'虚构操作卡片：打开设置、选择选项、确认完成。仅用于体验找回流程。'},
{id:5,title:'课程资料 · 要点整理',categories:['学习工作'],art:'learn',kind:'学习资料',subject:'课程复习',question:'概念整理',text:'虚构课程笔记：知识要点、例子与复习提纲。'},
{id:6,title:'工作资料 · 项目提纲',categories:['学习工作'],art:'learn',kind:'工作资料',subject:'项目资料',text:'虚构项目提纲：目标、讨论事项与下一步。'},
{id:7,title:'活动安排 · 行前清单',categories:['出行与预约'],art:'booking',kind:'活动安排',subject:'行前准备',keywords:'清单,活动',text:'虚构活动备忘：时间安排、集合说明与准备清单。'},
{id:8,title:'居家灵感 · 暖白与木色',categories:['生活参考'],art:'room',color:'暖白色',pattern:'木质',keywords:'居家,配色',text:'虚构空间配色插画：需要时重新查看保存过的生活灵感。'},
{id:9,title:'订单约定 · 确认事项',categories:['订单凭证','重要记录'],art:'agreement',kind:'确认记录',keywords:'订单,约定',text:'虚构对话记录：订单内容与约定已确认，不是真实交易或凭证。'},
{id:10,title:'支付结果 · 订单凭证',categories:['订单凭证'],art:'receipt',text:'虚构支付结果：仅作截图整理示意，不是真实交易凭证。'},
{id:11,title:'商品规格 · 选购参考',categories:['生活参考'],art:'learn',kind:'商品资料',subject:'规格比较',keywords:'参数,选购',text:'虚构商品比较：尺寸、材质与使用场景，不构成选购建议。'},
{id:12,title:'日常搭配 · 浅色衬衫',categories:['生活参考'],art:'outfit',color:'浅色',text:'虚构穿搭参考：浅色上衣与深色长裤。'},
{id:13,title:'菜谱收藏 · 制作步骤',categories:['生活参考','操作指南'],art:'food',kind:'制作步骤',keywords:'菜谱,步骤',text:'虚构菜谱收藏，演示同一张图可同时按主题和用途归类。'},
{id:14,title:'办事备忘 · 材料清单',categories:['重要记录'],art:'learn',kind:'材料清单',subject:'办事备忘',text:'虚构备忘：材料、办理步骤与待确认事项。'},
{id:15,title:'尚未归类的截图',categories:['待确认'],art:'unknown',text:'示例没有可靠分类，可以在详情中手动补充。'},
{id:16,title:'一段对话 · 想留住的片刻',categories:['重要记录'],art:'chat',text:'虚构对话：今天聊得很开心。／这段话，我想好好留着。'}
];
let items=[],view='home',group='全部',query='',filters={},reviewFilter='active',selected=new Set(),lastAction=null,currentDetail=null,priorFocus,toastTimer;
const scrollPositions=new Map(),app=document.getElementById('phone-app'),modal=document.getElementById('modal'),dialog=document.querySelector('.dialog');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const live=i=>i.status!=='deleted',allLive=()=>items.filter(live),count=s=>items.filter(i=>i.status===s).length;
const unique=values=>[...new Set(values.filter(Boolean))];
const needsReview=i=>live(i)&&!i.categories.some(c=>c!=='待确认');
const hasSuggestion=i=>needsReview(i)&&!!i.suggestion;
const canConfirmSuggestion=i=>hasSuggestion(i)&&!checkedReviewNames(i.suggestion.categories).error;
function reviewItems(state=reviewFilter){return items.filter(i=>needsReview(i)&&(state==='all'||(state==='later'?i.classificationState==='deferred':i.classificationState!=='deferred')));}
function selectedSuggestions(){return visibleItems().filter(i=>selected.has(i.id)&&canConfirmSuggestion(i));}
function notify(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3600);}
function sampleSVG(i){
let d='';
if(i.art==='trip'){
 d='<rect width="360" height="440" fill="#e7ecdf"/><path d="M0 120H360M0 285H360M70 0V440M270 0V440" stroke="#f9faf4" stroke-width="28"/><path d="M75 330V207Q75 185 105 185H218V116" fill="none" stroke="#819d74" stroke-width="7" stroke-linecap="round" stroke-dasharray="8 10"/><circle cx="75" cy="330" r="13" fill="#b7c79e" stroke="#fff" stroke-width="5"/><path d="M218 72c-23 0-40 17-40 39 0 29 40 67 40 67s40-38 40-67c0-22-17-39-40-39" fill="#536e4d"/><circle cx="218" cy="110" r="13" fill="#ecf2df"/><rect x="35" y="353" width="290" height="57" rx="10" fill="#fffef9"/><text x="53" y="377" font-size="17" fill="#4e684b">'+esc(i.kind||'出行参考')+'</text><text x="53" y="397" font-size="11" fill="#849278">路线与地点均为虚构示意</text>';
}else if(i.art==='booking'){
 d='<rect width="360" height="440" fill="#e9e9ef"/><rect x="38" y="49" width="284" height="340" rx="16" fill="#fffef9"/><rect x="38" y="49" width="284" height="71" rx="16" fill="#c9c9d8"/><rect x="38" y="100" width="284" height="20" fill="#c9c9d8"/><path d="M105 35V70M255 35V70" stroke="#79758c" stroke-width="8" stroke-linecap="round"/><text x="73" y="163" font-size="19" fill="#625d77">'+esc(i.kind||'日常安排')+'</text><text x="73" y="211" font-size="30" fill="#77728b">时间 · 地点</text><path d="M73 246H285M73 277H261M73 308H280" stroke="#e5e2e9" stroke-width="7" stroke-linecap="round"/><rect x="73" y="339" width="109" height="22" rx="11" fill="#efedf4"/><text x="87" y="355" font-size="11" fill="#8b8298">虚构预约示意</text>';
}else if(i.art==='guide'){
 d='<rect width="360" height="440" fill="#f1ede3"/><rect x="28" y="28" width="304" height="382" rx="12" fill="#fffdf7"/><text x="53" y="78" font-size="25" fill="#6a6751">操作说明</text><text x="53" y="105" font-size="12" fill="#9c9681">把要用的步骤，重新找回来</text>';
 ['打开设置','选择选项','确认完成'].forEach((line,n)=>{const y=157+n*75;d+='<circle cx="70" cy="'+y+'" r="17" fill="#e6e8d5"/><text x="65" y="'+(y+5)+'" font-size="15" fill="#7f8c67">'+(n+1)+'</text><text x="102" y="'+(y+4)+'" font-size="18" fill="#74735c">'+line+'</text><path d="M102 '+(y+24)+'H282" stroke="#e9e6d9" stroke-width="5"/>';});
 d+='<text x="53" y="382" font-size="11" fill="#a7a18d">虚构步骤 · 仅用于交互演示</text>';
}else if(i.art==='room'){
 d='<rect width="360" height="440" fill="#eee9df"/><rect x="35" y="40" width="103" height="130" fill="#c9d3c1"/><path d="M86 40V170M35 106H138" stroke="#f8f5ed" stroke-width="7"/><rect x="153" y="205" width="167" height="104" rx="15" fill="#c8b59b"/><rect x="153" y="190" width="167" height="63" rx="16" fill="#d5c5ad"/><rect x="138" y="241" width="27" height="72" rx="10" fill="#b6a189"/><rect x="306" y="241" width="27" height="72" rx="10" fill="#b6a189"/><path d="M167 309V331M304 309V331" stroke="#8c7967" stroke-width="7"/><ellipse cx="121" cy="341" rx="80" ry="23" fill="#d8d6bf"/><ellipse cx="113" cy="309" rx="53" ry="17" fill="#a9ad93"/><path d="M81 310V350M144 310V350" stroke="#7b856a" stroke-width="5"/><rect x="267" y="90" width="13" height="100" fill="#9c9e86"/><path d="M244 99 254 61H292L305 99Z" fill="#fdf9e9"/><text x="34" y="392" font-size="18" fill="#827663">暖白与木色 · 生活参考</text>';
}else if(i.art==='agreement'){
 d='<rect width="360" height="440" fill="#e9eee7"/><rect width="360" height="58" fill="#fffef9"/><text x="137" y="36" font-size="19" fill="#57664e">确认事项</text><rect x="30" y="87" width="253" height="94" rx="12" fill="#fff"/><text x="47" y="117" font-size="18" fill="#58664f">订单内容与时间，</text><text x="47" y="148" font-size="18" fill="#58664f">我们已确认。</text><rect x="84" y="209" width="246" height="105" rx="12" fill="#d2dfc3"/><text x="102" y="244" font-size="17" fill="#55674b">好的，按约定安排。</text><text x="102" y="278" font-size="13" fill="#7b8d6c">保留记录，方便之后核对。</text><text x="31" y="380" font-size="13" fill="#8d9983">虚构对话，不是真实订单或凭证</text>';
}else if(i.art==='nails'){
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
function scrollKey(){return JSON.stringify([view,group,query,filters,view==='review'?reviewFilter:'']);}
function rememberScroll(){const el=app.querySelector('.app-scroll');if(el)scrollPositions.set(scrollKey(),el.scrollTop);}
function showModal(html){if(modal.hidden)priorFocus=document.activeElement;document.getElementById('dialog-content').innerHTML=html;modal.hidden=false;document.body.style.overflow='hidden';dialog.scrollTop=0;dialog.focus();}
function closeModal(){modal.hidden=true;document.body.style.overflow='';if(priorFocus?.isConnected)priorFocus.focus({preventScroll:true});else app.querySelector('button')?.focus({preventScroll:true});}
function baseItems(){return view==='review'?reviewItems():items.filter(i=>view==='queue'?i.status==='pending':live(i));}
function keywordList(i){return unique((i.keywords||'').split(/[,，、\n]/).map(s=>s.trim()));}
function visibleItems(){const q=query.trim().toLowerCase();return baseItems().filter(i=>(group==='全部'||i.categories.includes(group))&&Object.entries(filters).every(([key,value])=>!value||(key==='keywords'?keywordList(i).includes(value):i[key]===value))&&(!q||q.split(/\s+/).every(word=>[i.title,i.text,...i.categories,...metaFields.map(([key])=>i[key])].join(' ').toLowerCase().includes(word))));}
function resetFilters(){query='';filters={};selected.clear();}
function go(nextView,nextGroup='全部'){rememberScroll();view=nextView;group=nextView==='review'?'待确认':nextGroup;if(nextView==='review')reviewFilter='active';resetFilters();render();}
function tabs(){return '<div class="app-tabs"><button data-action="view" data-view="home" class="'+(['home','library'].includes(view)?'current':'')+'" aria-pressed="'+(['home','library'].includes(view))+'">▧ 分类找图</button><button data-action="view" data-view="review" class="'+(view==='review'?'current':'')+'" aria-pressed="'+(view==='review')+'">◇ 待确认 '+items.filter(needsReview).length+'</button><button data-action="view" data-view="queue" class="'+(view==='queue'?'current':'')+'" aria-pressed="'+(view==='queue')+'">↺ 清理 '+count('pending')+'</button></div>';}
function homeContent(){
if(!allLive().length&&categories.length===1)return '<div class="welcome-panel"><span class="welcome-symbol">▧</span><h3>先看建议，<br>再确认归类。</h3><p>分类建议可以修改，拿不准可以稍后。<br>确认之前，图片始终在待确认里。</p><button class="app-btn full" data-action="load">体验建议确认 · 16 张示例</button><button class="app-btn full secondary" data-action="import">导入自己的截图</button><button class="app-undo" data-action="category-new">先创建我的分类</button><small>示例建议人工预设。自己的图片尚无 AI 建议，可手动归类；图片与状态刷新后清空。</small></div>';
const waiting=items.filter(needsReview),suggested=waiting.filter(hasSuggestion);
return '<div class="find-summary"><div><strong>'+allLive().length+'</strong><span>张截图 · 按你记得的方式找</span></div><button data-action="browse-all">查看全部 →</button></div>'+(waiting.length?'<button class="review-banner" data-action="view" data-view="review"><strong>'+waiting.length+' 张待确认</strong><span>'+(suggested.length?suggested.length+' 条演示建议，确认后才归类':'暂无自动建议，可手动归类')+' →</span></button>':'')+'<div class="category-toolbar"><span>我的分类</span><div><button data-action="category-new">＋ 新建</button><button data-action="category-manage">管理分类</button></div></div><div class="category-grid">'+categories.map(c=>{const style=info.get(c)||['▧','custom'];return '<button class="category-tile '+style[1]+'" data-action="category" data-category="'+esc(c)+'"><span class="category-icon">'+style[0]+'</span><strong>'+esc(c)+'</strong><small>'+allLive().filter(i=>i.categories.includes(c)).length+' 张</small></button>';}).join('')+'</div><p class="category-footnote">建议不会自动成为正式分类；一张图可有多个已确认分类。</p><div class="home-note"><b>先确认，再归类</b><p>可以修改建议、选择几张一起确认，或先放到稍后处理。原图一直可查看。</p></div><button class="app-btn full secondary" data-action="load">重载示例（重新体验建议确认）</button>';
}
function facetRow(key,label,values){const vals=unique(values);if(!vals.length)return '';const choices=[{label:'不限',value:''},...vals.map(value=>({label:value,value}))];return '<div class="facet-row"><span>'+label+'</span><div role="group" aria-label="'+label+'筛选">'+choices.map(choice=>'<button data-action="facet" data-key="'+key+'" data-value="'+esc(choice.value)+'" class="'+((filters[key]||'')===choice.value?'current':'')+'" aria-pressed="'+((filters[key]||'')===choice.value)+'">'+esc(choice.label)+'</button>').join('')+'</div></div>';}
function filterContent(){if(group==='全部')return '';const candidates=baseItems().filter(i=>i.categories.includes(group));const html=metaFields.map(([key,label])=>facetRow(key,label,candidates.flatMap(i=>key==='keywords'?keywordList(i):[i[key]]))).join('');return html?'<div class="facet-box">'+html+'</div>':'';}
function cards(){return visibleItems().map(i=>{
const pick=view==='queue',review=view==='review',suggested=hasSuggestion(i),meta=unique([...keywordList(i),i.subject,i.question,i.kind,i.color,i.pattern,...i.categories]);
const action=pick?'pick':review&&suggested?'review-suggestion':'detail';
return '<article class="screenshot-card '+(selected.has(i.id)?'picked':'')+'">'+(review&&canConfirmSuggestion(i)?'<button class="review-choice" data-action="review-pick" data-id="'+i.id+'" aria-label="选择建议：'+esc(i.title)+'" aria-pressed="'+selected.has(i.id)+'">'+(selected.has(i.id)?'✓':'')+'</button>':'')+'<button class="card-select" data-action="'+action+'" data-id="'+i.id+'" aria-label="'+(pick?'选择':review&&suggested?'查看建议：':'查看')+esc(i.title)+'" '+(pick?'aria-pressed="'+selected.has(i.id)+'"':'')+'>'+(pick?'<span class="card-check">'+(selected.has(i.id)?'✓':'')+'</span>':'')+shotArt(i)+'<span class="card-label">'+esc(i.title)+'</span></button>'+(needsReview(i)?'<p class="suggestion-hint">'+(i.classificationState==='deferred'?'已稍后 · ':'')+(suggested?'演示建议：'+esc(i.suggestion.categories.join('、')||'待补充分类'):'暂无建议，可手动归类')+'</p>':'')+'<div class="card-tags">'+meta.slice(0,3).map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><div class="card-footer">'+(review?'<button data-action="'+(suggested?'review-suggestion':'detail')+'" data-id="'+i.id+'">'+(suggested?'查看建议':'手动归类')+'</button><button data-action="'+(i.classificationState==='deferred'?'review-resume':'review-defer')+'" data-id="'+i.id+'">'+(i.classificationState==='deferred'?'移回待处理':'稍后')+'</button>':'<span>'+esc(i.date||'虚构示例')+'</span><button data-action="detail" data-id="'+i.id+'" aria-label="打开'+esc(i.title)+'详情">查看 ↗</button>')+'</div></article>';
}).join('');}
function listContent(){
const list=visibleItems(),hasFilters=!!query||Object.values(filters).some(Boolean);
let html=view==='queue'?'<div class="clean-explainer">只清理尚未处理的截图。分享和分类不会自动删除图片。</div>':'';
html+='<div class="list-controls"><label class="category-switch">分类<select id="group-select" aria-label="切换分类">'+['全部',...categories].map(c=>'<option value="'+esc(c)+'" '+(c===group?'selected':'')+'>'+esc(c)+'</option>').join('')+'</select></label><button data-action="category-manage">管理分类</button><button data-action="import">＋ 导入</button></div><input class="library-search" id="library-search" type="search" autocomplete="off" placeholder="在当前分类搜索标题、内容或关键词" aria-label="搜索当前分类" value="'+esc(query)+'">'+filterContent();
html+='<div class="selection-row"><span>'+list.length+' 张'+(hasFilters?' · 已筛选':'')+(view==='queue'?' · 已选 '+selected.size:'')+'</span><div>'+(hasFilters?'<button data-action="clear-filters">清空条件</button>':'')+(view==='queue'?' <button data-action="all" '+(list.length?'':'disabled')+'>'+(list.length&&list.every(i=>selected.has(i.id))?'取消全选':'本组全选')+'</button>':'')+'</div></div>';
if(list.length)return html+'<div class="screenshot-grid">'+cards()+'</div>';
const emptyQueue=view==='queue'&&!hasFilters;
const title=emptyQueue?(count('pending')===0?'这一批，整理好了':'本分类暂时没有待清理截图'):hasFilters?'没有匹配这些条件的截图':group==='全部'?'还没有截图':'这个分类暂时没有截图';
const message=emptyQueue?'已保留的图片仍可从分类首页找到；也可以切换分类继续清理。':hasFilters?'试试清空条件，或使用更宽泛的关键词。':group!=='全部'?'可以导入截图，或去“待确认”给图片补充分类。':'你可以回到分类首页查看全部已保留的内容。';
return html+'<div class="library-empty"><span class="empty-symbol">◇</span><h3>'+title+'</h3><p>'+message+'</p><button data-action="'+(hasFilters?'clear-filters':'view')+'" data-view="home">'+(hasFilters?'清空筛选条件':'返回分类首页')+'</button></div>';
}
function render(){
const title=view==='home'?'想找哪类截图？':view==='review'?'先看看分类建议':view==='queue'?'用完后，再清理':group==='全部'?'全部截图':group;
const subtitle=view==='home'?'按自己的习惯分类，想用的时候找得到。':view==='review'?'确认后才归类，拿不准可以稍后。':view==='queue'?'先看清楚，再决定删留。':'用已有线索筛选，不确定时点开看。';
const back=['library','review'].includes(view);
app.innerHTML='<div class="phone-head"><div class="phone-title"><h3>'+esc(title)+'</h3><button data-action="'+(back?'view':'import')+'" data-view="home">'+(back?'‹ 分类':'＋ 导入')+'</button></div><p>'+subtitle+'</p></div><div class="app-scroll">'+(view==='home'?homeContent():view==='review'?reviewContent():listContent())+'</div><div class="app-bottom">'+(view==='review'?'<button class="app-btn full" data-action="review-bulk" '+(selectedSuggestions().length?'':'disabled')+'>检查已选 '+selectedSuggestions().length+' 条建议</button>':'')+(view==='queue'&&count('pending')?'<small>已选 '+selected.size+' 张 · 只影响所选图片</small><div class="phone-actions"><button class="app-btn danger" data-action="delete" '+(selected.size?'':'disabled')+'>模拟删除 '+selected.size+' 张</button><button class="app-btn" data-action="keep" '+(selected.size?'':'disabled')+'>保留 '+selected.size+' 张</button></div>':'')+(lastAction?'<button class="app-undo" data-action="undo">↶ 撤销上次'+(lastAction.action==='kept'?'保留':'模拟删除')+'（'+lastAction.ids.length+' 张）</button>':'')+tabs()+'</div>';
app.querySelector('.app-scroll').scrollTop=scrollPositions.get(scrollKey())||0;
}
function loadSamples(){items=items.filter(i=>!i.isSample);items.push(...seed.map(i=>{const proposed=i.categories.filter(c=>c!=='待确认'),meta=Object.fromEntries(metaFields.filter(([key])=>i[key]).map(([key])=>[key,i[key]]));return {id:i.id,title:i.title,art:i.art,text:i.text,originalSVG:sampleSVG(i),categories:['待确认'],classificationState:'pending',suggestion:proposed.length?{categories:[...proposed],meta,source:'人工预设的演示建议'}:null,status:'pending',isSample:true};}));lastAction=null;currentDetail=null;scrollPositions.clear();view='review';group='待确认';reviewFilter='active';resetFilters();render();notify('16 张示例均未归类；15 条演示建议等待你的确认');}
function reviewContent(){
 const waiting=items.filter(needsReview),list=visibleItems(),available=list.filter(canConfirmSuggestion);
 const counts={active:reviewItems('active').length,later:reviewItems('later').length,all:waiting.length};
 return '<div class="review-intro"><strong>先检查，再确认</strong><p>示例建议人工预设，不会自动归类。自己的图片暂未接入 AI，可手动归类。</p></div><div class="review-filters" role="group" aria-label="待确认状态">'+[['active','待处理'],['later','稍后处理'],['all','全部未归类']].map(([key,label])=>'<button data-action="review-state" data-state="'+key+'" class="'+(reviewFilter===key?'current':'')+'" aria-pressed="'+(reviewFilter===key)+'">'+label+' '+counts[key]+'</button>').join('')+'</div><input class="library-search" id="library-search" type="search" aria-label="搜索待确认图片" placeholder="搜索待确认图片的标题或说明" value="'+esc(query)+'"><div class="selection-row"><span>'+list.length+' 张 · 已选 '+selectedSuggestions().length+' 条建议</span><button data-action="review-all" '+(available.length?'':'disabled')+'>'+(available.length&&available.every(i=>selected.has(i.id))?'取消选择':'选择可确认的建议')+'</button></div>'+(list.length?'<div class="screenshot-grid">'+cards()+'</div>':'<div class="library-empty"><span class="empty-symbol">✓</span><h3>'+(waiting.length?'当前条件下没有待处理图片':'这一批，已完成归类')+'</h3><p>'+(waiting.length?'稍后处理的图片仍可查看；也可以清空搜索或查看全部未归类。':'可以从分类首页找回图片。确认归类不会触发保留或删除。')+'</p><button data-action="'+(waiting.length?'review-state':'view')+'" data-state="all" data-view="home">'+(waiting.length?'查看全部未归类':'返回分类首页')+'</button></div>');
}
function proposedMeta(i){const meta={...(i.suggestion?.meta||{})};if(i.suggestion?.draftSaved)return meta;for(const [key] of metaFields)if(i[key])meta[key]=i[key];return meta;}
function proposedNames(i){const result=[];for(const name of [...categories.filter(c=>c!=='待确认'),...(i.suggestion?.categories||[])])if(!result.some(n=>canonicalName(n)===canonicalName(name)))result.push(name);return result;}
function reviewSuggestion(id,edit=false){
 const i=items.find(i=>i.id===id);if(!i||!hasSuggestion(i)){if(i&&live(i))detail(id);return;}
 rememberScroll();const meta=proposedMeta(i),proposed=i.suggestion.categories;
 showModal('<span class="eyebrow">演示建议 · 人工预设</span><h3 id="dialog-title">建议归入：'+esc(proposed.join('、')||'待补充分类')+'</h3><p class="review-explanation">建议尚未应用。你可以修改，确认后才归类。</p><div class="review-image">'+shotArt(i,true)+'</div><button class="review-zoom" data-action="review-zoom">放大查看图片</button><p class="review-meta-summary"><strong>建议线索</strong> '+(metaFields.filter(([key])=>meta[key]).map(([key,label])=>esc(label)+'：'+esc(meta[key])).join(' · ')||'暂无额外线索')+'</p><details class="review-editor" '+(edit?'open':'')+'><summary>修改建议的分类与线索</summary><fieldset class="category-checks"><legend>确认后使用的分类（可多选）</legend>'+proposedNames(i).map(name=>'<label><input name="review-category" type="checkbox" value="'+esc(name)+'" '+(proposed.some(n=>canonicalName(n)===canonicalName(name))?'checked':'')+'> '+esc(name)+'</label>').join('')+'</fieldset><label for="review-category-name">使用新的分类名称</label><div class="inline-category-create"><div><input id="review-category-name" maxlength="40" placeholder="这里只添加草稿，确认后才创建"><button class="app-btn secondary" data-action="review-add-name">加入建议</button></div></div><div class="metadata-fields">'+metaFields.map(([key,label,placeholder])=>'<label>'+label+'<input data-review-meta="'+key+'" value="'+esc(meta[key]||'')+'" maxlength="80" placeholder="'+placeholder+'"></label>').join('')+'</div></details><p id="review-error" class="form-error" role="alert"></p><small>演示建议人工预设，确认不会删除图片。</small><div class="review-decision"><div class="dialog-actions"><button class="app-btn secondary" data-action="review-defer" data-id="'+id+'">暂不处理</button><button class="app-btn" data-action="review-confirm" data-id="'+id+'">确认归类</button></div><div class="review-secondary"><button data-action="review-edit">修改建议</button><button data-action="close">返回，不应用建议</button></div></div>');
}
function addReviewName(){
 const input=document.getElementById('review-category-name'),message=document.getElementById('review-error'),name=input.value.trim().replace(/\s+/g,' ');
 const existing=[...dialog.querySelectorAll('input[name="review-category"]')].find(el=>canonicalName(el.value)===canonicalName(name));
 if(existing){existing.checked=true;message.textContent='已勾选现有的分类名称。';input.value='';return;}
 const checked=validateCategory(name);if(checked.error){message.textContent=checked.error;return;}
 const label=document.createElement('label'),checkbox=document.createElement('input');
 checkbox.type='checkbox';checkbox.name='review-category';checkbox.value=checked.name;checkbox.checked=true;
 label.append(checkbox,document.createTextNode(' '+checked.name));dialog.querySelector('.category-checks').append(label);
 input.value='';message.textContent='已加入草稿，确认归类后才会创建这个分类。';
}
function checkedReviewNames(names){
 const result=[];
 for(const raw of names){const existing=categories.find(c=>canonicalName(c)===canonicalName(raw));if(existing&&existing!=='待确认'){if(!result.includes(existing))result.push(existing);continue;}const checked=validateCategory(raw);if(checked.error)return {error:checked.error};if(!result.some(n=>canonicalName(n)===canonicalName(checked.name)))result.push(checked.name);}
 return result.length?{names:result}:{error:'请选择至少一个分类，或先暂不处理。'};
}
function applyClassification(i,names,meta,origin='suggestion-confirmed'){
 if(!needsReview(i))return false;const checked=checkedReviewNames(names);if(checked.error)return false;
 const actual=checked.names.map(name=>registerCategory(name,Object.hasOwn(sampleCategories,name)?sampleCategories[name]:['▧','custom']));
 i.categories=unique(actual);for(const [key] of metaFields)i[key]=String(meta[key]||'').trim();
 i.classificationState='confirmed';i.classificationOrigin=origin;i.suggestion=null;return true;
}
function confirmSuggestion(id){
 const i=items.find(i=>i.id===id);if(!i||!hasSuggestion(i))return;
 const names=[...dialog.querySelectorAll('input[name="review-category"]:checked')].map(el=>el.value),checked=checkedReviewNames(names);
 if(checked.error){document.getElementById('review-error').textContent=checked.error;return;}
 const meta=Object.fromEntries([...dialog.querySelectorAll('[data-review-meta]')].map(el=>[el.dataset.reviewMeta,el.value.trim()]));
 if(!applyClassification(i,checked.names,meta))return;
 selected.clear();closeModal();render();notify('已确认归类到「'+i.categories.join('、')+'」，原图和删留状态保持');
}
function deferReview(id,deferred=true){
 const i=items.find(i=>i.id===id);if(!i||!needsReview(i))return;rememberScroll();
 if(deferred&&i.suggestion&&!modal.hidden&&dialog.querySelector('[data-action="review-confirm"]')?.dataset.id===String(id)){
  i.suggestion.categories=unique([...dialog.querySelectorAll('input[name="review-category"]:checked')].map(el=>el.value));
  i.suggestion.meta=Object.fromEntries([...dialog.querySelectorAll('[data-review-meta]')].map(el=>[el.dataset.reviewMeta,el.value.trim()]));
  i.suggestion.draftSaved=true;
 }
 i.classificationState=deferred?'deferred':'pending';selected.delete(id);
 if(!modal.hidden)closeModal();render();notify(deferred?'已放到稍后处理，仍未归类，也没有删除':'已移回待处理，建议仍等待确认');
}
function bulkReview(){
 const targets=selectedSuggestions();if(!targets.length)return;
 showModal('<span class="eyebrow">检查所选建议 · 不自动全选</span><h3 id="dialog-title">确认这 '+targets.length+' 条分类建议？</h3><p>下面每张图只应用所列建议。需要调整时先返回逐张修改；未选中或没有建议的图片不受影响。</p><div class="bulk-review-list">'+targets.map(i=>'<div class="bulk-review-row">'+shotArt(i)+'<div><strong>'+esc(i.title)+'</strong><span>建议：'+esc(i.suggestion.categories.join('、'))+'</span><small>'+esc(Object.values(proposedMeta(i)).filter(Boolean).join(' · ')||'暂无额外线索')+'</small></div></div>').join('')+'</div><small>全部是人工预设的演示建议。确认不会删除图片，也不会处理未选中的内容。</small><div class="dialog-actions"><button class="app-btn secondary" data-action="close">返回选择</button><button class="app-btn" data-action="review-bulk-confirm" data-ids="'+targets.map(i=>i.id).join(',')+'">确认所选 '+targets.length+' 条建议</button></div>');
}
function confirmBulkReview(ids){
 rememberScroll();let completed=0;
 for(const i of items)if(ids.includes(i.id)&&hasSuggestion(i)&&applyClassification(i,i.suggestion.categories,proposedMeta(i)))completed++;
 selected.clear();closeModal();render();notify('已确认 '+completed+' 张；还有 '+items.filter(needsReview).length+' 张未归类');
}
function canonicalName(name){return name.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase();}
function validateCategory(value,oldName=''){
 const name=value.trim().replace(/\s+/g,' '),key=canonicalName(name);
 if(!name)return {error:'请填写一个分类名称。'};
 if(Array.from(name).length>20)return {error:'分类名称最多 20 个字。'};
 if(['全部','待确认'].some(n=>canonicalName(n)===key))return {error:'这个名称用于系统入口，请换一个名称。'};
 if(categories.some(n=>n!==oldName&&canonicalName(n)===key))return {error:'已经有同名分类，请直接使用它，或通过“合并”整理。'};
 return {name};
}
function registerCategory(name,style=['▧','custom']){
 const existing=categories.find(c=>canonicalName(c)===canonicalName(name));
 if(existing)return existing;
 categories.splice(categories.length-1,0,name);info.set(name,style);return name;
}
function categoryManage(){
 showModal('<span class="eyebrow">按你的习惯组织</span><h3 id="dialog-title">管理我的分类</h3><p>分类可以新建、改名和合并。移除分类只移除标签，不会删除原图。</p><button class="app-btn full" data-action="category-new">＋ 新建分类</button><div class="category-manager">'+categories.map(c=>'<div class="category-manager-row"><div><strong>'+esc(c)+'</strong><small>'+allLive().filter(i=>i.categories.includes(c)).length+' 张'+(c==='待确认'?' · 系统兜底':'')+'</small></div>'+(c==='待确认'?'<span class="system-category">保留此入口</span>':'<div class="category-row-actions"><button data-action="category-rename" data-category="'+esc(c)+'">改名</button><button data-action="category-merge" data-category="'+esc(c)+'">合并</button><button data-action="category-remove" data-category="'+esc(c)+'">移除</button></div>')+'</div>').join('')+'</div><small>本次原型的分类与图片都只保留在当前页面，刷新后清空。</small><div class="dialog-actions"><button class="app-btn secondary" data-action="close">完成</button></div>');
}
function categoryEditor(oldName=''){
 if(oldName==='待确认')return;
 showModal('<span class="eyebrow">我的分类</span><h3 id="dialog-title">'+(oldName?'修改分类名称':'新建一个分类')+'</h3><p>'+(oldName?'所有相关图片会同步使用新名称。原图、已有线索和删留状态保持。':'用自己找图时会想到的词命名，例如旅行、项目资料或摄影灵感。')+'</p><label for="category-name">分类名称</label><input id="category-name" class="category-name-input" maxlength="40" autocomplete="off" value="'+esc(oldName)+'" placeholder="输入分类名称"><p class="form-error" id="category-error" role="alert"></p><div class="dialog-actions"><button class="app-btn secondary" data-action="category-manage">返回管理</button><button class="app-btn" data-action="category-save" data-old="'+esc(oldName)+'">'+(oldName?'保存名称':'创建分类')+'</button></div>');
 document.getElementById('category-name').focus();
}
function saveCategory(oldName){
 const checked=validateCategory(document.getElementById('category-name').value,oldName);
 if(checked.error){document.getElementById('category-error').textContent=checked.error;return;}
 const name=checked.name;
 if(oldName){
  if(!categories.includes(oldName)||oldName==='待确认')return;
  categories=categories.map(c=>c===oldName?name:c);
  const style=info.get(oldName);info.delete(oldName);info.set(name,style||['▧','custom']);
  items.forEach(i=>{i.categories=unique(i.categories.map(c=>c===oldName?name:c));if(i.suggestion)i.suggestion.categories=unique(i.suggestion.categories.map(c=>c===oldName?name:c));});
  if(group===oldName)group=name;
 }else registerCategory(name);
 selected.clear();scrollPositions.clear();resetFilters();render();closeModal();
 notify(oldName?'分类已改名，相关图片已同步':'已创建「'+name+'」，可以在图片详情中使用');
}
function categoryMerge(source){
 if(source==='待确认'||!categories.includes(source))return;
 const targets=categories.filter(c=>c!==source&&c!=='待确认');
 showModal('<span class="eyebrow">合并分类</span><h3 id="dialog-title">将「'+esc(source)+'」合并到…</h3><p>属于这个分类的图片会改用目标分类。已有两个标签的同一张图只保留一个目标标签，原图不变。</p>'+(targets.length?'<label for="category-target">目标分类</label><select id="category-target">'+targets.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('')+'</select><div class="dialog-actions"><button class="app-btn secondary" data-action="category-manage">取消</button><button class="app-btn" data-action="category-merge-confirm" data-category="'+esc(source)+'">确认合并</button></div>':'<div class="dialog-warning neutral">还没有其他分类，请先新建一个目标分类。</div><div class="dialog-actions"><button class="app-btn secondary" data-action="category-manage">返回管理</button><button class="app-btn" data-action="category-new">新建分类</button></div>'));
}
function categoryRemove(source){
 if(source==='待确认'||!categories.includes(source))return;
 showModal('<span class="eyebrow">移除分类标签</span><h3 id="dialog-title">移除「'+esc(source)+'」？</h3><p>有其他分类的图片会继续保留那些分类；仅属于此类的图片会回到“待确认”。</p><div class="dialog-warning neutral">不会删除任何图片。这个操作只整理分类入口和标签。</div><div class="dialog-actions"><button class="app-btn secondary" data-action="category-manage">取消</button><button class="app-btn" data-action="category-remove-confirm" data-category="'+esc(source)+'">仅移除分类</button></div>');
}
function relabelCategory(source,target=null){
 if(source==='待确认'||!categories.includes(source)||(target&&(!categories.includes(target)||target===source||target==='待确认')))return;
 items.forEach(i=>{
  if(i.suggestion?.categories.includes(source)){const proposal=unique([...i.suggestion.categories.filter(c=>c!==source),...(target?[target]:[])]);if(proposal.length)i.suggestion.categories=proposal;else i.suggestion=null;}
  if(!i.categories.includes(source))return;
  const next=unique([...i.categories.filter(c=>c!==source&&c!=='待确认'),...(target?[target]:[])]);
  i.categories=next.length?next:['待确认'];if(!next.length)i.classificationState='pending';
 });
 categories=categories.filter(c=>c!==source);info.delete(source);
 if(group===source)group=target||'全部';
 selected.clear();scrollPositions.clear();resetFilters();render();categoryManage();
 notify(target?'分类已合并，图片数量与内容保持不变':'分类已移除，原图保留，无其他分类的图片已回待确认');
}
function inlineNewCategory(){
 const checked=validateCategory(document.getElementById('inline-category-name').value);
 const message=document.getElementById('inline-category-error');
 if(checked.error){message.textContent=checked.error;return;}
 registerCategory(checked.name);
 const label=document.createElement('label'),checkbox=document.createElement('input');
 checkbox.type='checkbox';checkbox.name='item-category';checkbox.value=checked.name;checkbox.checked=true;
 label.append(checkbox,document.createTextNode(' '+checked.name));
 dialog.querySelector('.category-checks').append(label);
 document.getElementById('inline-category-name').value='';
 message.textContent='分类已创建并勾选；保存标签后应用到这张图片。';
 render();
}
function importPrompt(){showModal('<span class="eyebrow">导入截图</span><h3 id="dialog-title">导入后先进入待确认</h3><p>图片只在当前浏览器页面中使用，不上传。刷新或关闭页面后，本次导入和分类记录不会保留。</p><div class="dialog-warning neutral">自己的图片尚无 AI 建议，可手动归类。建议确认流程使用人工预设的演示素材；不会根据文件名假装识别了你的图片。</div><div class="dialog-actions"><button class="app-btn secondary" data-action="close">取消</button><button class="app-btn" data-action="choose-files">选择图片</button></div><button class="app-undo" data-action="load">先体验建议确认演示 →</button>');}
const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='image/png,image/jpeg,image/webp,image/gif';fileInput.multiple=true;fileInput.hidden=true;document.body.append(fileInput);
fileInput.addEventListener('change',async()=>{
const files=[...fileInput.files];fileInput.value='';let added=0,skipped=0,failed=0,nextId=Math.max(1000,...items.map(i=>i.id))+1;
for(const file of files){const fingerprint=[file.name,file.size,file.lastModified].join(':');if(items.some(i=>i.fingerprint===fingerprint)){skipped++;continue;}const url=URL.createObjectURL(file);try{const probe=new Image();probe.src=url;await probe.decode();items.push({id:nextId++,title:file.name.replace(/\.[^.]+$/,''),categories:['待确认'],art:'unknown',text:'你的截图，可以补充分类和查找标签。',date:'本次导入',file,url,fingerprint,status:'pending',isSample:false});added++;}catch{URL.revokeObjectURL(url);failed++;}}
go('review');notify('已导入 '+added+' 张，尚未归类'+(skipped?'；'+skipped+' 张重复已跳过':'')+(failed?'；'+failed+' 张格式无法读取':''));
});
function tagEditor(i){return '<details class="tag-editor"><summary>修改分类与查找标签</summary><fieldset class="category-checks"><legend>分类（可多选）</legend>'+categories.map(c=>'<label><input type="checkbox" name="item-category" value="'+esc(c)+'" '+(i.categories.includes(c)?'checked':'')+'> '+esc(c)+'</label>').join('')+'</fieldset><div class="inline-category-create"><label for="inline-category-name">需要新的分类？</label><div><input id="inline-category-name" maxlength="40" placeholder="输入自己的分类名称"><button class="app-btn secondary" data-action="category-inline-new">新建并勾选</button></div><p id="inline-category-error" class="form-error" role="alert"></p></div><div class="metadata-fields">'+metaFields.map(([key,label,placeholder])=>'<label>'+label+'<input data-meta="'+key+'" value="'+esc(i[key]||'')+'" placeholder="'+placeholder+'" maxlength="80"></label>').join('')+'</div><small>以上线索均可选。不适用的字段留空，分类内只显示已有线索。</small><button class="app-btn full secondary" data-action="save-tags" data-id="'+i.id+'">保存分类与标签</button></details>';}
function detail(id){const i=items.find(i=>i.id===id&&live(i));if(!i)return;rememberScroll();currentDetail=id;showModal('<span class="eyebrow">'+(i.isSample?'虚构示例 / 图片详情':'本次导入 / 图片详情')+'</span><h3 id="dialog-title">'+esc(i.title)+'</h3><div class="detail-tags">'+i.categories.map(c=>'<span>'+esc(c)+'</span>').join('')+'</div>'+(hasSuggestion(i)?'<div class="detail-review-notice"><span>有一条演示分类建议，尚未应用。</span><button data-action="review-suggestion" data-id="'+id+'">检查建议 →</button></div>':'')+'<div class="image-viewport">'+shotArt(i,true)+'</div><div class="zoom-tools"><span>看清图案与文字</span><button data-action="zoom" aria-label="放大图片">放大 150%</button><button data-action="zoom-reset">还原</button></div><p>'+esc(i.text)+'</p>'+tagEditor(i)+'<div class="dialog-actions"><button class="app-btn secondary" data-action="close">返回列表</button><button class="app-btn" data-action="share-preview" data-id="'+id+'">分享图片 ↗</button></div><button class="detail-delete" data-action="delete-one" data-id="'+id+'">不再需要了 · 模拟删除</button>');if(view==='review'&&!hasSuggestion(i))dialog.querySelector('.tag-editor').open=true;}
function saveTags(id){
 const i=items.find(i=>i.id===id);if(!i)return;
 const pendingMeta=i.suggestion?proposedMeta(i):null;
 const checked=[...dialog.querySelectorAll('input[name="item-category"]:checked')].map(e=>e.value),main=checked.filter(c=>c!=='待确认');
 dialog.querySelectorAll('[data-meta]').forEach(e=>{const key=e.dataset.meta,value=e.value.trim();if(pendingMeta&&value!==(i[key]||''))pendingMeta[key]=value;i[key]=value;});
 i.categories=main.length?main:['待确认'];
 if(main.length){i.classificationState='confirmed';i.classificationOrigin='manual';i.suggestion=null;}
 else{if(i.classificationState==='confirmed')i.classificationState='pending';if(i.suggestion){i.suggestion.meta=pendingMeta;i.suggestion.draftSaved=true;}}
 selected.clear();render();closeModal();notify('分类与标签已保存；图片内容和删留状态保持不变');
}
function sharePreview(id){const i=items.find(i=>i.id===id&&live(i));if(!i)return;showModal('<span class="eyebrow">分享前预览</span><h3 id="dialog-title">把这张图分享出去</h3>'+shotArt(i,true)+'<p>'+esc(i.title)+'</p><small>分享后，图片仍留在资料库。等你确认不再需要时，再自行清理。</small><div class="dialog-actions"><button class="app-btn secondary" data-action="detail" data-id="'+id+'">返回详情</button><button class="app-btn" data-action="share-file" data-id="'+id+'">选择分享方式</button></div><button class="app-undo" data-action="download" data-id="'+id+'">'+(i.isSample?'下载示例插画':'下载这张图片')+'</button>');}
function fileFor(i){return i.file||new File([i.originalSVG||sampleSVG(i)],i.title+'.svg',{type:'image/svg+xml'});}
function downloadItem(i){const file=fileFor(i),url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);notify(i.isSample?'已下载虚构示例插画，可自行选择分享':'图片已下载，可自行选择分享');}
async function shareFile(id){const i=items.find(i=>i.id===id&&live(i));if(!i)return;const file=fileFor(i);if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:i.title});notify('已交给系统分享，图片仍保留');}catch(error){if(error.name!=='AbortError')notify('系统分享未完成，可以使用下载图片');}}else notify('当前浏览器无法直接分享此图片，请使用下方的下载图片');}
function applyAction(status,ids=[...selected]){const targets=items.filter(i=>ids.includes(i.id)&&live(i));if(!targets.length)return;rememberScroll();lastAction={ids:targets.map(i=>i.id),previous:targets.map(i=>i.status),action:status};targets.forEach(i=>i.status=status);selected.clear();render();notify(targets.length+' 张已'+(status==='kept'?'保留，仍可在分类中找到':'模拟删除，可撤销'));}
function deletePrompt(ids=[...selected]){const targets=items.filter(i=>ids.includes(i.id)&&live(i));if(!targets.length)return;const returnId=currentDetail;showModal('<span class="eyebrow">由你决定删留</span><h3 id="dialog-title">模拟删除这 '+targets.length+' 张截图？</h3><p>确认已经不再需要这些内容，再继续。</p><div class="dialog-warning">这里只会从本页资料库中移除图片，不会删除你手机或电脑中的原图。分类、分享和时间不会触发自动删除。</div><div class="dialog-actions"><button class="app-btn secondary" data-action="'+(returnId?'detail':'close')+'" data-id="'+(returnId||'')+'">继续检查</button><button class="app-btn danger" data-action="confirm-delete" data-ids="'+targets.map(i=>i.id).join(',')+'">确认模拟删除</button></div>');}
function undo(){if(!lastAction){notify('还没有可撤销的删留操作');return;}const action=lastAction;action.ids.forEach((id,n)=>{const i=items.find(i=>i.id===id);if(i)i.status=action.previous[n];});lastAction=null;selected.clear();render();notify('已撤销，'+action.ids.length+' 张已恢复原状态');}
document.addEventListener('click',e=>{
const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,id=Number(b.dataset.id);
if(action==='review-suggestion'){reviewSuggestion(id);return;}
if(action==='review-confirm'){confirmSuggestion(id);return;}
if(action==='review-add-name'){addReviewName();return;}
if(action==='review-edit'){const editor=dialog.querySelector('.review-editor');if(editor){editor.open=true;dialog.scrollTop=Math.max(0,editor.offsetTop-18);}return;}
if(action==='review-zoom'){const image=dialog.querySelector('.review-image');if(image){const expanded=image.classList.toggle('expanded');b.textContent=expanded?'还原图片预览':'放大查看图片';}return;}
if(action==='review-defer'){deferReview(id);return;}
if(action==='review-resume'){deferReview(id,false);return;}
if(action==='review-state'){rememberScroll();view='review';group='待确认';reviewFilter=b.dataset.state;resetFilters();render();return;}
if(action==='review-pick'){const i=items.find(i=>i.id===id);if(!i||!canConfirmSuggestion(i))return;rememberScroll();selected.has(id)?selected.delete(id):selected.add(id);render();app.querySelector('[data-action="review-pick"][data-id="'+id+'"]')?.focus({preventScroll:true});return;}
if(action==='review-all'){rememberScroll();const targets=visibleItems().filter(canConfirmSuggestion),all=targets.length&&targets.every(i=>selected.has(i.id));selected=all?new Set():new Set(targets.map(i=>i.id));render();return;}
if(action==='review-bulk'){bulkReview();return;}
if(action==='review-bulk-confirm'){confirmBulkReview(b.dataset.ids.split(',').map(Number));return;}
if(action==='category-new'){categoryEditor();return;}
if(action==='category-manage'){categoryManage();return;}
if(action==='category-rename'){categoryEditor(b.dataset.category);return;}
if(action==='category-save'){saveCategory(b.dataset.old||'');return;}
if(action==='category-merge'){categoryMerge(b.dataset.category);return;}
if(action==='category-remove'){categoryRemove(b.dataset.category);return;}
if(action==='category-merge-confirm'){relabelCategory(b.dataset.category,document.getElementById('category-target').value);return;}
if(action==='category-remove-confirm'){relabelCategory(b.dataset.category);return;}
if(action==='category-inline-new'){inlineNewCategory();return;}
if(action==='close'){closeModal();return;}if(action==='load'){closeModal();loadSamples();return;}if(action==='import'){importPrompt();return;}if(action==='choose-files'){closeModal();fileInput.click();return;}
if(action==='view'){go(b.dataset.view);return;}if(action==='category'){go(b.dataset.category==='待确认'?'review':'library',b.dataset.category);return;}if(action==='browse-all'){go('library');return;}
if(action==='facet'){rememberScroll();filters[b.dataset.key]=b.dataset.value;selected.clear();render();return;}if(action==='clear-filters'){rememberScroll();resetFilters();render();return;}
if(action==='detail'){detail(id);return;}if(action==='save-tags'){saveTags(id);return;}if(action==='share-preview'){sharePreview(id);return;}if(action==='share-file'){shareFile(id);return;}
if(action==='download'){const i=items.find(i=>i.id===id&&live(i));if(i)downloadItem(i);return;}
if(action==='zoom'||action==='zoom-reset'){const image=dialog.querySelector('.image-viewport img');if(!image)return;const zoom=action==='zoom-reset'?100:(Number(image.dataset.zoom||100)>=200?100:Number(image.dataset.zoom||100)+50);image.dataset.zoom=zoom;image.style.width=zoom+'%';image.style.maxWidth='none';image.style.height='auto';dialog.querySelector('[data-action="zoom"]').textContent='放大 '+(zoom>=200?100:zoom+50)+'%';return;}
if(action==='pick'){rememberScroll();selected.has(id)?selected.delete(id):selected.add(id);render();return;}if(action==='all'){rememberScroll();const ids=visibleItems().map(i=>i.id),all=ids.length&&ids.every(n=>selected.has(n));selected=all?new Set():new Set(ids);render();return;}
if(action==='keep'){currentDetail=null;applyAction('kept');return;}if(action==='delete'){currentDetail=null;deletePrompt();return;}if(action==='delete-one'){currentDetail=id;deletePrompt([id]);return;}
if(action==='confirm-delete'){const ids=b.dataset.ids.split(',').map(Number);closeModal();applyAction('deleted',ids);currentDetail=null;return;}if(action==='undo'){undo();return;}
if(action==='confirm-reset'){items.forEach(i=>{if(i.url)URL.revokeObjectURL(i.url);});items=[];categories=['待确认'];info.clear();info.set('待确认',['◇','unknown']);reviewFilter='active';lastAction=null;currentDetail=null;scrollPositions.clear();closeModal();go('home');notify('本次图片和分类已重置');}
});
app.addEventListener('change',e=>{if(e.target.id==='group-select')go(view,e.target.value);});
let composingSearch=false;
function updateSearch(target){query=target.value;selected.clear();render();document.getElementById('library-search').focus({preventScroll:true});}
app.addEventListener('compositionstart',e=>{if(e.target.id==='library-search')composingSearch=true;});
app.addEventListener('compositionend',e=>{if(e.target.id==='library-search'){composingSearch=false;updateSearch(e.target);}});
app.addEventListener('input',e=>{if(e.target.id!=='library-search'||composingSearch||e.isComposing)return;updateSearch(e.target);});
document.querySelector('.dialog-close').addEventListener('click',closeModal);document.querySelector('.modal-backdrop').addEventListener('click',closeModal);
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape'){closeModal();return;}if(e.key==='Enter'&&e.target.id==='category-name'){e.preventDefault();saveCategory(dialog.querySelector('[data-action="category-save"]').dataset.old||'');return;}if(e.key==='Enter'&&e.target.id==='inline-category-name'){e.preventDefault();inlineNewCategory();return;}if(e.key==='Enter'&&e.target.id==='review-category-name'){e.preventDefault();addReviewName();return;}if(e.key==='Tab'){const nodes=[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not([hidden]),select,summary,[tabindex="0"]')].filter(el=>el.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){e.preventDefault();first?.focus();}}});
document.getElementById('reset-demo')?.addEventListener('click',()=>{if(!items.length&&categories.length===1){notify('当前已经是初始状态');return;}showModal('<span class="eyebrow">重新开始</span><h3 id="dialog-title">重置本次体验？</h3><p>本页导入的图片、自建分类、标签和删留记录会清空。你的原图不会受影响。</p><div class="dialog-actions"><button class="app-btn secondary" data-action="close">继续当前体验</button><button class="app-btn" data-action="confirm-reset">重置体验</button></div>');});
document.querySelectorAll('[data-guide]').forEach(b=>b.addEventListener('click',()=>{const target=b.dataset.guide;if(target==='manage'){categoryManage();return;}if(target==='home'||target==='clean'){go(target==='clean'?'queue':'home');return;}if(!items.some(i=>i.isSample))loadSamples();go('review');if(target==='travel'||target==='steps')reviewSuggestion(target==='travel'?1:4);}));
const requirements=[
{id:'FR-01',title:'导入后先待确认',priority:'P0',summary:'先展示建议，确认后归类',description:'示例库加载 16 张未归类图片，其中 15 张有人工预设演示建议。个人图片无 AI 建议，进入待确认并支持手动归类。',accept:'导入和加载示例不创建正式分类或应用建议线索；所有图片从待确认或全部可访问；不假装识别了个人图片。'},
{id:'FR-02',title:'自定义分类与多标签',priority:'P0',summary:'按自己的习惯建立入口',description:'用户可新建、改名、合并和移除分类；待确认为系统兜底。示例六类仅在主动载入示例库后出现。一张图可多标签。',accept:'自己的图片不强套示例类；改名和合并同步全部入口；移除分类不删除图片；总数不重复。'},
{id:'FR-03',title:'检查建议与确认归类',priority:'P0',summary:'可修改、稍后或选中一起确认',description:'建议和正式分类分开。可查看图片与线索、修改后确认、暂不处理；多张先显式选择，再预览确认。正式线索确认后才用于分类筛选。',accept:'取消与稍后不归类；新名称草稿确认前不创建；批量只处理选中且有建议的图片；未确认线索不混入正式筛选。'},
{id:'FR-04',title:'详情放大与分享',priority:'P0',summary:'辨认目标后，方便拿来使用',description:'点开详情后可放大、还原、预览分享。支持文件分享时交给系统，不支持时可下载图片。',accept:'返回列表保留分类、筛选与位置；取消分享不删图；分享不支持时有替代入口。'},
{id:'FR-05',title:'分类管理与标签纠错',priority:'P0',summary:'新建、改名、合并与移除',description:'详情可新建并勾选分类，补充自己的关键词。管理中可改名、合并、移除；名称判重，待确认不可移除。',accept:'空名称和重名有提示；合并不复制图片；移除后无其他分类的图回待确认；原图与删留状态保持。'},
{id:'FR-06',title:'分类内文本搜索',priority:'P1',summary:'找不到时，补充关键词',description:'在当前分类按标题、说明和标签匹配关键词。原型没有 OCR、自然语言理解或自动视觉识别。',accept:'范围明确；空结果与空分类区分；清空条件恢复列表。'},
{id:'FR-07',title:'用后清理与撤销',priority:'P1',summary:'独立入口，用户确认删留',description:'默认零选择，支持批量保留、确认模拟删除、撤销最近一次操作。分享或分类不自动删除。',accept:'取消不改状态；仅所选项更新；撤销恢复原状态；分类计数同步。'},
{id:'FR-08',title:'跨会话与真机能力',priority:'P1',summary:'真实 App 的下一阶段验证',description:'相册读取、识别、持久保存、系统分享、真实删除与恢复依赖目标系统验证。网页刷新后清空状态。',accept:'不把演示当作真机能力或识别质量结果；状态与实际能力相符。'}
];
function renderReq(filter='all'){const target=document.getElementById('req-list');if(!target)return;target.innerHTML=requirements.filter(r=>filter==='all'||r.priority===filter).map(r=>'<details><summary><span class="req-id">'+r.id+'</span><span class="req-title">'+r.title+'</span><span class="priority '+(r.priority==='P1'?'p1':'')+'">'+r.priority+'</span><span class="req-summary">'+r.summary+'</span><span class="req-toggle" aria-hidden="true">+</span></summary><div class="req-description"><p>'+r.description+'</p><strong>验收要点</strong><p>'+r.accept+'</p></div></details>').join('');}
document.querySelectorAll('[data-req]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-req]').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});renderReq(b.dataset.req);}));
const sections=[...document.querySelectorAll('section[id]')],navLinks=[...document.querySelectorAll('nav a')];
const mobileMenu=document.querySelector('.mobile-menu');
if(mobileMenu){
 mobileMenu.addEventListener('click',e=>{if(e.target.closest('a[href^="#"]'))mobileMenu.open=false;});
 document.addEventListener('click',e=>{if(mobileMenu.open&&!mobileMenu.contains(e.target))mobileMenu.open=false;});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileMenu.open){mobileMenu.open=false;mobileMenu.querySelector('summary').focus();}});
}
function updateNav(){if(!sections.length)return;let current=sections[0].id;for(const s of sections)if(s.getBoundingClientRect().top<window.innerHeight*.35)current=s.id;for(const a of navLinks){const on=a.hash==='#'+current;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}}
let scrollQueued=false;window.addEventListener('scroll',()=>{if(!scrollQueued){requestAnimationFrame(()=>{updateNav();scrollQueued=false;});scrollQueued=true;}},{passive:true});
render();renderReq();updateNav();
