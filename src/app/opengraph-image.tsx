// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

/**
 * Статический OG для шеринга главной страницы.
 *
 * Почему так:
 *  - next/og работает на edge runtime (нет fs, нет JWT) — поэтому только статика
 *  - без кастомного шрифта: system fonts через JSX style (impact: outputs in
 *    edge env's bundled Inter, выглядит ок)
 *  - размер 1200x630 — стандарт для OG-карточек (Telegram/FB/Twitter)
 */

export const runtime = 'edge';
export const alt = 'Go — оживи свой город';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '80px',
          background:
            'linear-gradient(135deg, #1a0b3d 0%, #2d1b69 50%, #4a1d96 100%)',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            G
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, opacity: 0.9 }}>Go</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Оживи свой город
          </div>
          <div style={{ fontSize: 32, opacity: 0.75, maxWidth: 900 }}>
            Социальная карта с вайбом, событиями и AI-рекомендациями
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            fontSize: 22,
            opacity: 0.6,
          }}
        >
          <span>realitymap.kz</span>
        </div>
      </div>
    ),
    size,
  );
}
