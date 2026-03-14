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
        <div className="relative flex min-h-svh flex-col bg-black">
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                <Image src="/login-bg.png" alt="" fill className="object-cover pointer-events-none" priority />
            </div>

            <div className="relative z-10 flex flex-col items-center pt-16 gap-6 px-6 text-center">
                <Image src="/fit-ai-logo.svg" alt="FIT.AI" width={85} height={38} />

                <h1 className="text-white text-2xl font-semibold max-w-xs leading-tight">
                    Treine de forma mais inteligente.
                </h1>

                <p className="text-gray-400 text-sm max-w-xs">
                    Seu plano de treino personalizado começa agora.
                </p>
            </div>

            <div className="flex-1" />

            <div className="relative z-10 flex flex-col items-center gap-8 rounded-t-[20px] bg-primary px-5 pb-10 pt-12">
                <h1 className="w-full text-center font-heading text-[32px] font-semibold leading-[1.05] text-primary-foreground">
                    Crie sua conta e comece a treinar.
                </h1>

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
                    ©2026 Copyright FIT.AI. Todos os direitos reservados
                </p>
            </div>
        </div>
    );
}