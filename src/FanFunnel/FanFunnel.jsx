import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './FanFunnel.css';
import { Scrollama, Step } from 'react-scrollama';

const FanFunnel = () => {
	const svgRef = useRef();
	const containerRef = useRef();
	const textRefs = useRef([]);
	const dropRefs = useRef([])
	const clipRefs = useRef([]);
	const pieRef = useRef();
	const panelHoveredRef = useRef();

	const [activeStep, setActiveStep] = useState(5);
	const [showDescription, setShowDescription] = useState(false);
	const [data, setData] = useState([]);
	const [sidePanelData, setSidePanelData] = useState(null);
	const funnelHeight = window.innerHeight * 0.85


	const handleStepEnter = ({ data: i }) => {
		// setActiveStep(i);
	};

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setShowDescription(entry.isIntersecting);
			},
			{ threshold: 0.4 }
		);
		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		d3.json('/data/fan_funnel.json').then(data => {
			setData(data);
		});
	}, []);

	useEffect(() => {
		if (!data.length) return;

		for (let i = 0; i < data.length; i++) {
			const isActive = i <= activeStep;
			const duration = isActive ? 500 : 200;
			if (clipRefs.current[i]) {
				d3.select(clipRefs.current[i])
					.transition()
					.duration(duration)
					.attr('height', isActive ? funnelHeight / data.length : 0);
			}

			if (textRefs.current[i]) {
				d3.select(textRefs.current[i])
					.transition()
					.duration(duration)
					.style('opacity', isActive ? 1 : 0);
			}

			if (dropRefs.current[i]) {
				d3.select(dropRefs.current[i])
					.transition()
					.duration(duration)
					.style('opacity', isActive ? 1 : 0);
			}
		}
	}, [activeStep, data]);


	useEffect(() => {
		if (!sidePanelData) return;

		const data = Object.entries(sidePanelData.age_group).map(([label, value]) => ({
			label,
			value,
		}));

		const width = 150;
		const height = 150;
		const radius = Math.min(width, height) / 2;

		const color = d3.scaleOrdinal()
			.domain(data.map(d => d.label))
			.range(['#F57C00', '#E65100', '#795548']);

		const pie = d3.pie().value(d => d.value);
		const arc = d3.arc().innerRadius(0).outerRadius(radius);

		const svg = d3.select(pieRef.current).select('svg');

		let g;
		if (svg.empty()) {
			g = d3.select(pieRef.current)
				.append('svg')
				.attr('width', width)
				.attr('height', height)
				.append('g')
				.attr('transform', `translate(${width / 2}, ${height / 2})`);
		} else {
			g = svg.select('g');
		}

		const paths = g.selectAll('path')
			.data(pie(data));

		paths.enter()
			.append('path')
			.attr('fill', d => color(d.data.label))
			.attr('stroke', '#fff')
			.style('stroke-width', '2px')
			.each(function (d) { this._current = d; })
			.attr('d', arc)
			.merge(paths)
			.transition()
			.duration(800)
			.attrTween('d', function (d) {
				const interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(1);
				return t => arc(interpolate(t));
			});

		paths.exit().remove();

		const texts = g.selectAll('text')
			.data(pie(data));

		const textEnter = texts.enter()
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('font-size', '10px');

		textEnter.append('tspan')
			.attr('x', 0)
			.attr('dy', 0)
			.text(d => d.data.label);

		textEnter.append('tspan')
			.attr('x', 0)
			.attr('dy', '1.2em')
			.text(d => `${d.data.value}%`);

		textEnter.merge(texts)
			.transition()
			.duration(800)
			.attr('transform', d => `translate(${arc.centroid(d)})`);

		texts.exit().remove();
	}, [sidePanelData])

	return (
		<div
			style={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				height: `${data.length * 100}vh`,
			}}
		>
			<h2>Fan Funnel</h2>
			<div ref={containerRef} style={{ height: '375vh', background: 'transparent', position: "absolute", top: '100vh' }} />
			{data.length > 0 && (
				<>
					<svg
						ref={svgRef}
						width={800}
						height={funnelHeight + 200}
						style={{
							position: 'sticky',
							top: '0px',
							zIndex: 1,
							margin: '0px'
						}}
					>
						<defs>
							<linearGradient id="custom-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
								<stop offset="0%" stopColor="#ff6a00" />
								<stop offset="100%" stopColor="#ff9a00" />
							</linearGradient>
							{data.map((d, i) => (
								<clipPath id={`clip-${i}`} key={`clip-${i}`}>
									<rect
										ref={(el) => (clipRefs.current[i] = el)}
										x={-250}
										y={i * funnelHeight / data.length}
										width={500}
										height={0}
									/>
								</clipPath>
							))}
						</defs>

						<g transform={`translate(${800 / 2}, 50)`}>
							{data.map((d, i) => {
								const top = (d.percent / 100) * 500;
								const bottom =
									i < data.length - 1 ? (data[i + 1].percent / 100) * 500 : 0;
								const y = i * (funnelHeight / data.length);
								const dropoff = i === 0 ? 0 : data[i - 1].percent - d.percent;

								const path = `
                  M ${-top / 2},${y}
                  Q 0,${y + 10} ${top / 2},${y}
                  L ${bottom / 2},${y + (funnelHeight / data.length)}
                  Q 0,${y + (funnelHeight / data.length) - 10} ${-bottom / 2},${y + (funnelHeight / data.length)}
                  Z
                `;

								return (
									<g key={`stage-${i}`}>
										<path
											d={path}
											fill="url(#custom-gradient)"
											stroke="#333"
											strokeWidth={1}
											clipPath={`url(#clip-${i})`}
											onMouseEnter={() => {
												setSidePanelData(d);
												clearTimeout(panelHoveredRef.current)
											}}
											onMouseMove={() => {
												clearTimeout(panelHoveredRef.current)
											}}
											onMouseLeave={() => {
												panelHoveredRef.current = setTimeout(() => {
													setSidePanelData(null);
												}, 500);
											}}
											style={{ cursor: 'pointer' }}
										/>
										<text
											ref={(el) => (textRefs.current[i] = el)}
											x={0}
											y={y + (funnelHeight / data.length) / 2}
											dy=".35em"
											textAnchor="middle"
											fill="#eee"
											fontSize="15px"
											style={{ opacity: 0, pointerEvents: 'none' }}
										>
											{d.stage} ({d.percent}%)
										</text>
										{i > 0 && (
											<text
												ref={(el) => (dropRefs.current[i] = el)}
												x={0}
												y={y - 10}
												textAnchor="middle"
												fill={'#444'}
												fontSize="13px"
												style={{ opacity: 0, pointerEvents: 'none' }}
											>
												↓ -{dropoff}%
											</text>
										)}
									</g>
								);
							})}
						</g>
					</svg>

					<Scrollama onStepEnter={handleStepEnter}>
						{data.map((d, i) => (
							<Step data={i} key={`step-${i}`}>
								<div style={{ height: '100vh' }} />
							</Step>
						))}
					</Scrollama>

					<div className={`fan-funnel-description ${showDescription ? 'visible' : ''}`}>
						<p>Follow the shrinking funnel as casual NBA fans drop off—hover each stage to reveal insights:
							what devices they use, how much time they spend, and what they’re saying about the game.
							Get to know the age split as well.</p>
					</div>

					<div
						className={`side-panel ${sidePanelData ? 'visible' : ''}`}
						style={{
							position: 'fixed',
							top: '200px',
							right: '80px',
							width: '400px',
							background: '#fff',
							border: '1px solid #ccc',
							borderRadius: '8px',
							padding: '16px',
							boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
							zIndex: 10,
							fontSize: '13px',
						}}
					>
						{
							sidePanelData && (
								<>
									<div style={{
										display: 'flex',
										flexDirection: "column"
									}}>
										<h4 style={{ marginBottom: '10px' }}>{sidePanelData.stage}</h4>
										{/* speech bubble */}
										<div style={{
											background: '#f5f5f5',
											padding: '8px 12px',
											borderRadius: '12px',
											fontStyle: 'italic',
											marginBottom: '10px',
											position: 'relative',
										}}>
											"{sidePanelData.fan.quote}"
											<div style={{
												position: 'absolute',
												bottom: '-10px',
												left: '20px',
												width: '0',
												height: '0',
												borderTop: '10px solid #f5f5f5',
												borderLeft: '10px solid transparent',
												borderRight: '10px solid transparent'
											}}></div>
										</div>
										<div style={{
											display: 'flex',
											flexDirection: 'row',
											justifyContent: 'flex-start',
											alignItems: 'center'
										}}>
											<img
												src={sidePanelData.fan.pfp}
												alt="avatar"
												style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '12px' }}
											/>
											<div>
												<p><strong>{sidePanelData.fan.name}, {sidePanelData.fan.age}</strong></p>
												{/* stats */}
												<div style={{ fontSize: '13px', lineHeight: '1.4' }}>
													<p>📅 <strong>Time Spent:</strong> {sidePanelData.time_spent} mins/week</p>
													<p>🖥️ <strong>Device:</strong> {sidePanelData.device}</p>
													<p>💬 <strong>Reason:</strong> {sidePanelData.reason}</p>
												</div>
											</div>
										</div>
									</div>

									<div>
										{/* pie chart placeholder */}
										<div ref={pieRef}
											style={{
												marginTop: '12px',
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center'
											}}></div>
									</div>
								</>
							)
						}



					</div>
				</>
			)}
		</div>
	);
};

export default FanFunnel;