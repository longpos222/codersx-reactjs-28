import firebase from 'firebase';

const messaging = firebase.messaging();

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyCan5TKfWgnv8Zh6mYfHnMDY8AcQVNBFBY",
  authDomain: "codersx-instagram-clone.firebaseapp.com",
  databaseURL: "https://codersx-instagram-clone.firebaseio.com",
  projectId: "codersx-instagram-clone",
  storageBucket: "codersx-instagram-clone.appspot.com",
  messagingSenderId: "459718249597",
  appId: "1:459718249597:web:24ea3323e28a1af3377514"
});

messaging.getToken().then((currentToken) => {
  if (currentToken) {console.log(currentToken);}
});