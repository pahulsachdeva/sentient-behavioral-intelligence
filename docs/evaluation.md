# Evaluation and known limits

## Verified in this release

`npm test` checks that every generated excerpt is an exact substring at the reported offsets, unsupported text produces no interpretation, counts are record-based, experiment proposals cite findings and say *untested*, and malformed imports are rejected. `npm run check` syntax-checks the application modules. These are engineering checks, not scientific validation.

## Not evaluated

- There is no human-labeled benchmark, measured precision/recall, inter-rater agreement, calibrated uncertainty, or external validity claim.
- No live customer data or experiments were used. No conversion or retention uplift is reported.
- The authored synthetic data intentionally contains obvious cues and cannot establish performance on natural speech.
- Phrase rules can miss paraphrases and match language taken out of context. No semantic or LLM inference is present in the MVP.

## Next evaluation gate

Create a consented, de-identified dataset with explicit annotation guidelines and an insufficient-evidence label. Split by account before training or tuning to prevent leakage. Report per-construct precision, recall, abstention rate, and disagreement. Review false positives and group differences before considering product use.
