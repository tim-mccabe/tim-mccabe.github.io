  //Store the API inside query URL variables
  var URL_1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

  //Perform a GET request from the URL
  d3.json(URL_1, data => {
    //Create features
    console.log(data.features);
    createFeatures(data.features);
  });

  function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"+
        "<hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var color;
      // var r = Math.floor(255 * feature.properties.mag);
      // var g = Math.floor(255 * (100 - feature.properties.mag));
      // var b = 0;
      // color= "rgb("+r+" ,"+g+","+ b+")"
      if (feature.properties.mag < 2) {
        color = "rgb(0,225,0)"
      } else if (feature.properties.mag < 3) {
        color = "rgb(128,225,0)"
      } else if (feature.properties.mag < 4) {
        color = "rgb(225,225,0)"
      } else if (feature.properties.mag < 5) {
        color = "rgb(225,128,0)"
      } else {
        color = "rgb(225,0,0)"
      }
      
      var geojsonMarkerOptions = {
        radius: 4*feature.properties.mag,
        fillColor: color,
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });
      // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap
  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
var baseMaps = {
  "Gray Scale": grayscale,
};

// Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };

// Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [grayscale, earthquakes]
  });

    // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


function getColor(d) {
  return d < 3  ? 'rgb(0,225,0)' :
        d < 4  ? 'rgb(128,225,0)' :
        d < 5  ? 'rgb(255,225,0)' :
        d < 6  ? 'rgb(225,128,0)' :
        d < 7  ? 'rgb(255,0,0)':
        'rgb(255,0,0)';
}

  // Create a legend to display information about our map
var legend = L.control({
  position: "bottomright"
});

legend.onAdd = function (map) {
  
  var div = L.DomUtil.create('div', 'info legend'),
  grades = [1, 2, 3, 4, 5],
  labels = [];

  div.innerHTML+='Magnitude<br><hr>'

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}

return div;
};

legend.addTo(myMap);

}