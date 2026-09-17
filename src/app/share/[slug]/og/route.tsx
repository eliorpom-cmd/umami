// byelior fork: Open Graph image of a website share, in the byelior.com style
// (cream background, color halo, Playfair title) tinted with the client's color.
import { ImageResponse } from 'next/og';
import { BRAND, getShareMeta } from '../share-meta';

const SIZE = { width: 1200, height: 630 };

// Google Fonts serves TrueType (which the renderer needs) when no browser user agent is sent.
async function loadFont(family: string, weight: number, text: string) {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
      { next: { revalidate: 604800 } },
    )
  ).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];

  if (!url) throw new Error(`Font not found: ${family}`);

  return (await fetch(url, { next: { revalidate: 604800 } })).arrayBuffer();
}

// Cream text on dark colors, ink text on light ones.
function textColorOn(hex: string) {
  const full = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, c => c + c) : hex;
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.35 ? BRAND.ink : BRAND.cream;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = await getShareMeta(slug);

  const name = meta?.name ?? 'Statistiques';
  const eyebrow = 'STATISTIQUES DU SITE';
  const domain = meta?.domain ?? '';
  const footer = 'Mesure d’audience par Elior · byelior.com';
  const color = meta?.color ?? BRAND.accent;
  const text = textColorOn(color);

  const [playfair, inter, mono] = await Promise.all([
    loadFont('Playfair+Display', 700, name),
    loadFont('Inter', 400, domain + footer),
    loadFont('JetBrains+Mono', 500, eyebrow),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BRAND.cream,
          backgroundImage: `radial-gradient(ellipse 62% 78% at 50% 48%, ${color} 0%, ${color}e6 30%, ${color}80 58%, ${color}00 88%)`,
          color: text,
        }}
      >
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, letterSpacing: 6, opacity: 0.75 }}>
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: 'Playfair Display',
            fontSize: name.length > 18 ? 84 : 112,
            lineHeight: 1.1,
            marginTop: 28,
            maxWidth: 980,
            textAlign: 'center',
          }}
        >
          {name}
        </div>
        {domain && (
          <div style={{ fontFamily: 'Inter', fontSize: 30, marginTop: 24, opacity: 0.85 }}>
            {domain}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            fontFamily: 'Inter',
            fontSize: 22,
            color: BRAND.ink,
            opacity: 0.6,
          }}
        >
          {footer}
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: [
        { name: 'Playfair Display', data: playfair, weight: 700, style: 'normal' },
        { name: 'Inter', data: inter, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: mono, weight: 500, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    },
  );
}
