import express, { type Response, type Request } from "express";

const app = express();
app.use(express.json());

const clients = new Map<string, any>();

app.get("/streams/:userId", (req: Request, res: Response) => {
   const { userId } = req.params;

   res.setHeader("Content-Type", "text/event-streams");
   res.setHeader("Cache-Control", "no-cache");
   res.flushHeaders();

   clients.set(userId as string, res);

   req.on("close", () => clients.delete(userId as string))

})

export function sendToUserSSE(userId: string, message: string) {
   const res = clients.get(userId);

   if (res) {
      res.write(`data: ${message}\n\n`);

   }
}

app.listen(3000, () => {
   console.log("server is listening on port 3000")
})
