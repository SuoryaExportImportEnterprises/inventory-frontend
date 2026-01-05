import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAdminOutwards, OutwardType } from "@/api/outwardApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportOutwardCsv } from "@/utils/exportOutwardCsv";
import { Button } from "@/components/ui/button";

interface AdminOutwardType {
  _id: string;
  item?: { name?: string };
  vendor?: { name?: string };
  type?: string;
  unit?: string;
  quantity?: number;
  createdAt?: string;

  createdBy?: {
    name?: string;
    role?: string;
  };
}



export default function AdminOutward() {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [outwards, setOutwards] = useState<OutwardType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminOutwards();
        setOutwards(res.data);
      } catch {
        toast.error("Failed to load outward entries");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

const filtered = useMemo(() => {
  const term = search.toLowerCase();

  return outwards.filter((t) => {
    // 🔍 SEARCH FILTER
    const vendor =
      typeof t.vendor === "string" ? t.vendor : t.vendor?.name || "";

    const matchesSearch =
      t._id.toLowerCase().includes(term) ||
      t.item?.name?.toLowerCase().includes(term) ||
      vendor.toLowerCase().includes(term);

    // 📅 DATE FILTER
const created = new Date(t.createdAt).getTime();

const fromOk = fromDate
  ? created >= new Date(fromDate).setHours(0, 0, 0, 0)
  : true;

const toOk = toDate
  ? created <= new Date(toDate).setHours(23, 59, 59, 999)
  : true;


    return matchesSearch && fromOk && toOk;
  });
}, [search, fromDate, toDate, outwards]);


  return (
    // <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
  <h1 className="text-3xl font-bold">Admin – Outward Summary</h1>

  <Button
    variant="outline"
    onClick={() => exportOutwardCsv(filtered)}
  >
    Export CSV
  </Button>
</div>


        <Card>
          <CardHeader>
  <div className="flex flex-wrap gap-4 items-center">

    {/* SEARCH */}
    <Input
      placeholder="Search outward..."
      className="max-w-md"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    {/* FROM DATE */}
    <div className="flex items-center gap-2">
      <label className="text-sm">From</label>
      <Input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
    </div>

    {/* TO DATE */}
    <div className="flex items-center gap-2">
      <label className="text-sm">To</label>
      <Input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />
    </div>

    {/* CLEAR */}
    {(fromDate || toDate) && (
      <button
        className="text-sm text-primary underline"
        onClick={() => {
          setFromDate("");
          setToDate("");
        }}
      >
        Clear Dates
      </button>
    )}
  </div>
</CardHeader>


          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead>ID</TableHead> */}
                    <TableHead>Date of Outward</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Unit Of Measure</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Entered By</TableHead>
                    {/* <TableHead>Total Cost</TableHead> */}
                    <TableHead>Date of Creation</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

<TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={9}>Loading...</TableCell>
    </TableRow>
  ) : filtered.length === 0 ? (
    <TableRow>
      <TableCell colSpan={9}>No entries.</TableCell>
    </TableRow>
  ) : (
    filtered.map((t) => (
      <TableRow key={t._id}>

        {/* ID */}
        {/* <TableCell>{t._id}</TableCell> */}
        <TableCell>
          {t.outwardDate
              ? new Date(t.outwardDate).toLocaleDateString("en-GB")
              : "—"}
        </TableCell>

        {/* Type */}
        <TableCell>{t.type || "—"}</TableCell>

        {/* Item */}
        <TableCell>{t.item?.name || "—"}</TableCell>

        {/* Vendor */}
        <TableCell>
          {typeof t.vendor === "string" ? t.vendor : t.vendor?.name || "—"}
        </TableCell>

        {/* Unit */}
        <TableCell>{t.unit || "—"}</TableCell>

        {/* Qty */}
        <TableCell>{t.quantity}</TableCell>

        <TableCell>
  {t.createdBy?.username || "—"}
</TableCell>


        {/* Total Cost */}
        {/* <TableCell>₹{(t.quantity * t.costPerUnit).toFixed(2)}</TableCell> */}

        {/* <TableCell className="font-bold">
  {t.totalCost > 0 ? (
    `₹${t.totalCost.toFixed(2)}`
  ) : (
    <span className="text-muted-foreground italic">
      Cost not recorded
    </span>
  )}
</TableCell> */}



        {/* Date */}
        <TableCell>
          {new Date(t.createdAt).toLocaleDateString("en-GB")}
        </TableCell>

        {/* Action */}
        <TableCell>
          <div className="flex gap-3">
            {/* View */}
            <button
            onClick={() => navigate(`/admin/outward/${t._id}`)}
            title="View"
            >
              <Eye />
            </button>
            {/* Edit — ADMIN ONLY */}
            <button
            onClick={() => navigate(`/admin/outward/${t._id}`)}
            title="Edit"
            className="text-primary font-semibold"
            >
              Edit
              </button>
            </div>

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
