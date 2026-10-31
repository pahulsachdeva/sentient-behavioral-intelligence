import { validateImport } from './analysis.js';

export const importStorageKey = 'sentient-import-v1';

export function checkImports(value, demo) {
  const records = validateImport(value);
  const demoIds = new Set(demo.map(record => record.id));
  if (records.some(record => demoIds.has(record.id))) {
    throw new Error('One of these IDs is already used by an example conversation. Choose a different ID.');
  }
  return records;
}

export function saveImports(storage, value, demo) {
  const records = checkImports(value, demo);
  // The app changes the visible records only after this write succeeds.
  storage.setItem(importStorageKey, JSON.stringify(records));
  return records;
}
