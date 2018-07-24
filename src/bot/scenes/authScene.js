"use strict";

const WizardScene = require("telegraf/scenes/wizard");

const saveNumber = require("./authScene/saveNumber");
const saveCode = require("./authScene/saveCode");

const authScene = new WizardScene(
  "authScene",
  ctx => {
    ctx.reply("Phone number:");
    ctx.wizard.next();
  },
  saveNumber,
  saveCode
);

module.exports = authScene;
