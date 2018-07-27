"use strict";

const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const { botConfig } = require("../../config");

const botHelper = {
  directReply: (ctx, msgText) => {
    return ctx.telegram.sendMessage(ctx.chat.id, msgText, {
      parse_mode: "HTML",
      reply_to_message_id: ctx.update.message.message_id
    });
  },

  replyWithInline: (ctx, msgText, keyboard) => {
    return ctx.reply(
      msgText,
      Extra.HTML().markup(Markup.inlineKeyboard(keyboard))
    );
  },

  mainKeyboard: (ctx, msgText) => {
    return ctx.reply(
      msgText,
      Extra.HTML().markup(
        Markup.keyboard([
          ["👨‍👨‍👧‍👦 Groups"],
          ["👥 Contacts", "👤 New contact"],
          ["🤓 Profile", "😿 Log Out"]
        ]).resize()
      )
    );
  },

  authKeyboard: (ctx, msgText) => {
    return ctx.reply(
      msgText,
      Extra.HTML().markup(
        Markup.oneTime()
          .keyboard([["🎫 Log in"]])
          .resize()
      )
    );
  },

  groupsInlineBtns: chats => {
    const listOfGroups = [];

    chats.forEach(chat => {
      if (chat.title.match(/D:CODE/) == "D:CODE") {
        listOfGroups.push([
          Markup.callbackButton(
            `${chat.title} (${chat.participants_count})`,
            `group|${chat.title}|${chat.id}`
          )
        ]);
      }
    });

    return listOfGroups;
  },

  contactsInlineBtns: async ctx => {
    const { contacts } = await ctx.MTProto.contactsGetContacts();
    const contactsList = [];

    contacts.forEach(contact => contactsList.push(contact.user_id));

    const { users } = await ctx.MTProto.contactsGetContacts(
      contactsList.join(",")
    );
    const DContacts = [];
    const DContactsKeyboard = [];

    users.forEach(DContact => {
      if (DContact.first_name.match(/D:CODE/) == "D:CODE") {
        DContacts.push({
          id: DContact.id,
          access_hash: DContact.access_hash,
          first_name: DContact.first_name,
          phone: DContact.phone
        });

        DContactsKeyboard.push([
          Markup.callbackButton(
            DContact.first_name,
            `contact|${DContact.first_name}|${DContact.id}`
          )
        ]);
      }
    });

    ctx.database.ref("/MTProtoAccount/DContacts").set(DContacts);

    return {
      DContacts,
      DContactsKeyboard
    };
  },

  isAdmin: chatID => {
    return Object.values(botConfig.admins).includes(chatID);
  },

  toAllAdmins: (ctx, msgText) => {
    Object.values(botConfig.admins).forEach(adminChatID => {
      ctx.telegram.sendMessage(adminChatID, msgText, Extra.HTML());
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
