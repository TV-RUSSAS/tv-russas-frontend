'use client';
import { useState } from 'react';
import '../reporter/reporter-premium.css';

export default function ContatoPage() {
  const [enviado, setEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      assunto: formData.get('assunto'),
      mensagem: formData.get('mensagem')
    };

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

    try {
      const response = await fetch(`${API_BASE_URL}/api/contato`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      setEnviado(true);
    } catch (error) {
      console.error(error);
      alert('Houve um erro ao enviar sua mensagem. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="reporter-premium-main">
      
      {/* 1. HERO PREMIUM */}
      <section className="reporter-hero">
        <div className="reporter-hero-content">
          <i className="fas fa-envelope reporter-hero-icon"></i>
          <h1 className="reporter-hero-title">Fale Conosco</h1>
          <p className="reporter-hero-subtitle">
            Tem dúvidas, sugestões comerciais ou parcerias? Entre em contato com a equipe da TV Russas.
          </p>
          <div className="hero-stats">
            <div className="stat-badge"><i className="fas fa-headset"></i> Atendimento Rápido</div>
            <div className="stat-badge"><i className="fas fa-handshake"></i> Oportunidades</div>
          </div>
        </div>
      </section>

      {/* 2. GRID PRINCIPAL */}
      <div className="reporter-grid">
        
        {/* 3. COLUNA DO FORMULÁRIO */}
        <div className="reporter-form-card">
          {!enviado ? (
            <form id="form-contato" onSubmit={handleSubmit}>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome" className="form-label"><i className="far fa-user"></i> Nome Completo</label>
                  <input type="text" id="nome" name="nome" className="premium-input" placeholder="Seu nome" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label"><i className="far fa-envelope"></i> E-mail</label>
                  <input type="email" id="email" name="email" className="premium-input" placeholder="seu@email.com" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="assunto" className="form-label"><i className="fas fa-tag"></i> Assunto</label>
                  <select id="assunto" name="assunto" className="premium-input" required>
                    <option value="">Selecione o motivo do contato</option>
                    <option value="Dúvida Geral">Dúvida Geral</option>
                    <option value="Comercial / Publicidade">Comercial / Publicidade</option>
                    <option value="Parcerias">Parcerias</option>
                    <option value="Reclamação / Suporte">Reclamação / Suporte</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mensagem" className="form-label"><i className="far fa-edit"></i> Mensagem</label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  className="premium-input premium-textarea"
                  placeholder="Escreva sua mensagem detalhada aqui..."
                  required
                />
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="autorizo" name="autorizo" className="premium-checkbox" defaultChecked required />
                <label htmlFor="autorizo" className="checkbox-label">
                  <strong>Declaro estar ciente</strong> de que meus dados serão processados conforme a Política de Privacidade para fins de retorno do contato.
                </label>
              </div>

              <button type="submit" className={`btn-submit-premium ${isSubmitting ? 'btn-loading' : ''}`} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><i className="fas fa-spinner"></i> Enviando...</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Enviar Mensagem</>
                )}
              </button>
            </form>
          ) : (
            <div className="success-banner">
              <i className="fas fa-check-circle"></i>
              <h3>Mensagem enviada com sucesso!</h3>
              <p>Recebemos o seu contato. A equipe da TV Russas responderá através do e-mail fornecido o mais breve possível.</p>
              <button onClick={() => setEnviado(false)} className="btn-submit-premium" style={{ marginTop: '24px', background: '#2e7d32' }}>
                Enviar nova mensagem
              </button>
            </div>
          )}
        </div>

        {/* 4. SIDEBAR */}
        <aside className="reporter-sidebar">
          
          <div className="sidebar-box">
            <h3 className="sidebar-box-title"><i className="fas fa-building"></i> Nossa Sede</h3>
            <ul className="trust-list">
              <li><i className="fas fa-map-marker-alt"></i> Russas, Ceará, Brasil</li>
              <li><i className="fas fa-envelope"></i> contato@tvrussas.com.br</li>
              <li><i className="fab fa-whatsapp"></i> (88) 99692-5964</li>
            </ul>
          </div>

          <div className="sidebar-box">
            <h3 className="sidebar-box-title"><i className="fas fa-info-circle"></i> Orientações</h3>
            <div className="faq-list">
              <div className="faq-item">
                <h4>🗞️ Para enviar notícias</h4>
                <p>Se você tem fotos, vídeos ou relatos de acontecimentos na cidade, utilize o nosso canal exclusivo <strong>Você Repórter</strong> para garantir o processamento ágil pela redação.</p>
              </div>
              <div className="faq-item">
                <h4>✅ Para correções</h4>
                <p>Identificou um erro factual em uma matéria? Acesse a página <strong>Correções e Atualizações</strong> no rodapé do site.</p>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </main>
  );
}
