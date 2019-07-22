import app from 'firebase/app';
//import 'firebase/database';
import firebase from 'firebase';
// Required for side-effects
//import { firestoreExport } from 'node-firestore-import-export';
//import * as firebase from 'firebase-admin';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID
};

app.initializeApp(config);

var db = firebase.firestore();
var storage = firebase.storage();

export { db, storage };
