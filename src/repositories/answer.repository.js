const { sequelize, SessionPlayer, Answer, ChestOffer, ChestSlot } = require('../models');
const { conflict } = require('../errors/app-error');

// the player's most recent answer (used to say "you already answered this one")
const findLatest = (playerId) => Answer.findOne({ where: { player_id: playerId }, order: [['id', 'DESC']] });

// One answer, the seat's new numbers and (maybe) a chest: all saved together or not at all.
function record({ seat, answer, seatChanges, chestRewards }) {
  return sequelize.transaction(async (t) => {
    // Lock the seat: two answers to the same served question at once cannot both pass.
    const locked = await SessionPlayer.findByPk(seat.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (locked.current_question_id !== answer.question_id) {
      throw conflict('ALREADY_ANSWERED', 'You already answered this question. Ask for the next one with GET /question.');
    }
    const saved = await Answer.create(answer, { transaction: t });
    await locked.update(seatChanges, { transaction: t });
    let offer = null;
    if (chestRewards) {
      offer = await ChestOffer.create({ answer_id: saved.id, player_id: seat.id, status: 'PENDING' }, { transaction: t });
      await ChestSlot.bulkCreate(
        chestRewards.map((reward_type, i) => ({ chest_offer_id: offer.id, slot_number: i + 1, reward_type })),
        { transaction: t });
    }
    return { saved, offer };
  });
}

module.exports = { findLatest, record };
