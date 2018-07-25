const firebase = require("firebase-admin");

const { firebaseConfig } = require("./config");
const serviceAccount = require("../firebase.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${firebaseConfig.project_id}.firebaseio.com`
});

module.exports = firebase.database();
