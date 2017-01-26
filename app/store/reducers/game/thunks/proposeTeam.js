// pretty much just want to update status to TEAMVOTE

import db from '../../../../db';

export default (gameId) => {
	console.log('GAMEID', gameId);
	db.ref(`games/${gameId}`).update({status: 'TEAMVOTE'});
};
