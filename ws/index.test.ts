import { test, describe, expect } from "bun:test"
import { WebSocket } from "ws"

const BACKEND_URL1 = "ws://localhost:8080"
const BACKEND_URL2 = "ws://localhost:8081"

describe("Chat application", () => {
   test("Message sent from room1 reaches another participant also in room1", async () => {
      const ws1 = new WebSocket(BACKEND_URL1)
      const ws2 = new WebSocket(BACKEND_URL2)

      const timeout = 7 * 1000;
      try {
         await Promise.race([
            Promise.all([
               new Promise<void>(res => ws1.onopen = () => res()),
               new Promise<void>(res => ws2.onopen = () => res())
            ]),
            new Promise((_, rej) => {
               setTimeout(rej, timeout)
            })
         ])
         console.log("connected")
      } catch (e) {
         console.log(e);
      }

      ws1.send(JSON.stringify({
         type: "join",
         channel: "room-1"
      }))

      ws2.send(JSON.stringify({
         type: "join",
         channel: "room-1"
      }))
      await Bun.sleep(100)

      const recieved = new Promise<void>((resolve, reject) => {
         ws2.onmessage = ({ data }) => {
            try {
               const parsedData = JSON.parse(data.toString());
               console.log("recieved", parsedData)
               expect(parsedData.message == "hey")
               resolve()
            } catch (e) {
               reject(e)
            }
         }
      })
      ws1.send(JSON.stringify({
         type: "chat",
         message: "hey",
         channel: "room-1"
      }))

      await recieved;

      ws1.close();
      ws2.close();

   }, 10 * 1000)
})
