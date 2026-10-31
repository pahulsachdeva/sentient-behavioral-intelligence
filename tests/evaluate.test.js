import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluate, fixturePath, markdown } from '../scripts/evaluate.js';
import { constructs } from '../apps/web/analysis.js';

const cases = JSON.parse(readFileSync(fixturePath, 'utf8'));

test('evaluation accounts for each record once per construct and exposes misses', () => {
  const result = evaluate(cases);
  assert.equal(result.cases, cases.length);
  assert.deepEqual(result.byLabel.map(row => row.label), constructs.map(item => item.id));
  for (const row of result.byLabel) {
    assert.equal(row.tp + row.fp + row.fn + row.tn, result.cases);
    assert.equal(row.precision, row.tp + row.fp ? row.tp / (row.tp + row.fp) : null);
    assert.equal(row.recall, row.tp + row.fn ? row.tp / (row.tp + row.fn) : null);
  }
  assert.equal(result.abstention.eligible, cases.filter(item => !item.expected.length).length);
  assert.ok(result.errors.some(row => row.id === 'habit-paraphrase' && row.missing.includes('habit')));
  assert.match(markdown(result), /Cases to investigate/);
});

test('undefined rates are shown as such, not as perfect scores', () => {
  const result = evaluate([{ id: 'empty', text: 'We met.', expected: [] }], ['effort']);
  assert.deepEqual(result.byLabel[0], { label: 'effort', tp: 0, fp: 0, fn: 0, tn: 1, precision: null, recall: null });
  assert.match(markdown(result), /\| effort \| 0 \| 0 \| 0 \| 1 \| — \| — \|/);
});

test('fixture errors cannot silently distort the denominators', () => {
  assert.throws(() => evaluate([]), /nonempty/);
  assert.throws(() => evaluate([{ id: 'a', text: '', expected: [] }, { id: 'a', text: '', expected: [] }]), /duplicate/);
  assert.throws(() => evaluate([{ id: 'a', text: '', expected: ['unknown'] }]), /Unknown/);
  assert.throws(() => evaluate([{ id: 'a', text: '', expected: ['effort', 'effort'] }]), /duplicate/);
});

test('new phrase cues retain source spans and avoid incidental substrings', () => {
  const text = "There are too many clicks. I can't tell which option to choose.";
  const result = evaluate([{ id: 'phrases', text, expected: ['effort', 'uncertainty'] }]);
  assert.equal(result.errors.length, 0);
  assert.deepEqual(evaluate([{ id: 'neutral', text: 'The clicks report helps us tell which team owns it.', expected: [] }]).errors, []);
});

test('false positives and false negatives use distinct denominators', () => {
  const result = evaluate([
    { id: 'tp', text: 'It takes time.', expected: ['effort'] },
    { id: 'fp', text: 'It takes time.', expected: [] },
    { id: 'fn', text: 'Too much work.', expected: ['effort'] },
    { id: 'tn', text: 'We met.', expected: [] }
  ]);
  const row = result.byLabel.find(item => item.label === 'effort');
  assert.deepEqual(row, { label: 'effort', tp: 1, fp: 1, fn: 1, tn: 1, precision: 0.5, recall: 0.5 });
  assert.equal(result.errors.length, 2);
  assert.throws(() => evaluate(cases, ['made-up']), /Unknown/);
});
