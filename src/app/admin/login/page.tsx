"use client";
import './login.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { API_URL } from '@/services/api';
import { Turnstile } from '@marsidev/react-turnstile';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Força o widget a gerar um novo token (desmonta e remonta o componente)
  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaKey((k) => k + 1);
  };

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
        body: JSON.stringify({ email, password, rememberMe, captchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Resetar o widget para gerar um novo token antes de tentar novamente
        resetCaptcha();
        throw new Error(data.error || 'Ocorreu um erro ao fazer login.');
      }

      // Salvar o access token temporariamente no sessionStorage
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('userName', data.user.nome);
      sessionStorage.setItem('userRole', data.user.role);
      sessionStorage.setItem('userId', data.user.id);

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
    <div className="login-root">
      {/* ── COLUNA ÚNICA (Formulário Centralizado) ── */}
      <div className="login-right">
        <div className="login-right-container">
          
          <div className="login-form-logo">
            <Image
              src="/logo-tv-russas.png"
              alt="TV Russas"
              width={160}
              height={45}
              style={{ height: '42px', width: 'auto' }}
              priority
            />
          </div>

          <div className="login-form-header">
            <h2>Acesso Administrativo</h2>
            <p>Entre com suas credenciais corporativas</p>
          </div>

          {error && (
            <div className="login-alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            
            <div className="login-input-group">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder=" "
              />
              <Mail className="login-input-icon" size={18} />
              <label htmlFor="email" className="login-label">E-mail corporativo</label>
            </div>

            <div className="login-input-group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder=" "
              />
              <Lock className="login-input-icon" size={18} />
              <label htmlFor="password" className="login-label">Senha de acesso</label>
              
              <button
                type="button"
                className="login-btn-reveal"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="login-checkbox-group">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Lembrar-me neste dispositivo</label>
            </div>

            <div className="login-turnstile-wrap">
              <Turnstile
                key={captchaKey}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={resetCaptcha}
                onError={resetCaptcha}
                options={{ theme: 'dark' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="fa-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  Acessar Painel
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <Link href="/" className="login-footer-link">
              <ArrowLeft size={16} />
              Voltar ao Portal
            </Link>
            <div className="login-footer-copy">
              TV Russas &copy; {new Date().getFullYear()} — Sistema Editorial
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
