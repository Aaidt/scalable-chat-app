import { WebSocketServer, WebSocket } from "ws";

const port = 8081
const wss = new WebSocketServer({ port });

let channels = new Map<string, Set<WebSocket>>()

const RELAYER_URL = "ws://localhost:3001"
const relayerSocket = new WebSocket(RELAYER_URL)

relayerSocket.onmessage = ({ data }) => {
   console.log("got from relayerSocket")
   const parsedData = JSON.parse(data.toString());
   const sockets = channels.get(parsedData.channel);
   if (!sockets) return;

   for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
         console.log("sending to sockets", parsedData)
         ws.send(JSON.stringify(parsedData));
      }
   }
}

wss.on("connection", function connection(ws) {
   ws.on("error", console.error)
   let channel: string | null = null;
   ws.on("message", function message(data: string) {
      const parsedData = JSON.parse(data);

      if (parsedData.type === "join") {
         channel = parsedData.channel
         if (!channel) throw new Error("no channel")
         if (!channels.has(channel!)) {
            channels.set(channel!, new Set())
         }
         channels.get(channel!)?.add(ws)

         console.log(channels, channel, "joined ")
      }

      if (parsedData.type === "chat" && channel) {
         relayerSocket.send(JSON.stringify({
            type: "chat",
            channel: channel,
            message: parsedData.message
         }))
         console.log("sent to relayerSocket")
      }
   })

   ws.on("close", () => {
      if (channel) {
         channels.get(channel)?.delete(ws)
      }
   })
})

wss.on("listening", () => console.log(`listening on port: ${port}`))
