import { supabase } from '../lib/supabaseClient.js';
import { MATCH_STATUS, OPPONENT_TYPES } from '../game/matchTypes.js';
import { PLAYERS } from '../game/constants.js';

export async function createMatch({ userId, opponentType, gameSnapshot }) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({
      player1_id: userId,
      opponent_type: opponentType,
      status: MATCH_STATUS.inProgress,
      board_state: gameSnapshot.boardState,
      dice_state: gameSnapshot.diceState,
      current_turn: userId,
      current_turn_color: gameSnapshot.boardState.currentPlayer ?? PLAYERS.white,
    })
    .select('id, opponent_type, status, board_state, dice_state, started_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function finishMatch({ matchId, winnerId, winnerColor, gameSnapshot }) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('matches')
    .update({
      status: MATCH_STATUS.finished,
      winner_id: winnerId,
      winner_color: winnerColor,
      board_state: gameSnapshot.boardState,
      dice_state: gameSnapshot.diceState,
      current_turn: null,
      current_turn_color: null,
      finished_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select('id, finished_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMatchProgress({ matchId, userId, gameSnapshot }) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const currentPlayer = gameSnapshot.boardState.currentPlayer;
  const { error } = await supabase
    .from('matches')
    .update({
      board_state: gameSnapshot.boardState,
      dice_state: gameSnapshot.diceState,
      current_turn: currentPlayer === PLAYERS.white ? userId : null,
      current_turn_color: currentPlayer,
    })
    .eq('id', matchId)
    .eq('status', MATCH_STATUS.inProgress);

  if (error) {
    throw error;
  }
}

export async function recordMatchMove({ matchId, playerId, moveLog }) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  if (!matchId || !playerId || !moveLog) {
    return;
  }

  const moveNumber = await getNextMoveNumber(matchId);

  const { error } = await supabase.from('match_moves').insert({
    match_id: matchId,
    player_id: playerId,
    move_number: moveNumber,
    dice_used: moveLog.diceUsed,
    checker_from: moveLog.checkerFrom,
    checker_to: moveLog.checkerTo,
    was_hit: moveLog.wasHit,
    was_bear_off: moveLog.wasBearOff,
    board_state_before: moveLog.boardStateBefore,
    move_data: moveLog.moveData,
    board_state_after: moveLog.boardStateAfter,
    legal_moves_available: moveLog.legalMovesAvailable,
    timestamp: moveLog.timestamp,
  });

  if (error) {
    throw error;
  }
}

async function getNextMoveNumber(matchId) {
  const { data, error } = await supabase
    .from('match_moves')
    .select('move_number')
    .eq('match_id', matchId)
    .order('move_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.move_number ?? 0) + 1;
}

export async function getUnfinishedMatch() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('matches')
    .select(
      'id, player1_id, player2_id, opponent_type, status, board_state, dice_state, current_turn_color, started_at, updated_at',
    )
    .eq('status', MATCH_STATUS.inProgress)
    .neq('opponent_type', OPPONENT_TYPES.humanOnline)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function abandonMatch(matchId) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('matches')
    .update({
      status: MATCH_STATUS.abandoned,
      finished_at: new Date().toISOString(),
      current_turn: null,
      current_turn_color: null,
    })
    .eq('id', matchId)
    .eq('status', MATCH_STATUS.inProgress);

  if (error) {
    throw error;
  }
}

export async function getMatchHistory() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('matches')
    .select(
      'id, player1_id, player2_id, opponent_type, status, winner_id, winner_color, started_at, finished_at',
    )
    .order('started_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
