//Loadding mapbox and openstreetmap
let mapid = document.getElementById("map");

let mymap = L.map(mapid).setView([45.4729, 9.2187], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 11,
    maxZoom: 14,
    accessToken: 'pk.eyJ1IjoiZ2dwc2dlb3JnZSIsImEiOiJja2xoNjRoNnk1YnRnMnJwbGhjdjdkMW9lIn0.kn_ZuIZt6PkfprwNnUPRwg'
}).addTo(mymap);
//end loading

//Load geojson
$.getJSON("dados\\geojsons\\2013-11-03.geojson", function(data) {
    data["features"].forEach(element => {
        L.geoJSON(element["geometry"], {
            color: element["properties"]["stroke"],
            fillColor: element["properties"]["fill"],
            fillOpacity: element["properties"]["fill-opacity"],
            opacity: element["properties"]["stroke-opacity"],
            weight: element["properties"]["stroke-width"],
            id: element["id"],
            activity: element["properties"]["activity"],
            onEachFeature: onEachFeature
        }).addTo(mymap);
    });
})
//end

let modal = document.getElementById("modalId");
let export_btn = document.getElementById("export-btn");
let span = document.getElementsByClassName("close")[0];

export_btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if(event.target == modal){
        modal.style.display = "none";
    }
}

function onEachFeature(feature, layer){
    layer.on('click', function(){
        let activity = layer["defaultOptions"]["activity"];
        let activityObjs = []
        // console.log(layer["defaultOptions"]["id"]);
        // console.log(layer["defaultOptions"]["activity"])
        activity.forEach(array => {
            activityObjs.push({time: array[0], energy: array[1]});
        });
        console.log(activityObjs);                
    });
}

