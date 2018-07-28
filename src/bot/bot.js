"use strict";

const Telegraf = require("telegraf"); // Telegraf Dependencies
const session = require("telegraf/session");
const rateLimit = require("telegraf-ratelimit");

const MTProtoClient = require("../mtproto/MTProtoClient"); // Local Dependencies
const { botConfig, MTProtoConfig } = require("../config");
const botHelper = require("./modules/botHelper");
const scenes = require("./scenes/scenes");
const database = require("../database");

const MTProto = new MTProtoClient(MTProtoConfig.api_id, MTProtoConfig.api_hash); // MTProto init
const bot = new Telegraf(botConfig.token, botConfig.telegraf); // Telegraf init

bot.use(session());
bot.use(Telegraf.log());
bot.use(scenes.stage.middleware());
bot.use(rateLimit(botConfig.rateLimit));
bot.telegram.setWebhook(`${botConfig.url}/bot`);

bot.context.MTProto = MTProto;
bot.context.Helper = botHelper;
bot.context.Database = database;

bot.use(async (ctx, next) => {
  const authData = (await database
    .ref(MTProtoConfig.sessionPath)
    .once("value")).val();

  if (ctx.Helper.isAdmin(ctx.chat.id)) {
    if (authData != null && authData.signedIn == true) {
      await next(ctx);
    } else if (ctx.message.text !== "🎫 Log in") {
      ctx.Helper.authKeyboard(
        ctx,
        "We detected that you are not logged, please log in with command => 🎫 Log in"
      );
    } else {
      await next(ctx);
    }
  }
});

bot.start(async ctx => {
  ctx.session.from = ctx.from;
  ctx.Helper.mainKeyboard(ctx, "Here is available commands:");
});

bot.hears("🎫 Log in", ctx => {
  ctx.scene.enter("authScene");
});

bot.hears("👨‍👨‍👧‍👦 Groups", async ctx => {
  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx, 0, 50);

  ctx.Helper.replyWithInline(ctx, "Here is your groups:", DGroupsKeyboard);
});

bot.hears("👥 Contacts", async ctx => {
  const { DContactsKeyboard } = await ctx.Helper.DContacts(ctx);

  ctx.Helper.replyWithInline(ctx, "Here is your contacts", DContactsKeyboard);
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

bot.action(/contact|/, async ctx => {
  const callbackData = {
    name: ctx.match.input.split("|")[1], // D:CODE RJ
    user_id: ctx.match.input.split("|")[2], // 127393
    access_hash: ctx.match.input.split("|")[3] // 2443773757594061248
  };

  ctx.answerCbQuery(callbackData.name);

  const { DGroups } = await ctx.Helper.DGroups(ctx, 0, 50);

  console.log(DGroups);

  DGroups.forEach(DGroup => {
    ctx.MTProto.messagesAddChatUser(
      DGroup.id,
      callbackData.user_id,
      callbackData.access_hash
    ).catch(err => {
      console.log("___________");
      console.log(err);
      return;
    });
  });
});

bot.catch(err => {
  botHelper.errHandler(bot, err);
});

module.exports = bot;
