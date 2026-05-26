'use client';
import { useState, useRef } from 'react';
import { API_URL } from '@/services/api';
import './reporter-premium.css';
import { TEXTS } from '@/constants/texts';

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
          <h1 className="reporter-hero-title">{TEXTS.reporter.heroTitle}</h1>
          <p className="reporter-hero-subtitle">
            {TEXTS.reporter.heroSubtitle}
          </p>
          <div className="hero-stats">
            <div className="stat-badge"><i className="fas fa-shield-alt"></i> {TEXTS.reporter.secureChannel}</div>
            <div className="stat-badge"><i className="fas fa-user-secret"></i> {TEXTS.reporter.identityPreserved}</div>
            <div className="stat-badge"><i className="fas fa-bolt"></i> {TEXTS.reporter.fastResponse}</div>
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
                  <label htmlFor="nome" className="form-label"><i className="far fa-user"></i> {TEXTS.reporter.fullName}</label>
                  <input type="text" id="nome" name="nome" className="premium-input" placeholder={TEXTS.reporter.fullNamePlaceholder} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label"><i className="far fa-envelope"></i> {"E-mail"}</label>
                  <input type="email" id="email" name="email" className="premium-input" placeholder={TEXTS.reporter.emailPlaceholder} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="telefone" className="form-label"><i className="fab fa-whatsapp"></i> {TEXTS.reporter.whatsappPhone}</label>
                  <input type="tel" id="telefone" name="telefone" className="premium-input" placeholder="(88) 99999-9999" required />
                </div>
              </div>

              {/* UPLOAD DRAG AND DROP */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label"><i className="fas fa-paperclip"></i> {TEXTS.reporter.attachMedia}</label>
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
                      <div className="upload-text">{TEXTS.reporter.dragDropHere}</div>
                      <div className="upload-subtext">{TEXTS.reporter.clickBrowseDevice}</div>
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
                <label htmlFor="informacoes" className="form-label"><i className="far fa-edit"></i> {TEXTS.reporter.eventReport}</label>
                <textarea
                  id="relato"
                  name="relato"
                  className="premium-input premium-textarea"
                  placeholder={TEXTS.reporter.eventReportPlaceholder}
                  onChange={handleTextChange}
                  required
                />
                <div className="char-counter">{charCount} {TEXTS.reporter.charCounter}</div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="autorizo" name="autorizo" className="premium-checkbox" defaultChecked required />
                <label htmlFor="autorizo" className="checkbox-label">
                  <strong>{TEXTS.reporter.truthDeclaration}</strong>{TEXTS.reporter.truthDeclarationSub}
                </label>
              </div>

              <button type="submit" className={`btn-submit-premium ${isSubmitting ? 'btn-loading' : ''}`} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><i className="fas fa-spinner"></i> {TEXTS.reporter.sending}</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> {TEXTS.reporter.sendSecureInfo}</>
                )}
              </button>
            </form>
          ) : (
            <div className="success-banner">
              <i className="fas fa-check-circle"></i>
              <h3>{TEXTS.reporter.receivedSuccess}</h3>
              <p>{TEXTS.reporter.receivedSuccessSub}</p>
              <button onClick={() => setEnviado(false)} className="btn-submit-premium" style={{ marginTop: '24px', background: '#2e7d32' }}>
                {TEXTS.reporter.sendNewInfo}
              </button>
            </div>
          )}
        </div>

        {/* 4. SIDEBAR DE CONFIANÇA E DICAS */}
        <aside className="reporter-sidebar">
          
          <div className="sidebar-box">
            <h3 className="sidebar-box-title"><i className="fas fa-shield-check"></i> {TEXTS.reporter.commitmentTitle}</h3>
            <ul className="trust-list">
              <li><i className="fas fa-check-circle"></i> {TEXTS.reporter.commitmentItem1}</li>
              <li><i className="fas fa-check-circle"></i> {TEXTS.reporter.commitmentItem2}</li>
              <li><i className="fas fa-check-circle"></i> {TEXTS.reporter.commitmentItem3}</li>
            </ul>
          </div>

          <div className="sidebar-box">
            <h3 className="sidebar-box-title"><i className="far fa-lightbulb"></i> {TEXTS.reporter.whatToSend}</h3>
            <div className="faq-list">
              <div className="faq-item">
                <h4>⚠️ {TEXTS.reporter.faqDenuncias}</h4>
                <p>{TEXTS.reporter.faqDenunciasDesc}</p>
              </div>
              <div className="faq-item">
                <h4>🚔 {TEXTS.reporter.faqOcorrencias}</h4>
                <p>{TEXTS.reporter.faqOcorrenciasDesc}</p>
              </div>
              <div className="faq-item">
                <h4>🎉 {TEXTS.reporter.faqEventos}</h4>
                <p>{TEXTS.reporter.faqEventosDesc}</p>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </main>
  );
}
