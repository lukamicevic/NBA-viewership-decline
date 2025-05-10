import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ppgLineChart.css';

const margin = { top: 50, right: 150, bottom: 60, left: 60 };
const width = 900 - margin.left - margin.right;
const height = 550 - margin.top - margin.bottom;

function createDecadeComponent(decade) {
  return function DecadeChart() {
    const containerRef = useRef(null);

    useEffect(() => {
      const container = containerRef.current;
      d3.select(container).selectAll('*').remove();
      d3.selectAll('.tooltip').remove();

      const colorMap = {
        '80s': '#1f77b4',
        '90s': '#ff7f0e',
        '00s': '#2ca02c',
        '10s': '#d62728',
        '20s': '#9467bd'
      };

      const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      svg.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text(`${decade} Players' PPG (2004-2024)`);

      const xScale = d3.scaleLinear().domain([0,22]).range([0,width]);
      const yScale = d3.scaleLinear().domain([0,40]).range([height,0]);

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(23).tickFormat(d=>d))
        .style('font-size','12px')
        .style('color', 'white');
      svg.append('g')
        .call(d3.axisLeft(yScale).ticks(10))
        .style('font-size','12px')
        .style('color', 'white');

      svg.append('text')
        .attr('transform', `translate(${width/2},${height+margin.bottom-10})`)
        .style('text-anchor','middle')
        .style('font-size','14px')
        .style('fill','white')
        .text('Year in League');

      svg.append('text')
        .attr('transform','rotate(-90)')
        .attr('y',-margin.left)
        .attr('x',-height/2)
        .attr('dy','1em')
        .style('text-anchor','middle')
        .style('font-size','14px')
        .style('fill','white')
        .text('Points Per Game');

      svg.append('g')
        .attr('class','grid')
        .style('stroke-dasharray','3,3')
        .style('opacity',0.2)
        .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''));

      const tooltip = d3.select('body').append('div')
        .attr('class','tooltip')
        .style('opacity',0)
        .style('position','absolute')
        .style('text-align','center')
        .style('padding','8px')
        .style('font-size','12px')
        .style('background','white')
        .style('border','1px solid #ddd')
        .style('border-radius','4px')
        .style('pointer-events','none')
        .style('box-shadow','0 2px 5px rgba(0,0,0,0.1)');

      d3.csv('../data/ppgLineChart/nbaStats.csv').then(data => {
        const yearCols = Object.keys(data[0])
          .filter(k=>k.startsWith('Year'))
          .sort((a,b)=>+a.split(' ')[1]-+b.split(' ')[1]);

        const players = data.map(row=>{
          let total=0,count=0;
          const points=[{year:0,points:0}];
          yearCols.forEach((col,i)=>{ const v=row[col]; if(v!=''&&v!=null){ total+=+v; count++; points.push({year:i+1,points:+v}); }});
          return { player: row.Player, decade: row.Decade, careerAvg: count?(total/count).toFixed(1):0, points };
        }).filter(d=>d.decade===decade);

        players.forEach(p=>{
          const path = svg.append('path')
            .datum(p.points)
            .attr('fill','none')
            .attr('stroke', colorMap[decade])
            .attr('stroke-width',2)
            .attr('stroke-opacity',0.7)
            .attr('d', d3.line().x(d=>xScale(d.year)).y(d=>yScale(d.points)).defined(d=>d.points!=null));
          const totalLen = path.node().getTotalLength();
          path.attr('stroke-dasharray',`${totalLen} ${totalLen}`)
            .attr('stroke-dashoffset',totalLen)
            .transition().duration(1000).ease(d3.easeCubicOut)
            .attr('stroke-dashoffset',0);

          path.on('mouseover',function(event){
            tooltip.transition().duration(200).style('opacity',0.9);
            tooltip.html(`<strong>${p.player}</strong><br/>Avg: ${p.careerAvg} PPG`)
              .style('left',event.pageX+10+'px')
              .style('top',event.pageY-28+'px');
          }).on('mouseout',()=>tooltip.transition().duration(500).style('opacity',0));
        });
      });

      return ()=>{ d3.select(container).selectAll('*').remove(); d3.selectAll('.tooltip').remove(); };
    }, []);

    return <div ref={containerRef} style={{width:'100%',height:'600px'}} />;
  };
}

export const Chart80s = createDecadeComponent('80s');
export const Chart90s = createDecadeComponent('90s');
export const Chart00s = createDecadeComponent('00s');
export const Chart10s = createDecadeComponent('10s');
export const Chart20s = createDecadeComponent('20s');

export default {
  Chart80s,
  Chart90s,
  Chart00s,
  Chart10s,
  Chart20s,
};
