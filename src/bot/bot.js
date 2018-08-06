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
// bot.use(Telegraf.log());
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

bot.action(/contact@/, async ctx => {
  const cbData = ctx.Helper.cbSplitter(ctx.match.input, "contact");

  ctx.answerCbQuery(cbData.name);
  ctx.session.addContactInfo = cbData;

  const { DGroupsKeyboard } = await ctx.Helper.DGroups(ctx, "add").catch(err =>
    ctx.Helper.errHandler(ctx, err)
  );

  await ctx.deleteMessage();

  await ctx.Helper.replyWithInline(
    ctx,
    "Select the groups you want to add the participant:",
    DGroupsKeyboard
  );
});

bot.action(/group@/, async ctx => {
  const cbData = ctx.Helper.cbSplitter(ctx.match.input, "group");

  ctx.answerCbQuery(cbData.title);
});

bot.action(/addGroup@/, async ctx => {
  const cbData = ctx.Helper.cbSplitter(ctx.match.input, "group");

  ctx.answerCbQuery(cbData.title);

  ctx.session.tempKeyboard =
    ctx.session.tempKeyboard == null
      ? (await ctx.Helper.DGroups(ctx, "add")).DGroupsKeyboard
      : ctx.session.tempKeyboard;

  const newKeyboard = ctx.Helper.keyboardSwitcher(
    ctx.session.tempKeyboard,
    cbData
  );

  await ctx.editMessageReplyMarkup({ inline_keyboard: newKeyboard });
});

bot.action(/add/, async ctx => {
  ctx.answerCbQuery("Save and Add ✨");

  ctx.session.tempKeyboard.forEach(async group => {
    const isChecked = group[1].text === "✅";

    if (isChecked) {
      const channelID = group[1].callback_data.split("@")[2]; // 252362085
      const channelHash = group[1].callback_data.split("@")[3]; // 3539057495372134628

      await ctx.MTProto.channelsInviteToChannel(
        Number(channelID),
        channelHash,
        [
          {
            _: "inputUser",
            user_id: Number(ctx.session.addContactInfo.user_id),
            access_hash: ctx.session.addContactInfo.access_hash
          }
        ]
      ).catch(err => ctx.Helper.errHandler(ctx, err));
    }
  });

  delete ctx.session.addContactInfo;
  delete ctx.session.tempKeyboard;

  await ctx.editMessageText("Done✨");
});

bot.action(/mergeFrom@/, async ctx => {
  const cbData = ctx.Helper.cbSplitter(ctx.match.input, "group");

  ctx.answerCbQuery(cbData.title);

  const { users } = await ctx.MTProto.channelsGetParticipants(
    cbData.id,
    cbData.access_hash,
    0,
    30
  );

  ctx.session.originUsers = users
    .map(user => {
      if (user.self == null) {
        return {
          _: "inputUser",
          user_id: user.id,
          access_hash: user.access_hash
        };
      }
    })
    .filter(user => user != null);

  const { DGroupsKeyboard } = await ctx.Helper.DGroups(
    ctx,
    "mergeWith",
    cbData.title
  );

  await ctx.deleteMessage();
  await ctx.Helper.replyWithInline(
    ctx,
    "Select the group you want to add the participants:",
    DGroupsKeyboard
  );
});

bot.action(/mergeWith@/, async ctx => {
  const cbData = ctx.Helper.cbSplitter(ctx.match.input, "group");

  ctx.answerCbQuery(cbData.title);

  await ctx.MTProto.channelsInviteToChannel(
    Number(cbData.id),
    cbData.access_hash,
    ctx.session.originUsers
  );

  delete ctx.session.originUsers;

  await ctx.editMessageText("Done✨");
});

bot.action(/update@/, async ctx => {
  const { type } = ctx.Helper.cbSplitter(ctx.match.input, "update");

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
  }
});

bot.catch(err => {
  console.log(err);
});

module.exports = bot;
