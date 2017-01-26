import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';

// initialize Firebase db without using it
import db from '../db';

export default createStore(
  reducer,
  applyMiddleware(
    createLogger(),
    thunkMiddleware
));

