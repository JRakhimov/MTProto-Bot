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
          ["👨‍👨‍👧‍👦 Groups", "🔀 Merge groups"],
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

  keyboardSwitcher: (keyboard, groupTitle) => {
    const newKeyboard = keyboard.map(item => {
      if (item[1] == null) return item;

      const itemTitle = item[1].callback_data.split("@")[1];

      if (itemTitle === groupTitle) {
        const editedItem = item;

        editedItem[1] = {
          text: editedItem[1].text === "❌" ? "✅" : "❌",
          callback_data: editedItem[1].callback_data,
          hide: false
        };

        return editedItem;
      }

      return item;
    });

    newKeyboard.push([
      {
        text: "Save and Add ✨",
        callback_data: "add"
      }
    ]);

    return newKeyboard;
  },

  DGroups: async (ctx, command, skip) => {
    let { DGroups } = (await ctx.Database.ref(MTProtoConfig.sessionPath).once(
      "value"
    )).val();

    if (DGroups != null) {
      const DGroupsKeyboard = [];

      DGroups.forEach(DGroup => {
        botHelper.DGroupsModifier(DGroup, DGroupsKeyboard, command, skip);
      });

      DGroupsKeyboard.push([
        Markup.callbackButton("Update groups 🔄", `update@groups`)
      ]);

      return {
        DGroups,
        DGroupsKeyboard
      };
    } else {
      return botHelper.DGroupsUpdate(ctx.Database, ctx.MTProto);
    }
  },

  DGroupsUpdate: async (Database, MTProto, command, skip) => {
    const { chats } = await MTProto.messagesGetDialogs(0, 70);

    const DGroupsKeyboard = [];
    const DGroups = [];

    chats.forEach(DGroup => {
      if (DGroup._ == "channel" && DGroup.title.match(/D:CODE/) == "D:CODE") {
        DGroups.push({
          _: DGroup._,
          id: DGroup.id,
          title: DGroup.title,
          access_hash: DGroup.access_hash
        });

        botHelper.DGroupsModifier(DGroup, DGroupsKeyboard, command, skip);
      }
    });

    DGroupsKeyboard.push([
      Markup.callbackButton("Update groups 🔄", `update@groups`)
    ]);

    if (!DGroups.length) {
      return {
        DGroupsKeyboard: undefined
      };
    }

    Database.ref(MTProtoConfig.sessionPath).update({
      DGroups
    });

    return {
      DGroups,
      DGroupsKeyboard
    };
  },

  DGroupsModifier: (DGroup, DGroupsKeyboard, command, skip) => {
    switch (command) {
      case "add": {
        DGroupsKeyboard.push([
          Markup.callbackButton(
            DGroup.title,
            `group@${DGroup.title}@${DGroup.id}@${DGroup.access_hash}`
          ),
          Markup.callbackButton(
            "❌",
            `addGroup@${DGroup.title}@${DGroup.id}@${DGroup.access_hash}`
          )
        ]);

        break;
      }

      case "mergeFrom": {
        DGroupsKeyboard.push([
          Markup.callbackButton(
            DGroup.title,
            `mergeFrom@${DGroup.title}@${DGroup.id}@${DGroup.access_hash}`
          )
        ]);

        break;
      }

      case "mergeWith": {
        if (skip != DGroup.title) {
          DGroupsKeyboard.push([
            Markup.callbackButton(
              DGroup.title,
              `mergeWith@${DGroup.title}@${DGroup.id}@${DGroup.access_hash}`
            )
          ]);

          break;
        }

        break;
      }

      default: {
        DGroupsKeyboard.push([
          Markup.callbackButton(
            DGroup.title,
            `group@${DGroup.title}@${DGroup.id}@${DGroup.access_hash}`
          )
        ]);

        break;
      }
    }
  },

  DContacts: async ctx => {
    const value = (await ctx.Database.ref(MTProtoConfig.sessionPath).once(
      "value"
    )).val();

    let { DContacts, DContactsKeyboard } = value;

    if (DContacts != null && DContactsKeyboard != null) {
      return {
        DContacts,
        DContactsKeyboard
      };
    } else {
      return botHelper.DContactsUpdate(ctx.Database, ctx.MTProto);
    }
  },

  DContactsUpdate: async (Database, MTProto) => {
    const { contacts } = await MTProto.contactsGetContacts();
    const contactsList = [];

    const DContacts = [];
    const DContactsKeyboard = [];

    contacts.forEach(contact => contactsList.push(contact.user_id));

    const { users } = await MTProto.contactsGetContacts(contactsList.join(","));

    users.forEach(DContact => {
      if (DContact.first_name != null) {
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
      }
    });

    DContactsKeyboard.push([
      Markup.callbackButton("Update contacts 🔄", `update@contacts`)
    ]);

    if (!DContacts.length) {
      return {
        DContactsKeyboard: undefined
      };
    }

    Database.ref(MTProtoConfig.sessionPath).update({
      DContacts,
      DContactsKeyboard
    });

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

    const chatID = ctx.chat.id < 0 ? ctx.message.from.id : ctx.chat.id;

    if (ctx.Helper.isAdmin(chatID)) {
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
    botHelper.toAllAdmins(
      ctx,
      `<b>An error has been occurred in our bot. Here is details:</b>\n️<code>${JSON.stringify(
        err,
        undefined,
        2
      )}</code>`
    );
  }
};

module.exports = botHelper;
