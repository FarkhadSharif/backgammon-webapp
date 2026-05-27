import { BAR, CHECKERS_TO_WIN, OFF, PLAYER_DIRECTION, PLAYERS } from './constants.js';

export function getOpponent(player) {
  return player === PLAYERS.white ? PLAYERS.black : PLAYERS.white;
}

export function buildDiceValues(dieA, dieB) {
  return dieA === dieB ? [dieA, dieA, dieA, dieA] : [dieA, dieB];
}

export function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

export function hasPlayerWon(player, borneOff) {
  return borneOff[player] >= CHECKERS_TO_WIN;
}

export function canSelectSource(source, game) {
  const { board, captured, currentPlayer, diceRemaining } = game;

  if (diceRemaining.length === 0) {
    return false;
  }

  if (captured[currentPlayer] > 0) {
    return source === BAR;
  }

  if (source === BAR) {
    return captured[currentPlayer] > 0;
  }

  const point = board[source];
  return point?.owner === currentPlayer && point.count > 0;
}

export function getSelectableSources(game) {
  const { board, captured, currentPlayer } = game;

  if (game.diceRemaining.length === 0) {
    return [];
  }

  if (captured[currentPlayer] > 0) {
    return getLegalMoves(BAR, game).length > 0 ? [BAR] : [];
  }

  return Object.entries(board)
    .filter(([, point]) => point?.owner === currentPlayer && point.count > 0)
    .map(([pointNumber]) => Number(pointNumber))
    .filter((pointNumber) => getLegalMoves(pointNumber, game).length > 0);
}

export function getLegalMoves(source, game) {
  if (!canSelectSource(source, game)) {
    return [];
  }

  const uniqueDice = [...new Set(game.diceRemaining)];

  return uniqueDice
    .map((die) => buildMove(source, die, game))
    .filter(Boolean);
}

export function buildMove(source, die, game) {
  const { board, currentPlayer } = game;
  const destination = getDestination(source, die, game);

  if (destination === null) {
    return null;
  }

  if (destination === OFF) {
    return { source, destination, die, hit: false };
  }

  const target = board[destination];
  const opponent = getOpponent(currentPlayer);

  if (target?.owner === opponent && target.count > 1) {
    return null;
  }

  return {
    source,
    destination,
    die,
    hit: target?.owner === opponent && target.count === 1,
  };
}

function getDestination(source, die, game) {
  const { currentPlayer } = game;

  if (source === BAR) {
    return currentPlayer === PLAYERS.white ? 25 - die : die;
  }

  const destination = source + PLAYER_DIRECTION[currentPlayer] * die;

  if (destination >= 1 && destination <= 24) {
    return destination;
  }

  return canBearOffFrom(source, die, game) ? OFF : null;
}

function canBearOffFrom(source, die, game) {
  const { board, currentPlayer } = game;

  if (!areAllCheckersInHomeBoard(game)) {
    return false;
  }

  if (currentPlayer === PLAYERS.white) {
    const exactDistance = source;
    if (die === exactDistance) {
      return true;
    }

    return die > exactDistance && !hasWhiteCheckerBehind(board, source);
  }

  const exactDistance = 25 - source;
  if (die === exactDistance) {
    return true;
  }

  return die > exactDistance && !hasBlackCheckerBehind(board, source);
}

function areAllCheckersInHomeBoard(game) {
  const { board, captured, currentPlayer } = game;

  if (captured[currentPlayer] > 0) {
    return false;
  }

  return Object.entries(board).every(([pointNumber, point]) => {
    if (point?.owner !== currentPlayer) {
      return true;
    }

    const number = Number(pointNumber);
    return currentPlayer === PLAYERS.white ? number <= 6 : number >= 19;
  });
}

function hasWhiteCheckerBehind(board, source) {
  return Object.entries(board).some(([pointNumber, point]) => {
    const number = Number(pointNumber);
    return point?.owner === PLAYERS.white && number > source;
  });
}

function hasBlackCheckerBehind(board, source) {
  return Object.entries(board).some(([pointNumber, point]) => {
    const number = Number(pointNumber);
    return point?.owner === PLAYERS.black && number < source;
  });
}

export function applyMove(game, move) {
  const nextBoard = structuredClone(game.board);
  const nextCaptured = { ...game.captured };
  const nextBorneOff = { ...game.borneOff };
  const { currentPlayer } = game;
  const opponent = getOpponent(currentPlayer);

  if (move.source === BAR) {
    nextCaptured[currentPlayer] -= 1;
  } else {
    removeChecker(nextBoard, move.source);
  }

  if (move.destination === OFF) {
    nextBorneOff[currentPlayer] += 1;
  } else {
    const target = nextBoard[move.destination];

    if (target?.owner === opponent && target.count === 1) {
      nextBoard[move.destination] = null;
      nextCaptured[opponent] += 1;
    }

    addChecker(nextBoard, move.destination, currentPlayer);
  }

  return {
    board: nextBoard,
    captured: nextCaptured,
    borneOff: nextBorneOff,
    diceRemaining: removeUsedDie(game.diceRemaining, move.die),
  };
}

function removeChecker(board, pointNumber) {
  const point = board[pointNumber];

  if (!point) {
    return;
  }

  board[pointNumber] = point.count === 1 ? null : { ...point, count: point.count - 1 };
}

function addChecker(board, pointNumber, owner) {
  const point = board[pointNumber];
  board[pointNumber] = point
    ? { ...point, count: point.count + 1 }
    : { owner, count: 1 };
}

function removeUsedDie(diceRemaining, die) {
  const dieIndex = diceRemaining.indexOf(die);
  return diceRemaining.filter((_, index) => index !== dieIndex);
}
