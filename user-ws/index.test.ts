import { test, describe } from "bun:test"

const BACKEND_URL = "ws://localhost:8080"

describe("Chat application", () => {
   test("Message sent from room1 reaches another participant also in room1", async () => {
      const ws1 = new WebSocket(BACKEND_URL)
      const ws2 = new WebSocket(BACKEND_URL)

      // await new Promise<void>((resolve, reject) => {
      //    let ctr = 0;
      //    ws1.onopen = () => {
      //       ctr += 1;
      //       if (ctr == 2) resolve();
      //    }
      //
      //    ws2.onopen = () => {
      //       ctr += 1;
      //       if (ctr == 2) resolve();
      //    }
      // })

      // await Promise.all([
      //    new Promise(r => ws1.onopen = r),
      //    new Promise(r => ws2.onopen = r)
      // ]);

      const timeout = 10 * 1000;

      try {
         await Promise.race([
            Promise.all([
               new Promise(res => ws1.onopen = res),
               new Promise(res => ws2.onopen = res)
            ]),
            new Promise((_, rej) => {
               setTimeout(rej, timeout)
            })
         ])
      } catch (e) {
         console.log(e);
      }

      ws1.send(JSON.stringify({
         data: "hi there"
      }))

      ws2.send(JSON.stringify({
         data: "hi there"
      }))

   })
})
