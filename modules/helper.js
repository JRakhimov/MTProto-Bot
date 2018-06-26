"use strict";

const { config } = require("./config");
const readline = require("readline");

const input = text => {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(text, num => {
      rl.close();
      resolve(num);
    });
  });
};

async function login(client) {
  const { phone_code_hash } = await client("auth.sendCode", {
    phone_number: config.phone_number,
    current_number: false,
    api_id: config.api_id,
    api_hash: config.api_hash
  });

  const code = await input("Code:");
  console.log(`Your code: ${code}`);

  const { user } = await client("auth.signIn", {
    phone_number: config.phone_number,
    phone_code_hash: phone_code_hash,
    phone_code: code
  });

  console.log(`signed in as ${user.username}`);
}

exports.input = input;
exports.login = login;
