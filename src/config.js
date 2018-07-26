"use strict";

require("dotenv").config();

exports.botConfig = {
  token: process.env.BOT_TOKEN,
  url: process.env.HOST,
  scenesTTL: 300, // LifeCycle of scenes in seconds

  admins: {
    rakhimov_j: 379086434
  }, // Telegram IDs of admins

  rateLimit: {
    window: 2, // Requests
    limit: 3000 // Period
  }, // Number of requests per millisecond

  telegraf: {
    telegram: {
      webhookReply: false // False bcz in webhookReply mode telegram doesn't return context
    },
    username: process.env.BOT_NAME
  }
};

exports.MTProtoConfig = {
  api_id: process.env.API_ID,
  api_hash: process.env.API_HASH,

  api: {
    layer: 57,
    initConnection: 0x69796de9,
    api_id: +process.env.API_ID
  },

  server: {
    dev: process.env.IS_DEV ? true : false // For testing in dev servers you should use TelegramBeta (https://t.me/tgrambeta)
  }
};

exports.firebaseConfig = {};
