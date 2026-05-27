export const OPPONENT_TYPES = {
  bot: 'bot',
  localHuman: 'human_local',
  humanOnline: 'human_online',
};

export const OPPONENT_LABEL = {
  [OPPONENT_TYPES.bot]: 'Play vs Bot',
  [OPPONENT_TYPES.localHuman]: 'Local 2 Player',
  [OPPONENT_TYPES.humanOnline]: 'Online Game',
};

export const MATCH_STATUS = {
  inProgress: 'in_progress',
  finished: 'finished',
  abandoned: 'abandoned',
};
