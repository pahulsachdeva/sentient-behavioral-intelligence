# Evaluation

## Engineering checks

Run `npm test` to check evidence spans, abstention, record counts, experiment plans, and import validation. Run `npm run check` to check JavaScript syntax.

Every evidence span must point to the original text. Several phrase matches in the same interview should contribute only one count per construct. An unrelated sentence should produce no interpretation. Evidence excerpts stop at the nearest period, question mark, or exclamation mark; abbreviations and multilingual segmentation still need evaluation. Import dates must be real calendar dates, including leap-day rules.

## Construct regression readout

Run `npm run evaluate` to regenerate a Markdown readout from the 30 authored cases in `data/evaluation/construct-cases.json`. Each case has a synthetic consumer-assistant utterance, an expected set of labels, and a use-case slice. The script evaluates each record against all six constructs and reports true positives, false positives, false negatives, true negatives, precision, and recall per construct. A denominator of zero is shown as undefined, never as 100%. It also counts abstentions and names mismatched cases so a reviewer can inspect them. The test suite checks the arithmetic and rejects duplicate IDs or labels.

The case set deliberately includes positives, no-signal examples, overlapping labels, resolved uncertainty, and paraphrases outside the current rules. The last group remains visible as misses; a high score on examples authored during development would be misleading. The two narrow additions for “too many clicks” and “can't tell which” came from this analysis. Other paraphrases remain open research questions. There is no threshold here that makes the system ready for consequential use.

The evaluation unit is a conversation record × construct, not a person. For a given construct, precision is TP/(TP+FP), recall is TP/(TP+FN), and abstention is the number of records with no predicted labels. “Correct abstention” uses records expected to have no labels. These definitions follow the standard classification metric convention; the report is intentionally descriptive and does not calculate uncertainty intervals on this small authored set. See [scikit-learn's metric reference](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_fscore_support.html) for the formulas.

## What to evaluate next

The phrase rules need a broader set of independently reviewed examples. Useful cases include paraphrases, negation, ambiguous language, and interviews with no clear signal. Reviewers should code whether the excerpt supports the label and whether a different explanation is more plausible.

Split future evaluation data by person before tuning the rules, so follow-ups from the same person do not appear on both sides. Report precision, recall, abstention, and reviewer disagreement by construct.

## Measuring a product change

The experiment plans describe work to run next. For the study onboarding example, assign eligible new users at random, define quiz completion before starting, and inspect repeat study use and appropriate verification alongside the primary outcome. Interview themes help select that test; product events would supply its results.


## Evidence review workflow

In Evidence Explorer or a conversation drawer, choose Supported, Not supported, or Uncertain and record reasoning or a follow-up question. Save the review, then filter the evidence list by status. The review remains visible after reload and is included in Export reviews. These judgments do not alter machine cue counts or establish causal effects.

Reviews bind to the exact source text, construct, and evidence spans. Reusing an import ID with changed text or changing the evidence requires a fresh review. Exports omit stale decisions. Tests cover save/reload, replacement, changed-source invalidation, source spans in exports, invalid storage, and storage failures.


## Uncertainty regression cases

`data/evaluation/uncertainty-cases.json` contains 14 authored examples covering explicit resolution, active uncertainty, two starting-task paraphrases, unrelated statements, substring matches, and mixed resolved/current mentions. Expected labels are developer-authored regression expectations, not independent reviewer judgments or a benchmark accuracy claim.

The baseline incorrectly matched “not unsure” and “no longer uncertain,” missed “I don't know where to start,” and matched the substring in “uncertainty estimation.” Rules now exclude a narrow set of directly negated uncertainty adjectives, include the starting-task paraphrases, and inspect later occurrences after a resolved first mention. “Not sure” remains a signal. Cue counts still use one record per construct.

This does not solve negation across clauses, quoted speech, sarcasm, double negation, or arbitrary paraphrases. An independent review set and disagreement reporting remain next steps before broader claims about precision or recall.
