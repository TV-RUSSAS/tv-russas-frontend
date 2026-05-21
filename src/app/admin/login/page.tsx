"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { API_URL } from '@/services/api';
import { getImagePath } from '@/utils/imagePath';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!captchaToken) {
        throw new Error('Por favor, aguarde a verificação de segurança (CAPTCHA).');
      }

      const response = await fetch(`${API_URL.replace('/api', '')}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // necessário para salvar o cookie refreshToken (HttpOnly)
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Resetar o widget para gerar um novo token antes de tentar novamente
        setCaptchaToken(null);
        turnstileRef.current?.reset();
        throw new Error(data.error || 'Ocorreu um erro ao fazer login.');
      }

      // Salvar o access token temporariamente no sessionStorage
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('userName', data.user.nome);
      sessionStorage.setItem('userRole', data.user.role);

      // Redireciona para o dashboard administrativo
      router.push('/admin');
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro de conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgb(17, 26, 41) 0%, rgb(28, 38, 57) 90.7%)',
      fontFamily: 'var(--font-inter), sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div className="login-card" style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px 32px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Animação CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .input-focus:focus-within {
            border-color: #ff5722 !important;
            box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.15) !important;
          }
          .btn-pulse:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 87, 34, 0.3);
          }
          .btn-pulse:active {
            transform: translateY(0);
          }
        `}} />

        <div style={{ marginBottom: '32px' }}>
          <Link href="/">
            <Image
              src={getImagePath("sistema/1.png")}
              alt="TV Russas"
              width={160}
              height={45}
              style={{ height: '42px', width: 'auto', marginBottom: '16px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}
              priority
            />
          </Link>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Painel de Controle
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
            Insira suas credenciais para gerenciar o portal
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#ef4444',
            fontSize: '13px',
            textAlign: 'left',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: '16px', flexShrink: 0 }}></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
              E-mail corporativo
            </label>
            <div className="input-focus" style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0 16px',
              height: '48px',
              transition: 'all 0.2s ease'
            }}>
              <i className="far fa-envelope" style={{ color: 'rgba(255, 255, 255, 0.3)', marginRight: '12px' }}></i>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@tvrussas.com.br"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '14px',
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
              Senha de acesso
            </label>
            <div className="input-focus" style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0 16px',
              height: '48px',
              transition: 'all 0.2s ease'
            }}>
              <i className="fas fa-lock" style={{ color: 'rgba(255, 255, 255, 0.3)', marginRight: '12px' }}></i>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '14px',
                  width: '100%',
                  height: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  padding: '4px',
                  marginLeft: '8px'
                }}
              >
                <i className={showPassword ? "far fa-eye-slash" : "far fa-eye"}></i>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => {
                setCaptchaToken(null);
                turnstileRef.current?.reset();
              }}
              options={{
                theme: 'dark',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pulse"
            style={{
              background: 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              height: '48px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i>
                Entrando...
              </>
            ) : (
              <>
                <span>Acessar Painel</span>
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '32px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>
          <Link href="/" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ff5722'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}>
            ← Voltar para o Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
