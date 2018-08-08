"use strict";

const Telegraf = require("telegraf"); // Telegraf Dependencies
const session = require("telegraf/session");
const rateLimit = require("telegraf-ratelimit");

const MTProtoClient = require("../mtproto/MTProtoClient"); // Local Dependencies
const { botConfig, MTProtoConfig } = require("../config");
const botHelper = require("./modules/botHelper");
const scenes = require("./scenes/scenes");
const database = require("../database");

const contacts = require("./routers/callbackContacts"); // Routers
const groups = require("./routers/callbackGroups");
const karma = require("./routers/karmaHandler");

const MTProto = new MTProtoClient(MTProtoConfig.api_id, MTProtoConfig.api_hash); // MTProto init
const bot = new Telegraf(botConfig.token, botConfig.telegraf); // Telegraf init

bot.context.MTProto = MTProto;
bot.context.Helper = botHelper;
bot.context.Database = database;

bot.use(session());
// bot.use(Telegraf.log());
bot.use(scenes.middleware());
bot.use(rateLimit(botConfig.rateLimit));
bot.telegram.setWebhook(`${botConfig.url}/bot`);
bot.use((ctx, next) => ctx.Helper.middleware(ctx, next));

bot.on("callback_query", contacts);
bot.on("callback_query", groups);
bot.on("message", karma);

bot.start(ctx => {
  ctx.Helper.mainKeyboard(ctx, "Here is available commands:");
});

bot.hears("🎫 Log in", ctx => {
  ctx.scene.enter("authScene");
});

bot.hears("👨‍👨‍👧‍👦 Groups", async ctx => {
  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx);

  if (DGroupsKeyboard != null) {
    ctx.Helper.replyWithInline(ctx, "Here is your groups:", DGroupsKeyboard);
  } else {
    ctx.replyWithHTML('Groups with prefix <b>"D:CODE"</b> not found!');
  }
});

bot.hears("🔀 Merge groups", async ctx => {
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

bot.hears("👥 Contacts", async ctx => {
  const { DContactsKeyboard } = await ctx.Helper.DContacts(ctx);

  if (DContactsKeyboard != null) {
    ctx.Helper.replyWithInline(ctx, "Here is your contacts", DContactsKeyboard);
  } else {
    ctx.replyWithHTML('Contacts with prefix <b>"D:CODE"</b> not found!');
  }
});

bot.hears("👤 New contact", ctx => {
  ctx.scene.enter("addContactScene");
});

bot.hears("🤓 Profile", async ctx => {
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

bot.hears("😿 Log Out", ctx => {
  ctx.Database.ref(MTProtoConfig.sessionPath).remove();

  ctx.Helper.authKeyboard(ctx, "Logged out 🤷‍♂️");
});

bot.action(/update/, async ctx => {
  const type = ctx.match.input.split("@")[1];

  if (type === "contacts") {
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
  } else if (type === "groups") {
    const { DGroupsKeyboard } = await ctx.Helper.DGroupsUpdate(
      ctx.Database,
      ctx.MTProto
    );

    if (DGroupsKeyboard != null) {
      ctx.editMessageText(
        "Groups updated successfully. You can continue using the bot :)"
      );
    }
  }
});

bot.catch(err => {
  console.log(err);
});

module.exports = bot;
