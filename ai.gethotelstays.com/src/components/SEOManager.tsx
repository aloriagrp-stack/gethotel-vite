import React, { useEffect } from 'react';

interface SEOManagerProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  isPrivateChat?: boolean;
}

export const SEOManager: React.FC<SEOManagerProps> = ({
  title = "ChatGHS — Premium AI Travel Concierge & Instant Hotel Booking",
  description = "Discover, compare, and instantly reserve verified luxury hotels, 3hr/6hr/12hr micro-stays, and custom Indian tour itineraries using ChatGHS AI travel companion.",
  keywords = "GetHotelStays, ChatGHS, book hotels India, hourly stays India, micro stays, Jaipur hotels, Goa resorts, AI travel assistant, instant hotel booking, custom itineraries India",
  canonicalUrl = "https://ai.gethotelstays.com/",
  isPrivateChat = false
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Update Meta Tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', isPrivateChat ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', canonicalUrl, true);
    
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);

    // 3. Update Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Inject Dynamic FAQ & Breadcrumb JSON-LD Schema
    const faqSchemaId = 'seo-faq-jsonld';
    let faqScript = document.getElementById(faqSchemaId) as HTMLScriptElement;
    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.id = faqSchemaId;
      faqScript.type = 'application/ld+json';
      document.head.appendChild(faqScript);
    }

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I book hotels using ChatGHS AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simply type your destination (e.g., 'Hotels in Jaipur' or 'Stays in Goa') in the ChatGHS AI composer. The AI will instantly search real-time database inventory, show visual hotel & room cards, and allow you to reserve with a 12% deposit or pay at hotel."
          }
        },
        {
          "@type": "Question",
          "name": "Can I book hourly stays (micro-stays) in India on GetHotelStays?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! GetHotelStays offers flexible 3-hour, 6-hour, and 12-hour hourly micro-stays across major Indian cities for transit travelers, business professionals, and couples."
          }
        },
        {
          "@type": "Question",
          "name": "Is my payment safe on GetHotelStays?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, GetHotelStays uses PCI-DSS compliant tokenized Razorpay checkout and instant UPI Intent flow. Raw payment details are never processed or stored by the AI model."
          }
        },
        {
          "@type": "Question",
          "name": "Does ChatGHS generate custom India holiday tour itineraries?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, ChatGHS builds mathematical, conflict-free tour packages for Golden Triangle, Rajasthan, Himachal, Goa, and Kerala with chronological timelines and budget breakdowns."
          }
        }
      ]
    };

    faqScript.textContent = JSON.stringify(faqSchema);
  }, [title, description, keywords, canonicalUrl, isPrivateChat]);

  return null;
};
