import { createClient, type RedisClientType } from "redis";
import { sendToUser } from "./websocket";
import { sendToUserSSE } from "./SSE";

export class StockManager {
   private static instance: StockManager;
   private pubClient: RedisClientType;
   private subClient: RedisClientType;

   private subscriptions = new Map<string, Set<string>>()

   private constructor() {
      this.pubClient = createClient();
      this.subClient = createClient();

      this.pubClient.connect();
      this.subClient.connect();
   }

   public static getInstance(): StockManager {
      if (!StockManager.instance) return StockManager.instance = new StockManager();

      return StockManager.instance;
   }

   async addUserToTicker(userId: string, ticker: string) {
      if (!this.subscriptions.has(ticker)) this.subscriptions.set(ticker, new Set());

      await this.subClient.subscribe(ticker, (message) => {
         this.forwardToUsers(ticker, message);
      });
      this.subscriptions.get(ticker)!.add(userId)

   }

   async removeUserFromTicker(userId: string, ticker: string) {
      const users = this.subscriptions.get(ticker);
      if (!users) return;

      if (users.size === 0) {
         await this.subClient.unsubscribe(ticker);
         this.subscriptions.delete(ticker);
      }
      users.delete(userId);

   }

   async publishToUser(ticker: string, message: string) {
      await this.pubClient.publish(ticker, message)
   }

   private forwardToUsers(ticker: string, message: string) {
      const users = this.subscriptions.get(ticker);
      if (!users) return;

      for (const userId of users) {
         this.forwardToUser(userId, ticker, message)
      }
   }

   forwardToUser(userId: string, ticker: string, message: string) {
      // sendToUser(userId, JSON.stringify({ ticker, message }))
      // sendToUserSSE(userId, JSON.stringify({ ticker, message }))
   }
}

StockManager.getInstance()
