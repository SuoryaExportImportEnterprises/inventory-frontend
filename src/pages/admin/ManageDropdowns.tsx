import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableRow, TableCell, TableHead, TableHeader } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getItems, addItem, softDeleteItem, restoreItem, updateItem } from "@/api/itemApi";
import { getVendors, addVendor, softDeleteVendor, restoreVendor , updateVendor} from "@/api/vendorApi";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";




interface DropdownItem {
  _id: string;
  name: string;
  type?: string;
  isActive: boolean;
}

interface DropdownVendor {
  _id: string;
  name: string;
  isActive: boolean;
}

export default function ManageDropdowns() {

  const [items, setItems] = useState<DropdownItem[]>([]);
  const [vendors, setVendors] = useState<DropdownVendor[]>([]);

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addVendorOpen, setAddVendorOpen] = useState(false);

  const [newItem, setNewItem] = useState("");
  const [newItemType, setNewItemType] = useState("");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  
  const [newVendor, setNewVendor] = useState("");


  // Load initial data
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const itemRes = await getItems();
      const vendorRes = await getVendors();
      setItems(itemRes.data);
      setVendors(vendorRes.data);
    } catch (error) {
      toast.error("Failed to load dropdown data");
    }
  };

const handleSaveItem = async () => {
  if (!newItemType) {
    return toast.error("Item type is required");
  }

  if (!newItem.trim()) {
    return toast.error("Item name required");
  }

  try {
    if (editingItemId) {
      // EDIT MODE
      await updateItem(editingItemId, {
        name: newItem,
        type: newItemType,
      });
      toast.success("Item updated");
    } else {
      // ADD MODE
      await addItem({
        name: newItem,
        type: newItemType,
      });
      toast.success("Item added");
    }

    setAddItemOpen(false);
    setNewItem("");
    setNewItemType("");
    setEditingItemId(null);
    loadAll();
  } catch {
    toast.error("Failed to save item");
  }
};


const handleSubmitVendor = async () => {
  if (!newVendor.trim()) return toast.error("Vendor name required");

  try {
    if (editingVendorId) {
      // ✅ EDIT
      await updateVendor(editingVendorId, { name: newVendor });
      toast.success("Vendor updated");
    } else {
      // ✅ ADD
      await addVendor({ name: newVendor });
      toast.success("Vendor added");
    }

    setAddVendorOpen(false);
    setNewVendor("");
    setEditingVendorId(null);
    loadAll();
  } catch {
    toast.error("Failed to save vendor");
  }
};


  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Dropdowns</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="items">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          {/* ITEMS TAB */}
          <TabsContent value="items">
            <div className="flex justify-end mb-3">
              <button onClick={() => setAddItemOpen(true)} className="text-primary font-medium">
                + Add Item
              </button>
            </div>

            <Table>
<TableHeader>
  <TableRow>
    <TableHead className="w-[40%]">Item Name</TableHead>
    <TableHead className="w-[25%]">Type</TableHead>
    <TableHead className="w-[15%]">Edit</TableHead>
    <TableHead className="w-[15%]">Status</TableHead>
    <TableHead className="w-[20%] text-right">Action</TableHead>
  </TableRow>
</TableHeader>


              <TableBody>
                {items.map((i) => (
                  <TableRow key={i._id}>
                    <TableCell>{i.name}</TableCell>
                    <TableCell>{i.type || "-"}</TableCell>
                    <TableCell className="space-x-2">
{i.isActive && (
  <button
    onClick={() => {
      setEditingItemId(i._id);
      setNewItem(i.name);
      setNewItemType(i.type || "");
      setAddItemOpen(true);
    }}
    className="text-orange-500 hover:text-orange-600"
    title="Edit Item"
  >
    <Pencil size={18} />
  </button>
)}

</TableCell>

                    <TableCell>{i.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell>
                      {i.isActive ? (
                        <button
                          className="text-red-500"
                          onClick={async () => {
                            await softDeleteItem(i._id);
                            loadAll();
                          }}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          className="text-green-600"
                          onClick={async () => {
                            await restoreItem(i._id);
                            loadAll();
                          }}
                        >
                          Restore
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* VENDORS TAB */}
          <TabsContent value="vendors">
            <div className="flex justify-end mb-3">
              <button onClick={() => setAddVendorOpen(true)} className="text-primary font-medium">
                + Add Vendor
              </button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell>{v.name}</TableCell>
                    
                    <TableCell>{v.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell className="flex gap-3 items-center">
  {/* EDIT */}
  <button
    onClick={() => {
      setEditingVendorId(v._id);
      setNewVendor(v.name);
      setAddVendorOpen(true);
    }}
    className="text-orange-500 hover:text-orange-600"
    title="Edit Vendor"
  >
    <Pencil size={18} />
  </button>

  {/* DELETE / RESTORE */}
  {v.isActive ? (
    <button
      className="text-red-500"
      onClick={async () => {
        await softDeleteVendor(v._id);
        loadAll();
      }}
    >
      Delete
    </button>
  ) : (
    <button
      className="text-green-600"
      onClick={async () => {
        await restoreVendor(v._id);
        loadAll();
      }}
    >
      Restore
    </button>
  )}
</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* ADD ITEM DIALOG */}
      <AlertDialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
  {editingItemId ? "Edit Item" : "Add New Item"}
</AlertDialogTitle>

          </AlertDialogHeader>
          <div className="mb-4">
  <label className="text-sm font-medium mb-1 block">
    Item Type *
  </label>

  <Select
    value={newItemType}
    onValueChange={setNewItemType}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select item type" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="Raw Material">Raw Material</SelectItem>
      <SelectItem value="WIP">WIP</SelectItem>
      <SelectItem value="Final Item">Final Item</SelectItem>
      <SelectItem value="Packaging">Packaging</SelectItem>
    </SelectContent>
  </Select>
</div>

          <Input
            placeholder="Item Name"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="mb-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveItem}>
  {editingItemId ? "Update" : "Add"}
</AlertDialogAction>

          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ADD VENDOR DIALOG */}
      <AlertDialog open={addVendorOpen} onOpenChange={setAddVendorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Vendor</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            placeholder="Vendor Name"
            value={newVendor}
            onChange={(e) => setNewVendor(e.target.value)}
            className="mb-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel
  onClick={() => {
    setEditingItemId(null);
    setNewItem("");
    setNewItemType("");
  }}
>
  Cancel
</AlertDialogCancel>

            <AlertDialogAction onClick={handleSubmitVendor}>
  {editingVendorId ? "Update" : "Add"}
</AlertDialogAction>

          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
