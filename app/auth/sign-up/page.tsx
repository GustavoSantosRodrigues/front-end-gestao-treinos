import Image from "next/image";
import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import Link from "next/link";
import { SignUpWithEmail } from "../_components/sign-up-with-email";

export default async function SignUpPage() {
    const session = await authClient.getSession({
        fetchOptions: { headers: await headers() },
    });

    if (session.data?.user) redirect("/");

    return (
        <div className="relative flex min-h-svh flex-col bg-black overflow-hidden">
            <div className="absolute inset-0" aria-hidden="true">
                <Image
                    src="/home-banner.jpg"
                    alt=""
                    fill
                    className="object-cover object-center"
                    priority
                />

                <div className="absolute inset-0 bg-black/55" />

                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.95) 100%)",
                    }}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center px-6 pt-16 text-center">

                <h1 className="text-white text-4xl font-bold">
                    GS.AI
                </h1>
                <h2 className="max-w-xs text-2xl font-semibold leading-tight text-white">
                    Treine de forma mais inteligente.
                </h2>

                <p className="mt-4 max-w-xs text-sm text-gray-300">
                    Seu plano de treino personalizado começa agora.
                </p>
            </div>

            <div className="flex-1" />

            <div className="relative z-10 flex flex-col items-center gap-8 rounded-t-[20px] bg-primary px-5 pb-10 pt-12">
                <h2 className="w-full text-center font-heading text-[32px] font-semibold leading-[1.05] text-primary-foreground">
                    Crie sua conta e comece a treinar.
                </h2>

                <div className="flex w-full flex-col gap-4">
                    <SignUpWithEmail />

                    <p className="text-center font-heading text-xs text-primary-foreground/70">
                        Já tem conta?{" "}
                        <Link href="/auth" className="underline text-primary-foreground">
                            Fazer login
                        </Link>
                    </p>
                </div>

                <p className="font-heading text-xs leading-[1.4] text-primary-foreground/70">
                    ©2026 Copyright GS.AI. Todos os direitos reservados
                </p>
            </div>
        </div>
    );
}