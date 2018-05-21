import * as firebase from 'firebase';

class Auth {
  constructor() {
    this.initRemote();
  }

  initRemote() {
    if (!firebase.apps.length) {
      firebase.initializeApp(this.config());
    }
  }

  config() {
    return {
      apiKey: 'AIzaSyDo7kRspbEIVT202T5fuNf5ZTe1GTfZfD0',
      authDomain: 'pipo-pipette.firebaseapp.com',
      databaseURL: 'https://pipo-pipette.firebaseio.com',
      projectId: 'pipo-pipette',
      storageBucket: 'pipo-pipette.appspot.com',
      messagingSenderId: '317436935763'
    };
  }

  auth() {
    return firebase.auth();
  }

  login(user_id, fn) {
    this.auth().onAuthStateChanged(auth_user => {
      if (auth_user) {
        // var isAnonymous = user.isAnonymous;
        // var uid = user.uid;
        fn(null, auth_user);
      } else {
        fn(true, 'User is signed out!');
      }
    });

    this.auth()
      .signInWithEmailAndPassword(this.email(user_id), this.token)
      .catch(function(error) {
        //var errorCode = error.code;
        //var errorMessage = error.message;
        fn(error, null);
      });
  }

  signup(user_id, fn) {
    try {
      this.auth()
        .createUserWithEmailAndPassword(this.email(user_id), this.token)
        .then(foo => {
          fn(null, foo);
        })
        .catch(function(error) {
          // var errorCode = error.code;
          // var errorMessage = error.message;
          fn(error, null);
        });
    } catch (err) {
      fn(err, null);
    }
  }

  email(user_id) {
    return `${user_id}@pipopipette.game`;
  }

  get token() {
    return 'secret_password';
  }
}

export default Auth;
