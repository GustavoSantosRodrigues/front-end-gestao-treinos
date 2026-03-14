import Link from "next/link";
import { MessageCircle } from "lucide-react";

const MESSAGE = encodeURIComponent("Olá! Preciso de suporte com o FIT.AI.");

export function WhatsappButton() {
  return (
    <Link
      href={`https://wa.me/5511916654474?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 font-heading text-sm font-semibold text-foreground hover:bg-muted transition-colors"
    >
      <MessageCircle className="size-4 text-green-500" />
      Falar com o suporte
    </Link>
  );
}