import { useEffect, useState, useMemo, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  getPendingDiscrepancies,
  getResolvedDiscrepancies,
} from "@/api/discrepancyApi";


interface DiscrepancyEntry {
  _id: string;
  item: { name: string };
  type: string;
  vendor: { name: string };
  quantityOnBill: number;
  quantityReceived: number;
  quantityDiscrepancy: number;
  quantityRejected: number;
  createdAt: string;

  resolved?: boolean;
}

export default function AdminDiscrepancyList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // LOAD DATA
  useEffect(() => {
  async function load() {
    try {
      const p = await getPendingDiscrepancies();
      const h = await getResolvedDiscrepancies();

      const pendingData = p.data.data.map((d: DiscrepancyEntry) => ({
        ...d,
        resolved: false,
      }));

      const resolvedData = h.data.data.map((d: DiscrepancyEntry) => ({
        ...d,
        resolved: true,
      }));

      setDiscrepancies([...pendingData, ...resolvedData]);
    } catch {
      toast.error("Failed to load discrepancies");
    } finally {
      setLoading(false);
    }
  }

  load();
}, []);


  // ---------------- FILTER FUNCTION (STABLE USING useCallback) ----------------
  const filterData = useCallback(
    (list: DiscrepancyEntry[]) => {
      if (!search) return list;

      const term = search.toLowerCase();

      return list.filter((d) => {
        return (
          d._id.toLowerCase().includes(term) ||
          d.item?.name.toLowerCase().includes(term) ||
          d.vendor?.name.toLowerCase().includes(term)
        );
      });
    },
    [search]
  );

  // FILTERED VALUES
const filtered = useMemo(() => {
  if (!search) return discrepancies;

  const term = search.toLowerCase();

  return discrepancies.filter((d) =>
    d._id.toLowerCase().includes(term) ||
    d.item?.name.toLowerCase().includes(term) ||
    d.vendor?.name.toLowerCase().includes(term)
  );
}, [search, discrepancies]);

const sortedDiscrepancies = useMemo(() => {
  return [...filtered].sort((a, b) => {
    // 1️⃣ Pending FIRST
    if (!a.resolved && b.resolved) return -1;
    if (a.resolved && !b.resolved) return 1;

    // 2️⃣ Same status → Latest date first
    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  });
}, [filtered]);



  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Notification/Issues</h1>
        <p className="text-muted-foreground">
          View notifications to review and resolve material discrepancies
        </p>

        <Card>
          <CardHeader>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by item, vendor, or ID"
              className="max-w-md"
            />
          </CardHeader>

          <CardContent>
            <DiscrepancyTable
            loading={loading}
            list={sortedDiscrepancies}
            navigate={navigate}
          />

          </CardContent>
        </Card>
      </div>
  );
}

function DiscrepancyTable({
  loading,
  list,
  navigate,
}: {
  loading: boolean;
  list: DiscrepancyEntry[];
  navigate: (path: string) => void;
}) {
  return (
    <div className="rounded-md border overflow-x-auto mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            {/* <TableHead>Txn ID</TableHead> */}
            <TableHead>Item</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Bill Quantity</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Item Missing</TableHead>
            <TableHead>Rejected</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
                Loading...
              </TableCell>
            </TableRow>
          ) : list.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-6 text-muted-foreground"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            list.map((d) => (
              <TableRow key={d._id} className={d.resolved ? "bg-green-50" : "bg-red-50"}>
                {/* <TableCell className="font-mono text-xs">{d._id}</TableCell> */}
                <TableCell>{d.item?.name}</TableCell>
                <TableCell>{d.type}</TableCell>
                <TableCell>{d.vendor?.name}</TableCell>
                <TableCell>{d.quantityOnBill}</TableCell>
                <TableCell>{d.quantityReceived}</TableCell>
                <TableCell>{d.quantityDiscrepancy}</TableCell>
                <TableCell>{d.quantityRejected}</TableCell>
                <TableCell>
                  {new Date(d.createdAt).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell>
  {d.resolved ? (
    <span className="flex items-center gap-2 text-green-600 font-semibold">
      <span className="h-2 w-2 rounded-full bg-green-600" />
      Resolved
    </span>
  ) : (
    <span className="flex items-center gap-2 text-red-600 font-semibold">
      <span className="h-2 w-2 rounded-full bg-red-600" />
      Pending
    </span>
  )}
</TableCell>


                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      navigate(`/admin/discrepancies/${d._id}`)
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
  );
}

