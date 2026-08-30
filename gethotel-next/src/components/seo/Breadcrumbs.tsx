import Link from 'next/link';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `https://gethotelstays.com${crumb.item}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <nav aria-label="Breadcrumb" className="py-2.5 px-4 text-xs md:text-sm text-slate-500 bg-slate-50/80 border border-slate-100 rounded-lg mb-6">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((crumb, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={crumb.item} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-400">/</span>}
                {isLast ? (
                  <span className="font-semibold text-slate-900" aria-current="page">
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.item} className="hover:text-brand-500 transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
