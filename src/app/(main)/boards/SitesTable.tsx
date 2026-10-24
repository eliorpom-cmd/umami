'use client';
import { Box, Column, Row, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { useMessages, useWebsiteMetricsQuery } from '@/components/hooks';
import { useWebsitePageviewsQuery } from '@/components/hooks/queries/useWebsitePageviewsQuery';
import { useWebsiteStatsQuery } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { formatLongNumber } from '@/lib/format';
import { Sparkline } from './SiteSummary';

// byelior: one board card listing several sites as a table (one row per site)
export interface SitesTableSite {
  id: string;
  name: string;
  note?: string;
}

const GRID = 'minmax(150px, 1.1fr) 100px 100px 120px minmax(200px, 2fr) minmax(180px, 1.6fr)';

export function SitesTable({
  sites = [],
  limit = 3,
}: {
  sites?: SitesTableSite[];
  limit?: number;
}) {
  const { t, labels } = useMessages();
  const headers = [
    t(labels.website),
    t(labels.visitors),
    t(labels.visits),
    '',
    t(labels.pages),
    t(labels.referrers),
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: GRID, minWidth: 900 }}>
        {headers.map((label, i) => (
          <Cell key={i} header>
            <Text size="sm" color="muted" weight="bold">
              {label}
            </Text>
          </Cell>
        ))}
        {sites.map(site => (
          <SiteRow key={site.id} site={site} limit={limit} />
        ))}
      </div>
    </div>
  );
}

function SiteRow({ site, limit }: { site: SitesTableSite; limit: number }) {
  const stats = useWebsiteStatsQuery({ websiteId: site.id });
  const series = useWebsitePageviewsQuery({ websiteId: site.id });
  const pages = useWebsiteMetricsQuery(site.id, { type: 'path', limit });
  const referrers = useWebsiteMetricsQuery(site.id, { type: 'referrer', limit });

  return (
    <>
      <Cell>
        <Column gap="1">
          <Text weight="bold" truncate title={site.name}>
            {site.name}
          </Text>
          {site.note && (
            <Text size="sm" color="muted" truncate title={site.note}>
              {site.note}
            </Text>
          )}
        </Column>
      </Cell>
      <Cell>
        <Text weight="bold" size="2xl">
          {stats.data ? formatLongNumber(stats.data.visitors) : '…'}
        </Text>
      </Cell>
      <Cell>
        <Text weight="bold" size="2xl">
          {stats.data ? formatLongNumber(stats.data.visits) : '…'}
        </Text>
      </Cell>
      <Cell>
        <Sparkline points={series.data?.sessions} height={28} />
      </Cell>
      <Cell>
        <TopList items={pages.data} />
      </Cell>
      <Cell>
        <TopList items={referrers.data} />
      </Cell>
    </>
  );
}

function Cell({ header, children }: { header?: boolean; children: ReactNode }) {
  return (
    <Box
      border="bottom"
      paddingX="3"
      paddingTop={header ? '0' : '4'}
      paddingBottom={header ? '2' : '4'}
      minWidth="0"
    >
      {children}
    </Box>
  );
}

function TopList({ items }: { items?: { x: string; y: number }[] }) {
  if (!items?.length) {
    return <Text color="muted">—</Text>;
  }

  return (
    <Column gap="1">
      {items.map(({ x, y }) => (
        <Row key={x} justifyContent="space-between" gap="3">
          <Text truncate title={x}>
            {x || '—'}
          </Text>
          <Text color="muted">{formatLongNumber(y)}</Text>
        </Row>
      ))}
    </Column>
  );
}
