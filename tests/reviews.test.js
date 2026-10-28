import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze } from '../apps/web/analysis.js';
import { getReview, upsertReview, loadReviews, persistReviews, reviewExport } from '../apps/web/reviews.js';

const record = { id: 'R-1', text: 'I was unsure which step mattered.' };
const finding = analyze(record).find(item => item.constructId === 'uncertainty');
const savedAt = '2026-10-27T18:00:00.000Z';
const reviewed = () => upsertReview([], record, finding, 'Supported', '  Ask what guidance was missing.  ', savedAt);
const memoryStorage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('review decisions survive storage and updates replace the prior decision', () => {
  const storage = memoryStorage();
  const first = persistReviews(storage, reviewed());
  assert.deepEqual(loadReviews(storage), first);
  assert.equal(getReview(first, record, finding).note, 'Ask what guidance was missing.');
  const updated = upsertReview(first, record, finding, 'Uncertain', 'Needs a follow-up.', savedAt);
  assert.equal(updated.length, 1);
  assert.equal(getReview(updated, record, finding).status, 'Uncertain');
});

test('changed source text or evidence requires a fresh review', () => {
  assert.equal(getReview(reviewed(), { ...record, text: `${record.text} New context.` }, finding), null);
  assert.equal(getReview(reviewed(), record, { ...finding, excerpts: [] }), null);
});

test('exports contain only current reviewed findings and preserve evidence offsets', () => {
  const output = reviewExport([record], analyze, reviewed());
  assert.equal(output.schemaVersion, 1);
  assert.equal(output.reviews.length, 1);
  assert.equal(output.reviews[0].status, 'Supported');
  for (const span of output.reviews[0].excerpts) assert.equal(record.text.slice(span.start, span.end).trim(), span.excerpt);
  assert.deepEqual(reviewExport([{ ...record, text: 'No cue.' }], analyze, reviewed()).reviews, []);
});

test('bad decisions, oversized notes, corrupt storage, and blocked storage are handled', () => {
  assert.throws(() => upsertReview([], record, finding, 'Approved by AI', ''), /decision/);
  assert.throws(() => upsertReview([], record, finding, 'Supported', 'x'.repeat(2001)), /2,000/);
  for (const value of ['{', '{}', '[null]', '[{"status":"Supported"}]']) {
    assert.deepEqual(loadReviews({ getItem: () => value }), []);
  }
  assert.deepEqual(loadReviews({ getItem() { throw new Error('denied'); } }), []);
  const existing = reviewed();
  assert.throws(() => persistReviews({ setItem() { throw new Error('quota'); } }, existing), /quota/);
  assert.equal(existing.length, 1);
});
