import mongoose, { type Connection } from "mongoose";
import { env } from "@/lib/config/env";

declare global {
  var botMongooseConn: { conn: Connection | null; promise: Promise<Connection> | null } | undefined;
}

const cached = global.botMongooseConn ?? { conn: null, promise: null };
global.botMongooseConn = cached;

export async function connectBotDb() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!env.BOT_DB_URI || !env.BOT_DB_NAME) {
      throw new Error("BOT_DB_URI and BOT_DB_NAME must be set to connect to the bot database");
    }
    const connection = mongoose.createConnection(env.BOT_DB_URI, {
      dbName: env.BOT_DB_NAME,
      maxPoolSize: 10,
      // The bot (cypher-v2) owns the bot DB schema and indexes; never create them from web.
      autoIndex: false,
      autoCreate: false,
    });
    cached.promise = connection.asPromise();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
