export const PLAYERS = {
  white: 'white',
  black: 'black',
};

export const GAME_STATUS = {
  playing: 'playing',
  finished: 'finished',
};

export const CHECKERS_TO_WIN = 15;

export const PLAYER_LABEL = {
  [PLAYERS.white]: 'White',
  [PLAYERS.black]: 'Black',
};

export const PLAYER_DIRECTION = {
  [PLAYERS.white]: -1,
  [PLAYERS.black]: 1,
};

export const BAR = 'bar';
export const OFF = 'off';

export const initialBoard = {
  1: { owner: PLAYERS.black, count: 2 },
  2: null,
  3: null,
  4: null,
  5: null,
  6: { owner: PLAYERS.white, count: 5 },
  7: null,
  8: { owner: PLAYERS.white, count: 3 },
  9: null,
  10: null,
  11: null,
  12: { owner: PLAYERS.black, count: 5 },
  13: { owner: PLAYERS.white, count: 5 },
  14: null,
  15: null,
  16: null,
  17: { owner: PLAYERS.black, count: 3 },
  18: null,
  19: { owner: PLAYERS.black, count: 5 },
  20: null,
  21: null,
  22: null,
  23: null,
  24: { owner: PLAYERS.white, count: 2 },
};

export const initialCaptured = {
  [PLAYERS.white]: 0,
  [PLAYERS.black]: 0,
};

export const initialBorneOff = {
  [PLAYERS.white]: 0,
  [PLAYERS.black]: 0,
};
