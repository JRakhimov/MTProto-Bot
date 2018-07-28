"use strict";

const Stage = require("telegraf/stage");
const { botConfig } = require("../../config");

const authScene = require("./authScene");
const addContactScene = require("./addContactScene");

const stage = new Stage([authScene, addContactScene], {
  ttl: botConfig.scenesTTL
});

module.exports = stage;
