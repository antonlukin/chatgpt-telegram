# ChatGPT Telegram Bot

Simple Telegram bot to connect with ChatGPT via OpenAI Api

## Requirements
**NodeJS 18**, **pm2**, and **yarn** to install packages

## Installation
1. Clone this git repo with `git clone`
2. Add required js modules with `yarn`
3. Set config to `.env` file using `.env.example`
4. Start bot with `pm2 start bot.js --name "chatgpt"` command

## Notes
Set `AUTH_KEY` to alphanumeric value.  
To start dialog with this bot, send him `/start <AUTH_KEY>` or use deeplink:
https//t.me/<bot_name>?start=<AUTH_KEY>