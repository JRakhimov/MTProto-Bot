# Managing Client

## About
Telegram client for maganing groups based on MTProto-Nodejs [**telegram-mtproto**](https://github.com/zerobias/telegram-mtproto) library with [**mtproto-storage-fs**](https://www.npmjs.com/package/mtproto-storage-fs)


## Features
- Connects with [Telegram's MTProto](https://core.telegram.org/mtproto) server and saves the client session
- Sets your status to online
- Gets all your dialogs (see logs)

## Requirements
```
npm install --save telegram-mtproto@2.2.8
npm install --save mtproto-storage-fs
```

## Documentation
- The api_id and api_hash values can be obtained here: 
  - https://my.telegram.org/
    - ![where_to_get_app_config](https://raw.githubusercontent.com/Kati3e/KatBot-MTProto-Nodejs/master/images/where_to_get_app_config.png)  

- The channel_id and access_hash values can be obtained here:
  - https://tjhorner.com/webogram/
    - or
  - https://fabianpastor.github.io/webogram
  - ![where_to_get_chat_info](https://raw.githubusercontent.com/Kati3e/KatBot-MTProto-Nodejs/master/images/where_to_get_chat_info.png)  

## Goal
1. Control groups with specific prefix in groupNames
2. Add a user to more than one group
3. So on...

## To do
- Make Web interface