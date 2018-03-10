const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.API_KEY, {
  polling: true
});

const messages = require('./messages.js');

const firebase = require('firebase');
firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "infopartyhardbot.firebaseapp.com",
  databaseURL: "https://infopartyhardbot.firebaseio.com",
  projectId: "infopartyhardbot",
  storageBucket: "infopartyhardbot.appspot.com",
  messagingSenderId: process.env.MESSAGING_SENDER_ID
});

const database = firebase.database();
const ref = database.ref('songs');

let Songs = [];

ref.on('value', data => {
  Songs = [];
  for (i of Object.keys(data.val())) {
    Songs.push({
      name: data.val()[i].name,
      id: data.val()[i].id
    });
  }
});

bot.onText(/(\/start|\/help)/, msg => bot.sendMessage(msg.chat.id, messages.start));

bot.onText(/\/partyhard/, msg => bot.sendMessage(msg.chat.id, messages.randomsong(Songs)));

bot.onText(/(\/newsong@InfoPartyHardBot (.+)|\/newsong (.+))/, (msg, match) => {
  let args = match[1].split(" ");

  let link = args[args.length-1];
  let id = link.substring(link.length-11,link.length);

  let name = args.slice(1, args.length-1).join(" ");

  if (!songexists(name, id, msg.chat.id) && youtubelink(link, msg.chat.id)) {
    ref.push(data = {
      name,
      id
    });
    bot.sendMessage(msg.chat.id, messages.savedsong);
  }
});

const songexists = (name, id, msgid) => {
  for (i of Songs) {
    if (name == i.name || id == i.id) {
      bot.sendMessage(msgid, messages.exists);
      return true;
    }
  }
  return false;
}

const youtubelink = (link, msgid) => {
  const linktest = /^(https?:\/\/)?(www.)?youtu((.be)|be.com?)\/(watch\?v=)?\S{11}$/;
  if (!linktest.test(link)) {
    bot.sendMessage(msgid, messages.notyoutube);
    return false;
  }
  else return true;
}

bot.on("inline_query", msg => {
  let results = [];
  const searchfor = msg.query.toLowerCase();
  for (song of Songs) {
    for (let j = 0; j < song.name.length; j++) {
      const searchfor = msg.query.toLowerCase();
      if (song.name.substring(j, searchfor.length+j).toLowerCase() == searchfor) {
        results.push({
          "type": "article",
          "id": msg.id + Songs.indexOf(song),
          "title": song.name,
          "input_message_content": {
            "message_text": messages.inline(song.name, song.id)
          },
          "thumb_url": "https://img.youtube.com/vi/"+song.id+"/0.jpg"
        });
        break;
      }
    }
  }
  bot.answerInlineQuery(msg.id, results);
});
