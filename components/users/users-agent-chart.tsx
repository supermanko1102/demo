"use client";

import { useEffect, useRef } from "react";
import type { AgentChartPayload } from "@/types/api";

interface UsersAgentChartProps {
  chart: AgentChartPayload;
}

export function UsersAgentChart({ chart }: UsersAgentChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let chartInstance: { setOption: (option: object, notMerge?: boolean) => void; resize: () => void; dispose: () => void } | null = null;
    let removeResizeListener: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;

    async function renderChart() {
      const echarts = await import("echarts");
      if (disposed || !chartRef.current) {
        return;
      }

      const isDark = document.documentElement.classList.contains("dark");
      const computed = window.getComputedStyle(chartRef.current);
      const cardBg = computed.backgroundColor || (isDark ? "#0f172a" : "#ffffff");
      const palette = isDark
        ? {
            primary: "#e2e8f0",
            secondary: "#94a3b8",
            tertiary: "#64748b",
            text: "#cbd5e1",
            lineFill: "rgba(226, 232, 240, 0.18)",
          }
        : {
            primary: "#0f172a",
            secondary: "#334155",
            tertiary: "#94a3b8",
            text: "#475569",
            lineFill: "rgba(15, 23, 42, 0.12)",
          };

      chartInstance = echarts.getInstanceByDom(chartRef.current) ?? echarts.init(chartRef.current);

      const option =
        chart.type === "pie"
          ? {
              color: [palette.primary, palette.secondary, palette.tertiary],
              title: {
                text: chart.title,
                left: "center",
                top: 4,
                textStyle: {
                  fontSize: 12,
                  fontWeight: 600,
                  color: palette.text,
                },
              },
              tooltip: { trigger: "item", confine: true },
              legend: {
                bottom: 4,
                left: "center",
                itemWidth: 10,
                itemHeight: 10,
                textStyle: {
                  fontSize: 11,
                  color: palette.text,
                },
              },
              series: [
                {
                  name: chart.title,
                  type: "pie",
                  radius: ["50%", "72%"],
                  center: ["50%", "44%"],
                  minAngle: 5,
                  data: chart.labels.map((label, index) => ({
                    name: label,
                    value: chart.values[index] ?? 0,
                  })),
                  avoidLabelOverlap: true,
                  label: {
                    show: false,
                    color: palette.text,
                  },
                  labelLine: {
                    show: false,
                  },
                  itemStyle: {
                    borderColor: cardBg,
                    borderWidth: 2,
                  },
                },
              ],
            }
          : {
              color: [palette.primary],
              title: {
                text: chart.title,
                left: "center",
                top: 4,
                textStyle: {
                  fontSize: 12,
                  fontWeight: 600,
                  color: palette.text,
                },
              },
              tooltip: { trigger: "axis", confine: true },
              grid: { left: 32, right: 14, top: 44, bottom: 28 },
              xAxis: {
                type: "category",
                data: chart.labels,
                axisLine: {
                  lineStyle: {
                    color: palette.tertiary,
                  },
                },
                axisLabel: {
                  fontSize: 11,
                  color: palette.text,
                },
              },
              yAxis: {
                type: "value",
                minInterval: 1,
                axisLine: {
                  lineStyle: {
                    color: palette.tertiary,
                  },
                },
                splitLine: {
                  lineStyle: {
                    color: palette.tertiary,
                    opacity: 0.25,
                  },
                },
                axisLabel: {
                  color: palette.text,
                },
              },
              series: [
                {
                  name: chart.title,
                  type: "line",
                  smooth: true,
                  areaStyle: { color: palette.lineFill },
                  data: chart.values,
                },
              ],
            };

      chartInstance.setOption(option, true);

      const onResize = () => {
        chartInstance?.resize();
      };
      window.addEventListener("resize", onResize);
      removeResizeListener = () => window.removeEventListener("resize", onResize);

      resizeObserver = new ResizeObserver(() => {
        chartInstance?.resize();
      });
      resizeObserver.observe(chartRef.current);
    }

    void renderChart();

    return () => {
      disposed = true;
      removeResizeListener?.();
      resizeObserver?.disconnect();
      chartInstance?.dispose();
    };
  }, [chart]);

  return <div className="h-72 w-full rounded-md border bg-background p-1" ref={chartRef} />;
}
