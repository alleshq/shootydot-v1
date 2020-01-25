var socket = io("https://sd-gamesrv.point0.tech");
var myPlayer;
var deathstrikes;
var maxDeathstrikes = 30;

function declarePlayer(name) {
  //Reset deathstrikes
  deathstrikes = 0;
  //Generate random id and key
  myPlayer = {
    id: randomString(50),
    secret: randomString(50),
    name: name
  };
  socket.emit("declare player", myPlayer);
}

//Random String Generator
function randomString(length) {
  var chars = "abcdefghijklmnopqrstuvwxyz01234567890";
  var result = "";
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

//Recieve gamedata
socket.on("gamedata", function (gamedata) {
  window.gamedata = gamedata;
  if (typeof(myPlayer) != "undefined") { // If player credentials are set

    //myPlayer death management
    if (typeof(gamedata.players[myPlayer.id]) === "undefined") { //If player was not sent in gamedata
      if (deathstrikes > maxDeathstrikes) { //More than maximum ticks in a row without player
        gameOver(); //Player is likely dead
        return;
      }
      console.log("Death strike " + deathstrikes + "/" + maxDeathstrikes);
      deathstrikes++; //Add to deathstrikes
      return;
    }

    deathstrikes = 0; //Reset deathstrikes
    renderMap();
  }
});

//Game Over
function gameOver() {
  myPlayer = undefined;
  $("#gameMenu").fadeIn();
  console.log("Game Over");
}

//Player Action
function playerdo(action, parameter) {
  if (typeof(myPlayer) === "undefined") return; //Player not declared
  socket.emit("player action", {
    id: myPlayer.id,
    secret: myPlayer.secret,
    action: {
      command: action,
      param: parameter
    }
  });
}
