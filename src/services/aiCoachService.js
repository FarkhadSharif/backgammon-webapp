import { BAR, OFF, PLAYERS } from '../game/constants.js';
import { applyMove, getLegalMoves, getOpponent, getSelectableSources } from '../game/rules.js';
import { supabase } from '../lib/supabaseClient.js';

const MAX_TIPS = 5;
const MIN_TIPS = 3;
const ALL_DICE = [1, 2, 3, 4, 5, 6];

export async function getOrCreateCoachReport({ matchId, userId }) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  if (!matchId || !userId) {
    return null;
  }

  const existingReport = await getExistingReport({ matchId, userId });
  if (existingReport?.status === 'ready') {
    return existingReport;
  }

  const moves = await getMatchMoves(matchId);
  const tips = buildCoachTips(moves);
  const reportData = {
    generatedAt: new Date().toISOString(),
    engine: 'rule-based-v1',
    tips,
  };

  const summary =
    tips.length > 0
      ? `AI Coach found ${tips.length} improvement ${tips.length === 1 ? 'idea' : 'ideas'}.`
      : 'AI Coach did not find a clear pattern from this match.';

  const { data, error } = await supabase
    .from('ai_coach_reports')
    .insert({
      user_id: userId,
      match_id: matchId,
      status: 'ready',
      summary,
      report_data: reportData,
    })
    .select('id, status, summary, report_data, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function buildCoachTips(moves) {
  const tips = [];

  for (const move of moves) {
    addTip(tips, detectMissedBearOff(move));
    addTip(tips, detectMissedHit(move));
    addTip(tips, detectMissedPoint(move));
    addTip(tips, detectSaferMove(move));
    addTip(tips, detectExposedBlot(move));
    addTip(tips, detectTooManyOpponentMoves(move));
    addTip(tips, detectWastedDouble(move));

    if (tips.length >= MAX_TIPS) {
      break;
    }
  }

  for (const tip of buildSupplementalTips(moves)) {
    if (tips.length >= MIN_TIPS) {
      break;
    }

    addTip(tips, tip);
  }

  return tips.slice(0, MAX_TIPS);
}

function detectMissedBearOff(move) {
  const chosenMove = getMoveData(move);
  const bearOffMove = move.legal_moves_available?.find((candidate) => candidate.destination === OFF);

  if (!bearOffMove || chosenMove.destination === OFF) {
    return null;
  }

  return buildTip({
    move,
    type: 'missed_bear_off',
    whatHappened: `You moved from ${formatPoint(chosenMove.source)} to ${formatPoint(chosenMove.destination)} while a checker could bear off.`,
    whyRisky: 'Leaving checkers on the board gives your opponent more turns to hit or block them.',
    betterIdea: `Bear off from ${formatPoint(bearOffMove.source)} when it is legal.`,
    explanation: 'When all your checkers are home, removing one is usually stronger than shuffling it around.',
    severity: 5,
  });
}

function detectMissedHit(move) {
  const chosenMove = getMoveData(move);
  const hitMove = move.legal_moves_available?.find((candidate) => candidate.hit);

  if (!hitMove || chosenMove.hit) {
    return null;
  }

  return buildTip({
    move,
    type: 'missed_hit',
    whatHappened: `You played ${formatMove(chosenMove)} and passed up a hit on ${formatPoint(hitMove.destination)}.`,
    whyRisky: 'A loose opponent checker can escape, make a point, or hit you later.',
    betterIdea: `Consider hitting with ${formatMove(hitMove)}.`,
    explanation: 'Hitting sends that checker to the bar, which costs your opponent time and often wins tempo.',
    severity: 4,
  });
}

function detectMissedPoint(move) {
  const chosenMove = getMoveData(move);
  const pointMove = move.legal_moves_available?.find((candidate) =>
    makesPoint(candidate, move.board_state_before),
  );

  if (!pointMove || movesMatch(chosenMove, pointMove)) {
    return null;
  }

  return buildTip({
    move,
    type: 'missed_point',
    whatHappened: `You moved ${formatMove(chosenMove)} while ${formatMove(pointMove)} could make a point.`,
    whyRisky: 'Single checkers are easy targets, but made points are anchors your opponent cannot land on.',
    betterIdea: `Stack the checker on ${formatPoint(pointMove.destination)} to make that point.`,
    explanation: 'A point is two or more checkers together. Beginners should look for these before making loose moves.',
    severity: 4,
  });
}

