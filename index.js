const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.API_KEY, {
  polling: true
});

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
  if (Ids[0] != null) {
    bot.sendMessage(msg.chat.id, Names[video]);
    setTimeout(function(){bot.sendMessage(msg.chat.id, "https://youtu.be/"+Ids[video]);}, 100);
  }
});

bot.onText(/(\/newsong@InfoPartyHardBot (.+)|\/newsong (.+))/, (msg, match) => {
  getdata();
  let link = match[1].substring(match[1].lastIndexOf(" ")+1,match[1].length);
  let id = link.substring(link.length-11,link.length);
  let name = match[1].substring(match[1].indexOf(" ")+1,match[1].lastIndexOf(" "));
  let exists = false;
  let youtube = false;
  if (link.substring(0,24) == "https://www.youtube.com/" || link.substring(0,16) == "https://youtu.be" || link.substring(0,15) == "http://youtu.be" || link.substring(0,23) == "http://www.youtube.com/") youtube = true;
  for (let i = 0; i < Ids.length; i++) {
    if (id == Ids[i] || name == Names[i]) exists = true;
  }
  if (exists === false && youtube === true) {
    ref.push(data = {
      name,
      id
    });
    bot.sendMessage(msg.chat.id, "Your song was saved");
  } else {
    bot.sendMessage(msg.chat.id, "Failed");
    setTimeout(function(){bot.sendMessage(msg.chat.id, "Maybe another user send that song or the link is wrong");}, 100);
  }
});
