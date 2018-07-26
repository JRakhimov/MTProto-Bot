"use strict";

const Telegraf = require("telegraf"); // Telegraf Dependencies
const rateLimit = require("telegraf-ratelimit");
const firebaseSession = require("telegraf-session-firebase");

const Express = require("express"); // Other Dependencies
const app = Express();

const MTProtoClient = require("./src/mtproto/MTProtoClient"); // Local Dependencies
const { botConfig, MTProtoConfig } = require("./src/config");
const botHelper = require("./src/bot/modules/botHelper");
const scenes = require("./src/bot/scenes/scenes");
const database = require("./src/database");

const MTProto = new MTProtoClient(MTProtoConfig.api_id, MTProtoConfig.api_hash); // MTProto init
const bot = new Telegraf(botConfig.token, botConfig.telegraf); // Telegraf init

bot.use(firebaseSession(database.ref("sessions")));
bot.telegram.setWebhook(`${botConfig.url}/bot`);
bot.use(rateLimit(botConfig.rateLimit));
bot.use(scenes.stage.middleware());
bot.context.database = database;
bot.context.MTProto = MTProto;
bot.use(Telegraf.log());

bot.start(ctx => {
  ctx.session.from = ctx.from;
  ctx.reply("Welcome!");
});

bot.hears([/auth/gi, /\/auth/gi], ctx => {
  ctx.scene.enter("authScene");
});

bot.hears("test", async ctx => {
  console.log(await ctx.MTProto.getDiaolgs(0, 30))
  ctx.reply("test")
})

bot.hears([/\/leave/gi, /leave/gi], ctx => {
  ctx.scene.leave()
})

bot.catch(err => {
  botHelper.errHandler(bot, err);
});

app.use(bot.webhookCallback("/bot"));
app.get("/", (req, res) => res.sendStatus(200));
app.listen(3000, () => console.log(".::Bot Started::."));
