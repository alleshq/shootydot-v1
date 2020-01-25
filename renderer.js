var playerSize = 20;
var starSize = 10;
var bulletSize = 5;
var distanceMultiplier = 5;
var overlayFont = "20px 'KoHo', sans-serif";
var colours = {
  bg: "#2c3e50",
  player: "#e74c3c",
  playerInfected: "#2ecc71",
  playerVip: "#6029ad",
  text: "#95a5a6",
  speedBar: "#27ae60",
  speedBarBg: "#95a5a6",
  speedBarActive: "#e67e22",
  star: "#bdc3c7",
  bullet: "#f39c12"
};

function renderMap() {
  canvas.height = innerHeight;
  canvas.width = innerWidth;
  var gamescreen = canvas.getContext('2d');
  var centerx = canvas.width / 2;
  var centery = canvas.height / 2;
  var myPlayerData = gamedata.players[myPlayer.id];

  //Background
  gamescreen.fillStyle = colours.bg;
  gamescreen.fillRect(0, 0, canvas.width, canvas.height);

  //Draw Stars
  if (renderStars.checked) {
    gamescreen.fillStyle = colours.star;
    for (var i = 0; i < gamedata.stars.length; i++) {
      var currentStar = gamedata.stars[i];
      var xoncanvas = centerx - ((myPlayerData.x - currentStar.x) * distanceMultiplier);
      var yoncanvas = centery - ((myPlayerData.y - currentStar.y) * distanceMultiplier);
      gamescreen.beginPath();
      gamescreen.arc(xoncanvas - playerSize / 2, yoncanvas - starSize / 2, starSize, 0, Math.PI * 2);
      gamescreen.fill();
    }
  }

  //Draw myPlayer
  gamescreen.beginPath();
  gamescreen.fillStyle = myPlayerData.plague ? colours.playerInfected : colours.player;
  gamescreen.arc(centerx - playerSize / 2, centery - playerSize / 2, playerSize, 0, Math.PI * 2);
  gamescreen.fill();

  //Draw other players
  for (var i = 0; i < Object.keys(gamedata.players).length; i++) {
    var currentPlayer = gamedata.players[Object.keys(gamedata.players)[i]];
    if (Object.keys(gamedata.players)[i] != myPlayer.id) {
      gamescreen.fillStyle = currentPlayer.plague ? colours.playerInfected : (currentPlayer.vip ? colours.playerVip : colours.player);
      var xoncanvas = centerx - ((myPlayerData.x - currentPlayer.x) * distanceMultiplier);
      var yoncanvas = centery - ((myPlayerData.y - currentPlayer.y) * distanceMultiplier);
      gamescreen.beginPath();
      gamescreen.arc(xoncanvas - playerSize / 2, yoncanvas - playerSize / 2, playerSize, 0, Math.PI * 2);
      gamescreen.fill();
      gamescreen.fillStyle = colours.text;
      gamescreen.fillText(currentPlayer.name + " (" + currentPlayer.score + ")", xoncanvas + playerSize, yoncanvas);
    }
  }

  //Draw Bullets
  gamescreen.fillStyle = colours.bullet;
  for (var i = 0; i < gamedata.bullets.length; i++) {
    var currentBullet = gamedata.bullets[i];
    var xoncanvas = centerx - ((myPlayerData.x - currentBullet.x) * distanceMultiplier);
    var yoncanvas = centery - ((myPlayerData.y - currentBullet.y) * distanceMultiplier);
    gamescreen.beginPath();
    gamescreen.arc(xoncanvas - bulletSize / 2, yoncanvas - bulletSize / 2, bulletSize, 0, Math.PI * 2);
    gamescreen.fill();
  }

  //Speed Bar
  gamescreen.fillStyle = colours.speedBarBg;
  gamescreen.fillRect(centerx - 100, canvas.height - 80, 200, 40);
  gamescreen.fillStyle = myPlayerData.speedBoost.active ? colours.speedBarActive : colours.speedBar;
  gamescreen.fillRect(centerx - 100, canvas.height - 80, myPlayerData.speedBoost.full * 2, 40);

  //Text Overlay Config
  var textOverlays = [
    'x: ' + Math.floor(myPlayerData.x),
    'y: ' + Math.floor(myPlayerData.y),
    'score: ' + myPlayerData.score,
    'players online: ' + Object.keys(gamedata.players).length
  ];
  var textOverlaysDev = [
    'bullets: ' + gamedata.bullets.length,
    'name: ' + myPlayerData.name
  ];

  //Text Overlays
  gamescreen.fillStyle = colours.text;
  gamescreen.font = overlayFont;
  if (devmode) textOverlays = textOverlays.concat(textOverlaysDev);
  for (var i = 0; i < textOverlays.length; i++) {
    gamescreen.fillText(textOverlays[i], 20, i * 30 + 30);
  }
}