import { MetadataRoute } from "next";

const locales = ["ko", "ja", "en"];
const baseUrl = "https://rauvfilm.co.kr";

const routes = [
  { path: "", changeFrequency: "monthly" as const, priority: 1 },
  { path: "/portfolio", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/reviews", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/reservation", changeFrequency: "daily" as const, priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/event-snap", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/coalition", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/custom", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/tip", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/reservation-process", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/guidelines", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    for (const locale of locales) {
      const languages: Record<string, string> = {};
      for (const l of locales) {
        languages[l] = `${baseUrl}/${l}${route.path}`;
      }
      languages["x-default"] = `${baseUrl}/ko${route.path}`;

      entries.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages,
        },
      });
    }
  }

  return entries;
}
