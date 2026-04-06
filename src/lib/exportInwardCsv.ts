export interface InwardCsvRow {
  dateOfReceiving: string;
  dateOfCreation: string;
  itemName: string;
  vendorName: string;
  type: string;
  unit: string;
  quantityOnBill: number;
  quantityReceived: number;
  quantityRejected: number;
  quantityDiscrepancy: number;
  quantityActual: number;
  enteredBy: string;
}



export function exportInwardCsv(data: InwardCsvRow[]) {
  if (!data || data.length === 0) return;

const headers = [
  "Date of Receiving",
  "Date of Creation",
  "Item",
  "Vendor",
  "Type",
  "Unit",
  "Bill Quantity",
  "Received Quantity",
  "Rejected Quantity",
  "Item Missing",
  "Actual Quantity",
  "Entered By",
];


  
const rows = data.map((t) => [
  t.dateOfReceiving
  ? new Date(t.dateOfReceiving).toLocaleDateString("en-GB")
  : "",

t.dateOfCreation
  ? new Date(t.dateOfCreation).toLocaleDateString("en-GB")
  : "",
  t.itemName,
  t.vendorName,
  t.type,
  t.unit,
  t.quantityOnBill,
  t.quantityReceived,
  t.quantityRejected,
  t.quantityDiscrepancy,
  t.quantityActual,
  t.enteredBy,
]);



  const csvContent =
    [headers, ...rows].map((r) => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `inward-summary-${Date.now()}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
