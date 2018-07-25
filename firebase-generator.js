const fs = require("fs");
const { firebase } = require("./src/config");

fs.exists("firebase.json", exists => {
  if (Object.keys(firebase).length < 10)
    throw new Error("Invalid firebase config in config.js");
    
  if (!exists) {
    fs.writeFile("firebase.json", JSON.stringify(firebase), err => {
      if (err) throw err;

      console.log("Firebase service account file generated");
    });
  }
});
