import { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, ChefHat, MessageSquare, ShoppingBag } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | Kitchen Management App",
  description: "Kitchen management dashboard overview",
};

const features = [
  {
    title: "Kitchen Oracle",
    description: "Ask questions about ingredients, recipes, and substitutions",
    icon: <MessageSquare className="h-10 w-10 text-orange-600" />,
    href: "/dashboard/oracle",
  },
  {
    title: "Shift Schedule",
    description: "View and manage staff schedules and time-off requests",
    icon: <Calendar className="h-10 w-10 text-orange-600" />,
    href: "/dashboard/schedule",
  },
  {
    title: "Recipe Book",
    description: "Browse, search, and manage your digital recipe collection",
    icon: <BookOpen className="h-10 w-10 text-orange-600" />,
    href: "/dashboard/recipes",
  },
  {
    title: "Menu Suggestions",
    description: "Get AI-powered menu suggestions based on your recipes",
    icon: <ChefHat className="h-10 w-10 text-orange-600" />,
    href: "/dashboard/suggestions",
  },
  {
    title: "Orders",
    description: "Calculate ingredient quantities and generate shopping lists",
    icon: <ShoppingBag className="h-10 w-10 text-orange-600" />,
    href: "/dashboard/orders",
  },
];

export default async function DashboardPage() {
  const user = await currentUser();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.firstName || "Chef"}!</h1>
        <p className="text-muted-foreground">
          Manage your kitchen operations with ease using these tools.
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Link href={feature.href} key={index}>
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
