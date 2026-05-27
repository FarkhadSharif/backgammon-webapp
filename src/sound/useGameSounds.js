import { useEffect, useRef } from 'react';
import { GAME_STATUS } from '../game/constants.js';
import { useSound } from './useSound.js';

export function useGameSounds(game, { enabled = true, isLocalPlayer = true } = {}) {
  const { playSound } = useSound();
  const previousRef = useRef({
    hasRolled: game.dice.hasRolled,
    lastMoveTimestamp: game.lastMoveLog?.timestamp,
    gameStatus: game.gameStatus,
    winner: game.winner,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const previous = previousRef.current;
    const currentMoveTimestamp = game.lastMoveLog?.timestamp;

    if (!previous.hasRolled && game.dice.hasRolled) {
      playSound('diceRoll');
    }

    if (currentMoveTimestamp && currentMoveTimestamp !== previous.lastMoveTimestamp) {
      playSound('checkerMove');
    }

    if (
      previous.gameStatus !== GAME_STATUS.finished &&
      game.gameStatus === GAME_STATUS.finished
    ) {
      playSound(isLocalPlayer ? 'win' : 'notification');
    }

    previousRef.current = {
      hasRolled: game.dice.hasRolled,
      lastMoveTimestamp: currentMoveTimestamp,
      gameStatus: game.gameStatus,
      winner: game.winner,
    };
  }, [
    enabled,
    game.dice.hasRolled,
    game.gameStatus,
    game.lastMoveLog?.timestamp,
    game.winner,
    isLocalPlayer,
    playSound,
  ]);
}
