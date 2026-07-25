import { memo } from "react";

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}]/gu;

const getAppleEmojiUrl = (emoji: string) => {
  const codePoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16));
  const hex = codePoints.filter(h => h !== 'fe0f').join("-");
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${hex}.png`;
};

function renderEmoji(text: string) {
  const parts = text.split(emojiRegex);
  const emojis = text.match(emojiRegex) || [];
  return parts.reduce((acc: any[], part, i) => {
    if (part) acc.push(part);
    if (emojis[i]) {
      acc.push(
        <img key={`e-${i}`} src={getAppleEmojiUrl(emojis[i])} alt={emojis[i]}
          className="inline-block w-4.5 h-4.5 align-text-top mx-0.5 object-contain select-none"
          onError={(e) => { (e.target as HTMLElement).outerHTML = emojis[i]; }}
        />
      );
    }
    return acc;
  }, []);
}

function parseMarkdownText(text: string, idx: number | string): any {
  // Bold: **text**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  if (boldParts.length > 1) {
    return boldParts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`b-${idx}-${i}`} className="font-bold">{renderEmoji(part.slice(2, -2))}</strong>;
      }
      return parseInlineLinks(part, `${idx}-${i}`);
    });
  }
  return parseInlineLinks(text, idx);
}

function parseInlineLinks(text: string, idx: string | number): any {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: any[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderEmoji(text.slice(lastIndex, match.index)));
    }
    const [_, linkText, linkUrl] = match;
    parts.push(
      <a key={`l-${idx}-${key++}`} href={linkUrl} target="_blank" rel="noopener noreferrer"
        className="text-brand-500 hover:text-brand-600 underline transition"
      >
        {renderEmoji(linkText)}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(renderEmoji(text.slice(lastIndex)));
  }
  return parts.length > 1 ? parts : (parts[0] || renderEmoji(text));
}

const MarkdownRenderer = memo(function MarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;

  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Headers (# ## ###)
        if (/^#{1,3}\s/.test(trimmed)) {
          const level = trimmed.match(/^(#{1,3})\s/)?.[1].length || 1;
          const content = trimmed.replace(/^#{1,3}\s/, '');
          const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';
          const cls = level === 1 ? 'text-lg font-extrabold mt-4 mb-2' : level === 2 ? 'text-base font-bold mt-3 mb-1.5' : 'text-sm font-semibold mt-2 mb-1';
          return <Tag key={pIdx} className={cls}>{parseMarkdownText(content, `h-${pIdx}`)}</Tag>;
        }

        // Unordered list (lines starting with * or -)
        if (/^\s*[*\-]\s/.test(trimmed)) {
          const items = trimmed.split(/\n/).filter(l => /^\s*[*\-]\s/.test(l.trim()));
          return (
            <ul key={pIdx} className="list-disc pl-5 my-1.5 space-y-0.5">
              {items.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed">{parseMarkdownText(item.replace(/^\s*[*\-]\s/, ''), `li-${pIdx}-${i}`)}</li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (/^\s*\d+[.)]\s/.test(trimmed)) {
          const items = trimmed.split(/\n/).filter(l => /^\s*\d+[.)]\s/.test(l.trim()));
          return (
            <ol key={pIdx} className="list-decimal pl-5 my-1.5 space-y-0.5">
              {items.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed">{parseMarkdownText(item.replace(/^\s*\d+[.)]\s/, ''), `oi-${pIdx}-${i}`)}</li>
              ))}
            </ol>
          );
        }

        // Single line (paragraph) with line breaks
        const lines = trimmed.split(/\n/).filter(Boolean);
        if (lines.length === 1) {
          return <p key={pIdx} className="text-sm leading-relaxed my-1">{parseMarkdownText(trimmed, `p-${pIdx}`)}</p>;
        }

        return (
          <div key={pIdx} className="my-1">
            {lines.map((line, lIdx) => (
              <p key={lIdx} className="text-sm leading-relaxed">{parseMarkdownText(line, `l-${pIdx}-${lIdx}`)}</p>
            ))}
          </div>
        );
      })}
    </>
  );
});

export default MarkdownRenderer;
