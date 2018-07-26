"use strict";

const Express = require("express"); // Other Dependencies
const app = Express();

const bot = require("./src/bot/bot");

app.use(bot.webhookCallback("/bot"));
app.get("/", (req, res) => res.sendStatus(200));
app.listen(3000, () => console.log(".::Bot Started::."));
