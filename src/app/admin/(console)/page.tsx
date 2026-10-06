import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDashboard } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusDot } from "@/components/admin/AdminTable";
import { RESOURCE_TYPE_LABEL } from "@/lib/constants";
import { formatDate, pad } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();
  const { counts, recentResources, recentPyqs } = await getDashboard(supabase);

  const stats = [
    { label: "Total resources", value: counts.resources, href: "/admin/resources" },
    { label: "Total PYQs", value: counts.pyqs, href: "/admin/pyqs" },
    { label: "Total chapters", value: counts.chapters, href: "/admin/chapters" },
    { label: "Total subjects", value: counts.subjects, href: "/admin/subjects" },
    { label: "Academic sections", value: counts.sections, href: "/admin/sections" },
  ];

  return (
    <>
      <AdminPageHeader eyebrow="Overview" title="Dashboard" description="The state of the archive, at a glance." />

      <dl className="grid grid-cols-2 border-l border-t border-line md:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group border-b border-r border-line p-6 transition-colors hover:bg-ivory/[0.02] md:p-8">
            <dt className="font-sans text-sm text-ivory-500">{s.label}</dt>
            <dd className="mt-4 font-display text-6xl font-bold tabular transition-colors group-hover:text-bronze-300">{pad(s.value)}</dd>
          </Link>
        ))}
      </dl>

      <section aria-labelledby="quick-actions" className="mt-14">
        <h2 id="quick-actions" className="eyebrow mb-5">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/resources/new" className="btn-solid">
            + Add resource
          </Link>
          <Link href="/admin/pyqs/new" className="btn-luxe">
            + Add PYQ
          </Link>
          <Link href="/admin/chapters/new" className="btn-luxe">
            + Add chapter
          </Link>
        </div>
      </section>

      <div className="mt-16 grid gap-14 xl:grid-cols-2">
        <section aria-labelledby="recent-resources">
          <h2 id="recent-resources" className="eyebrow mb-5">
            Recently added · resources
          </h2>
          {recentResources.length === 0 ? (
            <p className="border-t border-line py-6 font-display text-lg text-ivory-500">No resources yet — add the first one.</p>
          ) : (
            <ul className="border-t border-line">
              {recentResources.map((r) => (
                <li key={r.id} className="border-b border-line">
                  <Link href={`/admin/resources/${r.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-bronze-300">
                    <span className="min-w-0">
                      <span className="block truncate font-sans text-sm">
                        {r.label ? `${r.label} — ` : ""}
                        {r.title}
                      </span>
                      <span className="font-sans text-sm text-ivory-500">
                        {RESOURCE_TYPE_LABEL[r.resource_type]} · {formatDate(r.created_at)}
                      </span>
                    </span>
                    <StatusDot on={r.is_published} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="recent-pyqs">
          <h2 id="recent-pyqs" className="eyebrow mb-5">
            Recently added · PYQs
          </h2>
          {recentPyqs.length === 0 ? (
            <p className="border-t border-line py-6 font-display text-lg text-ivory-500">No questions yet — add the first one.</p>
          ) : (
            <ul className="border-t border-line">
              {recentPyqs.map((q) => (
                <li key={q.id} className="border-b border-line">
                  <Link href={`/admin/pyqs/${q.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-bronze-300">
                    <span className="min-w-0">
                      <span className="block truncate font-sans text-sm">
                        {q.year} · {q.exam}
                        {q.question_number ? ` · Q${q.question_number}` : ""}
                        {q.topic ? ` — ${q.topic}` : ""}
                      </span>
                      <span className="font-sans text-sm text-ivory-500">{formatDate(q.created_at)}</span>
                    </span>
                    <StatusDot on={q.is_published} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
