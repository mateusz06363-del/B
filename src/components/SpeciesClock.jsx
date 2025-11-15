import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getSeasonalityData, getNativenessColor, getCategoryColor } from '../utils/dataLoader';

const SpeciesClock = ({ species, onMonthSelect }) => {
  const svgRef = useRef();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [stats, setStats] = useState({});

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    if (!species || species.length === 0) return;

    const monthlyData = getSeasonalityData(species);
    const width = 360;
    const height = 360;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create arc generator
    const maxValue = d3.max(monthlyData) || 1;
    const angleScale = d3.scaleLinear()
      .domain([0, 12])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([radius * 0.3, radius]);

    // Create segments
    const arc = d3.arc()
      .innerRadius(radius * 0.3)
      .outerRadius((d, i) => radiusScale(monthlyData[i]))
      .startAngle((d, i) => angleScale(i) - Math.PI / 2)
      .endAngle((d, i) => angleScale(i + 1) - Math.PI / 2)
      .padAngle(0.02);

    // Draw segments
    const segments = g.selectAll('.clock-segment')
      .data(monthlyData)
      .join('path')
      .attr('class', 'clock-segment')
      .attr('d', arc)
      .attr('fill', (d, i) => {
        const hue = (i / 12) * 360;
        return `hsl(${hue}, 70%, 60%)`;
      })
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d, i) => {
        const monthIndex = segments.nodes().indexOf(event.target);
        setSelectedMonth(monthIndex);
        if (onMonthSelect) {
          onMonthSelect(monthIndex);
        }
      })
      .on('mouseenter', function() {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 0.8);
      });

    // Add month labels
    g.selectAll('.clock-month-label')
      .data(monthNames)
      .join('text')
      .attr('class', 'clock-month-label')
      .attr('x', (d, i) => {
        const angle = angleScale(i + 0.5) - Math.PI / 2;
        return Math.cos(angle) * (radius + 20);
      })
      .attr('y', (d, i) => {
        const angle = angleScale(i + 0.5) - Math.PI / 2;
        return Math.sin(angle) * (radius + 20);
      })
      .attr('dy', '0.35em')
      .text(d => d);

    // Add center label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '14px')
      .style('fill', '#60a5fa')
      .style('font-weight', '600')
      .text('Species');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '14px')
      .style('fill', '#60a5fa')
      .style('font-weight', '600')
      .text('Activity');

    // Calculate stats
    calculateStats(species);
  }, [species]);

  const calculateStats = (species) => {
    const nativeCount = species.filter(s => s.nativeness === 'Native').length;
    const nonNativeCount = species.filter(s => s.nativeness === 'Not Native').length;
    const categoryCount = {};

    species.forEach(s => {
      if (s.category) {
        categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setStats({
      total: species.length,
      native: nativeCount,
      nonNative: nonNativeCount,
      topCategories
    });
  };

  return (
    <>
      <h3 className="clock-title">Seasonal Activity</h3>
      <svg
        ref={svgRef}
        className="clock-svg"
        width="360"
        height="360"
      />

      <div className="legend">
        <h4>Nativeness</h4>
        <div className="legend-item">
          <div className="legend-color" style={{ background: getNativenessColor('Native') }} />
          <span className="legend-text">Native</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: getNativenessColor('Not Native') }} />
          <span className="legend-text">Non-Native</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: getNativenessColor('Unknown') }} />
          <span className="legend-text">Unknown</span>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="stats">
          <h4>Park Statistics</h4>
          <div className="stat-item">
            <span className="stat-label">Total Species:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Native:</span>
            <span className="stat-value">{stats.native}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Non-Native:</span>
            <span className="stat-value">{stats.nonNative}</span>
          </div>

          {stats.topCategories && stats.topCategories.length > 0 && (
            <>
              <h4 style={{ marginTop: '1rem' }}>Top Categories</h4>
              {stats.topCategories.map(([category, count]) => (
                <div key={category} className="stat-item">
                  <span className="stat-label" style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      className="legend-color"
                      style={{
                        background: getCategoryColor(category),
                        marginRight: '0.5rem'
                      }}
                    />
                    {category}:
                  </span>
                  <span className="stat-value">{count}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SpeciesClock;
