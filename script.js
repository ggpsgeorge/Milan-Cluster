let mapid = document.getElementById("mapid");

let mymap = L.map(mapid).setView([45.4678, 9.1914], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ2dwc2dlb3JnZSIsImEiOiJja2xoNjRoNnk1YnRnMnJwbGhjdjdkMW9lIn0.kn_ZuIZt6PkfprwNnUPRwg'
}).addTo(mymap);

$.getJSON("dados\\geojsons\\2013-11-03.geojson", function(data) {
    // console.log(data["features"][2045]["properties"]["activity"]);
    data["features"].forEach(element => {
        L.geoJSON(element["geometry"], {
            color: element["properties"]["stroke"],
            fillColor: element["properties"]["fill"],
            fillOpacity: element["properties"]["fill-opacity"],
            opacity: element["properties"]["stroke-opacity"],
            weight: element["properties"]["stroke-width"],
            activity: element["properties"]["activity"],
            onEachFeature: onEachFeature
        }).addTo(mymap);
    });
})

let anomaly_container = document.createElement("div");
anomaly_container.classList.add("anomaly-container");
let graph = document.createElement("img");
graph.src = "jojomeme.jpg";
anomaly_container.appendChild(graph);
document.body.appendChild(anomaly_container);

function onEachFeature(feature, layer){
    layer.on('click', function(){
        console.log(layer)        
    })
}

