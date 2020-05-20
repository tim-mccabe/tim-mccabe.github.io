// var svgWidth = 960;
// var svgHeight = 500;

// var margin = {
//   top: 20,
//   right: 40,
//   bottom: 80,
//   left: 100
// };

// var width = svgWidth - margin.left - margin.right;
// var height = svgHeight - margin.top - margin.bottom;

// // Create an SVG wrapper, append an SVG group that will hold our chart,
// // and shift the latter by left and top margins.
// var svg = d3.select(map.getPanes().overlayPane)
//   .append("svg")
//   .attr("width", svgWidth)
//   .attr("height", svgHeight);

//   svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create a map object
var map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 15
});


// Add a tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
}).addTo(map);

// Reading data in from csv
var customLayer = L.geoJson(null, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h6>" + feature.properties.Course_Name + "</h6><hr>" +
      "<p>Rank: " + feature.properties.Rank + "</p>" +
      "<p>Location: " + feature.properties.Location + "</p>" +
      "<p>Architect: " + feature.properties.Architect + "</p>" +
      "<p>Year Built: " + feature.properties.Year_Built + "</p>");
      }
  });

var runLayer = omnivore.csv("js/course_info_w_lat_lon.csv", null, customLayer)
    .on("ready", function() {
    map.fitBounds(runLayer.getBounds());
}).addTo(map);
