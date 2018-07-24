# Managing Client

## About

Telegram client for maganing groups based on [**MTProto-Nodejs**](https://github.com/zerobias/telegram-mtproto) library with [**Telegraf**](https://github.com/telegraf/telegraf) as a bot interface

## Features

- Connects with [Telegram's MTProto](https://core.telegram.org/mtproto) server and saves the client session

## Installation

### First things first...

You will need to generate a Telegram bot API key and that it's easy, just follow [this](https://core.telegram.org/bots#3-how-do-i-create-a-bot) step-by-step. Also you should create your Telegram Client Application and get `api_id` and `api_hash` from here: https://my.telegram.org/

![where_to_get_app_config](https://raw.githubusercontent.com/JRakhimov/Managing-Client-Telegram/master/images/where_to_get_app_config.png)

### Now the environment part...

Install npm and Node.js on your machine, open a terminal then navigate to the folder where you want your project to be then run this command:

```bash
git clone https://github.com/JRakhimov/Managing-Client-Telegram.git
```

You should see something like this:

```bash
Cloning into 'Managing-Client-Telegram'...
remote: Counting objects: 17, done.
remote: Compressing objects: 100% (15/15), done.
remote: Total 17 (delta 3), reused 12 (delta 2), pack-reused 0
Unpacking objects: 100% (17/17), done.
```

## Installing

Now it is a good time to create your environment variables file to save the API keys that was granted to you by BotFather . To create the file just run still at the root project folder:

```bash
touch .env
```

Once the file is created, just open it and past the following environment variables with their respective values that you own, just remember that those keys are related to you and must not be shared with anyone else, remember to always have this file in your .gitignore so that way you do not push it accidentally. Your .env file must be something like this:

```js
BOT_TOKEN = "123456789:ABC_****" // Your telegram bot token
HOST = "https://your.domain" // Pay attention that your server must have SSL certificate and provide https connection!
BOT_NAME = "userNameOfBot" // Without "@"
API_HASH = "1eaf50c2ecs01fuidb26c1077418d5b" // Take it easy, this hash is invalid
API_ID = /\d\d\d\d\d\d/
IS_DEV = true || false // Connect to dev or production server
```

## Running

Easiest way to launch the project is using [tunnel](https://ngrok.com/) as a host to your local machine:

```bash
npm install ngrok -g
```

Then just type in your terminal `ngrok http 3000`

![get_host_using_ngrok](https://raw.githubusercontent.com/JRakhimov/Managing-Client-Telegram/master/images/get_host_using_ngrok.png)

Finally this https url will be your host, and you can add this to your .env

After all of this setting up, just run your bot with:

```bash
npm install

npm run start
```

All of your bot's requests will be logged in your terminal.

## Commands

- /auth (auth) - Sign in to your account
- Stay with us...
