"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { Icons } from "@/components/shared/icons";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch("/api/newsletter");
        if (!response.ok) {
          throw new Error("Failed to fetch subscribers");
        }
        const data = await response.json();
        setSubscribers(data);
      } catch (error) {
        toast.error("Failed to load subscribers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Newsletter Subscribers"
          text="Manage your newsletter subscribers."
        />
        <div className="flex h-[450px] items-center justify-center">
          <Icons.spinner className="size-6 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Newsletter Subscribers"
        text="Manage your newsletter subscribers."
      />
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>{subscriber.email}</TableCell>
                  <TableCell>
                    {format(new Date(subscriber.createdAt), "PPP")}
                  </TableCell>
                </TableRow>
              ))}
              {subscribers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No subscribers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}
