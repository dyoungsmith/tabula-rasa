import _ from 'lodash';
import db from '../../../../db';

export default playerId => (dispatch, getState) => {
  const { game: { gameId, proposedTeam } } = getState();

  // sanity checking
  if (!_.includes(proposedTeam, playerId))
    throw new Error('Is not even on the team!');

  let newTeam = proposedTeam.filter(id => id !== playerId);
  newTeam = newTeam.join(',');
  db.ref(`games/${gameId}`).update({ proposedTeam: newTeam });
}
