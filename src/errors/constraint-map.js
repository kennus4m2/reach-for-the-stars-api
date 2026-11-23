// A database rule was broken -> what the client should hear.
// The key is the constraint name from YOUR migration. PostgreSQL names a
// foreign key "<table>_<column>_fkey" when the migration does not name it.
// Write one entry for each constraint a client can hit. Example:
//
//   uq_player_nickname: {
//     status: 409,
//     code: 'NICKNAME_TAKEN',
//     message: 'That nickname is already used in this game.',
//   },
//
// A constraint that is not listed here still answers 409, with the code CONFLICT.
module.exports = {
  uq_player_nickname: { status: 409, code: 'NICKNAME_TAKEN', message: 'That nickname is already used in this game.' },
  uq_one_seat: { status: 409, code: 'ALREADY_JOINED', message: 'This account already has a seat in this game.' },
  sessions_question_set_id_fkey: { status: 409, code: 'QUESTION_SET_IN_USE', message: 'This question set was used in a game and cannot be deleted.' },
  users_school_id_key: { status: 409, code: 'SCHOOL_ID_TAKEN', message: 'An account with this school ID already exists.' },
  uq_users_email: { status: 409, code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' },
  uq_one_answer_per_question: { status: 409, code: 'ALREADY_ANSWERED', message: 'You already answered this question.' },
};