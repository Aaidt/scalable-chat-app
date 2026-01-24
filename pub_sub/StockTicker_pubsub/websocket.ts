import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const sockets = new Map<string, WebSocket>();

wss.on("connection", function connection(ws, req) {
   const userId = req.url!.split("?userId=")[1];
   if (!userId) {
      console.log("no userId")
      return
   }
   sockets.set(userId!, ws);

   ws.on("close", () => sockets.delete(userId!))
})

export function sendToUser(userId: string, message: string) {
   const ws = sockets.get(userId);

   if (ws?.readyState === WebSocket.OPEN) {
      ws?.send(message)
   }
}
