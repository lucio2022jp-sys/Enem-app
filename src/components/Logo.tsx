import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold text-slate-900",
        className,
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>ENEM Treino</span>
    </span>
  );
}
