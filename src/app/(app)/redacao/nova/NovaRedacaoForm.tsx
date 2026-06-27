"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { EssayEditor } from "@/components/EssayEditor";

export function NovaRedacaoForm() {
  const router = useRouter();
  const [temas, setTemas] = useState<string[]>([]);
  const [temaSelecionado, setTemaSelecionado] = useState<string>("");
  const [temaCustom, setTemaCustom] = useState<string>("");
  const [carregandoTemas, setCarregandoTemas] = useState(true);
  const [texto, setTexto] = useState<string>("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarTemas() {
    setCarregandoTemas(true);
    setErro(null);
    try {
      const res = await fetch("/api/redacao/tema");
      const data = await res.json();
      const lista: string[] = data.temas ?? [];
      setTemas(lista);
      if (lista[0]) setTemaSelecionado(lista[0]);
    } catch {
      setErro("Não consegui carregar temas agora.");
    } finally {
      setCarregandoTemas(false);
    }
  }

  useEffect(() => {
    carregarTemas();
  }, []);

  async function enviar() {
    setErro(null);
    const tema = temaCustom.trim() || temaSelecionado;
    if (!tema) {
      setErro("Escolha ou escreva um tema.");
      return;
    }
    if (texto.trim().split(/\s+/).length < 50) {
      setErro("Texto muito curto. Mínimo de 50 palavras.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/redacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, texto }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErro(j.error || "Falha ao enviar redação.");
        return;
      }
      const data = await res.json();
      router.push(`/redacao/${data.id}`);
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-slate-900">Nova redação</h1>
          <p className="mt-1 text-sm text-slate-600">
            Escolha um tema, escreva no padrão ENEM e envie pra correção.
          </p>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <Label>Sugestões de tema</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={carregarTemas}
              loading={carregandoTemas}
              aria-label="Gerar outros temas"
            >
              <RefreshCcw className="mr-1 h-4 w-4" /> Gerar outros
            </Button>
          </div>
          <div className="mt-2 space-y-2">
            {temas.length === 0 && !carregandoTemas ? (
              <p className="text-sm text-slate-500">Nenhum tema agora.</p>
            ) : null}
            {temas.map((t) => (
              <label
                key={t}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 hover:border-indigo-300"
              >
                <input
                  type="radio"
                  name="tema"
                  className="mt-1"
                  checked={temaSelecionado === t && !temaCustom}
                  onChange={() => {
                    setTemaSelecionado(t);
                    setTemaCustom("");
                  }}
                />
                <span className="text-sm text-slate-800">{t}</span>
              </label>
            ))}
          </div>

          <div className="mt-4">
            <Label htmlFor="tema-custom">Ou escreva seu próprio tema</Label>
            <input
              id="tema-custom"
              type="text"
              value={temaCustom}
              onChange={(e) => setTemaCustom(e.target.value)}
              placeholder="Tema personalizado"
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Label htmlFor="redacao">Sua redação</Label>
        </CardHeader>
        <CardBody>
          <EssayEditor id="redacao" onChange={setTexto} disabled={enviando} />
          {erro ? (
            <p role="alert" className="mt-2 text-sm text-rose-600">
              {erro}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end">
            <Button onClick={enviar} loading={enviando}>
              Enviar pra correção
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
