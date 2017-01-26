// Firebase obtained from the global context

// const config = {
//     apiKey: "AIzaSyBL3Un4kWrA_bI6uRNsei4nQk9DkY3WD-4",
//     authDomain: "reactaframe.firebaseapp.com",
//     databaseURL: "https://reactaframe.firebaseio.com",
//     storageBucket: "reactaframe.appspot.com",
//     messagingSenderId: "40805357578"
// };

import config from './config';

window.firebase.initializeApp(config);

export default window.firebase.database();
