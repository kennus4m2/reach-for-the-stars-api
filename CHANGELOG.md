# Changelog

All notable changes, newest first.

## 1.6.0: Final Commit and Changes

- Committed and pushed the final changes to the GitHub repository, ensuring that the latest project version and supporting documentation were included.
- Verified the final repository structure and confirmed that all required files were properly organized and committed.
- Fixed the version number from 1.4.1 to 1.6.0

## 1.5.0: (Week 17) Test Report Documentation

- Added the docs/test-report.pdf file to the project repository, containing the documented test results, test coverage summary, and testing verification.
- Included the results of the Jest test suites, line coverage, Postman collection execution using Newman, and automatic checks.
- Organized the testing documentation to provide evidence of the API's functionality, reliability, and completed verification.

## 1.4.0 (Weeks 15 to 16): Final build: tests, documentation and deployment

- Deployed the API to Render (web service and PostgreSQL database in Singapore) from a Blueprint, with database settings and the Hub key supplied as environment variables. The first admin is created from environment variables at startup and no seed data is loaded on Render.
- Documented the whole API in OpenAPI 3 (29 operations with parameters, bodies and every error response), served as Swagger UI at `/docs/` with an Authorize box for the login token. The README names the live API and shows the check badge.
- Wrote the technical specification, user guide and SE2 handoff, generated the data dictionary and the API reference, and exported six diagrams (use case, class, sequence, activity, ERD, architecture).
- Verified with 50 Jest tests (unit tests with `jest.mock`, and HTTP tests with supertest on a separate test database) at 86.8% line coverage, the Postman collection of 84 requests run on a fresh database with newman, and the automatic check (A to O).
- Fixed: `sequelize-cli` moved to `dependencies` so Render can run the migrations at start.

## 1.3.0 (Week 14): Server preparation and automated tests

- Prepared the server for production: `helmet` security headers, a CORS allow-list read from `CORS_ORIGINS`, `trust proxy`, a `DATABASE_URL` connection with optional SSL (`DB_SSL`), and the `start:render` script that migrates, creates the first admin and starts the server.
- Added automated tests: unit tests for the scoring rules, login and answering (repositories replaced with `jest.mock`), and HTTP tests for accounts, question sets, joining, playing, the looping questions and the game timer. Tests run against their own database, `<DB_NAME>_test`.
- Added the coverage report (`npm run test:coverage`).

## 1.2.0 (Week 13): Question bank and the game

- Lists are paged in a `{ data, meta }` envelope, with `?q=` search and an allow-listed `?sort=`. Question sets can be read with `?include=questions`.
- Added questions with 2 to 4 choices and exactly one correct choice, saved in one transaction, and a cover picture upload (PNG or JPEG, up to 1 MB; wrong type 400, too big 413). A question set that a game has used is frozen.
- Added the game itself. The server serves each player their own question, measures the answer time and decides the result: +1 star for a correct answer inside the time limit, −1 star (never below 0) for a wrong or late one, streaks, double-star and streak-protection rewards, and a Mystery Chest offer on every 5th correct answer in a row, with a slot pick. Added the leaderboard (equal stars share a rank), `GET /sessions` for a host's games and `GET /sessions/{code}/players/me` for a player's own progress.
- The questions loop: after the last question comes the first one again, until the game timer ends. Dropped `uq_one_answer_per_question`; the same served question still cannot be answered twice (409 `ALREADY_ANSWERED`, backed by a row lock). The clock closes a game when its time is up (`endIfTimeIsUp`), so `/results` lists it even if the host never ends it.
- `/results` now counts a player as completed when they answered every question at least once, and ranks completed players by stars.

## 1.1.0 (Week 12): Real login and roles

- Replaced the temporary `X-Demo-User` header with real login. Everyone registers as a PLAYER (a requested role is ignored); passwords are hashed with bcrypt and the hash is never returned; `POST /auth/login` returns a signed token (JWT, valid for 1 hour) that is sent as `Authorization: Bearer <token>`. A wrong password and an unknown school ID get the same 401 answer.
- Added role checks (PLAYER, HOST, ADMIN) that run before validation, `GET /auth/me`, and the admin endpoints `GET /users` and `PATCH /users/{id}/role` (an admin cannot change their own role).
- Changed the users table: the username is now optional, the password hash is 60 characters, and the role check allows ADMIN. The seed data now holds hashed demo passwords and a demo admin.

## 1.0.0 (Weeks 10 to 11): foundation

- Created the Express 5 API with PostgreSQL, Sequelize models, migrations and seed data, plus `db:check`, `db:reset` and the `check` script that GitHub runs after every push.
- Added the Hub Contract endpoints: `GET /health`, `GET /game-info` and `GET /results` (with `X-Hub-Key` and optional `?since=`).
- Added question sets (create, list, read, update, delete) and sessions with six-digit join codes, status changes (WAITING, ACTIVE, ENDED), and joining with a nickname, where a rejoin returns the same seat.
- Added a uniform error format, `{ "error": { "code", "message" } }`, with codes such as `VALIDATION_FAILED`, `NICKNAME_TAKEN` and `QUESTION_SET_IN_USE`.
- Added temporary sign-in with the `X-Demo-User` header until real login.