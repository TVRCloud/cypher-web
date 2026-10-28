import type { Model, PipelineStage } from "mongoose";

type SortSpec = Record<string, 1 | -1 | { $meta: "textScore" }>;

/**
 * Page of documents plus total count, replacing `$facet`.
 * Page query and count run in parallel. An empty filter uses the
 * collection metadata estimate instead of scanning.
 */
export async function paginate<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  match: Record<string, unknown>,
  sort: SortSpec,
  skip: number,
  limit: number,
): Promise<{ data: T[]; total: number }> {
  const pipeline: PipelineStage[] = [
    { $match: match },
    { $sort: sort as Record<string, 1 | -1> },
    { $skip: skip },
    { $limit: limit },
  ];
  const isEmpty = Object.keys(match).length === 0;
  const [data, total] = await Promise.all([
    model.aggregate<T>(pipeline),
    isEmpty ? model.estimatedDocumentCount() : model.countDocuments(match),
  ]);
  return { data, total };
}
