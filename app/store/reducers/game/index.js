import _ from 'lodash';
import { UPDATE_GAME, DEFAULT_GAME, DEFAULT_QUEST } from '../../constants';

export const updateGame = gameFromFirebase => {
  const game = Object.assign({}, gameFromFirebase);

  // transform to array
  game.players = _.values(game.players);
  // transform from comma delimited string to array
  game.proposedTeam = !game.proposedTeam ? [] : game.proposedTeam.split(',');
  // transform from comma delimited string to array
  game.turnOrder = !game.turnOrder ? [] : game.turnOrder.split(',');
  // transform each quest into quests array
  game.quests = [
    game.quest1 || DEFAULT_QUEST,
    game.quest2 || DEFAULT_QUEST,
    game.quest3 || DEFAULT_QUEST,
    game.quest4 || DEFAULT_QUEST,
    game.quest5 || DEFAULT_QUEST
  ];

  delete game.quest1;
  delete game.quest2;
  delete game.quest3;
  delete game.quest4;
  delete game.quest5;

  return {
    type: UPDATE_GAME,
    game
  };
};

export { default as createGame } from './thunks/createGame';
export { default as joinGame } from './thunks/joinGame';
export { default as startGame } from './thunks/startGame';
export { default as takeOnQuest } from './thunks/takeOnQuest';
export { default as removeFromQuest } from './thunks/removeFromQuest';
export { default as proposeTeam } from './thunks/proposeTeam';

export default function (state = DEFAULT_GAME, action) {
  switch (action.type) {
    case UPDATE_GAME: return Object.assign({}, state, action.game);
    default: return state;
  }
}
