//Change direction
canvas.onmousemove = function (e) {
  var x1 = window.innerWidth / 2; //Center
  var y1 = window.innerHeight / 2; //Center
  var x2 = e.clientX;
  var y2 = e.clientY;
  var dx = x2 - x1;
  var dy = y2 - y1;
  var direction = Math.atan2(dy, dx)*(180/Math.PI); // https://stackoverflow.com/a/22977925/10124491 and https://stackoverflow.com/a/40120522/10124491
  //A few bug fixes
  direction = direction + 90;
  if (direction < 0) direction = direction + 360;
  direction = Math.floor(direction);
  //Send it to the server
  playerdo("change direction", direction);
}

//Speed boost
canvas.oncontextmenu = function (e) {
  playerdo("activate speed boost");
  return false;
};

//Shooting
var shooting = false;
canvas.onmousedown = function (e) {
  if (e.button === 0) shooting = true;
};
canvas.onmouseup = function (e) {
  if (e.button === 0) shooting = false;
};
setInterval(function () {
  if (shooting) playerdo("shoot");
}, 100);