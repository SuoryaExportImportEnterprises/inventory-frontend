import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { getMyInwardById, getAdminInwardById } from "@/api/inwardApi";
import { useAuth } from "@/contexts/AuthContext";
import { updateAdminInward } from "@/api/inwardApi";



interface UserRef {
  _id?: string;
  username?: string;
  role?: string;
}

interface SimpleRef {
  _id?: string;
  name?: string;
}

interface DetailProps {
  label: string;
  value?: string | number | null;
  className?: string;
}

export interface InwardDetailType {
  _id: string;
  billDate?: string | Date;
  isCounted?: boolean;
  type?: string;
  item?: SimpleRef | null;
  vendor?: SimpleRef | null;
  unit?: string;
  color?: string;
  quantityOnBill?: number;
  quantityReceived?: number;
  quantityDiscrepancy?: number;
  quantityRejected?: number;
  quantityActual?: number;
  remarks?: string | null;

  // These only work if added in backend
  discrepancyRemarks?: string | null;
  rejectionRemarks?: string | null;

  totalValue?: number;
  createdBy?: UserRef | null;
  createdAt?: string;
  resolved?: boolean;
  resolvedBy?: UserRef | null;
  resolvedDate?: string | null;
}

export default function InwardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inward, setInward] = useState<InwardDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";

const [isEditMode, setIsEditMode] = useState(false);

const [formData, setFormData] = useState({
  quantityReceived: 0,
  quantityRejected: 0,
  discrepancyRemarks: "",
  rejectionRemarks: "",
  remarks: "",
});

  useEffect(() => {
  async function load() {
    try {
      let res;

      if (user?.role === "admin") {
        res = await getAdminInwardById(id!);
      } else {
        res = await getMyInwardById(id!);
      }

      setInward(res.data);

      setFormData({
  quantityReceived: res.data.quantityReceived ?? 0,
  quantityRejected: res.data.quantityRejected ?? 0,
  discrepancyRemarks: res.data.discrepancyRemarks ?? "",
  rejectionRemarks: res.data.rejectionRemarks ?? "",
  remarks: res.data.remarks ?? "",
});

    } catch {
      toast.error("Failed to load inward entry");
    } finally {
      setLoading(false);
    }
  }

  load();
}, [id, user]);

const handleSave = async () => {
  if (!inward) return;

  try {
    await updateAdminInward(inward._id, {
      quantityReceived: formData.quantityReceived,
      quantityRejected: formData.quantityRejected,
      discrepancyRemarks: formData.discrepancyRemarks,
      rejectionRemarks: formData.rejectionRemarks,
      remarks: formData.remarks,
    });

    toast.success("Inward entry updated successfully");
    setIsEditMode(false);

    // reload updated data
    const res = await getAdminInwardById(inward._id);
    setInward(res.data);
  } catch (err) {
    toast.error("Failed to update inward entry");
  }
};



  const formatDate = (d?: string | Date | null) => {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt.getTime())) return "—";
    return dt.toLocaleString("en-GB");
  };

