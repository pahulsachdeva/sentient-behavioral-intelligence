/**
 * Exploratory baseline, not a psychological measurement instrument.
 * Keep cue rules inspectable: a future model adapter must preserve the same
 * excerpt + hypothesis + alternative contract and be evaluated separately.
 */
export const constructs = [
  { id: 'effort', label: 'Cognitive effort', color: '#b99aff', cues: [/six screens/i, /which step/i, /checklist/i, /another tab/i, /one more thing/i, /takes time/i, /slow on busy/i], description: 'Reported steps or attention required to use a workflow.', alternative: 'Available time or the choice of task may explain the friction.' },
  { id: 'uncertainty', label: 'Uncertainty', color: '#e6ad7b', cues: [/wasn't sure/i, /unsure/i, /uncertain/i, /wonder if/i, /need to know/i, /unusual request/i, /edge cases/i], description: 'A stated information gap about what will happen or what to do.', alternative: 'The customer may need specific documentation rather than a new product flow.' },
  { id: 'control', label: 'Perceived control', color: '#84c8bd', cues: [/keep my original/i, /review the draft/i, /compare them/i, /draft before/i, /see the edits/i, /step in/i, /test .* safely/i, /paid features/i], description: 'A stated desire to review, intervene, or control the process.', alternative: 'The user may prefer a different writing style or need clearer editing controls.' },
  { id: 'trust', label: 'Trust calibration', color: '#a0aef9', cues: [/verify answers/i, /trust the drafts/i, /think it was broken/i, /real example/i, /seeing the draft/i, /safely/i], description: 'A reported signal of confidence or concern about reliability.', alternative: 'The concern may reflect a specific defect or lack of product information.' },
  { id: 'habit', label: 'Existing routine', color: '#cf9bc9', cues: [/morning routine/i, /daily digest/i, /fits (?:my|our) routine/i, /most days/i, /another dashboard/i], description: 'A stated relationship between usage and an established routine.', alternative: 'The format preference may be driven by workload or channel access.' },
  { id: 'expectation', label: 'Expectation gap', color: '#a4c595', cues: [/thought my writing chats/i, /instantly/i, /nobody explained/i, /delay/i, /sync status/i], description: 'A reported mismatch between expected and observed behavior.', alternative: 'A temporary sync issue may account for the experience.' }
];

/** A record contributes at most one finding per construct. No cue means abstention. */
export function analyze(record) {
  const text = String(record.text || '');
  return constructs.flatMap(construct => {
    const matches = construct.cues.flatMap(pattern => {
      const match = pattern.exec(text);
      if (!match) return [];
      // Retain surrounding language so reviewers can challenge a match in context.
      // Simple punctuation boundaries; abbreviations and multilingual segmentation need separate evaluation.
      const previousBoundary = Math.max(...['.', '!', '?'].map(mark => text.lastIndexOf(mark, match.index - 1)));
      const start = previousBoundary + 1;
      const nextBoundaries = ['.', '!', '?'].map(mark => text.indexOf(mark, match.index + match[0].length)).filter(index => index !== -1);
      const end = nextBoundaries.length ? Math.min(...nextBoundaries) + 1 : text.length;
      return [{ excerpt: text.slice(start, end).trim(), start, end }];
    });
    // Several rules may match the same sentence. Count that sentence once.
    const unique = [...new Map(matches.map(m => [m.excerpt, m])).values()];
    if (!unique.length) return [];
    return [{ id: `${record.id}-${construct.id}`, recordId: record.id, constructId: construct.id, label: construct.label, color: construct.color, excerpts: unique, hypothesis: `This conversation may indicate ${construct.label.toLowerCase()} as an adoption factor.`, alternative: construct.alternative, evidenceLevel: unique.length > 1 ? 'Multiple cues' : 'Single cue', status: 'Needs human review' }];
  });
}

// Counts are descriptive record counts; overlapping labels should never be summed as people.
export function summarize(records) {
  const findings = records.flatMap(analyze);
  const counts = constructs.map(c => ({ ...c, count: findings.filter(f => f.constructId === c.id).length }));
  return { findings, counts, total: records.length, accounts: new Set(records.map(r => r.account)).size };
}

// Templates make the proposed intervention auditable. These are not observed outcomes.
export const experimentTemplates = {
  effort: {
    title: 'Get to the first quiz sooner',
    intervention: 'Let study users paste notes into a starter prompt before completing optional setup.',
    outcome: 'First quiz completion',
    design: 'Randomize new study users to the current introduction or starter prompt. Compare quiz completion, time to completion, and seven-day repeat use.'
  },
  uncertainty: {
    title: 'Show what a useful prompt looks like',
    intervention: 'Offer a worked example for the goal the person chooses: studying, writing, planning, or coding.',
    outcome: 'First successful task completion',
    design: 'Randomize new users to the current empty chat or a relevant example. Track task completion and requests for help.'
  },
  control: {
    title: 'Keep the original beside the rewrite',
    intervention: 'Show suggested edits beside the original and let the user accept changes individually.',
    outcome: 'Completed writing task',
    design: 'Randomize eligible writing sessions to a replacement draft or side-by-side edits. Compare completion, undo actions, and reported control.'
  },
  trust: {
    title: 'Make verification part of the task',
    intervention: 'Explain when to check an answer and show a practical verification step beside study or coding output.',
    outcome: 'Successful task completion with appropriate verification',
    design: 'Randomize eligible users to current guidance or verification guidance. Assess task accuracy and whether users recognize answers that need checking.'
  },
  habit: {
    title: 'Give planning users a reason to return',
    intervention: 'Offer an opt-in morning recap of unfinished plans with a link back to the conversation.',
    outcome: 'Repeat successful planning use within seven days',
    design: 'Randomize consenting planning users to the current experience or morning recap. Track return use, task completion, and notification opt-outs.'
  },
  expectation: {
    title: 'Make saved chats easier to find',
    intervention: 'Show chat save and sync status, with a clear way to resume a session on another device.',
    outcome: 'Successful cross-device conversation resume',
    design: 'Randomize eligible cross-device users to the current history view or resume prompt. Track resumed sessions and missing-chat support contacts.'
  }
};

export function recommendations(records) {
  const { findings, counts } = summarize(records);
  return counts.filter(c => c.count).sort((a, b) => b.count - a.count).map(c => ({ ...c, ...experimentTemplates[c.id], evidence: findings.filter(f => f.constructId === c.id).slice(0, 3), hypothesis: `If ${c.label.toLowerCase()} is a barrier for this audience, the proposed change may improve the stated outcome. This remains untested.` }));
}

/** Reject rollover dates such as February 30 while preserving YYYY-MM-DD input. */
function isCalendarDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

/** Bound input size for the browser demo and return only fields the app understands. */
export function validateImport(value) {
  if (!Array.isArray(value) || value.length > 500) throw new Error('Import a JSON array of at most 500 conversations.');
  const ids = new Set();
  return value.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error(`Row ${index + 1}: expected an object.`);
    for (const key of ['id', 'account', 'role', 'date', 'text']) if (typeof item[key] !== 'string' || !item[key].trim()) throw new Error(`Row ${index + 1}: ${key} is required.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !isCalendarDate(item.date)) throw new Error(`Row ${index + 1}: use a valid YYYY-MM-DD date.`);
    if (item.text.length > 12000) throw new Error(`Row ${index + 1}: text exceeds 12,000 characters.`);
    if (ids.has(item.id)) throw new Error(`Row ${index + 1}: duplicate ID.`);
    ids.add(item.id);
    return { id: item.id, account: item.account, role: item.role, date: item.date, text: item.text, channel: String(item.channel || 'Imported'), stage: String(item.stage || 'Unspecified'), imported: true };
  });
}
