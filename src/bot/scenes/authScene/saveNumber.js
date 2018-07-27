"use strict";

const Composer = require("telegraf/composer");

const saveNumber = new Composer();

saveNumber.on("text", ctx => {
  ctx.MTProto.authSendCode(ctx.message.text);

  ctx.reply("Code:");

  return ctx.wizard.next();
});

module.exports = saveNumber;
