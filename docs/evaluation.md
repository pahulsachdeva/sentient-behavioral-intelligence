# Evaluation

## Engineering checks

Run `npm test` to check evidence spans, abstention, record counts, experiment plans, and import validation. Run `npm run check` to check JavaScript syntax.

Every evidence span must point to the original text. Several phrase matches in the same interview should contribute only one count per construct. An unrelated sentence should produce no interpretation. Evidence excerpts stop at the nearest period, question mark, or exclamation mark; abbreviations and multilingual segmentation still need evaluation. Import dates must be real calendar dates, including leap-day rules.

## What to evaluate next

The phrase rules need a broader set of independently reviewed examples. Useful cases include paraphrases, negation, ambiguous language, and interviews with no clear signal. Reviewers should code whether the excerpt supports the label and whether a different explanation is more plausible.

Split future evaluation data by person before tuning the rules, so follow-ups from the same person do not appear on both sides. Report precision, recall, abstention, and reviewer disagreement by construct.

## Measuring a product change

The experiment plans describe work to run next. For the study onboarding example, assign eligible new users at random, define quiz completion before starting, and inspect repeat study use and appropriate verification alongside the primary outcome. Interview themes help select that test; product events would supply its results.
