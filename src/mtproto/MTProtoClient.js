"use strict";

const { MTProto } = require("telegram-mtproto");
const { MTProtoConfig } = require("../config");
const { Storage } = require("./Storage");

const md5 = require("md5");

class MTProtoClient {
  constructor(api_id, api_hash) {
    this.__storage = new Storage();

    this.__api_hash = api_hash;
    this.__api_id = api_id;

    this.__phone_code_hash = null;
    this.__phone = null;

    this.__connector = MTProto({
      app: { storage: this.__storage },
      server: MTProtoConfig.server,
      api: MTProtoConfig.api
    });
  }

  /* Auth Methods */

  async authSendCode(phone) {
    const config = {
      phone_number: phone,
      current_number: false,
      api_id: this.__api_id,
      api_hash: this.__api_hash
    };

    const response = await this.__connector("auth.sendCode", config);

    this.__phone_code_hash = response.phone_code_hash;
    this.__phone = phone;

    return response;
  }

  async authSignIn(code) {
    const config = {
      phone_code: code,
      phone_number: this.__phone,
      phone_code_hash: this.__phone_code_hash
    };

    const response = await this.__connector("auth.signIn", config);

    return response;
  }

  /* Message Methods */

  async messagesGetDialogs(offset, limit) {
    const config = {
      offset,
      limit
    };

    const response = await this.__connector("messages.getDialogs", config);

    return response;
  }

  async messagesAddChatUser(chat_id, user_id, access_hash, fwd_limit = 50) {
    const inputUser = {
      _: "inputUser",
      user_id,
      access_hash
    };

    const config = {
      chat_id,
      user_id: inputUser,
      fwd_limit
    };

    const response = await this.__connector("messages.addChatUser", config);

    return response;
  }

  /* Channel Methods */

  /**
   * Adds user to supergroup or channel
   *
   * @name channelsInviteToChannel
   * @function
   * @param  {Number} channel_id
   * @param  {String} channel_access_hash
   * @param  {Number} user_id
   * @param  {String} user_access_hash
   */
  async channelsInviteToChannel(
    channel_id,
    channel_access_hash,
    user_id,
    user_access_hash
  ) {
    const inputChannel = {
      _: "inputChannel",
      channel_id,
      access_hash: channel_access_hash
    };

    const inputUser = {
      _: "inputUser",
      user_id,
      access_hash: user_access_hash
    };

    const config = {
      channel: inputChannel,
      users: [inputUser]
    };

    const response = await this.__connector("channels.inviteToChannel", config);

    return response;
  }

  /* Contacts Methods */

  async contactsGetContacts(contactsList) {
    const config = contactsList ? { hash: md5(contactsList).hash } : {};

    const response = await this.__connector("contacts.getContacts", config);

    return response;
  }

  async contactsImportContacts(contactInfo, replace, prefix = "") {
    const inputPhoneContact = {
      _: "inputPhoneContact",
      client_id: contactInfo.user_id,
      phone: contactInfo.phone_number,
      first_name: prefix + contactInfo.first_name
    };

    const config = {
      contacts: [inputPhoneContact],
      replace
    };

    const response = await this.__connector("contacts.importContacts", config);

    return response;
  }
}

module.exports = MTProtoClient;
