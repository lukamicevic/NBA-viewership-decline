import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './HumanGrid.css';

const questions = [
	{ key: 'missed_aspects', label: 'What do you miss from the older NBA?' },
	{ key: 'prefers_current_playstyle', label: 'Do you prefer the current NBA style?' },
	{ key: 'engagement_change_over_time', label: 'How has your NBA engagement changed?' }
];

const HumanGrid = () => {
	const svgRef = useRef();
	const chatboxRef = useRef();
	const speechRef = useRef();
	const containerRef = useRef();


	const [selectedFan, setSelectedFan] = useState(null);
	const [chatboxPos, setChatboxPos] = useState({ x: 0, y: 0 });
	const [showQuestions, setShowQuestions] = useState(false);
	const [fullAnswer, setFullAnswer] = useState(null);
	const [showDescription, setShowDescription] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setShowDescription(entry.isIntersecting);
			},
			{ threshold: 0.7 }
		);
		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (fullAnswer && speechRef.current) {
			const bubbleRect = speechRef.current.getBoundingClientRect();
			const svgRect = svgRef.current.getBoundingClientRect();

			const adjustedLeft = chatboxPos.x - (bubbleRect.width / 2) + 70;
			const adjustedTop = chatboxPos.y - bubbleRect.height + 50;


			speechRef.current.style.left = `${adjustedLeft}px`;
			speechRef.current.style.top = `${adjustedTop}px`;
		}
	}, [fullAnswer, chatboxPos]);




	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				chatboxRef.current &&
				!chatboxRef.current.contains(event.target)
			) {
				setSelectedFan(null);
				setShowQuestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);


	useEffect(() => {
		d3.json('data/responses.json').then(data => {
			const svg = d3.select(svgRef.current);
			const bleacherRowY = [60, 100, 140, 185];

			const groups = svg.selectAll('g')
				.data(data)
				.enter()
				.append('g')
				.attr("transform", function (d, i) {
					const peoplePerRow = [5, 6, 6, 7, 10];
					let row = 0, count = 0;
					while (i >= count + peoplePerRow[row]) {
						count += peoplePerRow[row];
						row++;
					}
					const colInRow = i - count;

					const jitterX = (Math.random() - 0.5) * 5;
					const x = colInRow * 60 + (row % 2 === 0 ? 60 : 30) + jitterX;
					const y = bleacherRowY[row];

					d3.select(this).property('_x', x).property('_y', y);

					return `translate(${x}, ${y})`;
				})
				.style('cursor', 'pointer')
				.on('click', function (event, d) {
					setSelectedFan(d);
					const x = d3.select(this).property('_x');
					const y = d3.select(this).property('_y');
					setChatboxPos({ x, y });
					setShowQuestions(true);
					setFullAnswer(null);
				});

			groups.append("image")
				.attr("href", d => d.is_fan === "Yes"
					? "avatars/fan-green.svg".replace("fan-green", `fan-green-${Math.floor(Math.random() * 6) + 1}`)
					: "avatars/fan-red.svg".replace("fan-red", `fan-red-${Math.floor(Math.random() * 4) + 1}`)
				)
				.attr("width", 40)
				.attr("height", 40);

			groups.on('mouseover', function (event, d) {
				const x = d3.select(this).property('_x');
				const y = d3.select(this).property('_y');
				d3.select(this)
					.transition()
					.duration(200)
					.attr('transform', `translate(${x}, ${y - 8})`);
			})
				.on('mouseout', function (event, d) {
					const x = d3.select(this).property('_x');
					const y = d3.select(this).property('_y');
					d3.select(this)
						.transition()
						.duration(200)
						.attr('transform', `translate(${x}, ${y})`);
				});





		});
	}, []);

	const askFan = (key) => {
		if (!selectedFan) return;
		const full = selectedFan[key] || 'No response.';
		setFullAnswer(full);
		setShowQuestions(false);
		setTimeout(() => setFullAnswer(null), 3000);
	};

	return (
		<div ref={containerRef} 
		style={{
			display: 'flex',
			justifyContent: "center",
			alignItems: "center",
			flexDirection: "column"
		}}>
			<h2>People Chart</h2>
			<div className={`human-grid-description ${showDescription ? 'visible' : ''}`}>
				<p>Every face here is a real NBA fan’s voice. Click on them to hear what they 
					think about today’s NBA, and see their story unfold in a speech bubble.
				</p>
			</div>
			<div
				style={{
					backgroundImage: `url('/images/bleachers.png')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					width: '500px',
					height: '500px',
					position: 'relative',
					marginTop: '20px'
				}}
			>
				<svg ref={svgRef} width={500} height={500}>
				</svg>

				{showQuestions && (
					<div ref={chatboxRef} className='chatbox'
						style={{
							position: 'absolute',
							left: chatboxPos.x + 70,
							top: chatboxPos.y + 40,
							width: '300px'
						}}>
						<div>
							<h3>Ask a Fan</h3>
							<div className="questions">
								{questions.map(q => (
									<button key={q.key} className="btn btn-outline-primary" onClick={() => askFan(q.key)}>
										{q.label}
									</button>
								))}
							</div>
						</div>
					</div>
				)}

				{
					fullAnswer && (
						<div ref={speechRef}
							className='speech-bubble' style={{
								position: 'absolute',
								pointerEvents: 'none'
							}}>
							{fullAnswer}
						</div>
					)
				}
			</div>
		</div>
	);
};

export default HumanGrid;
