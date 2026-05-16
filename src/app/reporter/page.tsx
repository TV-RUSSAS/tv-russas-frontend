'use client';
import { useState, useRef } from 'react';
import { API_URL } from '@/services/api';
import './reporter-premium.css';

export default function ReporterPage() {
  const [enviado, setEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      if (file) {
        formData.set('foto', file);
      }

      const response = await fetch(`${API_URL}/reporter/enviar`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setEnviado(true);
      } else {
        alert('Ocorreu um erro ao enviar. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.error('Erro no envio:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="reporter-premium-main">
      
      {/* 1. HERO PREMIUM */}
      <section className="reporter-hero">
        <div className="reporter-hero-content">
          <i className="fas fa-bullhorn reporter-hero-icon"></i>
          <h1 className="reporter-hero-title">Você Repórter</h1>
          <p className="reporter-hero-subtitle">
            Envie denúncias, sugestões de pautas, vídeos e fotos de acontecimentos importantes da sua cidade e região.
          </p>
          <div className="hero-stats">
            <div className="stat-badge"><i className="fas fa-shield-alt"></i> Canal Seguro</div>
            <div className="stat-badge"><i className="fas fa-user-secret"></i> Identidade Preservada</div>
            <div className="stat-badge"><i className="fas fa-bolt"></i> Resposta Rápida</div>
          </div>
        </div>
      </section>

      {/* 2. GRID PRINCIPAL */}
      <div className="reporter-grid">
        
        {/* 3. COLUNA DO FORMULÁRIO */}
        <div className="reporter-form-card">
          {!enviado ? (
            <form id="form-noticia" onSubmit={handleSubmit}>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome" className="form-label"><i className="far fa-user"></i> Nome completo</label>
                  <input type="text" id="nome" name="nome" className="premium-input" placeholder="Como devemos te chamar?" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label"><i className="far fa-envelope"></i> E-mail</label>
                  <input type="email" id="email" name="email" className="premium-input" placeholder="Para receber atualizações" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="telefone" className="form-label"><i className="fab fa-whatsapp"></i> WhatsApp ou Telefone</label>
                  <input type="tel" id="telefone" name="telefone" className="premium-input" placeholder="(88) 99999-9999" required />
                </div>
              </div>

              {/* UPLOAD DRAG AND DROP */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label"><i className="fas fa-paperclip"></i> Anexar Mídia (Foto, Vídeo ou PDF)</label>
                <div 
                  className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    id="foto" 
                    name="foto" 
                    className="hidden-file-input" 
                    onChange={handleChange}
                    accept="image/*,video/*,.pdf"
                  />
                  
                  {!file ? (
                    <>
                      <i className="fas fa-cloud-upload-alt upload-icon"></i>
                      <div className="upload-text">Arraste e solte seu arquivo aqui</div>
                      <div className="upload-subtext">ou clique para procurar no seu dispositivo (Max 50MB)</div>
                    </>
                  ) : (
                    <div className="file-preview">
                      <i className="fas fa-file-check"></i>
                      <span>{file.name}</span>
                      <small>({Math.round(file.size / 1024)} KB)</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="informacoes" className="form-label"><i className="far fa-edit"></i> Relato do Acontecimento</label>
                <textarea
                  id="relato"
                  name="relato"
                  className="premium-input premium-textarea"
                  placeholder="Descreva o acontecimento com o máximo de detalhes possível: O que aconteceu? Onde? Quando? Quem estava envolvido?"
                  onChange={handleTextChange}
                  required
                />
                <div className="char-counter">{charCount} caracteres digitados</div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="autorizo" name="autorizo" className="premium-checkbox" defaultChecked required />
                <label htmlFor="autorizo" className="checkbox-label">
                  <strong>Declaro que as informações são verdadeiras</strong> e autorizo a equipe de jornalismo da TV Russas a investigar, editar e publicar este relato de acordo com os critérios editoriais.
                </label>
              </div>

              <button type="submit" className={`btn-submit-premium ${isSubmitting ? 'btn-loading' : ''}`} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><i className="fas fa-spinner"></i> Enviando...</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Enviar Informação Segura</>
                )}
              </button>
            </form>
          ) : (
            <div className="success-banner">
              <i className="fas fa-check-circle"></i>
              <h3>Relato Recebido com Sucesso!</h3>
              <p>Nossa equipe de jornalismo já foi notificada e está analisando sua informação. Entraremos em contato caso precisemos de mais detalhes.</p>
              <button onClick={() => setEnviado(false)} className="btn-submit-premium" style={{ marginTop: '24px', background: '#2e7d32' }}>
                Enviar nova informação
              </button>
            </div>
          )}
        </div>

        {/* 4. SIDEBAR DE CONFIANÇA E DICAS */}
        <aside className="reporter-sidebar">
          
          <div className="sidebar-box">
            <h3 className="sidebar-box-title"><i className="fas fa-shield-check"></i> Compromisso TV Russas</h3>
            <ul className="trust-list">
              <li><i className="fas fa-check-circle"></i> Sua identidade e dados pessoais jamais serão publicados sem autorização expressa.</li>
              <li><i className="fas fa-check-circle"></i> Todo material recebido passa por checagem rigorosa de nossa redação.</li>
              <li><i className="fas fa-check-circle"></i> Você está protegido pela lei de sigilo da fonte jornalística.</li>
            </ul>
          </div>

          <div className="sidebar-box">
            <h3 className="sidebar-box-title"><i className="far fa-lightbulb"></i> O que enviar?</h3>
            <div className="faq-list">
              <div className="faq-item">
                <h4>⚠️ Denúncias</h4>
                <p>Problemas de infraestrutura, buracos, falta de água, iluminação, ou descaso público.</p>
              </div>
              <div className="faq-item">
                <h4>🚔 Ocorrências</h4>
                <p>Acidentes, incêndios, ou movimentação policial na sua rua ou bairro.</p>
              </div>
              <div className="faq-item">
                <h4>🎉 Eventos Locais</h4>
                <p>Ações da comunidade, feiras, esportes amadores e festividades.</p>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </main>
  );
}
