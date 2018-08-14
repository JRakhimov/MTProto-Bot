const Composer = require("telegraf/composer");
const moment = require("moment");

const { botConfig } = require("../../config");

const general = new Composer();

general.command("/karmame", async ctx => {
  const CURRENT_MONTH = moment().format("MMMM");
  const chatID = ctx.chat.id < 0 ? ctx.message.from.id : ctx.chat.id;
  const myKarma = (await ctx.Database.ref(
    `${botConfig.karmaPath}/${CURRENT_MONTH}/${chatID}`
  ).once("value")).val();
  ctx.reply(`Your karma for ${CURRENT_MONTH} is ${myKarma || 0}`);
});

general.command("/karmatop", async ctx => {
  const CURRENT_MONTH = moment().format("MMMM");

  const allKarma = await ctx.Helper.getAllKarma(ctx.Database);

  ctx.reply(`Here is our top for ${CURRENT_MONTH}:\n\n` + allKarma.join(""));
});

module.exports = general;
