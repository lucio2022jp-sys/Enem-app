import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, error, ...rest }, ref) {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          aria-invalid={Boolean(error)}
          className={cn(
            "block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2",
            error
              ? "border-rose-400 focus:ring-rose-500"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500",
            className,
          )}
          {...rest}
        />
        {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
      </div>
    );
  },
);
