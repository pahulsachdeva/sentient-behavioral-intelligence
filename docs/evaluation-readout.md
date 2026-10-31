# Authored construct regression evaluation (38 cases)

These examples were written alongside the rules. They are regression probes, not a held-out benchmark or an estimate of field performance.

| Construct | TP | FP | FN | TN | Precision | Recall |
|---|---:|---:|---:|---:|---:|---:|
| effort | 5 | 0 | 0 | 33 | 100.0% | 100.0% |
| uncertainty | 10 | 0 | 0 | 28 | 100.0% | 100.0% |
| control | 3 | 0 | 1 | 34 | 100.0% | 75.0% |
| trust | 3 | 0 | 1 | 34 | 100.0% | 75.0% |
| habit | 2 | 0 | 1 | 35 | 100.0% | 66.7% |
| expectation | 2 | 0 | 1 | 35 | 100.0% | 66.7% |

Abstained on 15/38 records; correctly abstained on 11/11 records expected to have no label.

## Cases to investigate

- **control-paraphrase** (writing): missing control; unexpected none.
- **trust-paraphrase** (study): missing trust; unexpected none.
- **habit-paraphrase** (planning): missing habit; unexpected none.
- **expectation-paraphrase** (study): missing expectation; unexpected none.
