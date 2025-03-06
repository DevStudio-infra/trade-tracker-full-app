import { PlansRow } from "@/types";
import { CircleCheck, Info } from "lucide-react";

import { comparePlans, plansColumns } from "@/config/subscriptions";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export function ComparePlans() {
  const renderCell = (value: string | boolean | null) => {
    if (value === null) return "—";
    if (typeof value === "boolean")
      return value ? (
        <CircleCheck className="mx-auto size-[18px] text-primary" />
      ) : (
        "—"
      );
    return value;
  };

  // Mobile card view component
  const MobileView = () => (
    <div className="grid gap-6 sm:hidden">
      {plansColumns.map((plan) => (
        <div key={plan} className="rounded-lg border bg-card shadow-sm">
          <div className="border-b bg-muted/50 p-4">
            <h3 className="text-lg font-semibold capitalize">{plan}</h3>
          </div>
          <div className="divide-y">
            {comparePlans.map((row, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{row.feature}</span>
                  {row.tooltip && (
                    <Popover>
                      <PopoverTrigger className="rounded p-1 hover:bg-muted">
                        <Info className="size-4 text-muted-foreground" />
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        className="max-w-[280px] p-3 text-sm"
                      >
                        {row.tooltip}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {renderCell(row[plan])}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const DesktopView = () => (
    <div className="hidden overflow-x-auto sm:block">
      <table className="w-full table-fixed">
        <thead>
          <tr className="divide-x divide-border border">
            <th className="w-64 bg-muted/50 p-4"></th>
            {plansColumns.map((col) => (
              <th
                key={col}
                className="bg-muted/50 p-4 text-lg font-semibold capitalize"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {comparePlans.map((row: PlansRow, index: number) => (
            <tr key={index} className="divide-x divide-border">
              <td className="bg-muted/30">
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-medium">{row.feature}</span>
                  {row.tooltip && (
                    <Popover>
                      <PopoverTrigger className="rounded p-1 hover:bg-muted">
                        <Info className="size-4 text-muted-foreground" />
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        className="max-w-[280px] p-3 text-sm"
                      >
                        {row.tooltip}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </td>
              {plansColumns.map((col) => (
                <td
                  key={col}
                  className="p-4 text-center text-sm text-muted-foreground"
                >
                  {renderCell(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <MaxWidthWrapper>
      <HeaderSection
        label="Plans"
        title="Compare Our Plans"
        subtitle="Find the perfect plan tailored for your business needs!"
      />
      <div className="mt-8">
        <MobileView />
        <DesktopView />
      </div>
    </MaxWidthWrapper>
  );
}
