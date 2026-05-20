import { MetadataRoute } from "next";
import { DOMAIN } from "@/utils/domain";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/_next/"],
    },
    sitemap: `${DOMAIN}/sitemap.xml`,
  };
}