function detectSaferMove(move) {
  const chosenMove = getMoveData(move);
  const before = move.board_state_before;
  const player = before?.currentPlayer;

  if (!before || !player || !Array.isArray(move.legal_moves_available)) {
    return null;
  }

  const candidates = move.legal_moves_available.map((candidate) => ({
    move: candidate,
    risk: evaluateMoveRisk(before, candidate, player),
  }));
  const chosen = candidates.find((candidate) => movesMatch(candidate.move, chosenMove));
  const safest = [...candidates].sort((first, second) => first.risk - second.risk)[0];

  if (!chosen || !safest || chosen.risk <= safest.risk + 1) {
    return null;
  }

  return buildTip({
    move,
    type: 'safer_move_available',
    whatHappened: `You played ${formatMove(chosenMove)}, but it left more exposed checkers than ${formatMove(safest.move)}.`,
    whyRisky: 'Extra blots give your opponent more chances to attack next turn.',
    betterIdea: `Prefer ${formatMove(safest.move)} when it keeps your checkers connected.`,
    explanation: 'A safer move is not always flashy, but it reduces the number of easy targets you leave behind.',
    severity: 3,
  });
}

function detectExposedBlot(move) {
  const chosenMove = getMoveData(move);
  const player = move.board_state_before?.currentPlayer;
  const destination = chosenMove.destination;

  if (!player || destination === OFF || !isExposedBlot(move.board_state_after, destination, player)) {
    return null;
  }

  return buildTip({
    move,
    type: 'exposed_blot',
    whatHappened: `Your move to ${formatPoint(destination)} left a single checker exposed.`,
    whyRisky: 'A single checker, called a blot, can be hit and sent back to the bar.',
    betterIdea: 'Try to land on a point with one of your own checkers or keep the checker out of direct range.',
    explanation: 'Before moving, ask: “Can this checker be hit by a normal die roll next turn?”',
    severity: 3,
  });
}

function detectTooManyOpponentMoves(move) {
  const after = move.board_state_after;
  const player = move.board_state_before?.currentPlayer;

  if (!after || !player) {
    return null;
  }

  const opponent = getOpponent(player);
  const opponentMoveCount = countLegalMovesForDice(after, opponent, ALL_DICE);

  if (opponentMoveCount < 14) {
    return null;
  }

  return buildTip({
    move,
    type: 'too_many_replies',
    whatHappened: `After move ${move.move_number}, your opponent had about ${opponentMoveCount} legal replies across normal dice rolls.`,
    whyRisky: 'When the opponent has many options, they can usually choose an attacking or building move.',
    betterIdea: 'Look for moves that block landing spots or cover your loose checkers.',
    explanation: 'Good backgammon moves often reduce the opponent’s choices, not just improve your own board.',
    severity: 2,
  });
}

function detectWastedDouble(move) {
  const chosenMove = getMoveData(move);
  const diceBefore = chosenMove.diceRemainingBefore;
  const diceAfter = chosenMove.diceRemainingAfter;

  if (!isDoubleDice(diceBefore) || !Array.isArray(diceAfter) || diceAfter.length === 0) {
    return null;
  }

  const followUpCount = countLegalMovesForDice(
    move.board_state_after,
    move.board_state_before.currentPlayer,
    diceAfter,
  );

  if (followUpCount > 0) {
    return null;
  }

  return buildTip({
    move,
    type: 'wasted_double',
    whatHappened: `A double was rolled, but ${formatMove(chosenMove)} used it in a way that left no follow-up move.`,
    whyRisky: 'Doubles are powerful because they can give you up to four moves.',
    betterIdea: 'With doubles, try the move order that keeps the most checkers playable afterward.',
    explanation: 'When you roll doubles, think of it as four copies of the same die. Plan all copies before moving the first checker.',
    severity: 3,
  });
}

function buildSupplementalTips(moves) {
  const firstMove = moves[0];

  if (!firstMove) {
    return [];
  }

  return [
    buildTip({
      move: firstMove,
      type: 'general_checklist',
      whatHappened: 'No major tactical mistake stood out from this part of the move log.',
      whyRisky: 'Backgammon still rewards checking each turn for hits, points, and exposed blots.',
      betterIdea: 'Use a quick checklist before moving: hit, make a point, cover blots, then race.',
      explanation: 'This simple order helps beginners avoid most common tactical oversights.',
      severity: 1,
    }),
    buildTip({
      move: firstMove,
      type: 'general_connection',
      whatHappened: 'Several choices depended on whether your checkers stayed connected.',
      whyRisky: 'Disconnected single checkers are easier to attack and harder to rescue.',
      betterIdea: 'When two moves look similar, choose the one that leaves more checkers paired up.',
      explanation: 'Pairs and made points are safer than lone checkers because your opponent cannot land on them.',
      severity: 1,
    }),
    buildTip({
      move: firstMove,
      type: 'general_opponent_choices',
      whatHappened: 'Some positions gave the opponent room to choose their favorite reply.',
      whyRisky: 'More legal replies means more chances for your opponent to hit, build, or escape.',
      betterIdea: 'Look for moves that block key landing points while still improving your own board.',
      explanation: 'A strong move often does two jobs: it helps your checkers and limits the opponent.',
      severity: 1,
    }),
  ];
}

