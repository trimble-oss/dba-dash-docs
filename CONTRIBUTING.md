# Contributing to DBA Dash Docs

Thanks for your interest in contributing to the DBA Dash documentation. We welcome fixes, improvements, new tutorials, and corrections — all contributions make the docs better for everyone.

## Trimble Employee?

To start contributing to Trimble OSS and ensure that you've been added to the organization please read through our [quickstart instructions](https://trimble-oss.github.io/contribute/#getting-started).

## Before you start

- Search existing issues and pull requests to avoid duplicated work.
- If your change is large or architectural, open an issue first to discuss scope and approach.

## Filing issues

- Provide a clear title and description of the problem or suggestion.
- Include steps to reproduce, expected vs actual behavior, and any screenshots or log excerpts that help explain the issue.

## Submitting pull requests

- Fork the repository and work on a topic branch with a descriptive name (for example `fix-typo-install` or `add-tutorial-connection-pooling`).
- Keep changes focused — one logical change per pull request.
- Link related issues in the PR description and explain the motivation and what you changed.
- Use clear, descriptive commit messages. Prefer present-tense summaries (e.g. "Add guide for remote monitoring").

## Content and formatting guidelines

- Use Markdown for content. For documentation pages (Hugo), ensure front matter includes a `title` and `date` and `draft: false` where appropriate.
	Example front matter:

	```yaml
	---
	title: "My new doc page"
	date: 2026-03-20
	draft: false
	---
	```
- Write in clear, concise English. Use active voice and short paragraphs.
- Use relative links for internal pages and include alt text for images.

## Review and tests

- Team members will review PRs and may request changes. Please address review comments promptly.
- If your change affects build or site generation, follow the repository README to build and verify the site locally before submitting.

## Security issues

- If you discover a security vulnerability, please do not open a public issue. Contact a maintainer privately as described in `SECURITY.md`.

## Code of conduct

- All contributors are expected to follow the project's code of conduct: see `CODE_OF_CONDUCT.md`.

## Thank you

Thanks — your contributions help keep the documentation accurate and useful. If you want assistance choosing something to work on, ask in an issue and we'll help you get started.

