import { DownloadIcon } from "../ui/Icons";
import { downloadChartCsv, toFlatChartRows } from "../../utils/chartExport";

export default function ChartExportButton({
  title,
  data,
  fields,
  className = "",
}) {
  return (
    <button
      type="button"
      className={`chart-export-btn ${className}`.trim()}
      title={`Export ${title}`}
      onClick={(e) => {
        e.stopPropagation();
        downloadChartCsv(title, toFlatChartRows(data, fields));
      }}
      disabled={!data?.length}
    >
      <DownloadIcon size={13} />
    </button>
  );
}
