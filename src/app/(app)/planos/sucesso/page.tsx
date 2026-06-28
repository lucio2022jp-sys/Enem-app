import Link from "next/link";

export default function Sucesso() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold mb-2">Pro ativado!</h1>
      <p className="text-slate-600 max-w-md mb-6">
        Pagamento confirmado. Você agora tem simulados ilimitados, correção de
        redação com IA e revisão espaçada. Bom estudo.
      </p>
      <div className="flex gap-3">
        <Link
          href="/inicio"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Começar agora
        </Link>
        <Link
          href="/conta"
          className="px-5 py-3 bg-slate-100 text-slate-800 rounded-lg font-medium hover:bg-slate-200"
        >
          Ver minha conta
        </Link>
      </div>
    </div>
  );
}
