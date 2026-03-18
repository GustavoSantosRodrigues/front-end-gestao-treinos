"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQueryStates, parseAsBoolean, parseAsString } from "nuqs";
import { Sparkles, X, ArrowUp } from "lucide-react";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SUGGESTED_MESSAGES_ONBOARDING = ["Monte meu plano de treino"] as const;
const SUGGESTED_MESSAGES_APP = ["O que posso melhorar no meu treino?", "Tire uma dúvida"] as const;

const chatFormSchema = z.object({
  message: z.string().trim().min(1),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

function isRateLimitMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("429") || normalized.includes("rate");
}

interface ChatProps {
  embedded?: boolean;
  initialMessage?: string;
}

export function Chat({ embedded = false, initialMessage }: ChatProps) {
  const router = useRouter();
  const redirectRef = useRef(false);
  const initialMessageSentRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [chatParams, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
    chat_initial_message: parseAsString,
  });

  const [rateLimitError, setRateLimitError] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/ai`,
      credentials: "include",
    }),
    onError: (error) => {
      if (isRateLimitMessage(error.message)) {
        setRateLimitError(true);
      }
    },
    onFinish: ({ message }) => {
      const hasCreated = message.parts.some((part) =>
        JSON.stringify(part).includes("workoutPlanCreated")
      );

      if (hasCreated && !redirectRef.current) {
        redirectRef.current = true;
        redirectTimeoutRef.current = setTimeout(() => {
          if (embedded) {
            router.push("/");
          } else {
            void setChatParams({ chat_open: false });
            router.push("/");
          }
          redirectRef.current = false;
        }, 2000);
      }
    },
  });

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  const messageValue = useWatch({ control: form.control, name: "message" });

  // Envia mensagem inicial no modo embedded
  useEffect(() => {
    if (embedded && initialMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      void sendMessage({ text: initialMessage });
    }
  }, [embedded, initialMessage, sendMessage]);

  // Envia mensagem inicial via query param no modo flutuante
  useEffect(() => {
    if (
      !embedded &&
      chatParams.chat_open &&
      chatParams.chat_initial_message &&
      !initialMessageSentRef.current
    ) {
      initialMessageSentRef.current = true;
      void sendMessage({ text: chatParams.chat_initial_message });
      void setChatParams({ chat_initial_message: null });
    }
  }, [embedded, chatParams.chat_open, chatParams.chat_initial_message, sendMessage, setChatParams]);

  useEffect(() => {
    if (!embedded && !chatParams.chat_open) {
      initialMessageSentRef.current = false;
    }
  }, [embedded, chatParams.chat_open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  if (!embedded && !chatParams.chat_open) return null;

  const handleClose = () => {
    void setChatParams({ chat_open: false, chat_initial_message: null });
  };

  const onSubmit = async (values: ChatFormValues) => {
    form.setValue("message", "");
    setRateLimitError(false);
    try {
      await sendMessage({ text: values.message });
    } catch (error: unknown) {
      if (error instanceof Error && isRateLimitMessage(error.message)) {
        setRateLimitError(true);
      }
    }
  };

  const handleSuggestion = (text: string) => {
    void sendMessage({ text });
  };

  const isStreaming = status === "streaming";
  const isLoading = status === "submitted" || isStreaming;

  const chatContent = (
    <div
      className={
        embedded
          ? "flex h-svh flex-col bg-background"
          : "flex flex-1 flex-col overflow-hidden rounded-4xl bg-background"
      }
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border p-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-full border border-primary/8 bg-primary/8 p-3">
            <Sparkles className="size-4.5 text-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-heading text-base font-semibold text-foreground">
              Trainer AI
            </span>
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-online" />
              <span className="font-heading text-xs text-primary">Online</span>
            </div>
          </div>
        </div>
        {embedded ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Acessar FIT.AI</Link>
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="icon" onClick={handleClose}>
            <X className="size-6 text-foreground" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-5">
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
                  ? "flex flex-col items-start pl-5 pr-15 pt-5"
                  : "flex flex-col items-end pl-15 pr-5 pt-5"
              }
            >
              <div className={isAssistant ? "rounded-xl bg-secondary p-3" : "rounded-xl bg-primary p-3"}>
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
          <div className="flex flex-wrap gap-2.5 px-5">
            {(embedded ? SUGGESTED_MESSAGES_ONBOARDING : SUGGESTED_MESSAGES_APP).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={isLoading}
                onClick={() => handleSuggestion(suggestion)}
                className="whitespace-nowrap rounded-full bg-primary/10 px-4 py-2 font-heading text-sm text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {rateLimitError && (
          <div className="mx-5 mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-center font-heading text-xs text-red-400">
              Você atingiu o limite de mensagens diário. Tente novamente amanhã.
            </p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-end gap-2 border-t border-border p-5"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Digite sua mensagem"
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void form.handleSubmit(onSubmit)();
                        }
                      }}
                      className="max-h-32 min-h-0 overflow-y-auto bg-secondary px-4 py-3 font-heading text-base text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={!messageValue?.trim() || isLoading}
              size="icon"
              className="size-10 shrink-0 rounded-full"
            >
              <ArrowUp className="size-5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );

  if (embedded) return chatContent;

  return (
    <div className="fixed inset-0 z-60">
      <div className="absolute inset-0 bg-foreground/30" onClick={handleClose} />
      <div className="absolute inset-x-4 bottom-4 top-40 flex flex-col">
        {chatContent}
      </div>
    </div>
  );
}