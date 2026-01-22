import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 3001 });

let servers = new Set<WebSocket>();

wss.on("connection", function connection(ws) {
   ws.on("error", console.error)
   servers.add(ws);
   ws.on("message", function message(data: string) {
      const parsedData = JSON.parse(data);

      for (const ws of servers) {
         if (ws.readyState === ws.OPEN) ws.send(data)
      }
   })

   ws.on("close", () => servers.delete(ws))
})
