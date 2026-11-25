# Data dictionary

Generated from the database by `npm run docs:dictionary` on 2026-11-24, then described by hand.

### `answers`

A player's answers during a session. A player has one answer row per question served, and the same question appears again in every round, so the same player can have several rows for the same question.

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | ; PK | Unique identifier of the answer. |
| `player_id` | integer | no |  | ; FK REFERENCES session_players(id) ON DELETE CASCADE | The session player who gave the answer. |
| `question_id` | integer | no |  | ; FK REFERENCES questions(id) ON DELETE CASCADE | The question that was served and answered. |
| `choice_id` | integer | yes |  | FK REFERENCES choices(id) ON DELETE SET NULL | The choice the player picked. Empty if no choice was picked or the choice has since been deleted. |
| `is_correct` | boolean | no |  |  | Whether the answer was correct. |
| `answer_time_ms` | integer | no |  |  | Time the player took to answer, in milliseconds. |
| `stars_earned` | integer | no | `0` |  | Number of stars awarded for this answer. |
| `streak_after` | integer | no | `0` |  | The player's streak of consecutive correct answers right after this answer. |
| `double_star_used` | boolean | no | `false` |  | Whether the player's double star power-up was used on this answer. |
| `protection_used` | boolean | no | `false` |  | Whether the player's protection power-up was used on this answer. |
| `created_at` | timestamp with time zone | no | `now()` |  | When the answer was recorded. |

### `chest_offers`

A chest offered to a player as a reward for an answer. Each answer has at most one offer, and the offer holds the chest slots the player can choose from.

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | ; PK | Unique identifier of the chest offer. |
| `answer_id` | integer | no |  | ; UNIQUE (chest_offers_answer_id_key); FK REFERENCES answers(id) ON DELETE CASCADE | The answer that earned this offer. Each answer can have only one offer. |
| `player_id` | integer | no |  | ; FK REFERENCES session_players(id) ON DELETE CASCADE | The session player who received the offer. |
| `status` | character varying(50) | no | `'PENDING'` | ; CHECK (ck_chest_status) | Current state of the offer. It starts as `PENDING` and can only hold the values allowed by `ck_chest_status`. |
| `picked_slot` | integer | yes |  |  | The slot number the player chose. Empty until the player picks one. |
| `created_at` | timestamp with time zone | no | `now()` |  | When the offer was created. |
| `opened_at` | timestamp with time zone | yes |  |  | When the player opened the chest. Empty until it is opened. |

### `chest_slots`

The selectable slots inside a chest offer, numbered 1 to 3, each hiding a reward.

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | ; PK | Unique identifier of the chest slot. |
| `chest_offer_id` | integer | no |  | ; FK REFERENCES chest_offers(id) ON DELETE CASCADE; UNIQUE (uq_chest_slot_number) | The chest offer this slot belongs to. |
| `slot_number` | integer | no |  | ; UNIQUE (uq_chest_slot_number); CHECK (ck_slot_number_1_to_3) | Position of the slot within the offer, from 1 to 3. Unique per offer. |
| `reward_type` | character varying(50) | no |  |  | The kind of reward hidden in this slot. |

### `choices`

The possible answer options for a question.

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | ; PK | Unique identifier of the choice. |
| `question_id` | integer | no |  | ; FK REFERENCES questions(id) ON DELETE CASCADE; UNIQUE (uq_choice_index) | The question this choice belongs to. |
| `choice_index` | integer | no |  | ; UNIQUE (uq_choice_index) | Position of the choice within the question. Unique per question. |
| `text` | text | no |  |  | The text shown to the player for this choice. |
| `is_correct` | boolean | no | `false` |  | Whether this choice is a correct answer to the question. |

### `question_sets`

A collection of questions created by a host, which can be used to run sessions.

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | ; PK | Unique identifier of the question set. |
| `host_id` | integer | no |  | ; FK REFERENCES users(user_id) ON DELETE CASCADE | The user who created and owns the question set. |
| `title` | character varying(255) | no |  |  | Display title of the question set. |
| `description` | text | yes |  |  | Optional longer description of what the set covers. |
| `subject` | character varying(100) | yes |  |  | Optional subject area of the set, such as a school subject. |
| `grade_level` | character varying(50) | yes |  |  | Optional grade level the set is intended for. |
| `created_at` | timestamp with time zone | no | `now()` |  | When the question set was created. |
| `cover_path` | character varying(255) | yes |  |  | Optional path to the set's cover image. |

### `questions`

