import { connect } from 'react-redux';
import RoutesLocal from './Routes.local';
import { receiveUser } from '../../store/reducers/user';

export default connect (
  null,
  dispatch => ({
    receiveUser: user =>
      dispatch(receiveUser(user))
  })
)(RoutesLocal);
