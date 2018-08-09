const Router = require("telegraf/router");
const moment = require("moment");

const { botConfig } = require("../../config");

const karma = new Router(({ update }) => {
  const { entities } = update.message;
  const { text } = update.message;

  const regExpPlus = /@([A-Z])\w+ [+][+]/g;
  const regExpMinus = /@([A-Z])\w+ [—]/g;
  const regExp = text.match(regExpPlus) == null ? regExpMinus : regExpPlus;

  if (
    entities == null ||
    (entities[0].type !== "mention" || !text.match(regExp))
  ) {
    return;
  }

  const karmaData = {
    username: text
      .match(regExp)[0]
      .split("@")[1]
      .split(" ")[0],
    command: text
      .match(regExp)[0]
      .split("@")[1]
      .split(" ")[1]
  };

  return {
    route: "username",
    state: {
      mentionedUser: karmaData.username,
      command: karmaData.command
    }
  };
});

karma.on("username", ctx => {
  const CURRENT_MONTH = moment().format("MMMM");
  const fromID = ctx.chat.id < 0 ? ctx.message.from.id : ctx.chat.id;

  ctx.MTProto.contactsResolveUsername(ctx.state.mentionedUser)
    .then(async user => {
      const chatID = user.peer.user_id;

      if (fromID != chatID) {
        const userData = ctx.Database.ref(
          `${botConfig.karmaPath}/${CURRENT_MONTH}/${chatID}`
        );

        let userKarma = (await userData.once("value")).val();

        userKarma =
          ctx.state.command === "++" ? (userKarma += 1) : (userKarma -= 1);
        userData.set(userKarma);

        ctx.reply(`@${ctx.state.mentionedUser}: ${userKarma}`);
      } else {
        ctx.reply("You can't raise your own karma!");
      }
    })
    .catch(err => {
      ctx.reply(`User with username: ${ctx.state.mentionedUser} not found!`);
    });
});

module.exports = karma;