The individual questions that make up a question set, in a fixed order.

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | ; PK | Unique identifier of the question. |
| `question_set_id` | integer | no |  | ; FK REFERENCES question_sets(id) ON DELETE CASCADE; UNIQUE (uq_question_position) | The question set this question belongs to. |
| `position` | integer | no |  | ; UNIQUE (uq_question_position) | Order of the question within its set. Unique per set. |
| `text` | text | no |  |  | The question text shown to players. |
| `type` | character varying(50) | no |  |  | The format of the question, which decides how it is presented and answered. |
| `time_limit_sec` | integer | no | `30` | ; CHECK (ck_question_time_positive) | Time allowed to answer the question, in seconds. Must be positive. |

### `session_players`

A user's seat in a session, holding their nickname, score, streaks, power-ups and current question.

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | ; PK | Unique identifier of the player seat. |
| `session_id` | integer | no |  | ; FK REFERENCES sessions(id) ON DELETE CASCADE; UNIQUE (uq_one_seat); UNIQUE (uq_player_nickname) | The session the player joined. |
| `user_id` | integer | no |  | ; FK REFERENCES users(user_id) ON DELETE RESTRICT; UNIQUE (uq_one_seat) | The user who joined. A user can hold only one seat per session. |
| `nickname` | character varying(50) | no |  | ; UNIQUE (uq_player_nickname) | Name shown for the player in this session. Unique within the session. |
| `stars` | integer | no | `0` | ; CHECK (ck_stars_not_negative) | The player's current star total. Cannot be negative. |
| `current_streak` | integer | no | `0` |  | Number of consecutive correct answers the player is on now. |
| `best_streak` | integer | no | `0` |  | The longest streak of consecutive correct answers the player reached in this session. |
| `correct_count` | integer | no | `0` |  | Number of questions the player has answered correctly. |
| `answer_count` | integer | no | `0` |  | Total number of answers the player has given. |
| `total_answer_ms` | bigint | no | `0` |  | Sum of the player's answer times, in milliseconds. Divide by `answer_count` for the average. |
| `double_star_ready` | boolean | no | `false` |  | Whether the player has a double star power-up available to use. |
| `protection_ready` | boolean | no | `false` |  | Whether the player has a protection power-up available to use. |
| `current_question_id` | integer | yes |  | FK REFERENCES questions(id) ON DELETE SET NULL | The question currently served to the player. Empty if none is being served. |
| `question_served_at` | timestamp with time zone | yes |  |  | When the current question was served, used to measure answer time and the time limit. |
| `joined_at` | timestamp with time zone | no | `now()` |  | When the player joined the session. |

### `sessions`

A live game run by a host from a question set, identified by a join code.

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | ; PK | Unique identifier of the session. |
| `host_id` | integer | no |  | ; FK REFERENCES users(user_id) ON DELETE CASCADE | The user hosting the session. |
| `question_set_id` | integer | no |  | ; FK REFERENCES question_sets(id) ON DELETE RESTRICT | The question set the session plays. |
| `join_code` | character varying(10) | no |  | ; UNIQUE (sessions_join_code_key) | Short unique code players enter to join the session. |
| `status` | character varying(50) | no | `'WAITING'` | ; CHECK (ck_session_status) | Current state of the session. It starts as `WAITING` and can only hold the values allowed by `ck_session_status`. |
| `duration_sec` | integer | no |  |  | Total length of the session, in seconds. |
| `started_at` | timestamp with time zone | yes |  |  | When the session started. Empty until it starts. |
| `ends_at` | timestamp with time zone | yes |  |  | When the session is scheduled to end, based on its start time and duration. |
| `ended_at` | timestamp with time zone | yes |  |  | When the session actually ended. Empty until it ends. |
| `created_at` | timestamp with time zone | no | `now()` |  | When the session was created. |

### `users`

People who use the app, including players and hosts.

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `user_id` | integer | no | auto number | ; PK | Unique identifier of the user. |
| `school_id` | character varying(20) | no |  | ; UNIQUE (users_school_id_key) | The user's school identification number. Unique across users. |
| `username` | character varying(50) | yes |  | UNIQUE (users_username_key) | Optional login name. Unique when set. |
| `password_hash` | character varying(60) | yes |  |  | Hashed password used for login. Never store the plain password. Empty if the user has no password set. |
| `full_name` | character varying(100) | no |  |  | The user's full name. |
| `role` | character varying(10) | no | `'PLAYER'` | ; CHECK (ck_users_role) | The user's role, which controls what they can do. It defaults to `PLAYER` and can only hold the values allowed by `ck_users_role`. |
| `created_at` | timestamp with time zone | no | `now()` |  | When the user account was created. |
| `email` | character varying(100) | no |  | ; UNIQUE (uq_users_email) | The user's email address. Unique across users. |