const formatShortDate = (d?: string | Date | null) => {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-GB"); // ⭐ FIX
};


  return (
    // <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Inward Transaction</h1>
              <p className="text-muted-foreground">Full details for this inward entry</p>
            </div>
          </div>
          {isAdmin && !isEditMode && (
    <Button onClick={() => setIsEditMode(true)}>
      Edit
    </Button>
  )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : !inward ? (
              <div className="py-8 text-center text-destructive">Inward entry not found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-4">
                  <Detail label="Date of Receiving" value={formatShortDate(inward.billDate)} />
                  <Detail label="Type" value={inward.type} />
                  <Detail label="Item" value={inward.item?.name} />
                  <Detail label="Vendor" value={inward.vendor?.name} />
                  <Detail label="Unit" value={inward.unit} />
                  <Detail label="Color" value={inward.color || "—"} className="capitalize"/>
                  <div className="grid grid-cols-3 gap-3">
                    <Detail label="Quantity (Bill)" value={inward.quantityOnBill} />
                    {/* <Detail label="Qty (Received)" value={inward.quantityReceived} /> */}
                    {isEditMode ? (
  <div>
    <Label>Quantity (Received)</Label>
    <input
      type="number"
      className="w-full border rounded px-2 py-1"
      value={formData.quantityReceived}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          quantityReceived: Number(e.target.value),
        }))
      }
    />
  </div>
) : (
  <Detail label="Quantity (Received)" value={inward.quantityReceived} />
)}

                    {/* <Detail label="Qty (Rejected)" value={inward.quantityRejected} /> */}
                    {isEditMode ? (
  <div>
    <Label>Quantity (Rejected)</Label>
    <input
      type="number"
      className="w-full border rounded px-2 py-1"
      value={formData.quantityRejected}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          quantityRejected: Number(e.target.value),
        }))
      }
    />
  </div>
) : (
  <Detail label="Quantity (Rejected)" value={inward.quantityRejected} />
)}

                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Detail
                      label="Item Missing"
                      value={inward.quantityDiscrepancy}
                      className={(inward.quantityDiscrepancy ?? 0) > 0 ? "text-destructive" : ""}
                    />
                    <Detail label="Actual Quantity" value={inward.quantityActual} />
                  </div>

                  {/* <Detail label="Total Value" value={`₹${(inward.totalValue ?? 0).toFixed(2)}`} /> */}
                </div>

                <div className="space-y-4">
                  <Detail label="Created By" value={inward.createdBy?.username} />
                  <Detail label="Role" value={inward.createdBy?.role} />
                  <Detail label="Created At" value={formatDate(inward.createdAt)} />

                  <Detail label="Resolved" value={inward.resolved ? "Yes" : "No"} />

                  {/* <Detail label="Discrepancy Remarks" value={inward.discrepancyRemarks} /> */}
                  {isEditMode ? (
  <div>
    <Label>Discrepancy Remarks</Label>
    <textarea
      className="w-full border rounded p-2"
      value={formData.discrepancyRemarks}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          discrepancyRemarks: e.target.value,
        }))
      }
    />
  </div>
) : (
  <Detail label="Missing Item Remarks" value={inward.discrepancyRemarks} />
)}

                  {/* <Detail label="Rejection Remarks" value={inward.rejectionRemarks} /> */}
                  {isEditMode ? (
  <div>
    <Label>Rejection Remarks</Label>
    <textarea
      className="w-full border rounded p-2"
      value={formData.rejectionRemarks}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          rejectionRemarks: e.target.value,
        }))
      }
    />
  </div>
) : (
  <Detail label="Rejection Remarks" value={inward.rejectionRemarks} />
)}


                  {/* <Detail label="Additional Remarks" value={inward.remarks} /> */}
                  {isEditMode ? (
  <div>
    <Label>Additional Remarks</Label>
    <textarea
      className="w-full border rounded p-2"
      value={formData.remarks}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          remarks: e.target.value,
        }))
      }
    />
  </div>
) : (
  <Detail label="Additional Remarks" value={inward.remarks} />
)}

                </div>

              </div>
            )}
          </CardContent>

          {isAdmin && isEditMode && (
  <div className="flex gap-3 mt-6">
    <Button onClick={handleSave}>
      Save Changes
    </Button>

    <Button
      variant="outline"
      onClick={() => {
        setIsEditMode(false);
        setFormData({
          quantityReceived: inward.quantityReceived ?? 0,
          quantityRejected: inward.quantityRejected ?? 0,
          discrepancyRemarks: inward.discrepancyRemarks ?? "",
          rejectionRemarks: inward.rejectionRemarks ?? "",
          remarks: inward.remarks ?? "",
        });
      }}
    >
      Cancel
    </Button>
  </div>
)}

        </Card>
      </div>
    // </Layout>
  );
}

function Detail({ label, value, className = "" }: DetailProps) {
  return (
    <div>
      <Label>{label}</Label>
      <div className={`text-lg font-medium ${className}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}
