import type { MetadataRoute } from "next";
import { getPyqs, getSections, getSubjects } from "@/lib/data/public";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, subjects, pyqs] = await Promise.all([getSections(), getSubjects(), getPyqs({}, 5000)]);
  const now = new Date();
  const page = (path: string, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  });
  return [
    page("/", 1),
    page("/archive", 0.9),
    page("/pyqs", 0.9),
    page("/pyqs/practice", 0.6),
    page("/tools", 0.5),
    page("/tools/pomodoro", 0.5),
    ...sections.map((s) => page(`/archive/${s.slug}`, 0.8)),
    ...subjects.map((s) => page(`/subjects/${s.slug}`, 0.7)),
    ...sections.flatMap((sec) => subjects.map((sub) => page(`/archive/${sec.slug}/${sub.slug}`, 0.7))),
    ...pyqs.map((q) => page(`/pyqs/${q.id}`, 0.5)),
  ];
}
