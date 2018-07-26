"use strict";

const Composer = require("telegraf/composer");

const saveNumber = new Composer();

saveNumber.on("text", async ctx => {
  try {
    ctx.scene.session.number = ctx.message.text;
    ctx.scene.session.codeHash = await ctx.MTProto.getAuthCode(
      ctx.scene.session.number
    );
    await ctx.reply("Code:");
    return ctx.wizard.next();
  } catch (err) {
    console.error(err);
    return ctx.scene.leave();
  }
});

module.exports = saveNumber;
