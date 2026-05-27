export const SOUND_CATEGORIES = {
  ui: 'ui',
  dice: 'dice',
  checker: 'checker',
  result: 'result',
  notification: 'notification',
};

export const soundPacks = {
  default: {
    id: 'default',
    name: 'Modern Wood',
    basePath: '/sounds/default/',
    events: {
      uiHover: { category: SOUND_CATEGORIES.ui, synth: 'woodHover', cooldown: 120 },
      uiClick: { category: SOUND_CATEGORIES.ui, synth: 'woodClick', cooldown: 80 },
      diceRoll: { category: SOUND_CATEGORIES.dice, synth: 'softDice', cooldown: 350 },
      checkerMove: { category: SOUND_CATEGORIES.checker, synth: 'checkerClick', cooldown: 80 },
      win: { category: SOUND_CATEGORIES.result, synth: 'cleanWin', cooldown: 1200 },
      lose: { category: SOUND_CATEGORIES.result, synth: 'softLose', cooldown: 1200 },
      notification: { category: SOUND_CATEGORIES.notification, synth: 'softNotice', cooldown: 450 },
      matchStart: { category: SOUND_CATEGORIES.notification, synth: 'matchStart', cooldown: 1000 },
    },
  },
  kazakh: {
    id: 'kazakh',
    name: 'Kazakh Heritage',
    basePath: '/sounds/kazakh/',
    events: {
      uiHover: { category: SOUND_CATEGORIES.ui, synth: 'dombraHover', cooldown: 140 },
      uiClick: { category: SOUND_CATEGORIES.ui, synth: 'dombraClick', cooldown: 100 },
      diceRoll: { category: SOUND_CATEGORIES.dice, synth: 'woodPercussion', cooldown: 380 },
      checkerMove: { category: SOUND_CATEGORIES.checker, synth: 'dombraPluck', cooldown: 90 },
      win: { category: SOUND_CATEGORIES.result, synth: 'kazakhWin', cooldown: 1400 },
      lose: { category: SOUND_CATEGORIES.result, synth: 'kobyzResolve', cooldown: 1400 },
      notification: { category: SOUND_CATEGORIES.notification, synth: 'steppeNotice', cooldown: 520 },
      matchStart: { category: SOUND_CATEGORIES.notification, synth: 'steppeStart', cooldown: 1200 },
    },
  },
};

export function getSoundPackForSkin(skin) {
  return skin === 'kazakh-heritage' ? soundPacks.kazakh : soundPacks.default;
}
