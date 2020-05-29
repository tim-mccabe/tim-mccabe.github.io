var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//Set initial parameters
//Set a variable to store the chart data
var Data = null;
//Set the default x-axis label
var chosenXAxis = "Poverty";
//Set the default y-axis label
var chosenYAxis = "Obesity";
var xAxisLabels = ["poverty", "age", "income"];
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "pverty": "In Poverty (%)",
                    "age": "Age (Median)",
                    "income": "Household Income (Median)",
                    "obesity": "Obese (%)",
                    "smokes": "Smokes (%)",
                    "healthcare": "Lacks Healthcare (%)"};
var axisPadding = 20;

// function used for updating xy-scale var upon click on axis label
function xScale(Data, chosenAxis, xy) {
    var axisRange = (xy === "x") ? [0, width]:[height, 0]

    // create scales
    var LinearScale = d3.scaleLinear()
      .domain([d3.min(Data, d => d[chosenAxis]) * 0.8,
        d3.max(Data, d => d[chosenAxis]) * 1.2
      ])
      .range(axisRange);
  
    return LinearScale;
  
  }
  
  // function used for updating xyAxis var upon click on axis label
  function renderAxes(newScale, Axis, xy) {
    var posAxis =  (xy === "x") ? d3.axisBottom(newScale):d3.axisLeft(newScale);
  
    xAxis.transition()
      .duration(1000)
      .call(posAxis);
  
    return Axis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newScale, chosenAxis, xy) {

    circlesGroup.selectAll("circle")
      .transition()
      .duration(1000)
      .attr(`c${xy}`, d => newScale(d[chosenAxis]));

    circlesGroup.selectAll("text")
      .transition()
      .duration(1000)
      .attr(`c${xy}`, d => newScale(d[chosenAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([-8, 0])
      .html(function(d) {
        return (`${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }

// function to update the scatter plot based on selected axis
function updateChart() {
    var value = d3.select(this).attr("value");
    var xy = xAxisLabels.includes(value) ? "x":"y";
    var circlesGroup = d3.selectAll("#circlesGroup");
    var axis = (xy ==="x") ? d3.select("#xAxis"):d3.select("#yAxis");
    chosenAxis = (xy === "x") ? chosenXAxis:chosenYAxis;

    if (value !== chosenAxis) {
        // replaces chosenAxis with selected value
        if(xy === "x") {
            chosenXAxis = value;
        }
        else {
            chosenYAxis = value;
        };

        // update new chosenAxis
        chosenAxis = (xy === "x") ? chosenXAxis:chosenYAxis;
        // updates xy scale for new data
        linearScale = scale(Data, chosenAxis, xy);
        // updates chosen axis with transition
        axis = renderAxis(linearScale, axis, xy);
        // updates circles with new chosen axis values
        circlesGroup = renderCircles(circlesGroup, linearScale, chosenAxis, xy);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        // Parse through the chosen Axis Labels and reset the active/inactive + visibility
        axisLabels = (xy === "x") ? xAxisLabels:yAxisLabels
        axisLabels.forEach(label => {
            if(label === value) {
                // Text Label
                d3.select(`[value=${label}]`).classed("active", true);
                d3.select(`[value=${label}]`).classed("inactive", false);
                // Rect switch axis
                d3.select(`[value=${xy+label}]`).classed("invisible", true);
            }
            else { // not selected
                // Text Label
                d3.select(`[value=${label}]`).classed("active", false);
                d3.select(`[value=${label}]`).classed("inactive", true);
                // Rect switch axis
                d3.select(`[value=${xy+label}]`).classed("invisible", false);
            }
        });
    };
}

//function updates the axis labels tooltip
function updateLabelsTooltip(xy, labelEnter) {
    //reverse xy for move to opposite axis
    xy = (xy === "x") ? "y":"x";
    //add tooptip to the rectangle tag
    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(d => `Move ${d} to ${xy}-axis`);

    svg.call(tool_tip);
    //add the event handlers
    labelEnter.classed("active inactive", true)
        .on("mouseenter", tool_tip.show)
        .on("mouseleave", tool_tip.hide)
        .on("mousedown", tool_tip.hide);
}

// function updates the rect tag into axis label group
function updateLabelsRect(xy, xPos, labelsRect) {
    // Set the size of the square (rect)
    var squareSize = 12;
    // Define chosenAxis by xy
    var chosenAxis = (xy === "x") ? chosenXAxis : chosenYAxis;
    // Add rect tag
    var enterlabelsRect = null;
    // Append rect tag
    enterlabelsRect = labelsRect.enter()
        .append("rect")
        .merge(labelsRect)
        .attr("x", xPos)
        .attr("y", (d,i) => (i+1)*axisPadding-squareSize)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .classed("stateRect", true)
        .classed("invisible", d => (d === chosenAxis) ? true:false)
        .attr("value", d => xy+d)
        .on("click", updateLabel);;

    // Return enter to be able to append tooltip
    return enterlabelsRect;
}

// function updates the text tag into axis label group
function updateLabelsText(xy, xPos, labelsText) {
    // Define chosenAxis by xy
    var chosenAxis = (xy === "x") ? chosenXAxis : chosenYAxis;
    // Add text tag
    var enterlabelsText = null; 
    
    labelsText.enter()
        .append("text");
    // Append text tag
    enterlabelsText = labelsText.enter()
        .append("text")
        .merge(labelsText)
        .attr("x", xPos)
        .attr("y", (d,i) => (i+1)*axisPadding)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d === chosenAxis) ? true:false)
        .classed("inactive", d => (d === chosenAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);
}

// function updates the axis labels after moving one of the axes
function updateLabel() {
    // get move value of selection and slice it for the xy axis and axis label value
    var moveLabel = d3.select(this).attr("value");
    var oldAxis = moveLabel.slice(0,1);
    var selectedLabel = moveLabel.slice(1);

    // Move axis label to the other axis
    if (oldAxis === "x") {
        // Remove label from x-axis labels
        xAxisLabels = xAxisLabels.filter(e => e !== selectedLabel);
        // Add label to yLabels labels
        yAxisLabels.push(selectedLabel);
    } 
    else {
        // Remove label from y-axis labels
        yAxisLabels = yAxisLabels.filter(e => e !== selectedLabel);
        // Add label to xLabels labels
        xAxisLabels.push(selectedLabel);
    }

    // Update group for x axis labels group of rect + text
    var xLabels = d3.select("#xLabels");
    // append the rect for move labels
    var xLabelsRect = xLabels.selectAll("rect")
        .data(xAxisLabels);
    // update labels rect tags
    xEnterLabelsRect = updateLabelsRect("x", -120, xLabelsRect);
    // update tooptip on rect
    updateLabelsTooltip("x", xEnterLabelsRect);
    // Remove old labels rect
    xLabelsRect.exit().remove();
    // append the text for the x-axis labels
    var xLabelsText = xLabels.selectAll("text")
        .data(xAxisLabels);
    // update labels text
    updateLabelsText("x", 0, xLabelsText);
    // Remove any excess old data
    xLabelsText.exit().remove();
    // Update group for y axis labels group of rect + text
    var yLabels = d3.select("#yLabels");
    // append the rect for move labels
    var yLabelsRect = yLabels.selectAll("rect")
        .data(yAxisLabels);
    // update labels rect tags
    yEnterLabelsRect = updateLabelsRect("y", -45, yLabelsRect);
    // update tooptip on rect tags
    updateLabelsTooltip("y", yEnterLabelsRect);
    // remove old labels rect tags
    yLabelsRect.exit().remove();
    // append the text for the x-axis labels
    var yLabelsText = yLabels.selectAll("text")
        .data(yAxisLabels);
    // update labels text tag
    updateLabelsText("y", margin.top, yLabelsText);
    // Remove any excess old data
    yLabelsText.exit().remove();
}

// function initialize the chart elements
function init() {
    // variable radius for circle
    var r = 10;
    // Create initial xLinearScale, yLinearScale
    var xLinearScale = scale(Data, chosenXAxis, "x");
    var yLinearScale = scale(Data, chosenYAxis, "y");

    // Create initial axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .attr("id", "xAxis")
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("axis", true)
      .attr("id", "yAxis")
      .call(leftAxis);
      
    // Define the data for the circles + text
    var elem = chartGroup.selectAll("g circle")
        .data(Data);
 
    // Create and place the "blocks" containing the circle and the text  
    var elemEnter = elem.enter()
        .append("g")
        .attr("id", "elemEnter");
    
    // Create the circle for each block
    elemEnter.append("circle")
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', r)
        .classed("stateCircle", true);
    
    // Create the text for each circle
    elemEnter.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .classed("stateText", true)
        .attr("font-size", parseInt(r*0.8))
        .text(d => d.abbr);
  
    // Create group for xLabels: x-axis label
    var xLabels = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`)
        .classed("atext", true)
        .attr("id", "xLabels");
    // Create rect for x-axis move label
    var xLabelsRect = xLabels.selectAll("rect")
        .data(xAxisLabels)
    var enterXLabelsRect = xLabelsRect.enter()
        .append("rect")
        .attr("x", -120)
        .attr("y", (d,i) => (i+1)*axisPadding-12)
        .attr("width", 12)
        .attr("height", 12)
        .classed("stateRect", true)
        .classed("invisible", d => (d === chosenXAxis) ? true:false)
        .attr("value", d => "x"+d)
        .on("click", updateLabel);
    // update tooptip on rect
    updateLabelsTooltip("x", enterXLabelsRect);
    // Create text of the x-axis label
    xLabels.selectAll("text")
        .data(xAxisLabels)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", (d,i) => (i+1)*axisPadding)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d === chosenXAxis) ? true:false)
        .classed("inactive", d => (d === chosenXAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);

    // Create group for yLabels: y-axis labels
    var yLabels = chartGroup.append("g")
        .attr("transform", `rotate(-90 ${(margin.left/2)} ${(chartHeight/2)+60})`)
        .classed("atext", true)
        .attr("id", "yLabels");
    // Create rect for y-axis move label
    var yLabelsRect = yLabels.selectAll("rect")
        .data(yAxisLabels);
    var enterYLabelsRect = yLabelsRect.enter()
        .append("rect")
        .attr("x", -45)
        .attr("y", (d,i) => (i+1)*axisPadding-12)
        .attr("width", 12)
        .attr("height", 12)
        .classed("stateRect", true)
        .classed("invisible", d => (d === chosenYAxis) ? true:false)
        .attr("value", d => "y"+d)
        .on("click", updateLabel);
    // update tooptip on rect
    updateLabelsTooltip("y", enterYLabelsRect);
    // Create text of the y-axis label
    yLabels.selectAll("text")
        .data(yAxisLabels)
        .enter()
        .append("text")
        .attr("x", margin.top)
        .attr("y", (d,i) => (i+1)*axisPadding)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d === chosenYAxis) ? true:false)
        .classed("inactive", d => (d === chosenYAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);

    // updateToolTip function
    var elemEnter = updateToolTip(chosenXAxis, chosenYAxis, elemEnter);
};

// Load data from data.csv
d3.csv("demographic_data.csv").then((data, error) => {
    // Throw an error if one occurs
    console.log(data);
    if (error) throw error;
  
    // Parse data: Cast the data values to a number
    data.forEach(d => {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.obesity = +d.obesity;
      d.healthcare = +d.healthcare;
      d.smokes = +d.smokes;
    });

    // Load data into acsData
    Data = data;
    // Initialize scatter chart
    init();
});