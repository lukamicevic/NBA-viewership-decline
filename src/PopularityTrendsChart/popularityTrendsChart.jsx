import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './popularityTrendsChart.css';
import { jerseyMap } from './jerseyMap';
import { teamColors } from './teamColorsMap';

export default function PopularityTrendsChart() {
  const [teams, setTeams]       = useState([]);
  const [nbaData, setNbaData]   = useState(null);
  const [selected, setSelected] = useState('NBA');
  const containerRef = useRef(null);

  const config = {
    margin: { top: 40, right: 30, bottom: 60, left: 60 },
    width: 2000,
    transitionDuration: 750,
    popularityRange: [-50, 100]
  };

  function getJerseyFile(team, year) {
    const ranges = jerseyMap[team] || [];
    const hit = ranges.find(r => year >= r.from && year <= r.to);
    return hit ? hit.file : `svg/${team}/default.svg`;
  }

  const championsMap = {
    2004:'Pistons', 2005:'Spurs', 2006:'Heat', 2007:'Spurs',
    2008:'Celtics',2009:'Lakers',2010:'Lakers',2011:'Mavs',
    2012:'Heat',2013:'Heat',2014:'Spurs',2015:'Warriors',
    2016:'Cavs',2017:'Warriors',2018:'Warriors',2019:'Raptors',
    2020:'Lakers',2021:'Bucks',2022:'Warriors',2023:'Nuggets',
    2024:'Celtics'
  };

  const teamDisplayNames = {
    Celtics:  'Boston Celtics',
    Nets:     'Brooklyn Nets',
    Bucks:    'Milwaukee Bucks',
    Bulls:    'Chicago Bulls',
    Cavs:     'Cleveland Cavaliers',
    Nuggets:  'Denver Nuggets',
    Clippers: 'Los Angeles Clippers',
    Hawks:    'Atlanta Hawks',
    Heat:     'Miami Heat',
    Hornets:  'Charlotte Hornets',
    Kings:    'Sacramento Kings',
    Knicks:   'New York Knicks',
    Lakers:   'Los Angeles Lakers',
    Magic:    'Orlando Magic',
    Mavs:     'Dallas Mavericks',
    Grizz:    'Memphis Grizzlies',
    Pacers:   'Indiana Pacers',
    Pelicans: 'New Orleans Pelicans',
    '76ers':  'Philadelphia 76ers',
    Pistons:  'Detroit Pistons',
    Blazers:  'Portland Trail Blazers',
    Raptors:  'Toronto Raptors',
    Rockets:  'Houston Rockets',
    Spurs:    'San Antonio Spurs',
    Suns:     'Phoenix Suns',
    Thunder:  'Oklahoma City Thunder',
    Jazz:     'Utah Jazz',
    Warriors: 'Golden State Warriors',
    Wizards:  'Washington Wizards',
    Wolves:   'Minnesota Timberwolves',
    NBA:      'NBA'
  };
  

  useEffect(() => {
    fetch('data/popularityTrends/nbaTrends.csv')
      .then(r => r.text())
      .then(txt => {
        const data = d3.csvParse(txt);
        const list = Object.keys(data[0]).filter(k => k && k !== 'Year');
        setTeams(list);
        setSelected('NBA');
        setNbaData(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!nbaData || !selected) return;

    const container = containerRef.current;
    d3.select(container).selectAll('*').remove();

    const height = container.clientHeight - config.margin.top - config.margin.bottom;

    const svg = d3.select(container)
      .append('svg')
        .attr('width', config.width + config.margin.left + config.margin.right)
        .attr('height', height + config.margin.top + config.margin.bottom)
      .append('g')
        .attr('transform', `translate(${config.margin.left},${config.margin.top})`);

    svg.append('image')
      .attr('xlink:href', 'data/popularityTrends/svg/bleachers.svg')
      .attr('width', config.width)
      .attr('height', height)
      .attr('preserveAspectRatio', 'xMidYMid slice');

    const teamData = nbaData.map(d => ({
      year: +d.Year,
      popularity: +d[selected] || 0
    }));
    const x = d3.scaleBand()
      .domain(teamData.map(d => d.year))
      .range([0, config.width])
      .padding(0.1);
    const y = d3.scaleLinear()
      .domain(config.popularityRange).nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickValues(x.domain().filter((_,i) => i % 2 === 0))
      )
      .selectAll('text')
        .attr('transform','rotate(-45)')
        .style('text-anchor','end')
        .style('color', 'white');


    const posTicks = y.ticks().filter(t => t >= 0);
    svg.append('g')
      .call(d3.axisLeft(y).tickValues(posTicks))
      .style('color', 'white');

    svg.append('text')
      .attr('x', config.width/2)
      .attr('y', height + config.margin.bottom - 10)
      .attr('text-anchor','middle')
      .style('fill', 'white')
      .text('Year');
    svg.append('text')
      .attr('transform','rotate(-90)')
      .attr('y', -config.margin.left + 20)
      .attr('x', -height/2)
      .attr('text-anchor','middle')
      .style('fill', 'white')
      .text('Popularity Score');
    svg.append('text')
      .attr('x', config.width/2)
      .attr('y', -15)
      .attr('text-anchor','middle')
      .style('font-size','16px')
      .style('font-weight','bold')
      .style('fill', 'white')
      .text(`${teamDisplayNames[selected]} Popularity (2004-2024)`);

    const teamColor = teamColors[selected] || 'steelblue';
    const groups = svg.selectAll('.bar-group')
      .data(teamData).enter()
      .append('g')
        .attr('transform', d => `translate(${x(d.year)},0)`);

    groups.append('image')
      .attr('href','data/popularityTrends/svg/person3.svg')
      .attr('xlink:href','data/popularityTrends/svg/person3.svg')
      .attr('preserveAspectRatio','none')
      .attr('x',0)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
    .transition() 
      .duration(config.transitionDuration)
      .delay((d,i) => i * 30) 
      .attr('y', d => y(d.popularity))
      .attr('height', d => height - y(d.popularity));

    const linePts = teamData.map(d => ({
      x: x(d.year) + x.bandwidth()/2,
      y: y(d.popularity) - 5
    }));
    const line = svg.append('path')
      .datum(linePts)
      .attr('fill','none')
      .attr('stroke',teamColor)
      .attr('stroke-width',5)
      .attr('stroke-linecap','round')
      .attr('d', d3.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(d3.curveMonotoneX)
      )
      .raise();
      const totalLen = line.node().getTotalLength();
      line
        .attr('stroke-dasharray', `${totalLen} ${totalLen}`)
        .attr('stroke-dashoffset', totalLen)
        .transition()
          .duration(config.transitionDuration * 2)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);

    const topPct = 0.1825, botPct = 0.25, wf = 0.7, xOff = (1 - wf) * x.bandwidth() / 2;
    groups.append('image')
      .attr('href', d => getJerseyFile(selected, d.year))
      .attr('xlink:href', d => getJerseyFile(selected, d.year))
      .attr('preserveAspectRatio','none')
      .attr('x', xOff)
      .attr('width', x.bandwidth() * wf)
      .attr('y', height)
      .attr('height', 0)
      .transition()
        .duration(config.transitionDuration)
        .delay((d,i) => i * 30) 
        .attr('y', d => {
          const bh = height - y(d.popularity);
          return y(d.popularity) + bh * topPct;
        })
        .attr('height', d => {
          const bh = height - y(d.popularity);
          return bh * (1 - topPct - botPct);
        });

      const trophySize = 60;
      groups
        .filter(d => championsMap[d.year] === selected)
        .append('image')
          .attr('href',      'data/popularityTrends/svg/trophy.svg')
          .attr('xlink:href','data/popularityTrends/svg/trophy.svg')
          .attr('preserveAspectRatio','xMidYMid meet')
          .attr('width',   trophySize)
          .attr('x', () => x.bandwidth()*0.25 - trophySize/2)
          .attr('y', height)
          .attr('height', 0)
          .transition()
            .duration(config.transitionDuration * 2)
            .delay((d,i) => i * 30) 
          .attr('height',  trophySize * 1.68891)
          .attr('y', d => {
            const barH = height - y(d.popularity);
            return (y(d.popularity) + barH*0.5 - trophySize/2) - 25;
          });

  }, [nbaData, selected]);

  return (
    <div style={{ padding: 20 }}>
      <h2>NBA Popularity Trends</h2>
      <select
          id="team-select"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          {teams.map(teamKey => (
            <option key={teamKey} value={teamKey}>
              {teamDisplayNames[teamKey] || teamKey}
            </option>
          ))}
      </select>

      <div
        ref={containerRef}
        id="histogram"
        style={{ width: '100%', height: '600px', marginTop: 20 }}
      />
    </div>
  );
}
