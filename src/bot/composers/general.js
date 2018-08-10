const Composer = require("telegraf/composer");

const general = new Composer();

general.hears("/karma me", async ctx => {
  const CURRENT_MONTH = moment().format("MMMM");
  const chatID = ctx.chat.id < 0 ? ctx.message.from.id : ctx.chat.id;
  const myKarma = (await ctx.Database.ref(
    `${botConfig.karmaPath}/${CURRENT_MONTH}/${862341}`
  ).once("value")).val();
  ctx.reply(`Your karma for ${CURRENT_MONTH} is ${myKarma || 0}`);
});

module.exports = general;
