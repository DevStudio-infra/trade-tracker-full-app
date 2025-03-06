import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

export function UpgradeCard() {
  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20 md:max-xl:rounded-none md:max-xl:border-none md:max-xl:shadow-none">
      <CardHeader className="md:max-xl:px-4">
        <CardTitle className="flex items-center gap-2">
          <Icons.billing className="size-5 text-blue-500" />
          Upgrade to Pro
        </CardTitle>
        <CardDescription>
          Get 100 monthly credits and 20% off credit purchases
        </CardDescription>
      </CardHeader>
      <CardContent className="md:max-xl:px-4">
        <Link href="/pricing">
          <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">
            View Plans
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
