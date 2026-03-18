"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Salad, X, ArrowUp, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTED_MESSAGES = [
  "Montar minha dieta",
  "Quero emagrecer",
  "Quero ganhar massa",
] as const;

const chatFormSchema = z.object({
  message: z.string().trim().min(1, "Digite uma mensagem"),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Erro desconhecido";
}

function isRateLimitMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("429") || normalized.includes("rate");
}

export function NutritionChat() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  const redirectRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/nutrition/ai`,
      credentials: "include",
    }),
    onError: (error) => {
      if (isRateLimitMessage(getErrorMessage(error))) {
        setRateLimitError(true);
      }
    },
    onFinish: ({ message }) => {
      const hasCreated = message.parts.some((part) =>
        JSON.stringify(part).includes("nutritionPlanCreated")
      );

      if (hasCreated && !redirectRef.current) {
        redirectRef.current = true;

        refreshTimeoutRef.current = setTimeout(() => {
          setOpen(false);
          router.refresh();
          redirectRef.current = false;
        }, 2000);
      }
    },
  });

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  const isStreaming = status === "streaming";
  const isLoading = status === "submitted" || isStreaming;
  const trimmedMessage = messageInput.trim();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setRateLimitError(false);
    setMessageInput("");
    form.reset({ message: "" });

    try {
      await sendMessage({ text: trimmed });
    } catch (error: unknown) {
      if (isRateLimitMessage(getErrorMessage(error))) {
        setRateLimitError(true);
      }
    }
  };

  const onSubmit = async (values: ChatFormValues) => {
    await handleSendMessage(values.message);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir chat de nutrição"
          className="fixed bottom-24 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105"
        >
          <span className="absolute inline-flex size-14 animate-ping rounded-full bg-primary opacity-30" />
          <Salad className="relative size-6 text-primary-foreground" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-128 w-[calc(100vw-32px)] max-w-sm flex-col overflow-hidden rounded-4xl border border-border bg-background shadow-xl">
          <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full border border-primary/8 bg-primary/8 p-2.5">
                <Sparkles className="size-4 text-primary" />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-heading text-sm font-semibold text-foreground">
                  Nutrição AI
                </span>

                <div className="flex items-center gap-1">
                  <div className="size-1.5 rounded-full bg-online" />
                  <span className="font-heading text-xs text-primary">
                    Online
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
            >
              <X className="size-5 text-foreground" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";
              const isLastMessage = messages[messages.length - 1]?.id === message.id;

              const textParts = message.parts.filter(
                (part): part is { type: "text"; text: string } => part.type === "text"
              );

              return (
                <div
                  key={message.id}
                  className={
                    isAssistant
                      ? "flex flex-col items-start pl-4 pr-12 pt-4"
                      : "flex flex-col items-end pl-12 pr-4 pt-4"
                  }
                >
                  <div
                    className={
                      isAssistant
                        ? "rounded-xl bg-secondary p-3"
                        : "rounded-xl bg-primary p-3"
                    }
                  >
                    {isAssistant ? (
                      textParts.map((part, index) => (
                        <Streamdown
                          key={`${message.id}-${index}`}
                          isAnimating={isStreaming && isLastMessage}
                          className="font-heading text-sm leading-relaxed text-foreground"
                        >
                          {part.text}
                        </Streamdown>
                      ))
                    ) : (
                      <p className="whitespace-pre-wrap font-heading text-sm leading-relaxed text-primary-foreground">
                        {textParts.map((part) => part.text).join("")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex shrink-0 flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 px-4">
                {SUGGESTED_MESSAGES.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isLoading}
                    onClick={() => void handleSendMessage(suggestion)}
                    className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-1.5 font-heading text-xs text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {rateLimitError && (
              <div className="mx-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <p className="text-center font-heading text-xs text-red-400">
                  Você atingiu o limite de mensagens diário. Tente novamente amanhã.
                </p>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-end gap-2 border-t border-border p-4"
              >
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          {...field}
                          value={messageInput}
                          placeholder="Digite sua mensagem"
                          disabled={isLoading}
                          rows={1}
                          onChange={(event) => {
                            field.onChange(event);
                            setMessageInput(event.target.value);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              void form.handleSubmit(onSubmit)();
                            }
                          }}
                          className="max-h-24 min-h-0 overflow-y-auto bg-secondary px-3 py-2 font-heading text-sm text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={!trimmedMessage || isLoading}
                  size="icon"
                  className="size-9 shrink-0 rounded-full"
                  aria-label="Enviar mensagem"
                >
                  <ArrowUp className="size-4" />
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}