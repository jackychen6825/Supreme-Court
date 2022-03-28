import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./Lower.css";

export default function Lower() {
  const justicesMap = {};

  //populate the initial justice map --
  const generateJusticesFromApi = async () => {
    const URL =
      "https://frontend-exercise-api.herokuapp.com/justices/?format=json";

    const response = await fetch(URL);
    const resJSON = await response.json();

    for (const justice of resJSON) {
      const id = justice.id;
      const name = justice.name;
      const startDate = justice.start_date;

      justicesMap[id] = { name, startDate, votes: 0 };
    }
  };

  //populate the rest of the justice map information --
  const generateVotesFromApi = async () => {
    let start = 1790,
      end = 2030;

    const placeholder = new Array((end - start) / 10);
    placeholder.fill("");

    const timeFrames = placeholder.map((item, idx) => {
      let begin = start + idx * 10,
        end = begin + 10;

      return [begin.toString() + "0101", end.toString() + "0101"];
    });

    const promises = [];

    for (const [begin, end] of timeFrames) {
      const apiEndPoint = `https://frontend-exercise-api.herokuapp.com/cases/?after=${begin}&before=${end}&format=json`;
      promises.push(fetch(apiEndPoint).then((res) => res.json()));
    }

    const cases = await Promise.all(promises);

    for (const decade of cases) {
      for (const date in decade) {
        const { dissents, majority, other } = decade[date];

        dissents.forEach((id) => {
          justicesMap[id] = {
            ...justicesMap[id],
            votes: justicesMap[id].votes + 1,
          };
        });

        majority.forEach((id) => {
          justicesMap[id] = {
            ...justicesMap[id],
            votes: justicesMap[id].votes + 1,
          };
        });

        other.forEach((id) => {
          justicesMap[id] = {
            ...justicesMap[id],
            votes: justicesMap[id].votes + 1,
          };
        });
      }
    }
  };

  const generatePlotFromData = () => {
    const axis = [];

    Object.keys(justicesMap).forEach((key) => {
      let { votes, startDate } = justicesMap[key];
      startDate = startDate.split("T").shift();
      axis.push([startDate, votes]);
    });

    let w, h;

    w = 1200;
    h = 600;

    // const svg = d3
    //   .select(svgRef.current)
    //   .attr("width", w)
    //   .attr("height", h)
    //   .attr("overflow", "visible")
    //   .attr("margin-top", "100px")
    //   .attr("margin-left", "50px");

    d3.select(".data-container")
      .append("div")
      .classed("svg-container", true)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 1200 600")
      .classed("svg-content-responsive", true);

    const svg = d3
      .select(".svg-content-responsive")
      .attr("overflow", "visible")
      // .attr("margin-top", "100px")
      // .attr("margin-left", "50px")

    var times = d3.extent(axis.map((pair) => new Date(pair[0])));

    const xScale = d3.scaleTime().domain(times).range([0, w]);
    const yScale = d3.scaleLinear().domain([0, 9000]).range([h, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append("g").attr("transform", `translate(0, ${h})`).call(xAxis);

    svg.append("g").call(yAxis);

    svg.append("text").attr("x", 600).attr("y", 650).text("Start Date");

    svg.append("text").attr("y", 600).attr("x", -50).text("Votes");

    svg
      .selectAll()
      .data(axis.map((data) => [new Date(data[0]), data[1]]))
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[0]))
      .attr("cy", (d) => yScale(d[1]))
      .attr("r", 2);
  };;

  const svgRef = useRef();

  useEffect(() => {
    async function combined() {
      await generateJusticesFromApi(); 
      await generateVotesFromApi();
      generatePlotFromData();
    }

    combined();
  }, []);

  return (
    <div className="lower-container">
      <div className="data-header-container">Data</div>
      <div  className="data-container">
      </div>
    </div>
  );
}
