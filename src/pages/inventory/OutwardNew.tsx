import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TRANSACTION_TYPES, UNITS } from "@/data/mockData";
// import { getItems } from "@/api/itemApi";
import { getActiveItemsByType } from "@/api/itemApi";
import { getVendors } from "@/api/vendorApi";
import { createOutward } from "@/api/outwardApi";
import { toast } from "sonner";
import { Send, AlertTriangle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface ItemType {
  _id: string;
  name: string;
  currentStock: number;
}

interface VendorType {
  _id: string;
  name: string;
}

interface OutwardPayload {
  type: string;
  item: string;
  vendor: string;
  unit: string;
  quantity: number;
  outwardDate: string;
  remarks?: string;
}


export default function OutwardNew() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "",
    vendor: "",
    item: "",
    unit: "",
    quantity: 0,
    remarks: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStockWarning, setShowStockWarning] = useState(false);
  const [items, setItems] = useState<ItemType[]>([]);
  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [outwardDate, setOutwardDate] = useState("");


  // Fetch dropdown data
//   useEffect(() => {
//     async function loadDropdowns() {
//       try {
//         const itemRes = await getItems();
//         const vendorRes = await getVendors();

//         // Add "Buyer" manually into vendor list
//         const vendorOptions = [
//           ...vendorRes.data,
//           { _id: "buyer", name: "Buyer" },
//         ];

//         setItems(
//   itemRes.data.map((i: any) => ({
//     _id: i._id,
//     name: i.name,
//     currentStock: i.currentStock ?? 0,
//   }))
// );

//         setVendors(vendorOptions);
//       } catch (error) {
//         toast.error("Failed to load dropdown data");
//       }
//     }
//     loadDropdowns();
//   }, []);

useEffect(() => {
  if (!formData.type) {
    setItems([]);
    setFormData(prev => ({ ...prev, item: "" })); // reset item
    setCurrentStock(0);
    return;
  }

  getActiveItemsByType(formData.type)
    .then(res => {
      setItems(
        res.data.map((i: any) => ({
          _id: i._id,
          name: i.name,
          currentStock: i.currentStock ?? 0,
        }))
      );
      setFormData(prev => ({ ...prev, item: "" }));
      setCurrentStock(0);
    })
    .catch(() => toast.error("Failed to load items"));
}, [formData.type]);


  useEffect(() => {
  getVendors()
    .then(res => {
      setVendors([
        ...res.data,
        { _id: "buyer", name: "Buyer" },
      ]);
    })
    .catch(() => toast.error("Failed to load vendors"));
}, []);


  // Update stock when item changes
  useEffect(() => {
    if (formData.item) {
      const selectedItem = items.find((i) => i._id === formData.item);
      setCurrentStock(selectedItem?.currentStock || 0);
    } else {
      setCurrentStock(0);
    }
  }, [formData.item, items]);

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
if (!outwardDate) {
  newErrors.outwardDate = "Date of outward is required";
}

if (outwardDate && new Date(outwardDate) > new Date()) {
    newErrors.outwardDate = "Outward date cannot be in future";
  }
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.vendor) newErrors.vendor = "Vendor is required";
    if (!formData.item) newErrors.item = "Item is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    const quantity = formData.quantity;

    // Stock check
    if (quantity > currentStock) {
      setShowStockWarning(true);
      return;
    }

    try {
      const payload: OutwardPayload = {
  type: formData.type,
  item: formData.item,
  vendor: formData.vendor,
  unit: formData.unit,
  quantity,
  outwardDate,
  remarks: formData.remarks,
};
await createOutward(payload);

      toast.success("Outward entry recorded successfully!");
      navigate("/inventory/outward");
    } catch (error) {
      toast.error("Failed to record outward entry");
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">New Outward Transaction</h1>
              <p className="text-muted-foreground">Record material dispatch or sale</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/inventory/outward")}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date of Outward *</Label>
                <Input
                type="date"
                value={outwardDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setOutwardDate(e.target.value)}
                />
                {errors.outwardDate && (
                  <p className="text-sm text-destructive">{errors.outwardDate}</p>
                )}

              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>

              {/* Vendor (includes Buyer option) */}
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor / Buyer *</Label>
                <SearchableSelect
                  options={vendors.map((v) => ({ label: v.name, value: v._id }))}
                  value={formData.vendor}
                  onChange={(value) => setFormData((prev) => ({ ...prev, vendor: value }))}
                  placeholder="Select vendor or Buyer"
                  className={errors.vendor ? "border-destructive" : ""}
                />
                {errors.vendor && <p className="text-sm text-destructive">{errors.vendor}</p>}
              </div>

              {/* Item */}
              <div className="space-y-2">
                <Label htmlFor="item">Item *</Label>
                {/* <SearchableSelect
                  options={items.map((i) => ({ label: i.name, value: i._id }))}
                  value={formData.item}
                  onChange={(value) => setFormData((prev) => ({ ...prev, item: value }))}
                  placeholder="Select item"
                  className={errors.item ? "border-destructive" : ""}
                /> */}
{!formData.type ? (
  <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
    Select type first to choose item
  </div>
) : (
  <SearchableSelect
    options={items.map((i) => ({
      label: i.name,
      value: i._id,
    }))}
    value={formData.item}
    onChange={(value) =>
      setFormData((prev) => ({ ...prev, item: value }))
    }
    placeholder="Select item"
    className={errors.item ? "border-destructive" : ""}
  />
)}


                {errors.item && <p className="text-sm text-destructive">{errors.item}</p>}

                {formData.item && (
                  <p className="text-sm text-muted-foreground">
                    Current Stock:{" "}
                    <span className="font-bold text-primary">{currentStock}</span>
                  </p>
                )}
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <Label htmlFor="unit">Unit Of Measure*</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({...prev, quantity: Number(e.target.value),}))}
                  className={errors.quantity ? "border-destructive" : ""}
                />
                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}

                {formData.quantity && formData.quantity > currentStock && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Requested quantity exceeds current stock ({currentStock})
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                className="flex-1 h-14 font-extrabold text-lg"
                disabled={formData.quantity && formData.quantity > currentStock}
              >
                {/* <Send className="h-4 w-4 mr-2" /> */}
                SUBMIT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Warning Modal */}
      <AlertDialog open={showStockWarning} onOpenChange={setShowStockWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Requested quantity ({formData.quantity}) exceeds current stock ({currentStock}).
              Please reduce the quantity or request admin override.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowStockWarning(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
