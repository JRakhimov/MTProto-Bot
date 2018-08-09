const Router = require("telegraf/router");

const { MTProtoConfig } = require("../../config");

const admin = new Router(async ctx => {
  const authData = (await ctx.Database.ref(MTProtoConfig.sessionPath).once(
    "value"
  )).val();

  const chatID = ctx.chat.id < 0 ? ctx.message.from.id : ctx.chat.id;

  if (ctx.Helper.isAdmin(chatID)) {
    if (authData != null && authData.signedIn) {
      return { route: ctx.message.text };
    } else if (ctx.message.text !== "🎫 Log in") {
      ctx.Helper.authKeyboard(
        ctx,
        "We detected that you are not logged, please log in with command => 🎫 Log in"
      );
    } else {
      return { route: ctx.message.text };
    }
  }
});

admin.on("/start", ctx => {
  ctx.Helper.mainKeyboard(ctx, "Here is available commands:");
});

admin.on("🎫 Log in", ctx => {
  ctx.scene.enter("authScene");
});

admin.on("👨‍👨‍👧‍👦 Groups", async ctx => {
  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx);

  if (DGroupsKeyboard != null) {
    ctx.Helper.replyWithInline(ctx, "Here is your groups:", DGroupsKeyboard);
  } else {
    ctx.replyWithHTML('Groups with prefix <b>"D:CODE"</b> not found!');
  }
});

admin.on("🔀 Merge groups", async ctx => {
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

admin.on("👥 Contacts", async ctx => {
  const { DContactsKeyboard } = await ctx.Helper.DContacts(ctx);

  if (DContactsKeyboard != null) {
    ctx.Helper.replyWithInline(ctx, "Here is your contacts", DContactsKeyboard);
  } else {
    ctx.replyWithHTML('Contacts with prefix <b>"D:CODE"</b> not found!');
  }
});

admin.on("👤 New contact", ctx => {
  ctx.scene.enter("addContactScene");
});

admin.on("🤓 Profile", async ctx => {
  const { Me } = (await database
    .ref(MTProtoConfig.sessionPath)
    .once("value")).val();

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

admin.on("😿 Log Out", ctx => {
  ctx.Database.ref(MTProtoConfig.sessionPath).remove();

  ctx.Helper.authKeyboard(ctx, "Logged out 🤷‍♂️");
});

module.exports = admin;
