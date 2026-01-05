import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyInwards, InwardType } from "@/api/inwardApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";







interface AdminInwardRow {
  _id: string;
  item?: { name?: string };
  vendor?: { name?: string };
  type?: string;
  unit?: string;
  quantityOnBill?: number;
  quantityReceived?: number;
  quantityRejected?: number;
  quantityDiscrepancy?: number;
  quantityActual?: number;
  createdAt?: string;
  createdBy?: { username?: string };
}


export default function InwardList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [inwards, setInwards] = useState<AdminInwardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyInwards();
        setInwards(res.data);
      } catch {
        toast.error("Failed to load inward entries");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();

    return inwards.filter((t) => {
      const itemName = t.item?.name?.toLowerCase() || "";
      const vendorName = t.vendor?.name?.toLowerCase() || "";
      const id = t._id?.toLowerCase() || "";

      return (
        itemName.includes(term) ||
        vendorName.includes(term) ||
        id.includes(term)
      );
    });
  }, [search, inwards]);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Inward Transactions</h1>

        <Card>
          <CardHeader>
            <Input
              placeholder="Search by item, vendor, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </CardHeader>

          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead>ID</TableHead> */}
                    <TableHead>Item</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Bill Quantity</TableHead>
                    <TableHead>Received Quantity</TableHead>
                    <TableHead>Rejected Quantity</TableHead>
                    <TableHead>Item Missing</TableHead>
                    <TableHead>Actual Quantity</TableHead>
                    <TableHead>Entered By</TableHead>
                    <TableHead>Date of Creation</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={12}>Loading...</TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12}>No results.</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t) => (
                      <TableRow key={t._id}>
                        {/* <TableCell>{t._id}</TableCell> */}
                        <TableCell>{t.item?.name || "—"}</TableCell>
                        <TableCell>{t.vendor?.name || "—"}</TableCell>
                        <TableCell>{t.type}</TableCell>
                        <TableCell>{t.unit}</TableCell>
                        <TableCell>{t.quantityOnBill}</TableCell>
                        <TableCell>{t.quantityReceived}</TableCell>
                        <TableCell>{t.quantityRejected}</TableCell>
                        <TableCell>{t.quantityDiscrepancy}</TableCell>
                        <TableCell>{t.quantityActual}</TableCell>
                        <TableCell>
  {typeof t.createdBy === "object"
    ? t.createdBy?.username
    : "—"}
</TableCell>
                        <TableCell>
                          {new Date(t.createdAt).toLocaleDateString("en-GB")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              navigate(`/inventory/inward/${t._id}`)
                            }
                          >
                            <Eye />
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
