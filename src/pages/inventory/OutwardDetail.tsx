import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { getMyOutwardById, getAdminOutwardById } from "@/api/outwardApi";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OutwardType } from "@/api/outwardApi";
import { adminUpdateOutward } from "@/api/outwardApi";


export default function OutwardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState<OutwardType | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editRemarks, setEditRemarks] = useState("");


  useEffect(() => {
    async function load() {
      try {
        let res;

        if (user?.role === "admin")
          res = await getAdminOutwardById(id!);
        else
          res = await getMyOutwardById(id!);

        setData(res.data);
        setEditQuantity(res.data.quantity);
        setEditRemarks(res.data.remarks || "");

      } catch {
        toast.error("Failed to load outward entry");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading)
    return (
        <div className="p-8 text-center">Loading...</div>
    );

  if (!data)
    return (
        <div className="p-8 text-center">Outward entry not found</div>
    );

  return (
     <>
<div className="flex items-center justify-between mb-6">
  {/* LEFT SIDE */}
  <div className="flex items-center gap-3">
    <Button variant="ghost" onClick={() => navigate(-1)}>
      <ArrowLeft className="mr-2 h-4 w-4" /> Back
    </Button>

    <h1 className="text-3xl font-bold">Outward Transaction</h1>
  </div>

  {/* RIGHT SIDE — ADMIN EDIT BUTTON */}
  {user?.role === "admin" && (
    <Button
      onClick={() => setIsEditing(!isEditing)}
      className="bg-orange-500 hover:bg-orange-600 text-white"
    >
      {isEditing ? "Cancel Edit" : "Edit"}
    </Button>
  )}
</div>




      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
  <p className="font-medium">Date of Outward</p>
  <p>
    {data.outwardDate
      ? new Date(data.outwardDate).toLocaleDateString("en-GB")
      : "—"}
  </p>
</div>

          <div>
            <p className="font-medium">Item</p>
            <p>{data.item?.name || "—"}</p>
          </div>

          <div>
            <p className="font-medium">Type</p>
            <p>{data.type || "—"}</p>
          </div>


          <div>
  <p className="font-medium">Vendor</p>
  <p>
    {typeof data.vendor === "object"
      ? data.vendor.name
      : data.vendor || "—"}
  </p>
</div>


          <div>
            <p className="font-medium">Quantity</p>
            {isEditing ? (
  <Input
    type="number"
    value={editQuantity}
    onChange={(e) => setEditQuantity(Number(e.target.value))}
  />
) : (
  <p>{data.quantity}</p>
)}

          </div>
          {isEditing && (
  <p className="text-sm text-muted-foreground">
    Available Stock:{" "}
    <span className="font-semibold">
      {data.item?.currentStock ?? "—"}
    </span>
  </p>
)}


          <div>
            <p className="font-medium">Unit Of Measure</p>
            <p>{data.unit || "—"}</p>
          </div>

          {/* <div>
            <p className="font-medium">Cost per Unit</p>
            <p>
  {data.costPerUnitAtTime && data.costPerUnitAtTime > 0
    ? `₹${data.costPerUnitAtTime.toFixed(2)}`
    : <span className="text-muted-foreground italic">Cost not recorded</span>}
</p>

          </div> */}

          {/* <div>
            <p className="font-medium">Total Cost</p>
            <p>
  {data.totalCost && data.totalCost > 0
    ? `₹${data.totalCost.toFixed(2)}`
    : "—"}
</p>

          </div> */}

          <div>
            <p className="font-medium">Entered By</p>
            <p>
              {data.createdBy?.username ?? "—"}
            </p>
          </div>


          <div>
            <p className="font-medium">Date</p>
            <p>{data.createdAt ? new Date(data.createdAt).toLocaleString("en-GB") : "—"}</p>
          </div>

<div className="md:col-span-2">
  <p className="font-medium">Remarks</p>

  {isEditing ? (
    <Textarea
      value={editRemarks}
      onChange={(e) => setEditRemarks(e.target.value)}
      placeholder="Add remarks..."
    />
  ) : (
    <p>{data.remarks || "—"}</p>
  )}
</div>


        </CardContent>
      </Card>
      {isEditing && user?.role === "admin" && (
  <div className="flex justify-end mt-4 gap-3">
    <Button
      variant="outline"
      onClick={() => {
        // reset changes
        setEditQuantity(data.quantity);
        setEditRemarks(data.remarks || "");
        setIsEditing(false);
      }}
    >
      Cancel
    </Button>

    <Button
      onClick={async () => {
        try {
          const res = await adminUpdateOutward(data._id, {
            quantity: editQuantity,
            remarks: editRemarks,
          });

          setData(res.data); // 🔥 IMPORTANT
          setIsEditing(false);

          toast.success("Outward updated successfully");
        } catch (err) {
          toast.error("Failed to update outward");
        }
      }}
    >
      Save Changes
    </Button>
  </div>
)}

      </>
  );
}
