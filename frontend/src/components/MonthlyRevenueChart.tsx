import { useEffect, useMemo, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import type { MonthlyRevenue } from '../types';

interface MonthlyRevenueChartProps {
  data: MonthlyRevenue[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
}

function MonthlyRevenueChart({ data, selectedMonth, onSelectMonth }: MonthlyRevenueChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        monthKey: `${item.year}-${String(item.month).padStart(2, '0')}`,
        label: `T${item.month}/${item.year}`,
        revenue: item.revenue,
        orderCount: item.orderCount,
        fill: selectedMonth === `${item.year}-${String(item.month).padStart(2, '0')}` ? am5.color(0xd71920) : am5.color(0x0f172a),
      })),
    [data, selectedMonth],
  );

  useEffect(() => {
    if (!chartRef.current) {
      return undefined;
    }

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    root._logo?.dispose();

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: 'none',
        wheelY: 'none',
        paddingLeft: 0,
      }),
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 24,
      minorGridEnabled: true,
    });
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'label',
        renderer: xRenderer,
      }),
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Doanh thu',
        xAxis,
        yAxis,
        valueYField: 'revenue',
        categoryXField: 'label',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{label}: {valueY.formatNumber("#,###")} VND\n{orderCount} đơn hàng',
        }),
      }),
    );

    series.columns.template.setAll({
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      cursorOverStyle: 'pointer',
      interactive: true,
      tooltipY: 0,
    });
    series.columns.template.adapters.add('fill', (_fill, target) => {
      const context = target.dataItem?.dataContext as { fill?: am5.Color } | undefined;
      return context?.fill;
    });
    series.columns.template.adapters.add('stroke', (_stroke, target) => {
      const context = target.dataItem?.dataContext as { fill?: am5.Color } | undefined;
      return context?.fill;
    });
    series.columns.template.events.on('click', (event) => {
      const context = event.target.dataItem?.dataContext as { monthKey?: string } | undefined;
      if (context?.monthKey) {
        onSelectMonth(context.monthKey);
      }
    });

    xAxis.data.setAll(chartData);
    series.data.setAll(chartData);
    series.appear(700);
    chart.appear(700, 100);

    return () => root.dispose();
  }, [chartData, onSelectMonth]);

  return <div ref={chartRef} className="h-80 w-full" />;
}

export default MonthlyRevenueChart;
