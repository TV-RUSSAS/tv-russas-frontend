import Link from "next/link";
import { Noticia } from "@/types";

interface TrendingWidgetProps {
  items: Noticia[];
  title: string;
}

export default function TrendingWidget({ items, title }: TrendingWidgetProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="sidebar-widget">
      <h3 className="widget-title">{title}</h3>
      <div className="trending-list">
        {items.map((n, idx) => (
          <Link
            key={`${title.toLowerCase().replace(/\s+/g, "-")}-${n.slug}`}
            href={`/noticia/${n.slug}`}
            className="trending-item"
          >
            <span className="trending-number">{idx + 1}</span>
            <div className="trending-content">
              <span className="trending-tag">{n.categoria.nome}</span>
              <h4 className="trending-title">{n.titulo}</h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
