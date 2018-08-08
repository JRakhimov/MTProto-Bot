const Router = require("telegraf/router");

const contacts = new Router(({ callbackQuery }) => {
  if (!callbackQuery.data) {
    return;
  }

  const parts = callbackQuery.data.split("@");

  return {
    route: parts[0],
    state: {
      contactName: parts[1], // D:CODE RJ
      contactUser_id: parts[2], // 127393
      contactAccess_hash: parts[3] // 2443773757594061248
    }
  };
});

contacts.on("contact", async ctx => {
  ctx.answerCbQuery(ctx.state.contactName);

  ctx.session.addContactInfo = {
    name: ctx.state.contactName,
    user_id: ctx.state.contactUser_id,
    access_hash: ctx.state.contactAccess_hash
  };

  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx, "add").catch(err =>
    ctx.Helper.errHandler(ctx, err)
  );

  await ctx.deleteMessage();

  await ctx.Helper.replyWithInline(
    ctx,
    "Select the groups you want to add the participant:",
    DGroupsKeyboard
  );
});

module.exports = contacts;
