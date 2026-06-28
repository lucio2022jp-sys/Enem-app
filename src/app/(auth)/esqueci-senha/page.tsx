"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardBody } from "@/components/ui/Card";

const schema = z.object({ email: z.string().email("Email inválido") });
type Form = z.infer<typeof schema>;

export default function EsqueciSenhaPage() {
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Form) {
    setCarregando(true);
    await fetch("/api/auth/esqueci-senha", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: data.email.toLowerCase() }),
    });
    setCarregando(false);
    setEnviado(true);
  }

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-bold text-slate-900">Esqueci minha senha</h1>
        <p className="mt-1 text-sm text-slate-600">
          Digite seu email. Se houver conta, vamos enviar um link pra redefinir.
        </p>

        {enviado ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
            Pronto. Se o email existir, você receberá o link em alguns minutos.
          </div>
        ) : (
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
            <Button type="submit" loading={carregando} className="w-full">
              Enviar link
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-slate-600">
          <Link href="/entrar" className="font-medium text-indigo-600">
            Voltar pra entrar
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
