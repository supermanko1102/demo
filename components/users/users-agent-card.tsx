"use client";

import { useMutation } from "@tanstack/react-query";
import { Bot, Loader2, SendHorizontal, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { askAgentApi } from "@/lib/api/services";
import { useAuthStore } from "@/store/auth-store";

interface AgentTurn {
  id: number;
  question: string;
  answer: string;
}

export function UsersAgentCard() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<AgentTurn[]>([]);
  const accessToken = useAuthStore((state) => state.accessToken);

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei",
    [],
  );

  const askMutation = useMutation({
    mutationFn: (payload: { message: string; timezone?: string }) => askAgentApi(payload, accessToken),
    onSuccess: (data, variables) => {
      setTurns((prev) => [
        {
          id: Date.now(),
          question: variables.message,
          answer: data.reply,
        },
        ...prev,
      ]);
      setMessage("");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || askMutation.isPending) {
      return;
    }

    askMutation.mutate({
      message: trimmed,
      timezone,
    });
  };

  return (
    <>
      <div className="fixed right-4 bottom-4 z-40 md:right-6 md:bottom-6">
        <Button
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setOpen((prev) => !prev)}
          size="icon"
          type="button"
        >
          {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </Button>
      </div>

      {open ? (
        <div className="fixed right-4 bottom-20 z-40 w-[min(420px,calc(100vw-2rem))] md:right-6 md:bottom-22">
          <Card className="border-primary/15 shadow-xl">
            <CardHeader className="gap-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-4 w-4" />
                  AI Assistant
                </CardTitle>
                <Badge variant="outline">Genkit + Tools</Badge>
              </div>
              <CardDescription>
                可問總人數、active/inactive 人數，並有 injection 防護。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {turns.length === 0 ? (
                  <div className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                    還沒有提問紀錄，先試試看「請找出 active 的使用者」。
                  </div>
                ) : null}

                {turns.map((turn) => (
                  <div className="space-y-1.5 rounded-md border bg-muted/30 p-3" key={turn.id}>
                    <p className="text-xs font-medium text-muted-foreground">你：{turn.question}</p>
                    <p className="text-sm leading-6">AI：{turn.answer}</p>
                  </div>
                ))}
              </div>

              {askMutation.isError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {askMutation.error.message}
                </div>
              ) : null}

              <form className="flex gap-2" onSubmit={handleSubmit}>
                <Input
                  placeholder="問我：後台總共幾個人？active 有幾個？"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <Button disabled={askMutation.isPending} type="submit">
                  {askMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
