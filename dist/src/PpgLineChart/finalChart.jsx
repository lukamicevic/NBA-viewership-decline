import React, { useState } from 'react';
import { Scrollama, Step } from 'react-scrollama';
import PpgLineChart from './ppgLineChart.jsx';
import AllCharts from './allCharts.jsx';
import './FinalPPGChart.css';

export default function FinalPPGChart() {
  const [mode, setMode] = useState('main'); 

  return (
    <div className="final-ppg-container">
    <div className="chart-sticky-wrapper">
        {mode === 'main' ? (
        <PpgLineChart />
        ) : (
        <div className={`all-charts-animation ${mode === 'split' ? 'enter' : ''}`}>
            <AllCharts />
        </div>
        )}
    </div>

      <Scrollama offset={0.9} onStepEnter={({ data }) => setMode(data)}>
        <Step data="main">
          <div className="step-spacer" />
        </Step>
        <Step data="split">
          <div className="step-spacer" />
        </Step>
      </Scrollama>
    </div>
  );
}