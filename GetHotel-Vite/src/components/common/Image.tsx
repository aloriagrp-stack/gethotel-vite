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
  const [loaded, setLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    // Reset loaded state on src change
    setLoaded(false);
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [src]);

  // Wrapper positioning style
  const wrapperStyle: React.CSSProperties = fill ? {
    position: 'relative',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  } : {
    position: 'relative',
    display: 'inline-block',
    width: width || 'auto',
    height: height || 'auto',
    overflow: 'hidden',
  };

  // Image absolute or layout-specific styling
  const imgStyle: React.CSSProperties = fill ? {
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    objectFit: 'cover',
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.4s ease-in-out',
  } : {
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.4s ease-in-out',
  };

  const optimizedSrc = unoptimized ? src : optimizeUnsplashUrl(src, width, priority);

  return (
    <div style={wrapperStyle} className={className}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gh-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gh-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.96); }
          50% { opacity: 0.75; transform: scale(1.04); }
        }
        .gh-shimmer-bg {
          animation: gh-shimmer 2.2s infinite ease-in-out;
        }
        .gh-logo-pulse {
          animation: gh-pulse 1.8s ease-in-out infinite;
        }
      `}} />

      {!loaded && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {/* Shimmer Effect */}
          <div 
            className="gh-shimmer-bg" 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            }}
          />
          {/* Pulsing Faded Brand Text */}
          <span 
            className="gh-logo-pulse" 
            style={{
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: '#cbd5e1',
              userSelect: 'none',
              fontFamily: 'sans-serif',
            }}
          >
            GetHotelStays<span style={{ color: '#2563eb' }}>.</span>
          </span>
        </div>
      )}

      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ ...imgStyle, ...props.style }}
        onLoad={() => setLoaded(true)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />
    </div>
  );
};

export default Image;



