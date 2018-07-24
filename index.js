"use strict";

const Telegraf = require("telegraf"); // Telegraf Dependencies
const session = require("telegraf/session");
const rateLimit = require("telegraf-ratelimit");

const Express = require("express"); // Express
const app = Express();

const MTProtoClient = require("./src/mtproto/MTProtoClient"); // Local Dependencies
const botHelper = require("./src/bot/modules/botHelper");
const scenes = require("./src/bot/scenes/scenes");
const { botConfig } = require("./src/config");

const bot = new Telegraf(botConfig.token, botConfig.telegraf); // Telegraf init
const MTProto = new MTProtoClient(); // MTProto init

bot.use(session());
bot.use(Telegraf.log());
bot.context.MTProto = MTProto;
bot.use(scenes.stage.middleware());
bot.use(rateLimit(botConfig.rateLimit));
bot.telegram.setWebhook(`${botConfig.url}/bot`);

bot.start(ctx => {
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
