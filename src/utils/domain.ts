export function getSiteUrl(): string {
  // 1. Se houver uma URL configurada manualmente no .env
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  // 2. Se estiver em produção (main branch) na Vercel, forçar o domínio principal
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    return "https://tvrussas.com.br";
  }

  // 3. Se estiver rodando na infraestrutura da Vercel (ex: Preview)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Fallback para o domínio final de produção customizado
  return "https://tvrussas.com.br";
}

export const DOMAIN = getSiteUrl();
