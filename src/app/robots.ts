import { MetadataRoute } from "next";
import { DOMAIN } from "@/utils/domain";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/_next/"],
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${DOMAIN}/sitemap.xml`,
  };
}

