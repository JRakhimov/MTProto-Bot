"use strict";

const Composer = require("telegraf/composer");

const saveCode = new Composer();

saveCode.on("text", async ctx => {
  try {
    ctx.scene.session.code = ctx.message.text;
    await ctx.reply("Signing in...");
    const user = await ctx.MTProto.signIn(
      ctx.scene.session.number,
      ctx.scene.session.code,
      ctx.scene.session.codeHash
    );
    await ctx.reply(`Signed in as ${user.username}`);
    return ctx.scene.leave();
  } catch (err) {
    console.error(err);
    return ctx.scene.leave();
  }
});

module.exports = saveCode;
