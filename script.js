let mapid = document.getElementById("mapid");

console.log(mapid);

let mymap = L.map(mapid).setView([45.4678, 9.1914], 13);
// let mymap = L.map('mapid').setView([37, -109.05], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ2dwc2dlb3JnZSIsImEiOiJja2xoNjRoNnk1YnRnMnJwbGhjdjdkMW9lIn0.kn_ZuIZt6PkfprwNnUPRwg'
}).addTo(mymap);

// AQUI SANSIRO MESMO COM AS LAT E LONG TROCADAS E 5 COORDENADAs AO INVES DE 4 FUNCIONA
$.getJSON("dados\\sansiro.geojson", function(data) {
    data['features'].forEach(element => {
        L.geoJSON(element["geometry"], {
            color: element["properties"]["stroke"],
            fillColor: element["properties"]["fill"],
            fillOpacity: element["properties"]["fill-opacity"],
            opacity: element["properties"]["stroke-opacity"],
            weight: element["properties"]["stroke-width"],
        }).addTo(mymap);
    });
})

