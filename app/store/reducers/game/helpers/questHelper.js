import { DEFAULT_QUEST } from '../../../constants';

export default function initializeQuests (numberOfPlayers) {
  const _QUESTS = [1, 2, 3, 4, 5];

  return _QUESTS.map(i => {
    switch (i) { // switch on quest number
      case 1:
        if (numberOfPlayers < 8) return Object.assign({}, DEFAULT_QUEST, {
          requiredPlayers: 2,
          numberOfFailsNeeded: 1
        });
        else return Object.assign({}, DEFAULT_QUEST, {
          requiredPlayers: 3,
          numberOfFailsNeeded: 1
        });

      case 2:
        if (numberOfPlayers < 8) return Object.assign({},
          DEFAULT_QUEST, {
          requiredPlayers: 3,
          numberOfFailsNeeded: 1
        });
        else return Object.assign({}, DEFAULT_QUEST, {
          requiredPlayers: 4,
          numberOfFailsNeeded: 1
        });

      case 3:
        if (numberOfPlayers === 5) return Object.assign({},
          DEFAULT_QUEST, {
          requiredPlayers: 2,
          numberOfFailsNeeded: 1
        });
        else if (numberOfPlayers === 6) return Object.assign({},
          DEFAULT_QUEST, {
          requiredPlayers: 4,
          numberOfFailsNeeded: 1
        });
        else if (numberOfPlayers === 7) return Object.assign({},
          DEFAULT_QUEST, {
          requiredPlayers: 3,
          numberOfFailsNeeded: 1
        });
        else return Object.assign({}, DEFAULT_QUEST, {
          requiredPlayers: 4,
          numberOfFailsNeeded: 1
        });

      case 4:
        if (numberOfPlayers < 7) return Object.assign({},
          DEFAULT_QUEST, {
          requiredPlayers: 3,
          numberOfFailsNeeded: 1
        });
        else if (numberOfPlayers === 7) return Object.assign({},
          DEFAULT_QUEST, {
          requiredPlayers: 4,
          numberOfFailsNeeded: 2
        });
        else return Object.assign({}, DEFAULT_QUEST, {
          requiredPlayers: 5,
          numberOfFailsNeeded: 2
        });

      case 5:
        if (numberOfPlayers === 5) return Object.assign({},
          DEFAULT_QUEST, {
          requiredPlayers: 3,
          numberOfFailsNeeded: 1
        });
        else if (numberOfPlayers < 8) return Object.assign({},
          DEFAULT_QUEST, {
          requiredPlayers: 4,
          numberOfFailsNeeded: 1
        });
        else return Object.assign({}, DEFAULT_QUEST, {
          requiredPlayers: 5,
          numberOfFailsNeeded: 1
        });
    }
  });
};
