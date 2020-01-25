var socket = io("https://sd-gamesrv.point0.tech");

//Recieve gamedata
socket.on("gamedata", function (gamedata) {
  window.gamedata = gamedata;
  renderMap();
});
