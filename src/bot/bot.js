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

bot.start(async ctx => {
  ctx.session.from = ctx.from;
  const authData = (await database.ref(MTProtoConfig.sessionPath).once("value")).val();
  if (authData != null) {
    return ctx.helper.mainKeyboard(ctx, "Welcome!");
  } else {
    return ctx.helper.authKeyboard(ctx, "Pls, log in!")
  }
});

bot.hears("🎫 Log in", ctx => {
  ctx.scene.enter("authScene");
});

bot.hears("dialogs", async ctx => {
  console.log(await ctx.MTProto.messagesGetDialogs(0, 30));
  ctx.reply("Dialogs is in your console");
});

bot.catch(err => {
  botHelper.errHandler(bot, err);
});

module.exports = bot;
