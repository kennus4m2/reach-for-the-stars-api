'use strict';
const Q = [
  ['Which planet is closest to the Sun?', ['Mercury', 'Venus', 'Earth', 'Mars'], 0],
  ['What is the chemical formula of water?', ['CO2', 'H2O', 'O2', 'NaCl'], 1],
  ['Which force pulls objects toward Earth?', ['Magnetism', 'Friction', 'Gravity', 'Inertia'], 2],
  ['Which is the largest planet?', ['Mars', 'Saturn', 'Earth', 'Jupiter'], 3],
  ['Which gas do plants absorb for photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'], 2],
];
module.exports = {
  async up(q) {
    const db = q.sequelize;
    const [[h]] = await db.query("SELECT id FROM users WHERE school_id = '2099-0001'");
    await q.bulkInsert('question_sets', [{ host_id: h.id, title: 'Science Basics', description: 'Planets and more', subject: 'Science', grade_level: 'College' }]);
    const [[s]] = await db.query("SELECT id FROM question_sets WHERE title = 'Science Basics'");
    await q.bulkInsert('questions', Q.map((x, i) => ({ question_set_id: s.id, position: i + 1, text: x[0], type: 'multiple_choice', time_limit_sec: 20 })));
    const [qs] = await db.query(`SELECT id FROM questions WHERE question_set_id = ${s.id} ORDER BY position`);
    const rows = [];
    qs.forEach((r, i) => Q[i][1].forEach((t, j) => rows.push({ question_id: r.id, choice_index: j, text: t, is_correct: j === Q[i][2] })));
    await q.bulkInsert('choices', rows);
  },
  async down(q) { await q.bulkDelete('question_sets', { title: 'Science Basics' }, {}); },
};
