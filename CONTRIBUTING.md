# Contributing to ClassWeave

Thanks for taking the time to improve **ClassWeave**! Every bug report, idea
and pull request is welcome.

## Quick Start

```bash
git clone https://github.com/gitstq/classweave.git
cd classweave
npm install
npm run build
npm test
```

- Source lives in `src/` and is written in strict TypeScript.
- Tests use the built-in `node:test` runner (no test framework to install).

## Reporting Bugs

Open an issue and include:

1. The `cw(...)` call and the actual output.
2. The output you expected.
3. Your Tailwind version and any custom prefix/theme configuration.

## Pull Requests

1. Fork the repository and create a feature branch.
2. Add tests for any new behavior — especially new utility groups.
3. Make sure `npm run build` and `npm test` both pass.
4. Keep commits focused and follow [Conventional Commits]:
   - `feat: add ...`
   - `fix: correct ...`
   - `docs: document ...`
   - `refactor: restructure ...`
   - `test: cover ...`

## Adding Utility Groups

Utility groups are declared declaratively in `src/groups.ts`. When adding one:

- Reuse the scale helpers in `src/scales.ts` where possible.
- Ambiguous prefixes (e.g. `text-`, `ring-`) rely on rule order — place the
  more specific match first.
- Add cases to the relevant file under `test/`.

## Code Style

- No runtime dependencies.
- Prefer readable, well-typed code; comment the *why*, not the obvious *what*.
- Run `npm run lint` (type check) before opening a PR.

## Code of Conduct

Be kind and constructive. By participating you agree to keep the community a
welcoming space for everyone.
