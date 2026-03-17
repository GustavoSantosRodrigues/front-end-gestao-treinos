import Image from "next/image";
import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { SignInWithGoogle } from "./_components/sign-in-with-google";
import Link from "next/link";
import { SignInWithEmail } from "./_components/sign-in-with-email";

export default async function AuthPage() {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });

  if (session.data?.user) redirect("/");

  return (
    <div className="relative flex min-h-svh flex-col bg-black overflow-y-auto">

      <div className="relative z-10 flex flex-col items-center pt-16 gap-6 px-6 text-center">
        <h1 className="text-white text-4xl font-bold">
          GS.AI
        </h1>

        <h2 className="text-white text-2xl font-semibold max-w-xs leading-tight">
          Treine de forma mais inteligente.
        </h2>

        <p className="text-gray-400 text-sm max-w-xs">
          Seu plano de treino personalizado começa agora.
        </p>
      </div>

      {/* Banner de aviso de desenvolvimento */}
      <div className="relative z-10 mx-5 mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
        <p className="text-center font-heading text-xs text-yellow-300">
          🚧 App em versão de teste. Caso encontre alguma falha ou tenha sugestões, nos avise pelo suporte no seu perfil dentro do app.
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 rounded-t-[20px] bg-primary px-5 pb-10 pt-12 mt-12">
        <h2 className="w-full text-center font-heading text-[32px] font-semibold leading-[1.05] text-primary-foreground">
          O app que vai transformar a forma como você treina.
        </h2>

        <div className="flex w-full flex-col gap-4">
          <SignInWithGoogle />
          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-primary-foreground/20" />
            <span className="font-heading text-xs text-primary-foreground/50">ou</span>
            <div className="h-px flex-1 bg-primary-foreground/20" />
          </div>
          <SignInWithEmail />
          <p className="text-center font-heading text-xs text-primary-foreground/70">
            Não tem conta?{" "}
            <Link href="/auth/sign-up" className="underline text-primary-foreground">
              Cadastre-se
            </Link>
          </p>
        </div>

        <p className="font-heading text-xs leading-[1.4] text-primary-foreground/70">
          ©2026 Copyright FIT.AI. Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}