function addTip(tips, tip) {
  if (!tip || tips.some((existingTip) => existingTip.type === tip.type)) {
    return;
  }

  tips.push(tip);
}

function buildTip({
  move,
  type,
  whatHappened,
  whyRisky,
  betterIdea,
  explanation,
  severity,
}) {
  return {
    moveNumber: move.move_number,
    type,
    whatHappened,
    whyRisky,
    betterIdea,
    beginnerFriendlyExplanation: explanation,
    severity,
  };
}

function evaluateMoveRisk(boardState, candidate, player) {
  const game = toRulesGame(boardState, player, [candidate.die]);
  const nextState = applyMove(game, candidate);
  const nextBoardState = {
    ...boardState,
    board: nextState.board,
    captured: nextState.captured,
    borneOff: nextState.borneOff,
  };

  const blotCount = Object.entries(nextBoardState.board).filter(
    ([point, pointState]) =>
      pointState?.owner === player &&
      pointState.count === 1 &&
      isExposedBlot(nextBoardState, Number(point), player),
  ).length;

  return blotCount * 2 + countLegalMovesForDice(nextBoardState, getOpponent(player), ALL_DICE) / 8;
}

function makesPoint(candidate, boardState) {
  if (candidate.destination === OFF) {
    return false;
  }

  const destination = boardState?.board?.[candidate.destination];
  return destination?.owner === boardState.currentPlayer && destination.count === 1;
}

function isExposedBlot(boardState, pointNumber, player) {
  const point = boardState?.board?.[pointNumber];

  if (!point || point.owner !== player || point.count !== 1) {
    return false;
  }

  const opponent = getOpponent(player);
  return ALL_DICE.some((die) => {
    const source = player === PLAYERS.white ? pointNumber - die : pointNumber + die;
    const sourcePoint = boardState.board?.[source];
    return source >= 1 && source <= 24 && sourcePoint?.owner === opponent && sourcePoint.count > 0;
  });
}

function countLegalMovesForDice(boardState, player, diceRemaining) {
  if (!boardState || !player || !Array.isArray(diceRemaining) || diceRemaining.length === 0) {
    return 0;
  }

  const game = toRulesGame(boardState, player, diceRemaining);
  return getSelectableSources(game).flatMap((source) => getLegalMoves(source, game)).length;
}

function toRulesGame(boardState, currentPlayer, diceRemaining) {
  return {
    board: boardState.board ?? {},
    captured: boardState.captured ?? { [PLAYERS.white]: 0, [PLAYERS.black]: 0 },
    borneOff: boardState.borneOff ?? { [PLAYERS.white]: 0, [PLAYERS.black]: 0 },
    currentPlayer,
    diceRemaining,
    gameStatus: boardState.gameStatus,
  };
}

function getMoveData(move) {
  return move.move_data ?? {};
}

function movesMatch(first, second) {
  return (
    first?.source === second?.source &&
    first?.destination === second?.destination &&
    first?.die === second?.die
  );
}

function isDoubleDice(dice) {
  return Array.isArray(dice) && dice.length >= 2 && dice.every((die) => die === dice[0]);
}

function formatMove(move) {
  return `${formatPoint(move.source)} to ${formatPoint(move.destination)}`;
}

function formatPoint(point) {
  if (point === BAR) {
    return 'the bar';
  }

  if (point === OFF) {
    return 'off the board';
  }

  return `point ${point}`;
}

async function getExistingReport({ matchId, userId }) {
  const { data, error } = await supabase
    .from('ai_coach_reports')
    .select('id, status, summary, report_data, created_at')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function getMatchMoves(matchId) {
  const { data, error } = await supabase
    .from('match_moves')
    .select(
      'move_number, dice_used, checker_from, checker_to, was_hit, was_bear_off, board_state_before, board_state_after, legal_moves_available, move_data, timestamp',
    )
    .eq('match_id', matchId)
    .order('move_number', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
