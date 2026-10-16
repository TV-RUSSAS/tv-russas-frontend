"use client";

import { useEffect, useState } from "react";

type BannerItem = { src: string; href?: string; alt?: string };

export default function BannerCarousel({
    banners,
    intervalMs = 5000,
}: {
    banners: BannerItem[];
    intervalMs?: number;
}) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (banners.length < 2) return;
        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % banners.length);
        }, intervalMs);
        return () => clearInterval(timer);
    }, [banners.length, intervalMs]);

    const banner = banners[index];
    if (!banner) return null;

    return (
        <a
            href={banner.href || "#"}
            target={banner.href ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className="premium-ad-container-v2"
            style={{ cursor: banner.href ? "pointer" : "default" }}
        >
            <img
                key={index}
                src={banner.src}
                alt={banner.alt || "Publicidade"}
                style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "140px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    display: "block",
                    animation: "bannerFade 0.6s ease",
                }}
            />
            <style>{`@keyframes bannerFade { from { opacity: 0 } to { opacity: 1 } }`}</style>
        </a>
    );
}