"use strict";

const database = require("../database");

class FirebaseStorage {
  constructor(data) {
    if (data) {
      this.path = "/MTProto/";
      database.ref(this.path).set(data);
    }
  }

  async get(key) {
    const obj = (await database.ref(this.path).once("value")).val();

    if (obj == null) {
      return Promise.resolve(undefined);
    }

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

class Storage {
  constructor(data) {
    this.store = new Map();
    if (data) {
      for (let key in data) {
        this.store.set(key, data[key])
      }
      console.log(this.store)
    }
  }

  get(key) {
    console.log(key);
    console.log(this.store.get(key));
    return Promise.resolve(this.store.get(key))
  }

  set(key, val) {
    this.store.set(key, val)
    return Promise.resolve()
  }

  remove(...keys) {
    const results = keys.map(e => this.store.delete(e))
    return Promise.resolve(results)
  }

  clear() {
    this.store.clear()
    return Promise.resolve()
  }

  storeToJSON() {
    const obj = {}
    this.store.forEach(function (value, key) {
      obj[key] = value
    })

    return obj
  }
}

exports.Storage = FirebaseStorage;
