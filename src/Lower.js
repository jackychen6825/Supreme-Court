import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./Lower.css";
import useWindowDimensions from "./WindowDimensions";

export default function Lower() {
  var width = useWindowDimensions();
  const justicesMap = {};

  const generateJusticesFromApi = async () => {
    const apiEndPoint =
      "https://frontend-exercise-api.herokuapp.com/justices/?format=json";

    fetch(apiEndPoint)
      .then((res) => res.json())
      .then((resJSON) => {
        for (const justice of resJSON) {
          let id = justice.id,
            name = justice.name,
            startDate = justice.start_date;

          justicesMap[id] = { name, startDate, votes: 0 };
        }
      });
  };
  const generateVotesFromApi = () => {
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

    Promise.all(promises).then((cases) => {
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

      generatePlotFromData(justicesMap);
    });
  };

  const generatePlotFromData = (info) => {
    const axis = [];

    Object.keys(info).forEach((key) => {
      let { votes, startDate } = info[key];
      startDate = startDate.split("T").shift();
      axis.push([startDate, votes]);
    });


    let w, h;

    if (width <= 360) {
      w = 350
      h = 240
    } else if (width > 360 && width <= 834) {
      w = 714
      h = 600
    } else {
      w = 1200
      h  = 600
    }

    const svg = d3
      .select(svgRef.current)
      .attr("width", w)
      .attr("height", h)
      .attr("overflow", "visible")
      .attr("margin-top", "100px")
      .attr("margin-left", "50px");

    var times = d3.extent(axis.map((pair) => new Date(pair[0])));

    const xScale = d3.scaleTime().domain(times).range([0, w]);
    const yScale = d3.scaleLinear().domain([0, 9000]).range([h, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append("g").attr("transform", `translate(0, ${h})`).call(xAxis);

    svg.append("g").call(yAxis);

    svg
      .append("text")
      .attr("x", w / 2)
      .attr("y", h + 50)
      .text("Start Date");

    svg
      .append("text")
      .attr("y", h / 2)
      .attr("x", -100)
      .text("Votes");

    svg
      .selectAll()
      .data(axis.map((data) => [new Date(data[0]), data[1]]))
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[0]))
      .attr("cy", (d) => yScale(d[1]))
      .attr("r", 2);
  };

  const svgRef = useRef();

  useEffect(() => {
    generateJusticesFromApi();
    generateVotesFromApi();
  }, [width]);

  return (
    <div className="lower-container">
      <div className="data-header-container">Data</div>
      <div className="data-container">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
