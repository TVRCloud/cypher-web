import { z } from "zod";

export const FileItemSchema = z.object({
  _id: z.string(),
  file_name: z.string(),
  file_type: z.string(),
  file_size: z.number(),
  language: z.string().nullable(),
  quality: z.string().nullable(),
  year: z.string().nullable(),
});

export const FileListSchema = z.array(FileItemSchema);

export const FileStatsSchema = z.object({
  totalFiles: z.number(),
  totalSize: z.number(),
  videoCount: z.number(),
  avgSize: z.number(),
});
