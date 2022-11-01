// Create tile layers for the backgrounds of the map
var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create grayscale layer
var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

// Create water color layer
var waterColor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});

// Create topography layer
var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Make basemap object
let basemaps = {
    Grayscale: grayscale,
    "Water Color": waterColor,
    "Topography": topoMap,
    Default: defaultMap
};

// Create map object
var myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 3,
    layers: [grayscale, waterColor, topoMap, defaultMap]
});

// Add default map to map on site
defaultMap.addTo(myMap);

// Retrieve data for tectonic plates and draw on map

// Variable for tectonic plates data
let tectonicPlates = new L.layerGroup();

// API Call to get data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
    .then(function(plateData){
        //console.log(plateData);

        // Load data to tectonic plates layer
        L.geoJson(plateData,{
            // Styling to lines
            color: "yellow",
            weight: 1
        }).addTo(tectonicPlates);
    });

// Add tectonic plates to the map
tectonicPlates.addTo(myMap);

// Variable for earthquake data
let earthquakes = new L.layerGroup();

// Retrieve data for earthquake and populate to layer with API call
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(function(earthquakeData){
        //console.log(earthquakeData);

        // Plots circles where radius is dependent on magnitude and color is
        // dependent on the depth

        // Function to choose color of data point
        function dataColor(depth){
            if(depth > 90)
                return "red";
            else if(depth > 70)
                return "#fc4903";
            else if(depth > 50)
                return "#fc8403";
            else if(depth > 30)
                return "#fcad03";
            else if(depth > 10)
                return "#cafc03";
            else
                return "green";
        }

        // Function to determine size of radius
        function radiusSize(mag){
            if (mag == 0)
                return 1; // Displays 0 mag earthquakes
            else
                return mag * 5; // Makes circle pronounced on map
        }

        // Function to add style for data point
        function dataStyle(feature){
            return {
                opacity: 1, 
                fillOpacity: 1,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color: "000000",
                radius: radiusSize(feature.properties.mag),
                weight: 0.5
            }
        }

        // Add GeoJson Data to earthquake layer
        L.geoJson(earthquakeData, {
                
        }).addTo(earthquakes);
    });

// Add overlay for tectonic plates and earthquakes
let overlays = {
    "Tectonic Plates": tectonicPlates
};

// Add layer control
L.control
    .layers(basemaps, overlays)
    .addTo(myMap);