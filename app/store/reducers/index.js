import { combineReducers } from 'redux';

import game from './game';
import user from './user';

export default combineReducers({
  game,
  user
});
