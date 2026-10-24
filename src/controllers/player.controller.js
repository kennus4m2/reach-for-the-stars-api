const { matchedData } = require('express-validator');
const playerService = require('../services/player.service');

async function join(req, res) {
  const { code, nickname } = matchedData(req);
  const { session, player, created } = await playerService.join(code, nickname, req.user);
  // 201 Created for a new seat, 200 OK when the account already had one (rejoin).
  res.status(created ? 201 : 200).json({
    player_id: player.id, nickname: player.nickname, stars: player.stars,
    current_streak: player.current_streak, rejoined: !created,
    session: { code: session.join_code, status: session.status },
  });
}
async function list(req, res) {
  const { code } = matchedData(req);
  const players = await playerService.list(code);
  res.json(players.map((p) => ({ nickname: p.nickname, stars: p.stars })));  // never the school ID or email
}

module.exports = { join, list };