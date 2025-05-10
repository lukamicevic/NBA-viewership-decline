import './stateEngagement.css';
import * as d3 from "d3";
import React from 'react';

var teams = [
    //Celtics:'#007a33',Nets:'#000',Knicks:'#f58426','Sixers':'#006bb6','76ers':'#006bb6',
    //Raptors:'#ce1141',Bulls:'#ce1141',Cavs:'#860038',Pistons:'#c8102e',Pacers:'#002d62',
    //Bucks:'#00471b',Hawks:'#e03a3e',Hornets:'#00788c',Heat:'#98002e',Magic:'#0077c0',
    //Wizards:'#002b5c',Nuggets:'#0e2240',Wolves:'#0c2340',Thunder:'#007ac1',Blazers:'#e03a3e',
    //Jazz:'#002b5c',Warriors:'#1d428a',Clippers:'#c8102e',Lakers:'#552583',Suns:'#e56020',
    //Kings:'#5a2d81',Rockets:'#ce1141',Spurs:'#000',Mavs:'#00538c',Grizz:'#5d76a9',
    //Pelicans:'#0c2340','NBA':'#1d428a'
    // Eastern Conference
    ["Atlanta Hawks", "Hawks", "#e03a3e"],
    ["Boston Celtics", "Celtics", "#007a33"],
    ["Brooklyn Nets", "Nets", "#777777"],
    ["Charlotte Hornets", "Hornets", "#00788c"],
    ["Chicago Bulls", "Bulls", "#ce1141"],
    ["Cleveland Cavaliers", "Cavaliers", "#860038"],
    ["Detroit Pistons", "Pistons", "#c8102e"],
    ["Indiana Pacers", "Pacers", "#002d62"],
    ["Miami Heat", "Heat", "#98002e"],
    ["Milwaukee Bucks", "Bucks", "#00471b"],
    ["Washington Wizards", "Wizards", "#002b5c"],
    ["New York Knicks", "Knicks", "#f58426"],
    ["Toronto Raptors", "Raptors", "#ce1141"],
    ["Orlando Magic", "Magic", "#0077c0"],
    ["Philadelphia 76ers", "P76ers", "#006bb6"],
    // Western Conference
    ["Phoenix Suns", "Suns", "#e56020"],
    ["Portland Trail Blazers", "Blazers", "#e03a3e"],
    ["Sacramento Kings", "Kings", "#5a2d81"],
    ["San Antonio Spurs", "Spurs", "#777777"],
    ["Utah Jazz", "Jazz", "#002b5c"],
    ["Dallas Mavericks", "Mavericks", "#00538c"],
    ["Denver Nuggets", "Nuggets", "#0e2240"],
    ["Golden State Warriors", "Warriors", "#1d428a"],
    ["Houston Rockets", "Rockets", "#ce1141"],
    ["Los Angeles Clippers", "Clippers", "#c8102e"],
    ["Los Angeles Lakers", "Lakers", "#552583"],
    ["Memphis Grizzlies", "Grizzlies", "#5d76a9"],
    ["Minnesota Timberwolves", "Timberwolves", "#0c2340"],
    ["Oklahoma City Thunder", "Thunder", "#007ac1"],
    ["New Orleans Pelicans", "Pelicans", "#0c2340"],
]

let states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "District of Columbia"
]


