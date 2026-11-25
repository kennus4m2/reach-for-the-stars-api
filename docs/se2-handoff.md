# SE2 handoff: building the Reach For The Stars frontend

## Connection

| Item | Value |
|---|---|
| Base URL (production) | https://reach-for-the-stars-kennus4m2.onrender.com/api/v1 |
| Base URL (local) | http://localhost:3001/api/v1 |
| Contract | Hub Contract v1.3; Swagger UI at `/docs/`, `src/docs/openapi.yaml` |
| CORS | Browsers only accept responses from allowed origins. Add the frontend's origin (scheme, host and port, for example `http://localhost:5173` while developing and the deployed site's address later) to the `CORS_ORIGINS` environment variable, in `.env` locally and in the Render dashboard for production, then restart or redeploy. |
| Login | Register with `POST /auth/register` and log in with `POST /auth/login` (`school_id` and `password`). The answer contains a `token` (a JWT), `token_type: "Bearer"` and `expires_in` (the token lasts 1 hour). Send it with every request that needs an account in the header `Authorization: Bearer <token>`. Keep it in memory or in storage your frontend controls, and attach it in one place (an HTTP client wrapper). `GET /auth/me` returns the account and its `role` (PLAYER, HOST or ADMIN), which the frontend can use to show the right screens. On a 401 (`AUTH_REQUIRED`, `INVALID_TOKEN`) discard the token and send the user to the login screen. There is no refresh endpoint, so after an hour the user logs in again. |
| First request | The production API runs on a free Render plan, which puts the server to sleep after a period without traffic. The first request after that can take up to a minute while it wakes. Show a loading state, do not treat a slow first response as an error, and consider calling `GET /health` when the app opens to wake the server early. |

## Screens and the endpoints they use

Errors always have the form `{ "error": { "code": "...", "message": "..." } }`. Show the `message` and branch on the `code`.

| Screen | Endpoints |
|---|---|
| Register and login | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`. Everyone registers as a PLAYER; a 409 `SCHOOL_ID_TAKEN` or `EMAIL_TAKEN` means the account exists |
| Host: my question sets (list, create, edit, delete) | `GET /question-sets`, `POST /question-sets`, `GET /question-sets/{id}`, `PATCH /question-sets/{id}`, `DELETE /question-sets/{id}` (a set used in a game returns 409 `QUESTION_SET_IN_USE`) |
| Host: add questions and choices to a set | `GET /question-sets/{id}/questions` (shows which choice is correct), `POST /question-sets/{id}/questions` (text, optional `time_limit_sec`, 2 to 4 `choices` with exactly one `is_correct: true`), `PATCH` and `DELETE /question-sets/{id}/questions/{questionId}`, and `PUT /question-sets/{id}/cover` (form-data, key `cover`, PNG or JPEG up to 1 MB). A set that a game used is frozen (409 `QUESTION_SET_FROZEN`) |
| Host: lobby (start a game, show the join code, see who joined) | `POST /sessions` (returns the six-digit `code`), `GET /sessions/{code}/players` (poll for the player list), `PATCH /sessions/{code}` with `status: ACTIVE` to start and `status: ENDED` to finish |
| Player: join | `GET /sessions/{code}` to check the game exists and its status, then `POST /sessions/{code}/players` with a `nickname` (201 new seat, 200 rejoin with the same `player_id`) |
| Player: play (question, answer, streak, power-ups, chest) | `GET /sessions/{code}/question` returns the player's current question, its choices (never the correct one), `time_limit_sec` and the `round` (the questions loop until the timer ends). `POST /sessions/{code}/answers` with `question_id` and `choice_id` returns `correct`, `stars_earned`, `stars`, `streak`, `round_completed` and, on every 5th correct answer in a row, a `chest_offer_id`. `POST /sessions/{code}/chests/{offerId}/open` with `slot` 1, 2 or 3 returns the reward (`DOUBLE_STAR`, `STREAK_PROTECTION` or `EMPTY`). Power-ups apply automatically on the next answer. `GET /sessions/{code}/players/me` returns stars, streaks and whether a power-up is ready |
| Leaderboard and results | `GET /sessions/{code}/leaderboard?limit=10` (rank, nickname, stars, best streak; equal stars share a rank). The final result of a game is the leaderboard of the ended game, so show it when `GET /sessions/{code}` returns `ENDED`. **Do not call `/results` from the frontend:** it needs the Hub key, which must never be placed in a browser |
| **New** Host: my games | `GET /sessions` (paged: `?page=`, `?limit=`, `?sort=`), `GET /sessions/{code}` |
| **New** Admin | `GET /users`, `PATCH /users/{id}/role` (an admin cannot change their own role: 409 `CANNOT_CHANGE_OWN_ROLE`) |

## Known limits and the SE2 backlog

1. **No real-time updates.** Players move at their own pace and the API has no push channel, so the lobby, player list and leaderboard must be refreshed by polling. Consider a polling interval of a few seconds, and a push channel (for example server-sent events) as a later improvement.
2. **The server decides time and score, so network delay counts against the player.** The frontend should show the question as soon as it arrives and not add its own timer for scoring. A countdown on screen is only a display.
3. **The clock closes a game only when someone asks for a question or sends an answer.** A plain `GET /sessions/{code}` can still say `ACTIVE` after `ends_at` has passed, until a player's next question or answer request makes the server close the game (the request answers 409 `GAME_TIME_UP`). So the frontend should compare the current time with `ends_at` and treat the game as over when the countdown reaches zero. Then call `GET /sessions/{code}/question` once, which closes the game, and move the player to the final leaderboard. Handle a status change at any time.
7. **A token lasts one hour and cannot be refreshed.** A long session ends with a 401 `INVALID_TOKEN`. Save no unsent answer, send the user to login, and let them rejoin: their seat, stars and streak are kept.
4. **Joining closes when a game starts, and a game can be full.** Handle `GAME_ALREADY_STARTED`, `SESSION_FULL` and `NICKNAME_TAKEN` on the join screen with clear messages. A returning player gets their original seat back, so treat a 200 on join as a rejoin and resume play.
5. **The live API starts empty.** No seed data is loaded on Render, and the first admin comes from environment variables. For demos, create a host account, a question set and a session first.
6. **One account has one seat per game.** One account cannot play two seats, so testing with several players needs several accounts.
7. **A token lasts one hour and cannot be refreshed.** A long session ends with a 401 `INVALID_TOKEN`. Save no unsent answer, send the user to login, and let them rejoin: their seat, stars and streak are kept.
8. **Uploaded cover pictures vanish.** The free plan has no persistent disk, so a cover disappears when the service restarts or redeploys. Show a placeholder when a `cover_url` returns 404.
9. **Backlog, in priority order:** (a) a countdown from `ends_at` and the current `round` on the play screen; (b) a lobby that polls `GET /sessions/{code}/players`; (c) the chest screen with three slots; (d) a leaderboard that refreshes every few seconds; (e) a server-side job that closes finished games by itself, so item 3 is no longer needed; (f) a push channel (server-sent events) instead of polling; (g) a way for hosts to copy a frozen question set.