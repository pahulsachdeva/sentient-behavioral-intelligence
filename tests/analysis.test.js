import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze, recommendations, summarize, validateImport } from '../apps/web/analysis.js';

const records = JSON.parse(readFileSync(new URL('../data/synthetic/conversations.json', import.meta.url)));
test('every displayed finding traces to an exact source excerpt', () => {
  for (const record of records) for (const finding of analyze(record)) {
    assert.ok(finding.excerpts.length);
    for (const evidence of finding.excerpts) {
      assert.equal(record.text.slice(evidence.start, evidence.end).trim(), evidence.excerpt);
      assert.ok(finding.alternative);
      assert.equal(finding.status, 'Needs human review');
    }
  }
});
test('unsupported text has no inferred construct', () => {
  assert.deepEqual(analyze({ id: 'X', text: 'We spoke on Tuesday.' }), []);
});
test('counts use records rather than repeated cue matches', () => {
  const result = summarize(records);
  assert.equal(result.total, 12);
  assert.equal(result.accounts, 5);
  for (const count of result.counts) assert.equal(count.count, result.findings.filter(f => f.constructId === count.id).length);
});
test('every experiment has a supported cue and no fabricated outcome', () => {
  for (const idea of recommendations(records)) {
    assert.ok(idea.evidence.length);
    assert.ok(idea.design.includes('Randomiz') || idea.design.includes('randomiz') || idea.design.includes('Assign'));
    assert.match(idea.hypothesis, /untested/);
  }
});
test('import validation rejects malformed, duplicate, and oversize input', () => {
  const good = { id: 'I-1', account: 'Fictional Co', role: 'Manager', date: '2026-03-01', text: 'A sample.' };
  assert.equal(validateImport([good])[0].imported, true);
  assert.throws(() => validateImport([good, good]), /duplicate/);
  assert.throws(() => validateImport([{ ...good, text: '' }]), /text/);
  assert.throws(() => validateImport([{ ...good, date: 'yesterday' }]), /date/);
  assert.throws(() => validateImport(Array(501).fill(good)), /500/);
});

test('evidence stops at the nearest sentence punctuation', () => {
  const record = { id: 'P', text: 'We spoke yesterday! I was unsure what to do? The next task was fine.' };
  const finding = analyze(record).find(item => item.constructId === 'uncertainty');
  assert.deepEqual(finding.excerpts.map(item => item.excerpt), ['I was unsure what to do?']);
  assert.equal(record.text.slice(finding.excerpts[0].start, finding.excerpts[0].end).trim(), finding.excerpts[0].excerpt);
});

test('import dates must exist on the calendar, including leap years', () => {
  const row = { id: 'I-2', account: 'Taylor', role: 'Study', date: '2024-02-29', text: 'A sample.' };
  assert.equal(validateImport([row])[0].date, '2024-02-29');
  for (const date of ['2026-02-29', '2026-02-30', '2026-04-31', '2026-13-01', '0000-01-01']) {
    assert.throws(() => validateImport([{ ...row, date }]), /valid YYYY-MM-DD/);
  }
});


const uncertaintyCases = JSON.parse(readFileSync(new URL('../data/evaluation/uncertainty-cases.json', import.meta.url)));
test('authored uncertainty cases distinguish resolution, paraphrases, and unrelated text', () => {
  for (const record of uncertaintyCases) {
    assert.deepEqual(analyze(record).map(finding => finding.constructId).sort(), [...record.expected].sort(), record.id);
  }
});
test('a resolved first mention does not hide later uncertainty or contaminate its evidence', () => {
  const record = uncertaintyCases.find(record => record.id === 'resolved-then-new');
  const finding = analyze(record).find(finding => finding.constructId === 'uncertainty');
  assert.deepEqual(finding.excerpts.map(item => item.excerpt), ['I am unsure about billing.']);
  assert.equal(summarize([record]).counts.find(item => item.id === 'uncertainty').count, 1);
});

test('typographic apostrophes preserve original evidence and resolution behavior', () => {
  const record = { id: 'unicode', text: 'I wasn’t unsure about setup. I don’t know where to find billing.' };
  const findings = analyze(record);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].excerpts.length, 1);
  assert.equal(findings[0].excerpts[0].excerpt, 'I don’t know where to find billing.');
  for (const span of findings[0].excerpts) assert.equal(record.text.slice(span.start, span.end).trim(), span.excerpt);
  for (const item of ["I wasn't sure.", 'I wasn’t sure.', 'I wasn‘t sure.']) {
    assert.deepEqual(analyze({ id: 'same', text: item }).map(f => f.constructId), ['uncertainty']);
  }
});
