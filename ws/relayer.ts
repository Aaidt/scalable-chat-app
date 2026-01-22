import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 3001 });

let servers = new Set<WebSocket>();

wss.on("connection", function connection(ws) {
   ws.on("error", console.error)
   servers.add(ws);
   console.log("added the servers", servers)
   ws.on("message", function message(data: string) {
      for (const ws of servers) {
         if (ws.readyState === ws.OPEN) ws.send(data)
         console.log("sent to respective servers")
      }
   })

   ws.on("close", () => servers.delete(ws))
})

wss.on("listening", () => {
   console.log("listening on 3001")
})
