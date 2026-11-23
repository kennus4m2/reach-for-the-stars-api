const { isLate, applyAnswer, rankByStars, CHEST_EVERY } = require('../../src/services/scoring');

const seat = (over = {}) => ({ stars: 0, current_streak: 0, best_streak: 0, double_star_ready: false, protection_ready: false, ...over });

describe('isLate (limit 20 s)', () => {
  test('0 ms is on time', () => expect(isLate(0, 20)).toBe(false));
  test('exactly at the limit is still on time', () => expect(isLate(20000, 20)).toBe(false));
  test('1 ms over the limit is late', () => expect(isLate(20001, 20)).toBe(true));
});
describe('applyAnswer', () => {
  test('a correct answer gives 1 star and grows the streak', () => {
    expect(applyAnswer(seat(), true)).toMatchObject({ stars: 1, streak: 1, earned: 1, chest: false });
  });
  test('a wrong answer takes 1 star and breaks the streak', () => {
    expect(applyAnswer(seat({ stars: 3, current_streak: 2, best_streak: 2 }), false)).toMatchObject({ stars: 2, streak: 0, best: 2 });
  });
  test('stars never go below 0', () => expect(applyAnswer(seat({ stars: 0 }), false).stars).toBe(0));
  test('a double star gives 2 stars, once', () => {
    const r = applyAnswer(seat({ double_star_ready: true }), true);
    expect(r).toMatchObject({ stars: 2, earned: 2, usedDouble: true, doubleReady: false });
  });
  test('a protection card keeps the stars and the streak', () => {
    const r = applyAnswer(seat({ stars: 4, current_streak: 3, protection_ready: true }), false);
    expect(r).toMatchObject({ stars: 4, streak: 3, usedProtection: true, protectionReady: false });
  });
  test(`the ${CHEST_EVERY}th correct answer in a row offers a chest`, () => {
    expect(applyAnswer(seat({ current_streak: 4 }), true).chest).toBe(true);
    expect(applyAnswer(seat({ current_streak: 3 }), true).chest).toBe(false);
  });
});
describe('rankByStars', () => {
  test('equal stars share a rank: 1, 2, 2, 4', () => {
    expect(rankByStars([{ stars: 5 }, { stars: 3 }, { stars: 3 }, { stars: 2 }]).map((r) => r.rank)).toEqual([1, 2, 2, 4]);
  });
  test('an empty list stays empty', () => expect(rankByStars([])).toEqual([]));
});
