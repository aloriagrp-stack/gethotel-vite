import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
  className?: string;
}

const optimizeUnsplashUrl = (url: string, width?: number | string, priority?: boolean) => {
  if (!url || !url.includes('images.unsplash.com')) return url;

  try {
    // Basic fast string replacement or URL parsing
    const urlObj = new URL(url);
    urlObj.searchParams.set('auto', 'format');
    urlObj.searchParams.set('fit', 'crop');
    urlObj.searchParams.set('q', priority ? '75' : '60');
    
    if (width && !isNaN(Number(width))) {
      urlObj.searchParams.set('w', String(width));
    } else {
      urlObj.searchParams.set('w', priority ? '1200' : '600');
    }
    
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

const Image = ({ src, alt, width, height, fill, priority, unoptimized, className, ...props }: ImageProps) => {
  // Simple shim for next/image
  const style: React.CSSProperties = fill ? {
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    objectFit: 'cover',
  } : {};

  const optimizedSrc = unoptimized ? src : optimizeUnsplashUrl(src, width, priority);

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ ...style, ...props.style }}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
};

export default Image;



