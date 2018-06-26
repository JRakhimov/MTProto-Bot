"use strict";

const { Storage } = require("mtproto-storage-fs");
const { MTProto } = require("telegram-mtproto");

const { server } = require("./modules/config");
const { login } = require("./modules/helper");
const { api } = require("./modules/config");

const app = { storage: new Storage("./storage/storage.json") };
const client = MTProto({ server, api, app });

(async function() {
  if (await app.storage.get("signedin")) {
    console.log("Already signed in");
    await client("account.updateStatus", {
      offline: false // Now you are online ✨
    });
    console.log(
      await client("messages.getDialogs", {
        offset: 0,
        limit: 30
      })
    ); // Get your last 30 dialogs
  } else {
    console.log("Not signed in");
    await login(client)
      .then(() => {
        console.log("Signed in successfully");
      })
      .catch(err => {
        console.error(err);
      });
  }
})();
