"use strict";

const { MTProto } = require("telegram-mtproto");
const { MTProtoConfig } = require("../config");
const { Storage } = require("./Storage");

class MTProtoClient {
  constructor(app_id, hash, data = {}) {
    this.__storage = new Storage(data);

    this.__app_id = app_id;
    this.__hash = hash;

    this.__phone_code_hash = null;
    this.__phone = null;

    this.__connector = MTProto({
      app: { storage: this.__storage },
      server: MTProtoConfig.server,
      api: MTProtoConfig.api
    });
  }

  async getAuthCode(phone) {
    const config = {
      phone_number: phone,
      current_number: false,
      api_id: this.__app_id,
      api_hash: this.__hash
    };

    const { phone_code_hash } = await this.__connector("auth.sendCode", config);

    this.__phone_code_hash = phone_code_hash;
    this.__phone = phone;

    return phone_code_hash;
  }

  async signIn(code) {
    const config = {
      phone_code: code,
      phone_number: this.__phone,
      phone_code_hash: this.__phone_code_hash
    };

    const { user } = await this.__connector("auth.signIn", config);

    return user;
  }

  async getDiaolgs(offset, limit) {
    const config = {
      offset,
      limit
    };

    const response = await this.__connector("messages.getDialogs", config);

    return response;
  }
}

module.exports = MTProtoClient;
