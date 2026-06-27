"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Textarea } from "@/components/ui/Textarea";

interface EssayEditorProps {
  id?: string;
  defaultValue?: string;
  onChange?: (texto: string) => void;
  disabled?: boolean;
}

export function EssayEditor({
  id = "redacao",
  defaultValue = "",
  onChange,
  disabled,
}: EssayEditorProps) {
  const [texto, setTexto] = useState(defaultValue);

  const stats = useMemo(() => {
    const palavras = texto.trim().split(/\s+/).filter(Boolean).length;
    const linhas = texto.split(/\n/).filter((l) => l.trim().length > 0).length;
    const caracteres = texto.length;
    return { palavras, linhas, caracteres };
  }, [texto]);

  function handle(e: ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    setTexto(v);
    onChange?.(v);
  }

  return (
    <div>
      <Textarea
        id={id}
        name="texto"
        value={texto}
        onChange={handle}
        disabled={disabled}
        rows={18}
        placeholder="Escreva sua redação aqui. Lembre-se: introdução, desenvolvimento em parágrafos com argumentação e proposta de intervenção..."
      />
      <div className="mt-2 flex flex-wrap justify-end gap-4 text-xs text-slate-500">
        <span>{stats.palavras} palavras</span>
        <span>{stats.linhas} linhas</span>
        <span>{stats.caracteres} caracteres</span>
      </div>
    </div>
  );
}
