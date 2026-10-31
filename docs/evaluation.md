# How I check the rules

Run `npm test` to check quotes, saved reviews, counts, dates, and imports. Run `npm run check` to check the JavaScript files.

## Read the results

Run `npm run evaluate` for a table of results from 38 examples. Run `node scripts/evaluate.js --json` to get the same results as JSON. [The current table](evaluation-readout.md) is saved here too.

I wrote these examples while building the rules. They cover all six themes, different wording, overlapping themes, and conversations where the app should return nothing. Four examples still miss a theme. These cases show where the rules need work; they are not an independent accuracy study.

For each theme, the table counts correct matches, wrong matches, missed matches, and correct skips. Precision asks: of the matches returned, how many were expected? Recall asks: of the expected matches, how many did we find? A dash means there was no denominator. The [scikit-learn reference](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_fscore_support.html) explains the same formulas.

One conversation can match more than one theme. It counts once per theme. The report also lists every mismatch so I can read the example before changing a rule.

## Save a review

Open Evidence Explorer or a conversation. Choose Supported, Not supported, or Uncertain, add a note, and save. Reviews stay in this browser and can be exported.

A review belongs to the exact source text and quoted sentences. If either changes, the app asks for a fresh review. Review decisions do not change the phrase counts.

## Mistakes these checks caught

- “Not unsure” was treated like active uncertainty.
- “I don't know where to start” was missed.
- Curly apostrophes in “wasn’t sure” caused missed matches.
- An import could change the visible records even when saving failed.

The tests keep those cases from breaking again. The app still has trouble with quoted speech, sarcasm, some negation, and wording outside its phrase list.

## What needs to happen next

Have other people review a separate set of interviews before changing the rules. Keep each person's interviews together when splitting development and test data, so their follow-ups do not appear in both sets. Record where reviewers disagree and why. [Oortwijn and colleagues (2021)](https://aclanthology.org/2021.humeval-1.15/) describe a process for working through those disagreements.

GitHub CI saves the Markdown and JSON reports as a `construct-evaluation` artifact for each run. Each report belongs to that run's version of the code. Known wording misses stay visible without failing CI. Broken calculations or invalid examples fail the tests.
