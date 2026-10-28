// Reviews are separate from machine findings: a human decision never changes cue counts.
export const reviewStatuses = ['Supported', 'Not supported', 'Uncertain'];
export const reviewStorageKey = 'sentient-reviews-v1';

// Bind a decision to the exact source and evidence, not just a reusable import ID.
export function evidenceKey(record, finding) {
  return JSON.stringify([record.id, record.text, finding.constructId, finding.excerpts]);
}

export function getReview(reviews, record, finding) {
  return reviews.find(review => review.sourceKey === evidenceKey(record, finding)) || null;
}

export function upsertReview(reviews, record, finding, status, note, reviewedAt = new Date().toISOString()) {
  if (!reviewStatuses.includes(status)) throw new Error('Choose a review decision.');
  if (typeof note !== 'string' || note.trim().length > 2000) throw new Error('Keep review notes within 2,000 characters.');
  const review = { recordId: record.id, constructId: finding.constructId, sourceKey: evidenceKey(record, finding), status, note: note.trim(), reviewedAt };
  return [...reviews.filter(item => !(item.recordId === record.id && item.constructId === finding.constructId)), review];
}

export function loadReviews(storage) {
  try {
    const value = JSON.parse(storage.getItem(reviewStorageKey) || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter(item => item && typeof item.recordId === 'string' && typeof item.constructId === 'string'
      && typeof item.sourceKey === 'string' && reviewStatuses.includes(item.status)
      && typeof item.note === 'string' && item.note.length <= 2000
      && typeof item.reviewedAt === 'string' && !Number.isNaN(Date.parse(item.reviewedAt)));
  } catch { return []; }
}

export function persistReviews(storage, value) {
  // Callers replace in-memory state only after this succeeds (quota/access errors can throw).
  storage.setItem(reviewStorageKey, JSON.stringify(value));
  return value;
}

export function reviewExport(records, analyze, reviews) {
  return { schemaVersion: 1, kind: 'Sentient evidence reviews', reviews: records.flatMap(record => analyze(record).flatMap(finding => {
    const review = getReview(reviews, record, finding);
    return review ? [{ recordId: record.id, constructId: finding.constructId, excerpts: finding.excerpts, status: review.status, note: review.note, reviewedAt: review.reviewedAt }] : [];
  })) };
}
