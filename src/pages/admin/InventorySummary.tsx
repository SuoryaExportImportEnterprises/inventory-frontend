import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Save } from "lucide-react";
import API from "@/api/axiosInstance";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateItemCost } from "@/api/itemApi";


interface InventoryItem {
  _id: string;
  name: string;
  type: string;
  currentStock: number;
  costPerUnit: number;
}


export default function InventorySummary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
const [editingId, setEditingId] = useState<string | null>(null);
const [editedCost, setEditedCost] = useState<number>(0);


  // 🔥 FETCH SUMMARY FROM BACKEND
const loadItems = async () => {
  try {
    const res = await API.get("/items");
    setItems(res.data);
  } catch {
    toast.error("Failed to load inventory");
  }
};

useEffect(() => {
  loadItems();
}, []);


  const filteredItems = useMemo(() => {
  return items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
}, [items, search]);

  // 🖊 Enable edit mode
  const startEditing = (id: string, currentCost: number) => {
    setEditingId(id);
    setEditedCost(currentCost);
  };
  const saveCost = async (id: string) => {
    try {
      await updateItemCost(id, editedCost!);

      toast.success("Cost updated successfully");
      setEditingId(null);
      setEditedCost(null);

      loadItems(); // ✅
 // refresh table
    } catch {
      toast.error("Failed to update cost");
    }
  };

  return (
    // <Layout>
      <div className="space-y-6">
        {/* Back + Title */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-1">Inventory Summary</h1>
              <p className="text-muted-foreground">
                Complete inventory analysis with costs
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <Card>
          <CardHeader>
  <CardTitle>Inventory Items</CardTitle>
</CardHeader>


          {/* TABLE */}
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
               <TableHeader>
  <TableRow>
    <TableHead>S. No</TableHead>
    <TableHead>Item</TableHead>
    <TableHead>Type</TableHead>
    <TableHead className="text-right">Current Stock</TableHead>
    <TableHead className="text-right">Cost / Unit</TableHead>
    <TableHead>Actions</TableHead>
  </TableRow>
</TableHeader>


               <TableBody>
  {filteredItems.map((item, index) => (
    <TableRow key={item._id}>
      <TableCell>{index + 1}</TableCell>

      <TableCell className="font-medium">
        {item.name}
      </TableCell>

      <TableCell>
  <span className="text-sm text-muted-foreground">
    {item.type}
  </span>
</TableCell>

      <TableCell className="text-right font-semibold">
        {item.currentStock}
      </TableCell>

      <TableCell className="text-right">
        {editingId === item._id ? (
          <Input
            type="number"
            value={editedCost}
            onChange={(e) =>
              setEditedCost(Number(e.target.value))
            }
            className="w-24 text-right"
          />
        ) : (
          `₹${(item.costPerUnit || 0).toFixed(2)}`
        )}
      </TableCell>

      <TableCell>
        {editingId === item._id ? (
          <Button
            size="sm"
            onClick={async () => {
              try {
                await API.patch(`/items/${item._id}/cost`, {
                  costPerUnit: editedCost,
                });

                toast.success("Cost updated");

                setItems((prev) =>
                  prev.map((i) =>
                    i._id === item._id
                      ? { ...i, costPerUnit: editedCost }
                      : i
                  )
                );

                setEditingId(null);
              } catch {
                toast.error("Failed to update cost");
              }
            }}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingId(item._id);
              setEditedCost(item.costPerUnit || 0);
            }}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </TableCell>
    </TableRow>
  ))}
</TableBody>

              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    // </Layout>
  );
}
