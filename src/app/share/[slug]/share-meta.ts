// byelior fork: data behind the link preview (title + Open Graph image) of a website share.
import { cache } from 'react';
import { ENTITY_TYPE } from '@/lib/constants';
import { getShareByCode, getWebsite } from '@/queries/prisma';

// byelior.com palette
export const BRAND = {
  cream: '#F6F1E7',
  ink: '#111111',
  accent: '#305DDE',
};

export interface ShareMeta {
  name: string;
  domain: string | null;
  color: string;
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}){1,2}$/i;

// The client's brand color, read from the <meta name="theme-color"> of its homepage.
async function getSiteColor(domain: string | null): Promise<string> {
  if (!domain) return BRAND.accent;

  try {
    const res = await fetch(`https://${domain}/`, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 86400 },
    });
    const html = await res.text();
    const tag = html.match(/<meta[^>]+name=["']theme-color["'][^>]*>/i)?.[0];
    const color = tag?.match(/content=["']([^"']+)["']/i)?.[1]?.trim();

    return color && HEX_COLOR.test(color) ? color : BRAND.accent;
  } catch {
    return BRAND.accent;
  }
}

export const getShareMeta = cache(async (slug: string): Promise<ShareMeta | null> => {
  const share = await getShareByCode(slug);

  if (share?.shareType !== ENTITY_TYPE.website) return null;

  const website = await getWebsite(share.entityId);

  if (!website) return null;

  return {
    name: website.name,
    domain: website.domain,
    color: await getSiteColor(website.domain),
  };
});
