const webSocketsServerPort = 8353;

const webSocketServer = require("websocket").server;
const http = require("http");

let history = [];
const clients = [];

const server = http.createServer(function (request, response) {
  // HTTP Server stays empty - just needed to create WebScocker server
});
server.listen(webSocketsServerPort, function () {
  console.log(
    new Date() + " Server is listening on port " + webSocketsServerPort
  );
});
const wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server,
});

// Client connects
wsServer.on("request", function (request) {
  const connection = request.accept(null, request.origin);
  const index = clients.push(connection) - 1;
  let userName = false;
  console.log(new Date() + " Connection accepted.");

  // Client sent some message
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      if (userName === false) {
        userName = message.utf8Data;
        // Send chat history
        connection.sendUTF(JSON.stringify({ type: "history", data: history }));
        console.log(
          new Date() +
            " User is known as: " +
            userName
        );
      } else {
        console.log(
          new Date() +
            " Received Message from " +
            userName +
            ": " +
            message.utf8Data
        );
        // we want to keep history of all sent messages
        const obj = {
          time: new Date().getTime(),
          text: message.utf8Data,
          author: userName,
        };
        history.push(obj);
        history = history.slice(-100);
        // broadcast message to all connected clients
        const json = JSON.stringify({ type: "message", data: obj });
        for (var i = 0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }
    }
  });

  // Client disconnects
  connection.on("close", function (connection) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
    clients.splice(index, 1);
  });
});