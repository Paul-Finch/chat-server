const webSocketsServerPort = 8354;

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

const getChatRoomID = function (client, receiver) {
  if (client.localeCompare(receiver) == 1) {
    return client + receiver;
  }
  return receiver + client;
};

// Client connects
wsServer.on("request", function (request) {
  const client = request.resourceURL.query.client;
  const receiver = request.resourceURL.query.receiver;
  const connection = request.accept(null, request.origin);
  const index =
    clients.push({
      client: client,
      connection: connection,
    }) - 1;
  console.log(new Date() + " Connection accepted.");

  const chatRoomId = getChatRoomID(client, receiver);
  console.log('connection', chatRoomId);
  // find the history of given client and receiver
  const filteredChatRoomHistory = history.filter((historyObj) => {
    return historyObj.chatRoomId === chatRoomId;
  });

  if (filteredChatRoomHistory.length != 0) {
    connection.sendUTF(JSON.stringify({ type: "history", data: filteredChatRoomHistory }));
  }

  // Client sent some message
  connection.on("message", function (message) {
      console.log()
    if (message.type === "utf8") {
      console.log(
        new Date() + " Received Message from " + client + ": " + message.utf8Data
      );
      // we want to keep history of all sent messages
      const obj = {
        time: new Date().getTime(),
        text: message.utf8Data,
        chatRoomId: chatRoomId,
        author: client
      };
      history.push(obj);
      history = history.slice(-100);

      // send message to private client
      const json = JSON.stringify({ type: "message", data: obj });
      // check if receiver object exists
      const receiverObj = clients.find((clientObj) => {
          console.log(clientObj);
          console.log(receiver);
          return clientObj.client === receiver;
      });
      console.log('receiverObj', receiverObj);
      if (receiverObj) {
          console.log('message sent to receiver');
        receiverObj.connection.sendUTF(json);
      }
      connection.sendUTF(json);
    }
  });

  // Client disconnects
  connection.on("close", function (connection) {
    console.log(
      new Date() + " Peer " + client + " disconnected."
    );
    clients.splice(index, 1);
  });
});
