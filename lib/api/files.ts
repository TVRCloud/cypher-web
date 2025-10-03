import { FileListSchema, FileStatsSchema } from "@/schemas/fileSchema";
import { apiClient } from "@/utils/axios";

export const fetchFileStats = async () => {
  const res = await apiClient.get("/api/files/stats");
  return FileStatsSchema.parse(res.data);
};

export const fetchFiles = async ({
  skip,
  search,
  quality,
  language,
}: {
  skip: number;
  search: string;
  quality?: string[];
  language?: string[];
}) => {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: "20",
    search,
  });

  if (quality?.length) params.append("quality", quality.join(","));
  if (language?.length) params.append("language", language.join(","));

  const res = await apiClient.get(`/api/files?${params.toString()}`);

  return FileListSchema.parse(res.data);
};
