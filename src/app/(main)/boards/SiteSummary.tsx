'use client';
import { Column, Grid, Row, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useWebsiteMetricsQuery } from '@/components/hooks';
import { useWebsitePageviewsQuery } from '@/components/hooks/queries/useWebsitePageviewsQuery';
import { useWebsiteStatsQuery } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { THEME_COLORS } from '@/lib/constants';
import { formatLongNumber } from '@/lib/format';

// byelior: compact board card (visitors, visits, visitor curve, top pages, top referrers)
export function SiteSummary({ websiteId, limit = 3 }: { websiteId: string; limit?: number }) {
  const { t, labels } = useMessages();
  const stats = useWebsiteStatsQuery({ websiteId });
  const series = useWebsitePageviewsQuery({ websiteId });
  const pages = useWebsiteMetricsQuery(websiteId, { type: 'path', limit });
  const referrers = useWebsiteMetricsQuery(websiteId, { type: 'referrer', limit });

  return (
    <LoadingPanel
      data={stats.data}
      isLoading={stats.isLoading}
      isFetching={stats.isFetching}
      error={stats.error}
      minHeight="120px"
    >
      <Column gap="3">
        <Row alignItems="flex-end" gap="5">
          <Figure label={t(labels.visitors)} value={stats.data?.visitors} />
          <Figure label={t(labels.visits)} value={stats.data?.visits} />
          <Sparkline points={series.data?.sessions} />
        </Row>
        <Grid columns="1fr 1fr" gap="4">
          <TopList title={t(labels.pages)} items={pages.data} />
          <TopList title={t(labels.referrers)} items={referrers.data} />
        </Grid>
      </Column>
    </LoadingPanel>
  );
}

function Figure({ label, value = 0 }: { label: string; value?: number }) {
  return (
    <Column gap="1">
      <Text size="xs" color="muted">
        {label}
      </Text>
      <Text weight="bold" size="2xl">
        {formatLongNumber(value)}
      </Text>
    </Column>
  );
}

export function Sparkline({
  points,
  height = 44,
}: {
  points?: { x: string; y: number }[];
  height?: number;
}) {
  if (!points?.length) {
    return null;
  }

  const max = Math.max(1, ...points.map(p => p.y));
  const step = points.length > 1 ? 100 / (points.length - 1) : 100;
  const coords = points.map(
    (p, i) => `${(i * step).toFixed(2)},${(38 - (p.y / max) * 34).toFixed(2)}`,
  );
  const color = THEME_COLORS.light.primary;

  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      style={{ flex: 1, minWidth: 60, width: '100%', height }}
      aria-hidden="true"
    >
      <polygon points={`0,40 ${coords.join(' ')} 100,40`} fill={color} fillOpacity={0.12} />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function TopList({ title, items }: { title: string; items?: { x: string; y: number }[] }) {
  return (
    <Column gap="1" minWidth="0">
      <Text size="xs" color="muted">
        {title}
      </Text>
      {items?.length ? (
        items.map(({ x, y }) => (
          <Row key={x} justifyContent="space-between" gap="2">
            <Text size="sm" truncate title={x || '/'}>
              {x || '—'}
            </Text>
            <Text size="sm" color="muted">
              {formatLongNumber(y)}
            </Text>
          </Row>
        ))
      ) : (
        <Text size="sm" color="muted">
          —
        </Text>
      )}
    </Column>
  );
}
