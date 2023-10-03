
// Store our API endpoint as url
//Data will show all earthquakes in the past 7 days
let url ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"


// Perform a GET request to the query URL/
d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.Your location
    createFeatures(data.features);
  });

//Set the size of each marker. Magnitude can be anywhere from 0 to 9.5 (highest ever recorded). I'll set the circle size tothe number * 30,000 to get big enough circles. 
function markerSize(magnitude) {
    return magnitude * 30000;
  };

//setting color scale based on the depth
function markerColor(depth) {
    if (depth < 10) return "rgb(171, 245, 58)";
    else if ( depth < 30) return "rgb(223, 243, 57)";
    else if ( depth < 50) return "rgb(247, 217, 55)";
    else if ( depth < 70) return "rgb(251, 181, 59)";
    else if ( depth < 90) return "rgb(249, 160, 98)";
    else return "rgb(251, 90, 101)";
};

  function createFeatures(earthquakeData) {
  
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Place: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature, 

      //point to layer replaces the standard marker with whatever we want, in this case the bubbles colored and sized bubbles
      pointToLayer: function(feature, location) {

        var markers = {
            radius: markerSize(feature.properties.mag),
            fillColor: markerColor(feature.geometry.coordinates[2]),
            color: "black",
            stroke: true,
            fillOpacity: 0.75,
            weight: 1
        }
        return L.circle(location, markers)
      }
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }
  

  function createMap(earthquakes) {
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      "Earthquakes in last 7 days": earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


    //Add Legend - code setup sourced from here: https://gis.stackexchange.com/questions/193161/add-legend-to-leaflet-map
    var legend = L.control({position: 'bottomright'});
      legend.onAdd = function (myMap) {
        var div = L.DomUtil.create('div', 'info legend'),
        depth = [-10, 10, 30, 50, 60, 90];

        // loop through our depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depth.length; i++) {
          div.innerHTML +=
          
            '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
      };
      legend.addTo(myMap);
    };
