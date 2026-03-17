"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/app/_lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type Values = z.infer<typeof schema>;

const inputClass = "h-[42px] w-full rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 font-heading text-sm px-4 outline-none focus:border-white/40";

export const SignInWithEmail = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: Values) => {
    setError("");
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/",
    });
    if (error) {
      setError(error.message ?? "Email ou senha inválidos.");
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-1">
        <input {...register("email")} type="email" placeholder="Seu email" className={inputClass} />
        {errors.email && <p className="font-heading text-xs text-red-300 pl-3">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Sua senha"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="font-heading text-xs text-red-300 pl-3">{errors.password.message}</p>}
      </div>
      {error && <p className="text-center font-heading text-xs text-red-300">{error}</p>}
      <Button type="submit" disabled={loading} className="h-[38px] rounded-full bg-white px-6 text-black hover:bg-white/90 font-heading text-sm">
        {loading ? "Aguarde..." : "Entrar"}
      </Button>
    </form>
  );
};