# Development journey: Reach For The Stars API

Student: Nickson M. Formento · Section: 3-1 · Group: Team 5 (BSCS 3-1)

One entry per milestone, written the week you did it. Newest at the bottom.

**AI tools:** I used Claude to explain the module, review my error messages and draft code that I then read, ran, tested and changed

## Setup · Installing the Weeks 12-18 kit

- Dates worked: Nov 13, 2026 · Time spent: <1 hour
- Goal: Install the shared kit on `feature/auth` without breaking lines A to G of the check.

- What I built: copied `.github`, `scripts`, `src`, `tests`, `postman`, `uploads`, `docs`, `render.yaml` and `CHANGELOG.md` into my repository; installed bcryptjs, jsonwebtoken, multer, cors, helmet, swagger-ui-express, yaml, sequelize-cli, jest and supertest; added `JWT_SECRET`, `JWT_EXPIRES_IN` and `CORS_ORIGINS` to `.env` and `.env.example`; updated `.gitignore`.
- Evidence: [feature/auth branch](https://github.com/kennus4m2/reach-for-the-stars-api/tree/feature/auth) · `9c8b8e1461492707e823f6dc876ea397d2f7b5c6` (chore: install the Weeks 12-18 kit), `1a5958fcf10d04c5ed88ae4b0b46753b72fe9236` (docs: add the missing /docs route and OpenAPI paths)
- Problem I hit: I confused the two docs folders. `src/docs/` holds the OpenAPI file that Swagger UI reads, and `docs/` holds the portfolio documents and the development journey. I pasted the kit's docs into one place and forgot the other, so part of what I needed was missing from my repository.
- How I solved it: I ran `git status` to see what was in the commit, then pasted the missing files into the correct folder and made a second commit, so the work went in as two commits instead of one. The first commit holds the first part and the second holds the part I forgot.
- Decision I made and why: I keep the two folders for different jobs: `src/docs/` for what the running API serves (`openapi.yaml`, the Swagger UI route) and `docs/` for the written SE1 portfolio. I also read `git status` before every commit. Cost: two places to remember, but the API documentation stays next to the code that serves it.
- Changes to my design set: none.
- What I would explain to a classmate: The scorecard is a to-do list. A line that was green and turns red means I broke something that worked.

## M1 · Accounts, passwords and tokens

- Dates worked: Nov 14, Nov 16, and Nov 22, 2026 · Time spent: <3 hours
- Goal: Replace `X-Demo-User` with real accounts: register, log in with a JWT, roles and admin routes.

- What I built: `align-users-for-auth`, seeder `demo-passwords`, `auth.validator.js`, `auth.service.js`, `user.service.js`, `auth.controller.js`, `user.controller.js`, `auth.routes.js`, `user.routes.js`; endpoints `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /users`, `PATCH /users/{id}/role`; Postman folders "Log in" and "Accounts" (44 requests in total).
- Evidence: `2aed6041ea2307cac9c1d9d5bd96203bc1864141` · `7a5b605527fe50de1043f279c7d0e00b324901c5` (feat(db): make users fit login and seed bcrypt demo passwords), `399e48de33710ab46e2bdae0ab24d836e7440748` (feat(auth): add validators for register, login and roles), `16612798a7742e8a5f462cde0656b90ee7621048` (test: add the Postman collection for accounts, question sets and sessions)
- Problem I hit: Running `npm run db:reset` stopped at my new seeder `demo-passwords` with "new row for relation users violates check constraint ck_users_role". My Week 10 migration only allowed the roles HOST and PLAYER, so the database refused to insert the ADMIN account. After that the check showed the H lines red because `POST /auth/register` and `POST /auth/login` answered 500 [write the real cause from your terminal, for example: a missing `jwt` setting in `env.js`], and one request in the collection, "S6 Host lists question sets", expected the paged `{ data, meta }` list that I only build in M2. A third problem: the check flagged one commit as made on the GitHub website ("chore: Merge pull request #6 from kennus4m2/feature/auth"). It was the merge commit that GitHub's Merge button creates, so it counted against criterion G.
- How I solved it: I read the error detail, saw the failing row had role ADMIN, and wrote a new migration `allow-admin-role` that recreates `ck_users_role` with PLAYER, HOST and ADMIN, instead of editing a migration that was already on GitHub. For the 500 I read the real error in the terminal running `npm run dev`, because the API hides the details from clients, and [what you changed]. For S6 I made the generator check the envelope only from level m2 and turned it back on in M2. For the web commit I told my instructor and, from then on, I merged each milestone branch on my computer with `git merge --no-ff` instead of the website button. I found these answers by reading the scorecard lines and by asking an AI assistant, then testing each fix myself.
- Decision I made and why: I fix a pushed migration with a new migration, never by editing the old one, so my history stays honest and the database can be rebuilt from nothing. Cost: more migration files. I also keep `tools/` out of the repository with `.gitignore` [only keep this if you did it], but I still commit the generated `postman/` collection because the check reads it.
- Changes to my design set: `users.username` is now optional, `users.password_hash` is VARCHAR(60), the role rule on `users` now allows ADMIN, and a seeded ADMIN account was added. New endpoints: `/auth/register`, `/auth/login`, `/auth/me`, `/users`, `/users/{id}/role`.
- What I would explain to a classmate: 401 means "I do not know who you are", 403 means "I know you, but you may not". The guard runs before validation so strangers learn nothing about my rules.

## M2 · The question bank

- Dates worked: Nov 22, 2026 · Time spent: <1 hour
- Goal: Paged, searchable lists, nested questions with choices created in a transaction, and a cover picture upload.

- What I built: migration `add-cover-to-question-sets`; models for questions, choices, answers and chests; `question.repository.js`, `question.service.js`, `question.validator.js`, `question.controller.js`; paging, search and an allow-listed sort on `GET /question-sets`; `?include=questions`; `GET/POST /question-sets/{id}/questions`, `PATCH/DELETE /question-sets/{id}/questions/{questionId}`; `PUT /question-sets/{id}/cover`; Postman folder "Question bank" (56 requests in total).
- Evidence: `9189a437fd9899b92b7b98d5d00bb7a9101aa968` · `0f6fea77c7e2aaf4bf761716aa45883e6082b1bf` (feat(models): add models for questions, choices, answers and chests)
- Problem I hit: After I added the question bank, the API would not start. The terminal showed "Error: Cannot find module '../repositories/question.repository'", with a require stack that went from `question.service.js` through `question.controller.js`, `question-set.controller.js`, `question-set.routes.js` and `routes/index.js` to `app.js` and `server.js`. I had named the file wrongly (`question.reposiory.js`, missing a letter), so Node could not find the file the service asked for. Because every file in the chain loads the next one, one typo stopped the whole server.
- How I solved it: I read the first line of the error, which names the exact path that was missing, and compared it with the real file name in `src/repositories`. I renamed the file with `git mv src/repositories/question.reposiory.js src/repositories/question.repository.js`, so Git recorded a rename and not a delete and a new file, and the server started again. Now I check that the name in every `require` matches the file name before I run the server.
- Decision I made and why: A question set that a game already used is frozen (409 `QUESTION_SET_FROZEN`), so past results stay meaningful. Cost: a host must create a new set to change questions.
- Decision I made and why: A question and its choices are saved in one transaction, with exactly one correct choice. Cost: slightly longer code in the repository, but never a question without choices.
- Changes to my design set: new column `question_sets.cover_path`; positions of questions are set by the server.
- What I would explain to a classmate: `include` loads a set, its questions and their choices in one query; a loop would run one query per row (the N+1 problem).

## M3 · Gameplay

- Dates worked: Nov 23, 2026 · Time spent: < 2hours
- Goal: Play a whole game: each player is served their own question, the server measures the time and decides the stars, and the leaderboard and `/results` report the game.

- What I built: `scoring.js` (the pure rules), `play.service.js`, `answer.repository.js`, `chest.repository.js`, `play.validator.js`, `play.controller.js`; endpoints `GET /sessions/{code}/question`, `POST /sessions/{code}/answers`, `POST /sessions/{code}/chests/{offerId}/open`, `GET /sessions/{code}/leaderboard`, `GET /sessions` and `GET /sessions/{code}/players/me`; the Postman folder "Play a whole game" (84 requests in total).
- Evidence: `68ddbbd1c9e4afbf02e0c2ad8200aaf4efbcc264` · `c82c3cd24eb11dab05b9e6b7228763f5193d2144` (feat(play): add the star, streak and chest rules, serve only the next question, answer a question with server-side timing, open a chest and show the leaderboards) · `f64ef21e3019e12d30510183274c62b78fa09dc6` (feat(play): loop the questions until the game timer ends) · `ab6556ab9cf7f18153b838eb045ba100e7743ea1` (feat(sessions): add the host's game list and the player's own status)
- Problem I hit: My first version stopped serving questions after the last one (409 `NO_MORE_QUESTIONS`), but my game is meant to keep going, so the questions had to loop until the timer ends. Two rules blocked it: the service only served question number `answer_count + 1`, and the database had `uq_one_answer_per_question`, so a player could answer each question only once. While adding the new endpoints I also broke the server twice: route code pasted into `session.repository.js` ("argument handler must be a function", a stack trace pointing at that file), and a handler that was not exported from a controller, which crashed `session.routes.js` at start.
- How I solved it: I changed the next position to `(answer_count % total) + 1` and added `round` to the answer, dropped the unique rule with a new migration `allow-repeated-answers`, and kept "one answer per served question" with a check of the player's current question plus a row lock in `answer.repository.js`. I made the clock close a game when its time is up (`endIfTimeIsUp`) and changed `completed` in `/results` to "answered every question at least once". For the crashes I read the file and line in the stack trace, moved the code to the right layer, and checked the `module.exports` of each file.
- Decision I made and why: The server decides time and score; the client sends only `question_id` and `choice_id`. A client could edit anything it sends, so it cannot cheat. Cost: network delay counts against the player.
- Decision I made and why: Each player has their own pointer to the current question (independent pacing), because my game is "answer trivia on your own". Cost: players do not see the same question at the same time.
- What I would explain to a classmate: Equal stars share a rank (1, 2, 2, 4), and a transaction saves the answer, the new score and a possible chest together or not at all.

- Changes to my design set: I compared my Week 7 endpoint table (18 endpoints) with the finished API. No endpoint was dropped. Eleven are unchanged or only improved, and seven changed in name or shape:

| # | Week 7 endpoint | Now | Why |
| --- | --- | --- | --- |
| 1, 2 | GET /game-info, GET /health | kept | Hub Contract |
| 3 | POST /auth/login | body is `{school_id, password}` instead of `{username, password}`, and any role can log in | the Hub identifies accounts by school ID, and players log in too, not only hosts. I added `POST /auth/register` and `GET /auth/me` |
| 4 | POST /question-sets | kept | |
| 5 | GET /question-sets | now paged `{ data, meta }`, with `?q` search and an allow-listed `?sort` | needed for long lists; an empty list is still 200 |
| 6 | GET /question-sets/{id} | kept, plus `?include=questions`; the 403 code is `FORBIDDEN` instead of `NOT_YOUR_QUESTION_SET` | one shared error format for every module, and `include` avoids one query per question |
| 7 | PUT /question-sets/{id} | changed to PATCH | a host changes only the fields they send; replacing the whole set was risky |
| 8 | DELETE /question-sets/{id} | answers 204 instead of 200; `QUESTION_SET_IN_USE` kept through the constraint map | 204 means "done, nothing to return" |
| 9 | POST /sessions | kept; the server makes the 6-digit code | |
| 10 | GET /sessions | kept; now paged | it was missing at first, and I built it in M3 |
| 11 | GET /sessions/{code} | kept | |
| 12 | PATCH /sessions/{code} | status values are `ACTIVE` and `ENDED` instead of "playing" and "ended"; illegal changes are 409 `INVALID_STATUS_CHANGE` | they match the database check constraint |
| 13 | POST /sessions/{code}/players | kept; an account that already has a seat gets 200 with the same seat | Design Change Notice 01 (`uq_one_seat`) |
| 14 | GET /sessions/{code}/players/me | kept; returns stars, streak, rewards and rank | it was missing at first, and I built it in M3 |
| 15 | GET /sessions/{code}/questions/next | renamed to GET /sessions/{code}/question | each player has their own pointer, and the questions loop until the timer ends, so it is "my current question" and not "the next one"; it also returns `round` |
| 16 | POST /sessions/{code}/answers | body uses `choice_id` instead of `choice_index`; answers 200 instead of 201 | the server checks that the choice belongs to the question; an answer updates a score and it is not a new resource I return |
| 17 | POST /sessions/{code}/chests | renamed to POST /sessions/{code}/chests/{offerId}/open, body `{slot}` | the chest is a resource, so its id is in the URL |
| 18 | GET /sessions/{code}/leaderboard | kept; equal stars share a rank (1, 2, 2, 4) | |

  New endpoints that were not in the Week 7 table: `POST /auth/register`, `GET /auth/me`, `GET /users`, `PATCH /users/{id}/role`, `GET /sessions/{code}/players`, the four `/question-sets/{id}/questions` endpoints and `PUT /question-sets/{id}/cover`. I added them because accounts, an admin, a question bank and a cover picture became requirements in Weeks 12 and 13.
  Design rule changes: the questions loop until the game timer ends, so the one-answer-per-question database rule was removed; the same served question still cannot be answered twice (409 `ALREADY_ANSWERED`).

## M4 · Automated tests and server preparation

- Dates worked: Nov 24, 2026 · Time spent: <1 hour
- Goal: Make the server ready for Render and prove my rules with automated tests.

- What I built: `helmet`, a CORS allow-list from `CORS_ORIGINS`, `trust proxy`, `DATABASE_URL` support and the `start:render` script; the Jest configuration and test scripts; unit tests for the scoring rules (0 ms, the time limit, one millisecond over), login failures and the answer rules with `jest.mock`; HTTP tests with supertest on a separate database `<DB_NAME>_test` for accounts, question sets, joining, playing, the looping questions and the timer ending. Result: 50 tests in 9 suites, all passing, with 86.8% of the lines in `src` covered; the check's K and L lines are green.
- Evidence: `0ec258c1f73173d396a574311944ec268346b4dc` · `fa1ef2e895ac6cf805ebe1447c8ffcbac5317de4` (feat(security): add cors allow-list and helmet), `743013939f5fbbe80105a4772faeb4fe77375525` (test: add unit tests for the scoring rules)
- Problem I hit: `npm test` said "Missing script: test" because I had not added the test scripts. After I edited `package.json`, the server crashed with "Invalid package config ... package.json" (`ERR_INVALID_PACKAGE_CONFIG`), because the file was no longer valid JSON. Later, `game.api.test.js` failed in its setup ("the code has six digits and a player cannot start a game") [write the real cause you found].
- How I solved it: I added the `test` and `test:coverage` scripts and the `jest` block, checked the file with `node -e "JSON.parse(...)"` and the VS Code Problems tab, and fixed the commas and brackets. For the failing test I ran only that file with `npx jest tests/api/game.api.test.js`, logged the response of each setup step
- Decision I made and why: Tests use their own database (`<DB_NAME>_test`), rebuilt before every run, so my own data is never touched and each run starts from the same rows. Cost: a few seconds more per run.
- Decision I made and why: The unit tests replace the repositories with `jest.mock`, so they need no database and run in milliseconds; for example, they prove that an answer after the timer ends is refused before anything is saved.
- Changes to my design set: none.
- What I would explain to a classmate: Coverage shows which lines ran, not whether they are correct. CORS protects browsers only; curl and Postman ignore it, so `/results` is protected by the Hub key.

## M5 · API documentation and deployment

- Dates worked: Nov 24, 2026 · Time spent: <3 hours
- Goal: Document every endpoint in OpenAPI with Swagger UI and put the API live on Render.

- What I built: the OpenAPI document with 29 operations, each with a summary, parameters, request bodies with examples and every error response, plus schemas for question sets, questions, sessions, the served question, the answer result and the leaderboard; Swagger UI at `/api/v1/docs/` with an Authorize box; the Render Blueprint (web service and PostgreSQL in Singapore); the "Live API:" line, the check badge and a "Deploying to Render" section in the README.
- Evidence: `e8dc8386d2a11ac944ebdde68da05d13fe9a865a` · `e98c6c187baac3cf30cf00ce7559352d6d074979` · https://reach-for-the-stars-kennus4m2.onrender.com/api/v1
- Problem I hit: The check showed line M red ("6 operations documented", and the title still said to chnage it), because I had not added my paths and schemas to `src/docs/openapi.yaml`. Then the first Render deploy built successfully but failed at start with "sh: 1: sequelize-cli: not found" (exit status 127). Render installs only `dependencies`, and I had `sequelize-cli` in `devDependencies`, so my `start:render` command could not run the migrations. Line N also stayed red until the service was live and the README had the "Live API:" line.
- How I solved it: I merged my paths and schemas into the OpenAPI file with a small script instead of pasting YAML by hand (indentation mistakes), and checked that every `$ref` resolves and every operation has a summary and responses. For Render I moved the package with `npm install sequelize-cli --save-prod`, committed `package.json` and `package-lock.json` together (because `npm ci` needs both to match), and redeployed. I then added the Live API line and woke the service before the check.
- Decision I made and why: The first admin is created from `ADMIN_SCHOOL_ID` and `ADMIN_PASSWORD`, and `HUB_API_KEY` and `JWT_SECRET` are never written in `render.yaml`, so no secret is in the repository. No seed data runs on Render, because my demo password would open live accounts. Cost: I type four values in the Render dashboard and the live API starts empty.
- Decision I made and why: I accepted the free-plan limits: the service sleeps after 15 minutes (about a minute to wake), the free database expires 30 days after creation (Nov 24, 2026, so about Dec 24, 2026), and uploaded pictures vanish when the service restarts.
- Changes to my design set: none.
- What I would explain to a classmate: OpenAPI describes every path, verb, parameter, body and response, and Swagger UI lets anyone try it. A Blueprint (`render.yaml`) is my server written as a file and versioned with my code.

## M6 · The SE1 portfolio and the release

- Dates worked: Nov 24, to Nov 25, 2026 · Time spent: <1 hour
- Goal: Document the system as built (including the looping questions and the timer) and publish the release.

- What I built: `docs/technical-spec.md` (seven sections and eight decisions, each with its reason and the alternative not taken), `docs/data-dictionary.md` and `docs/api-reference.md` (generated by `npm run docs:dictionary` and `npm run docs:api`), `docs/user-guide.md` (Players, Hosts, Admins, the Hub, errors), `docs/se2-handoff.md` (connection details, screens with their endpoints, limits and a backlog), six diagrams in `docs/diagrams/` (use case, class, sequence, activity, ERD, architecture), `CHANGELOG.md` with versions 1.0.0 to 1.4.0, the tag [v1.4.0] and a published GitHub release.
- Evidence: `f112e4f3ec2cf1077844debc55982cd6eb318b6c` (docs: write the user guide for players, hosts, admins and the Hub) · `309f0cd7c98071b35c89d2f153e944c82cb59c11` (docs: write the changelog for versions 1.0.0 to 1.4.0) · `2ce67269dae9365d29d29c0a6b159b6b18fd20aa` (docs: add the six diagrams)
- Problem I hit: My first drafts still had a `TO DO` placeholders and some statements that did not match my build, for example that faster answers earn more stars (my scoring is +1 or −1 per answer with no speed bonus), a default question time of 30 seconds (the API sets 20), and a plain `GET` on a session closing the game (only a question or answer request does). The diagrams also had to be redrawn to show the loop and the timer. I also found that the changelog's top version (1.4.0) did not match the version in the first draft of the spec (1.0.0).
- How I solved it: I checked every statement against the code and the Swagger UI, searched `docs/` for `TO DO` and `Your` before each push, and made the version the same in `package.json`, the changelog, the tag and the release. I wrote the diagrams in Mermaid and exported them as PNG files.
- Decision I made and why: The generated documents are never edited by hand, so they cannot drift from the database and the OpenAPI file. Cost: my descriptions live in the data dictionary and are kept when I run the script again.
- Changes to my design set: the diagrams now match the code: the ERD has no one-answer rule, and the sequence and activity diagrams show the loop and the timer.
- What I would explain to a classmate: Documentation describes the system as built, not as planned. A fix after the release is a new PATCH version, tagged and released again.

## M7 · The Test Report

- Dates worked: Nov 25, 2026 · Time spent: <1 hour
- Goal: Prove with my own evidence that the API works, using eight tools.

- What I built: the Test Report PDF (`docs/test-report.pdf`) with manual Postman cases, the Collection Runner and newman results (84 requests, 147 tests, 0 failed on a fresh database), Jest unit and supertest results (50 tests in 9 suites, 86.8% line coverage and an analysis of what was not covered), Swagger UI checks with Authorize, curl security checks (CORS for an allowed and an unlisted origin, `/results` with and without the Hub key, no stack traces), the GitHub Actions scorecard and the live smoke test on Render (a 30-second game, round 2, then `GAME_TIME_UP`, then `/results`), and a defect log.
- Evidence: ongoing [commit hash of docs/test-report.pdf] · [commit hash of each defect fix]
- Problem I hit: none
- How I solved it: none
- Decision I made and why: I added an HTTP test for the timer ending, because coverage showed those lines never ran in the first version.
- Changes to my design set: none.
- What I would explain to a classmate: A test pyramid has many fast unit tests, some HTTP tests per module and few end-to-end runs (my Postman game). Passing tests show the rules I wrote down work, not that I wrote down all the rules.
