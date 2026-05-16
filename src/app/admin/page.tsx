"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/services/api';

interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  views: number;
  categoria: { nome: string };
  publicadoEm: string;
}

export default function AdminDashboard() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/noticias`)
      .then(res => res.json())
      .then(data => {
        setNoticias(data);
        setLoading(false);
      });
  }, []);

  const totalViews = noticias.reduce((acc, curr) => acc + (curr.views || 0), 0);

  return (
    <div className="admin-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Dashboard Administrativo - TV Russas</h1>
        <Link href="/" style={{ textDecoration: 'none', color: '#ff5722', fontWeight: '600' }}>← Voltar ao Portal</Link>
      </header>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
          <span style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Total de Notícias</span>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0' }}>{noticias.length}</p>
        </div>
        <div className="stat-card" style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
          <span style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Visualizações Reais</span>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0', color: '#ff5722' }}>{totalViews}</p>
        </div>
        <div className="stat-card" style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
          <span style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Média de Acessos/Post</span>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0' }}>
            {noticias.length > 0 ? (totalViews / noticias.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      <div className="news-management" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Gerenciamento de Notícias</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fcfcfc', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '15px 20px', fontSize: '13px', color: '#666' }}>Título</th>
              <th style={{ padding: '15px 20px', fontSize: '13px', color: '#666' }}>Categoria</th>
              <th style={{ padding: '15px 20px', fontSize: '13px', color: '#666' }}>Publicação</th>
              <th style={{ padding: '15px 20px', fontSize: '13px', color: '#666', textAlign: 'right' }}>Views</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>Carregando dados...</td></tr>
            ) : noticias.map((n) => (
              <tr key={n.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '15px 20px', fontSize: '14px', fontWeight: '500' }}>{n.titulo}</td>
                <td style={{ padding: '15px 20px', fontSize: '14px' }}><span style={{ background: '#eee', padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}>{n.categoria.nome}</span></td>
                <td style={{ padding: '15px 20px', fontSize: '13px', color: '#888' }}>{new Date(n.publicadoEm).toLocaleDateString()}</td>
                <td style={{ padding: '15px 20px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', color: '#ff5722' }}>{n.views || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
