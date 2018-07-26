"use strict";

const Composer = require("telegraf/composer");

const saveCode = new Composer();

saveCode.on("text", async ctx => {
  ctx.reply("Signing in...");

  const user = await ctx.MTProto.authSignIn(ctx.message.text);

  ctx.helper.mainKeyboard(ctx, `Signed in as ${user.username}`);

  ctx.database.ref(`sessions/${ctx.chat.id}/${ctx.chat.id}/__scenes`).remove();
  return ctx.scene.leave();
});

module.exports = saveCode;
