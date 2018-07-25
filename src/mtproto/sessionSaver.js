"use strict";

const database = require("../database");

class FirebaseStorage {
  constructor(data) {
    if (data) {
      this.path = "/MTProto/";
      database.ref(this.path).set(data);
    }
  }

  get(key) {
    return Promise.resolve(this.getFromDB()[key]);
  }

  set(key, val) {
    const updates = {};
    updates[key] = val;
    database.ref(this.path).update(updates);
    return Promise.resolve();
  }

  remove(...keys) {
    const oldData = this.getFromDB();
    const results = keys.map(key => delete oldData[key]);
    database.ref(this.path).update(results);
    return Promise.resolve(results);
  }

  clear() {
    database.ref(this.path).remove();
    return Promise.resolve();
  }

  getFromDB() {
    return Promise.await(database.ref(this.path).once("value")).val();
  }
}

exports.Storage = FirebaseStorage;
