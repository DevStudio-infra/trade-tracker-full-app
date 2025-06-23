import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ClockIcon, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Shift Schedule | Kitchen Management App",
  description: "Manage staff schedules and time-off requests",
};

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shift Schedule</h1>
        <p className="text-muted-foreground">Manage staff schedules and time-off requests</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Schedule Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] border rounded-md flex items-center justify-center bg-muted/50">
              <p className="text-muted-foreground">Calendar view will appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-orange-600" />
              Time-Off Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] border rounded-md flex items-center justify-center bg-muted/50">
              <p className="text-muted-foreground">Time-off requests will appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Staff Roster
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] border rounded-md flex items-center justify-center bg-muted/50">
              <p className="text-muted-foreground">Staff roster will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Schedule Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg">
            <p className="font-medium">Generate AI-Powered Schedules</p>
            <p className="text-muted-foreground mb-4">Upload your staff availability and get optimized schedule suggestions</p>
            <button className="bg-orange-600 text-white rounded-md px-4 py-2 text-sm font-medium">Generate Schedule</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
