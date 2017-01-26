import { hashHistory } from 'react-router';
import db from '../../../../db';

export default (user, gameId) => () => {
  const ref = db.ref(`games/${gameId}/players`).push();
  const key = ref.key;
  ref.set({
    userId: user.id,
    playerId: key,
    email: user.email,
    loyalty: '',
    character: ''
  });
  hashHistory.push(`rooms/${gameId}`);
};

