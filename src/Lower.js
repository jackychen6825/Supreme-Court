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
    //get the necessary values width and height ---
    const container = document.getElementById("svg-container");
    const w = container.clientWidth;
    const h = container.clientHeight;

    //get the x and y coordinates for each circle ---
    var axis = [];

    Object.keys(justicesMap).forEach((key) => {
      let { votes, startDate } = justicesMap[key];
      startDate = startDate.split("T").shift();

      //pushing different values based on the current width (either face value or in thousands)
      if (w <= 350) {
        axis.push([startDate, votes / 1000]);
      } else {
        axis.push([startDate, votes]);
      }
    });

    //remove the current svg and the chart to render a new one ---
    d3.select("svg").remove();

    //select the container div and append the new svg
    d3.select("#svg-container")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    //select the newly appended svg and render chart below ---
    var svg = d3
      .select("svg")
      .attr("overflow", "visible")
      .attr("margin-top", "100px")
      .attr("margin-left", "50px");

    var times = d3.extent(axis.map((pair) => new Date(pair[0])));

    const xScale = d3.scaleTime().domain(times).range([0, w]);

    let yScale;

    if (w <= 350) {
      yScale = d3.scaleLinear().domain([0, 9]).range([h, 0]);
    } else {
      yScale = d3.scaleLinear().domain([0, 9000]).range([h, 0]);
    }

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    //setting the axis
    svg.append("g").attr("transform", `translate(0, ${h})`).call(xAxis);
    svg.append("g").call(yAxis);

    //creating axis labels based on the width
    if (w <= 350) {
      svg
        .append("text")
        .attr("x", w / 2)
        .attr("y", h + 30)
        .attr("font-size", 10)
        .text("Start Date");
      svg
        .append("text")
        .attr("y", -10)
        .attr("font-size", 10)
        .text("Votes in 000's");
    } else {
      svg
        .append("text")
        .attr("x", w / 2)
        .attr("y", h + 40)
        .text("Start Date");
      svg.append("text").attr("y", -10).text("Votes");
    }

    //plotting the circles
    svg
      .selectAll()
      .data(axis.map((data) => [new Date(data[0]), data[1]]))
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[0]))
      .attr("cy", (d) => yScale(d[1]))
      .attr("r", 2);
  };

  //when the window is resized, generate the scatter plot again
  window.addEventListener("resize", generatePlotFromData);

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
      <div id="svg-container" className="data-container"></div>
    </div>
  );
}
