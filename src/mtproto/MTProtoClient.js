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

  request(query, config, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const start = new Date();
      this.__connector(query, config)
        .then(response => {
          const ms = new Date() - start;
          console.log(`Response time: ${ms}ms`);
          return resolve(response);
        })
        .catch(err => {
          return reject(err);
        });

      setTimeout(() => {
        return reject({ code: 500, message: "Timeout" });
      }, timeout);
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

    const response = await this.request("auth.sendCode", config);

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

    const response = await this.request("auth.signIn", config);

    return response;
  }

  /* Message Methods */

  async messagesGetDialogs(offset, limit) {
    const config = {
      offset,
      limit
    };

    const response = await this.request("messages.getDialogs", config, 35000);

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

    const response = await this.request("messages.addChatUser", config);

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

    const response = await this.request("channels.inviteToChannel", config);

    return response;
  }

  /* Contacts Methods */

  async contactsGetContacts(contactsList) {
    const config = contactsList ? { hash: md5(contactsList).hash } : {};

    const response = await this.request("contacts.getContacts", config);

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

    const response = await this.request("contacts.importContacts", config);

    return response;
  }
}

module.exports = MTProtoClient;
