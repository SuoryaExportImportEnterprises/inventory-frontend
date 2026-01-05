import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowUpDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAdminInwards, InwardType } from "@/api/inwardApi";

import { exportInwardCsv } from "@/lib/exportInwardCsv";


interface RefWithName {
  _id?: string;
  name?: string;
}

interface AdminInwardType {
  _id: string;

  item?: {
    name?: string;
    costPerUnit?: number;
  };

  vendor?: {
    name?: string;
  };

  type?: string;
  unit?: string;

  quantityOnBill?: number;
  quantityReceived?: number;
  quantityRejected?: number;
  quantityDiscrepancy?: number;
  quantityActual?: number;

  createdAt?: string;

  createdBy?: {
    username?: string;
    role?: string;
  };
}



export default function AdminInward() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [inwards, setInwards] = useState<AdminInwardType[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminInwards();
        setInwards(res.data);
      } catch (err) {
        toast.error("Failed to load inward summary");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

const filtered = useMemo(() => {
  const term = search.toLowerCase();

  return inwards.filter((t) => {
    const itemName =
      typeof t.item === "object" && t.item?.name
        ? t.item.name.toLowerCase()
        : "";

    const vendorName =
      typeof t.vendor === "object" && t.vendor?.name
        ? t.vendor.name.toLowerCase()
        : "";

    const matchesSearch =
      itemName.includes(term) || vendorName.includes(term);

    // 📅 DATE FILTER (same as outward)
    const created = t.createdAt
      ? new Date(t.createdAt).getTime()
      : 0;

const fromOk = fromDate
  ? created >= new Date(fromDate).setHours(0, 0, 0, 0)
  : true;

const toOk = toDate
  ? created <= new Date(toDate).setHours(23, 59, 59, 999)
  : true;


    return matchesSearch && fromOk && toOk;
  });
}, [search, fromDate, toDate, inwards]);


const sorted = useMemo(() => {
  const data = [...filtered];
  if (!sortColumn) return data;

  return data.sort((a, b) => {
    // 🟢 Get safe typed values instead of any
    const aVal = a[sortColumn as keyof InwardType];
    const bVal = b[sortColumn as keyof InwardType];

    let A = aVal;
    let B = bVal;

    // 🕒 Sort dates
    if (sortColumn === "createdAt") {
      A = new Date(a.createdAt || "").getTime();
      B = new Date(b.createdAt || "").getTime();
    }

    // 🔡 Sort strings case-insensitively
    if (typeof A === "string") A = A.toLowerCase();
    if (typeof B === "string") B = B.toLowerCase();

    // 🔼🔽 Sorting direction
    if (sortDirection === "asc") return A > B ? 1 : -1;
    return A < B ? 1 : -1;
  });
}, [filtered, sortColumn, sortDirection]);


  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

const inwardCsvData = sorted.map((t) => {
  const costPerUnit =
    typeof t.item === "object" &&
    t.item !== null &&
    "costPerUnit" in t.item &&
    typeof t.item.costPerUnit === "number"
      ? t.item.costPerUnit
      : 0;

  const quantityActual = t.quantityActual ?? 0;

  return {
    // txnId: t._id,
    itemName: typeof t.item === "object" ? t.item?.name ?? "" : "",
    vendorName: typeof t.vendor === "object" ? t.vendor?.name ?? "" : "",
    type: t.type ?? "",
    unit: t.unit ?? "",
    quantityOnBill: t.quantityOnBill ?? 0,
    quantityReceived: t.quantityReceived ?? 0,
    quantityRejected: t.quantityRejected ?? 0,
    quantityDiscrepancy: t.quantityDiscrepancy ?? 0,
    quantityActual,
    enteredBy: t.createdBy?.username ?? "",
    // costPerUnit,
    // totalCost: costPerUnit * quantityActual,
    date: t.createdAt ?? "",
  };
});


  return (
    // <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            

            <div>
              <h1 className="text-3xl font-bold">Admin – Inward Summary</h1>
            </div>
          </div>
          {user?.role === "admin" && (
  <Button
    variant="outline"
    onClick={() => exportInwardCsv(inwardCsvData)}

  >
    Export CSV
  </Button>
)}

        </div>

        {/* Search */}
        <Card>
<CardHeader>
  <div className="flex items-center gap-4 w-full">

    {/* SEARCH */}
    <Input
      placeholder="Search outward..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-1"
    />

    {/* FROM */}
    <div className="flex items-center gap-2">
      <span className="text-sm">From</span>
      <Input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-[160px]"
      />
    </div>

    {/* TO */}
    <div className="flex items-center gap-2">
      <span className="text-sm">To</span>
      <Input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="w-[160px]"
      />
    </div>

     {(fromDate || toDate) && (
      <button
        className="text-sm text-primary underline whitespace-nowrap"
        onClick={() => {
          setFromDate("");
          setToDate("");
        }}
      >
        Clear
      </button>
    )}

  </div>
</CardHeader>



          

          {/* TABLE */}
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead className="cursor-pointer" onClick={() => handleSort("_id")}>
                      Txn ID <ArrowUpDown className="inline-block h-3 w-3 ml-1" />
                    </TableHead> */}

                    <TableHead className="cursor-pointer" onClick={() => handleSort("item")}>
                      Item <ArrowUpDown className="inline-block h-3 w-3 ml-1" />
                    </TableHead>

                    <TableHead className="cursor-pointer" onClick={() => handleSort("vendor")}>
                      Vendor <ArrowUpDown className="inline-block h-3 w-3 ml-1" />
                    </TableHead>

                    <TableHead>Type/Category</TableHead>

                    <TableHead>Unit</TableHead>
                    

                    <TableHead className="cursor-pointer" onClick={() => handleSort("quantityOnBill")}>
                      Bill Quantity <ArrowUpDown className="inline-block h-3 w-3 ml-1" />
                    </TableHead>

                    <TableHead>Received Quantity</TableHead>
                    <TableHead>Rejected Quantity</TableHead>
                    <TableHead>Item Missing</TableHead>
                    <TableHead>Actual Quantity</TableHead>
                    {/* <TableHead>Cost (₹)</TableHead> */}
                    <TableHead>Entered By</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                      Date of Creation <ArrowUpDown className="inline-block h-3 w-3 ml-1" />
                    </TableHead>

                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={12} className="py-6 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : sorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="py-6 text-center">
                        No inward transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sorted.map((t) => (
                      <TableRow key={t._id}>
                        {/* <TableCell className="font-mono text-xs">{t._id}</TableCell> */}

                        <TableCell className="font-medium">
  {typeof t.item === "object" ? t.item?.name : "—"}
</TableCell>

<TableCell>
  {typeof t.vendor === "object" ? t.vendor?.name : "—"}
</TableCell>

                        <TableCell>{t.type || "—"}</TableCell>
                        <TableCell>{t.unit || "—"}</TableCell>
                        <TableCell>{t.quantityOnBill ?? 0}</TableCell>
                        <TableCell>{t.quantityReceived ?? 0}</TableCell>
                        <TableCell>{t.quantityRejected ?? 0}</TableCell>

                        <TableCell className={t.quantityDiscrepancy ? "text-destructive" : ""}>
                          {t.quantityDiscrepancy ?? 0}
                        </TableCell>

                        <TableCell className="font-bold">
                          {t.quantityActual ?? 0}

                        </TableCell>

                          <TableCell>
    {t.createdBy?.username || "—"}
  </TableCell>

{/* <TableCell className="font-bold">
  {t.quantityActual &&
  typeof t.item === "object" &&
  "costPerUnit" in t.item ? (
    `₹${(
      Number(
  (t.item as { costPerUnit: number }).costPerUnit
) * t.quantityActual

    ).toFixed(2)}`
  ) : (
    <span className="text-muted-foreground italic">
      Cost not set
    </span>
  )}
</TableCell> */}

                        <TableCell>
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString("en-GB")
                            : "—"}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/inward/${t._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {user?.role === "admin" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/inward/${t._id}`)}
        >
          Edit
        </Button>
      )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    // </Layout>
  );
}
