/* 每周循环健身计划 — 体重趋势图(ECharts 本地渲染,SVG + 静态) */
(function () {
  'use strict';

  var chartInstance = null;

  function cssVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name);
      return v ? v.trim() : fallback;
    } catch (e) {
      return fallback;
    }
  }

  window.FitCharts = {
    /**
     * 渲染体重趋势折线图
     * @param {string} containerId 图表容器元素 ID
     * @param {Array<{d: string, kg: number}>} records 按日期升序的体重记录
     * @param {number} goalKg 目标体重(kg)
     */
    renderWeightChart: function (containerId, records, goalKg) {
      var el = document.getElementById(containerId);
      if (!el) { return; }
      var emptyEl = document.getElementById(containerId + '-empty');

      function showEmpty(msg) {
        el.style.display = 'none';
        if (emptyEl) {
          emptyEl.hidden = false;
          emptyEl.textContent = msg;
        }
      }

      if (!window.echarts) {
        showEmpty('图表组件未加载:请确认 shared/js/echarts.min.js 已随页面一起上传。');
        return;
      }
      if (!records || records.length < 2) {
        showEmpty('记录 2 次体重后,这里会显示趋势图。');
        return;
      }
      if (emptyEl) { emptyEl.hidden = true; }
      el.style.display = '';

      var seriesColor = cssVar('--chart-series-1', '#12B886');
      var goalColor = cssVar('--chart-series-2', '#228BE6');
      var axisColor = cssVar('--chart-axis', '#65756E');
      var labelColor = cssVar('--chart-label', '#65756E');
      var gridColor = cssVar('--chart-grid', 'rgba(27,36,32,0.12)');
      var tooltipBg = cssVar('--chart-tooltip-bg', '#FFFFFF');
      var inkColor = cssVar('--ink', '#1B2420');

      var dates = records.map(function (r) { return r.d.slice(5).replace('-', '/'); });
      var kgs = records.map(function (r) { return r.kg; });
      var goal = (typeof goalKg === 'number' && isFinite(goalKg)) ? goalKg : 73;

      var minVal = Math.min.apply(null, kgs.concat([goal]));
      var maxVal = Math.max.apply(null, kgs.concat([goal]));
      var padY = Math.max(1, (maxVal - minVal) * 0.15);

      if (!chartInstance) {
        chartInstance = echarts.init(el, null, { renderer: 'svg' });
        window.addEventListener('resize', function () {
          if (chartInstance) { chartInstance.resize(); }
        });
      }

      chartInstance.setOption({
        animation: false,
        grid: { left: 48, right: 20, top: 22, bottom: 32 },
        tooltip: {
          trigger: 'axis',
          appendToBody: true,
          backgroundColor: tooltipBg,
          borderColor: gridColor,
          borderWidth: 1,
          textStyle: { color: inkColor, fontSize: 12 },
          formatter: function (params) {
            if (!params || !params.length) { return ''; }
            var p = params[0];
            return p.axisValue + '<br/>' + p.marker + ' 体重 ' + p.value + ' kg';
          }
        },
        xAxis: {
          type: 'category',
          data: dates,
          boundaryGap: false,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: gridColor } },
          axisLabel: { color: labelColor, fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          min: Math.floor((minVal - padY) * 2) / 2,
          max: Math.ceil((maxVal + padY) * 2) / 2,
          axisLabel: { color: labelColor, fontSize: 11, formatter: '{value}' },
          splitLine: { lineStyle: { color: gridColor, width: 1 } }
        },
        series: [{
          name: '体重',
          type: 'line',
          data: kgs,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 2, color: seriesColor },
          itemStyle: { color: seriesColor },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { type: 'dashed', color: goalColor, width: 1.5 },
            label: {
              formatter: '目标 ' + goal + ' kg',
              color: goalColor,
              fontSize: 11,
              position: 'insideEndTop'
            },
            data: [{ yAxis: goal }]
          }
        }]
      }, true);
      chartInstance.resize();
    }
  };
})();
