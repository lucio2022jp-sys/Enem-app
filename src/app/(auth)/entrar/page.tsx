"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

type Form = z.infer<typeof schema>;

function EntrarForm() {
  const router = useRouter();
  const params = useSearchParams();
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
    const r = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
    });
    setCarregando(false);
    if (!r || r.error) {
      setErro("Email ou senha incorretos.");
      return;
    }
    const to = params.get("redirectTo") || "/inicio";
    router.push(to);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
          autoComplete="current-password"
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
      <Button type="submit" loading={carregando} className="w-full">
        Entrar
      </Button>
    </form>
  );
}

export default function EntrarPage() {
  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-1 text-sm text-slate-600">
          Continue de onde parou no seu treino.
        </p>
        <Suspense fallback={<div className="mt-6 h-40" aria-hidden />}>
          <EntrarForm />
        </Suspense>
        <p className="mt-4 text-center text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <Link href="/cadastrar" className="font-medium text-indigo-600">
            Cadastre-se
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
