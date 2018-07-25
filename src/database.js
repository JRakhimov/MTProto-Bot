const admin = require("firebase-admin");

const { firebase } = require("./config");
const serviceAccount = require("../firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${firebase.project_id}.firebaseio.com`
});

module.exports = admin.database();
