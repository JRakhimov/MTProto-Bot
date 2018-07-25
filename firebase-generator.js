const fs = require("fs");
const { firebaseConfig } = require("./src/config");

fs.exists("firebase.json", exists => {
  if (Object.keys(firebaseConfig).length < 10)
    throw new Error("Invalid firebase config in config.js");

  if (!exists) {
    fs.writeFile("firebase.json", JSON.stringify(firebaseConfig), err => {
      if (err) throw err;

      console.log("Firebase service account file generated");
    });
  }
});