function StateEngagementHeatMap() {

    const [features, setFeatures] = React.useState([]);
    const [selection, setSelection] = React.useState("");
    const [stateVals, setStateVals] = React.useState({
        "Alabama": 0,
        "Alaska": 0,
        "Arizona": 0,
        "Arkansas": 0,
        "California": 0,
        "Colorado": 0,
        "Connecticut": 0,
        "Delaware": 0,
        "Florida": 0,
        "Georgia": 0,
        "Hawaii": 0,
        "Idaho": 0,
        "Illinois": 0,
        "Indiana": 0,
        "Iowa": 0,
        "Kansas": 0,
        "Kentucky": 0,
        "Louisiana": 0,
        "Maine": 0,
        "Maryland": 0,
        "Massachusetts": 0,
        "Michigan": 0,
        "Minnesota": 0,
        "Mississippi": 0,
        "Missouri": 0,
        "Montana": 0,
        "Nebraska": 0,
        "Nevada": 0,
        "New Hampshire": 0,
        "New Jersey": 0,
        "New Mexico": 0,
        "New York": 0,
        "North Carolina": 0,
        "North Dakota": 0,
        "Ohio": 0,
        "Oklahoma": 0,
        "Oregon": 0,
        "Pennsylvania": 0,
        "Rhode Island": 0,
        "South Carolina": 0,
        "South Dakota": 0,
        "Tennessee": 0,
        "Texas": 0,
        "Utah": 0,
        "Vermont": 0,
        "Virginia": 0,
        "Washington": 0,
        "West Virginia": 0,
        "Wisconsin": 0,
        "Wyoming": 0,
        "District of Columbia": 0
    });

    const [teamInterest, setTeamInterest] = React.useState({});

    d3.select("#tooltip")
        .style("opacity", 0)

    function loadPaths() {

        d3.json("data/stateEngagement/gz_2010_us_040_00_20m.json", d3.autoType).then(loadedData => {
            setFeatures(loadedData.features);

        });



    }



    function loadVals() {
        d3.json("data/stateEngagement/teamStateInterest.json", d3.autoType).then(loadedData => {
            setTeamInterest(loadedData);
            //console.log(loadedData);
        });
    }

    function getPaths() {
        let scaleVals = 1
        let raptorsAdjust = (selection == "Raptors") ? 0.2 : 1;

        const projection = d3.geoAlbersUsa()
            .scale(1300)
            .translate([700, 300]);
        const geoPathGenerator = d3.geoPath().projection(projection);
        let selectedTeam = teams.find(t => t[1] === selection);
        //console.log(selectedTeam);
        let color = selectedTeam ? selectedTeam[2] : "#000000";
        //console.log(color);
        const colorScale = d3.scaleSequential(d3.interpolateRgb("#000", color)).domain([0, 100]);

        if (stateVals == null || features.length === 0) {
            return <text x={500} y={500} textAnchor="middle">Loading...</text>;
        }
        //console.log(yearVals);
        return features.map((shape) => {
            let name = shape.properties.NAME;


            //console.log(yearVal);   

            return (
                <path
                    key={name.replace(/\s+/g, '')}
                    d={geoPathGenerator(shape)}
                    stroke="black"
                    fill={
                        colorScale(((stateVals[name] * scaleVals) + (100 * (1 - scaleVals))) * raptorsAdjust)
                    }
                    opacity={stateVals[name] === 0 ? 0.2 : 1}
                    onMouseEnter={(event) => {

                        d3.select("#tooltip")
                            .style("opacity", stateVals[name] === 0 ? 0 : 1)
                            .html(name + ": " + (Math.round(stateVals[name] * raptorsAdjust)) + " %")
                            .style("left", (event.pageX + 5) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    }
                    }
                    onMouseMove={(event) => {
                        d3.select("#tooltip")
                            .style("left", (event.pageX + 5) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    }
                    }
                    onMouseLeave={() => {
                        d3.select("#tooltip")
                            .style("opacity", 0);
                    }}
                />
            );
        }
        );
    }

    function getLogos() {
        return teams.map((team, index) => {
            let x = 0;
            let y = 0;
            if (index < 15) {
                x = 800 + (index % 5) * 75;
                y = Math.floor(index / 5) * 100 + 10;
            } else {
                x = 200 + (index % 5) * 75;
                y = Math.floor((index - 15) / 5) * 100 + 10;
            }
            let opacity = 0.5;
            if (team[1] === selection || selection === "") {
                opacity = 1;
            }
            return (
                <image key={team[1]} x={x} y={y} height="50" href={"data/stateEngagement/" + team[1] + ".png"} alt={team[0]} opacity={opacity} onMouseEnter={(event) => {

                    d3.select("#tooltip")
                        .style("opacity", 1)
                        .html(team[0])
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                    d3.select("#" + team[1])
                        .style("opacity", 1)
                        .style("height", "60px");
                }
                }
                    onMouseMove={(event) => {
                        d3.select("#tooltip")
                            .style("left", (event.pageX + 5) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    }
                    }
                    onMouseLeave={() => {
                        d3.select("#tooltip")
                            .style("opacity", 0);
                        d3.select("#" + team[1])
                            .style("opacity", 0.5)
                            .style("transform", "scale(1)");
                    }} onClick={() => {
                        setSelection(team[1]);
                        let values = teamInterest[team[1]];
                        let newStateVals = { ...stateVals };
                        for (let i = 0; i < states.length; i++) {
                            let found = false;
                            for (let j = 0; j < values.length; j++) {
                                if (states[i] === values[j]["name"]) {
                                    found = true;
                                    newStateVals[states[i]] = values[j]["score"];
                                    //console.log(values[j][1]);
                                }
                            }
                            if (!found) {
                                newStateVals[states[i]] = 0;
                            }
                        }
                        setStateVals(newStateVals);
                        //console.log(team[1]);
                    }} />
            );

        });
    }

    function getSelectedTeam() {
        if (selection === "") {
            return null;
        }
        let team = teams.find(t => t[1] === selection);
        if (team == null) {
            return null;
        }
        //console.log(team[1]);
        return (
            <image id={team[1] + "_selected"} x={575} y={300} height="200" href={"data/stateEngagement/" + team[1] + ".png"} alt={team[0]}
                onClick={() => {
                    setSelection("")
                    let newStateVals = { ...stateVals };
                    for (let i = 0; i < states.length; i++) {
                        newStateVals[states[i]] = 0;
                    }
                    setStateVals(newStateVals);
                }} />
        );
    }

    React.useEffect(() => {
        loadPaths();
        loadVals();
    }
        , []);

    // console.log(teams);
    return (
        <div className="stateEngagementContainer">
            <div className="stateEngagementTitle">
                <h2>State Engagement</h2>
                <h3>{(selection === "") ? "What does team interest look like? (Click a team to see interest ratings)" : teams.find((team) => {
                    if (team[1] == selection)
                        return team[0]
                })[0]}</h3>
            </div>


            <svg className="mapSVG" width={1400} height={1000}>
                <g transform="translate(0, 0)">
                    {getPaths()}
                    {getLogos()}
                    {getSelectedTeam()}
                    <defs>
                        <linearGradient id="colorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#000000" />
                            <stop offset="100%" stopColor={teams.find(t => t[1] === selection)?.[2] || "#000000"} />
                        </linearGradient>
                    </defs>
                    <g transform="translate(730, 900)">
                        <text x={0} y={-10} fontSize="12" fill="white" opacity={(selection == "" ? 0.2 : 1)}>Engagement (%)</text>
                        <rect width={300} height={15} fill="url(#colorGradient)" stroke="black" opacity={(selection == "" ? 0.2 : 1)} />
                        <g transform="translate(0, 20)">
                            <text x={0} y={10} fontSize="10" fill='white' opacity={(selection == "" ? 0.2 : 1)}>0</text>
                            <text x={140} y={10} fontSize="10" fill="white" opacity={(selection == "" ? 0.2 : 1)}>50</text>
                            <text x={290} y={10} fontSize="10" fill="white" opacity={(selection == "" ? 0.2 : 1)}>100</text>
                        </g>
                    </g>
                </g>
            </svg>


            <div id="tooltip"></div>
        </div>
    );
}

export default StateEngagementHeatMap;