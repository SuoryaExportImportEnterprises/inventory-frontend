import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DollarSign, AlertCircle, Package } from 'lucide-react';
import { getTransactions } from '@/data/mockData';
import { useMemo, useState , useEffect } from 'react';
import { DiscrepancyDialog } from '@/components/DiscrepancyDialog';
import { toast } from 'sonner';
import API from '@/api/axiosInstance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [discrepancyDialogOpen, setDiscrepancyDialogOpen] = useState(false);

  const [data, setData] = useState<DashboardResponse | null>(null);

useEffect(() => {
  API.get("/dashboard")
    .then(res => setData(res.data))
    .catch(() => toast.error("Failed to load dashboard"));
}, []);


  

  interface ItemStat {
  item: string;
  type: string;
  totalQty: number;
  totalCost: number;
  costPerUnit: number;
}

interface DashboardResponse {
  currentStock: number;
  totalInwards: number;
  totalSales: number;
}


  const stats = useMemo(() => {
    const inwards = getTransactions('inward');
    const outwards = getTransactions('outward');

    let totalInwardQty = 0;
    let totalOutwardQty = 0;
    let totalInwardValue = 0;
    let totalOutwardValue = 0;

    inwards.forEach((txn) => {
      const qtyActual =
        txn.quantityActual ||
        (txn.quantityOnBill -
          (txn.quantityDiscrepancy || 0) -
          (txn.quantityRejected || 0));

      const cost = txn.costPerUnit || 0;

      totalInwardQty += qtyActual;
      totalInwardValue += qtyActual * cost;
    });

    const itemCostMap = {};
    inwards.forEach((txn) => {
      if (txn.costPerUnit && !itemCostMap[txn.item]) {
        itemCostMap[txn.item] = txn.costPerUnit;
      }
    });

    outwards.forEach((txn) => {
      const qty = txn.quantity || 0;
      const cost = itemCostMap[txn.item] || 0;

      totalOutwardQty += qty;
      totalOutwardValue += qty * cost;
    });

    const netInventoryQty = totalInwardQty - totalOutwardQty;
    const netInventoryValue = totalInwardValue - totalOutwardValue;

    const itemStats = {};

    inwards.forEach((txn) => {
      if (!itemStats[txn.item]) {
        itemStats[txn.item] = {
          item: txn.item,
          type: txn.type,
          totalQty: 0,
          totalCost: 0,
          costPerUnit: txn.costPerUnit || 0,
        };
      }

      const qtyActual =
        txn.quantityActual ||
        (txn.quantityOnBill -
          (txn.quantityDiscrepancy || 0) -
          (txn.quantityRejected || 0));

      itemStats[txn.item].totalQty += qtyActual;
      itemStats[txn.item].totalCost += qtyActual * (txn.costPerUnit || 0);
    });

const topItems = Object.values(itemStats)
  .map((item: ItemStat) => ({
    ...item,
    totalValue: item.totalCost,
  }))
  .sort((a, b) => b.totalValue - a.totalValue)
  .slice(0, 20);


    const pendingDiscrepancies = inwards.filter(
      (t) =>
        (t.quantityDiscrepancy > 0 || t.hasDiscrepancy) && !t.discrepancyStatus
    ).length;

    return {
      netInventoryQty,
      netInventoryValue,
      pendingDiscrepancies,
      topItems,
    };
  }, []);
  

  return (
    <>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor financials, costs, and analytics
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Net Inventory Qty */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Current Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data?.currentStock ?? 0}</p>
    <p className="text-muted-foreground">Total units in inventory</p>
            </CardContent>
          </Card>

          {/* Net Inventory Value */}
          <Card className="border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Total Inwards
              </CardTitle>
            </CardHeader>
            <CardContent>
             <p className="text-3xl font-bold">{data?.totalInwards ?? 0}</p>
    <p className="text-muted-foreground">Total goods received</p>
            </CardContent>
          </Card>

          {/* Pending Discrepancies */}
<Card className="border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
             <p className="text-3xl font-bold">{data?.totalSales ?? 0}</p>
    <p className="text-muted-foreground">Total goods sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Items Table */}
        {/* <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Top 20 Expensive Items</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/revenue')}
              >
                View All
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Qty</TableHead>
                    <TableHead>Cost/Unit</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topItems.length > 0 ? (
                    stats.topItems.slice(0, 10).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.item}
                        </TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>
                          {Number(item.totalQty || 0).toFixed(0)}
                        </TableCell>
                        <TableCell>
                          ₹{Number(item.costPerUnit || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          ₹{Number(item.totalValue || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Discrepancy Popup */}
      <DiscrepancyDialog
        open={discrepancyDialogOpen}
        onOpenChange={setDiscrepancyDialogOpen}
      />
    </>
  );
}
