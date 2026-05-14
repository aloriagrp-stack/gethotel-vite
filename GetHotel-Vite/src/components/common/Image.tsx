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

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ ...style, ...props.style }}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
};

export default Image;



