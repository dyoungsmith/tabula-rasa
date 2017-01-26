import _ from 'lodash';
import initializeQuests from '../helpers/questHelper';
import assignCharacters from '../helpers/charactersHelper';
import db from '../../../../db';

export default () => (dispatch, getState) => {

  const {
    game: {
      players,
      gameId
    }
  } = getState();

  const playerIds = players.map(player => player.playerId);
  const numPlayers = _.values(players).length;
  const turnOrder = _.shuffle(playerIds).join(',');

  const [
    quest1,
    quest2,
    quest3,
    quest4,
    quest5
  ] = initializeQuests(numPlayers);

  const characters = assignCharacters(playerIds);

  db.ref(`games/${gameId}`).update({
    status: 'TEAMMAKE',
    turnOrder,
    quest1,
    quest2,
    quest3,
    quest4,
    quest5
  });

  characters.forEach(character =>
    db.ref(`games/${gameId}/players/${character.playerId}`).update(character));
};
