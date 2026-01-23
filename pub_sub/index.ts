import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";

const wss = new WebSocketServer({ port: 8080 });
const redisPub = createClient({ url: "redis://localhost:6379" });
const redisSub = createClient({ url: "redis://localhost:6379" });

await redisPub.connect();
await redisSub.connect();

const rooms = new Map<string, Set<WebSocket>>()

function broadcastLocally(roomId: string, payload: string) {
   const sockets = rooms.get(roomId);
   if (!sockets) return;

   for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
         ws.send(payload)
      }
   }
}

async function join_room(roomId: string, ws: WebSocket) {
   if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
      await redisSub.subscribe(`room:${roomId}`, (message) => {
         const payload = message.toString();
         broadcastLocally(roomId, payload)
      })
   }
   rooms.get(roomId)?.add(ws);
}

function leave_room(roomId: string, ws: WebSocket) {
   const set = rooms.get(roomId);
   if (!set) return;

   set.delete(ws);
   if (set.size == 0) {
      redisSub.unsubscribe(`room:${roomId}`)
      rooms.delete(roomId);
   }
}

wss.on("connection", (ws) => {
   let joinedRoom: string | null = null

   ws.on("message", (message) => {
      const payload = JSON.parse(message.toString())

      if (payload.type === "join_room") {
         joinedRoom = payload.roomId
         join_room(joinedRoom!, ws)
      }

      if (payload.type === "leave_room" && joinedRoom) {
         leave_room(joinedRoom, ws)
         joinedRoom = null
      }

      if (payload.type === "chat") {
         redisPub.publish(
            `room:${payload.roomId}`,
            JSON.stringify(payload)
         )
      }
   })

   ws.on("close", () => {
      if (joinedRoom) {
         leave_room(joinedRoom, ws)
      }
   })
})

wss.on("listening", () => {
   console.log("Listening on port 8080")
})
