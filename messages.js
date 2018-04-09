const randomsong = (songs) => {
  let random = Math.floor((Math.random() * songs.length));
  return songs[random].name+"\nhttps://youtu.be/"+songs[random].id;
};

const inline = (name, id) => name + "\nhttps://youtu.be/" + id;

module.exports = {
  start: "Hi,\nI'm a Bot made in node.js that sends songs stored in partyhard.javojav.com, when you write /partyhard.\n If you want to save a song write /newsong [Name of the song] [Youtube link of that song]",
  randomsong: randomsong,
  notyoutube: "Please use a valid youtube link",
  exists: "Another user sent that song",
  savedsong: "Your song was saved",
  inline: inline
}
