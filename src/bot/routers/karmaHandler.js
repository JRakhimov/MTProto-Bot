const Router = require("telegraf/router");
const moment = require("moment");

const { botConfig } = require("../../config");

const karma = new Router(async ({ update }) => {
  const { entities } = update.message;
  const { text } = update.message;

  const regExpPlus = /@([A-Z])\w+ [+][+]/gi;
  const regExpMinus = /@([A-Z])\w+ [—]/gi;
  let regExp;

  if (text) {
    regExp = text.match(regExpPlus) == null ? regExpMinus : regExpPlus;
  }

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

  ctx.Helper.usernameResolver(ctx.Database, ctx.state.mentionedUser).then(
    async user => {
      if (user == null) {
        ctx.Helper.directReply(
          ctx,
          `User with username: ${ctx.state.mentionedUser} not found!`
        );
      } else if (fromID === user.id) {
        ctx.Helper.directReply(ctx, "You can't edit your own karma!");
      } else {
        const userData = ctx.Database.ref(
          `${botConfig.karmaPath}/${CURRENT_MONTH}/${user.id}`
        );

        let userKarma = (await userData.once("value")).val();

        userKarma =
          ctx.state.command === "++" ? (userKarma += 1) : (userKarma -= 1);

        userData.set(userKarma);

        ctx.Helper.directReply(
          ctx,
          `@${ctx.state.mentionedUser}: <b>${userKarma}</b>`
        );
      }
    }
  );
});

module.exports = karma;
