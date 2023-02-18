import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import * as dotenv from 'dotenv';
import LocalSession from 'telegraf-session-local';
import { ChatGPTAPI } from 'chatgpt'

dotenv.config();

// Create bot instance
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use((new LocalSession({ database: 'sessions.json' })).middleware());

// Create ChatGPT instance
const chatgpt = new ChatGPTAPI({apiKey: process.env.OPENAI_TOKEN})

// Handle start with authorization
bot.command('/start', (ctx) => {
  const args = ctx.message.text.split(' ');
  const auth = ctx.session.auth || null;

  if (!auth && args[1] !== process.env.AUTH_KEY) {
    return ctx.reply('Для начала общения необходимо авторизоваться.');
  }

  const welcome = [];

  welcome.push('Привет, это бот ChatGPT.');
  welcome.push('Вы можете общаться со мной на любые темы, сохраняя контекст дискуссии.');
  welcome.push('Имейте в виду, я могу отвечать достаточно долго.');

  ctx.session.auth = 1;

  ctx.reply(welcome.join(' '));
})

// Handle any text command
bot.on(message('text'), async (ctx) => {
  if (!ctx.session.auth) {
    return ctx.reply('Для начала общения необходимо авторизоваться.');
  }

  const context = ctx.session.context || {};

  try {
    let skipper = 0;
    let message = null;

    context.timeoutMs = 3 * 60 * 1000;
    context.onProgress = async (partialResponse) => {
      if (skipper++ % 50 !== 5 || !partialResponse.text) {
        return;
      }

      if (message) {
        return await ctx.telegram.editMessageText(ctx.from.id, message.message_id, 0, partialResponse.text + '…');
      }

      message = await ctx.reply(partialResponse.text + '…');
    }

    const result = await chatgpt.sendMessage(ctx.message.text, context);

    ctx.session.context = {
      conversationId: result.conversationId,
      parentMessageId: result.id,
    }

    if (message) {
      return await ctx.telegram.editMessageText(ctx.from.id, message.message_id, 0, result.text);
    }

    await ctx.reply(result.text);
  } catch (err) {
    ctx.replyWithHTML('Возникла ошибка. Попробуйте позже\n <pre>' + JSON.stringify(err) + '</pre>');
  }
});

bot.catch((err) => {
  console.log('Ooops', err)
})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));