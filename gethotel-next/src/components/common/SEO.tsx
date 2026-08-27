'use client';
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const SEO = ({ 
  title = 'GetHotel — Book Premium Hotels & Resorts in India',
  description = 'Discover and book the best hotels, resorts, and boutique stays across India. Premium service at guaranteed best rates.',
  keywords = 'hotel booking india, premium hotels, resorts, GetHotelStays'
}: SEOProps) => {
  useEffect(() => {
    // Update Title
    document.title = title;

    // Update Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    // Update Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', keywords);
      document.head.appendChild(metaKeywords);
    }
  }, [title, description, keywords]);

  return null;
};

export default SEO;
