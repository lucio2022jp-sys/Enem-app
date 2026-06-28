/**
 * Camada de envio de email.
 *
 * Usa Resend se RESEND_API_KEY estiver definida. Caso contrário, faz log
 * em console (modo dev) para não bloquear o fluxo da app.
 */

import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Enem App <onboarding@resend.dev>";
const APP_NAME = "Enem App";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function enviarEmail({ to, subject, html, text }: SendArgs) {
  if (!resend) {
    console.log("[email:stub]", { to, subject });
    return { ok: true, stub: true };
  }
  try {
    const r = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text,
    });
    if (r.error) {
      console.error("[email:erro]", r.error);
      return { ok: false, erro: r.error.message };
    }
    return { ok: true, id: r.data?.id };
  } catch (e) {
    console.error("[email:exception]", e);
    return { ok: false, erro: (e as Error).message };
  }
}

function wrap(titulo: string, corpo: string, cta?: { label: string; url: string }) {
  return `
<!doctype html>
<html lang="pt-BR">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f5f7fb;margin:0;padding:24px;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
    <tr>
      <td style="padding:24px;border-bottom:1px solid #e2e8f0;">
        <div style="font-weight:700;font-size:18px;">${APP_NAME}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <h1 style="font-size:20px;margin:0 0 12px;">${titulo}</h1>
        <div style="font-size:15px;line-height:1.5;color:#334155;">${corpo}</div>
        ${
          cta
            ? `<div style="margin-top:24px;"><a href="${cta.url}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:600;">${cta.label}</a></div>`
            : ""
        }
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px;">
        Você recebeu esse email porque tem conta no ${APP_NAME}.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailBoasVindas(nome: string) {
  return {
    subject: `Bem-vindo ao ${APP_NAME}!`,
    html: wrap(
      `Oi, ${nome}!`,
      `<p>Sua conta foi criada. Pra começar, faça o diagnóstico inicial — ele monta sua trilha personalizada.</p>`,
      { label: "Fazer diagnóstico", url: `${appUrl()}/diagnostico` }
    ),
  };
}

export function emailRecibo(nome: string) {
  return {
    subject: `Seu Pro está ativo`,
    html: wrap(
      `Valeu, ${nome}!`,
      `<p>Sua assinatura do <strong>Enem Pro</strong> está ativa. Aproveita simulados ilimitados, correção de redação com IA e revisão espaçada.</p>`,
      { label: "Abrir o app", url: `${appUrl()}/inicio` }
    ),
  };
}

export function emailPagamentoFalhou(nome: string) {
  return {
    subject: `Não conseguimos cobrar sua assinatura`,
    html: wrap(
      `Ops, ${nome}.`,
      `<p>O pagamento da sua assinatura falhou. Atualiza o cartão pra não perder o acesso Pro.</p>`,
      { label: "Atualizar pagamento", url: `${appUrl()}/planos` }
    ),
  };
}

export function emailResetSenha(nome: string, link: string) {
  return {
    subject: `Redefinir sua senha`,
    html: wrap(
      `Oi, ${nome}.`,
      `<p>Pediram pra trocar sua senha. Se foi você, clica abaixo (o link expira em 1 hora).</p><p style="font-size:13px;color:#64748b;">Se não foi você, pode ignorar.</p>`,
      { label: "Redefinir senha", url: link }
    ),
  };
}

export function emailLembreteRevisao(nome: string, qtd: number) {
  return {
    subject: `Você tem ${qtd} revisão${qtd > 1 ? "ões" : ""} pra hoje`,
    html: wrap(
      `${nome}, hora da revisão`,
      `<p>Você tem <strong>${qtd}</strong> questão${qtd > 1 ? "ões" : ""} agendadas pra revisar hoje. Cinco minutos resolvem.</p>`,
      { label: "Revisar agora", url: `${appUrl()}/revisao` }
    ),
  };
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
