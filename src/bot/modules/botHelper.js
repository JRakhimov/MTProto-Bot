"use strict";

const { botConfig } = require("../../config");

const botHelper = {
  toAllAdmins: (ctx, msgText) => {
    Object.keys(botConfig.admins).forEach(admin => {
      ctx.telegram.sendMessage(botConfig.admins[admin], msgText, Extra.HTML());
    });
  },

  errHandler: (ctx, err) => {
    console.log(err);
    helper.toAllAdmins(
      ctx,
      `<b>An error has been occurred in our bot. Here is details:</b>\n👨‍✈️<code>${err}</code> ☠️`
    );
  }
};

module.exports = botHelper;
