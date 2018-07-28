"use strict";

const Composer = require("telegraf/composer");
const { MTProtoConfig } = require("../../../config");

const saveCode = new Composer();

saveCode.on("text", async ctx => {
  const code = ctx.message.text;

  if (code.match(/_\d\d\d\d\d/) != null) {
    ctx.reply("Signing in...");

    const { user } = await ctx.MTProto.authSignIn(code.split("_")[1]);

    const userData = {
      first_name: user.first_name || "",
      access_hash: user.access_hash,
      last_name: user.last_name || "",
      username: user.username || "",
      photo: user.photo || "",
      phone: user.phone,
      id: user.id
    };

    ctx.Helper.mainKeyboard(
      ctx,
      `Signed in as ${userData.username || userData.first_name}`
    );

    ctx.Database.ref(MTProtoConfig.sessionPath).update({
      signedIn: true,
      Me: userData
    });

    return ctx.scene.leave();
  } else {
    ctx.reply("Make sure the code is sent correctly👨‍✈️");
  }
});

module.exports = saveCode;
