import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyze, constructs } from '../apps/web/analysis.js';

export const fixturePath = new URL('../data/evaluation/construct-cases.json', import.meta.url);

export function evaluate(cases, labels = constructs.map(item => item.id)) {
  const ids = new Set();
  const allowed = new Set(labels);
  if (!Array.isArray(cases) || !cases.length || !labels.length || allowed.size !== labels.length) {
    throw new Error('Provide nonempty cases and unique labels.');
  }
  const rows = cases.map(item => {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) || typeof item.text !== 'string' || !Array.isArray(item.expected)) {
      throw new Error(`Invalid or duplicate evaluation case: ${item?.id ?? '(missing id)'}`);
    }
    ids.add(item.id);
    if (new Set(item.expected).size !== item.expected.length || item.expected.some(label => !allowed.has(label))) {
      throw new Error(`Unknown or duplicate expected label in ${item.id}`);
    }
    const predicted = analyze(item).map(finding => finding.constructId);
    return { id: item.id, slice: item.slice ?? 'unspecified', expected: item.expected, predicted,
      missing: item.expected.filter(label => !predicted.includes(label)),
      unexpected: predicted.filter(label => !item.expected.includes(label)) };
  });

  const byLabel = labels.map(label => {
    const tp = rows.filter(row => row.expected.includes(label) && row.predicted.includes(label)).length;
    const fp = rows.filter(row => !row.expected.includes(label) && row.predicted.includes(label)).length;
    const fn = rows.filter(row => row.expected.includes(label) && !row.predicted.includes(label)).length;
    const tn = rows.length - tp - fp - fn;
    return { label, tp, fp, fn, tn, precision: tp + fp ? tp / (tp + fp) : null,
      recall: tp + fn ? tp / (tp + fn) : null };
  });
  const negatives = rows.filter(row => !row.expected.length);
  return { cases: rows.length, byLabel,
    abstention: { predicted: rows.filter(row => !row.predicted.length).length,
      correct: negatives.filter(row => !row.predicted.length).length, eligible: negatives.length },
    errors: rows.filter(row => row.missing.length || row.unexpected.length) };
}

function formatRate(value) { return value === null ? '—' : `${(value * 100).toFixed(1)}%`; }

export function markdown(report) {
  const lines = [
    `# Authored construct regression evaluation (${report.cases} cases)`, '',
    'These examples were written alongside the rules. They are regression probes, not a held-out benchmark or an estimate of field performance.', '',
    '| Construct | TP | FP | FN | TN | Precision | Recall |', '|---|---:|---:|---:|---:|---:|---:|',
    ...report.byLabel.map(row => `| ${row.label} | ${row.tp} | ${row.fp} | ${row.fn} | ${row.tn} | ${formatRate(row.precision)} | ${formatRate(row.recall)} |`), '',
    `Abstained on ${report.abstention.predicted}/${report.cases} records; correctly abstained on ${report.abstention.correct}/${report.abstention.eligible} records expected to have no label.`, '',
    '## Cases to investigate', ''
  ];
  lines.push(...(report.errors.length ? report.errors.map(row => `- **${row.id}** (${row.slice}): missing ${row.missing.join(', ') || 'none'}; unexpected ${row.unexpected.join(', ') || 'none'}.`) : ['No mismatches in this authored set.']));
  return lines.join('\n') + '\n';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))) {
  const cases = JSON.parse(readFileSync(fixturePath, 'utf8'));
  process.stdout.write(markdown(evaluate(cases)));
}
