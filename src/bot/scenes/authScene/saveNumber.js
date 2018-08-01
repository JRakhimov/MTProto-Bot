"use strict";

const Composer = require("telegraf/composer");

const saveNumber = new Composer();

saveNumber.on("text", async ctx => {
  if (
    ctx.message.entities != null &&
    ctx.message.entities[0].type === "phone_number"
  ) {
    ctx.reply("Sending the code...")
    await ctx.MTProto.authSendCode(ctx.message.text);

    // Telegram automatically invalidates your login code
    // if it is sent to any chat on telegram before the login,
    // this problem can be avoided simply by appending or pretending some chars to the code.

    ctx.replyWithHTML(
      'Code sent✨\n\nSend code with adding char "_" before the code. E.g.: <code>_49326</code>'
    );

    return ctx.wizard.next();
  } else {
    ctx.reply("Make sure the number is sent correctly👨‍✈️");
  }
});

module.exports = saveNumber;
