'use client';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function ConfiguracoesAdmin() {
  const { user } = useAdminAuth();

  return (
    <>
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Configurações</h2>
          <p className="cms-page-subtitle">Configurações gerais do sistema</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Info do sistema */}
        <div className="cms-table-card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '20px' }}>⚙️ Informações do Sistema</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Plataforma', value: 'TV Russas CMS' },
              { label: 'Versão', value: '2.0.0' },
              { label: 'Framework (Frontend)', value: 'Next.js 14 (App Router)' },
              { label: 'Backend', value: 'Node.js + Express + Prisma' },
              { label: 'Banco de Dados', value: 'PostgreSQL' },
              { label: 'Upload de Imagens', value: 'Sharp (WebP automático)' },
              { label: 'Monitoramento', value: 'Sentry v8' },
              { label: 'Proteção CAPTCHA', value: 'Cloudflare Turnstile' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '13px', color: '#8b98b0' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sessão atual */}
        <div className="cms-table-card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '20px' }}>👤 Sua Sessão</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Nome', value: user?.nome || '—' },
              { label: 'Cargo', value: user?.role?.replace('_', ' ') || '—' },
              { label: 'Autenticação', value: 'JWT + Refresh Token' },
              { label: 'Segurança', value: 'Cookie HttpOnly + SameSite Strict' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '13px', color: '#8b98b0' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Segurança */}
        <div className="cms-table-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>🛡️ Status de Segurança</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { icon: '✅', label: 'Rate Limiting', desc: 'Ativo — 100 req/15min' },
              { icon: '✅', label: 'Helmet.js', desc: 'Headers HTTP seguros' },
              { icon: '✅', label: 'CORS', desc: 'Domínio restrito' },
              { icon: '✅', label: 'JWT Rotativo', desc: 'Access + Refresh Tokens' },
              { icon: '✅', label: 'RBAC', desc: '4 níveis de permissão' },
              { icon: '✅', label: 'Auditoria', desc: 'Log de todas as ações' },
              { icon: '✅', label: 'Upload Seguro', desc: 'Multer + tipo de arquivo' },
              { icon: '✅', label: 'Sentry', desc: 'Monitoramento de erros' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '14px', borderRadius: '8px',
                background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: '#8b98b0' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
