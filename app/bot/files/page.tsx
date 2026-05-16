import { BotModuleTable } from "@/components/bot/bot-module-table";

const YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => {
  const y = String(2026 - i);
  return { value: y, label: y };
});

export default function BotFilesPage() {
  return (
    <BotModuleTable
      title="Bot Files"
      description="Collection: files"
      module="files"
      searchable
      searchPlaceholder="Search file name…"
      columns={[
        { key: "file_name",  label: "Name",     sortable: true },
        { key: "file_size",  label: "Size",     sortable: true },
        { key: "quality",    label: "Quality" },
        { key: "language",   label: "Language" },
        { key: "year",       label: "Year",     sortable: true },
        { key: "created_at", label: "Added",    sortable: true },
      ]}
      filters={[
        {
          type: "select",
          param: "quality",
          label: "Quality",
          options: [
            { value: "4K",      label: "4K" },
            { value: "1080p",   label: "1080p" },
            { value: "720p",    label: "720p" },
            { value: "480p",    label: "480p" },
            { value: "HD",      label: "HD" },
            { value: "BluRay",  label: "BluRay" },
            { value: "WEBRip",  label: "WEBRip" },
            { value: "HDTV",    label: "HDTV" },
            { value: "CAM",     label: "CAM" },
          ],
        },
        {
          type: "select",
          param: "language",
          label: "Language",
          options: [
            { value: "English",   label: "English" },
            { value: "Hindi",     label: "Hindi" },
            { value: "Tamil",     label: "Tamil" },
            { value: "Telugu",    label: "Telugu" },
            { value: "Malayalam", label: "Malayalam" },
            { value: "Kannada",   label: "Kannada" },
            { value: "Bengali",   label: "Bengali" },
            { value: "Marathi",   label: "Marathi" },
            { value: "Punjabi",   label: "Punjabi" },
          ],
        },
        {
          type: "select",
          param: "year",
          label: "Year",
          options: YEARS,
        },
      ]}
    />
  );
}
