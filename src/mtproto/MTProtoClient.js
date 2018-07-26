"use strict";

const { MTProto } = require("telegram-mtproto");
const { MTProtoConfig } = require("../config");
const { Storage } = require("./sessionSaver");

class MTProtoClient {
  constructor (app_id, hash, data = {}) {
    this.__storage = new Storage(data);

    this.__app_id = app_id;
    this.__hash = hash;

    this.__phone_code_hash = null;
    this.__phone = null;

    this.__connector = MTProto({
      app: { storage: this.__storage },
      server: MTProtoConfig.server,
      api: MTProtoConfig.api,
    });
  }

  async getAuthCode (phone) {
    const config = {
      phone_number: phone,
      current_number: false,
      api_id: this.__app_id,
      api_hash: this.__hash
    };

    const { phone_code_hash } = await this.__connector('auth.sendCode', config);
    console.log(this.__storage);
    this.__phone_code_hash = phone_code_hash;
    this.__phone = phone;
    return await phone_code_hash;
  }

  async signIn (code) {
    const config = {
      phone_number: this.__phone,
      phone_code_hash: this.__phone_code_hash,
      phone_code: code.toString()
    };

    const response = await this.__connector('auth.signIn', config);
    
    return await response;
  }

  async getDiaolgs(offset, limit) {
    const config = {
      offset,
      limit
    };

    const response = await this.__connector("messages.getDialogs", config);

    return await response;
  }
}

module.exports = MTProtoClient;
