const webSocketsServerPort = 8353;

const webSocketServer = require("websocket").server;
const http = require("http");

const history = [];
const clients = [];

var server = http.createServer(function (request, response) {
  // HTTP Server stays empty - just needed to create WebScocker server
});
server.listen(webSocketsServerPort, function () {
  console.log(
    new Date() + " Server is listening on port " + webSocketsServerPort
  );
});
var wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server,
});

// Client connects
wsServer.on("request", function (request) {
  // Client sent some message
  connection.on("message", function (message) {
  });
  // Client disconnects
  connection.on("close", function (connection) {
  });
});
