const TelegramBot = require('node-telegram-bot-api');
const token = '1140531263:AAGXozLmBq1esFTRvt7bZG2kavY7-g4kcwA';
const bot = new TelegramBot(token, { polling: true });
const libgen = require('libgen');
let keyboard;
// /Start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const loganImg = 'https://ak5.picdn.net/shutterstock/videos/1335595/thumb/1.jpg';
  bot
    .sendPhoto(chatId, loganImg, {
      caption: `Welcome ${msg.from.first_name}! Find any eBook by just sending the Title. e.g send 'Think Fast and Slow'`,
    })
    .then(() => movieOptions(chatId, 'Magic of thinking big'));
});

bot.onText(/^((?!\/).*)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (match !== null) {
    movieOptions(chatId, match[1]);
  }
});

// list of movie options after each text
const movieOptions = async (chatId, book) => {
  bot.sendMessage(chatId, 'Loading Please Wait...');
  try {
    const keyboard = await fetchData(book);
    const message = keyboard.length
      ? 'Select A Book!'
      : 'Book Not Found please check your spelling!';

    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
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
          url: `http://80.82.78.13/get.php?md5=${data[
            n
          ].md5.toLowerCase()}&key=SYD6F4100GCKLTVO&mirr=1`,
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
