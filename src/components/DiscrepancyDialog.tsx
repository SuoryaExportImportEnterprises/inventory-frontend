import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTransactions, updateTransaction } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DiscrepancyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscrepancyDialog({ open, onOpenChange }: DiscrepancyDialogProps) {
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadDiscrepancies();
    }
  }, [open]);

  const loadDiscrepancies = () => {
    const inwards = getTransactions('inward') as any[];
    const discrepancyList = inwards.filter(
      (t: any) => (t.quantityDiscrepancy > 0 || t.hasDiscrepancy)
    );
    setDiscrepancies(discrepancyList);
  };

  const updateStatus = (id: string, newStatus: string) => {
    updateTransaction('inward', id, { discrepancyStatus: newStatus });
    loadDiscrepancies();
    toast({
      title: 'Status Updated',
      description: `Discrepancy marked as ${newStatus}`,
    });
  };

  const getStatusBadge = (status?: string) => {
    const statusValue = status || 'Pending';
    const variants: Record<string, any> = {
      Pending: 'destructive',
      Reviewed: 'default',
      Resolved: 'secondary',
    };
    return (
      <Badge variant={variants[statusValue] || 'default'}>
        {statusValue}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto" aria-describedby="discrepancy-description">
        <DialogHeader>
          <DialogTitle>Pending Discrepancies</DialogTitle>
          <p id="discrepancy-description" className="sr-only">Review and manage inventory discrepancies</p>
        </DialogHeader>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Qty on Bill</TableHead>
                <TableHead>Qty Actual</TableHead>
                <TableHead>Discrepancy</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discrepancies.length > 0 ? (
                discrepancies.map((txn: any) => {
                  const qtyActual = txn.quantityActual || 
                    (txn.quantityOnBill - (txn.quantityDiscrepancy || 0) - (txn.quantityRejected || 0));
                  
                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">{txn.id}</TableCell>
                      <TableCell>{txn.item}</TableCell>
                      <TableCell>{txn.vendor}</TableCell>
                      <TableCell>{txn.quantityOnBill}</TableCell>
                      <TableCell>{Number(qtyActual).toFixed(0)}</TableCell>
                      <TableCell className="text-destructive font-semibold">
                        {txn.quantityDiscrepancy || 0}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {txn.remarks || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(txn.discrepancyStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {(!txn.discrepancyStatus || txn.discrepancyStatus === 'Pending') && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(txn.id, 'Reviewed')}
                              >
                                Review
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateStatus(txn.id, 'Resolved')}
                              >
                                Resolve
                              </Button>
                            </>
                          )}
                          {txn.discrepancyStatus === 'Reviewed' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(txn.id, 'Resolved')}
                            >
                              Resolve
                            </Button>
                          )}
                          {txn.discrepancyStatus === 'Resolved' && (
                            <span className="text-sm text-muted-foreground">Completed</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No discrepancies found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
