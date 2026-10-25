'use strict';
const categories = ['学习资料','生活收藏','分享记录','待确认'];
const seed = [
 {id:1,title:'AI 学习笔记',category:'学习资料',kicker:'LEARNING NOTES',headline:'理解上下文，\n再理解回答。',text:'学习笔记 · 先理解问题，再整理关键观点。',date:'今天'},
 {id:2,title:'产品阅读摘录',category:'学习资料',kicker:'READ & REFLECT',headline:'好的问题，\n是设计的开始。',text:'产品阅读摘录 · 需求与方案需要分开讨论。',date:'昨天'},
 {id:3,title:'周末餐厅收藏',category:'生活收藏',kicker:'WEEKEND PLAN',headline:'周末，\n去吃点好吃的。',text:'虚构的餐厅收藏 · 周末散步与用餐计划。',date:'昨天'},
 {id:4,title:'旅行路线备忘',category:'生活收藏',kicker:'A LITTLE JOURNEY',headline:'慢一点，\n看看沿途风景。',text:'旅行备忘 · 散步路线、出发前需要查看的信息。',date:'前天'},
 {id:5,title:'发给朋友的路线',category:'分享记录',kicker:'SHARED MOMENT',headline:'路线发你啦，\n路上慢慢走。',text:'分享过的路线示例 · 是否用完仍由用户决定。',date:'前天'},
 {id:6,title:'临时沟通截图',category:'分享记录',kicker:'A QUICK MESSAGE',headline:'这条消息，\n已经分享过。',text:'虚构的沟通记录 · 分享过不代表可以直接删除。',date:'3 天前'},
 {id:7,title:'一张混合内容截图',category:'待确认',kicker:'TAKE ANOTHER LOOK',headline:'用途不确定，\n留给你决定。',text:'无法明确归类的示例，可能需要手动确认用途。',date:'3 天前'},
 {id:8,title:'收藏的设计配色',category:'生活收藏',kicker:'COLOR INSPIRATION',headline:'一点灵感，\n留给下一次创作。',text:'设计灵感与配色示例 · 默认生活收藏，可按实际用途改类。',date:'4 天前'}
];
let items=[], imported=false, view='queue', group='全部', query='', selected=new Set(), lastAction=null, toastTimer, priorFocus;
const app=document.getElementById('phone-app');
const modal=document.getElementById('modal');
const dialog=document.querySelector('.dialog');
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const artClass=c=>({'学习资料':'learn','生活收藏':'life','分享记录':'share','待确认':'unknown'}[c]);
const statusCount=s=>items.filter(i=>i.status===s).length;
function notify(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3200)}
function shotArt(item){return `<div class="shot-art ${artClass(item.category)}"><small>${item.kicker}</small><strong>${item.headline.split('\n').join('<br>')}</strong><div class="art-decor"></div><em>虚构演示素材</em></div>`}
function baseItems(){return items.filter(i=>i.status===(view==='queue'?'pending':'kept'))}
function visibleItems(){const q=query.trim().toLowerCase();return baseItems().filter(i=>(group==='全部'||i.category===group)&&(!q||`${i.title} ${i.text} ${i.category}`.toLowerCase().includes(q)))}
function showModal(html){priorFocus=document.activeElement;document.getElementById('dialog-content').innerHTML=html;modal.hidden=false;document.body.style.overflow='hidden';dialog.focus()}
function closeModal(){modal.hidden=true;document.body.style.overflow='';if(priorFocus?.isConnected)priorFocus.focus();else document.getElementById('reset-demo').focus()}
function tabs(){return `<div class="app-tabs"><button data-action="view" data-view="queue" class="${view==='queue'?'current':''}" aria-pressed="${view==='queue'}">▧ 待整理 ${statusCount('pending')}</button><button data-action="view" data-view="library" class="${view==='library'?'current':''}" aria-pressed="${view==='library'}">▤ 保留库 ${statusCount('kept')}</button></div>`}
function cards(){return visibleItems().map(i=>`<article class="screenshot-card ${selected.has(i.id)?'picked':''}"><button class="card-select" data-action="pick" data-id="${i.id}" aria-label="选择${i.title}" aria-pressed="${selected.has(i.id)}"><span class="card-check">${selected.has(i.id)?'✓':''}</span>${shotArt(i)}<span class="card-label">${i.title}</span></button><div class="card-footer"><span>${i.date} · ${i.category}</span><button data-action="detail" data-id="${i.id}" aria-label="查看${i.title}">查看 ↗</button></div></article>`).join('')}
function render(){
 if(!imported){app.innerHTML=`<div class="phone-head"><div class="phone-title"><h3>拾序</h3><span class="pill purple">演示</span></div></div><div class="app-scroll import-screen"><div class="import-logo">▧</div><h3>给截图，<br>留一点有序的空间。</h3><p>不用逐张从头翻起，<br>先从一组相近的内容开始。</p><div class="import-benefits"><div><b>01</b>收集新增，避免重复整理</div><div><b>02</b>按组查看，由你决定删留</div><div><b>03</b>分错可以改，误选可以取消</div></div></div><div class="app-bottom"><button class="app-btn full" data-action="import">开始整理 · 导入 8 张示例</button><p class="import-tip">虚构素材演示 · 无需真实相册权限</p></div>`;return}
 const pending=statusCount('pending'),kept=statusCount('kept'),deleted=statusCount('deleted'),list=visibleItems();
 let body='';
 if(view==='queue'&&pending===0){body=`<div class="queue-empty"><span>✓</span><h3>这一批，整理好了。</h3><p>每一次取舍，都是一点轻松。</p><div class="result-mini"><strong>${kept}</strong> 张已保留 · <strong>${deleted}</strong> 张模拟删除</div><button class="app-btn secondary" data-action="view" data-view="library">去看看保留内容 →</button></div>`}
 else{
 body=`${view==='queue'?`<div class="app-stats"><div><strong>${pending}</strong>张待整理<small>示例内容已分组，默认不勾选</small></div><span>✦ ${kept} 已保留</span></div>`:`<input class="library-search" id="library-search" type="search" placeholder="搜索标题、内容或分类" aria-label="搜索保留内容" value="${escapeHTML(query)}">`}
 <div class="group-tabs" role="group" aria-label="截图分组">${['全部',...categories].map(c=>`<button data-action="group" data-group="${c}" class="${group===c?'current':''}" aria-pressed="${group===c}">${c}${c==='全部'?'':` ${baseItems().filter(i=>i.category===c).length}`}</button>`).join('')}</div>
 <div class="selection-row"><span>${list.length} 张 · 已选 ${selected.size}</span><div>${view==='queue'&&selected.size?'<button data-action="bulk-category">改类</button>　':''}<button data-action="all" ${list.length?'':'disabled'}>${list.length&&list.every(i=>selected.has(i.id))?'取消全选':'本组全选'}</button></div></div>
 ${list.length?`<div class="screenshot-grid">${cards()}</div>`:`<div class="library-empty"><p>${view==='library'&&kept===0?'还没有保留内容。<br>回到待整理，选几张想留下的。':'当前条件下没有截图。'}</p><button data-action="clear-filters">清空筛选</button></div>`}`
 }
 app.innerHTML=`<div class="phone-head"><div class="phone-title"><h3>${view==='queue'?'待整理':'保留库'}</h3><button data-action="${view==='queue'?'check':'view'}" data-view="queue">${view==='queue'?'检查新增':'返回整理'}</button></div><p>${view==='queue'?'相近的内容，一起看更清楚。':'保留下来的内容，也可以重新归类。'}</p></div><div class="app-scroll">${body}</div><div class="app-bottom">${view==='queue'&&pending?`<small>已选 ${selected.size} 张 · 删留由你确认</small><div class="phone-actions"><button class="app-btn danger" data-action="delete" ${selected.size?'':'disabled'}>删除 ${selected.size} 张</button><button class="app-btn" data-action="keep" ${selected.size?'':'disabled'}>保留 ${selected.size} 张</button></div>`:view==='library'?`<button class="app-btn full secondary" data-action="bulk-category" ${selected.size?'':'disabled'}>修改已选 ${selected.size} 张的分类</button>`:''}${lastAction?`<button class="app-undo" data-action="undo">↶ 撤销上次${lastAction.action==='kept'?'保留':'模拟删除'}（${lastAction.ids.length} 张）</button>`:''}${tabs()}</div>`;
}
function importPrompt(){if(imported){notify('示例已导入，可继续整理或重置演示');return}showModal(`<span class="eyebrow">DEMO / 示例导入</span><h3 id="dialog-title">先了解访问范围</h3><p>真实 App 应在读取相册前说明用途、访问范围以及是否上传。拒绝或有限授权时，也应如实说明可用范围。</p><div class="dialog-warning neutral">本次仅加载 8 张虚构演示卡片，不会请求相册权限，也不会上传你的照片。</div><small>此处为访问说明示意，真实系统授权流程需真机验证。</small><div class="dialog-actions"><button class="app-btn secondary" data-action="close">暂不导入</button><button class="app-btn" data-action="load">加载示例 →</button></div>`)}
function load(){items=seed.map(i=>({...i,status:'pending'}));imported=true;view='queue';group='全部';query='';selected.clear();lastAction=null;closeModal();render();notify('已导入 8 张示例，尚未选中任何截图')}
function detail(id){const i=items.find(i=>i.id===id);if(!i)return;showModal(`<span class="eyebrow">SCREENSHOT / 示例详情</span><h3 id="dialog-title">${i.title}</h3>${shotArt(i)}<p>${i.text}</p><label for="category-select">按你的用途修改分类</label><select id="category-select">${categories.map(c=>`<option ${c===i.category?'selected':''}>${c}</option>`).join('')}</select><small>分类与删留是独立判断；修改分类不会自动删除。</small><div class="dialog-actions"><button class="app-btn secondary" data-action="close">返回</button><button class="app-btn" data-action="save-category" data-id="${id}">保存分类</button></div>`)}
function bulkCategory(){if(!selected.size){notify('请先选择需要修改的截图');return}showModal(`<span class="eyebrow">QUICK CORRECTION</span><h3 id="dialog-title">修改 ${selected.size} 张截图的分类</h3><p>按实际用途调整，用户的修正优先。删留状态保持不变。</p><label for="category-select">选择分类</label><select id="category-select">${categories.map(c=>`<option>${c}</option>`).join('')}</select><div class="dialog-actions"><button class="app-btn secondary" data-action="close">取消</button><button class="app-btn" data-action="save-category" data-id="bulk">确认改类</button></div>`)}
function applyAction(status){if(!selected.size)return;const targets=items.filter(i=>selected.has(i.id)&&i.status==='pending');if(!targets.length)return;lastAction={ids:targets.map(i=>i.id),previous:targets.map(i=>i.status),action:status};for(const i of targets)i.status=status;selected.clear();render();notify(`${targets.length} 张已${status==='kept'?'加入保留库':'模拟删除'}，可撤销最近一次操作`)}
function deletePrompt(){if(!selected.size)return;showModal(`<span class="eyebrow">YOUR DECISION MATTERS</span><h3 id="dialog-title">模拟删除这 ${selected.size} 张截图？</h3><p>先确认这些内容确实不再需要。相近内容或分类结果，都不等于它们已经用完。</p><div class="dialog-warning">这里仅改变演示卡片状态，不会删除真实图片。真实 App 需遵守系统删除确认与恢复机制。</div><div class="dialog-actions"><button class="app-btn secondary" data-action="close">继续检查</button><button class="app-btn danger" data-action="confirm-delete">确认模拟删除</button></div>`)}
function undo(){if(!lastAction){notify('还没有可以撤销的删留操作');return}const a=lastAction;a.ids.forEach((id,n)=>{const i=items.find(i=>i.id===id);if(i)i.status=a.previous[n]});lastAction=null;selected.clear();group='全部';query='';view='queue';render();notify(`已撤销，${a.ids.length} 张回到待整理`)}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,id=Number(b.dataset.id);
 if(action==='import'){importPrompt();return}if(action==='close'){closeModal();return}if(action==='load'){load();return}
 if(action==='pick'){const scroll=app.querySelector('.app-scroll')?.scrollTop||0;selected.has(id)?selected.delete(id):selected.add(id);render();app.querySelector('.app-scroll').scrollTop=scroll;app.querySelector(`[data-action="pick"][data-id="${id}"]`)?.focus({preventScroll:true});return}
 if(action==='all'){const ids=visibleItems().map(i=>i.id),all=ids.length&&ids.every(id=>selected.has(id));selected=all?new Set():new Set(ids);render();return}
 if(action==='group'){const had=selected.size;group=b.dataset.group;selected.clear();render();if(had)notify('已切换分组，选择已清空');return}
 if(action==='view'){view=b.dataset.view;group='全部';query='';selected.clear();render();return}
 if(action==='clear-filters'){group='全部';query='';selected.clear();render();return}
 if(action==='check'){notify('演示中的 8 张已全部导入，没有新增截图');return}
 if(action==='detail'){detail(id);return}if(action==='bulk-category'){bulkCategory();return}
 if(action==='save-category'){const c=document.getElementById('category-select').value;const targets=b.dataset.id==='bulk'?items.filter(i=>selected.has(i.id)):items.filter(i=>i.id===id);targets.forEach(i=>i.category=c);selected.clear();if(group!=='全部'&&group!==c)group='全部';closeModal();render();notify(`${targets.length} 张已改为「${c}」`);return}
 if(action==='keep'){applyAction('kept');return}if(action==='delete'){deletePrompt();return}if(action==='confirm-delete'){closeModal();applyAction('deleted');return}if(action==='undo'){undo();return}
 if(action==='confirm-reset'){imported=false;items=[];lastAction=null;view='queue';selected.clear();group='全部';query='';closeModal();render();notify('演示已重置');return}
});
app.addEventListener('input',e=>{if(e.target.id!=='library-search')return;query=e.target.value;selected.clear();const pos=e.target.selectionStart;render();const search=document.getElementById('library-search');search.focus();try{search.setSelectionRange(pos,pos)}catch{}});
document.querySelector('.dialog-close').addEventListener('click',closeModal);
document.querySelector('.modal-backdrop').addEventListener('click',closeModal);
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape'){closeModal();return}if(e.key==='Tab'){const focusable=[...dialog.querySelectorAll('button:not(:disabled),a[href],select,input,[tabindex="0"]')];const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last?.focus()}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){e.preventDefault();first?.focus()}}});
document.getElementById('reset-demo').addEventListener('click',()=>{if(!imported){notify('当前已经是初始状态');return}showModal('<span class="eyebrow">START AGAIN</span><h3 id="dialog-title">重新开始这一轮演示？</h3><p>当前的删留、分类和撤销记录将清空。可以重新加载全部 8 张虚构示例。</p><div class="dialog-actions"><button class="app-btn secondary" data-action="close">继续当前演示</button><button class="app-btn" data-action="confirm-reset">重置演示</button></div>')});
document.querySelectorAll('[data-guide]').forEach(b=>b.addEventListener('click',()=>{const g=b.dataset.guide;if(g==='import'){importPrompt();return}if(!imported){importPrompt();return}if(g==='undo'){undo();return}view=g==='library'?'library':'queue';group='全部';query='';selected.clear();render();if(g==='library')notify('在保留库打开详情，或选择后批量改类')}));
const requirements=[
 {id:'FR-01',title:'授权与访问说明',priority:'P0',summary:'说明用途，尊重访问范围',description:'授权前说明读取范围、处理方式与用途。拒绝、有限授权和权限被撤回都有明确反馈。',accept:'四种权限状态均不虚报导入成功；真实系统入口与可访问范围通过真机验证。'},
 {id:'FR-02',title:'新增收集与去重',priority:'P0',summary:'打开后检查，已处理不重复',description:'检查新增截图加入队列，展示进度；已完成项不重复入队，中断和单项失败可重试。',accept:'重复打开不会重复入队；中断后已完成结果不丢失；单项失败不阻塞全部。'},
 {id:'FR-03',title:'内容分组与原图查看',priority:'P0',summary:'分组帮助查看，不代替价值判断',description:'根据内容提出分类，支持查看原图；低把握或识别失败的内容进入待确认，不隐藏。',accept:'可访问图片均能找到；分组计数一致；待确认项可以手动处理。'},
 {id:'FR-04',title:'批量选择与删留',priority:'P0',summary:'默认不选，删除前再确认',description:'支持本组全选、取消选择与明确的选中计数。切组清空选择；真实删除需用户确认与系统能力支持。',accept:'零选中禁用动作；取消确认不改变状态；仅成功项更新结果，失败项可重试。'},
 {id:'FR-05',title:'快速纠错与结果反馈',priority:'P0',summary:'用户修正优先，结果清楚可查',description:'支持单张和批量改类，用户分类优先。显示成功与失败结果；原型可撤销最近一次删留，真机恢复边界另行验证。',accept:'改类不改变删留状态；统计与结果一致；不能恢复时明确说明实际途径。'},
 {id:'FR-06',title:'保留内容基础归类',priority:'P0',summary:'留下的内容，分组仍可修改',description:'保留内容进入分类视图，允许后续单张或批量修正用途。保留只是退出待整理队列，不表示复制多份图片。',accept:'保留后从待整理移除；保留库可找到；分类修改在详情和列表保持一致。'},
 {id:'FR-07',title:'文本搜索与分类筛选',priority:'P1',summary:'验证留存需求后增强检索',description:'按标题、标签和识别文本搜索保留内容，支持分类筛选。原型用虚构文本演示，不代表 OCR 已接入。',accept:'搜索与筛选范围清楚；无结果可清空条件；不修改原始内容。'},
 {id:'FR-08',title:'跨会话恢复与历史',priority:'P1',summary:'支持再次打开后的连续整理',description:'在核心链路有效后增强任务恢复、历史记录与多轮导入。此网页演示不持久保存会话状态。',accept:'再次打开时状态可解释，不重复执行删除；外部资源变化有反馈。'}
];
function renderReq(filter='all'){document.getElementById('req-list').innerHTML=requirements.filter(r=>filter==='all'||r.priority===filter).map(r=>`<details><summary><span class="req-id">${r.id}</span><span class="req-title">${r.title}</span><span class="priority ${r.priority==='P1'?'p1':''}">${r.priority}</span><span class="req-summary">${r.summary}</span><span class="req-toggle" aria-hidden="true">+</span></summary><div class="req-description"><p>${r.description}</p><strong>验收要点</strong><p>${r.accept}</p></div></details>`).join('')}
document.querySelectorAll('[data-req]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-req]').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on))});renderReq(b.dataset.req)}));
const sections=[...document.querySelectorAll('section[id]')],navLinks=[...document.querySelectorAll('nav a')];
function updateNav(){let current=sections[0].id;for(const s of sections){if(s.getBoundingClientRect().top<window.innerHeight*.35)current=s.id}for(const a of navLinks){const active=a.hash===`#${current}`;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}}
let scrollQueued=false;window.addEventListener('scroll',()=>{if(!scrollQueued){requestAnimationFrame(()=>{updateNav();scrollQueued=false});scrollQueued=true}},{passive:true});
render();renderReq();updateNav();
