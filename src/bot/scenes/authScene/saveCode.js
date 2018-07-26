"use strict";

const Composer = require("telegraf/composer");

const saveCode = new Composer();

saveCode.on("text", async ctx => {
  try {
    ctx.scene.session.code = ctx.message.text;
    await ctx.reply("Signing in...");
    ctx.scene.leave();
    const user = await ctx.MTProto.signIn(ctx.scene.session.code);
    await ctx.reply(`Signed in as ${user.username}`);
  } catch (err) {
    console.error(err);
    return ctx.scene.leave();
  }
});

module.exports = saveCode;
