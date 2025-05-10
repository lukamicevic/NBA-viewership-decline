import React, { useRef, useEffect } from 'react';

import * as d3 from 'd3';
import './IntroSection.css';

function IntroSection({ }) {
	const contentRef = useRef(null);

	useEffect(() => {
		d3.select(contentRef.current)
			.style('opacity', 0)
			.transition()
			.duration(1000)
			.style('opacity', 1);
	}, []);

	return (


		<section className="intro-section">
			<div ref={contentRef} className="intro-content">
				<h1 className="intro-title">
					The NBA is More Popular Than Ever.<br />Why is Nobody Watching?
				</h1>
				<p className="intro-subtitle">
					A data-driven story by Luka Micevic, Venkata Shreesh Poojari, Anirudh Raghavendra Makuluri, Ethan Frink
				</p>
				<div className="scroll-cue">↓ Scroll to Explore ↓</div>
			</div>
		</section>


	);
}

export default IntroSection;
