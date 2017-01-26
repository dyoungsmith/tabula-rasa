import { hashHistory } from 'react-router';
import db from '../../../../db';
import joinGame from './joinGame';

export default user => dispatch => {
  const hostId = user.id;
  const ref = db.ref('games').push();
  const key = ref.key;
  ref.set({
    hostId,
    status: 'PREGAME',
    // mordred: false,
    // morgana: false,
    // percival: false,
    // oberon: false,
    currentQuest: 0,
    currentTurn: 0,
    gameId: key,
    approves: 0,
    rejects: 0,
    succeedCards: 0,
    failCards: 0,
    goodScore: 0,
    evilScore: 0,
    rejectCounter: 0,
    proposedTeam: '',
    turnOrder: '',
    merlinGuess: '',
    quest1: {}
  });
  dispatch(joinGame(user, key));
  hashHistory.push(`rooms/${key}`);
};
