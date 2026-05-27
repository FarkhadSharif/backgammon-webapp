import { useMemo, useState } from 'react';
import {
  BAR,
  GAME_STATUS,
  OFF,
  initialBoard,
  initialBorneOff,
  initialCaptured,
  PLAYERS,
} from '../game/constants.js';
import {
  applyMove,
  buildDiceValues,
  getLegalMoves,
  getOpponent,
  getSelectableSources,
  hasPlayerWon,
  rollDie,
} from '../game/rules.js';

const initialDice = {
  values: [],
  remaining: [],
  hasRolled: false,
};

export function useBackgammonGame() {
  const [board, setBoard] = useState(initialBoard);
  const [captured, setCaptured] = useState(initialCaptured);
  const [borneOff, setBorneOff] = useState(initialBorneOff);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYERS.white);
  const [dice, setDice] = useState(initialDice);
  const [selectedSource, setSelectedSource] = useState(null);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.playing);
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [lastMoveLog, setLastMoveLog] = useState(null);
  const [stateVersion, setStateVersion] = useState(0);

  const game = useMemo(
    () => ({
      board,
      captured,
      borneOff,
      currentPlayer,
      diceRemaining: dice.remaining,
      gameStatus,
    }),
    [board, borneOff, captured, currentPlayer, dice.remaining, gameStatus],
  );

  const selectableSources = useMemo(
    () => (gameStatus === GAME_STATUS.finished ? [] : getSelectableSources(game)),
    [game, gameStatus],
  );

  const legalMoves = useMemo(
    () =>
      selectedSource === null || gameStatus === GAME_STATUS.finished
        ? []
        : getLegalMoves(selectedSource, game),
    [game, gameStatus, selectedSource],
  );

  const highlightedDestinations = useMemo(
    () => legalMoves.map((move) => move.destination),
    [legalMoves],
  );

  const availableMoves = useMemo(
    () =>
      gameStatus === GAME_STATUS.finished
        ? []
        : selectableSources.flatMap((source) => getLegalMoves(source, game)),
    [game, gameStatus, selectableSources],
  );

  function rollDice() {
    if (gameStatus === GAME_STATUS.finished || dice.hasRolled) {
      return false;
    }

    const dieA = rollDie();
    const dieB = rollDie();
    const values = buildDiceValues(dieA, dieB);

    setDice({
      values: [dieA, dieB],
      remaining: values,
      hasRolled: true,
    });
    setSelectedSource(null);
    setLastMove(null);
    setStateVersion((version) => version + 1);
    return true;
  }

  function selectSource(source) {
    if (gameStatus === GAME_STATUS.finished || !dice.hasRolled) {
      return;
    }

    if (!selectableSources.includes(source)) {
      setSelectedSource(null);
      return;
    }

    setSelectedSource((current) => (current === source ? null : source));
  }

  function moveTo(destination) {
    if (gameStatus === GAME_STATUS.finished) {
      return false;
    }

    const move = legalMoves.find((candidate) => candidate.destination === destination);

    if (!move) {
      return false;
    }

    const nextState = applyMove(game, move);
    commitMove(nextState, move, buildMoveLog(game, nextState, move, availableMoves));
    return true;
  }

  function playMove(move) {
    if (gameStatus === GAME_STATUS.finished) {
      return false;
    }

    const isLegalMove = availableMoves.some(
      (candidate) =>
        candidate.source === move.source &&
        candidate.destination === move.destination &&
        candidate.die === move.die,
    );

    if (!isLegalMove) {
      return false;
    }

    const nextState = applyMove(game, move);
    commitMove(nextState, move, buildMoveLog(game, nextState, move, availableMoves));
    return true;
  }

  function commitMove(nextState, move, moveLog) {
    setBoard(nextState.board);
    setCaptured(nextState.captured);
    setBorneOff(nextState.borneOff);
    setDice((current) => ({
      ...current,
      remaining: nextState.diceRemaining,
    }));
    setSelectedSource(null);
    setLastMove(move ?? null);
    setLastMoveLog(moveLog ?? null);
    setStateVersion((version) => version + 1);

    if (hasPlayerWon(currentPlayer, nextState.borneOff)) {
      setGameStatus(GAME_STATUS.finished);
      setWinner(currentPlayer);
      setDice(initialDice);
    }
  }

  function endTurn() {
    if (gameStatus === GAME_STATUS.finished) {
      return false;
    }

    setCurrentPlayer((player) => getOpponent(player));
    setDice(initialDice);
    setSelectedSource(null);
    setLastMove(null);
    setLastMoveLog(null);
    setStateVersion((version) => version + 1);
    return true;
  }

  function resetGame() {
    setBoard(initialBoard);
    setCaptured(initialCaptured);
    setBorneOff(initialBorneOff);
    setCurrentPlayer(PLAYERS.white);
    setDice(initialDice);
    setSelectedSource(null);
    setGameStatus(GAME_STATUS.playing);
    setWinner(null);
    setLastMove(null);
    setLastMoveLog(null);
    setStateVersion((version) => version + 1);
  }

  function surrender(winnerColor) {
    if (gameStatus === GAME_STATUS.finished || !winnerColor) {
      return false;
    }

    setGameStatus(GAME_STATUS.finished);
    setWinner(winnerColor);
    setDice(initialDice);
    setSelectedSource(null);
    setLastMove(null);
    setLastMoveLog(null);
    setStateVersion((version) => version + 1);
    return true;
  }

  function loadGame({ boardState, diceState }) {
    setBoard(boardState?.board ?? initialBoard);
    setCaptured(boardState?.captured ?? initialCaptured);
    setBorneOff(boardState?.borneOff ?? initialBorneOff);
    setCurrentPlayer(boardState?.currentPlayer ?? PLAYERS.white);
    setDice(diceState ?? initialDice);
    setSelectedSource(null);
    setGameStatus(boardState?.gameStatus ?? GAME_STATUS.playing);
    setWinner(boardState?.winner ?? null);
    setLastMove(null);
    setLastMoveLog(null);
    setStateVersion((version) => version + 1);
  }

  return {
    board,
    captured,
    borneOff,
    currentPlayer,
    dice,
    gameStatus,
    winner,
    lastMove,
    lastMoveLog,
    stateVersion,
    selectedSource,
    selectableSources,
    availableMoves,
    highlightedDestinations,
    legalMoves,
    hasBarSelection: selectedSource === BAR,
    rollDice,
    selectSource,
    moveTo,
    playMove,
    endTurn,
    surrender,
    resetGame,
    loadGame,
  };
}

function buildMoveLog(game, nextState, move, legalMovesAvailable) {
  const didWin = hasPlayerWon(game.currentPlayer, nextState.borneOff);

  return {
    diceUsed: [move.die],
    checkerFrom: move.source,
    checkerTo: move.destination,
    wasHit: Boolean(move.hit),
    wasBearOff: move.destination === OFF,
    boardStateBefore: buildBoardState(game),
    boardStateAfter: buildBoardState({
      ...game,
      board: nextState.board,
      captured: nextState.captured,
      borneOff: nextState.borneOff,
      gameStatus: didWin ? GAME_STATUS.finished : game.gameStatus,
      winner: didWin ? game.currentPlayer : null,
    }),
    legalMovesAvailable,
    moveData: {
      ...move,
      diceRemainingBefore: game.diceRemaining,
      diceRemainingAfter: nextState.diceRemaining,
    },
    timestamp: new Date().toISOString(),
  };
}

function buildBoardState(game) {
  return {
    board: game.board,
    captured: game.captured,
    borneOff: game.borneOff,
    currentPlayer: game.currentPlayer,
    gameStatus: game.gameStatus,
    winner: game.winner ?? null,
  };
}
