import { useEffect, useMemo, useState } from 'react';
import { GAME_STATUS, OFF, PLAYERS } from '../game/constants.js';

const BOT_DELAY_MS = 700;

export function useBackgammonBot(game, enabled) {
  const [isThinking, setIsThinking] = useState(false);

  const botMove = useMemo(
    () => (enabled ? chooseBotMove(game.availableMoves, game.board) : null),
    [enabled, game.availableMoves, game.board],
  );

  useEffect(() => {
    if (
      !enabled ||
      game.gameStatus !== GAME_STATUS.playing ||
      game.currentPlayer !== PLAYERS.black
    ) {
      setIsThinking(false);
      return undefined;
    }

    setIsThinking(true);

    const timer = window.setTimeout(() => {
      if (!game.dice.hasRolled) {
        game.rollDice();
        return;
      }

      if (game.dice.remaining.length === 0 || !botMove) {
        game.endTurn();
        return;
      }

      game.playMove(botMove);
    }, BOT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [botMove, enabled, game]);

  return { isThinking };
}

function chooseBotMove(moves, board) {
  if (moves.length === 0) {
    return null;
  }

  return (
    findBearOffMove(moves) ??
    findHitMove(moves) ??
    findSafePointMove(moves, board) ??
    findFurthestForwardMove(moves)
  );
}

function findBearOffMove(moves) {
  return moves.find((move) => move.destination === OFF) ?? null;
}

function findHitMove(moves) {
  return moves.find((move) => move.hit) ?? null;
}

function findSafePointMove(moves, board) {
  return (
    moves.find((move) => {
      if (move.destination === OFF) {
        return false;
      }

      const destination = board[move.destination];
      return destination?.owner === PLAYERS.black && destination.count >= 1;
    }) ?? null
  );
}

function findFurthestForwardMove(moves) {
  return [...moves].sort((first, second) => {
    const sourceDifference = getBlackSourceRank(first.source) - getBlackSourceRank(second.source);

    if (sourceDifference !== 0) {
      return sourceDifference;
    }

    return second.die - first.die;
  })[0];
}

function getBlackSourceRank(source) {
  return typeof source === 'number' ? source : 0;
}
