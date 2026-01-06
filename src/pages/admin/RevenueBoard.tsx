import { useEffect, useState } from "react";
import API from "@/api/axiosInstance";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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


interface ExpensiveItem {
  itemName: string;
  type: string;
  currentStock: number;
  costPerUnit: number;
  totalValue: number;
}



interface RevenueBoardResponse {
  expensiveItems: ExpensiveItem[];
}


export default function RevenueBoard() {
  const [data, setData] = useState<RevenueBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // const ranges = ["1M", "3M", "6M", "1Y"];
  // const [activeRange, setActiveRange] = useState("6M");

  const { user } = useAuth();
  const navigate = useNavigate();


  const loadBoard = async () => {
    try {
      const res = await API.get<RevenueBoardResponse>(
        `/dashboard/revenue-board`
      );
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load revenue board");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  // 🔐 FRONTEND GUARD
  if (!user || user.role !== "admin" || user.canViewRevenue !== true) {
    toast.error("You are not authorized to view Revenue Board");
    navigate("/admin/dashboard");
    return;
  }

  loadBoard();
}, [user , navigate]);



  if (loading || !data) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">

      {/* <div className="flex gap-3 mb-4">
        {ranges.map((r) => (
          <button
            key={r}
            onClick={() => {
              setActiveRange(r);
              loadBoard(r);
            }}
            className={`px-4 py-1 rounded-full border ${
              activeRange === r
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
          >
            {r}
          </button>
        ))}
      </div> */}
      <Card>
        <CardHeader>
          <CardTitle>Expensive Items (Descending by Value)</CardTitle>
        </CardHeader>
        <CardContent>
        

          {/* Table */}
          <Table>

            <TableHeader>
              <TableRow>
    <TableHead>Item</TableHead>
    <TableHead>Type/Category</TableHead>
    <TableHead className="text-right">Current Stock</TableHead>
    <TableHead className="text-right">Cost / Unit</TableHead>
    <TableHead className="text-right">Total Value</TableHead>
  </TableRow>
</TableHeader>

        <TableBody>
          {data.expensiveItems.map((x, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{x.itemName}</TableCell>
              <TableCell>{x.type}</TableCell>
              <TableCell className="text-right font-semibold">
                {x.currentStock}
              </TableCell>
              <TableCell className="text-right">
                ₹{x.costPerUnit.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-bold text-primary">
                ₹{x.totalValue.toLocaleString("en-GB")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
        </CardContent>
      </Card>
    </div>
  );
}
