export const constructs = [
  { id: 'effort', label: 'Cognitive effort', color: '#b99aff', cues: [/six screens/i, /which step/i, /checklist/i, /another tab/i, /one more thing/i, /takes time/i, /slow on busy/i], description: 'Reported steps or attention required to use a workflow.', alternative: 'A process or staffing constraint may explain the friction.' },
  { id: 'uncertainty', label: 'Uncertainty', color: '#e6ad7b', cues: [/wasn't sure/i, /unsure/i, /uncertain/i, /wonder if/i, /need to know/i, /unusual request/i, /edge cases/i], description: 'A stated information gap about what will happen or what to do.', alternative: 'The customer may need specific documentation rather than a new product flow.' },
  { id: 'control', label: 'Perceived control', color: '#84c8bd', cues: [/approves? the replies/i, /review them first/i, /review queue/i, /draft before/i, /handoff/i, /step in/i, /test .* safely/i, /approval queue/i], description: 'A stated desire to review, intervene, or control the process.', alternative: 'Approval requirements may come from organizational policy.' },
  { id: 'trust', label: 'Trust calibration', color: '#a0aef9', cues: [/trust the workflow/i, /trust the drafts/i, /think it was broken/i, /real example/i, /seeing the draft/i, /safely/i], description: 'A reported signal of confidence or concern about reliability.', alternative: 'The concern may reflect a specific defect or lack of product information.' },
  { id: 'habit', label: 'Existing routine', color: '#cf9bc9', cues: [/morning routine/i, /daily digest/i, /fits our routine/i, /most days/i, /another dashboard/i], description: 'A stated relationship between usage and an established routine.', alternative: 'The format preference may be driven by workload or channel access.' },
  { id: 'expectation', label: 'Expectation gap', color: '#a4c595', cues: [/thought the dashboard/i, /instantly/i, /nobody explained/i, /delay/i, /sync status/i], description: 'A reported mismatch between expected and observed behavior.', alternative: 'A temporary sync issue may account for the experience.' }
];

export function analyze(record) {
  const text = String(record.text || '');
  return constructs.flatMap(construct => {
    const matches = construct.cues.flatMap(pattern => {
      const match = pattern.exec(text);
      if (!match) return [];
      const start = Math.max(0, text.lastIndexOf('.', match.index - 1) + 1);
      const endIndex = text.indexOf('.', match.index + match[0].length);
      const end = endIndex === -1 ? text.length : endIndex + 1;
      return [{ excerpt: text.slice(start, end).trim(), start, end }];
    });
    const unique = [...new Map(matches.map(m => [m.excerpt, m])).values()];
    if (!unique.length) return [];
    return [{ id: `${record.id}-${construct.id}`, recordId: record.id, constructId: construct.id, label: construct.label, color: construct.color, excerpts: unique, hypothesis: `This conversation may indicate ${construct.label.toLowerCase()} as an adoption factor.`, alternative: construct.alternative, evidenceLevel: unique.length > 1 ? 'Multiple cues' : 'Single cue', status: 'Needs human review' }];
  });
}

export function summarize(records) {
  const findings = records.flatMap(analyze);
  const counts = constructs.map(c => ({ ...c, count: findings.filter(f => f.constructId === c.id).length }));
  return { findings, counts, total: records.length, accounts: new Set(records.map(r => r.account)).size };
}

export const experimentTemplates = {
  effort: { title: 'Shorter activation path', intervention: 'Offer a three-step setup checklist to new users.', outcome: 'Setup completion within seven days', design: 'Randomize eligible new accounts to current onboarding or checklist; compare completion rates.' },
  uncertainty: { title: 'Just-in-time guidance', intervention: 'Show contextual examples at the decision point.', outcome: 'First successful workflow completion', design: 'Randomize eligible users to current guidance or examples; measure completion and support contacts.' },
  control: { title: 'Review-first onboarding', intervention: 'Let teams approve initial drafts before enabling automation.', outcome: 'Pilot activation rate', design: 'Assign comparable new accounts to standard setup or review-first flow; monitor activation and time cost.' },
  trust: { title: 'Transparent preview', intervention: 'Show a sample output and explain the review and escalation controls.', outcome: 'Qualified trial activation', design: 'Randomize onboarding visitors to current or preview experience; track activation and reported confidence separately.' },
  habit: { title: 'Routine-aligned delivery', intervention: 'Offer a daily digest alongside the dashboard.', outcome: 'Weekly active usage', design: 'Randomize pilot teams to dashboard-only or dashboard plus digest; track usage and notification fatigue.' },
  expectation: { title: 'Visible sync state', intervention: 'Show sync timing and a clear ready notification.', outcome: 'Support contacts about missing records', design: 'Roll out to randomized eligible accounts; compare support contacts and record engagement.' }
};

export function recommendations(records) {
  const { findings, counts } = summarize(records);
  return counts.filter(c => c.count).sort((a, b) => b.count - a.count).map(c => ({ ...c, ...experimentTemplates[c.id], evidence: findings.filter(f => f.constructId === c.id).slice(0, 3), hypothesis: `If ${c.label.toLowerCase()} is a barrier for this audience, the proposed change may improve the stated outcome. This remains untested.` }));
}

export function validateImport(value) {
  if (!Array.isArray(value) || value.length > 500) throw new Error('Import a JSON array of at most 500 conversations.');
  const ids = new Set();
  return value.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error(`Row ${index + 1}: expected an object.`);
    for (const key of ['id', 'account', 'role', 'date', 'text']) if (typeof item[key] !== 'string' || !item[key].trim()) throw new Error(`Row ${index + 1}: ${key} is required.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number.isNaN(Date.parse(item.date))) throw new Error(`Row ${index + 1}: use YYYY-MM-DD for date.`);
    if (item.text.length > 12000) throw new Error(`Row ${index + 1}: text exceeds 12,000 characters.`);
    if (ids.has(item.id)) throw new Error(`Row ${index + 1}: duplicate ID.`);
    ids.add(item.id);
    return { id: item.id, account: item.account, role: item.role, date: item.date, text: item.text, channel: String(item.channel || 'Imported'), stage: String(item.stage || 'Unspecified'), imported: true };
  });
}
