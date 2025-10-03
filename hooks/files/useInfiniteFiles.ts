import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchFiles } from "@/lib/api/files";

interface FileFilters {
  quality?: string[];
  language?: string[];
}

export const useInfiniteFiles = (search: string, filters?: FileFilters) => {
  console.log("useInfiniteFiles", search, filters);

  return useInfiniteQuery({
    queryKey: ["files", search, filters],
    queryFn: ({ pageParam = 0 }) =>
      fetchFiles({
        skip: pageParam,
        search,
        quality: filters?.quality,
        language: filters?.language,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < 20 ? undefined : allPages.length * 20,
  });
};
