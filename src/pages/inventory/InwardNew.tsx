import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/SearchableSelect';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TRANSACTION_TYPES, UNITS } from '@/data/mockData';
import { getActiveItems } from '@/api/itemApi';
import { getActiveVendors } from '@/api/vendorApi';
import { createInward } from '@/api/inwardApi';

import { toast } from 'sonner';
import { AlertCircle, Send, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getActiveItemsByType } from "@/api/itemApi";

/* ---------------- TYPES ---------------- */

interface OptionType {
  _id: string;
  name: string;
}
interface DropdownItem {
  _id: string;
  name: string;
}


interface InwardFormData {
  type: string;
  item: string;
  vendor: string;
  unit: string;
  color: string;
  quantityOnBill: number;
  quantityReceived: number;
  // quantityDiscrepancy: number;
  quantityRejected: number;

  billDate: string;
  isCounted: boolean;

  discrepancyRemarks: string;
  rejectionRemarks: string;
  remarks: string;
}

/* ---------------- COMPONENT ---------------- */

export default function InwardNew() {
  const navigate = useNavigate();

  /* ---------- STATE ---------- */

  const [formData, setFormData] = useState<InwardFormData>({
    type: '',
    item: '',
    vendor: '',
    unit: '',
    color: '', 
    quantityOnBill: 0,
    quantityReceived: 0,
    // quantityDiscrepancy: 0,
    quantityRejected: 0,

    billDate: '',
    isCounted: false,

    discrepancyRemarks: '',
    rejectionRemarks: '',
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedType, setSelectedType] = useState("");
  const [items, setItems] = useState<DropdownItem[]>([]);

  //const [items, setItems] = useState<OptionType[]>([]);
  const [vendors, setVendors] = useState<OptionType[]>([]);
  const [showReceivedExceedsBillModal, setShowReceivedExceedsBillModal] =
    useState(false);

useEffect(() => {
  getActiveVendors()
    .then(res => setVendors(res.data))
    .catch(() => toast.error("Failed to load vendors"));
}, []);

useEffect(() => {
  if (!formData.type) {
    setItems([]);
    setFormData(prev => ({ ...prev, item: "" })); // 🔥 clear item
    return;
  }

  getActiveItemsByType(formData.type)
    .then(res => {
      setItems(res.data);
      setFormData(prev => ({ ...prev, item: "" })); // 🔥 reset item
    })
    .catch(() => toast.error("Failed to load items"));

}, [formData.type]);


const quantityDiscrepancy = Math.max(
  0,
  formData.quantityOnBill - formData.quantityReceived
);

  /* ---------- DERIVED VALUE ---------- */
const netAvailable =
  Math.max(
    0,
    formData.quantityOnBill -
    quantityDiscrepancy -
    formData.quantityRejected
  );


  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.billDate) e.billDate = 'Bill date is required';
    if (!formData.type) e.type = 'Type is required';
    
    if (!formData.item) e.item = 'Item is required';
    if (!formData.vendor) e.vendor = 'Vendor is required';
    if (!formData.unit) e.unit = 'Unit of measure is required';
    if (formData.quantityOnBill <= 0)
      e.quantityOnBill = 'Enter valid quantity';
    if (formData.quantityReceived < 0)
      e.quantityReceived = 'Invalid quantity';
    if (formData.quantityRejected < 0)
      e.quantityRejected = 'Invalid quantity';

    if (formData.quantityRejected > formData.quantityReceived) {
      e.quantityRejected = 'Rejected cannot exceed received';
    }

    if (
      quantityDiscrepancy > 0 &&
      !formData.discrepancyRemarks
    ) {
      e.discrepancyRemarks = 'Remarks required';
    }

    if (
      formData.quantityRejected > 0 &&
      !formData.rejectionRemarks
    ) {
      e.rejectionRemarks = 'Remarks required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- SUBMIT ---------- */

  const handleSubmit = () => {
    if (!validate()) return;

    if (formData.quantityReceived > formData.quantityOnBill) {
      setShowReceivedExceedsBillModal(true);
      return;
    }

    submit();
  };

const submit = async () => {
  try {
  const payload = {
  billDate: formData.billDate,
  type: formData.type,
  item: formData.item,
  vendor: formData.vendor,
  unit: formData.unit,
  color: formData.color,

  quantityOnBill: formData.quantityOnBill,
  quantityReceived: formData.quantityReceived,
  quantityRejected: formData.quantityRejected,
  quantityDiscrepancy: quantityDiscrepancy,

  discrepancyRemarks: formData.discrepancyRemarks,
  rejectionRemarks: formData.rejectionRemarks,
  remarks: formData.remarks,

  isCounted: formData.isCounted,
};


    await createInward(payload);
    toast.success('Inward entry created successfully');
    navigate('/inventory/inward');
  } catch {
    toast.error('Failed to save inward entry');
  }
};

  /* ---------------- JSX ---------------- */

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>New Inward Transaction</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Bill Date */}
            
            <Label>Date of Receiving *</Label>
            <Input
  type="date"
  value={formData.billDate}
  max={new Date().toISOString().split('T')[0]}
  onChange={e =>
    setFormData(prev => ({
      ...prev,
      billDate: e.target.value,
    }))
  }
/>


            <div className="space-y-2">
              <Label htmlFor="isCounted">Has the material been counted? *</Label>
              <Select 
              value={formData.isCounted ? 'yes' : 'no'} 
              onValueChange={(value) =>
                setFormData(prev => ({...prev,
                  isCounted: value === 'yes'
                }))
              }
              >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="yes">Yes</SelectItem>
      <SelectItem value="no">No</SelectItem>
    </SelectContent>
  </Select>
</div>

{!formData.isCounted && (
  
  <p className="text-sm text-muted-foreground">
    Please count the items and mark <b>Has Counted = Yes</b> to enter quantities
    <br />
  </p>
)}


            {/* Type */}
            <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={formData.type}
               disabled={!formData.isCounted}
              onValueChange={v =>
                setFormData(prev => ({ ...prev, type: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>

            {/* Item */}
            <div className="space-y-2">
            <Label>Item *</Label>
            <SearchableSelect
              options={items.map(i => ({
                label: i.name,
                value: i._id,
              }))}
              value={formData.item}
              onChange={v =>
                setFormData(prev => ({ ...prev, item: v }))
              }
            />
            {!formData.type && (
              <p className="text-sm text-muted-foreground">
                Please select Type first
              </p>
            )}

            </div>

            {/* Vendor */}
            <div className="space-y-2">
            <Label>Vendor *</Label>
            <SearchableSelect



              options={vendors.map(v => ({
                label: v.name,
                value: v._id,
              }))}
              value={formData.vendor}
              
              onChange={v =>
                setFormData(prev => ({ ...prev, vendor: v }))
              }
            />
            </div>

            {/* Unit */}
            <div className="space-y-2">
  <Label>Unit Of Measure *</Label>

  <Select
    value={formData.unit}
    disabled={!formData.isCounted}
    onValueChange={v =>
      setFormData(prev => ({ ...prev, unit: v }))
    }
  >
    <SelectTrigger className={errors.unit ? 'border-destructive' : ''}>
      <SelectValue placeholder="Select unit" />
    </SelectTrigger>

    <SelectContent>
      {UNITS.map(u => (
        <SelectItem key={u} value={u}>
          {u}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {errors.unit && (
    <p className="text-sm text-destructive">{errors.unit}</p>
  )}
</div>




<div className="space-y-2">
  <Label>Color</Label>
  <Input
    type="text"
    value={formData.color}
    onChange={(e) =>
      setFormData(prev => ({
        ...prev,
        color: e.target.value,
      }))
    }
    placeholder="Enter color (optional)"
  />
</div>



            {/* Quantities */}
            <div className="space-y-2">
            <Label>Quantity on Bill *</Label>
            <Input
              type="number"
              value={formData.quantityOnBill}
               disabled={!formData.isCounted}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  quantityOnBill: Number(e.target.value),
                }))
              }
            />
            </div>

            <div className="space-y-2">
            <Label>Quantity Received *</Label>
            <Input
              type="number"
              value={formData.quantityReceived}
               disabled={!formData.isCounted}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  quantityReceived: Number(e.target.value),
                }))
              }
            />
            </div>

            <div className="space-y-2">
            <Label>Item Missing (auto)</Label>
            <Input disabled value={quantityDiscrepancy} />
            </div>

            <div className="space-y-2">
            <Label>Rejected</Label>
            <Input
              type="number"
              value={formData.quantityRejected}
               disabled={!formData.isCounted}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  quantityRejected: Number(e.target.value),
                }))
              }
            />
            </div>

            <div className="font-bold">
              Actual Quantity: {Math.max(0, netAvailable)}
            </div>

            {/* Discrepancy Remarks */}
{formData.isCounted && quantityDiscrepancy > 0 && (
  <div className="space-y-2">
    <Label>Missing Item Remarks *</Label>
    <Textarea
      value={formData.discrepancyRemarks}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          discrepancyRemarks: e.target.value,
        }))
      }
      placeholder="Explain discrepancy (missing / short items etc.)"
      className={errors.discrepancyRemarks ? 'border-destructive' : ''}
    />
    {errors.discrepancyRemarks && (
      <p className="text-sm text-destructive">
        {errors.discrepancyRemarks}
      </p>
    )}
  </div>
)}


{/* Rejection Remarks */}
{formData.isCounted && formData.quantityRejected > 0 && (
  <div className="space-y-2">
    <Label>Rejection Remarks *</Label>
    <Textarea
      value={formData.rejectionRemarks}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          rejectionRemarks: e.target.value,
        }))
      }
      placeholder="Explain rejection reason (damage / quality issue)"
      className={errors.rejectionRemarks ? 'border-destructive' : ''}
    />
    {errors.rejectionRemarks && (
      <p className="text-sm text-destructive">
        {errors.rejectionRemarks}
      </p>
    )}
  </div>
)}



{/* Additional Remarks */}
{formData.isCounted && (
  <div className="space-y-2">
    <Label>Additional Remarks</Label>
    <Textarea
      value={formData.remarks}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          remarks: e.target.value,
        }))
      }
      placeholder="Any additional notes..."
    />
  </div>
)}


            <Button onClick={handleSubmit} className="w-full h-14 font-extrabold text-lg">
              {/* <Send className="h-4 w-4 mr-2" /> */}
              SUBMIT
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={showReceivedExceedsBillModal}
        onOpenChange={setShowReceivedExceedsBillModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Received exceeds Bill
            </AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowReceivedExceedsBillModal(false);
                submit();
              }}
            >
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}