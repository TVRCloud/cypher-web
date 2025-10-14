import mongoose from "mongoose";

declare global {
  var _mongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) {
    mongoose.set("strictQuery", true);
    cached!.promise = mongoose.connect(MONGODB_URI!).then((m) => m);
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
