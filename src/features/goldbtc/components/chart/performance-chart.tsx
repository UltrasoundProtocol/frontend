'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MetricKey, Series, SeriesPoint } from '../../types';

interface PerformanceChartProps {
  metric: MetricKey;
  series: Series[];
  xLabels?: string[];
  yLabel?: string;
  className?: string;
}

export function PerformanceChart({
  metric,
  series,
  xLabels,
  yLabel,
  className,
}: PerformanceChartProps) {
  // Calculate dimensions and scales
  const { width, height, padding, points, yMin, yMax, xStep } = useMemo(() => {
    const w = 100; // Use percentage-based viewBox
    const h = 37.5; // Maintain 800:300 aspect ratio (300/800 * 100)
    const p = { top: 2.5, right: 2.5, bottom: 5, left: 7.5 }; // Scale padding proportionally

    if (!series.length || !series[0].points.length) {
      return {
        width: w,
        height: h,
        padding: p,
        points: [],
        yMin: 0,
        yMax: 100,
        xStep: 0,
      };
    }

    const allYValues = series.flatMap((s) => s.points.map((pt) => pt.y));
    const min = Math.min(...allYValues);
    const max = Math.max(...allYValues);
    const range = max - min;
    const yMinVal = min - range * 0.1;
    const yMaxVal = max + range * 0.1;

    const chartWidth = w - p.left - p.right;
    const chartHeight = h - p.top - p.bottom;
    const step = chartWidth / (series[0].points.length - 1 || 1);

    const pts = series.map((s) => ({
      id: s.id,
      label: s.label,
      path: s.points
        .map((pt, i) => {
          const x = p.left + i * step;
          const y =
            p.top +
            chartHeight -
            ((pt.y - yMinVal) / (yMaxVal - yMinVal)) * chartHeight;
          return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
        })
        .join(' '),
    }));

    return {
      width: w,
      height: h,
      padding: p,
      points: pts,
      yMin: yMinVal,
      yMax: yMaxVal,
      xStep: step,
    };
  }, [series]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Protocol Performance</h3>
          {yLabel && (
            <span className="text-sm text-muted-foreground">{yLabel}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`${metric} performance chart`}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y =
                padding.top +
                (height - padding.top - padding.bottom) * (1 - ratio);
              return (
                <line
                  key={ratio}
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeWidth={1}
                />
              );
            })}

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y =
                padding.top +
                (height - padding.top - padding.bottom) * (1 - ratio);
              const value = yMin + (yMax - yMin) * ratio;
              return (
                <text
                  key={ratio}
                  x={padding.left - 1.25}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize="1.5"
                  className="fill-muted-foreground"
                >
                  {value.toFixed(1)}
                </text>
              );
            })}

            {/* X-axis labels */}
            {xLabels &&
              xLabels.map((label, i) => {
                const x = padding.left + i * xStep;
                return (
                  <text
                    key={i}
                    x={x}
                    y={height - padding.bottom + 2.5}
                    textAnchor="middle"
                    fontSize="1.5"
                    className="fill-muted-foreground"
                  >
                    {label}
                  </text>
                );
              })}

            {/* Data lines */}
            {points.map((pt, idx) => (
              <path
                key={pt.id}
                d={pt.path}
                fill="none"
                stroke={idx === 0 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>

          {/* Legend */}
          {series.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              {series.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-full',
                      idx === 0 ? 'bg-primary' : 'bg-secondary'
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
