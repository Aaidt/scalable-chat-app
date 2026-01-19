import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

let servers: WebSocket[] = []

wss.on("connection", function connection(ws) {
   ws.on("error", console.error);

   servers.push(ws);

   ws.on("message", function message(rawData: string) {
      servers.map(socket => socket.send(JSON.stringify(JSON.parse(rawData))))
   })
})
