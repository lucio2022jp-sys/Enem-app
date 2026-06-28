export const metadata = {
  title: "Termos de uso — ENEM App",
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-slate">
      <h1>Termos de uso</h1>
      <p>
        <strong>Última atualização:</strong> 27 de junho de 2026.
      </p>

      <p>
        Estes termos regulam o uso da plataforma <strong>ENEM App</strong>
        (&ldquo;Serviço&rdquo;) por você (&ldquo;Usuário&rdquo;).
      </p>

      <h2>1. Quem pode usar</h2>
      <p>
        O Serviço é destinado a pessoas maiores de 13 anos. Menores de 18 devem
        usar com autorização e supervisão dos pais ou responsáveis.
      </p>

      <h2>2. Conta e segurança</h2>
      <p>
        Você é responsável por manter suas credenciais em sigilo e por todas as
        atividades feitas em sua conta. Avise imediatamente se suspeitar de uso
        indevido.
      </p>

      <h2>3. Plano Free e plano Pro</h2>
      <p>
        O plano <strong>Free</strong> oferece um número limitado de simulados e
        correções de redação por mês. O plano <strong>Pro</strong> é uma
        assinatura recorrente que libera uso ilimitado. Você pode cancelar a
        qualquer momento, sem fidelidade.
      </p>

      <h2>4. Pagamentos</h2>
      <p>
        Os pagamentos da assinatura Pro são processados pela Stripe. Não
        armazenamos dados de cartão. O valor é cobrado mensalmente, no mesmo
        dia da contratação.
      </p>

      <h2>5. Cancelamento e reembolso</h2>
      <p>
        Você pode cancelar sua assinatura a qualquer momento na página{" "}
        <em>Minha conta</em>. O acesso Pro fica ativo até o fim do período já
        pago. Reembolso integral em até 7 dias da contratação, em caso de
        arrependimento, conforme art. 49 do CDC.
      </p>

      <h2>6. Conduta</h2>
      <p>
        É proibido tentar burlar limites do plano Free, raspar conteúdo em
        massa, redistribuir questões, redações ou correções, ou usar o Serviço
        para fins ilegais.
      </p>

      <h2>7. Conteúdo gerado por IA</h2>
      <p>
        Correções e explicações geradas por IA são orientações de estudo, não
        substituem avaliação humana oficial. Use com senso crítico.
      </p>

      <h2>8. Limitação de responsabilidade</h2>
      <p>
        Nos esforçamos para manter o Serviço estável e útil, mas ele é
        fornecido &ldquo;como está&rdquo;. Não garantimos resultados específicos
        no ENEM.
      </p>

      <h2>9. Alterações</h2>
      <p>
        Podemos atualizar estes termos. Mudanças relevantes serão comunicadas
        por email ou aviso no app.
      </p>

      <h2>10. Contato</h2>
      <p>
        Em caso de dúvidas:{" "}
        <a href="mailto:contato@enem-app.com.br">contato@enem-app.com.br</a>.
      </p>
    </main>
  );
}
