"use strict";

const database = require("../database");

class FirebaseStorage {
  constructor(data) {
    if (data) {
      this.path = "/MTProto/";
      database.ref(this.path).set({dc: 2});
    }
  }

  async get(key) {
    const obj = (await database.ref(this.path).once("value")).val();
    console.log(obj)
    return Promise.resolve(obj[key]);
  }

  set(key, val) {
    const updates = {};
    updates[key] = val;
    database.ref(this.path).update(updates);
    return Promise.resolve();
  }

  async remove(...keys) {
    const oldData = (await database.ref(this.path).once("value")).val();
    const results = keys.map(key => delete oldData[key]);
    database.ref(this.path).update(results);
    return Promise.resolve(results);
  }

  clear() {
    database.ref(this.path).remove();
    return Promise.resolve();
  }
}

exports.Storage = FirebaseStorage;
