# API reference: Reach for the Stars API 1.0.0

Generated from `src/docs/openapi.yaml` by `npm run docs:api`. Base URL: `/api/v1`. Try every endpoint in Swagger UI at `/api/v1/docs/`.

Every error answers `{ "error": { "code": "...", "message": "..." } }`. "Login" means the header `Authorization: Bearer <token>`.

## Hub Contract

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| GET | `/health` | Is the API up, and can it reach the database? | nothing | 200, 503 |
| GET | `/game-info` | What the Hub shows about this game | nothing | 200 |
| GET | `/results` | Finished games, every player, and the podium (rule 7) | X-Hub-Key | 200, 400, 401 |

## Accounts

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| POST | `/auth/register` | Create a PLAYER account | nothing | 201, 400, 409 |
| POST | `/auth/login` | School ID and password in, a token out | nothing | 200, 400, 401 |
| GET | `/auth/me` | The account of the token | login | 200, 401 |

## Admin

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| GET | `/users` | List every account (admin only) | login | 200, 401, 403 |
| PATCH | `/users/{id}/role` | Change an account's role (admin only) | login | 200, 400, 401, 403, 404, 409 |

## Question sets

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| GET | `/question-sets` | List my question sets, paged, searchable and sortable | login | 200, 400, 401, 403 |
| POST | `/question-sets` | Create a question set (host or admin) | login | 201, 400, 401, 403 |
| GET | `/question-sets/{id}` | Read one question set (owner only) | login | 200, 400, 401, 403, 404 |
| PATCH | `/question-sets/{id}` | Change a question set (owner only) | login | 200, 400, 401, 403, 404 |
| DELETE | `/question-sets/{id}` | Delete a question set (owner only) | login | 204, 401, 403, 404, 409 |
| PUT | `/question-sets/{id}/cover` | Upload the cover picture (PNG or JPEG, at most 1 MB) | login | 200, 400, 401, 403, 404, 413 |

## Question bank

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| GET | `/question-sets/{id}/questions` | List the questions of my set, with the correct choice | login | 200, 401, 403, 404 |
| POST | `/question-sets/{id}/questions` | Add a question with 2 to 4 choices (exactly one correct) | login | 201, 400, 401, 403, 404, 409 |
| PATCH | `/question-sets/{id}/questions/{questionId}` | Change a question or replace its choices | login | 200, 400, 401, 403, 404, 409 |
| DELETE | `/question-sets/{id}/questions/{questionId}` | Delete a question | login | 204, 401, 403, 404, 409 |

## Sessions

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| GET | `/sessions` | List my games (host) or all games (admin), paged | login | 200, 400, 401, 403 |
| POST | `/sessions` | Start a game from a question set (the server makes the 6-digit code) | login | 201, 400, 401, 403, 404 |
| GET | `/sessions/{code}` | Read a game by its join code | nothing | 200, 400, 404 |
| PATCH | `/sessions/{code}` | Start or end a game (host of that game) | login | 200, 400, 401, 403, 404, 409 |
| GET | `/sessions/{code}/players` | List the nicknames and stars of a game | nothing | 200, 400, 404 |
| POST | `/sessions/{code}/players` | Join a game, or rejoin it with the same seat | login | 200, 201, 400, 401, 404, 409 |

## Gameplay

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| GET | `/sessions/{code}/players/me` | See my own stars, streak, rewards and rank | login | 200, 400, 401, 403, 404 |
| GET | `/sessions/{code}/question` | Get my next question; the questions loop until the timer ends (never shows the correct choice) | login | 200, 401, 403, 404, 409 |
| POST | `/sessions/{code}/answers` | Answer the question I was served (time and stars are decided by the server) | login | 200, 400, 401, 403, 404, 409 |
| POST | `/sessions/{code}/chests/{offerId}/open` | Open a Mystery Chest (pick slot 1, 2 or 3) | login | 200, 400, 401, 403, 404, 409 |
| GET | `/sessions/{code}/leaderboard` | The leaderboard with shared ranks (1, 2, 2, 4) | nothing | 200, 400, 404 |
