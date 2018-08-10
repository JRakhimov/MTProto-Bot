const Composer = require("telegraf/composer");

const { MTProtoConfig } = require("../../config");

const admin = new Composer();

admin.use((ctx, next) => {
  if (ctx.chat.type === "private") {
    return next(ctx);
  }
});

admin.start(ctx => {
  ctx.Helper.mainKeyboard(ctx, "Here is available commands:");
});

admin.hears("🎫 Log in", ctx => {
  ctx.scene.enter("authScene");
});

admin.hears("👨‍👨‍👧‍👦 Groups", async ctx => {
  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx);

  if (DGroupsKeyboard != null) {
    ctx.Helper.replyWithInline(ctx, "Here is your groups:", DGroupsKeyboard);
  } else {
    ctx.replyWithHTML('Groups with prefix <b>"D:CODE"</b> not found!');
  }
});

admin.hears("🔀 Merge groups", async ctx => {
  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx, "mergeFrom");

  if (DGroupsKeyboard != null) {
    ctx.Helper.replyWithInline(
      ctx,
      "Select the group from which you want to take the participants",
      DGroupsKeyboard
    );
  } else {
    ctx.replyWithHTML('Groups with prefix <b>"D:CODE"</b> not found!');
  }
});

admin.hears("👥 Contacts", async ctx => {
  const { DContactsKeyboard } = await ctx.Helper.DContacts(ctx);

  if (DContactsKeyboard != null) {
    ctx.Helper.replyWithInline(ctx, "Here is your contacts", DContactsKeyboard);
  } else {
    ctx.replyWithHTML('Contacts with prefix <b>"D:CODE"</b> not found!');
  }
});

admin.hears("👤 New contact", ctx => {
  ctx.scene.enter("addContactScene");
});

admin.hears("🤓 Profile", async ctx => {
  const { Me } = (await ctx.Database.ref(MTProtoConfig.sessionPath).once(
    "value"
  )).val();

  const profileMessage = [
    `👩 <b>About Me</b> 👨\n`,
    `<b>Full name</b>: <code>${Me.first_name} ${Me.last_name || ""}</code>`,
    `<b>Username</b>: <code>${Me.username}</code>`,
    `<b>Phone</b>: <code>${Me.phone}</code>`,
    `<b>User ID</b>: <code>${Me.id}</code>`,
    `<b>Access hash</b>: <code>${Me.access_hash}</code>`
  ];

  ctx.replyWithHTML(profileMessage.join("\n"));
});

admin.hears("😿 Log Out", ctx => {
  ctx.Database.ref(MTProtoConfig.sessionPath).remove();

  ctx.Helper.authKeyboard(ctx, "Logged out 🤷‍♂️");
});

module.exports = admin;
