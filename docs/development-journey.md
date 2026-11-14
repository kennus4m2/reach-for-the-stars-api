# Development journey: Reach For The Stars API

Student: Nickson M. Formento · Section: 3-1 · Group: Team 5 (BSCS 3-1)

One entry per milestone, written the week you did it. Newest at the bottom.

**AI tools:** I used Claude to explain the module, review my error messages and draft code that I then read, ran, tested and changed


## Setup · Installing the Weeks 12-18 kit
- Dates worked: Nov 13, 2026 · Time spent: <1 hour
- Goal: Install the shared kit on `feature/auth` without breaking lines A to G of the check.
- What I built: copied `.github`, `scripts`, `src`, `tests`, `postman`, `uploads`, `docs`, `render.yaml` and `CHANGELOG.md` into my repository; installed bcryptjs, jsonwebtoken, multer, cors, helmet, swagger-ui-express, yaml, sequelize-cli, jest and supertest; added `JWT_SECRET`, `JWT_EXPIRES_IN` and `CORS_ORIGINS` to `.env` and `.env.example`; updated `.gitignore`.
- Evidence: https://github.com/kennus4m2/reach-for-the-stars-api/tree/feature/auth · 9c8b8e1461492707e823f6dc876ea397d2f7b5c6 (chore: install the Weeks 12-18 kit), 1a5958fcf10d04c5ed88ae4b0b46753b72fe9236 (docs: add the missing /docs route and OpenAPI paths)
- Problem I hit: I confused the two docs folders. `src/docs/` holds the OpenAPI file that Swagger UI reads, and `docs/` holds the portfolio documents and the development journey. I pasted the kit's docs into one place and forgot the other, so part of what I needed was missing from my repository.
- How I solved it: I ran `git status` to see what was in the commit, then pasted the missing files into the correct folder and made a second commit, so the work went in as two commits instead of one. The first commit holds the first part and the second holds the part I forgot.
- Decision I made and why: I keep the two folders for different jobs: `src/docs/` for what the running API serves (`openapi.yaml`, the Swagger UI route) and `docs/` for the written SE1 portfolio. I also read `git status` before every commit. Cost: two places to remember, but the API documentation stays next to the code that serves it.
- Changes to my design set: none.
- What I would explain to a classmate: The scorecard is a to-do list. A line that was green and turns red means I broke something that worked.

## M1 · Accounts, passwords and tokens
- Dates worked: Nov , 2026 · Time spent: [hours]
- Goal: [one sentence]
- What I built: [files and endpoints]
- Evidence: [pull request link] · [two or three commit hashes]
- Problem I hit: [the error or wrong behaviour]
- How I solved it: [what you tried, what worked, where you found the answer]
- Decision I made and why: [a rule, a limit or a name, and its cost]
- Changes to my design set: [ERD, data dictionary or endpoint table changes, or "none"]
- What I would explain to a classmate: [one idea, in your own words]

## M2 · The question bank

## M3 · Gameplay

## M4 · Automated tests and server preparation

## M5 · API documentation and deployment

## M6 · The SE1 portfolio and the release

## M7 · The Test Report
