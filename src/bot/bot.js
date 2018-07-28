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

bot.context.MTProto = MTProto;
bot.context.Helper = botHelper;
bot.context.Database = database;

bot.use(session());
bot.use(Telegraf.log());
bot.use(scenes.middleware());
bot.use(rateLimit(botConfig.rateLimit));
bot.telegram.setWebhook(`${botConfig.url}/bot`);
bot.use((ctx, next) => ctx.Helper.middleware(ctx, next));

bot.start(async ctx => {
  ctx.session.from = ctx.from;
  ctx.Helper.mainKeyboard(ctx, "Here is available commands:");
});

bot.hears("🎫 Log in", ctx => {
  ctx.scene.enter("authScene");
});

bot.hears("👨‍👨‍👧‍👦 Groups", async ctx => {
  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx, 0, 50);

  if (DGroupsKeyboard != null) {
    ctx.Helper.replyWithInline(ctx, "Here is your groups:", DGroupsKeyboard);
  } else {
    ctx.reply('Groups with prefix "D:CODE" not found!');
  }
});

bot.hears("👥 Contacts", async ctx => {
  const { DContactsKeyboard } = await ctx.Helper.DContacts(ctx);

  if (DContactsKeyboard != null) {
    ctx.Helper.replyWithInline(ctx, "Here is your contacts", DContactsKeyboard);
  } else {
    ctx.reply('Contacts with prefix "D:CODE" not found!');
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

module.exports = bot;
