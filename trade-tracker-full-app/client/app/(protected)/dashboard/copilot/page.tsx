import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { CopilotContent } from "@/components/copilot/copilot-content";

export const metadata: Metadata = {
  title: "Copilot",
  description: "Capture and analyze your trading charts with AI.",
};

export default async function CopilotPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <CopilotContent />;
}
