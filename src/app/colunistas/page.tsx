import Image from "next/image";
import Link from "next/link";
import "./colunistas.css";
import { apiService } from "@/services/api";
import { Colunista } from "@/types";
import { getImagePath } from "@/utils/imagePath";
import { TEXTS } from "@/constants/texts";

export const metadata = {
  title: "Colunistas - TV Russas",
  description: "Conheça os colunistas da TV Russas e acompanhe seus artigos.",
};

export const dynamic = 'force-dynamic';

export default async function ColunistasPage() {
  const colunistas = await apiService.getColunistas();

  return (
    <main className="colunistas-container">
      <div className="editorial-box">
        <div className="editorial-title-bar">
          <h1>{TEXTS.navigation.columnists.toUpperCase()}</h1>
        </div>

        <div className="colunistas-list">
          {colunistas.length > 0 ? (
            colunistas.map((col: Colunista) => (
              <Link key={col.id} href={`/colunistas/${col.id}`} className="colunista-row">
                <div className="colunista-photo-circle">
                  <Image
                    src={getImagePath(col.fotoUrl)}
                    alt={col.nome}
                    fill
                    sizes="85px"
                    className="colunista-img"
                  />
                </div>

                <div className="colunista-text-content">
                  <span className="colunista-name-label">{col.nome}</span>
                  <p className="colunista-bio-text">{col.bio}</p>
                </div>
                
                <div className="view-profile-btn">
                  {"Ver perfil completo"}
                </div>
              </Link>
            ))
          ) : (
            <div className="colunistas-empty" style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              color: 'var(--c-secondary, #666)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.01)',
              margin: '20px 0'
            }}>
              <span style={{ fontSize: '40px' }}>✍️</span>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--c-text, #fff)', margin: 0 }}>
                {TEXTS.common.noColumnists}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.8, maxWidth: '440px', margin: '0 auto', lineHeight: '1.5' }}>
                {TEXTS.common.noColumnistsSub}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
