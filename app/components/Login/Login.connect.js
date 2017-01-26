import { connect } from 'react-redux';
import LoginLocal from './Login.local';
import { logIn, logOut } from '../../store/reducers/user';

export default connect(
    ({ user }) => ({ user }),

    dispatch => ({
      logIn: credentials =>
          dispatch(logIn(credentials)),
      logOut: () =>
          dispatch(logOut())
    })
)(LoginLocal);
