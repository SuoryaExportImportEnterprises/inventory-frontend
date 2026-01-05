import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchInventoryDashboard } from '@/api/dashboardApi';
import { useEffect, useState } from 'react';


import { useMemo } from 'react';
interface RecentInward {
  _id: string;
  itemName: string;
  vendorName: string;
  quantityActual: number;
  unit: string;
  createdAt: string;
}

interface RecentOutward {
  _id: string;
  itemName: string;
  partyName: string;
  quantity: number;
  unit: string;
  createdAt: string;
}

export default function InventoryDashboard() {
  const navigate = useNavigate();
  

const [recentInwards, setRecentInwards] = useState<RecentInward[]>([]);
const [recentOutwards, setRecentOutwards] = useState<RecentOutward[]>([]);


useEffect(() => {
  async function loadDashboard() {
    try {
      const res = await fetchInventoryDashboard();
      setRecentInwards(res.data.recentInwards || []);
      setRecentOutwards(res.data.recentOutwards || []);
    } catch (err) {
      console.error("Inventory dashboard error", err);
    }
  }
  loadDashboard();
}, []);


  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory Dashboard</h1>
          <p className="text-muted-foreground">Manage inward and outward material movement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => navigate('/inventory/inward/new')}
            size="lg"
            variant="outline"
            className="h-16 text-lg font-semibold"
          >
            <TrendingUp className="h-6 w-6 mr-2" />
            New Inward
          </Button>
          <Button
            onClick={() => navigate('/inventory/outward/new')}
            size="lg"
            variant="outline"
            className="h-16 text-lg font-semibold"
          >
            <TrendingDown className="h-6 w-6 mr-2" />
            New Outward
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Inwards
              </CardTitle>
              <CardDescription>Last 5 inward transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentInwards.length > 0 ? (
                <div className="space-y-3">
                  {/* {(recentInwards as any[]).map((txn: any) => (
                    <div key={txn.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{txn.item}</p>
                        <p className="text-xs text-muted-foreground">{txn.vendor}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{Number(txn.quantityActual || 0)} {txn.unit}</p>
                        <p className="text-xs text-muted-foreground">{new Date(txn.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))} */}
                  {recentInwards.map(txn => (
  <div
    key={txn._id}
    className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
  >
    <div>
      <p className="font-medium text-sm">{txn.itemName}</p>
      <p className="text-xs text-muted-foreground">{txn.vendorName}</p>
    </div>

    <div className="text-right">
      <p className="font-bold text-primary">
        {txn.quantityActual} {txn.unit}
      </p>
      <p className="text-xs text-muted-foreground">
        {new Date(txn.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>
))}

                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No inward transactions yet</p>
              )}
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => navigate('/inventory/inward')}
              >
                View All Inwards
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Recent Outwards
              </CardTitle>
              <CardDescription>Last 5 outward transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOutwards.length > 0 ? (
                <div className="space-y-3">
                  {/* {(recentOutwards as any[]).map((txn: any) => (
                    <div key={txn.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{txn.item}</p>
                        <p className="text-xs text-muted-foreground">{txn.buyer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">{txn.quantity} {txn.unit}</p>
                        <p className="text-xs text-muted-foreground">{new Date(txn.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))} */}

                  {recentOutwards.map(txn => (
  <div
    key={txn._id}
    className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
  >
    <div>
      <p className="font-medium text-sm">{txn.itemName}</p>
      <p className="text-xs text-muted-foreground">{txn.partyName}</p>
    </div>

    <div className="text-right">
      <p className="font-bold text-primary">
        {txn.quantity} {txn.unit}
      </p>
      <p className="text-xs text-muted-foreground">
        {new Date(txn.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>
))}

                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No outward transactions yet</p>
              )}
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => navigate('/inventory/outward')}
              >
                View All Outwards
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
