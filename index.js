const TelegramBot = require('node-telegram-bot-api');
const libgen = require('libgen');
require('dotenv').config();

const token = process.env.TELEGRAM_ACCESS_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// /Start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const loganImg = 'https://ak5.picdn.net/shutterstock/videos/1335595/thumb/1.jpg';
  bot
    .sendPhoto(chatId, loganImg, {
      caption: `Welcome ${msg.from.first_name}! Find and Download Any Book By Just Sending The Title.`,
    })
    .then(() => bot.sendMessage(chatId, 'First, I will have a test run. Sit Tight!'))
    .then(() => bookOptions(chatId, 'Magic of thinking big', true))
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

const bookOptions = async (chatId, bookTitle, start) => {
  bot.sendMessage(chatId, 'Loading Please Wait...');
  try {
    const booksArray = (await fetchData(bookTitle)) || [];

    for (let { title, downloadUrl, imageUrl } of booksArray) {
      await bot.sendPhoto(chatId, imageUrl, {
        caption: `<a href="${downloadUrl}"><strong>${title}</strong></a>`,
        parse_mode: 'HTML',
      });
    }

    if (booksArray.length) {
      if (!start) {
        await bot.sendMessage(
          chatId,
          `If you don't see what you're looking for try adding the author's name. E.g: Thinking Fast and Slow, Daniel Kahneman`
        );
      } else {
        await bot.sendMessage(chatId, `<strong>Test Passed Successfully!</strong>`, {
          parse_mode: 'HTML',
        });
        await bot.sendMessage(chatId, `Try Sending: Think Fast and Slow`);
      }
    } else {
      await bot.sendMessage(chatId, `Book Not Found please check your spelling!`);
    }
  } catch (error) {
    bot.sendMessage(chatId, `Sorry We're unable to process you're request`);
    console.log(error);
  }
};

const fetchData = async (bookTitle) => {
  try {
    const options = {
      mirror: 'http://gen.lib.rus.ec',
      query: bookTitle,
      count: 5,
      // sort_by: 'extension',
      // reverse: true,
      fields: ['Title', { extension: 'pdf' }],
    };

    const listOfBooks = await libgen.search(options);
    const booksArray = [];

    for (let book of listOfBooks) {
      let imageUrl = 'http://libgen.rs/covers/';

      // if coverurl exits and it's not empty or white space
      if (book.coverurl && !/^\s*$/.test(book.coverurl)) {
        imageUrl += book.coverurl;
      } else {
        imageUrl = 'https://readersend.com/wp-content/uploads/2018/04/book-sample_preview-1.png';
      }

      const details = {
        title: `[${book.extension.toUpperCase()}] ${book.title}`,
        downloadUrl: `http://80.82.78.35/get.php?md5=${book.md5.toLowerCase()}&key=S2NWTD621CJ0BAX9&mirr=1`,
        imageUrl,
      };
      booksArray.push(details);
    }
    return booksArray;
  } catch (error) {
    console.log(error);
    //=> 'Internal server error ...'
  }
};
