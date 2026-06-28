export const metadata = {
  title: "Política de Privacidade — ENEM App",
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-slate">
      <h1>Política de Privacidade</h1>
      <p>
        <strong>Última atualização:</strong> 27 de junho de 2026.
      </p>

      <p>
        Esta política descreve como tratamos seus dados pessoais no{" "}
        <strong>ENEM App</strong>, em conformidade com a Lei Geral de Proteção
        de Dados (Lei 13.709/2018 — LGPD).
      </p>

      <h2>1. Controlador</h2>
      <p>
        O controlador dos dados é a equipe ENEM App. Contato do encarregado:{" "}
        <a href="mailto:dpo@enem-app.com.br">dpo@enem-app.com.br</a>.
      </p>

      <h2>2. Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Cadastro:</strong> nome, email e senha (armazenada com hash).
        </li>
        <li>
          <strong>Uso:</strong> respostas a questões, redações enviadas,
          progresso por matéria, tempo gasto.
        </li>
        <li>
          <strong>Pagamento:</strong> não armazenamos dados de cartão; eles ficam
          com a Stripe.
        </li>
        <li>
          <strong>Técnicos:</strong> endereço IP, navegador, cookies de sessão.
        </li>
      </ul>

      <h2>3. Como usamos</h2>
      <ul>
        <li>Operar o app e personalizar trilha de estudo.</li>
        <li>Corrigir redações e gerar simulados com IA.</li>
        <li>Cobrar a assinatura Pro e emitir comprovantes.</li>
        <li>Enviar avisos importantes da conta e do estudo.</li>
        <li>Atender a obrigações legais.</li>
      </ul>

      <h2>4. Bases legais</h2>
      <p>
        Execução de contrato (operar a plataforma), legítimo interesse
        (melhorias e segurança), cumprimento de obrigação legal, e consentimento
        para comunicações opcionais de marketing.
      </p>

      <h2>5. Compartilhamento</h2>
      <p>
        Compartilhamos dados apenas com operadores necessários: Stripe
        (pagamentos), Resend ou similar (emails), provedor de IA (correção de
        redação), Vercel (hospedagem). Não vendemos dados.
      </p>

      <h2>6. Retenção</h2>
      <p>
        Mantemos seus dados enquanto sua conta existir. Após exclusão, dados
        sensíveis são apagados em até 30 dias; alguns registros financeiros
        ficam pelo prazo legal exigido.
      </p>

      <h2>7. Seus direitos</h2>
      <p>
        Você pode pedir, a qualquer momento, acesso, correção, anonimização ou
        exclusão dos seus dados, bem como portabilidade. Faça pelo painel{" "}
        <em>Minha conta</em> ou escreva pra{" "}
        <a href="mailto:dpo@enem-app.com.br">dpo@enem-app.com.br</a>.
      </p>

      <h2>8. Segurança</h2>
      <p>
        Usamos HTTPS, hashing de senhas, controle de acesso e logs. Nenhum
        sistema é 100% seguro, mas adotamos práticas recomendadas.
      </p>

      <h2>9. Crianças e adolescentes</h2>
      <p>
        Quando o usuário é menor de 18, o tratamento é feito em seu melhor
        interesse, e dados sensíveis adicionais não são solicitados.
      </p>

      <h2>10. Alterações</h2>
      <p>
        Atualizações serão informadas no app ou por email com antecedência
        razoável.
      </p>
    </main>
  );
}
