"use strict";

require("dotenv").config();

const config = {
  phone_number: process.env.PHONE_NUMBER,
  api_id: +process.env.API_ID,
  api_hash: process.env.API_HASH
};

const api = {
  layer: 57,
  initConnection: 0x69796de9,
  api_id: config.api_id
};

const server = {
  dev: false
};

exports.config = config;
exports.server = server;
exports.api = api;
