'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type EquipmentImageSliderProps = {
  images: string[];
  alt: string;
  height?: number;
  showThumbs?: boolean;
  badge?: ReactNode;
  className?: string;
};

export default function EquipmentImageSlider({
  images,
  alt,
  height = 240,
  showThumbs = false,
  badge,
  className = '',
}: EquipmentImageSliderProps) {
  const safeImages = images.length > 0 ? images : ['/imgs/jcb1.jpg'];
  const [activeIndex, setActiveIndex] = useState(0);

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % safeImages.length);
  };

  return (
    <div className={`slider-wrap ${className}`}>
      <div className="slider-main" style={{ height }}>
        <Image
          src={safeImages[activeIndex]}
          alt={`${alt} image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="slider-image"
        />

        {badge ? <div className="slider-badge">{badge}</div> : null}

        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              className="slider-nav left"
              onClick={showPrevious}
              aria-label="Show previous equipment image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="slider-nav right"
              onClick={showNext}
              aria-label="Show next equipment image"
            >
              <ChevronRight size={18} />
            </button>
            <div className="slider-dots">
              {safeImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`slider-dot ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show equipment image ${index + 1}`}
                  aria-pressed={index === activeIndex}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {showThumbs && safeImages.length > 1 ? (
        <div className="thumb-strip">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-thumb-${index}`}
              type="button"
              className={`thumb ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Preview equipment image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                sizes="100px"
                className="thumb-image"
              />
            </button>
          ))}
        </div>
      ) : null}

      <style jsx>{`
        .slider-wrap {
          width: 100%;
        }

        .slider-main {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius-lg);
          background: #111;
        }

        .slider-image,
        .thumb-image {
          object-fit: cover;
        }

        .slider-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          z-index: 2;
        }

        .slider-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
        }

        .slider-nav.left {
          left: 0.9rem;
        }

        .slider-nav.right {
          right: 0.9rem;
        }

        .slider-dots {
          position: absolute;
          left: 50%;
          bottom: 0.85rem;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          gap: 0.45rem;
        }

        .slider-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.45);
        }

        .slider-dot.active {
          background: var(--primary);
        }

        .thumb-strip {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .thumb {
          position: relative;
          width: 100px;
          height: 70px;
          overflow: hidden;
          border-radius: var(--radius-sm);
          opacity: 0.65;
          border: 2px solid transparent;
        }

        .thumb.active {
          opacity: 1;
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
