const playerRepository = require('../repositories/player.repository');
const sessionService = require('./session.service');
const { conflict } = require('../errors/app-error');

const MAX_PLAYERS = 30; // from our design: game-info max_players

async function join(code, nickname, user) {
  const session = await sessionService.findOrFail(code);

  // Rejoin: this account already has a seat here. Same row, same stars.
  const seat = await playerRepository.findSeat(session.id, user.user_id);
  if (seat) return { session, player: seat, created: false };

  // New seat: only while the game is waiting, and only if there is room.
  if (session.status !== 'WAITING') {
    throw conflict('GAME_ALREADY_STARTED', 'This game has already started. New players cannot join.');
  }
  if ((await playerRepository.countBySession(session.id)) >= MAX_PLAYERS) {
    throw conflict('SESSION_FULL', `This game already has ${MAX_PLAYERS} players.`);
  }
  const player = await playerRepository.create({ session_id: session.id, user_id: user.user_id, nickname });
  return { session, player, created: true };
}
async function list(code) {
  const session = await sessionService.findOrFail(code);
  return playerRepository.findAllBySession(session.id);
}

module.exports = { join, list };