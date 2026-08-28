'use client';

import React, { useState } from "react";

// Known direct Apple Emoji CDN mapping for ultra-fast load
const DIRECT_APPLE_EMOJIS: Record<string, string> = {
    "🇮🇩": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1ee-1f1e9.png",
    "🌴": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f334.png",
    "🇮🇳": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1ee-1f1f3.png",
    "🏰": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3f0.png",
    "🏔️": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3d4-fe0f.png",
    "🏔": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3d4-fe0f.png",
    "🛶": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f6f6.png",
    "🌲": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f332.png",
    "⛵": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/26f5.png",
    "🌊": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f30a.png",
    "✈️": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/2708-fe0f.png",
    "✈": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/2708-fe0f.png",
    "✨": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/2728.png",
    "🔥": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f525.png",
    "⭐": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/2b50.png",
    "🌟": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f31f.png",
    "🇦🇪": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e6-1f1ea.png",
    "🇹🇭": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1f9-1f1ed.png",
    "🇸🇬": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1f8-1f1ec.png",
    "🇲🇻": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1f2-1f1fb.png",
    "🇫🇷": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1eb-1f1f7.png",
    "🇬🇧": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1ec-1f1e7.png",
    "🇨🇭": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e8-1f1ed.png",
    "🇯🇵": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1ef-1f1f5.png",
    "🇻🇳": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1fb-1f1f3.png",
    "🇲🇾": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1f2-1f1fe.png",
};

export function getAppleEmojiUrl(emoji: string): string {
    if (!emoji) return "";
    if (emoji.startsWith("http://") || emoji.startsWith("https://")) return emoji;
    const clean = emoji.trim();
    if (DIRECT_APPLE_EMOJIS[clean]) return DIRECT_APPLE_EMOJIS[clean];

    // Fallback: Compute hex codepoints
    try {
        const codePoints: string[] = [];
        for (let i = 0; i < clean.length; i++) {
            const codePoint = clean.codePointAt(i);
            if (codePoint !== undefined) {
                codePoints.push(codePoint.toString(16).toLowerCase());
                if (codePoint > 0xffff) i++;
            }
        }
        const hex = codePoints.join("-");
        return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${hex}.png`;
    } catch {
        return "";
    }
}

interface AppleEmojiProps {
    emoji: string;
    className?: string;
    alt?: string;
}

export default function AppleEmoji({ emoji, className = "w-5 h-5 inline-block align-middle", alt }: AppleEmojiProps) {
    const [hasError, setHasError] = useState(false);
    const url = getAppleEmojiUrl(emoji);

    if (!url || hasError) {
        return <span className="inline-block select-none">{emoji}</span>;
    }

    return (
        <img
            src={url}
            alt={alt || emoji}
            onError={() => setHasError(true)}
            className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`}
            loading="lazy"
            decoding="async"
        />
    );
}
