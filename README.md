# Reach For The Stars API

Backend API for **Reach For The Stars**, a tournament game for the SorSU Bulan Campus library.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Nickson M. Formento (kennus4m2), BSCS 3-1
- Group and game concept: Team 5 - Reach for the Stars is a library-hosted multiplayer trivia tournament where players independently answer educational questions, earn stars, use strategic mystery-chest rewards, and compete to finish with the highest score before the round timer ends.

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone [repository-url]
cd [folder-name]
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD`.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | your_game_slug | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | Finished games, every player, and the top 3. Needs the `X-Hub-Key` header. Optional `?since=` | 200 (401 without the key) |

## API endpoints / Week 11 (Step 7.4)

Base URL: `http://localhost:3001/api/v1`

**Sign-in this week:** send the header `X-Demo-User: <school ID>` (real login comes in Week 12). Error answers always look like `{ "error": { "code": "...", "message": "..." } }`.

### Hub Contract (from Week 10)

| Verb | URL | Who may call it | Success |
| --- | --- | --- | --- |
| GET | `/health` | Anyone | 200 |
| GET | `/game-info` | Anyone | 200 |
| GET | `/results` (optional `?since=`) | The Library Game Hub, with the `X-Hub-Key` header | 200 |

### Module 1: Question sets

| Verb | URL | Who may call it | Success |
| --- | --- | --- | --- |
| POST | `/question-sets` | Host or admin | 201 |
| GET | `/question-sets` | Host (own sets only) or admin (all sets) | 200 |
| GET | `/question-sets/{id}` | The host who owns it, or admin | 200 |
| PATCH | `/question-sets/{id}` | The host who owns it, or admin | 200 |
| DELETE | `/question-sets/{id}` | The host who owns it, or admin | 204 |

Body fields: `title` (required, 3 to 255 characters), `description` (up to 1000), `subject` (up to 100), `grade_level` (up to 50). A question set that was used in a game cannot be deleted (409 `QUESTION_SET_IN_USE`).

### Module 2: Sessions and joining

| Verb | URL | Who may call it | Success |
| --- | --- | --- | --- |
| POST | `/sessions` | Host or admin (with a question set they own) | 201 |
| GET | `/sessions/{code}` | Anyone | 200 |
| PATCH | `/sessions/{code}` | The host of that game, or admin | 200 |
| POST | `/sessions/{code}/players` | Any signed-in account | 201 new seat, 200 rejoin |
| GET | `/sessions/{code}/players` | Anyone (nicknames and stars only) | 200 |

- `POST /sessions` body: `question_set_id` (required), `duration_sec` (optional, 30 to 3600, default 300). The server creates the six-digit `code`.
- `PATCH /sessions/{code}` body: `status` is `ACTIVE` or `ENDED`. Allowed changes: WAITING to ACTIVE or ENDED, ACTIVE to ENDED. Anything else is 409 `INVALID_STATUS_CHANGE`.
- `POST /sessions/{code}/players` body: `nickname` (2 to 20 characters). An account that already has a seat gets the same `player_id` back (200). A new player cannot join a game that has started (409 `GAME_ALREADY_STARTED`) or is full (409 `SESSION_FULL`). A taken nickname is 409 `NICKNAME_TAKEN`.

### Error codes

| Status | Codes |
| --- | --- |
| 400 | `VALIDATION_FAILED`, `INVALID_JSON` |
| 401 | `AUTH_REQUIRED`, `HUB_KEY_REQUIRED` |
| 403 | `FORBIDDEN` |
| 404 | `QUESTION_SET_NOT_FOUND`, `SESSION_NOT_FOUND` |
| 409 | `INVALID_STATUS_CHANGE`, `GAME_ALREADY_STARTED`, `SESSION_FULL`, `NICKNAME_TAKEN`, `ALREADY_JOINED`, `QUESTION_SET_IN_USE` |

## What "completed" means in my game

A player completed the game when they answered every question of the session's question set
(number of answers = number of questions). A timeout counts as an answer. Players who stopped early get `completed: false` and `rank: null`.

## Tables

| Table | Purpose |
| --- | --- |
| users | Hosts and players' accounts, with a role (HOST or PLAYER), per Design Change Notice 01 |
| question_sets | A host's reusable set of questions |
| questions | Questions of a set, with position and time limit |
| choices | Answer options of a question; one is correct |
| sessions | One hosted game: join code, status, timer |
| session_players | A user's seat in a session, with stars and streaks; UNIQUE (session_id, user_id) |
| answers | One player's answer to one question |
| chest_offers | A Mystery Chest earned on a 5-streak |
| chest_slots | The three rewards inside a chest offer |


## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |
