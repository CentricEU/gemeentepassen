# Contributing to CityPasses (Gemeentepassen)

Thank you for your interest in contributing. This document describes how to contribute to the project.

## Getting started

Follow the setup instructions in the [README](README.md) to get the database, backend, frontend, mobile app and test suites running locally.

## Branching model

- `main` — stable branch
- `development` — integration branch; all feature branches are created from and merged back into `development` via pull request

### Branch naming convention

```
[firstLetterOfName + firstTwoLettersOfLastName]_{ticketNumber}_short_description
```

Example: `agh_88988_login_tests`

## Pull requests

1. Create a feature branch from `development`.
2. Keep changes focused; one topic per PR.
3. Make sure the project builds (`mvn install` for backend, `npm install --legacy-peer-deps && npm run build` for frontend) and existing tests pass.
4. Add or update tests where relevant:
   - Backend unit tests: `backend/local4local/src/test`
   - API tests: `automation_api/l4lApiAutomation`
   - UI tests: `automation_fe`
5. Update documentation (README, CHANGELOG) when behaviour, setup or configuration changes.
6. Request a review from at least one other developer.

## Database changes

Schema changes go through Flyway migrations in
`backend/local4local/src/main/resources/db/migration/`, named
`V0_<yyyyMMddHHmm>__description.sql`. Never edit an already-merged migration.

## Configuration and secrets

- Never commit credentials, tokens or personal data.
- Test suite configuration goes into local `.env.<ENV>` files based on the committed `.env.example` templates.
- Backend secrets are provided via Spring profiles / AWS Secrets Manager, not committed properties.

## License

By contributing, you agree that your contributions will be licensed under the
[GNU AGPL-3.0](LICENSE), the license of this project.
