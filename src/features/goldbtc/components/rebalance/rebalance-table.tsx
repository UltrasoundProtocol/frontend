import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RebalanceRow } from '../../types';

interface RebalanceTableProps {
  rows: RebalanceRow[];
  className?: string;
}

export function RebalanceTable({ rows, className }: RebalanceTableProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Rebalance History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>From → To</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No rebalance history
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={`${row.date}-${index}`}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell>{row.action}</TableCell>
                    <TableCell className="font-mono text-sm">{row.route}</TableCell>
                    <TableCell className="text-right">{row.amount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
