/**
 * MediaFallback.tsx
 * Graceful fallback for broken/missing images, videos and PDFs.
 */
import { useState, type ImgHTMLAttributes } from 'react';
import { ImageIcon, Film, FileText } from 'lucide-react';

// ─── Image with fallback ──────────────────────────────────────────────────────

interface FallbackImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export function FallbackImage({
  src,
  alt,
  className,
  fallbackClassName,
  ...rest
}: FallbackImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 ${fallbackClassName ?? className ?? ''}`}
      >
        <ImageIcon size={32} className="text-gray-600" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? ''}
      className={className}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}

// ─── Video with fallback ──────────────────────────────────────────────────────

interface FallbackVideoProps {
  src: string;
  poster?: string;
  className?: string;
  fallbackClassName?: string;
}

export function FallbackVideo({
  src,
  poster,
  className,
  fallbackClassName,
}: FallbackVideoProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 ${fallbackClassName ?? className ?? ''}`}
      >
        <Film size={32} className="text-gray-600" />
      </div>
    );
  }

  return (
    <video
      src={src}
      poster={poster}
      controls
      className={className}
      onError={() => setErrored(true)}
    />
  );
}

// ─── PDF link with fallback ────────────────────────────────────────────────────

interface FallbackPdfLinkProps {
  src: string;
  title: string;
  className?: string;
}

export function FallbackPdfLink({ src, title, className }: FallbackPdfLinkProps) {
  if (!src) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-slate-800 rounded-lg opacity-50 ${className ?? ''}`}>
        <FileText size={32} className="text-gray-600" />
        <div>
          <p className="text-gray-400 font-medium">{title}</p>
          <p className="text-gray-600 text-sm">File not available</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-4 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors ${className ?? ''}`}
    >
      <FileText size={32} className="text-orange-500 flex-shrink-0" />
      <div>
        <h4 className="text-white font-medium">{title}</h4>
        <p className="text-gray-400 text-sm">Click to download</p>
      </div>
    </a>
  );
}
