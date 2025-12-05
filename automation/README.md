# Introduction

Local4Local automation repository is set up for adding UI and API testing.
The test are designed to validate the correctness and functionality of the project's features and ensure that the
application meets the required specifications.

## What's included

Here's what's included,

* A standard e2e project structure that meets the requirements of Playwright framework
* A simple .gitignore for you to build on
* Support for test execution in different environments
* Playwright configuration files for TEST and ACC environments
* UI tests spec file for L4L module

## Naming convention to making branches

"[firstLetterOfName+firstTwoLettersOfLastName]_{ticketNumber}_feature"

example: agh_88988_login_tests

## Installation

1. Install node.

* Download the package from `https://nodejs.org/en/download`
* Follow the instruction
* Confirm that node.js and npm are correctly installed by running in terminal following commands,
  `node version`
  `npm version`

2. Pull the repo locally: `git clone `
3. In terminal navigate to the project
4. Run `npm install`

## Running tests

Tests can be run with the following commands,
To run tests in a headless mode, meaning no browser will open up when running the tests. Results of the tests and test logs will be shown in the
terminal.

```
npx playwright test
```

To run tests with UI Mode

```
npx playwright test --ui
```

To run a single test file

```
npx playwright test tests/supplier/login.spec.ts
```

