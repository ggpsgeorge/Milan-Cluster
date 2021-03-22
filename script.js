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
let geojsonLayer = L.geoJSON().addTo(mymap);
$.getJSON("dados\\sansiro.geojson", function(data) {
    // console.log(data['features']);
    data['features'].forEach(element => {
        // console.log(element["properties"]["fill"]);
        L.geoJSON(element["geometry"], {
            color: element["properties"]["stroke"],
            fillColor: element["properties"]["fill"],
            fillOpacity: element["properties"]["fill-opacity"],
            opacity: element["properties"]["stroke-opacity"],
            weight: element["properties"]["stroke-width"],
        }).addTo(mymap);
    });
})

// Codigo temporario para testar o framework leafleat

// let latlngs1 = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
// console.log(latlngs1);
// L.polygon(latlngs1, {color: 'red'}).addTo(mymap);
// let latlngs2 = [[35, -111.05],[39, -111.03],[39, -104.05],[35, -104.04]];
// L.polygon(latlngs2, {color: 'green'}).addTo(mymap);


// LAT E LONG POSSUEM UMA COORDENADA A MAIS E ESTÃO AO CONTRARIO NOS ARQUIVOS
// CORRETO SERIA 4 COORDENADAS  
// $.getJSON("dados\\temp.geojson", function(data) {
//     let latlngs = data.geometry.coordinates;
//     latlngs[0].pop();
//     console.log(latlngs[0]);
//     let style = data.properties;
//     console.log(data.properties)
//     L.polygon(latlngs[0], data.properties).addTo(mymap);
// });