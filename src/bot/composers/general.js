const Composer = require("telegraf/composer");
const moment = require("moment");

const { botConfig } = require("../../config");

const general = new Composer();

general.start((ctx, next) => {
  const chatID = ctx.chat.id < 0 ? ctx.message.from.id : ctx.chat.id;
  const isAdmin = ctx.Helper.isAdmin(chatID);

  if (ctx.chat.type === "private" && !isAdmin) {
    ctx.Helper.shareContact(
      ctx,
      "Hi! Please click the button below to share your contact information:"
    );
  } else if (ctx.chat.type === "private" && isAdmin) {
    next(ctx);
  } else {
    ctx.reply("This command is only available in private chat!");
  }
});

general.on("contact", ctx => {
  ctx.telegram.forwardMessage(
    botConfig.admins[0],
    ctx.chat.id,
    ctx.message.message_id
  );
  ctx.reply("Done!");
});

general.command("/karmame", async ctx => {
  const CURRENT_MONTH = moment().format("MMMM");
  const chatID = ctx.chat.id < 0 ? ctx.message.from.id : ctx.chat.id;

  const myKarma = (await ctx.Database.ref(
    `${botConfig.karmaPath}/${CURRENT_MONTH}/${chatID}`
  ).once("value")).val();

  ctx.Helper.directReply(
    ctx,
    `Your karma for ${CURRENT_MONTH} is ${myKarma || 0}`
  );
});

general.command("/karmatop", async ctx => {
  const CURRENT_MONTH = moment().format("MMMM");

  const allKarma = await ctx.Helper.getAllKarma(ctx.Database);

  ctx.Helper.directReply(
    ctx,
    `Here is our top for ${CURRENT_MONTH}:\n\n` + allKarma.join("")
  );
});

module.exports = general;
