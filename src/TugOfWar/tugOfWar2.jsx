import React, { useEffect, useRef, useState } from 'react';
import './tugOfWar.css'

const tugData = [
  {
    year: 2020,
    positive: [
      { label: "Bubble Tournament Novelty", weight: 1 },
      { label: "Young Talent Showcase", weight: 1 },
      { label: "Increased Streaming Access", weight: 1 },
      { label: "No Audience Noise", weight: 0 }
    ],
    negative: [
      { label: "COVID-19 shutdown", weight: 1 },
      { label: "Weaker Competition", weight: 1 },
      { label: "Low Star Power Finals", weight: 1 },
      { label: "Fragmented Streaming", weight: 0 }
    ],
    caption: [
      "Fragmented broadcast rights and a proliferation of streaming platforms make tracking down games almost a scavenger hunt: fans juggle cable packages, league passes, and three different apps just to catch a single tip-off.",
      "The abrupt COVID-19 impact of the 2019–20 season not only disrupted continuity but also accelerated new viewing habits that haven’t fully reverted."
    ]
  }
];

const TugOfWar2 = () => {
    const containerRef = useRef();
    const dummyRef = useRef();
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowDescription(entry.isIntersecting);
            },
            { threshold: 0.9 }
        );
        if (dummyRef.current) observer.observe(dummyRef.current);
        return () => observer.disconnect();
    }, []);

  useEffect(() => {
    const container = containerRef.current
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const scrollProgress = Math.min(
        Math.max((viewportHeight - rect.top) / rect.height, 0),
        1
      );

      const index = Math.floor(scrollProgress * tugData.length);

      setCurrentYearIndex(Math.min(index, tugData.length - 1));
    };

    // window.addEventListener('scroll', handleScroll);
    // handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const yearData = tugData.find(d => d.year === 2020);
  if (!yearData) return null;

  const positiveWeight = yearData.positive.reduce((sum, r) => sum + r.weight, 0);
  const negativeWeight = yearData.negative.reduce((sum, r) => sum + r.weight, 0);

  const leftRopeLength = 0 + positiveWeight * 95;
  const rightRopeLength = 0 + negativeWeight * 95;

  const centerDotStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '14px',
    height: '14px',
    background: 'dodgerblue',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '2'
  };
    Object.assign(centerDotStyle, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '14px',
        height: '14px',
        background: 'dodgerblue',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '2'
    });
  
  return (
    <>
    <h2 style={{ textAlign: 'center' }}>Tug Of War</h2>
    <div className={`tug-of-war-description ${showDescription ? 'visible' : ''}`}>
        <p>Beyond on-court changes, a host of off-court factors have chipped away at NBA viewership. This chart explores the many reasons that contribute to the NBA’s viewership decline over the last decade:</p>
    </div>
    <div ref={containerRef} style={{
      marginTop: '200px',
      height: '300vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div ref={dummyRef} style={{ height: '1px' }} />
      <div id="chart" style={{
        position: 'sticky',
        top: '40%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px'
      }}>
        
        <div id="year" style={{
          position: 'absolute',
          top: '-70px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontSize: '30px',
          fontWeight: 'bold',
          padding: '6px 12px',
          borderRadius: '8px',
          color: 'white',
          zIndex: '5'
        }}>
          {yearData.year}
        </div>

        <div id="positive-team" style={{
          position: 'absolute',
          top: '50%',
          left: '0%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {yearData.positive.map((reason, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <img src="data/tugwar/human3-green.svg" alt="green human" style={{ width: '60px', height: '60px' }} />
              <div style={{
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '13px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {reason.label}
              </div>
            </div>
          ))}
        </div>


        <div id="tug-inner" style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>

          <div id="left-rope" style={{
            position: 'absolute',
            left: `calc(50% - ${leftRopeLength}px)`,
            width: `${leftRopeLength}px`,
            height: '6px',
            background: 'yellow',
            transition: '0.5s'
          }}></div>


          <div id="right-rope" style={{
            position: 'absolute',
            left: `50%`,
            width: `${rightRopeLength}px`,
            height: '6px',
            background: 'yellow',
            transition: '0.5s'
          }}></div>


          <div id="center-dot" style={centerDotStyle}></div>

          {/* <div id="center-dot" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '14px',
            height: '14px',
            background: 'dodgerblue',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '2'
          }}></div> */}


          <div id="left-pullers" style={{
            position: 'absolute',
            left: '0',
            right: '50%',
            top: 'calc(50% + 10px)',
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'flex-end',
            paddingRight: '30px',
            pointerEvents: 'none',
            zIndex: '3',
            transition: '0.5s'
          }}>
            {Array.from({ length: positiveWeight }).map((_, i) => (
              <img key={i} src="data/tugwar/human-green.png" alt="puller" style={{ width: '100px' }} />
            ))}
          </div>


          <div id="right-pullers" style={{
            position: 'absolute',
            left: '50%',
            right: '0',
            top: 'calc(50% + 5px)',
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'flex-start',
            paddingLeft: '30px',
            pointerEvents: 'none',
            zIndex: '3',
            transition: '0.5s'
          }}>
            {Array.from({ length: negativeWeight }).map((_, i) => (
              <img key={i} src="data/tugwar/human-red.png" alt="puller" style={{ width: '100px' }} />
            ))}
          </div>
        </div>


        <div id="negative-team" style={{
          position: 'absolute',
          top: '50%',
          right: '0%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {yearData.negative.map((reason, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <img src="data/tugwar/human3-red-m.svg" alt="red human" style={{ width: '60px', height: '60px' }} />
              <div style={{
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '13px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {reason.label}
              </div>
            </div>
          ))}
        </div>


        <div id="negative-team" style={{
          position: 'absolute',
          top: '50%',
          right: '0%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {yearData.negative.map((reason, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <img src="data/tugwar/human3-red-m.svg" alt="red human" style={{ width: '60px', height: '60px' }} />
              <div style={{
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '13px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {reason.label}
              </div>
            </div>
          ))}
        </div>
    <div id="tug-of-war-caption" style={{
          position: 'absolute',
          bottom: '-500px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '16px',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          textAlign: 'left',
          width: '1200px'
        }}>
          <ul>
        {yearData.caption.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
        </div>
      </div>

    </div>
    </>
  );
};

export default TugOfWar2;
