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

const Names = [];
const Links = [];

function getdata() {
  ref.on('value', data => {
    Names = [];
    Links = [];
    var songs = data.val();
    var keys = Object.keys(songs);
    console.log(keys);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      Names.push(songs[k].name);
      Links.push(songs[k].link);
      console.log(songs[k].name,songs[k].link);
    }
  });
}

bot.onText(/(\/start|\/help)/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hello,\nthis is a bot that sends party hard songs when you type /partyhard.\nIf you want to send a song write /newsong [Name]_[Youtube link] (write \"_\" after the Name don't write a space, if you do that it won't work)");
  getdata();
});

bot.onText(/\/partyhard/, (msg) => {
  getdata();
  var video = Math.floor((Math.random() * Links.length));
  bot.sendMessage(msg.chat.id, Names[video]);
  setTimeout(function(){bot.sendMessage(msg.chat.id, Links[video]);}, 100);
});

bot.onText(/\/newsong (.+)/, (msg, match) => {
    getdata();
    var namelink = match[1].split("_");
    var shit = true;
    var data = {
     name: namelink[0],
     link: namelink[1]
   }
   if (data.link.substring(0,29) == "https://www.youtube.com/watch" || data.link.substring(0,16) == "https://youtu.be") shit = false;
    for (var i = 0; i < Links.length; i++) {
      if (data.link == Links[i]) shit = true;
      if (data.name == Names[i]) shit = true;
    }
    if (shit === false) {
     ref.push(data);
     bot.sendMessage(msg.chat.id, "Your song was saved");
   } else {
     bot.sendMessage(msg.chat.id, "Failed");
     setTimeout(function(){bot.sendMessage(msg.chat.id, "Maybe another user send that song or the link is wrong");}, 100);
   }
});
