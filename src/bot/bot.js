"use strict";

const Telegraf = require("telegraf"); // Telegraf Dependencies
const rateLimit = require("telegraf-ratelimit");
const firebaseSession = require("telegraf-session-firebase");

const MTProtoClient = require("../mtproto/MTProtoClient"); // Local Dependencies
const { botConfig, MTProtoConfig } = require("../config");
const botHelper = require("./modules/botHelper");
const scenes = require("./scenes/scenes");
const database = require("../database");

const MTProto = new MTProtoClient(MTProtoConfig.api_id, MTProtoConfig.api_hash); // MTProto init
const bot = new Telegraf(botConfig.token, botConfig.telegraf); // Telegraf init

bot.use(firebaseSession(database.ref("BotSessions")));
bot.telegram.setWebhook(`${botConfig.url}/bot`);
bot.use(rateLimit(botConfig.rateLimit));
bot.use(scenes.stage.middleware());
bot.context.database = database;
bot.context.MTProto = MTProto;
bot.context.helper = botHelper;
bot.use(Telegraf.log());

bot.use(async (ctx, next) => {
  const authData = (await database
    .ref(MTProtoConfig.sessionPath)
    .once("value")).val();

  if (ctx.helper.isAdmin(ctx.chat.id)) {
    if (authData != null) {
      await next(ctx);
    } else if (ctx.message.text !== "🎫 Log in") {
      ctx.helper.authKeyboard(ctx, "Pls, log in!");
    } else {
      await next(ctx);
    }
  }
});

bot.start(async ctx => {
  ctx.session.from = ctx.from;
  ctx.helper.mainKeyboard(ctx, "Welcome!");
});

bot.hears("🎫 Log in", ctx => {
  ctx.scene.enter("authScene");
});

bot.hears("👨‍👨‍👧‍👦 Groups", async ctx => {
  const { chats } = await ctx.MTProto.messagesGetDialogs(0, 30);

  ctx.helper.replyWithInline(
    ctx,
    "Here is your groups:",
    ctx.helper.groupsInlineBtns(chats)
  );
});

bot.hears("👥 Contacts", async ctx => {
  const { DContactsKeyboard } = await ctx.helper.contactsInlineBtns(ctx);

  ctx.helper.replyWithInline(ctx, "Here is your contacts", DContactsKeyboard);
});

bot.on("contact", async ctx => {
  const response = await ctx.MTProto.contactsImportContacts(
    ctx.message.contact,
    true,
    "D:CODE "
  );

  console.log(response);

  ctx.reply("Console");
});

bot.catch(err => {
  botHelper.errHandler(bot, err);
});

module.exports = bot;
