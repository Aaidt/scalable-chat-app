import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8081 });

interface Room {
   ws: WebSocket[]
}
let rooms: Record<string, Room> = {}

const RELAYER_URL = "ws://localhost:3001"
const relayerSocket = new WebSocket(RELAYER_URL)

relayerSocket.onmessage = ({ data }) => {
   const parsedData = JSON.parse(data.toString());
   const room = parsedData.room;
   if (!rooms[room]) {
      rooms[room] = { ws: [] }
   }

   if (parsedData.type == "chat") {
      rooms[room].ws.map(socket => socket.send(JSON.stringify(parsedData.message)))
   }
}

wss.on("connection", function connection(ws) {
   ws.on("error", console.error)

   ws.on("message", function message(data: string) {
      const parsedData = JSON.parse(data);
      const room = parsedData.room
      if (!rooms[room]) {
         rooms[room] = { ws: [] }
      }
      if (parsedData.type == "chat") relayerSocket.send(data)

      if (parsedData.type == "join_room") rooms[room]?.ws.push(ws);

   })
})
