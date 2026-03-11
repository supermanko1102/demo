"use client";

import { useMutation } from "@tanstack/react-query";
import { Bot, Loader2, SendHorizontal } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UsersAgentChart } from "@/components/users/users-agent-chart";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { askAgentApi } from "@/lib/api/services";
import type { AgentChartPayload } from "@/types/api";

interface AgentTurn {
  id: number;
  question: string;
  answer?: string;
  status: "pending" | "done" | "error";
  chart?: AgentChartPayload;
}

const QUICK_ACTIONS = [
  { label: "問總人數", message: "後台總共幾個人？" },
  { label: "問 Active", message: "active 有幾個？inactive 有幾個？" },
  { label: "搜尋 Alice", message: "搜尋 alice" },
  { label: "搜尋 Email", message: "搜尋 alice@ionex.local" },
  { label: "Pie Chart", message: "用 pie chart 畫 active/inactive 比例" },
  { label: "Line Chart", message: "用 line chart 顯示 total/active/inactive" },
];

export function UsersAgentCard() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<AgentTurn[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei",
    [],
  );

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [turns, open]);

  const askMutation = useMutation({
    mutationFn: async ({ payload }: { payload: { message: string; timezone?: string }; turnId: number }) =>
      askAgentApi(payload),
    onSuccess: (data, variables) => {
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === variables.turnId
            ? {
                ...turn,
                answer: data.reply,
                chart: data.chart,
                status: "done",
              }
            : turn,
        ),
      );
    },
    onError: (error, variables) => {
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === variables.turnId
            ? {
                ...turn,
                answer: error instanceof Error ? error.message : "Agent 回覆失敗",
                status: "error",
              }
            : turn,
        ),
      );
    },
  });

  const submitMessage = (rawMessage: string) => {
    const trimmed = rawMessage.trim();
    if (!trimmed || askMutation.isPending) {
      return;
    }

    const turnId = Date.now();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        question: trimmed,
        status: "pending",
      },
    ]);
    setMessage("");

    askMutation.mutate({
      turnId,
      payload: {
        message: trimmed,
        timezone,
      },
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMessage(message);
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <div className="fixed right-4 bottom-4 z-40 md:right-6 md:bottom-6">
        <SheetTrigger asChild>
          <Button className="h-12 w-12 rounded-full shadow-lg" size="icon" type="button">
            <Bot className="h-5 w-5" />
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent className="w-full p-0 sm:max-w-2xl" side="right">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b pb-3">
            <div className="flex items-center justify-between gap-3 pr-10">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-4 w-4" />
                AI Assistant
              </SheetTitle>
              <Badge variant="outline">Genkit + Tools</Badge>
            </div>
            <SheetDescription>
              可問總人數、active/inactive、搜尋姓名或 email，並指定 pie 或 line chart。
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col p-4">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1" ref={listRef}>
              {turns.length === 0 ? (
                <div className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                  還沒有提問紀錄，先試試看「用 pie chart 畫 active/inactive 比例」。
                </div>
              ) : null}

              {turns.map((turn) => (
                <div className="space-y-2" key={turn.id}>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-sm whitespace-pre-line text-primary-foreground">
                      {turn.question}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="w-full max-w-none space-y-2 rounded-2xl border bg-background px-3 py-2 text-sm">
                      {turn.status === "pending" ? (
                        <p className="inline-flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Agent thinking...
                        </p>
                      ) : (
                        <p
                          className={`whitespace-pre-line leading-6 ${
                            turn.status === "error" ? "text-destructive" : ""
                          }`}
                        >
                          {turn.answer}
                        </p>
                      )}
                      {turn.chart && turn.status === "done" ? <UsersAgentChart chart={turn.chart} /> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  disabled={askMutation.isPending}
                  key={action.label}
                  onClick={() => submitMessage(action.message)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {action.label}
                </Button>
              ))}
            </div>

            <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
              <Input
                placeholder="問我：搜尋 jenny@ionex.local 或用 pie chart 畫比例"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={askMutation.isPending}
              />
              <Button disabled={askMutation.isPending} type="submit">
                {askMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
