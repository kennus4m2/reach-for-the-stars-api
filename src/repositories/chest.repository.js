const { sequelize, ChestOffer, ChestSlot } = require('../models');

const findOffer = (id) => ChestOffer.findByPk(id);
const findSlot = (offerId, slotNumber) => ChestSlot.findOne({ where: { chest_offer_id: offerId, slot_number: slotNumber } });

function open(offer, slotNumber, seat, seatChanges) {
  return sequelize.transaction(async (t) => {
    await offer.update({ status: 'OPENED', picked_slot: slotNumber, opened_at: new Date() }, { transaction: t });
    await seat.update(seatChanges, { transaction: t });
  });
}

module.exports = { findOffer, findSlot, open };