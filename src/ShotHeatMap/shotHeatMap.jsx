import * as d3 from 'd3';
import React from 'react';
import { Step } from 'react-scrollama';
import './shotHeatMap.css';

function ShotHeatMap() {
    const pixelSize = 6;
    const precision = 100;
    const heightAdjust = 60;
    const margin = 0;

    const [shots, setShots] = React.useState([]);
    const [makes, setMakes] = React.useState([]);
    const [locations, setLocations] = React.useState([]);
    const [selection, setSelection] = React.useState("shots");
    const [year, setYear] = React.useState("2000");
    function LoadData(year) {

        d3.json("/data/shotHeatData/" + year + ".json", d3.autoType).then(loadedData => {

            setShots(loadedData.numShots);
            setMakes(loadedData.numMade);
            setLocations(loadedData.threePointShots);
        });

    }
    React.useEffect(() => {
        LoadData("2000");

    }, []);

    function getRectangles() {
        let rects = [];
        if (selection === "shots") {
            let colorScale = d3.scaleSequential(d3.interpolateInferno).domain([0, 200]);
            for (let i = 0; i < shots.length; i++) {
                for (let j = 0; j < shots[i].length; j++) {
                    rects.push(
                        <rect
                            key={`${i}-${j}`}
                            x={j * pixelSize}
                            y={(i * pixelSize) + heightAdjust}
                            width={pixelSize}
                            height={pixelSize}
                            fill={colorScale(shots[i][j])}
                        />
                    );
                }
            }
        }
        if (selection === "makes") {
            let colorScale = d3.scaleSequential(d3.interpolateInferno).domain([0, 100]);
            for (let i = 0; i < makes.length; i++) {
                for (let j = 0; j < makes[i].length; j++) {
                    rects.push(
                        <rect
                            key={`${i}-${j}`}
                            x={j * pixelSize}
                            y={(i * pixelSize) + heightAdjust}
                            width={pixelSize}
                            height={pixelSize}
                            fill={colorScale(shots[i][j])}
                        />
                    );
                }
            }
        }
        if (selection === "locations") {
            let colors = ['#ff0000', '#00ff00', '#0000ff'];
            for (let i = 0; i < locations.length; i++) {
                for (let j = 0; j < locations[i].length; j++) {
                    rects.push(
                        <rect
                            key={`${i}-${j}`}
                            x={j * pixelSize}
                            y={(i * pixelSize) + heightAdjust}
                            width={pixelSize}
                            height={pixelSize}
                            fill={colors[locations[i][j]]}
                        />
                    );
                }
            }
        }
        return rects;
    }



    if (shots.length == 0) {
        return (

            <p>Loading...</p>

        )

    }
    return (
        <div className="shotHeatMapContainer">

            <p className="shotHeatMapTitle">Shot Frequency By Year</p>
            
            <svg className="courtSvg" width={(pixelSize * precision) + 2 * margin} height={((pixelSize * precision) + 2 * margin) - 50}>

                <g className="courtGraph">
                    {getRectangles()}
                </g>

                <image href="/data/shotHeatData/courtnobg.png" className="courtOutline" alt="Basketball Court" width={(pixelSize * precision) + 2 * margin} height={(pixelSize * precision) + 2 * margin} />
                <defs>
                    <linearGradient id="legendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        {
                            Array.from({ length: 10 }, (_, i) => {
                                const offset = (i / 9) * 100;
                                const value = selection === "makes" ? (offset / 100) * 100 : (offset / 100) * 200;
                                const color = d3.interpolateInferno(value / (selection === "makes" ? 100 : 200));
                                return <stop key={i} offset={`${offset}%`} stopColor={color} />;
                            })
                        }
                    </linearGradient>
                </defs>
                <g transform={`translate(0, 20)`}>
                    <text x={0} y={-10} fontSize="12" fill="white">
                        Shot rate per season (0-200+)
                    </text>
                    <rect width={1000} height={10} fill="url(#legendGradient)" stroke="black" />
                    <g transform="translate(0, 20)">
                        <text x={0} y={10} fontSize="10" fill="white">0</text>
                        <text x={490} y={10} fontSize="10" fill="white">
                            100
                        </text>
                        <text x={975} y={10} fontSize="10" fill="white">
                            200+
                        </text>
                    </g>
                </g>
            </svg>

            <div style={{ width: "100%", display: 'flex', justifyContent: 'center', position: 'absolute', top: '30px' }}>
				<div className="yearSlider">
					<input id="sliderInput" type="range" min="2000" max="2021" step="1" defaultValue="2000" onChange={(e) => { LoadData(e.target.value); setYear(e.target.value) }} />
					
				</div>
			</div>
            <div className="yearText">
                <h1 id='yearDisplayShotMap'>{year}</h1>
            </div>

        </div>
    )
}

export default ShotHeatMap;