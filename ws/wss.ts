import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let channels = new Map<string, Set<WebSocket>>()

const RELAYER_URL = "ws://localhost:3001"
const relayerSocket = new WebSocket(RELAYER_URL)

relayerSocket.onmessage = ({ data }) => {
   const parsedData = JSON.parse(data.toString());
   const sockets = channels.get(parsedData.channel);
   if (!sockets) return;

   for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
         ws.send(parsedData.message);
      }
   }
}

wss.on("connection", function connection(ws) {
   ws.on("error", console.error)
   let channel: string | null = null;
   ws.on("message", function message(data: string) {
      const parsedData = JSON.parse(data);

      if (parsedData.message === "join") {
         channel = parsedData.channel
         if (!channels.has(channel!)) {
            channels.set(channel!, new Set())
         }
         channels.get(channel!)?.add(ws)
      }

      if (parsedData.type === "chat" && channel) {
         relayerSocket.send(JSON.stringify({
            channel: channel,
            message: parsedData.message
         }))
      }
   })

   ws.on("close", () => {
      if (channel) {
         channels.get(channel)?.delete(ws)
      }
   })
})
