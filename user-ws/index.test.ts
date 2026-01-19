import { test, describe } from "bun:test"

const BACKEND_URL = "ws://localhost:8080"

describe("Chat application", () => {
   test("Message sent from room1 reaches another participant also in room1", async () => {
      const ws1 = new WebSocket(BACKEND_URL)
      const ws2 = new WebSocket(BACKEND_URL)

      await new Promise<void>((resolve, reject) => {
         let ctr = 0;
         ws1.onopen = () => {
            ctr += 1;
            if (ctr == 2) resolve();
         }

         ws2.onopen = () => {
            ctr += 1;
            if (ctr == 2) resolve();
         }
      })

      ws1.send(JSON.stringify({
         data: "hi there"
      }))

      ws2.send(JSON.stringify({
         data: "hi there"
      }))

   })
})
