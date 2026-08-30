export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection({ faqs, title = "Frequently Asked Questions" }: { faqs: FAQItem[]; title?: string }) {
  if (!faqs || faqs.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="mt-10 py-8 border-t border-slate-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className="text-xl font-bold text-slate-900 mb-6">{title}</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-slate-50 rounded-xl p-4 border border-slate-200 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-semibold text-slate-900 hover:text-brand-500 cursor-pointer">
              <span>{faq.question}</span>
              <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
