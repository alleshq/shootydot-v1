var playerSize = 4;
var starSize = 2;
var bulletSize = 1;
var distanceMultiplier = 1;
var overlayFont = "20px 'KoHo', sans-serif";
var colours = {
  bg: "#2c3e50",
  player: "#e74c3c",
  playerInfected: "#2ecc71",
  playerVip: "#6029ad",
  text: "#95a5a6",
  bullet: "#f39c12"
};

function renderMap() {
  canvas.height = innerHeight;
  canvas.width = innerWidth;
  var gamescreen = canvas.getContext('2d');
  var centerx = canvas.width / 2;
  var centery = canvas.height / 2;

  //Background
  gamescreen.fillStyle = colours.bg;
  gamescreen.fillRect(0, 0, canvas.width, canvas.height);

  //Draw players
  for (var i = 0; i < Object.keys(gamedata.players).length; i++) {
    var currentPlayer = gamedata.players[Object.keys(gamedata.players)[i]];
    gamescreen.fillStyle = currentPlayer.plague ? colours.playerInfected : (currentPlayer.vip ? colours.playerVip : colours.player);
    var xoncanvas = centerx - ((0 - currentPlayer.x) * distanceMultiplier);
    var yoncanvas = centery - ((0 - currentPlayer.y) * distanceMultiplier);
    gamescreen.beginPath();
    gamescreen.arc(xoncanvas - playerSize / 2, yoncanvas - playerSize / 2, playerSize, 0, Math.PI * 2);
    gamescreen.fill();
    gamescreen.fillStyle = colours.text;
    gamescreen.fillText(currentPlayer.name + " (" + currentPlayer.score + ")", xoncanvas + playerSize, yoncanvas);
  }

  //Draw Bullets
  gamescreen.fillStyle = colours.bullet;
  for (var i = 0; i < gamedata.bullets.length; i++) {
    var currentBullet = gamedata.bullets[i];
    var xoncanvas = centerx - ((0 - currentBullet.x) * distanceMultiplier);
    var yoncanvas = centery - ((0 - currentBullet.y) * distanceMultiplier);
    gamescreen.beginPath();
    gamescreen.arc(xoncanvas - bulletSize / 2, yoncanvas - bulletSize / 2, bulletSize, 0, Math.PI * 2);
    gamescreen.fill();
  }

  //Text Overlay Config
  var textOverlays = [
    'players online: ' + Object.keys(gamedata.players).length,
    'bullets: ' + gamedata.bullets.length
  ];

  //Text Overlays
  gamescreen.fillStyle = colours.text;
  gamescreen.font = overlayFont;
  for (var i = 0; i < textOverlays.length; i++) {
    gamescreen.fillText(textOverlays[i], 20, i * 30 + 30);
  }
}
