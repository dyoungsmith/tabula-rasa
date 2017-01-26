import _ from 'lodash';
import db from '../../../../db';

export default playerId => (dispatch, getState) => {
  const { game: { gameId, proposedTeam } } = getState();

  // sanity checking
  if (_.includes(proposedTeam, playerId))
    throw new Error('Duplicate team member');

  let newTeam = [...proposedTeam, playerId];
  newTeam = newTeam.join(',');
  db.ref(`games/${gameId}`).update({ proposedTeam: newTeam });
}
