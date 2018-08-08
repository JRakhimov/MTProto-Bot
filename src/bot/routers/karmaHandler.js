const Router = require("telegraf/router");

const karma = new Router(({ update }) => {
  const { entities } = update.message;
  const { text } = update.message;

  if (entities == null || (entities[0].type !== "mention" || !text)) {
    return;
  }

  const parts = text.split("@");

  return {
    route: "username",
    state: {
      mentionedUser: parts[1].split(" ")[0]
    }
  };
});

karma.on("username", ctx => {
  ctx.reply(`@${ctx.state.mentionedUser}`);
});

module.exports = karma;
