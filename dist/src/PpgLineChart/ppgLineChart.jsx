import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './ppgLineChart.css';

export default function PpgLineChart() {
  const containerRef = useRef(null);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowDescription(entry.isIntersecting);
      },
      { threshold: 0.9 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    d3.select(container).selectAll('*').remove();
    d3.selectAll('.tooltip').remove();

    const margin = { top: 50, right: 150, bottom: 60, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 550 - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text("NBA Players' Points Per Game By Season");

    const decadeOrder = ['80s', '90s', '00s', '10s', '20s'];
    const colorScale = d3
      .scaleOrdinal()
      .domain(decadeOrder)
      .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']);

    const x = d3.scaleLinear().domain([0, 22]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 40]).range([height, 0]);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(23).tickFormat(d => d))
      .style('font-size', '12px')
      .style('color', 'white');
    svg
      .append('g')
      .call(d3.axisLeft(y).ticks(10))
      .style('font-size', '12px')
      .style('color', 'white');

    svg
      .append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'white')
      .text('Year in League');
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'white')
      .text('Points Per Game');

    svg
      .append('g')
      .attr('class', 'grid')
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.2)
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('background', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 2px 5px rgba(0,0,0,0.1)');

    const lineGenerator = d3
      .line()
      .x(d => x(d.year))
      .y(d => y(d.points))
      .defined(d => d.points != null);

    let dataPath = '../data/ppgLineChart/nbaStats.csv';
    d3.csv(dataPath)
      .then(processData)
      .catch(() => d3.csv('nbaStats.csv').then(processData));

    function processData(data) {
      const yearColumns = Object.keys(data[0])
        .filter(key => key.startsWith('Year'))
        .sort((a, b) => +a.split(' ')[1] - +b.split(' ')[1]);

      const players = data.map(player => {
        let total = 0, seasons = 0;
        yearColumns.forEach((col, i) => {
          const v = player[col];
          if (v !== '' && v != null) {
            total += +v;
            seasons++;
          }
        });
        const careerAvg = seasons ? (total / seasons).toFixed(1) : 0;
        const points = [{ year: 0, points: 0 }];
        yearColumns.forEach((col, i) => {
          const v = player[col];
          if (v !== '' && v != null) points.push({ year: i + 1, points: +v });
        });
        return { player: player.Player, decade: player.Decade, careerAvg, points };
      });

      let selectedDecade = null;

      svg
        .insert('rect', ':first-child')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'transparent')
        .style('pointer-events', 'all')
        .on('click', () => {
          if (selectedDecade) {
            selectedDecade = null;
            svg.selectAll('.player-line')
              .attr('stroke-width', 2)
              .attr('stroke-opacity', 0.7);
            svg.selectAll('.legend rect').style('stroke', 'none');
            svg.selectAll('.legend text').style('font-weight', 'normal');
          }
        });

      players.forEach(p => {
        const path = svg.append('path')
          .datum(p)
          .attr('class', 'player-line')
          .attr('fill', 'none')
          .attr('stroke', colorScale(p.decade))
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.7)
          .attr('d', d => lineGenerator(d.points))
          .on('mouseover', function(event, d) {
            if (selectedDecade && p.decade !== selectedDecade) return;
            d3.select(this).attr('stroke-width', 4).attr('stroke-opacity', 1);
            svg.selectAll('.player-line')
              .filter(function() { return this !== event.currentTarget; })
              .attr('stroke-opacity', 0.1)
              .attr('stroke-width', 1);
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`<strong>${p.player}</strong><br/>Career Avg: ${p.careerAvg} PPG`)
              .style('left', `${event.pageX + 10}px`)
              .style('top',  `${event.pageY - 28}px`);
          })
          .on('mouseout', function() {
            tooltip.transition().duration(500).style('opacity', 0);
            if (!selectedDecade) {
              svg.selectAll('.player-line')
                .attr('stroke-width', 2)
                .attr('stroke-opacity', 0.7);
            } else {
              svg.selectAll('.player-line')
                .attr('stroke-width', d => (d.decade === selectedDecade ? 3 : 1))
                .attr('stroke-opacity', d => (d.decade === selectedDecade ? 0.7 : 0.1));
            }
          });

        const totalLength = path.node().getTotalLength();
        path
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0);
      });

      const legend = svg
        .selectAll('.legend')
        .data(decadeOrder)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (_, i) => `translate(0,${i * 20})`)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, dec) {
          if (!selectedDecade) {
            svg.selectAll('.player-line')
              .attr('stroke-opacity', d => (d.decade === dec ? 1 : 0.1))
              .attr('stroke-width', d => (d.decade === dec ? 3 : 1));
          }
        })
        .on('mouseout', function() {
          if (!selectedDecade) {
            svg.selectAll('.player-line')
              .attr('stroke-opacity', 0.7)
              .attr('stroke-width', 2);
          }
        })
        .on('click', function(event, dec) {
          selectedDecade = dec;
          svg.selectAll('.player-line')
            .attr('stroke-opacity', d => (d.decade === dec ? 0.9 : 0.1))
            .attr('stroke-width', d => (d.decade === dec ? 3 : 1));
          svg.selectAll('.legend rect')
            .style('stroke', d => (d === dec ? '#000' : 'none'))
            .style('stroke-width', d => (d === dec ? '2' : '0'));
          svg.selectAll('.legend text')
            .style('font-weight', d => (d === dec ? 'bold' : 'normal'));
          event.stopPropagation();
        });

      legend
        .append('rect')
        .attr('x', width + 20)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', d => colorScale(d));

      legend
        .append('text')
        .attr('x', width + 45)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'start')
        .style('fill', 'white')
        .text(d => d + ' decade');
    }

    return () => {
      d3.select(container).selectAll('*').remove();
      d3.selectAll('.tooltip').remove();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        id="line-chart-container"
        style={{ width: '100%', height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      />
      <div className={`ppg-line-description ${showDescription ? 'visible' : ''}`}>
        <p>
          This chart shows 5 of the best players of each decade from the 1980s to
          the 2020s and their points per game in each year of their career.
        </p>
      </div>
    </>
  );
}
