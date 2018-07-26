"use strict";

const { MTProto } = require("telegram-mtproto");
const { MTProtoConfig } = require("../config");
const { Storage } = require("./sessionSaver");

const storage = new Storage({});
const client = MTProto({
  server: MTProtoConfig.server,
  api: MTProtoConfig.api
});

class MTProtoClient {
  async sendCode(phoneNumber) {
    const { phone_code_hash } = await client("auth.sendCode", {
      phone_number: phoneNumber,
      current_number: false,
      api_id: MTProtoConfig.api_id,
      api_hash: MTProtoConfig.api_hash
    });

    return await phone_code_hash;
  }

  async signIn(phoneNumber, code, phoneCodeHash) {
    const { user } = await client("auth.signIn", {
      phone_number: phoneNumber,
      phone_code_hash: phoneCodeHash,
      phone_code: code
    });

    return await user;
  }

  async getDiaolgs() {
    return await client("messages.getDialogs", {
      offset: 0,
      limit: 30
    });
  }
}

module.exports = MTProtoClient;
