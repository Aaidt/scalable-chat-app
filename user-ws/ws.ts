import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface Room {
   ws: WebSocket[]
}
let rooms: Record<string, Room> = {}

wss.on("connection", function connection(ws) {
   ws.on("error", console.error)

   ws.on("message", function message(data: string) {
      const parsedData = JSON.parse(data);
      const room = parsedData.room;

      if (!rooms[room]) {
         rooms[room] = { ws: [] }
      };

      if (parsedData.type == "join_room") {
         rooms[room].ws.push(ws)
         console.log("joined")
      }

      if (parsedData.type == "chat") {
         rooms[room].ws.map(socket => socket.send(data))
      }
   })
})
