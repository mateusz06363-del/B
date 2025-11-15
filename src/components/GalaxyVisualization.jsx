import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getAbundanceSize, getNativenessColor, getCategoryColor } from '../utils/dataLoader';

const GalaxyVisualization = ({ graphData, colorMode = 'nativeness' }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!graphData || !dimensions.width || !dimensions.height) return;

    const { nodes, links } = graphData;
    const { width, height } = dimensions;

    // Clear previous visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Create the simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(50)
        .strength(0.3))
      .force('charge', d3.forceManyBody()
        .strength(-100)
        .distanceMax(200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => getAbundanceSize(d.abundance) + 2));

    // Create container for zoom
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 1);

    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => getAbundanceSize(d.abundance))
      .attr('fill', d => colorMode === 'nativeness'
        ? getNativenessColor(d.nativeness)
        : getCategoryColor(d.category))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        // Highlight node
        d3.select(event.target)
          .attr('stroke-width', 3)
          .attr('opacity', 1);

        // Show tooltip
        tooltip
          .style('display', 'block')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .html(`
            <h3>${d.name}</h3>
            <p class="scientific-name">${d.scientificName}</p>
            <p><strong>Category:</strong> ${d.category || 'Unknown'}</p>
            <p><strong>Family:</strong> ${d.family || 'Unknown'}</p>
            <p><strong>Nativeness:</strong> ${d.nativeness || 'Unknown'}</p>
            <p><strong>Abundance:</strong> ${d.abundance || 'Unknown'}</p>
            ${d.seasonality ? `<p><strong>Seasonality:</strong> ${d.seasonality}</p>` : ''}
            ${d.conservationStatus ? `<p><strong>Conservation:</strong> ${d.conservationStatus}</p>` : ''}
          `);
      })
      .on('mouseleave', (event) => {
        d3.select(event.target)
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.8);

        tooltip.style('display', 'none');
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [graphData, dimensions, colorMode]);

  return (
    <>
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%' }}
      />
      <div
        ref={tooltipRef}
        className="tooltip"
        style={{ display: 'none' }}
      />
    </>
  );
};

export default GalaxyVisualization;
