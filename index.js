"use strict";

const Telegraf = require("telegraf"); // Telegraf Dependencies
const rateLimit = require("telegraf-ratelimit");
const firebaseSession = require("telegraf-session-firebase");

const Express = require("express"); // Other Dependencies
const app = Express();

const MTProtoClient = require("./src/mtproto/MTProtoClient"); // Local Dependencies
const botHelper = require("./src/bot/modules/botHelper");
const scenes = require("./src/bot/scenes/scenes");
const { botConfig } = require("./src/config");
const database = require("./src/database");

const bot = new Telegraf(botConfig.token, botConfig.telegraf); // Telegraf init
const MTProto = new MTProtoClient(); // MTProto init

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

bot.catch(err => {
  botHelper.errHandler(bot, err);
});

app.use(bot.webhookCallback("/bot"));
app.get("/", (req, res) => res.sendStatus(200));
app.listen(3000, () => console.log(".::Bot Started::."));
