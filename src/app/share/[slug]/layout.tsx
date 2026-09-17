import type { Metadata } from 'next';
import { ShareProvider } from '@/app/share/ShareProvider';
import { getShareMeta } from './share-meta';

export default async function ({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;

  return <ShareProvider slug={slug}>{children}</ShareProvider>;
}

// byelior fork: link preview (title, description, image) for website shares.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getShareMeta(slug).catch(() => null);

  if (!meta) return {};

  const title = `Statistiques · ${meta.name}`;
  const description = `Fréquentation de ${meta.domain ?? meta.name} : visiteurs, pages vues, provenance.`;
  const image = { url: `/share/${slug}/og`, width: 1200, height: 630, alt: title };

  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: 'website', images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}
