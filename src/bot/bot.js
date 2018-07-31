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
  ctx.Helper.mainKeyboard(ctx, "Here is available commands:");
});

bot.hears("🎫 Log in", ctx => {
  ctx.scene.enter("authScene");
});

bot.hears("👨‍👨‍👧‍👦 Groups", async ctx => {
  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx, 0, 70);

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

bot.action(/contact@/, async ctx => {
  const callbackData = {
    name: ctx.match.input.split("@")[1], // D:CODE RJ
    user_id: ctx.match.input.split("@")[2], // 127393
    access_hash: ctx.match.input.split("@")[3] // 2443773757594061248
  };

  ctx.answerCbQuery(callbackData.name);
  ctx.session.addContactInfo = callbackData;

  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx, 0, 70, "add");

  await ctx.deleteMessage();
  await ctx.Helper.replyWithInline(
    ctx,
    "Select the groups you want to add the participant:",
    DGroupsKeyboard
  );
});

bot.action(/group@/, async ctx => {
  const callbackData = {
    title: ctx.match.input.split("@")[1] // D:CODE - team
  };

  ctx.answerCbQuery(callbackData.title);
});

bot.action(/addGroup@/, async ctx => {
  const callbackData = {
    title: ctx.match.input.split("@")[1], // D:CODE - team
    id: ctx.match.input.split("@")[2], // 252362085
    access_hash: ctx.match.input.split("@")[3] // 3539057495372134628
  };

  ctx.answerCbQuery(callbackData.title);

  ctx.session.tempKeyboard =
    ctx.session.tempKeyboard == null
      ? (await ctx.Helper.DGroups(ctx, 0, 70, "add")).DGroupsKeyboard
      : ctx.session.tempKeyboard;

  const newKeyboard = ctx.Helper.keyboardSwitcher(
    ctx.session.tempKeyboard,
    callbackData
  );

  await ctx.editMessageReplyMarkup({ inline_keyboard: newKeyboard });
});

bot.action(/add/, async ctx => {
  ctx.answerCbQuery("Save and Add ✨");

  ctx.session.tempKeyboard.forEach(group => {
    const isChecked = group[1].text === "✅" ? true : false;
    if (isChecked) {
      const channelID = group[1].callback_data.split("@")[2]; // 252362085
      const channelHash = group[1].callback_data.split("@")[3]; // 3539057495372134628

      ctx.MTProto.channelsInviteToChannel(
        Number(channelID),
        channelHash,
        Number(ctx.session.addContactInfo.user_id),
        ctx.session.addContactInfo.access_hash
      ).catch(err => {
        console.log(err);
        return ctx.replyWithHTML(
          "<code>" + JSON.stringify(err, undefined, 2) + "</code>"
        );
      });
    }
  });

  delete ctx.session.addContactInfo;
  delete ctx.session.tempKeyboard;

  ctx.editMessageText("Done✨");
});

bot.catch(err => {
  console.log(err);
});

module.exports = bot;
