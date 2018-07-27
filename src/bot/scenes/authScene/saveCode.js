"use strict";

const Composer = require("telegraf/composer");

const saveCode = new Composer();

saveCode.on("text", async ctx => {
  ctx.reply("Signing in...");

  const { user } = await ctx.MTProto.authSignIn(ctx.message.text.split("_")[1]);

  const userData = {
    first_name: user.first_name || "",
    access_hash: user.access_hash,
    last_name: user.last_name || "",
    username: user.username || "",
    photo: user.photo || "",
    phone: user.phone,
    id: user.id
  };

  ctx.Helper.mainKeyboard(ctx, `Signed in as ${userData.username}`);

  ctx.Database.ref(`sessions/${ctx.chat.id}/${ctx.chat.id}/__scenes`).set(null);

  ctx.Database.ref("/MTProtoAccount/Me").set(userData);

  return ctx.scene.leave();
});

module.exports = saveCode;
