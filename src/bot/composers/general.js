const Composer = require("telegraf/composer");
const moment = require("moment");

const { botConfig } = require("../../config");

const general = new Composer();

general.hears("/karma me", async ctx => {
  const CURRENT_MONTH = moment().format("MMMM");
  const chatID = ctx.chat.id < 0 ? ctx.message.from.id : ctx.chat.id;
  const myKarma = (await ctx.Database.ref(
    `${botConfig.karmaPath}/${CURRENT_MONTH}/${862341}`
  ).once("value")).val();
  ctx.reply(`Your karma for ${CURRENT_MONTH} is ${myKarma || 0}`);
});

general.hears("/karma top", async ctx => {
  const CURRENT_MONTH = moment().format("MMMM");
  // const allKarma = (await ctx.Database.ref(
  //   `${botConfig.karmaPath}/${CURRENT_MONTH}/`
  // ).once("value")).val();

  const allKarma = {
    379086434: 30,
    82493329: 7,
    468716679: 12
  };

  const sorted = Object.entries(allKarma).sort((a, b) => {
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
  });

  console.log(sorted);

  const topMessage = sorted.map(async user => {
    const { username } = await ctx.telegram.getChat(Number(user[0]));
    if (username != null) {
      return `@${username}: ${user[1]}\n`;
    }
  });

  ctx.reply(
    `Here is our top for ${CURRENT_MONTH}:\n\n` +
      (await Promise.all(topMessage)).join("")
  );
});

module.exports = general;
