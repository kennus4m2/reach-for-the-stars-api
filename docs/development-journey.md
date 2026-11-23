# Development journey: Reach For The Stars API

Student: Nickson M. Formento · Section: 3-1 · Group: Team 5 (BSCS 3-1)

One entry per milestone, written the week you did it. Newest at the bottom.

**AI tools:** I used Claude to explain the module, review my error messages and draft code that I then read, ran, tested and changed

## Setup · Installing the Weeks 12-18 kit

- Dates worked: Nov 13, 2026 · Time spent: <1 hour
- Goal: Install the shared kit on `feature/auth` without breaking lines A to G of the check.

- What I built: copied `.github`, `scripts`, `src`, `tests`, `postman`, `uploads`, `docs`, `render.yaml` and `CHANGELOG.md` into my repository; installed bcryptjs, jsonwebtoken, multer, cors, helmet, swagger-ui-express, yaml, sequelize-cli, jest and supertest; added `JWT_SECRET`, `JWT_EXPIRES_IN` and `CORS_ORIGINS` to `.env` and `.env.example`; updated `.gitignore`.
- Evidence: https://github.com/kennus4m2/reach-for-the-stars-api/tree/feature/auth · `9c8b8e1461492707e823f6dc876ea397d2f7b5c6` (chore: install the Weeks 12-18 kit), `1a5958fcf10d04c5ed88ae4b0b46753b72fe9236` (docs: add the missing /docs route and OpenAPI paths)
- Problem I hit: I confused the two docs folders. `src/docs/` holds the OpenAPI file that Swagger UI reads, and `docs/` holds the portfolio documents and the development journey. I pasted the kit's docs into one place and forgot the other, so part of what I needed was missing from my repository.
- How I solved it: I ran `git status` to see what was in the commit, then pasted the missing files into the correct folder and made a second commit, so the work went in as two commits instead of one. The first commit holds the first part and the second holds the part I forgot.
- Decision I made and why: I keep the two folders for different jobs: `src/docs/` for what the running API serves (`openapi.yaml`, the Swagger UI route) and `docs/` for the written SE1 portfolio. I also read `git status` before every commit. Cost: two places to remember, but the API documentation stays next to the code that serves it.
- Changes to my design set: none.
- What I would explain to a classmate: The scorecard is a to-do list. A line that was green and turns red means I broke something that worked.

## M1 · Accounts, passwords and tokens

- Dates worked: Nov 14, Nov 16, and Nov 22, 2026 · Time spent: <3 hours
- Goal: Replace `X-Demo-User` with real accounts: register, log in with a JWT, roles and admin routes.

- What I built: `align-users-for-auth`, seeder `demo-passwords`, `auth.validator.js`, `auth.service.js`, `user.service.js`, `auth.controller.js`, `user.controller.js`, `auth.routes.js`, `user.routes.js`; endpoints `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /users`, `PATCH /users/{id}/role`; Postman folders "Log in" and "Accounts" (44 requests in total).
- Evidence: `7a5b605527fe50de1043f279c7d0e00b324901c5` (feat(db): make users fit login and seed bcrypt demo passwords), `399e48de33710ab46e2bdae0ab24d836e7440748` (feat(auth): add validators for register, login and roles), `16612798a7742e8a5f462cde0656b90ee7621048` (test: add the Postman collection for accounts, question sets and sessions)
- Problem I hit: Running `npm run db:reset` stopped at my new seeder `demo-passwords` with "new row for relation users violates check constraint ck_users_role". My Week 10 migration only allowed the roles HOST and PLAYER, so the database refused to insert the ADMIN account. After that, the check showed the H lines red because `POST /auth/register` and `POST /auth/login` answered 500 [write the cause the terminal showed, for example a missing `jwt` setting in `env.js`]. The I line also failed because one request, "S6 Host lists question sets", expected the paged `{ data, meta }` list, which I only build in M2.
- How I solved it: I read the error detail and saw the failing row had role ADMIN, so I wrote a new migration `allow-admin-role` that drops and recreates `ck_users_role` with PLAYER, HOST and ADMIN, instead of editing the migration that was already on GitHub. For the 500, I read the real error in the terminal running `npm run dev`, because the API hides the details from clients. [what you changed]. For S6, I made the generator check the envelope only from level m2 (`node tools/make-collection.js m1`), and I will turn it back on in M2. I found these answers by reading the check scorecard lines and by asking an AI assistant, then testing each fix myself.
- Decision I made and why: I fix a pushed migration with a new migration, never by editing the old one, so my history stays honest and the database can be rebuilt from nothing. Cost: more migration files. I also keep `tools/` out of the repository with `.gitignore` [only keep this if you did it], but I still commit the generated `postman/` collection because the check reads it.
- Changes to my design set: `users.username` is now optional, `users.password_hash` is VARCHAR(60), the role rule on `users` now allows ADMIN, and a seeded ADMIN account was added. New endpoints: `/auth/register`, `/auth/login`, `/auth/me`, `/users`, `/users/{id}/role`.
- What I would explain to a classmate: 401 means "I do not know who you are", 403 means "I know you, but you may not". The guard runs before validation so strangers learn nothing about my rules.

## M2 · The question bank

- Dates worked: Nov 22, 2026 · Time spent: <1 hour
- Goal: Paged, searchable lists, nested questions with choices created in a transaction, and a cover picture upload.

- What I built: migration `add-cover-to-question-sets`; models for questions, choices, answers and chests; `question.repository.js`, `question.service.js`, `question.validator.js`, `question.controller.js`; paging, search and an allow-listed sort on `GET /question-sets`; `?include=questions`; `GET/POST /question-sets/{id}/questions`, `PATCH/DELETE /question-sets/{id}/questions/{questionId}`; `PUT /question-sets/{id}/cover`; Postman folder "Question bank" (56 requests in total).
- Evidence: `0f6fea77c7e2aaf4bf761716aa45883e6082b1bf` (feat(models): add models for questions, choices, answers and chests)
- Problem I hit: After I added the question bank, the API would not start. The terminal showed "Error: Cannot find module '../repositories/question.repository'", with a require stack that went from `question.service.js` through `question.controller.js`, `question-set.controller.js`, `question-set.routes.js` and `routes/index.js` to `app.js` and `server.js`. I had named the file wrongly (`question.reposiory.js`, missing a letter), so Node could not find the file the service asked for. Because every file in the chain loads the next one, one typo stopped the whole server.
- How I solved it: I read the first line of the error, which names the exact path that was missing, and compared it with the real file name in `src/repositories`. I renamed the file with `git mv src/repositories/question.reposiory.js src/repositories/question.repository.js`, so Git recorded a rename and not a delete and a new file, and the server started again. Now I check that the name in every `require` matches the file name before I run the server.
- Decision I made and why: A question set that a game already used is frozen (409 `QUESTION_SET_FROZEN`), so past results stay meaningful. Cost: a host must create a new set to change questions.
- Decision I made and why: A question and its choices are saved in one transaction, with exactly one correct choice. Cost: slightly longer code in the repository, but never a question without choices.
- Changes to my design set: new column `question_sets.cover_path`; positions of questions are set by the server.
- What I would explain to a classmate: `include` loads a set, its questions and their choices in one query; a loop would run one query per row (the N+1 problem).

## M3 · Gameplay

## M4 · Automated tests and server preparation

## M5 · API documentation and deployment

## M6 · The SE1 portfolio and the release

## M7 · The Test Report