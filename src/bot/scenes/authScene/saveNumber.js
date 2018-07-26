"use strict";

const Composer = require("telegraf/composer");

const saveNumber = new Composer();

saveNumber.on("text", async ctx => {
  await ctx.MTProto.getAuthCode(ctx.message.text);

  ctx.reply("Code:");

  return ctx.wizard.next();
});

module.exports = saveNumber;
