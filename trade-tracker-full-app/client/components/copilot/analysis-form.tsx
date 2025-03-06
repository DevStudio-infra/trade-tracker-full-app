"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
});

interface AnalysisFormProps {
  image: string | null;
  onSubmit: (prompt: string, type: "OPPORTUNITY" | "GUIDANCE") => Promise<void>;
  isLoading: boolean;
}

export function AnalysisForm({
  image,
  onSubmit,
  isLoading,
}: AnalysisFormProps) {
  const [analysisType, setAnalysisType] = useState<"OPPORTUNITY" | "GUIDANCE">(
    "OPPORTUNITY",
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    await onSubmit(values.prompt, analysisType);
  }

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="OPPORTUNITY"
        onValueChange={(value) =>
          setAnalysisType(value as "OPPORTUNITY" | "GUIDANCE")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="OPPORTUNITY">New Trade</TabsTrigger>
          <TabsTrigger value="GUIDANCE">Active Trade</TabsTrigger>
        </TabsList>
        <TabsContent value="OPPORTUNITY">
          <p className="text-sm text-muted-foreground">
            Analyze chart for new trading opportunities. Get detailed scoring
            and analysis.
          </p>
        </TabsContent>
        <TabsContent value="GUIDANCE">
          <p className="text-sm text-muted-foreground">
            Get guidance for your active trade. Includes position analysis and
            psychological check.
          </p>
        </TabsContent>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={
                      analysisType === "OPPORTUNITY"
                        ? "Analyze this chart for potential trading opportunities..."
                        : "I'm in a long position from 1.2345, should I..."
                    }
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className={cn("w-full", image ? "opacity-100" : "opacity-50")}
            disabled={!image || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Chart"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
