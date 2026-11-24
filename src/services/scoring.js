// The pure rules of Reach for the Stars. No database here, so they are easy to unit-test.
const CHEST_EVERY = 5;          // every 5th correct answer in a row offers a Mystery Chest

const isLate = (elapsedMs, limitSec) => elapsedMs > limitSec * 1000;     // exactly at the limit is still on time

// seat: { stars, current_streak, best_streak, double_star_ready, protection_ready }
function applyAnswer(seat, correct) {
  let { stars, current_streak: streak, best_streak: best, double_star_ready: doubleReady, protection_ready: protectionReady } = seat;
  let earned = 0;
  let usedDouble = false;
  let usedProtection = false;
  if (correct) {
    usedDouble = doubleReady;
    earned = doubleReady ? 2 : 1;
    doubleReady = false;
    streak += 1;
    best = Math.max(best, streak);
  } else if (protectionReady) {          // a protection card saves the stars and the streak once
    usedProtection = true;
    protectionReady = false;
  } else {
    earned = stars > 0 ? -1 : 0;         // stars never go below 0
    streak = 0;
  }
  return {
    stars: stars + earned, streak, best, doubleReady, protectionReady,
    earned, usedDouble, usedProtection, chest: correct && streak % CHEST_EVERY === 0,
  };
}

// Equal stars share a rank: 1, 2, 2, 4. rows must be sorted best first.
function rankByStars(rows) {
  let rank = 0;
  return rows.map((row, i) => {
    if (i === 0 || row.stars !== rows[i - 1].stars) rank = i + 1;
    return { ...row, rank };
  });
}

module.exports = { CHEST_EVERY, isLate, applyAnswer, rankByStars };