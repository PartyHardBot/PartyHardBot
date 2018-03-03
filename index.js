const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.API_KEY, {
  polling: true
});

let linktest = /^(https?:\/\/)?(www.)?youtu((.be)|be.com?)\/(watch\?v=)?\S{11}$/;

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

var Names = [];
var Ids = [];

ref.on('value', data => {
  getdata();
});

function getdata() {
  ref.on('value', data => {
    Names = [];
    Ids = [];
    let songs = data.val();
    let keys = Object.keys(songs);
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      Names.push(songs[k].name);
      Ids.push(songs[k].id);
    }
  });
}

bot.onText(/(\/start|\/help)/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hello,\nthis is a bot that sends party hard songs when you type /partyhard.\nIf you want to send a song write /newsong [Name] [Youtube link]");
  getdata();
});

bot.onText(/\/partyhard/, (msg) => {
  getdata();
  let video = Math.floor((Math.random() * Ids.length));
  bot.sendMessage(msg.chat.id, Names[video]+"\nhttps://youtu.be/"+Ids[video]);
});

bot.onText(/(\/newsong@InfoPartyHardBot (.+)|\/newsong (.+))/, (msg, match) => {
  getdata();
  let args = match[1].split(" ");
  let link = args[args.length-1];
  let id = link.substring(link.length-11,link.length);
  let name = args.slice(1, args.length-1).join(" ");
  let exists = false;
  let youtube = linktest.test(link);
  if (!linktest.test(link)) bot.sendMessage(msg.chat.id, "Please use a youtube link");
  for (let i = 0; i < Ids.length; i++) {
    if (id == Ids[i] || name == Names[i]) {
      exists = true;
      bot.sendMessage(msg.chat.id, "Another user sent that song");
    }
  }
  if (!exists && youtube) {
    ref.push(data = {
      name,
      id
    });
    bot.sendMessage(msg.chat.id, "Your song was saved");
  }
});

bot.on("inline_query", msg => {
  getdata();
  let results = [];
  for (let i = 0; i < Names.length; i++) {
    for (let j = 0; j < Names[i].length; j++) {
      const searchfor = msg.query.toLowerCase();
      if (Names[i].substring(j, searchfor.length+j).toLowerCase() == searchfor) {
        results.push({
          "type": "article",
          "id": msg.id + i,
          "title": Names[i],
          "input_message_content": {
            "message_text": Names[i] + "\nhttps://youtu.be/" + Ids[i]
          },
          "thumb_url": "https://img.youtube.com/vi/"+Ids[i]+"/0.jpg"
        });
        break;
      }
    }
  }
  bot.answerInlineQuery(msg.id, results);
});
