import { z } from "zod";

const chatId = z.number().int().refine((n) => n !== 0, "chat_id must be non-zero");

export const createCommandSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("group.approve"), payload: z.object({ chat_id: chatId }) }),
  z.object({ type: z.literal("group.disapprove"), payload: z.object({ chat_id: chatId }) }),
  z.object({ type: z.literal("group.pause"), payload: z.object({ chat_id: chatId }) }),
  z.object({ type: z.literal("group.resume"), payload: z.object({ chat_id: chatId }) }),
  z.object({ type: z.literal("file.delete"), payload: z.object({ file_id: z.string().trim().min(1).max(256) }) }),
]);

export type CreateCommandInput = z.infer<typeof createCommandSchema>;

export function commandTarget(input: CreateCommandInput): { targetType: "group" | "file"; targetId: string } {
  if (input.type === "file.delete") return { targetType: "file", targetId: input.payload.file_id };
  return { targetType: "group", targetId: String(input.payload.chat_id) };
}
