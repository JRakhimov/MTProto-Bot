"use strict";

const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const { botConfig, MTProtoConfig } = require("../../config");

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

  DGroups: async (ctx, offset, limit, command = null) => {
    const { chats } = await ctx.MTProto.messagesGetDialogs(offset, limit);
    const DGroups = [];
    const DGroupsKeyboard = [];

    chats.forEach(DGroup => {
      if (DGroup.title.match(/D:CODE/) == "D:CODE") {
        DGroups.push({
          id: DGroup.id,
          title: DGroup.title,
          participants_count: DGroup.participants_count || 0
        });

        const participantsCount =
          DGroup.participants_count == null
            ? ""
            : `(${DGroup.participants_count})`;

        DGroupsKeyboard.push([
          Markup.callbackButton(
            `${DGroup.title} ${participantsCount}`,
            `group@${DGroup.title}@${DGroup.id}${command ? command : ""}`
          )
        ]);
      }
    });

    if (!DGroups.length) {
      return { DGroupsKeyboard: undefined };
    }

    ctx.Database.ref(MTProtoConfig.sessionPath).update({ DGroups });

    return {
      DGroups,
      DGroupsKeyboard
    };
  },

  DContacts: async ctx => {
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
            `contact@${DContact.first_name}@${DContact.id}@${
              DContact.access_hash
            }`
          )
        ]);
      }
    });

    if (!DContacts.length) {
      return { DContactsKeyboard: undefined };
    }

    ctx.Database.ref(MTProtoConfig.sessionPath).update({ DContacts });

    return {
      DContacts,
      DContactsKeyboard
    };
  },

  isAdmin: chatID => {
    return Object.values(botConfig.admins).includes(chatID);
  },

  middleware: async (ctx, next) => {
    const authData = (await ctx.Database.ref(MTProtoConfig.sessionPath).once(
      "value"
    )).val();

    if (ctx.Helper.isAdmin(ctx.chat.id)) {
      if (authData != null && authData.signedIn == true) {
        await next(ctx);
      } else if (ctx.message.text !== "🎫 Log in") {
        ctx.Helper.authKeyboard(
          ctx,
          "We detected that you are not logged, please log in with command => 🎫 Log in"
        );
      } else {
        await next(ctx);
      }
    }
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
