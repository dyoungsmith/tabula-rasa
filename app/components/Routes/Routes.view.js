'use strict';

import React from 'react';
import { Router, Route, browserHistory, IndexRedirect } from 'react-router';

import Main from '../Main';
import Room from '../Room';


export default () => (
  <Router history={ browserHistory }>
    <Route path="/" component={ Main }>
      {/*<IndexRedirect to="/room" />*/}
      <Route path="/room" component={ Room } />
    </Route>
  </Router>
);
