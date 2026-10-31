# Phrase rule checks (38 cases)

I wrote these examples while building the rules. Use them to find mistakes. The scores do not show how well the app works on real interviews.

| Theme | Correct matches | Wrong matches | Missed matches | Correct skips | Precision | Recall |
|---|---:|---:|---:|---:|---:|---:|
| effort | 5 | 0 | 0 | 33 | 100.0% | 100.0% |
| uncertainty | 10 | 0 | 0 | 28 | 100.0% | 100.0% |
| control | 3 | 0 | 1 | 34 | 100.0% | 75.0% |
| trust | 3 | 0 | 1 | 34 | 100.0% | 75.0% |
| habit | 2 | 0 | 1 | 35 | 100.0% | 66.7% |
| expectation | 2 | 0 | 1 | 35 | 100.0% | 66.7% |

Returned no theme for 15/38 conversations. Of the 11 examples expected to have no theme, it correctly skipped 11.

## Cases to investigate

- **control-paraphrase** (writing): missing control; unexpected none.
- **trust-paraphrase** (study): missing trust; unexpected none.
- **habit-paraphrase** (planning): missing habit; unexpected none.
- **expectation-paraphrase** (study): missing expectation; unexpected none.
