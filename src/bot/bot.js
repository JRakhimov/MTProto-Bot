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
  const { DGroupsKeyboard } = await ctx.helper.DGroups(ctx, 0, 50);

  ctx.helper.replyWithInline(
    ctx,
    "Here is your groups:",
    DGroupsKeyboard
  );
});

bot.hears("👥 Contacts", async ctx => {
  const { DContactsKeyboard } = await ctx.helper.DContacts(ctx);

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

bot.action(/contact|/, async (ctx) => {
  const callbackData = {
    name: (ctx.match.input).split('|')[1], // D:CODE RJ
    user_id: (ctx.match.input).split('|')[2], // 127393
    access_hash: (ctx.match.input).split('|')[3] // 2443773757594061248
  }

  ctx.answerCbQuery(callbackData.name)

  const { DGroups } = await ctx.helper.DGroups(ctx, 0, 50);

  console.log(DGroups)

  DGroups.forEach(DGroup => {
    ctx.MTProto.messagesAddChatUser(DGroup.id, callbackData.user_id, callbackData.access_hash)
  });
})

bot.catch(err => {
  botHelper.errHandler(bot, err);
});

module.exports = bot;
