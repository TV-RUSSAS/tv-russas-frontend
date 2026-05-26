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
            <div className="loading-state" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              {"Carregando colunistas..."}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
