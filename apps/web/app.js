import { analyze, constructs, recommendations, summarize, validateImport } from './analysis.js';

const app = document.getElementById('app');
// Keep the authored fixture separate from imports so clearing browser data never removes the demo.
let demo = [];
let imported = [];
let section = 'Overview';
let selected = null;
let query = '';
let stage = 'All stages';
let sort = 'Newest';
let page = 1;
let activeConstruct = 'all';
let notice = '';
const nav = ['Overview', 'Conversations', 'Behavioral Insights', 'Evidence Explorer', 'Experiments', 'Research Workspace'];
const icons = { Overview: '◫', Conversations: '≡', 'Behavioral Insights': '◈', 'Evidence Explorer': '⌕', Experiments: '◇', 'Research Workspace': '▤' };
// Source text is untrusted, including local imports. Escape it at the HTML rendering boundary.
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const all = () => [...demo, ...imported];
const date = value => new Date(value + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const chip = (label, color = '#a78bfa') => `<span class="chip" style="--chip:${color}"><span class="chip-dot"></span>${esc(label)}</span>`;
const sectionHeading = (eyebrow, title, description, action = '') => `<div class="heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
const findRecord = id => all().find(r => r.id === id);
function shell() {
  app.innerHTML = `<div class="shell"><aside class="sidebar"><div class="brand"><img src="/assets/mark.svg" alt=""><div><strong>Sentient</strong><small>AI ENABLEMENT MARKETER</small></div></div><div class="workspace-label">WORKSPACE <span class="workspace-tag">DEMO</span></div><nav aria-label="Main navigation">${nav.map(n => `<button class="nav-item ${section === n ? 'active' : ''}" data-nav="${n}"><span class="nav-icon">${icons[n]}</span>${n}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="source-card"><span class="source-icon">✳</span><div><strong>Practice workspace</strong><span>Consumer AI assistant</span></div></div><a class="sidebar-link" href="/docs/methodology.md" target="_blank">Methodology <span>↗</span></a></div></aside><div class="main"><header class="topbar"><div class="crumb">WORKSPACE <span>/</span> <b>${esc(section)}</b></div><div class="top-actions"><span class="demo-pill"><span class="live-dot"></span> EXAMPLE WORKSPACE</span><button class="avatar" title="Demo workspace" aria-label="Demo workspace">S</button></div></header><main id="content"></main><footer>Sentient · Customer understanding, education, and adoption</footer></div></div><div id="drawer-root"></div><div id="toast-root" role="status" aria-live="polite"></div>`;
  app.querySelectorAll('[data-nav]').forEach(button => button.addEventListener('click', () => { section = button.dataset.nav; selected = null; page = 1; render(); }));
  content();
  if (selected) drawer(selected);
  if (notice) { document.getElementById('toast-root').textContent = notice; setTimeout(() => { notice = ''; const el = document.getElementById('toast-root'); if (el) el.textContent = ''; }, 4000); }
}
function render() { shell(); }
function content() {
  const root = document.getElementById('content');
  ({ Overview: overview, Conversations: conversations, 'Behavioral Insights': insights, 'Evidence Explorer': evidence, Experiments: experiments, 'Research Workspace': research })[section](root);
  root.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { selected = b.dataset.open; drawer(selected); }));
  root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { section = b.dataset.go; render(); }));
}
function overview(root) {
  const data = summarize(all());
  const top = [...data.counts].sort((a, b) => b.count - a.count).slice(0, 4);
  const recent = [...all()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  root.innerHTML = `${sectionHeading('INTELLIGENCE OVERVIEW', 'From conversation to clarity.', 'Understand what helps people get started, use an AI assistant, and return.', '<button class="button primary" data-go="Conversations">Explore conversations <span>↗</span></button>')}
  <div class="disclaimer"><span>✳</span><div><strong>The case study: a consumer AI assistant</strong><p>Follow five people using AI to study, write, plan, and learn to code.</p></div><a href="/docs/methodology.md" target="_blank">How analysis works ↗</a></div>
  <div class="metrics"><div class="metric"><span>CONVERSATIONS</span><strong>${data.total.toString().padStart(2, '0')}</strong><small>Across ${data.accounts} example users</small><i>↗</i></div><div class="metric"><span>EVIDENCE-LINKED HYPOTHESES</span><strong>${data.findings.length.toString().padStart(2, '0')}</strong><small>Each traceable to an excerpt</small><i>◇</i></div><div class="metric"><span>BEHAVIORAL CONSTRUCTS</span><strong>${data.counts.filter(c => c.count).length.toString().padStart(2, '0')}</strong><small>Questions for follow-up</small><i>◈</i></div><div class="metric"><span>TESTABLE IDEAS</span><strong>${recommendations(all()).length.toString().padStart(2, '0')}</strong><small>Ideas ready to investigate</small><i>↗</i></div></div>
  <div class="grid-main"><section class="panel"><div class="panel-head"><div><div class="eyebrow">SIGNAL DISTRIBUTION</div><h2>Recurring themes</h2></div><button class="text-link" data-go="Behavioral Insights">View insights ↗</button></div><p class="panel-sub">Conversation counts with at least one matching cue. One interview can touch on several themes.</p><div class="bar-list">${top.map(c => `<div class="bar-row"><div class="bar-label"><span class="swatch" style="background:${c.color}"></span>${c.label}</div><div class="bar-track"><span style="width:${Math.round(c.count / Math.max(1, data.total) * 100)}%;background:${c.color}"></span></div><strong>${c.count.toString().padStart(2, '0')}</strong></div>`).join('')}</div><div class="panel-foot">Open an interview to see what prompted each interpretation.</div></section><section class="panel workflow"><div class="panel-head"><div><div class="eyebrow">FROM INSIGHT TO ACTION</div><h2>Research workflow</h2></div></div><div class="flow-list"><div><b>01</b><span><strong>Listen</strong><small>Read the customer's own words.</small></span></div><div><b>02</b><span><strong>Interpret</strong><small>Review a possible mechanism and alternative.</small></span></div><div><b>03</b><span><strong>Test</strong><small>Design a measurable intervention.</small></span></div></div><button class="text-link" data-go="Experiments">Explore experiment ideas <span>↗</span></button></section></div>
  <section class="panel recent"><div class="panel-head"><div><div class="eyebrow">LATEST RECORDS</div><h2>Recent conversations</h2></div><button class="text-link" data-go="Conversations">View all ↗</button></div><div class="table-wrap"><table><thead><tr><th>PERSON / USE CASE</th><th>STAGE</th><th>BEHAVIORAL SIGNALS</th><th>DATE</th><th></th></tr></thead><tbody>${recent.map(r => `<tr><td><strong>${esc(r.account)}</strong><small>${esc(r.role)}</small></td><td>${esc(r.stage)}</td><td>${analyze(r).slice(0, 2).map(f => chip(f.label, f.color)).join('') || '<span class="muted">Insufficient evidence</span>'}</td><td>${date(r.date)}</td><td><button class="row-arrow" data-open="${esc(r.id)}" aria-label="Open ${esc(r.id)}">↗</button></td></tr>`).join('')}</tbody></table></div></section>`;
}
// Apply filters before pagination; otherwise a search would only inspect the visible page.
function filtered() {
  let records = all().filter(r => `${r.account} ${r.role} ${r.text} ${r.id}`.toLowerCase().includes(query.toLowerCase()) && (stage === 'All stages' || r.stage === stage));
  records.sort((a, b) => sort === 'Oldest' ? a.date.localeCompare(b.date) : sort === 'Name A–Z' ? a.account.localeCompare(b.account) : b.date.localeCompare(a.date));
  return records;
}
function conversations(root) {
  const rows = filtered(); const pages = Math.max(1, Math.ceil(rows.length / 7)); page = Math.min(page, pages);
  root.innerHTML = `${sectionHeading('CONVERSATION LIBRARY', 'The voice behind the data.', 'Read user interviews and follow-ups, or import a JSON file with your own examples.', '<button class="button primary" id="import-button">＋ Import JSON</button><input type="file" id="import-file" accept="application/json,.json" hidden>')}
  <div class="toolbar"><label class="search"><span>⌕</span><input id="search" type="search" placeholder="Search conversations, people, or phrases" value="${esc(query)}" aria-label="Search conversations"></label><select id="stage" aria-label="Filter by stage">${['All stages', ...new Set(all().map(r => r.stage))].map(s => `<option ${s === stage ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select><select id="sort" aria-label="Sort conversations">${['Newest', 'Oldest', 'Name A–Z'].map(s => `<option ${s === sort ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
  <section class="panel"><div class="list-head"><span>${rows.length} CONVERSATIONS</span><span>SELECT A ROW TO INSPECT EVIDENCE</span></div><div class="conversation-list">${rows.slice((page - 1) * 7, page * 7).map(r => `<button class="conversation-row" data-open="${esc(r.id)}"><span class="record-icon">▤</span><span class="record-main"><strong>${esc(r.account)} <em>· ${esc(r.role)}</em></strong><small>${esc(r.text)}</small></span><span class="record-meta">${date(r.date)}<small>${esc(r.channel)}</small></span><span class="row-arrow">↗</span></button>`).join('') || '<div class="empty">No matching conversations. Try another search or filter.</div>'}</div><div class="pagination"><span>Page ${page} of ${pages}</span><div><button id="prev" ${page === 1 ? 'disabled' : ''}>← Previous</button><button id="next" ${page === pages ? 'disabled' : ''}>Next →</button></div></div></section><p class="helper">Imported records stay in this browser only. Avoid uploading sensitive or private conversations.</p>`;
  root.querySelector('#search').addEventListener('input', e => { query = e.target.value; page = 1; const pos = e.target.selectionStart; conversations(root); const input = root.querySelector('#search'); input.focus(); input.setSelectionRange(pos, pos); });
  root.querySelector('#stage').addEventListener('change', e => { stage = e.target.value; page = 1; conversations(root); });
  root.querySelector('#sort').addEventListener('change', e => { sort = e.target.value; conversations(root); });
  root.querySelector('#prev').addEventListener('click', () => { page--; conversations(root); });
  root.querySelector('#next').addEventListener('click', () => { page++; conversations(root); });
  root.querySelector('#import-button').addEventListener('click', () => root.querySelector('#import-file').click());
  root.querySelector('#import-file').addEventListener('change', async e => { try { const parsed = validateImport(JSON.parse(await e.target.files[0].text())); const existing = new Set(demo.map(r => r.id)); if (parsed.some(r => existing.has(r.id))) throw new Error('An imported ID matches a demo record. Use unique IDs.'); imported = parsed; localStorage.setItem('sentient-import-v1', JSON.stringify(imported)); notice = `${parsed.length} conversation${parsed.length === 1 ? '' : 's'} imported locally.`; render(); } catch (error) { notice = `Import failed: ${error.message}`; render(); } });
  root.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { selected = b.dataset.open; drawer(selected); }));
}
// Timelines preserve reported chronology only. They deliberately avoid a causal improvement score.
function insights(root) {
  const { counts } = summarize(all());
  const accounts = [...new Set(all().map(r => r.account))];
  root.innerHTML = `${sectionHeading('BEHAVIORAL INSIGHTS', 'Patterns worth investigating.', 'Transparent cue counts and account timelines help prioritize research questions.')}
  <div class="insight-grid">${counts.map(c => `<article class="insight-card"><div class="insight-top"><span class="signal-icon" style="--signal:${c.color}">◈</span><span>${c.count} RECORD${c.count === 1 ? '' : 'S'}</span></div><h2>${c.label}</h2><p>${c.description}</p><div class="mini-bar"><span style="width:${c.count / Math.max(1, all().length) * 100}%;background:${c.color}"></span></div><button data-construct="${c.id}">Inspect evidence ↗</button></article>`).join('')}</div><section class="panel timeline"><div class="panel-head"><div><div class="eyebrow">LONGITUDINAL VIEW</div><h2>Follow the same person over time</h2></div></div><p class="panel-sub">See how each person describes the product on later visits. Open a touchpoint to read the conversation.</p><div class="account-grid">${accounts.map(account => { const rows = all().filter(r => r.account === account).sort((a, b) => a.date.localeCompare(b.date)); return `<div class="account-line"><h3>${esc(account)} <span>${rows.length} touchpoints</span></h3><div class="time-points">${rows.map(r => `<button data-open="${esc(r.id)}"><span class="point"></span><b>${date(r.date)}</b><small>${esc(r.stage)}</small></button>`).join('')}</div></div>`; }).join('')}</div></section>`;
  root.querySelectorAll('[data-construct]').forEach(b => b.addEventListener('click', () => { activeConstruct = b.dataset.construct; section = 'Evidence Explorer'; render(); }));
}
function evidence(root) {
  const findings = all().flatMap(analyze).filter(f => activeConstruct === 'all' || f.constructId === activeConstruct);
  root.innerHTML = `${sectionHeading('EVIDENCE EXPLORER', 'Trace every interpretation.', 'Each candidate signal links to the exact source sentence, an alternative explanation, and a human review status.')}
  <div class="filter-chips">${[{ id: 'all', label: 'All signals' }, ...constructs].map(c => `<button class="filter-chip ${activeConstruct === c.id ? 'chosen' : ''}" data-filter="${c.id}">${c.label}</button>`).join('')}</div><div class="evidence-list">${findings.map(f => { const r = findRecord(f.recordId); return `<article class="evidence-card"><div class="evidence-header"><div>${chip(f.label, f.color)} <span>${esc(r.account)} · ${date(r.date)}</span></div><span class="review-state">◌ ${f.status}</span></div><h3>${esc(f.hypothesis)}</h3><blockquote>“${esc(f.excerpts[0].excerpt)}”</blockquote><div class="evidence-footer"><span>${f.evidenceLevel} · Rule-based cue</span><span>Alternative: ${esc(f.alternative)}</span></div><button data-open="${esc(r.id)}">Read full conversation ↗</button></article>`; }).join('') || '<div class="empty">No cues found in this category. Treat this as insufficient evidence.</div>'}</div>`;
  root.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { activeConstruct = b.dataset.filter; evidence(root); }));
}
function experiments(root) {
  const ideas = recommendations(all());
  root.innerHTML = `${sectionHeading('EXPERIMENT STUDIO', 'Turn signals into tests.', 'Start with a user problem, propose a change, and decide what a useful test would measure.')}
  <div class="experiment-intro"><span>◇</span><div><strong>Hypothesis, then measurement</strong><p>Each plan connects an interview theme to a product or education change and an outcome to measure.</p></div></div><div class="experiment-grid">${ideas.map((idea, i) => `<article class="experiment-card"><div class="experiment-number">EXPERIMENT ${String(i + 1).padStart(2, '0')} <span>${idea.count} linked records</span></div><h2>${idea.title}</h2>${chip(idea.label, idea.color)}<div class="experiment-fields"><div><small>HYPOTHESIS</small><p>${esc(idea.hypothesis)}</p></div><div><small>INTERVENTION</small><p>${esc(idea.intervention)}</p></div><div><small>PRIMARY OUTCOME</small><p>${esc(idea.outcome)}</p></div><div><small>TEST DESIGN</small><p>${esc(idea.design)}</p></div></div><button class="text-link" data-example="${idea.evidence[0]?.recordId}">Inspect supporting conversation ↗</button></article>`).join('')}</div>`;
  root.querySelectorAll('[data-example]').forEach(b => b.addEventListener('click', () => { selected = b.dataset.example; drawer(selected); }));
}
function research(root) {
  root.innerHTML = `${sectionHeading('RESEARCH WORKSPACE', 'A transparent analytical frame.', 'Use this space to understand what the demo can and cannot infer from customer language.')}
  <div class="research-layout"><section class="panel"><div class="eyebrow">METHOD</div><h2>Interpretation pipeline</h2><div class="method-step"><b>01</b><div><strong>Source record</strong><p>An interview with a person, use case, date, and source text.</p></div></div><div class="method-step"><b>02</b><div><strong>Transparent cue match</strong><p>Inspectable phrase rules surface one or more candidate constructs, with the exact sentence retained.</p></div></div><div class="method-step"><b>03</b><div><strong>Human interpretation</strong><p>Each hypothesis includes an alternative. A researcher should confirm meaning with follow-up questions.</p></div></div><div class="method-step"><b>04</b><div><strong>Experiment proposal</strong><p>A test design and outcome make the idea falsifiable. It is not a claim of causal impact.</p></div></div></section><section class="panel"><div class="eyebrow">LIMITATIONS</div><h2>What the signals mean</h2><ul class="limitation-list"><li>Counts are conversations with matching cues, not prevalence estimates.</li><li>A phrase can have different meanings in different contexts.</li><li>Multiple themes can occur in one record.</li><li>Start with the example interviews, then review the rules against a broader sample.</li><li>Repeated records show reported change; they do not prove why it happened.</li><li>Imported data stays in local browser storage; clear it from this workspace below.</li></ul><button class="button secondary" id="clear-import">Clear imported records</button><div class="doc-links"><a href="/docs/methodology.md" target="_blank">Read methodology ↗</a><a href="/docs/evaluation.md" target="_blank">Read evaluation ↗</a></div></section></div>`;
  root.querySelector('#clear-import').addEventListener('click', () => { imported = []; localStorage.removeItem('sentient-import-v1'); notice = 'Imported records cleared.'; render(); });
}
function drawer(id) {
  const r = findRecord(id); if (!r) return;
  const findings = analyze(r);
  const root = document.getElementById('drawer-root');
  root.innerHTML = `<div class="scrim" id="scrim"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="Conversation ${esc(r.id)}"><div class="drawer-head"><span>CONVERSATION / ${esc(r.id)}</span><button id="close-drawer" aria-label="Close conversation">×</button></div><div class="drawer-body"><div class="eyebrow">SOURCE RECORD · ${r.imported ? 'IMPORTED' : 'EXAMPLE INTERVIEW'}</div><h2>${esc(r.account)}</h2><p class="drawer-byline">${esc(r.role)} · ${esc(r.channel)} · ${date(r.date)}</p><div class="drawer-section"><h3>Customer statement</h3><blockquote>“${esc(r.text)}”</blockquote></div><div class="drawer-section"><h3>Questions for follow-up <span>${findings.length}</span></h3>${findings.map(f => `<div class="drawer-finding">${chip(f.label, f.color)}<p>${esc(f.hypothesis)}</p><small>SUPPORTING EXCERPT</small><blockquote>“${esc(f.excerpts[0].excerpt)}”</blockquote><small>ALTERNATIVE EXPLANATION</small><p>${esc(f.alternative)}</p><div class="review-state">◌ Needs human review · ${f.evidenceLevel}</div></div>`).join('') || '<p class="muted">Insufficient evidence for the current cue rules. No psychological interpretation is assigned.</p>'}</div></div></aside>`;
  const close = () => { selected = null; root.innerHTML = ''; document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  root.querySelector('#scrim').addEventListener('click', close); root.querySelector('#close-drawer').addEventListener('click', close); document.addEventListener('keydown', onKey); root.querySelector('#close-drawer').focus();
}
// Storage can be stale or edited outside the app. Revalidate on load and fall back to the fixture.
try { imported = validateImport(JSON.parse(localStorage.getItem('sentient-import-v1') || '[]')); } catch { imported = []; localStorage.removeItem('sentient-import-v1'); }
fetch('/data/synthetic/conversations.json').then(r => { if (!r.ok) throw new Error('Data unavailable'); return r.json(); }).then(records => { demo = records; render(); }).catch(() => { app.innerHTML = '<div class="load-error">Demo data could not load. Refresh the page or run <code>npm start</code>.</div>'; });
