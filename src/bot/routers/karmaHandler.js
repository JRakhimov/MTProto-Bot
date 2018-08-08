const Router = require("telegraf/router");

const karma = new Router(({ update }) => {
  const { entities } = update.message;
  const { text } = update.message;

  const regExp = /@([A-Z])\w+ [+-][+-]/g;

  if (
    entities == null ||
    (entities[0].type !== "mention" || !text.match(regExp))
  ) {
    return;
  }

  console.log(text.match(regExp));

  return {
    route: "username",
    state: {
      mentionedUser: text.split("@")[1].split(" ")[0],
      full: text.match(regExp)[0]
    }
  };
});

karma.on("username", ctx => {
  ctx.reply(`@${ctx.state.mentionedUser}`);
});

module.exports = karma;
