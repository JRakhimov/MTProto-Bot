"use strict";

const WizardScene = require("telegraf/scenes/wizard");

const saveNumber = require("./authScene/saveNumber");
const saveCode = require("./authScene/saveCode");

const { MTProtoConfig } = require("../../config");

const authScene = new WizardScene(
  "authScene",
  ctx => {
    ctx.Database.ref(MTProtoConfig.sessionPath).remove();
    ctx.reply("Phone number:");
    ctx.wizard.next();
  },
  saveNumber,
  saveCode
);

module.exports = authScene;
