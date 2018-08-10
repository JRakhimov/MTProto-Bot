"use strict";

const Telegraf = require("telegraf"); // Telegraf Dependencies
const session = require("telegraf/session");
const Composer = require("telegraf/composer");
const rateLimit = require("telegraf-ratelimit");

const { CronJob } = require("cron"); // Other Dependencies
const moment = require("moment");

const MTProtoClient = require("../mtproto/MTProtoClient"); // Local Dependencies
const { botConfig, MTProtoConfig } = require("../config");
const botHelper = require("./modules/botHelper");
const scenes = require("./scenes/scenes");
const database = require("../database");

const generalComposer = require("./composers/general"); // Composers
const adminComposer = require("./composers/admin");

const contacts = require("./routers/callbackContacts"); // Routers
const updates = require("./routers/callbackUpdates");
const groups = require("./routers/callbackGroups");
const karma = require("./routers/karmaHandler");

const MTProto = new MTProtoClient(MTProtoConfig.api_id, MTProtoConfig.api_hash); // MTProto init
const bot = new Telegraf(botConfig.token, botConfig.telegraf); // Telegraf init

bot.context.Database = database;
bot.context.Helper = botHelper;
bot.context.MTProto = MTProto;

const monthlyInformer = new CronJob({
  cronTime: "* * * * * *",
  onTick: () => {
    console.log(moment().format("MMMM"));
  },
  start: false
});

bot.use(session());
// bot.use(Telegraf.log());
bot.use(scenes.middleware());
bot.use(rateLimit(botConfig.rateLimit));

bot.on("callback_query", contacts);
bot.on("callback_query", updates);
bot.on("callback_query", groups);
bot.on("message", karma);

bot.use(generalComposer);
bot.use(Composer.acl(botConfig.admins, adminComposer));

bot.catch(err => {
  console.log(err);
});

bot.telegram.setWebhook(`${botConfig.url}/bot`);

module.exports = bot;
