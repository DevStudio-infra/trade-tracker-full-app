"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Session {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  analyses: Array<{
    type: string;
    createdAt: string;
  }>;
}

interface SessionManagerProps {
  currentSessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
}

export function SessionManager({
  currentSessionId,
  onSessionChange,
}: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sessions");
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async () => {
    if (!newSessionName.trim()) return;

    try {
      setIsCreatingSession(true);
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newSessionName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create session");

      const newSession = await response.json();
      setSessions((prev) => [newSession, ...prev]);
      onSessionChange(newSession.id);
      setShowNewSessionDialog(false);
      setNewSessionName("");
      toast.success("Session created successfully");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSessionChange = (value: string) => {
    onSessionChange(value === "none" ? null : value);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentSessionId || "none"}
        onValueChange={handleSessionChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select Session" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Session</SelectItem>
          {sessions.map((session) => (
            <SelectItem key={session.id} value={session.id}>
              <div className="flex items-center justify-between gap-2">
                <span>{session.name}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(session.updatedAt), "MMM d, HH:mm")}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog
        open={showNewSessionDialog}
        onOpenChange={setShowNewSessionDialog}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" disabled={isLoading}>
            <Plus className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                placeholder="Session name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    createSession();
                  }
                }}
              />
            </div>
            <Button
              onClick={createSession}
              disabled={!newSessionName.trim() || isCreatingSession}
              className="w-full"
            >
              {isCreatingSession ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
