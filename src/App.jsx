import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Scrollama, Step } from 'react-scrollama';

import './App.css';
import IntroSection from './IntroSection/IntroSection.jsx';
import ShotHeatMap from './ShotHeatMap/shotHeatMap.jsx';
import ViewershipAndInstagramCharts from './TugOfWar/finalsView.jsx';
import PopularityTrendsChart from './PopularityTrendsChart/popularityTrendsChart.jsx';
import StateEngagementHeatMap from './StateEngagement/stateEngagement.jsx';
import TugOfWar from './TugOfWar/tugOfWar.jsx';
import TugOfWar2 from './TugOfWar/tugOfWar2.jsx';
import TugOfWar3 from './TugOfWar/tugOfWar3.jsx';
import FanFunnel from './FanFunnel/FanFunnel.jsx';
import HumanGrid from './HumanGrid/HumanGrid.jsx';
import { textSlide } from './textSlide.js';
import PpgLineChart from './PpgLineChart/ppgLineChart.jsx';
import AllCharts     from './PpgLineChart/allCharts.jsx';

export default function App() {
  const [currentStep, setCurrentStep] = useState('intro');
  const contentRef = useRef(null);
  const prevStepRef = useRef(null);
  const canAdvance = useRef(true);


  function makeSentenceSteps(stepBase, slideKey, imgSrc) {
	const raw = textSlide[slideKey];
	const sentences = raw
	  .split(/(?<=\.)\s+/)
	  .map(s => s.trim())
	  .filter(Boolean);
  
	return sentences.map((sentence, i) => {
	  const isSteph = imgSrc.endsWith('steph.png');
	  const imgClass = isSteph
		? 'text-slide-image steph-image'
		: 'text-slide-image';
	  return {
		id: `${stepBase}-${i}`,
		component: (
		  <div className="text-slide">
			<p className="text-slide-content">{sentence}</p>
			<img
			  src={imgSrc}
			  className={imgClass}
			  alt=""
			/>
		  </div>
		),
	  };
	});
  }
  

  const introSteps      = makeSentenceSteps('text-intro', 'intro', '/images/kobe.png');
  const popularitySteps = makeSentenceSteps('text-popularity', 'popularity', '/images/msg.png');
  const stateMapSteps   = makeSentenceSteps('text-state-map-teams','state-map-teams','/images/celtics.png');
  const feedbackSteps   = makeSentenceSteps('text-feedback', 'feedback', '/images/kd.png');
  const three1Steps     = makeSentenceSteps('text-three-pointer-1','three-pointer-1','/images/harden.png');
  const three2Steps     = makeSentenceSteps('text-three-pointer-2','three-pointer-2','/images/steph.png');
  const ppgSteps        = makeSentenceSteps('text-points-per-game','points-per-game','/images/lebron.png');
  const conclusionSteps = makeSentenceSteps('text-conclusion', 'conclusion', '/images/media.png');

  const steps = [
    { id: 'intro', component: <IntroSection /> },

	...introSteps,

	{ id: 'viewershipDecline', component: <ViewershipAndInstagramCharts /> },

	...popularitySteps,

    { id: 'popularityTrendsChart', component: <PopularityTrendsChart /> },
	
	...stateMapSteps,

    { id: 'stateEngagementHeatMap', component: <StateEngagementHeatMap /> },

	...feedbackSteps,

    { id: 'fanFunnel', component: <FanFunnel /> },
    { id: 'humanGrid', component: <HumanGrid /> },

	...three1Steps,

    { id: 'shotHeatMap', component: <ShotHeatMap /> },

	...three2Steps,

    { id: 'ppg-main' },
    { id: 'ppg-split' },

	...ppgSteps,

    { id: 'tugOfWar', component: <TugOfWar /> },
    { id: 'tugOfWar2', component: <TugOfWar2 /> },
    { id: 'tugOfWar3', component: <TugOfWar3 /> },

	...conclusionSteps,

	{ id: 'thank-you',
		component: (
		<div className="text-slide thank-you-slide">
			<p className="thank-you-text">Thank You!</p>
		</div>
		)
	}

  ];

  const handleStepEnter = ({ data }) => {
	if (!canAdvance.current) return;
	canAdvance.current = false;
	setCurrentStep(data);
	setTimeout(() => {
	  canAdvance.current = true;
	}, 500);
  };

  useEffect(() => {
	const prev = prevStepRef.current;
	const curr = currentStep;
	const basePrev = prev ? prev.replace(/-\d+$/, '') : null;
	const baseCurr = curr.replace(/-\d+$/, '');
  
	if (basePrev !== baseCurr && contentRef.current) {
	  d3.select(contentRef.current)
		.style('opacity', 0)
		.transition().duration(800)
		.style('opacity', 1);
	}
  
	prevStepRef.current = curr;
  }, [currentStep]);

  return (
    <div className="story-container">
      <div className="background-fixed" />

      <div className="chart-sticky-wrapper">
        <div ref={contentRef} className="content-container">
          {currentStep === 'ppg-main' && <PpgLineChart />}
          {currentStep === 'ppg-split' && (
            <div className="all-charts-animation enter">
              <AllCharts />
            </div>
          )}
          {currentStep !== 'ppg-main' &&
           currentStep !== 'ppg-split' &&
           steps.find(s => s.id === currentStep)?.component}
        </div>
      </div>

	  <Scrollama offset={0.75} onStepEnter={handleStepEnter}>
        {steps.map(step => (
          <Step data={step.id} key={step.id}>
            <div className="step-spacer" />
          </Step>
        ))}
      </Scrollama>
    </div>
  );
}
