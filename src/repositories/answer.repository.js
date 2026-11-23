const { sequelize, Answer, ChestOffer, ChestSlot } = require('../models');

const find = (playerId, questionId) => Answer.findOne({ where: { player_id: playerId, question_id: questionId } });

// One answer, the seat's new numbers and (maybe) a chest: all saved together or not at all.
function record({ seat, answer, seatChanges, chestRewards }) {
  return sequelize.transaction(async (t) => {
    const saved = await Answer.create(answer, { transaction: t });
    await seat.update(seatChanges, { transaction: t });
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

module.exports = { find, record };