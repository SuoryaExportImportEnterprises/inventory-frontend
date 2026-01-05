import { OutwardType } from "@/api/outwardApi";

export function exportOutwardCsv(outwards: OutwardType[]) {
  const headers = [
    // "Outward ID",
    "Date",
    "Type",
    "Item",
    "Vendor",
    "Quantity",
    "Unit",
    // "Cost Per Unit (Snapshot)",
    // "Total Cost",
    "Entered By",
    "Remarks",
  ];

  const rows = outwards.map(o => [
    // o._id,
    new Date(o.createdAt).toLocaleDateString(),
    o.type,
    o.item?.name ?? "",
    typeof o.vendor === "string" ? o.vendor : o.vendor?.name ?? "",
    o.quantity,
    o.unit,
    // o.costPerUnitAtTime,
    // o.totalCost,
    o.createdBy?.username ?? "",
    o.remarks ?? "",
  ]);

  const csv =
    [headers, ...rows]
      .map(r => r.map(v => `"${v}"`).join(","))
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `outward-transactions-${Date.now()}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
