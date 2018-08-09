const Router = require("telegraf/router");

const updates = new Router(({ callbackQuery }) => {
  if (!callbackQuery.data) {
    return;
  }

  const parts = callbackQuery.data.split("@");

  return {
    route: parts[1],
    state: {
      updateType: parts[1]
    }
  };
});

updates.on("contacts", async ctx => {
  const { DContactsKeyboard } = await ctx.Helper.DContactsUpdate(
    ctx.Database,
    ctx.MTProto
  );

  if (DContactsKeyboard != null) {
    ctx
      .editMessageReplyMarkup({ inline_keyboard: DContactsKeyboard })
      .then(() => {
        ctx.answerCbQuery("Contacts updated");
      })
      .catch(({ description }) => {
        if (description === "Bad Request: message is not modified") {
          ctx.answerCbQuery("Contacts is up to date");
        }
      });
  } else {
    ctx.replyWithHTML('Contacts with prefix <b>"D:CODE"</b> not found!');
  }
});

updates.on("groups", async ctx => {
  const { DGroupsKeyboard } = await ctx.Helper.DGroupsUpdate(
    ctx.Database,
    ctx.MTProto
  );

  if (DGroupsKeyboard != null) {
    ctx.editMessageText(
      "Groups updated successfully. You can continue using the bot :)"
    );
  }
});

module.exports = updates;
