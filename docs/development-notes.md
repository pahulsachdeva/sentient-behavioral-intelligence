# Development notes

## Where to start reading

- `apps/web/analysis.js` contains the behavioral categories, cue rules, evidence extraction, experiment templates, and import validation. This is the place to review the analytical assumptions.
- `apps/web/app.js` owns browser state and the six views. `filtered()` applies search and sort before pagination. The conversation drawer keeps the source text beside the interpretations.
- `apps/web/style.css` defines the black and purple palette and responsive layouts. `assets/mark.svg` and `assets/header.svg` share a looping brain motif based on the supplied visual reference.
- `data/synthetic/conversations.json` contains the authored fixture. Follow-up records use the same person identifier so the timeline can group them.

## Decisions behind the MVP

**Inspectable rules first.** Each interpretation should be challengeable. A phrase rule is limited, but its behavior is visible. Replacing it with a model should require better evidence, not merely more fluent output.

**No confidence percentage.** The demo has no calibration dataset. Single-cue and multiple-cue labels describe the available evidence without turning an arbitrary score into a probability.

**Count records once per construct.** Several matching phrases in one record should not inflate the chart. Different constructs can overlap, so their counts are not mutually exclusive segments.

**Keep the source and the interpretation together.** The excerpt is retained with offsets. Reviewers should be able to disagree with a label while seeing exactly what triggered it.

**Separate imports from the fixture.** Browser imports can be cleared without changing the example workspace. Imported text is escaped when rendered and revalidated when loaded from storage.

**Keep metrics proposals explicit.** The README's learning, independent-use, activation, and adoption measures are research directions. The app does not yet join conversations to product usage or training outcomes.

## Practical limitations to address next

- Sentence boundaries currently use periods. Abbreviations, quoted punctuation, and multilingual text need a proper segmentation pass.
- The views still live in one module. Split them into small view modules when changing navigation or adding saved research state; avoid growing the current template strings indefinitely.
- Local browser storage is convenient for a demonstration, but it is not an appropriate home for confidential customer transcripts.
- Add a keyboard focus trap and restore the invoking control when the conversation drawer closes.
- Evaluate cue rules against independently annotated records, including paraphrases, negation, and examples that should produce no interpretation.

These notes describe the current implementation and its tradeoffs. They are not a record of customer research or a claim that the proposed interventions have been tested.
