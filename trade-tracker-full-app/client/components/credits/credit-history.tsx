"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icons } from "@/components/shared/icons";

interface Transaction {
  id: string;
  amount: number;
  type: "PURCHASE" | "USAGE" | "REFUND" | "SUBSCRIPTION_BONUS";
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
}

interface CreditHistoryProps {
  userId: string;
}

export function CreditHistory({ userId }: CreditHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch(`/api/credits/${userId}/history`);
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [userId]);

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <Icons.check className="size-4 text-green-500" />;
      case "PENDING":
        return <Icons.clock className="size-4 text-yellow-500" />;
      case "FAILED":
        return <Icons.close className="size-4 text-red-500" />;
      case "CANCELLED":
        return <Icons.close className="size-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "PURCHASE":
        return "Credit Purchase";
      case "USAGE":
        return "Analysis Usage";
      case "REFUND":
        return "Refund";
      case "SUBSCRIPTION_BONUS":
        return "Monthly Credits";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <Icons.spinner className="size-6 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No transactions found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{getTypeLabel(transaction.type)}</TableCell>
                  <TableCell
                    className={
                      transaction.amount > 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getStatusIcon(transaction.status)}
                    <span>{transaction.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
