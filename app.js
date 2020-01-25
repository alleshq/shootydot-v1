//Dependencies
var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');

//Config
var mapSize = 1000; // -500 to 500.
var spawnArea = (mapSize / 5) * 3 //3 fifths of map.
var tickSpeed = 30;
var speedBoostProgress = 0.1;
var playerHitbox = 10;
var bulletSpeed = 5;
var maxBullets = 500;
var maxPlayers = 20;
var codes = JSON.parse(fs.readFileSync('codes.json', 'utf8'));
var botNames = ["Kyle", "Trevor", "Michael", "Sarah", "Alex", "Stephan", "Miles", "Rufus", "Cinda", "Velva", "Albern", "Susan"];
var botDirChange = 5;

//Declare variables
var players = {};
var playerSecrets = {};
var stars = [];
var bullets = [];

//Express
server.listen(7654);

//Random String Generator
function randomString(length) {
  var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  var result = "";
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

//Random Co-ordinate
function randCoord() {
  return Math.floor(Math.random() * spawnArea) - spawnArea / 2; //Somewhere in the inner 3 fifths of the map
}

//Random chance
function randChance(denominator) {
  return Math.floor(Math.random() * denominator) === 0;
}

//Socket.io Listeners
io.on('connection', function(socket) {

  //Declare Player
  socket.on("declare player", function (data) {
    if (Object.keys(players).length > maxPlayers) return;
    if (!(data.id && data.secret && data.name)) return; //No data specified.
    if (players[data.id]) return; //No, you cannot decide to be a player that already exists.
    var playerdata = {
      name: data.name,
      x: randCoord(),
      y: randCoord(),
      speedBoost: {
        active: false,
        full: 80,
      },
      speed: 1,
      bulletPower: 1,
      direction: 0,
      score: 100,
      plague: randChance(5)
    };

    playerdata.vip = codes.vip.includes(playerdata.name); //VIP

    //Secret Names
    switch (playerdata.name) {
      case codes.admin:
        playerdata.plague = true;
        playerdata.score = Infinity;
        playerdata.bulletPower = 100;
        playerdata.speed = 2;
        playerdata.nameScramble = true;
        break;
      case codes.fast:
        playerdata.speed = 5;
        playerdata.nameScramble = true;
        break;
      case codes.plague:
        playerdata.plague = true;
        playerdata.nameScramble = true;
        break;
      case codes.freeze:
        playerdata.special = "freeze";
        playerdata.nameScramble = true;
        break;
    }
    if (playerdata.nameScramble) playerdata.name = " ";

    playerSecrets[data.id] = data.secret;
    players[data.id] = playerdata;
  });

  //Player Action
  socket.on("player action", function (data) {
    if (!(data.id && data.secret && data.action)) return; //Not id and/or secret specified.
    if (playerSecrets[data.id] != data.secret) return; //Invalid Secret
    if (!data.action.command) return; //No action command
    switch (data.action.command) {

      case "activate speed boost": //Speed Boost
        if (players[data.id].speedBoost.full != 100) return; //Speed Boost not full
        players[data.id].speedBoost.active = true;
        break;

      case "change direction": //Change Direction
        var direction = data.action.param;
        if (!direction && direction != 0) return; //Parameter not included (0 would normally not work)
        if (typeof(direction) != "number") return; //Parameter is not number
        if (direction < 0 || direction > 360) return; //Not valid direction
        if (players[data.id].name === codes.direction) { //No direction control
          players[data.id].direction = Math.floor(Math.random() * 360);
        } else {
          players[data.id].direction = direction;
        }
        break;

      case "shoot": //Shoot Bullet
        players[data.id].score--;
        if (bullets.length > maxBullets) return; //Maximum Bullets in Arena
        bullets.push({
          owner: data.id,
          bulletPower: players[data.id].bulletPower,
          direction: players[data.id].direction,
          x: players[data.id].x,
          y: players[data.id].y,
          plague: players[data.id].plague
        });
        break;

    }
  });

});

//Kill Player
function kill(playerid) {
  delete players[playerid];
  delete playerSecrets[playerid];
}

//Generate stars
for (var star = 0; star < 500; star++) {
  stars.push({
    x: Math.floor(Math.random() * mapSize) - mapSize / 2,
    y: Math.floor(Math.random() * mapSize) - mapSize / 2
  });
}

//Game loop
setInterval(function () {
  //Emit gamedata to clients
  io.emit("gamedata", {
    players: players,
    stars: stars,
    bullets: bullets
  });

  //For each player
  for (var i = 0; i < Object.keys(players).length; i++) {
    var playerdata = players[Object.keys(players)[i]];

    //Name Scramble
    if (playerdata.nameScramble) playerdata.name = randomString(5);

    //Speed Boost Progress
    if (playerdata.speedBoost.active) { //If active
      playerdata.speedBoost.full = playerdata.speedBoost.full - 0.5 //Decrease quickly
      if (playerdata.speedBoost.full < 0) { //If is then less than zero
        playerdata.speedBoost.active = false; //Deactivate Speed boost
        playerdata.speedBoost.full = 0; //Set to zero
      }
    } else if (playerdata.speedBoost.full != 100) { //If not active then if not at 100:
      playerdata.speedBoost.full = playerdata.speedBoost.full + 0.2 //Increase slowly
      if (playerdata.speedBoost.full > 100) { //If is then more than 100
        playerdata.speedBoost.full = 100; //Set to 100
      }
    }

    //Movement
    playerdata.x = playerdata.x + (Math.cos((playerdata.direction-90)*(Math.PI/180)) * playerdata.speed * (playerdata.speedBoost.active ? 2 : 1));
    playerdata.y = playerdata.y + (Math.sin((playerdata.direction-90)*(Math.PI/180)) * playerdata.speed * (playerdata.speedBoost.active ? 2 : 1));

    //randtp
    if (playerdata.name === codes.randtp) {
      if (randChance(200)) { //Random chance every tick will tp
        playerdata.x = randCoord();
        playerdata.y = randCoord();
      }
    }

    //Plague
    if (playerdata.plague) {
      if (randChance(3)) { //Random chance every tick will lose health
        playerdata.score = playerdata.score - 1;
      }
    }

    //Bot Functions
    if (playerdata.bot) {
      //Toggle Direction change
      if (randChance(playerdata.bot.changeDir ? 50 : 500)) {
        playerdata.bot.changeDir = !playerdata.bot.changeDir;
        if (playerdata.bot.changeDir) {
          playerdata.bot.clockwise = randChance(2);
        }
      }

      if (playerdata.bot.changeDir) {
        playerdata.direction = playerdata.direction + (playerdata.bot.clockwise ? botDirChange : -botDirChange);
      }

      if (randChance(500)) {
        playerdata.speedBoost.active = true;
      }

      if (randChance(30)) {
        bullets.push({
          owner: Object.keys(players)[i],
          bulletPower: playerdata.bulletPower,
          direction: playerdata.direction,
          x: playerdata.x,
          y: playerdata.y,
          plague: playerdata.plague
        });
      }
    }

    //Kill if score < 1
    if (playerdata.score < 1) {
      //Bomb Code
      if (playerdata.name === codes.bomb) {
        for (var bombbullet = 0; bombbullet < 36; bombbullet++) {
          if (bullets.length < maxBullets) {
            bullets.push({
              owner: Object.keys(players)[i],
              bulletPower: 200,
              direction: bombbullet * 10,
              x: playerdata.x,
              y: playerdata.y
            });
          }
        }
      }
      kill(Object.keys(players)[i]);
      i--;
      break;
    }

    //Take points from players outside map
    if (playerdata.x > (mapSize / 2) || playerdata.x < (0 - mapSize / 2) || playerdata.y > (mapSize / 2) || playerdata.y < (0 - mapSize / 2)) {
      playerdata.score = playerdata.score - 10;
    }

    //Save changes to playerdata
    players[Object.keys(players)[i]] = playerdata;
  }

  //For each bullet
  for (var i = 0; i < bullets.length; i++) {

    //Movement
    bullets[i].x = bullets[i].x + (Math.cos((bullets[i].direction-90)*(Math.PI/180)) * bulletSpeed);
    bullets[i].y = bullets[i].y + (Math.sin((bullets[i].direction-90)*(Math.PI/180)) * bulletSpeed);

    //Remove if outside map
    if (bullets[i].x > (mapSize / 2) || bullets[i].x < (0 - mapSize / 2) || bullets[i].y > (mapSize / 2) || bullets[i].y < (0 - mapSize / 2)) {
      bullets.splice(i, 1);
      i--;
      break;
    }

    //Check all players for bullet hit
    for (var j = 0; j < Object.keys(players).length; j++) {
      var playerdata = players[Object.keys(players)[j]];

      //Check if bullet x/y within hitbox and not bullet owner
      var shotsuccess = false;
      if (playerdata.x - playerHitbox < bullets[i].x && playerdata.x + playerHitbox > bullets[i].x && playerdata.y - playerHitbox < bullets[i].y && playerdata.y + playerHitbox > bullets[i].y && bullets[i].owner != Object.keys(players)[j]) {

        if (players[bullets[i].owner]) { //If owner is still alive
          players[bullets[i].owner].score = players[bullets[i].owner].score + 5; //Grant them points

          //Disable Code
          if (players[Object.keys(players)[j]].name === codes.disable) {
            playerSecrets[bullets[i].owner] = randomString(50);
          }

          //Freeze Code
          if (players[bullets[i].owner].special === "freeze") {
            players[Object.keys(players)[j]].speed = 0;
          }
        }

        players[Object.keys(players)[j]].score = players[Object.keys(players)[j]].score - bullets[i].bulletPower; //Take points from player who was shot

        //Spread Plague
        if (bullets[i].plague) {
          players[Object.keys(players)[j]].plague = true;
        }

        //Bot flee
        if (players[Object.keys(players)[j]].bot) {
          players[Object.keys(players)[j]].speedBoost.active = true;
        }

        bullets.splice(i, 1); //And remove this bullet
        i--;
        shotsuccess = true;
        break;
      }
      if (shotsuccess) break;
    }
  }
}, 1000 / tickSpeed);

//Create Bots
function createBot() {
  var playerdata = {
    name: botNames[Math.floor(Math.random() * botNames.length)],
    x: randCoord(),
    y: randCoord(),
    speedBoost: {
      active: false,
      full: 100,
    },
    speed: 1,
    bulletPower: 5,
    direction: Math.floor(Math.random() * 360),
    score: 100,
    plague: randChance(5),
    bot: {}
  };
  players["$" + randomString(50)] = playerdata;
}
setInterval(createBot, 2000);