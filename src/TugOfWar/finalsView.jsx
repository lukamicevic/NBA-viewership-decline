import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const ViewershipAndInstagramCharts = () => {
  const [currentView, setCurrentView] = useState('raw');
  const viewershipChartRef = useRef(null);

  useEffect(() => {
    Papa.parse('data/tugwar/Sports_Data4.csv', {
      download: true,
      header: true,
      complete: function (results) {
        const data = results.data;
        const years = data.map(row => row['Year']);
        const rawData = {
          superBowl: data.map(row => parseFloat(row['Super Bowl Viewers (M)']) || null),
          mlb: data.map(row => parseFloat(row['MLB Viewers (M)']) || null),
          nba: data.map(row => parseFloat(row['NBA Viewers (M)']) || null),
          fifa: data.map(row => parseFloat(row['FIFA Viewers (M)']) || null)
        };
        
        drawViewershipChart(years, rawData);
      }
    });
  }, [currentView]);

  const toPercentSeries = (values) => {
    let base = null;
    return values.map(v => {
      if (v !== null && base === null) base = v;
      return v !== null && base !== null ? ((v - base)).toFixed(2) : null;
    });
  };

  const drawViewershipChart = (years, rawData) => {
    const ctx = document.getElementById('viewershipChart').getContext('2d');
    if (viewershipChartRef.current) {
      viewershipChartRef.current.destroy();
    }

    const percentData = {
      superBowl: toPercentSeries(rawData.superBowl),
      mlb: toPercentSeries(rawData.mlb),
      nba: toPercentSeries(rawData.nba),
      fifa: toPercentSeries(rawData.fifa)
    };

    const datasets = [
      {
        label: 'Super Bowl',
        data: currentView === 'percent' ? percentData.superBowl : rawData.superBowl,
        borderColor: 'blue',
        fill: false
      },
      {
        label: 'MLB World Series',
        data: currentView === 'percent' ? percentData.mlb : rawData.mlb,
        borderColor: 'red',
        fill: false
      },
      {
        label: 'NBA Finals',
        data: currentView === 'percent' ? percentData.nba : rawData.nba,
        borderColor: 'green',
        fill: false
      },
      {
        label: 'UEFA Champions League Final',
        data: currentView === 'percent' ? percentData.fifa : rawData.fifa,
        borderColor: 'orange',
        fill: false
      }
    ];

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top',
            labels: { color: 'white' } 
          },
          title: {
            display: true,
            color: 'white',
            text: currentView === 'percent' 
              ? 'Viewership Growth Relative to 1984' 
              : 'Yearly Viewership'
          }
        },
        scales: {
          y: {
            ticks: { color: 'white' },
            title: {
              display: true,
              text: currentView === 'percent' ? 'Relative Growth' : 'Viewers',
              color: 'white'
            },
            grid: { color: 'rgba(255, 255, 255, 0.2)' },
            border: { color: 'white' }
          },
          x: {
            ticks: { color: 'white' },
            title: {
              display: true,
              text: 'Year',
              color: 'white'
            },
            grid: { color: 'rgba(255, 255, 255, 0.2)' },
            border: { color: 'white' }
          }
        }
      }
    });

    viewershipChartRef.current = newChart;
  };

  const toggleView = () => {
    setCurrentView(prev => (prev === 'raw' ? 'percent' : 'raw'));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Yearly Sports Viewership Trends (1984–2024)</h2>
      <button 
        onClick={toggleView} 
        style={{
          backgroundColor: 'white',
          color: 'black ',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          display: 'block',
          margin: '20px auto',
          cursor: 'pointer'
        }}
      >
        {currentView === 'raw' ? 'Switch to Relative Changes' : 'Switch to Raw Numbers'}
      </button>
      <canvas id="viewershipChart" width="1000" height="400" style={{ marginBottom: '50px' }}></canvas>
    </div>
  );
};

export default ViewershipAndInstagramCharts;
