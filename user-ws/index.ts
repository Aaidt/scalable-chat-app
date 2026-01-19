import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken"

const wss = new WebSocketServer({ port: 8080 });

interface Room {
   id: string
   users: Set<User>
   messages: string[]
}

interface User {
   id: string
   ws: WebSocket
   roomId: string[]
}

interface Data {
   type: "join_room" | "leave_room" | "chat"
   message?: string,
   roomId: string
}

function auth(token: string): boolean {
   const decoded = jwt.verify(token, "secret");
   if (!decoded) return false;
   return true;
}

let rooms: Map<string, Room> = new Map();
let users: User[] = [];

function broadcast(roomId: string, message: string) {
   const room = rooms.get(roomId)
   if (!room) return;
   for (const user of room?.users) {
      user.ws.send(JSON.stringify({ message }))
   }
}

wss.on("connection", function connection(ws, req) {
   ws.on("error", console.error);

   ws.on("close", () => {
      for (const room of rooms.values()) {
         broadcast(room.id, JSON.stringify({
            message: "connection w server has ended"
         }))
      }
   })

   const url = req.url;
   const token = new URLSearchParams(url?.split("?")[1]).get("token")
   if (!token) return;

   if (!auth(token)) return;

   ws.on("message", function message(rawData) {
      const data: Data = JSON.parse(rawData.toString())
      const roomId = data.roomId;
      if (!roomId) {
         console.log('no roomId')
         return;
      }
      const room = rooms.get(roomId);
      if (!room) {
         console.log('no room found')
         return;
      }

      const user = users.find(u => u.ws === ws)
      if (!user) {
         users.push({
            id: Bun.randomUUIDv5.toString(),
            ws,
            roomId: []
         })
      }

      switch (data.type) {
         case "join_room": {
            const joined = room?.users.add(user!)
            if (joined) {
               ws.send(JSON.stringify({
                  message: "joined the room"
               }))
            }
            break;
         }

         case "leave_room": {
            if (room.users.delete(user!)) {
               ws.send(JSON.stringify({
                  message: "left room"
               }))
            }
            break;
         }

         case "chat": {
            const message = data.message
            if (!message) {
               ws.send(JSON.stringify({
                  message: "no message recieved on the server"
               }));
            }
            room.users.forEach(user => {
               user.ws.send(JSON.stringify({
                  message
               }))
            })

            break;
         }
      }
   })

   ws.send("Connected to the server");
})

