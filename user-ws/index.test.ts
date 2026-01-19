import { test, describe, expect } from "bun:test"

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
         type: "join_room",
         room: "room-1"
      }))

      ws2.send(JSON.stringify({
         type: "join_room",
         room: "room-1"
      }))

      await new Promise<void>((resolve) => {
         ws2.onmessage = ({ data }) => {
            const parsedData = JSON.parse(data);
            expect(parsedData.type == "chat")
            expect(parsedData.message == "hey")
            resolve()
         }
         ws1.send(JSON.stringify({
            type: "chat",
            message: "hey",
            room: "room-1"
         }))
      })

   })
})
