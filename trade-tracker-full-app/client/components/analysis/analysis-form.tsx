import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { ANALYSIS_CREDIT_COST } from "@/lib/credits/credit-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  prompt: z.string().min(1, "Please enter an analysis prompt"),
});

type FormData = z.infer<typeof formSchema>;

export function AnalysisForm({
  onSubmit,
  isLoading,
  userCredits,
  type = "OPPORTUNITY",
}: {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  userCredits?: number;
  type?: "OPPORTUNITY" | "GUIDANCE";
}) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    if (
      typeof userCredits !== "undefined" &&
      userCredits < ANALYSIS_CREDIT_COST
    ) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${ANALYSIS_CREDIT_COST} credits to perform an analysis. Your current balance: ${userCredits} credits.`,
      });
      router.push("/credits");
      return;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {typeof userCredits !== "undefined" && (
          <>
            {userCredits <= 2 && (
              <Alert variant="destructive">
                <AlertTitle>Low Credits Warning</AlertTitle>
                <AlertDescription>
                  You only have {userCredits} credits left. Each analysis costs{" "}
                  {ANALYSIS_CREDIT_COST} credits.
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/credits")}
                    >
                      Purchase Credits
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {userCredits <= 10 && userCredits > 2 && (
              <Alert>
                <AlertTitle>Credit Balance Notice</AlertTitle>
                <AlertDescription>
                  You have {userCredits} credits remaining. Consider purchasing
                  more credits soon.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={
                    type === "OPPORTUNITY"
                      ? "What trading opportunities should I look for in this chart?"
                      : "What guidance can you provide for this chart?"
                  }
                  className="h-24 resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={
            isLoading ||
            (typeof userCredits !== "undefined" &&
              userCredits < ANALYSIS_CREDIT_COST)
          }
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </Button>
      </form>
    </Form>
  );
}
