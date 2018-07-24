"use strict";

const Stage = require("telegraf/stage");
const { botConfig } = require("../../config");

const authScene = require("./authScene");

const stage = new Stage([authScene], {
  ttl: botConfig.scenesTTL
});

exports.stage = stage;
exports.Stage = Stage;
