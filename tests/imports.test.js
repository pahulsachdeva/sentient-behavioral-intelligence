import test from 'node:test';
import assert from 'node:assert/strict';
import { checkImports, saveImports } from '../apps/web/imports.js';

const row = { id: 'new', account: 'Taylor', role: 'Study', date: '2026-04-01', text: 'A sample.' };
test('a failed save leaves the visible list unchanged', () => {
  let visible = [{ ...row, id: 'old' }];
  const storage = { setItem() { throw new Error('Storage full'); } };
  assert.throws(() => { visible = saveImports(storage, [row], []); }, /Storage full/);
  assert.equal(visible[0].id, 'old');
});
test('imports reject example IDs on both save and reload', () => {
  let writes = 0;
  assert.throws(() => saveImports({ setItem() { writes++; } }, [row], [row]), /already used/);
  assert.throws(() => checkImports([row], [row]), /already used/);
  assert.equal(writes, 0);
});
test('a saved import contains the same records returned to the app', () => {
  let saved;
  const result = saveImports({ setItem(key, value) { saved = JSON.parse(value); } }, [row], []);
  assert.deepEqual(result, saved);
});
