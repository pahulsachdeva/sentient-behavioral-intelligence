# Behavioral science methodology

SENTIENT uses **candidate constructs**, not diagnoses. A rule that matches language about uncertainty does not prove a person's internal state. The six labels are operational categories for a research workflow: cognitive effort, uncertainty, perceived control, trust calibration, existing routine, and expectation gap. The exact phrase rules are available in [`analysis.js`](../apps/web/analysis.js).

## Decision rule

1. Match a defined phrase cue in a record. If no cue matches, return no interpretation: **insufficient evidence**.
2. Retain the complete source sentence and its character offsets. One record contributes at most one finding per construct, even if several cues match.
3. Label each finding a hypothesis requiring human review. Show an alternative explanation and a qualitative *single cue* or *multiple cues* indicator. These are **not calibrated probabilities**.
4. Aggregate counts by conversation. The small authored sample is not representative; themes overlap. Follow-up records are chronological descriptions, not evidence of treatment effects.
5. Turn matched constructs into prewritten experiment proposals. Outcomes and test designs are proposed, never reported as results.

## Research grounding

The product draws inspiration from established questions about perceived ease of use and acceptance (Davis, 1989), capability, opportunity, and motivation in behavior change (Michie et al., 2011), and the relationship among motivation, ability, and prompts (Fogg, 2009). These frameworks motivate *questions to investigate*. The current cue rules are original operational heuristics; they are not validated measurements of those theories.

- Davis, F. D. (1989). [Perceived usefulness, perceived ease of use, and user acceptance of information technology](https://doi.org/10.2307/249008). *MIS Quarterly*, 13(3), 319–340.
- Michie, S., van Stralen, M. M., & West, R. (2011). [The behaviour change wheel](https://doi.org/10.1186/1748-5908-6-42). *Implementation Science*, 6, 42.
- Fogg, B. J. (2009). [A behavior model for persuasive design](https://behaviordesign.stanford.edu/resources/fogg-behavior-model). *Persuasive '09*.

## Human review protocol for future work

Two independent reviewers should code whether the excerpt supports the proposed label, whether a more plausible explanation exists, and whether abstention is preferable. Adjudicate disagreement and report per-construct precision/recall against a held-out, consented dataset. Test demographic and role-based differences before any consequential use. Avoid using these interpretations to make individual-level decisions.
