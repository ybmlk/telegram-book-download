const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const token = process.env.TELEGRAM_ACCESS_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const libgen = require('libgen');
let keyboard;
// /Start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const loganImg = 'https://ak5.picdn.net/shutterstock/videos/1335595/thumb/1.jpg';
  bot
    .sendPhoto(chatId, loganImg, {
      caption: `Welcome ${msg.from.first_name}! Find and Download Any Book By Just Sending The Title.`,
    })
    .then(() => bot.sendMessage(chatId, 'First, I will have a test run. Sit Tight!'))
    .then(() => bookOptions(chatId, 'Magic of thinking big', 'start'))
    .then(() =>
      bot.sendMessage(
        428992867,
        `${msg.from.first_name} ${msg.from.last_name} [@${msg.from.username}] Started...`
      )
    );
});

bot.onText(/^((?!\/).*)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (match !== null) {
    bookOptions(chatId, match[1]).then(() =>
      bot.sendMessage(
        428992867,
        `${msg.from.first_name} ${msg.from.last_name} [@${msg.from.username}] searched for "${match[1]}"`
      )
    );
  }
});

// list of movie options after each text
const bookOptions = async (chatId, book, start) => {
  bot.sendMessage(chatId, 'Loading Please Wait...');
  try {
    const keyboard = await fetchData(book);
    let message;
    if (keyboard.length && start !== 'start') {
      message = 'Select A Book!';
    } else if (keyboard.length && start === 'start') {
      message = 'Test Passed Successfully!';
    } else {
      message = 'Book Not Found please check your spelling!';
    }

    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });

    if (keyboard.length && start !== 'start') {
      await bot.sendMessage(
        chatId,
        `If you don't see what you're looking for try adding the author's name. E.g: Thinking Fast and Slow, Daniel Kahneman`
      );
    } else if (keyboard.length && start === 'start') {
      await bot.sendMessage(chatId, `Try Sending: Think Fast and Slow`);
    }
  } catch (error) {
    bot.sendMessage(chatId, `Sorry We're unable to process you're reqiest for now`);
    console.log(error);
  }
};

const fetchData = async (book) => {
  try {
    const options = {
      mirror: 'http://gen.lib.rus.ec',
      query: book,
      count: 5,
      // sort_by: 'extension',
      // reverse: true,
      fields: ['Title', { extension: 'pdf' }],
    };

    const data = await libgen.search(options);
    // if (data instanceof TypeError) {
    //   throw new Error('Spelling Error')
    // }
    let n = data.length;
    let keyboard = [];
    while (n--) {
      const collect = [
        {
          text: `(${data[n].extension}) ${data[n].title}`,
          url: `http://80.82.78.35/get.php?md5=${data[
            n
          ].md5.toLowerCase()}&key=S2NWTD621CJ0BAX9&mirr=1`,
        },
      ];

      keyboard.push(collect);
    }
    return keyboard;
  } catch (error) {
    console.log(error);
    //=> 'Internal server error ...'
  }
};
