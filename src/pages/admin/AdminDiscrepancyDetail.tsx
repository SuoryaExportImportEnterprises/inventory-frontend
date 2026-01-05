import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resolveDiscrepancy } from "@/api/discrepancyApi";
import { getMyInwardById } from "@/api/inwardApi";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// -------------------------
// TYPE FIX
// -------------------------
interface InwardType {
  _id: string;
  item: { name: string };
  vendor: { name: string };
  type: string;
  quantityOnBill: number;
  quantityReceived: number;
  quantityDiscrepancy: number;
  quantityRejected: number;
  remarks?: string;
  discrepancyRemarks?: string;
  rejectionRemarks?: string;
  createdAt: string;
  billDate: string;
  createdBy?: { username: string };
  resolutionRemarks?: string | null;

  resolved?: boolean;
  discrepancyStatus?: "PENDING" | "RESOLVED";
}

export default function AdminDiscrepancyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<InwardType | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const [resolutionRemarks, setResolutionRemarks] = useState("");


  useEffect(() => {
    async function load() {
      try {
        const res = await getMyInwardById(id!);
        setData(res.data);
      } catch (e) {
        toast.error("Failed to load discrepancy");
      }
    }
    load();
  }, [id]);

  async function handleResolve() {
    try {
      // await resolveDiscrepancy(id!);
      await resolveDiscrepancy(id!, {
  resolutionRemarks,
});

      toast.success("Discrepancy resolved");
      navigate("/admin/discrepancies");
    } catch (e) {
      toast.error("Failed to resolve");
    }
  }

  if (!data) {
    return (
      // <Layout>
        <p className="text-muted-foreground">Loading...</p>
      // </Layout>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Discrepancy Details</h1>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Detail label="Item" value={data.item?.name} />
            <Detail label="Vendor" value={data.vendor?.name} />
            <Detail label="Type" value={data.type} />

            <Detail label="Quantity on Bill" value={data.quantityOnBill} />
            <Detail label="Received" value={data.quantityReceived} />
            <Detail label="Discrepancy" value={data.quantityDiscrepancy} />
            <Detail label="Rejected" value={data.quantityRejected} />

            {data.discrepancyRemarks && (
              <Detail label="Discrepancy Remarks" value={data.discrepancyRemarks} />
            )}

            {data.rejectionRemarks && (
              <Detail label="Rejection Remarks" value={data.rejectionRemarks} />
            )}

            <Detail
              label="Bill Date"
              value={new Date(data.billDate).toLocaleDateString("en-GB")}
            />
            <Detail
              label="Created At"
              value={new Date(data.createdAt).toLocaleString("en-GB")}
            />

            <Detail
              label="Created By"
              value={data.createdBy?.username || "Unknown"}
            />

            {data.resolutionRemarks && (
              <Detail
              label="Resolution Remarks"
              value={data.resolutionRemarks}
              />
            )}
            {data.discrepancyStatus !== "RESOLVED" && (
  <div className="space-y-2">
    <label className="text-sm text-muted-foreground">
      Resolution Remarks (optional)
    </label>

    <textarea
      className="w-full border rounded-md p-2 text-sm"
      rows={3}
      placeholder="Write how this discrepancy was resolved..."
      value={resolutionRemarks}
      onChange={(e) => setResolutionRemarks(e.target.value)}
    />
  </div>
)}
{data.discrepancyStatus !== "RESOLVED" && (
  <Button
    className="mt-4 bg-red-600 text-white"
    onClick={() => setOpenConfirm(true)}
  >
    Resolve Discrepancy
  </Button>
)}
</CardContent>
        </Card>
      </div>

      {/* Confirm Modal */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve Discrepancy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this discrepancy as resolved?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResolve}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface DetailProps {
  label: string;
  value: React.ReactNode;
}

function Detail({ label, value }: DetailProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}