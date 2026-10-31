<p align="center"><img src="assets/header.svg" alt="Sentient — Customer feedback" width="100%"></p>

A project by Pahul Sachdeva.

## Why I built this

I work in AI Enablement and Customer Sentiment, and I studied neuroscience. I wanted a way to keep customer feedback useful after a call ends.

Someone can like a product and still struggle to use it. A rating alone won't tell me why. Sentient helps me go back to what someone said, ask a better follow-up question, and choose a change to test.

## What it does

Sentient looks for phrases about effort, uncertainty, control, trust, habits, and unexpected product behavior. It keeps the original quote next to each possible theme so I can check whether the match makes sense.

I can:

- Search conversations and follow the same person over time.
- Read the quote behind a theme and consider another explanation.
- Save a review and a note, then export those reviews.
- Look at test ideas tied to the conversations.
- Import my own examples as JSON.

The example follows five people using a consumer AI assistant to study, write, plan, and learn Python. I wrote the 12 interviews for this project. They contain no customer data from my job.

## An example

Maya wants to make a quiz from her notes. She leaves after going through several setup screens. That gives me a question: would letting her paste notes straight into a quiz starter help?

Sentient keeps her words beside that idea. [NeuroLift](https://github.com/pahulsachdeva/neurolift-behavioral-experiments) is where I work through how to test it.

## What to keep in mind

The app uses phrase rules. It can miss wording it hasn't seen or match a phrase for the wrong reason. Every match needs a person to review it. The counts show matching conversations; one conversation can appear under several themes.

The evaluation uses examples written during development. It helps me find mistakes in the rules. It does not tell me how accurate the app would be with real customer interviews.

[How the rules work](docs/methodology.md) · [How I check them](docs/evaluation.md) · [Current results](docs/evaluation-readout.md)

## Run it

Use Node.js 20.11 or later. No packages or API keys are needed.

```bash
npm start
# Open http://localhost:4173
```

```bash
npm run check
npm test
npm run evaluate
```

## Import conversations

Use a JSON array like this:

```json
[{"id":"I-001","account":"Taylor","role":"Study help","date":"2026-04-01","text":"I wasn't sure where to start."}]
```

`account` is the person's name or ID. `channel` and `stage` are optional. Each ID must be unique, including across the example interviews. Dates must use YYYY-MM-DD. A file can contain up to 500 conversations, with up to 12,000 characters of text each.

Imports and reviews save in this browser. Export reviews if you want to keep a copy. Use Research Workspace to clear saved data.

## Next

I want to test the rules against interviews reviewed by other people, improve how they handle different wording, and connect the feedback to task completion and return use.

[Roadmap](docs/roadmap.md) · [Contributing](CONTRIBUTING.md) · [MIT license](LICENSE)
