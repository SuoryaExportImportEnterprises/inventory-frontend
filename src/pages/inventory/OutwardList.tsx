import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyOutwards, OutwardType } from "@/api/outwardApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import { useAuth } from "@/contexts/AuthContext";



export default function OutwardList() {
  const [search, setSearch] = useState("");
  const [outwards, setOutwards] = useState<OutwardType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { user } = useAuth();


  useEffect(() => {
    async function load() {
      try {
        const res = await getMyOutwards();
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
      const vendor =
        typeof t.vendor === "string" ? t.vendor : t.vendor?.name || "";
      return (
        t._id.toLowerCase().includes(term) ||
        t.item.name.toLowerCase().includes(term) ||
        vendor.toLowerCase().includes(term)
      );
    });
  }, [search, outwards]);

  const exportCSV = () => {
  const rows = filtered.map(o => ({
    ID: o._id,
    Item: o.item?.name ?? "",
    Vendor: typeof o.vendor === "string" ? o.vendor : o.vendor?.name ?? "",
    Quantity: o.quantity,
    Unit: o.unit,
    Remarks: o.remarks ?? "",
    CreatedAt: new Date(o.createdAt).toLocaleString("en-GB"),
  }));

  const csv = Papa.unparse(rows);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `outward_transactions_${Date.now()}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};


  return (
    <Layout>
      <div className="space-y-6">

        {/* 🔹 PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Outward Transactions</h1>
          <p className="text-muted-foreground">
            List of all material issued from inventory
          </p>
        </div>

        {/* 🔹 SEARCH + TABLE CARD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg">
              Outward Records
            </CardTitle>

            <Input
              placeholder="Search by item, vendor or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

             {user?.role === "admin" && (
              <Button variant="outline" onClick={exportCSV}>
                Export CSV
              </Button>
            )}

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
                    <TableHead>Unit of Measure</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Entered By</TableHead>
                    <TableHead>Date of Creation</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No outward transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell>
                          {t.outwardDate
                          ? new Date(t.outwardDate).toLocaleDateString("en-GB")
                          : "—"}
                        </TableCell>

                        <TableCell>{t.type || "—"}</TableCell>

                        {/* <TableCell className="font-mono text-xs">
                          {t._id}
                        </TableCell> */}
                        <TableCell>{t.item.name}</TableCell>
                        <TableCell>
                          {typeof t.vendor === "string"
                            ? t.vendor
                            : t.vendor?.name}
                        </TableCell>
                        <TableCell>{t.unit || "—"}</TableCell>
                        <TableCell>{t.quantity}</TableCell>
                                <TableCell>
  {t.createdBy?.username || "—"}
</TableCell>
                        <TableCell>
                          {new Date(t.createdAt).toLocaleDateString("en-GB")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate(`/inventory/outward/${t._id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
    </Layout>
  );
}
