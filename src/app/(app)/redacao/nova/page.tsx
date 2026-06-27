import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NovaRedacaoForm } from "./NovaRedacaoForm";

export const dynamic = "force-dynamic";

export default async function NovaRedacaoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  return (
    <div className="mx-auto max-w-3xl">
      <NovaRedacaoForm />
    </div>
  );
}
