import React from 'react';
import { Chart80s, Chart90s, Chart00s, Chart10s, Chart20s } from './decadeLineCharts.jsx';
import './allCharts.css';

export default function AllCharts() {
  return (
    <div className="all-charts-container">
      <Chart80s />
      <Chart90s />
      <Chart00s />
      <Chart10s />
      <Chart20s />
    </div>
  );
}
