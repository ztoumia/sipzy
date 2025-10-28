import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sipzy.coffee";

  const staticPages = [
    "",
    "/coffees",
    "/auth/login",
    "/auth/register",
    "/terms",
    "/privacy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" || route === "/coffees" ? ("daily" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route === "/coffees" ? 0.9 : 0.5,
  }));

  return [...staticPages];
}
