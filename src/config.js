"use strict";

require("dotenv").config();

exports.botConfig = {
  token: process.env.BOT_TOKEN,
  url: process.env.HOST,
  scenesTTL: 120, // LifeCycle of scenes in seconds
  karmaPath: "/karmaData",

  admins: [379086434, 82493329, 468716679],

  rateLimit: {
    window: 1, // Requests
      limit: 1500 // Period
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

  sessionPath: "/MTProtoSession/",

  api: {
    invokeWithLayer: 0xda9b0d0d,
    layer: 57,
    initConnection: 0x69796de9,
    api_id: +process.env.API_ID,
    app_version: "1.2.0",
    lang_code: "en"
  },

  server: {
    webogram: false,
    dev: true, // For testing in dev servers you should use TelegramBeta (https://t.me/tgrambeta)
    dcList: [
      {
        id: 2,
        host: "149.154.167.40", // Test
        port: 443
      },
      {
        id: 2,
        host: "149.154.167.50", // Production
        port: 443
      }
    ]
  }
};

exports.firebaseConfig = {};
