"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardBody } from "@/components/ui/Card";

const schema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  aceiteTermos: z.literal(true, {
    errorMap: () => ({ message: "Você precisa aceitar os termos." }),
  }),
});

type Form = z.infer<typeof schema>;

export default function CadastrarPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Form) {
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          aceiteTermos: data.aceiteTermos,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErro(j.error || "Falha no cadastro.");
        return;
      }
      const r = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });
      if (!r || r.error) {
        setErro("Conta criada, mas falhou ao entrar. Tente fazer login.");
        return;
      }
      router.push("/diagnostico");
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-bold text-slate-900">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Comece grátis e personalize sua rota de estudo agora.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>
          {erro ? (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {erro}
            </div>
          ) : null}
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register("aceiteTermos")}
            />
            <span>
              Aceito os{" "}
              <Link href="/termos" className="text-indigo-600 hover:underline" target="_blank">
                Termos de uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="text-indigo-600 hover:underline" target="_blank">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          {errors.aceiteTermos ? (
            <p className="text-xs text-rose-600">{errors.aceiteTermos.message}</p>
          ) : null}
          <Button type="submit" loading={carregando} className="w-full">
            Criar conta
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-medium text-indigo-600">
            Entrar
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
