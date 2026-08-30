import Link from 'next/link';

export interface HubLink {
  label: string;
  href: string;
  badge?: string;
}

export function InterlinkingHub({
  city = "Delhi",
  links,
}: {
  city?: string;
  links: HubLink[];
}) {
  if (!links || links.length === 0) return null;

  return (
    <section className="mt-12 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        Explore Popular Stays & Categories in {city}
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        Find verified budget accommodations, luxury suites, transit stays, and couple-friendly hotels with instant confirmation.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-sm font-medium text-slate-700 hover:text-blue-700 transition-all"
          >
            <span>{link.label}</span>
            {link.badge && (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                {link.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
