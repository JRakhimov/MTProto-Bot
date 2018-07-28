const Scene = require("telegraf/scenes/base");

const addContactScene = new Scene("addContactScene");

addContactScene.enter(ctx => {
  ctx.reply("Now you can send the contact to be saved in your account");
});

addContactScene.on("contact", async ctx => {
  const { imported, users } = await ctx.MTProto.contactsImportContacts(
    ctx.message.contact,
    true,
    "D:CODE "
  );

  if (imported != null) {
    ctx.replyWithHTML(
      `Contact <code>${users[0].first_name}</code> successfully saved ✨`
    );
    return ctx.scene.leave();
  }
});

addContactScene.on("message", ctx => {
  ctx.reply("Now you can send the contact to be saved in your account");
});

module.exports = addContactScene;
