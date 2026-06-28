"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardBody } from "@/components/ui/Card";

const schema = z
  .object({
    senha: z.string().min(8, "Mínimo 8 caracteres"),
    confirma: z.string(),
  })
  .refine((v) => v.senha === v.confirma, {
    path: ["confirma"],
    message: "As senhas não batem",
  });
type Form = z.infer<typeof schema>;

export default function RedefinirPage({
  params,
}: {
  params: { token: string };
}) {
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
    const r = await fetch("/api/auth/redefinir-senha", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: params.token, senha: data.senha }),
    });
    setCarregando(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErro(j.error || "Link inválido ou expirado.");
      return;
    }
    router.push("/entrar?redefinida=1");
  }

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-bold text-slate-900">Nova senha</h1>
        <p className="mt-1 text-sm text-slate-600">
          Escolha uma senha forte. Mínimo 8 caracteres.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="new-password"
              error={errors.senha?.message}
              {...register("senha")}
            />
          </div>
          <div>
            <Label htmlFor="confirma">Confirmar senha</Label>
            <Input
              id="confirma"
              type="password"
              autoComplete="new-password"
              error={errors.confirma?.message}
              {...register("confirma")}
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
            Salvar nova senha
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          <Link href="/entrar" className="font-medium text-indigo-600">
            Voltar pra entrar
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
