import Link from "next/link";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow text-bronze">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-5xl font-bold md:text-6xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl font-display text-lg text-ivory-400">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-solid self-start md:self-auto">
          {action.label}
        </Link>
      )}
    </header>
  );
}

const SAVED_MESSAGES: Record<string, string> = {
  created: "Created — it is live on the public site now.",
  updated: "Changes saved.",
  deleted: "Deleted.",
};

export function SavedNotice({ saved }: { saved?: string }) {
  if (!saved || !SAVED_MESSAGES[saved]) return null;
  return (
    <p role="status" className="mb-8 border border-bronze/40 bg-bronze/10 px-5 py-4 font-sans text-sm text-bronze-300">
      {SAVED_MESSAGES[saved]}
    </p>
  );
}
